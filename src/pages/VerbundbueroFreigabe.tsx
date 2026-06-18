import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSpinner,
  IonText,
  IonIcon,
  IonCard,
  IonCardContent,
} from "@ionic/react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { checkmarkCircleOutline, alertCircleOutline } from "ionicons/icons";
import { functions } from "../lib/appwrite";

/**
 * Function-ID der Approval-Function. Beim Anlegen hat Appwrite eine zufällige
 * ID generiert, daher hier der konkrete Wert.
 */
const FN_VERBUNDBUERO_APPROVAL = "6a324f6600063f754aab";

type Status = "pending" | "approved" | "rejected" | "alreadyDone" | "error" | "missing";

interface Result {
  success?: boolean;
  alreadyDone?: boolean;
  action?: "approve" | "reject";
  error?: string;
  message?: string;
}

const VerbundbueroFreigabe: React.FC = () => {
  const location = useLocation();
  const ranOnce = useRef(false);
  const [status, setStatus] = useState<Status>("pending");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    const params = new URLSearchParams(location.search);
    const profile = params.get("profile");
    const token = params.get("token");
    const action = params.get("action");

    if (!profile || !token || !action || (action !== "approve" && action !== "reject")) {
      setStatus("missing");
      return;
    }

    (async () => {
      try {
        const exec = await functions.createExecution(
          FN_VERBUNDBUERO_APPROVAL,
          JSON.stringify({ profileId: profile, token, action }),
          false,
          "/",
          "POST" as never,
          { "Content-Type": "application/json" } as never
        );
        // Body der Execution kommt als String – parsen
        let result: Result = {};
        try {
          result = JSON.parse(exec.responseBody || "{}");
        } catch {
          result = {};
        }
        if (!result.success) {
          setErrorMsg(result.error || "Unbekannter Fehler.");
          setStatus("error");
          return;
        }
        if (result.alreadyDone) {
          setStatus("alreadyDone");
          return;
        }
        setStatus(action === "approve" ? "approved" : "rejected");
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : String(err));
        setStatus("error");
      }
    })();
  }, [location.search]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Verbundberatung-Freigabe</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div style={{ maxWidth: 540, margin: "0 auto", paddingTop: 40 }}>
          <IonCard>
            <IonCardContent style={{ textAlign: "center", padding: 32 }}>
              {status === "pending" && (
                <>
                  <IonSpinner name="crescent" />
                  <p style={{ marginTop: 12 }}>Aktion wird ausgeführt…</p>
                </>
              )}

              {status === "approved" && (
                <>
                  <IonIcon
                    icon={checkmarkCircleOutline}
                    color="success"
                    style={{ fontSize: 64 }}
                  />
                  <h2 style={{ marginTop: 12 }}>Konto freigegeben</h2>
                  <IonText color="medium">
                    <p>
                      Der/die neue Verbundberatung-Mitarbeiter:in hat ab sofort Zugriff
                      auf das Portal.
                    </p>
                  </IonText>
                </>
              )}

              {status === "rejected" && (
                <>
                  <IonIcon
                    icon={checkmarkCircleOutline}
                    color="medium"
                    style={{ fontSize: 64 }}
                  />
                  <h2 style={{ marginTop: 12 }}>Anfrage abgelehnt</h2>
                  <IonText color="medium">
                    <p>
                      Das Konto wurde gelöscht und der Antragsteller wurde per Mail
                      informiert.
                    </p>
                  </IonText>
                </>
              )}

              {status === "alreadyDone" && (
                <>
                  <IonIcon
                    icon={checkmarkCircleOutline}
                    color="success"
                    style={{ fontSize: 64 }}
                  />
                  <h2 style={{ marginTop: 12 }}>Bereits erledigt</h2>
                  <IonText color="medium">
                    <p>Diese Anfrage wurde bereits bearbeitet — kein erneuter Klick nötig.</p>
                  </IonText>
                </>
              )}

              {(status === "error" || status === "missing") && (
                <>
                  <IonIcon
                    icon={alertCircleOutline}
                    color="danger"
                    style={{ fontSize: 64 }}
                  />
                  <h2 style={{ marginTop: 12 }}>Aktion nicht möglich</h2>
                  <IonText color="danger">
                    <p>
                      {status === "missing"
                        ? "Der Link ist unvollständig oder fehlerhaft. Bitte den Original-Link aus der E-Mail verwenden."
                        : errorMsg}
                    </p>
                  </IonText>
                </>
              )}
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default VerbundbueroFreigabe;
