import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonInput,
  IonItem,
  IonButton,
  IonText,
  IonNote,
  IonList,
  IonListHeader,
  IonLabel,
  IonCard,
  IonCardContent,
  IonIcon,
} from "@ionic/react";
import { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { eyeOutline, eyeOffOutline, shieldCheckmarkOutline } from "ionicons/icons";
import Footer from "../../components/Footer";
import { useAuth } from "../../lib/AuthContext";
import { translateError } from "../../lib/errors";

/**
 * Registrierung für Mitarbeitende der Verbundberatung Berlin.
 * Bei der Admin-Mailadresse wird das Profil sofort freigegeben,
 * sonst muss eine manuelle Freigabe folgen (über die Appwrite-Konsole,
 * später über eine eigene Admin-Oberfläche).
 *
 * Hinweis: Die App nutzt zusätzlich Appwrite-E-Mail-Verifizierung — die
 * Verifizierungs-Mail geht an die Mailadresse, die hier eingegeben wird.
 * Erst danach (UND nach Freigabe) ist das Konto nutzbar.
 */
const RegisterVerbundbuero: React.FC = () => {
  const { signup, saveVerbundbueroProfile } = useAuth();
  const history = useHistory();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Bitte gib deinen Namen an.");
      return;
    }
    if (!email.trim()) {
      setError("Bitte gib eine E-Mail-Adresse an.");
      return;
    }
    if (password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen haben.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setBusy(true);
    try {
      await signup(name.trim(), email.trim(), password);
      await saveVerbundbueroProfile(name.trim(), email.trim());
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
            <IonButtons slot="start">
              <IonBackButton defaultHref="/registrieren" />
            </IonButtons>
            <IonTitle>Konto angefragt</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="ion-padding">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "60%",
              textAlign: "center",
              padding: "32px 16px",
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 16 }}>✉️</div>
            <h2 style={{ marginBottom: 8 }}>Vielen Dank!</h2>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.6,
                color: "var(--ion-color-medium)",
                maxWidth: 380,
              }}
            >
              Wir haben dir eine Bestätigungsmail geschickt. Bitte klicke darin
              auf den Link, um deine E-Mail-Adresse zu bestätigen.
            </p>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.5,
                color: "var(--ion-color-medium)",
                marginTop: 16,
                maxWidth: 380,
              }}
            >
              Danach wird dein Konto durch das <strong>Verbundberatung Berlin</strong>{" "}
              geprüft und freigegeben.
            </p>
            <IonButton
              expand="block"
              onClick={() => history.push("/konto")}
              style={{ marginTop: 24, minWidth: 200 }}
            >
              Zum Konto
            </IonButton>
          </div>
          <Footer />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/registrieren" />
          </IonButtons>
          <IonTitle>Verbundberatung Berlin</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonCard>
          <IonCardContent
            style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
          >
            <IonIcon
              icon={shieldCheckmarkOutline}
              color="primary"
              style={{ fontSize: 28, flexShrink: 0, marginTop: 2 }}
            />
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--ion-color-secondary)",
                }}
              >
                Interner Zugang
              </h3>
              <IonText color="medium">
                <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.5 }}>
                  Diese Registrierung ist ausschließlich für Mitarbeitende des
                  Verbundberatung Berlin gedacht. Dein Konto wird erst nach
                  E-Mail-Bestätigung <strong>und</strong> Freigabe durch das{" "}
                  <strong>Verbundberatung Berlin</strong> aktiv.
                </p>
              </IonText>
            </div>
          </IonCardContent>
        </IonCard>

        <form onSubmit={handleSubmit}>
          <IonList>
            <IonListHeader>
              <IonLabel>Login-Daten</IonLabel>
            </IonListHeader>
            <IonItem>
              <IonInput
                label="Name *"
                labelPlacement="stacked"
                required
                value={name}
                onIonInput={(e) => setName(e.detail.value ?? "")}
              />
            </IonItem>
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
              {busy ? "Bitte warten…" : "Konto anfragen"}
            </IonButton>
            <IonNote>
              <p style={{ marginTop: 8 }}>* = Pflichtfeld</p>
              <p style={{ marginTop: 16 }}>
                Bist du keine Mitarbeiter:in der Verbundberatung?{" "}
                <Link to="/registrieren">Hier regulär als Azubi oder Betrieb registrieren</Link>.
              </p>
            </IonNote>
          </div>
        </form>
        <Footer />
      </IonContent>
    </IonPage>
  );
};

export default RegisterVerbundbuero;
