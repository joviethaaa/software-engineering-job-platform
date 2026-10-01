import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { User, Bell } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()

  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname

  const displayName =
    user?.role === 'admin'
      ? 'Admin'
      : user?.name || 'User'

  const userMenu = [
    { label: 'Home', path: '/home' },
    { label: 'Status', path: '/status' },
    { label: 'CV', path: '/cv' },
    { label: 'Profile', path: '/profile' },
  ]

  const companyMenu = [
    { label: 'Dashboard', path: '/company/dashboard' },
    { label: 'Jobs', path: '/company/jobs' },
    { label: 'Profile', path: '/company/profile' },
  ]

  const adminMenu = [
    { label: 'Dashboard', path: '/admin/dashboard' },
  ]

  const menu =
    user?.role === 'company'
      ? companyMenu
      : user?.role === 'admin'
        ? adminMenu
        : userMenu

  const handleLogout = () => {
    const role = user?.role

    logout()

    if (role === 'admin') {
      navigate('/admin/login')
      return
    }

    if (role === 'company') {
      navigate('/company/login')
      return
    }

    navigate('/login')
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Kiri */}
        <div style={styles.left}>
          <div style={styles.iconCircle}>
            <User
              size={16}
              color="#1a1e6c"
            />
          </div>

          <span style={styles.logo}>
            {displayName}
          </span>
        </div>

        {/* Tengah */}
        <div style={styles.menu}>
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.menuItem,
                ...(currentPath === item.path
                  ? styles.menuItemActive
                  : {})
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Kanan */}
        <div style={styles.right}>
          <div style={styles.bellBtn}>
            <Bell
              size={18}
              color="#6b7280"
            />
          </div>

          {user?.role === 'company' && (
            <button
              type="button"
              style={styles.newJobBtn}
              onClick={() =>
                navigate('/company/jobs', {
                  state: {
                    openModal: true
                  }
                })
              }
            >
              + New Job
            </button>
          )}

          {user?.role === 'admin' && (
            <button
              type="button"
              style={styles.logoutBtn}
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    background: '#f4faff',
    borderBottom: '3px solid #e2e5f0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },

  inner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  iconCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '1.5px solid #1a1e6c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    fontWeight: '700',
    fontSize: '18px',
    color: '#1a1e6c',
  },

  menu: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  menuItem: {
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    textDecoration: 'none',
  },

  menuItemActive: {
    background: '#1a1e6c',
    color: '#ffffff',
  },

  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  bellBtn: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRight: '3px solid #e2e5f0',
  },

  newJobBtn: {
    padding: '8px 16px',
    border: '1.5px solid #1a1e6c',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1e6c',
    background: '#f4faff',
    cursor: 'pointer',
  },

  logoutBtn: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    background: '#1a1e6c',
    cursor: 'pointer',
  },
}