import { NextRequest, NextResponse } from "next/server";
import { logRequest } from "@/lib/logger";
import path from "path";

const REQUESTS_LOG_FILE = path.join(process.cwd(), "logs", "requests.log");

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  let body: any = rawBody;
  try {
    body = JSON.parse(rawBody);
  } catch {
    // Not JSON, keep as text
  }
  await logRequest(request, REQUESTS_LOG_FILE, body);
  return NextResponse.json({ success: true });
}
