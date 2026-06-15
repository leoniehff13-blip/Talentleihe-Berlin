/**
 * Appwrite Setup Script – Talentleihe Berlin
 * Legt die komplette Datenbankstruktur (inkl. Storage-Bucket) in einem
 * Appwrite-Projekt an. Idempotent: bereits vorhandene Objekte werden
 * übersprungen (HTTP 409).
 *
 * Verwendung:
 *   1. API Key in Appwrite Console erstellen (Settings → API Keys, alle Scopes)
 *   2. Endpoint + Projekt des ZIEL-Projekts setzen und Skript starten:
 *
 *      APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1 \
 *      APPWRITE_PROJECT_ID=DEINE_PROJEKT_ID \
 *      APPWRITE_API_KEY=DEIN_KEY \
 *      node setup-appwrite.mjs
 *
 *   Ohne APPWRITE_ENDPOINT/APPWRITE_PROJECT_ID wird auf das Live-Projekt
 *   zurückgefallen – also IMMER die Variablen setzen, wenn ein anderes
 *   (z. B. Dev-)Projekt befüllt werden soll.
 */

import { Client, Databases, Storage, Permission, Role } from 'node-appwrite';

const API_KEY = process.env.APPWRITE_API_KEY;
const ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '6a0ad52d001a8c4fd7f5';

if (!API_KEY) {
  console.error('❌ Bitte APPWRITE_API_KEY setzen: APPWRITE_API_KEY=xxx node setup-appwrite.mjs');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const db = new Databases(client);
const storage = new Storage(client);
const DB = 'lehrstellen';
const BUCKET_DOKUMENTE = 'dokumente';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function tryCreate(label, fn) {
  try {
    await fn();
    process.stdout.write(`  ✅ ${label}\n`);
  } catch (e) {
    if (e?.code === 409) {
      process.stdout.write(`  ⏭  ${label} (bereits vorhanden)\n`);
    } else {
      process.stdout.write(`  ❌ ${label}: ${e?.message}\n`);
    }
  }
  await sleep(300);
}

async function setup() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Appwrite Setup – Talentleihe Berlin');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Endpoint: ${ENDPOINT}`);
  console.log(`  Projekt:  ${PROJECT_ID}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // ── Datenbank ─────────────────────────────────────────────────────────────
  console.log('📦 Datenbank: lehrstellen');
  await tryCreate('Datenbank', () => db.create(DB, 'Lehrstellen'));

  // ── Tabelle: apprenticeships ───────────────────────────────────────────────
  console.log('\n📋 Tabelle: apprenticeships (Anzeigen)');
  await tryCreate('Collection', () =>
    db.createCollection(DB, 'apprenticeships', 'Lehrstellen', [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
    ], true)
  );

  const apprAttrs = [
    ['gewerk',            () => db.createStringAttribute(DB, 'apprenticeships', 'gewerk', 100, true)],
    ['firma',             () => db.createStringAttribute(DB, 'apprenticeships', 'firma', 200, true)],
    ['ort',               () => db.createStringAttribute(DB, 'apprenticeships', 'ort', 100, true)],
    ['startdatum',        () => db.createDatetimeAttribute(DB, 'apprenticeships', 'startdatum', true)],
    ['enddatum',          () => db.createDatetimeAttribute(DB, 'apprenticeships', 'enddatum', false)],
    ['kontakt_email',     () => db.createEmailAttribute(DB, 'apprenticeships', 'kontakt_email', true)],
    ['spezialisierungen', () => db.createStringAttribute(DB, 'apprenticeships', 'spezialisierungen', 100, false, null, true)],
    ['lernziele',         () => db.createStringAttribute(DB, 'apprenticeships', 'lernziele', 200, false, null, true)],
    ['mindestalter',      () => db.createIntegerAttribute(DB, 'apprenticeships', 'mindestalter', false, 14, 99)],
    ['vorerfahrung',      () => db.createStringAttribute(DB, 'apprenticeships', 'vorerfahrung', 65535, false)],
    ['aufgabenbeschreibung', () => db.createStringAttribute(DB, 'apprenticeships', 'aufgabenbeschreibung', 65535, true)],
    ['owner_id',          () => db.createStringAttribute(DB, 'apprenticeships', 'owner_id', 50, false)],
    ['adresse',           () => db.createStringAttribute(DB, 'apprenticeships', 'adresse', 200, false)],
    ['plz',               () => db.createStringAttribute(DB, 'apprenticeships', 'plz', 10, false)],
    ['plz_umkreis',       () => db.createIntegerAttribute(DB, 'apprenticeships', 'plz_umkreis', false, 0, 500)],
    ['stadt',             () => db.createStringAttribute(DB, 'apprenticeships', 'stadt', 100, false)],
    ['bundesland',        () => db.createEnumAttribute(DB, 'apprenticeships', 'bundesland', [
      'Baden-Württemberg','Bayern','Berlin','Brandenburg','Bremen','Hamburg',
      'Hessen','Mecklenburg-Vorpommern','Niedersachsen','Nordrhein-Westfalen',
      'Rheinland-Pfalz','Saarland','Sachsen','Sachsen-Anhalt','Schleswig-Holstein','Thüringen'
    ], false)],
    ['handwerkskammer',   () => db.createStringAttribute(DB, 'apprenticeships', 'handwerkskammer', 200, false)],
    ['type',              () => db.createEnumAttribute(DB, 'apprenticeships', 'type', ['einsatz', 'talent_angebot'], false, 'einsatz')],
  ];
  for (const [label, fn] of apprAttrs) await tryCreate(label, fn);

  console.log('  ⏳ Warte auf Attribute...');
  await sleep(3000);

  await tryCreate('Index: idx_bundesland', () => db.createIndex(DB, 'apprenticeships', 'idx_bundesland', 'key', ['bundesland']));
  await tryCreate('Index: idx_startdatum', () => db.createIndex(DB, 'apprenticeships', 'idx_startdatum', 'key', ['startdatum'], ['DESC']));
  await tryCreate('Index: idx_gewerk',     () => db.createIndex(DB, 'apprenticeships', 'idx_gewerk', 'key', ['gewerk']));
  await tryCreate('Index: idx_owner',      () => db.createIndex(DB, 'apprenticeships', 'idx_owner', 'key', ['owner_id']));
  await tryCreate('Index: idx_handwerkskammer', () => db.createIndex(DB, 'apprenticeships', 'idx_handwerkskammer', 'key', ['handwerkskammer']));

  // ── Tabelle: profiles ─────────────────────────────────────────────────────
  console.log('\n👤 Tabelle: profiles');
  await tryCreate('Collection', () =>
    db.createCollection(DB, 'profiles', 'Profiles', [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
    ], true)
  );

  const profileAttrs = [
    ['type',                  () => db.createEnumAttribute(DB, 'profiles', 'type', ['talent', 'betrieb'], true)],
    ['user_id',               () => db.createStringAttribute(DB, 'profiles', 'user_id', 50, true)],
    ['name',                  () => db.createStringAttribute(DB, 'profiles', 'name', 200, true)],
    ['vorname',               () => db.createStringAttribute(DB, 'profiles', 'vorname', 100, false)],
    ['anrede',                () => db.createEnumAttribute(DB, 'profiles', 'anrede', ['Herr', 'Frau', 'Enby', 'möchte ich nicht angeben'], false)],
    ['ort',                   () => db.createStringAttribute(DB, 'profiles', 'ort', 100, false)],
    ['adresse',               () => db.createStringAttribute(DB, 'profiles', 'adresse', 200, false)],
    ['gewerk',                () => db.createStringAttribute(DB, 'profiles', 'gewerk', 100, false)],
    ['handwerkskammer',       () => db.createStringAttribute(DB, 'profiles', 'handwerkskammer', 200, false)],
    ['lehrjahr',              () => db.createIntegerAttribute(DB, 'profiles', 'lehrjahr', false, 1, 4)],
    ['unternehmen',           () => db.createStringAttribute(DB, 'profiles', 'unternehmen', 200, false)],
    ['berufsschule',          () => db.createStringAttribute(DB, 'profiles', 'berufsschule', 200, false)],
    ['faehigkeiten',          () => db.createStringAttribute(DB, 'profiles', 'faehigkeiten', 100, false, null, true)],
    ['ansprechpartner',       () => db.createStringAttribute(DB, 'profiles', 'ansprechpartner', 200, false)],
    ['ansprechpartner_email', () => db.createEmailAttribute(DB, 'profiles', 'ansprechpartner_email', false)],
    ['spezialisierung',       () => db.createStringAttribute(DB, 'profiles', 'spezialisierung', 100, false, null, true)],
  ];
  for (const [label, fn] of profileAttrs) await tryCreate(label, fn);

  await tryCreate('Index: idx_user_id', () => db.createIndex(DB, 'profiles', 'idx_user_id', 'key', ['user_id']));

  // ── Tabelle: bewerbungen ──────────────────────────────────────────────────
  console.log('\n📝 Tabelle: bewerbungen');
  await tryCreate('Collection', () =>
    db.createCollection(DB, 'bewerbungen', 'Bewerbungen', [
      Permission.read(Role.users()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ], false)
  );

  const bewAttrs = [
    ['apprenticeship_id',    () => db.createStringAttribute(DB, 'bewerbungen', 'apprenticeship_id', 50, true)],
    ['applicant_user_id',    () => db.createStringAttribute(DB, 'bewerbungen', 'applicant_user_id', 50, true)],
    ['posting_owner_id',     () => db.createStringAttribute(DB, 'bewerbungen', 'posting_owner_id', 50, true)],
    ['apprenticeship_titel', () => db.createStringAttribute(DB, 'bewerbungen', 'apprenticeship_titel', 200, false)],
    ['applicant_name',       () => db.createStringAttribute(DB, 'bewerbungen', 'applicant_name', 200, false)],
    ['nachricht',            () => db.createStringAttribute(DB, 'bewerbungen', 'nachricht', 65535, true)],
    ['dokument_ids',         () => db.createStringAttribute(DB, 'bewerbungen', 'dokument_ids', 50, false, null, true)],
    ['erinnerung_gesendet',  () => db.createBooleanAttribute(DB, 'bewerbungen', 'erinnerung_gesendet', false, false)],
    ['status',               () => db.createEnumAttribute(DB, 'bewerbungen', 'status', ['ausstehend', 'angenommen', 'abgelehnt', 'zurueckgezogen'], false, 'ausstehend')],
  ];
  for (const [label, fn] of bewAttrs) await tryCreate(label, fn);

  console.log('  ⏳ Warte auf Attribute...');
  await sleep(3000);

  await tryCreate('Index: idx_applicant',    () => db.createIndex(DB, 'bewerbungen', 'idx_applicant', 'key', ['applicant_user_id']));
  await tryCreate('Index: idx_owner',        () => db.createIndex(DB, 'bewerbungen', 'idx_owner', 'key', ['posting_owner_id']));
  await tryCreate('Index: idx_apprenticeship', () => db.createIndex(DB, 'bewerbungen', 'idx_apprenticeship', 'key', ['apprenticeship_id']));

  // ── Tabelle: bewertungen ──────────────────────────────────────────────────
  console.log('\n⭐ Tabelle: bewertungen');
  await tryCreate('Collection', () =>
    db.createCollection(DB, 'bewertungen', 'Bewertungen', [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()), // Bewertungen müssen bearbeitbar sein
    ], false)
  );

  const bewertungAttrs = [
    ['bewerbung_id',   () => db.createStringAttribute(DB, 'bewertungen', 'bewerbung_id', 50, true)],
    ['rated_user_id',  () => db.createStringAttribute(DB, 'bewertungen', 'rated_user_id', 50, true)],
    ['rater_user_id',  () => db.createStringAttribute(DB, 'bewertungen', 'rater_user_id', 50, true)],
    ['rated_type',     () => db.createEnumAttribute(DB, 'bewertungen', 'rated_type', ['talent', 'betrieb'], true)],
    ['kat1',           () => db.createIntegerAttribute(DB, 'bewertungen', 'kat1', true, 1, 5)],
    ['kat2',           () => db.createIntegerAttribute(DB, 'bewertungen', 'kat2', true, 1, 5)],
    ['kat3',           () => db.createIntegerAttribute(DB, 'bewertungen', 'kat3', true, 1, 5)],
    ['kommentar',      () => db.createStringAttribute(DB, 'bewertungen', 'kommentar', 65535, false)],
  ];
  for (const [label, fn] of bewertungAttrs) await tryCreate(label, fn);

  console.log('  ⏳ Warte auf Attribute...');
  await sleep(3000);

  await tryCreate('Index: idx_rated_user', () => db.createIndex(DB, 'bewertungen', 'idx_rated_user', 'key', ['rated_user_id']));
  await tryCreate('Index: idx_bewerbung',  () => db.createIndex(DB, 'bewertungen', 'idx_bewerbung', 'key', ['bewerbung_id']));

  // ── Tabelle: dokumente ────────────────────────────────────────────────────
  console.log('\n📎 Tabelle: dokumente');
  await tryCreate('Collection', () =>
    db.createCollection(DB, 'dokumente', 'Dokumente', [
      Permission.create(Role.users()),
    ], true)  // documentSecurity = true (Lese-/Löschrechte pro Dokument)
  );

  const dokAttrs = [
    ['user_id',   () => db.createStringAttribute(DB, 'dokumente', 'user_id', 50, true)],
    ['file_id',   () => db.createStringAttribute(DB, 'dokumente', 'file_id', 50, true)],
    ['filename',  () => db.createStringAttribute(DB, 'dokumente', 'filename', 255, true)],
    ['size',      () => db.createIntegerAttribute(DB, 'dokumente', 'size', true, 0)],
    ['mime_type', () => db.createStringAttribute(DB, 'dokumente', 'mime_type', 100, false)],
  ];
  for (const [label, fn] of dokAttrs) await tryCreate(label, fn);

  await tryCreate('Index: idx_user', () => db.createIndex(DB, 'dokumente', 'idx_user', 'key', ['user_id']));

  // ── Storage-Bucket: dokumente ─────────────────────────────────────────────
  console.log('\n🗄️  Storage-Bucket: dokumente');
  await tryCreate('Bucket', () =>
    storage.createBucket(
      BUCKET_DOKUMENTE,
      'Dokumente',
      [Permission.create(Role.users())],
      true   // fileSecurity = true (Lese-/Löschrechte pro Datei)
    )
  );

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Setup abgeschlossen!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

setup().catch((e) => {
  console.error('❌ Unerwarteter Fehler:', e?.message ?? e);
  process.exit(1);
});
