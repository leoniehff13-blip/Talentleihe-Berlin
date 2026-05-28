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
import { useHistory } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";
import { translateError } from "../../lib/errors";
import {
  ProfilFormFields,
  EMPTY_PROFIL,
  validateProfil,
  profilStateToInput,
  type ProfilFormState,
} from "../../components/ProfilFormFields";

const Register: React.FC = () => {
  const { signup, saveProfile } = useAuth();
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
      // signup() hat bereits eine Session angelegt und refresh() aufgerufen.
      // Profil anlegen – danach direkt weiterleiten, keine zweite Session nötig.
      await saveProfile(profilStateToInput(profil));
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
              <p style={{ marginTop: 8 }}>* = Pflichtfeld</p>
            </IonNote>
            <IonButton
              expand="block"
              fill="outline"
              color="secondary"
              style={{ marginTop: 12 }}
              onClick={() => history.push("/login")}
            >
              Schon registriert? Hier einloggen
            </IonButton>
          </div>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default Register;
