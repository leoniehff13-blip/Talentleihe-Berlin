import React, { useEffect, useState } from "react";
import { IonPage, IonContent } from "@ionic/react";
import { useLocation } from "react-router-dom";
import { functions, FUNC_AUSBI_FREIGABE } from "../../lib/appwrite";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const AusbiFreigabe: React.FC = () => {
  const query = useQuery();
  const userId = query.get("userId");
  const token  = query.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [name, setName]     = useState<string>("");
  const [errMsg, setErrMsg] = useState<string>("");

  useEffect(() => {
    if (!userId || !token) {
      setErrMsg("Ungültiger Link – userId oder token fehlt.");
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
        let result: any = {};
        try { result = JSON.parse(exec.responseBody); } catch {}
        if (exec.responseStatusCode === 200 && result.success) {
          setName(result.name || "");
          setStatus("success");
        } else {
          setErrMsg(result.error || "Unbekannter Fehler.");
          setStatus("error");
        }
      })
      .catch((e) => {
        setErrMsg(e?.message || "Verbindungsfehler.");
        setStatus("error");
      });
  }, [userId, token]);

  return (
    <IonPage>
      <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
        <div
          style={{
            maxWidth: 520,
            margin: "60px auto",
            textAlign: "center",
            padding: "0 16px",
          }}
        >
          {status === "loading" && (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
              <h2 style={{ color: "#1E367A", fontFamily: '"Quicksand", sans-serif', fontWeight: 800 }}>
                Freigabe wird verarbeitet …
              </h2>
            </>
          )}

          {status === "success" && (
            <>
              <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
              <h2 style={{ color: "#1E367A", fontFamily: '"Quicksand", sans-serif', fontWeight: 800 }}>
                Konto freigegeben!
              </h2>
              <p style={{ color: "#555", lineHeight: 1.7, marginBottom: 8 }}>
                {name ? (
                  <>Das Konto von <strong>{name}</strong> wurde erfolgreich freigegeben.</>
                ) : (
                  "Das Azubi-Konto wurde erfolgreich freigegeben."
                )}
              </p>
              <p style={{ color: "#555", lineHeight: 1.7, marginBottom: 24 }}>
                {name ? name.split(" ")[0] : "Ihr/e Azubi"} kann sich jetzt auf
                Einsätze bewerben. Damit der Betrieb diese sehen kann, muss jede
                Bewerbung von Ihnen genehmigt werden. Hierfür benötigen Sie
                ebenfalls ein Konto auf VerbundPraxis.
              </p>
              <a
                href="/registrieren"
                style={{
                  display: "inline-block",
                  background: "#47BCC2",
                  color: "#fff",
                  padding: "14px 32px",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "1rem",
                }}
              >
                Jetzt Konto erstellen
              </a>
              <p style={{ marginTop: 16, color: "#888", fontSize: "0.85rem" }}>
                Bereits registriert?{" "}
                <a href="/anmelden" style={{ color: "#47BCC2" }}>
                  Anmelden
                </a>
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div style={{ fontSize: 56, marginBottom: 16 }}>❌</div>
              <h2 style={{ color: "#c0392b", fontFamily: '"Quicksand", sans-serif', fontWeight: 800 }}>
                Freigabe fehlgeschlagen
              </h2>
              <p style={{ color: "#555", lineHeight: 1.7 }}>{errMsg}</p>
              <p style={{ color: "#888", fontSize: "0.9rem", marginTop: 16 }}>
                Der Link könnte abgelaufen oder bereits verwendet worden sein.
              </p>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AusbiFreigabe;
