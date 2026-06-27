import { Client, Databases, Query } from 'node-appwrite';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';

const DB  = 'lehrstellen';
const COL = 'profiles';

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.AW_API_KEY);

  const db = new Databases(client);

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.json({ error: 'Ungültige Anfrage' }, 400);
  }

  const { action, userId, token } = body || {};
  log(`ausbi-freigabe: action=${action} userId=${userId}`);

  // ── Freigabe anfordern ────────────────────────────────────────────────────
  if (action === 'request') {
    if (!userId) return res.json({ error: 'userId fehlt' }, 400);

    const docs = await db.listDocuments(DB, COL, [Query.equal('user_id', userId)]);
    if (!docs.documents.length) return res.json({ error: 'Profil nicht gefunden' }, 404);
    const profile = docs.documents[0];

    if (!profile.ausbildungsbeauftragter_email) {
      return res.json({ error: 'Keine Ausbildungsbeauftragter-E-Mail hinterlegt' }, 400);
    }

    const newToken = crypto.randomBytes(32).toString('hex');
    await db.updateDocument(DB, COL, profile.$id, { approval_token: newToken });

    const appUrl = (process.env.APP_URL || 'https://verbundpraxis.de').replace(/\/$/, '');
    const approveUrl = `${appUrl}/ausbi-freigabe?userId=${userId}&token=${newToken}`;
    const azubiName = [profile.vorname, profile.name].filter(Boolean).join(' ') || 'ein/e Azubi';

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    try {
      await transporter.sendMail({
        from: `VerbundPraxis <${process.env.GMAIL_USER}>`,
        to: profile.ausbildungsbeauftragter_email,
        subject: `Konto-Freigabe für ${azubiName} – VerbundPraxis`,
        html: `<!DOCTYPE html>
<html lang="de">
<body style="font-family:Arial,sans-serif;color:#222;max-width:600px;margin:0 auto;padding:24px">
  <h2 style="color:#1E367A">VerbundPraxis – Konto-Freigabe erforderlich</h2>
  <p>Guten Tag,</p>
  <p><strong>${azubiName}</strong> hat sich auf der <strong>VerbundPraxis-Plattform der Handwerkskammer Berlin</strong> registriert und gibt Sie als Ausbildungsbeauftragte/n an.</p>
  <p>Bitte klicken Sie auf den folgenden Link, um das Konto freizugeben:</p>
  <p style="margin:32px 0">
    <a href="${approveUrl}" style="background:#47BCC2;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
      Konto jetzt freigeben ↗
    </a>
  </p>
  <p style="color:#666;font-size:0.9em">Falls Sie diese Anfrage nicht kennen, ignorieren Sie diese E-Mail einfach.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="color:#999;font-size:0.8em">VerbundPraxis · Handwerkskammer Berlin</p>
</body>
</html>`,
      });
    } catch (mailErr) {
      error('Gmail Fehler: ' + mailErr.message);
      return res.json({ error: 'E-Mail konnte nicht gesendet werden', detail: mailErr.message }, 500);
    }

    log(`Freigabe-E-Mail an ${profile.ausbildungsbeauftragter_email} gesendet`);
    return res.json({ success: true });
  }

  // ── Freigabe bestätigen ───────────────────────────────────────────────────
  if (action === 'approve') {
    if (!userId || !token) return res.json({ error: 'userId oder token fehlt' }, 400);

    const docs = await db.listDocuments(DB, COL, [Query.equal('user_id', userId)]);
    if (!docs.documents.length) return res.json({ error: 'Profil nicht gefunden' }, 404);
    const profile = docs.documents[0];

    if (profile.approved === true) {
      return res.json({ success: true, alreadyApproved: true, name: profile.vorname || profile.name });
    }

    if (profile.approval_token !== token) {
      return res.json({ error: 'Ungültiger oder abgelaufener Link' }, 400);
    }

    await db.updateDocument(DB, COL, profile.$id, {
      approved: true,
      approval_token: null,
    });

    log(`Konto von ${profile.vorname || profile.name} (userId=${userId}) freigegeben`);
    return res.json({ success: true, name: profile.vorname || profile.name });
  }

  return res.json({ error: 'Unbekannte Aktion' }, 400);
};
