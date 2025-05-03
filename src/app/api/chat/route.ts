import { NextRequest, NextResponse } from "next/server";
import {
  extractChatData,
  BLACKLISTED_MESSAGE_WORDS,
  sendTelegramAlert,
} from "@/lib/utils";
import { addBulkMessagesAction } from "@/lib/actions";

export async function POST(request: NextRequest) {
  try {
    const screencontent = await request.text();
    if (!screencontent || typeof screencontent !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid screencontent" },
        { status: 400 }
      );
    }
    const chatMessages = extractChatData(screencontent);
    if (
      chatMessages.length > 0 &&
      chatMessages.every((msg) => msg.from === "Me")
    ) {
      return NextResponse.json(true);
    }
    let shouldAlert = false;
    let alertMsg = "";
    let hasFlagged = false;
    const dbMessages = [];
    let toMeCount = 0;
    let toMeFrom = "";
    const toMeTexts = [];
    for (const msg of chatMessages) {
      if (msg.from === "Me") {
        dbMessages.push({
          ...msg,
          is_flagged: false,
          time: msg.time ? new Date(msg.time) : null,
        });
        continue;
      }
      const textLowered = msg.text.trim().toLowerCase();
      const isBlacklisted = BLACKLISTED_MESSAGE_WORDS.some((word) =>
        textLowered.includes(word.toLowerCase())
      );
      const isBoyFlag = ["b", "boy", "man", "gay", "lesbian"].includes(
        textLowered
      );
      const isGirlFlag = ["g", "girl"].includes(textLowered);
      if (isGirlFlag && !shouldAlert) {
        shouldAlert = true;
        alertMsg = `ALERT: '${msg.text}' - '${msg.from}'`;
      }
      const isFlagged = isBlacklisted || isBoyFlag;
      if (isFlagged) hasFlagged = true;
      toMeCount++;
      if (!toMeFrom) toMeFrom = msg.from;
      toMeTexts.push(`'${msg.text}'`);
      dbMessages.push({
        ...msg,
        is_flagged: isFlagged,
        time: msg.time ? new Date(msg.time) : null,
      });
    }
    if (toMeCount > 2) {
      shouldAlert = true;
      alertMsg = `(${toMeCount}). '${toMeFrom}' : ${toMeTexts.join("; ")}`;
    }
    if (shouldAlert && alertMsg && !hasFlagged) {
      await sendTelegramAlert(alertMsg);
    }
    if (dbMessages.length > 0) {
      await addBulkMessagesAction(dbMessages);
    }
    if (hasFlagged) {
      return NextResponse.json(false);
    }
    return NextResponse.json(true);
  } catch (error) {
    console.error("POST /api/chat Failed to process chat messages:", error);
    return NextResponse.json(true);
  }
}
