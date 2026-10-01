const express = require('express')
const router = express.Router()
const { sql, poolPromise } = require('../config/db')
const { authenticateToken } = require('../middleware/auth')
const path = require('path')
const fs = require('fs')

const parsePositiveInt = (value) => {
  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null
  }

  return parsed
}

// Get all pending CVs
router.get('/cvs', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' })
  }

  try {
    const pool = await poolPromise

    const result = await pool.request()
      .query(`
        SELECT
          cv.cv_id,
          cv.user_id,
          cv.file_name,
          cv.status,
          cv.uploaded_at,
          'Candidate #EM-' + RIGHT(
            '000' + CAST(cv.user_id AS NVARCHAR),
            3
          ) AS candidate_code
        FROM CVs cv
        WHERE cv.status = 'pending'
        ORDER BY cv.uploaded_at DESC
      `)

    res.json(result.recordset)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Download CV for admin review
router.get('/cvs/:cv_id/download', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' })
  }

  const cvId = parsePositiveInt(req.params.cv_id)

  if (!cvId) {
    return res.status(400).json({
      message: 'Invalid CV ID'
    })
  }

  try {
    const pool = await poolPromise

    const result = await pool.request()
      .input('cv_id', sql.Int, cvId)
      .query(`
        SELECT
          cv_id,
          file_name,
          file_path
        FROM CVs
        WHERE cv_id = @cv_id
      `)

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: 'CV not found'
      })
    }

    const cv = result.recordset[0]

    const uploadsDir = path.resolve(__dirname, '../uploads')
    const absolutePath = path.resolve(cv.file_path)

    if (
      absolutePath !== uploadsDir &&
      !absolutePath.startsWith(uploadsDir + path.sep)
    ) {
      return res.status(403).json({
        message: 'Invalid CV file path'
      })
    }

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        message: 'CV file not found'
      })
    }

    res.download(absolutePath, cv.file_name)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Approve or reject CV
router.put('/cvs/:cv_id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' })
  }

  const cvId = parsePositiveInt(req.params.cv_id)

  if (!cvId) {
    return res.status(400).json({
      message: 'Invalid CV ID'
    })
  }

  const { status } = req.body

  const allowedStatuses = ['approved', 'rejected']

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: 'Invalid status. Use approved or rejected.'
    })
  }

  try {
    const pool = await poolPromise

    const result = await pool.request()
      .input('cv_id', sql.Int, cvId)
      .input('status', sql.NVarChar, status)
      .query(`
        UPDATE CVs
        SET status = @status
        WHERE cv_id = @cv_id
        AND status = 'pending'
      `)

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        message: 'CV not found or already reviewed'
      })
    }

    res.json({
      message: `CV ${status}`
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get all pending jobs
router.get('/jobs', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' })
  }

  try {
    const pool = await poolPromise

    const result = await pool.request()
      .query(`
        SELECT
          j.job_id,
          j.company_id,
          j.title,
          j.department,
          j.description,
          j.responsibilities,
          j.requirements,
          j.benefits,
          j.location,
          j.job_type,
          j.experience_level,
          j.currency,
          j.salary_min,
          j.salary_max,
          j.salary_unit,
          j.deadline,
          j.status,
          j.created_at,
          c.company_name,
          c.city AS company_city
        FROM Jobs j
        JOIN Companies c
          ON j.company_id = c.company_id
        WHERE j.status = 'pending'
        ORDER BY j.created_at DESC
      `)

    res.json(result.recordset)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Approve or reject job
router.put('/jobs/:job_id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' })
  }

  const jobId = parsePositiveInt(req.params.job_id)

  if (!jobId) {
    return res.status(400).json({
      message: 'Invalid job ID'
    })
  }

  const { status } = req.body

  const allowedStatuses = ['approved', 'rejected']

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: 'Invalid status. Use approved or rejected.'
    })
  }

  try {
    const pool = await poolPromise

    const result = await pool.request()
      .input('job_id', sql.Int, jobId)
      .input('status', sql.NVarChar, status)
      .query(`
        UPDATE Jobs
        SET status = @status
        WHERE job_id = @job_id
        AND status = 'pending'
      `)

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        message: 'Job not found or already reviewed'
      })
    }

    res.json({
      message: `Job ${status}`
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get all users
router.get('/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' })
  }

  try {
    const pool = await poolPromise

    const result = await pool.request()
      .query(`
        SELECT
          user_id,
          first_name,
          last_name,
          email,
          city,
          created_at
        FROM Users
        ORDER BY created_at DESC
      `)

    res.json(result.recordset)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get all companies
router.get('/companies', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' })
  }

  try {
    const pool = await poolPromise

    const result = await pool.request()
      .query(`
        SELECT
          company_id,
          company_name,
          first_name,
          last_name,
          email,
          city,
          is_verified,
          created_at
        FROM Companies
        ORDER BY created_at DESC
      `)

    res.json(result.recordset)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Verify company
router.put('/companies/:company_id/verify', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' })
  }

  const companyId = parsePositiveInt(req.params.company_id)

  if (!companyId) {
    return res.status(400).json({
      message: 'Invalid company ID'
    })
  }

  try {
    const pool = await poolPromise

    const result = await pool.request()
      .input('company_id', sql.Int, companyId)
      .query(`
        UPDATE Companies
        SET is_verified = 1
        WHERE company_id = @company_id
        AND is_verified = 0
      `)

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        message: 'Company not found or already verified'
      })
    }

    res.json({
      message: 'Company verified'
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router