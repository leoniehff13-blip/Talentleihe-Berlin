import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonChip,
  IonLabel,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { mailOutline } from "ionicons/icons";
import {
  databases,
  DB_LEHRSTELLEN,
  COL_APPRENTICESHIPS,
  type Lehrstelle,
} from "../lib/appwrite";

const LehrstelleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Lehrstelle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const doc = await databases.getDocument<Lehrstelle>(
          DB_LEHRSTELLEN,
          COL_APPRENTICESHIPS,
          id
        );
        if (!cancelled) setItem(doc);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  function formatDate(iso?: string | null) {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("de-DE");
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/lehrstellen" />
          </IonButtons>
          <IonTitle>{item?.gewerk ?? "Detail"}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
            <IonSpinner name="crescent" />
          </div>
        )}

        {error && (
          <IonText color="danger">
            <p>Fehler: {error}</p>
          </IonText>
        )}

        {item && (
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardSubtitle>{item.firma}</IonCardSubtitle>
                <IonCardTitle>{item.gewerk}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p>
                  <strong>Ort:</strong> {item.ort}
                </p>
                <p>
                  <strong>Beginn:</strong> {formatDate(item.startdatum)}
                  {item.enddatum && <> &middot; <strong>Ende:</strong> {formatDate(item.enddatum)}</>}
                </p>
                {item.spezialisierungen?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    {item.spezialisierungen.map((s) => (
                      <IonChip key={s} color="primary">
                        <IonLabel>{s}</IonLabel>
                      </IonChip>
                    ))}
                  </div>
                )}
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Aufgaben</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>{item.aufgabenbeschreibung}</IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Voraussetzungen</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {item.mindestalter != null && (
                  <p>
                    <strong>Mindestalter:</strong> {item.mindestalter} Jahre
                  </p>
                )}
                {item.vorerfahrung && (
                  <p>
                    <strong>Vorerfahrung:</strong> {item.vorerfahrung}
                  </p>
                )}
                {!item.mindestalter && !item.vorerfahrung && (
                  <IonText color="medium">
                    <p>Keine besonderen Voraussetzungen angegeben.</p>
                  </IonText>
                )}
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Standort</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {item.adresse && <p>{item.adresse}</p>}
                {(item.plz || item.stadt) && (
                  <p>
                    {item.plz} {item.stadt}
                  </p>
                )}
                {item.bundesland && <p>{item.bundesland}</p>}
                {item.handwerkskammer && (
                  <p style={{ marginTop: 8 }}>
                    <IonText color="medium">{item.handwerkskammer}</IonText>
                  </p>
                )}
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Kontakt</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonButton
                  expand="block"
                  href={`mailto:${item.kontakt_email}?subject=Bewerbung%20${encodeURIComponent(item.gewerk)}`}
                >
                  <IonIcon icon={mailOutline} slot="start" />
                  {item.kontakt_email}
                </IonButton>
              </IonCardContent>
            </IonCard>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default LehrstelleDetail;
