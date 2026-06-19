import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonSpinner,
} from "@ionic/react";
import { useMemo, useState } from "react";
import ZurueckButton from "../../components/ZurueckButton";
import { useHistory, useLocation } from "react-router-dom";
import { trashOutline, checkmarkCircleOutline, alertCircleOutline } from "ionicons/icons";
import { useAuth } from "../../lib/AuthContext";
import { confirmAccountDeletion } from "../../lib/accountDeletion";

type Status = "idle" | "busy" | "done" | "error";

/**
 * Zielseite des Lösch-Links aus der Bestätigungsmail
 * (/konto-loeschen?userId=…&secret=…).
 * Nach einem letzten bewussten Klick wird das Konto endgültig gelöscht.
 */
const KontoLoeschen: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { logout } = useAuth();

  const { userId, secret } = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      userId: params.get("userId") ?? "",
      secret: params.get("secret") ?? "",
    };
  }, [location.search]);

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const linkUnvollstaendig = !userId || !secret;

  async function handleDelete() {
    setStatus("busy");
    setMessage(null);
    try {
      await confirmAccountDeletion(userId, secret);
      // Lokale Session/State aufräumen (der Auth-User ist serverseitig weg).
      try {
        await logout();
      } catch {
        /* Session ist durch die Löschung ohnehin ungültig */
      }
      setStatus("done");
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : String(err));
    }
  }

  const card = (children: React.ReactNode) => (
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
        {children}
      </div>
    </div>
  );

  function badge(icon: string, color: string, bg: string) {
    return (
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: "50%",
          margin: "0 auto 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: bg,
        }}
      >
        <IonIcon icon={icon} style={{ fontSize: 40, color }} />
      </div>
    );
  }

  const heading = (text: string) => (
    <h2
      style={{
        margin: "0 0 10px",
        fontSize: 22,
        fontWeight: 800,
        letterSpacing: "-0.02em",
        color: "var(--tb-blue)",
      }}
    >
      {text}
    </h2>
  );

  const paragraph = (text: string) => (
    <p style={{ margin: "0 0 22px", fontSize: 15, lineHeight: 1.55, color: "var(--tb-text-mid)" }}>
      {text}
    </p>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>

          <IonTitle>Konto löschen</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <ZurueckButton style={{ marginBottom: 8 }} />
        {linkUnvollstaendig &&
          card(
            <>
              {badge(alertCircleOutline, "var(--ion-color-warning)", "rgba(240, 160, 48, 0.14)")}
              {heading("Link unvollständig")}
              {paragraph(
                "Dieser Bestätigungslink ist ungültig oder unvollständig. Bitte fordere die Löschung in deinem Konto erneut an."
              )}
              <IonButton expand="block" fill="outline" color="secondary" onClick={() => history.replace("/konto")}>
                Zum Konto
              </IonButton>
            </>
          )}

        {!linkUnvollstaendig &&
          status === "done" &&
          card(
            <>
              {badge(checkmarkCircleOutline, "var(--ion-color-success)", "rgba(150, 183, 64, 0.14)")}
              {heading("Konto gelöscht")}
              {paragraph(
                "Dein Konto und alle zugehörigen Daten wurden endgültig gelöscht. Schade, dass du gehst – danke, dass du VerbundPraxis Berlin genutzt hast."
              )}
              <IonButton expand="block" onClick={() => history.replace("/home")}>
                Zur Startseite
              </IonButton>
            </>
          )}

        {!linkUnvollstaendig &&
          status !== "done" &&
          card(
            <>
              {badge(trashOutline, "var(--ion-color-danger)", "rgba(224, 80, 96, 0.12)")}
              {heading("Konto endgültig löschen?")}
              {paragraph(
                "Hiermit werden dein Konto und ALLE zugehörigen Daten (Profil, Anzeigen, Bewerbungen, Bewertungen und Dokumente) unwiderruflich gelöscht. Das lässt sich nicht rückgängig machen."
              )}

              <IonButton
                expand="block"
                color="danger"
                disabled={status === "busy"}
                onClick={handleDelete}
                style={{ "--border-radius": "14px", marginBottom: 10 } as React.CSSProperties}
              >
                {status === "busy" ? <IonSpinner name="crescent" /> : "Ja, Konto endgültig löschen"}
              </IonButton>
              <IonButton
                expand="block"
                fill="outline"
                color="secondary"
                disabled={status === "busy"}
                onClick={() => history.replace("/konto")}
                style={{ "--border-radius": "14px" } as React.CSSProperties}
              >
                Abbrechen
              </IonButton>

              {status === "error" && message && (
                <div
                  style={{
                    marginTop: 18,
                    padding: "12px 14px",
                    borderRadius: 12,
                    fontSize: 13.5,
                    lineHeight: 1.45,
                    textAlign: "left",
                    background: "rgba(224, 80, 96, 0.10)",
                    color: "var(--ion-color-danger-shade)",
                  }}
                >
                  {message}
                </div>
              )}
            </>
          )}
      </IonContent>
    </IonPage>
  );
};

export default KontoLoeschen;
