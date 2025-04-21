import { NextRequest, NextResponse } from "next/server";
import { logRequest, debugLog } from "@/lib/logger";
import path from "path";

const REQUESTS_LOG_FILE = path.join(process.cwd(), "logs", "requests.log");

export async function POST(request: NextRequest) {
  debugLog("POST /api/requests - request received");
  const rawBody = await request.text();
  debugLog("POST /api/requests - raw body", rawBody);
  let body: any = rawBody;
  try {
    body = JSON.parse(rawBody);
    debugLog("POST /api/requests - parsed body", body);
  } catch {
    debugLog("POST /api/requests - body is not JSON");
    // Not JSON, keep as text
  }
  try {
    await logRequest(request, REQUESTS_LOG_FILE, body);
    debugLog("POST /api/requests - logged request");
    return NextResponse.json({ success: true });
  } catch (error) {
    debugLog("POST /api/requests - error", error);
    return NextResponse.json({ success: false, error: String(error) });
  }
}
