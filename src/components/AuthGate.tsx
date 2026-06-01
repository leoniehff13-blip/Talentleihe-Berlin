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
import { lockClosedOutline, mailUnreadOutline } from "ionicons/icons";
import { useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { translateError } from "../lib/errors";
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
 * Wenn jemand eingeloggt, aber die E-Mail noch nicht bestätigt ist, eine
 * Verifizierungs-Wand mit "Mail erneut senden" – geschützte Bereiche bleiben
 * gesperrt, bis die E-Mail bestätigt wurde.
 * Sobald jemand eingeloggt UND verifiziert ist, werden die Children gerendert.
 */
const AuthGate: React.FC<AuthGateProps> = ({ title, backHref, children }) => {
  const { user, loading, sendVerification, refresh, logout } = useAuth();
  const history = useHistory();
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<"idle" | "sent" | "error">("idle");

  async function handleResend() {
    setVerifyBusy(true);
    setVerifyMsg(null);
    try {
      await sendVerification();
      setVerifyStatus("sent");
      setVerifyMsg("Bestätigungsmail wurde erneut gesendet. Bitte prüfe dein Postfach (auch den Spam-Ordner).");
    } catch (err: unknown) {
      setVerifyStatus("error");
      setVerifyMsg(translateError(err));
    } finally {
      setVerifyBusy(false);
    }
  }

  async function handleLogout() {
    await logout();
    history.replace("/login");
  }

  const Toolbar = (
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
  );

  if (loading) {
    return (
      <IonPage>
        {Toolbar}
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
        {Toolbar}
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

  if (!user.emailVerification) {
    return (
      <IonPage>
        {Toolbar}
        <IonContent fullscreen className="ion-padding">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "100%",
              padding: "16px 4px",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 440,
                background: "var(--tb-white)",
                borderRadius: 24,
                boxShadow: "0 12px 32px rgba(30, 54, 122, 0.12)",
                padding: "32px 26px 26px",
                textAlign: "center",
              }}
            >
              {/* Icon-Badge in Markenfarbe */}
              <div
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: "50%",
                  margin: "0 auto 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(240, 160, 48, 0.14)",
                }}
              >
                <IonIcon
                  icon={mailUnreadOutline}
                  style={{ fontSize: 40, color: "var(--ion-color-warning)" }}
                />
              </div>

              <h2
                style={{
                  margin: "0 0 10px",
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "var(--tb-blue)",
                }}
              >
                Nur noch ein Schritt
              </h2>

              <p
                style={{
                  margin: "0 0 22px",
                  fontSize: 15,
                  lineHeight: 1.55,
                  color: "var(--tb-text-mid)",
                }}
              >
                Wir haben dir eine Bestätigungsmail an
                <br />
                <strong style={{ color: "var(--tb-blue)" }}>{user.email}</strong>
                <br />
                geschickt. Klicke auf den Link in der Mail, um dein Konto
                freizuschalten. Erst danach kannst du diesen Bereich nutzen.
              </p>

              <IonButton
                expand="block"
                disabled={verifyBusy}
                onClick={handleResend}
                style={{ "--border-radius": "14px", marginBottom: 10 } as React.CSSProperties}
              >
                {verifyBusy ? "Senden…" : "Bestätigungsmail erneut senden"}
              </IonButton>
              <IonButton
                expand="block"
                fill="outline"
                color="secondary"
                onClick={() => refresh()}
                style={{ "--border-radius": "14px" } as React.CSSProperties}
              >
                Ich habe bestätigt – neu laden
              </IonButton>

              {verifyMsg && (
                <div
                  style={{
                    marginTop: 18,
                    padding: "12px 14px",
                    borderRadius: 12,
                    fontSize: 13.5,
                    lineHeight: 1.45,
                    textAlign: "left",
                    background:
                      verifyStatus === "error"
                        ? "rgba(224, 80, 96, 0.10)"
                        : "rgba(150, 183, 64, 0.12)",
                    color:
                      verifyStatus === "error"
                        ? "var(--ion-color-danger-shade)"
                        : "var(--ion-color-success-shade)",
                  }}
                >
                  {verifyMsg}
                </div>
              )}

              <div
                style={{
                  marginTop: 22,
                  paddingTop: 16,
                  borderTop: "1px solid rgba(30, 54, 122, 0.08)",
                }}
              >
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: 12.5,
                    color: "var(--tb-text-light)",
                  }}
                >
                  Falsche E-Mail-Adresse oder anderes Konto?
                </p>
                <IonButton
                  fill="clear"
                  size="small"
                  color="medium"
                  onClick={handleLogout}
                >
                  Ausloggen
                </IonButton>
              </div>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return <>{children}</>;
};

export default AuthGate;
