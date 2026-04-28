import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardContent,
  IonText,
  IonButton,
  IonSpinner,
  IonIcon,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { lockClosedOutline } from "ionicons/icons";
import { useAuth } from "../lib/AuthContext";
import type { ReactNode } from "react";

interface AuthGateProps {
  /** Toolbar-Titel, wenn die Login-Wand gezeigt wird. */
  title: string;
  /** Optional: defaultHref für den Back-Button. Wenn weggelassen, kein Back-Button. */
  backHref?: string;
  /** Was angezeigt wird, sobald der User eingeloggt ist. */
  children: ReactNode;
}

/**
 * AuthGate kapselt die "Login-Wand", die wir auf mehreren Seiten brauchen.
 * Solange die Auth-Prüfung läuft, zeigt sie einen Spinner.
 * Wenn niemand eingeloggt ist, eine Karte mit Registrieren/Einloggen.
 * Sobald jemand eingeloggt ist, werden die Children gerendert (i.d.R. die
 * eigentliche IonPage der Zielkomponente).
 */
const AuthGate: React.FC<AuthGateProps> = ({ title, backHref, children }) => {
  const { user, loading } = useAuth();
  const history = useHistory();

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            {backHref && (
              <IonButtons slot="start">
                <IonBackButton defaultHref={backHref} />
              </IonButtons>
            )}
            <IonTitle>{title}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!user) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            {backHref && (
              <IonButtons slot="start">
                <IonBackButton defaultHref={backHref} />
              </IonButtons>
            )}
            <IonTitle>{title}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="ion-padding">
          <IonCard>
            <IonCardContent style={{ textAlign: "center", padding: 24 }}>
              <IonIcon
                icon={lockClosedOutline}
                color="primary"
                style={{ fontSize: 48, marginBottom: 12 }}
              />
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--ion-color-secondary)",
                }}
              >
                Nur für registrierte Nutzer:innen
              </h2>
              <IonText color="medium">
                <p style={{ margin: "8px 0 20px" }}>
                  Um diesen Bereich zu sehen, brauchst du ein Konto. Die
                  Registrierung dauert ungefähr zwei Minuten.
                </p>
              </IonText>
              <IonButton
                expand="block"
                onClick={() => history.push("/registrieren")}
              >
                Jetzt registrieren
              </IonButton>
              <IonButton
                expand="block"
                fill="outline"
                color="secondary"
                onClick={() => history.push("/login")}
                style={{ marginTop: 8 }}
              >
                Schon ein Konto? Einloggen
              </IonButton>
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonPage>
    );
  }

  return <>{children}</>;
};

export default AuthGate;
