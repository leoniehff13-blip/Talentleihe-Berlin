/**
 * Appwrite Setup Script – Talentleihe Berlin
 * Legt die komplette Datenbankstruktur im neuen Appwrite-Projekt an.
 *
 * Verwendung:
 *   1. API Key in Appwrite Console erstellen (Settings → API Keys, alle Scopes)
 *   2. Im Terminal: APPWRITE_API_KEY=dein_key node setup-appwrite.mjs
 */

import { Client, Databases, Permission, Role } from 'node-appwrite';

const API_KEY = process.env.APPWRITE_API_KEY;
if (!API_KEY) {
  console.error('❌ Bitte APPWRITE_API_KEY setzen: APPWRITE_API_KEY=xxx node setup-appwrite.mjs');
  process.exit(1);
}

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('6a0ad52d001a8c4fd7f5')
  .setKey(API_KEY);

const db = new Databases(client);
const DB = 'lehrstellen';

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
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // ── Datenbank ─────────────────────────────────────────────────────────────
  console.log('📦 Datenbank: lehrstellen');
  await tryCreate('Datenbank', () => db.create(DB, 'Lehrstellen'));

  // ── Tabelle: apprenticeships ───────────────────────────────────────────────
  console.log('\n📋 Tabelle: apprenticeships (Lehrstellen)');
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
    ['status',               () => db.createEnumAttribute(DB, 'bewerbungen', 'status', ['ausstehend', 'angenommen', 'abgelehnt', 'zurueckgezogen'], false, 'ausstehend')],
  ];
  for (const [label, fn] of bewAttrs) await tryCreate(label, fn);

  console.log('  ⏳ Warte auf Attribute...');
  await sleep(3000);

  await tryCreate('Index: idx_applicant',    () => db.createIndex(DB, 'bewerbungen', 'idx_applicant', 'key', ['applicant_user_id']));
  await tryCreate('Index: idx_owner',        () => db.createIndex(DB, 'bewerbungen', 'idx_owner', 'key', ['posting_owner_id']));
  await tryCreate('Index: idx_apprenticeship', () => db.createIndex(DB, 'bewerbungen', 'idx_apprenticeship', 'key', ['apprenticeship_id']));

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Setup abgeschlossen!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

setup().catch((e) => {
  console.error('❌ Unerwarteter Fehler:', e?.message ?? e);
  process.exit(1);
});
