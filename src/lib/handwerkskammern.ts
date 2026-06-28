/**
 * Liste aller deutschen Handwerkskammern (HWK).
 * Stand: aus öffentlichen Quellen zusammengetragen, bitte bei Bedarf
 * mit dem Zentralverband des Deutschen Handwerks (ZDH) abgleichen.
 *
 * Reihenfolge: alphabetisch.
 */
export const HANDWERKSKAMMERN: string[] = [
  "Handwerkskammer Aachen",
  "Handwerkskammer Arnsberg",
  "Handwerkskammer Berlin",
  "Handwerkskammer Braunschweig-Lüneburg-Stade",
  "Handwerkskammer Bremen",
  "Handwerkskammer Chemnitz",
  "Handwerkskammer Cottbus",
  "Handwerkskammer der Pfalz",
  "Handwerkskammer des Saarlandes",
  "Handwerkskammer Dortmund",
  "Handwerkskammer Dresden",
  "Handwerkskammer Düsseldorf",
  "Handwerkskammer Erfurt",
  "Handwerkskammer Flensburg",
  "Handwerkskammer Freiburg",
  "Handwerkskammer für Mittelfranken",
  "Handwerkskammer für München und Oberbayern",
  "Handwerkskammer für Oberfranken",
  "Handwerkskammer für Schwaben",
  "Handwerkskammer für Unterfranken",
  "Handwerkskammer Halle (Saale)",
  "Handwerkskammer Hamburg",
  "Handwerkskammer Hannover",
  "Handwerkskammer Heilbronn-Franken",
  "Handwerkskammer Karlsruhe",
  "Handwerkskammer Kassel",
  "Handwerkskammer Koblenz",
  "Handwerkskammer Konstanz",
  "Handwerkskammer Lübeck",
  "Handwerkskammer Magdeburg",
  "Handwerkskammer Mannheim Rhein-Neckar-Odenwald",
  "Handwerkskammer Münster",
  "Handwerkskammer Niederbayern-Oberpfalz",
  "Handwerkskammer Oldenburg",
  "Handwerkskammer Osnabrück-Emsland-Grafschaft Bentheim",
  "Handwerkskammer Ostfriesland",
  "Handwerkskammer Ostmecklenburg-Vorpommern",
  "Handwerkskammer Ostthüringen",
  "Handwerkskammer Ostwestfalen-Lippe zu Bielefeld",
  "Handwerkskammer Potsdam",
  "Handwerkskammer Region Stuttgart",
  "Handwerkskammer Reutlingen",
  "Handwerkskammer Rheinhessen",
  "Handwerkskammer Schwerin",
  "Handwerkskammer Südthüringen",
  "Handwerkskammer Südwestfalen",
  "Handwerkskammer Trier",
  "Handwerkskammer Ulm",
  "Handwerkskammer Wiesbaden",
  "Handwerkskammer zu Köln",
  "Handwerkskammer zu Leipzig",
];

/**
 * Die zwei für VerbundPraxis Berlin relevanten Handwerkskammern.
 * HWK Berlin:           zuständig für das Stadtgebiet Berlin
 */
export const BERLIN_REGION_KAMMERN = [
  "Handwerkskammer Berlin"
] as const;

export type BerlinRegionKammer = (typeof BERLIN_REGION_KAMMERN)[number];

/**
 * Alle Träger der Verbundberatung Berlin (Mitglieder des vfbb).
 * Stand: Verbundberatung_Berlin_Institutionen.xlsx
 */
export const VERBUNDBERATUNG_INSTITUTIONEN: string[] = [
  "Handwerkskammer Berlin (HWK)",
  "Handwerkskammer Frankfurt (Oder), Region Ostbrandenburg",
  "Industrie- und Handelskammer zu Berlin (IHK Berlin)",
  "Verband der Freien Berufe in Berlin e.V. (VfB)",
  "Vereinigung der Unternehmensverbände Berlin-Brandenburg e.V. (UVB)",
  "Apothekerkammer Berlin",
  "Architektenkammer Berlin",
  "Baukammer Berlin",
  "Berlin-Brandenburger Verband der Steuerberater, Wirtschaftsprüfer und vereidigten Buchprüfer e.V.",
  "Berliner Apotheker-Verein e.V.",
  "Bund Deutscher Landschaftsarchitekt:innen, Landesverband Berlin/Brandenburg e.V.",
  "Bund der Öffentlich bestellten Vermessungsingenieure e.V., Landesgruppe Berlin",
  "BDÜ – Bundesverband der Dolmetscher und Übersetzer, Landesverband Berlin-Brandenburg e.V.",
  "Hartmannbund – Verband der Ärztinnen und Ärzte Deutschlands, Landesverband Berlin",
  "Kassenzahnärztliche Vereinigung Berlin (KZV Berlin)",
  "Rechtsanwaltskammer Berlin",
  "Steuerberaterkammer Berlin",
  "Steuerberaterverband Berlin-Brandenburg e.V.",
  "VBI – Verband Beratender Ingenieure, Landesverband Berlin-Brandenburg",
  "Verband der Restauratoren e.V., Landesgruppe Berlin/Brandenburg",
  "Vereinigung freischaffender Architekten e.V., Landesgruppe Berlin-Brandenburg",
  "Wirtschaftsprüferkammer, Landesgeschäftsstelle Berlin",
];
