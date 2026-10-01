import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import API from "../../services/api";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isSaved, setIsSaved] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchJobDetailAndCV = async () => {
      try {
        setLoading(true);
        setError("");

        const jobResponse = await API.get(`/jobs/${id}`);
        setJob(jobResponse.data);

        try {
          const savedJobsRes = await API.get("/users/saved-jobs");

          if (savedJobsRes.data && savedJobsRes.data.length > 0) {
            const matchSaved = savedJobsRes.data.some(
              (saved) =>
                String(saved.job_id || saved.id) === String(id),
            );

            setIsSaved(matchSaved);
          }
        } catch (saveErr) {
          console.error(
            "Gagal mengecek data saved jobs:",
            saveErr,
          );
        }

        try {
          const cvResponse = await API.get("/users/cv");

          if (
            cvResponse.data &&
            cvResponse.data.length > 0
          ) {
            setCvData(cvResponse.data[0]);
          } else {
            setCvData(null);
          }
        } catch (cvErr) {
          console.error(
            "Gagal memuat data CV pelamar:",
            cvErr,
          );

          setCvData(null);
        }

        if (jobResponse.data.hasApplied) {
          setIsApplied(true);
        }
      } catch (err) {
        setError(
          "Failed to load job details. The job might not exist or has expired.",
        );

        console.error(
          "Error fetching job details:",
          err,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetailAndCV();
  }, [id]);

  const handleSaveToggle = async () => {
    try {
      await API.post(`/jobs/${id}/save`);

      setIsSaved(!isSaved);

      alert(
        isSaved
          ? "Job removed from saved listings."
          : "Job saved successfully!",
      );
    } catch (err) {
      console.error(
        "Failed to update saved job status:",
        err,
      );

      alert(
        "Failed to update saved status. Please try again.",
      );
    }
  };

  const handleConfirmApply = async () => {
    try {
      setSubmitting(true);

      const response = await API.post(
        `/jobs/${id}/apply`,
      );

      setIsApplied(true);
      setShowApplyModal(false);

      alert(
        response.data?.message ||
          "Application submitted successfully!",
      );
    } catch (err) {
      const backendError =
        err.response?.data?.message ||
        "Failed to submit application. Make sure your CV is approved.";

      alert(backendError);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreviewCv = async () => {
    const cvWindow = window.open("", "_blank");

    if (!cvWindow) {
      alert("Please allow pop-ups to view your CV.");
      return;
    }

    try {
      const response = await API.get(
        "/users/cv/download",
        {
          responseType: "blob",
        },
      );

      const fileUrl = URL.createObjectURL(
        response.data,
      );

      cvWindow.location.href = fileUrl;

      setTimeout(() => {
        URL.revokeObjectURL(fileUrl);
      }, 60000);
    } catch (err) {
      cvWindow.close();

      console.error(
        "Failed to preview CV:",
        err,
      );

      alert("Failed to open CV file.");
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />

        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          Loading job details...
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div>
        <Navbar />

        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "#dc2626",
          }}
        >
          {error || "Job not found"}
        </div>
      </div>
    );
  }

  const isCvReady =
    cvData &&
    cvData.status?.toLowerCase() === "approved";

  return (
    <div>
      <Navbar />

      <div style={styles.container}>
        {/* Breadcrumb */}
        <p style={styles.breadcrumb}>
          <span
            style={styles.breadcrumbLink}
            onClick={() => navigate("/home")}
          >
            Home
          </span>{" "}
          › <span>{job.title}</span>
        </p>

        {/* Banner */}
        <div style={styles.banner} />

        {/* Title row */}
        <div style={styles.titleRow}>
          <div style={styles.companyLogo}>
            🏢
          </div>

          <div>
            <h1 style={styles.jobTitle}>
              {job.title}
            </h1>

            <div style={styles.jobMeta}>
              <span>
                🏢{" "}
                {job.recruiter_name ||
                  "Verified Company"}
              </span>

              <span>
                📍 {job.location}
              </span>

              <span>
                ⏰ {job.job_type}
              </span>

              <span style={styles.categoryBadge}>
                {job.department || "General"}
              </span>
            </div>
          </div>

          <div style={styles.titleActions}>
            {isApplied ? (
              <button
                style={{
                  ...styles.applyBtn,
                  background: "#10b981",
                  cursor: "not-allowed",
                }}
                disabled
              >
                ✓ Applied
              </button>
            ) : (
              <button
                style={styles.applyBtn}
                onClick={() =>
                  setShowApplyModal(true)
                }
              >
                Apply Now
              </button>
            )}

            <button
              style={styles.saveBtn}
              onClick={handleSaveToggle}
            >
              {isSaved
                ? "🔖 Unsave Job"
                : "🔖 Save for later"}
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {/* Left — job info */}
          <div style={styles.left}>
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>
                About the Role
              </h2>

              <p style={styles.description}>
                {job.description}
              </p>

              {job.responsibilities && (
                <>
                  <h3 style={styles.subTitle}>
                    Primary Responsibilities
                  </h3>

                  <p
                    style={{
                      ...styles.description,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {job.responsibilities}
                  </p>
                </>
              )}

              {job.requirements && (
                <>
                  <h3 style={styles.subTitle}>
                    Requirements
                  </h3>

                  <p
                    style={{
                      ...styles.description,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {job.requirements}
                  </p>
                </>
              )}

              {job.benefits && (
                <>
                  <h3 style={styles.subTitle}>
                    Benefits & Perks
                  </h3>

                  <p
                    style={{
                      ...styles.description,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {job.benefits}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Right — salary + company info */}
          <div style={styles.right}>
            <div style={styles.card}>
              <p style={styles.salaryLabel}>
                SALARY RANGE
              </p>

              <p style={styles.salary}>
                {job.salary_min
                  ? `${
                      job.currency || "IDR"
                    } ${Number(
                      job.salary_min,
                    ).toLocaleString()} – ${Number(
                      job.salary_max,
                    ).toLocaleString()}`
                  : "Negotiable"}
              </p>

              <p style={styles.salaryUnit}>
                {job.salary_unit === "yearly"
                  ? "Per Year"
                  : "Per Month"}{" "}
                •{" "}
                {job.experience_level ||
                  "Entry Level"}
              </p>

              {isApplied ? (
                <button
                  style={{
                    ...styles.applyBtnFull,
                    background: "#10b981",
                    cursor: "not-allowed",
                  }}
                  disabled
                >
                  Application Submitted ✓
                </button>
              ) : (
                <button
                  style={styles.applyBtnFull}
                  onClick={() =>
                    setShowApplyModal(true)
                  }
                >
                  Apply for this position →
                </button>
              )}

              <button
                style={styles.saveBtnFull}
                onClick={handleSaveToggle}
              >
                {isSaved
                  ? "🔖 Unsave Job"
                  : "🔖 Save for later"}
              </button>

              <p style={styles.deadline}>
                Deadline:{" "}
                {job.deadline
                  ? new Date(
                      job.deadline,
                    ).toLocaleDateString()
                  : "As soon as possible"}
              </p>
            </div>

            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>
                Location Profile
              </h3>

              <div style={styles.companyInfo}>
                <p
                  style={
                    styles.companyInfoItem
                  }
                >
                  📍 City HQ:{" "}
                  {job.company_city ||
                    job.location}
                </p>

                <p
                  style={
                    styles.companyInfoItem
                  }
                >
                  👥 Recruiter ID: #EM-
                  {job.company_id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>
              Final Review
            </h2>

            <p style={styles.modalSubtitle}>
              Is your approved CV aligned with
              the company's requirements?
            </p>

            <div
              style={{
                ...styles.cvRow,
                border: isCvReady
                  ? "1px solid #dcfce7"
                  : "1px solid #fee2e2",
                background: isCvReady
                  ? "#f9fafb"
                  : "#fff5f5",
              }}
            >
              {cvData ? (
                <span
                  style={{
                    fontWeight: "600",
                    color: "#1a1e6c",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  title="Click to preview your uploaded CV"
                  onClick={handlePreviewCv}
                >
                  📄 {cvData.file_name}
                </span>
              ) : (
                <span
                  style={{
                    color: "#dc2626",
                    fontWeight: "500",
                  }}
                >
                  ❌ No CV Document Found
                </span>
              )}

              {isCvReady ? (
                <span
                  style={{
                    fontSize: "12px",
                    color: "#16a34a",
                    fontWeight: "bold",
                  }}
                >
                  READY ✓
                </span>
              ) : (
                <span
                  style={{
                    fontSize: "12px",
                    color: "#dc2626",
                    fontWeight: "bold",
                  }}
                >
                  {cvData
                    ? `NOT READY (${cvData.status?.toUpperCase()})`
                    : "NOT READY"}
                </span>
              )}
            </div>

            <div style={styles.modalActions}>
              <button
                style={styles.backBtn}
                onClick={() =>
                  setShowApplyModal(false)
                }
              >
                ← Go Back
              </button>

              <button
                style={{
                  ...styles.confirmBtn,
                  background: isCvReady
                    ? "#1a1e6c"
                    : "#9ca3af",
                  cursor: isCvReady
                    ? "pointer"
                    : "not-allowed",
                }}
                onClick={handleConfirmApply}
                disabled={
                  submitting || !isCvReady
                }
              >
                {submitting
                  ? "Submitting..."
                  : "Confirm Application →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "24px",
  },

  breadcrumb: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "16px",
    cursor: "default",
  },

  breadcrumbLink: {
    color: "#1a1e6c",
    cursor: "pointer",
    fontWeight: "500",
  },

  banner: {
    height: "160px",
    background:
      "linear-gradient(135deg, #1a1e6c, #3b46b0)",
    borderRadius: "12px",
    marginBottom: "24px",
  },

  titleRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "32px",
  },

  companyLogo: {
    width: "56px",
    height: "56px",
    background: "#f0f2f8",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    flexShrink: 0,
  },

  jobTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1a1e3c",
    marginBottom: "8px",
  },

  jobMeta: {
    display: "flex",
    gap: "16px",
    fontSize: "13px",
    color: "#6b7280",
    flexWrap: "wrap",
    alignItems: "center",
  },

  categoryBadge: {
    background: "#fef3c7",
    color: "#d97706",
    padding: "2px 10px",
    borderRadius: "99px",
    fontSize: "12px",
    fontWeight: "600",
  },

  titleActions: {
    marginLeft: "auto",
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },

  applyBtn: {
    padding: "10px 24px",
    background: "#1a1e6c",
    color: "#fff",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
  },

  saveBtn: {
    padding: "10px 16px",
    background: "transparent",
    border: "1.5px solid #e2e5f0",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
    color: "#6b7280",
  },

  body: {
    display: "flex",
    gap: "24px",
    alignItems: "flex-start",
  },

  left: {
    flex: 1,
  },

  right: {
    width: "260px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e2e5f0",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "16px",
  },

  sectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1a1e3c",
    marginBottom: "12px",
  },

  subTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#1a1e6c",
    marginTop: "20px",
    marginBottom: "10px",
  },

  description: {
    fontSize: "14px",
    color: "#374151",
    lineHeight: "1.7",
  },

  list: {
    listStyle: "none",
    padding: 0,
  },

  listItem: {
    fontSize: "14px",
    color: "#374151",
    marginBottom: "8px",
    lineHeight: "1.6",
  },

  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  tag: {
    padding: "6px 14px",
    background: "#f0f2f8",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#374151",
    fontWeight: "500",
  },

  benefits: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "8px",
  },

  benefitCard: {
    background: "#f9fafb",
    border: "1px solid #e2e5f0",
    borderRadius: "10px",
    padding: "12px 16px",
    minWidth: "140px",
  },

  benefitLabel: {
    fontWeight: "600",
    fontSize: "13px",
    color: "#1a1e3c",
    marginBottom: "4px",
  },

  benefitDesc: {
    fontSize: "12px",
    color: "#6b7280",
  },

  salaryLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#9ca3af",
    letterSpacing: "0.08em",
    marginBottom: "6px",
  },

  salary: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1a1e3c",
    marginBottom: "4px",
  },

  salaryUnit: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "20px",
  },

  applyBtnFull: {
    width: "100%",
    padding: "12px",
    background: "#1a1e6c",
    color: "#fff",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    marginBottom: "10px",
  },

  saveBtnFull: {
    width: "100%",
    padding: "12px",
    background: "transparent",
    border: "1.5px solid #e2e5f0",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
    color: "#6b7280",
    marginBottom: "12px",
  },

  deadline: {
    fontSize: "12px",
    color: "#9ca3af",
    textAlign: "center",
  },

  companyInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  companyInfoItem: {
    fontSize: "13px",
    color: "#374151",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 200,
  },

  modal: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "40px",
    width: "100%",
    maxWidth: "480px",
    boxShadow:
      "0 20px 60px rgba(0,0,0,0.15)",
  },

  modalTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1a1e3c",
    marginBottom: "8px",
  },

  modalSubtitle: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "24px",
  },

  cvRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#f9fafb",
    border: "1px solid #e2e5f0",
    borderRadius: "10px",
    padding: "14px 16px",
    marginBottom: "24px",
    fontSize: "14px",
    color: "#374151",
  },

  viewBtn: {
    padding: "6px 16px",
    border: "1.5px solid #e2e5f0",
    borderRadius: "6px",
    background: "#fff",
    fontSize: "13px",
    cursor: "pointer",
    color: "#374151",
  },

  modalActions: {
    display: "flex",
    gap: "12px",
  },

  backBtn: {
    flex: 1,
    padding: "12px",
    border: "1.5px solid #e2e5f0",
    borderRadius: "8px",
    background: "#fff",
    fontSize: "14px",
    cursor: "pointer",
    color: "#374151",
  },

  confirmBtn: {
    flex: 1,
    padding: "12px",
    background: "#1a1e6c",
    color: "#fff",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
  },
};