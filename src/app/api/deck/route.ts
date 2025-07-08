// Datei: src/app/api/deck/route.ts

import { NextResponse } from "next/server";

// Stelle sicher, dass du die Umgebungsvariable liest
const DECK_ID = process.env.DECK_ID;
console.log(DECK_ID);
export async function GET() {
  if (!DECK_ID) {
    return NextResponse.json(
      { error: "DECK_ID ist nicht gesetzt" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(`https://archidekt.com/api/decks/${DECK_ID}/`);
    if (!res.ok) {
      return NextResponse.json(
        { error: "Fehler beim Abrufen des Decks" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: "Unbekannter Fehler beim Abruf" },
      { status: 500 }
    );
  }
}
