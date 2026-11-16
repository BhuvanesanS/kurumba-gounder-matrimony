import { useEffect, useState } from 'react'
import './App.css'

const demoProfiles = [
  { id: 'demo-1', firstName: 'Ananya S.', age: '26', city: 'Coimbatore', kulam: 'செங்குன்றத்தான் குலம்', nakshatram: 'ரோகிணி (Rohini)', rasi: 'ரிஷபம் (Rishabam)', education: 'B.Arch', occupation: 'Architect', verificationStatus: 'sample', source: 'whatsapp-channel', tone: 'rose', photo: 'https://images.unsplash.com/photo-1640745691934-1403879c3ae6?auto=format&fit=crop&w=900&q=88', photoAlt: 'Illustrative traditional bridal portrait used as a fictional sample' },
  { id: 'demo-2', firstName: 'Karthik R.', age: '29', city: 'Erode', kulam: 'காடை குலம்', nakshatram: 'மூலம் (Moolam)', rasi: 'தனுசு (Dhanusu)', education: 'B.Tech Textile', occupation: 'Business owner', verificationStatus: 'sample', source: 'whatsapp-channel', tone: 'olive', photo: 'https://images.unsplash.com/photo-1724857457968-351e2e4b252a?auto=format&fit=crop&w=900&q=88', photoAlt: 'Illustrative traditional groom portrait used as a fictional sample' },
  { id: 'demo-3', firstName: 'Divya M.', age: '25', city: 'Tiruppur', kulam: 'கண்ணந்தை கூட்டம்', nakshatram: 'அஸ்தம் (Hastham)', rasi: 'கன்னி (Kanni)', education: 'M.Sc Data Science', occupation: 'Data Analyst', verificationStatus: 'sample', source: 'whatsapp-channel', tone: 'sand', photo: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=88', photoAlt: 'Illustrative portrait used as a fictional sample' },
]

const journey = [
  ['01', 'Create with care', 'Register yourself or a family member, then decide what can be shown.'],
  ['02', 'Verify and complete', 'Mobile verification and moderation prepare a profile for the community.'],
  ['03', 'Discover respectfully', 'Filter compatible introductions without exposing personal contact data.'],
  ['04', 'Connect by consent', 'Details are shared only after both members explicitly accept.'],
]

const emptyRegistration = {
  firstName: '',
  age: '',
  gender: 'Bride',
  lookingFor: 'Groom',
  city: '',
  kulam: '',
  nakshatram: '',
  rasi: '',
  education: '',
  income: '',
  occupation: '',
  phone: '',
  about: '',
  consent: false,
}

const tamilNaduDistricts = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram', 'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar',
]

const locationRegions = [
  { name: 'Kongu & Western', tamil: 'கொங்கு மற்றும் மேற்கு', image: 'https://images.unsplash.com/photo-1650172919920-60c492e6e327?auto=format&fit=crop&w=1200&q=85', districts: ['Coimbatore', 'Erode', 'Tiruppur', 'Namakkal', 'Salem', 'Karur', 'Nilgiris'] },
  { name: 'Chennai & North', tamil: 'சென்னை மற்றும் வட தமிழ்நாடு', image: 'https://images.unsplash.com/photo-1595433306946-233f47e4af3a?auto=format&fit=crop&w=1200&q=85', districts: ['Chennai', 'Chengalpattu', 'Kancheepuram', 'Tiruvallur', 'Ranipet', 'Vellore', 'Tirupathur', 'Tiruvannamalai', 'Viluppuram', 'Kallakurichi', 'Cuddalore', 'Krishnagiri', 'Dharmapuri'] },
  { name: 'Central & Delta', tamil: 'மத்திய மற்றும் டெல்டா', image: 'https://images.unsplash.com/photo-1759134334657-30db77958a01?auto=format&fit=crop&w=1200&q=85', districts: ['Ariyalur', 'Perambalur', 'Tiruchirappalli', 'Pudukkottai', 'Thanjavur', 'Tiruvarur', 'Nagapattinam', 'Mayiladuthurai', 'Dindigul'] },
  { name: 'South Tamil Nadu', tamil: 'தென் தமிழ்நாடு', image: 'https://images.unsplash.com/photo-1692173248120-59547c3d4653?auto=format&fit=crop&w=1200&q=85', districts: ['Madurai', 'Theni', 'Sivaganga', 'Ramanathapuram', 'Virudhunagar', 'Tenkasi', 'Tirunelveli', 'Thoothukudi', 'Kanyakumari'] },
]

const SAMPLE_POST_TEXT = `KURUMBARINA MAKKAL NALA SEVAIKAL SANGAM MATRIMONIAL
பதிவு எண்: KG-M-109
பாலினம்: மணமகன் (Groom)
பெயர்: சுந்தர்ராஜ் R (Sundarraj R)
வயது: 29 (பிறந்த தேதி: 18.06.1997)
குலம்: காடை குலம்
ராசி: சிம்மம் (Simmam)
நட்சத்திரம்: மகம் (Magam)
கல்வி: B.E Mechanical Engineering, MBA
வேலை: Production Manager, Auto Ancillary, Coimbatore
வருமானம்: ₹12 LPA
சொந்த மாவட்டம்: கோயம்புத்தூர் (Coimbatore)
உயரம்: 5 அடி 11 அங்குலம்
எதிர்பார்ப்பு: படித்த குரும்ப கவுண்டர் பெண்
தொடர்புக்கு: 9150444444 / 9842188990`

function BrandLockup() {
  return (
    <>
      <img className="legacy-mark" src="/legacy-mark.svg" alt="" />
      <span>
        <strong>Kurumba Gounder</strong>
        <small>Legacy · Matrimony · பாரம்பரியம்</small>
      </span>
    </>
  )
}

function App() {
  const [notice, setNotice] = useState('')
  const [plan, setPlan] = useState('Classic')
  const [search, setSearch] = useState({ looking: 'Bride', location: 'Tamil Nadu', age: '24–30', kulam: '' })
  const [registration, setRegistration] = useState(emptyRegistration)
  const [profiles, setProfiles] = useState([])
  const [submitting, setSubmitting] = useState(false)

  // WhatsApp Scraper & Ingestion State
  const [channelInfo, setChannelInfo] = useState(null)
  const [rawWhatsappText, setRawWhatsappText] = useState('')
  const [ingesting, setIngesting] = useState(false)
  const [ingestStats, setIngestStats] = useState(null)

  // Smart Matchmaker State
  const [selectedCandidateId, setSelectedCandidateId] = useState('')
  const [matchData, setMatchData] = useState(null)
  const [loadingMatches, setLoadingMatches] = useState(false)

  const loadProfiles = async (filterSearch = search) => {
    try {
      const params = new URLSearchParams()
      if (filterSearch.looking) params.set('lookingFor', filterSearch.looking)
      if (filterSearch.location && filterSearch.location !== 'Tamil Nadu') params.set('city', filterSearch.location)
      if (filterSearch.kulam) params.set('kulam', filterSearch.kulam)

      const url = `/api/profiles?${params.toString()}`
      const response = await fetch(url)
      if (!response.ok) return
      const data = await response.json()
      setProfiles(data.profiles || [])
      if (data.profiles && data.profiles.length > 0 && !selectedCandidateId) {
        setSelectedCandidateId(data.profiles[0].id)
      }
    } catch {
      /* Backend may not yet be started; demo cards remain visible. */
    }
  }

  const loadChannelInfo = async () => {
    try {
      const response = await fetch('/api/channel-info')
      if (response.ok) {
        const data = await response.json()
        setChannelInfo(data)
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadProfiles()
    loadChannelInfo()
  }, [])

  const updateSearch = (event) => {
    const updated = { ...search, [event.target.name]: event.target.value }
    setSearch(updated)
  }

  const updateRegistration = (event) => {
    const { name, value, type, checked } = event.target
    setRegistration({ ...registration, [name]: type === 'checkbox' ? checked : value })
  }

  const submitSearch = (event) => {
    event.preventDefault()
    loadProfiles(search)
    setNotice(`Showing introductions for a ${search.looking.toLowerCase()} in ${search.location}.`)
  }

  const submitRegistration = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registration),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'We could not save the profile.')
      setRegistration(emptyRegistration)
      setNotice(`${data.message} Profile reference: ${data.profile.id.slice(0, 18)}…`)
      await loadProfiles()
    } catch (error) {
      setNotice(error.message || 'Start the backend with npm run server, then submit again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle WhatsApp Ingestion
  const handleIngestWhatsapp = async () => {
    if (!rawWhatsappText.trim()) {
      setNotice('Please paste matrimonial messages from the WhatsApp channel to parse.')
      return
    }
    setIngesting(true)
    try {
      const response = await fetch('/api/ingest/whatsapp-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: rawWhatsappText }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to parse WhatsApp text.')

      setIngestStats({
        count: data.count,
        message: data.message,
        profiles: data.profiles,
      })
      setRawWhatsappText('')
      setNotice(`✅ ${data.message}`)
      await loadProfiles()
    } catch (error) {
      setNotice(`❌ Error parsing WhatsApp text: ${error.message}`)
    } finally {
      setIngesting(false)
    }
  }

  // Handle One-click Sample Posts Ingestion
  const handleLoadSamplePosts = async () => {
    setIngesting(true)
    try {
      const response = await fetch('/api/ingest/sample-channel-posts', { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to load sample channel posts.')
      setIngestStats({
        count: data.count,
        message: data.message,
        profiles: data.profiles,
      })
      setNotice(`✅ ${data.message}`)
      await loadProfiles()
    } catch (error) {
      setNotice(`❌ Error loading sample posts: ${error.message}`)
    } finally {
      setIngesting(false)
    }
  }

  // Handle Smart Match calculation for candidate
  const handleFindMatches = async (candidateId) => {
    if (!candidateId) return
    setSelectedCandidateId(candidateId)
    setLoadingMatches(true)
    try {
      const response = await fetch(`/api/matches/${candidateId}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not find matches.')
      setMatchData(data)
      // Scroll to matchmaker section
      const matcherEl = document.getElementById('smart-matcher')
      if (matcherEl) {
        matcherEl.scrollIntoView({ behavior: 'smooth' })
      }
    } catch (error) {
      setNotice(`Matchmaker error: ${error.message}`)
    } finally {
      setLoadingMatches(false)
    }
  }

  const selectPlan = async (selected) => {
    setPlan(selected)
    setNotice(`${selected} selected. Create a verified profile first; the backend then creates an order before a payment provider checkout is opened.`)
  }

  const profileCards = profiles.length
    ? profiles.map((profile, index) => ({ ...profile, tone: ['rose', 'olive', 'sand'][index % 3] }))
    : demoProfiles

  return (
    <main>
      <div className="topline">
        குரும்ப கவுண்டர் குடும்பங்களுக்கான நம்பிக்கையான அறிமுகம் · Tamil Nadu · Official WhatsApp Channel Integration
      </div>

      <header className="site-header">
        <a className="brand" href="#home" aria-label="Kurumba Gounder Legacy Matrimony home">
          <BrandLockup />
        </a>
        <nav aria-label="Primary navigation">
          <a href="#whatsapp-channel">WhatsApp Channel Hub</a>
          <a href="#smart-matcher">Smart Matchmaker</a>
          <a href="#profiles">Profiles</a>
          <a href="#locations">Locations</a>
          <a href="#membership">Membership</a>
        </nav>
        <a className="button button-dark header-cta" href="#register">
          Create profile <span>↗</span>
        </a>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <p className="eyebrow">உறவுகள் இணையும் இடம்</p>
          <h1>
            Shared heritage.<br />
            <em>Chosen</em> with care.
          </h1>
          <p className="hero-text">
            A private, respectful matrimonial space for Kurumba Gounder members and families—powered by WhatsApp Channel synchronization, traditional clan (Kulam) compatibility, and mutual consent.
          </p>
          <div className="hero-actions">
            <a className="button button-coral" href="#whatsapp-channel">
              WhatsApp Channel Hub <span>→</span>
            </a>
            <a className="button button-outline" href="#smart-matcher">
              Smart Matchmaker <span>⚡</span>
            </a>
          </div>
          <div className="trust-row">
            <span className="trust-icon">✦</span>
            <p>
              <strong>Contact privacy & Clan Rules by default</strong>
              <br />
              Intra-clan (Same Kulam) marriage bar respect · Phone numbers verified & hashed.
            </p>
          </div>
        </div>

        <div className="hero-art" aria-label="Abstract Tamil wedding and kolam illustration">
          <div className="sun-disc" />
          <div className="arch arch-back" />
          <div className="arch arch-front">
            <span className="kolam one">✧</span>
            <span className="kolam two">✦</span>
            <span className="kolam three">✧</span>
            <div className="couple-card">
              <img src="/legacy-mark.svg" alt="" />
              <span>புதிய தொடக்கம்</span>
              <strong>Two families.<br />One considered step.</strong>
              <i>◌</i>
            </div>
          </div>
          <p className="art-caption">Kurumba Gounder Legacy</p>
        </div>
      </section>

      {/* WHATSAPP CHANNEL INGESTION & SCRAPING HUB */}
      <section className="whatsapp-hub section" id="whatsapp-channel">
        <div className="hub-container">
          <div className="hub-header">
            <div className="wa-badge-pill">
              <span className="wa-icon">💬</span>
              <span>Official WhatsApp Channel Integration</span>
            </div>
            <h2>
              Synchronize & Match from<br />
              <em>WhatsApp Matrimonial Channel</em>
            </h2>
            <p>
              Direct bridge to <strong>KURUMBARINA MAKKAL NALA SEVAIKAL SANGAM MATRIMONIAL</strong> (2.2K Followers).
              Extracts Kulam (கூட்டம்/குலம்), Star (நட்சத்திரம்), Rasi, Education, Profession, District, and contact references automatically.
            </p>
          </div>

          <div className="channel-info-card">
            <div className="channel-meta-left">
              <div className="channel-avatar">KG</div>
              <div>
                <h3>{channelInfo?.name || 'KURUMBARINA MAKKAL NALA SEVAIKAL SANGAM MATRIMONIAL'}</h3>
                <div className="channel-tags">
                  <span className="tag-pill tag-followers">👥 {channelInfo?.followers || '2.2K followers'}</span>
                  <span className="tag-pill tag-verified">✓ Community Verified</span>
                  <span className="tag-pill tag-secretary">👤 மாநில பொதுச் செயலாளர்: R. சத்தியமூர்த்தி</span>
                  <span className="tag-pill tag-phone">📞 9150444444</span>
                </div>
              </div>
            </div>
            <a
              href={channelInfo?.url || 'https://whatsapp.com/channel/0029Va9Kc0QFi8xje33U6O3q'}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-dark wa-link-btn"
            >
              Open Channel on WhatsApp <span>↗</span>
            </a>
          </div>

          <div className="ingest-grid">
            <div className="ingest-card">
              <div className="card-top">
                <h3>📥 Ingest Channel Posts</h3>
                <p>Paste text copied from the WhatsApp Channel feed to analyze and store matrimonial profiles:</p>
              </div>

              <textarea
                className="wa-textarea"
                rows="8"
                placeholder="Paste WhatsApp channel posts here (supports Tamil & English)...&#10;&#10;மணமகன் விவரம்&#10;பெயர்: ...&#10;வயது: ...&#10;குலம்: செங்குன்றத்தான் குலம்&#10;நட்சத்திரம்: திருவாதிரை&#10;படிப்பு: BE / MBA&#10;வேலை: Software Engineer&#10;சொந்த மாவட்டம்: கோயம்புத்தூர்"
                value={rawWhatsappText}
                onChange={(e) => setRawWhatsappText(e.target.value)}
              />

              <div className="ingest-actions">
                <button
                  type="button"
                  className="button button-outline sample-fill-btn"
                  onClick={() => setRawWhatsappText(SAMPLE_POST_TEXT)}
                >
                  📋 Insert Template
                </button>
                <button
                  type="button"
                  className="button button-coral parse-btn"
                  onClick={handleIngestWhatsapp}
                  disabled={ingesting}
                >
                  {ingesting ? 'Analyzing...' : '⚡ Ingest & Analyze Posts'}
                </button>
                <button
                  type="button"
                  className="button button-dark seed-btn"
                  onClick={handleLoadSamplePosts}
                  disabled={ingesting}
                >
                  🌟 Load 8 Verified Posts
                </button>
              </div>
            </div>

            <div className="ingest-status-card">
              <div className="card-top">
                <h3>📊 Parsing & Matrimonial Engine Status</h3>
                <p>Automatic field extraction and cultural rule analysis:</p>
              </div>

              <div className="features-list">
                <div className="feature-item">
                  <span className="feature-icon">🏛️</span>
                  <div>
                    <strong>Kulam / Koottam Extraction (குலம்)</strong>
                    <p>Detects செங்குன்றத்தான், கண்ணந்தை, காடை, அந்துவன், ஆதி, மணியன் and 20+ customary clans.</p>
                  </div>
                </div>

                <div className="feature-item">
                  <span className="feature-icon">✨</span>
                  <div>
                    <strong>Astrological Alignment (நட்சத்திரம் / ராசி)</strong>
                    <p>Maps 27 Tamil Nakshatras & 12 Rasis for traditional horoscopic compatibility.</p>
                  </div>
                </div>

                <div className="feature-item">
                  <span className="feature-icon">🔒</span>
                  <div>
                    <strong>Privacy & Masking Guard</strong>
                    <p>Generates cryptographic SHA-256 phone hash; shows only masked digits (e.g. ***4444).</p>
                  </div>
                </div>

                <div className="feature-item">
                  <span className="feature-icon">🤝</span>
                  <div>
                    <strong>Clan Compatibility Enforcement</strong>
                    <p>Flags Same Kulam (Pangali) intra-marriage bars and boosts Machan-Machini alliances.</p>
                  </div>
                </div>
              </div>

              {ingestStats && (
                <div className="ingest-alert">
                  <strong>🎉 Ingestion Complete!</strong>
                  <p>{ingestStats.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SMART MATRIMONIAL MATCHMAKER */}
      <section className="matcher-section section" id="smart-matcher">
        <div className="matcher-header">
          <p className="eyebrow">பாரம்பரிய திருமண பொருத்தம் · Smart Cultural Matchmaker</p>
          <h2>
            Customary Compatibility &<br />
            <em>Alliance Matching Engine</em>
          </h2>
          <p>
            Respects Kongu Kurumba Gounder clan rules (Exogamy/Pangali caution), astrological harmony, and geographic proximity matching.
          </p>
        </div>

        <div className="matcher-controls">
          <label>
            <span>Select Candidate Profile:</span>
            <select
              value={selectedCandidateId}
              onChange={(e) => {
                setSelectedCandidateId(e.target.value)
                handleFindMatches(e.target.value)
              }}
            >
              <option value="" disabled>Choose a candidate to match...</option>
              {profileCards.map((p) => (
                <option value={p.id} key={p.id}>
                  {p.firstName} ({p.gender}, Age {p.age}) — {p.kulam || 'Kurumba Gounder'}, {p.city}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="button button-coral"
            onClick={() => handleFindMatches(selectedCandidateId)}
            disabled={!selectedCandidateId || loadingMatches}
          >
            {loadingMatches ? 'Calculating Alliances...' : '⚡ Calculate Matches'}
          </button>
        </div>

        {matchData && matchData.candidate && (
          <div className="match-workspace">
            {/* Candidate Summary */}
            <div className="candidate-focus-card">
              <span className="focus-eyebrow">Selected Candidate</span>
              <div className="focus-inner">
                <div className="focus-info">
                  <h3>{matchData.candidate.firstName}, {matchData.candidate.age} yrs</h3>
                  <div className="focus-tags">
                    <span className="pill pill-gold">{matchData.candidate.gender}</span>
                    <span className="pill pill-kulam">குலம்: {matchData.candidate.kulam || 'Kurumba Gounder'}</span>
                    <span className="pill pill-astro">{matchData.candidate.nakshatram} · {matchData.candidate.rasi}</span>
                    <span className="pill pill-loc">📍 {matchData.candidate.city}</span>
                    <span className="pill pill-job">💼 {matchData.candidate.occupation}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Matches List */}
            <div className="matches-results">
              <h3>
                Recommended Compatible Alliances ({matchData.matches?.length || 0})
              </h3>

              {matchData.matches && matchData.matches.length > 0 ? (
                <div className="match-cards-grid">
                  {matchData.matches.map((item, idx) => (
                    <article
                      className={`match-result-card ${item.score >= 80 ? 'high-match' : item.score >= 60 ? 'mid-match' : 'low-match'}`}
                      key={item.profile.id || idx}
                    >
                      <div className="match-card-header">
                        <div className="match-score-badge">
                          <span className="score-num">{item.score}%</span>
                          <span className="score-label">Compatibility</span>
                        </div>
                        <div className="match-badges-stack">
                          <span className="badge-tier">{item.badge}</span>
                          <span
                            className={`kulam-status-tag ${item.kulamStatus.includes('Compatible') ? 'status-good' : 'status-warn'}`}
                          >
                            {item.kulamStatus}
                          </span>
                        </div>
                      </div>

                      <div className="match-person-info">
                        <h4>{item.profile.firstName}, {item.profile.age}</h4>
                        <p className="person-job">{item.profile.education || item.profile.occupation} · {item.profile.city}</p>

                        <div className="person-meta-tags">
                          <span className="tag-kulam">🏛️ {item.profile.kulam || 'Kurumba Gounder'}</span>
                          <span className="tag-star">✨ {item.profile.nakshatram || 'நட்சத்திரம்'}</span>
                          <span className="tag-rasi">🌙 {item.profile.rasi || 'ராசி'}</span>
                          {item.profile.income && <span className="tag-income">💰 {item.profile.income}</span>}
                        </div>
                      </div>

                      <div className="match-reasons-box">
                        <strong>Match Analysis:</strong>
                        <ul>
                          {item.reasons.map((r, rIdx) => (
                            <li key={rIdx}>{r}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="match-card-footer">
                        <button
                          type="button"
                          className="button button-coral full"
                          onClick={() => setNotice(`Introduction request initiated for ${item.profile.firstName}. Both families must consent before contact numbers are revealed.`)}
                        >
                          Request Alliance Introduction <span>→</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="no-matches-box">
                  <p>No matching candidate found with the current criteria. Ingest more profiles from the WhatsApp channel above!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* LOOKING FOR SECTION */}
      <section className="looking-for section" aria-labelledby="looking-title">
        <div className="looking-title">
          <p className="eyebrow">உங்கள் தேர்வு · Your choice</p>
          <h2 id="looking-title">Who are you looking for?</h2>
          <p>Choose a path to begin. You can change this at any time—every introduction remains private until both people agree.</p>
        </div>
        <div className="choice-grid">
          <button
            className={`choice-card ${search.looking === 'Bride' ? 'selected' : ''}`}
            type="button"
            onClick={() => {
              const updated = { ...search, looking: 'Bride' }
              setSearch(updated)
              loadProfiles(updated)
            }}
            aria-pressed={search.looking === 'Bride'}
          >
            <img
              src="https://images.unsplash.com/photo-1640745691934-1403879c3ae6?auto=format&fit=crop&w=1200&q=85"
              alt="Illustrative traditional Indian bridal portrait"
            />
            <span className="choice-wash" />
            <span className="choice-content">
              <small>பெண் · Bride</small>
              <strong>Looking for a bride</strong>
              <em>View respectful profile introductions <b>→</b></em>
            </span>
          </button>
          <button
            className={`choice-card ${search.looking === 'Groom' ? 'selected' : ''}`}
            type="button"
            onClick={() => {
              const updated = { ...search, looking: 'Groom' }
              setSearch(updated)
              loadProfiles(updated)
            }}
            aria-pressed={search.looking === 'Groom'}
          >
            <img
              src="https://images.unsplash.com/photo-1724857457968-351e2e4b252a?auto=format&fit=crop&w=1200&q=85"
              alt="Illustrative traditional Indian groom portrait"
            />
            <span className="choice-wash" />
            <span className="choice-content">
              <small>ஆண் · Groom</small>
              <strong>Looking for a groom</strong>
              <em>View respectful profile introductions <b>→</b></em>
            </span>
          </button>
        </div>
        <p className="image-credit">
          Illustrative stock visuals from <a href="https://unsplash.com/" target="_blank" rel="noreferrer">Unsplash</a>.
        </p>
      </section>

      {/* LOCATIONS SECTION */}
      <section className="locations section" id="locations">
        <div className="locations-heading">
          <div>
            <p className="eyebrow">தமிழ்நாடு முழுவதும் · Across Tamil Nadu</p>
            <h2>
              Choose the place<br />
              <em>that feels close to home.</em>
            </h2>
          </div>
          <p>
            Every one of Tamil Nadu’s 38 districts is included. Kongu region (Coimbatore, Erode, Tiruppur, Salem, Namakkal) has dedicated cultural clan support.
          </p>
        </div>
        <div className="region-grid">
          {locationRegions.map((region) => (
            <article className="region-card" key={region.name}>
              <img src={region.image} alt={`Illustrative landscape for ${region.name}`} />
              <div className="region-shade" />
              <div className="region-title">
                <small>{region.tamil}</small>
                <h3>{region.name}</h3>
              </div>
              <div className="district-chips">
                {region.districts.map((district) => (
                  <button
                    className={search.location === district ? 'active' : ''}
                    type="button"
                    onClick={() => {
                      const updated = { ...search, location: district }
                      setSearch(updated)
                      loadProfiles(updated)
                    }}
                    key={district}
                  >
                    {district}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="location-summary">
          <span>✓</span>
          <p>
            <strong>{search.location === 'Tamil Nadu' ? 'Tamil Nadu — all districts' : search.location}</strong> is currently selected for your search.
          </p>
          <a href="#profiles">Explore profiles <span>→</span></a>
        </div>
      </section>

      {/* SEARCH SHELL */}
      <section className="search-shell" id="find-match" aria-labelledby="search-title">
        <div>
          <p className="eyebrow">Find introductions</p>
          <h2 id="search-title">Begin with what matters.</h2>
        </div>
        <form className="search-form" onSubmit={submitSearch}>
          <label>
            I am looking for
            <select name="looking" value={search.looking} onChange={updateSearch}>
              <option value="Bride">பெண் · Bride</option>
              <option value="Groom">ஆண் · Groom</option>
            </select>
          </label>
          <label>
            Preferred location
            <select name="location" value={search.location} onChange={updateSearch}>
              <option value="Tamil Nadu">Tamil Nadu — all districts</option>
              {tamilNaduDistricts.map((district) => (
                <option value={district} key={district}>{district}</option>
              ))}
            </select>
          </label>
          <label>
            Filter by Kulam
            <input
              type="text"
              name="kulam"
              placeholder="e.g. செங்குன்றத்தான், காடை"
              value={search.kulam}
              onChange={updateSearch}
              className="kulam-filter-input"
            />
          </label>
          <button className="button button-dark" type="submit">
            Filter profiles <span>→</span>
          </button>
        </form>
      </section>

      {notice && (
        <div className="notice" role="status">
          <span>✦</span>
          {notice}
          <button onClick={() => setNotice('')} aria-label="Dismiss message">×</button>
        </div>
      )}

      {/* PROFILES SECTION */}
      <section className="profiles section" id="profiles">
        <div className="profiles-heading">
          <div>
            <p className="eyebrow">Verified & Community Introductions</p>
            <h2>Profiles, shown with dignity.</h2>
          </div>
          <p>
            {profiles.length
              ? `Showing ${profiles.length} curated profiles from WhatsApp Channel and verified registrations.`
              : 'Sample cards use illustrative stock portraits until profiles are loaded.'}
          </p>
        </div>

        <div className="profile-grid">
          {profileCards.map((profile, index) => (
            <article className={`profile-card ${profile.tone || 'sand'}`} key={profile.id || index}>
              <div className="profile-portrait">
                {profile.photo ? (
                  <img src={profile.photo} alt={profile.photoAlt || 'Illustrative profile portrait'} />
                ) : (
                  <span>{index % 3 === 0 ? '✦' : index % 3 === 1 ? '◈' : '◌'}</span>
                )}
                <div className="portrait-shade" />
                <small className="badge-status">
                  {profile.source === 'whatsapp-channel' ? '📱 Verified Channel Post' : 'Pending verification'}
                </small>
              </div>

              <div className="profile-details">
                <h3>{profile.firstName}, {profile.age}</h3>
                <div className="profile-kulam-badge">
                  🏛️ {profile.kulam || 'குரும்ப கவுண்டர் குலம்'}
                </div>
                {(profile.nakshatram || profile.rasi) && (
                  <div className="profile-astro-row">
                    ✨ {profile.nakshatram || 'நட்சத்திரம்'} {profile.rasi && `(${profile.rasi})`}
                  </div>
                )}
                <p className="profile-job">
                  {profile.education || profile.occupation} · {profile.city}
                </p>
                {profile.income && <div className="profile-income-row">💰 வருமானம்: {profile.income}</div>}

                <div className="card-btn-stack">
                  <button
                    className="button-link match-link"
                    type="button"
                    onClick={() => handleFindMatches(profile.id)}
                  >
                    ⚡ Calculate Match Score <span>→</span>
                  </button>
                  <button
                    className="button-link intro-link"
                    type="button"
                    onClick={() => setNotice(`Introduction requested for ${profile.firstName}. Contact information remains private until both families accept.`)}
                  >
                    Request introduction <span>↗</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="process section" id="how-it-works">
        <div className="process-top">
          <div>
            <p className="eyebrow">How it works</p>
            <h2>Every stage has a reason.</h2>
          </div>
          <p>Good matchmaking is more than a form. The product makes privacy, cultural rules, and consent visible at each moment.</p>
        </div>
        <div className="journey-grid">
          {journey.map(([number, title, copy]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CONSENT & PRIVACY */}
      <section className="consent section">
        <div className="consent-art">
          <img
            src="https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=88"
            alt="Illustrative wedding couple photograph"
          />
          <div className="consent-photo-wash" />
          <div className="consent-orbit orbit-a" />
          <div className="consent-orbit orbit-b" />
          <span>✓</span>
          <small>Illustrative photograph</small>
        </div>
        <div>
          <p className="eyebrow">Your privacy is the promise</p>
          <h2>Phone details are not a public field for others to see.</h2>
          <p>
            The backend saves a one-way cryptographic SHA-256 hash of the submitted mobile number and never exposes raw contact details in public listings. Contact sharing only happens after mutual verified consent.
          </p>
          <a className="button button-outline" href="#register">
            Read the registration flow <span>→</span>
          </a>
        </div>
      </section>

      {/* MEMBERSHIP */}
      <section className="membership section" id="membership">
        <div className="membership-copy">
          <p className="eyebrow">Straightforward membership</p>
          <h2>Pay only when you are ready to connect.</h2>
          <p>The API creates a membership-order record. Before launch, connect Razorpay or Cashfree for hosted checkout and signed webhook verification.</p>
          <ul>
            <li>✓ No card or UPI details stored by this website</li>
            <li>✓ Order stays pending until a provider webhook verifies it</li>
            <li>✓ Invoice and expiry records belong to the authenticated profile</li>
          </ul>
        </div>
        <div className="plan-card">
          <span className="plan-badge">Most chosen</span>
          <p>Membership preview</p>
          <h3>{plan}</h3>
          <strong>{plan === 'Classic' ? '₹1,999' : '₹3,499'} <small>/ {plan === 'Classic' ? '3 months' : '6 months'}</small></strong>
          <div className="plan-options">
            <button className={plan === 'Classic' ? 'active' : ''} onClick={() => selectPlan('Classic')}>
              Classic<br /><small>3 months</small>
            </button>
            <button className={plan === 'Assisted' ? 'active' : ''} onClick={() => selectPlan('Assisted')}>
              Assisted<br /><small>6 months</small>
            </button>
          </div>
          <button className="button button-coral full" onClick={() => selectPlan(plan)}>
            Create order securely <span>→</span>
          </button>
        </div>
      </section>

      {/* REGISTRATION FORM */}
      <section className="join section registration-section" id="register">
        <p className="eyebrow">Create a private profile</p>
        <h2>Tell us only what<br /><em>helps an introduction.</em></h2>
        <p>All fields marked below are used to prepare a profile for smart cultural matching and mutual introductions.</p>

        <form className="registration-form" onSubmit={submitRegistration}>
          <label>
            First name / பெயர்
            <input required name="firstName" value={registration.firstName} onChange={updateRegistration} placeholder="Your first name" />
          </label>
          <label>
            Age / வயது
            <input required name="age" min="18" max="99" type="number" value={registration.age} onChange={updateRegistration} placeholder="25" />
          </label>
          <label>
            Your profile / உங்கள் விவரம்
            <select name="gender" value={registration.gender} onChange={updateRegistration}>
              <option value="Bride">பெண் · Bride</option>
              <option value="Groom">ஆண் · Groom</option>
            </select>
          </label>
          <label>
            Looking for / தேடுவது
            <select name="lookingFor" value={registration.lookingFor} onChange={updateRegistration}>
              <option value="Groom">ஆண் · Groom</option>
              <option value="Bride">பெண் · Bride</option>
            </select>
          </label>
          <label>
            City / district
            <select required name="city" value={registration.city} onChange={updateRegistration}>
              <option value="" disabled>Select your district</option>
              {tamilNaduDistricts.map((district) => (
                <option value={district} key={district}>{district}</option>
              ))}
            </select>
          </label>
          <label>
            Kulam / கூட்டம் (குலம்)
            <input name="kulam" value={registration.kulam} onChange={updateRegistration} placeholder="e.g. செங்குன்றத்தான், கண்ணந்தை, காடை" />
          </label>
          <label>
            Nakshatram / நட்சத்திரம்
            <input name="nakshatram" value={registration.nakshatram} onChange={updateRegistration} placeholder="e.g. திருவாதிரை, ரோகிணி, அஸ்தம்" />
          </label>
          <label>
            Rasi / ராசி
            <input name="rasi" value={registration.rasi} onChange={updateRegistration} placeholder="e.g. மிதுனம், ரிஷபம், கன்னி" />
          </label>
          <label>
            Education / கல்வி
            <input name="education" value={registration.education} onChange={updateRegistration} placeholder="e.g. B.E, M.Sc, MBA" />
          </label>
          <label>
            Occupation / தொழில்
            <input required name="occupation" value={registration.occupation} onChange={updateRegistration} placeholder="e.g. Software Engineer, Business" />
          </label>
          <label>
            Income / வருமானம்
            <input name="income" value={registration.income} onChange={updateRegistration} placeholder="e.g. ₹12 LPA" />
          </label>
          <label>
            Mobile number (Private)
            <input required name="phone" inputMode="numeric" value={registration.phone} onChange={updateRegistration} placeholder="Used only for verification" />
          </label>
          <label className="wide">
            A little about yourself
            <textarea required name="about" value={registration.about} onChange={updateRegistration} placeholder="Family background, interests, and what you value in a partner" />
          </label>
          <label className="consent-check wide">
            <input required name="consent" checked={registration.consent} onChange={updateRegistration} type="checkbox" />
            <span>I am 18+ and consent to this private profile being created. I understand contact details will not be shared without my explicit approval.</span>
          </label>
          <button className="button button-coral form-submit wide" disabled={submitting} type="submit">
            {submitting ? 'Saving profile…' : 'Save private profile'} <span>→</span>
          </button>
        </form>
      </section>

      <footer>
        <a className="brand" href="#home"><BrandLockup /></a>
        <p>Kurumba Gounder Legacy · Respectful, clan-aware, consent-first matchmaking.</p>
        <div>
          <a href="#whatsapp-channel">WhatsApp Hub</a>
          <a href="#smart-matcher">Matchmaker</a>
          <a href="#locations">Locations</a>
          <a href="#membership">Membership</a>
        </div>
      </footer>
    </main>
  )
}

export default App