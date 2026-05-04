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
  const [lastQuery, setLastQuery] = useState({ subject: '', city: '' })

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
      setLastQuery({ subject: subj.trim(), city: cit.trim() })
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

  const queryLabel = (() => {
    const parts = []
    if (lastQuery.subject) parts.push(`Subject: ${lastQuery.subject}`)
    if (lastQuery.city) parts.push(`City: ${lastQuery.city}`)
    return parts.length ? parts.join(' • ') : 'All tutors'
  })()

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <img src={heroImg} alt="" className="brand-mark" />
          <div>
            <h1>Tution App</h1>
            <p>Find approved tutors near you</p>
          </div>
        </div>
        <nav className="nav" aria-label="Primary">
          <button
            type="button"
            className={`tab ${tab === 'browse' ? 'active' : ''}`}
            onClick={() => setTab('browse')}
          >
            Browse
          </button>
          <button
            type="button"
            className={`tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => setTab('register')}
          >
            Register
          </button>
          <button
            type="button"
            className={`tab ${tab === 'admin' ? 'active' : ''}`}
            onClick={() => setTab('admin')}
          >
            Admin
          </button>
        </nav>
      </header>

      {tab === 'register' && <RegisterForm apiBase={apiBase} />}

      {tab === 'admin' && (
        <AdminPanel apiBase={apiBase} onTutorUpdated={() => loadTutors(subject, city)} />
      )}

      {tab === 'browse' && (
        <>
          <section className="hero" aria-label="Welcome">
            <h2>Find the right tutor, faster.</h2>
            <p>
              Search by subject and city, register as a tutor in minutes, and approve listings from
              the admin panel.
            </p>
            <div className="meta-row">
              <span className="pill">
                API <code>{apiBase}</code>
              </span>
              <span className="pill">
                Showing <strong>{loading ? '—' : tutors.length}</strong> result(s) ·{' '}
                <span className="muted">{queryLabel}</span>
              </span>
            </div>

            <div className="filters" aria-label="Search tutors">
              <label className="field">
                <span className="label">Subject</span>
                <input
                  className="input"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Mathematics"
                  autoComplete="off"
                />
              </label>
              <label className="field">
                <span className="label">City</span>
                <input
                  className="input"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                  autoComplete="off"
                />
              </label>
              <button type="button" className="btn" onClick={() => loadTutors(subject, city)}>
                Search
              </button>
            </div>
          </section>

          <section className="section" aria-live="polite">
            {loading && (
              <ul className="grid" aria-label="Loading">
                {Array.from({ length: 6 }).map((_, i) => (
                  <li key={i} className="card">
                    <div className="skeleton" style={{ width: '60%' }} />
                    <div style={{ height: 10 }} />
                    <div className="skeleton" style={{ width: '40%' }} />
                    <div style={{ height: 14 }} />
                    <div className="skeleton" style={{ width: '80%' }} />
                    <div style={{ height: 10 }} />
                    <div className="skeleton" style={{ width: '72%' }} />
                  </li>
                ))}
              </ul>
            )}
            {!loading && error && (
              <div className="status error" role="alert">
                <strong>Could not reach the API.</strong> {error}
                <div className="hint">
                  Check that <code>VITE_API_URL</code> points to your Render backend and that the
                  backend is online.
                </div>
              </div>
            )}
            {!loading && !error && tutors.length === 0 && (
              <div className="status">
                <strong>No tutors found.</strong>
                <div className="hint">
                  Try a different subject/city, or register a tutor under <strong>Register</strong>{' '}
                  and approve them under <strong>Admin</strong>.
                </div>
              </div>
            )}
            {!loading && !error && tutors.length > 0 && (
              <ul className="grid" aria-label="Tutors list">
                {tutors.map((t) => (
                  <li key={t._id} className="card">
                    <h3>{t.name}</h3>
                    <div className="muted">
                      {t.city}
                      {t.area ? ` · ${t.area}` : ''}
                    </div>
                    <div className="tags" aria-label="Subjects">
                      {(t.subjects || []).length ? (
                        t.subjects.slice(0, 6).map((s) => (
                          <span className="tag" key={s}>
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="muted">Subjects not listed</span>
                      )}
                    </div>
                    <dl className="kv">
                      <div>
                        <dt>Fees</dt>
                        <dd>{typeof t.feesPerMonth === 'number' ? `₹${t.feesPerMonth}` : '—'}</dd>
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
                    {t.about && <p className="hint">{t.about}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <footer className="footer">
        <span className="muted">© {new Date().getFullYear()} Tution App</span>
        <span className="muted">
          Tip: On Render free tier, the backend may take a few seconds to “wake up”.
        </span>
      </footer>
    </div>
  )
}
