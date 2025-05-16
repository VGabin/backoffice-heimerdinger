const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "bot-mysql",
  user: process.env.MYSQL_USER || "botuser",
  password: process.env.MYSQL_PASSWORD || "botpass",
  database: process.env.MYSQL_DATABASE || "botdb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
