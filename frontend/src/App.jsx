import { useCallback, useEffect, useMemo, useState } from 'react'
import heroImg from './assets/hero.png'
import AdminPanel from './components/AdminPanel.jsx'
import RegisterForm from './components/RegisterForm.jsx'
import './App.css'

function getApiBase() {
  const raw = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'
  return String(raw).replace(/\/+$/, '')
}

export default function App() {
  const apiBase = useMemo(() => getApiBase(), [])
  const [tab, setTab] = useState('browse')
  const [tutors, setTutors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [subject, setSubject] = useState('')
  const [city, setCity] = useState('')

  const loadTutors = useCallback(async (subj, cit) => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (subj.trim()) params.set('subject', subj.trim())
    if (cit.trim()) params.set('city', cit.trim())
    const q = params.toString()
    const url = `${apiBase}/api/tutors${q ? `?${q}` : ''}`
    try {
      const res = await fetch(url)
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Request failed (${res.status})`)
      }
      const data = await res.json()
      setTutors(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load tutors')
      setTutors([])
    } finally {
      setLoading(false)
    }
  }, [apiBase])

  useEffect(() => {
    loadTutors('', '')
  }, [loadTutors])

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="brand">
          <img src={heroImg} width={48} height={51} alt="" className="brand-mark" />
          <div>
            <h1 className="brand-title">Tution App</h1>
            <p className="brand-sub">Find approved tutors near you</p>
          </div>
        </div>
        <p className="api-hint">
          API: <code>{apiBase}</code>
        </p>
      </header>

      <nav className="app-nav" aria-label="Primary">
        <button
          type="button"
          className={tab === 'browse' ? 'active' : ''}
          onClick={() => setTab('browse')}
        >
          Browse
        </button>
        <button
          type="button"
          className={tab === 'register' ? 'active' : ''}
          onClick={() => setTab('register')}
        >
          Register
        </button>
        <button
          type="button"
          className={tab === 'admin' ? 'active' : ''}
          onClick={() => setTab('admin')}
        >
          Admin
        </button>
      </nav>

      {tab === 'register' && <RegisterForm apiBase={apiBase} />}

      {tab === 'admin' && (
        <AdminPanel apiBase={apiBase} onTutorUpdated={() => loadTutors(subject, city)} />
      )}

      {tab === 'browse' && (
        <>
          <section className="filters" aria-label="Search tutors">
            <label className="field">
              <span>Subject</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Mathematics"
                autoComplete="off"
              />
            </label>
            <label className="field">
              <span>City</span>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai"
                autoComplete="off"
              />
            </label>
            <button
              type="button"
              className="btn-primary"
              onClick={() => loadTutors(subject, city)}
            >
              Search
            </button>
          </section>

          <section className="tutors-section" aria-live="polite">
            {loading && <p className="status">Loading tutors…</p>}
            {!loading && error && (
              <div className="status error" role="alert">
                <strong>Could not reach the API.</strong> {error}
                <p className="hint">
                  Local: create <code>frontend/.env</code> from <code>.env.example</code> and set{' '}
                  <code>VITE_API_URL</code>. On Vercel, add the same env var and redeploy.
                </p>
              </div>
            )}
            {!loading && !error && tutors.length === 0 && (
              <div className="status empty">
                <p>No approved tutors match yet.</p>
                <p className="hint">
                  Tutors can register under <strong>Register</strong>; they appear here after{' '}
                  <strong>Admin</strong> approval.
                </p>
              </div>
            )}
            {!loading && !error && tutors.length > 0 && (
              <ul className="tutor-grid">
                {tutors.map((t) => (
                  <li key={t._id} className="tutor-card">
                    <h2 className="tutor-name">{t.name}</h2>
                    <p className="tutor-meta">
                      {t.city}
                      {t.area ? ` · ${t.area}` : ''}
                    </p>
                    <p className="tutor-meta">
                      {(t.subjects || []).join(', ') || 'Subjects not listed'}
                    </p>
                    <dl className="tutor-dl">
                      <div>
                        <dt>Fees / month</dt>
                        <dd>
                          {typeof t.feesPerMonth === 'number' ? `₹${t.feesPerMonth}` : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt>Mode</dt>
                        <dd>{t.teachingMode ?? '—'}</dd>
                      </div>
                      <div>
                        <dt>Rating</dt>
                        <dd>{t.rating ?? 0}</dd>
                      </div>
                    </dl>
                    {t.about && <p className="tutor-about">{t.about}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
