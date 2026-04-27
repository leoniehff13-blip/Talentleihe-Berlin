import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonBadge,
  IonSpinner,
  IonText,
  IonSelect,
  IonSelectOption,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import { useEffect, useState, useCallback } from "react";
import { Query } from "appwrite";
import {
  databases,
  DB_LEHRSTELLEN,
  COL_APPRENTICESHIPS,
  BUNDESLAENDER,
  type Lehrstelle,
  type Bundesland,
} from "../lib/appwrite";

const Lehrstellen: React.FC = () => {
  const [items, setItems] = useState<Lehrstelle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bundesland, setBundesland] = useState<Bundesland | "alle">("alle");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queries: string[] = [Query.orderDesc("startdatum"), Query.limit(50)];
      if (bundesland !== "alle") {
        queries.push(Query.equal("bundesland", bundesland));
      }
      const result = await databases.listDocuments<Lehrstelle>(
        DB_LEHRSTELLEN,
        COL_APPRENTICESHIPS,
        queries
      );
      setItems(result.documents);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [bundesland]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Lehrstellen</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={(e) => load().finally(() => e.detail.complete())}>
          <IonRefresherContent />
        </IonRefresher>

        <IonItem lines="full">
          <IonLabel>Bundesland</IonLabel>
          <IonSelect
            value={bundesland}
            interface="popover"
            onIonChange={(e) => setBundesland(e.detail.value as Bundesland | "alle")}
          >
            <IonSelectOption value="alle">Alle</IonSelectOption>
            {BUNDESLAENDER.map((b) => (
              <IonSelectOption key={b} value={b}>
                {b}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
            <IonSpinner name="crescent" />
          </div>
        )}

        {error && (
          <div className="ion-padding">
            <IonText color="danger">
              <p>Fehler beim Laden: {error}</p>
            </IonText>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="ion-padding">
            <IonText color="medium">
              <p>Keine Lehrstellen für diese Auswahl gefunden.</p>
            </IonText>
          </div>
        )}

        {!loading && items.length > 0 && (
          <IonList>
            {items.map((item) => (
              <IonItem
                key={item.$id}
                routerLink={`/lehrstellen/${item.$id}`}
                detail
              >
                <IonLabel>
                  <h2>{item.gewerk}</h2>
                  <p>
                    {item.firma} · {item.ort}
                  </p>
                  <IonNote>
                    Start: {new Date(item.startdatum).toLocaleDateString("de-DE")}
                  </IonNote>
                </IonLabel>
                {item.bundesland && (
                  <IonBadge color="medium" slot="end">
                    {item.bundesland}
                  </IonBadge>
                )}
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Lehrstellen;
