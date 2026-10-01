const { sql, poolPromise } = require('./db')

async function createTables() {
  const pool = await poolPromise

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
    CREATE TABLE Users (
      user_id INT IDENTITY(1,1) PRIMARY KEY,
      first_name NVARCHAR(100) NOT NULL,
      last_name NVARCHAR(100) NOT NULL,
      email NVARCHAR(255) UNIQUE NOT NULL,
      password NVARCHAR(255) NOT NULL,
      phone NVARCHAR(20),
      city NVARCHAR(100),
      date_of_birth DATE,
      created_at DATETIME DEFAULT GETDATE(),
      nationality VARCHAR(100),
      languages VARCHAR(255),
      notice_period VARCHAR(50)
    )
  `)

 await pool.request().query(`
  IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserSkills' AND xtype='U')
  CREATE TABLE UserSkills (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
    skill_name NVARCHAR(100) NOT NULL,
    percentage INT
  )
`)

await pool.request().query(`
  IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserExperiences' AND xtype='U')
  CREATE TABLE UserExperiences (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
    job_title NVARCHAR(255),
    company_name NVARCHAR(255),
    period NVARCHAR(100),
    job_type NVARCHAR(100),
    description NVARCHAR(MAX),
    is_active BIT DEFAULT 0
  )
`)

await pool.request().query(`
  IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserEducations' AND xtype='U')
  CREATE TABLE UserEducations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
    degree_name NVARCHAR(255),
    institution_name NVARCHAR(255),
    graduation_year NVARCHAR(20)
  )
`)

 await pool.request().query(`
  IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Companies' AND xtype='U')
  CREATE TABLE Companies (
    company_id INT IDENTITY(1,1) PRIMARY KEY,
    first_name NVARCHAR(100) NOT NULL,
    last_name NVARCHAR(100) NOT NULL,
    email NVARCHAR(255) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    company_name NVARCHAR(255),
    recruiter_role NVARCHAR(100),
    phone NVARCHAR(20),
    city NVARCHAR(100),
    founding_date DATE,
    tagline NVARCHAR(255),
    description NVARCHAR(MAX),
    is_verified BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE()
  )
`)

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Admins' AND xtype='U')
    CREATE TABLE Admins (
      admin_id INT IDENTITY(1,1) PRIMARY KEY,
      email NVARCHAR(255) UNIQUE NOT NULL,
      password NVARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT GETDATE()
    )
  `)

 await pool.request().query(`
  IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Jobs' AND xtype='U')
  CREATE TABLE Jobs (
    job_id INT IDENTITY(1,1) PRIMARY KEY,
    company_id INT FOREIGN KEY REFERENCES Companies(company_id),
    title NVARCHAR(255) NOT NULL,
    department NVARCHAR(100),
    description NVARCHAR(MAX),
    responsibilities NVARCHAR(MAX),
    requirements NVARCHAR(MAX),
    benefits NVARCHAR(MAX),
    location NVARCHAR(100),
    job_type NVARCHAR(50),
    experience_level NVARCHAR(50),
    currency NVARCHAR(10),
    salary_min DECIMAL(18,2),
    salary_max DECIMAL(18,2),
    salary_unit NVARCHAR(50),
    deadline DATE,
    status NVARCHAR(20) DEFAULT 'pending',
    created_at DATETIME DEFAULT GETDATE()
  )
`)

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CVs' AND xtype='U')
    CREATE TABLE CVs (
      cv_id INT IDENTITY(1,1) PRIMARY KEY,
      user_id INT FOREIGN KEY REFERENCES Users(user_id),
      file_name NVARCHAR(255),
      file_path NVARCHAR(500),
      status NVARCHAR(20) DEFAULT 'pending',
      uploaded_at DATETIME DEFAULT GETDATE()
    )
  `)

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Applications' AND xtype='U')
    CREATE TABLE Applications (
      application_id INT IDENTITY(1,1) PRIMARY KEY,
      user_id INT FOREIGN KEY REFERENCES Users(user_id),
      job_id INT FOREIGN KEY REFERENCES Jobs(job_id),
      cv_id INT FOREIGN KEY REFERENCES CVs(cv_id),
      status NVARCHAR(20) DEFAULT 'submitted',
      applied_at DATETIME DEFAULT GETDATE()
    )
  `)

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SavedJobs' AND xtype='U')
    CREATE TABLE SavedJobs (
      saved_id INT IDENTITY(1,1) PRIMARY KEY,
      user_id INT FOREIGN KEY REFERENCES Users(user_id),
      job_id INT FOREIGN KEY REFERENCES Jobs(job_id),
      saved_at DATETIME DEFAULT GETDATE()
    )
  `)

  console.log('All tables created successfully')
}

module.exports = { createTables }
createTables()