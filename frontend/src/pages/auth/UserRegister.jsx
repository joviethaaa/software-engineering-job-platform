import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../../services/api'

export default function UserRegister() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    dateOfBirth: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await API.post('/auth/user/register', form)

      navigate('/login')
    } catch (err) {
      const backendError = err.response?.data?.message || 'Terjadi kesalahan, coba lagi'
      setError(backendError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <h1 style={styles.leftTitle}>Empowering your<br />professional journey.</h1>
        <p style={styles.leftSubtitle}>
          We believe in human potential, stripped of bias.
          Your skills are your greatest asset.
        </p>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.title}>You are on your way to the job jungle</h2>
          <p style={styles.subtitle}>
            Create your profile or{' '}
            <Link to="/login" style={styles.link}>Login</Link>
            {' '}to start exploring opportunities.
          </p>

          {error && <p style={styles.error}>{error}</p>}

          <form onSubmit={handleSubmit}>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>First Name</label>
                <input
                  name="firstName"
                  placeholder="e.g. John"
                  value={form.firstName}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Last Name</label>
                <input
                  name="lastName"
                  placeholder="e.g. Doe"
                  value={form.lastName}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="john.doe@example.com"
                value={form.email}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                name="password"
                type="password"
                placeholder="Input your password"
                value={form.password}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Phone Number</label>
                <input
                  name="phone"
                  placeholder="0812-3456-7890"
                  value={form.phone}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>City</label>
                <input
                  name="city"
                  placeholder="e.g. Jakarta"
                  value={form.city}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Date of Birth</label>
              <input
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.checkboxRow}>
              <input type="checkbox" id="agree" required />
              <label htmlFor="agree" style={styles.checkboxLabel}>
                I agree to the{' '}
                <span style={styles.link}>Terms of Service</span>
                {' '}and{' '}
                <span style={styles.link}>Privacy Policy</span>
              </label>
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Loading...' : 'Sign Up →'}
            </button>
          </form>

          <p style={styles.switchText}>
            <Link to="/company/register" style={styles.switchLink}>
              Are you a company looking for new hire? Sign up here!
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
  },
  left: {
    width: '40%',
    background: '#1a1e6c',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '64px 48px',
  },
  leftTitle: {
    color: '#ffffff',
    fontSize: '36px',
    fontWeight: '700',
    lineHeight: '1.3',
    marginBottom: '16px',
  },
  leftSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '15px',
    lineHeight: '1.7',
  },
  right: {
    width: '60%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    background: '#f0f2f8',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '48px',
    width: '100%',
    maxWidth: '540px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1e6c',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '14px',
    marginBottom: '28px',
  },
  link: {
    color: '#1a1e6c',
    fontWeight: '600',
    cursor: 'pointer',
  },
  row: {
    display: 'flex',
    gap: '16px',
  },
  field: {
    marginBottom: '16px',
    flex: 1,
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '6px',
    color: '#1a1e3c',
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    border: '1.5px solid #e2e5f0',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
  },
  checkboxLabel: {
    fontSize: '13px',
    color: '#6b7280',
  },
  button: {
    width: '100%',
    padding: '14px',
    background: '#1a1e6c',
    color: '#ffffff',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  error: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  switchText: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '13px',
    color: '#6b7280',
  },
  switchLink: {
    color: '#745b00',
    fontWeight: '600',
  },
}