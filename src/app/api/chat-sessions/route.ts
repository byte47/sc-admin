import { NextResponse } from "next/server";
import { getMessagesAction } from "@/lib/actions";
import { Message } from "@/lib/data-pg";

type ChatSession = {
  participants: [string, string];
  messages: Message[];
  lastTime: string;
};

// Helper to group messages into sessions by participant
function groupMessagesBySession(messages: Message[]): ChatSession[] {
  const sessions: Record<string, ChatSession> = {};
  for (const msg of messages) {
    // Only consider chats between 'Me' and someone else
    const other = msg.from === "Me" ? msg.to : msg.from;
    if (!other || other === "Me") continue;
    const key = ["Me", other].sort().join("::");
    const msgTimeStr =
      typeof msg.created_at === "string"
        ? msg.created_at
        : msg.created_at instanceof Date
        ? msg.created_at.toISOString()
        : String(msg.created_at);
    if (!sessions[key]) {
      sessions[key] = {
        participants: ["Me", other],
        messages: [],
        lastTime: msgTimeStr,
      };
    }
    sessions[key].messages.push(msg);
    if (
      !sessions[key].lastTime ||
      new Date(msgTimeStr) > new Date(sessions[key].lastTime)
    ) {
      sessions[key].lastTime = msgTimeStr;
    }
  }
  // Convert to array and sort by last message time desc
  return Object.values(sessions).sort(
    (a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime()
  );
}

export async function GET() {
  // Get the latest 100 messages (to cover recent sessions)
  const { items } = await getMessagesAction(1, 100);
  const sessions = groupMessagesBySession(items as Message[]);
  // Return the top 3 sessions
  return NextResponse.json(sessions.slice(0, 3));
}
