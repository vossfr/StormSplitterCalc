// Datei: src/app/api/deck/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch("https://archidekt.com/api/decks/10221904/");
  const data = await res.json();

  return NextResponse.json(data);
}
