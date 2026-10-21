import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import express from 'express'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDirectory = path.join(__dirname, 'data')
const dataFile = path.join(dataDirectory, 'matrimony.json')
const app = express()
const port = Number(process.env.PORT || 8787)
const allowedOrigin = process.env.APP_ORIGIN || 'http://127.0.0.1:5173'

app.use(cors({ origin: allowedOrigin }))
app.use(express.json({ limit: '100kb' }))

const cleanText = (value, max = 120) => String(value || '').trim().replace(/[<>]/g, '').slice(0, max)
const id = (prefix) => `${prefix}_${crypto.randomUUID()}`

async function readStore() {
  await fs.mkdir(dataDirectory, { recursive: true })
  try {
    return JSON.parse(await fs.readFile(dataFile, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    const empty = { profiles: [], interests: [], orders: [] }
    await fs.writeFile(dataFile, JSON.stringify(empty, null, 2))
    return empty
  }
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
    occupation: profile.occupation,
    about: profile.about,
    verificationStatus: profile.verificationStatus,
    createdAt: profile.createdAt,
  }
}

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, service: 'kurumba-gounder-matrimony-api' })
})

app.get('/api/profiles', async (request, response, next) => {
  try {
    const store = await readStore()
    const lookingFor = cleanText(request.query.lookingFor, 12)
    const city = cleanText(request.query.city, 70).toLowerCase()
    const profiles = store.profiles
      .filter((profile) => !lookingFor || profile.gender === lookingFor)
      .filter((profile) => !city || profile.city.toLowerCase().includes(city))
      .slice(-30)
      .reverse()
      .map(publicProfile)
    response.json({ profiles })
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
      id: id('profile'), firstName, age, gender, lookingFor, city, occupation, about,
      phoneHash: crypto.createHash('sha256').update(phone).digest('hex'),
      phoneLast4: phone.slice(-4),
      verificationStatus: 'pending',
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
