import { NextRequest, NextResponse } from "next/server";
import { getAccessHistoryAction } from "@/lib/actions";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "30", 10);
  const { items, total } = await getAccessHistoryAction(1, limit);
  return NextResponse.json({ items, total });
}
