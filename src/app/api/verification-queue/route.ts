import { NextResponse } from "next/server";
import { getVerificationQueueAction } from "@/lib/actions";
import { debugLog } from "@/lib/logger";

export async function GET() {
  try {
    // debugLog("GET /api/verification-queue - request received");
    const items = await getVerificationQueueAction("pending");
    // debugLog("GET /api/verification-queue - response", items);
    return NextResponse.json(items);
  } catch (error) {
    debugLog("GET /api/verification-queue - error", error);
    // ... existing code ...
  }
}
