import { NextRequest, NextResponse } from "next/server";
import {
  extractChatData,
  BLACKLISTED_MESSAGE_WORDS,
  sendTelegramAlert,
} from "@/lib/utils";
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

    // Log each chat message
    chatMessages.forEach((msg, idx) => {
      console.log(`Chat Message [${idx}]:`, msg);
    });

    // Ignore if all messages are from 'Me'
    if (
      chatMessages.length > 0 &&
      chatMessages.every((msg) => msg.from === "Me")
    ) {
      return NextResponse.json(true);
    }

    // Prepare messages for DB, flag if blacklisted
    let shouldSendTelegramAlert = false;
    let alertMessage = "";
    let is_flagged = false;
    let anyFlagged = false; // Track if any message is flagged
    const messagesToMe = chatMessages.filter((msg) => msg.to === "Me");
    if (messagesToMe.length > 2) {
      shouldSendTelegramAlert = true;
      alertMessage = `(${messagesToMe.length}). '${
        messagesToMe[0].from
      }' : ${messagesToMe.map((m) => `'${m.text}'`).join("; ")}`;
    }
    const messagesToStore = chatMessages.map((msg) => {
      const is_blacklisted = BLACKLISTED_MESSAGE_WORDS.some((word) =>
        msg.text.toLowerCase().includes(word.toLowerCase())
      );
      // Flag if message is to 'Me' and text is 'b', 'boy', or 'man' (case-insensitive)
      const is_boy_flag =
        msg.to === "Me" &&
        ["b", "boy", "man", "gay", "lesbian"].includes(
          msg.text.trim().toLowerCase()
        );
      // Telegram alert if message is to 'Me' and text is 'g' or 'girl' (case-insensitive)
      const is_girl_alert =
        msg.to === "Me" &&
        ["g", "girl"].includes(msg.text.trim().toLowerCase());

      if (is_girl_alert && shouldSendTelegramAlert === false) {
        shouldSendTelegramAlert = true;
        alertMessage = `ALERT: '${msg.text}' - '${msg.from}'`;
      }
      is_flagged = is_blacklisted || is_boy_flag;
      if (is_flagged) anyFlagged = true; // Set if any message is flagged
      return {
        ...msg,
        is_flagged,
        time: msg.time ? new Date(msg.time) : null,
      };
    });

    if (shouldSendTelegramAlert && alertMessage && !anyFlagged) {
      await sendTelegramAlert(alertMessage);
    }

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
