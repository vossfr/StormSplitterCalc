"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">🧙‍♂️ Magic Rechner</h1>

      <div className="space-y-4 w-full max-w-md">
        <Link href="/stormsplitter">
          <div className="bg-red-600 hover:bg-red-800 transition rounded-lg p-4 cursor-pointer shadow-lg">
            <h2 className="text-xl font-semibold">Stormsplitter-Rechner</h2>
            <p className="text-sm text-white/80">Berechne Kopien & Marker</p>
          </div>
        </Link>

        <Link href="/bruenor">
          <div className="bg-blue-600 hover:bg-blue-800 transition rounded-lg p-4 cursor-pointer shadow-lg">
            <h2 className="text-xl font-semibold">Bruenor-Rechner</h2>
            <p className="text-sm text-white/80">
              Berechne Power/Toughness und Fähigkeiten von ausgerüsteter
              Kreatur.
            </p>
          </div>
        </Link>
      </div>
    </main>
  );
}
