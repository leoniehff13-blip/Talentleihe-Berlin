import { useState, useEffect } from "react";
import {
  IonPage,
  IonContent,
} from "@ionic/react";
import { useLocation } from "react-router-dom";
import { functions, FUNC_AUSBI_FREIGABE } from "../../lib/appwrite";

export default function AusbiFreigabe() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const userId = params.get("userId") ?? "";
  const token = params.get("token") ?? "";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!userId || !token) {
      setErrorMsg("Ungültiger Link – userId oder token fehlt.");
      setStatus("error");
      return;
    }

    functions
      .createExecution(
        FUNC_AUSBI_FREIGABE,
        JSON.stringify({ action: "approve", userId, token }),
        false
      )
      .then((exec) => {
        const result = JSON.parse(exec.responseBody || "{}");
        if (result.success) {
          setName(result.name || "");
          setStatus("success");
        } else {
          setErrorMsg(result.error || "Unbekannter Fehler");
          setStatus("error");
        }
      })
      .catch((err) => {
        setErrorMsg(err?.message || "Netzwerkfehler");
        setStatus("error");
      });
  }, [userId, token]);

  return (
    <IonPage>
      <IonContent style={{ "--background": "#f8fafc" }}>
        <div
          style={{
            maxWidth: 480,
            margin: "80px auto",
            textAlign: "center",
            padding: "0 24px",
            fontFamily: '"Quicksand", sans-serif',
          }}
        >
          {status === "loading" && (
            <>
              <div style={{ fontSize: 56, marginBottom: 16 }}>⏳</div>
              <h2 style={{ color: "#1E367A", fontWeight: 800 }}>
                Freigabe wird verarbeitet…
              </h2>
            </>
          )}

          {status === "success" && (
            <>
              <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
              <h2 style={{ color: "#1E367A", fontWeight: 800 }}>
                Konto freigegeben!
              </h2>
              <p style={{ color: "#555", lineHeight: 1.7 }}>
                {name ? (
                  <>
                    Das Konto von <strong>{name}</strong> wurde erfolgreich
                    freigegeben.
                  </>
                ) : (
                  "Das Konto wurde erfolgreich freigegeben."
                )}
              </p>
              <p style={{ color: "#555", lineHeight: 1.7 }}>
                {name || "Der/die Azubi"} kann sich jetzt auf der
                VerbundPraxis-Plattform anmelden und Einsätze suchen.
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div style={{ fontSize: 56, marginBottom: 16 }}>❌</div>
              <h2 style={{ color: "#c0392b", fontWeight: 800 }}>
                Freigabe fehlgeschlagen
              </h2>
              <p style={{ color: "#555", lineHeight: 1.7 }}>{errorMsg}</p>
              <p style={{ color: "#888", fontSize: "0.9rem" }}>
                Falls der Link abgelaufen ist oder nicht funktioniert,
                wende dich bitte an{" "}
                <a href="mailto:info@hwk-berlin.de">info@hwk-berlin.de</a>.
              </p>
            </>
          )}

          <div
            style={{
              marginTop: 48,
              padding: "16px",
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            }}
          >
            <p style={{ margin: 0, color: "#999", fontSize: "0.8rem" }}>
              VerbundPraxis · Handwerkskammer Berlin
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
