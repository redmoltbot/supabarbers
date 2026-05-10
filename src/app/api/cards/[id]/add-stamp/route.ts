import { dwFetch } from "@/lib/apiClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const res = await dwFetch(`/cards/${params.id}/add-stamp`, {
      method: "POST",
      body: JSON.stringify({ ...body, templateId: 1094518 }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
