import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import express from 'express'
import { splitChannelPosts, parseMatrimonialPost } from './services/whatsappParser.js'
import { calculateMatchScore, findMatchesForProfile } from './services/matchingService.js'
import { SAMPLE_WHATSAPP_CHANNEL_POSTS } from './services/sampleChannelPosts.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDirectory = path.join(__dirname, 'data')
const dataFile = path.join(dataDirectory, 'matrimony.json')
const uploadsDirectory = path.join(__dirname, 'uploads')
const app = express()
const port = Number(process.env.PORT || 8787)
const allowedOrigin = process.env.APP_ORIGIN || 'http://127.0.0.1:5173'
const isVercel = Boolean(process.env.VERCEL)
const adminIngestToken = process.env.ADMIN_INGEST_TOKEN
const superAdminToken = process.env.SUPER_ADMIN_TOKEN || (isVercel ? '' : 'local-super-admin')
const contactEncryptionSecret = process.env.CONTACT_ENCRYPTION_KEY || (isVercel ? '' : 'local-development-contact-key')
let runtimeStore

app.use(cors({ origin: allowedOrigin }))
app.use(express.json({ limit: '6mb' }))
app.use('/uploads', express.static(uploadsDirectory, { fallthrough: false, maxAge: '1d' }))

const cleanText = (value, max = 120) => String(value || '').trim().replace(/[<>]/g, '').slice(0, max)
const id = (prefix) => `${prefix}_${crypto.randomUUID()}`

function encryptContact(phone) {
  if (!contactEncryptionSecret) throw new Error('Secure contact storage must be configured before accepting production registrations.')
  const key = crypto.createHash('sha256').update(contactEncryptionSecret).digest()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(phone, 'utf8'), cipher.final()])
  return `${iv.toString('base64')}.${cipher.getAuthTag().toString('base64')}.${encrypted.toString('base64')}`
}

function decryptContact(value) {
  if (!value || !contactEncryptionSecret) return ''
  const [ivValue, tagValue, encryptedValue] = String(value).split('.')
  const key = crypto.createHash('sha256').update(contactEncryptionSecret).digest()
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivValue, 'base64'))
  decipher.setAuthTag(Buffer.from(tagValue, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(encryptedValue, 'base64')), decipher.final()]).toString('utf8')
}

async function savePrivateMedia(dataUrl, kind) {
  if (!dataUrl) return ''
  if (isVercel) throw new Error('Private media storage must be configured before accepting photos or horoscopes in production.')
  const match = String(dataUrl).match(/^data:(image\/(jpeg|png|webp)|application\/pdf);base64,([A-Za-z0-9+/=]+)$/)
  if (!match) throw new Error('Please upload a JPG, PNG, WebP image, or PDF document.')
  const media = Buffer.from(match[2], 'base64')
  const maximumSize = kind === 'horoscope' ? 2_500_000 : 1_500_000
  if (!media.length || media.length > maximumSize) throw new Error(`Please choose a ${kind === 'horoscope' ? 'horoscope file smaller than 2.5 MB' : 'photo smaller than 1.5 MB'}.`)
  const extension = match[1] === 'image/jpeg' ? 'jpg' : match[1] === 'application/pdf' ? 'pdf' : match[1].split('/')[1]
  const fileName = `${id(kind)}.${extension}`
  await fs.mkdir(uploadsDirectory, { recursive: true })
  await fs.writeFile(path.join(uploadsDirectory, fileName), media)
  return `/uploads/${fileName}`
}

function createProfileRecord(parsed) {
  const phone = String(parsed.phone || '9150444444').replace(/\D/g, '')
  return {
    id: id('profile'),
    firstName: cleanText(parsed.firstName, 60),
    age: Number(parsed.age) || 26,
    gender: parsed.gender === 'Groom' ? 'Groom' : 'Bride',
    lookingFor: parsed.gender === 'Groom' ? 'Bride' : 'Groom',
    city: cleanText(parsed.city, 70),
    kulam: cleanText(parsed.kulam, 60),
    nakshatram: cleanText(parsed.nakshatram, 60),
    rasi: cleanText(parsed.rasi, 60),
    education: cleanText(parsed.education, 80),
    occupation: cleanText(parsed.occupation, 100),
    income: cleanText(parsed.income, 40),
    height: cleanText(parsed.height, 30),
    about: cleanText(parsed.about, 800),
    phoneHash: crypto.createHash('sha256').update(phone).digest('hex'),
    phoneLast4: phone.slice(-4),
    phoneEncrypted: encryptContact(phone),
    profileFor: 'self',
    horoscopeUrl: '',
    verificationStatus: 'verified',
    source: parsed.source || 'whatsapp-channel',
    channelInviteCode: '0029Va9Kc0QFi8xje33U6O3q',
    consentAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }
}

async function readStore() {
  if (runtimeStore) return runtimeStore

  let store
  try {
    store = JSON.parse(await fs.readFile(dataFile, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    store = { profiles: [], interests: [], orders: [], matchReviews: [], notifications: [] }
  }

  // Seed local development with sample records only. Production should use a
  // persistent, reviewed data source rather than automatic public imports.
  if (!store.profiles || store.profiles.length === 0) {
    store.profiles = []
    store.interests = store.interests || []
    store.orders = store.orders || []
    store.matchReviews = store.matchReviews || []
    store.notifications = store.notifications || []
    const rawPosts = splitChannelPosts(SAMPLE_WHATSAPP_CHANNEL_POSTS)
    for (const post of rawPosts) {
      const parsed = parseMatrimonialPost(post)
      store.profiles.push(createProfileRecord(parsed))
    }
    if (!isVercel) {
      await fs.mkdir(dataDirectory, { recursive: true })
      await fs.writeFile(dataFile, JSON.stringify(store, null, 2))
    }
  }
  store.interests = store.interests || []
  store.orders = store.orders || []
  store.matchReviews = store.matchReviews || []
  store.notifications = store.notifications || []
  runtimeStore = store
  return store
}

async function writeStore(store) {
  runtimeStore = store
  // Vercel's function filesystem is read-only. Keep registrations available
  // for the active function instance; attach a database before relying on
  // cross-instance persistence.
  if (isVercel) return
  await fs.mkdir(dataDirectory, { recursive: true })
  await fs.writeFile(dataFile, JSON.stringify(store, null, 2))
}

function publicProfile(profile) {
  return {
    id: profile.id,
    firstName: profile.firstName,
    age: profile.age,
    gender: profile.gender,
    lookingFor: profile.lookingFor,
    city: profile.city,
    kulam: profile.kulam || 'Kurumba Gounder',
    nakshatram: profile.nakshatram || '',
    rasi: profile.rasi || '',
    education: profile.education || '',
    occupation: profile.occupation || '',
    income: profile.income || '',
    height: profile.height || '',
    photoUrl: profile.photoUrl || '',
    familyType: profile.familyType || '',
    expectedEducation: profile.expectedEducation || '',
    expectedOccupation: profile.expectedOccupation || '',
    expectedMinIncome: profile.expectedMinIncome || '',
    expectedMaxIncome: profile.expectedMaxIncome || '',
    expectedMinAge: profile.expectedMinAge || '',
    expectedMaxAge: profile.expectedMaxAge || '',
    expectedRasi: profile.expectedRasi || '',
    expectedNakshatram: profile.expectedNakshatram || '',
    about: profile.about,
    verificationStatus: profile.verificationStatus,
    source: profile.source || 'direct-registration',
    createdAt: profile.createdAt,
  }
}

function matchPairKey(profileAId, profileBId) {
  return [profileAId, profileBId].sort().join(':')
}

function queueMatchReviewsForProfile(profile, store) {
  const matches = findMatchesForProfile(profile, store.profiles, 12)
  const now = new Date().toISOString()
  const created = []
  for (const match of matches) {
    const pairKey = matchPairKey(profile.id, match.profile.id)
    if (store.matchReviews.some((item) => item.pairKey === pairKey)) continue
    const review = {
      id: id('match-review'),
      pairKey,
      profileAId: profile.id,
      profileBId: match.profile.id,
      score: match.score,
      badge: match.badge,
      reasons: match.reasons,
      warnings: match.warnings || [],
      horoscopeStatus: match.horoscopeStatus || 'not-reviewed',
      status: 'pending-super-admin-review',
      contactStatus: 'private',
      familyConsentA: false,
      familyConsentB: false,
      createdAt: now,
    }
    store.matchReviews.push(review)
    created.push(review)
  }
  return created
}

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    service: 'kurumba-gounder-matrimony-api',
    persistence: isVercel ? 'configure-database-for-production' : 'local-file',
  })
})

function requireAdminIngest(request, response, next) {
  if (!adminIngestToken) {
    return response.status(503).json({ error: 'Admin ingestion is not configured.' })
  }
  if (request.get('x-admin-token') !== adminIngestToken) {
    return response.status(403).json({ error: 'Admin authorization is required.' })
  }
  next()
}

function requireSuperAdmin(request, response, next) {
  if (!superAdminToken) {
    return response.status(503).json({ error: 'Super Admin access must be configured with SUPER_ADMIN_TOKEN.' })
  }
  if (request.get('x-super-admin-token') !== superAdminToken) {
    return response.status(403).json({ error: 'Super Admin authorization is required.' })
  }
  next()
}

function privateAdminProfile(profile) {
  return {
    ...publicProfile(profile),
    profileFor: profile.profileFor || 'self',
    phoneLast4: profile.phoneLast4 || '',
    horoscopeUrl: profile.horoscopeUrl || '',
    photoUrl: profile.photoUrl || '',
    expectedOccupation: profile.expectedOccupation || '',
    expectedMinAge: profile.expectedMinAge || '',
    expectedMaxAge: profile.expectedMaxAge || '',
    moderationNote: profile.moderationNote || '',
  }
}

app.get('/api/channel-info', (_request, response) => {
  response.json({
    name: 'KURUMBARINA MAKKAL NALA SEVAIKAL SANGAM MATRIMONIAL',
    url: 'https://whatsapp.com/channel/0029Va9Kc0QFi8xje33U6O3q',
    inviteCode: '0029Va9Kc0QFi8xje33U6O3q',
    followers: '2.2K followers',
    secretary: 'R. Sathiyamoorthy',
    contact: '9150444444',
    description: 'குறும்பர் சமுதாய சொந்தங்கள் மாப்பிள்ளை மற்றும் பெண் தேடுபவர்களுக்கு உதவுவதற்காக உருவாக்கப்பட்ட பிரத்யேக சேனல்.'
  })
})

app.get('/api/config', (_request, response) => {
  response.json({
    whatsappChatLink: process.env.WHATSAPP_BUSINESS_CHAT_LINK || '',
    whatsappConfigured: Boolean(process.env.WHATSAPP_BUSINESS_CHAT_LINK),
    uploadsConfigured: !isVercel,
  })
})

app.get('/api/profiles', async (request, response, next) => {
  try {
    const store = await readStore()
    const lookingFor = cleanText(request.query.lookingFor, 12)
    const city = cleanText(request.query.city, 70).toLowerCase()
    const kulam = cleanText(request.query.kulam, 60).toLowerCase()
    const profiles = store.profiles
      .filter((profile) => profile.verificationStatus === 'verified')
      .filter((profile) => !lookingFor || profile.gender === lookingFor)
      .filter((profile) => !city || profile.city.toLowerCase().includes(city))
      .filter((profile) => !kulam || (profile.kulam && profile.kulam.toLowerCase().includes(kulam)))
      .slice(-40)
      .reverse()
      .map(publicProfile)
    response.json({ profiles, totalCount: store.profiles.length })
  } catch (error) { next(error) }
})

app.get('/api/admin/review-queue', requireSuperAdmin, async (_request, response, next) => {
  try {
    const store = await readStore()
    const byId = new Map(store.profiles.map((profile) => [profile.id, profile]))
    const matchReviews = store.matchReviews
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((review) => ({
        ...review,
        profileA: privateAdminProfile(byId.get(review.profileAId) || {}),
        profileB: privateAdminProfile(byId.get(review.profileBId) || {}),
      }))
    response.json({
      pendingProfiles: store.profiles.filter((profile) => profile.verificationStatus === 'pending').map(privateAdminProfile),
      matchReviews,
      whatsappConfigured: Boolean(process.env.WHATSAPP_BUSINESS_CHAT_LINK),
    })
  } catch (error) { next(error) }
})

app.post('/api/admin/profiles/:profileId/review', requireSuperAdmin, async (request, response, next) => {
  try {
    const decision = cleanText(request.body.decision, 10)
    const note = cleanText(request.body.note, 400)
    if (!['approve', 'reject'].includes(decision)) return response.status(400).json({ error: 'Choose approve or reject.' })
    const store = await readStore()
    const profile = store.profiles.find((item) => item.id === request.params.profileId)
    if (!profile) return response.status(404).json({ error: 'Profile not found.' })
    profile.verificationStatus = decision === 'approve' ? 'verified' : 'rejected'
    profile.moderationNote = note
    profile.reviewedAt = new Date().toISOString()
    const matchReviews = decision === 'approve' ? queueMatchReviewsForProfile(profile, store) : []
    await writeStore(store)
    response.json({ profile: privateAdminProfile(profile), matchReviewsCreated: matchReviews.length, message: decision === 'approve' ? 'Profile approved and eligible matches were sent to the Super Admin queue.' : 'Profile was not approved.' })
  } catch (error) { next(error) }
})

app.post('/api/admin/match-reviews/:reviewId/action', requireSuperAdmin, async (request, response, next) => {
  try {
    const action = cleanText(request.body.action, 40)
    const note = cleanText(request.body.note, 400)
    const store = await readStore()
    const review = store.matchReviews.find((item) => item.id === request.params.reviewId)
    if (!review) return response.status(404).json({ error: 'Match review not found.' })
    const profileA = store.profiles.find((item) => item.id === review.profileAId)
    const profileB = store.profiles.find((item) => item.id === review.profileBId)
    if (!profileA || !profileB) return response.status(404).json({ error: 'A matched profile is unavailable.' })

    if (action === 'approve-match') {
      review.status = 'admin-approved-awaiting-family-consent'
    } else if (action === 'reject-match') {
      review.status = 'rejected-by-super-admin'
    } else if (action === 'confirm-family-consents') {
      if (review.status !== 'admin-approved-awaiting-family-consent') return response.status(400).json({ error: 'Approve the match before recording family consent.' })
      review.familyConsentA = true
      review.familyConsentB = true
      review.status = 'ready-for-contact-reveal'
    } else if (action === 'reveal-contacts') {
      if (review.status !== 'ready-for-contact-reveal' || !review.familyConsentA || !review.familyConsentB) return response.status(400).json({ error: 'Both family consents are required before contact can be revealed.' })
      review.contactStatus = 'revealed-by-super-admin'
      review.status = 'introduction-approved'
      review.revealedAt = new Date().toISOString()
    } else {
      return response.status(400).json({ error: 'Choose a valid Super Admin action.' })
    }
    review.superAdminNote = note
    review.reviewedAt = new Date().toISOString()
    await writeStore(store)
    response.json({
      review,
      contact: review.contactStatus === 'revealed-by-super-admin' ? {
        profileA: { name: profileA.firstName, phone: decryptContact(profileA.phoneEncrypted), whatsappChatLink: process.env.WHATSAPP_BUSINESS_CHAT_LINK || '' },
        profileB: { name: profileB.firstName, phone: decryptContact(profileB.phoneEncrypted), whatsappChatLink: process.env.WHATSAPP_BUSINESS_CHAT_LINK || '' },
      } : null,
    })
  } catch (error) { next(error) }
})

// Ingest raw text copied/exported from WhatsApp Channel
app.post('/api/ingest/whatsapp-text', requireAdminIngest, async (request, response, next) => {
  try {
    const rawText = String(request.body.rawText || '').trim()
    if (!rawText || rawText.length < 20) {
      return response.status(400).json({ error: 'Please provide WhatsApp matrimonial post text to parse.' })
    }

    const rawPosts = splitChannelPosts(rawText)
    if (rawPosts.length === 0) {
      return response.status(400).json({ error: 'No recognizable matrimonial posts found in the provided text.' })
    }

    const store = await readStore()
    const addedProfiles = []

    for (const post of rawPosts) {
      const parsed = parseMatrimonialPost(post)
      const record = createProfileRecord(parsed)
      store.profiles.push(record)
      addedProfiles.push(record)
    }

    await writeStore(store)
    response.status(201).json({
      ok: true,
      message: `Successfully parsed and stored ${addedProfiles.length} matrimonial profile(s) from WhatsApp.`,
      count: addedProfiles.length,
      profiles: addedProfiles.map(publicProfile)
    })
  } catch (error) { next(error) }
})

// Ingest curated sample channel posts
app.post('/api/ingest/sample-channel-posts', requireAdminIngest, async (_request, response, next) => {
  try {
    const store = await readStore()
    const rawPosts = splitChannelPosts(SAMPLE_WHATSAPP_CHANNEL_POSTS)
    const addedProfiles = []

    for (const post of rawPosts) {
      const parsed = parseMatrimonialPost(post)
      const record = createProfileRecord(parsed)
      store.profiles.push(record)
      addedProfiles.push(record)
    }

    await writeStore(store)
    response.status(201).json({
      ok: true,
      message: `Imported ${addedProfiles.length} verified Kurumbar community profiles from WhatsApp channel.`,
      count: addedProfiles.length,
      profiles: addedProfiles.map(publicProfile)
    })
  } catch (error) { next(error) }
})

// Calculate top matches for a given profile
app.get('/api/matches/:profileId', async (request, response, next) => {
  try {
    const store = await readStore()
    const profile = store.profiles.find((p) => p.id === request.params.profileId)
    if (!profile) {
      return response.status(404).json({ error: 'Profile not found.' })
    }

    const matches = findMatchesForProfile(profile, store.profiles, 8)
    response.json({
      candidate: publicProfile(profile),
      matches: matches.map((m) => ({
        score: m.score,
        badge: m.badge,
        kulamStatus: m.kulamStatus,
        reasons: m.reasons,
        warnings: m.warnings || [],
        horoscopeStatus: m.horoscopeStatus,
        profile: publicProfile(m.profile)
      }))
    })
  } catch (error) { next(error) }
})

// Compare any two profiles or candidate with target
app.post('/api/match-preview', async (request, response, next) => {
  try {
    const { profileAId, profileBId } = request.body
    if (!profileAId || !profileBId) {
      return response.status(400).json({ error: 'Select two profiles to compare.' })
    }
    const store = await readStore()
    const profileA = store.profiles.find((p) => p.id === profileAId)
    const profileB = store.profiles.find((p) => p.id === profileBId)
    if (!profileA || !profileB) {
      return response.status(404).json({ error: 'One or both profiles could not be found.' })
    }

    const result = calculateMatchScore(profileA, profileB)
    response.json({
      score: result.score,
      badge: result.badge,
      kulamStatus: result.kulamStatus,
      reasons: result.reasons,
      warnings: result.warnings || [],
      horoscopeStatus: result.horoscopeStatus,
      profileA: publicProfile(profileA),
      profileB: publicProfile(profileB)
    })
  } catch (error) { next(error) }
})

app.post('/api/profiles', async (request, response, next) => {
  try {
    const firstName = cleanText(request.body.firstName, 60)
    const age = Number(request.body.age)
    const gender = cleanText(request.body.gender, 12)
    const lookingFor = cleanText(request.body.lookingFor, 12)
    const city = cleanText(request.body.city, 70)
    const occupation = cleanText(request.body.occupation, 100)
    const kulam = cleanText(request.body.kulam, 60) || 'Kurumba Gounder'
    const nakshatram = cleanText(request.body.nakshatram, 60)
    const rasi = cleanText(request.body.rasi, 60)
    const education = cleanText(request.body.education, 80)
    const income = cleanText(request.body.income, 40)
    const height = cleanText(request.body.height, 30)
    const familyType = cleanText(request.body.familyType, 60)
    const expectedEducation = cleanText(request.body.expectedEducation, 80)
    const expectedOccupation = cleanText(request.body.expectedOccupation, 100)
    const expectedMinIncome = cleanText(request.body.expectedMinIncome, 40)
    const expectedMaxIncome = cleanText(request.body.expectedMaxIncome, 40)
    const expectedMinAge = cleanText(request.body.expectedMinAge, 3)
    const expectedMaxAge = cleanText(request.body.expectedMaxAge, 3)
    const expectedRasi = cleanText(request.body.expectedRasi, 60)
    const expectedNakshatram = cleanText(request.body.expectedNakshatram, 60)
    const about = cleanText(request.body.about, 600)
    const phone = String(request.body.phone || '').replace(/\D/g, '')

    if (!firstName || !city || !occupation || !about || !phone || !request.body.consent) {
      return response.status(400).json({ error: 'Please complete the required fields and accept the privacy consent.' })
    }
    if (!Number.isInteger(age) || age < 18 || age > 99) return response.status(400).json({ error: 'Members must be 18 years or older.' })
    if (!['Bride', 'Groom'].includes(gender) || !['Bride', 'Groom'].includes(lookingFor)) return response.status(400).json({ error: 'Choose a valid profile and preference.' })
    if (phone.length < 10 || phone.length > 15) return response.status(400).json({ error: 'Enter a valid mobile number.' })

    const photoUrl = await savePrivateMedia(request.body.photoDataUrl, 'profile-photo')
    const horoscopeUrl = await savePrivateMedia(request.body.horoscopeDataUrl, 'horoscope')
    const store = await readStore()
    const profile = {
      id: id('profile'),
      firstName,
      age,
      gender,
      lookingFor,
      city,
      kulam,
      nakshatram,
      rasi,
      education,
      income,
      height,
      photoUrl,
      horoscopeUrl,
      profileFor: cleanText(request.body.profileFor, 30) || 'self',
      familyType,
      expectedEducation,
      expectedOccupation,
      expectedMinIncome,
      expectedMaxIncome,
      expectedMinAge,
      expectedMaxAge,
      expectedRasi,
      expectedNakshatram,
      occupation,
      about,
      phoneHash: crypto.createHash('sha256').update(phone).digest('hex'),
      phoneLast4: phone.slice(-4),
      phoneEncrypted: encryptContact(phone),
      verificationStatus: 'pending',
      source: 'direct-registration',
      consentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
    store.profiles.push(profile)
    await writeStore(store)
    response.status(201).json({ profile: publicProfile(profile), message: 'Profile saved. Mobile verification and moderation are required before it is visible to other members.' })
  } catch (error) { next(error) }
})

app.post('/api/interests', async (request, response, next) => {
  try {
    const fromProfileId = cleanText(request.body.fromProfileId, 100)
    const toProfileId = cleanText(request.body.toProfileId, 100)
    if (!fromProfileId || !toProfileId || fromProfileId === toProfileId) return response.status(400).json({ error: 'Choose two different valid profiles.' })
    const store = await readStore()
    const from = store.profiles.find((profile) => profile.id === fromProfileId)
    const to = store.profiles.find((profile) => profile.id === toProfileId)
    if (!from || !to) return response.status(404).json({ error: 'A selected profile could not be found.' })
    const interest = { id: id('interest'), fromProfileId, toProfileId, status: 'pending', createdAt: new Date().toISOString() }
    store.interests.push(interest)
    await writeStore(store)
    response.status(201).json({ interest, message: 'Interest recorded. Contact information remains private until both members accept.' })
  } catch (error) { next(error) }
})

app.post('/api/interests/:interestId/respond', async (request, response, next) => {
  try {
    const decision = cleanText(request.body.decision, 10)
    if (!['accepted', 'declined'].includes(decision)) return response.status(400).json({ error: 'Choose accepted or declined.' })
    const store = await readStore()
    const interest = store.interests.find((item) => item.id === request.params.interestId)
    if (!interest) return response.status(404).json({ error: 'Interest not found.' })
    interest.status = decision
    interest.respondedAt = new Date().toISOString()
    await writeStore(store)
    response.json({ interest, contactSharing: decision === 'accepted' ? 'mutual-consent-required' : 'not-shared' })
  } catch (error) { next(error) }
})

app.post('/api/orders', async (request, response, next) => {
  try {
    const plan = cleanText(request.body.plan, 20)
    const profileId = cleanText(request.body.profileId, 100)
    const prices = { Community: 199 }
    if (!prices[plan] || !profileId) return response.status(400).json({ error: 'Select a valid membership plan and profile.' })
    const store = await readStore()
    if (!store.profiles.some((profile) => profile.id === profileId)) return response.status(404).json({ error: 'Profile not found.' })
    const order = { id: id('order'), profileId, plan, amount: prices[plan], currency: 'INR', status: 'created', createdAt: new Date().toISOString() }
    store.orders.push(order)
    await writeStore(store)
    response.status(201).json({ order, nextStep: 'Create a Razorpay or Cashfree order server-side, then verify its signed webhook before activating membership.' })
  } catch (error) { next(error) }
})

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({ error: 'The service could not complete this request. Please try again.' })
})

if (!isVercel) {
  app.listen(port, () => console.log(`Kurumba Gounder Matrimony API listening on http://127.0.0.1:${port}`))
}

export default app
