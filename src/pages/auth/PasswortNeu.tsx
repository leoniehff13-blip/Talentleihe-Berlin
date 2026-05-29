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
  IonIcon,
} from "@ionic/react";
import { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { checkmarkCircleOutline } from "ionicons/icons";
import { useAuth } from "../../lib/AuthContext";
import { translateError } from "../../lib/errors";

const PasswortNeu: React.FC = () => {
  const { confirmPasswordReset } = useAuth();
  const history = useHistory();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const userId = params.get("userId");
  const secret = params.get("secret");

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const linkValid = Boolean(userId && secret);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen haben.");
      return;
    }
    if (password !== password2) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }
    setBusy(true);
    try {
      await confirmPasswordReset(userId!, secret!, password);
      setDone(true);
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
          <IonTitle>Neues Passwort</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        {done ? (
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <IonIcon
              icon={checkmarkCircleOutline}
              color="success"
              style={{ fontSize: 64 }}
            />
            <h2>Passwort geändert</h2>
            <IonText color="medium">
              <p>Du kannst dich jetzt mit deinem neuen Passwort einloggen.</p>
            </IonText>
            <IonButton expand="block" style={{ marginTop: 24 }} onClick={() => history.replace("/login")}>
              Zum Login
            </IonButton>
          </div>
        ) : !linkValid ? (
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <IonText color="danger">
              <h2>Ungültiger Link</h2>
              <p>
                Der Link zum Zurücksetzen ist unvollständig oder abgelaufen.
                Bitte fordere einen neuen an.
              </p>
            </IonText>
            <IonButton expand="block" fill="outline" routerLink="/passwort-vergessen" style={{ marginTop: 24 }}>
              Neuen Link anfordern
            </IonButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <IonItem>
              <IonInput
                label="Neues Passwort (min. 8 Zeichen)"
                labelPlacement="floating"
                type="password"
                required
                value={password}
                onIonInput={(e) => setPassword(e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Passwort wiederholen"
                labelPlacement="floating"
                type="password"
                required
                value={password2}
                onIonInput={(e) => setPassword2(e.detail.value ?? "")}
              />
            </IonItem>
            {error && (
              <IonText color="danger">
                <p>{error}</p>
              </IonText>
            )}
            <IonButton expand="block" type="submit" disabled={busy} style={{ marginTop: 16 }}>
              {busy ? "Bitte warten…" : "Passwort speichern"}
            </IonButton>
          </form>
        )}
      </IonContent>
    </IonPage>
  );
};

export default PasswortNeu;
