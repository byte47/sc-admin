import pool from "./db-pg";

// Types
export interface Message {
  id: number;
  name: string;
  slug: string;
  content: string;
  created_at: Date;
}

export interface AccessHistory {
  id: number;
  name: string;
  slug: string;
  access_time: Date;
  result: "allow" | "block";
  reason?: string;
}

// Access History Functions
export async function addAccessHistory(
  name: string,
  slug: string,
  result: "allow" | "block",
  reason?: string
) {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO access_history (name, slug, result, reason)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const queryResult = await client.query(query, [name, slug, result, reason]);
    return queryResult.rows[0];
  } finally {
    client.release();
  }
}

export async function getAccessHistory(
  limit = 100,
  offset = 0
): Promise<AccessHistory[]> {
  const client = await pool.connect();
  try {
    const query = `
      SELECT * FROM access_history
      ORDER BY access_time DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await client.query(query, [limit, offset]);
    return result.rows;
  } finally {
    client.release();
  }
}

// Blocked Names Functions
export async function addToBlockedNames(value: string) {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO blocked_names (value)
      VALUES ($1)
      ON CONFLICT (value) DO NOTHING
      RETURNING *
    `;
    const result = await client.query(query, [value]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getBlockedNames(): Promise<string[]> {
  const client = await pool.connect();
  try {
    const query = "SELECT value FROM blocked_names";
    const result = await client.query(query);
    return result.rows.map((row) => row.value);
  } finally {
    client.release();
  }
}

export async function removeFromBlockedNames(value: string) {
  const client = await pool.connect();
  try {
    const query = "DELETE FROM blocked_names WHERE value = $1";
    await client.query(query, [value]);
  } finally {
    client.release();
  }
}

// Blocked Slugs Functions
export async function addToBlockedSlugs(value: string) {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO blocked_slugs (value)
      VALUES ($1)
      ON CONFLICT (value) DO NOTHING
      RETURNING *
    `;
    const result = await client.query(query, [value]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getBlockedSlugs(): Promise<string[]> {
  const client = await pool.connect();
  try {
    const query = "SELECT value FROM blocked_slugs";
    const result = await client.query(query);
    return result.rows.map((row) => row.value);
  } finally {
    client.release();
  }
}

export async function removeFromBlockedSlugs(value: string) {
  const client = await pool.connect();
  try {
    const query = "DELETE FROM blocked_slugs WHERE value = $1";
    await client.query(query, [value]);
  } finally {
    client.release();
  }
}

// Allowed Names Functions
export async function addToAllowedNames(value: string) {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO allowed_names (value)
      VALUES ($1)
      ON CONFLICT (value) DO NOTHING
      RETURNING *
    `;
    const result = await client.query(query, [value]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getAllowedNames(): Promise<string[]> {
  const client = await pool.connect();
  try {
    const query = "SELECT value FROM allowed_names";
    const result = await client.query(query);
    return result.rows.map((row) => row.value);
  } finally {
    client.release();
  }
}

export async function removeFromAllowedNames(value: string) {
  const client = await pool.connect();
  try {
    const query = "DELETE FROM allowed_names WHERE value = $1";
    await client.query(query, [value]);
  } finally {
    client.release();
  }
}

// Allowed Slugs Functions
export async function addToAllowedSlugs(value: string) {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO allowed_slugs (value)
      VALUES ($1)
      ON CONFLICT (value) DO NOTHING
      RETURNING *
    `;
    const result = await client.query(query, [value]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getAllowedSlugs(): Promise<string[]> {
  const client = await pool.connect();
  try {
    const query = "SELECT value FROM allowed_slugs";
    const result = await client.query(query);
    return result.rows.map((row) => row.value);
  } finally {
    client.release();
  }
}

export async function removeFromAllowedSlugs(value: string) {
  const client = await pool.connect();
  try {
    const query = "DELETE FROM allowed_slugs WHERE value = $1";
    await client.query(query, [value]);
  } finally {
    client.release();
  }
}

// Verification Queue Functions
export async function addToVerificationQueue(name: string, slug: string) {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO verification_queue (name, slug)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await client.query(query, [name, slug]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getVerificationQueue(limit = 100, offset = 0) {
  const client = await pool.connect();
  try {
    const query = `
      SELECT * FROM verification_queue
      ORDER BY queued_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await client.query(query, [limit, offset]);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function updateVerificationStatus(
  id: number,
  status: "pending" | "reviewed"
) {
  const client = await pool.connect();
  try {
    const query = `
      UPDATE verification_queue
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await client.query(query, [status, id]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Messages Functions
export async function addMessage(name: string, slug: string, content: string) {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO messages (name, slug, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await client.query(query, [name, slug, content]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getMessages(limit = 100, offset = 0): Promise<Message[]> {
  const client = await pool.connect();
  try {
    const query = `
      SELECT * FROM messages
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await client.query(query, [limit, offset]);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getMessagesByName(
  name: string,
  limit = 100,
  offset = 0
): Promise<Message[]> {
  const client = await pool.connect();
  try {
    const query = `
      SELECT * FROM messages
      WHERE LOWER(name) = LOWER($1)
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await client.query(query, [name, limit, offset]);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getMessagesBySlug(
  slug: string,
  limit = 100,
  offset = 0
): Promise<Message[]> {
  const client = await pool.connect();
  try {
    const query = `
      SELECT * FROM messages
      WHERE LOWER(slug) = LOWER($1)
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await client.query(query, [slug, limit, offset]);
    return result.rows;
  } finally {
    client.release();
  }
}
