import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
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
  IonAlert,
} from "@ionic/react";
import { useEffect, useState } from "react";
import ZurueckButton from "../components/ZurueckButton";
import { useHistory, useParams } from "react-router-dom";
import { ID, Permission, Role, Query } from "appwrite";
import {
  databases,
  DB_LEHRSTELLEN,
  COL_APPRENTICESHIPS,
  COL_BEWERBUNGEN,
  MINDESTALTER_OPTIONS,
  type Anzeige,
  type Bundesland,
  type ApprenticeshipType,
} from "../lib/appwrite";
import { BERLIN_REGION_KAMMERN } from "../lib/handwerkskammern";
import { GEWERKE } from "../lib/gewerke";
import { useAuth } from "../lib/AuthContext";
import { translateError } from "../lib/errors";
import AuthGate from "../components/AuthGate";
import { adresseAufteilen, adresseZusammenfuegen } from "../components/ProfilFormFields";

interface FormState {
  gewerk: string;
  firma: string;
  ort: string;
  startdatum: string;
  enddatum: string;
  kontakt_email: string;
  spezialisierungen: string;
  lernziele: string;
  mindestalter: string;
  vorerfahrung: string;
  aufgabenbeschreibung: string;
  strasse: string;
  hausnummer: string;
  plz: string;
  plz_umkreis: string;
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
  lernziele: "",
  mindestalter: "",
  vorerfahrung: "",
  aufgabenbeschreibung: "",
  strasse: "",
  hausnummer: "",
  plz: "",
  plz_umkreis: "",
  stadt: "",
  bundesland: "Berlin",
  handwerkskammer: "",
};

function toIsoOrNull(date: string): string | null {
  if (!date) return null;
  return new Date(date + "T00:00:00.000Z").toISOString();
}

function fromIso(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.substring(0, 10);
}

const AnzeigeFormInner: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { user, profile } = useAuth();
  const history = useHistory();
  const isEdit = Boolean(id);

  const initialType: ApprenticeshipType =
    profile?.type === "talent" ? "talent_angebot" : "einsatz";
  const [docType, setDocType] = useState<ApprenticeshipType>(initialType);
  const isTalent = docType === "talent_angebot";

  const today = new Date().toISOString().substring(0, 10);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState(false);
  const [hatBewerbungen, setHatBewerbungen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const labels = {
    title: isEdit
      ? isTalent
        ? "Talent-Angebot bearbeiten"
        : "Einsatz bearbeiten"
      : isTalent
        ? "Neues Talent-Angebot"
        : "Neuer Einsatz",
    save: isEdit
      ? "Änderungen speichern"
      : isTalent
        ? "Talent-Angebot anlegen"
        : "Einsatz anlegen",
    backDefault: "/meine-anzeigen",
  };

  /* ---------- Vorbefüllung aus Profil (nur Anlegen) ---------- */
  useEffect(() => {
    if (isEdit || prefilled || !profile) return;
    setForm((prev) => ({
      ...prev,
      gewerk: prev.gewerk || profile.gewerk || "",
      firma:
        prev.firma ||
        (profile.type === "betrieb"
          ? profile.name
          : profile.unternehmen ?? ""),
      ort: prev.ort || profile.ort || "",
      kontakt_email:
        prev.kontakt_email ||
        profile.ansprechpartner_email ||
        user?.email ||
        "",
      ...(() => {
          const { strasse, hausnummer, plz, ort } = adresseAufteilen(prev.strasse ? `${prev.strasse} ${prev.hausnummer}, ${prev.plz} ${prev.stadt}` : profile.adresse ?? "");
          return {
            strasse: prev.strasse || strasse,
            hausnummer: prev.hausnummer || hausnummer,
            plz: prev.plz || plz,
            stadt: prev.stadt || ort,
          };
        })(),
      handwerkskammer:
        prev.handwerkskammer || profile.handwerkskammer || "",
      spezialisierungen:
        prev.spezialisierungen ||
        (profile.spezialisierung ?? []).join(", "),
    }));
    setPrefilled(true);
  }, [isEdit, prefilled, profile, user]);

  /* ---------- Bestehenden Datensatz laden (Bearbeiten) ---------- */
  useEffect(() => {
    if (!isEdit || !id) return;
    let cancelled = false;
    async function load() {
      try {
        const [doc, bwRes] = await Promise.all([
          databases.getDocument<Anzeige>(
            DB_LEHRSTELLEN,
            COL_APPRENTICESHIPS,
            id!
          ),
          databases.listDocuments(DB_LEHRSTELLEN, COL_BEWERBUNGEN, [
            Query.equal("apprenticeship_id", id!),
            Query.limit(1),
          ]),
        ]);
        if (cancelled) return;
        setDocType(doc.type ?? "einsatz");
        setHatBewerbungen(bwRes.total > 0);
        setForm({
          gewerk: doc.gewerk,
          firma: doc.firma ?? "",
          ort: doc.ort ?? "",
          startdatum: fromIso(doc.startdatum),
          enddatum: fromIso(doc.enddatum),
          kontakt_email: doc.kontakt_email,
          spezialisierungen: (doc.spezialisierungen ?? []).join(", "),
          lernziele: (doc.lernziele ?? []).join(", "),
          mindestalter: doc.mindestalter != null ? String(doc.mindestalter) : "",
          vorerfahrung: doc.vorerfahrung ?? "",
          aufgabenbeschreibung: doc.aufgabenbeschreibung ?? "",
          ...(() => {
            const { strasse, hausnummer } = adresseAufteilen(doc.adresse ?? "");
            return { strasse, hausnummer };
          })(),
          plz: doc.plz ?? "",
          plz_umkreis: doc.plz_umkreis != null ? String(doc.plz_umkreis) : "",
          stadt: doc.stadt ?? "",
          bundesland: doc.bundesland ?? "",
          handwerkskammer: doc.handwerkskammer ?? "",
        });
      } catch (err: unknown) {
        if (!cancelled) setError(translateError(err));
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

  function validate(): string[] {
    const missing: string[] = [];
    if (!form.gewerk.trim()) missing.push("Gewerk");
    if (!form.firma.trim()) missing.push(isTalent ? "Name/Ausbildungsbetrieb" : "Firma");
    if (!form.startdatum) missing.push("Startdatum");
    if (form.enddatum && form.startdatum && form.enddatum < form.startdatum)
      missing.push("Enddatum muss gleich oder nach dem Startdatum liegen");
    if (!form.kontakt_email.trim()) missing.push("Kontakt-E-Mail");
    if (!form.handwerkskammer.trim()) missing.push("Handwerkskammer");
    if (isTalent) {
      if (!form.plz.trim()) missing.push("PLZ");
    } else {
      if (!form.aufgabenbeschreibung.trim()) missing.push("Aufgabenbeschreibung");
    }
    return missing;
  }

  async function doSave() {
    if (!user) return;
    const split = (s: string) =>
      s.split(",").map((x) => x.trim()).filter(Boolean);

    // Kein Enddatum → automatisch auf Startdatum + 3,5 Jahre begrenzen
    const enddatumIso = form.enddatum
      ? toIsoOrNull(form.enddatum)
      : (() => {
          if (!form.startdatum) return null;
          const d = new Date(form.startdatum + "T00:00:00.000Z");
          d.setMonth(d.getMonth() + 42); // 3,5 Jahre = 42 Monate
          return d.toISOString();
        })();

    const data: Record<string, unknown> = {
      owner_id: user.$id,
      type: docType,
      gewerk: form.gewerk.trim(),
      firma: form.firma.trim(),
      startdatum: toIsoOrNull(form.startdatum),
      enddatum: enddatumIso,
      kontakt_email: form.kontakt_email.trim(),
      spezialisierungen: split(form.spezialisierungen),
      handwerkskammer: form.handwerkskammer.trim() || null,
    };

    if (isTalent) {
      Object.assign(data, {
        ort: form.ort.trim() || form.plz.trim(),
        lernziele: split(form.lernziele),
        plz: form.plz.trim() || null,
        plz_umkreis: form.plz_umkreis ? Number(form.plz_umkreis) : null,
        aufgabenbeschreibung: "",
        mindestalter: null,
        vorerfahrung: null,
        adresse: null,
        stadt: null,
        bundesland: null,
      });
    } else {
      Object.assign(data, {
        ort: form.ort.trim() || form.stadt.trim() || "—",
        lernziele: [],
        mindestalter: form.mindestalter ? Number(form.mindestalter) : null,
        vorerfahrung: form.vorerfahrung.trim() || null,
        aufgabenbeschreibung: form.aufgabenbeschreibung.trim(),
        adresse: adresseZusammenfuegen(form.strasse.trim(), form.hausnummer.trim(), form.plz.trim(), form.stadt.trim()) || null,
        plz: form.plz.trim() || null,
        plz_umkreis: null,
        stadt: form.stadt.trim() || null,
        bundesland: null,
      });
    }

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
      history.replace("/meine-anzeigen");
    } catch (err: unknown) {
      setError(translateError(err));
    } finally {
      setSaving(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const missing = validate();
    if (missing.length) {
      setError("Bitte ausfüllen: " + missing.join(", "));
      return;
    }
    if (hatBewerbungen) {
      setShowWarning(true);
      return;
    }
    doSave();
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
          <IonButtons slot="end">
              <IonButton strong onClick={() => { const f = document.querySelector("form"); f?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); }}>
                Speichern
              </IonButton>
            </IonButtons>

          <IonTitle>{labels.title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="ion-padding-horizontal" style={{ paddingTop: 8, paddingBottom: 4 }}>
          <ZurueckButton />
        </div>
        <form onSubmit={handleSubmit}>
          <IonList>
            <IonListHeader>
              <IonLabel>Basis</IonLabel>
            </IonListHeader>
            <IonItem>
              <IonLabel position="stacked">Gewerk *</IonLabel>
              <IonSelect
                interface="alert"
                placeholder="— bitte wählen —"
                value={form.gewerk}
                onIonChange={(e) => update("gewerk", String(e.detail.value ?? ""))}
              >
                {GEWERKE.map((g) => (
                  <IonSelectOption key={g} value={g}>
                    {g}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonInput
                label={isTalent ? "Name/Ausbildungsbetrieb *" : "Firma *"}
                labelPlacement="stacked"
                value={form.firma}
                onIonInput={(e) => update("firma", e.detail.value ?? "")}
              />
            </IonItem>
            {isTalent && (
              <IonItem>
                <IonInput
                  label="Wohnort (optional)"
                  labelPlacement="stacked"
                  value={form.ort}
                  onIonInput={(e) => update("ort", e.detail.value ?? "")}
                />
              </IonItem>
            )}
            <IonItem>
              <IonInput
                label={isTalent ? "Verfügbar ab *" : "Startdatum *"}
                labelPlacement="stacked"
                type="date"
                min={today}
                value={form.startdatum}
                onIonInput={(e) => update("startdatum", e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label={isTalent ? "Verfügbar bis (optional)" : "Enddatum (optional)"}
                labelPlacement="stacked"
                type="date"
                min={today}
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
                placeholder="z. B. Massivholz, Restaurierung"
                value={form.spezialisierungen}
                onIonInput={(e) => update("spezialisierungen", e.detail.value ?? "")}
              />
            </IonItem>
            {isTalent && (
              <IonItem>
                <IonInput
                  label="Lernziele (Komma-getrennt)"
                  labelPlacement="stacked"
                  placeholder="z. B. CNC-Fräse beherrschen, Kundenberatung üben"
                  value={form.lernziele}
                  onIonInput={(e) => update("lernziele", e.detail.value ?? "")}
                />
              </IonItem>
            )}

            {!isTalent && (
              <>
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
                  <IonLabel position="stacked">Mindestalter</IonLabel>
                  <IonSelect
                    interface="popover"
                    placeholder="— bitte wählen —"
                    value={form.mindestalter}
                    onIonChange={(e) => update("mindestalter", String(e.detail.value ?? ""))}
                  >
                    <IonSelectOption value="">kein Mindestalter</IonSelectOption>
                    {MINDESTALTER_OPTIONS.map((alter) => (
                      <IonSelectOption key={alter} value={String(alter)}>
                        ab {alter}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
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
              </>
            )}

            <IonListHeader>
              <IonLabel>Standort</IonLabel>
            </IonListHeader>
            {isTalent ? (
              <>
                <IonItem>
                  <IonInput
                    label="PLZ *"
                    labelPlacement="stacked"
                    inputMode="numeric"
                    value={form.plz}
                    onIonInput={(e) => update("plz", e.detail.value ?? "")}
                  />
                </IonItem>
                <IonItem>
                  <IonInput
                    label="Umkreis (km)"
                    labelPlacement="stacked"
                    type="number"
                    placeholder="z. B. 25"
                    value={form.plz_umkreis}
                    onIonInput={(e) => update("plz_umkreis", e.detail.value ?? "")}
                  />
                </IonItem>
              </>
            ) : (
              <>
                <IonItem>
                  <IonInput
                    label="Straße"
                    labelPlacement="stacked"
                    value={form.strasse}
                    onIonInput={(e) => update("strasse", e.detail.value ?? "")}
                  />
                </IonItem>
                <IonItem>
                  <IonInput
                    label="Hausnummer"
                    labelPlacement="stacked"
                    value={form.hausnummer}
                    onIonInput={(e) => update("hausnummer", e.detail.value ?? "")}
                  />
                </IonItem>
                <IonItem>
                  <IonInput
                    label="PLZ"
                    labelPlacement="stacked"
                    inputMode="numeric"
                    value={form.plz}
                    onIonInput={(e) => update("plz", e.detail.value ?? "")}
                  />
                </IonItem>
                <IonItem>
                  <IonInput
                    label="Ort"
                    labelPlacement="stacked"
                    value={form.stadt}
                    onIonInput={(e) => update("stadt", e.detail.value ?? "")}
                  />
                </IonItem>
              </>
            )}

            <IonListHeader>
              <IonLabel>Handwerk</IonLabel>
            </IonListHeader>
            <IonItem>
              <IonLabel position="stacked">Handwerkskammer *</IonLabel>
              <IonSelect
                interface="alert"
                placeholder="— bitte wählen —"
                value={form.handwerkskammer}
                onIonChange={(e) => update("handwerkskammer", String(e.detail.value ?? ""))}
              >
                {BERLIN_REGION_KAMMERN.map((h) => (
                  <IonSelectOption key={h} value={h}>
                    {h}
                  </IonSelectOption>
                ))}
              </IonSelect>
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
              {saving ? "Speichern…" : labels.save}
            </IonButton>
            <IonNote>
              <p style={{ marginTop: 8 }}>* = Pflichtfeld</p>
            </IonNote>
          </div>
        </form>

        <IonAlert
          isOpen={showWarning}
          header="Achtung: Bewerbungen vorhanden"
          message="Für diese Anzeige liegen bereits Bewerbungen vor. Änderungen könnten Bewerber:innen verwirren. Trotzdem speichern?"
          buttons={[
            {
              text: "Abbrechen",
              role: "cancel",
              handler: () => setShowWarning(false),
            },
            {
              text: "Trotzdem speichern",
              handler: () => {
                setShowWarning(false);
                doSave();
              },
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

const AnzeigeForm: React.FC = () => (
  <AuthGate title="Anzeige" backHref="/meine-anzeigen">
    <AnzeigeFormInner />
  </AuthGate>
);

export default AnzeigeForm;
