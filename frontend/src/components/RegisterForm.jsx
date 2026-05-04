import { useState } from 'react'

const emptyForm = {
  name: '',
  phone: '',
  subjects: '',
  city: '',
  area: '',
  feesPerMonth: '',
  teachingMode: 'both',
  classesTaught: '',
  experience: '',
  about: '',
}

export default function RegisterForm({ apiBase }) {
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage(null)
    setError(null)

    const fees = Number(form.feesPerMonth)
    if (!Number.isFinite(fees) || fees < 0) {
      setError('Enter a valid monthly fee (number ≥ 0).')
      return
    }

    const subjectList = form.subjects
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    if (subjectList.length === 0) {
      setError('Add at least one subject.')
      return
    }

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      subjects: subjectList,
      city: form.city.trim(),
      area: form.area.trim() || undefined,
      feesPerMonth: fees,
      teachingMode: form.teachingMode,
      classesTaught: form.classesTaught.trim() || undefined,
      experience: form.experience.trim() || undefined,
      about: form.about.trim() || undefined,
    }

    setSubmitting(true)
    try {
      const res = await fetch(`${apiBase}/api/tutors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const text = await res.text()
      if (!res.ok) {
        let msg = text || `Request failed (${res.status})`
        try {
          const j = JSON.parse(text)
          if (j.message) msg = j.message
        } catch {
          /* keep msg */
        }
        throw new Error(msg)
      }
      setForm(emptyForm)
      setMessage(
        'Registration submitted. An admin must approve your profile before you appear in search results.'
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="section" aria-labelledby="register-heading">
      <div className="hero">
        <h2 id="register-heading">Register as a tutor</h2>
        <p>
          Fill this once. Your profile will appear in search after <strong>Admin</strong> approval.
        </p>
      </div>

      {message && (
        <div className="status success" role="status">
          <strong>Done.</strong> {message}
        </div>
      )}
      {error && (
        <div className="status error" role="alert">
          <strong>Fix this:</strong> {error}
        </div>
      )}

      <form className="section" onSubmit={handleSubmit}>
        <div className="card">
          <h3>Basic details</h3>
          <div className="hint muted">Fields marked * are required. Subjects should be comma-separated.</div>
          <div style={{ height: 14 }} />
          <div className="filters" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <label className="field">
              <span className="label">Full name *</span>
              <input
                className="input"
                required
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                autoComplete="name"
              />
            </label>
            <label className="field">
              <span className="label">Phone *</span>
              <input
                className="input"
                required
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                autoComplete="tel"
              />
            </label>
          </div>
          <div style={{ height: 12 }} />
          <label className="field">
            <span className="label">Subjects * (comma-separated)</span>
            <input
              className="input"
              required
              placeholder="Mathematics, Physics"
              value={form.subjects}
              onChange={(e) => update('subjects', e.target.value)}
            />
          </label>
          <div style={{ height: 12 }} />
          <div className="filters" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <label className="field">
              <span className="label">City *</span>
              <input
                className="input"
                required
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
              />
            </label>
            <label className="field">
              <span className="label">Area</span>
              <input
                className="input"
                value={form.area}
                onChange={(e) => update('area', e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="card">
          <h3>Teaching info</h3>
          <div style={{ height: 14 }} />
          <div className="filters" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <label className="field">
              <span className="label">Fees per month (₹) *</span>
              <input
                className="input"
                required
                inputMode="decimal"
                value={form.feesPerMonth}
                onChange={(e) => update('feesPerMonth', e.target.value)}
              />
            </label>
            <label className="field">
              <span className="label">Teaching mode *</span>
              <select
                className="select"
                value={form.teachingMode}
                onChange={(e) => update('teachingMode', e.target.value)}
              >
                <option value="home">Home</option>
                <option value="online">Online</option>
                <option value="both">Both</option>
              </select>
            </label>
          </div>
          <div style={{ height: 12 }} />
          <label className="field">
            <span className="label">Classes taught</span>
            <input
              className="input"
              placeholder="e.g. Classes 8–12"
              value={form.classesTaught}
              onChange={(e) => update('classesTaught', e.target.value)}
            />
          </label>
          <div style={{ height: 12 }} />
          <label className="field">
            <span className="label">Experience</span>
            <input
              className="input"
              value={form.experience}
              onChange={(e) => update('experience', e.target.value)}
            />
          </label>
          <div style={{ height: 12 }} />
          <label className="field">
            <span className="label">About</span>
            <textarea
              className="textarea"
              rows={4}
              value={form.about}
              onChange={(e) => update('about', e.target.value)}
            />
          </label>
        </div>

        <div className="section">
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit registration'}
          </button>
        </div>
      </form>
    </section>
  )
}
