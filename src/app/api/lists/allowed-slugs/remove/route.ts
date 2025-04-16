import { NextRequest, NextResponse } from "next/server";
import { removeFromAllowedSlugsAction } from "@/lib/actions";

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

    // Remove from allowed slugs list using server action
    await removeFromAllowedSlugsAction(id.toString());

    // Redirect back to the lists page
    return NextResponse.redirect(
      new URL("/admin/lists?tab=allowed", request.url)
    );
  } catch (error) {
    console.error("Error removing from allowed slugs list:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
