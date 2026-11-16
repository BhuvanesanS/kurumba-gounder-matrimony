/**
 * WhatsApp Matrimonial Channel Profile Parser
 * Specifically tuned for Tamil & English Kurumbar / Kurumba Gounder community channel posts.
 */

const TAMIL_NADU_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
  'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram', 'Kanyakumari', 'Karur',
  'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris',
  'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga',
  'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore',
  'Viluppuram', 'Virudhunagar', 'Bangalore', 'Bengaluru'
]

const NAKSHATRAS = [
  { tamil: 'அசுவினி', en: 'Ashwini' },
  { tamil: 'பரணி', en: 'Bharani' },
  { tamil: 'கார்த்திகை', en: 'Krittika' },
  { tamil: 'ரோகிணி', en: 'Rohini' },
  { tamil: 'மிருகசீரிஷம்', en: 'Mrigashirsha' },
  { tamil: 'திருவாதிரை', en: 'Thiruvathirai' },
  { tamil: 'புனர்பூசம்', en: 'Punarvasu' },
  { tamil: 'பூசம்', en: 'Poosam' },
  { tamil: 'ஆயில்யம்', en: 'Ayilyam' },
  { tamil: 'மகம்', en: 'Makam' },
  { tamil: 'பூரம்', en: 'Pooram' },
  { tamil: 'உத்திரம்', en: 'Uthiram' },
  { tamil: 'அஸ்தம்', en: 'Hastham' },
  { tamil: 'சித்திரை', en: 'Chithirai' },
  { tamil: 'சுவாதி', en: 'Swathi' },
  { tamil: 'விசாகம்', en: 'Visakam' },
  { tamil: 'அனுஷம்', en: 'Anusham' },
  { tamil: 'கேட்டை', en: 'Kettai' },
  { tamil: 'மூலம்', en: 'Moolam' },
  { tamil: 'பூராடம்', en: 'Pooradam' },
  { tamil: 'உத்திராடம்', en: 'Uthiradam' },
  { tamil: 'திருவோணம்', en: 'Thiruvonam' },
  { tamil: 'அவிட்டம்', en: 'Avittam' },
  { tamil: 'சதயம்', en: 'Sathayam' },
  { tamil: 'பூரட்டாதி', en: 'Poorattathi' },
  { tamil: 'உத்திரட்டாதி', en: 'Uthirattathi' },
  { tamil: 'ரேவதி', en: 'Revathi' }
]

const RASIS = [
  { tamil: 'மேஷம்', en: 'Mesham' },
  { tamil: 'ரிஷபம்', en: 'Rishabam' },
  { tamil: 'மிதுனம்', en: 'Mithunam' },
  { tamil: 'கடகம்', en: 'Kadagam' },
  { tamil: 'சிம்மம்', en: 'Simmam' },
  { tamil: 'கன்னி', en: 'Kanni' },
  { tamil: 'துலாம்', en: 'Thulam' },
  { tamil: 'விருச்சிகம்', en: 'Viruchigam' },
  { tamil: 'தனுசு', en: 'Dhanusu' },
  { tamil: 'மகரம்', en: 'Magaram' },
  { tamil: 'கும்பம்', en: 'Kumbam' },
  { tamil: 'மீனம்', en: 'Meenam' }
]

const KNOWN_KULAMS = [
  'செங்குன்றத்தான்', 'கண்ணந்தை', 'காடை', 'செம்பூத்தான்', 'பவளத்தான்',
  'அந்துவன்', 'பூசனை', 'பையிரன்', 'விளியன்', 'ஆவளத்தான்', 'பனைமரத்தான்',
  'முழுக்காதன்', 'தூரன்', 'வெள்ளம்பன்', 'மணியன்', 'செல்லன்', 'வண்ணக்கன்',
  'ஈஞ்சன்', 'பொருளந்தன்', 'சேவந்தி', 'சாத்தந்தை'
]

/**
 * Split a large raw text into individual profile messages
 */
export function splitChannelPosts(rawText) {
  if (!rawText || typeof rawText !== 'string') return []

  // Check for common post separators
  const delimiterRegex = /(?:[-_=*~]{4,}|(?:\n\s*\n\s*(?=(?:மணமகன்|மணமகள்|Profile|Bride|Groom|பெயர்|Name:|பதிவு எண்))))/gi
  let parts = rawText.split(delimiterRegex).map((p) => p.trim()).filter((p) => p.length > 25)

  if (parts.length === 0 && rawText.trim().length > 25) {
    parts = [rawText.trim()]
  }
  return parts
}

/**
 * Parse an individual matrimonial post from WhatsApp
 */
export function parseMatrimonialPost(postText) {
  const lines = postText.split('\n').map((l) => l.trim()).filter(Boolean)
  const lower = postText.toLowerCase()

  // 1. Gender / Looking For
  let gender = 'Bride'
  let lookingFor = 'Groom'
  const isGroom =
    /மணமகன்|மாப்பிள்ளை|groom|varan\s*\(?male\)?|boy|ஆண்|ஆண் வரன்/i.test(postText) &&
    !/மணமகன்\s*தேவை|groom\s*wanted|looking\s*for\s*groom/i.test(postText)

  const isBride =
    /மணமகள்|பெண்|bride|varan\s*\(?female\)?|girl|பெண் வரன்/i.test(postText) &&
    !/மணமகள்\s*தேவை|bride\s*wanted|looking\s*for\s*bride/i.test(postText)

  if (isGroom) {
    gender = 'Groom'
    lookingFor = 'Bride'
  } else if (isBride) {
    gender = 'Bride'
    lookingFor = 'Groom'
  } else if (/groom\s*wanted|மணமகன்\s*தேவை/i.test(postText)) {
    gender = 'Bride'
    lookingFor = 'Groom'
  } else if (/bride\s*wanted|மணமகள்\s*தேவை/i.test(postText)) {
    gender = 'Groom'
    lookingFor = 'Bride'
  }

  // 2. Extract Name
  let firstName = ''
  for (const line of lines) {
    const nameMatch = line.match(/(?:பெயர்|name|candidate)\s*[:=\-]\s*([^\n,;(]+)/i)
    if (nameMatch && nameMatch[1].trim()) {
      firstName = nameMatch[1].trim().replace(/[.*_~]/g, '')
      break
    }
  }
  if (!firstName && lines.length > 0) {
    // Check if first line has a name-like string (e.g. "Karthik R (28)" or "தீபிகா M")
    const fallbackMatch = lines[0].match(/^[✦*#\s-]*([A-Za-z\u0B80-\u0BFF\s.]{3,35})(?:\s*[(,\-]|\s*$)/)
    if (fallbackMatch && !/(?:kurumba|matrimony|welcome|channel|சங்கம்)/i.test(fallbackMatch[1])) {
      firstName = fallbackMatch[1].trim()
    }
  }
  if (!firstName) {
    firstName = gender === 'Groom' ? 'Kurumbar Member (Groom)' : 'Kurumbar Member (Bride)'
  }

  // 3. Extract Age
  let age = null
  const ageMatch = postText.match(/(?:வயது|age)\s*[:=\-]?\s*(\d{2})/i) || postText.match(/\b(\d{2})\s*(?:வயது|years|yrs|age)\b/i)
  if (ageMatch) {
    const parsedAge = parseInt(ageMatch[1], 10)
    if (parsedAge >= 18 && parsedAge <= 70) age = parsedAge
  }
  // Try DOB calculation if age not found
  if (!age) {
    const dobMatch = postText.match(/(?:dob|பிறந்த\s*தேதி)\s*[:=\-]?\s*(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/i)
    if (dobMatch) {
      const birthYear = parseInt(dobMatch[3], 10)
      const currentYear = new Date().getFullYear()
      const calculatedAge = currentYear - birthYear
      if (calculatedAge >= 18 && calculatedAge <= 70) age = calculatedAge
    }
  }
  if (!age) {
    age = gender === 'Groom' ? 28 : 25
  }

  // 4. Extract Kulam / Koottam
  let kulam = ''
  const kulamMatch = postText.match(/(?:குலம்|கூட்டம்|kulam|koottam|clan|subcaste)\s*[:=\-]\s*([^\n,;()]+)/i)
  if (kulamMatch) {
    kulam = kulamMatch[1].trim().replace(/[.*_~]/g, '')
  } else {
    for (const k of KNOWN_KULAMS) {
      if (postText.includes(k)) {
        kulam = `${k} குலம்`
        break
      }
    }
  }
  if (!kulam) kulam = 'Kurumba Gounder'

  // 5. Extract Star / Nakshatram
  let nakshatram = ''
  for (const n of NAKSHATRAS) {
    if (postText.includes(n.tamil) || lower.includes(n.en.toLowerCase())) {
      nakshatram = `${n.tamil} (${n.en})`
      break
    }
  }

  // 6. Extract Rasi
  let rasi = ''
  for (const r of RASIS) {
    if (postText.includes(r.tamil) || lower.includes(r.en.toLowerCase())) {
      rasi = `${r.tamil} (${r.en})`
      break
    }
  }

  // 7. Extract City / District
  let city = 'Tamil Nadu'
  const locationLineMatch = postText.match(
    /(?:சொந்த\s*(?:மாவட்டம்|ஊர்)|மாவட்டம்|இருப்பிடம்|வசிப்பது|district|native|native\s*place|native\s*city|city|location)\s*[:=\-]?\s*([^\n;]+)/i,
  )
  const locationScope = locationLineMatch ? locationLineMatch[1] : postText

  // Check Tamil districts in location scope first
  const tamilDistricts = {
    கோயம்புத்தூர்: 'Coimbatore',
    கோவை: 'Coimbatore',
    ஈரோடு: 'Erode',
    திருப்பூர்: 'Tiruppur',
    சேலம்: 'Salem',
    நாமக்கல்: 'Namakkal',
    தருமபுரி: 'Dharmapuri',
    தர்மபுரி: 'Dharmapuri',
    கிருஷ்ணகிரி: 'Krishnagiri',
    திண்டுக்கல்: 'Dindigul',
    கரூர்: 'Karur',
    சென்னை: 'Chennai',
    மதுரை: 'Madurai',
    திருச்சி: 'Tiruchirappalli',
    திருச்சிராப்பள்ளி: 'Tiruchirappalli',
  }
  for (const [ta, en] of Object.entries(tamilDistricts)) {
    if (locationScope.includes(ta)) {
      city = en
      break
    }
  }

  // Check English districts in location scope
  if (city === 'Tamil Nadu') {
    for (const district of TAMIL_NADU_DISTRICTS) {
      if (new RegExp(`\\b${district}\\b`, 'i').test(locationScope)) {
        city = district
        break
      }
    }
  }

  // Fallback to entire post text if locationScope didn't resolve to a known district
  if (city === 'Tamil Nadu' && locationLineMatch) {
    for (const [ta, en] of Object.entries(tamilDistricts)) {
      if (postText.includes(ta)) {
        city = en
        break
      }
    }
    if (city === 'Tamil Nadu') {
      for (const district of TAMIL_NADU_DISTRICTS) {
        if (new RegExp(`\\b${district}\\b`, 'i').test(postText)) {
          city = district
          break
        }
      }
    }
  }

  // 8. Extract Education
  let education = ''
  const eduMatch = postText.match(/(?:கல்வி|கல்வித்\s*தகுதி|education|qualification|degree)\s*[:=\-]\s*([^\n,;]+)/i)
  if (eduMatch) {
    education = eduMatch[1].trim().replace(/[.*_~]/g, '')
  } else {
    const degrees = postText.match(/\b(B\.?E\.?|B\.?Tech\.?|M\.?E\.?|M\.?Tech\.?|M\.?B\.?A\.?|M\.?C\.?A\.?|M\.?B\.?B\.?S\.?|B\.?Sc\.?|M\.?Sc\.?|B\.?Com\.?|BCA|Diploma)\b[^\n,;]*/i)
    if (degrees) education = degrees[0].trim()
  }
  if (!education) education = 'Graduate'

  // 9. Extract Occupation & Income
  let occupation = ''
  const jobMatch = postText.match(/(?:வேலை|பணி|தொழில்|occupation|designation|job|working\s*as)\s*[:=\-]\s*([^\n,;]+)/i)
  if (jobMatch) {
    occupation = jobMatch[1].trim().replace(/[.*_~]/g, '')
  } else {
    const commonRoles = postText.match(/\b(Software\s*(?:Engineer|Developer)|IT\s*Professional|Bank\s*(?:Manager|Officer)|Government|Govt\s*(?:Employee|Teacher)|Civil\s*Engineer|Doctor|Business\s*Owner|Auditor|Accountant)\b[^\n,;]*/i)
    if (commonRoles) occupation = commonRoles[0].trim()
  }
  if (!occupation) occupation = 'Private Sector'

  let income = ''
  const incomeMatch = postText.match(/(?:வருமானம்|சம்பளம்|income|salary|package|lpa)\s*[:=\-]\s*([^\n,;]+)/i) || postText.match(/\b(\d+(?:\.\d+)?\s*(?:LPA|Lakhs?|ரூபாய்|pm|per\s*month))\b/i)
  if (incomeMatch) {
    income = incomeMatch[1].trim()
  }

  // 10. Extract Height
  let height = ''
  const heightMatch = postText.match(/(?:உயரம்|height)\s*[:=\-]?\s*([^\n,;]+)/i) || postText.match(/\b(\d\s*(?:ft|feet|அடி)\s*(?:\d{1,2}\s*(?:in|inches|அங்குலம்)?)?|\d{3}\s*cm)\b/i)
  if (heightMatch) height = heightMatch[1].trim()

  // 11. Extract Phone / Contact
  let phone = ''
  const phoneMatch = postText.match(/(?:தொடர்புக்கு|contact|phone|mobile|whatsapp|cell|call)\s*[:=\-]?\s*([+0-9\s-]{10,16})/i) || postText.match(/\b([6-9]\d{9})\b/)
  if (phoneMatch) {
    phone = phoneMatch[1].replace(/\D/g, '').slice(-10)
  }

  // 12. Compile "About"
  const cleanAbout = [
    kulam ? `குலம்: ${kulam}` : '',
    rasi ? `ராசி: ${rasi}` : '',
    nakshatram ? `நட்சத்திரம்: ${nakshatram}` : '',
    education ? `கல்வி: ${education}` : '',
    income ? `வருமானம்: ${income}` : '',
    height ? `உயரம்: ${height}` : ''
  ].filter(Boolean).join(' · ')

  return {
    firstName,
    gender,
    lookingFor,
    age,
    city,
    kulam,
    nakshatram,
    rasi,
    education,
    occupation: income ? `${occupation} (${income})` : occupation,
    income,
    height,
    about: cleanAbout || 'Kurumba Gounder community member profile from verified WhatsApp channel.',
    phone: phone || '9150444444', // Default to Sangam Secretary contact if missing in post
    source: 'whatsapp-channel',
    channelInviteCode: '0029Va9Kc0QFi8xje33U6O3q',
    channelName: 'KURUMBARINA MAKKAL NALA SEVAIKAL SANGAM MATRIMONIAL'
  }
}
