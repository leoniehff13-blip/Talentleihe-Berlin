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
} from "@ionic/react";
import { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";
import { translateError } from "../../lib/errors";

const DEV_ACCOUNTS = [
  {
    label: "Dev-Login: Betrieb",
    email: "dev-betrieb@winwin-berlin.de",
    password: "DevBetrieb2025!",
    color: "primary" as const,
  },
  {
    label: "Dev-Login: Talent",
    email: "dev-talent@winwin-berlin.de",
    password: "DevTalent2025!",
    color: "tertiary" as const,
  },
];

const Login: React.FC = () => {
  const { login } = useAuth();
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
      setError(translateError(err));
    } finally {
      setBusy(false);
    }
  }

  async function quickLogin(acc: (typeof DEV_ACCOUNTS)[number]) {
    setError(null);
    setBusy(true);
    try {
      await login(acc.email, acc.password);
      history.replace("/konto");
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
          <p style={{ marginTop: 16 }}>
            <Link to="/passwort-vergessen">Passwort vergessen?</Link>
          </p>
          <p style={{ marginTop: 8 }}>
            Noch kein Konto? <Link to="/registrieren">Jetzt registrieren</Link>
          </p>
        </IonNote>

        {/* Dev-Schnellzugänge */}
        <div style={{ marginTop: 32, borderTop: "1px solid #e0e0e0", paddingTop: 20 }}>
          <p style={{ fontSize: "0.78rem", color: "#888", textAlign: "center", marginBottom: 10 }}>
            DEV-SCHNELLZUGANG
          </p>
          {DEV_ACCOUNTS.map((acc) => (
            <IonButton
              key={acc.email}
              expand="block"
              fill="outline"
              color={acc.color}
              disabled={busy}
              style={{ marginBottom: 8 }}
              onClick={() => quickLogin(acc)}
            >
              {acc.label}
            </IonButton>
          ))}
          <p style={{ fontSize: "0.72rem", color: "#aaa", textAlign: "center", margin: "4px 0 0" }}>
            Betrieb: dev-betrieb@winwin-berlin.de · DevBetrieb2025!
            <br />
            Talent: dev-talent@winwin-berlin.de · DevTalent2025!
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
