import { dwFetch } from "@/lib/apiClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const res = await dwFetch(`/cards/${params.id}/add-visit`, {
      method: "POST",
      body: JSON.stringify({ visits: body.visits ?? body.stamps ?? 1, comment: body.comment, purchaseSum: body.purchaseSum }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
