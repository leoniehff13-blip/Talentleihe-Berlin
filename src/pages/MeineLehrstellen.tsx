import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
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
  IonBadge,
} from "@ionic/react";
import Footer from "../components/Footer";
import { useEffect, useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { add, create, trash, peopleOutline } from "ionicons/icons";
import { Query } from "appwrite";
import {
  databases,
  DB_LEHRSTELLEN,
  COL_APPRENTICESHIPS,
  type Lehrstelle,
} from "../lib/appwrite";
import { useAuth } from "../lib/AuthContext";
import { translateError } from "../lib/errors";
import AuthGate from "../components/AuthGate";

const MeineLehrstellenInner: React.FC = () => {
  const { user, profile } = useAuth();
  const history = useHistory();
  const [items, setItems] = useState<Lehrstelle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Lehrstelle | null>(null);

  const isTalent = profile?.type === "talent";
  const titleText = isTalent ? "Meine Talent-Angebote" : "Meine Einsätze";
  const newButtonText = isTalent ? "Erstes Talent-Angebot anlegen" : "Ersten Einsatz anlegen";
  const emptyText = isTalent
    ? "Du hast noch kein Talent-Angebot angelegt."
    : "Du hast noch keinen Einsatz angelegt.";

  const load = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
const result = await databases.listDocuments<Lehrstelle>(
        DB_LEHRSTELLEN,
        COL_APPRENTICESHIPS,
        [
          Query.equal("owner_id", user.$id),
          Query.orderDesc("$createdAt"),
          Query.limit(100),
        ]
      );
      setItems(result.documents);
    } catch (err: unknown) {
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(item: Lehrstelle) {
    try {
      await databases.deleteDocument(DB_LEHRSTELLEN, COL_APPRENTICESHIPS, item.$id);
      setItems((prev) => prev.filter((i) => i.$id !== item.$id));
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
          <IonTitle>{titleText}</IonTitle>
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
              <p>{emptyText}</p>
            </IonText>
            <IonButton
              expand="block"
              onClick={() => history.push("/meine-lehrstellen/neu")}
            >
              <IonIcon icon={add} slot="start" />
              {newButtonText}
            </IonButton>
          </div>
        )}

        {!loading && items.length > 0 && (
          <IonList>
            {items.map((item) => {
              const itemIsTalent = item.type === "talent_angebot";
              return (
                <IonItemSliding key={item.$id}>
                  <IonItem
                    button
                    onClick={() => history.push(`/lehrstellen/${item.$id}`)}
                    detail
                  >
                    <IonLabel>
                      <h2>{item.gewerk}</h2>
                      <p>
                        {item.firma} · {item.ort}
                      </p>
                      <IonNote>
                        {itemIsTalent ? "Verfügbar ab" : "Start"}:{" "}
                        {new Date(item.startdatum).toLocaleDateString("de-DE")}
                      </IonNote>
                    </IonLabel>
                    <IonBadge
                      color={itemIsTalent ? "tertiary" : "primary"}
                      slot="end"
                    >
                      {itemIsTalent ? "Talent" : "Einsatz"}
                    </IonBadge>
                  </IonItem>
                  <IonItemOptions side="end">
                    <IonItemOption
                      color="tertiary"
                      onClick={() =>
                        history.push(`/meine-lehrstellen/${item.$id}/bewerbungen`)
                      }
                    >
                      <IonIcon slot="icon-only" icon={peopleOutline} />
                    </IonItemOption>
                    <IonItemOption
                      color="primary"
                      onClick={() =>
                        history.push(`/meine-lehrstellen/${item.$id}/bearbeiten`)
                      }
                    >
                      <IonIcon slot="icon-only" icon={create} />
                    </IonItemOption>
                    <IonItemOption
                      color="danger"
                      onClick={() => setConfirmDelete(item)}
                    >
                      <IonIcon slot="icon-only" icon={trash} />
                    </IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>
              );
            })}
          </IonList>
        )}

        <IonAlert
          isOpen={confirmDelete !== null}
          header="Wirklich löschen?"
          message={
            confirmDelete
              ? `"${confirmDelete.gewerk}" bei ${confirmDelete.firma} wird unwiderruflich entfernt.`
              : ""
          }
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
        <Footer />
      </IonContent>
    </IonPage>
  );
};

const MeineLehrstellen: React.FC = () => (
  <AuthGate title="Meine Anzeigen" backHref="/konto">
    <MeineLehrstellenInner />
  </AuthGate>
);

export default MeineLehrstellen;
