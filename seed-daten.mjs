/**
 * seed-daten.mjs – 10 Einsätze (Betriebe) + 10 Talent-Angebote (Azubis)
 * Alle Betriebe aus dem Berliner Raum, HWK Berlin.
 *
 * Verwendung:
 *   APPWRITE_API_KEY=dein_key node seed-daten.mjs
 */

import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

const API_KEY = process.env.APPWRITE_API_KEY;
if (!API_KEY) {
  console.error('❌ Bitte APPWRITE_API_KEY setzen: APPWRITE_API_KEY=xxx node seed-daten.mjs');
  process.exit(1);
}

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('6a0ad52d001a8c4fd7f5')
  .setKey(API_KEY);

const db = new Databases(client);
const DB  = 'lehrstellen';
const COL = 'apprenticeships';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const iso   = (d)  => new Date(d + 'T00:00:00.000Z').toISOString();

// ── 10 Einsätze von Betrieben ────────────────────────────────────────────────
const einsaetze = [
  {
    type: 'einsatz',
    gewerk: 'Tischler/-in',
    firma: 'Tischlerei Holzwerkstatt Prenzlauer',
    ort: 'Berlin-Prenzlauer Berg',
    startdatum: iso('2026-06-02'),
    enddatum: iso('2026-08-29'),
    kontakt_email: 'info@tischlerei-prenzlauer.de',
    spezialisierungen: ['Massivholz', 'Innenausbau'],
    lernziele: [],
    aufgabenbeschreibung: 'Unterstützung bei Möbelrestaurierung und Innenausbau für Privatkunden. Eigenständige Furnier- und Schleifarbeiten unter Aufsicht.',
    adresse: 'Schönhauser Allee 112',
    plz: '10439', plz_umkreis: null, stadt: 'Berlin', bundesland: 'Berlin',
    handwerkskammer: 'Handwerkskammer Berlin',
    mindestalter: 16,
    vorerfahrung: 'Grundkenntnisse in der Holzbearbeitung erforderlich',
  },
  {
    type: 'einsatz',
    gewerk: 'Elektroniker/-in',
    firma: 'Elektro Schreiber GmbH',
    ort: 'Berlin-Charlottenburg',
    startdatum: iso('2026-06-16'),
    enddatum: iso('2026-09-15'),
    kontakt_email: 'ausbildung@elektro-schreiber.de',
    spezialisierungen: ['Gebäudetechnik', 'Smart Home'],
    lernziele: [],
    aufgabenbeschreibung: 'Installation und Inbetriebnahme von Smart-Home-Systemen in Berliner Neubauten. Kabelverlegung, Schaltschrankbau und Fehlersuche.',
    adresse: 'Kantstraße 67',
    plz: '10627', plz_umkreis: null, stadt: 'Berlin', bundesland: 'Berlin',
    handwerkskammer: 'Handwerkskammer Berlin',
    mindestalter: 16,
    vorerfahrung: null,
  },
  {
    type: 'einsatz',
    gewerk: 'Maler/-in und Lackierer/-in',
    firma: 'Malerbetrieb Hoffmann & Sohn',
    ort: 'Berlin-Neukölln',
    startdatum: iso('2026-07-01'),
    enddatum: iso('2026-09-30'),
    kontakt_email: 'kontakt@maler-hoffmann-berlin.de',
    spezialisierungen: ['Fassadenbeschichtung', 'Tapezierarbeiten'],
    lernziele: [],
    aufgabenbeschreibung: 'Renovierungsarbeiten in Mietwohnungen: Farbgestaltung, Tapezieren und Lackierarbeiten. Selbstständiges Arbeiten im Team nach Vorgabe.',
    adresse: 'Karl-Marx-Straße 204',
    plz: '12055', plz_umkreis: null, stadt: 'Berlin', bundesland: 'Berlin',
    handwerkskammer: 'Handwerkskammer Berlin',
    mindestalter: null,
    vorerfahrung: null,
  },
  {
    type: 'einsatz',
    gewerk: 'Kraftfahrzeugmechatroniker/-in',
    firma: 'Berliner Stern KFZ-Werkstatt',
    ort: 'Berlin-Tempelhof',
    startdatum: iso('2026-06-01'),
    enddatum: iso('2026-07-31'),
    kontakt_email: 'werkstatt@berlinerstern-kfz.de',
    spezialisierungen: ['Fahrzeugelektronik', 'Diagnose'],
    lernziele: [],
    aufgabenbeschreibung: 'Wartung, Inspektion und Fehlerdiagnose an PKW aller Marken. Umgang mit modernen Diagnosegeräten und Hebebühne.',
    adresse: 'Tempelhofer Damm 155',
    plz: '12099', plz_umkreis: null, stadt: 'Berlin', bundesland: 'Berlin',
    handwerkskammer: 'Handwerkskammer Berlin',
    mindestalter: 18,
    vorerfahrung: 'Führerschein Klasse B wünschenswert',
  },
  {
    type: 'einsatz',
    gewerk: 'Bäcker/-in',
    firma: 'Bäckerei & Konditorei Richter',
    ort: 'Berlin-Mitte',
    startdatum: iso('2026-05-26'),
    enddatum: iso('2026-07-25'),
    kontakt_email: 'info@baeckerei-richter-berlin.de',
    spezialisierungen: ['Sauerteigbrot', 'Feingebäck'],
    lernziele: [],
    aufgabenbeschreibung: 'Mitarbeit in der Produktion: Teig ansetzen, Brote formen, backen und dekorieren. Frühschicht ab 4:00 Uhr.',
    adresse: 'Rosenthaler Straße 40',
    plz: '10178', plz_umkreis: null, stadt: 'Berlin', bundesland: 'Berlin',
    handwerkskammer: 'Handwerkskammer Berlin',
    mindestalter: 16,
    vorerfahrung: null,
  },
  {
    type: 'einsatz',
    gewerk: 'Anlagenmechaniker/-in für Sanitär-, Heizungs- und Klimatechnik',
    firma: 'Weber Sanitär & Heizung',
    ort: 'Berlin-Spandau',
    startdatum: iso('2026-07-15'),
    enddatum: iso('2026-10-15'),
    kontakt_email: 'ausbildung@weber-shk-berlin.de',
    spezialisierungen: ['Wärmepumpen', 'Badinstallation'],
    lernziele: [],
    aufgabenbeschreibung: 'Installation von Heizungsanlagen und Sanitäreinrichtungen in Wohn- und Gewerbegebäuden. Schwerpunkt Wärmepumpen und erneuerbare Energien.',
    adresse: 'Klosterstraße 5',
    plz: '13581', plz_umkreis: null, stadt: 'Berlin', bundesland: 'Berlin',
    handwerkskammer: 'Handwerkskammer Berlin',
    mindestalter: null,
    vorerfahrung: 'Grundkenntnisse in SHK von Vorteil',
  },
  {
    type: 'einsatz',
    gewerk: 'Dachdecker/-in',
    firma: 'Dachdeckerei Fischer & Partner',
    ort: 'Berlin-Reinickendorf',
    startdatum: iso('2026-06-01'),
    enddatum: iso('2026-08-31'),
    kontakt_email: 'info@dachdeckerei-fischer-berlin.de',
    spezialisierungen: ['Flachdach', 'Photovoltaik-Montage'],
    lernziele: [],
    aufgabenbeschreibung: 'Abdichtungsarbeiten auf Flachdächern, Montage von PV-Anlagen und klassische Eindeckungsarbeiten. Höhentauglichkeit erforderlich.',
    adresse: 'Residenzstraße 88',
    plz: '13409', plz_umkreis: null, stadt: 'Berlin', bundesland: 'Berlin',
    handwerkskammer: 'Handwerkskammer Berlin',
    mindestalter: 18,
    vorerfahrung: 'Schwindelfreiheit Pflicht',
  },
  {
    type: 'einsatz',
    gewerk: 'Metallbauer/-in',
    firma: 'Metallbau Krause GmbH',
    ort: 'Berlin-Lichtenberg',
    startdatum: iso('2026-08-01'),
    enddatum: iso('2026-10-31'),
    kontakt_email: 'jobs@metallbau-krause.de',
    spezialisierungen: ['Stahlkonstruktion', 'Schweißtechnik'],
    lernziele: [],
    aufgabenbeschreibung: 'Fertigung und Montage von Stahl- und Aluminiumkonstruktionen, Tore, Treppen und Geländer. MAG- und WIG-Schweißverfahren.',
    adresse: 'Frankfurter Allee 220',
    plz: '10365', plz_umkreis: null, stadt: 'Berlin', bundesland: 'Berlin',
    handwerkskammer: 'Handwerkskammer Berlin',
    mindestalter: 16,
    vorerfahrung: 'Grundkenntnisse im Schweißen von Vorteil',
  },
  {
    type: 'einsatz',
    gewerk: 'Friseur/-in',
    firma: 'Friseursalon Bella Vita',
    ort: 'Berlin-Friedrichshain',
    startdatum: iso('2026-06-01'),
    enddatum: iso('2026-08-01'),
    kontakt_email: 'salon@bellavita-berlin.de',
    spezialisierungen: ['Colorationen', 'Hochzeitsfrisuren'],
    lernziele: [],
    aufgabenbeschreibung: 'Mitarbeit im Tagesgeschäft: Waschen, Schneiden, Föhnen und Colorationen unter Aufsicht erfahrener Friseur:innen.',
    adresse: 'Simon-Dach-Straße 15',
    plz: '10245', plz_umkreis: null, stadt: 'Berlin', bundesland: 'Berlin',
    handwerkskammer: 'Handwerkskammer Berlin',
    mindestalter: null,
    vorerfahrung: null,
  },
  {
    type: 'einsatz',
    gewerk: 'Zahntechniker/-in',
    firma: 'Zahntechnik Schmidt & Kollegen',
    ort: 'Berlin-Steglitz',
    startdatum: iso('2026-07-01'),
    enddatum: iso('2026-09-30'),
    kontakt_email: 'labor@zahntechnik-schmidt-berlin.de',
    spezialisierungen: ['CAD/CAM', 'Keramikverblendungen'],
    lernziele: [],
    aufgabenbeschreibung: 'Herstellung von Kronen, Brücken und Prothesen im zahntechnischen Labor. Digitale und analoge Fertigungstechniken.',
    adresse: 'Schloßstraße 102',
    plz: '12163', plz_umkreis: null, stadt: 'Berlin', bundesland: 'Berlin',
    handwerkskammer: 'Handwerkskammer Berlin',
    mindestalter: null,
    vorerfahrung: 'Interesse an digitaler Zahntechnik',
  },
];

// ── 10 Talent-Angebote von Azubis ────────────────────────────────────────────
const talentAngebote = [
  {
    type: 'talent_angebot',
    gewerk: 'Tischler/-in',
    firma: 'Tischlerei Grundmann (Ausbildungsbetrieb)',
    ort: 'Berlin-Pankow',
    startdatum: iso('2026-06-15'),
    enddatum: iso('2026-08-15'),
    kontakt_email: 'azubi.tischler@postfach.de',
    spezialisierungen: ['Massivholz', 'CNC-Fräse'],
    lernziele: ['Restaurierungstechniken kennenlernen', 'Kundenkontakt üben'],
    aufgabenbeschreibung: '',
    adresse: null, plz: '13187', plz_umkreis: 20, stadt: null,
    bundesland: 'Berlin', handwerkskammer: 'Handwerkskammer Berlin',
    mindestalter: null, vorerfahrung: null,
  },
  {
    type: 'talent_angebot',
    gewerk: 'Elektroniker/-in für Gebäudesystemintegration',
    firma: 'Elektro Vogel Berlin (Ausbildungsbetrieb)',
    ort: 'Berlin-Mitte',
    startdatum: iso('2026-07-01'),
    enddatum: iso('2026-09-30'),
    kontakt_email: 'azubi.elektro@postfach.de',
    spezialisierungen: ['KNX', 'Gebäudeautomation'],
    lernziele: ['Praxiserfahrung in anderen Gewerken sammeln', 'Teamarbeit ausbauen'],
    aufgabenbeschreibung: '',
    adresse: null, plz: '10115', plz_umkreis: 15, stadt: null,
    bundesland: 'Berlin', handwerkskammer: 'Handwerkskammer Berlin',
    mindestalter: null, vorerfahrung: null,
  },
  {
    type: 'talent_angebot',
    gewerk: 'Maler/-in und Lackierer/-in',
    firma: 'Malerbetrieb Sommer Berlin (Ausbildungsbetrieb)',
    ort: 'Berlin-Kreuzberg',
    startdatum: iso('2026-06-01'),
    enddatum: iso('2026-07-31'),
    kontakt_email: 'azubi.maler@postfach.de',
    spezialisierungen: ['Farbgestaltung', 'Schablonentechnik'],
    lernziele: ['Neue Maltechniken erlernen', 'Gewerbeimmobilien kennenlernen'],
    aufgabenbeschreibung: '',
    adresse: null, plz: '10961', plz_umkreis: 10, stadt: null,
    bundesland: 'Berlin', handwerkskammer: 'Handwerkskammer Berlin',
    mindestalter: null, vorerfahrung: null,
  },
  {
    type: 'talent_angebot',
    gewerk: 'Kraftfahrzeugmechatroniker/-in',
    firma: 'Auto-Service Braun GmbH (Ausbildungsbetrieb)',
    ort: 'Berlin-Marzahn',
    startdatum: iso('2026-08-01'),
    enddatum: iso('2026-10-31'),
    kontakt_email: 'azubi.kfz@postfach.de',
    spezialisierungen: ['Elektrofahrzeuge', 'Reifenmontage'],
    lernziele: ['Hochvolttechnik kennenlernen', 'Prüfstandserfahrung sammeln'],
    aufgabenbeschreibung: '',
    adresse: null, plz: '12685', plz_umkreis: 25, stadt: null,
    bundesland: 'Berlin', handwerkskammer: 'Handwerkskammer Berlin',
    mindestalter: null, vorerfahrung: null,
  },
  {
    type: 'talent_angebot',
    gewerk: 'Bäcker/-in',
    firma: 'Bäckerei Goldähre (Ausbildungsbetrieb)',
    ort: 'Berlin-Wedding',
    startdatum: iso('2026-05-26'),
    enddatum: iso('2026-07-25'),
    kontakt_email: 'azubi.baecker@postfach.de',
    spezialisierungen: ['Sauerteig', 'Konditorei'],
    lernziele: ['Konditoreitechniken vertiefen', 'Neue Rezepturen ausprobieren'],
    aufgabenbeschreibung: '',
    adresse: null, plz: '13347', plz_umkreis: 10, stadt: null,
    bundesland: 'Berlin', handwerkskammer: 'Handwerkskammer Berlin',
    mindestalter: null, vorerfahrung: null,
  },
  {
    type: 'talent_angebot',
    gewerk: 'Anlagenmechaniker/-in für Sanitär-, Heizungs- und Klimatechnik',
    firma: 'Klimatech Nord Berlin (Ausbildungsbetrieb)',
    ort: 'Berlin-Reinickendorf',
    startdatum: iso('2026-07-01'),
    enddatum: iso('2026-09-30'),
    kontakt_email: 'azubi.shk@postfach.de',
    spezialisierungen: ['Wärmepumpen', 'Lüftungsanlagen'],
    lernziele: ['Klimaanlagen kennenlernen', 'Wartungsarbeiten selbstständig durchführen'],
    aufgabenbeschreibung: '',
    adresse: null, plz: '13437', plz_umkreis: 20, stadt: null,
    bundesland: 'Berlin', handwerkskammer: 'Handwerkskammer Berlin',
    mindestalter: null, vorerfahrung: null,
  },
  {
    type: 'talent_angebot',
    gewerk: 'Dachdecker/-in',
    firma: 'Dachdeckerei Neumann (Ausbildungsbetrieb)',
    ort: 'Berlin-Spandau',
    startdatum: iso('2026-06-15'),
    enddatum: iso('2026-08-31'),
    kontakt_email: 'azubi.dachdecker@postfach.de',
    spezialisierungen: ['Steildach', 'Dachfenster'],
    lernziele: ['Flachdachabdichtung kennenlernen', 'PV-Montage ausprobieren'],
    aufgabenbeschreibung: '',
    adresse: null, plz: '13581', plz_umkreis: 15, stadt: null,
    bundesland: 'Berlin', handwerkskammer: 'Handwerkskammer Berlin',
    mindestalter: null, vorerfahrung: null,
  },
  {
    type: 'talent_angebot',
    gewerk: 'Metallbauer/-in',
    firma: 'Stahl & Form Berlin (Ausbildungsbetrieb)',
    ort: 'Berlin-Treptow',
    startdatum: iso('2026-08-15'),
    enddatum: iso('2026-11-15'),
    kontakt_email: 'azubi.metallbau@postfach.de',
    spezialisierungen: ['Schweißen', 'Schlosserei'],
    lernziele: ['WIG-Schweißen erlernen', 'Maschinenpark erweitern'],
    aufgabenbeschreibung: '',
    adresse: null, plz: '12435', plz_umkreis: 20, stadt: null,
    bundesland: 'Berlin', handwerkskammer: 'Handwerkskammer Berlin',
    mindestalter: null, vorerfahrung: null,
  },
  {
    type: 'talent_angebot',
    gewerk: 'Friseur/-in',
    firma: 'Hairstudio Pankow (Ausbildungsbetrieb)',
    ort: 'Berlin-Pankow',
    startdatum: iso('2026-06-01'),
    enddatum: iso('2026-08-01'),
    kontakt_email: 'azubi.friseur@postfach.de',
    spezialisierungen: ['Colorationen', 'Herrenhaarschnitt'],
    lernziele: ['Hochzeitsfrisuren erlernen', 'Produktkenntnisse erweitern'],
    aufgabenbeschreibung: '',
    adresse: null, plz: '13187', plz_umkreis: 10, stadt: null,
    bundesland: 'Berlin', handwerkskammer: 'Handwerkskammer Berlin',
    mindestalter: null, vorerfahrung: null,
  },
  {
    type: 'talent_angebot',
    gewerk: 'Zahntechniker/-in',
    firma: 'Zahntechnik Lehrwerkstatt Steglitz (Ausbildungsbetrieb)',
    ort: 'Berlin-Steglitz',
    startdatum: iso('2026-09-01'),
    enddatum: iso('2026-11-30'),
    kontakt_email: 'azubi.zahntechnik@postfach.de',
    spezialisierungen: ['Modellguss', 'Keramik'],
    lernziele: ['CAD/CAM-Technik kennenlernen', 'Implantatversorgung erlernen'],
    aufgabenbeschreibung: '',
    adresse: null, plz: '12163', plz_umkreis: 15, stadt: null,
    bundesland: 'Berlin', handwerkskammer: 'Handwerkskammer Berlin',
    mindestalter: null, vorerfahrung: null,
  },
];

async function createDoc(data) {
  try {
    await db.createDocument(DB, COL, ID.unique(), data, [
      Permission.read(Role.any()),
    ]);
    const label = data.type === 'einsatz' ? 'Einsatz  ' : 'Talent   ';
    process.stdout.write(`  ✅ ${label} ${data.gewerk.padEnd(50)} ${data.firma}\n`);
  } catch (e) {
    process.stdout.write(`  ❌ ${data.firma}: ${e?.message}\n`);
  }
  await sleep(300);
}

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Seed-Daten – Talentleihe Berlin');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🏗️  10 Einsätze von Betrieben:');
  for (const e of einsaetze) await createDoc(e);

  console.log('\n🎓  10 Talent-Angebote von Azubis:');
  for (const t of talentAngebote) await createDoc(t);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 20 Einträge angelegt.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(e => {
  console.error('❌ Fehler:', e?.message ?? e);
  process.exit(1);
});
