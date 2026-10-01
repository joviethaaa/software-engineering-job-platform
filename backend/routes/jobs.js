const express = require('express')
const router = express.Router()
const { sql, poolPromise } = require('../config/db')
const { authenticateToken } = require('../middleware/auth')

// Get all jobs (public)
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .query(`
        SELECT j.job_id, j.company_id, j.title, j.description, j.location, j.job_type, 
               j.department, j.experience_level, j.deadline, j.status, j.created_at,
               j.currency, j.salary_min, j.salary_max, j.salary_unit,
               c.company_name AS recruiter_name
        FROM Jobs j
        JOIN Companies c ON j.company_id = c.company_id
        WHERE j.status = 'approved'
      `)
    res.json(result.recordset)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get job by id (public)
router.get('/:id', async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT j.*, c.company_name AS recruiter_name, c.city AS company_city
        FROM Jobs j
        JOIN Companies c ON j.company_id = c.company_id
        WHERE j.job_id = @id
      `)
    if (result.recordset.length === 0)
      return res.status(404).json({ message: 'Job not found' })
    res.json(result.recordset[0])
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Apply for a job (user only)
router.post('/:id/apply', authenticateToken, async (req, res) => {
  const jobId = req.params.id
  const userId = req.user.id

  if (req.user.role !== 'user')
    return res.status(403).json({ message: 'Only users can apply' })

  try {
    const pool = await poolPromise

    // Cek apakah user sudah punya CV yang approved
    const cvResult = await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .query(`SELECT TOP 1 * FROM CVs WHERE user_id = @user_id AND (status = 'approved' OR status = 'pending') ORDER BY uploaded_at DESC`)
    if (cvResult.recordset.length === 0)
      return res.status(400).json({ message: 'You need an approved CV to apply' })

    const cv = cvResult.recordset[0]

    // Cek apakah sudah pernah apply
    const existing = await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .input('job_id', sql.Int, req.params.id)
      .query('SELECT * FROM Applications WHERE user_id = @user_id AND job_id = @job_id')
    if (existing.recordset.length > 0)
      return res.status(400).json({ message: 'Already applied to this job' })

    await pool.request()
      .input('user_id', sql.Int, userId)
      .input('job_id', sql.Int, jobId)
      .input('cv_id', sql.Int, cv.cv_id)
      .input('status', sql.NVarChar, 'pending') // status awal lamaran di mata perusahaan
      .query(`
        INSERT INTO Applications (user_id, job_id, cv_id, status, applied_at) 
        VALUES (@user_id, @job_id, @cv_id, @status, GETDATE())
      `)

    res.status(201).json({ message: 'Application submitted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Save / unsave job (user only)
router.post('/:id/save', authenticateToken, async (req, res) => {
  if (req.user.role !== 'user')
    return res.status(403).json({ message: 'Only users can save jobs' })
  try {
    const pool = await poolPromise
    const existing = await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .input('job_id', sql.Int, req.params.id)
      .query('SELECT * FROM SavedJobs WHERE user_id = @user_id AND job_id = @job_id')

    if (existing.recordset.length > 0) {
      await pool.request()
        .input('user_id', sql.Int, req.user.id)
        .input('job_id', sql.Int, req.params.id)
        .query('DELETE FROM SavedJobs WHERE user_id = @user_id AND job_id = @job_id')
      return res.json({ message: 'Job unsaved' })
    }

    await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .input('job_id', sql.Int, req.params.id)
      .query('INSERT INTO SavedJobs (user_id, job_id) VALUES (@user_id, @job_id)')
    res.status(201).json({ message: 'Job saved' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router