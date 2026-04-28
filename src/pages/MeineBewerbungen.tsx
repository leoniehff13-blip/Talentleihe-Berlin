import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from "@ionic/react";
import AuthGate from "../components/AuthGate";

const MeineBewerbungenInner: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/konto" />
          </IonButtons>
          <IonTitle>Meine Bewerbungen</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Noch keine Bewerbungen</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText>
              <p>
                Hier findest du später alle Lehrstellen oder Talent-Angebote, auf
                die du dich beworben oder bei denen du angefragt hast.
              </p>
              <p style={{ marginTop: 12 }}>
                Sobald du im Detail einer Anzeige auf <em>„Kontakt aufnehmen"</em>
                {" "}klickst, erscheint die Anfrage hier mit dem aktuellen Status.
              </p>
            </IonText>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

const MeineBewerbungen: React.FC = () => (
  <AuthGate title="Meine Bewerbungen" backHref="/konto">
    <MeineBewerbungenInner />
  </AuthGate>
);

export default MeineBewerbungen;
