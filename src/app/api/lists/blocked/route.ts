import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  addToBlockedNamesAction,
  addToBlockedSlugsAction,
} from "@/lib/actions";
import { debugLog } from "@/lib/logger";

// Input validation schema
const addSchema = z.object({
  value: z.string().min(1).max(100),
  type: z.enum(["name", "slug"]).default("name"),
});

export async function POST(request: NextRequest) {
  try {
    debugLog("POST /api/lists/blocked - request received");
    const body = await request.json();
    debugLog("POST /api/lists/blocked - request body", body);

    // Validate the request body
    const result = addSchema.safeParse(body);
    if (!result.success) {
      debugLog(
        "POST /api/lists/blocked - invalid request data",
        result.error.format()
      );
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.format() },
        { status: 400 }
      );
    }

    // Add to blocked list using server action
    const { value, type } = result.data;
    debugLog("POST /api/lists/blocked - add", { value, type });

    if (type === "name") {
      await addToBlockedNamesAction(value);
    } else {
      await addToBlockedSlugsAction(value);
    }

    // Return success
    debugLog("POST /api/lists/blocked - response success");
    return NextResponse.json({ success: true });
  } catch (error) {
    debugLog("POST /api/lists/blocked - error", error);
    console.error("Error adding to blocked list:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
