import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import API from '../../services/api'

export default function CompanyProfile() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  const [company, setCompany] = useState({
    name: '',
    tagline: '',
    foundingRawDate: '',
    foundingYear: '',
    location: '',
    description: '',
    logo: '🔷',
    recruiter: {
      firstName: '',
      lastName: '',
      role: '',
      email: '',
      phone: '',
    },
  })

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)

        const res = await API.get('/companies/profile')

        if (res.data) {
          const d = res.data

          setCompany({
            name: d.company_name || '',
            tagline: d.tagline || '',
            foundingRawDate: d.founding_date
              ? d.founding_date.split('T')[0]
              : '',
            foundingYear: d.founding_date
              ? new Date(d.founding_date)
                  .getFullYear()
                  .toString()
              : '',
            location: d.city || '',
            description: d.description || '',
            logo: '🔷',
            recruiter: {
              firstName: d.first_name || '',
              lastName: d.last_name || '',
              role: d.recruiter_role || '',
              email: d.email || '',
              phone: d.phone || '',
            },
          })
        }
      } catch (err) {
        console.error(
          'Error fetching corporate profile credentials:',
          err
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  const handleToggleEdit = async () => {
    if (isEditing) {
      try {
        await API.put('/companies/profile', {
          company_name: company.name,
          tagline: company.tagline,
          city: company.location,
          description: company.description,
          first_name: company.recruiter.firstName,
          last_name: company.recruiter.lastName,
          recruiter_role: company.recruiter.role,
          phone: company.recruiter.phone,
          founding_date: company.foundingRawDate || null,
        })

        alert(
          'Company credentials saved successfully!'
        )
      } catch (err) {
        console.error(
          'Error updating profile metadata:',
          err
        )

        alert(
          err.response?.data?.message ||
            'Failed to update company credentials.'
        )

        return
      }
    }

    setIsEditing(!isEditing)
  }

  const handleLogout = () => {
    logout()
    navigate('/company/login')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar />

        <div
          style={{
            padding: '48px',
            textAlign: 'center',
            color: '#6b7280',
          }}
        >
          Loading corporate identity record...
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      <div style={styles.container}>
        {/* Page header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>
              Company Profile
            </h1>

            <p style={styles.pageSubtitle}>
              Manage your organization's identity and recruiter information.
            </p>
          </div>

          <button
            type="button"
            style={styles.editProfileBtn}
            onClick={handleToggleEdit}
          >
            {isEditing
              ? 'Save Changes'
              : 'Edit Profile'}
          </button>
        </div>

        {/* Main content */}
        <div style={styles.mainRow}>
          {/* Company info card */}
          <div style={styles.infoCard}>
            <div style={styles.companyHeader}>
              <div style={styles.logo}>
                {company.logo}
              </div>

              <div style={{ flex: 1 }}>
                {isEditing ? (
                  <input
                    value={company.name}
                    onChange={(e) =>
                      setCompany({
                        ...company,
                        name: e.target.value,
                      })
                    }
                    style={styles.editInput}
                    placeholder="Company name"
                  />
                ) : (
                  <h2 style={styles.companyName}>
                    {company.name ||
                      'Not specified'}
                  </h2>
                )}

                {isEditing ? (
                  <input
                    value={company.tagline}
                    onChange={(e) =>
                      setCompany({
                        ...company,
                        tagline: e.target.value,
                      })
                    }
                    style={{
                      ...styles.editInput,
                      fontSize: '13px',
                      fontWeight: '600',
                    }}
                    placeholder="Company tagline"
                  />
                ) : (
                  <p style={styles.companyTagline}>
                    {company.tagline ||
                      'Not specified'}
                  </p>
                )}

                <div style={styles.metaRow}>
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>
                      FOUNDING YEAR
                    </span>

                    {isEditing ? (
                      <input
                        type="date"
                        value={
                          company.foundingRawDate || ''
                        }
                        onChange={(e) =>
                          setCompany({
                            ...company,
                            foundingRawDate:
                              e.target.value,
                            foundingYear:
                              e.target.value
                                ? new Date(
                                    e.target.value
                                  )
                                    .getFullYear()
                                    .toString()
                                : '',
                          })
                        }
                        style={{
                          ...styles.editInput,
                          fontSize: '14px',
                          padding: '4px 8px',
                          marginTop: '4px',
                        }}
                      />
                    ) : (
                      <span style={styles.metaValue}>
                        {company.foundingYear ||
                          'Not specified'}
                      </span>
                    )}
                  </div>

                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>
                      LOCATION
                    </span>

                    {isEditing ? (
                      <input
                        value={company.location}
                        onChange={(e) =>
                          setCompany({
                            ...company,
                            location:
                              e.target.value,
                          })
                        }
                        style={{
                          ...styles.editInput,
                          fontSize: '14px',
                          padding: '4px 8px',
                          marginTop: '4px',
                        }}
                        placeholder="City"
                      />
                    ) : (
                      <span style={styles.metaValue}>
                        {company.location ||
                          'Not specified'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.divider} />

            <div>
              <h3 style={styles.descLabel}>
                Company Description
              </h3>

              {isEditing ? (
                <textarea
                  value={company.description}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      description:
                        e.target.value,
                    })
                  }
                  style={styles.editTextarea}
                  rows={6}
                  placeholder="Describe your company"
                />
              ) : (
                <p style={styles.descText}>
                  {company.description ||
                    'Not specified'}
                </p>
              )}
            </div>
          </div>

          {/* Recruiter card */}
          <div style={styles.recruiterCard}>
            <p style={styles.recruiterLabel}>
              Primary Recruiter
            </p>

            <div style={styles.recruiterHeader}>
              <div style={styles.recruiterAvatar}>
                👤
              </div>

              <div style={{ flex: 1 }}>
                {isEditing ? (
                  <>
                    <label style={styles.inlineLabel}>
                      FIRST NAME
                    </label>

                    <input
                      value={
                        company.recruiter.firstName
                      }
                      onChange={(e) =>
                        setCompany({
                          ...company,
                          recruiter: {
                            ...company.recruiter,
                            firstName:
                              e.target.value,
                          },
                        })
                      }
                      style={{
                        ...styles.editInput,
                        fontSize: '13px',
                        padding: '4px 8px',
                        marginBottom: '4px',
                      }}
                      placeholder="First name"
                    />

                    <label style={styles.inlineLabel}>
                      LAST NAME
                    </label>

                    <input
                      value={
                        company.recruiter.lastName
                      }
                      onChange={(e) =>
                        setCompany({
                          ...company,
                          recruiter: {
                            ...company.recruiter,
                            lastName:
                              e.target.value,
                          },
                        })
                      }
                      style={{
                        ...styles.editInput,
                        fontSize: '13px',
                        padding: '4px 8px',
                        marginBottom: '6px',
                      }}
                      placeholder="Last name"
                    />
                  </>
                ) : (
                  <p style={styles.recruiterName}>
                    {`${company.recruiter.firstName} ${company.recruiter.lastName}`.trim() ||
                      'Not specified'}
                  </p>
                )}

                {isEditing ? (
                  <>
                    <label style={styles.inlineLabel}>
                      ROLE / POSITION
                    </label>

                    <input
                      value={company.recruiter.role}
                      onChange={(e) =>
                        setCompany({
                          ...company,
                          recruiter: {
                            ...company.recruiter,
                            role: e.target.value,
                          },
                        })
                      }
                      style={{
                        ...styles.editInput,
                        fontSize: '12px',
                        padding: '4px 8px',
                      }}
                      placeholder="Recruiter role"
                    />
                  </>
                ) : (
                  <p style={styles.recruiterRole}>
                    {company.recruiter.role ||
                      'Not specified'}
                  </p>
                )}
              </div>
            </div>

            <div style={styles.recruiterContact}>
              <div style={styles.contactRow}>
                <span style={styles.contactIcon}>
                  ✉
                </span>

                <span style={styles.contactText}>
                  {company.recruiter.email ||
                    'Not specified'}
                </span>
              </div>

              <div style={styles.contactRow}>
                <span style={styles.contactIcon}>
                  📞
                </span>

                {isEditing ? (
                  <input
                    value={company.recruiter.phone}
                    onChange={(e) =>
                      setCompany({
                        ...company,
                        recruiter: {
                          ...company.recruiter,
                          phone: e.target.value,
                        },
                      })
                    }
                    style={{
                      ...styles.editInput,
                      fontSize: '12px',
                      padding: '4px 6px',
                    }}
                    placeholder="Phone number"
                  />
                ) : (
                  <span style={styles.contactText}>
                    {company.recruiter.phone ||
                      'Not specified'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account management */}
        <div style={styles.accountCard}>
          <div>
            <p style={styles.accountTitle}>
              Account Management
            </p>

            <p style={styles.accountSub}>
              Want to end your session? Your progress is automatically saved.
            </p>
          </div>

          <button
            type="button"
            style={styles.logoutBtn}
            onClick={() =>
              setShowLogoutModal(true)
            }
          >
            ⎋ Logout
          </button>
        </div>
      </div>

      {/* Logout modal */}
      {showLogoutModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalBadge}>
              🔐 ACCOUNT SECURITY
            </div>

            <h2 style={styles.modalTitle}>
              Bye!
            </h2>

            <p style={styles.modalSub}>
              Are you sure you want to log out?
            </p>

            <div style={styles.modalQuote}>
              <p style={styles.quoteText}>
                "More bright candidates are awaiting your help"
              </p>
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.confirmLogoutBtn}
                onClick={handleLogout}
              >
                Yes, Log Out ⎋
              </button>

              <button
                type="button"
                style={styles.stayBtn}
                onClick={() =>
                  setShowLogoutModal(false)
                }
              >
                Stay Logged In 🏠
              </button>
            </div>

            <div style={styles.modalFooter}>
              <span style={styles.footerIcons}>
                👤 🔒 🏅
              </span>

              <span style={styles.footerText}>
                Your session is encrypted and secure. See you soon.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '32px 24px',
  },

  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px',
  },

  pageTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#1a1e6c',
    marginBottom: '4px',
  },

  pageSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
  },

  editProfileBtn: {
    padding: '10px 22px',
    border: '1.5px solid #1a1e3c',
    color: '#1a1e3c',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    background: 'none',
  },

  mainRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },

  infoCard: {
    flex: 1,
    minWidth: '300px',
    background: '#ffffff',
    borderRadius: '16px',
    padding: '28px',
    border: '1px solid #e2e5f0',
  },

  companyHeader: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    alignItems: 'flex-start',
  },

  logo: {
    width: '80px',
    height: '80px',
    background: '#1a1e3c',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    flexShrink: 0,
  },

  companyName: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1a1e3c',
    marginBottom: '4px',
  },

  companyTagline: {
    fontSize: '13px',
    color: '#1a1e6c',
    fontWeight: '600',
    marginBottom: '12px',
  },

  metaRow: {
    display: 'flex',
    gap: '28px',
  },

  metaItem: {
    display: 'flex',
    flexDirection: 'column',
  },

  metaLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: '0.08em',
    marginBottom: '2px',
  },

  metaValue: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1a1e3c',
  },

  divider: {
    height: '1px',
    background: '#f1f5f9',
    margin: '16px 0',
  },

  descLabel: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1a1e3c',
    marginBottom: '10px',
  },

  descText: {
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: 1.7,
    textAlign: 'justify',
  },

  editInput: {
    width: '100%',
    padding: '8px 12px',
    border: '1.5px solid #1a1e6c',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1e3c',
    outline: 'none',
    marginBottom: '4px',
    boxSizing: 'border-box',
  },

  inlineLabel: {
    display: 'block',
    fontSize: '9px',
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: '0.06em',
    marginBottom: '2px',
  },

  editTextarea: {
    width: '100%',
    padding: '12px',
    border: '1.5px solid #1a1e6c',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: 1.6,
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
  },

  recruiterCard: {
    width: '260px',
    flexShrink: 0,
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e2e5f0',
  },

  recruiterLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: '0.08em',
    marginBottom: '14px',
  },

  recruiterHeader: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '16px',
  },

  recruiterAvatar: {
    width: '44px',
    height: '44px',
    background: '#f0f2f8',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    border: '2px solid #e2e5f0',
    flexShrink: 0,
  },

  recruiterName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1a1e3c',
    marginBottom: '2px',
  },

  recruiterRole: {
    fontSize: '12px',
    color: '#6b7280',
  },

  recruiterContact: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  contactRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },

  contactIcon: {
    fontSize: '14px',
    color: '#6b7280',
    width: '18px',
    flexShrink: 0,
  },

  contactText: {
    fontSize: '13px',
    color: '#374151',
  },

  accountCard: {
    background: '#ffffff',
    border: '1px solid #e2e5f0',
    borderRadius: '16px',
    padding: '20px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  accountTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: '2px',
  },

  accountSub: {
    fontSize: '13px',
    color: '#6b7280',
  },

  logoutBtn: {
    padding: '10px 22px',
    background: '#dc2626',
    color: '#ffffff',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    border: 'none',
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },

  modal: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '36px',
    width: '480px',
    maxWidth: '90vw',
  },

  modalBadge: {
    display: 'inline-block',
    padding: '5px 12px',
    background: '#f0f2f8',
    color: '#1a1e6c',
    borderRadius: '99px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.05em',
    marginBottom: '12px',
  },

  modalTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#1a1e6c',
    marginBottom: '4px',
  },

  modalSub: {
    fontSize: '16px',
    color: '#374151',
    fontWeight: '600',
    marginBottom: '16px',
  },

  modalQuote: {
    borderLeft: '3px solid #1a1e6c',
    paddingLeft: '16px',
    marginBottom: '24px',
  },

  quoteText: {
    fontSize: '14px',
    color: '#4b5563',
    fontStyle: 'italic',
  },

  modalActions: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  },

  confirmLogoutBtn: {
    flex: 1,
    padding: '12px',
    background: '#1a1e6c',
    color: '#ffffff',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    border: 'none',
  },

  stayBtn: {
    flex: 1,
    padding: '12px',
    background: 'none',
    border: '1.5px solid #1a1e6c',
    color: '#1a1e6c',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
  },

  modalFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingTop: '16px',
    borderTop: '1px solid #f1f5f9',
  },

  footerIcons: {
    fontSize: '16px',
    letterSpacing: '2px',
  },

  footerText: {
    fontSize: '12px',
    color: '#9ca3af',
  },
}