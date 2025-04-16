import fs from "fs";
import path from "path";
import { Pool } from "pg";
import config from "@/config";

async function initializeSchema(client: any) {
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
}

/**
 * This function resets the database by dropping and recreating all tables.
 * It's used for maintenance and testing purposes.
 */
export default async function resetDatabase(): Promise<void> {
  // Connect to PostgreSQL
  const pool = new Pool({
    connectionString:
      process.env.DB_URL || "postgresql://ameen:pwd@localhost:5432/sc-admin",
  });

  const client = await pool.connect();

  try {
    // Start transaction
    await client.query("BEGIN");

    // Drop all tables
    await client.query(`
      DROP TABLE IF EXISTS access_history CASCADE;
      DROP TABLE IF EXISTS blocked_names CASCADE;
      DROP TABLE IF EXISTS blocked_slugs CASCADE;
      DROP TABLE IF EXISTS allowed_names CASCADE;
      DROP TABLE IF EXISTS allowed_slugs CASCADE;
      DROP TABLE IF EXISTS verification_queue CASCADE;
      DROP TABLE IF EXISTS messages CASCADE;
    `);

    // Initialize schema
    await initializeSchema(client);

    // Commit transaction
    await client.query("COMMIT");
    console.log("Database has been reset successfully");
  } catch (error) {
    // Rollback transaction on error
    await client.query("ROLLBACK");
    console.error("Failed to reset database:", error);
    throw error;
  } finally {
    // Clean up
    client.release();
    await pool.end();
  }
}
