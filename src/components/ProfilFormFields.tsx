import {
  IonItem,
  IonInput,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonList,
  IonListHeader,
  IonSegment,
  IonSegmentButton,
} from "@ionic/react";
import { ANREDEN, LEHRJAHRE, type Anrede, type ProfileType } from "../lib/appwrite";
import { HANDWERKSKAMMERN } from "../lib/handwerkskammern";
import { GEWERKE } from "../lib/gewerke";

export interface ProfilFormState {
  type: ProfileType;
  anrede: Anrede | "";
  name: string;
  vorname: string;
  ort: string;
  plz: string;
  strasse: string;
  hausnummer: string;
  adresse: string;
  gewerk: string;
  handwerkskammer: string;
  lehrjahr: string;
  unternehmen: string;
  berufsschule: string;
  faehigkeiten: string;
  ansprechpartner: string;
  ansprechpartner_email: string;
  spezialisierung: string;
}

export const EMPTY_PROFIL: ProfilFormState = {
  type: "talent",
  anrede: "",
  name: "",
  vorname: "",
  ort: "",
  plz: "",
  strasse: "",
  hausnummer: "",
  adresse: "",
  gewerk: "",
  handwerkskammer: "",
  lehrjahr: "",
  unternehmen: "",
  berufsschule: "",
  faehigkeiten: "",
  ansprechpartner: "",
  ansprechpartner_email: "",
  spezialisierung: "",
};

/** Hilfsfunktionen zum Kombinieren und Parsen der Adressfelder. */
export function adresseZusammenfuegen(strasse: string, hausnummer: string, plz: string, ort: string) {
  return `${strasse} ${hausnummer}, ${plz} ${ort}`.trim();
}

export function adresseAufteilen(adresse: string) {
  const [teil1 = "", teil2 = ""] = adresse.split(", ");
  const lastSpace = teil1.lastIndexOf(" ");
  const strasse = lastSpace > 0 ? teil1.slice(0, lastSpace) : teil1;
  const hausnummer = lastSpace > 0 ? teil1.slice(lastSpace + 1) : "";
  const firstSpace = teil2.indexOf(" ");
  const plz = firstSpace > 0 ? teil2.slice(0, firstSpace) : "";
  const ort = firstSpace > 0 ? teil2.slice(firstSpace + 1) : teil2;
  return { strasse, hausnummer, plz, ort };
}

export function ortAufteilen(ort: string) {
  const firstSpace = ort.indexOf(" ");
  if (firstSpace > 0 && /^\d{5}$/.test(ort.slice(0, firstSpace))) {
    return { plz: ort.slice(0, firstSpace), ort: ort.slice(firstSpace + 1) };
  }
  return { plz: "", ort };
}

interface Props {
  state: ProfilFormState;
  onChange: (next: ProfilFormState) => void;
  /** Type-Auswahl ausblenden (z.B. wenn der Profil-Typ schon feststeht). */
  hideTypeSwitch?: boolean;
}

export const ProfilFormFields: React.FC<Props> = ({ state, onChange, hideTypeSwitch }) => {
  function set<K extends keyof ProfilFormState>(key: K, value: ProfilFormState[K]) {
    onChange({ ...state, [key]: value });
  }

  return (
    <>
      {!hideTypeSwitch && (
        <div className="ion-padding">
          <IonSegment
            value={state.type}
            onIonChange={(e) => set("type", (e.detail.value as ProfileType) ?? "talent")}
          >
            <IonSegmentButton value="talent">
              <IonLabel>Talent (Azubi)</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="betrieb">
              <IonLabel>Betrieb</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>
      )}

      <IonList>
        {state.type === "talent" ? (
          <>
            <IonListHeader>
              <IonLabel>Persönliche Daten</IonLabel>
            </IonListHeader>
            <IonItem>
              <IonLabel position="stacked">Anrede *</IonLabel>
              <IonSelect
                interface="popover"
                placeholder="— bitte wählen —"
                value={state.anrede}
                onIonChange={(e) => set("anrede", (e.detail.value as Anrede) ?? "")}
              >
                {ANREDEN.map((a) => (
                  <IonSelectOption key={a} value={a}>
                    {a}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonInput
                label="Vorname *"
                labelPlacement="stacked"
                value={state.vorname}
                onIonInput={(e) => set("vorname", e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Name *"
                labelPlacement="stacked"
                value={state.name}
                onIonInput={(e) => set("name", e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <div style={{ width: "100%", display: "grid", gridTemplateColumns: "90px 1fr", gap: "12px" }}>
                <IonInput
                  label="PLZ *"
                  labelPlacement="stacked"
                  inputmode="numeric"
                  maxlength={5}
                  value={state.plz}
                  onIonInput={(e) => set("plz", e.detail.value ?? "")}
                />
                <IonInput
                  label="Wohnort *"
                  labelPlacement="stacked"
                  value={state.ort}
                  onIonInput={(e) => set("ort", e.detail.value ?? "")}
                />
              </div>
            </IonItem>

            <IonListHeader>
              <IonLabel>Ausbildung</IonLabel>
            </IonListHeader>
            <IonItem>
              <IonLabel position="stacked">Gewerk *</IonLabel>
              <IonSelect
                interface="alert"
                placeholder="— bitte wählen —"
                value={state.gewerk}
                onIonChange={(e) => set("gewerk", String(e.detail.value ?? ""))}
              >
                {GEWERKE.map((g) => (
                  <IonSelectOption key={g} value={g}>
                    {g}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Lehrjahr *</IonLabel>
              <IonSelect
                interface="popover"
                value={state.lehrjahr}
                onIonChange={(e) => set("lehrjahr", String(e.detail.value ?? ""))}
              >
                <IonSelectOption value="">— bitte wählen —</IonSelectOption>
                {LEHRJAHRE.map((j) => (
                  <IonSelectOption key={j} value={String(j)}>
                    {j}. Lehrjahr
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonInput
                label="Ausbildungsbetrieb *"
                labelPlacement="stacked"
                value={state.unternehmen}
                onIonInput={(e) => set("unternehmen", e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Handwerkskammer *</IonLabel>
              <IonSelect
                interface="alert"
                placeholder="— bitte wählen —"
                value={state.handwerkskammer}
                onIonChange={(e) => set("handwerkskammer", String(e.detail.value ?? ""))}
              >
                {HANDWERKSKAMMERN.map((h) => (
                  <IonSelectOption key={h} value={h}>
                    {h}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonInput
                label="Berufsschule *"
                labelPlacement="stacked"
                value={state.berufsschule}
                onIonInput={(e) => set("berufsschule", e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Fähigkeiten (Komma-getrennt, optional)"
                labelPlacement="stacked"
                placeholder="z.B. CNC-Fräse, CAD, Restaurierung"
                value={state.faehigkeiten}
                onIonInput={(e) => set("faehigkeiten", e.detail.value ?? "")}
              />
            </IonItem>
          </>
        ) : (
          <>
            <IonListHeader>
              <IonLabel>Betrieb</IonLabel>
            </IonListHeader>
            <IonItem>
              <IonInput
                label="Firmenname *"
                labelPlacement="stacked"
                value={state.name}
                onIonInput={(e) => set("name", e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 90px", gap: "12px" }}>
                <IonInput
                  label="Straße *"
                  labelPlacement="stacked"
                  value={state.strasse}
                  onIonInput={(e) => set("strasse", e.detail.value ?? "")}
                />
                <IonInput
                  label="Nr. *"
                  labelPlacement="stacked"
                  value={state.hausnummer}
                  onIonInput={(e) => set("hausnummer", e.detail.value ?? "")}
                />
              </div>
            </IonItem>
            <IonItem>
              <div style={{ width: "100%", display: "grid", gridTemplateColumns: "90px 1fr", gap: "12px" }}>
                <IonInput
                  label="PLZ *"
                  labelPlacement="stacked"
                  inputmode="numeric"
                  maxlength={5}
                  value={state.plz}
                  onIonInput={(e) => set("plz", e.detail.value ?? "")}
                />
                <IonInput
                  label="Ort *"
                  labelPlacement="stacked"
                  value={state.ort}
                  onIonInput={(e) => set("ort", e.detail.value ?? "")}
                />
              </div>
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Gewerk *</IonLabel>
              <IonSelect
                interface="alert"
                placeholder="— bitte wählen —"
                value={state.gewerk}
                onIonChange={(e) => set("gewerk", String(e.detail.value ?? ""))}
              >
                {GEWERKE.map((g) => (
                  <IonSelectOption key={g} value={g}>
                    {g}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Handwerkskammer *</IonLabel>
              <IonSelect
                interface="alert"
                placeholder="— bitte wählen —"
                value={state.handwerkskammer}
                onIonChange={(e) => set("handwerkskammer", String(e.detail.value ?? ""))}
              >
                {HANDWERKSKAMMERN.map((h) => (
                  <IonSelectOption key={h} value={h}>
                    {h}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonListHeader>
              <IonLabel>Ansprechpartner:in</IonLabel>
            </IonListHeader>
            <IonItem>
              <IonLabel position="stacked">Anrede Ansprechpartner:in *</IonLabel>
              <IonSelect
                interface="popover"
                placeholder="— bitte wählen —"
                value={state.anrede}
                onIonChange={(e) => set("anrede", (e.detail.value as Anrede) ?? "")}
              >
                {ANREDEN.map((a) => (
                  <IonSelectOption key={a} value={a}>
                    {a}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonInput
                label="Name Ansprechpartner:in *"
                labelPlacement="stacked"
                value={state.ansprechpartner}
                onIonInput={(e) => set("ansprechpartner", e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="E-Mail Ansprechpartner:in *"
                labelPlacement="stacked"
                type="email"
                value={state.ansprechpartner_email}
                onIonInput={(e) => set("ansprechpartner_email", e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Spezialisierung (Komma-getrennt, optional)"
                labelPlacement="stacked"
                placeholder="z.B. Restaurierung, Innenausbau"
                value={state.spezialisierung}
                onIonInput={(e) => set("spezialisierung", e.detail.value ?? "")}
              />
            </IonItem>
          </>
        )}
      </IonList>
    </>
  );
};

/** Validierung – liefert Liste fehlender Pflichtfelder. */
export function validateProfil(state: ProfilFormState): string[] {
  const missing: string[] = [];
  if (state.type === "talent") {
    if (!state.anrede) missing.push("Anrede");
    if (!state.vorname.trim()) missing.push("Vorname");
    if (!state.name.trim()) missing.push("Name");
    if (!state.plz.trim()) missing.push("PLZ");
    if (!state.ort.trim()) missing.push("Wohnort");
    if (!state.gewerk.trim()) missing.push("Gewerk");
    if (!state.lehrjahr) missing.push("Lehrjahr");
    if (!state.unternehmen.trim()) missing.push("Ausbildungsbetrieb");
    if (!state.handwerkskammer.trim()) missing.push("Handwerkskammer");
    if (!state.berufsschule.trim()) missing.push("Berufsschule");
  } else {
    if (!state.name.trim()) missing.push("Firmenname");
    if (!state.strasse.trim()) missing.push("Straße");
    if (!state.hausnummer.trim()) missing.push("Hausnummer");
    if (!state.plz.trim()) missing.push("PLZ");
    if (!state.ort.trim()) missing.push("Ort");
    if (!state.gewerk.trim()) missing.push("Gewerk");
    if (!state.handwerkskammer.trim()) missing.push("Handwerkskammer");
    if (!state.anrede) missing.push("Anrede Ansprechpartner:in");
    if (!state.ansprechpartner.trim()) missing.push("Ansprechpartner:in");
    if (!state.ansprechpartner_email.trim()) missing.push("E-Mail Ansprechpartner:in");
  }
  return missing;
}

/** Bringt das Formular in das Format, das saveProfile erwartet. */
export function profilStateToInput(state: ProfilFormState) {
  const isTalent = state.type === "talent";
  const split = (s: string) =>
    s.split(",").map((x) => x.trim()).filter(Boolean);
  return {
    type: state.type,
    anrede: state.anrede || null,
    name: state.name.trim(),
    vorname: isTalent ? state.vorname.trim() || null : null,
    ort: isTalent ? `${state.plz.trim()} ${state.ort.trim()}`.trim() || null : null,
    adresse: !isTalent ? adresseZusammenfuegen(state.strasse.trim(), state.hausnummer.trim(), state.plz.trim(), state.ort.trim()) || null : null,
    gewerk: state.gewerk.trim() || null,
    handwerkskammer: state.handwerkskammer.trim() || null,
    lehrjahr: isTalent && state.lehrjahr ? (Number(state.lehrjahr) as 1 | 2 | 3 | 4) : null,
    unternehmen: isTalent ? state.unternehmen.trim() || null : null,
    berufsschule: isTalent ? state.berufsschule.trim() || null : null,
    faehigkeiten: isTalent ? split(state.faehigkeiten) : [],
    ansprechpartner: !isTalent ? state.ansprechpartner.trim() || null : null,
    ansprechpartner_email: !isTalent ? state.ansprechpartner_email.trim() || null : null,
    spezialisierung: !isTalent ? split(state.spezialisierung) : [],
    user_id: "", // wird im AuthContext.saveProfile beim Anlegen gesetzt
  };
}
