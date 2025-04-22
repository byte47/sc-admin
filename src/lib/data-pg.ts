import pool from "./db-pg";
import { debugLog } from "./logger";

// Types
export interface Message {
  id: number;
  from: string;
  to: string;
  text: string;
  is_flagged: boolean;
  time: Date | null;
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
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{ items: AccessHistory[]; total: number }> {
  const client = await pool.connect();
  try {
    const offset = (page - 1) * limit;
    let whereClause = "";
    const params: any[] = [limit, offset];

    if (search) {
      whereClause = `
        WHERE 
          LOWER(name) LIKE LOWER($3) OR 
          LOWER(slug) LIKE LOWER($3) OR 
          LOWER(COALESCE(reason, '')) LIKE LOWER($3)
      `;
      params.push(`%${search}%`);
    }

    const countQuery = `
      SELECT COUNT(*) 
      FROM access_history
      ${whereClause}
    `;

    const itemsQuery = `
      SELECT * 
      FROM access_history
      ${whereClause}
      ORDER BY access_time DESC
      LIMIT $1 OFFSET $2
    `;

    const [countResult, itemsResult] = await Promise.all([
      client.query(countQuery, search ? [params[2]] : []),
      client.query(itemsQuery, params),
    ]);

    return {
      items: itemsResult.rows,
      total: parseInt(countResult.rows[0].count),
    };
  } finally {
    client.release();
  }
}

// Blocked Names Functions
export async function addToBlockedNames(value: string) {
  debugLog("addToBlockedNames called with value:", value);
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO blocked_names (value)
      VALUES ($1)
      ON CONFLICT (value) DO NOTHING
      RETURNING *
    `;
    const result = await client.query(query, [value]);
    debugLog("addToBlockedNames result:", result.rows[0]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getBlockedNames(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{ items: string[]; total: number }> {
  const client = await pool.connect();
  try {
    const offset = (page - 1) * limit;
    const searchCondition = search ? `WHERE value ILIKE $3` : "";
    const searchParam = search ? `%${search}%` : null;

    const countQuery = `
      SELECT COUNT(*) FROM blocked_names
      ${searchCondition}
    `;
    const itemsQuery = `
      SELECT value FROM blocked_names
      ${searchCondition}
      ORDER BY value LIMIT $1 OFFSET $2
    `;

    const [countResult, itemsResult] = await Promise.all([
      client.query(
        search ? countQuery : countQuery,
        search ? [searchParam] : []
      ),
      client.query(
        search ? itemsQuery : itemsQuery,
        search ? [limit, offset, searchParam] : [limit, offset]
      ),
    ]);

    return {
      items: itemsResult.rows.map((row) => row.value),
      total: parseInt(countResult.rows[0].count),
    };
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
  debugLog("addToBlockedSlugs called with value:", value);
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO blocked_slugs (value)
      VALUES ($1)
      ON CONFLICT (value) DO NOTHING
      RETURNING *
    `;
    const result = await client.query(query, [value]);
    debugLog("addToBlockedSlugs result:", result.rows[0]);
    return result.rows[0];
  } catch (error) {
    if (error instanceof Error && error.message.includes("23505")) {
      debugLog("addToBlockedSlugs duplicate slug:", value, "skipping...");
      console.error("duplicate slug:", value, " skipping...");
    } else {
      debugLog("addToBlockedSlugs error:", error);
      console.error("Error adding blocked slug " + value + ":", error);
      throw error;
    }
  } finally {
    client.release();
  }
}

export async function getBlockedSlugs(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{ items: string[]; total: number }> {
  const client = await pool.connect();
  try {
    const offset = (page - 1) * limit;
    const searchCondition = search ? `WHERE value ILIKE $3` : "";
    const searchParam = search ? `%${search}%` : null;

    const countQuery = `
      SELECT COUNT(*) FROM blocked_slugs
      ${searchCondition}
    `;
    const itemsQuery = `
      SELECT value FROM blocked_slugs
      ${searchCondition}
      ORDER BY value LIMIT $1 OFFSET $2
    `;

    const [countResult, itemsResult] = await Promise.all([
      client.query(
        search ? countQuery : countQuery,
        search ? [searchParam] : []
      ),
      client.query(
        search ? itemsQuery : itemsQuery,
        search ? [limit, offset, searchParam] : [limit, offset]
      ),
    ]);

    return {
      items: itemsResult.rows.map((row) => row.value),
      total: parseInt(countResult.rows[0].count),
    };
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
  debugLog("addToAllowedNames called with value:", value);
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO allowed_names (value)
      VALUES ($1)
      ON CONFLICT (value) DO NOTHING
      RETURNING *
    `;
    const result = await client.query(query, [value]);
    debugLog("addToAllowedNames result:", result.rows[0]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getAllowedNames(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{ items: string[]; total: number }> {
  const client = await pool.connect();
  try {
    const offset = (page - 1) * limit;
    const searchCondition = search ? `WHERE value ILIKE $3` : "";
    const searchParam = search ? `%${search}%` : null;

    const countQuery = `
      SELECT COUNT(*) FROM allowed_names
      ${searchCondition}
    `;
    const itemsQuery = `
      SELECT value FROM allowed_names
      ${searchCondition}
      ORDER BY value LIMIT $1 OFFSET $2
    `;

    const [countResult, itemsResult] = await Promise.all([
      client.query(
        search ? countQuery : countQuery,
        search ? [searchParam] : []
      ),
      client.query(
        search ? itemsQuery : itemsQuery,
        search ? [limit, offset, searchParam] : [limit, offset]
      ),
    ]);

    return {
      items: itemsResult.rows.map((row) => row.value),
      total: parseInt(countResult.rows[0].count),
    };
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
  debugLog("addToAllowedSlugs called with value:", value);
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO allowed_slugs (value)
      VALUES ($1)
      ON CONFLICT (value) DO NOTHING
      RETURNING *
    `;
    const result = await client.query(query, [value]);
    debugLog("addToAllowedSlugs result:", result.rows[0]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getAllowedSlugs(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{ items: string[]; total: number }> {
  const client = await pool.connect();
  try {
    const offset = (page - 1) * limit;
    const searchCondition = search ? `WHERE value ILIKE $3` : "";
    const searchParam = search ? `%${search}%` : null;

    const countQuery = `
      SELECT COUNT(*) FROM allowed_slugs
      ${searchCondition}
    `;
    const itemsQuery = `
      SELECT value FROM allowed_slugs
      ${searchCondition}
      ORDER BY value LIMIT $1 OFFSET $2
    `;

    const [countResult, itemsResult] = await Promise.all([
      client.query(
        search ? countQuery : countQuery,
        search ? [searchParam] : []
      ),
      client.query(
        search ? itemsQuery : itemsQuery,
        search ? [limit, offset, searchParam] : [limit, offset]
      ),
    ]);

    return {
      items: itemsResult.rows.map((row) => row.value),
      total: parseInt(countResult.rows[0].count),
    };
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
export async function addMessage(
  from: string,
  to: string,
  text: string,
  is_flagged: boolean,
  time: Date | null
) {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO messages ("from", "to", text, is_flagged, time)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT ("from", text, time) DO NOTHING
      RETURNING *
    `;
    const result = await client.query(query, [
      from,
      to,
      text,
      is_flagged,
      time,
    ]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getMessages(
  page: number = 1,
  limit: number = 10,
  search?: string,
  lastHourOnly: boolean = false
): Promise<{ items: Message[]; total: number }> {
  const client = await pool.connect();
  try {
    const offset = (page - 1) * limit;
    let whereClause = "";
    const params: any[] = [limit, offset];
    let paramIndex = 3;

    if (lastHourOnly) {
      whereClause = "WHERE created_at >= NOW() - INTERVAL '30 minutes'";
    }

    if (search) {
      if (whereClause) {
        whereClause += ` AND (LOWER(\"from\") LIKE LOWER($${paramIndex}) OR LOWER(\"to\") LIKE LOWER($${paramIndex}) OR LOWER(text) LIKE LOWER($${paramIndex}))`;
      } else {
        whereClause = `WHERE (LOWER(\"from\") LIKE LOWER($${paramIndex}) OR LOWER(\"to\") LIKE LOWER($${paramIndex}) OR LOWER(text) LIKE LOWER($${paramIndex}))`;
      }
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) 
      FROM messages
      ${whereClause}
    `;

    const itemsQuery = `
      SELECT * 
      FROM messages
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const [countResult, itemsResult] = await Promise.all([
      client.query(countQuery, params.slice(2)),
      client.query(itemsQuery, params),
    ]);

    return {
      items: itemsResult.rows,
      total: parseInt(countResult.rows[0].count),
    };
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
      WHERE LOWER(from) = LOWER($1)
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
      WHERE LOWER(to) = LOWER($1)
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await client.query(query, [slug, limit, offset]);
    return result.rows;
  } finally {
    client.release();
  }
}

// Optimized DB-level existence checks
export async function isBlockedSlug(slug: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const query = `SELECT 1 FROM blocked_slugs WHERE value ILIKE $1 LIMIT 1`;
    const result = await client.query(query, [slug]);
    return (result.rowCount ?? 0) > 0;
  } finally {
    client.release();
  }
}

export async function isAllowedSlug(slug: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const query = `SELECT 1 FROM allowed_slugs WHERE value ILIKE $1 LIMIT 1`;
    const result = await client.query(query, [slug]);
    return (result.rowCount ?? 0) > 0;
  } finally {
    client.release();
  }
}

export async function isBlockedName(name: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const query = `SELECT 1 FROM blocked_names WHERE value ILIKE $1 LIMIT 1`;
    const result = await client.query(query, [name]);
    return (result.rowCount ?? 0) > 0;
  } finally {
    client.release();
  }
}

export async function isAllowedName(name: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const query = `SELECT 1 FROM allowed_names WHERE value ILIKE $1 LIMIT 1`;
    const result = await client.query(query, [name]);
    return (result.rowCount ?? 0) > 0;
  } finally {
    client.release();
  }
}
