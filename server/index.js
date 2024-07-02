const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const mysql = require('mysql2/promise');
const cors = require('cors'); // Tambahkan CORS middleware

const app = express();
const PORT = 3000;

// Middleware CORS untuk mengizinkan permintaan dari localhost:5173
app.use(cors({
  origin: 'https://azamcell.akhyarazamta.my.id/',
}));

// Database configuration
const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: 'toor',
  database: 'abcreload'
};

// Function to fetch data from URL and save to database
async function fetchDataAndSave() {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to the database');

    const url = 'https://abcreload.webreport.info/harga.js.php?id=526e6aa08f8cd2546ab9632dfc777fb77b8c28edb9a959109e67a2826f8e2d6f4cfadb0549bc8ed3e520bd92a9f6b390747d-38';
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Iterate over each table with class 'tabel'
    const tables = $('table.tabel');
    for (let i = 0; i < tables.length; i++) {
      const table = tables.eq(i);
      const tableName = table.find('tr.head > td[colspan="6"]').text().trim();
      if (!tableName) {
        console.error('Table name (colspan) not found for table', i);
        continue; // Skip if colspan attribute not found
      }

      // Extract data from table rows
      const data = [];
      table.find('tr.td1, tr.td2').each((j, row) => {
        const kode = $(row).find('td').eq(0).text().trim();
        const keterangan = $(row).find('td').eq(1).text().trim();
        let harga = $(row).find('td').eq(2).text().trim().replace(/\./g, ''); // Remove thousand separators
        const status = $(row).find('td').eq(3).text().trim();

        // Convert harga to number
        harga = parseFloat(harga);

        if (kode && keterangan && !isNaN(harga) && status) {
          data.push([kode, keterangan, harga, status]);
        }
      });

      // Create table if not exists with sanitized table name
      const sanitizedTableName = tableName.replace(/[^a-zA-Z0-9$_]/g, '_'); // Sanitize table name
      await connection.query(`CREATE TABLE IF NOT EXISTS ${sanitizedTableName} (
        kode VARCHAR(255) PRIMARY KEY,
        keterangan VARCHAR(255),
        harga INT(11),
        status VARCHAR(255)
      )`);

      // Insert data into the table
      const sql = `INSERT INTO ${sanitizedTableName} (kode, keterangan, harga, status) VALUES ? 
                ON DUPLICATE KEY UPDATE keterangan=VALUES(keterangan), harga=VALUES(harga), status=VALUES(status)`;
      await connection.query(sql, [data]);
      console.log(`Inserted/updated data into table ${sanitizedTableName}`);
    }

    console.log('Database connection closed');
    return { success: true };
  } catch (error) {
    console.error('Error fetching or processing data:', error);
    return { success: false, error: error.message };
  } finally {
    if (connection && connection.end) {
      try {
        await connection.end();
        console.log('Database connection closed safely');
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }
  }
}

// Function to fetch data from URL and save to database
async function fetchData() {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to the database');

    // Get list of tables from information_schema.tables
    const [tables] = await connection.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'abcreload'");

    // Array to hold results from each table
    const allTablesData = [];

    // Iterate through each table and fetch data
    for (let i = 0; i < tables.length; i++) {
      const tableName = tables[i].table_name;

      // Fetch data from current table
      const [rows] = await connection.query(`SELECT * FROM ${tableName}`);

      // Push table data to allTablesData
      allTablesData.push({ tableName, rows });
    }

    console.log('Database connection closed');
    return { success: true, data: allTablesData };
  } catch (error) {
    console.error('Error fetching or processing data:', error);
    return { success: false, error: error.message };
  } finally {
    if (connection && connection.end) {
      try {
        await connection.end();
        console.log('Database connection closed safely');
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }
  }
}

// API endpoint to trigger data fetch and save
app.get('/fetch-data', async (req, res) => {
  const result = await fetchData();
  res.json(result);
});

// API endpoint to trigger data fetch and save
app.get('/fetch-data-save', async (req, res) => {
  const result = await fetchDataAndSave();
  res.json(result);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
