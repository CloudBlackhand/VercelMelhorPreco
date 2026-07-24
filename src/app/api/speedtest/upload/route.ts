import { NextResponse } from "next/server";


export async function POST(request: Request) {
  const body = await request.arrayBuffer();
  return NextResponse.json({ ok: true, received: body.byteLength });
}
