import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addBulkMessagesAction } from "@/lib/actions";
import { logMessagesRequest, debugLog } from "@/lib/logger";

// Input validation schema
const messageSchema = z.object({
  name: z.string().min(1).max(100),
  messages: z.array(z.string().min(1).max(1000)).min(1),
});

export async function POST(request: NextRequest) {
  try {
    debugLog("POST /api/messages - request received");
    // Parse request body
    const body = await request.json();
    debugLog("POST /api/messages - request body", body);

    // Log the request
    await logMessagesRequest(request, body);

    // Validate the request body
    const result = messageSchema.safeParse(body);
    if (!result.success) {
      debugLog(
        "POST /api/messages - invalid request data",
        result.error.format()
      );
      console.log(
        `400: /api/messages Invalid request data: ${result.error.format()}`
      );

      return new NextResponse("true", {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
        },
      });

      // return NextResponse.json(
      //   { error: "Invalid request data", details: result.error.format() },
      //   { status: 400 }
      // );
    }

    // Get the name and messages from the validated data
    const { name, messages } = result.data;

    // Log all messages to the console
    console.log("Received messages:", { name, messages });

    try {
      // Store the messages without access checking
      const messagesToStore = messages.map((text: string) => ({
        from: name,
        to: "",
        text,
        is_flagged: false,
        time: null,
      }));
      const results = await addBulkMessagesAction(messagesToStore);
      debugLog("POST /api/messages - addBulkMessagesAction results", results);

      // Print each processed message to the console
      messagesToStore.forEach((msg, idx) => {
        console.log(`Processed message from '${msg.from}':`, msg.text);
      });

      // Check if any message was blocked or flagged
      const hasBlockedOrFlagged = results.some(
        (result) => result.blocked || result.flagged
      );

      if (hasBlockedOrFlagged) {
        return new NextResponse("false", {
          status: 200,
          headers: {
            "Content-Type": "text/plain",
          },
        });
      } else {
        return new NextResponse("true", {
          status: 200,
          headers: {
            "Content-Type": "text/plain",
          },
        });
      }
      // Return success
      // return NextResponse.json({
      //   success: true,
      //   count: messages.length,
      //   flagged: result.flagged,
      //   blocked: result.blocked,
      // });
    } catch (dbError) {
      debugLog("POST /api/messages - db error", dbError);
      console.error("Database error during message storage:", dbError);

      // Check for database connection errors
      const errorMessage =
        dbError instanceof Error ? dbError.message : String(dbError);
      if (errorMessage.includes("database connection is not open")) {
        console.error(`503: Database connection error: ${errorMessage}`);

        return new NextResponse("true", {
          status: 200,
          headers: {
            "Content-Type": "text/plain",
          },
        });

        // return NextResponse.json(
        //   {
        //     error: "Database connection error",
        //     message:
        //       "The database is currently unavailable. Please try again later or contact the administrator.",
        //   },
        //   { status: 503 } // Service Unavailable
        // );
      }

      // Re-throw for the outer catch block to handle
      throw dbError;
    }
  } catch (error) {
    debugLog("POST /api/messages - error", error);
    console.error("Error processing message request:", error);

    return new NextResponse("true", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });

    // return NextResponse.json(
    //   { error: "An unexpected error occurred" },
    //   { status: 500 }
    // );
  }
}
