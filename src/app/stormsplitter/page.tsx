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
    <main className="flex flex-col items-center justify-start bg-gray-950 pt-[60px] text-white min-h-screen  space-y-10">
      {/* Hintergrundbild */}
      <div className="fixed inset-0 z-0">
        <Image
          src="https://cards.scryfall.io/large/front/5/6/56f214d3-6b93-40db-a693-55e491c8a283.jpg"
          alt="Magic Card"
          fill
          priority
          className="object-contain blur-sm opacity-20"
          style={{ objectPosition: "center center" }}
        />
      </div>

      {/* Inhalt */}
      <div className="z-10 flex flex-col items-center max-w-5xl w-full space-y-10">
        <h1 className="text-4xl font-bold tracking-tight text-center space-y-10 ">
          🎲 Stormsplitter Calculator
        </h1>
        <div className="bg-gray-900 bg-opacity-90 rounded-xl p-8 shadow-lg max-w-md w-full text-gray-100 drop-shadow-lg max-h-[80vh] space-y-10">
          {/* Anzahl Instants */}

          <div className="mb-6">
            <label className="block text-lg mb-2 select-none">
              Anzahl Instant und Sorceries:
            </label>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setInstantsValue(Math.max(0, instantsCount - 1));
                  setSteps([]);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-800 rounded-full transition text-white select-none"
                aria-label="Minus"
              >
                −
              </button>

              <input
                type="range"
                min={0}
                max={20}
                value={instantsCount}
                onChange={(e) => {
                  setInstantsValue(Number(e.target.value));
                  setSteps([]);
                }}
                className="cursor-pointer w-full accent-red-500"
                aria-valuemin={0}
                aria-valuemax={20}
                aria-valuenow={instantsCount}
              />

              <button
                onClick={() => {
                  setInstantsValue(Math.min(20, instantsCount + 1));
                  setSteps([]);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-800 rounded-full transition text-white select-none"
                aria-label="Plus"
              >
                +
              </button>
            </div>

            <p className="mt-2 text-center text-xl font-mono select-text">
              {instantsCount}
            </p>
          </div>

          {/* Power / Toughness je Instant/Sorcery */}
          <div className="mb-6 flex items-center space-x-4 justify-center">
            <label className="text-lg select-none">
              Power / Toughness je Instant/Sorcery:
            </label>
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
              className="w-16 rounded px-3 py-1 border border-gray-700 bg-gray-800 text-white text-center focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Bonus Power"
            />
            <span className="text-xl select-none font-bold">/</span>
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
              className="w-16 rounded px-3 py-1 border border-gray-700 bg-gray-800 text-white text-center focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Bonus Toughness"
            />
          </div>

          {/* Berechnen Button */}
          <button
            onClick={handleCalculate}
            className="w-full py-3 bg-red-600 hover:bg-red-800 rounded-full text-white font-semibold transition select-none"
          >
            Berechnen
          </button>

          {/* Ergebnis / Schritte */}
          {steps.length > 0 && (
            <section className="mt-8 bg-white/10 p-6 rounded-lg max-h-80 overflow-y-auto text-left text-gray-200 space-y-4 select-text">
              <h2 className="text-xl font-semibold mb-3 text-center">
                Berechnung
              </h2>

              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="border-b border-gray-500 pb-3 last:border-b-0"
                  aria-label={`Berechnung Schritt ${idx + 1}`}
                >
                  <p className="font-semibold">
                    {step.spell === "Original"
                      ? "Stormsplitter"
                      : `Spell ${step.spell}`}
                  </p>
                  <p>
                    ➤ {step.isOriginal ? "Anzahl" : "Kopien"}: {step.copies}
                  </p>
                  <p>
                    ➤ Marker pro Kopie: {step.markerPerCopy} × +{bonusStrength}/
                    +{bonusToughness} {step.isOriginal ? "" : "pro Kopie"}
                  </p>
                  <p>
                    ➤ Stärke/Widerstandskraft: {step.strength} /{" "}
                    {step.toughness}
                  </p>
                  <p>
                    ➤ Gesamtstärke:{" "}
                    <strong>{step.strength * step.copies}</strong> | Gesamt-
                    Widerstandskraft:{" "}
                    <strong>{step.toughness * step.copies}</strong>
                  </p>
                </div>
              ))}

              <div className="pt-4 border-t border-gray-500 font-semibold space-y-1">
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
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
