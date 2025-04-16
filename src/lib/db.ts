import "server-only";
import { Pool } from "pg";
import config from "@/config";

/**
 * Create a database connection pool
 */
const pool = new Pool({
  connectionString:
    process.env.DB_URL || "postgresql://ameen:pwd@localhost:5432/sc-admin",
});

// Initialize the database schema
const initDb = async () => {
  const client = await pool.connect();
  try {
    // Create access_history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS access_history (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        access_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        result TEXT CHECK(result IN ('allow', 'block')) NOT NULL,
        reason TEXT
      )
    `);

    // Create blocked_names table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blocked_names (
        id SERIAL PRIMARY KEY,
        value TEXT UNIQUE NOT NULL
      )
    `);

    // Create blocked_slugs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blocked_slugs (
        id SERIAL PRIMARY KEY,
        value TEXT UNIQUE NOT NULL
      )
    `);

    // Create allowed_names table
    await client.query(`
      CREATE TABLE IF NOT EXISTS allowed_names (
        id SERIAL PRIMARY KEY,
        value TEXT UNIQUE NOT NULL
      )
    `);

    // Create allowed_slugs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS allowed_slugs (
        id SERIAL PRIMARY KEY,
        value TEXT UNIQUE NOT NULL
      )
    `);

    // Create verification_queue table
    await client.query(`
      CREATE TABLE IF NOT EXISTS verification_queue (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        queued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT CHECK(status IN ('pending', 'reviewed')) DEFAULT 'pending'
      )
    `);

    // Create messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Database schema initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database schema:", error);
    throw error;
  } finally {
    client.release();
  }
};

// Run the initialization
initDb().catch(console.error);

export default pool;
