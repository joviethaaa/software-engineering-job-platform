import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../services/api'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (loading) return

    setError('')
    setLoading(true)

    try {
      const response = await API.post('/auth/admin/login', {
        email,
        password
      })

      const { token, user } = response.data

      localStorage.setItem('token', token)

      login({
        ...user,
        token
      })

      navigate('/admin')
    } catch (err) {
      const backendError =
        err.response?.data?.message ||
        'Invalid credentials. Please try again.'

      setError(backendError)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.cardHeader}>
          <div style={styles.adminIcon}>🛡</div>

          <h2 style={styles.cardTitle}>
            Admin Sign In
          </h2>

          <p style={styles.cardSub}>
            Restricted access. Authorized personnel only.
          </p>
        </div>

        {/* Form */}
        <div style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Email
            </label>

            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>
                ✉
              </span>

              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                onKeyDown={handleKeyDown}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Password
            </label>

            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>
                🔒
              </span>

              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                onKeyDown={handleKeyDown}
                style={styles.input}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPass(!showPass)
                }
                style={styles.eyeBtn}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {error && (
            <div style={styles.errorBox}>
              ⚠ {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            style={{
              ...styles.loginBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading
                ? 'not-allowed'
                : 'pointer'
            }}
            disabled={loading}
          >
            {loading
              ? 'Signing In...'
              : 'Sign In to Admin Panel →'}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f4f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },

  card: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    border: '1px solid #e2e5f0',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  },

  cardHeader: {
    textAlign: 'center',
    marginBottom: '32px',
  },

  adminIcon: {
    fontSize: '36px',
    marginBottom: '12px',
  },

  cardTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1a1e6c',
    marginBottom: '6px',
  },

  cardSub: {
    fontSize: '13px',
    color: '#9ca3af',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },

  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
  },

  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    border: '1.5px solid #e2e5f0',
    borderRadius: '10px',
    background: '#fafafa',
    padding: '0 14px',
    gap: '10px',
    transition: 'border-color 0.15s',
  },

  inputIcon: {
    fontSize: '14px',
    flexShrink: 0,
    opacity: 0.5,
  },

  input: {
    flex: 1,
    border: 'none',
    background: 'none',
    outline: 'none',
    padding: '13px 0',
    fontSize: '14px',
    color: '#1f2937',
  },

  eyeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '0',
    opacity: 0.6,
  },

  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#dc2626',
    fontWeight: '500',
  },

  loginBtn: {
    width: '100%',
    padding: '14px',
    background: '#1a1e6c',
    color: '#ffffff',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    border: 'none',
    marginTop: '4px',
  },
}