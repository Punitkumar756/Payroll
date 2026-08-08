import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  database: process.env.DB_NAME || "hrms",
  user: process.env.DB_USER || "hrms_app",
  password: process.env.DB_PASSWORD || "",
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  timezone: "+00:00",
});

export default pool;
