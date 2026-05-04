import { useCallback, useEffect, useState } from 'react'

export default function AdminPanel({ apiBase, onTutorUpdated }) {
  const [secret, setSecret] = useState('')
  const [rememberDevice, setRememberDevice] = useState(false)
  const [status, setStatus] = useState('pending')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('adminSecret')
      if (saved) {
        setSecret(saved)
        setRememberDevice(true)
      }
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    try {
      if (rememberDevice && secret.trim()) sessionStorage.setItem('adminSecret', secret.trim())
      else sessionStorage.removeItem('adminSecret')
    } catch {
      /* ignore */
    }
  }, [secret, rememberDevice])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/admin/tutors?status=${encodeURIComponent(status)}`, {
        headers: { 'X-Admin-Secret': secret.trim() },
      })
      const text = await res.text()
      if (!res.ok) {
        let msg = text || `Request failed (${res.status})`
        try {
          const j = JSON.parse(text)
          if (j.message) msg = j.message
        } catch {
          /* keep */
        }
        throw new Error(msg)
      }
      const data = JSON.parse(text)
      setRows(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [apiBase, secret, status])

  async function setApproved(id, isApproved) {
    setBusyId(id)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/admin/tutors/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': secret.trim(),
        },
        body: JSON.stringify({ isApproved }),
      })
      const text = await res.text()
      if (!res.ok) {
        let msg = text || `Request failed (${res.status})`
        try {
          const j = JSON.parse(text)
          if (j.message) msg = j.message
        } catch {
          /* keep */
        }
        throw new Error(msg)
      }
      await load()
      onTutorUpdated?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="section" aria-labelledby="admin-heading">
      <div className="hero">
        <h2 id="admin-heading">Admin</h2>
        <p>
          This screen is protected by a server secret. Set <code>ADMIN_SECRET</code> on Render and
          paste it here to approve/revoke tutor listings.
        </p>
      </div>

      <div className="card section">
        <div className="filters" style={{ gridTemplateColumns: '2fr 1fr auto' }}>
          <label className="field">
            <span className="label">Admin secret</span>
            <input
              className="input"
              type="password"
              autoComplete="off"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Same value as ADMIN_SECRET"
            />
          </label>
          <label className="field">
            <span className="label">List</span>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="all">All</option>
            </select>
          </label>
          <button type="button" className="btn" onClick={() => load()} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        <label className="checkbox-field" style={{ marginTop: 12 }}>
          <input
            type="checkbox"
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
          />
          <span>Remember secret on this device (session storage)</span>
        </label>
      </div>

      {error && (
        <div className="status error section" role="alert">
          <strong>Admin request failed.</strong> {error}
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="status section">No tutors in this list.</div>
      )}

      {rows.length > 0 && (
        <ul className="section" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12 }}>
          {rows.map((t) => (
            <li key={t._id} className="card">
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ marginBottom: 4 }}>{t.name}</h3>
                  <div className="muted">
                    {t.phone} · {t.city}{t.area ? ` · ${t.area}` : ''}
                  </div>
                  <div className="tags">
                    {(t.subjects || []).slice(0, 10).map((s) => (
                      <span className="tag" key={s}>
                        {s}
                      </span>
                    ))}
                    {!t.subjects?.length && <span className="muted">No subjects</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="pill">
                    {t.isApproved ? (
                      <span style={{ color: 'inherit' }}>Approved</span>
                    ) : (
                      <span style={{ color: 'inherit' }}>Pending</span>
                    )}
                  </span>
                  {!t.isApproved ? (
                    <button
                      type="button"
                      className="btn"
                      disabled={busyId === t._id}
                      onClick={() => setApproved(t._id, true)}
                    >
                      Approve
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn"
                      disabled={busyId === t._id}
                      onClick={() => setApproved(t._id, false)}
                      style={{
                        color: 'var(--text-h)',
                        background: 'color-mix(in srgb, var(--social-bg), transparent 0%)',
                      }}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
