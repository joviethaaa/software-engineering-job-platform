import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import API from "../../services/api";

export default function JobSearch() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState(null); // Menyimpan loker yang sedang diklik detailnya
  const [applying, setApplying] = useState(false);

  // 1. Ambil seluruh lowongan berstatus 'approved' dari backend
  useEffect(() => {
    const fetchApprovedJobs = async () => {
      try {
        setLoading(true);
        const response = await API.get("/jobs"); // Menembak GET /api/jobs
        setJobs(response.data || []);
        if (response.data && response.data.length > 0) {
          setSelectedJob(response.data[0]); // Default tampilkan detail loker pertama
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApprovedJobs();
  }, []);

  // 2. Fungsi melamar pekerjaan (Apply Job)
  const handleApplyJob = async (jobId) => {
    if (
      !window.confirm(
        "Are you sure you want to submit your approved CV for this position?",
      )
    )
      return;
    try {
      setApplying(true);
      // Menembak POST /api/jobs/:id/apply bawaan backend kelompokmu
      const response = await API.post(`/jobs/${jobId}/apply`);
      alert(response.data?.message || "Application submitted successfully!");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to submit application. Make sure your CV is approved.",
      );
    } finally {
      setApplying(false);
    }
  };

  // Filter pencarian berdasarkan judul lowongan
  const filteredJobs = jobs.filter((j) =>
    (j.title || "").toLowerCase().includes(search.toLowerCase()),
  );

  if (loading && jobs.length === 0) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: "48px", textAlign: "center", color: "#6b7280" }}>
          Loading available career opportunities...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <div style={styles.container}>
        {/* Search Bar */}
        <div style={styles.searchSection}>
          <h1 style={styles.title}>Explore Opportunities</h1>
          <input
            type="text"
            placeholder="🔍 Search by job title, technologies, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Main Dashboard Layout: Kiri List Kartu, Kanan Kotak Detail */}
        <div style={styles.mainLayout}>
          {/* SISI KIRI: LISTING LOWONGAN */}
          <div style={styles.leftColumn}>
            {filteredJobs.length === 0 ? (
              <div style={styles.emptyState}>
                No active job openings found matching your query.
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div
                  key={job.job_id}
                  style={{
                    ...styles.jobCard,
                    border:
                      selectedJob?.job_id === job.job_id
                        ? "2px solid #1a1e6c"
                        : "1px solid #e2e5f0",
                  }}
                  onClick={() => setSelectedJob(job)}
                >
                  <h3 style={styles.cardTitle}>{job.title}</h3>
                  <p style={styles.cardRecruiter}>
                    🏢 {job.recruiter_name || "Verified Company"}
                  </p>
                  <div style={styles.metaRow}>
                    <span>📍 {job.location}</span>
                    <span>💼 {job.job_type}</span>
                  </div>
                  <p style={styles.cardSalary}>
                    💰 {job.salary_range || "Negotiable"}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* SISI KANAN: PREVIEW DETAIL JALUR SELEKSI */}
          <div style={styles.rightColumn}>
            {selectedJob ? (
              <div style={styles.detailBox}>
                <div style={styles.detailHeader}>
                  <h2 style={styles.detailTitle}>{selectedJob.title}</h2>
                  <p style={styles.detailRecruiter}>
                    {selectedJob.recruiter_name}
                  </p>
                  <div style={styles.metaRow}>
                    <span style={styles.badge}>📍 {selectedJob.location}</span>
                    <span style={styles.badge}>💼 {selectedJob.job_type}</span>
                    <span style={styles.badge}>
                      📈 {selectedJob.experience_level || "Entry Level"}
                    </span>
                  </div>
                </div>

                <div style={styles.divider} />

                <div style={styles.scrollableDetailBody}>
                  <h4 style={styles.sectionHeading}>Job Description</h4>
                  <p style={styles.textContent}>{selectedJob.description}</p>

                  {selectedJob.requirements && (
                    <>
                      <h4 style={styles.sectionHeading}>Requirements</h4>
                      <p
                        style={{
                          ...styles.textContent,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {selectedJob.requirements}
                      </p>
                    </>
                  )}

                  {selectedJob.responsibilities && (
                    <>
                      <h4 style={styles.sectionHeading}>
                        Key Responsibilities
                      </h4>
                      <p
                        style={{
                          ...styles.textContent,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {selectedJob.responsibilities}
                      </p>
                    </>
                  )}

                  {selectedJob.benefits && (
                    <>
                      <h4 style={styles.sectionHeading}>Benefits & Perks</h4>
                      <p
                        style={{
                          ...styles.textContent,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {selectedJob.benefits}
                      </p>
                    </>
                  )}
                </div>

                <div style={styles.detailFooter}>
                  <button
                    style={styles.applyBtn}
                    disabled={applying}
                    onClick={() => handleApplyJob(selectedJob.job_id)}
                  >
                    {applying ? "Submitting Application..." : "Apply Now"}
                  </button>
                </div>
              </div>
            ) : (
              <div style={styles.emptyState}>
                Select a position from the left panel to view detailed
                parameters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "1200px", margin: "0 auto", padding: "24px" },
  searchSection: { marginBottom: "24px", textAlign: "center" },
  title: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#1a1e3c",
    marginBottom: "8px",
  },
  searchInput: {
    width: "100%",
    maxWidth: "600px",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #e2e5f0",
    fontSize: "15px",
    outline: "none",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  mainLayout: {
    display: "flex",
    gap: "20px",
    height: "calc(100vh - 200px)",
    minHeight: "500px",
  },
  leftColumn: {
    flex: "1",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    paddingRight: "4px",
  },
  rightColumn: {
    flex: "1.5",
    background: "#ffffff",
    borderRadius: "14px",
    border: "1px solid #e2e5f0",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
  },
  jobCard: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "16px",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1a1e3c",
    margin: "0 0 4px 0",
  },
  cardRecruiter: {
    fontSize: "13px",
    color: "#4b5563",
    fontWeight: "600",
    margin: "0 0 8px 0",
  },
  metaRow: {
    display: "flex",
    gap: "12px",
    fontSize: "13px",
    color: "#6b7280",
    flexWrap: "wrap",
    marginBottom: "8px",
  },
  cardSalary: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#1a1e6c",
    margin: 0,
  },
  detailBox: { display: "flex", flexDirection: "column", height: "100%" },
  detailHeader: { padding: "24px 24px 16px 24px" },
  detailTitle: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#1a1e3c",
    margin: "0 0 4px 0",
  },
  detailRecruiter: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#4b5563",
    margin: "0 0 12px 0",
  },
  badge: {
    background: "#f1f5f9",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
  },
  divider: { height: "1px", background: "#e2e5f0", margin: "0 24px" },
  scrollableDetailBody: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  sectionHeading: {
    fontSize: "14px",
    fontWeight: "800",
    color: "#1a1e3c",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: "8px 0 2px 0",
  },
  textContent: {
    fontSize: "14px",
    color: "#334155",
    lineHeight: "1.6",
    margin: 0,
  },
  detailFooter: {
    padding: "16px 24px",
    borderTop: "1px solid #e2e5f0",
    background: "#f8fafc",
    display: "flex",
    justifyContent: "flex-end",
  },
  applyBtn: {
    padding: "12px 32px",
    background: "#1a1e6c",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(26,30,108,0.2)",
  },
  emptyState: {
    padding: "32px",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "14px",
  },
};
