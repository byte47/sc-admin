import { NextResponse } from "next/server";
import { getLastRequestsLogs, debugLog } from "@/lib/logger";

export async function GET() {
  try {
    debugLog("GET /api/admin/requests-logs - request received");
    const logs = getLastRequestsLogs(5);
    debugLog("GET /api/admin/requests-logs - response", logs);
    return NextResponse.json(logs);
  } catch (error) {
    debugLog("GET /api/admin/requests-logs - error", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
