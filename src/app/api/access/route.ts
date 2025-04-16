import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkAccess } from "@/lib/access-service";
import { logAccessRequest } from "@/lib/logger";

// Input validation schema
const accessSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Log the request
    await logAccessRequest(request, body);

    // Validate the request body
    const result = accessSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.format() },
        { status: 400 }
      );
    }

    // Get the name from the validated data
    const { name } = result.data;

    try {
      // Check access using the service
      const accessResult = await checkAccess(name);

      // Return the result
      return NextResponse.json(accessResult);
    } catch (dbError) {
      console.error("Database error during access check:", dbError);

      // Check for database connection errors
      const errorMessage =
        dbError instanceof Error ? dbError.message : String(dbError);
      if (errorMessage.includes("database connection is not open")) {
        return NextResponse.json(
          {
            error: "Database connection error",
            message:
              "The database is currently unavailable. Please try again later or contact the administrator.",
          },
          { status: 503 } // Service Unavailable
        );
      }

      // Re-throw for the outer catch block to handle
      throw dbError;
    }
  } catch (error) {
    console.error("Error processing access request:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
