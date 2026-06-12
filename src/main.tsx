import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// React.StrictMode verdoppelt im Dev-Modus alle useEffect-Aufrufe absichtlich,
// was bei Appwrite-Cloud-Projekten sofort Rate-Limits auslöst.
// Im Production-Build ist dieses Verhalten deaktiviert (kein Problem deployed).
const app = import.meta.env.PROD ? (
  <React.StrictMode>
    <App />
  </React.StrictMode>
) : (
  <App />
);

ReactDOM.createRoot(document.getElementById("root")!).render(app);

// Service Worker registrieren – aktiv nur in Production-Builds.
// Im Dev-Modus stört der SW Vites Hot-Module-Replacement.
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  // Wenn ein neuer SW die Kontrolle übernimmt (nach einem Deploy), die Seite
  // einmal automatisch neu laden, damit Nutzer sofort den aktuellen Stand
  // sehen – ohne manuellen harten Reload. Nur reloaden, wenn es vorher schon
  // einen Controller gab (also nicht beim allerersten Seitenaufruf).
  let hadController = Boolean(navigator.serviceWorker.controller);
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController) {
      hadController = true;
      return;
    }
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });

  window.addEventListener("load", () => {
    // updateViaCache: "none" -> die sw.js selbst wird nie aus dem HTTP-Cache
    // geladen, sodass ein neuer Service Worker immer sofort erkannt wird.
    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn("Service Worker konnte nicht registriert werden:", err);
      });
  });
}
