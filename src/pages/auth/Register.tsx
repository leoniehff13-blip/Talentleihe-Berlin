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
  IonList,
  IonListHeader,
  IonLabel,
} from "@ionic/react";
import { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";
import {
  ProfilFormFields,
  EMPTY_PROFIL,
  validateProfil,
  profilStateToInput,
  type ProfilFormState,
} from "../../components/ProfilFormFields";

const Register: React.FC = () => {
  const { signup, login, saveProfile } = useAuth();
  const history = useHistory();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profil, setProfil] = useState<ProfilFormState>(EMPTY_PROFIL);

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen haben.");
      return;
    }
    const missing = validateProfil(profil);
    if (missing.length) {
      setError("Bitte ausfüllen: " + missing.join(", "));
      return;
    }

    // Account-Anzeigename: Talent → "Vorname Name", Betrieb → Firmenname
    const accountName =
      profil.type === "talent"
        ? `${profil.vorname.trim()} ${profil.name.trim()}`.trim()
        : profil.name.trim();

    setBusy(true);
    try {
      await signup(accountName, email.trim(), password);
      // Session ist nach signup gesetzt → Profil anlegen
      await saveProfile(profilStateToInput(profil));
      // refresh damit Auth-Context user+profile lädt
      await login(email.trim(), password);
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
      <IonContent fullscreen>
        <form onSubmit={handleSubmit}>
          <ProfilFormFields state={profil} onChange={setProfil} />

          <IonList>
            <IonListHeader>
              <IonLabel>Login-Daten</IonLabel>
            </IonListHeader>
            <IonItem>
              <IonInput
                label="E-Mail *"
                labelPlacement="stacked"
                type="email"
                required
                value={email}
                onIonInput={(e) => setEmail(e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Passwort * (min. 8 Zeichen)"
                labelPlacement="stacked"
                type="password"
                required
                value={password}
                onIonInput={(e) => setPassword(e.detail.value ?? "")}
              />
            </IonItem>
          </IonList>

          {error && (
            <div className="ion-padding">
              <IonText color="danger">
                <p>{error}</p>
              </IonText>
            </div>
          )}

          <div className="ion-padding">
            <IonButton expand="block" type="submit" disabled={busy}>
              {busy ? "Bitte warten…" : "Konto erstellen"}
            </IonButton>
            <IonNote>
              <p style={{ marginTop: 8 }}>
                * = Pflichtfeld
              </p>
              <p style={{ marginTop: 16 }}>
                Schon registriert? <Link to="/login">Hier einloggen</Link>
              </p>
            </IonNote>
          </div>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default Register;
