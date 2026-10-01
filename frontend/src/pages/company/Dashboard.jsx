import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import API from '../../services/api'

const marketInsights = [
  { icon: '↗', title: 'Salary Trends 2026', desc: 'Tech roles seeing an average 12% increase in remote-first offers.' },
  { icon: '🎯', title: 'Blind Hiring Impact', desc: 'Merit-based filtering reduces time-to-hire by 18% on average.' },
]

const statusColors = {
  ACTIVE: { bg: '#dcfce7', color: '#16a34a' },
  REVIEWING: { bg: '#fef9c3', color: '#ca8a04' },
  'ON HOLD': { bg: '#f1f5f9', color: '#64748b' },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState([
    { label: 'ACTIVE JOBS', value: '0', sub: '↘ 0 new since last week', icon: '💼', iconBg: '#ede9fe', subColor: '#16a34a' },
    { label: 'NEW APPLICANTS', value: '0', sub: '⚡ 0 need review today', icon: '👥', iconBg: '#fef9c3', subColor: '#ca8a04' },
    { label: 'INTERVIEWS TODAY', value: '0', sub: '', icon: '📅', iconBg: '#f0fdf4' },
  ])

  const [postedJobs, setPostedJobs] = useState([])
  const [nearbyCompanies, setNearbyCompanies] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const [dashboardRes, jobsRes] = await Promise.all([
          API.get('/companies/dashboard'),
          API.get('/companies/jobs')
        ])

        if (dashboardRes.data) {
          const d = dashboardRes.data
          setStats([
            { label: 'ACTIVE JOBS', value: String(d.active_jobs || 0), sub: `↗ ${d.new_jobs_this_week || 0} new since last week`, icon: '💼', iconBg: '#ede9fe', subColor: '#16a34a' },
            { label: 'NEW APPLICANTS', value: String(d.total_applicants || 0), sub: `⚡ ${d.need_review_count || 0} need review today`, icon: '👥', iconBg: '#fef9c3', subColor: '#ca8a04' },
            { label: 'INTERVIEWS TODAY', value: String(d.interviews_today_count || 0), sub: d.interviews_today_count > 0 ? '📅 Preparation required' : '📅 No sessions today', icon: '📅', iconBg: '#f0fdf4' },
          ])

          setNearbyCompanies(d.nearby_companies || [])
        }

        setPostedJobs(jobsRes.data || [])

      } catch (err) {
        console.error('Error loading company dashboard metrics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading && postedJobs.length === 0) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar />
        <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>Loading corporate intelligence metrics...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      <div style={styles.container}>

        {/* Stats row */}
        <div style={styles.statsRow}>
          {stats.map((s) => (
            <div key={s.label} style={styles.statCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ ...styles.statIcon, background: s.iconBg }}>{s.icon}</div>
                <div>
                  <p style={styles.statLabel}>{s.label}</p>
                  <p style={styles.statValue}>{s.value}</p>
                  {s.sub && <p style={{ ...styles.statSub, color: s.subColor }}>{s.sub}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div style={styles.mainRow}>

          {/* Posted jobs table */}
          <div style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <h2 style={styles.tableTitle}>Your Posted Jobs</h2>
              <button style={styles.viewAllBtn} onClick={() => navigate('/company/jobs')}>
                View All Jobs →
              </button>
            </div>

            <table style={styles.table}>
              <thead>
                <tr>
                  {['JOB TITLE', 'DEPARTMENT', 'APPLICANTS', 'STATUS', 'ACTION'].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {postedJobs.length > 0 ? (
                  postedJobs.map((job) => (
                    <tr key={job.job_id || job.id} style={styles.tr}>
                      <td style={styles.td}>
                        <span
                          style={styles.jobLink}
                          onClick={() => navigate(`/company/jobs/${job.job_id || job.id}`)}
                        >
                          {job.title}
                        </span>
                        <br />
                        <span style={styles.postedAt}>{job.postedAt || job.postedAt || 'Posted recently'}</span>
                      </td>
                      <td style={styles.td}>{job.department || 'General'}</td>
                      <td style={styles.td}><strong>{job.applicants_count || job.applicants || 0}</strong></td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          background: statusColors[job.status?.toUpperCase()]?.bg || '#f1f5f9',
                          color: statusColors[job.status?.toUpperCase()]?.color || '#64748b',
                        }}>
                          {job.status?.toUpperCase() || 'ACTIVE'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button style={styles.menuBtn}>⋮</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ ...styles.td, textAlign: 'center', color: '#9ca3af' }}>
                      You haven't posted any jobs yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Right sidebar */}
          <div style={styles.rightCol}>

            {/* Market insights */}
            <div style={styles.sideCard}>
              <h3 style={styles.sideTitle}>MARKET INSIGHTS</h3>
              {marketInsights.map((m) => (
                <div key={m.title} style={styles.insightRow}>
                  <div style={styles.insightIcon}>{m.icon}</div>
                  <div>
                    <p style={styles.insightTitle}>{m.title}</p>
                    <p style={styles.insightDesc}>{m.desc}</p>
                  </div>
                </div>
              ))}
              <button style={styles.reportBtn}>Download Report</button>
            </div>

            {/* Nearby companies */}
            <div style={styles.sideCard}>
              <h3 style={styles.sideTitle}>COMPANIES HIRING NEARBY</h3>
              {nearbyCompanies.length > 0 ? (
                nearbyCompanies.map((c, i) => (
                  <div key={i} style={styles.nearbyRow}>
                    <div style={styles.nearbyIcon}>🏢</div>
                    <div>
                      <p style={styles.nearbyName}>{c.company_name}</p>
                      <p style={styles.nearbyRoles}>{c.active_roles} active roles</p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0' }}>No other companies hiring in your city.</p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e2e5f0',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    flexShrink: 0,
  },
  statLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: '0.08em',
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a1e3c',
    lineHeight: 1,
    marginBottom: '4px',
  },
  statSub: {
    fontSize: '12px',
    fontWeight: '500',
  },
  mainRow: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
  },
  tableCard: {
    flex: 1,
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e2e5f0',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  tableTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1e3c',
  },
  viewAllBtn: {
    background: 'none',
    color: '#1a1e6c',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: '0.08em',
    padding: '8px 12px',
    borderBottom: '1px solid #f1f5f9',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '16px 12px',
    fontSize: '14px',
    color: '#374151',
    verticalAlign: 'middle',
  },
  jobLink: {
    color: '#1a1e6c',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
  },
  postedAt: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '2px',
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '99px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.05em',
  },
  menuBtn: {
    background: 'none',
    color: '#9ca3af',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '0 4px',
  },
  rightCol: {
    width: '280px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sideCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #e2e5f0',
  },
  sideTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#1a1e3c',
    letterSpacing: '0.08em',
    marginBottom: '16px',
  },
  insightRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    marginBottom: '14px',
  },
  insightIcon: {
    width: '32px',
    height: '32px',
    background: '#f0f2f8',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    flexShrink: 0,
  },
  insightTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1a1e3c',
    marginBottom: '2px',
  },
  insightDesc: {
    fontSize: '12px',
    color: '#6b7280',
    lineHeight: 1.4,
  },
  reportBtn: {
    width: '100%',
    padding: '10px',
    border: '1px solid #1a1e6c',
    color: '#1a1e6c',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    marginTop: '4px',
    background: 'none',
  },
  nearbyRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '12px',
  },
  nearbyIcon: {
    width: '36px',
    height: '36px',
    background: '#f0f2f8',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    flexShrink: 0,
  },
  nearbyName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a1e3c',
  },
  nearbyRoles: {
    fontSize: '12px',
    color: '#9ca3af',
  },
}