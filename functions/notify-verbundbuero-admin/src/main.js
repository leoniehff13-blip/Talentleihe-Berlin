/**
 * Appwrite Function: notify-verbundbuero-admin
 *
 * Wird vom Frontend aufgerufen, sobald ein:e Verbundbüro-User:in
 * ihre eigene E-Mail-Adresse bestätigt hat. Verschickt eine
 * Benachrichtigung an das Verbundbüro Berlin, damit dort die
 * Freigabe erteilt werden kann.
 *
 * Erwartetes Body-JSON:
 *   { "applicantName": "...", "applicantEmail": "..." }
 *
 * Environment-Variablen (in der Appwrite-Konsole zu setzen):
 *   RESEND_API_KEY  – API-Key von resend.com (Pflicht)
 *   ADMIN_EMAIL     – Mail-Adresse des Verbundbüros (Default: leonie@3hoffis.de)
 *   FROM_EMAIL      – Absender (Default: onboarding@resend.dev für Tests)
 */

export default async ({ req, res, log, error }) => {
  try {
    // Body parsen (kommt je nach Appwrite-Version als String oder Object)
    let body = {};
    if (typeof req.body === "string") {
      try { body = JSON.parse(req.body || "{}"); } catch { body = {}; }
    } else if (req.body && typeof req.body === "object") {
      body = req.body;
    }

    const applicantName = String(body.applicantName || "").trim();
    const applicantEmail = String(body.applicantEmail || "").trim();

    if (!applicantName || !applicantEmail) {
      return res.json(
        { success: false, error: "applicantName und applicantEmail sind erforderlich." },
        400
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL || "leonie@3hoffis.de";
    const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";

    if (!resendApiKey) {
      error("RESEND_API_KEY ist nicht gesetzt.");
      return res.json(
        { success: false, error: "Mail-Provider nicht konfiguriert." },
        500
      );
    }

    const safe = (s) =>
      String(s).replace(/[&<>"']/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
      );

    const html = `
      <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 540px; margin: 0 auto; padding: 20px; color: #0d1b38;">
        <h2 style="color: #0b1f4a; margin: 0 0 16px;">Neue Verbundbüro-Anfrage</h2>
        <p>Hallo Verbundbüro Berlin,</p>
        <p>eine Person hat sich auf der Talentleihe-Plattform als Mitarbeiter:in registriert und ihre E-Mail-Adresse bestätigt:</p>
        <table style="margin: 20px 0; border-collapse: collapse;">
          <tr><td style="padding: 6px 12px; color: #555;">Name:</td><td style="padding: 6px 12px;"><strong>${safe(applicantName)}</strong></td></tr>
          <tr><td style="padding: 6px 12px; color: #555;">E-Mail:</td><td style="padding: 6px 12px;"><strong>${safe(applicantEmail)}</strong></td></tr>
        </table>
        <p>Damit die Person Zugriff auf das Portal bekommt, muss das Profil in der Appwrite-Konsole freigegeben werden:</p>
        <ol style="line-height: 1.7;">
          <li>Appwrite-Konsole öffnen</li>
          <li>Projekt &rarr; Datenbank <code>lehrstellen</code> &rarr; Tabelle <code>profiles</code></li>
          <li>Datensatz dieser Person suchen (Filter: <code>user_id</code> oder <code>name</code>)</li>
          <li><code>approved</code> auf <strong>true</strong> setzen &amp; speichern</li>
        </ol>
        <p>Die Person wird ab dann beim nächsten Login direkt ins Portal weitergeleitet.</p>
        <p style="color: #888; font-size: 13px; margin-top: 30px;">
          Diese Mail wurde automatisch von der Talentleihe-Plattform versendet.
        </p>
      </div>
    `;

    const text =
      `Neue Verbundbüro-Anfrage\n\n` +
      `Name: ${applicantName}\n` +
      `E-Mail: ${applicantEmail}\n\n` +
      `Bitte in der Appwrite-Konsole bei der Tabelle "profiles" für diesen User "approved" auf true setzen.\n`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [adminEmail],
        subject: `Neue Verbundbüro-Registrierung: ${applicantName}`,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      error(`Resend API ${response.status}: ${errText}`);
      return res.json(
        { success: false, error: `Mail-Versand fehlgeschlagen (${response.status}).` },
        502
      );
    }

    const data = await response.json();
    log(`Mail an ${adminEmail} versendet, id=${data.id}`);
    return res.json({ success: true, id: data.id });
  } catch (e) {
    error(`Unhandled error: ${e && e.message ? e.message : e}`);
    return res.json(
      { success: false, error: e && e.message ? e.message : "Unbekannter Fehler" },
      500
    );
  }
};
