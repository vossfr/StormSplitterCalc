"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  type StepData = {
    spell: number | "Original";
    copies: number;
    markerPerCopy: number;
    isOriginal?: boolean;
  };

  const [instantsCount, setInstantsValue] = useState(0); // Anzahl Kreaturen
  const [hasProwess, setHasProwess] = useState(false);
  const [prowessCount, setProwessCount] = useState(0);
  const [steps, setSteps] = useState<StepData[]>([]);

  const handleCalculate = () => {
    if (instantsCount < 0) {
      setSteps([]);
      return;
    }
    const newSteps: StepData[] = [];

    // Originalkreatur
    const originalMarkers = instantsCount * prowessCount;
    newSteps.push({
      spell: "Original",
      copies: 1,
      markerPerCopy: originalMarkers,
      isOriginal: true,
    });

    // Für jeden Spell
    for (let i = 1; i <= instantsCount; i++) {
      const copies = Math.pow(2, i - 1);
      const baseMarker = instantsCount - i;
      const markerPerCopy = baseMarker * prowessCount;

      newSteps.push({
        spell: i,
        copies,
        markerPerCopy,
      });
    }

    setSteps(newSteps);
  };

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden">
      {/* Hintergrundbild Container */}
      <div className="fixed inset-0 z-10">
        <div className="relative w-full h-full">
          <Image
            src="https://cards.scryfall.io/large/front/5/6/56f214d3-6b93-40db-a693-55e491c8a283.jpg"
            alt="Magic Card"
            fill
            priority
            className="object-contain blur-xs"
            style={{ objectPosition: "center center" }}
          />
        </div>
      </div>

      {/* Inhalt */}
      <div className="relative z-10 flex flex-col items-center justify-center h-screen px-4">
        <div
          className="rounded-xl p-6 shadow-lg max-w-md w-full text-center flex flex-col max-h-[80vh] overflow-y-auto text-gray-100 drop-shadow-[0_0_2px_black]
"
        >
          <h1 className="text-2xl font-bold mb-6">Stormspliter-Rechner</h1>

          <div className="text-left mb-4 flex items-center space-x-4">
            <div className="flex-1">
              <p className="text-lg">
                Anzahl Instant und Sorceries: <strong>{instantsCount}</strong>
              </p>
              <input
                type="range"
                min="0"
                max="20"
                value={instantsCount}
                onChange={(e) => setInstantsValue(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <label className="inline-flex items-center space-x-2 cursor-pointer mb-4">
            <p className="text-lg">Prowess </p>
            <input
              type="checkbox"
              checked={hasProwess}
              onChange={(e) => {
                const checked = e.target.checked;
                setHasProwess(checked);
                if (!checked) {
                  setProwessCount(0);
                } else {
                  setProwessCount(1);
                }
              }}
              className="w-5 h-5"
            />
          </label>

          {hasProwess && (
            <>
              <div className="text-left mb-2">
                <p className="text-lg">
                  Prowess Instanzen: <strong>{prowessCount}</strong>
                </p>
              </div>
              <div className="text-left mb-4">
                <input
                  id="instantsRange"
                  type="range"
                  min="1"
                  max="5"
                  value={prowessCount}
                  onChange={(e) => setProwessCount(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          )}
          <button
            onClick={handleCalculate}
            className="relative group mt-auto px-6 py-2 bg-red-400 hover:bg-red-800 rounded-full transition text-white overflow-hidden"
          >
            Berechnen
          </button>

          {steps.length > 0 && (
            <div className="mt-6 text-left text-sm space-y-3 bg-white/20 p-4 rounded-md max-h-60 overflow-y-auto">
              <h2 className="text-lg font-semibold mb-2">Berechnung:</h2>
              {steps.map((step, idx) => (
                <div key={idx} className="border-b border-white/20 pb-2">
                  <p>
                    <strong>
                      {step.spell === "Original"
                        ? "Stormsplitter"
                        : `Spell ${step.spell}`}
                    </strong>
                  </p>
                  <p>
                    ➤ {step.isOriginal ? "Anzahl" : "Kopien"}: {step.copies}
                  </p>
                  <p>
                    ➤ Marker pro {step.isOriginal ? "Kreatur" : "Kopie"}:{" "}
                    {step.markerPerCopy}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
