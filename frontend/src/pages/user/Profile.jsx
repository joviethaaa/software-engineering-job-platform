import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import API from '../../services/api'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    city: '',
    phone: '',
    nationality: '',
    languages: '',
    noticePeriod: '',
  })

  const [skills, setSkills] = useState([])
  const [experiences, setExperiences] = useState([])
  const [educations, setEducations] = useState([])
  const [cvData, setCvData] = useState(null)

  const [newSkill, setNewSkill] = useState({
    skill_name: '',
    percentage: 80,
  })

  const [newExp, setNewExp] = useState({
    job_title: '',
    company_name: '',
    period: '',
    job_type: 'Full-Time',
    description: '',
    is_active: 0,
  })

  const [newEdu, setNewEdu] = useState({
    degree_name: '',
    institution_name: '',
    graduation_year: '',
  })

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        setError('')

        const [
          profileRes,
          skillsRes,
          expRes,
          eduRes,
          cvRes,
        ] = await Promise.all([
          API.get('/users/profile'),
          API.get('/users/profile/skills'),
          API.get('/users/profile/experiences'),
          API.get('/users/profile/educations'),
          API.get('/users/cv'),
        ])

        if (profileRes.data) {
          const d = profileRes.data

          setForm({
            firstName:
              d.first_name ||
              d.firstName ||
              '',
            lastName:
              d.last_name ||
              d.lastName ||
              '',
            city: d.city || '',
            phone: d.phone || '',
            nationality: d.nationality || '',
            languages: d.languages || '',
            noticePeriod:
              d.notice_period ||
              d.noticePeriod ||
              '',
          })
        }

        setSkills(skillsRes.data || [])
        setExperiences(expRes.data || [])
        setEducations(eduRes.data || [])

        if (
          Array.isArray(cvRes.data) &&
          cvRes.data.length > 0
        ) {
          setCvData(cvRes.data[0])
        } else if (
          cvRes.data &&
          !Array.isArray(cvRes.data)
        ) {
          setCvData(cvRes.data)
        } else {
          setCvData(null)
        }
      } catch (err) {
        console.error(
          'Error fetching profile:',
          err
        )

        setError(
          err.response?.data?.message ||
            'Failed to load profile data.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const isExperienceVerified =
    experiences.length > 0

  const isCvVerified =
    cvData &&
    cvData.status?.toLowerCase() ===
      'approved'

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSaveChanges = async () => {
    try {
      setLoading(true)

      const dataToBackend = {
        first_name: form.firstName,
        last_name: form.lastName,
        city: form.city,
        phone: form.phone || '',
        nationality: form.nationality,
        languages: form.languages,
        notice_period: form.noticePeriod,
      }

      const response = await API.put(
        '/users/profile',
        dataToBackend
      )

      if (response.data) {
        const d = response.data

        setForm({
          firstName:
            d.first_name ||
            d.firstName ||
            form.firstName,
          lastName:
            d.last_name ||
            d.lastName ||
            form.lastName,
          city:
            d.city !== undefined
              ? d.city
              : form.city,
          phone:
            d.phone !== undefined
              ? d.phone
              : form.phone,
          nationality:
            d.nationality !== undefined
              ? d.nationality
              : form.nationality,
          languages:
            d.languages !== undefined
              ? d.languages
              : form.languages,
          noticePeriod:
            d.notice_period !== undefined
              ? d.notice_period
              : d.noticePeriod !== undefined
                ? d.noticePeriod
                : form.noticePeriod,
        })
      }

      setEditing(false)

      alert(
        'Profile overview updated successfully!'
      )
    } catch (err) {
      console.error(
        'Error updating profile:',
        err
      )

      alert(
        err.response?.data?.message ||
          'Failed to update profile. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleAddSkill = async () => {
    if (!newSkill.skill_name.trim()) {
      return
    }

    try {
      const res = await API.post(
        '/users/profile/skills',
        newSkill
      )

      setSkills([
        ...skills,
        res.data,
      ])

      setNewSkill({
        skill_name: '',
        percentage: 80,
      })
    } catch (err) {
      console.error(err)
      alert('Failed to add skill')
    }
  }

  const handleAddExperience =
    async () => {
      if (
        !newExp.job_title.trim() ||
        !newExp.company_name.trim()
      ) {
        alert(
          'Please fill in Job Title and Company Name!'
        )
        return
      }

      try {
        const res = await API.post(
          '/users/profile/experiences',
          newExp
        )

        setExperiences([
          ...experiences,
          res.data,
        ])

        setNewExp({
          job_title: '',
          company_name: '',
          period: '',
          job_type: 'Full-Time',
          description: '',
          is_active: 0,
        })

        alert(
          'Experience added successfully!'
        )
      } catch (err) {
        console.error(err)
        alert(
          err.response?.data?.message ||
            'Failed to add experience'
        )
      }
    }

  const handleAddEducation =
    async () => {
      if (
        !newEdu.degree_name.trim() ||
        !newEdu.institution_name.trim()
      ) {
        return
      }

      try {
        const res = await API.post(
          '/users/profile/educations',
          newEdu
        )

        setEducations([
          ...educations,
          res.data,
        ])

        setNewEdu({
          degree_name: '',
          institution_name: '',
          graduation_year: '',
        })
      } catch (err) {
        console.error(err)
        alert(
          err.response?.data?.message ||
            'Failed to add education'
        )
      }
    }

  const handleDeleteSkill = async (
    id
  ) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this skill?'
      )
    ) {
      return
    }

    try {
      await API.delete(
        `/users/profile/skills/${id}`
      )

      setSkills(
        skills.filter(
          (skill) => skill.id !== id
        )
      )
    } catch (err) {
      console.error(err)
      alert(
        err.response?.data?.message ||
          'Failed to delete skill'
      )
    }
  }

  const handleDeleteExperience =
    async (id) => {
      if (
        !window.confirm(
          'Are you sure you want to delete this experience?'
        )
      ) {
        return
      }

      try {
        await API.delete(
          `/users/profile/experiences/${id}`
        )

        setExperiences(
          experiences.filter(
            (experience) =>
              experience.id !== id
          )
        )
      } catch (err) {
        console.error(err)
        alert(
          err.response?.data?.message ||
            'Failed to delete experience'
        )
      }
    }

  const handleDeleteEducation =
    async (id) => {
      if (
        !window.confirm(
          'Are you sure you want to delete this education record?'
        )
      ) {
        return
      }

      try {
        await API.delete(
          `/users/profile/educations/${id}`
        )

        setEducations(
          educations.filter(
            (education) =>
              education.id !== id
          )
        )
      } catch (err) {
        console.error(err)
        alert(
          err.response?.data?.message ||
            'Failed to delete education'
        )
      }
    }

  const handleEditSkill = async (
    skill
  ) => {
    const newName = window.prompt(
      'Edit Skill Name:',
      skill.skill_name
    )

    if (!newName) {
      return
    }

    const newPercent =
      window.prompt(
        'Edit Percentage (1-100):',
        skill.percentage
      )

    if (!newPercent) {
      return
    }

    const percentage = Number.parseInt(
      newPercent,
      10
    )

    if (
      Number.isNaN(percentage) ||
      percentage < 1 ||
      percentage > 100
    ) {
      alert(
        'Percentage must be between 1 and 100.'
      )
      return
    }

    try {
      const res = await API.put(
        `/users/profile/skills/${skill.id}`,
        {
          skill_name: newName,
          percentage,
        }
      )

      setSkills(
        skills.map((item) =>
          item.id === skill.id
            ? res.data
            : item
        )
      )
    } catch (err) {
      console.error(err)
      alert(
        err.response?.data?.message ||
          'Failed to update skill'
      )
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (
    loading &&
    !form.firstName
  ) {
    return (
      <div>
        <Navbar />

        <div
          style={{
            padding: '48px',
            textAlign: 'center',
            color: '#6b7280',
          }}
        >
          Loading profile...
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />

      <div style={styles.container}>
        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {/* Header card */}
        <div style={styles.headerCard}>
          <div style={styles.avatarWrapper}>
            <div style={styles.avatar}>
              👤
            </div>
          </div>

          <div style={styles.headerInfo}>
            <h1 style={styles.name}>
              {form.firstName}{' '}
              {form.lastName}
            </h1>

            <p style={styles.candidateId}>
              CANDIDATE ID: EM-
              {String(
                user?.user_id ||
                  user?.id ||
                  1
              ).padStart(4, '0')}
            </p>

            <p style={styles.location}>
              📍{' '}
              {form.city ||
                'Not specified'}
            </p>

            <div style={styles.badges}>
              {isExperienceVerified ? (
                <span
                  style={{
                    ...styles.badge,
                    background:
                      '#dcfce7',
                    color: '#16a34a',
                  }}
                >
                  ✅ Verified Experience
                </span>
              ) : (
                <span
                  style={{
                    ...styles.badge,
                    background:
                      '#f3f4f6',
                    color: '#9ca3af',
                  }}
                >
                  ⚪ No Verified Experience
                </span>
              )}

              {isCvVerified ? (
                <span
                  style={{
                    ...styles.badge,
                    background:
                      '#dcfce7',
                    color: '#16a34a',
                  }}
                >
                  ✅ CV Verified
                </span>
              ) : (
                <span
                  style={{
                    ...styles.badge,
                    background:
                      '#fef3c7',
                    color: '#d97706',
                  }}
                >
                  ⏳ CV Unverified / Pending
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            style={styles.editBtn}
            onClick={() =>
              setEditing(!editing)
            }
          >
            ✏️{' '}
            {editing
              ? 'Cancel'
              : 'Edit Profile'}
          </button>
        </div>

        <div style={styles.body}>
          {/* Left */}
          <div style={styles.left}>
            {/* Overview */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>
                ℹ️ Overview
              </h2>

              {editing ? (
                <div>
                  <div style={styles.field}>
                    <label
                      style={styles.label}
                    >
                      First Name
                    </label>

                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={
                        handleChange
                      }
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.field}>
                    <label
                      style={styles.label}
                    >
                      Last Name
                    </label>

                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={
                        handleChange
                      }
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.field}>
                    <label
                      style={styles.label}
                    >
                      City
                    </label>

                    <input
                      name="city"
                      value={form.city}
                      onChange={
                        handleChange
                      }
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.field}>
                    <label
                      style={styles.label}
                    >
                      Nationality
                    </label>

                    <input
                      name="nationality"
                      value={
                        form.nationality
                      }
                      onChange={
                        handleChange
                      }
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.field}>
                    <label
                      style={styles.label}
                    >
                      Languages
                    </label>

                    <input
                      name="languages"
                      value={
                        form.languages
                      }
                      onChange={
                        handleChange
                      }
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.field}>
                    <label
                      style={styles.label}
                    >
                      Notice Period
                    </label>

                    <input
                      name="noticePeriod"
                      value={
                        form.noticePeriod
                      }
                      onChange={
                        handleChange
                      }
                      style={styles.input}
                    />
                  </div>

                  <button
                    type="button"
                    style={styles.saveBtn}
                    onClick={
                      handleSaveChanges
                    }
                    disabled={loading}
                  >
                    {loading
                      ? 'Saving...'
                      : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <div
                  style={
                    styles.overviewGrid
                  }
                >
                  <div
                    style={
                      styles.overviewItem
                    }
                  >
                    <p
                      style={
                        styles.overviewLabel
                      }
                    >
                      NATIONALITY
                    </p>

                    <p
                      style={
                        styles.overviewValue
                      }
                    >
                      {form.nationality ||
                        'Not specified'}
                    </p>
                  </div>

                  <div
                    style={
                      styles.overviewItem
                    }
                  >
                    <p
                      style={
                        styles.overviewLabel
                      }
                    >
                      LANGUAGES
                    </p>

                    <p
                      style={
                        styles.overviewValue
                      }
                    >
                      {form.languages ||
                        'Not specified'}
                    </p>
                  </div>

                  <div
                    style={
                      styles.overviewItem
                    }
                  >
                    <p
                      style={
                        styles.overviewLabel
                      }
                    >
                      NOTICE PERIOD
                    </p>

                    <p
                      style={
                        styles.overviewValue
                      }
                    >
                      {form.noticePeriod ||
                        'Not specified'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Skills */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>
                🎯 Top Skills
              </h2>

              {skills.length > 0 ? (
                skills.map(
                  (skill, index) => (
                    <div
                      key={
                        skill.id ||
                        index
                      }
                      style={{
                        ...styles.skillRow,
                        position:
                          'relative',
                      }}
                    >
                      <div
                        style={
                          styles.skillLabelRow
                        }
                      >
                        <span
                          style={
                            styles.skillName
                          }
                        >
                          {
                            skill.skill_name
                          }

                          {editing && (
                            <span
                              style={{
                                marginLeft:
                                  '10px',
                                fontSize:
                                  '12px',
                              }}
                            >
                              <button
                                type="button"
                                style={
                                  styles.iconActionBtn
                                }
                                onClick={() =>
                                  handleEditSkill(
                                    skill
                                  )
                                }
                              >
                                ✏️
                              </button>

                              <button
                                type="button"
                                style={
                                  styles.iconActionBtn
                                }
                                onClick={() =>
                                  handleDeleteSkill(
                                    skill.id
                                  )
                                }
                              >
                                🗑️
                              </button>
                            </span>
                          )}
                        </span>

                        <span
                          style={
                            styles.skillPercent
                          }
                        >
                          {
                            skill.percentage
                          }
                          %
                        </span>
                      </div>

                      <div
                        style={
                          styles.skillBarBg
                        }
                      >
                        <div
                          style={{
                            ...styles.skillBarFill,
                            width: `${skill.percentage}%`,
                            background:
                              '#1a1e6c',
                          }}
                        />
                      </div>
                    </div>
                  )
                )
              ) : (
                <p style={styles.emptyText}>
                  No skills added yet.
                </p>
              )}

              {editing && (
                <div
                  style={
                    styles.addSection
                  }
                >
                  <p
                    style={
                      styles.addSectionTitle
                    }
                  >
                    ➕ Add New Skill
                  </p>

                  <input
                    type="text"
                    placeholder="Skill Name (e.g. React.js)"
                    value={
                      newSkill.skill_name
                    }
                    onChange={(e) =>
                      setNewSkill({
                        ...newSkill,
                        skill_name:
                          e.target.value,
                      })
                    }
                    style={{
                      ...styles.input,
                      marginBottom: '8px',
                    }}
                  />

                  <input
                    type="number"
                    placeholder="Percentage (1-100)"
                    min="1"
                    max="100"
                    value={
                      newSkill.percentage
                    }
                    onChange={(e) =>
                      setNewSkill({
                        ...newSkill,
                        percentage:
                          Number.parseInt(
                            e.target.value,
                            10
                          ) || 0,
                      })
                    }
                    style={{
                      ...styles.input,
                      marginBottom: '8px',
                    }}
                  />

                  <button
                    type="button"
                    style={{
                      ...styles.saveBtn,
                      width: '100%',
                      marginTop: '4px',
                      background:
                        '#059669',
                    }}
                    onClick={
                      handleAddSkill
                    }
                  >
                    Add Skill
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right */}
          <div style={styles.right}>
            {/* Work Experience */}
            <div style={styles.card}>
              <div
                style={
                  styles.cardTitleRow
                }
              >
                <h2
                  style={
                    styles.cardTitle
                  }
                >
                  💼 Work Experience
                </h2>

                <span
                  style={styles.totalExp}
                >
                  {experiences.length}{' '}
                  Experience
                </span>
              </div>

              {experiences.length >
              0 ? (
                experiences.map(
                  (
                    experience,
                    index
                  ) => (
                    <div
                      key={
                        experience.id ||
                        index
                      }
                      style={
                        styles.expItem
                      }
                    >
                      <div
                        style={{
                          ...styles.expDot,
                          background:
                            experience.is_active
                              ? '#1a1e6c'
                              : '#d1d5db',
                        }}
                      />

                      <div
                        style={
                          styles.expContent
                        }
                      >
                        <div
                          style={
                            styles.expTitleRow
                          }
                        >
                          <p
                            style={
                              styles.expTitle
                            }
                          >
                            {
                              experience.job_title
                            }

                            {editing && (
                              <button
                                type="button"
                                style={
                                  styles.iconActionBtn
                                }
                                onClick={() =>
                                  handleDeleteExperience(
                                    experience.id
                                  )
                                }
                              >
                                🗑️
                              </button>
                            )}
                          </p>

                          {experience.job_type && (
                            <span
                              style={
                                styles.expType
                              }
                            >
                              {
                                experience.job_type
                              }
                            </span>
                          )}
                        </div>

                        <p
                          style={
                            styles.expCompany
                          }
                        >
                          {
                            experience.company_name
                          }
                        </p>

                        <p
                          style={
                            styles.expPeriod
                          }
                        >
                          {
                            experience.period
                          }
                        </p>

                        {experience.description && (
                          <p
                            style={
                              styles.expPoint
                            }
                          >
                            •{' '}
                            {
                              experience.description
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  )
                )
              ) : (
                <p style={styles.emptyText}>
                  No work experience added
                  yet.
                </p>
              )}
            </div>

            {editing && (
              <div
                style={
                  styles.experienceAddSection
                }
              >
                <p
                  style={
                    styles.addSectionTitle
                  }
                >
                  ➕ Add Work Experience
                </p>

                <input
                  type="text"
                  placeholder="Job Title (e.g. Frontend Engineer)"
                  value={
                    newExp.job_title
                  }
                  onChange={(e) =>
                    setNewExp({
                      ...newExp,
                      job_title:
                        e.target.value,
                    })
                  }
                  style={{
                    ...styles.input,
                    marginBottom: '8px',
                  }}
                />

                <input
                  type="text"
                  placeholder="Company Name"
                  value={
                    newExp.company_name
                  }
                  onChange={(e) =>
                    setNewExp({
                      ...newExp,
                      company_name:
                        e.target.value,
                    })
                  }
                  style={{
                    ...styles.input,
                    marginBottom: '8px',
                  }}
                />

                <input
                  type="text"
                  placeholder="Period (e.g. Jan 2024 - Present)"
                  value={newExp.period}
                  onChange={(e) =>
                    setNewExp({
                      ...newExp,
                      period:
                        e.target.value,
                    })
                  }
                  style={{
                    ...styles.input,
                    marginBottom: '8px',
                  }}
                />

                <input
                  type="text"
                  placeholder="Job Type (Full-Time / Part-Time)"
                  value={
                    newExp.job_type
                  }
                  onChange={(e) =>
                    setNewExp({
                      ...newExp,
                      job_type:
                        e.target.value,
                    })
                  }
                  style={{
                    ...styles.input,
                    marginBottom: '8px',
                  }}
                />

                <textarea
                  placeholder="Job Description / Points"
                  value={
                    newExp.description
                  }
                  onChange={(e) =>
                    setNewExp({
                      ...newExp,
                      description:
                        e.target.value,
                    })
                  }
                  style={{
                    ...styles.input,
                    marginBottom: '8px',
                    height: '60px',
                    resize: 'vertical',
                  }}
                />

                <label
                  style={
                    styles.checkboxLabel
                  }
                >
                  <input
                    type="checkbox"
                    checked={
                      newExp.is_active ===
                      1
                    }
                    onChange={(e) =>
                      setNewExp({
                        ...newExp,
                        is_active:
                          e.target
                            .checked
                            ? 1
                            : 0,
                      })
                    }
                  />

                  I am currently working in
                  this role
                </label>

                <button
                  type="button"
                  style={{
                    ...styles.saveBtn,
                    width: '100%',
                    background:
                      '#059669',
                  }}
                  onClick={
                    handleAddExperience
                  }
                >
                  Add Experience
                </button>
              </div>
            )}

            {/* Education */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>
                🎓 Education History
              </h2>

              {educations.length > 0 ? (
                educations.map(
                  (
                    education,
                    index
                  ) => (
                    <div
                      key={
                        education.id ||
                        index
                      }
                      style={
                        styles.eduItem
                      }
                    >
                      <div
                        style={
                          styles.eduIcon
                        }
                      >
                        🎓
                      </div>

                      <div
                        style={{
                          flex: 1,
                        }}
                      >
                        <p
                          style={
                            styles.eduDegree
                          }
                        >
                          {
                            education.degree_name
                          }

                          {editing && (
                            <button
                              type="button"
                              style={
                                styles.iconActionBtn
                              }
                              onClick={() =>
                                handleDeleteEducation(
                                  education.id
                                )
                              }
                            >
                              🗑️
                            </button>
                          )}
                        </p>

                        <p
                          style={
                            styles.eduSchool
                          }
                        >
                          {
                            education.institution_name
                          }
                        </p>

                        <p
                          style={
                            styles.eduYear
                          }
                        >
                          {
                            education.graduation_year
                          }
                        </p>
                      </div>
                    </div>
                  )
                )
              ) : (
                <p style={styles.emptyText}>
                  No education history added
                  yet.
                </p>
              )}

              {editing && (
                <div
                  style={
                    styles.addSection
                  }
                >
                  <p
                    style={
                      styles.addSectionTitle
                    }
                  >
                    ➕ Add Education
                  </p>

                  <input
                    type="text"
                    placeholder="Degree (e.g. Bachelor in Computer Science)"
                    value={
                      newEdu.degree_name
                    }
                    onChange={(e) =>
                      setNewEdu({
                        ...newEdu,
                        degree_name:
                          e.target.value,
                      })
                    }
                    style={{
                      ...styles.input,
                      marginBottom: '8px',
                    }}
                  />

                  <input
                    type="text"
                    placeholder="Institution/School Name"
                    value={
                      newEdu.institution_name
                    }
                    onChange={(e) =>
                      setNewEdu({
                        ...newEdu,
                        institution_name:
                          e.target.value,
                      })
                    }
                    style={{
                      ...styles.input,
                      marginBottom: '8px',
                    }}
                  />

                  <input
                    type="text"
                    placeholder="Graduation Year (e.g. Graduated 2026)"
                    value={
                      newEdu.graduation_year
                    }
                    onChange={(e) =>
                      setNewEdu({
                        ...newEdu,
                        graduation_year:
                          e.target.value,
                      })
                    }
                    style={{
                      ...styles.input,
                      marginBottom: '8px',
                    }}
                  />

                  <button
                    type="button"
                    style={{
                      ...styles.saveBtn,
                      width: '100%',
                      background:
                        '#059669',
                    }}
                    onClick={
                      handleAddEducation
                    }
                  >
                    Add Education
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Management */}
        <div style={styles.accountCard}>
          <div>
            <p style={styles.accountTitle}>
              Account Management
            </p>

            <p
              style={
                styles.accountSubtitle
              }
            >
              Want to end your session?
              Your progress is
              automatically saved.
            </p>
          </div>

          <button
            type="button"
            style={styles.logoutBtn}
            onClick={() =>
              setShowLogoutModal(true)
            }
          >
            ↪️ Logout
          </button>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <p style={styles.modalTag}>
              🔒 ACCOUNT SECURITY
            </p>

            <h2 style={styles.modalTitle}>
              Bye!
            </h2>

            <p style={styles.modalText}>
              Are you sure you want to log
              out?
            </p>

            <div style={styles.modalQuote}>
              <p style={styles.quoteText}>
                "More opportunity awaits if
                you keep working hard"
              </p>
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={
                  styles.confirmLogoutBtn
                }
                onClick={handleLogout}
              >
                Yes, Log Out ↪️
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

            <p style={styles.modalFooter}>
              🔐 Your session is encrypted
              and secure. See you soon.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '32px 24px',
  },

  errorBox: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '13px',
  },

  headerCard: {
    background: '#ffffff',
    border: '1px solid #e2e5f0',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
    marginBottom: '24px',
  },

  avatarWrapper: {
    flexShrink: 0,
  },

  avatar: {
    width: '72px',
    height: '72px',
    background: '#e0e7ff',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
  },

  headerInfo: {
    flex: 1,
  },

  name: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1a1e3c',
    marginBottom: '4px',
  },

  candidateId: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#1a1e6c',
    letterSpacing: '0.05em',
    marginBottom: '4px',
  },

  location: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '8px',
  },

  badges: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },

  badge: {
    background: '#f0f2f8',
    color: '#374151',
    padding: '4px 12px',
    borderRadius: '99px',
    fontSize: '12px',
    fontWeight: '500',
  },

  editBtn: {
    padding: '10px 20px',
    background: '#1a1e6c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    flexShrink: 0,
  },

  body: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
  },

  left: {
    width: '320px',
    flexShrink: 0,
  },

  right: {
    flex: 1,
  },

  card: {
    background: '#ffffff',
    border: '1px solid #e2e5f0',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '16px',
  },

  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1e3c',
    marginBottom: '16px',
  },

  cardTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },

  totalExp: {
    fontSize: '12px',
    color: '#6b7280',
    background: '#f0f2f8',
    padding: '4px 10px',
    borderRadius: '99px',
  },

  overviewGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },

  overviewItem: {},

  overviewLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: '0.08em',
    marginBottom: '2px',
  },

  overviewValue: {
    fontSize: '14px',
    color: '#1a1e3c',
  },

  field: {
    marginBottom: '12px',
  },

  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '4px',
    color: '#374151',
  },

  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1.5px solid #e2e5f0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },

  saveBtn: {
    padding: '10px 24px',
    background: '#1a1e6c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },

  skillRow: {
    marginBottom: '14px',
  },

  skillLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px',
  },

  skillName: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#1a1e3c',
  },

  skillPercent: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
  },

  skillBarBg: {
    height: '6px',
    background: '#f0f2f8',
    borderRadius: '99px',
    overflow: 'hidden',
  },

  skillBarFill: {
    height: '100%',
    borderRadius: '99px',
  },

  iconActionBtn: {
    border: 'none',
    background: 'transparent',
    padding: '0 2px',
    marginLeft: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },

  addSection: {
    marginTop: '20px',
    paddingTop: '16px',
    borderTop:
      '1px dashed #e2e5f0',
  },

  experienceAddSection: {
    marginTop: '20px',
    padding: '16px 24px 24px',
    border:
      '1px solid #e2e5f0',
    borderRadius: '12px',
    background: '#ffffff',
    marginBottom: '24px',
  },

  addSectionTitle: {
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#1a1e3c',
  },

  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    marginBottom: '12px',
  },

  emptyText: {
    fontSize: '13px',
    color: '#9ca3af',
  },

  expItem: {
    display: 'flex',
    gap: '14px',
    marginBottom: '20px',
  },

  expDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: '4px',
  },

  expContent: {
    flex: 1,
  },

  expTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2px',
  },

  expTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1a1e3c',
  },

  expType: {
    background: '#f0f2f8',
    color: '#6b7280',
    padding: '2px 10px',
    borderRadius: '99px',
    fontSize: '12px',
  },

  expCompany: {
    fontSize: '13px',
    color: '#1a1e6c',
    fontWeight: '600',
    marginBottom: '2px',
  },

  expPeriod: {
    fontSize: '12px',
    color: '#9ca3af',
    marginBottom: '8px',
  },

  expPoint: {
    fontSize: '13px',
    color: '#374151',
    lineHeight: '1.6',
    marginBottom: '4px',
  },

  eduItem: {
    display: 'flex',
    gap: '14px',
    marginBottom: '16px',
  },

  eduIcon: {
    width: '36px',
    height: '36px',
    background: '#f0f2f8',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    flexShrink: 0,
  },

  eduDegree: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1e3c',
    marginBottom: '2px',
  },

  eduSchool: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '2px',
  },

  eduYear: {
    fontSize: '12px',
    color: '#9ca3af',
  },

  accountCard: {
    background: '#ffffff',
    border: '1px solid #e2e5f0',
    borderRadius: '12px',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '8px',
  },

  accountTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: '2px',
  },

  accountSubtitle: {
    fontSize: '13px',
    color: '#6b7280',
  },

  logoutBtn: {
    padding: '10px 24px',
    background: '#dc2626',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },

  modal: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '480px',
    boxShadow:
      '0 20px 60px rgba(0,0,0,0.15)',
  },

  modalTag: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#6b7280',
    background: '#f0f2f8',
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '99px',
    marginBottom: '12px',
  },

  modalTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a1e6c',
    marginBottom: '8px',
  },

  modalText: {
    fontSize: '15px',
    color: '#374151',
    marginBottom: '20px',
  },

  modalQuote: {
    borderLeft:
      '4px solid #1a1e6c',
    paddingLeft: '16px',
    marginBottom: '24px',
  },

  quoteText: {
    fontSize: '14px',
    color: '#374151',
    fontStyle: 'italic',
  },

  modalActions: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },

  confirmLogoutBtn: {
    flex: 1,
    padding: '12px',
    background: '#1a1e6c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
  },

  stayBtn: {
    flex: 1,
    padding: '12px',
    background: '#ffffff',
    border:
      '1.5px solid #e2e5f0',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#374151',
  },

  modalFooter: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#9ca3af',
  },
}