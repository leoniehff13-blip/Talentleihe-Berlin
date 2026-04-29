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
import { useEffect, useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { trash } from "ionicons/icons";
import { Query } from "appwrite";
import {
  databases,
  DB_LEHRSTELLEN,
  COL_BEWERBUNGEN,
  BEWERBUNG_STATUS_LABEL,
  BEWERBUNG_STATUS_COLOR,
  type Bewerbung,
} from "../lib/appwrite";
import { useAuth } from "../lib/AuthContext";
import AuthGate from "../components/AuthGate";

const MeineBewerbungenInner: React.FC = () => {
  const { user } = useAuth();
  const history = useHistory();
  const [items, setItems] = useState<Bewerbung[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmZurueckziehen, setConfirmZurueckziehen] = useState<Bewerbung | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const result = await databases.listDocuments<Bewerbung>(
        DB_LEHRSTELLEN,
        COL_BEWERBUNGEN,
        [
          Query.equal("applicant_user_id", user.$id),
          Query.orderDesc("$createdAt"),
          Query.limit(100),
        ]
      );
      setItems(result.documents);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
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
      setError(err instanceof Error ? err.message : String(err));
    }
  }

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
                    Sobald du im Detail einer Anzeige auf <em>„Bewerben" / „Anfrage senden"</em>{" "}
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
                    </IonLabel>
                    <IonBadge color={BEWERBUNG_STATUS_COLOR[b.status]} slot="end">
                      {BEWERBUNG_STATUS_LABEL[b.status]}
                    </IonBadge>
                  </IonItem>
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
