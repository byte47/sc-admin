import { NextResponse } from "next/server";
import pool from "@/lib/db-pg";

export async function GET() {
  let lastMessage: string | null = null;
  let lastAccess: string | null = null;
  try {
    const client = await pool.connect();
    try {
      // Get latest message created_at
      const msgRes = await client.query(
        "SELECT created_at FROM messages ORDER BY created_at DESC LIMIT 1"
      );
      if (msgRes.rows.length > 0 && msgRes.rows[0].created_at) {
        lastMessage = new Date(msgRes.rows[0].created_at).toISOString();
      }
      // Get latest access_history access_time
      const accessRes = await client.query(
        "SELECT access_time FROM access_history ORDER BY access_time DESC LIMIT 1"
      );
      if (accessRes.rows.length > 0 && accessRes.rows[0].access_time) {
        lastAccess = new Date(accessRes.rows[0].access_time).toISOString();
      }
    } finally {
      client.release();
    }
  } catch {
    // Log error if needed
  }
  return NextResponse.json({ lastMessage, lastAccess });
}
