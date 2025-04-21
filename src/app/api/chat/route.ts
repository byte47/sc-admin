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

    // Ignore if all messages are from 'Me'
    if (
      chatMessages.length > 0 &&
      chatMessages.every((msg) => msg.from === "Me")
    ) {
      return NextResponse.json(true);
    }

    // Prepare messages for DB, flag if blacklisted
    const messagesToStore = chatMessages.map((msg) => {
      const is_blacklisted = BLACKLISTED_MESSAGE_WORDS.some((word) =>
        msg.text.toLowerCase().includes(word.toLowerCase())
      );
      // Flag if message is to 'Me' and text is 'b', 'boy', or 'man' (case-insensitive)
      const is_special_flag =
        msg.to === "Me" &&
        ["b", "boy", "man"].includes(msg.text.trim().toLowerCase());
      const is_flagged = is_blacklisted || is_special_flag;
      return {
        ...msg,
        is_flagged,
        time: msg.time ? new Date(msg.time) : null,
      };
    });

    await addBulkMessagesAction(messagesToStore);

    // If any message is flagged, return false
    if (messagesToStore.some((m) => m.is_flagged)) {
      return NextResponse.json(false);
    }

    // Store messages in DB (deduplication handled by DB unique constraint)

    return NextResponse.json(true);
  } catch (error) {
    console.error("POST /api/chat Failed to process chat messages:", error);
    return NextResponse.json(true);
  }
}
