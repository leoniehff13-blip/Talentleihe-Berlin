import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ExecutionMethod } from "appwrite";
import {
  IonPage, IonContent, IonSpinner, IonText, IonButton,
} from "@ionic/react";
import { functions, FUNC_AUSBI_FREIGABE } from "../../lib/appwrite";

const AusbiBewerbung: React.FC = () => {
  const location = useLocation();
  const params     = new URLSearchParams(location.search);
  const bewerbungId = params.get("id") ?? "";
  const token       = params.get("token") ?? "";
  const act         = params.get("act") ?? "";

  const [state, setState] = useState<"loading" | "success" | "already" | "error">("loading");
  const [msg, setMsg]     = useState("");

  useEffect(() => {
    if (!bewerbungId || !token || (act !== "approve" && act !== "reject")) {
      setState("error"); setMsg("Ungültiger Link."); return;
    }
    const action = act === "approve" ? "bewerbung_approve" : "bewerbung_reject";
    functions.createExecution(
      FUNC_AUSBI_FREIGABE,
      JSON.stringify({ action, bewerbungId, token }),
      false, "/", ExecutionMethod.POST
    ).then((exec) => {
      let result: { success?: boolean; alreadyHandled?: boolean; error?: string } = {};
      try { result = JSON.parse(exec.responseBody || "{}"); } catch { /* */ }
      if (result.success && result.alreadyHandled) {
        setState("already"); setMsg("Diese Bewerbung wurde bereits bearbeitet.");
      } else if (result.success) {
        setState("success");
        setMsg(act === "approve"
          ? "Bewerbung freigegeben. Der Betrieb kann sie jetzt bearbeiten."
          : "Bewerbung wurde abgelehnt.");
      } else {
        setState("error"); setMsg(result.error || "Ein Fehler ist aufgetreten.");
      }
    }).catch((err: unknown) => {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.");
    });
  }, [bewerbungId, token, act]);

  const icon = state === "loading" ? "" : state === "error" ? "❌" : state === "already" ? "ℹ️" : "✅";
  const color = state === "error" ? "danger" : state === "success" ? "success" : "medium";

  return (
    <IonPage>
      <IonContent className="ion-padding" style={{ "--background": "#f8fafc" }}>
        <div style={{ maxWidth: 480, margin: "80px auto", textAlign: "center" }}>
          <img src="/assets/icon/icon.png" alt="VerbundPraxis"
               style={{ width: 72, marginBottom: 24, borderRadius: 16 }} />
          <h2 style={{ color: "#1E367A", marginBottom: 24 }}>VerbundPraxis</h2>
          {state === "loading" ? (
            <>
              <IonSpinner name="crescent" style={{ transform: "scale(1.5)", margin: "32px 0" }} />
              <p style={{ color: "#666" }}>Bitte warten…</p>
            </>
          ) : (
            <>
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>{icon}</div>
              <IonText color={color}>
                <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>{msg}</p>
              </IonText>
              <IonButton href="/" fill="outline" style={{ marginTop: 32 }}>
                Zur Plattform
              </IonButton>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AusbiBewerbung;
