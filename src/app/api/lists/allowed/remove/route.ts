import { NextRequest, NextResponse } from "next/server";
import { removeFromAllowedNamesAction } from "@/lib/actions";
import { debugLog } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    debugLog("POST /api/lists/allowed/remove - request received", request.url);
    // Get the id from URL params
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");
    debugLog("POST /api/lists/allowed/remove - idParam", idParam);

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

    // Remove from allowed list using server action
    await removeFromAllowedNamesAction(id.toString());

    // Redirect back to the lists page
    debugLog("POST /api/lists/allowed/remove - response redirect");
    return NextResponse.redirect(new URL("/admin/lists", request.url));
  } catch (error) {
    debugLog("POST /api/lists/allowed/remove - error", error);
    console.error("Error removing from allowed list:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
