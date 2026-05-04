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
    <section className="panel register-panel" aria-labelledby="register-heading">
      <h2 id="register-heading" className="panel-title">
        Register as a tutor
      </h2>
      <p className="panel-lead">
        Listings stay hidden until an administrator approves your profile.
      </p>

      {message && (
        <p className="status success" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="status error" role="alert">
          {error}
        </p>
      )}

      <form className="form-register" onSubmit={handleSubmit}>
        <label className="field">
          <span>Full name *</span>
          <input
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            autoComplete="name"
          />
        </label>
        <label className="field">
          <span>Phone *</span>
          <input
            required
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            autoComplete="tel"
          />
        </label>
        <label className="field field-span-2">
          <span>Subjects * (comma-separated)</span>
          <input
            required
            placeholder="Mathematics, Physics"
            value={form.subjects}
            onChange={(e) => update('subjects', e.target.value)}
          />
        </label>
        <label className="field">
          <span>City *</span>
          <input required value={form.city} onChange={(e) => update('city', e.target.value)} />
        </label>
        <label className="field">
          <span>Area</span>
          <input value={form.area} onChange={(e) => update('area', e.target.value)} />
        </label>
        <label className="field">
          <span>Fees per month (₹) *</span>
          <input
            required
            inputMode="decimal"
            value={form.feesPerMonth}
            onChange={(e) => update('feesPerMonth', e.target.value)}
          />
        </label>
        <label className="field">
          <span>Teaching mode *</span>
          <select
            value={form.teachingMode}
            onChange={(e) => update('teachingMode', e.target.value)}
          >
            <option value="home">Home</option>
            <option value="online">Online</option>
            <option value="both">Both</option>
          </select>
        </label>
        <label className="field field-span-2">
          <span>Classes taught</span>
          <input
            placeholder="e.g. Classes 8–12"
            value={form.classesTaught}
            onChange={(e) => update('classesTaught', e.target.value)}
          />
        </label>
        <label className="field field-span-2">
          <span>Experience</span>
          <input
            value={form.experience}
            onChange={(e) => update('experience', e.target.value)}
          />
        </label>
        <label className="field field-span-2">
          <span>About</span>
          <textarea
            rows={3}
            value={form.about}
            onChange={(e) => update('about', e.target.value)}
          />
        </label>
        <div className="form-actions field-span-2">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit registration'}
          </button>
        </div>
      </form>
    </section>
  )
}
