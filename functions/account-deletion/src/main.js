import { Client, Users, Databases, Storage, Query } from 'node-appwrite';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';

/**
 * Talentleihe Berlin – Konto-Löschfunktion
 *
 * Zwei Aktionen (per JSON-Body { "action": ... }):
 *
 *   action: "request"
 *     - Wird vom eingeloggten Nutzer aufgerufen (User-Session → der Header
 *       x-appwrite-user-id ist gesetzt).
 *     - Erzeugt einen einmaligen Lösch-Token, speichert dessen Hash + Ablauf
 *       in den User-Prefs und verschickt eine Bestätigungsmail mit Link.
 *
 *   action: "confirm" (body: { userId, secret })
 *     - Wird über den Link aus der Mail aufgerufen (ohne Session).
 *     - Prüft den Token und löscht danach ALLE Daten des Nutzers
 *       (Profil, Anzeigen, Bewerbungen, Bewertungen, Dokumente + Storage-
 *       Dateien) und zuletzt den Auth-User selbst.
 *
 * Der API-Zugriff läuft über den dynamischen Funktions-Key
 * (Header x-appwrite-key) – es muss KEIN statischer API-Key hinterlegt werden,
 * solange die Funktion die nötigen Scopes besitzt (users.*, documents.*,
 * files.*).
 *
 * Benötigte Funktions-Variablen (Appwrite-Konsole → Function → Settings):
 *   APP_URL     z. B. https://<deine-site-domain>   (Basis für den Link)
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM
 */

const DB = 'lehrstellen';
const COL_PROFILES = 'profiles';
const COL_APPRENTICESHIPS = 'apprenticeships';
const COL_BEWERBUNGEN = 'bewerbungen';
const COL_BEWERTUNGEN = 'bewertungen';
const COL_DOKUMENTE = 'dokumente';
const BUCKET_DOKUMENTE = 'dokumente';

const TOKEN_TTL_MS = 60 * 60 * 1000; // Link 1 Stunde gültig

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');

  const users = new Users(client);
  const databases = new Databases(client);
  const storage = new Storage(client);

  // Body robust parsen (open-runtimes liefert je nach Version bodyJson/bodyRaw)
  let body = {};
  try {
    body = req.bodyJson ?? JSON.parse(req.bodyRaw || req.body || '{}');
  } catch {
    body = {};
  }
  const action = body.action;

  // ─────────────────────────────────────────────────────────────────────────
  // 0) Event-Trigger: users.*.delete → Nutzer wurde extern gelöscht
  //    Appwrite liefert die User-Daten im Body wenn ein Event feuert.
  // ─────────────────────────────────────────────────────────────────────────
  const eventHeader = req.headers['x-appwrite-event'] ?? '';
  if (eventHeader.startsWith('users.') && eventHeader.endsWith('.delete')) {
    const userId = body.$id ?? body.userId;
    if (!userId) {
      error('Event ohne userId empfangen.');
      return res.json({ ok: false, error: 'Keine userId im Event.' }, 400);
    }
    log(`Event-Trigger: Lösche Daten für gelöschten User ${userId}`);
    await deleteByQuery(databases, COL_PROFILES, 'user_id', userId, error);
    await deleteByQuery(databases, COL_APPRENTICESHIPS, 'owner_id', userId, error);
    await deleteByQuery(databases, COL_BEWERBUNGEN, 'applicant_user_id', userId, error);
    await deleteByQuery(databases, COL_BEWERBUNGEN, 'posting_owner_id', userId, error);
    await deleteByQuery(databases, COL_BEWERTUNGEN, 'rater_user_id', userId, error);
    await deleteByQuery(databases, COL_BEWERTUNGEN, 'rated_user_id', userId, error);
    await deleteDokumente(databases, storage, userId, error);
    log(`Event-Cleanup für ${userId} abgeschlossen.`);
    return res.json({ ok: true });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 1) Löschung anfordern → Token erzeugen + Mail verschicken
  // ─────────────────────────────────────────────────────────────────────────
  if (action === 'request') {
    const userId = req.headers['x-appwrite-user-id'];
    if (!userId) {
      return res.json({ ok: false, error: 'Nicht eingeloggt.' }, 401);
    }

    let user;
    try {
      user = await users.get(userId);
    } catch (e) {
      error(`users.get fehlgeschlagen: ${e.message}`);
      return res.json({ ok: false, error: 'Konto nicht gefunden.' }, 404);
    }

    const secret = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + TOKEN_TTL_MS;

    try {
      // Bestehende Prefs erhalten, nur Token-Felder ergänzen
      await users.updatePrefs(userId, {
        ...(user.prefs || {}),
        del_hash: sha256(secret),
        del_exp: String(expires),
      });
    } catch (e) {
      error(`updatePrefs fehlgeschlagen: ${e.message}`);
      return res.json({ ok: false, error: 'Token konnte nicht gespeichert werden.' }, 500);
    }

    const appUrl = (process.env.APP_URL || '').replace(/\/+$/, '');
    const link = `${appUrl}/konto-loeschen?userId=${encodeURIComponent(userId)}&secret=${encodeURIComponent(secret)}`;

    try {
      await sendDeletionMail(user.email, link, log);
    } catch (e) {
      error(`Mailversand fehlgeschlagen: ${e.message}`);
      return res.json({ ok: false, error: 'Bestätigungsmail konnte nicht gesendet werden.' }, 502);
    }

    log(`Löschanfrage für ${userId} – Mail an ${user.email} gesendet.`);
    return res.json({ ok: true });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2) Löschung bestätigen → Token prüfen + alles löschen
  // ─────────────────────────────────────────────────────────────────────────
  if (action === 'confirm') {
    const userId = body.userId;
    const secret = body.secret;
    if (!userId || !secret) {
      return res.json({ ok: false, error: 'Fehlende Parameter.' }, 400);
    }

    let user;
    try {
      user = await users.get(userId);
    } catch {
      return res.json({ ok: false, error: 'Konto nicht gefunden (evtl. bereits gelöscht).' }, 404);
    }

    const prefs = user.prefs || {};
    if (!prefs.del_hash || !prefs.del_exp) {
      return res.json({ ok: false, error: 'Es liegt keine offene Löschanfrage vor.' }, 400);
    }
    if (Date.now() > Number(prefs.del_exp)) {
      return res.json({ ok: false, error: 'Der Bestätigungslink ist abgelaufen. Bitte erneut anfordern.' }, 410);
    }
    // Konstanter Zeitvergleich gegen Timing-Angriffe
    const a = Buffer.from(sha256(secret));
    const b = Buffer.from(String(prefs.del_hash));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.json({ ok: false, error: 'Ungültiger Bestätigungslink.' }, 403);
    }

    // ---- Alle zugehörigen Daten löschen ----
    await deleteByQuery(databases, COL_PROFILES, 'user_id', userId, error);
    await deleteByQuery(databases, COL_APPRENTICESHIPS, 'owner_id', userId, error);
    await deleteByQuery(databases, COL_BEWERBUNGEN, 'applicant_user_id', userId, error);
    await deleteByQuery(databases, COL_BEWERBUNGEN, 'posting_owner_id', userId, error);
    await deleteByQuery(databases, COL_BEWERTUNGEN, 'rater_user_id', userId, error);
    await deleteByQuery(databases, COL_BEWERTUNGEN, 'rated_user_id', userId, error);
    await deleteDokumente(databases, storage, userId, error);

    // Zuletzt den Auth-User selbst (invalidiert alle Sessions)
    try {
      await users.delete(userId);
    } catch (e) {
      error(`users.delete fehlgeschlagen: ${e.message}`);
      return res.json({ ok: false, error: 'Konto-Datensatz konnte nicht gelöscht werden.' }, 500);
    }

    log(`Konto ${userId} und alle zugehörigen Daten gelöscht.`);
    return res.json({ ok: true });
  }

  return res.json({ ok: false, error: 'Unbekannte Aktion.' }, 400);
};

/**
 * Löscht seitenweise alle Dokumente einer Collection, bei denen attr === value.
 */
async function deleteByQuery(databases, collection, attr, value, error) {
  for (;;) {
    let page;
    try {
      page = await databases.listDocuments(DB, collection, [
        Query.equal(attr, value),
        Query.limit(100),
      ]);
    } catch (e) {
      error(`list ${collection} (${attr}=${value}) fehlgeschlagen: ${e.message}`);
      return;
    }
    if (page.documents.length === 0) return;
    for (const doc of page.documents) {
      try {
        await databases.deleteDocument(DB, collection, doc.$id);
      } catch (e) {
        error(`delete ${collection}/${doc.$id} fehlgeschlagen: ${e.message}`);
      }
    }
    if (page.documents.length < 100) return;
  }
}

/**
 * Löscht die Dokument-Einträge des Nutzers samt zugehöriger Storage-Dateien.
 */
async function deleteDokumente(databases, storage, userId, error) {
  for (;;) {
    let page;
    try {
      page = await databases.listDocuments(DB, COL_DOKUMENTE, [
        Query.equal('user_id', userId),
        Query.limit(100),
      ]);
    } catch (e) {
      error(`list dokumente fehlgeschlagen: ${e.message}`);
      return;
    }
    if (page.documents.length === 0) return;
    for (const doc of page.documents) {
      if (doc.file_id) {
        try {
          await storage.deleteFile(BUCKET_DOKUMENTE, doc.file_id);
        } catch (e) {
          error(`deleteFile ${doc.file_id} fehlgeschlagen: ${e.message}`);
        }
      }
      try {
        await databases.deleteDocument(DB, COL_DOKUMENTE, doc.$id);
      } catch (e) {
        error(`delete dokumente/${doc.$id} fehlgeschlagen: ${e.message}`);
      }
    }
    if (page.documents.length < 100) return;
  }
}

/**
 * Verschickt die Bestätigungsmail über SMTP (nodemailer).
 */
async function sendDeletionMail(to, link, log) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass) {
    throw new Error('SMTP-Variablen (SMTP_HOST/SMTP_USER/SMTP_PASS) fehlen.');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  const subject = 'Kontolöschung bestätigen – Talentleihe Berlin';
  const text =
    'Du hast die Löschung deines Talentleihe-Berlin-Kontos angefordert.\n\n' +
    'Bestätige die endgültige Löschung über diesen Link (1 Stunde gültig):\n' +
    link +
    '\n\nWenn du das nicht warst, ignoriere diese E-Mail – es passiert nichts.';

  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #1E367A;">
    <h2 style="color: #1E367A; font-size: 20px; margin: 0 0 12px;">Kontolöschung bestätigen</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #4a6080;">
      Du hast die Löschung deines <strong>Talentleihe-Berlin</strong>-Kontos angefordert.
      Mit Klick auf den Button werden dein Konto und <strong>alle zugehörigen Daten</strong>
      (Profil, Anzeigen, Bewerbungen, Bewertungen und Dokumente) <strong>endgültig gelöscht</strong>.
      Das lässt sich nicht rückgängig machen.
    </p>
    <p style="text-align: center; margin: 28px 0;">
      <a href="${link}" style="background: #e05060; color: #ffffff; text-decoration: none;
        padding: 13px 26px; border-radius: 12px; font-weight: 700; font-size: 15px; display: inline-block;">
        Konto endgültig löschen
      </a>
    </p>
    <p style="font-size: 13px; color: #8096b8; line-height: 1.5;">
      Der Link ist 1 Stunde gültig. Wenn du das nicht warst, ignoriere diese E-Mail –
      dann passiert nichts.
    </p>
  </div>`;

  await transporter.sendMail({ from, to, subject, text, html });
  log(`Löschmail an ${to} gesendet.`);
}
