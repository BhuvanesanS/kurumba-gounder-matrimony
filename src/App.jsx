import { useEffect, useState } from 'react'
import './App.css'

const demoProfiles = [
  { id: 'demo-1', firstName: 'Ananya S.', age: '26', city: 'Coimbatore', occupation: 'Architect', verificationStatus: 'sample', tone: 'rose', photo: 'https://images.unsplash.com/photo-1640745691934-1403879c3ae6?auto=format&fit=crop&w=900&q=88', photoAlt: 'Illustrative traditional bridal portrait used as a fictional sample' },
  { id: 'demo-2', firstName: 'Karthik R.', age: '29', city: 'Erode', occupation: 'Business owner', verificationStatus: 'sample', tone: 'olive', photo: 'https://images.unsplash.com/photo-1724857457968-351e2e4b252a?auto=format&fit=crop&w=900&q=88', photoAlt: 'Illustrative traditional groom portrait used as a fictional sample' },
  { id: 'demo-3', firstName: 'Divya M.', age: '25', city: 'Tiruppur', occupation: 'Software engineer', verificationStatus: 'sample', tone: 'sand', photo: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=88', photoAlt: 'Illustrative portrait used as a fictional sample' },
]

const journey = [
  ['01', 'Create with care', 'Register yourself or a family member, then decide what can be shown.'],
  ['02', 'Verify and complete', 'Mobile verification and moderation prepare a profile for the community.'],
  ['03', 'Discover respectfully', 'Filter compatible introductions without exposing personal contact data.'],
  ['04', 'Connect by consent', 'Details are shared only after both members explicitly accept.'],
]

const emptyRegistration = { firstName: '', age: '', gender: 'Bride', lookingFor: 'Groom', city: '', occupation: '', phone: '', about: '', consent: false }

const tamilNaduDistricts = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram', 'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar',
]

const locationRegions = [
  { name: 'Chennai & North', tamil: 'சென்னை மற்றும் வட தமிழ்நாடு', image: 'https://images.unsplash.com/photo-1595433306946-233f47e4af3a?auto=format&fit=crop&w=1200&q=85', districts: ['Chennai', 'Chengalpattu', 'Kancheepuram', 'Tiruvallur', 'Ranipet', 'Vellore', 'Tirupathur', 'Tiruvannamalai', 'Viluppuram', 'Kallakurichi', 'Cuddalore', 'Krishnagiri', 'Dharmapuri'] },
  { name: 'Kongu & Western', tamil: 'கொங்கு மற்றும் மேற்கு', image: 'https://images.unsplash.com/photo-1650172919920-60c492e6e327?auto=format&fit=crop&w=1200&q=85', districts: ['Coimbatore', 'Erode', 'Tiruppur', 'Namakkal', 'Salem', 'Karur', 'Nilgiris'] },
  { name: 'Central & Delta', tamil: 'மத்திய மற்றும் டெல்டா', image: 'https://images.unsplash.com/photo-1759134334657-30db77958a01?auto=format&fit=crop&w=1200&q=85', districts: ['Ariyalur', 'Perambalur', 'Tiruchirappalli', 'Pudukkottai', 'Thanjavur', 'Tiruvarur', 'Nagapattinam', 'Mayiladuthurai', 'Dindigul'] },
  { name: 'South Tamil Nadu', tamil: 'தென் தமிழ்நாடு', image: 'https://images.unsplash.com/photo-1692173248120-59547c3d4653?auto=format&fit=crop&w=1200&q=85', districts: ['Madurai', 'Theni', 'Sivaganga', 'Ramanathapuram', 'Virudhunagar', 'Tenkasi', 'Tirunelveli', 'Thoothukudi', 'Kanyakumari'] },
]

function BrandLockup() {
  return <><img className="legacy-mark" src="/legacy-mark.svg" alt="" /><span><strong>Kurumba Gounder</strong><small>Legacy · Matrimony · பாரம்பரியம்</small></span></>
}

function App() {
  const [notice, setNotice] = useState('')
  const [plan, setPlan] = useState('Classic')
  const [search, setSearch] = useState({ looking: 'Bride', location: 'Tamil Nadu', age: '24–30' })
  const [registration, setRegistration] = useState(emptyRegistration)
  const [profiles, setProfiles] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const loadProfiles = async () => {
    try {
      const response = await fetch('/api/profiles')
      if (!response.ok) return
      const data = await response.json()
      setProfiles(data.profiles || [])
    } catch { /* Backend may not yet be started; demo cards remain visible. */ }
  }

  useEffect(() => {
    let active = true
    fetch('/api/profiles')
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (active && data) setProfiles(data.profiles || []) })
      .catch(() => undefined)
    return () => { active = false }
  }, [])

  const updateSearch = (event) => setSearch({ ...search, [event.target.name]: event.target.value })
  const updateRegistration = (event) => {
    const { name, value, type, checked } = event.target
    setRegistration({ ...registration, [name]: type === 'checkbox' ? checked : value })
  }
  const submitSearch = (event) => {
    event.preventDefault()
    setNotice(`Showing safe introduction previews for a ${search.looking.toLowerCase()} near ${search.location}. Sign in and verification are required before requesting a connection.`)
  }
  const submitRegistration = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      const response = await fetch('/api/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(registration) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'We could not save the profile.')
      setRegistration(emptyRegistration)
      setNotice(`${data.message} Your private reference is ${data.profile.id.slice(0, 18)}…`)
      await loadProfiles()
    } catch (error) {
      setNotice(error.message || 'Start the backend with npm run server, then submit again.')
    } finally { setSubmitting(false) }
  }
  const selectPlan = async (selected) => {
    setPlan(selected)
    setNotice(`${selected} selected. Create a verified profile first; the backend then creates an order before a payment provider checkout is opened.`)
  }
  const profileCards = profiles.length ? profiles.map((profile, index) => ({ ...profile, tone: ['rose', 'olive', 'sand'][index % 3] })) : demoProfiles

  return (
    <main>
      <div className="topline">குரும்ப கவுண்டர் குடும்பங்களுக்கான நம்பிக்கையான அறிமுகம் · Tamil Nadu</div>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Kurumba Gounder Legacy Matrimony home"><BrandLockup /></a>
        <nav aria-label="Primary navigation"><a href="#locations">Locations</a><a href="#how-it-works">How it works</a><a href="#membership">Membership</a></nav>
        <a className="button button-dark header-cta" href="#register">Create profile <span>↗</span></a>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy"><p className="eyebrow">உறவுகள் இணையும் இடம்</p><h1>Shared heritage.<br /><em>Chosen</em> with care.</h1><p className="hero-text">A private, respectful matrimonial space for Kurumba Gounder members and families—designed around choice, verification and mutual consent.</p><div className="hero-actions"><a className="button button-coral" href="#register">Create your profile <span>→</span></a><a className="text-link" href="#how-it-works">See the process <span>↓</span></a></div><div className="trust-row"><span className="trust-icon">✦</span><p><strong>Contact privacy by default</strong><br />Your phone number is never shown in profile results.</p></div></div>
        <div className="hero-art" aria-label="Abstract Tamil wedding and kolam illustration"><div className="sun-disc"/><div className="arch arch-back"/><div className="arch arch-front"><span className="kolam one">✧</span><span className="kolam two">✦</span><span className="kolam three">✧</span><div className="couple-card"><img src="/legacy-mark.svg" alt="" /><span>புதிய தொடக்கம்</span><strong>Two families.<br />One considered step.</strong><i>◌</i></div></div><p className="art-caption">Kurumba Gounder Legacy</p></div>
      </section>

      <section className="looking-for section" aria-labelledby="looking-title"><div className="looking-title"><p className="eyebrow">உங்கள் தேர்வு · Your choice</p><h2 id="looking-title">Who are you looking for?</h2><p>Choose a path to begin. You can change this at any time—every introduction remains private until both people agree.</p></div><div className="choice-grid"><button className={`choice-card ${search.looking === 'Bride' ? 'selected' : ''}`} type="button" onClick={() => setSearch({ ...search, looking: 'Bride' })} aria-pressed={search.looking === 'Bride'}><img src="https://images.unsplash.com/photo-1640745691934-1403879c3ae6?auto=format&fit=crop&w=1200&q=85" alt="Illustrative traditional Indian bridal portrait" /><span className="choice-wash"/><span className="choice-content"><small>பெண் · Bride</small><strong>Looking for a bride</strong><em>View respectful profile introductions <b>→</b></em></span></button><button className={`choice-card ${search.looking === 'Groom' ? 'selected' : ''}`} type="button" onClick={() => setSearch({ ...search, looking: 'Groom' })} aria-pressed={search.looking === 'Groom'}><img src="https://images.unsplash.com/photo-1724857457968-351e2e4b252a?auto=format&fit=crop&w=1200&q=85" alt="Illustrative traditional Indian groom portrait" /><span className="choice-wash"/><span className="choice-content"><small>ஆண் · Groom</small><strong>Looking for a groom</strong><em>View respectful profile introductions <b>→</b></em></span></button></div><p className="image-credit">Illustrative stock visuals from <a href="https://unsplash.com/" target="_blank" rel="noreferrer">Unsplash</a>; they are not member profiles or an endorsement by any community.</p></section>

      <section className="locations section" id="locations"><div className="locations-heading"><div><p className="eyebrow">தமிழ்நாடு முழுவதும் · Across Tamil Nadu</p><h2>Choose the place<br /><em>that feels close to home.</em></h2></div><p>Every one of Tamil Nadu’s 38 districts is included. Tap a district to set your preferred location for the match search.</p></div><div className="region-grid">{locationRegions.map((region) => <article className="region-card" key={region.name}><img src={region.image} alt={`Illustrative landscape for ${region.name}`} /><div className="region-shade"/><div className="region-title"><small>{region.tamil}</small><h3>{region.name}</h3></div><div className="district-chips">{region.districts.map((district) => <button className={search.location === district ? 'active' : ''} type="button" onClick={() => setSearch({ ...search, location: district })} key={district}>{district}</button>)}</div></article>)}</div><div className="location-summary"><span>✓</span><p><strong>{search.location === 'Tamil Nadu' ? 'Tamil Nadu — all districts' : search.location}</strong> is currently selected for your search.</p><a href="#find-match">Continue to matching <span>→</span></a></div><p className="location-source">District list based on the <a href="https://tndistricts.nic.in/" target="_blank" rel="noreferrer">Government of Tamil Nadu district portal</a>. Location photographs are illustrative Unsplash stock images.</p></section>

      <section className="search-shell" id="find-match" aria-labelledby="search-title"><div><p className="eyebrow">Find introductions</p><h2 id="search-title">Begin with what matters.</h2></div><form className="search-form" onSubmit={submitSearch}><label>I am looking for<select name="looking" value={search.looking} onChange={updateSearch}><option value="Bride">பெண் · Bride</option><option value="Groom">ஆண் · Groom</option></select></label><label>Preferred location<select name="location" value={search.location} onChange={updateSearch}><option value="Tamil Nadu">Tamil Nadu — all districts</option>{tamilNaduDistricts.map((district) => <option value={district} key={district}>{district}</option>)}</select></label><label>Age preference<select name="age" value={search.age} onChange={updateSearch}><option>24–30</option><option>28–34</option><option>30–36</option></select></label><button className="button button-dark" type="submit">Explore profiles <span>→</span></button></form></section>

      {notice && <div className="notice" role="status"><span>✦</span>{notice}<button onClick={() => setNotice('')} aria-label="Dismiss message">×</button></div>}

      <section className="intro section" id="discover"><div className="section-label"><span>01</span> A private space, not a public directory</div><div className="intro-grid"><h2>Details given with trust.<br /><em>Introductions made with consent.</em></h2><div><p>Members give their details through a controlled profile form. The backend stores only the data needed for the service; public results deliberately exclude mobile numbers, private family information and identity documents.</p><a className="text-link" href="#register">Register safely <span>→</span></a></div></div><div className="value-grid"><article><span>◈</span><h3>Profile workflow</h3><p>Details are saved as pending until mobile verification and moderator review are complete.</p></article><article><span>◌</span><h3>Family participation</h3><p>A future family-representative permission can be scoped to one member profile only.</p></article><article><span>⌁</span><h3>Safe contact hand-off</h3><p>Interest requests come first. Contact sharing is a separate, mutual decision.</p></article></div></section>

      <section className="heritage section" id="heritage"><div className="heritage-heading"><div><p className="eyebrow">Roots, respectfully presented</p><h2>A living heritage, not a single story.</h2></div><p>This page offers context for a matrimonial service—not a definitive account of every Kurumba or Kurumba Gounder family's history.</p></div><div className="heritage-grid"><figure className="heritage-photo"><img src="https://upload.wikimedia.org/wikipedia/commons/9/93/Tea_Monarch_Aramby_Ooty_Nilgiris_Mar21_A7C_00293.jpg" alt="Tea plantation between Ooty and Aramby Shola in the Nilgiris" /><figcaption>Nilgiris landscape · Photo by Timothy A. Gonsalves · <a href="https://commons.wikimedia.org/wiki/File:Tea_Monarch_Aramby_Ooty_Nilgiris_Mar21_A7C_00293.jpg" target="_blank" rel="noreferrer">CC BY-SA 4.0</a></figcaption></figure><article className="heritage-copy"><span className="heritage-knot">✦</span><h3>What public cultural records show</h3><p>The Government of Tamil Nadu’s Tribal Research Centre in Udhagamandalam says its museum was created to preserve tribal cultural heritage. Its displays include Alu Kurumba and Mullu Kurumba house models, Urali Kurumba material culture, Kurumba paintings and rock-honey extraction implements.</p><p>That record is a useful cultural reference for the Nilgiris, but it also shows why the website should avoid claiming that every Kurumba-related group has one identical history, worship practice or identity. Every member can describe their own family and values in their profile.</p><div className="source-links"><a href="https://tntrc.org.in/museum" target="_blank" rel="noreferrer">Tamil Nadu Tribal Research Centre <span>↗</span></a><a href="https://adikalakar.tribal.gov.in/ViewDashDetails.aspx?id=MTQ1" target="_blank" rel="noreferrer">National Tribal Art & Culture Portal <span>↗</span></a></div></article></div><div className="heritage-notes"><article><span>01</span><h3>Nilgiris cultural record</h3><p>The state museum documents Kurumba material culture, paintings and practical heritage in the Nilgiris.</p></article><article><span>02</span><h3>Art with attribution</h3><p>The site uses an openly licensed Nilgiris image and gives visible author and license credit.</p></article><article><span>03</span><h3>Family-led description</h3><p>A profile should let each member state their own traditions and preferences—never assign them automatically.</p></article></div></section>

      <section className="profiles section"><div className="profiles-heading"><div><p className="eyebrow">New introductions</p><h2>Profiles, shown with dignity.</h2></div><p>{profiles.length ? 'Live local-development profiles. Phone numbers and private details are not exposed.' : 'Fictional sample cards use illustrative stock portraits until the backend receives approved profiles.'}</p></div><div className="profile-grid">{profileCards.slice(0, 3).map((profile, index) => <article className={`profile-card ${profile.tone}`} key={profile.id}><div className="profile-portrait">{profile.photo ? <img src={profile.photo} alt={profile.photoAlt || 'Illustrative profile portrait'} /> : <span>{index === 0 ? '✦' : index === 1 ? '◈' : '◌'}</span>}<div className="portrait-shade"/><small>{profile.verificationStatus === 'sample' ? 'Illustrative sample · not a member' : 'Pending verification'}</small></div><div className="profile-details"><h3>{profile.firstName}, {profile.age}</h3><p>{profile.occupation} · {profile.city}</p><button onClick={() => setNotice('To request an interest, a member signs in. The backend will record the request without revealing either phone number.')} >Request introduction <span>→</span></button></div></article>)}</div><p className="profile-image-note">Portraits above are illustrative stock images only. Approved members control their own profile image and details after verification.</p></section>

      <section className="process section" id="how-it-works"><div className="process-top"><div><p className="eyebrow">How it works</p><h2>Every stage has a reason.</h2></div><p>Good matchmaking is more than a form. The product should make privacy, choice and human support visible at each moment.</p></div><div className="journey-grid">{journey.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>

      <section className="consent section"><div className="consent-art"><img src="https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=88" alt="Illustrative wedding couple photograph" /><div className="consent-photo-wash"/><div className="consent-orbit orbit-a"/><div className="consent-orbit orbit-b"/><span>✓</span><small>Illustrative photograph</small></div><div><p className="eyebrow">Your privacy is the promise</p><h2>Phone details are not a profile field for others to see.</h2><p>The backend saves a one-way hash of the submitted mobile number and never sends it through the public profiles API. In a production system, OTP verification, authenticated accounts and encrypted contact storage must be added before launch.</p><a className="button button-outline" href="#register">Read the registration flow <span>→</span></a></div></section>

      <section className="membership section" id="membership"><div className="membership-copy"><p className="eyebrow">Straightforward membership</p><h2>Pay only when you are ready to connect.</h2><p>The API now creates a membership-order record. Before launch, connect Razorpay or Cashfree for hosted checkout and signed webhook verification.</p><ul><li>✓ No card or UPI details stored by this website</li><li>✓ Order stays pending until a provider webhook verifies it</li><li>✓ Invoice and expiry records belong to the authenticated profile</li></ul></div><div className="plan-card"><span className="plan-badge">Most chosen</span><p>Membership preview</p><h3>{plan}</h3><strong>{plan === 'Classic' ? '₹1,999' : '₹3,499'} <small>/ {plan === 'Classic' ? '3 months' : '6 months'}</small></strong><div className="plan-options"><button className={plan === 'Classic' ? 'active' : ''} onClick={() => selectPlan('Classic')}>Classic<br /><small>3 months</small></button><button className={plan === 'Assisted' ? 'active' : ''} onClick={() => selectPlan('Assisted')}>Assisted<br /><small>6 months</small></button></div><button className="button button-coral full" onClick={() => selectPlan(plan)}>Create order securely <span>→</span></button><small className="plan-note">Payment is intentionally not live in this prototype. Never activate a membership from a browser-only “success” message.</small></div></section>

      <section className="join section registration-section" id="register"><p className="eyebrow">Create a private profile</p><h2>Tell us only what<br /><em>helps an introduction.</em></h2><p>All fields marked below are used to prepare a profile. This development form saves to your local backend; do not use a real personal number until real OTP, authentication and legal policies are connected.</p><form className="registration-form" onSubmit={submitRegistration}><label>First name / பெயர்<input required name="firstName" value={registration.firstName} onChange={updateRegistration} placeholder="Your first name" /></label><label>Age / வயது<input required name="age" min="18" max="99" type="number" value={registration.age} onChange={updateRegistration} placeholder="25" /></label><label>Your profile / உங்கள் விவரம்<select name="gender" value={registration.gender} onChange={updateRegistration}><option value="Bride">பெண் · Bride</option><option value="Groom">ஆண் · Groom</option></select></label><label>Looking for / தேடுவது<select name="lookingFor" value={registration.lookingFor} onChange={updateRegistration}><option value="Groom">ஆண் · Groom</option><option value="Bride">பெண் · Bride</option></select></label><label>City / district<select required name="city" value={registration.city} onChange={updateRegistration}><option value="" disabled>Select your district</option>{tamilNaduDistricts.map((district) => <option value={district} key={district}>{district}</option>)}</select></label><label>Occupation<input required name="occupation" value={registration.occupation} onChange={updateRegistration} placeholder="Your occupation" /></label><label className="wide">Mobile number <input required name="phone" inputMode="numeric" value={registration.phone} onChange={updateRegistration} placeholder="Used only for future verification" /></label><label className="wide">A little about yourself<textarea required name="about" value={registration.about} onChange={updateRegistration} placeholder="Education, interests and what you value in a partner" /></label><label className="consent-check wide"><input required name="consent" checked={registration.consent} onChange={updateRegistration} type="checkbox" /><span>I am 18+ and consent to this private profile being created. I understand contact details will not be shared without my explicit approval.</span></label><button className="button button-coral form-submit wide" disabled={submitting} type="submit">{submitting ? 'Saving profile…' : 'Save private profile'} <span>→</span></button></form></section>

      <footer><a className="brand" href="#home"><BrandLockup /></a><p>Kurumba Gounder Legacy · Respectful, consent-first matchmaking.</p><div><a href="#locations">Locations</a><a href="#membership">Membership</a><a href="#register">Support</a></div></footer>
    </main>
  )
}

export default App
