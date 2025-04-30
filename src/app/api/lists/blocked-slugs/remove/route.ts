import { NextRequest, NextResponse } from "next/server";
import { removeFromBlockedSlugsAction } from "@/lib/actions";

export async function POST(request: NextRequest) {
  try {
    // Get the id from URL params
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");

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

    // Remove from blocked slugs list using server action
    await removeFromBlockedSlugsAction(id.toString());

    // Redirect back to the blocked slugs page
    return NextResponse.redirect("/admin/lists/blocked-slugs");
  } catch (error) {
    console.error("Error removing from blocked slugs list:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
