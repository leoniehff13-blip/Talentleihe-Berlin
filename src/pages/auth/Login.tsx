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
import { eyeOutline, eyeOffOutline } from "ionicons/icons";
import Footer from "../../components/Footer";
import { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";
import { translateError } from "../../lib/errors";

interface LoginProps {
  /** Wenn gesetzt, wird nach erfolgreichem Login diese Funktion aufgerufen
   *  statt zu /konto zu navigieren (z.B. wenn Login innerhalb von Konto eingebettet ist). */
  onSuccess?: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      if (onSuccess) onSuccess(); else history.replace("/konto");
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
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onIonInput={(e) => setPassword(e.detail.value ?? "")}
            />
            <IonButton
              slot="end"
              fill="clear"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
              style={{ marginTop: 8 }}
            >
              <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} />
            </IonButton>
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
        <Footer />
      </IonContent>
    </IonPage>
  );
};

export default Login;
