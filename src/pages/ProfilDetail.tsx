import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSpinner,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonChip,
  IonLabel,
  IonList,
  IonItem,
} from "@ionic/react";
import { useEffect, useState } from "react";
import ZurueckButton from "../components/ZurueckButton";
import { useParams } from "react-router";
import { Query } from "appwrite";
import {
  databases,
  DB_LEHRSTELLEN,
  COL_PROFILES,
  type Profile,
} from "../lib/appwrite";
import { translateError } from "../lib/errors";
import AuthGate from "../components/AuthGate";
import BewertungsKasten from "../components/BewertungsKasten";

const ProfilDetailInner: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    databases
      .listDocuments<Profile>(DB_LEHRSTELLEN, COL_PROFILES, [
        Query.equal("user_id", userId),
        Query.limit(1),
      ])
      .then((res) => {
        setProfile(res.documents[0] ?? null);
      })
      .catch((err) => setError(translateError(err)))
      .finally(() => setLoading(false));
  }, [userId]);

  const isTalent = profile?.type === "talent";

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>

          <IonTitle>{profile ? (isTalent ? "Talent-Profil" : "Betriebsprofil") : "Profil"}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <ZurueckButton style={{ marginBottom: 8 }} />
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

        {!loading && !profile && !error && (
          <IonText color="medium">
            <p>Kein öffentliches Profil vorhanden.</p>
          </IonText>
        )}

        {profile && (
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardSubtitle>{isTalent ? "Talent (Azubi)" : "Betrieb"}</IonCardSubtitle>
                <IonCardTitle>
                  {isTalent
                    ? [profile.anrede, profile.vorname, profile.name].filter(Boolean).join(" ")
                    : profile.name}
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList lines="none">
                  {profile.gewerk && (
                    <IonItem>
                      <IonLabel>
                        <h3>Gewerk</h3>
                        <p>{profile.gewerk}</p>
                      </IonLabel>
                    </IonItem>
                  )}
                  {profile.handwerkskammer && (
                    <IonItem>
                      <IonLabel>
                        <h3>Handwerkskammer</h3>
                        <p>{profile.handwerkskammer}</p>
                      </IonLabel>
                    </IonItem>
                  )}
                  {isTalent && profile.lehrjahr && (
                    <IonItem>
                      <IonLabel>
                        <h3>Lehrjahr</h3>
                        <p>{profile.lehrjahr}. Lehrjahr</p>
                      </IonLabel>
                    </IonItem>
                  )}
                  {isTalent && profile.unternehmen && (
                    <IonItem>
                      <IonLabel>
                        <h3>Ausbildungsbetrieb</h3>
                        <p>{profile.unternehmen}</p>
                      </IonLabel>
                    </IonItem>
                  )}
                  {isTalent && profile.berufsschule && (
                    <IonItem>
                      <IonLabel>
                        <h3>Berufsschule</h3>
                        <p>{profile.berufsschule}</p>
                      </IonLabel>
                    </IonItem>
                  )}
                  {isTalent && profile.ort && (
                    <IonItem>
                      <IonLabel>
                        <h3>Wohnort</h3>
                        <p>{profile.ort}</p>
                      </IonLabel>
                    </IonItem>
                  )}
                  {!isTalent && profile.adresse && (
                    <IonItem>
                      <IonLabel>
                        <h3>Adresse</h3>
                        <p style={{ whiteSpace: "pre-line" }}>{profile.adresse}</p>
                      </IonLabel>
                    </IonItem>
                  )}
                  {!isTalent && profile.ansprechpartner && (
                    <IonItem>
                      <IonLabel>
                        <h3>Ansprechpartner:in</h3>
                        <p>
                          {[profile.anrede, profile.ansprechpartner].filter(Boolean).join(" ")}
                        </p>
                        {profile.ansprechpartner_email && (
                          <p>{profile.ansprechpartner_email}</p>
                        )}
                      </IonLabel>
                    </IonItem>
                  )}
                </IonList>

                {isTalent && profile.faehigkeiten?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <p style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: 6 }}>
                      Fähigkeiten
                    </p>
                    {profile.faehigkeiten.map((f) => (
                      <IonChip key={f} color="primary">
                        <IonLabel>{f}</IonLabel>
                      </IonChip>
                    ))}
                  </div>
                )}

                {!isTalent && profile.spezialisierung?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <p style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: 6 }}>
                      Spezialisierung
                    </p>
                    {profile.spezialisierung.map((s) => (
                      <IonChip key={s} color="primary">
                        <IonLabel>{s}</IonLabel>
                      </IonChip>
                    ))}
                  </div>
                )}
              </IonCardContent>
            </IonCard>

            <BewertungsKasten
              userId={userId}
              profileType={isTalent ? "talent" : "betrieb"}
            />
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

const ProfilDetail: React.FC = () => (
  <AuthGate title="Profil">
    <ProfilDetailInner />
  </AuthGate>
);

export default ProfilDetail;
