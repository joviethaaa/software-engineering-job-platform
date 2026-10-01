import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../services/api'

export default function UserLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await API.post('/auth/user/login', { email, password })
      const { token, user } = response.data

      localStorage.setItem('token', token)
      login({ ...user, token })
      navigate('/home')
    } catch (err) {
      const backendError = err.response?.data?.message || 'Email atau password salah'
      setError(backendError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome back to the<br />land of opportunities</h1>
        <p style={styles.subtitle}>
          Please login or{' '}
          <Link to="/register" style={styles.link}>Sign Up</Link>
          {' '}to access your talent dashboard.
        </p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="john.doe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Loading...' : 'Sign In →'}
          </button>
        </form>

        <p style={styles.switchText}>
          <Link to="/company/login" style={styles.switchLink}>
            Are you a company? Login here!
          </Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f0f2f8 0%, #e8eaf6 100%)',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '48px',
    width: '100%',
    maxWidth: '460px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1e6c',
    marginBottom: '12px',
    lineHeight: '1.3',
    textAlign: 'center',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '14px',
    marginBottom: '32px',
    textAlign: 'center',
  },
  link: {
    color: '#1a1e6c',
    fontWeight: '600',
  },
  field: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '8px',
    color: '#1a1e3c',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid #e2e5f0',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
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
    marginTop: '8px',
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
    marginTop: '24px',
    fontSize: '14px',
    color: '#6b7280',
  },
  switchLink: {
    color: '#745b00',
    fontWeight: '600',
  },
}