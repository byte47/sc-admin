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
export function logAccess(
  name: string,
  slug: string,
  result: "allow" | "block",
  reason?: string
) {
  const stmt = db.prepare(`
    INSERT INTO access_history (name, slug, result, reason)
    VALUES (?, ?, ?, ?)
  `);

  return stmt.run(name, slug, result, reason || null);
}

export function getAccessHistory(limit = 100, offset = 0): HistoryItem[] {
  const stmt = db.prepare(`
    SELECT * FROM access_history
    ORDER BY access_time DESC
    LIMIT ? OFFSET ?
  `);

  return stmt.all(limit, offset) as HistoryItem[];
}

// Blocked list operations
export function isBlocked(value: string): boolean {
  const stmt = db.prepare("SELECT 1 FROM blocked_list WHERE value = ?");
  return !!stmt.get(value);
}

export function addToBlockedList(value: string) {
  const stmt = db.prepare(
    "INSERT OR IGNORE INTO blocked_list (value) VALUES (?)"
  );
  return stmt.run(value);
}

export function removeFromBlockedList(id: number) {
  const stmt = db.prepare("DELETE FROM blocked_list WHERE id = ?");
  return stmt.run(id);
}

export function getBlockedList(): ListItem[] {
  const stmt = db.prepare("SELECT * FROM blocked_list ORDER BY value");
  return stmt.all() as ListItem[];
}

// Allowed list operations
export function isAllowed(value: string): boolean {
  const stmt = db.prepare("SELECT 1 FROM allowed_list WHERE value = ?");
  return !!stmt.get(value);
}

export function addToAllowedList(value: string) {
  const stmt = db.prepare(
    "INSERT OR IGNORE INTO allowed_list (value) VALUES (?)"
  );
  return stmt.run(value);
}

export function removeFromAllowedList(id: number) {
  const stmt = db.prepare("DELETE FROM allowed_list WHERE id = ?");
  return stmt.run(id);
}

export function getAllowedList(): ListItem[] {
  const stmt = db.prepare("SELECT * FROM allowed_list ORDER BY value");
  return stmt.all() as ListItem[];
}

// Verification queue operations
export function addToQueue(name: string, slug: string) {
  const stmt = db.prepare(`
    INSERT INTO verification_queue (name, slug)
    VALUES (?, ?)
  `);

  return stmt.run(name, slug);
}

export function getVerificationQueue(status = "pending"): QueueItem[] {
  const stmt = db.prepare(`
    SELECT * FROM verification_queue 
    WHERE status = ?
    ORDER BY queued_at DESC
  `);

  return stmt.all(status) as QueueItem[];
}

export function updateQueueItemStatus(
  id: number,
  status: "pending" | "reviewed"
) {
  const stmt = db.prepare(
    "UPDATE verification_queue SET status = ? WHERE id = ?"
  );
  return stmt.run(status, id);
}

// Messages operations
export function addMessage(name: string, content: string) {
  const slug = slugify(name);
  const stmt = db.prepare(`
    INSERT INTO messages (name, slug, content)
    VALUES (?, ?, ?)
  `);

  return stmt.run(name, slug, content);
}

export function getMessages(limit = 100, offset = 0): Message[] {
  const stmt = db.prepare(`
    SELECT * FROM messages
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `);

  return stmt.all(limit, offset) as Message[];
}

export function getMessagesByName(
  name: string,
  limit = 100,
  offset = 0
): Message[] {
  const stmt = db.prepare(`
    SELECT * FROM messages
    WHERE LOWER(name) = LOWER(?)
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `);

  return stmt.all(name, limit, offset) as Message[];
}

export function getMessagesBySlug(
  slug: string,
  limit = 100,
  offset = 0
): Message[] {
  const stmt = db.prepare(`
    SELECT * FROM messages
    WHERE LOWER(slug) = LOWER(?)
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `);

  return stmt.all(slug, limit, offset) as Message[];
}
