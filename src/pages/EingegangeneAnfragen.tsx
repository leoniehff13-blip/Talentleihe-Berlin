import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonNote,
  IonSpinner,
  IonButton,
  IonIcon,
} from "@ionic/react";
import Footer from "../components/Footer";
import { useEffect, useState, useCallback, Fragment } from "react";
import ZurueckButton from "../components/ZurueckButton";
import { useHistory } from "react-router-dom";
import { checkmarkOutline, closeOutline } from "ionicons/icons";
import { Query } from "appwrite";
import {
  databases,
  DB_LEHRSTELLEN,
  COL_BEWERBUNGEN,
  COL_BEWERTUNGEN,
  BEWERBUNG_STATUS_LABEL,
  BEWERBUNG_STATUS_COLOR,
  type Bewerbung,
  type Bewertung,
} from "../lib/appwrite";
import { useAuth } from "../lib/AuthContext";
import { translateError } from "../lib/errors";
import AuthGate from "../components/AuthGate";
import BewertungsKasten from "../components/BewertungsKasten";

const EingegangeneAnfragenInner: React.FC = () => {
  const { user, profile } = useAuth();
  const history = useHistory();
  const [items, setItems] = useState<Bewerbung[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bereitsBewertet, setBereitsBewertet] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const result = await databases.listDocuments<Bewerbung>(
        DB_LEHRSTELLEN,
        COL_BEWERBUNGEN,
        [
          Query.equal("posting_owner_id", user.$id),
          Query.orderDesc("$createdAt"),
          Query.limit(100),
        ]
      );
      const docs = result.documents;
      setItems(docs);

      const angenommene = docs.filter((b) => b.status === "angenommen");
      if (angenommene.length > 0) {
        try {
          const bewResult = await databases.listDocuments<Bewertung>(
            DB_LEHRSTELLEN,
            COL_BEWERTUNGEN,
            [
              Query.equal("rater_user_id", user.$id),
              Query.equal("bewerbung_id", angenommene.map((b) => b.$id)),
              Query.limit(100),
            ]
          );
          setBereitsBewertet(new Set(bewResult.documents.map((b) => b.bewerbung_id)));
        } catch { /* noch keine Bewertungen */ }
      }
    } catch (err: unknown) {
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function setStatus(b: Bewerbung, status: Bewerbung["status"]) {
    try {
      await databases.updateDocument(DB_LEHRSTELLEN, COL_BEWERBUNGEN, b.$id, { status });
      setItems((prev) => prev.map((x) => (x.$id === b.$id ? { ...x, status } : x)));
    } catch (err: unknown) {
      setError(translateError(err));
    }
  }

  // Bewerbungstyp bestimmt wer bewertet wird
  const ratedType = profile?.type === "betrieb" ? "talent" : "betrieb";

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Eingegangene Anfragen</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="ion-padding-horizontal" style={{ paddingTop: 8, paddingBottom: 4 }}>
          <ZurueckButton />
        </div>

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
            <IonSpinner name="crescent" />
          </div>
        )}

        {error && (
          <div className="ion-padding">
            <IonText color="danger"><p>{error}</p></IonText>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="ion-padding">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Noch keine Anfragen</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonText color="medium">
                  <p>
                    Sobald jemand auf eine deiner Anzeigen antwortet, erscheint die Anfrage hier.
                  </p>
                </IonText>
              </IonCardContent>
            </IonCard>
          </div>
        )}

        {!loading && items.length > 0 && (
          <IonList>
            {items.map((b) => {
              const offen = b.status === "ausstehend";
              const angenommen = b.status === "angenommen";
              const kannBewerten = angenommen && !bereitsBewertet.has(b.$id);
              const ratedUserId = b.applicant_user_id;
              return (
                <Fragment key={b.$id}>
                  <IonItem
                    button
                    onClick={() => history.push(`/meine-anzeigen/${b.apprenticeship_id}/bewerbungen`)}
                    detail
                  >
                    <IonLabel>
                      <h2>{b.applicant_name ?? "Unbekannt"}</h2>
                      <p style={{ fontSize: "0.82rem", color: "#4a6080" }}>
                        {b.apprenticeship_titel ?? "—"}
                      </p>
                      <p style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {b.nachricht}
                      </p>
                      <IonNote>
                        Eingegangen am{" "}
                        {new Date(b.$createdAt).toLocaleDateString("de-DE")}
                      </IonNote>
                      {kannBewerten && (
                        <IonNote color="warning" style={{ display: "block", marginTop: 4 }}>
                          ★ Einsatz abgeschlossen? Jetzt bewerten ↓
                        </IonNote>
                      )}
                    </IonLabel>
                    <IonBadge color={BEWERBUNG_STATUS_COLOR[b.status]} slot="end">
                      {BEWERBUNG_STATUS_LABEL[b.status]}
                    </IonBadge>
                  </IonItem>

                  {offen && (
                    <div style={{ display: "flex", gap: 8, padding: "6px 16px 8px" }}>
                      <IonButton
                        expand="block"
                        color="success"
                        fill="outline"
                        style={{ flex: 1 }}
                        onClick={() => setStatus(b, "angenommen")}
                      >
                        <IonIcon slot="start" icon={checkmarkOutline} />
                        Annehmen
                      </IonButton>
                      <IonButton
                        expand="block"
                        color="danger"
                        fill="outline"
                        style={{ flex: 1 }}
                        onClick={() => setStatus(b, "abgelehnt")}
                      >
                        <IonIcon slot="start" icon={closeOutline} />
                        Ablehnen
                      </IonButton>
                    </div>
                  )}

                  {angenommen && ratedUserId && (
                    <div className="ion-padding-horizontal" style={{ paddingTop: 4, paddingBottom: 4 }}>
                      <IonButton
                        expand="block"
                        color="warning"
                        fill={bereitsBewertet.has(b.$id) ? "clear" : "outline"}
                        onClick={() => history.push(`/bewertung/${b.$id}/${ratedUserId}/${ratedType}`)}
                      >
                        {bereitsBewertet.has(b.$id) ? "Bewertung ansehen / bearbeiten" : "★ Einsatz bewerten"}
                      </IonButton>
                    </div>
                  )}
                </Fragment>
              );
            })}
          </IonList>
        )}

        {items.filter((b) => b.status === "angenommen").length > 0 && (
          <div className="ion-padding-horizontal" style={{ paddingTop: 8 }}>
            <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1E367A", marginBottom: 4 }}>
              Bewertungen
            </p>
            {items
              .filter((b) => b.status === "angenommen")
              .map((b) => {
                const ratedUserId = b.applicant_user_id;
                if (!ratedUserId) return null;
                return (
                  <div key={`bew-${b.$id}`}>
                    <p style={{ fontSize: "0.82rem", color: "#4a6080", margin: "8px 0 0", fontWeight: 600 }}>
                      {b.applicant_name ?? "Bewerber:in"}
                    </p>
                    <BewertungsKasten userId={ratedUserId} profileType={ratedType} />
                  </div>
                );
              })}
          </div>
        )}

        <Footer />
      </IonContent>
    </IonPage>
  );
};

const EingegangeneAnfragen: React.FC = () => (
  <AuthGate title="Eingegangene Anfragen" backHref="/konto">
    <EingegangeneAnfragenInner />
  </AuthGate>
);

export default EingegangeneAnfragen;
