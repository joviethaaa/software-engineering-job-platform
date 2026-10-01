const sql = require('mssql/msnodesqlv8')
require('dotenv').config()

const config = {
  connectionString:
    `Driver={ODBC Driver 18 for SQL Server};` +
    `Server=${process.env.DB_SERVER};` +
    `Database=${process.env.DB_DATABASE};` +
    `Trusted_Connection=Yes;` +
    `Encrypt=No;` +
    `TrustServerCertificate=Yes;`,
  connectionTimeout: 5000
}

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log('Connected to SQL Server')
    return pool
  })
  .catch((err) => {
    console.error('Database connection failed:', err)
    process.exit(1)
  })

module.exports = { sql, poolPromise }