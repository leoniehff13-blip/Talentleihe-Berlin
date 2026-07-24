import { Client, Databases, Query } from 'node-appwrite';
import crypto from 'node:crypto';

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
    const approveUrl = appUrl + '/ausbi-freigabe?userId=' + userId + '&token=' + newToken;
    const azubiName = [profile.vorname, profile.name].filter(Boolean).join(' ') || 'ein/e Azubi';

    const html = '<!DOCTYPE html><html lang="de"><body style="font-family:Arial,sans-serif;color:#222;max-width:600px;margin:0 auto;padding:24px">'
      + '<h2 style="color:#1E367A">VerbundPraxis &#x2013; Konto-Freigabe erforderlich</h2>'
      + '<p>Guten Tag,</p>'
      + '<p><strong>' + azubiName + '</strong> hat sich auf der <strong>VerbundPraxis-Plattform der Handwerkskammer Berlin</strong> registriert und gibt Sie als Ausbildungsbeauftragte/n an.</p>'
      + '<p>Bitte klicken Sie auf den folgenden Link, um das Konto freizugeben:</p>'
      + '<p style="margin:32px 0"><a href="' + approveUrl + '" style="background:#47BCC2;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">Konto jetzt freigeben</a></p>'
      + '<p style="color:#666;font-size:0.9em">Falls Sie diese Anfrage nicht kennen, ignorieren Sie diese E-Mail einfach.</p>'
      + '<hr style="border:none;border-top:1px solid #eee;margin:24px 0">'
      + '<p style="color:#999;font-size:0.8em">VerbundPraxis &middot; Handwerkskammer Berlin</p>'
      + '</body></html>';

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM || 'onboarding@resend.dev',
        to: [profile.ausbildungsbeauftragter_email],
        subject: 'Konto-Freigabe fuer ' + azubiName + ' - VerbundPraxis',
        html: html,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      error('Resend Fehler: ' + errText);
      return res.json({ error: 'E-Mail konnte nicht gesendet werden', detail: errText }, 500);
    }

    log('Freigabe-E-Mail an ' + profile.ausbildungsbeauftragter_email + ' gesendet');
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

    log('Konto von ' + (profile.vorname || profile.name) + ' (userId=' + userId + ') freigegeben');
    return res.json({ success: true, name: profile.vorname || profile.name });
  }


  // -- Bewerbung-Freigabe anfordern -----------------------------------------
  if (action === 'bewerbung_request') {
    if (!body.bewerbungId) return res.json({ error: 'bewerbungId fehlt' }, 400);
    let bew;
    try { bew = await db.getDocument(DB, 'bewerbungen', body.bewerbungId); }
    catch { return res.json({ error: 'Bewerbung nicht gefunden' }, 404); }
    const profRes = await db.listDocuments(DB, COL, [Query.equal('user_id', bew.applicant_user_id)]);
    if (!profRes.documents.length) return res.json({ error: 'Azubi-Profil nicht gefunden' }, 404);
    const profile = profRes.documents[0];
    if (!profile.ausbildungsbeauftragter_email)
      return res.json({ error: 'Keine Ausbildungsbeauftragte/r-E-Mail hinterlegt' }, 400);
    const freigabe_token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await db.updateDocument(DB, 'bewerbungen', body.bewerbungId, { freigabe_token, freigabe_token_expires: expires });
    const appUrl = (process.env.APP_URL || 'https://verbundpraxis.de').replace(/\/$/, '');
    const base = '/ausbi-bewerbung?id=' + body.bewerbungId + '&token=' + freigabe_token + '&act=';
    const azubiName = [profile.vorname, profile.name].filter(Boolean).join(' ') || 'ein/e Azubi';
    const einsatz = bew.apprenticeship_titel || 'einen Einsatz';
    const html = '<!DOCTYPE html><html lang="de"><body style="font-family:Arial,sans-serif;color:#222;max-width:600px;margin:0 auto;padding:24px">'
      + '<h2 style="color:#1E367A">VerbundPraxis \u2013 Bewerbung wartet auf Ihre Freigabe</h2>'
      + '<p>Guten Tag,</p>'
      + '<p><strong>' + azubiName + '</strong> hat sich auf <strong>' + einsatz + '</strong> beworben und wartet auf Ihre Freigabe.</p>'
      + (bew.nachricht ? '<p style="background:#f5f5f5;padding:12px;border-radius:6px;font-style:italic">\u201e' + bew.nachricht + '\u201c</p>' : '')
      + '<p>Bitte entscheiden Sie:</p>'
      + '<p style="margin:32px 0">'
      + '<a href="' + appUrl + base + 'approve" style="background:#47BCC2;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">&#10003; Freigeben</a>'
      + '&nbsp;&nbsp;&nbsp;'
      + '<a href="' + appUrl + base + 'reject" style="background:#fff;color:#cc3333;border:2px solid #cc3333;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">&#10007; Ablehnen</a>'
      + '</p>'
      + '<p style="color:#666;font-size:0.9em">Alternativ koennen Sie die Bewerbung in der App unter &bdquo;Einsaetze meiner Azubis&ldquo; bearbeiten.</p>'
      + '<hr style="border:none;border-top:1px solid #eee;margin:24px 0">'
      + '<p style="color:#999;font-size:0.8em">VerbundPraxis &middot; Verbundberatung Berlin</p>'
      + '</body></html>';
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.MAIL_FROM || 'onboarding@resend.dev',
        to: [profile.ausbildungsbeauftragter_email],
        subject: 'Bewerbung von ' + azubiName + ' wartet auf Freigabe - VerbundPraxis',
        html,
      }),
    });
    if (!emailRes.ok) {
      const t = await emailRes.text();
      error('Resend Fehler: ' + t);
      return res.json({ error: 'E-Mail konnte nicht gesendet werden', detail: t }, 500);
    }
    log('Bewerbungs-Freigabe-Mail an ' + profile.ausbildungsbeauftragter_email + ' gesendet');
    return res.json({ success: true });
  }

  // -- Bewerbung freigeben --------------------------------------------------
  if (action === 'bewerbung_approve') {
    const { bewerbungId, token } = body;
    if (!bewerbungId || !token) return res.json({ error: 'bewerbungId oder token fehlt' }, 400);
    let bew;
    try { bew = await db.getDocument(DB, 'bewerbungen', bewerbungId); }
    catch { return res.json({ error: 'Bewerbung nicht gefunden' }, 404); }
    if (bew.status !== 'ausstehend_freigabe') return res.json({ success: true, alreadyHandled: true });
    if (bew.freigabe_token !== token) return res.json({ error: 'Ungueltig oder abgelaufen' }, 400);
    await db.updateDocument(DB, 'bewerbungen', bewerbungId,
      { status: 'ausstehend', freigabe_token: null, freigabe_token_expires: null });
    log('Bewerbung ' + bewerbungId + ' freigegeben');
    return res.json({ success: true, applicant: bew.applicant_name });
  }

  // -- Bewerbung ablehnen ---------------------------------------------------
  if (action === 'bewerbung_reject') {
    const { bewerbungId, token } = body;
    if (!bewerbungId || !token) return res.json({ error: 'bewerbungId oder token fehlt' }, 400);
    let bew;
    try { bew = await db.getDocument(DB, 'bewerbungen', bewerbungId); }
    catch { return res.json({ error: 'Bewerbung nicht gefunden' }, 404); }
    if (bew.status !== 'ausstehend_freigabe') return res.json({ success: true, alreadyHandled: true });
    if (bew.freigabe_token !== token) return res.json({ error: 'Ungueltig oder abgelaufen' }, 400);
    await db.updateDocument(DB, 'bewerbungen', bewerbungId,
      { status: 'abgelehnt', freigabe_token: null, freigabe_token_expires: null });
    log('Bewerbung ' + bewerbungId + ' abgelehnt durch Ausbildungsbeauftragte/n');
    return res.json({ success: true });
  }

  return res.json({ error: 'Unbekannte Aktion' }, 400);
};
