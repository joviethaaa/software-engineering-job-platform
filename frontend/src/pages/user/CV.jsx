import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import API from '../../services/api'

export default function CV() {
  const [cv, setCv] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const statusConfig = {
    approved: {
      label: 'Approved',
      bg: '#dcfce7',
      color: '#16a34a',
    },
    pending: {
      label: 'Pending Review',
      bg: '#fef3c7',
      color: '#d97706',
    },
    rejected: {
      label: 'Rejected',
      bg: '#fee2e2',
      color: '#dc2626',
    },
  }

  useEffect(() => {
    const fetchCV = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await API.get('/users/cv')

        if (
          response.data &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          setCv(response.data[0])
        } else if (
          response.data &&
          !Array.isArray(response.data)
        ) {
          setCv(response.data)
        } else {
          setCv(null)
        }
      } catch (err) {
        console.error('Error fetching CV:', err)
        setError('Failed to load CV status.')
      } finally {
        setLoading(false)
      }
    }

    fetchCV()
  }, [])

  const uploadFile = async (file) => {
    try {
      setLoading(true)
      setError('')

      const formData = new FormData()
      formData.append('cv', file)

      const response = await API.post(
        '/users/cv',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      if (
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        setCv(response.data[0])
      } else {
        setCv(response.data)
      }

      alert(
        'CV uploaded successfully! Awaiting admin review.'
      )
    } catch (err) {
      const backendError =
        err.response?.data?.message ||
        'Failed to upload CV. Please try again.'

      setError(backendError)
      alert(backendError)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]

    if (!file) return

    uploadFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)

    const file = e.dataTransfer.files[0]

    if (!file) return

    uploadFile(file)
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your CV?'
    )

    if (!confirmed) return

    try {
      setLoading(true)
      setError('')

      await API.delete('/users/cv')

      setCv(null)

      alert('CV deleted successfully.')
    } catch (err) {
      console.error('Failed to delete CV:', err)

      alert(
        err.response?.data?.message ||
          'Failed to delete CV. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!cv) return

    const cvWindow = window.open('', '_blank')

    if (!cvWindow) {
      alert(
        'Please allow pop-ups to download your CV.'
      )
      return
    }

    try {
      const response = await API.get(
        '/users/cv/download',
        {
          responseType: 'blob',
        }
      )

      const fileUrl = URL.createObjectURL(response.data)

      cvWindow.location.href = fileUrl

      setTimeout(() => {
        URL.revokeObjectURL(fileUrl)
      }, 60000)
    } catch (err) {
      cvWindow.close()

      console.error('Failed to download CV:', err)

      alert(
        err.response?.data?.message ||
          'Failed to download CV file.'
      )
    }
  }

  const currentStatus =
    cv?.status || 'pending'

  const status =
    statusConfig[currentStatus] ||
    statusConfig.pending

  if (loading && !cv) {
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
          Processing your CV...
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />

      <div style={styles.container}>
        <h1 style={styles.pageTitle}>
          Curriculum Vitae
        </h1>

        <p style={styles.pageSubtitle}>
          Upload and manage your CV to apply for job
          opportunities.
        </p>

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {/* Current CV */}
        {cv && cv.file_name ? (
          <div style={styles.card}>
            <div style={styles.cvRow}>
              <div style={styles.cvLeft}>
                <div style={styles.cvIcon}>
                  📄
                </div>

                <div>
                  <p style={styles.cvName}>
                    {cv.file_name}
                  </p>

                  <p style={styles.cvDate}>
                    {cv.uploaded_at
                      ? new Date(
                          cv.uploaded_at
                        ).toLocaleDateString()
                      : 'Just now'}
                  </p>
                </div>
              </div>

              <div style={styles.cvRight}>
                <span
                  style={{
                    ...styles.statusBadge,
                    background: status.bg,
                    color: status.color,
                  }}
                >
                  ✓ {status.label}
                </span>

                <button
                  style={styles.iconBtn}
                  title="Download"
                  onClick={handleDownload}
                >
                  ⬇️
                </button>

                <button
                  style={styles.iconBtn}
                  title="Delete"
                  onClick={handleDelete}
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              ...styles.card,
              border: '1px dashed #e2e5f0',
              textAlign: 'center',
              color: '#6b7280',
              padding: '20px',
            }}
          >
            <p
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#1a1e3c',
                margin: '0 0 4px 0',
              }}
            >
              Belum ada CV yang diunggah
            </p>

            <p
              style={{
                fontSize: '12px',
                color: '#9ca3af',
                margin: 0,
              }}
            >
              Silakan gunakan area di bawah untuk
              mengunggah CV pertamamu.
            </p>
          </div>
        )}

        {/* Upload new CV */}
        <div style={styles.card}>
          <h2 style={styles.uploadTitle}>
            Upload New CV
          </h2>

          <div
            style={{
              ...styles.dropZone,
              ...(dragging
                ? styles.dropZoneActive
                : {}),
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() =>
              setDragging(false)
            }
            onDrop={handleDrop}
          >
            <div style={styles.uploadIcon}>
              📤
            </div>

            <p style={styles.dropText}>
              Drag and drop your CV here
            </p>

            <p style={styles.dropSubtext}>
              Supports PDF, DOCX (Max 5MB)
            </p>

            <label style={styles.selectBtn}>
              Select File

              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '32px 24px',
  },

  pageTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#1a1e3c',
    marginBottom: '4px',
    textAlign: 'center',
  },

  pageSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '32px',
    textAlign: 'center',
  },

  errorBox: {
    background: '#fee2e2',
    color: '#dc2626',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '20px',
    fontSize: '13px',
  },

  card: {
    background: '#ffffff',
    border: '1px solid #e2e5f0',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
  },

  cvRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cvLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },

  cvIcon: {
    width: '44px',
    height: '44px',
    background: '#f0f2f8',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },

  cvName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a1e3c',
    marginBottom: '2px',
  },

  cvDate: {
    fontSize: '13px',
    color: '#9ca3af',
  },

  cvRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  statusBadge: {
    padding: '6px 14px',
    borderRadius: '99px',
    fontSize: '13px',
    fontWeight: '600',
  },

  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '4px',
  },

  uploadTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1e3c',
    marginBottom: '16px',
  },

  dropZone: {
    border: '2px dashed #e2e5f0',
    borderRadius: '12px',
    padding: '48px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    background: '#f9fafb',
    transition: 'all 0.2s',
  },

  dropZoneActive: {
    border: '2px dashed #1a1e6c',
    background: '#eef0fb',
  },

  uploadIcon: {
    width: '56px',
    height: '56px',
    background: '#1a1e6c',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    marginBottom: '8px',
  },

  dropText: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a1e3c',
  },

  dropSubtext: {
    fontSize: '13px',
    color: '#9ca3af',
    marginBottom: '8px',
  },

  selectBtn: {
    padding: '10px 28px',
    background: '#1a1e6c',
    color: '#ffffff',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
}