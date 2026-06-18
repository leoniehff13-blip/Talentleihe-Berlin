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
  IonIcon,
} from "@ionic/react";
import { eyeOutline, eyeOffOutline } from "ionicons/icons";
import Footer from "../../components/Footer";
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

  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen haben.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Die Passwörter stimmen nicht überein.");
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
      setSuccess(true);
    } catch (err: unknown) {
      setError(translateError(err));
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Konto erstellt</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="ion-padding">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60%", textAlign: "center", padding: "32px 16px" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ marginBottom: 8 }}>Vielen Dank!</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--ion-color-medium)", maxWidth: 340 }}>
              Dein Konto wurde erstellt. Wir haben dir eine Bestätigungsmail geschickt — klicke auf den Link darin und dann kann es losgehen!
            </p>

          </div>
        </IonContent>
      </IonPage>
    );
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
            <IonItem>
              <IonInput
                label="Passwort wiederholen *"
                labelPlacement="stacked"
                type={showPasswordConfirm ? "text" : "password"}
                required
                value={passwordConfirm}
                onIonInput={(e) => setPasswordConfirm(e.detail.value ?? "")}
              />
              <IonButton
                slot="end"
                fill="clear"
                onClick={() => setShowPasswordConfirm((v) => !v)}
                aria-label={showPasswordConfirm ? "Passwort verbergen" : "Passwort anzeigen"}
                style={{ marginTop: 8 }}
              >
                <IonIcon icon={showPasswordConfirm ? eyeOffOutline : eyeOutline} />
              </IonButton>
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

          <div
            style={{
              margin: "16px 16px 32px",
              paddingTop: 20,
              borderTop: "1px solid rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
          >
            <IonButton
              fill="clear"
              color="medium"
              size="small"
              type="button"
              onClick={() => history.push("/registrieren/verbundberatung")}
            >
              Als Mitarbeiter:in Verbundberatung Berlin registrieren
            </IonButton>
          </div>
        </form>
        <Footer />
      </IonContent>
    </IonPage>
  );
};

export default Register;
