import React, { useEffect, useState } from "react";
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonBackButton, IonCard, IonCardContent, IonBadge, IonButton,
  IonSpinner, IonIcon,
} from "@ionic/react";
import { checkmarkCircleOutline, closeCircleOutline } from "ionicons/icons";
import { useAuth } from "../lib/AuthContext";
import {
  databases, account,
  DB_LEHRSTELLEN, COL_BEWERBUNGEN, COL_PROFILES,
  Bewerbung,
} from "../lib/appwrite";
import { Query } from "appwrite";

const EinsaetzeAzubis: React.FC = () => {
  const { user } = useAuth();
  const [bewerbungen, setBewerbungen] = useState<Bewerbung[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [busy, setBusy]               = useState<string | null>(null); // ID der gerade bearbeiteten Bewerbung

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      // E-Mail des eingeloggten Nutzers holen
      const me = await account.get();
      const myEmail = me.email;

      // Alle Azubi-Profile, bei denen diese E-Mail als Ausbildungsbeauftragte/r hinterlegt ist
      const profilesRes = await databases.listDocuments(
        DB_LEHRSTELLEN,
        COL_PROFILES,
        [Query.equal("ausbildungsbeauftragter_email", myEmail)]
      );

      if (!profilesRes.documents.length) {
        setBewerbungen([]);
        return;
      }

      // Alle Bewerbungen dieser Azubis mit Status "ausstehend_freigabe"
      const azubiUserIds = profilesRes.documents.map((p: any) => p.user_id);
      const bewRes = await databases.listDocuments<Bewerbung>(
        DB_LEHRSTELLEN,
        COL_BEWERBUNGEN,
        [
          Query.equal("applicant_user_id", azubiUserIds),
          Query.equal("status", "ausstehend_freigabe"),
          Query.orderDesc("$createdAt"),
          Query.limit(100),
        ]
      );
      setBewerbungen(bewRes.documents);
    } catch (e: any) {
      setError(e?.message || "Fehler beim Laden.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAktion(id: string, aktion: "annehmen" | "ablehnen") {
    setBusy(id);
    try {
      await databases.updateDocument(DB_LEHRSTELLEN, COL_BEWERBUNGEN, id, {
        status: aktion === "annehmen" ? "ausstehend" : "abgelehnt",
      });
      // Aus der Liste entfernen
      setBewerbungen((prev) => prev.filter((b) => b.$id !== id));
    } catch (e: any) {
      alert("Fehler: " + (e?.message || "Unbekannt"));
    } finally {
      setBusy(null);
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/konto" />
          </IonButtons>
          <IonTitle>Einsätze meiner Azubis</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading && (
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <IonSpinner />
          </div>
        )}

        {!loading && error && (
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        )}

        {!loading && !error && bewerbungen.length === 0 && (
          <div style={{ textAlign: "center", marginTop: 60, color: "#888" }}>
            <p style={{ fontSize: "2rem" }}>✅</p>
            <p>Keine offenen Bewerbungen zur Freigabe.</p>
            <p style={{ fontSize: "0.85rem" }}>
              Hier erscheinen Bewerbungen Ihrer Azubis, sobald diese sich auf einen Einsatz beworben haben.
            </p>
          </div>
        )}

        {!loading && !error && bewerbungen.map((b) => (
          <IonCard key={b.$id} style={{ marginBottom: 12 }}>
            <IonCardContent>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <strong style={{ fontSize: "1rem" }}>{b.applicant_name || "Azubi"}</strong>
                  <p style={{ margin: "4px 0 0", color: "#555", fontSize: "0.9rem" }}>
                    {b.apprenticeship_titel || "Einsatz"}
                  </p>
                </div>
                <IonBadge color="warning">Wartet auf Freigabe</IonBadge>
              </div>

              {b.nachricht && (
                <p style={{ fontSize: "0.85rem", color: "#666", borderLeft: "3px solid #eee", paddingLeft: 8, margin: "8px 0" }}>
                  {b.nachricht}
                </p>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <IonButton
                  expand="block"
                  color="success"
                  disabled={busy === b.$id}
                  onClick={() => handleAktion(b.$id, "annehmen")}
                  style={{ flex: 1 }}
                >
                  <IonIcon slot="start" icon={checkmarkCircleOutline} />
                  {busy === b.$id ? <IonSpinner name="dots" /> : "Annehmen"}
                </IonButton>
                <IonButton
                  expand="block"
                  color="danger"
                  fill="outline"
                  disabled={busy === b.$id}
                  onClick={() => handleAktion(b.$id, "ablehnen")}
                  style={{ flex: 1 }}
                >
                  <IonIcon slot="start" icon={closeCircleOutline} />
                  {busy === b.$id ? <IonSpinner name="dots" /> : "Ablehnen"}
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        ))}
      </IonContent>
    </IonPage>
  );
};

export default EinsaetzeAzubis;
