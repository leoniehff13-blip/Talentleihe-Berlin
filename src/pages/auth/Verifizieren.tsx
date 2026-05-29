import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonText,
  IonSpinner,
  IonIcon,
} from "@ionic/react";
import { useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { checkmarkCircleOutline, alertCircleOutline } from "ionicons/icons";
import { useAuth } from "../../lib/AuthContext";
import { translateError } from "../../lib/errors";

type Status = "pending" | "success" | "error" | "missing";

const Verifizieren: React.FC = () => {
  const { confirmVerification } = useAuth();
  const history = useHistory();
  const location = useLocation();
  const [status, setStatus] = useState<Status>("pending");
  const [error, setError] = useState<string | null>(null);
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    const params = new URLSearchParams(location.search);
    const userId = params.get("userId");
    const secret = params.get("secret");
    if (!userId || !secret) {
      setStatus("missing");
      return;
    }
    confirmVerification(userId, secret)
      .then(() => setStatus("success"))
      .catch((err: unknown) => {
        setError(translateError(err));
        setStatus("error");
      });
  }, [location.search, confirmVerification]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>E-Mail-Bestätigung</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div style={{ textAlign: "center", marginTop: 40 }}>
          {status === "pending" && (
            <>
              <IonSpinner name="crescent" />
              <p>Deine E-Mail-Adresse wird bestätigt…</p>
            </>
          )}

          {status === "success" && (
            <>
              <IonIcon
                icon={checkmarkCircleOutline}
                color="success"
                style={{ fontSize: 64 }}
              />
              <h2>E-Mail bestätigt</h2>
              <IonText color="medium">
                <p>Danke! Deine E-Mail-Adresse ist jetzt verifiziert.</p>
              </IonText>
              <IonButton
                expand="block"
                style={{ marginTop: 24 }}
                onClick={() => history.replace("/konto")}
              >
                Zum Konto
              </IonButton>
            </>
          )}

          {(status === "error" || status === "missing") && (
            <>
              <IonIcon
                icon={alertCircleOutline}
                color="danger"
                style={{ fontSize: 64 }}
              />
              <h2>Bestätigung fehlgeschlagen</h2>
              <IonText color="danger">
                <p>
                  {status === "missing"
                    ? "Der Bestätigungslink ist unvollständig. Bitte öffne den Link aus der E-Mail erneut."
                    : error}
                </p>
              </IonText>
              <IonButton
                expand="block"
                fill="outline"
                style={{ marginTop: 24 }}
                onClick={() => history.replace("/konto")}
              >
                Zum Konto
              </IonButton>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Verifizieren;
