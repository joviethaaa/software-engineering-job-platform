import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import API from '../../services/api'

const statusConfig = {
  interview_scheduled: { label: 'Interview Scheduled', bg: '#dbeafe', color: '#1d4ed8' },
  under_review:        { label: 'Under Review',        bg: '#fef3c7', color: '#d97706' },
  not_selected:        { label: 'Not Selected',        bg: '#fee2e2', color: '#dc2626' },
  submitted:           { label: 'Submitted',           bg: '#f0f2f8', color: '#6b7280' },
  hired:               { label: 'Hired',               bg: '#dcfce7', color: '#16a34a' },
}

export default function Status() {
  const navigate = useNavigate()

  const [applications, setApplications] = useState([])
  const [savedJobs, setSavedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStatusData = async () => {
      try {
        setLoading(true)
        
        const [appResponse, savedResponse] = await Promise.all([
          API.get('/users/applications'),
          API.get('/users/saved-jobs')
        ])

        setApplications(appResponse.data)
        setSavedJobs(savedResponse.data)
      } catch (err) {
        setError('Failed to fetch your application data. Please try again.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchStatusData()
  }, [])

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>Loading your overview...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: '48px', textAlign: 'center', color: '#dc2626' }}>{error}</div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.pageTitle}>Application Overview</h1>
        <p style={styles.pageSubtitle}>
          Track your professional journey. All applications are evaluated based on skill compatibility.
        </p>

        <div style={styles.body}>
          {/* Left — applied jobs */}
          <div style={styles.left}>
            <h2 style={styles.sectionTitle}>
              Applied Jobs{' '}
              <span style={styles.count}>{applications.length}</span>
            </h2>

            {applications.length > 0 ? (
              applications.map((app) => {
                const status = statusConfig[app.status] || statusConfig.submitted
                return (
                  <div key={app.id} style={styles.appCard}>
                    <div style={styles.appCardTop}>
                      <div style={styles.appIcon}>💼</div>
                      <div style={styles.appInfo}>
                        <h3 style={styles.appTitle}>{app.title}</h3>
                        <p style={styles.appCompany}>{app.company_name || app.company} • {app.location}</p>
                      </div>
                      <div style={styles.appRight}>
                        <span style={{ ...styles.statusBadge, background: status.bg, color: status.color }}>
                          {status.label}
                        </span>
                        <p style={styles.appliedAt}>Applied {app.appliedAt ? new Date(app.applied_at).toLocaleDateString() : ''}</p>
                      </div>
                    </div>
                    <div style={styles.appCardBottom}>
                      <button
                        style={styles.viewBtn}
                        onClick={() => navigate(`/jobs/${app.job_id || app.id}`)}
                      >
                        View Details
                      </button>
                      {app.status === 'not_selected' && (
                        <button style={styles.feedbackBtn}>Get Feedback</button>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div style={styles.emptyContainer}>
                <div style={styles.emptyIcon}>📂</div>
                <p style={styles.emptyText}>Belum ada lowongan yang kamu lamar.</p>
                <p style={styles.emptySubtext}>Cari lowongan menarik di halaman Home dan mulai perjalanan karirmu!</p>
              </div>
            )}
          </div>

          {/* Right — saved jobs */}
          <div style={styles.right}>
            <div style={styles.savedHeader}>
              <h2 style={styles.sectionTitle}>Saved Jobs</h2>
              <button style={styles.viewAllBtn}>View All</button>
            </div>

            {savedJobs.length > 0 ? (
              savedJobs.map((job) => (
                <div key={job.id || job.job_id} style={styles.savedCard}>
                  <div style={styles.savedInfo}>
                    <h3 style={styles.savedTitle}>{job.title}</h3>
                    <p style={styles.savedCompany}>{job.company_name}</p>
                    <p style={styles.savedSalary}>
                    💰 {job.salary_min ? (
                      `${job.currency || 'IDR'} ${Number(job.salary_min).toLocaleString()} - ${Number(job.salary_max).toLocaleString()} / ${job.salary_unit === 'yearly' ? 'yr' : 'mo'}`
                    ) : (
                      "Negotiable"
                    )}
                  </p>
                  </div>
                  <button
                    style={styles.applyNowBtn}
                    onClick={() => {
                      const rawId = job.job_id || job.id;
                      const cleanId = String(rawId).split(',')[0].trim();
                      
                      navigate(`/jobs/${cleanId}`);
                    }}
                  >
                    Apply Now
                  </button>
                </div>
              ))
            ) : (
              <div style={{ ...styles.emptyContainer, padding: '24px 16px' }}>
                <p style={{ ...styles.emptyText, fontSize: '13px' }}>Belum ada lowongan disimpan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  pageTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#1a1e3c',
    marginBottom: '4px',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '32px',
  },
  body: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
  },
  left: {
    flex: 1,
  },
  right: {
    width: '280px',
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1e3c',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  count: {
    background: '#e0e7ff',
    color: '#1a1e6c',
    borderRadius: '99px',
    padding: '2px 10px',
    fontSize: '13px',
    fontWeight: '700',
  },
  appCard: {
    background: '#ffffff',
    border: '1px solid #e2e5f0',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '12px',
  },
  appCardTop: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    marginBottom: '16px',
  },
  appIcon: {
    width: '44px',
    height: '44px',
    background: '#f0f2f8',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0,
  },
  appInfo: {
    flex: 1,
  },
  appTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1a1e3c',
    marginBottom: '4px',
  },
  appCompany: {
    fontSize: '13px',
    color: '#6b7280',
  },
  appRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '6px',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '99px',
    fontSize: '12px',
    fontWeight: '600',
  },
  appliedAt: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  appCardBottom: {
    display: 'flex',
    gap: '10px',
  },
  viewBtn: {
    padding: '8px 20px',
    border: '1.5px solid #e2e5f0',
    borderRadius: '8px',
    background: '#fff',
    fontSize: '13px',
    cursor: 'pointer',
    color: '#374151',
    fontWeight: '500',
  },
  feedbackBtn: {
    padding: '8px 20px',
    border: 'none',
    borderRadius: '8px',
    background: 'transparent',
    fontSize: '13px',
    cursor: 'pointer',
    color: '#dc2626',
    fontWeight: '500',
  },
  savedHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  viewAllBtn: {
    background: 'none',
    color: '#1a1e6c',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  savedCard: {
    background: '#ffffff',
    border: '1px solid #e2e5f0',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  savedInfo: {
    flex: 1,
  },
  savedTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1a1e3c',
    marginBottom: '4px',
  },
  savedCompany: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '4px',
  },
  savedSalary: {
    fontSize: '13px',
    color: '#d97706',
    fontWeight: '600',
  },
  applyNowBtn: {
    padding: '8px 16px',
    background: '#1a1e6c',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  emptyContainer: {
    background: '#ffffff',
    border: '1px dashed #e2e5f0', // Menggunakan dashed line agar estetik untuk penanda kosong
    borderRadius: '12px',
    padding: '40px 24px',
    textAlign: 'center',
    color: '#6b7280',
  },
  emptyIcon: {
    fontSize: '32px',
    marginBottom: '12px',
  },
  emptyText: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a1e3c',
    marginBottom: '4px',
  },
  emptySubtext: {
    fontSize: '13px',
    color: '#9ca3af',
  },
}