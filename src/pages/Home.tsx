import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonText,
} from "@ionic/react";
import { useState } from "react";
import { account } from "../lib/appwrite";

const Home: React.FC = () => {
  const [status, setStatus] = useState<string>("Noch nicht getestet");

  async function pingAppwrite() {
    setStatus("Verbinde …");
    try {
      // get() wirft, wenn niemand eingeloggt ist – das ist ok für einen Verbindungstest.
      await account.get();
      setStatus("Verbunden und eingeloggt.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.toLowerCase().includes("missing scope")) {
        setStatus("Verbindung steht (kein User eingeloggt – das ist ok).");
      } else {
        setStatus(`Fehler: ${message}`);
      }
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Win-Win Talentleihe</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardSubtitle>Willkommen</IonCardSubtitle>
            <IonCardTitle>Talentleihe</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            Diese App ist die Web/Mobile-Version der ehemaligen Flutter-App
            (Lehrstellen-Radar). Hier baust du die UI mit Ionic-Komponenten.
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Appwrite-Verbindung testen</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonButton expand="block" onClick={pingAppwrite}>
              Verbindung prüfen
            </IonButton>
            <IonText>
              <p style={{ marginTop: 12 }}>{status}</p>
            </IonText>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Home;
