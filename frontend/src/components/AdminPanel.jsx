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
    <section className="panel admin-panel" aria-labelledby="admin-heading">
      <h2 id="admin-heading" className="panel-title">
        Admin
      </h2>
      <p className="panel-lead">
        Set <code>ADMIN_SECRET</code> on the server (Render → Environment). Send it as header{' '}
        <code>X-Admin-Secret</code>. Do not commit the secret to GitHub.
      </p>

      <div className="admin-controls">
        <label className="field admin-secret-field">
          <span>Admin secret</span>
          <input
            type="password"
            autoComplete="off"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Same value as ADMIN_SECRET"
          />
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
          />
          <span>Remember on this device (session storage)</span>
        </label>
        <label className="field">
          <span>List</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending">Pending approval</option>
            <option value="approved">Approved</option>
            <option value="all">All</option>
          </select>
        </label>
        <button type="button" className="btn-primary" onClick={() => load()} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <p className="status error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && rows.length === 0 && (
        <p className="status empty">No tutors in this list.</p>
      )}

      {rows.length > 0 && (
        <ul className="admin-list">
          {rows.map((t) => (
            <li key={t._id} className="admin-row">
              <div className="admin-row-main">
                <strong>{t.name}</strong>
                <span className="admin-meta">
                  {t.phone} · {t.city}
                  {t.isApproved ? (
                    <span className="badge approved">Approved</span>
                  ) : (
                    <span className="badge pending">Pending</span>
                  )}
                </span>
                <span className="admin-meta subtle">
                  {(t.subjects || []).join(', ') || 'No subjects'}
                </span>
              </div>
              <div className="admin-row-actions">
                {!t.isApproved ? (
                  <button
                    type="button"
                    className="btn-small btn-approve"
                    disabled={busyId === t._id}
                    onClick={() => setApproved(t._id, true)}
                  >
                    Approve
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-small btn-revoke"
                    disabled={busyId === t._id}
                    onClick={() => setApproved(t._id, false)}
                  >
                    Revoke
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
