const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { sql, poolPromise } = require('../config/db')
require('dotenv').config()

// Register User
router.post('/user/register', async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    city,
    dateOfBirth
  } = req.body

  try {
    const pool = await poolPromise

    const existing = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE email = @email')

    if (existing.recordset.length > 0) {
      return res.status(400).json({
        message: 'Email already registered'
      })
    }

    const hashed = await bcrypt.hash(password, 10)

    await pool.request()
      .input('first_name', sql.NVarChar, firstName)
      .input('last_name', sql.NVarChar, lastName)
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashed)
      .input('phone', sql.NVarChar, phone || null)
      .input('city', sql.NVarChar, city || null)
      .input('date_of_birth', sql.Date, dateOfBirth || null)
      .query(`
        INSERT INTO Users (
          first_name,
          last_name,
          email,
          password,
          phone,
          city,
          date_of_birth
        )
        VALUES (
          @first_name,
          @last_name,
          @email,
          @password,
          @phone,
          @city,
          @date_of_birth
        )
      `)

    res.status(201).json({
      message: 'User registered successfully'
    })
  } catch (err) {
    res.status(500).json({
      message: err.message
    })
  }
})

// Login User
router.post('/user/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE email = @email')

    const user = result.recordset[0]
    if (!user) return res.status(400).json({ message: 'Email not found' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(400).json({ message: 'Wrong password' })

    const token = jwt.sign(
      { id: user.user_id, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({ token, user: { id: user.user_id, name: `${user.first_name} ${user.last_name}`, email: user.email, role: 'user' } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Register Company
router.post('/company/register', async (req, res) => {
  const { companyName, firstName, lastName, email, password, phone, city, founding_date } = req.body
  try {
    const pool = await poolPromise
    const existing = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Companies WHERE email = @email')
    if (existing.recordset.length > 0)
      return res.status(400).json({ message: 'Email already registered' })

    const hashed = await bcrypt.hash(password, 10)
    await pool.request()
      .input('company_name', sql.NVarChar, companyName)
      .input('first_name', sql.NVarChar, firstName)
      .input('last_name', sql.NVarChar, lastName)
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashed)
      .input('phone', sql.NVarChar, phone)
      .input('city', sql.NVarChar, city)
      .input('founding_date', sql.Date, founding_date)
      .query('INSERT INTO Companies (company_name, first_name, last_name, email, password, phone, city, founding_date) VALUES (@company_name, @first_name, @last_name, @email, @password, @phone, @city, @founding_date)')

    res.status(201).json({ message: 'Company registered successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Login Company
router.post('/company/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Companies WHERE email = @email')

    const company = result.recordset[0]
    if (!company) return res.status(400).json({ message: 'Email not found' })

    const match = await bcrypt.compare(password, company.password)
    if (!match) return res.status(400).json({ message: 'Wrong password' })

    const token = jwt.sign(
      { id: company.company_id, role: 'company' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({ token, user: { id: company.company_id, name: `${company.first_name} ${company.last_name}`, email: company.email, role: 'company' } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Login Admin
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Admins WHERE email = @email')

    const admin = result.recordset[0]
    if (!admin) return res.status(400).json({ message: 'Email not found' })

    const match = await bcrypt.compare(password, admin.password)
    if (!match) return res.status(400).json({ message: 'Wrong password' })

    const token = jwt.sign(
      { id: admin.admin_id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({ token, user: { id: admin.admin_id, email: admin.email, role: 'admin' } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router