import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { mailUnreadOutline } from "ionicons/icons";
import { useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { translateError } from "../lib/errors";

interface VerifizierungsWandProps {
  /** Toolbar-Titel. */
  title: string;
  /** Optional: defaultHref für den Back-Button. Wenn weggelassen, kein Back-Button. */
  backHref?: string;
}

/**
 * Cover-Wand, die unbestätigte Nutzer:innen sehen, bis sie ihre E-Mail
 * bestätigt haben. Bietet „Mail erneut senden", „neu laden" und „Ausloggen".
 * Wird sowohl vom AuthGate (geschützte Seiten) als auch direkt nach der
 * Registrierung (Konto-Seite) verwendet.
 */
const VerifizierungsWand: React.FC<VerifizierungsWandProps> = ({ title, backHref }) => {
  const { user, sendVerification, refresh, logout } = useAuth();
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
              <strong style={{ color: "var(--tb-blue)" }}>{user?.email}</strong>
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
};

export default VerifizierungsWand;
