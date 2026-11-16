import assert from 'node:assert'
import { splitChannelPosts, parseMatrimonialPost } from './whatsappParser.js'
import { calculateMatchScore } from './matchingService.js'
import { SAMPLE_WHATSAPP_CHANNEL_POSTS } from './sampleChannelPosts.js'

console.log('--- Testing WhatsApp Parser ---')
const posts = splitChannelPosts(SAMPLE_WHATSAPP_CHANNEL_POSTS)
console.log(`Extracted ${posts.length} posts from sample data.`)
assert(posts.length >= 8, `Expected at least 8 posts, got ${posts.length}`)

const firstPost = parseMatrimonialPost(posts[0])
console.log('Parsed Post 1:', firstPost)
assert.strictEqual(firstPost.gender, 'Groom')
assert.strictEqual(firstPost.age, 28)
assert.strictEqual(firstPost.city, 'Coimbatore')
assert(firstPost.kulam.includes('செங்குன்றத்தான்'), 'Should extract kulam')
assert(firstPost.nakshatram.includes('திருவாதிரை'), 'Should extract nakshatram')

const secondPost = parseMatrimonialPost(posts[1])
console.log('Parsed Post 2:', secondPost)
assert.strictEqual(secondPost.gender, 'Bride')
assert.strictEqual(secondPost.age, 25)
assert.strictEqual(secondPost.city, 'Erode')
assert(secondPost.kulam.includes('கண்ணந்தை'), 'Should extract kulam')

console.log('--- Testing Matching Service ---')
const match1 = calculateMatchScore(firstPost, secondPost)
console.log('Match Result (Gowtham & Deepika):', {
  score: match1.score,
  badge: match1.badge,
  kulamStatus: match1.kulamStatus,
  reasons: match1.reasons
})
assert(match1.score >= 70, 'Should be high compatibility match')
assert(match1.kulamStatus.includes('Compatible'), 'Different kulams should be compatible')

// Test same kulam penalty
const sameKulamCandidate = { ...firstPost, kulam: 'கண்ணந்தை கூட்டம்' }
const matchSameKulam = calculateMatchScore(sameKulamCandidate, secondPost)
console.log('Same Kulam Match Result:', {
  score: matchSameKulam.score,
  kulamStatus: matchSameKulam.kulamStatus,
  reasons: matchSameKulam.reasons
})
assert(matchSameKulam.kulamStatus.includes('Same Kulam'), 'Same kulam should be flagged')
assert(matchSameKulam.score < match1.score, 'Same kulam should have lower score')

console.log('✓ All Parser & Matching tests passed successfully!')
