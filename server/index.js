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
const app = express()
const port = Number(process.env.PORT || 8787)
const allowedOrigin = process.env.APP_ORIGIN || 'http://127.0.0.1:5173'

app.use(cors({ origin: allowedOrigin }))
app.use(express.json({ limit: '500kb' }))

const cleanText = (value, max = 120) => String(value || '').trim().replace(/[<>]/g, '').slice(0, max)
const id = (prefix) => `${prefix}_${crypto.randomUUID()}`

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
    verificationStatus: 'verified',
    source: parsed.source || 'whatsapp-channel',
    channelInviteCode: '0029Va9Kc0QFi8xje33U6O3q',
    consentAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }
}

async function readStore() {
  await fs.mkdir(dataDirectory, { recursive: true })
  let store
  try {
    store = JSON.parse(await fs.readFile(dataFile, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    store = { profiles: [], interests: [], orders: [] }
  }

  // Seed with real channel profiles if empty
  if (!store.profiles || store.profiles.length === 0) {
    store.profiles = []
    store.interests = store.interests || []
    store.orders = store.orders || []
    const rawPosts = splitChannelPosts(SAMPLE_WHATSAPP_CHANNEL_POSTS)
    for (const post of rawPosts) {
      const parsed = parseMatrimonialPost(post)
      store.profiles.push(createProfileRecord(parsed))
    }
    await fs.writeFile(dataFile, JSON.stringify(store, null, 2))
  }
  return store
}

async function writeStore(store) {
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
    about: profile.about,
    verificationStatus: profile.verificationStatus,
    source: profile.source || 'direct-registration',
    createdAt: profile.createdAt,
  }
}

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, service: 'kurumba-gounder-matrimony-api' })
})

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

app.get('/api/profiles', async (request, response, next) => {
  try {
    const store = await readStore()
    const lookingFor = cleanText(request.query.lookingFor, 12)
    const city = cleanText(request.query.city, 70).toLowerCase()
    const kulam = cleanText(request.query.kulam, 60).toLowerCase()
    const profiles = store.profiles
      .filter((profile) => !lookingFor || profile.gender === lookingFor)
      .filter((profile) => !city || profile.city.toLowerCase().includes(city))
      .filter((profile) => !kulam || (profile.kulam && profile.kulam.toLowerCase().includes(kulam)))
      .slice(-40)
      .reverse()
      .map(publicProfile)
    response.json({ profiles, totalCount: store.profiles.length })
  } catch (error) { next(error) }
})

// Ingest raw text copied/exported from WhatsApp Channel
app.post('/api/ingest/whatsapp-text', async (request, response, next) => {
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
app.post('/api/ingest/sample-channel-posts', async (_request, response, next) => {
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
    const about = cleanText(request.body.about, 600)
    const phone = String(request.body.phone || '').replace(/\D/g, '')

    if (!firstName || !city || !occupation || !about || !phone || !request.body.consent) {
      return response.status(400).json({ error: 'Please complete the required fields and accept the privacy consent.' })
    }
    if (!Number.isInteger(age) || age < 18 || age > 99) return response.status(400).json({ error: 'Members must be 18 years or older.' })
    if (!['Bride', 'Groom'].includes(gender) || !['Bride', 'Groom'].includes(lookingFor)) return response.status(400).json({ error: 'Choose a valid profile and preference.' })
    if (phone.length < 10 || phone.length > 15) return response.status(400).json({ error: 'Enter a valid mobile number.' })

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
      occupation,
      about,
      phoneHash: crypto.createHash('sha256').update(phone).digest('hex'),
      phoneLast4: phone.slice(-4),
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
    const prices = { Classic: 1999, Assisted: 3499 }
    if (!prices[plan] || !profileId) return response.status(400).json({ error: 'Select a valid membership plan and profile.' })
    const store = await readStore()
    if (!store.profiles.some((profile) => profile.id === profileId)) return response.status(404).json({ error: 'Profile not found.' })
    const order = { id: id('order'), profileId, plan, amount: prices[plan], currency: 'INR', status: 'created', createdAt: new Date().toISOString() }
    store.orders.push(order)
    await writeStore(store)
    response.status(201).json({ order, nextStep: 'Create a Razorpay or Cashfree order server-side and verify its signed webhook before activating membership.' })
  } catch (error) { next(error) }
})

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({ error: 'The service could not complete this request. Please try again.' })
})

app.listen(port, () => console.log(`Kurumba Gounder Matrimony API listening on http://127.0.0.1:${port}`))
