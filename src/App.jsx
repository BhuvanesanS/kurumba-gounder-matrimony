import { useEffect, useMemo, useState } from 'react'

const initialProfile = {
  firstName: '', age: '', gender: 'Bride', lookingFor: 'Groom', city: '', kulam: '',
  nakshatram: '', rasi: '', education: '', income: '', occupation: '', phone: '', about: '',
  familyType: '', expectedEducation: '', expectedMinIncome: '', expectedMaxIncome: '', expectedRasi: '', expectedNakshatram: '', photoDataUrl: '', consent: false,
}

const districts = ['All Tamil Nadu', 'Chennai', 'Coimbatore', 'Erode', 'Tiruppur', 'Salem', 'Namakkal', 'Karur', 'Tiruchirappalli', 'Madurai', 'Thanjavur', 'Tirunelveli', 'Vellore']

const commitments = [
  ['01', 'Family-first introductions', 'Start a profile for yourself or someone you represent. The experience is designed for a considered conversation, not public exposure.'],
  ['02', 'Profile review before discovery', 'New profiles enter a review queue so details can be completed carefully before families explore an introduction.'],
  ['03', 'Contact details stay private', 'Mobile numbers are not displayed in profile cards. An introduction should be requested with consent.'],
]

const profileSteps = [
  ['A', 'Tell us the basics', 'A few details help families find an appropriate starting point.'],
  ['B', 'Add the details that matter', 'Education, location, and optional family preferences create a fuller picture.'],
  ['C', 'Review before you connect', 'The community team can complete the profile before any introduction is considered.'],
]

function BrandMark() {
  return <img className="brand-logo" src="/kudumbam-logo.svg" alt="குடும்பம் Matrimony" />
}

function Field({ label, children, hint }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>
}

function App() {
  const [language, setLanguage] = useState(() => localStorage.getItem('kgm-language'))
  const [filters, setFilters] = useState({ lookingFor: 'Bride', city: 'All Tamil Nadu', kulam: '' })
  const [profiles, setProfiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState(initialProfile)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notice, setNotice] = useState('')

  const isTamil = language !== 'en'
  const text = (tamil, english) => isTamil ? tamil : english
  const chooseLanguage = (nextLanguage) => {
    localStorage.setItem('kgm-language', nextLanguage)
    document.documentElement.lang = nextLanguage === 'ta' ? 'ta' : 'en'
    setLanguage(nextLanguage)
  }
  const openLanguageChoice = () => {
    localStorage.removeItem('kgm-language')
    setLanguage(null)
  }

  const loadProfiles = async (nextFilters = filters) => {
    setIsLoading(true)
    try {
      const query = new URLSearchParams({ lookingFor: nextFilters.lookingFor })
      if (nextFilters.city !== 'All Tamil Nadu') query.set('city', nextFilters.city)
      if (nextFilters.kulam.trim()) query.set('kulam', nextFilters.kulam.trim())
      const response = await fetch(`/api/profiles?${query.toString()}`)
      if (!response.ok) throw new Error('Unable to load profiles right now.')
      const data = await response.json()
      setProfiles(data.profiles || [])
    } catch (error) {
      setNotice(error.message || 'Unable to load profiles right now.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadProfiles() }, [])

  const displayedProfiles = useMemo(() => profiles.slice(0, 6), [profiles])
  const updateFilter = (event) => setFilters((current) => ({ ...current, [event.target.name]: event.target.value }))
  const searchProfiles = (event) => {
    event.preventDefault()
    loadProfiles(filters)
    document.querySelector('#profiles')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const updateProfile = (event) => {
    const { name, value, checked, type } = event.target
    setProfile((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }
  const uploadPhoto = (event) => {
    const [file] = event.target.files || []
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 1_500_000) {
      setNotice('Please choose a JPG, PNG, or WebP photo smaller than 1.5 MB.')
      event.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => setProfile((current) => ({ ...current, photoDataUrl: String(reader.result || '') }))
    reader.readAsDataURL(file)
  }
  const submitProfile = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setNotice('')
    try {
      const response = await fetch('/api/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'We could not receive the profile.')
      setProfile(initialProfile)
      setNotice(`Thank you. ${data.message || 'Your profile has entered the review queue.'}`)
    } catch (error) {
      setNotice(error.message || 'We could not receive the profile.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="utility-bar"><p>{text('குரும்ப கவுண்டர் குடும்பங்களுக்கான திருமண அறிமுகம்', 'Kurumba Gounder family matrimony')}</p><button className="language-switch" type="button" onClick={openLanguageChoice}>{isTamil ? 'தமிழ் / English' : 'English / தமிழ்'}</button><a href="#create-profile">{text('பதிவு செய்யுங்கள்', 'Create profile')}</a></div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Kudumbam Matrimony home"><BrandMark /></a>
        <nav aria-label="Primary navigation"><a href="#how-it-works">{text('எப்படி செயல்படும்', 'How it works')}</a><a href="#profiles">{text('வரன் / மணமகள்', 'Profiles')}</a><a href="#create-profile">{text('பதிவு செய்யுங்கள்', 'Create profile')}</a><a href="#questions">{text('உதவி', 'Help')}</a></nav>
        <a className="header-action" href="#create-profile">{text('தொடங்குங்கள்', 'Begin here')} <span aria-hidden="true">→</span></a>
      </header>

      <div id="main-content">
        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="kicker">{text('நம்பிக்கையான திருமண அறிமுகம்', 'A respectful matrimony introduction')}</p>
            <h1>{text('இரு மனங்கள். இரு குடும்பங்கள். ஒரு இனிய ', 'Two hearts. Two families. One meaningful ')}<em>{text('தொடக்கம்.', 'beginning.')}</em></h1>
            <p className="hero-intro">{text('குரும்ப கவுண்டர் குடும்பங்களுக்கான பாதுகாப்பான திருமண அறிமுகம். மணமகன் அல்லது மணமகள் விவரங்களைப் பாருங்கள்; குடும்ப சம்மதத்துடன் அடுத்த படியை எடுங்கள்.', 'A private matrimonial introduction for Kurumba Gounder families. Explore bride and groom profiles, then take the next step with family consent.')}</p>
            <div className="hero-actions"><a className="button button-primary" href="#create-profile">{text('வரன் / மணமகள் பதிவு', 'Create bride / groom profile')} <span aria-hidden="true">→</span></a><a className="text-link" href="#how-it-works">{text('எப்படி செயல்படும்?', 'How it works')} <span aria-hidden="true">↓</span></a></div>
            <dl className="hero-notes"><div><dt>{text('தனியுரிமை பாதுகாப்பு', 'Private by design')}</dt><dd>{text('மொபைல் எண் profile card-ல் காட்டப்படாது.', 'Mobile numbers do not appear on profile cards.')}</dd></div><div><dt>{text('குடும்ப மையம்', 'Family-first')}</dt><dd>{text('குடும்ப அறிமுகத்திற்காக உருவாக்கப்பட்டது.', 'Built around considered family introductions.')}</dd></div></dl>
          </div>
          <figure className="hero-composition">
            <img className="hero-photo" src="/wedding-thali-hero.png" alt="Illustrative Tamil wedding thali ceremony" />
            <div className="photo-wash" /><div className="arch arch-one" /><div className="arch arch-two" />
            <figcaption className="heritage-card"><p>புதிய தொடக்கம்</p><strong>ஒரு உறவு.<br />இரு குடும்பங்கள்.</strong><span>Illustrative wedding story · not a member profile</span></figcaption><div className="sun" />
          </figure>
        </section>

        <section className="quick-start" aria-labelledby="quick-start-title">
          <div><p className="kicker">{text('எளிய தேடல்', 'Start with a simple search')}</p><h2 id="quick-start-title">{text('உங்கள் குடும்பத்துக்கு ஏற்ற வரன் அல்லது மணமகளைத் தேடுங்கள்.', 'Find an introduction that feels closer to home.')}</h2></div>
          <form onSubmit={searchProfiles}>
            <Field label={text('நீங்கள் தேடுவது', 'Looking for')}><select name="lookingFor" value={filters.lookingFor} onChange={updateFilter}><option value="Bride">{text('மணமகள் (பெண்)', 'Bride')}</option><option value="Groom">{text('மணமகன் (ஆண்)', 'Groom')}</option></select></Field>
            <Field label={text('விருப்பமான மாவட்டம்', 'Preferred district')}><select name="city" value={filters.city} onChange={updateFilter}>{districts.map((district) => <option key={district}>{district}</option>)}</select></Field>
            <button className="button button-dark" type="submit">{text('விவரங்களைப் பாருங்கள்', 'Explore profiles')} <span aria-hidden="true">→</span></button>
          </form>
        </section>

        <section className="commitments section" id="how-it-works">
          <div className="section-heading"><p className="kicker">A calmer way to search</p><h2>Every step keeps people, families, and consent in view.</h2><p>Good introductions need enough context to be useful and enough privacy to feel safe. This is the balance the experience is built around.</p></div>
          <div className="commitment-grid">{commitments.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
        </section>

        <section className="editorial-section section" aria-labelledby="editorial-title">
          <div className="editorial-photos"><img src="/wedding-garland-story.png" alt="Illustrative Tamil wedding garland exchange with family" loading="lazy" /><div className="editorial-note"><span>For families</span><strong>Every meaningful relationship begins with a respectful introduction.</strong></div></div>
          <div className="editorial-copy"><p className="kicker">A wedding story, thoughtfully started</p><h2 id="editorial-title">Serious intentions deserve a respectful space.</h2><p>Profiles give families a clear starting point—location, education, values, and the details they choose to share—while each next conversation remains intentional.</p><a className="text-link" href="#create-profile">Create a profile for your family <span aria-hidden="true">→</span></a></div>
        </section>

        <section className="profile-browser section" id="profiles" aria-labelledby="profiles-title">
          <div className="browser-heading"><div><p className="kicker">சமூக திருமண அறிமுகங்கள்</p><h2 id="profiles-title">வரன் மற்றும் மணமகள் விவரங்கள்.</h2></div><p>தேடலுக்குத் தேவையான விவரங்கள் மட்டுமே இங்கே இருக்கும். தொடர்பு எண் தனிப்பட்டது.</p></div>
          <form className="filter-bar" onSubmit={searchProfiles}>
            <Field label="தேடுவது"><select name="lookingFor" value={filters.lookingFor} onChange={updateFilter}><option value="Bride">மணமகள் (பெண்)</option><option value="Groom">மணமகன் (ஆண்)</option></select></Field>
            <Field label="மாவட்டம்"><select name="city" value={filters.city} onChange={updateFilter}>{districts.map((district) => <option key={district}>{district}</option>)}</select></Field>
            <Field label="குலம் (விருப்பம்)"><input name="kulam" value={filters.kulam} onChange={updateFilter} placeholder="குலம் எழுதுங்கள்" /></Field>
            <button className="button button-outline" type="submit">தேடலை மாற்றுங்கள்</button>
          </form>
          <div className="profile-grid" aria-live="polite">
            {isLoading && <p className="empty-state">திருமண அறிமுகங்கள் ஏற்றப்படுகின்றன…</p>}
            {!isLoading && displayedProfiles.map((candidate, index) => <article className="profile-card" key={candidate.id}><div className={`profile-avatar avatar-${index % 3}`} aria-hidden="true">{candidate.firstName?.slice(0, 1) || 'K'}</div><div className="profile-card-top"><span>{candidate.verificationStatus === 'verified' ? 'சரிபார்க்கப்பட்ட விவரம்' : 'புதிய அறிமுகம்'}</span><small>{candidate.gender === 'Bride' ? 'மணமகள் (பெண்)' : 'மணமகன் (ஆண்)'}</small></div><h3>{candidate.firstName}, {candidate.age}</h3><p className="profile-role">{candidate.education || candidate.occupation || 'சமூக உறுப்பினர்'}</p><dl><div><dt>இடம்</dt><dd>{candidate.city || 'தமிழ்நாடு'}</dd></div><div><dt>குலம்</dt><dd>{candidate.kulam || 'பகிரப்படவில்லை'}</dd></div>{candidate.nakshatram && <div><dt>நட்சத்திரம்</dt><dd>{candidate.nakshatram}</dd></div>}</dl><button type="button" className="card-action" onClick={() => setNotice(`${candidate.firstName} அவர்களின் விவரத்திற்கு இரு குடும்ப சம்மதத்துடன் அறிமுக கோரிக்கை செய்யலாம்.`)}>அறிமுகம் கோருங்கள் <span aria-hidden="true">→</span></button></article>)}
            {!isLoading && displayedProfiles.length === 0 && <p className="empty-state">No introductions match these filters yet. Try another district or create a profile to begin.</p>}
          </div>
        </section>

        <section className="process-panel section"><div className="process-panel-copy"><p className="kicker">Made for a serious decision</p><h2>Useful details. Clear boundaries. A human next step.</h2><p>Compatibility is personal. The platform gives families a respectful way to start, rather than making promises it cannot keep.</p><a className="button button-light" href="#create-profile">Start your profile <span aria-hidden="true">→</span></a></div><div className="process-list">{profileSteps.map(([key, title, text]) => <div key={key}><span>{key}</span><section><h3>{title}</h3><p>{text}</p></section></div>)}</div></section>

        <section className="registration section" id="create-profile" aria-labelledby="registration-title">
          <div className="registration-intro"><p className="kicker">Create a profile</p><h2 id="registration-title">Begin with the details you are comfortable sharing.</h2><p>Required fields are marked. Your phone number and profile photo are reviewed privately before a profile can be visible.</p><div className="privacy-note"><strong>Compatibility assistant</strong><span>Matches consider Kulam, age, location, rasi, nakshatram, education, income and stated expectations. It is a guide—not a promise or a replacement for family judgement.</span></div></div>
          <form className="registration-form" onSubmit={submitProfile}>
            <div className="form-grid"><Field label="First name *"><input name="firstName" value={profile.firstName} onChange={updateProfile} required autoComplete="given-name" /></Field><Field label="Age *"><input name="age" type="number" min="18" max="99" value={profile.age} onChange={updateProfile} required /></Field><Field label="Profile for *"><select name="gender" value={profile.gender} onChange={updateProfile}><option value="Bride">Bride</option><option value="Groom">Groom</option></select></Field><Field label="Looking for *"><select name="lookingFor" value={profile.lookingFor} onChange={updateProfile}><option value="Groom">Groom</option><option value="Bride">Bride</option></select></Field><Field label="City or district *"><input name="city" value={profile.city} onChange={updateProfile} required autoComplete="address-level2" /></Field><Field label="Mobile number *" hint="For profile review only"><input name="phone" inputMode="numeric" type="tel" value={profile.phone} onChange={updateProfile} required autoComplete="tel" /></Field><Field label="Education"><input name="education" value={profile.education} onChange={updateProfile} placeholder="e.g. B.E., B.Sc., MBA" /></Field><Field label="Occupation *"><input name="occupation" value={profile.occupation} onChange={updateProfile} required /></Field><Field label="Annual income"><input name="income" value={profile.income} onChange={updateProfile} placeholder="e.g. 8 LPA" /></Field><Field label="Family type"><select name="familyType" value={profile.familyType} onChange={updateProfile}><option value="">Prefer not to say</option><option>Nuclear family</option><option>Joint family</option></select></Field><Field label="Kulam"><input name="kulam" value={profile.kulam} onChange={updateProfile} /></Field><Field label="Rasi"><input name="rasi" value={profile.rasi} onChange={updateProfile} /></Field><Field label="Nakshatram"><input name="nakshatram" value={profile.nakshatram} onChange={updateProfile} /></Field><Field label="Expected education"><input name="expectedEducation" value={profile.expectedEducation} onChange={updateProfile} placeholder="e.g. Graduate, MBA" /></Field><Field label="Expected minimum income"><input name="expectedMinIncome" value={profile.expectedMinIncome} onChange={updateProfile} placeholder="e.g. 8 LPA" /></Field><Field label="Expected Rasi"><input name="expectedRasi" value={profile.expectedRasi} onChange={updateProfile} /></Field><Field label="Expected Nakshatram"><input name="expectedNakshatram" value={profile.expectedNakshatram} onChange={updateProfile} /></Field><Field label="Profile photo" hint="JPG, PNG, or WebP · Maximum 1.5 MB"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} />{profile.photoDataUrl && <img className="photo-preview" src={profile.photoDataUrl} alt="Selected profile preview" />}</Field></div><Field label="A brief introduction *" hint="Do not include phone numbers, home address, or other contact details."><textarea name="about" rows="4" value={profile.about} onChange={updateProfile} required /></Field><label className="consent"><input name="consent" type="checkbox" checked={profile.consent} onChange={updateProfile} required /><span>I am 18 or older and I consent to this profile being reviewed for matrimonial introductions.</span></label><button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Sending profile…' : 'Send for profile review'} <span aria-hidden="true">→</span></button></form>
        </section>

        <section className="membership section" id="membership" aria-labelledby="membership-title">
          <div className="membership-visual"><img src="/wedding-family-blessing.png" alt="Illustrative Tamil wedding family blessing" loading="lazy" /><div><span>குடும்பத்தின் நம்பிக்கை</span><strong>Private introductions.<br />Clear consent.</strong></div></div>
          <div className="membership-copy"><p className="kicker">Community membership</p><h2 id="membership-title">Begin your verified journey for <em>₹199.</em></h2><p>A simple membership can unlock profile review and guided interest requests. Payment is activated only after your profile is checked by the community team.</p><ul><li>Private profile review</li><li>Compatibility insights based on stated preferences</li><li>Consent-led introduction requests</li><li>WhatsApp updates only when you opt in</li></ul><a className="button button-primary" href="#create-profile">Create profile to begin <span aria-hidden="true">→</span></a></div>
        </section>

        <section className="connection-flow section" aria-labelledby="connection-title"><div className="section-heading"><p className="kicker">Interest and WhatsApp updates</p><h2 id="connection-title">A match is not shared until both sides agree.</h2><p>Family contact information remains private. The service should send only approved, template-based updates after consent.</p></div><div className="flow-grid"><article><span>01</span><h3>Request interest</h3><p>A member chooses a profile and writes a short, respectful interest request.</p></article><article><span>02</span><h3>Private review</h3><p>The other member or family sees the request inside their account before any number is disclosed.</p></article><article><span>03</span><h3>WhatsApp opt-in update</h3><p>After consent, an approved WhatsApp notification can invite both families to continue safely.</p></article></div></section>

        <section className="questions section" id="questions"><div className="section-heading"><p className="kicker">Questions, answered simply</p><h2>Before you begin.</h2></div><div className="faq-list"><details><summary>Who can create a profile?</summary><p>Adults can create a profile for themselves or a family member when they have permission to share the information.</p></details><details><summary>Will my contact number be public?</summary><p>No. The public profile endpoint intentionally excludes mobile numbers. An introduction should happen only after consent.</p></details><details><summary>Does a profile guarantee a match?</summary><p>No. Matrimonial decisions are personal. The service helps families begin a thoughtful discovery process; it does not guarantee an outcome.</p></details></div></section>
      </div>

      <footer><a className="brand" href="#top"><BrandMark /></a><p>Thoughtful introductions for the community.</p><div><a href="#how-it-works">How it works</a><a href="#create-profile">Create profile</a><a href="#questions">Privacy & questions</a></div></footer>
      {!language && <section className="language-gate" role="dialog" aria-modal="true" aria-labelledby="language-title"><div className="language-card"><img src="/kudumbam-logo.svg" alt="Kurumba Gounder Matrimony" /><p className="kicker">WELCOME · வணக்கம்</p><h2 id="language-title"><span lang="ta">உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்.</span><span className="language-title-english">Choose your preferred language.</span></h2><div className="language-options"><button type="button" onClick={() => chooseLanguage('ta')} lang="ta"><strong>தமிழ்</strong><small>Tamil</small></button><button type="button" onClick={() => chooseLanguage('en')}><strong>English</strong><small lang="ta">ஆங்கிலம்</small></button></div><p>மொழியை எப்போது வேண்டுமானாலும் மாற்றலாம்.<br />You can change it at any time.</p></div></section>}
      {notice && <div className="notice" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Dismiss message">×</button></div>}
    </main>
  )
}

export default App
