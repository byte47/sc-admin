import { NextRequest, NextResponse } from "next/server";
import { extractChatData, BLACKLISTED_MESSAGE_WORDS } from "@/lib/utils";
import { addBulkMessagesAction } from "@/lib/actions";

export async function POST(request: NextRequest) {
  try {
    // Accept raw text input instead of JSON
    const screencontent = await request.text();

    if (!screencontent || typeof screencontent !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid screencontent" },
        { status: 400 }
      );
    }

    // Extract chat messages from screencontent
    const chatMessages = extractChatData(screencontent);

    // Prepare messages for DB, flag if blacklisted
    const messagesToStore = chatMessages.map((msg) => {
      const is_flagged = BLACKLISTED_MESSAGE_WORDS.some((word) =>
        msg.text.toLowerCase().includes(word.toLowerCase())
      );
      return {
        ...msg,
        is_flagged,
        time: msg.time ? new Date(msg.time) : null,
      };
    });

    // Store messages in DB (deduplication handled by DB unique constraint)
    const results = await addBulkMessagesAction(messagesToStore);

    const stored = results.filter(Boolean);
    const flagged = messagesToStore.filter((m) => m.is_flagged);

    return NextResponse.json({
      stored: stored.length,
      flagged: flagged.length,
      flaggedMessages: flagged.map((m) => m.text),
    });
  } catch (error) {
    console.error("POST /api/chat error:", error);
    return NextResponse.json(
      { error: "Failed to process chat messages", details: String(error) },
      { status: 500 }
    );
  }
}
