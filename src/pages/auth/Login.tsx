import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonItem,
  IonLabel,
  IonButton,
  IonText,
  IonNote,
} from "@ionic/react";
import { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";

const Login: React.FC = () => {
  const { login, devLogin } = useAuth();
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      history.replace("/konto");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
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
          <IonItem>
            <IonInput
              label="Passwort"
              labelPlacement="floating"
              type="password"
              required
              value={password}
              onIonInput={(e) => setPassword(e.detail.value ?? "")}
            />
          </IonItem>
          {error && (
            <IonText color="danger">
              <p>{error}</p>
            </IonText>
          )}
          <IonButton expand="block" type="submit" disabled={busy} style={{ marginTop: 16 }}>
            {busy ? "Bitte warten…" : "Einloggen"}
          </IonButton>
        </form>
        <IonNote>
          <p style={{ marginTop: 24 }}>
            Noch kein Konto? <Link to="/registrieren">Jetzt registrieren</Link>
          </p>
        </IonNote>

        <div style={{ marginTop: 32, borderTop: "1px solid #e0e0e0", paddingTop: 20 }}>
          <p style={{ fontSize: "0.78rem", color: "#888", textAlign: "center", marginBottom: 10 }}>
            DEV-VORSCHAU
          </p>
          <IonButton
            expand="block"
            color="warning"
            onClick={() => { devLogin(); history.replace("/konto"); }}
          >
            Dev-Zugang (ohne Passwort)
          </IonButton>
          <IonButton
            expand="block"
            fill="outline"
            color="warning"
            style={{ marginTop: 8 }}
            onClick={() => { devLogin(); history.replace("/lehrstellen"); }}
          >
            Dev-Zugang → Talentleihe
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
