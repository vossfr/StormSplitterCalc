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
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCreature, setSelectedCreature] = useState<Card | null>(null);
  const [selectedEquipments, setSelectedEquipments] = useState<Set<string>>(
    new Set()
  );
  const [useBruenorEffect, setUseBruenorEffect] = useState(false);

  // ✅ Fetch deck on mount via API Route
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
  console.log(selectedCreature);
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
    <main className=" bg-gray-900 text-white p-6  relative w-full min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Bruenor Equipment Calculator</h1>

      {loading && <p>Lade Deck...</p>}
      {error && <p className="text-red-500">Fehler: {error}</p>}

      {!loading && !error && (
        <>
          <section className="mb-6">
            <label
              htmlFor="creatureSelect"
              className="block mb-2 font-semibold"
            >
              Kreatur auswählen:
            </label>
            <select
              id="creatureSelect"
              className="bg-gray-800 p-2 rounded w-full max-w-sm"
              onChange={(e) => {
                const c = creatures.find(
                  (card) => card.card.oracleCard.name === e.target.value
                );
                setSelectedCreature(c || null);
                setSelectedEquipments(new Set()); // Reset Equipment bei Kreaturwechsel
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
              <section className="mb-6">
                <Image
                  src={`https://cards.scryfall.io/large/front/${
                    selectedCreature.card.uid.toString()[0]
                  }/${selectedCreature.card.uid.toString()[1]}/${
                    selectedCreature.card.uid
                  }.jpg`}
                  alt={selectedCreature.card.oracleCard.name}
                  width={300}
                  height={400}
                  style={{
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                />
                <p className="font-semibold mb-2">Equipments auswählen:</p>
                <div className="max-h-48 overflow-y-auto bg-gray-800 p-3 rounded space-y-2 max-w-sm">
                  {equipments.map((eq) => {
                    const name = eq.card.oracleCard.name;
                    return (
                      <label key={name} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedEquipments.has(name)}
                          onChange={() => toggleEquipment(name)}
                          className="cursor-pointer"
                        />
                        <span>{name}</span>
                      </label>
                    );
                  })}
                  {equipments.length === 0 && (
                    <p className="text-gray-400">Keine Ausrüstungen im Deck.</p>
                  )}
                </div>
              </section>

              <section className="mb-6">
                <label className="inline-flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={useBruenorEffect}
                    onChange={() => setUseBruenorEffect((v) => !v)}
                    disabled={selectedEquipments.size === 0}
                    className="cursor-pointer"
                  />
                  <span>
                    Bruenor-Effekt aktivieren (+2 Power pro Ausrüstung)
                  </span>
                </label>
                {selectedEquipments.size === 0 && (
                  <p className="text-gray-400 text-sm mt-1">
                    Aktiviere zuerst Ausrüstungen.
                  </p>
                )}
              </section>

              <section className="bg-gray-800 p-4 rounded max-w-sm">
                <h2 className="text-xl font-semibold mb-2">Berechnung:</h2>
                <p>
                  Basis Power/Toughness: {basePower} / {baseToughness}
                </p>
                <p>+ Equipment Power Bonus: {totalEquipmentPowerBonus}</p>
                <p>
                  + Equipment Toughness Bonus: {totalEquipmentToughnessBonus}
                </p>
                {useBruenorEffect && (
                  <p>
                    + Bruenor Bonus: {bruenorBonus} (2 Power pro Ausrüstung)
                  </p>
                )}
                <hr className="my-2 border-gray-600" />
                <p className="font-bold text-lg">
                  Gesamt Power / Toughness: {totalPower} / {totalToughness}
                </p>
                <p>
                  <strong>Granted Abilities:</strong>{" "}
                  {allGrantedAbilities.size > 0
                    ? Array.from(allGrantedAbilities).join(", ")
                    : "Keine"}
                </p>
                <p>
                  <strong>Lost Abilities:</strong>{" "}
                  {allLostAbilities.size > 0
                    ? Array.from(allLostAbilities).join(", ")
                    : "Keine"}
                </p>
              </section>
            </>
          )}
        </>
      )}
    </main>
  );
}
