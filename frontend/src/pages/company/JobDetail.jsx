import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Navbar from "../../components/Navbar"
import API from "../../services/api"

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState(null)
  const [applicants, setApplicants] = useState([])
  const [skillFilter, setSkillFilter] = useState("")

  useEffect(() => {
    const fetchPipelineData = async () => {
      if (!id || id === "undefined" || id === "null") {
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        const jobDetailRes = await API.get(`/companies/jobs/${id}`)
        setJob(jobDetailRes.data || null)

        const applicantsRes = await API.get(
          `/companies/jobs/${id}/applicants`
        )

        setApplicants(applicantsRes.data || [])
      } catch (err) {
        console.error("Error loading corporate pipeline data:", err)

        try {
          const jobsRes = await API.get("/companies/jobs")

          const currentJob = (jobsRes.data || []).find(
            (j) => String(j.job_id || j.id) === String(id)
          )

          setJob(currentJob || null)

          const applicantsRes = await API.get(
            `/companies/jobs/${id}/applicants`
          )

          setApplicants(applicantsRes.data || [])
        } catch (globalErr) {
          console.error(
            "Global fallback pipeline matching failed:",
            globalErr
          )
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPipelineData()
  }, [id])

  const handleDecision = async (applicationId, targetStatus) => {
    const confirmMsg =
      targetStatus === "accepted"
        ? "Are you sure you want to ACCEPT this candidate for an interview session?"
        : "Are you sure you want to REJECT this candidate application?"

    if (!window.confirm(confirmMsg)) return

    try {
      await API.put(`/companies/applicants/${applicationId}`, {
        status: targetStatus
      })

      setApplicants((prev) =>
        prev.map((app) =>
          app.application_id === applicationId
            ? { ...app, status: targetStatus }
            : app
        )
      )

      alert(
        `Candidate has been successfully ${
          targetStatus === "accepted"
            ? "accepted for interview"
            : "rejected"
        }.`
      )
    } catch (err) {
      console.error(
        "Error updating candidate assessment status:",
        err
      )

      alert(
        "Failed to update applicant status. Please try again."
      )
    }
  }

  const handleViewCv = async (applicationId) => {
    const cvWindow = window.open("", "_blank")

    if (!cvWindow) {
      alert("Please allow pop-ups to view the CV.")
      return
    }

    try {
      const response = await API.get(
        `/companies/applicants/${applicationId}/cv`,
        {
          responseType: "blob"
        }
      )

      const fileUrl = URL.createObjectURL(response.data)

      cvWindow.location.href = fileUrl

      setTimeout(() => {
        URL.revokeObjectURL(fileUrl)
      }, 60000)
    } catch (err) {
      cvWindow.close()

      console.error("Failed to open CV:", err)

      alert("Failed to open CV file.")
    }
  }

  const filteredApplicants = applicants.filter((a) => {
    const fileName = (a.file_name || "").toLowerCase()
    const candidateCode = (
      a.candidate_code || ""
    ).toLowerCase()

    const filterText = skillFilter.toLowerCase()

    return (
      skillFilter === "" ||
      fileName.includes(filterText) ||
      candidateCode.includes(filterText)
    )
  })

  if (loading) {
    return (
      <div style={{ minHeight: "100vh" }}>
        <Navbar />

        <div
          style={{
            padding: "48px",
            textAlign: "center",
            color: "#6b7280"
          }}
        >
          Loading candidate assessment pipeline...
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div style={{ minHeight: "100vh" }}>
        <Navbar />

        <div
          style={{
            padding: "48px",
            textAlign: "center",
            color: "#dc2626",
            fontWeight: "600"
          }}
        >
          Job listing record not found or access denied.
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />

      <div style={styles.container}>
        {/* Breadcrumb */}
        <p style={styles.breadcrumb}>
          <span
            style={styles.breadLink}
            onClick={() => navigate("/company/dashboard")}
          >
            Dashboard
          </span>

          {" › "}

          <span
            style={styles.breadLink}
            onClick={() => navigate("/company/jobs")}
          >
            Jobs
          </span>

          {" › "}
          {job.title}
        </p>

        {/* Job header */}
        <div style={styles.headerRow}>
          <div>
            <span
              style={{
                ...styles.activeBadge,
                color:
                  job.status?.toUpperCase() === "APPROVED"
                    ? "#16a34a"
                    : "#64748b"
              }}
            >
              ●{" "}
              {job.status?.toUpperCase() === "APPROVED"
                ? "ACTIVE"
                : job.status || "PENDING"}
            </span>

            <h1 style={styles.pageTitle}>{job.title}</h1>

            <div style={styles.metaRow}>
              <span>
                💰{" "}
                {job.salary_min
                  ? `${job.currency || "IDR"} ${Number(
                      job.salary_min
                    ).toLocaleString()} - ${Number(
                      job.salary_max
                    ).toLocaleString()} / ${
                      job.salary_unit === "yearly"
                        ? "yr"
                        : "mo"
                    }`
                  : "Salary Confidential"}
              </span>

              <span>
                📍 {job.location || "Location Not Specified"}
              </span>

              <span>
                💼 {job.job_type || "Full-Time"}
              </span>

              <span>
                | 🏢 Dept: {job.department || "General"}
              </span>

              <span>
                🕐 Deadline:{" "}
                {job.deadline
                  ? new Date(
                      job.deadline
                    ).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })
                  : "-"}
              </span>
            </div>
          </div>

          <div style={styles.headerActions}>
            <button
              style={styles.editBtn}
              onClick={() => navigate("/company/jobs")}
            >
              Back to Listings
            </button>

            <button style={styles.shareBtn}>
              Share Pipeline
            </button>
          </div>
        </div>

        {/* Main content */}
        <div style={styles.mainRow}>
          <div style={styles.infoCard}>
            <h2 style={styles.sectionTitle}>
              About the Role
            </h2>

            <p style={styles.aboutText}>
              {job.description ||
                "No description provided for this job listing."}
            </p>

            <h3 style={styles.subTitle}>
              Primary Responsibilities
            </h3>

            {job.responsibilities ? (
              job.responsibilities.split("\n").map(
                (responsibility, index) =>
                  responsibility.trim() && (
                    <div
                      key={index}
                      style={styles.responsibility}
                    >
                      <span style={styles.checkIcon}>
                        ✅
                      </span>

                      <span
                        style={styles.responsibilityText}
                      >
                        {responsibility}
                      </span>
                    </div>
                  )
              )
            ) : (
              <p
                style={{
                  fontSize: "13px",
                  color: "#9ca3af"
                }}
              >
                No specific responsibilities listed.
              </p>
            )}

            <h3 style={styles.subTitle}>
              Requirements
            </h3>

            <div style={styles.tags}>
              {job.requirements ? (
                job.requirements.includes("\n") ? (
                  job.requirements.split("\n").map(
                    (requirement, index) =>
                      requirement.trim() && (
                        <span
                          key={index}
                          style={styles.reqTag}
                        >
                          {requirement.trim()}
                        </span>
                      )
                  )
                ) : (
                  job.requirements.split(",").map(
                    (requirement, index) =>
                      requirement.trim() && (
                        <span
                          key={index}
                          style={styles.reqTag}
                        >
                          {requirement.trim()}
                        </span>
                      )
                  )
                )
              ) : (
                <span style={styles.reqTag}>
                  General Requirement Pool
                </span>
              )}
            </div>

            <h3 style={styles.subTitle}>
              Benefits
            </h3>

            <p
              style={{
                fontSize: "13px",
                color: "#4b5563",
                whiteSpace: "pre-line",
                lineHeight: 1.5
              }}
            >
              {job.benefits ||
                "Standard corporate benefits package apply."}
            </p>
          </div>

          {/* Funnel summary */}
          <div style={styles.funnelCard}>
            <div style={styles.funnelHeader}>
              <p style={styles.funnelLabel}>
                Application Funnel
              </p>

              <span>↗</span>
            </div>

            <p style={styles.funnelCount}>
              {applicants.length}
            </p>

            <p style={styles.funnelSub}>
              Total Candidates
            </p>

            <div style={styles.funnelBar}>
              <div
                style={{
                  ...styles.funnelFill,
                  width:
                    applicants.length > 0
                      ? "100%"
                      : "0%"
                }}
              />
            </div>
          </div>
        </div>

        {/* Applicant list */}
        <div style={styles.applicantSection}>
          <div style={styles.applicantHeader}>
            <h2 style={styles.applicantTitle}>
              Applicant List{" "}
              <span style={styles.applicantCount}>
                [{applicants.length}]
              </span>
            </h2>

            <div style={styles.applicantTools}>
              <input
                placeholder="🔍 Filter by skill or candidate code..."
                value={skillFilter}
                onChange={(e) =>
                  setSkillFilter(e.target.value)
                }
                style={styles.skillFilter}
              />

              <button style={styles.sortBtn}>
                ⇅ Sort by
              </button>
            </div>
          </div>

          {filteredApplicants.length > 0 ? (
            filteredApplicants.map((applicant) => {
              const statusLower =
                applicant.status?.toLowerCase()

              return (
                <div
                  key={applicant.application_id}
                  style={{
                    ...styles.applicantCard,

                    opacity:
                      statusLower === "accepted" ||
                      statusLower === "rejected"
                        ? 0.8
                        : 1,

                    borderLeft:
                      statusLower === "accepted"
                        ? "4px solid #16a34a"
                        : statusLower === "rejected"
                          ? "4px solid #dc2626"
                          : "4px solid #94a3b8"
                  }}
                >
                  <div style={styles.applicantLeft}>
                    <div style={styles.avatarBlind}>
                      👤
                    </div>

                    <div>
                      <p style={styles.candidateId}>
                        {applicant.candidate_code ||
                          `Candidate #EM-${applicant.application_id}`}
                      </p>

                      <div style={styles.candidateMeta}>
                        <span>
                          📂 CV File:{" "}
                          <strong>
                            {applicant.file_name ||
                              "Not Uploaded"}
                          </strong>
                        </span>

                        <span>
                          | 🕐 Applied At:{" "}
                          {applicant.applied_at
                            ? new Date(
                                applicant.applied_at
                              ).toLocaleDateString(
                                "en-US",
                                {
                                  day: "numeric",
                                  month: "short"
                                }
                              )
                            : "Recent"}
                        </span>
                      </div>

                      <div style={styles.skillTags}>
                        <span style={styles.skillTag}>
                          CV Status:{" "}
                          {applicant.cv_status ||
                            "Verified"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={styles.applicantActions}>
                    <button
                      style={styles.viewCvBtn}
                      onClick={() =>
                        handleViewCv(
                          applicant.application_id
                        )
                      }
                    >
                      👁 View CV
                    </button>

                    <div
                      style={styles.decisionButtons}
                    >
                      {statusLower === "accepted" ||
                      statusLower === "rejected" ? (
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color:
                              statusLower === "accepted"
                                ? "#16a34a"
                                : "#dc2626",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em"
                          }}
                        >
                          {statusLower === "accepted"
                            ? "✅ Accepted for Interview"
                            : "❌ Application Rejected"}
                        </span>
                      ) : (
                        <>
                          <button
                            style={styles.rejectBtn}
                            onClick={() =>
                              handleDecision(
                                applicant.application_id,
                                "rejected"
                              )
                            }
                          >
                            Reject
                          </button>

                          <button
                            style={styles.acceptBtn}
                            onClick={() =>
                              handleDecision(
                                applicant.application_id,
                                "accepted"
                              )
                            }
                          >
                            Accept for Interview
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <p
              style={{
                textAlign: "center",
                padding: "24px 0",
                color: "#9ca3af",
                fontSize: "14px"
              }}
            >
              No candidates have applied for this
              position yet.
            </p>
          )}

          <button style={styles.loadMoreBtn}>
            Load Next Applicants
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "32px 24px"
  },

  breadcrumb: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "16px"
  },

  breadLink: {
    color: "#1a1e6c",
    cursor: "pointer",
    fontWeight: "500"
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px"
  },

  activeBadge: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#16a34a",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "6px",
    display: "block"
  },

  pageTitle: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#1a1e3c",
    marginBottom: "8px"
  },

  metaRow: {
    display: "flex",
    gap: "20px",
    fontSize: "13px",
    color: "#6b7280",
    flexWrap: "wrap"
  },

  headerActions: {
    display: "flex",
    gap: "10px",
    flexShrink: 0
  },

  editBtn: {
    padding: "8px 18px",
    border: "1.5px solid #1a1e6c",
    color: "#1a1e6c",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    background: "none"
  },

  shareBtn: {
    padding: "8px 18px",
    border: "1.5px solid #e2e5f0",
    color: "#ffffff",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    background: "#1a1e6c"
  },

  mainRow: {
    display: "flex",
    gap: "20px",
    marginBottom: "24px",
    alignItems: "flex-start"
  },

  infoCard: {
    flex: 1,
    background: "#ffffff",
    borderRadius: "16px",
    padding: "28px",
    border: "1px solid #e2e5f0"
  },

  sectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1a1e3c",
    marginBottom: "12px"
  },

  aboutText: {
    fontSize: "14px",
    color: "#4b5563",
    lineHeight: 1.6,
    marginBottom: "20px"
  },

  subTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#1a1e6c",
    marginBottom: "10px",
    marginTop: "16px"
  },

  responsibility: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
    alignItems: "flex-start"
  },

  checkIcon: {
    fontSize: "14px",
    flexShrink: 0,
    marginTop: "1px"
  },

  responsibilityText: {
    fontSize: "13px",
    color: "#4b5563",
    lineHeight: 1.5
  },

  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "8px"
  },

  reqTag: {
    padding: "5px 12px",
    background: "#f0f2f8",
    color: "#1a1e6c",
    borderRadius: "99px",
    fontSize: "12px",
    fontWeight: "600"
  },

  funnelCard: {
    width: "200px",
    flexShrink: 0,
    background: "#1a1e6c",
    borderRadius: "16px",
    padding: "24px 20px",
    color: "#ffffff"
  },

  funnelHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px"
  },

  funnelLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: "0.05em"
  },

  funnelCount: {
    fontSize: "48px",
    fontWeight: "800",
    lineHeight: 1
  },

  funnelSub: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.7)",
    marginBottom: "16px"
  },

  funnelBar: {
    display: "flex",
    gap: "4px",
    height: "6px",
    borderRadius: "99px",
    overflow: "hidden",
    background: "rgba(255,255,255,0.2)"
  },

  funnelFill: {
    height: "100%",
    background: "#ffffff",
    borderRadius: "99px"
  },

  applicantSection: {
    background: "#ffffff",
    border: "1px solid #e2e5f0",
    borderRadius: "16px",
    padding: "24px"
  },

  applicantHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px"
  },

  applicantTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1a1e3c"
  },

  applicantCount: {
    fontWeight: "400",
    color: "#6b7280"
  },

  applicantTools: {
    display: "flex",
    gap: "10px"
  },

  skillFilter: {
    padding: "8px 14px",
    border: "1px solid #e2e5f0",
    borderRadius: "8px",
    fontSize: "13px",
    outline: "none"
  },

  sortBtn: {
    padding: "8px 14px",
    border: "1px solid #e2e5f0",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    background: "none",
    color: "#374151"
  },

  applicantCard: {
    border: "1px solid #e2e5f0",
    borderRadius: "12px",
    padding: "18px 20px",
    marginBottom: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    transition: "border-color 0.2s"
  },

  applicantLeft: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start"
  },

  avatarBlind: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#f0f2f8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    flexShrink: 0
  },

  candidateId: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#1a1e3c",
    marginBottom: "4px"
  },

  candidateMeta: {
    display: "flex",
    gap: "16px",
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "8px",
    flexWrap: "wrap"
  },

  skillTags: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap"
  },

  skillTag: {
    padding: "3px 10px",
    background: "#f0f2f8",
    color: "#374151",
    borderRadius: "99px",
    fontSize: "12px",
    fontWeight: "500"
  },

  applicantActions: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexShrink: 0,
    flexWrap: "wrap"
  },

  viewCvBtn: {
    padding: "7px 14px",
    border: "1px solid #e2e5f0",
    borderRadius: "7px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    background: "none",
    color: "#374151"
  },

  decisionButtons: {
    display: "flex",
    gap: "8px",
    alignItems: "center"
  },

  rejectBtn: {
    padding: "7px 14px",
    background: "none",
    color: "#dc2626",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none"
  },

  acceptBtn: {
    padding: "7px 16px",
    background: "#1a1e6c",
    color: "#ffffff",
    borderRadius: "7px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none"
  },

  loadMoreBtn: {
    display: "block",
    margin: "16px auto 0",
    padding: "10px 28px",
    border: "1.5px solid #e2e5f0",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    background: "none",
    color: "#374151"
  }
}