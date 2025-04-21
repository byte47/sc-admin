import { NextRequest, NextResponse } from "next/server";
import { removeFromBlockedNamesAction } from "@/lib/actions";
import { debugLog } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    debugLog("POST /api/lists/blocked/remove - request received", request.url);
    // Get the id from URL params
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");
    debugLog("POST /api/lists/blocked/remove - idParam", idParam);

    if (!idParam) {
      return NextResponse.json(
        { error: "Missing required id parameter" },
        { status: 400 }
      );
    }

    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid id parameter" },
        { status: 400 }
      );
    }

    // Remove from blocked list using server action
    await removeFromBlockedNamesAction(id.toString());

    // Redirect back to the lists page
    debugLog("POST /api/lists/blocked/remove - response redirect");
    return NextResponse.redirect(new URL("/admin/lists", request.url));
  } catch (error) {
    debugLog("POST /api/lists/blocked/remove - error", error);
    console.error("Error removing from blocked list:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
