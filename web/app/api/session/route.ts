import { NextRequest, NextResponse } from "next/server";
// In-memory session store (use Redis in production)
let sessionConfig = {
  ws_url: "ws://localhost:8765",
};
export function GET() {
  return NextResponse.json(sessionConfig);
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.ws_url) sessionConfig.ws_url = body.ws_url;
    return NextResponse.json({ success: true, config: sessionConfig });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
