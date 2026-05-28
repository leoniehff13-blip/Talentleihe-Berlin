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
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      // eslint-disable-next-line no-console
      console.warn("Service Worker konnte nicht registriert werden:", err);
    });
  });
}
