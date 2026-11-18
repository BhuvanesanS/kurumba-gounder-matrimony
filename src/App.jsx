import { useEffect, useMemo, useState } from 'react'
import './App.css'

const initialProfile = {
  firstName: '', age: '', gender: 'Bride', lookingFor: 'Groom', city: '', kulam: '',
  nakshatram: '', rasi: '', education: '', income: '', occupation: '', phone: '', about: '', consent: false,
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
  return <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
}

function Field({ label, children, hint }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>
}

function App() {
  const [filters, setFilters] = useState({ lookingFor: 'Bride', city: 'All Tamil Nadu', kulam: '' })
  const [profiles, setProfiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState(initialProfile)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notice, setNotice] = useState('')

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
      <div className="utility-bar"><p>Kurumba Gounder community matrimony</p><a href="#create-profile">Create a profile</a></div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Kurumba Gounder Matrimony home"><BrandMark /><span><strong>Kurumba Gounder</strong><small>Matrimony</small></span></a>
        <nav aria-label="Primary navigation"><a href="#how-it-works">How it works</a><a href="#profiles">Discover profiles</a><a href="#create-profile">Create profile</a><a href="#questions">Questions</a></nav>
        <a className="header-action" href="#create-profile">Begin here <span aria-hidden="true">→</span></a>
      </header>

      <div id="main-content">
        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="kicker">A respectful place to begin</p>
            <h1>For every family looking for a thoughtful <em>next chapter.</em></h1>
            <p className="hero-intro">A community-focused matrimony service for Kurumba Gounder families. Browse introductions with care, create a profile with consent, and take the next step only when it feels right.</p>
            <div className="hero-actions"><a className="button button-primary" href="#create-profile">Create a profile <span aria-hidden="true">→</span></a><a className="text-link" href="#how-it-works">How the process works <span aria-hidden="true">↓</span></a></div>
            <dl className="hero-notes"><div><dt>Private by design</dt><dd>Mobile numbers do not appear on profile cards.</dd></div><div><dt>Community-led</dt><dd>Built around an introduction, not an open directory.</dd></div></dl>
          </div>
          <div className="hero-composition" aria-label="Decorative heritage pattern">
            <div className="arch arch-one" /><div className="arch arch-two" /><div className="heritage-card"><p>புதிய தொடக்கம்</p><strong>A considered<br />introduction.</strong><span>Kurumba Gounder Matrimony</span></div><div className="sun" />
          </div>
        </section>

        <section className="quick-start" aria-labelledby="quick-start-title">
          <div><p className="kicker">Start with a simple search</p><h2 id="quick-start-title">Find an introduction that feels closer to home.</h2></div>
          <form onSubmit={searchProfiles}>
            <Field label="Looking for"><select name="lookingFor" value={filters.lookingFor} onChange={updateFilter}><option value="Bride">A bride</option><option value="Groom">A groom</option></select></Field>
            <Field label="Preferred location"><select name="city" value={filters.city} onChange={updateFilter}>{districts.map((district) => <option key={district}>{district}</option>)}</select></Field>
            <button className="button button-dark" type="submit">Explore profiles <span aria-hidden="true">→</span></button>
          </form>
        </section>

        <section className="commitments section" id="how-it-works">
          <div className="section-heading"><p className="kicker">A calmer way to search</p><h2>Every step keeps people, families, and consent in view.</h2><p>Good introductions need enough context to be useful and enough privacy to feel safe. This is the balance the experience is built around.</p></div>
          <div className="commitment-grid">{commitments.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
        </section>

        <section className="profile-browser section" id="profiles" aria-labelledby="profiles-title">
          <div className="browser-heading"><div><p className="kicker">Community introductions</p><h2 id="profiles-title">Profiles, presented with dignity.</h2></div><p>Only profile details intended for discovery are shown here. Direct contact remains private.</p></div>
          <form className="filter-bar" onSubmit={searchProfiles}>
            <Field label="Looking for"><select name="lookingFor" value={filters.lookingFor} onChange={updateFilter}><option value="Bride">Bride</option><option value="Groom">Groom</option></select></Field>
            <Field label="District"><select name="city" value={filters.city} onChange={updateFilter}>{districts.map((district) => <option key={district}>{district}</option>)}</select></Field>
            <Field label="Kulam (optional)"><input name="kulam" value={filters.kulam} onChange={updateFilter} placeholder="Enter a Kulam" /></Field>
            <button className="button button-outline" type="submit">Update results</button>
          </form>
          <div className="profile-grid" aria-live="polite">
            {isLoading && <p className="empty-state">Loading community introductions…</p>}
            {!isLoading && displayedProfiles.map((candidate, index) => <article className="profile-card" key={candidate.id}><div className={`profile-avatar avatar-${index % 3}`} aria-hidden="true">{candidate.firstName?.slice(0, 1) || 'K'}</div><div className="profile-card-top"><span>{candidate.verificationStatus === 'verified' ? 'Reviewed profile' : 'New introduction'}</span><small>{candidate.gender}</small></div><h3>{candidate.firstName}, {candidate.age}</h3><p className="profile-role">{candidate.education || candidate.occupation || 'Community member'}</p><dl><div><dt>Location</dt><dd>{candidate.city || 'Tamil Nadu'}</dd></div><div><dt>Kulam</dt><dd>{candidate.kulam || 'Not shared'}</dd></div>{candidate.nakshatram && <div><dt>Star</dt><dd>{candidate.nakshatram}</dd></div>}</dl><button type="button" className="card-action" onClick={() => setNotice(`An introduction request for ${candidate.firstName} can be coordinated after both families consent.`)}>Request an introduction <span aria-hidden="true">→</span></button></article>)}
            {!isLoading && displayedProfiles.length === 0 && <p className="empty-state">No introductions match these filters yet. Try another district or create a profile to begin.</p>}
          </div>
        </section>

        <section className="process-panel section"><div className="process-panel-copy"><p className="kicker">Made for a serious decision</p><h2>Useful details. Clear boundaries. A human next step.</h2><p>Compatibility is personal. The platform gives families a respectful way to start, rather than making promises it cannot keep.</p><a className="button button-light" href="#create-profile">Start your profile <span aria-hidden="true">→</span></a></div><div className="process-list">{profileSteps.map(([key, title, text]) => <div key={key}><span>{key}</span><section><h3>{title}</h3><p>{text}</p></section></div>)}</div></section>

        <section className="registration section" id="create-profile" aria-labelledby="registration-title">
          <div className="registration-intro"><p className="kicker">Create a profile</p><h2 id="registration-title">Begin with the details you are comfortable sharing.</h2><p>Required fields are marked. Your phone number is used for profile review and is never placed on the public profile card.</p><div className="privacy-note"><strong>Privacy note</strong><span>By submitting, you confirm that you have permission to share these details for a matrimonial introduction.</span></div></div>
          <form className="registration-form" onSubmit={submitProfile}>
            <div className="form-grid"><Field label="First name *"><input name="firstName" value={profile.firstName} onChange={updateProfile} required autoComplete="given-name" /></Field><Field label="Age *"><input name="age" type="number" min="18" max="99" value={profile.age} onChange={updateProfile} required /></Field><Field label="Profile for *"><select name="gender" value={profile.gender} onChange={updateProfile}><option value="Bride">Bride</option><option value="Groom">Groom</option></select></Field><Field label="Looking for *"><select name="lookingFor" value={profile.lookingFor} onChange={updateProfile}><option value="Groom">Groom</option><option value="Bride">Bride</option></select></Field><Field label="City or district *"><input name="city" value={profile.city} onChange={updateProfile} required autoComplete="address-level2" /></Field><Field label="Mobile number *" hint="For profile review only"><input name="phone" inputMode="numeric" type="tel" value={profile.phone} onChange={updateProfile} required autoComplete="tel" /></Field><Field label="Education"><input name="education" value={profile.education} onChange={updateProfile} /></Field><Field label="Occupation *"><input name="occupation" value={profile.occupation} onChange={updateProfile} required /></Field><Field label="Kulam"><input name="kulam" value={profile.kulam} onChange={updateProfile} /></Field><Field label="Nakshatram"><input name="nakshatram" value={profile.nakshatram} onChange={updateProfile} /></Field></div><Field label="A brief introduction *" hint="Do not include phone numbers, home address, or other contact details."><textarea name="about" rows="4" value={profile.about} onChange={updateProfile} required /></Field><label className="consent"><input name="consent" type="checkbox" checked={profile.consent} onChange={updateProfile} required /><span>I am 18 or older and I consent to this profile being reviewed for matrimonial introductions.</span></label><button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Sending profile…' : 'Send for profile review'} <span aria-hidden="true">→</span></button></form>
        </section>

        <section className="questions section" id="questions"><div className="section-heading"><p className="kicker">Questions, answered simply</p><h2>Before you begin.</h2></div><div className="faq-list"><details><summary>Who can create a profile?</summary><p>Adults can create a profile for themselves or a family member when they have permission to share the information.</p></details><details><summary>Will my contact number be public?</summary><p>No. The public profile endpoint intentionally excludes mobile numbers. An introduction should happen only after consent.</p></details><details><summary>Does a profile guarantee a match?</summary><p>No. Matrimonial decisions are personal. The service helps families begin a thoughtful discovery process; it does not guarantee an outcome.</p></details></div></section>
      </div>

      <footer><a className="brand" href="#top"><BrandMark /><span><strong>Kurumba Gounder</strong><small>Matrimony</small></span></a><p>Thoughtful introductions for the community.</p><div><a href="#how-it-works">How it works</a><a href="#create-profile">Create profile</a><a href="#questions">Privacy & questions</a></div></footer>
      {notice && <div className="notice" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Dismiss message">×</button></div>}
    </main>
  )
}

export default App
