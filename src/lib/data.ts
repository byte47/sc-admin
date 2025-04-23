import db from "./db";
import { slugify } from "./utils";

export type AccessResult = {
  result: "allow" | "block";
  reason?: string;
};

export type HistoryItem = {
  id: number;
  name: string;
  slug: string;
  access_time: string;
  result: "allow" | "block";
  reason?: string;
};

export type QueueItem = {
  id: number;
  name: string;
  slug: string;
  queued_at: string;
  status: "pending" | "reviewed";
};

export type ListItem = {
  id: number;
  value: string;
};

export type Message = {
  id: number;
  name: string;
  slug: string;
  content: string;
  created_at: string;
  // Optional flags for future database schema updates
  is_flagged?: boolean;
  is_blocked?: boolean;
  flag_reason?: string;
};

// Access history operations
export async function logAccess(
  name: string,
  slug: string,
  result: "allow" | "block",
  reason?: string
) {
  const { rows } = await db.query(
    `INSERT INTO access_history (name, slug, result, reason)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, slug, result, reason || null]
  );
  return rows[0];
}

export async function getAccessHistory(
  page: number = 1,
  limit: number = 10,
  search?: string,
  result?: "allow" | "block"
): Promise<{ items: HistoryItem[]; total: number }> {
  const whereClauses: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (search) {
    whereClauses.push(`(
      LOWER(name) LIKE LOWER($${paramIndex}) OR 
      LOWER(slug) LIKE LOWER($${paramIndex}) OR 
      LOWER(COALESCE(reason, '')) LIKE LOWER($${paramIndex})
    )`);
    params.push(`%${search}%`);
    paramIndex++;
  }
  if (result) {
    whereClauses.push(`result = $${paramIndex}`);
    params.push(result);
    paramIndex++;
  }
  const whereClause =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const offset = (page - 1) * limit;

  const countQuery = `
    SELECT COUNT(*) FROM access_history
    ${whereClause}
  `;
  const itemsQuery = `
    SELECT * FROM access_history
    ${whereClause}
    ORDER BY access_time DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  params.push(limit, offset);

  const countResult = await db.query(
    countQuery,
    params.slice(0, paramIndex - 1)
  );
  const itemsResult = await db.query(itemsQuery, params);

  return {
    items: itemsResult.rows,
    total: parseInt(countResult.rows[0].count),
  };
}

// Blocked list operations
export async function isBlocked(value: string): Promise<boolean> {
  const { rows } = await db.query(
    "SELECT 1 FROM blocked_list WHERE value = $1",
    [value]
  );
  return rows.length > 0;
}

export async function addToBlockedList(value: string) {
  const { rows } = await db.query(
    "INSERT INTO blocked_list (value) VALUES ($1) ON CONFLICT DO NOTHING RETURNING *",
    [value]
  );
  return rows[0];
}

export async function removeFromBlockedList(id: number) {
  const { rows } = await db.query(
    "DELETE FROM blocked_list WHERE id = $1 RETURNING *",
    [id]
  );
  return rows[0];
}

export async function getBlockedList(): Promise<ListItem[]> {
  const { rows } = await db.query("SELECT * FROM blocked_list ORDER BY value");
  return rows;
}

// Allowed list operations
export async function isAllowed(value: string): Promise<boolean> {
  const { rows } = await db.query(
    "SELECT 1 FROM allowed_list WHERE value = $1",
    [value]
  );
  return rows.length > 0;
}

export async function addToAllowedList(value: string) {
  const { rows } = await db.query(
    "INSERT INTO allowed_list (value) VALUES ($1) ON CONFLICT DO NOTHING RETURNING *",
    [value]
  );
  return rows[0];
}

export async function removeFromAllowedList(id: number) {
  const { rows } = await db.query(
    "DELETE FROM allowed_list WHERE id = $1 RETURNING *",
    [id]
  );
  return rows[0];
}

export async function getAllowedList(): Promise<ListItem[]> {
  const { rows } = await db.query("SELECT * FROM allowed_list ORDER BY value");
  return rows;
}

// Verification queue operations
export async function addToQueue(name: string, slug: string) {
  const { rows } = await db.query(
    `INSERT INTO verification_queue (name, slug)
     VALUES ($1, $2)
     RETURNING *`,
    [name, slug]
  );
  return rows[0];
}

export async function getVerificationQueue(
  status = "pending"
): Promise<QueueItem[]> {
  const { rows } = await db.query(
    `SELECT * FROM verification_queue 
     WHERE status = $1
     ORDER BY queued_at DESC`,
    [status]
  );
  return rows;
}

export async function updateQueueItemStatus(
  id: number,
  status: "pending" | "reviewed"
) {
  const { rows } = await db.query(
    "UPDATE verification_queue SET status = $1 WHERE id = $2 RETURNING *",
    [status, id]
  );
  return rows[0];
}

// Messages operations
export async function addMessage(name: string, content: string) {
  const slug = slugify(name);
  const { rows } = await db.query(
    `INSERT INTO messages (name, slug, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, slug, content]
  );
  return rows[0];
}

export async function getMessages(limit = 100, offset = 0): Promise<Message[]> {
  const { rows } = await db.query(
    `SELECT * FROM messages
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return rows;
}

export async function getMessagesByName(
  name: string,
  limit = 100,
  offset = 0
): Promise<Message[]> {
  const { rows } = await db.query(
    `SELECT * FROM messages
     WHERE LOWER(name) = LOWER($1)
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [name, limit, offset]
  );
  return rows;
}

export async function getMessagesBySlug(
  slug: string,
  limit = 100,
  offset = 0
): Promise<Message[]> {
  const { rows } = await db.query(
    `SELECT * FROM messages
     WHERE LOWER(slug) = LOWER($1)
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [slug, limit, offset]
  );
  return rows;
}
