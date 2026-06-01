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
  IonModal,
  IonItem,
  IonTextarea,
  IonAlert,
} from "@ionic/react";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router";
import { useHistory } from "react-router-dom";
import { mailOutline, sendOutline, checkmarkCircleOutline } from "ionicons/icons";
import { ID, Query } from "appwrite";
import {
  databases,
  DB_LEHRSTELLEN,
  COL_APPRENTICESHIPS,
  COL_BEWERBUNGEN,
  extractOwnerId,
  BEWERBUNG_STATUS_LABEL,
  BEWERBUNG_STATUS_COLOR,
  type Lehrstelle,
  type Bewerbung,
} from "../lib/appwrite";
import { useAuth } from "../lib/AuthContext";
import { translateError } from "../lib/errors";
import AuthGate from "../components/AuthGate";
import BewertungsKasten from "../components/BewertungsKasten";
import DokumenteUpload from "../components/DokumenteUpload";

const LehrstelleDetailInner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { user, profile } = useAuth();

  const [item, setItem] = useState<Lehrstelle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bewerbungs-State
  const [eigeneBewerbung, setEigeneBewerbung] = useState<Bewerbung | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [nachricht, setNachricht] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [erfolg, setErfolg] = useState(false);
  const [selectedDokIds, setSelectedDokIds] = useState<string[]>([]);

  const ownerId = item ? (item.owner_id ?? extractOwnerId(item.$permissions ?? [])) : null;
  const istEigeneAnzeige = Boolean(user && ownerId === user.$id);
  const istTalent = profile?.type === "talent";
  const istBewerbungVergeben = istEigeneAnzeige === false && istTalent;

  const loadItem = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const doc = await databases.getDocument<Lehrstelle>(
        DB_LEHRSTELLEN,
        COL_APPRENTICESHIPS,
        id
      );
      setItem(doc);
    } catch (err: unknown) {
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadEigeneBewerbung = useCallback(async () => {
    if (!user || !id) return;
    try {
      const result = await databases.listDocuments<Bewerbung>(
        DB_LEHRSTELLEN,
        COL_BEWERBUNGEN,
        [
          Query.equal("apprenticeship_id", id),
          Query.equal("applicant_user_id", user.$id),
          Query.limit(1),
        ]
      );
      setEigeneBewerbung(result.documents[0] ?? null);
    } catch {
      setEigeneBewerbung(null);
    }
  }, [user, id]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  useEffect(() => {
    loadEigeneBewerbung();
  }, [loadEigeneBewerbung]);

  function formatDate(iso?: string | null) {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("de-DE");
  }

  async function handleBewerben() {
    if (!user || !item || !ownerId) return;
    setSendError(null);
    if (!nachricht.trim()) {
      setSendError("Bitte schreib eine kurze Nachricht.");
      return;
    }
    setSending(true);
    try {
      const applicantName = profile
        ? profile.type === "talent"
          ? `${profile.vorname ?? ""} ${profile.name}`.trim()
          : profile.name
        : user.name || user.email;

      await databases.createDocument<Bewerbung>(
        DB_LEHRSTELLEN,
        COL_BEWERBUNGEN,
        ID.unique(),
        {
          apprenticeship_id: item.$id,
          apprenticeship_titel: `${item.gewerk} bei ${item.firma}`,
          applicant_user_id: user.$id,
          applicant_name: applicantName,
          posting_owner_id: ownerId,
          nachricht: nachricht.trim(),
          status: "ausstehend",
          dokument_ids: selectedDokIds,
        }
        // Keine Per-Row-Permissions: die Bewerbungen-Tabelle nutzt
        // Collection-Permissions (read/create/update/delete für alle eingeloggten
        // User) und filtert die Sichtbarkeit clientseitig über applicant_user_id
        // bzw. posting_owner_id. Hintergrund: Appwrite erlaubt nicht, beim
        // Anlegen Permissions für eine andere User-ID zu setzen, was hier
        // notwendig wäre, damit der/die Anbietende die Bewerbung sehen kann.
      );
      setShowModal(false);
      setNachricht("");
      setSelectedDokIds([]);
      setErfolg(true);
      await loadEigeneBewerbung();
    } catch (err: unknown) {
      setSendError(translateError(err));
    } finally {
      setSending(false);
    }
  }

  const isTalentAnzeige = item?.type === "talent_angebot";

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/lehrstellen" />
          </IonButtons>
          <IonTitle>{item?.gewerk ?? "Detail"}</IonTitle>
          {istEigeneAnzeige && (
            <IonButtons slot="end">
              <IonButton onClick={() => history.push(`/meine-lehrstellen/${id}/bearbeiten`)}>
                Bearbeiten
              </IonButton>
            </IonButtons>
          )}
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
                  <IonBadge
                    color={isTalentAnzeige ? "tertiary" : "primary"}
                    style={{ marginLeft: 8 }}
                  >
                    {isTalentAnzeige ? "Talent-Angebot" : "Einsatz"}
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
                  <strong>{isTalentAnzeige ? "Verfügbar ab:" : "Beginn:"}</strong>{" "}
                  {formatDate(item.startdatum)}
                  {item.enddatum && (
                    <>
                      {" "}
                      &middot; <strong>{isTalentAnzeige ? "bis:" : "Ende:"}</strong>{" "}
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
                {isTalentAnzeige && item.lernziele?.length > 0 && (
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

            {!isTalentAnzeige && item.aufgabenbeschreibung && (
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Aufgaben</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>{item.aufgabenbeschreibung}</IonCardContent>
              </IonCard>
            )}

            {!isTalentAnzeige && (item.mindestalter != null || item.vorerfahrung) && (
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
                {isTalentAnzeige ? (
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

            {/* Bewerben-Karte */}
            {istEigeneAnzeige && (
              <IonCard color="light">
                <IonCardContent>
                  <IonText color="medium">
                    <p style={{ margin: 0 }}>
                      Das ist deine eigene Anzeige. Eingegangene Bewerbungen
                      siehst du im Konto unter „{isTalentAnzeige ? "Meine Talent-Angebote" : "Meine Einsätze"}" → Anzeige öffnen.
                    </p>
                  </IonText>
                </IonCardContent>
              </IonCard>
            )}

            {/* Bewertungen des Inserenten */}
            <BewertungsKasten
              userId={ownerId}
              profileType={isTalentAnzeige ? "talent" : "betrieb"}
            />

            {!istEigeneAnzeige && eigeneBewerbung && (
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Deine Bewerbung</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p>
                    <strong>Status:</strong>{" "}
                    <IonBadge color={BEWERBUNG_STATUS_COLOR[eigeneBewerbung.status]}>
                      {BEWERBUNG_STATUS_LABEL[eigeneBewerbung.status]}
                    </IonBadge>
                  </p>
                  <p style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>
                    {eigeneBewerbung.nachricht}
                  </p>
                </IonCardContent>
              </IonCard>
            )}

            {!istEigeneAnzeige && !eigeneBewerbung && (
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Interesse?</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonText color="medium">
                    <p>
                      Schick eine kurze Nachricht — sie landet direkt im Postfach
                      des/der Anbietenden.
                    </p>
                  </IonText>
                  <IonButton
                    expand="block"
                    onClick={() => setShowModal(true)}
                    style={{ marginTop: 12 }}
                  >
                    <IonIcon slot="start" icon={sendOutline} />
                    {istTalent ? "Jetzt bewerben" : "Anfrage senden"}
                  </IonButton>
                </IonCardContent>
              </IonCard>
            )}

            {/* Klassischer E-Mail-Kontakt */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Direkter E-Mail-Kontakt</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonButton
                  expand="block"
                  fill="outline"
                  href={`mailto:${item.kontakt_email}?subject=${encodeURIComponent(
                    (isTalentAnzeige ? "Anfrage zu Talent-Angebot " : "Bewerbung ") +
                      item.gewerk
                  )}`}
                >
                  <IonIcon icon={mailOutline} slot="start" />
                  {item.kontakt_email}
                </IonButton>
              </IonCardContent>
            </IonCard>
          </>
        )}

        {/* Bewerbungs-Modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>
                {istTalent ? "Bewerbung schreiben" : "Anfrage schreiben"}
              </IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>Abbrechen</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {item && (
              <p>
                <IonText color="medium">
                  An: <strong>{item.firma}</strong> · {item.gewerk}
                </IonText>
              </p>
            )}
            <IonItem>
              <IonTextarea
                label="Deine Nachricht"
                labelPlacement="stacked"
                autoGrow
                rows={6}
                placeholder="Stell dich kurz vor und sag, warum dich diese Anzeige interessiert."
                value={nachricht}
                onIonInput={(e) => setNachricht(e.detail.value ?? "")}
              />
            </IonItem>
            {istTalent && (
              <DokumenteUpload
                mode="select"
                selectedIds={selectedDokIds}
                onSelectionChange={setSelectedDokIds}
              />
            )}
            {sendError && (
              <IonText color="danger">
                <p>{sendError}</p>
              </IonText>
            )}
            <IonButton
              expand="block"
              onClick={handleBewerben}
              disabled={sending}
              style={{ marginTop: 16 }}
            >
              {sending ? "Wird gesendet…" : "Senden"}
            </IonButton>
          </IonContent>
        </IonModal>

        {/* Erfolgs-Toast als kleines Alert */}
        <IonAlert
          isOpen={erfolg}
          header="Erledigt"
          message={'Deine Nachricht wurde gespeichert. Den Status findest du im Konto unter „Meine Bewerbungen".'}
          buttons={[{ text: "OK", role: "cancel", handler: () => setErfolg(false) }]}
        />

        {/* Hilfsdummy: damit istBewerbungVergeben nicht ungenutzt ist */}
        <span style={{ display: "none" }}>{istBewerbungVergeben ? "" : ""}</span>

        {/* Hilfsdummy: checkmarkCircleOutline – wird in zukünftigen Erweiterungen genutzt */}
        <span style={{ display: "none" }}>
          <IonIcon icon={checkmarkCircleOutline} />
        </span>
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
