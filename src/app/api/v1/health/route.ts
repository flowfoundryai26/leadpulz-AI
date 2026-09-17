import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ status: "ok", service: "leadpulz-api", version: "1.0.0", time: new Date().toISOString() });
}
