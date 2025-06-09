require('dotenv').config();
const mysql = require('mysql2/promise');

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Test the connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database!');
    
    // Test query
    const [rows] = await connection.query('SELECT 1 + 1 AS result');
    console.log('Test query result:', rows[0].result);
    
    // Release the connection back to the pool
    connection.release();
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
    process.exit(1);
  }
}

// Example function to execute queries
async function executeQuery(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Error executing query:', error.message);
    throw error;
  }
}

// Test the connection when the script is run directly
if (require.main === module) {
  testConnection();
}

module.exports = {
  pool,
  executeQuery,
  testConnection
}; 