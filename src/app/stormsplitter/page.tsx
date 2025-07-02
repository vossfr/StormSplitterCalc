"use client";

import { useState } from "react";
import Image from "next/image";

export default function Stormsplitter() {
  type StepData = {
    spell: number | "Original";
    copies: number;
    markerPerCopy: number;
    strength: number;
    toughness: number;
    isOriginal?: boolean;
  };
  const [instantsCount, setInstantsValue] = useState(0); // Anzahl Spells
  const [bonusStrength, setBonusStrength] = useState(0); // Stärke pro Marker
  const [bonusToughness, setBonusToughness] = useState(0); // Widerstandskraft pro Marker
  const [steps, setSteps] = useState<StepData[]>([]);
  const [totalCreatures, setTotalCreatures] = useState(0);

  const handleCalculate = () => {
    if (instantsCount < 0) {
      setSteps([]);
      return;
    }

    const newSteps: StepData[] = [];

    // Original
    const originalMarkers = instantsCount;
    newSteps.push({
      spell: "Original",
      copies: 1,
      markerPerCopy: originalMarkers,
      strength: 1 + originalMarkers * bonusStrength,
      toughness: 4 + originalMarkers * bonusToughness,
      isOriginal: true,
    });
    // Kopien durch Spells
    for (let i = 1; i <= instantsCount; i++) {
      const copies = Math.pow(2, i - 1);
      const baseMarker = instantsCount - i;
      const markerPerCopy = baseMarker;
      newSteps.push({
        spell: i,
        copies,
        markerPerCopy,
        strength: 1 + markerPerCopy * bonusStrength,
        toughness: 4 + markerPerCopy * bonusToughness,
      });
    }
    setSteps(newSteps);

    // Gesamtanzahl aller Kreaturen berechnen
    const total = newSteps.reduce((sum, step) => sum + step.copies, 0);
    setTotalCreatures(total);
  };

  return (
    <main className="relative w-screen bg-black overflow-hidden min-h-screen">
      {/* Hintergrundbild Container */}

      <div className="fixed inset-0 z-0">
        <Image
          src="https://cards.scryfall.io/large/front/5/6/56f214d3-6b93-40db-a693-55e491c8a283.jpg"
          alt="Magic Card"
          fill
          priority
          className="object-contain blur-xs"
          style={{ objectPosition: "center center" }}
        />
      </div>

      {/* Inhalt */}
      <div className="relative z-10 mt-10 flex flex-col items-center h-screen px-4">
        <div
          className="rounded-xl p-6 shadow-lg max-w-md w-full text-center flex flex-col max-h-[80vh] overflow-y-auto  text-gray-100 drop-shadow-[0_0_2px_black]
"
        >
          <h1 className="text-2xl font-bold mb-6">Stormsplitter-Rechner</h1>

          <div className="text-left mb-4 flex items-center space-x-4">
            <div className="flex-1">
              <p className="text-lg">
                Anzahl Instant und Sorceries: <strong>{instantsCount}</strong>
              </p>
              <div className="flex items-center justify-center space-x-4 mt-4">
                <button
                  onClick={() => {
                    setInstantsValue(Math.max(0, instantsCount - 1));
                    setSteps([]);
                  }}
                  className="px-3 py-1.5 bg-red-400 hover:bg-red-800 text-white rounded-full transition"
                >
                  −
                </button>

                <div className="flex flex-col items-center space-y-1">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={instantsCount}
                    onChange={(e) => {
                      setInstantsValue(Number(e.target.value));
                      setSteps([]);
                    }}
                    className="cursor-pointer w-48 h-2 accent-red-500"
                  />
                </div>

                <button
                  onClick={() => {
                    setInstantsValue(Math.min(20, instantsCount + 1));
                    setSteps([]);
                  }}
                  className="px-3 py-1.5 bg-red-400 hover:bg-red-800 text-white rounded-full transition"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="text-left mb-4 flex items-center space-x-4">
            <p className="text-lg">Power / Toughness je Instant/Sorcery:</p>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={10}
              value={bonusStrength}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                setBonusStrength(Number(e.target.value));
                setSteps([]);
              }}
              className="w-1/8 rounded px-2 py-1 border"
            />
            <p className="text-lg p-2">
              <strong>{" / "}</strong>
            </p>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={10}
              value={bonusToughness}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                setBonusToughness(Number(e.target.value));
                setSteps([]);
              }}
              className="w-1/8 rounded px-2 py-1 border"
            />
          </div>
          <button
            onClick={handleCalculate}
            className="relative group mt-auto px-6 py-2 bg-red-400 hover:bg-red-800 rounded-full transition text-white overflow-hidden"
          >
            Berechnen
          </button>

          {steps.length > 0 && (
            <div className="mt-6 text-left text-sm space-y-3 bg-white/20 p-4 rounded-md max-h-80 overflow-y-auto">
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
                    ➤ {step.markerPerCopy}
                    {"x: "} +{bonusStrength} /+{bonusToughness}{" "}
                    {step.isOriginal ? "" : "pro "}
                    {step.isOriginal ? "" : "Kopie"}
                  </p>
                  <p>
                    ➤ Stärke/Widerstandskraft: {step.strength}/{step.toughness}
                  </p>
                  <p>
                    ➤ Stärke: <strong>{step.strength * step.copies}</strong> |
                    Widerstandskraft:{" "}
                    <strong>{step.toughness * step.copies}</strong>
                  </p>
                </div>
              ))}

              {/* Summenanzeige */}
              <div className="pt-3 mt-3 border-t border-white/30 font-semibold">
                <p>🦦 Gesamtanzahl: {totalCreatures}</p>
                <p>
                  💪🏻 Gesamtkraft:{" "}
                  {steps.reduce(
                    (sum, step) => sum + step.strength * step.copies,
                    0
                  )}
                </p>
                <p>
                  🛡️ Gesamtwiderstandskraft:{" "}
                  {steps.reduce(
                    (sum, step) => sum + step.toughness * step.copies,
                    0
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
