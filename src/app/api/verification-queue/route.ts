import { NextResponse } from "next/server";
import { getVerificationQueueAction } from "@/lib/actions";

export async function GET() {
  const items = await getVerificationQueueAction("pending");
  return NextResponse.json(items);
}
