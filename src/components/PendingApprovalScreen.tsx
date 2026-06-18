import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardContent,
  IonText,
  IonIcon,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { hourglassOutline } from "ionicons/icons";
import { useAuth } from "../lib/AuthContext";

/**
 * Wird angezeigt, wenn ein Verbundberatung-User eingeloggt ist, aber noch nicht
 * freigegeben wurde.
 */
const PendingApprovalScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const history = useHistory();

  async function handleLogout() {
    await logout();
    history.replace("/home");
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Verbundberatung Berlin</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonCard>
          <IonCardContent style={{ textAlign: "center", padding: 28 }}>
            <IonIcon
              icon={hourglassOutline}
              color="primary"
              style={{ fontSize: 56, marginBottom: 16 }}
            />
            <h2
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                color: "var(--ion-color-secondary)",
              }}
            >
              Dein Konto wartet auf Freigabe
            </h2>
            <IonText color="medium">
              <p style={{ margin: "10px 0 0", lineHeight: 1.55 }}>
                Du hast dich als Mitarbeiter:in der Verbundberatung registriert.
                Damit du Zugriff auf alle Daten bekommst, muss dein Konto durch
                das <strong>Verbundberatung Berlin</strong> freigegeben werden.
              </p>
              <p style={{ margin: "12px 0 0", lineHeight: 1.55 }}>
                Sobald das <strong>Verbundberatung Berlin</strong> dich
                freigegeben hat, kannst du dich erneut einloggen und das
                Portal nutzen.
              </p>
              {user?.email && (
                <p
                  style={{
                    margin: "16px 0 0",
                    fontSize: 13,
                    color: "var(--ion-color-medium)",
                  }}
                >
                  Eingeloggt als <strong>{user.email}</strong>
                </p>
              )}
            </IonText>
          </IonCardContent>
        </IonCard>

        <IonButton expand="block" color="medium" onClick={handleLogout}>
          Logout
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default PendingApprovalScreen;
