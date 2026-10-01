import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import {
  AuthProvider,
  useAuth,
} from './context/AuthContext'

// Auth
import UserLogin from './pages/auth/UserLogin'
import UserRegister from './pages/auth/UserRegister'
import CompanyLogin from './pages/auth/CompanyLogin'
import CompanyRegister from './pages/auth/CompanyRegister'

// User
import Home from './pages/user/Home'
import Status from './pages/user/Status'
import CV from './pages/user/CV'
import Profile from './pages/user/Profile'
import UserJobDetail from './pages/user/JobDetail'

// Company
import Dashboard from './pages/company/Dashboard'
import Jobs from './pages/company/Jobs'
import JobDetail from './pages/company/JobDetail'
import CompanyProfile from './pages/company/CompanyProfile'

// Admin
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!user) {
    if (role === 'admin') {
      return (
        <Navigate
          to="/admin/login"
          replace
        />
      )
    }

    if (role === 'company') {
      return (
        <Navigate
          to="/company/login"
          replace
        />
      )
    }

    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (role && user.role !== role) {
    if (user.role === 'admin') {
      return (
        <Navigate
          to="/admin/dashboard"
          replace
        />
      )
    }

    if (user.role === 'company') {
      return (
        <Navigate
          to="/company/dashboard"
          replace
        />
      )
    }

    return (
      <Navigate
        to="/home"
        replace
      />
    )
  }

  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Default */}
          <Route
            path="/"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

          {/* Auth */}
          <Route
            path="/login"
            element={<UserLogin />}
          />

          <Route
            path="/register"
            element={<UserRegister />}
          />

          <Route
            path="/company/login"
            element={<CompanyLogin />}
          />

          <Route
            path="/company/register"
            element={<CompanyRegister />}
          />

          <Route
            path="/admin/login"
            element={<AdminLogin />}
          />

          {/* User */}
          <Route
            path="/home"
            element={
              <ProtectedRoute role="user">
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/status"
            element={
              <ProtectedRoute role="user">
                <Status />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cv"
            element={
              <ProtectedRoute role="user">
                <CV />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute role="user">
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/jobs/:id"
            element={
              <ProtectedRoute role="user">
                <UserJobDetail />
              </ProtectedRoute>
            }
          />

          {/* Company */}
          <Route
            path="/company/dashboard"
            element={
              <ProtectedRoute role="company">
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/jobs"
            element={
              <ProtectedRoute role="company">
                <Jobs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/jobs/:id"
            element={
              <ProtectedRoute role="company">
                <JobDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/profile"
            element={
              <ProtectedRoute role="company">
                <CompanyProfile />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <Navigate
                to="/admin/dashboard"
                replace
              />
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}