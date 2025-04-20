import { NextResponse } from "next/server";
import { getLastRequestsLogs } from "@/lib/logger";

export async function GET() {
  const logs = getLastRequestsLogs(5);
  return NextResponse.json(logs);
}
