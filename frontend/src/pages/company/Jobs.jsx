import { useState, useEffect } from 'react'
import {
  useNavigate,
  useLocation,
} from 'react-router-dom'

import Navbar from '../../components/Navbar'
import API from '../../services/api'

const statusStyle = {
  APPROVED: {
    bg: '#dcfce7',
    color: '#16a34a',
    dot: '#16a34a',
    text: 'Active',
  },

  PENDING: {
    bg: '#fef3c7',
    color: '#d97706',
    dot: '#d97706',
    text: 'Pending Approval',
  },

  DRAFT: {
    bg: '#f1f5f9',
    color: '#64748b',
    dot: '#94a3b8',
    text: 'Draft',
  },

  CLOSED: {
    bg: '#fee2e2',
    color: '#dc2626',
    dot: '#dc2626',
    text: 'Closed',
  },
}

const createEmptyForm = (isDraft = false) => ({
  title: '',
  department: '',
  location: '',
  job_type: 'Full-Time',
  experience_level: 'Entry Level',
  deadline: '',
  description: '',
  responsibilities: '',
  requirements: '',
  benefits: '',
  currency: 'IDR',
  salary_min: '',
  salary_max: '',
  salary_unit: 'monthly',
  is_draft: isDraft,
})

export default function Jobs() {
  const navigate = useNavigate()
  const location = useLocation()

  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] =
    useState(false)

  const [editingJobId, setEditingJobId] =
    useState(null)

  const [formData, setFormData] = useState(
    createEmptyForm()
  )

  const [postedJobs, setPostedJobs] =
    useState([])

  const [summaryStats, setSummaryStats] =
    useState({
      activeJobs: 0,
      totalApplicants: 0,
    })

  const fetchJobsPageData = async () => {
    try {
      setLoading(true)

      const [dashboardRes, jobsRes] =
        await Promise.all([
          API.get('/companies/dashboard'),
          API.get('/companies/jobs'),
        ])

      if (dashboardRes.data) {
        setSummaryStats({
          activeJobs:
            dashboardRes.data.active_jobs ||
            0,
          totalApplicants:
            dashboardRes.data
              .total_applicants || 0,
        })
      }

      setPostedJobs(jobsRes.data || [])
    } catch (err) {
      console.error(
        'Error fetching jobs management data:',
        err
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobsPageData()
  }, [])

  useEffect(() => {
    if (
      location.state &&
      location.state.openModal
    ) {
      setEditingJobId(null)
      setFormData(createEmptyForm(true))
      setIsModalOpen(true)

      window.history.replaceState(
        {},
        document.title
      )
    }
  }, [location.state])

  const resetForm = () => {
    setFormData(createEmptyForm())
    setEditingJobId(null)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const handleSaveJob = async (
    isDraftMode
  ) => {
    const finalFormData = {
      ...formData,
      is_draft: isDraftMode,
      salary_min:
        formData.salary_min === ''
          ? null
          : formData.salary_min,
      salary_max:
        formData.salary_max === ''
          ? null
          : formData.salary_max,
      deadline:
        formData.deadline || null,
    }

    try {
      if (editingJobId) {
        const response = await API.put(
          `/companies/jobs/${editingJobId}`,
          finalFormData
        )

        alert(
          response.data?.message ||
            'Job listing updated successfully!'
        )
      } else {
        const response = await API.post(
          '/companies/jobs',
          finalFormData
        )

        alert(
          response.data?.message ||
            'Job listing created successfully!'
        )
      }

      setIsModalOpen(false)
      resetForm()

      await fetchJobsPageData()
    } catch (err) {
      console.error(
        'Error saving job listing:',
        err
      )

      alert(
        err.response?.data?.message ||
          'Failed to save job listing.'
      )
    }
  }

  const validateAndSubmit = (
    e,
    isDraftMode
  ) => {
    e.preventDefault()

    if (
      !formData.title.trim() ||
      !formData.location.trim() ||
      !formData.description.trim()
    ) {
      alert(
        'Please fill out all required fields marked with an asterisk (*)'
      )
      return
    }

    if (
      formData.salary_min !== '' &&
      formData.salary_max !== '' &&
      Number(formData.salary_min) >
        Number(formData.salary_max)
    ) {
      alert(
        'Minimum salary cannot be greater than maximum salary.'
      )
      return
    }

    handleSaveJob(isDraftMode)
  }

  const openCreateModal = () => {
    setEditingJobId(null)
    setFormData(createEmptyForm(true))
    setIsModalOpen(true)
  }

  const openEditModal = (job) => {
    setEditingJobId(
      job.job_id || job.id
    )

    setFormData({
      title: job.title || '',
      department:
        job.department || '',
      location: job.location || '',
      job_type:
        job.job_type || 'Full-Time',
      experience_level:
        job.experience_level ||
        'Entry Level',
      deadline: job.deadline
        ? job.deadline.substring(0, 10)
        : '',
      description:
        job.description || '',
      responsibilities:
        job.responsibilities || '',
      requirements:
        job.requirements || '',
      benefits: job.benefits || '',
      currency:
        job.currency || 'IDR',
      salary_min:
        job.salary_min ?? '',
      salary_max:
        job.salary_max ?? '',
      salary_unit:
        job.salary_unit || 'monthly',
      is_draft:
        job.status?.toLowerCase() ===
        'draft',
    })

    setIsModalOpen(true)
  }

  const filtered = postedJobs.filter(
    (job) => {
      const keyword =
        search.toLowerCase()

      const matchSearch = [
        job.title,
        job.department,
        job.location,
        job.description,
      ].some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(keyword)
      )

      const currentStatus =
        job.status?.toUpperCase() ||
        'DRAFT'

      let matchStatus =
        filter === 'All'

      if (filter === 'Active') {
        matchStatus =
          currentStatus === 'APPROVED'
      }

      if (filter === 'Draft') {
        matchStatus =
          currentStatus === 'DRAFT'
      }

      if (filter === 'Closed') {
        matchStatus =
          currentStatus === 'CLOSED'
      }

      return (
        matchSearch && matchStatus
      )
    }
  )

  if (
    loading &&
    postedJobs.length === 0
  ) {
    return (
      <div
        style={{
          minHeight: '100vh',
        }}
      >
        <Navbar />

        <div
          style={{
            padding: '48px',
            textAlign: 'center',
            color: '#6b7280',
          }}
        >
          Loading job tracking records...
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
      }}
    >
      <Navbar />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>
              Job Postings
            </h1>

            <p
              style={
                styles.pageSubtitle
              }
            >
              Manage and track your
              active listings and
              candidate pipelines.
            </p>
          </div>

          <div style={styles.statPills}>
            <div style={styles.statPill}>
              <span
                style={
                  styles.statPillIcon
                }
              >
                💼
              </span>

              <div>
                <p
                  style={
                    styles.statPillLabel
                  }
                >
                  TOTAL ACTIVE
                </p>

                <p
                  style={
                    styles.statPillValue
                  }
                >
                  {
                    summaryStats.activeJobs
                  }
                </p>
              </div>
            </div>

            <div style={styles.statPill}>
              <span
                style={
                  styles.statPillIcon
                }
              >
                👥
              </span>

              <div>
                <p
                  style={
                    styles.statPillLabel
                  }
                >
                  TOTAL APPLICANTS
                </p>

                <p
                  style={{
                    ...styles.statPillValue,
                    color: '#ca8a04',
                  }}
                >
                  {
                    summaryStats.totalApplicants
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div style={styles.toolbar}>
          <input
            placeholder="🔍  Search by job title or keyword..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            style={styles.searchInput}
          />

          <div style={styles.filterRow}>
            {[
              'All',
              'Active',
              'Draft',
              'Closed',
            ].map((item) => (
              <button
                key={item}
                type="button"
                style={{
                  ...styles.filterBtn,
                  background:
                    filter === item
                      ? '#1a1e6c'
                      : 'none',
                  color:
                    filter === item
                      ? '#ffffff'
                      : '#374151',
                }}
                onClick={() =>
                  setFilter(item)
                }
              >
                {item === 'All'
                  ? `⚙ Status: ${item}`
                  : item}
              </button>
            ))}
          </div>
        </div>

        {/* Job cards */}
        <div style={styles.grid}>
          <div
            style={styles.createCard}
            onClick={openCreateModal}
          >
            <div
              style={
                styles.createPlus
              }
            >
              +
            </div>

            <p
              style={
                styles.createTitle
              }
            >
              Create New Draft
            </p>

            <p
              style={styles.createSub}
            >
              Start drafting your next
              open role.
            </p>
          </div>

          {filtered.map((job) => {
            const statusKey =
              job.status?.toUpperCase() ||
              'DRAFT'

            const currentStyle =
              statusStyle[statusKey] ||
              statusStyle.DRAFT

            return (
              <div
                key={
                  job.job_id ||
                  job.id
                }
                style={styles.jobCard}
              >
                <div
                  style={styles.cardTop}
                >
                  <span
                    style={{
                      ...styles.statusBadge,
                      background:
                        currentStyle.bg,
                      color:
                        currentStyle.color,
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius:
                          '50%',
                        background:
                          currentStyle.dot,
                        display:
                          'inline-block',
                        marginRight:
                          '6px',
                      }}
                    />

                    {
                      currentStyle.text
                    }
                  </span>
                </div>

                <h3
                  style={styles.jobTitle}
                >
                  {job.title}
                </h3>

                <div
                  style={styles.jobMeta}
                >
                  {job.location && (
                    <span>
                      📍 {job.location}
                    </span>
                  )}

                  {job.job_type && (
                    <span>
                      💼 {job.job_type}
                    </span>
                  )}

                  <span>
                    🕐{' '}
                    {job.created_at
                      ? new Date(
                          job.created_at
                        ).toLocaleDateString(
                          'en-US',
                          {
                            day: 'numeric',
                            month: 'short',
                          }
                        )
                      : 'Recent'}
                  </span>
                </div>

                <div
                  style={
                    styles.cardDivider
                  }
                />

                <div
                  style={
                    styles.cardFooter
                  }
                >
                  <div>
                    <p
                      style={
                        styles.applicantLabel
                      }
                    >
                      APPLICANTS
                    </p>

                    <p
                      style={
                        styles.applicantCount
                      }
                    >
                      {job.applicant_count ||
                        job.applicants ||
                        0}
                    </p>
                  </div>

                  {statusKey ===
                  'DRAFT' ? (
                    <button
                      type="button"
                      style={
                        styles.editBtn
                      }
                      onClick={() =>
                        openEditModal(
                          job
                        )
                      }
                    >
                      Edit Draft
                    </button>
                  ) : (
                    <button
                      type="button"
                      style={
                        styles.pipelineBtn
                      }
                      onClick={() =>
                        navigate(
                          `/company/jobs/${
                            job.job_id ||
                            job.id
                          }`
                        )
                      }
                    >
                      View Pipeline
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div
            style={
              styles.modalOverlay
            }
          >
            <div
              style={
                styles.modalContent
              }
            >
              <div
                style={
                  styles.modalHeader
                }
              >
                <h3
                  style={
                    styles.modalTitle
                  }
                >
                  {editingJobId
                    ? 'Edit Position'
                    : formData.is_draft
                      ? 'Draft New Position'
                      : 'Publish Open Position'}
                </h3>

                <button
                  type="button"
                  onClick={closeModal}
                  style={
                    styles.closeXBtn
                  }
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={(e) =>
                  validateAndSubmit(
                    e,
                    false
                  )
                }
                style={
                  styles.formContainer
                }
              >
                <div
                  style={
                    styles.scrollableForm
                  }
                >
                  {/* Title + Department */}
                  <div
                    style={
                      styles.formRow
                    }
                  >
                    <div
                      style={{
                        flex: 1,
                      }}
                    >
                      <label
                        style={
                          styles.formLabel
                        }
                      >
                        Job Title *
                      </label>

                      <input
                        type="text"
                        required
                        placeholder="e.g. Network Engineer"
                        style={
                          styles.formInput
                        }
                        value={
                          formData.title
                        }
                        onChange={(e) =>
                          setFormData(
                            {
                              ...formData,
                              title:
                                e.target
                                  .value,
                            }
                          )
                        }
                      />
                    </div>

                    <div
                      style={{
                        flex: 1,
                      }}
                    >
                      <label
                        style={
                          styles.formLabel
                        }
                      >
                        Department
                      </label>

                      <input
                        type="text"
                        placeholder="e.g. IT / Technology"
                        style={
                          styles.formInput
                        }
                        value={
                          formData.department
                        }
                        onChange={(e) =>
                          setFormData(
                            {
                              ...formData,
                              department:
                                e.target
                                  .value,
                            }
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Location + Job Type */}
                  <div
                    style={
                      styles.formRow
                    }
                  >
                    <div
                      style={{
                        flex: 1,
                      }}
                    >
                      <label
                        style={
                          styles.formLabel
                        }
                      >
                        Location / City *
                      </label>

                      <input
                        type="text"
                        required
                        placeholder="e.g. Jakarta, Indonesia"
                        style={
                          styles.formInput
                        }
                        value={
                          formData.location
                        }
                        onChange={(e) =>
                          setFormData(
                            {
                              ...formData,
                              location:
                                e.target
                                  .value,
                            }
                          )
                        }
                      />
                    </div>

                    <div
                      style={{
                        flex: 1,
                      }}
                    >
                      <label
                        style={
                          styles.formLabel
                        }
                      >
                        Job Type
                      </label>

                      <select
                        style={
                          styles.formInput
                        }
                        value={
                          formData.job_type
                        }
                        onChange={(e) =>
                          setFormData(
                            {
                              ...formData,
                              job_type:
                                e.target
                                  .value,
                            }
                          )
                        }
                      >
                        <option value="Full-Time">
                          Full-Time
                        </option>

                        <option value="Part-Time">
                          Part-Time
                        </option>

                        <option value="Internship">
                          Internship
                        </option>

                        <option value="Contract">
                          Contract
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Experience + Deadline */}
                  <div
                    style={
                      styles.formRow
                    }
                  >
                    <div
                      style={{
                        flex: 1,
                      }}
                    >
                      <label
                        style={
                          styles.formLabel
                        }
                      >
                        Experience Level
                      </label>

                      <select
                        style={
                          styles.formInput
                        }
                        value={
                          formData.experience_level
                        }
                        onChange={(e) =>
                          setFormData(
                            {
                              ...formData,
                              experience_level:
                                e.target
                                  .value,
                            }
                          )
                        }
                      >
                        <option value="Entry Level">
                          Entry Level
                        </option>

                        <option value="Mid Level">
                          Mid Level
                        </option>

                        <option value="Senior Level">
                          Senior Level
                        </option>
                      </select>
                    </div>

                    <div
                      style={{
                        flex: 1,
                      }}
                    >
                      <label
                        style={
                          styles.formLabel
                        }
                      >
                        Application Deadline
                      </label>

                      <input
                        type="date"
                        style={
                          styles.formInput
                        }
                        value={
                          formData.deadline
                        }
                        onChange={(e) =>
                          setFormData(
                            {
                              ...formData,
                              deadline:
                                e.target
                                  .value,
                            }
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Salary */}
                  <div
                    style={{
                      marginBottom:
                        '4px',
                    }}
                  >
                    <label
                      style={
                        styles.formLabel
                      }
                    >
                      Salary Components
                    </label>

                    <div
                      style={{
                        display: 'flex',
                        gap: '10px',
                      }}
                    >
                      <select
                        value={
                          formData.currency
                        }
                        onChange={(e) =>
                          setFormData(
                            {
                              ...formData,
                              currency:
                                e.target
                                  .value,
                            }
                          )
                        }
                        style={{
                          ...styles.formInput,
                          width: '90px',
                        }}
                      >
                        <option value="IDR">
                          IDR (Rp)
                        </option>

                        <option value="USD">
                          USD ($)
                        </option>

                        <option value="SGD">
                          SGD ($)
                        </option>
                      </select>

                      <input
                        type="number"
                        min="0"
                        placeholder="Min Salary"
                        value={
                          formData.salary_min
                        }
                        onChange={(e) =>
                          setFormData(
                            {
                              ...formData,
                              salary_min:
                                e.target
                                  .value,
                            }
                          )
                        }
                        style={{
                          ...styles.formInput,
                          flex: 1,
                        }}
                      />

                      <input
                        type="number"
                        min="0"
                        placeholder="Max Salary"
                        value={
                          formData.salary_max
                        }
                        onChange={(e) =>
                          setFormData(
                            {
                              ...formData,
                              salary_max:
                                e.target
                                  .value,
                            }
                          )
                        }
                        style={{
                          ...styles.formInput,
                          flex: 1,
                        }}
                      />

                      <select
                        value={
                          formData.salary_unit
                        }
                        onChange={(e) =>
                          setFormData(
                            {
                              ...formData,
                              salary_unit:
                                e.target
                                  .value,
                            }
                          )
                        }
                        style={{
                          ...styles.formInput,
                          width: '110px',
                        }}
                      >
                        <option value="monthly">
                          / month
                        </option>

                        <option value="yearly">
                          / year
                        </option>
                      </select>
                    </div>
                  </div>

                  <label
                    style={
                      styles.formLabel
                    }
                  >
                    Core Job Description *
                  </label>

                  <textarea
                    required
                    rows="3"
                    placeholder="Provide a brief summary of the role..."
                    style={
                      styles.formTextarea
                    }
                    value={
                      formData.description
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description:
                          e.target.value,
                      })
                    }
                  />

                  <label
                    style={
                      styles.formLabel
                    }
                  >
                    Key Responsibilities
                  </label>

                  <textarea
                    rows="3"
                    placeholder={
                      '• Maintain infrastructure systems\n• Troubleshooting core networks'
                    }
                    style={
                      styles.formTextarea
                    }
                    value={
                      formData.responsibilities
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        responsibilities:
                          e.target.value,
                      })
                    }
                  />

                  <label
                    style={
                      styles.formLabel
                    }
                  >
                    Requirements
                  </label>

                  <textarea
                    rows="3"
                    placeholder={
                      "• Bachelor's degree in Computer Science\n• CCNA Certification is a plus"
                    }
                    style={
                      styles.formTextarea
                    }
                    value={
                      formData.requirements
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requirements:
                          e.target.value,
                      })
                    }
                  />

                  <label
                    style={
                      styles.formLabel
                    }
                  >
                    Benefits & Perks
                  </label>

                  <textarea
                    rows="2"
                    placeholder="• Health Insurance, Remote working days"
                    style={
                      styles.formTextarea
                    }
                    value={
                      formData.benefits
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        benefits:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div
                  style={
                    styles.modalFooterActions
                  }
                >
                  <button
                    type="button"
                    onClick={closeModal}
                    style={
                      styles.formCancelBtn
                    }
                  >
                    Cancel
                  </button>

                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) =>
                        validateAndSubmit(
                          e,
                          true
                        )
                      }
                      style={{
                        ...styles.formCancelBtn,
                        background:
                          '#f1f5f9',
                        color:
                          '#475569',
                        border:
                          '1px solid #cbd5e1',
                      }}
                    >
                      Save Draft
                    </button>

                    <button
                      type="button"
                      onClick={(e) =>
                        validateAndSubmit(
                          e,
                          false
                        )
                      }
                      style={
                        styles.formSubmitBtn
                      }
                    >
                      {editingJobId
                        ? 'Update Listing'
                        : 'Post Listing'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Pagination info */}
        <div style={styles.pagination}>
          <p
            style={
              styles.paginationText
            }
          >
            Showing {filtered.length} of{' '}
            {postedJobs.length} job
            postings
          </p>
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

  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },

  pageTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#1a1e3c',
    marginBottom: '4px',
  },

  pageSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
  },

  statPills: {
    display: 'flex',
    gap: '12px',
  },

  statPill: {
    background: '#ffffff',
    border: '1px solid #e2e5f0',
    borderRadius: '12px',
    padding: '12px 20px',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },

  statPillIcon: {
    fontSize: '22px',
  },

  statPillLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: '0.08em',
  },

  statPillValue: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1a1e3c',
    lineHeight: 1.2,
  },

  toolbar: {
    background: '#ffffff',
    border: '1px solid #e2e5f0',
    borderRadius: '12px',
    padding: '16px 20px',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },

  searchInput: {
    flex: 1,
    minWidth: '200px',
    padding: '8px 14px',
    border: '1px solid #e2e5f0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    color: '#374151',
  },

  filterRow: {
    display: 'flex',
    gap: '8px',
  },

  filterBtn: {
    padding: '8px 14px',
    border: '1px solid #e2e5f0',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },

  createCard: {
    background: '#ffffff',
    border: '2px dashed #cbd5e1',
    borderRadius: '16px',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    minHeight: '200px',
  },

  createPlus: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: '#e0e7ff',
    color: '#1a1e6c',
    fontSize: '24px',
    fontWeight: '300',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
  },

  createTitle: {
    fontWeight: '700',
    color: '#1a1e3c',
    fontSize: '15px',
    marginBottom: '4px',
  },

  createSub: {
    fontSize: '13px',
    color: '#9ca3af',
    textAlign: 'center',
  },

  jobCard: {
    background: '#ffffff',
    border: '1px solid #e2e5f0',
    borderRadius: '16px',
    padding: '20px 20px 16px',
    display: 'flex',
    flexDirection: 'column',
  },

  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },

  statusBadge: {
    padding: '4px 10px',
    borderRadius: '99px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
  },

  jobTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#1a1e3c',
    marginBottom: '8px',
  },

  jobMeta: {
    fontSize: '13px',
    color: '#6b7280',
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '8px',
  },

  cardDivider: {
    height: '1px',
    background: '#f1f5f9',
    margin: '12px 0',
  },

  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  applicantLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: '0.08em',
  },

  applicantCount: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1a1e3c',
  },

  pipelineBtn: {
    padding: '8px 18px',
    background: '#1a1e6c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
  },

  editBtn: {
    padding: '8px 18px',
    background: 'none',
    border: '1.5px solid #1a1e6c',
    color: '#1a1e6c',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    alignSelf: 'flex-end',
  },

  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  paginationText: {
    fontSize: '13px',
    color: '#6b7280',
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background:
      'rgba(26, 30, 60, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },

  modalContent: {
    background: '#ffffff',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '700px',
    maxHeight: '85vh',
    padding: '24px',
    boxShadow:
      '0 12px 32px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom:
      '1px solid #f1f5f9',
    paddingBottom: '12px',
  },

  modalTitle: {
    fontSize: '19px',
    fontWeight: '800',
    color: '#1a1e3c',
    margin: 0,
  },

  closeXBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#94a3b8',
  },

  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flex: 1,
  },

  scrollableForm: {
    overflowY: 'auto',
    padding: '4px 12px 24px 4px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxHeight: '65vh',
  },

  formRow: {
    display: 'flex',
    gap: '12px',
  },

  formLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#475569',
    display: 'block',
    marginBottom: '2px',
    marginTop: '4px',
  },

  formInput: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    color: '#334155',
  },

  formTextarea: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    resize: 'vertical',
    outline: 'none',
    color: '#334155',
    lineHeight: '1.5',
    minHeight: '80px',
  },

  modalFooterActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '16px',
    borderTop:
      '1px solid #f1f5f9',
    paddingTop: '16px',
  },

  formCancelBtn: {
    padding: '9px 18px',
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
  },

  formSubmitBtn: {
    padding: '9px 22px',
    background: '#1a1e6c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
  },
}