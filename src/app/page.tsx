"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <h1 className="text-4xl font-extrabold mb-12 tracking-wide select-none">
        🧙‍♂️ Magic Rechner
      </h1>

      <div className="space-y-6 w-full max-w-md">
        <Link
          href="/stormsplitter"
          passHref
          className="group block bg-red-700 rounded-xl p-6 shadow-xl border-2 border-red-600 hover:border-red-400 hover:bg-red-800 transition 
            cursor-pointer select-none"
          aria-label="Stormsplitter-Rechner"
        >
          <h2 className="text-2xl font-semibold mb-1 group-hover:text-red-300 transition">
            Stormsplitter-Rechner
          </h2>
          <p className="text-sm text-red-200/80 group-hover:text-red-100 transition">
            Berechne Kopien & Marker
          </p>
        </Link>

        <Link
          href="/bruenor"
          passHref
          className="group block bg-blue-700 rounded-xl p-6 shadow-xl border-2 border-blue-600 hover:border-blue-400 hover:bg-blue-800 transition 
            cursor-pointer select-none"
          aria-label="Bruenor-Rechner"
        >
          <h2 className="text-2xl font-semibold mb-1 group-hover:text-blue-300 transition">
            Bruenor-Rechner
          </h2>
          <p className="text-sm text-blue-200/80 group-hover:text-blue-100 transition">
            Berechne Power/Toughness und Fähigkeiten von ausgerüsteter Kreatur.
          </p>
        </Link>
      </div>
    </main>
  );
}
