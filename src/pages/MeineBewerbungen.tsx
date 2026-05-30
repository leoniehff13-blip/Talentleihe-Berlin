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
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonNote,
  IonSpinner,
  IonButton,
  IonAlert,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonIcon,
} from "@ionic/react";
import Footer from "../components/Footer";
import { useEffect, useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { trash } from "ionicons/icons";
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

const MeineBewerbungenInner: React.FC = () => {
  const { user, profile } = useAuth();
  const history = useHistory();
  const [items, setItems] = useState<Bewerbung[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmZurueckziehen, setConfirmZurueckziehen] = useState<Bewerbung | null>(null);
  const [bereitsBewertet, setBereitsBewertet] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const isBetrieb = profile?.type === "betrieb";
    setError(null);
    try {
      const result = await databases.listDocuments<Bewerbung>(
        DB_LEHRSTELLEN,
        COL_BEWERBUNGEN,
        [
          isBetrieb ? Query.equal("posting_owner_id", user.$id) : Query.equal("applicant_user_id", user.$id),
          Query.orderDesc("$createdAt"),
          Query.limit(100),
        ]
      );
      const docs = result.documents;
      setItems(docs);

      // Bereits abgegebene Bewertungen laden
      const angenommene = docs.filter((b) => b.status === "angenommen");
      if (angenommene.length > 0 && user) {
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
        } catch {
          // Collection noch leer – kein Fehler
        }
      }
    } catch (err: unknown) {
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleZurueckziehen(b: Bewerbung) {
    try {
      await databases.updateDocument(DB_LEHRSTELLEN, COL_BEWERBUNGEN, b.$id, {
        status: "zurueckgezogen",
      });
      setItems((prev) =>
        prev.map((x) => (x.$id === b.$id ? { ...x, status: "zurueckgezogen" } : x))
      );
    } catch (err: unknown) {
      setError(translateError(err));
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/konto" />
          </IonButtons>
          <IonTitle>{profile?.type === "betrieb" ? "Eingegangene Bewerbungen" : "Meine Bewerbungen"}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
            <IonSpinner name="crescent" />
          </div>
        )}

        {error && (
          <div className="ion-padding">
            <IonText color="danger">
              <p>{error}</p>
            </IonText>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="ion-padding">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Noch keine Bewerbungen</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonText>
                  <p>
                    profile?.type === 'betrieb' ? 'Sobald sich jemand auf eine deiner Anzeigen bewirbt, erscheint sie hier.' : 'Sobald du im Detail einer Anzeige auf <em>„Bewerben" / „Anfrage senden"</em>{" "}
                    klickst, erscheint die Bewerbung hier mit dem aktuellen Status.
                  </p>
                </IonText>
                <IonButton
                  expand="block"
                  onClick={() => history.push("/lehrstellen")}
                  style={{ marginTop: 16 }}
                >
                  Zur Talentleihe
                </IonButton>
              </IonCardContent>
            </IonCard>
          </div>
        )}

        {!loading && items.length > 0 && (
          <IonList>
            {items.map((b) => {
              const aktiv = b.status === "ausstehend" || b.status === "angenommen";
              const kannBewerten = b.status === "angenommen" && !bereitsBewertet.has(b.$id);
              // Rated type: applicant rates the other side
              const ratedType = profile?.type === "talent" ? "betrieb" : "talent";
              return (
                <IonItemSliding key={b.$id}>
                  <IonItem
                    button
                    onClick={() => history.push(`/lehrstellen/${b.apprenticeship_id}`)}
                    detail
                  >
                    <IonLabel>
                      <h2>{b.apprenticeship_titel ?? "Anzeige"}</h2>
                      <p style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {b.nachricht}
                      </p>
                      <IonNote>
                        Beworben am{" "}
                        {new Date(b.$createdAt).toLocaleDateString("de-DE")}
                      </IonNote>
                      {kannBewerten && (
                        <IonNote color="warning" style={{ display: "block", marginTop: 4 }}>
                          ★ Einsatz abgeschlossen? Bewertung abgeben →
                        </IonNote>
                      )}
                    </IonLabel>
                    <IonBadge color={BEWERBUNG_STATUS_COLOR[b.status]} slot="end">
                      {BEWERBUNG_STATUS_LABEL[b.status]}
                    </IonBadge>
                  </IonItem>
                  {kannBewerten && (
                    <IonItemOptions side="start">
                      <IonItemOption
                        color="warning"
                        onClick={() => history.push(`/bewertung/${b.$id}/${b.posting_owner_id}/${ratedType}`)}
                      >
                        Bewerten
                      </IonItemOption>
                    </IonItemOptions>
                  )}
                  {aktiv && (
                    <IonItemOptions side="end">
                      <IonItemOption
                        color="medium"
                        onClick={() => setConfirmZurueckziehen(b)}
                      >
                        <IonIcon slot="icon-only" icon={trash} />
                      </IonItemOption>
                    </IonItemOptions>
                  )}
                </IonItemSliding>
              );
            })}
          </IonList>
        )}

        {/* Bewertungen für angenommene Einsätze */}
        {items.filter((b) => b.status === "angenommen" && b.posting_owner_id).length > 0 && (
          <div className="ion-padding-horizontal" style={{ paddingTop: 8 }}>
            <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1E367A", marginBottom: 4 }}>
              Bewertungen der Einsatzbetriebe
            </p>
            {items
              .filter((b) => b.status === "angenommen" && b.posting_owner_id)
              .map((b) => {
                const ratedType = profile?.type === "talent" ? "betrieb" : "talent";
                return (
                  <div key={`bew-${b.$id}`}>
                    <p style={{ fontSize: "0.82rem", color: "#4a6080", margin: "8px 0 0", fontWeight: 600 }}>
                      {b.apprenticeship_titel ?? "Einsatz"}
                    </p>
                    <BewertungsKasten
                      userId={b.posting_owner_id}
                      profileType={ratedType as "talent" | "betrieb"}
                    />
                  </div>
                );
              })}
          </div>
        )}

        <IonAlert
          isOpen={confirmZurueckziehen !== null}
          header="Bewerbung zurückziehen?"
          message={
            confirmZurueckziehen
              ? `Deine Bewerbung zu "${confirmZurueckziehen.apprenticeship_titel}" wird auf "Zurückgezogen" gesetzt. Sie bleibt für den/die Anbietende sichtbar.`
              : ""
          }
          buttons={[
            { text: "Abbrechen", role: "cancel", handler: () => setConfirmZurueckziehen(null) },
            {
              text: "Zurückziehen",
              role: "destructive",
              handler: () => {
                if (confirmZurueckziehen) handleZurueckziehen(confirmZurueckziehen);
                setConfirmZurueckziehen(null);
              },
            },
          ]}
        />
        <Footer />
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
