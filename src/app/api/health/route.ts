import { NextResponse } from "next/server";
import pool from "@/lib/db-pg";

export async function GET() {
  try {
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
    } finally {
      client.release();
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      { status: "error", message: "Health check failed" },
      { status: 503 }
    );
  }
}
