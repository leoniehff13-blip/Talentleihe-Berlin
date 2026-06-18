/**
 * Appwrite Function: verbundbuero-approval
 *
 * Wird von der öffentlichen Approval-Seite (/verbundbuero-freigabe) aufgerufen,
 * wenn das Verbundberatung auf „Freigeben" oder „Ablehnen" klickt.
 *
 * Body (JSON):
 *   { profileId, token, action }   // action: "approve" | "reject"
 *
 * Verhalten:
 *   – Lädt das Profil per Server-API-Key (umgeht Row-Permissions)
 *   – Prüft, dass token mit profile.approval_token übereinstimmt
 *   – approve: setzt approved=true und löscht approval_token
 *   – reject:  löscht das Profil, löscht den User-Account, schickt
 *              Ablehnungs-Mail an den Antragsteller
 *
 * Env:
 *   APPWRITE_ENDPOINT       (z. B. https://fra.cloud.appwrite.io/v1)
 *   APPWRITE_PROJECT_ID     deine Project-ID
 *   APPWRITE_API_KEY        Server-API-Key mit databases.read/write, users.read/write
 *   DATABASE_ID             "lehrstellen"
 *   PROFILES_TABLE_ID       "profiles"
 *   RESEND_API_KEY          API-Key von Resend
 *   FROM_EMAIL              Absender
 */

const safeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

async function appwriteFetch(method, path, env, body, log) {
  const url = `${env.endpoint}${path}`;
  if (log) log(`-> ${method} ${url}`);
  // Timeout: 10 Sekunden pro HTTP-Call, damit wir nicht ins 30-Sekunden-
  // Function-Timeout laufen, wenn der Endpoint hängt.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10_000);
  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": env.projectId,
        "X-Appwrite-Key": env.apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { /* ignore */ }
    if (log) log(`<- ${method} ${url} (${res.status})`);
    return { ok: res.ok, status: res.status, data, text };
  } catch (e) {
    if (log) log(`!! ${method} ${url} failed: ${e && e.message}`);
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

async function sendRejectionMail(to, name, env, log, error) {
  if (!env.resendApiKey) {
    error("RESEND_API_KEY fehlt – Ablehnungs-Mail nicht möglich.");
    return false;
  }
  const html = `
    <div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:540px;margin:0 auto;padding:20px;color:#0d1b38;">
      <h2 style="color:#0b1f4a;margin:0 0 16px;">Verbundberatung Berlin — Anfrage abgelehnt</h2>
      <p>Hallo ${safeHtml(name)},</p>
      <p>deine Anfrage zur Registrierung als Mitarbeiter:in beim Verbundberatung Berlin wurde leider <strong>abgelehnt</strong>.</p>
      <p>Dein angelegtes Konto wurde entsprechend entfernt. Wenn du der Meinung bist, dass das ein Versehen ist oder Rückfragen hast, melde dich gerne beim Verbundberatung Berlin.</p>
      <p style="color:#888;font-size:13px;margin-top:30px;">Diese Mail wurde automatisch von der Talentleihe-Plattform versendet.</p>
    </div>
  `;
  const text =
    `Hallo ${name},\n\n` +
    `deine Anfrage zur Registrierung als Mitarbeiter:in beim Verbundberatung Berlin wurde leider abgelehnt.\n` +
    `Dein angelegtes Konto wurde entsprechend entfernt.\n\n` +
    `Bei Rückfragen wende dich gerne an das Verbundberatung Berlin.\n`;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.fromEmail,
        to: [to],
        subject: "Verbundberatung Berlin — Anfrage abgelehnt",
        html,
        text,
      }),
    });
    if (!r.ok) {
      error(`Resend ${r.status}: ${await r.text()}`);
      return false;
    }
    log(`Ablehnungs-Mail an ${to} verschickt.`);
    return true;
  } catch (e) {
    error(`Reject-Mail-Send fehlgeschlagen: ${e && e.message ? e.message : e}`);
    return false;
  }
}

export default async ({ req, res, log, error }) => {
  try {
    let body = {};
    if (typeof req.body === "string") {
      try { body = JSON.parse(req.body || "{}"); } catch { body = {}; }
    } else if (req.body && typeof req.body === "object") {
      body = req.body;
    }

    const profileId = String(body.profileId || "").trim();
    const token = String(body.token || "").trim();
    const action = String(body.action || "").trim().toLowerCase();

    if (!profileId || !token || !["approve", "reject"].includes(action)) {
      return res.json(
        { success: false, error: "Ungültige Parameter (profileId/token/action)." },
        400
      );
    }

    // Achtung: Variablennamen mit Präfix APPWRITE_ kollidieren in manchen
    // Appwrite-Versionen mit internen Reserved-Names. Daher hier eigene
    // Namen ohne dieses Präfix. Endpoint und Project-ID können wir teils
    // auch aus den Appwrite-intern bereitgestellten Variablen lesen.
    // Wichtig: aus einer Appwrite-Function HEIM ins eigene Projekt rufen wir
    // den intern injizierten Endpoint auf, NICHT die public URL. Der Aufruf
    // an https://fra.cloud.appwrite.io kann sonst durch Firewall/DNS hängen.
    const env = {
      endpoint:
        process.env.APPWRITE_FUNCTION_API_ENDPOINT ||
        process.env.AW_ENDPOINT ||
        "https://fra.cloud.appwrite.io/v1",
      projectId:
        process.env.APPWRITE_FUNCTION_PROJECT_ID ||
        process.env.AW_PROJECT_ID,
      apiKey: process.env.AW_API_KEY,
      databaseId: process.env.DATABASE_ID || "lehrstellen",
      profilesTable: process.env.PROFILES_TABLE_ID || "profiles",
      resendApiKey: process.env.RESEND_API_KEY,
      fromEmail: process.env.FROM_EMAIL || "onboarding@resend.dev",
    };
    log(`Using endpoint=${env.endpoint}, projectId=${env.projectId ? "set" : "MISSING"}, apiKey=${env.apiKey ? "set" : "MISSING"}`);

    if (!env.projectId || !env.apiKey) {
      error("APPWRITE_PROJECT_ID und APPWRITE_API_KEY müssen gesetzt sein.");
      return res.json(
        { success: false, error: "Function-Konfiguration unvollständig." },
        500
      );
    }

    // Profil laden
    const getRes = await appwriteFetch(
      "GET",
      `/databases/${env.databaseId}/collections/${env.profilesTable}/documents/${profileId}`,
      env,
      undefined,
      log
    );
    if (!getRes.ok || !getRes.data) {
      return res.json(
        { success: false, error: "Profil nicht gefunden oder Zugriff fehlt." },
        404
      );
    }
    const profile = getRes.data;

    // Token prüfen
    if (!profile.approval_token || profile.approval_token !== token) {
      return res.json(
        { success: false, error: "Token ungültig oder bereits verwendet." },
        403
      );
    }

    if (profile.role !== "verbundberatung") {
      return res.json(
        { success: false, error: "Profil hat keine Verbundberatung-Rolle." },
        400
      );
    }

    if (profile.approved === true) {
      return res.json(
        { success: true, alreadyDone: true, action: "approve", message: "Konto wurde bereits freigegeben." }
      );
    }

    if (action === "approve") {
      const updateRes = await appwriteFetch(
        "PATCH",
        `/databases/${env.databaseId}/collections/${env.profilesTable}/documents/${profileId}`,
        env,
        { data: { approved: true, approval_token: null } },
        log
      );
      if (!updateRes.ok) {
        error(`PATCH ${updateRes.status}: ${updateRes.text}`);
        return res.json({ success: false, error: "Profil-Update fehlgeschlagen." }, 502);
      }
      log(`Profil ${profileId} freigegeben.`);
      return res.json({ success: true, action: "approve" });
    }

    // action === "reject"
    const userId = profile.user_id;
    // Mailadresse holen (vom Auth-Account)
    let applicantEmail = null;
    let applicantName = profile.name || "";
    try {
      const userRes = await appwriteFetch("GET", `/users/${userId}`, env, undefined, log);
      if (userRes.ok && userRes.data) {
        applicantEmail = userRes.data.email || null;
        applicantName = applicantName || userRes.data.name || "";
      }
    } catch (e) {
      log(`User ${userId} konnte nicht geladen werden: ${e && e.message}`);
    }

    // Profil löschen
    const delProfile = await appwriteFetch(
      "DELETE",
      `/databases/${env.databaseId}/collections/${env.profilesTable}/documents/${profileId}`,
      env,
      undefined,
      log
    );
    if (!delProfile.ok) {
      error(`Profil-Delete ${delProfile.status}: ${delProfile.text}`);
    }

    // User-Account löschen
    const delUser = await appwriteFetch("DELETE", `/users/${userId}`, env);
    if (!delUser.ok) {
      error(`User-Delete ${delUser.status}: ${delUser.text}`);
    }

    // Rejection-Mail
    if (applicantEmail) {
      await sendRejectionMail(applicantEmail, applicantName, env, log, error);
    }

    return res.json({ success: true, action: "reject" });
  } catch (e) {
    error(`Unhandled error: ${e && e.message ? e.message : e}`);
    return res.json(
      { success: false, error: e && e.message ? e.message : "Unbekannter Fehler" },
      500
    );
  }
};
