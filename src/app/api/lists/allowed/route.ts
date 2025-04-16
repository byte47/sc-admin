import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  addToAllowedNamesAction,
  addToAllowedSlugsAction,
} from "@/lib/actions";

// Input validation schema
const addSchema = z.object({
  value: z.string().min(1).max(100),
  type: z.enum(["name", "slug"]).default("name"),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate the request body
    const result = addSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.format() },
        { status: 400 }
      );
    }

    // Add to allowed list using server action
    const { value, type } = result.data;

    if (type === "name") {
      await addToAllowedNamesAction(value);
    } else {
      await addToAllowedSlugsAction(value);
    }

    // Return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding to allowed list:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
