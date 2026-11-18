import { useMemo, useState } from 'react'

const localToken = typeof window !== 'undefined' && ['127.0.0.1', 'localhost'].includes(window.location.hostname) ? 'local-super-admin' : ''

function AdminDashboard() {
  const [token, setToken] = useState(() => localStorage.getItem('kgm-super-admin-token') || localToken)
  const [queue, setQueue] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const request = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', 'x-super-admin-token': token, ...(options.headers || {}) },
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'The dashboard could not complete that action.')
    return data
  }

  const loadQueue = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await request('/api/admin/review-queue')
      localStorage.setItem('kgm-super-admin-token', token)
      setQueue(data)
    } catch (err) {
      setQueue(null)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const reviewProfile = async (profileId, decision) => {
    try {
      const data = await request(`/api/admin/profiles/${profileId}/review`, { method: 'POST', body: JSON.stringify({ decision }) })
      setNotice(data.message)
      await loadQueue()
    } catch (err) { setError(err.message) }
  }

  const updateMatch = async (reviewId, action) => {
    try {
      const data = await request(`/api/admin/match-reviews/${reviewId}/action`, { method: 'POST', body: JSON.stringify({ action }) })
      setNotice(data.contact ? `Contact reveal approved: ${data.contact.profileA.name} and ${data.contact.profileB.name}.` : 'Super Admin action saved.')
      await loadQueue()
    } catch (err) { setError(err.message) }
  }

  const stats = useMemo(() => ({
    profiles: queue?.pendingProfiles?.length || 0,
    matches: queue?.matchReviews?.filter((item) => item.status === 'pending-super-admin-review').length || 0,
    ready: queue?.matchReviews?.filter((item) => item.status === 'ready-for-contact-reveal').length || 0,
  }), [queue])

  return <main className="admin-shell">
    <header className="admin-header">
      <a href="/" className="admin-brand"><img src="/kudumbam-logo.svg" alt="Kurumba Gounder Matrimony" /></a>
      <div><p>SUPER ADMIN</p><h1>Private introduction review</h1></div>
      <a className="admin-home" href="/">Public site ↗</a>
    </header>
    <section className="admin-access">
      <div><p className="admin-kicker">Secure access</p><h2>Review profiles. Approve introductions. Protect contact details.</h2><p>This dashboard has no public link. Set <code>SUPER_ADMIN_TOKEN</code> in Vercel before using it in production.</p></div>
      <form onSubmit={(event) => { event.preventDefault(); loadQueue() }}>
        <label>Super Admin token<input type="password" value={token} onChange={(event) => setToken(event.target.value)} autoComplete="current-password" /></label>
        <button type="submit" disabled={!token || loading}>{loading ? 'Loading…' : 'Open review queue'}</button>
      </form>
    </section>
    {error && <p className="admin-message admin-error">{error}</p>}
    {notice && <p className="admin-message admin-notice">{notice}</p>}
    {queue && <>
      <section className="admin-stats" aria-label="Review queue summary"><article><strong>{stats.profiles}</strong><span>Profiles awaiting verification</span></article><article><strong>{stats.matches}</strong><span>Matches awaiting approval</span></article><article><strong>{stats.ready}</strong><span>Ready for contact reveal</span></article></section>
      <section className="admin-section"><div className="admin-section-heading"><p className="admin-kicker">Profile verification</p><h2>New family registrations</h2><p>Photo and horoscope files are private. Verify the details before enabling smart matching.</p></div>
        <div className="admin-grid">{queue.pendingProfiles.length === 0 ? <p className="admin-empty">No pending profiles right now.</p> : queue.pendingProfiles.map((profile) => <article className="admin-card" key={profile.id}><span className="admin-badge">Pending verification</span><h3>{profile.firstName}, {profile.age}</h3><p>{profile.gender} · Looking for {profile.lookingFor} · {profile.profileFor}</p><dl><div><dt>District</dt><dd>{profile.city}</dd></div><div><dt>Education</dt><dd>{profile.education || 'Not added'}</dd></div><div><dt>Work</dt><dd>{profile.occupation}</dd></div><div><dt>Mobile</dt><dd>•••• {profile.phoneLast4}</dd></div><div><dt>Profile photo</dt><dd>{profile.photoUrl ? 'Uploaded' : 'Not uploaded'}</dd></div><div><dt>ஜாதகம்</dt><dd>{profile.horoscopeUrl ? 'Private document uploaded' : 'Not uploaded'}</dd></div></dl><div className="admin-actions"><button onClick={() => reviewProfile(profile.id, 'approve')}>Approve profile</button><button className="admin-reject" onClick={() => reviewProfile(profile.id, 'reject')}>Reject</button></div></article>)}</div>
      </section>
      <section className="admin-section admin-matches"><div className="admin-section-heading"><p className="admin-kicker">Explainable smart matching</p><h2>Super Admin match queue</h2><p>Every recommendation is based on mutual profile type, age, education, occupation, income, rasi and nakshatram preferences. A ஜாதகம் document is for private human review—not automated prediction.</p></div>
        <div className="admin-match-list">{queue.matchReviews.length === 0 ? <p className="admin-empty">Approved profiles will create match reviews here.</p> : queue.matchReviews.map((review) => <article className="match-review" key={review.id}><div className="match-review-top"><span className="admin-badge">{review.status.replaceAll('-', ' ')}</span><strong>{review.score}% criteria alignment</strong></div><h3>{review.profileA.firstName} <span>↔</span> {review.profileB.firstName}</h3><p className="match-meta">{review.profileA.city} · {review.profileA.education || review.profileA.occupation} &nbsp; / &nbsp; {review.profileB.city} · {review.profileB.education || review.profileB.occupation}</p><ul>{review.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>{review.warnings?.length > 0 && <p className="match-warning">{review.warnings.join(' ')}</p>}<p className="match-horoscope">ஜாதகம் status: {review.horoscopeStatus.replaceAll('-', ' ')}</p><div className="admin-actions">{review.status === 'pending-super-admin-review' && <><button onClick={() => updateMatch(review.id, 'approve-match')}>Approve match</button><button className="admin-reject" onClick={() => updateMatch(review.id, 'reject-match')}>Reject match</button></>}{review.status === 'admin-approved-awaiting-family-consent' && <button onClick={() => updateMatch(review.id, 'confirm-family-consents')}>Confirm both family consents</button>}{review.status === 'ready-for-contact-reveal' && <button onClick={() => updateMatch(review.id, 'reveal-contacts')}>Reveal contacts</button>}{review.status === 'introduction-approved' && <span className="admin-done">Contact reveal approved by Super Admin</span>}</div></article>)}</div>
      </section>
      {!queue.whatsappConfigured && <aside className="whatsapp-empty"><strong>WhatsApp is empty by design.</strong><span>Add the new business number and `WHATSAPP_BUSINESS_CHAT_LINK` later; no chat link or automated alert is active now.</span></aside>}
    </>}
  </main>
}

export default AdminDashboard
