import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonItem,
  IonInput,
  IonLabel,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonText,
  IonSpinner,
  IonNote,
  IonList,
  IonListHeader,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { ID, Permission, Role } from "appwrite";
import {
  databases,
  DB_LEHRSTELLEN,
  COL_APPRENTICESHIPS,
  BUNDESLAENDER,
  type Lehrstelle,
  type Bundesland,
} from "../lib/appwrite";
import { useAuth } from "../lib/AuthContext";

interface FormState {
  gewerk: string;
  firma: string;
  ort: string;
  startdatum: string;
  enddatum: string;
  kontakt_email: string;
  spezialisierungen: string; // im Formular Komma-separiert
  mindestalter: string;
  vorerfahrung: string;
  aufgabenbeschreibung: string;
  adresse: string;
  plz: string;
  stadt: string;
  bundesland: Bundesland | "";
  handwerkskammer: string;
}

const EMPTY: FormState = {
  gewerk: "",
  firma: "",
  ort: "",
  startdatum: "",
  enddatum: "",
  kontakt_email: "",
  spezialisierungen: "",
  mindestalter: "",
  vorerfahrung: "",
  aufgabenbeschreibung: "",
  adresse: "",
  plz: "",
  stadt: "",
  bundesland: "",
  handwerkskammer: "",
};

function toIsoOrNull(date: string): string | null {
  if (!date) return null;
  // <ion-input type=date> liefert YYYY-MM-DD
  return new Date(date + "T00:00:00.000Z").toISOString();
}

function fromIso(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.substring(0, 10);
}

const LehrstelleForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const history = useHistory();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !id) return;
    let cancelled = false;
    async function load() {
      try {
        const doc = await databases.getDocument<Lehrstelle>(
          DB_LEHRSTELLEN,
          COL_APPRENTICESHIPS,
          id!
        );
        if (cancelled) return;
        setForm({
          gewerk: doc.gewerk,
          firma: doc.firma,
          ort: doc.ort,
          startdatum: fromIso(doc.startdatum),
          enddatum: fromIso(doc.enddatum),
          kontakt_email: doc.kontakt_email,
          spezialisierungen: (doc.spezialisierungen ?? []).join(", "),
          mindestalter: doc.mindestalter != null ? String(doc.mindestalter) : "",
          vorerfahrung: doc.vorerfahrung ?? "",
          aufgabenbeschreibung: doc.aufgabenbeschreibung,
          adresse: doc.adresse ?? "",
          plz: doc.plz ?? "",
          stadt: doc.stadt ?? "",
          bundesland: doc.bundesland ?? "",
          handwerkskammer: doc.handwerkskammer ?? "",
        });
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    // Pflichtfelder prüfen
    const missing: string[] = [];
    if (!form.gewerk.trim()) missing.push("Gewerk");
    if (!form.firma.trim()) missing.push("Firma");
    if (!form.ort.trim()) missing.push("Ort");
    if (!form.startdatum) missing.push("Startdatum");
    if (!form.kontakt_email.trim()) missing.push("Kontakt-E-Mail");
    if (!form.aufgabenbeschreibung.trim()) missing.push("Aufgabenbeschreibung");
    if (missing.length) {
      setError("Bitte ausfüllen: " + missing.join(", "));
      return;
    }

    const data = {
      gewerk: form.gewerk.trim(),
      firma: form.firma.trim(),
      ort: form.ort.trim(),
      startdatum: toIsoOrNull(form.startdatum),
      enddatum: toIsoOrNull(form.enddatum),
      kontakt_email: form.kontakt_email.trim(),
      spezialisierungen: form.spezialisierungen
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      mindestalter: form.mindestalter ? Number(form.mindestalter) : null,
      vorerfahrung: form.vorerfahrung.trim() || null,
      aufgabenbeschreibung: form.aufgabenbeschreibung.trim(),
      adresse: form.adresse.trim() || null,
      plz: form.plz.trim() || null,
      stadt: form.stadt.trim() || null,
      bundesland: form.bundesland || null,
      handwerkskammer: form.handwerkskammer.trim() || null,
    };

    setSaving(true);
    setError(null);
    try {
      if (isEdit && id) {
        await databases.updateDocument(DB_LEHRSTELLEN, COL_APPRENTICESHIPS, id, data);
      } else {
        await databases.createDocument(
          DB_LEHRSTELLEN,
          COL_APPRENTICESHIPS,
          ID.unique(),
          data,
          [
            Permission.read(Role.any()),
            Permission.update(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id)),
          ]
        );
      }
      history.replace("/meine-lehrstellen");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/meine-lehrstellen" />
          </IonButtons>
          <IonTitle>{isEdit ? "Lehrstelle bearbeiten" : "Neue Lehrstelle"}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <form onSubmit={handleSubmit}>
          <IonList>
            <IonListHeader>
              <IonLabel>Basis</IonLabel>
            </IonListHeader>
            <IonItem>
              <IonInput
                label="Gewerk *"
                labelPlacement="stacked"
                value={form.gewerk}
                onIonInput={(e) => update("gewerk", e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Firma *"
                labelPlacement="stacked"
                value={form.firma}
                onIonInput={(e) => update("firma", e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Ort *"
                labelPlacement="stacked"
                value={form.ort}
                onIonInput={(e) => update("ort", e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Startdatum *"
                labelPlacement="stacked"
                type="date"
                value={form.startdatum}
                onIonInput={(e) => update("startdatum", e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Enddatum (optional)"
                labelPlacement="stacked"
                type="date"
                value={form.enddatum}
                onIonInput={(e) => update("enddatum", e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Kontakt-E-Mail *"
                labelPlacement="stacked"
                type="email"
                value={form.kontakt_email}
                onIonInput={(e) => update("kontakt_email", e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Spezialisierungen (Komma-getrennt)"
                labelPlacement="stacked"
                placeholder="z. B. Massivholz, Restaurierung, Innenausbau"
                value={form.spezialisierungen}
                onIonInput={(e) => update("spezialisierungen", e.detail.value ?? "")}
              />
            </IonItem>

            <IonListHeader>
              <IonLabel>Aufgaben &amp; Voraussetzungen</IonLabel>
            </IonListHeader>
            <IonItem>
              <IonTextarea
                label="Konkrete Aufgabenbeschreibung *"
                labelPlacement="stacked"
                autoGrow
                rows={4}
                value={form.aufgabenbeschreibung}
                onIonInput={(e) => update("aufgabenbeschreibung", e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Mindestalter"
                labelPlacement="stacked"
                type="number"
                value={form.mindestalter}
                onIonInput={(e) => update("mindestalter", e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <IonTextarea
                label="Gewünschte Vorerfahrung"
                labelPlacement="stacked"
                autoGrow
                rows={3}
                value={form.vorerfahrung}
                onIonInput={(e) => update("vorerfahrung", e.detail.value ?? "")}
              />
            </IonItem>

            <IonListHeader>
              <IonLabel>Standort</IonLabel>
            </IonListHeader>
            <IonItem>
              <IonInput
                label="Adresse"
                labelPlacement="stacked"
                value={form.adresse}
                onIonInput={(e) => update("adresse", e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="PLZ"
                labelPlacement="stacked"
                value={form.plz}
                onIonInput={(e) => update("plz", e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Stadt"
                labelPlacement="stacked"
                value={form.stadt}
                onIonInput={(e) => update("stadt", e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <IonLabel>Bundesland</IonLabel>
              <IonSelect
                interface="popover"
                value={form.bundesland}
                onIonChange={(e) => update("bundesland", e.detail.value as Bundesland | "")}
              >
                <IonSelectOption value="">— bitte wählen —</IonSelectOption>
                {BUNDESLAENDER.map((b) => (
                  <IonSelectOption key={b} value={b}>
                    {b}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonListHeader>
              <IonLabel>Handwerk</IonLabel>
            </IonListHeader>
            <IonItem>
              <IonInput
                label="Handwerkskammer"
                labelPlacement="stacked"
                placeholder="z. B. Handwerkskammer Hamburg"
                value={form.handwerkskammer}
                onIonInput={(e) => update("handwerkskammer", e.detail.value ?? "")}
              />
            </IonItem>
          </IonList>

          {error && (
            <div className="ion-padding">
              <IonText color="danger">
                <p>{error}</p>
              </IonText>
            </div>
          )}

          <div className="ion-padding">
            <IonButton expand="block" type="submit" disabled={saving}>
              {saving ? "Speichern…" : isEdit ? "Änderungen speichern" : "Lehrstelle anlegen"}
            </IonButton>
            <IonNote>
              <p style={{ marginTop: 8 }}>* = Pflichtfeld</p>
            </IonNote>
          </div>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default LehrstelleForm;
