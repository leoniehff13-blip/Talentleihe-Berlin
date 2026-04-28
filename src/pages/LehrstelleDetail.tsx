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
  IonBadge,
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
import AuthGate from "../components/AuthGate";

const LehrstelleDetailInner: React.FC = () => {
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

  const isTalent = item?.type === "talent_angebot";

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
                <IonCardSubtitle>
                  {item.firma}{" "}
                  <IonBadge color={isTalent ? "tertiary" : "primary"} style={{ marginLeft: 8 }}>
                    {isTalent ? "Talent-Angebot" : "Einsatz"}
                  </IonBadge>
                </IonCardSubtitle>
                <IonCardTitle>{item.gewerk}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {item.ort && (
                  <p>
                    <strong>Ort:</strong> {item.ort}
                  </p>
                )}
                <p>
                  <strong>{isTalent ? "Verfügbar ab:" : "Beginn:"}</strong>{" "}
                  {formatDate(item.startdatum)}
                  {item.enddatum && (
                    <>
                      {" "}
                      &middot; <strong>{isTalent ? "bis:" : "Ende:"}</strong>{" "}
                      {formatDate(item.enddatum)}
                    </>
                  )}
                </p>
                {item.spezialisierungen?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <p>
                      <strong>Spezialisierungen:</strong>
                    </p>
                    {item.spezialisierungen.map((s) => (
                      <IonChip key={s} color="primary">
                        <IonLabel>{s}</IonLabel>
                      </IonChip>
                    ))}
                  </div>
                )}
                {isTalent && item.lernziele?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <p>
                      <strong>Lernziele:</strong>
                    </p>
                    {item.lernziele.map((s) => (
                      <IonChip key={s} color="tertiary">
                        <IonLabel>{s}</IonLabel>
                      </IonChip>
                    ))}
                  </div>
                )}
              </IonCardContent>
            </IonCard>

            {!isTalent && item.aufgabenbeschreibung && (
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Aufgaben</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>{item.aufgabenbeschreibung}</IonCardContent>
              </IonCard>
            )}

            {!isTalent && (item.mindestalter != null || item.vorerfahrung) && (
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
                </IonCardContent>
              </IonCard>
            )}

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Standort</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {isTalent ? (
                  <>
                    {item.plz && (
                      <p>
                        <strong>PLZ:</strong> {item.plz}
                      </p>
                    )}
                    {item.plz_umkreis != null && (
                      <p>
                        <strong>Umkreis:</strong> {item.plz_umkreis} km
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    {item.adresse && <p>{item.adresse}</p>}
                    {(item.plz || item.stadt) && (
                      <p>
                        {item.plz} {item.stadt}
                      </p>
                    )}
                    {item.bundesland && <p>{item.bundesland}</p>}
                  </>
                )}
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
                  href={`mailto:${item.kontakt_email}?subject=${encodeURIComponent(
                    (isTalent ? "Anfrage zu Talent-Angebot " : "Bewerbung ") + item.gewerk
                  )}`}
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

const LehrstelleDetail: React.FC = () => (
  <AuthGate title="Detail" backHref="/lehrstellen">
    <LehrstelleDetailInner />
  </AuthGate>
);

export default LehrstelleDetail;
