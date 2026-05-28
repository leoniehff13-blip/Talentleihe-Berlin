import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonTextarea,
  IonButton,
  IonText,
  IonSpinner,
} from "@ionic/react";
import { useState, useEffect, useCallback } from "react";
import { useParams, useHistory } from "react-router-dom";
import { ID, Query } from "appwrite";
import {
  databases,
  DB_LEHRSTELLEN,
  COL_BEWERTUNGEN,
  BEWERTUNG_KATEGORIEN,
  type Bewertung,
} from "../lib/appwrite";
import { useAuth } from "../lib/AuthContext";
import { translateError } from "../lib/errors";
import AuthGate from "../components/AuthGate";

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "2rem",
            lineHeight: 1,
            padding: "2px 4px",
            color: s <= (hovered || value) ? "#f5a623" : "#ddd",
            transition: "color 0.1s",
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

const LABELS = ["", "Mangelhaft", "Ausreichend", "Befriedigend", "Gut", "Sehr gut"];

const BewertungInner: React.FC = () => {
  const { bewerbungId, ratedUserId, ratedType } = useParams<{
    bewerbungId: string;
    ratedUserId: string;
    ratedType: string;
  }>();
  const { user } = useAuth();
  const history = useHistory();

  const typ = (ratedType === "talent" || ratedType === "betrieb") ? ratedType : "betrieb";
  const kategorien = BEWERTUNG_KATEGORIEN[typ];

  const [kat1, setKat1] = useState(0);
  const [kat2, setKat2] = useState(0);
  const [kat3, setKat3] = useState(0);
  const [kommentar, setKommentar] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bereitsBewertet, setBereitsBewertet] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkDuplicate = useCallback(async () => {
    if (!user) return;
    try {
      const result = await databases.listDocuments<Bewertung>(
        DB_LEHRSTELLEN,
        COL_BEWERTUNGEN,
        [
          Query.equal("bewerbung_id", bewerbungId),
          Query.equal("rater_user_id", user.$id),
          Query.limit(1),
        ]
      );
      setBereitsBewertet(result.total > 0);
    } catch {
      // Collection exists but might be empty – no action needed
    } finally {
      setChecking(false);
    }
  }, [user, bewerbungId]);

  useEffect(() => {
    checkDuplicate();
  }, [checkDuplicate]);

  async function handleSubmit() {
    if (!user) return;
    if (kat1 === 0 || kat2 === 0 || kat3 === 0) {
      setError("Bitte alle Kategorien mit Sternen bewerten.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await databases.createDocument<Bewertung>(
        DB_LEHRSTELLEN,
        COL_BEWERTUNGEN,
        ID.unique(),
        {
          bewerbung_id: bewerbungId,
          rated_user_id: ratedUserId,
          rater_user_id: user.$id,
          rated_type: typ,
          kat1,
          kat2,
          kat3,
          kommentar: kommentar.trim() || null,
        }
      );
      setSaved(true);
    } catch (err: unknown) {
      setError(translateError(err));
    } finally {
      setSaving(false);
    }
  }

  if (checking) {
    return (
      <IonPage>
        <IonContent>
          <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/meine-bewerbungen" />
          </IonButtons>
          <IonTitle>Bewertung abgeben</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        {bereitsBewertet && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Bereits bewertet</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText color="medium">
                <p>Du hast für diesen Einsatz bereits eine Bewertung abgegeben.</p>
              </IonText>
              <IonButton expand="block" onClick={() => history.goBack()} style={{ marginTop: 16 }}>
                Zurück
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}

        {saved && (
          <IonCard color="success">
            <IonCardContent>
              <p style={{ color: "white", fontWeight: 700 }}>Vielen Dank! Deine Bewertung wurde gespeichert.</p>
              <IonButton expand="block" fill="outline" color="light" onClick={() => history.replace("/meine-bewerbungen")} style={{ marginTop: 12 }}>
                Zu meinen Bewerbungen
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}

        {!bereitsBewertet && !saved && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                {typ === "talent" ? "Azubi bewerten" : "Betrieb bewerten"}
              </IonCardTitle>
              <IonCardSubtitle>Gib deine Erfahrungen aus diesem Einsatz weiter</IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              {([
                [kategorien[0], kat1, setKat1],
                [kategorien[1], kat2, setKat2],
                [kategorien[2], kat3, setKat3],
              ] as [string, number, (v: number) => void][]).map(([label, val, setter]) => (
                <div key={label} style={{ marginBottom: 24 }}>
                  <p style={{ fontWeight: 700, margin: "0 0 6px", color: "#1E367A" }}>{label}</p>
                  <StarPicker value={val} onChange={setter} />
                  {val > 0 && (
                    <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#47BCC2" }}>
                      {LABELS[val]}
                    </p>
                  )}
                </div>
              ))}

              <IonItem style={{ marginTop: 8, "--padding-start": "0" }}>
                <IonTextarea
                  label="Kommentar (optional, max. 500 Zeichen)"
                  labelPlacement="stacked"
                  rows={4}
                  maxlength={500}
                  counter
                  placeholder="Deine Erfahrungen in wenigen Sätzen …"
                  value={kommentar}
                  onIonInput={(e) => setKommentar(e.detail.value ?? "")}
                />
              </IonItem>

              {error && (
                <IonText color="danger">
                  <p style={{ marginTop: 8 }}>{error}</p>
                </IonText>
              )}

              <IonButton
                expand="block"
                onClick={handleSubmit}
                disabled={saving}
                style={{ marginTop: 20 }}
              >
                {saving ? "Wird gespeichert …" : "Bewertung abgeben"}
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

const Bewertung: React.FC = () => (
  <AuthGate title="Bewertung">
    <BewertungInner />
  </AuthGate>
);

export default Bewertung;
