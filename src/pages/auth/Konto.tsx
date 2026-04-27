import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonSpinner,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";
import Login from "./Login";

const Konto: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const history = useHistory();

  async function handleLogout() {
    await logout();
    history.replace("/lehrstellen");
  }

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!user) {
    // Wer nicht eingeloggt ist, sieht direkt die Login-Maske unter dem Konto-Tab.
    return <Login />;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Konto</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardSubtitle>Eingeloggt als</IonCardSubtitle>
            <IonCardTitle>{user.name || user.email}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>{user.email}</p>
            <p style={{ marginTop: 16 }}>
              Du kannst jetzt unter <strong>Meine Lehrstellen</strong> eigene Lehrstellen anlegen,
              bearbeiten oder löschen.
            </p>
          </IonCardContent>
        </IonCard>
        <IonButton expand="block" color="medium" onClick={handleLogout}>
          Logout
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Konto;
