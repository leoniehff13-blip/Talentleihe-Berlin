/**
 * Berliner Berufsschulen für Handwerksberufe (Quelle: IHK Berlin)
 * Stand: 2025
 */
export interface Berufsschule {
  name: string;
  typ: "staatlich" | "privat";
}

export const BERUFSSCHULEN: Berufsschule[] = [
  // ── staatlich ───────────────────────────────────────────────────────────────
  { name: "Annedore-Leber-Oberschule", typ: "staatlich" },
  { name: "OSZ Banken, Immobilien und Versicherungen", typ: "staatlich" },
  { name: "Louise-Schroeder-Schule (OSZ Bürowirtschaft und Verwaltung)", typ: "staatlich" },
  { name: "OSZ Bürowirtschaft I", typ: "staatlich" },
  { name: "OSZ Bürowirtschaft I – Abteilung 1", typ: "staatlich" },
  { name: "Friedrich-List-Schule (OSZ Büromanagement und Wirtschaftssprachen)", typ: "staatlich" },
  { name: "Elinor-Ostrom-Schule", typ: "staatlich" },
  { name: "Hermann-Scheer-Schule (OSZ Wirtschaft und Sozialversicherung)", typ: "staatlich" },
  { name: "OSZ Handel I", typ: "staatlich" },
  { name: "Staatliche Berufs- und Berufsfachschule für Instrumentenbau Mittenwald", typ: "staatlich" },
  { name: "Oskar-Tietz-Schule (OSZ Handel II)", typ: "staatlich" },
  { name: "OSZ Logistik, Touristik, Steuern (OSZ Lotis)", typ: "staatlich" },
  { name: "Leopold-Ullstein-Schule (OSZ Wirtschaft)", typ: "staatlich" },
  { name: "Peter-Lenné-Schule (OSZ Natur und Umwelt)", typ: "staatlich" },
  { name: "Lise-Meitner-Schule (OSZ Chemie, Physik und Biologie)", typ: "staatlich" },
  { name: "OSZ Eduard-Maurer", typ: "staatlich" },
  { name: "Ernst-Litfaß-Schule (OSZ Druck- und Medientechnik)", typ: "staatlich" },
  { name: "OSZ TIEM (Technische Informatik, Industrieelektronik, Energiemanagement)", typ: "staatlich" },
  { name: "Hein-Möller-Schule (OSZ Energietechnik II)", typ: "staatlich" },
  { name: "OSZ Kommunikations-, Informations- und Medientechnik (OSZ KIM)", typ: "staatlich" },
  { name: "Emil-Fischer-Schule (OSZ Ernährung und Lebensmitteltechnik)", typ: "staatlich" },
  { name: "OSZ Informations- und Medizintechnik (OSZ IMT)", typ: "staatlich" },
  { name: "Max-Taut-Schule (OSZ Versorgungstechnik)", typ: "staatlich" },
  { name: "Georg-Schlesinger-Schule (OSZ Maschinen-, Fertigungstechnik)", typ: "staatlich" },
  { name: "OSZ Bekleidung und Mode (Modeschule Berlin)", typ: "staatlich" },
  { name: "Hans-Böckler-Schule (OSZ Konstruktionsbautechnik)", typ: "staatlich" },
  { name: "Wilhelm-Ostwald-Schule (OSZ für Gestaltung)", typ: "staatlich" },
  { name: "Knobelsdorff-Schule (OSZ Bautechnik I)", typ: "staatlich" },
  { name: "Max-Bill-Schule (OSZ Planen Bauen Gestalten)", typ: "staatlich" },
  { name: "OSZ Kraftfahrzeugtechnik", typ: "staatlich" },
  { name: "Brillat-Savarin-Schule (OSZ Gastgewerbe)", typ: "staatlich" },
  { name: "August-Sander-Schule", typ: "staatlich" },
  { name: "Konrad-Zuse-Schule", typ: "staatlich" },
  { name: "OSZ Gesundheit I", typ: "staatlich" },
  { name: "Hans-Litten-Schule (ehem. OSZ Recht)", typ: "staatlich" },
  { name: "OSZ Körperpflege", typ: "staatlich" },
  { name: "Berufsbildende Schulen des Landkreises Schönebeck", typ: "staatlich" },
  { name: "Papiermacherschule Gernsbach", typ: "staatlich" },
  { name: "Staatliche Gewerbeschule Werft und Hafen (G7)", typ: "staatlich" },
  { name: "OSZ Technik 1 Potsdam – Abteilung III", typ: "staatlich" },
  // ── privat ──────────────────────────────────────────────────────────────────
  { name: "AFBB – Akademie für berufliche Bildung gGmbH", typ: "privat" },
  { name: "BBA – Akademie der Immobilienwirtschaft e.V., Berlin", typ: "privat" },
  { name: "Private Berufsschule für Medientechnik (b-trend.academy gGmbH)", typ: "privat" },
  { name: "mediencollege Berlin gGmbH", typ: "privat" },
  { name: "Private Berufsschule der bbw Akademie", typ: "privat" },
  { name: "SFT Schule für Tourismus Berlin GmbH", typ: "privat" },
];

/**
 * Empfohlene Berufsschulen je Gewerk (Werte aus GEWERKE-Liste).
 * Gewerke ohne klaren Treffer in der IHK-Liste sind nicht aufgeführt
 * → der Nutzer sieht dann die Gesamtliste.
 */
export const BERUFSSCHULEN_NACH_GEWERK: Record<string, string[]> = {
  "Änderungsschneider/-in": [
    "Annedore-Leber-Oberschule",
    "OSZ Bekleidung und Mode (Modeschule Berlin)",
  ],
  "Anlagenmechaniker/-in für Sanitär-, Heizungs- und Klimatechnik": [
    "Max-Taut-Schule (OSZ Versorgungstechnik)",
  ],
  "Bäcker/-in": [
    "Emil-Fischer-Schule (OSZ Ernährung und Lebensmitteltechnik)",
  ],
  "Bodenleger/-in": [
    "Max-Bill-Schule (OSZ Planen Bauen Gestalten)",
  ],
  "Elektroniker/-in": [
    "OSZ TIEM (Technische Informatik, Industrieelektronik, Energiemanagement)",
    "Annedore-Leber-Oberschule",
    "Hein-Möller-Schule (OSZ Energietechnik II)",
    "OSZ Informations- und Medizintechnik (OSZ IMT)",
  ],
  "Elektroniker/-in für Gebäudesystemintegration": [
    "OSZ TIEM (Technische Informatik, Industrieelektronik, Energiemanagement)",
  ],
  "Fachkraft für Metalltechnik": [
    "Hans-Böckler-Schule (OSZ Konstruktionsbautechnik)",
  ],
  "Fahrzeuglackierer/-in": [
    "OSZ Kraftfahrzeugtechnik",
  ],
  "Fleischer/-in": [
    "Emil-Fischer-Schule (OSZ Ernährung und Lebensmitteltechnik)",
  ],
  "Fliesen-, Platten- und Mosaikleger/-in": [
    "Knobelsdorff-Schule (OSZ Bautechnik I)",
  ],
  "Fotograf/-in": [
    "OSZ Technik 1 Potsdam – Abteilung III",
  ],
  "Gerüstbauer/-in": [
    "Max-Bill-Schule (OSZ Planen Bauen Gestalten)",
  ],
  "Glaser/-in": [
    "Max-Bill-Schule (OSZ Planen Bauen Gestalten)",
  ],
  "Karosserie- und Fahrzeugbaumechaniker/-in": [
    "OSZ Kraftfahrzeugtechnik",
  ],
  "Keramiker/-in": [
    "Knobelsdorff-Schule (OSZ Bautechnik I)",
  ],
  "Konstruktionsmechaniker/-in": [
    "Hans-Böckler-Schule (OSZ Konstruktionsbautechnik)",
  ],
  "Kosmetiker/-in": [
    "OSZ Körperpflege",
  ],
  "Kraftfahrzeugmechatroniker/-in": [
    "OSZ Kraftfahrzeugtechnik",
  ],
  "Maler/-in und Lackierer/-in": [
    "Annedore-Leber-Oberschule",
  ],
  "Maskenbildner/-in": [
    "OSZ Körperpflege",
  ],
  "Maurer/-in": [
    "Max-Bill-Schule (OSZ Planen Bauen Gestalten)",
  ],
  "Maßschneider/-in": [
    "OSZ Bekleidung und Mode (Modeschule Berlin)",
    "mediencollege Berlin gGmbH",
  ],
  "Mechatroniker/-in": [
    "OSZ TIEM (Technische Informatik, Industrieelektronik, Energiemanagement)",
  ],
  "Mediengestalter/-in Digital und Print": [
    "Ernst-Litfaß-Schule (OSZ Druck- und Medientechnik)",
    "OSZ Informations- und Medizintechnik (OSZ IMT)",
  ],
  "Straßenbauer/-in": [
    "Knobelsdorff-Schule (OSZ Bautechnik I)",
  ],
  "Stuckateur/-in": [
    "Knobelsdorff-Schule (OSZ Bautechnik I)",
  ],
  "Tischler/-in": [
    "Max-Bill-Schule (OSZ Planen Bauen Gestalten)",
    "Annedore-Leber-Oberschule",
  ],
  "Wärme-, Kälte- und Schallschutzisolierer/-in": [
    "Knobelsdorff-Schule (OSZ Bautechnik I)",
  ],
  "Zimmerer/Zimmerin": [
    "Max-Bill-Schule (OSZ Planen Bauen Gestalten)",
  ],
  "Zweiradmechatroniker/-in": [
    "OSZ Kraftfahrzeugtechnik",
  ],
};
