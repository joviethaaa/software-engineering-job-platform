import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import API from "../../services/api";

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 1. Ambil data loker berstatus 'approved' dari backend kelompokmu
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await API.get("/jobs"); // Menembak GET /api/jobs
        setJobs(response.data || []);
      } catch (err) {
        setError("Failed to fetch job opportunities. Please try again later.");
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // 2. Filter data sesuai parameter database SQL Server kelompokmu
  const filtered = jobs.filter((job) => {
    const title = job.title ? job.title.toLowerCase() : "";
    const recruiter = job.recruiter_name
      ? job.recruiter_name.toLowerCase()
      : "";
    const location = job.location ? job.location.toLowerCase() : "";
    const department = job.department || "";
    const jobType = job.job_type || "";
    const experience = job.experience_level || "";

    const matchSearch =
      title.includes(search.toLowerCase()) ||
      recruiter.includes(search.toLowerCase());
    const matchCity = location.includes(citySearch.toLowerCase());
    const matchDepartment = selectedDepartment
      ? department === selectedDepartment
      : true;
    const matchJobType = selectedJobType ? jobType === selectedJobType : true;
    const matchExperience = selectedExperience
      ? experience === selectedExperience
      : true;

    return (
      matchSearch &&
      matchCity &&
      matchDepartment &&
      matchJobType &&
      matchExperience
    );
  });

  return (
    <div>
      <Navbar />

      {/* Hero search bar */}
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={styles.hero}>
          <h1 style={styles.heroTitle}>Find Your Next Career Opportunity</h1>
          <p style={styles.heroSubtitle}>
            Discover open positions and build your professional trajectory.
          </p>
          <div style={styles.searchBar}>
            <input
              placeholder="Job title, department, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
            <input
              placeholder="City or location..."
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              style={styles.searchInput}
            />
            <button style={styles.searchBtn}>Search Jobs</button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Filter sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.filterHeader}>
            <span style={styles.filterTitle}>Filters</span>
            <button
              style={styles.clearBtn}
              onClick={() => {
                setSelectedDepartment("");
                setSelectedJobType("");
                setSelectedExperience("");
              }}
            >
              Clear all
            </button>
          </div>

          {/* Filter Department / Kategori */}
          <div style={styles.filterSection}>
            <p style={styles.filterLabel}>DEPARTMENT</p>
            {["IT / Technology", "Product Design", "Marketing", "Finance"].map(
              (dept) => (
                <label key={dept} style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={selectedDepartment === dept}
                    onChange={() =>
                      setSelectedDepartment(
                        selectedDepartment === dept ? "" : dept,
                      )
                    }
                  />
                  <span style={styles.checkboxLabel}>{dept}</span>
                </label>
              ),
            )}
          </div>

          {/* Filter Job Type */}
          <div style={styles.filterSection}>
            <p style={styles.filterLabel}>WORK TYPE</p>
            {["Full-Time", "Part-Time", "Internship", "Contract"].map(
              (type) => (
                <label key={type} style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={selectedJobType === type}
                    onChange={() =>
                      setSelectedJobType(selectedJobType === type ? "" : type)
                    }
                  />
                  <span style={styles.checkboxLabel}>{type}</span>
                </label>
              ),
            )}
          </div>

          {/* Filter Experience Level */}
          <div style={styles.filterSection}>
            <p style={styles.filterLabel}>EXPERIENCE LEVEL</p>
            {["Entry Level", "Mid Level", "Senior Level"].map((exp) => (
              <label key={exp} style={styles.radioRow}>
                <input
                  type="radio"
                  name="experience"
                  checked={selectedExperience === exp}
                  onChange={() =>
                    setSelectedExperience(selectedExperience === exp ? "" : exp)
                  }
                />
                <span style={styles.checkboxLabel}>{exp}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Job list */}
        <div style={styles.jobList}>
          <div style={styles.jobListHeader}>
            <p style={styles.jobCount}>
              Showing {filtered.length} relevant jobs
            </p>
          </div>

          {loading ? (
            <div
              style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}
            >
              Loading available opportunities...
            </div>
          ) : (
            filtered.map((job) => (
              <div key={job.job_id} style={styles.jobCard}>
                <div style={styles.jobCardLeft}>
                  <div style={styles.jobIcon}>💼</div>
                  <div>
                    <div style={styles.jobMeta}>
                      <span style={styles.jobCompany}>
                        {job.recruiter_name || "Verified Company"}
                      </span>
                    </div>
                    <h3 style={styles.jobTitle}>{job.title}</h3>
                    <div style={styles.jobTags}>
                      <span
                        style={{
                          ...styles.tag,
                          background: "#fef3c7",
                          color: "#d97706",
                        }}
                      >
                        {job.job_type}
                      </span>
                      <span
                        style={{
                          ...styles.tag,
                          background: "#e0e7ff",
                          color: "#4338ca",
                        }}
                      >
                        {job.department || "General"}
                      </span>
                      <span
                        style={{
                          ...styles.tag,
                          background: "#f1f5f9",
                          color: "#475569",
                        }}
                      >
                        {job.experience_level || "Entry"}
                      </span>
                    </div>
                    <div style={styles.jobDetails}>
                      <span>💵 {job.salary_range || "Negotiable"}</span>
                      <span>📍 {job.location}</span>
                      <span>
                        🕒 Posted{" "}
                        {job.created_at
                          ? new Date(job.created_at).toLocaleDateString(
                              "en-US",
                              { day: "numeric", month: "short" },
                            )
                          : "Recent"}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Mengarahkan ke rute detail spesifik JobDetail.jsx kelompokmu */}
                <button
                  style={styles.applyBtn}
                  onClick={() => navigate(`/jobs/${job.job_id}`)}
                >
                  View Details
                </button>
              </div>
            ))
          )}

          {!loading && filtered.length === 0 && (
            <div style={styles.empty}>
              <p>
                No job opportunities found matching your criteria. Try adjusting
                filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ... objek styles di bawahnya 100% tetap sama dengan bawaanmu ...
const styles = {
  hero: {
    background: "#1a1e6c",
    padding: "48px",
    textAlign: "left",
    margin: "24px auto",
    borderRadius: "16px",
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: "42px",
    fontWeight: "700",
    marginBottom: "12px",
    lineHeight: "1.2",
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: "15px",
    marginBottom: "32px",
  },
  searchBar: {
    display: "flex",
    gap: "12px",
    maxWidth: "700px",
    margin: "0 auto",
    background: "#ffffff",
    padding: "8px",
    borderRadius: "12px",
  },
  searchInput: {
    flex: 1,
    padding: "10px 14px",
    border: "none",
    borderRight: "3px solid #e2e5f0",
    outline: "none",
    fontSize: "14px",
  },
  searchBtn: {
    padding: "10px 24px",
    background: "#1a1e6c",
    color: "#ffffff",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
  },
  content: {
    maxWidth: "1200px",
    margin: "32px auto",
    padding: "0 24px",
    display: "flex",
    gap: "24px",
  },
  sidebar: {
    width: "240px",
    flexShrink: 0,
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid #e2e5f0",
    height: "fit-content",
  },
  filterHeader: {
    display: "flex",
    justifycontent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  filterTitle: { fontWeight: "700", fontSize: "16px", color: "#1a1e3c" },
  clearBtn: {
    background: "none",
    color: "#6b7280",
    fontSize: "13px",
    cursor: "pointer",
  },
  filterSection: { marginBottom: "24px" },
  filterLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#9ca3af",
    letterSpacing: "0.08em",
    marginBottom: "12px",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
    cursor: "pointer",
  },
  radioRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
    cursor: "pointer",
  },
  checkboxLabel: { fontSize: "14px", color: "#374151" },
  jobList: { flex: 1 },
  jobListHeader: { marginBottom: "16px" },
  jobCount: { fontSize: "14px", color: "#6b7280" },
  jobCard: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "20px 24px",
    border: "1px solid #e2e5f0",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  jobCardLeft: { display: "flex", gap: "16px", alignItems: "flex-start" },
  jobIcon: {
    width: "44px",
    height: "44px",
    background: "#f0f2f8",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },
  jobCompany: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "4px",
    display: "block",
  },
  jobTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1a1e3c",
    marginBottom: "8px",
  },
  jobTags: { display: "flex", gap: "8px", marginBottom: "8px" },
  tag: {
    padding: "3px 10px",
    borderRadius: "99px",
    fontSize: "12px",
    fontWeight: "600",
  },
  jobDetails: {
    display: "flex",
    gap: "16px",
    fontSize: "13px",
    color: "#6b7280",
  },
  applyBtn: {
    padding: "10px 24px",
    background: "#1a1e6c",
    color: "#ffffff",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    flexShrink: 0,
  },
  empty: { textAlign: "center", padding: "48px", color: "#6b7280" },
};
