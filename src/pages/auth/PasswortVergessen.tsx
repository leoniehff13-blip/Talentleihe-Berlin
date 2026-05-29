import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonItem,
  IonButton,
  IonText,
  IonNote,
  IonIcon,
} from "@ionic/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { checkmarkCircleOutline } from "ionicons/icons";
import { useAuth } from "../../lib/AuthContext";
import { translateError } from "../../lib/errors";

const PasswortVergessen: React.FC = () => {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err: unknown) {
      setError(translateError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Passwort vergessen</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        {sent ? (
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <IonIcon
              icon={checkmarkCircleOutline}
              color="success"
              style={{ fontSize: 64 }}
            />
            <h2>E-Mail unterwegs</h2>
            <IonText color="medium">
              <p>
                Falls ein Konto mit dieser Adresse existiert, haben wir dir einen
                Link zum Zurücksetzen geschickt. Bitte prüfe dein Postfach (auch
                den Spam-Ordner).
              </p>
            </IonText>
            <IonButton expand="block" fill="outline" routerLink="/login" style={{ marginTop: 24 }}>
              Zurück zum Login
            </IonButton>
          </div>
        ) : (
          <>
            <IonText color="medium">
              <p>
                Gib deine E-Mail-Adresse ein. Wir senden dir einen Link, mit dem
                du ein neues Passwort vergeben kannst.
              </p>
            </IonText>
            <form onSubmit={handleSubmit}>
              <IonItem>
                <IonInput
                  label="E-Mail"
                  labelPlacement="floating"
                  type="email"
                  required
                  value={email}
                  onIonInput={(e) => setEmail(e.detail.value ?? "")}
                />
              </IonItem>
              {error && (
                <IonText color="danger">
                  <p>{error}</p>
                </IonText>
              )}
              <IonButton expand="block" type="submit" disabled={busy} style={{ marginTop: 16 }}>
                {busy ? "Bitte warten…" : "Link senden"}
              </IonButton>
            </form>
            <IonNote>
              <p style={{ marginTop: 24 }}>
                <Link to="/login">Zurück zum Login</Link>
              </p>
            </IonNote>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default PasswortVergessen;
