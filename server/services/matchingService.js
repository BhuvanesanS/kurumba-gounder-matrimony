/**
 * Kurumba Gounder Matrimonial Matching Service
 * Evaluates clan/kulam compatibility, age alignment, educational background,
 * and regional proximity.
 */

const KONGU_REGION_DISTRICTS = ['Coimbatore', 'Erode', 'Tiruppur', 'Salem', 'Namakkal', 'Karur', 'Dharmapuri', 'Krishnagiri']
const HIGHER_EDUCATION = /(?:b\.?e|b\.?tech|m\.?e|m\.?tech|mba|m\.?sc|mca|ph\.?d|doctor|ca|degree|graduate)/i

function incomeToLpa(value) {
  const number = Number(String(value || '').replace(/[^0-9.]/g, ''))
  if (!number) return 0
  const text = String(value).toLowerCase()
  if (text.includes('month') || text.includes('pm')) return number * 12 / 100000
  return number
}

export function calculateMatchScore(candidate, target) {
  // 1. Mandatory Gender Check
  if (candidate.gender === target.gender) {
    return {
      score: 0,
      badge: 'Incompatible',
      kulamStatus: 'N/A',
      reasons: ['Same gender profile']
    }
  }

  let score = 20 // Base score for community alignment
  const reasons = []

  // 2. Kulam / Koottam Compatibility (Crucial Customary Rule)
  const candKulam = String(candidate.kulam || '').trim().toLowerCase()
  const targKulam = String(target.kulam || '').trim().toLowerCase()
  let kulamStatus = 'Neutral'

  if (candKulam && targKulam && candKulam !== 'kurumba gounder' && targKulam !== 'kurumba gounder') {
    if (candKulam === targKulam) {
      kulamStatus = 'Same Kulam (Pangali) — Review Customary Rules'
      score -= 30
      reasons.push('⚠️ Same Kulam: In traditional Kongu customs, same clan members are considered brother-sister.')
    } else {
      kulamStatus = 'Compatible (Different Kulam / Machan Kulam)'
      score += 30
      reasons.push(`✓ Different Kulam: ${candidate.kulam} ↔ ${target.kulam} are mutually compatible clans.`)
    }
  } else {
    score += 15
    reasons.push('✓ Both profiles belong to Kurumba Gounder community.')
  }

  // 3. Age Compatibility
  const groom = candidate.gender === 'Groom' ? candidate : target
  const bride = candidate.gender === 'Bride' ? candidate : target
  const groomAge = Number(groom.age) || 28
  const brideAge = Number(bride.age) || 25
  const ageDiff = groomAge - brideAge

  if (ageDiff >= 1 && ageDiff <= 5) {
    score += 25
    reasons.push(`✓ Ideal age difference: Groom is ${ageDiff} years older (${groomAge} & ${brideAge}).`)
  } else if (ageDiff >= 0 && ageDiff <= 8) {
    score += 18
    reasons.push(`✓ Compatible age difference: ${groomAge} & ${brideAge}.`)
  } else {
    score += 8
    reasons.push(`• Age difference: ${Math.abs(ageDiff)} years.`)
  }

  // 4. District / Regional Proximity
  const candCity = String(candidate.city || '').trim().toLowerCase()
  const targCity = String(target.city || '').trim().toLowerCase()

  if (candCity === targCity && candCity !== 'tamil nadu') {
    score += 15
    reasons.push(`✓ Both are from the same district: ${candidate.city}.`)
  } else if (
    KONGU_REGION_DISTRICTS.map((d) => d.toLowerCase()).includes(candCity) &&
    KONGU_REGION_DISTRICTS.map((d) => d.toLowerCase()).includes(targCity)
  ) {
    score += 12
    reasons.push(`✓ Both are from Kongu region districts (${candidate.city} ↔ ${target.city}).`)
  } else {
    score += 7
    reasons.push(`• Geographic location: ${candidate.city} ↔ ${target.city}.`)
  }

  // 5. Professional & Educational Harmony
  const candEdu = String(candidate.education || candidate.occupation || '').toLowerCase()
  const targEdu = String(target.education || target.occupation || '').toLowerCase()

  const isCandTech = /(?:b\.?e|tech|eng|it|software|doctor|mba|ca)/i.test(candEdu)
  const isTargTech = /(?:b\.?e|tech|eng|it|software|doctor|mba|ca)/i.test(targEdu)

  if (isCandTech && isTargTech) {
    score += 10
    reasons.push('✓ High educational and professional alignment.')
  } else {
    score += 5
  }

  // 6. Rasi and Nakshatram preferences: informative compatibility signals,
  // not a substitute for family or astrologer review.
  const preferredRasi = String(candidate.expectedRasi || '').trim().toLowerCase()
  const preferredStar = String(candidate.expectedNakshatram || '').trim().toLowerCase()
  if (preferredRasi && String(target.rasi || '').toLowerCase().includes(preferredRasi)) {
    score += 8
    reasons.push('Rasi preference is aligned.')
  }
  if (preferredStar && String(target.nakshatram || '').toLowerCase().includes(preferredStar)) {
    score += 8
    reasons.push('Nakshatram preference is aligned.')
  }

  // 7. Education and income expectations.
  const expectedEducation = String(candidate.expectedEducation || '').trim()
  if (expectedEducation && String(target.education || '').toLowerCase().includes(expectedEducation.toLowerCase())) {
    score += 8
    reasons.push('Education expectation is aligned.')
  } else if (!expectedEducation && HIGHER_EDUCATION.test(`${candidate.education} ${target.education}`)) {
    score += 4
  }

  const minimumIncome = incomeToLpa(candidate.expectedMinIncome)
  const targetIncome = incomeToLpa(target.income)
  if (minimumIncome && targetIncome >= minimumIncome) {
    score += 8
    reasons.push('Income expectation is aligned.')
  }

  if (candidate.familyType && target.familyType && candidate.familyType === target.familyType) {
    score += 4
    reasons.push('Family preference is aligned.')
  }

  const finalScore = Math.min(100, Math.max(10, score))
  let badge = 'Good compatibility'
  if (finalScore >= 85) badge = 'Strong compatibility'
  else if (finalScore >= 70) badge = 'High compatibility'

  return {
    score: finalScore,
    badge,
    kulamStatus,
    reasons,
    targetProfile: target
  }
}

/**
 * Find top matches for a given profile from the database
 */
export function findMatchesForProfile(profile, allProfiles, limit = 6) {
  const targetGender = profile.gender === 'Groom' ? 'Bride' : 'Groom'
  const candidates = allProfiles.filter((p) => p.id !== profile.id && p.gender === targetGender)

  const ranked = candidates.map((target) => {
    const match = calculateMatchScore(profile, target)
    return {
      profile: target,
      score: match.score,
      badge: match.badge,
      kulamStatus: match.kulamStatus,
      reasons: match.reasons
    }
  })

  return ranked.sort((a, b) => b.score - a.score).slice(0, limit)
}
