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
  "Handwerkskammer Frankfurt (Oder), Region Ostbrandenburg",
  "Handwerkskammer Frankfurt-Rhein-Main",
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
 * HWK Frankfurt (Oder): zuständig für Barnim, Märkisch-Oderland,
 *                       Oder-Spree, Uckermark und Frankfurt (Oder)
 */
export const BERLIN_REGION_KAMMERN = [
  "Handwerkskammer Berlin",
  "Handwerkskammer Frankfurt (Oder), Region Ostbrandenburg",
] as const;

export type BerlinRegionKammer = (typeof BERLIN_REGION_KAMMERN)[number];
