const express = require("express");
const router = express.Router();
const uploadCV = require("../middleware/upload");
const path = require("path")
const fs = require("fs")
const { sql, poolPromise } = require("../config/db");
const { authenticateToken } = require("../middleware/auth");

// 🌟 1. RUTE POST /cv (Official Multer Upload - Menggantikan /upload-cv agar sinkron dengan CV.jsx)
router.post("/cv", authenticateToken, uploadCV.single("cv"), async (req, res) => {
  if (req.user.role !== "user")
    return res.status(403).json({ message: "Access denied" });

  if (!req.file) {
    return res
      .status(400)
      .json({ message: "Please attach a physical CV document (.pdf/.docx)" });
  }

  const fileName = req.file.originalname;
  const filePath = req.file.path;

  try {
    const pool = await poolPromise;

    // Simpan ke tabel CVs dengan status awal 'pending' agar muncul di antrean AdminDashboard
    const result = await pool
      .request()
      .input("user_id", sql.Int, req.user.user_id || req.user.id)
      .input("file_name", sql.NVarChar, fileName)
      .input("file_path", sql.NVarChar, filePath)
      .input("status", sql.NVarChar, "pending")
      .query(`
        INSERT INTO CVs (user_id, file_name, file_path, status, uploaded_at)
        OUTPUT INSERTED.cv_id, INSERTED.user_id, INSERTED.file_name, INSERTED.file_path, INSERTED.status, INSERTED.uploaded_at
        VALUES (@user_id, @file_name, @file_path, @status, GETDATE())
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🌟 2. RUTE GET /cv (Menampilkan status CV pelamar di halaman profil)
router.get("/cv", authenticateToken, async (req, res) => {
  if (req.user.role !== "user")
    return res.status(403).json({ message: "Access denied" })

  try {
    const pool = await poolPromise

    const result = await pool
      .request()
      .input("user_id", sql.Int, req.user.user_id || req.user.id)
      .query(
        "SELECT * FROM CVs WHERE user_id = @user_id ORDER BY uploaded_at DESC"
      )

    res.json(result.recordset)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get("/cv/:cv_id", authenticateToken, async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Access denied" })
  }

  try {
    const pool = await poolPromise

    const result = await pool.request()
      .input("cv_id", sql.Int, req.params.cv_id)
      .input("user_id", sql.Int, req.user.user_id || req.user.id)
      .query(`
        SELECT cv_id, user_id, file_path, file_name
        FROM CVs
        WHERE cv_id = @cv_id
        AND user_id = @user_id
      `)

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "CV not found"
      })
    }

    const cv = result.recordset[0]
    const absolutePath = path.resolve(cv.file_path)

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        message: "CV file not found"
      })
    }

    res.download(absolutePath, cv.file_name)
  } catch (err) {
    res.status(500).json({
      message: err.message
    })
  }
})

router.delete("/cv", authenticateToken, async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Access denied" })
  }

  try {
    const pool = await poolPromise
    const userId = req.user.user_id || req.user.id

    const result = await pool.request()
      .input("user_id", sql.Int, userId)
      .query(`
        SELECT file_path
        FROM CVs
        WHERE user_id = @user_id
      `)

    for (const cv of result.recordset) {
      const absolutePath = path.resolve(cv.file_path)

      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath)
      }
    }

    await pool.request()
      .input("user_id", sql.Int, userId)
      .query(`
        DELETE FROM CVs
        WHERE user_id = @user_id
      `)

    res.json({
      message: "CV deleted successfully"
    })
  } catch (err) {
    res.status(500).json({
      message: err.message
    })
  }
})

// --- RUTE PROFILE SKILLS ---
router.get("/profile/skills", authenticateToken, async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("userId", sql.Int, req.user.user_id || req.user.id)
      .query(
        "SELECT id, skill_name, percentage FROM UserSkills WHERE user_id = @userId"
      );

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post("/profile/skills", authenticateToken, async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { skill_name, percentage } = req.body;

  if (
    !skill_name ||
    percentage === undefined ||
    percentage < 0 ||
    percentage > 100
  ) {
    return res.status(400).json({
      message:
        "Skill name is required and percentage must be between 0 and 100",
    });
  }

  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("userId", sql.Int, req.user.user_id || req.user.id)
      .input("name", sql.NVarChar, skill_name)
      .input("percent", sql.Int, percentage)
      .query(`
        INSERT INTO UserSkills (user_id, skill_name, percentage)
        OUTPUT INSERTED.id, INSERTED.skill_name, INSERTED.percentage
        VALUES (@userId, @name, @percent)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.put("/profile/skills/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { skill_name, percentage } = req.body;

  if (
    !skill_name ||
    percentage === undefined ||
    percentage < 0 ||
    percentage > 100
  ) {
    return res.status(400).json({
      message:
        "Skill name is required and percentage must be between 0 and 100",
    });
  }

  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("userId", sql.Int, req.user.user_id || req.user.id)
      .input("name", sql.NVarChar, skill_name)
      .input("percent", sql.Int, percentage)
      .query(`
        UPDATE UserSkills
        SET skill_name = @name,
            percentage = @percent
        WHERE id = @id
        AND user_id = @userId
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        message: "Skill not found",
      });
    }

    res.json({
      id: parseInt(req.params.id),
      skill_name,
      percentage,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.delete("/profile/skills/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("userId", sql.Int, req.user.user_id || req.user.id)
      .query(
        "DELETE FROM UserSkills WHERE id=@id AND user_id=@userId"
      );

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        message: "Skill not found",
      });
    }

    res.json({
      message: "Skill deleted successfully",
      id: parseInt(req.params.id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- RUTE PROFILE EXPERIENCES ---
router.get("/profile/experiences", authenticateToken, async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("userId", sql.Int, req.user.user_id || req.user.id)
      .query(
        "SELECT id, job_title, company_name, period, job_type, description, is_active FROM UserExperiences WHERE user_id = @userId"
      );

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/profile/experiences", authenticateToken, async (req, res) => {
  if (req.user.role !== "user")
    return res.status(403).json({ message: "Access denied" });

  const { job_title, company_name, period, job_type, description, is_active } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("userId", sql.Int, req.user.user_id || req.user.id)
      .input("title", sql.NVarChar, job_title || "")
      .input("company", sql.NVarChar, company_name || "")
      .input("period", sql.NVarChar, period || "")
      .input("type", sql.NVarChar, job_type || "Full-Time")
      .input("desc", sql.NVarChar(sql.MAX), description || "")
      .input("active", sql.Bit, is_active === 1 || is_active === true ? 1 : 0)
      .query(`
        INSERT INTO UserExperiences (user_id, job_title, company_name, period, job_type, description, is_active)
        OUTPUT INSERTED.id, INSERTED.job_title, INSERTED.company_name, INSERTED.period, INSERTED.job_type, INSERTED.description, INSERTED.is_active
        VALUES (@userId, @title, @company, @period, @type, @desc, @active)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/profile/experiences/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Access denied" });
  }

  const {
    job_title,
    company_name,
    period,
    job_type,
    description,
    is_active
  } = req.body;

  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("userId", sql.Int, req.user.user_id || req.user.id)
      .input("title", sql.NVarChar, job_title)
      .input("company", sql.NVarChar, company_name)
      .input("period", sql.NVarChar, period)
      .input("type", sql.NVarChar, job_type)
      .input("desc", sql.NVarChar(sql.MAX), description)
      .input("active", sql.Bit, is_active)
      .query(`
        UPDATE UserExperiences
        SET job_title = @title,
            company_name = @company,
            period = @period,
            job_type = @type,
            description = @desc,
            is_active = @active
        WHERE id = @id
        AND user_id = @userId
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        message: "Experience not found"
      });
    }

    res.json({
      id: parseInt(req.params.id),
      job_title,
      company_name,
      period,
      job_type,
      description,
      is_active
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/profile/experiences/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("userId", sql.Int, req.user.user_id || req.user.id)
      .query(
        "DELETE FROM UserExperiences WHERE id=@id AND user_id=@userId"
      );

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        message: "Experience not found"
      });
    }

    res.json({
      message: "Experience deleted successfully",
      id: parseInt(req.params.id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- RUTE PROFILE EDUCATIONS ---

router.get("/profile/educations", authenticateToken, async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("userId", sql.Int, req.user.user_id || req.user.id)
      .query(
        "SELECT id, degree_name, institution_name, graduation_year FROM UserEducations WHERE user_id = @userId"
      );

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post("/profile/educations", authenticateToken, async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Access denied" });
  }

  const {
    degree_name,
    institution_name,
    graduation_year
  } = req.body;

  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("userId", sql.Int, req.user.user_id || req.user.id)
      .input("degree", sql.NVarChar, degree_name)
      .input("school", sql.NVarChar, institution_name)
      .input("year", sql.NVarChar, graduation_year)
      .query(`
        INSERT INTO UserEducations (
          user_id,
          degree_name,
          institution_name,
          graduation_year
        )
        OUTPUT
          INSERTED.id,
          INSERTED.degree_name,
          INSERTED.institution_name,
          INSERTED.graduation_year
        VALUES (
          @userId,
          @degree,
          @school,
          @year
        )
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.put("/profile/educations/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Access denied" });
  }

  const {
    degree_name,
    institution_name,
    graduation_year
  } = req.body;

  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("userId", sql.Int, req.user.user_id || req.user.id)
      .input("degree", sql.NVarChar, degree_name)
      .input("school", sql.NVarChar, institution_name)
      .input("year", sql.NVarChar, graduation_year)
      .query(`
        UPDATE UserEducations
        SET degree_name = @degree,
            institution_name = @school,
            graduation_year = @year
        WHERE id = @id
        AND user_id = @userId
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        message: "Education not found"
      });
    }

    res.json({
      id: parseInt(req.params.id),
      degree_name,
      institution_name,
      graduation_year
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.delete("/profile/educations/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("userId", sql.Int, req.user.user_id || req.user.id)
      .query(
        "DELETE FROM UserEducations WHERE id=@id AND user_id=@userId"
      );

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        message: "Education not found"
      });
    }

    res.json({
      message: "Education deleted successfully",
      id: parseInt(req.params.id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- RUTE MANAJEMEN DATA PROFIL ---
router.get("/profile", authenticateToken, async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("id", sql.Int, req.user.user_id || req.user.id)
      .query(
        "SELECT user_id, first_name, last_name, email, phone, city, date_of_birth, created_at, nationality, languages, notice_period FROM Users WHERE user_id = @id"
      );

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/profile", authenticateToken, async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Access denied" });
  }

  const {
    first_name,
    last_name,
    phone,
    city,
    nationality,
    languages,
    notice_period
  } = req.body;

  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("id", sql.Int, req.user.user_id || req.user.id)
      .input("first_name", sql.NVarChar, first_name)
      .input("last_name", sql.NVarChar, last_name)
      .input("phone", sql.NVarChar, phone)
      .input("city", sql.NVarChar, city)
      .input("nationality", sql.NVarChar, nationality)
      .input("languages", sql.NVarChar, languages)
      .input("notice_period", sql.NVarChar, notice_period)
      .query(
        "UPDATE Users SET first_name=@first_name, last_name=@last_name, phone=@phone, city=@city, nationality=@nationality, languages=@languages, notice_period=@notice_period WHERE user_id=@id"
      );

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        message: "User profile not found"
      });
    }

    res.json({
      message: "Profile updated successfully"
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

// --- RUTE LAMARAN & PENYIMPANAN LOWONGAN ---
router.get("/applications", authenticateToken, async (req, res) => {
  if (req.user.role !== "user")
    return res.status(403).json({ message: "Access denied" });

  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("id", sql.Int, req.user.user_id || req.user.id)
      .query(`
        SELECT a.*, j.job_id, j.title, j.location, j.job_type,
               j.currency, j.salary_min, j.salary_max, j.salary_unit,
               c.company_name AS company_name
        FROM Applications a
        JOIN Jobs j ON a.job_id = j.job_id
        JOIN Companies c ON j.company_id = c.company_id
        WHERE a.user_id = @id
        ORDER BY a.applied_at DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/saved-jobs", authenticateToken, async (req, res) => {
  if (req.user.role !== "user")
    return res.status(403).json({ message: "Access denied" });

  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("id", sql.Int, req.user.user_id || req.user.id)
      .query(`
        SELECT s.*, j.job_id, j.title, j.location, j.job_type, j.department,
               j.currency, j.salary_min, j.salary_max, j.salary_unit,
               c.company_name AS company_name
        FROM SavedJobs s
        JOIN Jobs j ON s.job_id = j.job_id
        JOIN Companies c ON j.company_id = c.company_id
        WHERE s.user_id = @id
        ORDER BY s.saved_at DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🌟 SATU-SATUNYA EKSPOR ROUTER DI AKHIR BERKAS:
module.exports = router;