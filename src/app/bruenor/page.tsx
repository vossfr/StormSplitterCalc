"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
type Card = {
  quantity: number;
  id: number;
  card: {
    uid: number;
    oracleCard: {
      name: string;
      types: [string];
      subTypes: [string];
      power?: string;
      toughness?: string;
      text?: string;
    };
  };
};
type EquipmentBonus = {
  powerBonus: number;
  toughnessBonus: number;
  grantedAbilities: string[];
  lostAbilities: string[];
};

function parseEquipmentText(text: string): EquipmentBonus {
  const grantedAbilities: string[] = [];
  const lostAbilities: string[] = [];

  // Power/Toughness Boni finden
  const ptBonusRegex = /([+-]\d+)\/([+-]\d+)/g;
  let ptMatch;
  let totalPowerBonus = 0;
  let totalToughnessBonus = 0;
  while ((ptMatch = ptBonusRegex.exec(text)) !== null) {
    totalPowerBonus += parseInt(ptMatch[1], 10);
    totalToughnessBonus += parseInt(ptMatch[2], 10);
  }

  // Fähigkeiten, die verloren gehen (loses X)
  const losesAbilityRegex = /loses (\w+)/gi;
  let losesMatch;
  while ((losesMatch = losesAbilityRegex.exec(text)) !== null) {
    lostAbilities.push(losesMatch[1].toLowerCase());
  }

  // Fähigkeiten, die hinzukommen (and has / gains ...)
  // Beispiele:
  // "and has flying, haste and shroud"
  // "and has reach"
  // "gains first strike and vigilance"
  const grantedAbilitiesRegex = /(and has|gains) ([\w\s,]+(?: and [\w\s]+)?)/gi;
  let grantMatch;
  while ((grantMatch = grantedAbilitiesRegex.exec(text)) !== null) {
    const abilitiesStr = grantMatch[2].toLowerCase();
    // abilitiesStr könnte "flying, haste and shroud" oder "reach" sein
    // Aufsplitten nach Komma und "and"
    const parts = abilitiesStr
      .split(/,| and /)
      .map((a) => a.trim())
      .filter((a) => a.length > 0);
    grantedAbilities.push(...parts);
  }

  return {
    powerBonus: totalPowerBonus,
    toughnessBonus: totalToughnessBonus,
    grantedAbilities,
    lostAbilities,
  };
}

export default function BruenorPage() {
  const [showDetails, setShowDetails] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCreature, setSelectedCreature] = useState<Card | null>(null);
  const [selectedEquipments, setSelectedEquipments] = useState<Set<string>>(
    new Set()
  );
  const [useBruenorEffect, setUseBruenorEffect] = useState(false);

  // Fetch deck on mount via API Route
  useEffect(() => {
    async function fetchDeck() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/deck`);
        if (!res.ok) throw new Error("Fehler beim Laden des Decks");
        const data = await res.json();
        setCards(data.cards);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        setError(e?.message || "Unbekannter Fehler");
      } finally {
        setLoading(false);
      }
    }
    fetchDeck();
  }, []);

  // Filter Kreaturen und Ausrüstungen

  const creatures = cards.filter((c) =>
    c.card.oracleCard.types.includes("Creature")
  );
  const equipments = cards.filter((c) =>
    c.card.oracleCard.subTypes.includes("Equipment")
  );
  // Hilfsfunktion: Parse Power/Toughness (kann z.B. '*' enthalten)
  function parseStat(stat?: string): number {
    if (!stat) return 0;
    if (stat === "*") return 0; // Einfach 0, keine Formel-Auswertung
    const parsed = parseInt(stat, 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Berechnung Power / Toughness
  const basePower = selectedCreature
    ? parseStat(selectedCreature.card.oracleCard.power)
    : 0;
  const baseToughness = selectedCreature
    ? parseStat(selectedCreature.card.oracleCard.toughness)
    : 0;

  // Annahme: selectedEquipments ist eine Set mit Equipment-IDs oder Kartenobjekten
  // cards ist das Array aller Karten, wie aus API geladen

  let totalEquipmentPowerBonus = 0;
  let totalEquipmentToughnessBonus = 0;
  const allGrantedAbilities = new Set<string>();
  const allLostAbilities = new Set<string>();
  for (const equip of cards) {
    if (selectedEquipments.has(equip.card.oracleCard.name)) {
      const text = equip.card.oracleCard.text || "";
      const { powerBonus, toughnessBonus, grantedAbilities, lostAbilities } =
        parseEquipmentText(text);
      totalEquipmentPowerBonus += powerBonus;
      totalEquipmentToughnessBonus += toughnessBonus;
      grantedAbilities.forEach((a) => allGrantedAbilities.add(a));
      lostAbilities.forEach((a) => allLostAbilities.add(a));
    }
  }

  // Bruenor Effekt: +2 Power pro Ausrüstung, wenn aktiviert
  const bruenorBonus = useBruenorEffect ? selectedEquipments.size * 2 : 0;
  const totalPower = basePower + totalEquipmentPowerBonus + bruenorBonus;
  const totalToughness = baseToughness + totalEquipmentToughnessBonus;

  // Handler Equipment Checkbox Toggle
  function toggleEquipment(name: string) {
    setSelectedEquipments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(name)) newSet.delete(name);
      else newSet.add(name);
      return newSet;
    });
  }
  return (
    <main className="flex flex-col items-center justify-start bg-gray-950 text-white min-h-screen p-6 md:p-10 space-y-10">
      <h1 className="text-4xl font-bold tracking-tight text-center">
        ⚔️ Bruenor Equipment Calculator
      </h1>

      {loading && <p className="text-gray-300 text-lg">Lade Deck...</p>}
      {error && <p className="text-red-500 font-semibold">Fehler: {error}</p>}

      {!loading && !error && (
        <div className="w-full max-w-5xl space-y-10">
          {/* --- Kreatur auswählen --- */}
          <section className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <label
              htmlFor="creatureSelect"
              className="block mb-2 text-lg font-semibold"
            >
              🧙‍♂️ Kreatur auswählen:
            </label>
            <select
              id="creatureSelect"
              className="bg-gray-800 border border-gray-700 p-3 rounded w-full text-white"
              onChange={(e) => {
                const c = creatures.find(
                  (card) => card.card.oracleCard.name === e.target.value
                );
                setSelectedCreature(c || null);
                setSelectedEquipments(new Set());
                setUseBruenorEffect(false);
              }}
              value={selectedCreature?.card.oracleCard.name || ""}
            >
              <option value="">-- bitte wählen --</option>
              {creatures.map((card) => (
                <option
                  key={card.card.oracleCard.name}
                  value={card.card.oracleCard.name}
                >
                  {card.card.oracleCard.name} ({card.card.oracleCard.power}/
                  {card.card.oracleCard.toughness})
                </option>
              ))}
            </select>
          </section>

          {selectedCreature && (
            <>
              {/* --- Bild der Kreatur + Equipment-Auswahl --- */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col items-center justify-center">
                  <Image
                    src={`https://cards.scryfall.io/large/front/${
                      selectedCreature.card.uid.toString()[0]
                    }/${selectedCreature.card.uid.toString()[1]}/${
                      selectedCreature.card.uid
                    }.jpg`}
                    alt={selectedCreature.card.oracleCard.name}
                    width={300}
                    height={420}
                    className="rounded-lg shadow-lg"
                  />
                </div>

                <div>
                  <p className="font-semibold text-lg mb-3">
                    🛡️ Equipments auswählen:
                  </p>
                  <div className="max-h-100 overflow-y-auto bg-gray-800 p-4 rounded space-y-2 border border-gray-700">
                    {equipments.length > 0 ? (
                      equipments.map((eq) => {
                        const name = eq.card.oracleCard.name;
                        return (
                          <label
                            key={name}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedEquipments.has(name)}
                              onChange={() => toggleEquipment(name)}
                              className="form-checkbox h-5 w-5 text-blue-500"
                            />
                            <span>{name}</span>
                          </label>
                        );
                      })
                    ) : (
                      <p className="text-gray-400">
                        Keine Ausrüstungen im Deck.
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* --- Bruenor Effekt als Switch --- */}
              <section className="bg-gray-900 p-4 rounded-lg shadow-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg text-white">
                    💪 Bruenor-Effekt ( +2 Power / Ausrüstung )
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setUseBruenorEffect(!useBruenorEffect)}
                  disabled={selectedEquipments.size === 0}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500
      ${useBruenorEffect ? "bg-orange-500" : "bg-gray-600"}
      ${
        selectedEquipments.size === 0
          ? "opacity-40 cursor-not-allowed"
          : "cursor-pointer"
      }
    `}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform   ${
                      useBruenorEffect ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </section>

              {selectedEquipments.size === 0 && (
                <p className="text-gray-400 text-sm mt-2">
                  Bitte zuerst Ausrüstungen auswählen
                </p>
              )}

              {/* --- Ausgewählte Equipments mit Bildern --- */}
              {selectedEquipments.size > 0 && (
                <section className="bg-gray-900 p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl font-semibold mb-4">
                    🎒 Ausgewählte Equipments
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...selectedEquipments].map((name) => {
                      const eqCard = equipments.find(
                        (eq) => eq.card.oracleCard.name === name
                      );
                      if (!eqCard) return null;

                      const uid = eqCard.card.uid.toString();
                      const imagePath = `https://cards.scryfall.io/large/front/${uid[0]}/${uid[1]}/${uid}.jpg`;

                      return (
                        <div key={name} className="relative group">
                          <Image
                            src={imagePath}
                            alt={name}
                            width={150}
                            height={220}
                            className="rounded shadow-md transition-transform duration-300 group-hover:scale-105"
                          />
                          <p className="mt-2 text-sm text-center">{name}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* --- Gesamtergebnis --- */}
              <section className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
                <h3 className="text-2xl font-bold mb-2">📊 Ergebnis</h3>
                <p className="text-xl">
                  {selectedCreature.card.oracleCard.name}:{" "}
                  <span className="font-mono">
                    {totalPower}/{totalToughness}
                  </span>
                </p>
                {allGrantedAbilities.size > 0 && (
                  <p className="mt-2 text-green-400 text-sm">
                    + Fähigkeiten: {[...allGrantedAbilities].join(", ")}
                  </p>
                )}
                {allLostAbilities.size > 0 && (
                  <p className="mt-1 text-red-400 text-sm">
                    – Verlorene Fähigkeiten: {[...allLostAbilities].join(", ")}
                  </p>
                )}
                <button
                  className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? "Details verstecken" : "Details anzeigen"}
                </button>
                {showDetails && (
                  <div className="mt-4 text-left text-sm bg-gray-900 p-4 rounded">
                    <p>
                      <strong>Basiswerte:</strong>{" "}
                      <span className="font-mono">
                        {basePower} / {baseToughness}
                      </span>
                    </p>

                    <p>
                      <strong>Bonus durch Ausrüstungen:</strong>{" "}
                      <span className="font-mono">
                        +{totalEquipmentPowerBonus} / +
                        {totalEquipmentToughnessBonus}
                      </span>
                    </p>

                    <p>
                      <strong>Bonus durch Bruenor:</strong>{" "}
                      <span className="font-mono">+{bruenorBonus} / +0</span>
                    </p>

                    <hr className="my-3 border-gray-600" />

                    <p>
                      <strong>Gesamtergebnis:</strong>{" "}
                      <span className="font-mono">
                        {totalPower} / {totalToughness}
                      </span>
                    </p>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      )}
    </main>
  );
}
