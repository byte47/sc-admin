import { NextRequest, NextResponse } from "next/server";
import { getAccessHistoryAction } from "@/lib/actions";
import { debugLog } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    // debugLog("GET /api/access-history - request received", request.url);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "30", 10);
    // debugLog("GET /api/access-history - limit", limit);
    const { items, total } = await getAccessHistoryAction(1, limit);
    // debugLog("GET /api/access-history - response", { items, total });
    return NextResponse.json({ items, total });
  } catch (error) {
    debugLog("GET /api/access-history - error", error);
    // ... existing code ...
  }
}
