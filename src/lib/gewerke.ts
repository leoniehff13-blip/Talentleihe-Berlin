/**
 * Gewerke, die an der Handwerkskammer Berlin als Ausbildung angeboten werden.
 * Reihenfolge alphabetisch.
 */
export const GEWERKE: string[] = [
  "Änderungsschneider/-in",
  "Anlagenmechaniker/-in für Sanitär-, Heizungs- und Klimatechnik",
  "Augenoptiker/-in",
  "Bäcker/-in",
  "Bodenleger/-in",
  "Dachdecker/-in",
  "Elektroniker/-in",
  "Elektroniker/-in für Gebäudesystemintegration",
  "Estrichleger/-in",
  "Fachkraft für Metalltechnik",
  "Fahrzeuglackierer/-in",
  "Feinwerkmechaniker/-in",
  "Fleischer/-in",
  "Fliesen-, Platten- und Mosaikleger/-in",
  "Fotograf/-in",
  "Friseur/-in",
  "Gebäudereiniger/-in",
  "Gerüstbauer/-in",
  "Glaser/-in",
  "Gold- und Silberschmied/-in",
  "Hörakustiker/-in",
  "Informationselektroniker/-in",
  "Karosserie- und Fahrzeugbaumechaniker/-in",
  "Keramiker/-in",
  "Klempner/-in",
  "Konditor/-in",
  "Konstruktionsmechaniker/-in",
  "Kosmetiker/-in",
  "Kraftfahrzeugmechatroniker/-in",
  "Maler/-in und Lackierer/-in",
  "Maskenbildner/-in",
  "Maurer/-in",
  "Maßschneider/-in",
  "Mechatroniker/-in",
  "Mechatroniker/-in für Kältetechnik",
  "Mediengestalter/-in Digital und Print",
  "Metallbauer/-in",
  "Ofen- und Luftheizungsbauer/-in",
  "Orthopädieschuhmacher/-in",
  "Orthopädietechnik-Mechaniker/-in",
  "Parkettleger/-in",
  "Rollladen- und Sonnenschutzmechatroniker/-in",
  "Schilder- und Lichtreklamehersteller/-in",
  "Steinmetz/-in und Steinbildhauer/-in",
  "Straßenbauer/-in",
  "Stuckateur/-in",
  "Tischler/-in",
  "Wärme-, Kälte- und Schallschutzisolierer/-in",
  "Zahntechniker/-in",
  "Zimmerer/Zimmerin",
  "Zweiradmechatroniker/-in",
];

/**
 * Liefert den "Stamm" eines Gewerks, also alles vor dem ersten Schrägstrich
 * (z. B. "Tischler/-in" → "Tischler"). Für tolerantes Filter-Matching.
 */
export function gewerkStamm(value: string): string {
  if (!value) return "";
  const beforeSlash = value.split("/")[0];
  return beforeSlash.trim().toLowerCase();
}
