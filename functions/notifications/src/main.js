import { Client, Users, Databases, Query } from 'node-appwrite';
import nodemailer from 'nodemailer';

/**
 * Talentleihe Berlin – Benachrichtigungs-Mails
 *
 * Drei Auslöser in einer Funktion:
 *
 *  • HTTP (vom eingeloggten Client), Body { action, bewerbungId }:
 *      - "neue_bewerbung"        → Mail an den Anzeigen-Inhaber (Bewerber löst aus)
 *      - "bewerbung_angenommen"  → Mail an den Bewerber (Inhaber löst aus)
 *
 *  • Schedule (Cron):
 *      - Bewertungs-Erinnerung an angenommene, abgeschlossene, noch nicht
 *        bewertete Einsätze (einmalig pro Bewerbung).
 *
 * API-Zugriff über den dynamischen Funktions-Key (Header x-appwrite-key),
 * Scopes: users.read, documents.read, documents.write.
 *
 * Benötigte Variablen (wie bei account-deletion):
 *   APP_URL, SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM
 */

const DB = 'lehrstellen';
const COL_BEWERBUNGEN = 'bewerbungen';
const COL_APPRENTICESHIPS = 'apprenticeships';
const COL_BEWERTUNGEN = 'bewertungen';

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');

  const users = new Users(client);
  const databases = new Databases(client);
  const trigger = req.headers['x-appwrite-trigger'];

  try {
    // ── Cron: Bewertungs-Erinnerungen ──────────────────────────────────────
    if (trigger === 'schedule') {
      const count = await sendeBewertungsErinnerungen(databases, users, log, error);
      log(`Bewertungs-Erinnerungen verschickt: ${count}`);
      return res.json({ ok: true, erinnerungen: count });
    }

    // ── HTTP-Aktion vom Client ─────────────────────────────────────────────
    let body = {};
    try {
      body = req.bodyJson ?? JSON.parse(req.bodyRaw || req.body || '{}');
    } catch {
      body = {};
    }
    const action = body.action;
    const callerId = req.headers['x-appwrite-user-id'];
    if (!callerId) return res.json({ ok: false, error: 'Nicht eingeloggt.' }, 401);
    if (!body.bewerbungId) return res.json({ ok: false, error: 'bewerbungId fehlt.' }, 400);

    let bewerbung;
    try {
      bewerbung = await databases.getDocument(DB, COL_BEWERBUNGEN, body.bewerbungId);
    } catch {
      return res.json({ ok: false, error: 'Bewerbung nicht gefunden.' }, 404);
    }

    if (action === 'neue_bewerbung') {
      // Nur der/die Bewerber:in selbst darf diese Mail auslösen.
      if (bewerbung.applicant_user_id !== callerId) {
        return res.json({ ok: false, error: 'Nicht berechtigt.' }, 403);
      }
      const owner = await users.get(bewerbung.posting_owner_id);
      await sendMail(owner.email, mailNeueBewerbung(bewerbung), log);
      return res.json({ ok: true });
    }

    if (action === 'bewerbung_angenommen') {
      // Nur der/die Anzeigen-Inhaber:in darf diese Mail auslösen.
      if (bewerbung.posting_owner_id !== callerId) {
        return res.json({ ok: false, error: 'Nicht berechtigt.' }, 403);
      }
      const applicant = await users.get(bewerbung.applicant_user_id);
      await sendMail(applicant.email, mailAngenommen(bewerbung), log);
      return res.json({ ok: true });
    }

    return res.json({ ok: false, error: 'Unbekannte Aktion.' }, 400);
  } catch (e) {
    error(`notifications-Fehler: ${e.message}`);
    return res.json({ ok: false, error: e.message }, 500);
  }
};

/* ─────────────────────────── Cron-Logik ─────────────────────────── */

async function sendeBewertungsErinnerungen(databases, users, log, error) {
  const now = Date.now();
  let sent = 0;
  let cursor = null;

  for (;;) {
    const queries = [Query.equal('status', 'angenommen'), Query.limit(50)];
    if (cursor) queries.push(Query.cursorAfter(cursor));

    let page;
    try {
      page = await databases.listDocuments(DB, COL_BEWERBUNGEN, queries);
    } catch (e) {
      error(`list bewerbungen fehlgeschlagen: ${e.message}`);
      return sent;
    }
    if (page.documents.length === 0) break;

    for (const b of page.documents) {
      cursor = b.$id;
      if (b.erinnerung_gesendet === true) continue;

      // Einsatz-Daten holen → ist der Einsatz schon „fällig" zum Bewerten?
      let anzeige;
      try {
        anzeige = await databases.getDocument(DB, COL_APPRENTICESHIPS, b.apprenticeship_id);
      } catch {
        continue; // Anzeige gelöscht → überspringen
      }
      const faellig = anzeige.enddatum
        ? new Date(anzeige.enddatum).getTime() < now
        : new Date(anzeige.startdatum).getTime() < now;
      if (!faellig) continue;

      // Wer hat bereits bewertet?
      let raterIds = new Set();
      try {
        const bew = await databases.listDocuments(DB, COL_BEWERTUNGEN, [
          Query.equal('bewerbung_id', b.$id),
          Query.limit(10),
        ]);
        raterIds = new Set(bew.documents.map((x) => x.rater_user_id));
      } catch {
        /* Collection evtl. leer */
      }

      const titel = b.apprenticeship_titel || 'deinen Einsatz';
      // Bewerber:in erinnern (bewertet den Betrieb)
      if (b.applicant_user_id && !raterIds.has(b.applicant_user_id)) {
        try {
          const u = await users.get(b.applicant_user_id);
          await sendMail(u.email, mailErinnerung(titel, appUrl('meine-bewerbungen')), log);
        } catch (e) { error(`Erinnerung an Bewerber fehlgeschlagen: ${e.message}`); }
      }
      // Inhaber:in erinnern (bewertet das Talent)
      if (b.posting_owner_id && !raterIds.has(b.posting_owner_id)) {
        try {
          const u = await users.get(b.posting_owner_id);
          await sendMail(u.email, mailErinnerung(titel, appUrl(`meine-anzeigen/${b.apprenticeship_id}/bewerbungen`)), log);
        } catch (e) { error(`Erinnerung an Inhaber fehlgeschlagen: ${e.message}`); }
      }

      // Einmalig: Flag setzen, damit nicht erneut erinnert wird.
      try {
        await databases.updateDocument(DB, COL_BEWERBUNGEN, b.$id, { erinnerung_gesendet: true });
      } catch (e) {
        error(`Flag erinnerung_gesendet konnte nicht gesetzt werden (${b.$id}): ${e.message}`);
      }
      sent++;
    }

    if (page.documents.length < 50) break;
  }
  return sent;
}

/* ─────────────────────────── Mail-Inhalte ─────────────────────────── */

function mailNeueBewerbung(b) {
  const titel = b.apprenticeship_titel || 'deine Anzeige';
  const name = b.applicant_name || 'Jemand';
  return {
    subject: 'Neue Bewerbung auf deine Anzeige – Talentleihe Berlin',
    ...renderMail({
      heading: 'Neue Bewerbung erhalten',
      bodyHtml: `<strong>${escapeHtml(name)}</strong> hat sich auf <strong>${escapeHtml(titel)}</strong> beworben. Schau dir die Bewerbung an und nimm sie an oder lehne sie ab.`,
      bodyText: `${name} hat sich auf ${titel} beworben.`,
      buttonLabel: 'Bewerbung ansehen',
      buttonUrl: appUrl(`meine-anzeigen/${b.apprenticeship_id}/bewerbungen`),
    }),
  };
}

function mailAngenommen(b) {
  const titel = b.apprenticeship_titel || 'die Anzeige';
  return {
    subject: 'Deine Bewerbung wurde angenommen – Talentleihe Berlin',
    ...renderMail({
      heading: 'Glückwunsch – angenommen!',
      bodyHtml: `Deine Bewerbung auf <strong>${escapeHtml(titel)}</strong> wurde <strong>angenommen</strong>. Nimm Kontakt auf und plant die nächsten Schritte.`,
      bodyText: `Deine Bewerbung auf ${titel} wurde angenommen.`,
      buttonLabel: 'Zu meinen Bewerbungen',
      buttonUrl: appUrl('meine-bewerbungen'),
    }),
  };
}

function mailErinnerung(titel, url) {
  return {
    subject: 'Bewerte deinen Einsatz – Talentleihe Berlin',
    ...renderMail({
      heading: 'Wie war dein Einsatz?',
      bodyHtml: `Dein Einsatz <strong>${escapeHtml(titel)}</strong> ist abgeschlossen. Mit einer kurzen Bewertung hilfst du anderen in der Talentleihe – es dauert nur eine Minute.`,
      bodyText: `Dein Einsatz ${titel} ist abgeschlossen. Bitte gib eine kurze Bewertung ab.`,
      buttonLabel: 'Jetzt bewerten',
      buttonUrl: url,
    }),
  };
}

/* ─────────────────────────── Mail-Versand ─────────────────────────── */

function appUrl(path) {
  const base = (process.env.APP_URL || '').replace(/\/+$/, '');
  return `${base}/${path.replace(/^\/+/, '')}`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/** Einheitlicher Mail-Rahmen im Markenstil (wie bei der Löschmail). */
function renderMail({ heading, bodyHtml, bodyText, buttonLabel, buttonUrl }) {
  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #1E367A;">
    <h2 style="color: #1E367A; font-size: 20px; margin: 0 0 12px;">${heading}</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #4a6080;">${bodyHtml}</p>
    <p style="text-align: center; margin: 28px 0;">
      <a href="${buttonUrl}" style="background: #47BCC2; color: #ffffff; text-decoration: none;
        padding: 13px 26px; border-radius: 12px; font-weight: 700; font-size: 15px; display: inline-block;">
        ${buttonLabel}
      </a>
    </p>
    <p style="font-size: 12px; color: #8096b8; line-height: 1.5;">
      Diese E-Mail wurde automatisch von Talentleihe Berlin versendet.
    </p>
  </div>`;
  const text = `${bodyText}\n\n${buttonLabel}: ${buttonUrl}`;
  return { html, text };
}

async function sendMail(to, { subject, html, text }, log) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass) {
    throw new Error('SMTP-Variablen (SMTP_HOST/SMTP_USER/SMTP_PASS) fehlen.');
  }
  if (!to) {
    throw new Error('Keine Empfänger-Adresse.');
  }

  const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  await transporter.sendMail({ from, to, subject, html, text });
  log(`Mail „${subject}" an ${to} gesendet.`);
}
