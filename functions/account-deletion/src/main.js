import { Client, Users, Databases, Storage, Query } from 'node-appwrite';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';

/**
 * Talentleihe Berlin – Konto-Löschfunktion
 *
 * action: "request"  → Token erzeugen + Bestätigungsmail senden
 * action: "confirm"  → Token prüfen + alle Nutzerdaten löschen
 *
 * Was gelöscht wird:
 *   ✓ Profil (profiles)
 *   ✓ Einsätze & Talent-Angebote (apprenticeships, owner_id)
 *   ✓ Ausstehende Bewerbungen (bewerbungen, status = "ausstehend")
 *   ✓ Dokumente & Storage-Dateien (dokumente, dokumente-bucket)
 *   ✓ Auth-User
 *
 * Was erhalten bleibt:
 *   ✗ Bewertungen  →  bleiben für andere Nutzer sichtbar
 *   ✗ Angenommene/Abgelehnte Bewerbungen  →  bleiben als Nachweis
 *
 * Benötigte Funktions-Scopes in Appwrite Console:
 *   users.read, users.write, documents.read, documents.write,
 *   files.read, files.write
 *
 * Benötigte Ausführungs-Berechtigung: "Any" (damit Link aus Mail funktioniert)
 *
 * Funktions-Variablen:
 *   APP_URL, SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM
 */

const DB = 'lehrstellen';
const COL_PROFILES      = 'profiles';
const COL_APPRENTICESHIPS = 'apprenticeships';
const COL_BEWERBUNGEN   = 'bewerbungen';
const COL_DOKUMENTE     = 'dokumente';
const BUCKET_DOKUMENTE  = 'dokumente';

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 Stunde
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');

  const users     = new Users(client);
  const databases = new Databases(client);
  const storage   = new Storage(client);

  // Body robust parsen
  let body = {};
  try { body = req.bodyJson ?? JSON.parse(req.bodyRaw || req.body || '{}'); }
  catch { body = {}; }

  const action = body.action;
  log(`[account-deletion] action=${action}`);

  // ── 1) Löschung anfordern ────────────────────────────────────────────────
  if (action === 'request') {
    const userId = req.headers['x-appwrite-user-id'];
    if (!userId) return res.json({ ok: false, error: 'Nicht eingeloggt.' }, 401);

    let user;
    try { user = await users.get(userId); }
    catch (e) {
      error(`users.get(${userId}) fehlgeschlagen: ${e.message}`);
      return res.json({ ok: false, error: 'Konto nicht gefunden.' }, 404);
    }

    const secret  = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + TOKEN_TTL_MS;

    try {
      await users.updatePrefs(userId, {
        ...(user.prefs || {}),
        del_hash: sha256(secret),
        del_exp:  String(expires),
      });
    } catch (e) {
      error(`updatePrefs fehlgeschlagen: ${e.message}`);
      return res.json({ ok: false, error: 'Token konnte nicht gespeichert werden.' }, 500);
    }

    const appUrl = (process.env.APP_URL || '').replace(/\/+$/, '');
    const link   = `${appUrl}/konto-loeschen?userId=${encodeURIComponent(userId)}&secret=${encodeURIComponent(secret)}`;

    try { await sendDeletionMail(user.email, link, log); }
    catch (e) {
      error(`Mailversand fehlgeschlagen: ${e.message}`);
      return res.json({ ok: false, error: 'Bestätigungsmail konnte nicht gesendet werden.' }, 502);
    }

    log(`Löschanfrage für ${userId} – Mail an ${user.email} gesendet.`);
    return res.json({ ok: true });
  }

  // ── 2) Löschung bestätigen ───────────────────────────────────────────────
  if (action === 'confirm') {
    const userId = body.userId;
    const secret = body.secret;

    if (!userId || !secret) return res.json({ ok: false, error: 'Fehlende Parameter (userId / secret).' }, 400);

    log(`Bestätige Löschung für userId=${userId}`);

    // User + Prefs laden
    let user;
    try { user = await users.get(userId); }
    catch (e) {
      error(`users.get(${userId}) fehlgeschlagen: ${e.message}`);
      return res.json({ ok: false, error: 'Konto nicht gefunden (evtl. bereits gelöscht).' }, 404);
    }

    const prefs = user.prefs || {};

    if (!prefs.del_hash || !prefs.del_exp) {
      return res.json({ ok: false, error: 'Keine offene Löschanfrage gefunden. Bitte erneut anfordern.' }, 400);
    }
    if (Date.now() > Number(prefs.del_exp)) {
      return res.json({ ok: false, error: 'Bestätigungslink abgelaufen. Bitte erneut anfordern.' }, 410);
    }

    // Token prüfen (timing-safe)
    const a = Buffer.from(sha256(secret));
    const b = Buffer.from(String(prefs.del_hash));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.json({ ok: false, error: 'Ungültiger Bestätigungslink.' }, 403);
    }

    // ── Daten löschen ────────────────────────────────────────────────────
    log('Lösche Profil …');
    await deleteAll(databases, COL_PROFILES, 'user_id', userId, log, error);

    log('Lösche Einsätze / Talent-Angebote …');
    await deleteAll(databases, COL_APPRENTICESHIPS, 'owner_id', userId, log, error);

    log('Lösche ausstehende Bewerbungen (als Bewerber) …');
    await deleteAusstehend(databases, 'applicant_user_id', userId, log, error);

    log('Lösche ausstehende Bewerbungen (auf eigene Anzeigen) …');
    await deleteAusstehend(databases, 'posting_owner_id', userId, log, error);

    log('Lösche Dokumente + Storage-Dateien …');
    await deleteDokumente(databases, storage, userId, log, error);

    // Zuletzt den Auth-User löschen (invalidiert alle Sessions)
    log('Lösche Auth-User …');
    try {
      await users.delete(userId);
    } catch (e) {
      error(`users.delete(${userId}) fehlgeschlagen: ${e.message}`);
      return res.json({
        ok: false,
        error: `Auth-User konnte nicht gelöscht werden: ${e.message}. Bitte wende dich an den Support.`,
      }, 500);
    }

    log(`✅ Konto ${userId} vollständig gelöscht.`);
    return res.json({ ok: true });
  }

  return res.json({ ok: false, error: `Unbekannte Aktion: ${action}` }, 400);
};

// ── Hilfsfunktionen ──────────────────────────────────────────────────────────

/** Löscht alle Dokumente einer Collection, bei denen attr === value. */
async function deleteAll(databases, collection, attr, value, log, error) {
  let total = 0;
  for (;;) {
    let page;
    try {
      page = await databases.listDocuments(DB, collection, [
        Query.equal(attr, value),
        Query.limit(100),
      ]);
    } catch (e) {
      error(`listDocuments ${collection}[${attr}=${value}] fehlgeschlagen: ${e.message}`);
      return;
    }
    if (page.documents.length === 0) break;
    for (const doc of page.documents) {
      try {
        await databases.deleteDocument(DB, collection, doc.$id);
        total++;
      } catch (e) {
        error(`deleteDocument ${collection}/${doc.$id} fehlgeschlagen: ${e.message}`);
      }
    }
    if (page.documents.length < 100) break;
  }
  log(`  → ${total} Dokument(e) aus ${collection} gelöscht.`);
}

/** Löscht nur ausstehende Bewerbungen, bei denen attr === value. */
async function deleteAusstehend(databases, attr, value, log, error) {
  let total = 0;
  for (;;) {
    let page;
    try {
      page = await databases.listDocuments(DB, COL_BEWERBUNGEN, [
        Query.equal(attr, value),
        Query.equal('status', 'ausstehend'),
        Query.limit(100),
      ]);
    } catch (e) {
      error(`listDocuments bewerbungen ausstehend [${attr}=${value}] fehlgeschlagen: ${e.message}`);
      return;
    }
    if (page.documents.length === 0) break;
    for (const doc of page.documents) {
      try {
        await databases.deleteDocument(DB, COL_BEWERBUNGEN, doc.$id);
        total++;
      } catch (e) {
        error(`deleteDocument bewerbungen/${doc.$id} fehlgeschlagen: ${e.message}`);
      }
    }
    if (page.documents.length < 100) break;
  }
  log(`  → ${total} ausstehende Bewerbung(en) gelöscht.`);
}

/** Löscht Dokument-Einträge + zugehörige Storage-Dateien des Nutzers. */
async function deleteDokumente(databases, storage, userId, log, error) {
  let total = 0;
  for (;;) {
    let page;
    try {
      page = await databases.listDocuments(DB, COL_DOKUMENTE, [
        Query.equal('user_id', userId),
        Query.limit(100),
      ]);
    } catch (e) {
      error(`listDocuments dokumente fehlgeschlagen: ${e.message}`);
      return;
    }
    if (page.documents.length === 0) break;
    for (const doc of page.documents) {
      if (doc.file_id) {
        try { await storage.deleteFile(BUCKET_DOKUMENTE, doc.file_id); }
        catch (e) { error(`deleteFile ${doc.file_id} fehlgeschlagen: ${e.message}`); }
      }
      try {
        await databases.deleteDocument(DB, COL_DOKUMENTE, doc.$id);
        total++;
      } catch (e) {
        error(`deleteDocument dokumente/${doc.$id} fehlgeschlagen: ${e.message}`);
      }
    }
    if (page.documents.length < 100) break;
  }
  log(`  → ${total} Dokument(e) gelöscht.`);
}

/** Bestätigungsmail via SMTP. */
async function sendDeletionMail(to, link, log) {
  const host   = process.env.SMTP_HOST;
  const port   = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
  const user   = process.env.SMTP_USER;
  const pass   = process.env.SMTP_PASS;
  const from   = process.env.SMTP_FROM || user;

  if (!host || !user || !pass) throw new Error('SMTP-Variablen fehlen (SMTP_HOST/SMTP_USER/SMTP_PASS).');

  const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });

  const subject = 'Kontolöschung bestätigen – Talentleihe Berlin';
  const text =
    'Du hast die Löschung deines Talentleihe-Berlin-Kontos angefordert.\n\n' +
    'Bestätige die endgültige Löschung über diesen Link (1 Stunde gültig):\n' + link +
    '\n\nWenn du das nicht warst, ignoriere diese E-Mail.';

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#1E367A">
    <h2 style="font-size:20px;margin:0 0 12px">Kontolöschung bestätigen</h2>
    <p style="font-size:15px;line-height:1.6;color:#4a6080">
      Du hast die Löschung deines <strong>Talentleihe-Berlin</strong>-Kontos angefordert.
      Mit Klick auf den Button werden dein Konto und alle zugehörigen Daten
      (Profil, Anzeigen, Bewerbungen, Dokumente) <strong>endgültig gelöscht</strong>.
    </p>
    <p style="text-align:center;margin:28px 0">
      <a href="${link}" style="background:#e05060;color:#fff;text-decoration:none;
        padding:13px 26px;border-radius:12px;font-weight:700;font-size:15px;display:inline-block">
        Konto endgültig löschen
      </a>
    </p>
    <p style="font-size:13px;color:#8096b8;line-height:1.5">
      Der Link ist 1 Stunde gültig. Wenn du das nicht warst, ignoriere diese E-Mail.
    </p>
  </div>`;

  await transporter.sendMail({ from, to, subject, text, html });
  log(`Löschmail an ${to} gesendet.`);
}
