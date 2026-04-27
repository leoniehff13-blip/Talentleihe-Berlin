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

const Register: React.FC = () => {
  const { signup } = useAuth();
  const history = useHistory();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen haben.");
      return;
    }
    setBusy(true);
    try {
      await signup(name.trim(), email.trim(), password);
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
          <IonTitle>Registrieren</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <form onSubmit={handleSubmit}>
          <IonItem>
            <IonInput
              label="Name (oder Firmenname)"
              labelPlacement="floating"
              required
              value={name}
              onIonInput={(e) => setName(e.detail.value ?? "")}
            />
          </IonItem>
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
              label="Passwort (min. 8 Zeichen)"
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
            {busy ? "Bitte warten…" : "Konto erstellen"}
          </IonButton>
        </form>
        <IonNote>
          <p style={{ marginTop: 24 }}>
            Schon registriert? <Link to="/login">Hier einloggen</Link>
          </p>
        </IonNote>
      </IonContent>
    </IonPage>
  );
};

export default Register;
