import { Pool } from "pg";

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
      value TEXT PRIMARY KEY,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create blocked_slugs table
  await client.query(`
    CREATE TABLE IF NOT EXISTS blocked_slugs (
      value TEXT PRIMARY KEY,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create allowed_names table
  await client.query(`
    CREATE TABLE IF NOT EXISTS allowed_names (
      value TEXT PRIMARY KEY,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create allowed_slugs table
  await client.query(`
    CREATE TABLE IF NOT EXISTS allowed_slugs (
      value TEXT PRIMARY KEY,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
}

async function initializeDatabase() {
  // Connect to PostgreSQL
  const pgPool = new Pool({
    connectionString:
      process.env.DB_URL || "postgresql://ameen:pwd@localhost:5432/sc-admin",
  });

  const pgClient = await pgPool.connect();

  try {
    // Initialize schema
    console.log("Initializing PostgreSQL schema...");
    await initializeSchema(pgClient);
    console.log("Database initialization completed successfully!");
  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exit(1);
  } finally {
    // Clean up
    pgClient.release();
    await pgPool.end();
  }
}

// Run the initialization
initializeDatabase().catch(console.error);
