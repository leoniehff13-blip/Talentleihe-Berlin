import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonIcon,
} from "@ionic/react";
import { informationCircleOutline } from "ionicons/icons";

const Informationen: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Informationen</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <IonIcon icon={informationCircleOutline} color="primary" />
              Bald verfügbar
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText>
              <p>
                Hier entstehen demnächst Hintergrundinformationen rund um die
                Talentleihe — z. B. zu Ablauf, Versicherungsschutz, Vergütung,
                Datenschutz und FAQs.
              </p>
              <p style={{ marginTop: 12 }}>
                Schau gerne wieder vorbei.
              </p>
            </IonText>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Informationen;
