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
  IonIcon,
} from "@ionic/react";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router";
import { useHistory } from "react-router-dom";
import { Query } from "appwrite";
import {
  checkmarkOutline,
  closeOutline,
  mailOutline,
  documentOutline,
  downloadOutline,
} from "ionicons/icons";
import {
  databases,
  storage,
  DB_LEHRSTELLEN,
  COL_APPRENTICESHIPS,
  COL_BEWERBUNGEN,
  COL_BEWERTUNGEN,
  COL_DOKUMENTE,
  BUCKET_DOKUMENTE,
  BEWERBUNG_STATUS_LABEL,
  BEWERBUNG_STATUS_COLOR,
  type Bewerbung,
  type Bewertung,
  type Dokument,
  type Lehrstelle,
} from "../lib/appwrite";
import { useAuth } from "../lib/AuthContext";
import { translateError } from "../lib/errors";
import AuthGate from "../components/AuthGate";
import BewertungsKasten from "../components/BewertungsKasten";

const BewerbungenZurAnzeigeInner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const history = useHistory();
  const [anzeige, setAnzeige] = useState<Lehrstelle | null>(null);
  const [bewerbungen, setBewerbungen] = useState<Bewerbung[]>([]);
  const [bereitsBewertet, setBereitsBewertet] = useState<Set<string>>(new Set());
  const [dokumenteMap, setDokumenteMap] = useState<Map<string, Dokument>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [anz, bws] = await Promise.all([
        databases.getDocument<Lehrstelle>(DB_LEHRSTELLEN, COL_APPRENTICESHIPS, id),
        databases.listDocuments<Bewerbung>(DB_LEHRSTELLEN, COL_BEWERBUNGEN, [
          Query.equal("apprenticeship_id", id),
          Query.orderDesc("$createdAt"),
          Query.limit(100),
        ]),
      ]);
      setAnzeige(anz);
      setBewerbungen(bws.documents);

      // Dokumente laden für alle Bewerbungen mit Anhängen
      const alleFileIds = bws.documents.flatMap((b) => b.dokument_ids ?? []);
      if (alleFileIds.length > 0) {
        try {
          const dokRes = await databases.listDocuments<Dokument>(
            DB_LEHRSTELLEN,
            COL_DOKUMENTE,
            [Query.equal("file_id", alleFileIds), Query.limit(200)]
          );
          const map = new Map<string, Dokument>();
          dokRes.documents.forEach((d) => map.set(d.file_id, d));
          setDokumenteMap(map);
        } catch {
          // optional
        }
      }

      // Bereits abgegebene Bewertungen laden
      const angenommene = bws.documents.filter((b) => b.status === "angenommen");
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
          // Collection noch leer
        }
      }
    } catch (err: unknown) {
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(b: Bewerbung, status: Bewerbung["status"]) {
    try {
      await databases.updateDocument(DB_LEHRSTELLEN, COL_BEWERBUNGEN, b.$id, { status });
      setBewerbungen((prev) =>
        prev.map((x) => (x.$id === b.$id ? { ...x, status } : x))
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
            <IonBackButton defaultHref="/meine-lehrstellen" />
          </IonButtons>
          <IonTitle>Bewerbungen</IonTitle>
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

        {anzeige && (
          <div className="ion-padding" style={{ paddingBottom: 0 }}>
            <IonText color="medium">
              <p style={{ margin: 0 }}>Bewerbungen zu</p>
            </IonText>
            <h2
              style={{
                margin: "4px 0 16px",
                fontSize: 18,
                fontWeight: 700,
                color: "var(--ion-color-secondary)",
              }}
            >
              {anzeige.gewerk} bei {anzeige.firma}
            </h2>
          </div>
        )}

        {!loading && bewerbungen.length === 0 && (
          <div className="ion-padding">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Noch keine Bewerbungen</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonText color="medium">
                  <p>
                    Sobald sich jemand auf diese Anzeige bewirbt, taucht sie
                    hier auf.
                  </p>
                </IonText>
              </IonCardContent>
            </IonCard>
          </div>
        )}

        {!loading && bewerbungen.length > 0 && (
          <IonList>
            {bewerbungen.map((b) => {
              const offen = b.status === "ausstehend";
              const kannBewerten = b.status === "angenommen" && !bereitsBewertet.has(b.$id);
              // Posting owner rates the applicant (opposite type)
              const ratedType = profile?.type === "betrieb" ? "talent" : "betrieb";
              return (
                <IonCard key={b.$id}>
                  <IonCardHeader>
                    <IonCardTitle
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 16,
                      }}
                    >
                      <span>{b.applicant_name ?? "Unbekannt"}</span>
                      <IonBadge color={BEWERBUNG_STATUS_COLOR[b.status]}>
                        {BEWERBUNG_STATUS_LABEL[b.status]}
                      </IonBadge>
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonNote>
                      Eingegangen am{" "}
                      {new Date(b.$createdAt).toLocaleDateString("de-DE")}
                    </IonNote>
                    <p style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>
                      {b.nachricht}
                    </p>

                    {/* Angehängte Dokumente */}
                    {(b.dokument_ids ?? []).length > 0 && (
                      <div style={{ marginTop: 14 }}>
                        <p style={{ fontWeight: 700, fontSize: "0.82rem", color: "#1E367A", marginBottom: 6 }}>
                          Angehängte Unterlagen
                        </p>
                        {(b.dokument_ids ?? []).map((fileId) => {
                          const dok = dokumenteMap.get(fileId);
                          return (
                            <IonButton
                              key={fileId}
                              expand="block"
                              fill="outline"
                              size="small"
                              href={storage.getFileDownload(BUCKET_DOKUMENTE, fileId).toString()}
                              target="_blank"
                              style={{ marginBottom: 4 }}
                            >
                              <IonIcon slot="start" icon={documentOutline} />
                              {dok?.filename ?? fileId}
                              <IonIcon slot="end" icon={downloadOutline} />
                            </IonButton>
                          );
                        })}
                      </div>
                    )}

                    {offen && (
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          marginTop: 16,
                        }}
                      >
                        <IonButton
                          color="success"
                          expand="block"
                          onClick={() => setStatus(b, "angenommen")}
                          style={{ flex: 1 }}
                        >
                          <IonIcon slot="start" icon={checkmarkOutline} />
                          Annehmen
                        </IonButton>
                        <IonButton
                          color="danger"
                          fill="outline"
                          expand="block"
                          onClick={() => setStatus(b, "abgelehnt")}
                          style={{ flex: 1 }}
                        >
                          <IonIcon slot="start" icon={closeOutline} />
                          Ablehnen
                        </IonButton>
                      </div>
                    )}

                    {b.status === "angenommen" && anzeige && (
                      <IonButton
                        expand="block"
                        href={`mailto:${anzeige.kontakt_email}?subject=${encodeURIComponent(
                          `Zusage: ${anzeige.gewerk}`
                        )}`}
                        style={{ marginTop: 12 }}
                      >
                        <IonIcon slot="start" icon={mailOutline} />
                        Per E-Mail antworten
                      </IonButton>
                    )}
                    {kannBewerten && (
                      <IonButton
                        expand="block"
                        color="warning"
                        fill="outline"
                        style={{ marginTop: 8 }}
                        onClick={() => history.push(`/bewertung/${b.$id}/${b.applicant_user_id}/${ratedType}`)}
                      >
                        ★ Einsatz bewerten
                      </IonButton>
                    )}
                  </IonCardContent>
                  {b.status === "angenommen" && b.applicant_user_id && (
                    <div style={{ padding: "0 16px 8px" }}>
                      <BewertungsKasten
                        userId={b.applicant_user_id}
                        profileType={ratedType as "talent" | "betrieb"}
                      />
                    </div>
                  )}
                  <IonItem lines="none">
                    <IonLabel color="medium" style={{ fontSize: 12 }}>
                      Bewerber-ID: {b.applicant_user_id}
                    </IonLabel>
                  </IonItem>
                </IonCard>
              );
            })}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

const BewerbungenZurAnzeige: React.FC = () => (
  <AuthGate title="Bewerbungen" backHref="/meine-lehrstellen">
    <BewerbungenZurAnzeigeInner />
  </AuthGate>
);

export default BewerbungenZurAnzeige;
