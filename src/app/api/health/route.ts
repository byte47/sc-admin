import { NextResponse } from "next/server";
import pool from "@/lib/db-pg";
import { debugLog } from "@/lib/logger";

export async function GET() {
  try {
    debugLog("GET /api/health - request received");
    // Check database connection
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT 1");
      if (!result.rows[0]) {
        return NextResponse.json(
          { status: "error", message: "Database check failed" },
          { status: 503 }
        );
      }
      debugLog("GET /api/health - DB check result", result.rows);
    } finally {
      client.release();
    }

    debugLog("GET /api/health - response ok");
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    debugLog("GET /api/health - error", error);
    console.error("Health check failed:", error);
    return NextResponse.json(
      { status: "error", message: "Health check failed" },
      { status: 503 }
    );
  }
}
