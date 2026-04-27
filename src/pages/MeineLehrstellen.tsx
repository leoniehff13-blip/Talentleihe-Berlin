import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonSpinner,
  IonText,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonAlert,
} from "@ionic/react";
import { useEffect, useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { add, create, trash } from "ionicons/icons";
import { Query } from "appwrite";
import {
  databases,
  DB_LEHRSTELLEN,
  COL_APPRENTICESHIPS,
  type Lehrstelle,
} from "../lib/appwrite";
import { useAuth } from "../lib/AuthContext";

const MeineLehrstellen: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const history = useHistory();
  const [items, setItems] = useState<Lehrstelle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Lehrstelle | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Wir filtern lokal: alle Dokumente, in deren Permissions
      // unsere User-ID als update-berechtigt steht.
      // Einfachster Ansatz: alles laden und im Frontend filtern.
      // (Bei vielen Datensätzen würde man einen owner-Spalten-Filter ergänzen.)
      const result = await databases.listDocuments<Lehrstelle>(
        DB_LEHRSTELLEN,
        COL_APPRENTICESHIPS,
        [Query.orderDesc("$createdAt"), Query.limit(100)]
      );
      const own = result.documents.filter((d) =>
        (d.$permissions ?? []).some((p) => p.includes(`user:${user.$id}`))
      );
      setItems(own);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    load();
  }, [authLoading, load]);

  async function handleDelete(item: Lehrstelle) {
    try {
      await databases.deleteDocument(DB_LEHRSTELLEN, COL_APPRENTICESHIPS, item.$id);
      setItems((prev) => prev.filter((i) => i.$id !== item.$id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  if (authLoading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!user) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Meine Lehrstellen</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonText>
            <p>Bitte logge dich ein, um eigene Lehrstellen anzulegen oder zu verwalten.</p>
          </IonText>
          <IonButton expand="block" onClick={() => history.push("/login")}>
            Zum Login
          </IonButton>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Meine Lehrstellen</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => history.push("/meine-lehrstellen/neu")}>
              <IonIcon icon={add} slot="icon-only" />
            </IonButton>
          </IonButtons>
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
            <IonText color="medium">
              <p>Du hast noch keine Lehrstellen angelegt.</p>
            </IonText>
            <IonButton
              expand="block"
              onClick={() => history.push("/meine-lehrstellen/neu")}
            >
              <IonIcon icon={add} slot="start" />
              Erste Lehrstelle anlegen
            </IonButton>
          </div>
        )}

        {!loading && items.length > 0 && (
          <IonList>
            {items.map((item) => (
              <IonItemSliding key={item.$id}>
                <IonItem button onClick={() => history.push(`/lehrstellen/${item.$id}`)} detail>
                  <IonLabel>
                    <h2>{item.gewerk}</h2>
                    <p>
                      {item.firma} · {item.ort}
                    </p>
                    <IonNote>
                      Start: {new Date(item.startdatum).toLocaleDateString("de-DE")}
                    </IonNote>
                  </IonLabel>
                </IonItem>
                <IonItemOptions side="end">
                  <IonItemOption
                    color="primary"
                    onClick={() => history.push(`/meine-lehrstellen/${item.$id}/bearbeiten`)}
                  >
                    <IonIcon slot="icon-only" icon={create} />
                  </IonItemOption>
                  <IonItemOption color="danger" onClick={() => setConfirmDelete(item)}>
                    <IonIcon slot="icon-only" icon={trash} />
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            ))}
          </IonList>
        )}

        <IonAlert
          isOpen={confirmDelete !== null}
          header="Wirklich löschen?"
          message={confirmDelete ? `"${confirmDelete.gewerk}" bei ${confirmDelete.firma} wird unwiderruflich entfernt.` : ""}
          buttons={[
            { text: "Abbrechen", role: "cancel", handler: () => setConfirmDelete(null) },
            {
              text: "Löschen",
              role: "destructive",
              handler: () => {
                if (confirmDelete) handleDelete(confirmDelete);
                setConfirmDelete(null);
              },
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default MeineLehrstellen;
