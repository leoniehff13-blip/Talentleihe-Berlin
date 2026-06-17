/**
 * Appwrite Function: notify-verbundbuero-admin
 *
 * Wird vom Frontend aufgerufen, sobald ein:e Verbundbüro-User:in
 * angelegt wurde (während noch eine Session aktiv ist). Verschickt eine
 * Benachrichtigung an das Verbundbüro Berlin mit zwei Buttons:
 * „Freigeben" und „Ablehnen". Die Buttons sind signierte URLs auf die
 * App-Route /verbundbuero-freigabe.
 *
 * Erwartetes Body-JSON:
 *   {
 *     "applicantName": "...",
 *     "applicantEmail": "...",
 *     "approveUrl": "https://…/verbundbuero-freigabe?…&action=approve",
 *     "rejectUrl":  "https://…/verbundbuero-freigabe?…&action=reject"
 *   }
 *
 * Environment-Variablen:
 *   RESEND_API_KEY  – API-Key von resend.com (Pflicht)
 *   ADMIN_EMAIL     – Mail-Adresse des Verbundbüros (Default: praxisprojekt5@gmail.com)
 *   FROM_EMAIL      – Absender (Default: onboarding@resend.dev)
 */

export default async ({ req, res, log, error }) => {
  try {
    let body = {};
    if (typeof req.body === "string") {
      try { body = JSON.parse(req.body || "{}"); } catch { body = {}; }
    } else if (req.body && typeof req.body === "object") {
      body = req.body;
    }

    const applicantName = String(body.applicantName || "").trim();
    const applicantEmail = String(body.applicantEmail || "").trim();
    const approveUrl = String(body.approveUrl || "").trim();
    const rejectUrl = String(body.rejectUrl || "").trim();

    if (!applicantName || !applicantEmail) {
      return res.json(
        { success: false, error: "applicantName und applicantEmail sind erforderlich." },
        400
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL || "praxisprojekt5@gmail.com";
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

    const buttonsHtml = approveUrl && rejectUrl
      ? `
        <table cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
          <tr>
            <td style="padding-right: 12px;">
              <a href="${safe(approveUrl)}"
                 style="display:inline-block;padding:14px 28px;background:#2dd36f;color:#ffffff;
                        font-family:-apple-system,Segoe UI,sans-serif;font-weight:600;font-size:14px;
                        text-decoration:none;border-radius:6px;">
                ✓ Freigeben
              </a>
            </td>
            <td>
              <a href="${safe(rejectUrl)}"
                 style="display:inline-block;padding:14px 28px;background:#eb445a;color:#ffffff;
                        font-family:-apple-system,Segoe UI,sans-serif;font-weight:600;font-size:14px;
                        text-decoration:none;border-radius:6px;">
                ✕ Ablehnen
              </a>
            </td>
          </tr>
        </table>
        <p style="color:#888;font-size:12px;margin:0 0 16px;">
          Beim Klick auf „Ablehnen" wird das Konto gelöscht und der Antragsteller benachrichtigt.
          Beim Klick auf „Freigeben" wird das Konto sofort aktiv.
        </p>`
      : "";

    const html = `
      <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 540px; margin: 0 auto; padding: 20px; color: #0d1b38;">
        <h2 style="color: #0b1f4a; margin: 0 0 16px;">Neue Verbundbüro-Anfrage</h2>
        <p>Hallo Verbundbüro Berlin,</p>
        <p>eine Person hat sich auf der Talentleihe-Plattform als Mitarbeiter:in registriert:</p>
        <table style="margin: 20px 0; border-collapse: collapse;">
          <tr><td style="padding: 6px 12px; color: #555;">Name:</td><td style="padding: 6px 12px;"><strong>${safe(applicantName)}</strong></td></tr>
          <tr><td style="padding: 6px 12px; color: #555;">E-Mail:</td><td style="padding: 6px 12px;"><strong>${safe(applicantEmail)}</strong></td></tr>
        </table>
        ${buttonsHtml}
        <p style="color: #888; font-size: 13px; margin-top: 30px;">
          Diese Mail wurde automatisch von der Talentleihe-Plattform versendet.
        </p>
      </div>
    `;

    const text =
      `Neue Verbundbüro-Anfrage\n\n` +
      `Name: ${applicantName}\n` +
      `E-Mail: ${applicantEmail}\n\n` +
      (approveUrl ? `Freigeben:  ${approveUrl}\n` : "") +
      (rejectUrl ? `Ablehnen:   ${rejectUrl}\n` : "");

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
