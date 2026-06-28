import { useState } from "react";
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
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonButtons,
  IonButton,
  IonChip,
  IonIcon,
  IonToggle,
} from "@ionic/react";
import { closeCircle } from "ionicons/icons";
import { ANREDEN, LEHRJAHRE, type Anrede, type ProfileType } from "../lib/appwrite";
import { BERLIN_REGION_KAMMERN, VERBUNDBERATUNG_INSTITUTIONEN } from "../lib/handwerkskammern";
import { GEWERKE } from "../lib/gewerke";
import { BERUFSSCHULEN, BERUFSSCHULEN_NACH_GEWERK } from "../lib/berufsschulen";
import ProfilbildUpload from "./ProfilbildUpload";

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
  gewerk: string;       // Azubi: einzelnes Gewerk
  gewerke: string[];    // Betrieb: mehrere Gewerke
  handwerkskammer: string;
  lehrjahr: string;
  unternehmen: string;
  berufsschule: string;
  beschulungsmodell_hauptform: "" | "teilzeit" | "block" | "unklar";
  beschulungsmodell_unterform: string;
  beschulungsmodell_freitext: string;
  faehigkeiten: string;
  ansprechpartner: string;
  ansprechpartner_email: string;
  spezialisierung: string;
  ausbildungsbeauftragter_email: string;
  initiativbewerbungen: boolean;
  avatar_file_id: string | null;
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
  gewerke: [],
  handwerkskammer: "Handwerkskammer Berlin (HWK)",
  lehrjahr: "",
  unternehmen: "",
  berufsschule: "",
  beschulungsmodell_hauptform: "",
  beschulungsmodell_unterform: "",
  beschulungsmodell_freitext: "",
  faehigkeiten: "",
  ansprechpartner: "",
  ansprechpartner_email: "",
  spezialisierung: "",
  initiativbewerbungen: true,
  avatar_file_id: null,
  ausbildungsbeauftragter_email: "",
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
  const s = (ort ?? "").trim();
  const firstSpace = s.indexOf(" ");
  if (firstSpace > 0 && /^\d{5}$/.test(s.slice(0, firstSpace))) {
    return { plz: s.slice(0, firstSpace), ort: s.slice(firstSpace + 1).trim() };
  }
  return { plz: "", ort: s };
}

// ── Beschulungsmodell ────────────────────────────────────────────────────────
const BESCHULUNGSMODELL_UNTERFORMEN: Record<"teilzeit" | "block", string[]> = {
  teilzeit: [
    "1 Tag/Woche",
    "2 Tage/Woche",
    "1 Tag/Woche + 1 Zusatztag im Monat",
    "Sonstiges",
  ],
  block: [
    "Durchgehend mehrere Wochen am Stück",
    "Wochenrhythmus (ca. 2-Wochen-Wechsel Schule/Betrieb)",
    "A-B-C-Rhythmus (z. B. 2 Wochen Betrieb / 1 Woche Schule)",
    "Auswärtige Fachklasse (Schule außerhalb Berlins)",
    "Sonstiges",
  ],
};

const HAUPTFORM_LABEL: Record<"teilzeit" | "block" | "unklar", string> = {
  teilzeit: "Teilzeitunterricht",
  block:    "Blockunterricht",
  unklar:   "Noch nicht bekannt / unklar",
};

export function beschulungsmodellZusammenfuegen(
  hauptform: ProfilFormState["beschulungsmodell_hauptform"],
  unterform: string,
  freitext: string,
): string {
  if (!hauptform) return "";
  if (hauptform === "unklar") return "Noch nicht bekannt / unklar";
  const label = HAUPTFORM_LABEL[hauptform];
  if (!unterform) return label;
  if (unterform === "Sonstiges")
    return freitext.trim() ? `${label} · Sonstiges: ${freitext.trim()}` : `${label} · Sonstiges`;
  return `${label} · ${unterform}`;
}

export function parseBeschulungsmodell(stored: string): {
  hauptform: ProfilFormState["beschulungsmodell_hauptform"];
  unterform: string;
  freitext: string;
} {
  if (!stored) return { hauptform: "", unterform: "", freitext: "" };
  if (stored === "Noch nicht bekannt / unklar") return { hauptform: "unklar", unterform: "", freitext: "" };
  const sep = stored.indexOf(" · ");
  const hauptLabel = sep >= 0 ? stored.slice(0, sep) : stored;
  const rest       = sep >= 0 ? stored.slice(sep + 3) : "";
  const hauptform: ProfilFormState["beschulungsmodell_hauptform"] =
    hauptLabel === "Teilzeitunterricht" ? "teilzeit"
    : hauptLabel === "Blockunterricht"  ? "block"
    : "";
  if (!rest) return { hauptform, unterform: "", freitext: "" };
  if (rest.startsWith("Sonstiges: ")) return { hauptform, unterform: "Sonstiges", freitext: rest.slice(11) };
  if (rest === "Sonstiges")           return { hauptform, unterform: "Sonstiges", freitext: "" };
  return { hauptform, unterform: rest, freitext: "" };
}

type Hauptform = ProfilFormState["beschulungsmodell_hauptform"];

const BESCHULUNGSMODELL_STRUKTUR: Array<{
  value: Hauptform;
  label: string;
  unterformen?: string[];
}> = [
  {
    value: "teilzeit",
    label: "Teilzeitunterricht",
    unterformen: [
      "1 Tag/Woche",
      "2 Tage/Woche",
      "1 Tag/Woche + 1 Zusatztag im Monat",
      "Sonstiges",
    ],
  },
  {
    value: "block",
    label: "Blockunterricht",
    unterformen: [
      "Durchgehend mehrere Wochen am Stück",
      "Wochenrhythmus (ca. 2-Wochen-Wechsel Schule/Betrieb)",
      "A-B-C-Rhythmus (z. B. 2 Wochen Betrieb / 1 Woche Schule)",
      "Auswärtige Fachklasse (Schule außerhalb Berlins)",
      "Sonstiges",
    ],
  },
  { value: "unklar", label: "Noch nicht bekannt / unklar" },
];

function BeschulungsmodellFelder({
  hauptform, unterform, freitext, onChange,
}: {
  hauptform: Hauptform;
  unterform: string;
  freitext: string;
  onChange: (hf: Hauptform, uf: string, ft: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftHf, setDraftHf] = useState<Hauptform>("");
  const [draftUf, setDraftUf] = useState("");
  const [draftFt, setDraftFt] = useState("");

  function handleOpen() {
    setDraftHf(hauptform);
    setDraftUf(unterform);
    setDraftFt(freitext);
    setOpen(true);
  }

  function handleDismiss() {
    setOpen(false);
  }

  const draftStruktur = BESCHULUNGSMODELL_STRUKTUR.find((s) => s.value === draftHf);
  const unterformen   = draftStruktur?.unterformen ?? [];

  function waehlHauptform(v: Hauptform) {
    setDraftHf(v);
    setDraftUf("");
    setDraftFt("");
    if (v === "unklar") {
      onChange(v, "", "");
      setOpen(false);
    }
  }

  function waehlUnterform(u: string) {
    setDraftUf(u);
    setDraftFt("");
    if (u !== "Sonstiges") {
      onChange(draftHf, u, "");
      setOpen(false);
    }
  }

  function uebernehmen() {
    onChange(draftHf, draftUf, draftFt);
    setOpen(false);
  }

  // Anzeigetext aus den gespeicherten (nicht Draft-)Werten
  const gespeichertStruktur = BESCHULUNGSMODELL_STRUKTUR.find((s) => s.value === hauptform);
  const anzeigeText = !hauptform
    ? ""
    : !unterform
    ? gespeichertStruktur?.label ?? ""
    : unterform === "Sonstiges" && freitext.trim()
    ? `${gespeichertStruktur?.label} · Sonstiges: ${freitext.trim()}`
    : `${gespeichertStruktur?.label} · ${unterform}`;

  return (
    <>
      <IonItem button detail={false} onClick={handleOpen}>
        <IonLabel position="stacked">Beschulungsmodell</IonLabel>
        <div style={{
          padding: "10px 0 6px",
          color: anzeigeText ? "var(--ion-text-color, #1E367A)" : "#999",
          fontSize: "1rem",
        }}>
          {anzeigeText || "— bitte wählen —"}
        </div>
      </IonItem>

      <IonModal isOpen={open} onDidDismiss={handleDismiss}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Beschulungsmodell</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleDismiss}>Schließen</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            <IonListHeader>
              <IonLabel style={{ fontSize: "0.78rem", color: "#8096b8", fontWeight: 600 }}>
                Art des Unterrichts
              </IonLabel>
            </IonListHeader>
            {BESCHULUNGSMODELL_STRUKTUR.map((s) => (
              <IonItem
                key={s.value}
                button
                detail={false}
                onClick={() => waehlHauptform(s.value)}
                style={draftHf === s.value ? { "--background": "rgba(71,188,194,0.12)" } : {}}
              >
                <IonLabel>{s.label}</IonLabel>
                {draftHf === s.value && (
                  <span slot="end" style={{ color: "#47BCC2", fontWeight: 700 }}>✓</span>
                )}
              </IonItem>
            ))}

            {unterformen.length > 0 && (
              <>
                <IonListHeader>
                  <IonLabel style={{ fontSize: "0.78rem", color: "#8096b8", fontWeight: 600 }}>
                    Variante wählen
                  </IonLabel>
                </IonListHeader>
                {unterformen.map((u) => (
                  <IonItem
                    key={u}
                    button
                    detail={false}
                    onClick={() => waehlUnterform(u)}
                    style={draftUf === u ? { "--background": "rgba(71,188,194,0.12)" } : {}}
                  >
                    <IonLabel>{u}</IonLabel>
                    {draftUf === u && (
                      <span slot="end" style={{ color: "#47BCC2", fontWeight: 700 }}>✓</span>
                    )}
                  </IonItem>
                ))}
              </>
            )}
          </IonList>

          {draftUf === "Sonstiges" && (
            <div style={{ padding: "0 16px 16px" }}>
              <IonItem>
                <IonInput
                  label="Kurze Beschreibung"
                  labelPlacement="stacked"
                  placeholder="z. B. 3-wöchige Blöcke zweimal im Jahr"
                  value={draftFt}
                  onIonInput={(e) => setDraftFt(e.detail.value ?? "")}
                />
              </IonItem>
              <IonButton expand="block" style={{ marginTop: 12 }} onClick={uebernehmen}>
                Übernehmen
              </IonButton>
            </div>
          )}
        </IonContent>
      </IonModal>
    </>
  );
}

// ── Suchbares Gewerk-Auswahlfeld ──────────────────────────────────────────────
function GewerkPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = GEWERKE.filter((g) =>
    g.toLowerCase().includes(search.toLowerCase())
  );

  const close = () => { setOpen(false); setSearch(""); };

  return (
    <>
      <IonItem button detail={false} onClick={() => setOpen(true)}>
        <IonLabel position="stacked">Gewerk *</IonLabel>
        <div style={{
          padding: "10px 0 6px",
          color: value ? "var(--ion-text-color, #1E367A)" : "#999",
          fontSize: "1rem",
        }}>
          {value || "— bitte wählen —"}
        </div>
      </IonItem>

      <IonModal isOpen={open} onDidDismiss={close}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Gewerk wählen</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={close}>Schließen</IonButton>
            </IonButtons>
          </IonToolbar>
          <IonToolbar>
            <IonSearchbar
              value={search}
              onIonInput={(e) => setSearch(e.detail.value ?? "")}
              placeholder="Gewerk suchen …"
              debounce={80}
            />
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            {filtered.length === 0 && (
              <IonItem>
                <IonLabel color="medium" style={{ fontStyle: "italic" }}>
                  Keine Treffer
                </IonLabel>
              </IonItem>
            )}
            {filtered.map((g) => (
              <IonItem
                key={g}
                button
                detail={false}
                onClick={() => { onChange(g); close(); }}
                style={g === value ? { "--background": "rgba(71,188,194,0.12)" } : {}}
              >
                <IonLabel>{g}</IonLabel>
              </IonItem>
            ))}
          </IonList>
        </IonContent>
      </IonModal>
    </>
  );
}

// ── Suchbares Gewerk-Mehrfachauswahlfeld (Betrieb) ───────────────────────────
function GewerkMultiPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<string[]>([]);

  const filtered = GEWERKE.filter((g) =>
    g.toLowerCase().includes(search.toLowerCase())
  );

  function toggle(g: string) {
    setDraft((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }

  function handleOpen() {
    setDraft(value);
    setSearch("");
    setOpen(true);
  }

  function apply() {
    onChange(draft);
    setOpen(false);
  }

  return (
    <>
      <IonItem button detail={false} onClick={handleOpen}>
        <IonLabel position="stacked">Gewerke *</IonLabel>
        <div style={{
          padding: "10px 0 6px",
          color: value.length ? "var(--ion-text-color, #1E367A)" : "#999",
          fontSize: "1rem",
        }}>
          {value.length === 0 ? "— bitte wählen —" : "Gewerke bearbeiten …"}
        </div>
      </IonItem>
      {value.length > 0 && (
        <IonItem lines="none">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: "6px 0 10px" }}>
            {value.map((g) => (
              <IonChip key={g} color="primary" onClick={(e) => { e.stopPropagation(); onChange(value.filter((x) => x !== g)); }}>
                <IonLabel>{g}</IonLabel>
                <IonIcon icon={closeCircle} />
              </IonChip>
            ))}
          </div>
        </IonItem>
      )}

      <IonModal isOpen={open} onDidDismiss={() => setOpen(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Gewerke wählen</IonTitle>
            <IonButtons slot="end">
              <IonButton strong onClick={apply}>
                Fertig {draft.length > 0 ? `(${draft.length})` : ""}
              </IonButton>
            </IonButtons>
          </IonToolbar>
          <IonToolbar>
            <IonSearchbar
              value={search}
              onIonInput={(e) => setSearch(e.detail.value ?? "")}
              placeholder="Gewerk suchen …"
              debounce={80}
            />
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {draft.length > 0 && (
            <IonItem button detail={false} onClick={() => setDraft([])}>
              <IonLabel color="medium" style={{ fontStyle: "italic" }}>
                Auswahl aufheben
              </IonLabel>
            </IonItem>
          )}
          <IonList>
            {filtered.length === 0 && (
              <IonItem>
                <IonLabel color="medium" style={{ fontStyle: "italic" }}>Keine Treffer</IonLabel>
              </IonItem>
            )}
            {filtered.map((g) => (
              <IonItem
                key={g}
                button
                detail={false}
                onClick={() => toggle(g)}
                style={draft.includes(g) ? { "--background": "rgba(71,188,194,0.1)" } : {}}
              >
                <IonLabel>{g}</IonLabel>
                {draft.includes(g) && (
                  <span slot="end" style={{ color: "#47BCC2", fontWeight: 700, fontSize: "1.1rem" }}>✓</span>
                )}
              </IonItem>
            ))}
          </IonList>
        </IonContent>
      </IonModal>
    </>
  );
}

// ── Suchbares Berufsschule-Auswahlfeld ───────────────────────────────────────
function BerufsschulePicker({
  value,
  gewerk,
  onChange,
}: {
  value: string;
  gewerk: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const empfohlen: string[] = gewerk ? (BERUFSSCHULEN_NACH_GEWERK[gewerk] ?? []) : [];

  const filtered = BERUFSSCHULEN.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const empfohlenFiltered = filtered.filter((s) => empfohlen.includes(s.name));
  const weitereFiltered = filtered.filter((s) => !empfohlen.includes(s.name));

  const close = () => { setOpen(false); setSearch(""); };

  return (
    <>
      <IonItem button detail={false} onClick={() => setOpen(true)}>
        <IonLabel position="stacked">Berufsschule *</IonLabel>
        <div style={{
          padding: "10px 0 6px",
          color: value ? "var(--ion-text-color, #1E367A)" : "#999",
          fontSize: "1rem",
        }}>
          {value || "— bitte wählen —"}
        </div>
      </IonItem>

      <IonModal isOpen={open} onDidDismiss={close}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Berufsschule wählen</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={close}>Schließen</IonButton>
            </IonButtons>
          </IonToolbar>
          <IonToolbar>
            <IonSearchbar
              value={search}
              onIonInput={(e) => setSearch(e.detail.value ?? "")}
              placeholder="Schule suchen …"
              debounce={80}
            />
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            {empfohlenFiltered.length > 0 && (
              <>
                <IonListHeader>
                  <IonLabel style={{ fontSize: "0.78rem", color: "#47BCC2", fontWeight: 600 }}>
                    Empfohlen für {gewerk}
                  </IonLabel>
                </IonListHeader>
                {empfohlenFiltered.map((s) => (
                  <IonItem
                    key={s.name}
                    button
                    detail={false}
                    onClick={() => { onChange(s.name); close(); }}
                    style={s.name === value ? { "--background": "rgba(71,188,194,0.12)" } : {}}
                  >
                    <IonLabel>
                      <span>{s.name}</span>
                      <span style={{ fontSize: "0.72rem", color: "#8096b8", marginLeft: 6 }}>
                        ({s.typ})
                      </span>
                    </IonLabel>
                  </IonItem>
                ))}
                {weitereFiltered.length > 0 && (
                  <IonListHeader>
                    <IonLabel style={{ fontSize: "0.78rem", color: "#8096b8", fontWeight: 600 }}>
                      Alle weiteren Schulen
                    </IonLabel>
                  </IonListHeader>
                )}
              </>
            )}
            {weitereFiltered.length === 0 && empfohlenFiltered.length === 0 && (
              <IonItem>
                <IonLabel color="medium" style={{ fontStyle: "italic" }}>Keine Treffer</IonLabel>
              </IonItem>
            )}
            {weitereFiltered.map((s) => (
              <IonItem
                key={s.name}
                button
                detail={false}
                onClick={() => { onChange(s.name); close(); }}
                style={s.name === value ? { "--background": "rgba(71,188,194,0.12)" } : {}}
              >
                <IonLabel>
                  <span>{s.name}</span>
                  <span style={{ fontSize: "0.72rem", color: "#8096b8", marginLeft: 6 }}>
                    ({s.typ})
                  </span>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        </IonContent>
      </IonModal>
    </>
  );
}

// ── Handwerkskammer-Feld ──────────────────────────────────────────────────────
const KAMMER_INFO: Record<string, { region: string; bezirk: string }> = {
  "Handwerkskammer Berlin (HWK)": {
    region: "Stadtgebiet Berlin",
    bezirk: "Alle Berliner Bezirke",
  },
};

function HandwerkskammerField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const info = value ? KAMMER_INFO[value] : null;
  return (
    <>
      <IonListHeader>
        <IonLabel>Institution / Kammer</IonLabel>
      </IonListHeader>
      <IonItem>
        <IonLabel position="stacked">Institution / Kammer *</IonLabel>
        <IonSelect
          interface="alert"
          placeholder="— bitte wählen —"
          value={value}
          onIonChange={(e) => onChange(String(e.detail.value ?? ""))}
        >
          {VERBUNDBERATUNG_INSTITUTIONEN.map((h: string) => (
            <IonSelectOption key={h} value={h}>
              {h}
            </IonSelectOption>
          ))}
        </IonSelect>
      </IonItem>
      {info && (
        <IonItem lines="full" style={{ "--min-height": "auto", "--padding-top": "4px", "--padding-bottom": "10px" }}>
          <IonLabel>
            <p style={{ color: "#47BCC2", fontSize: "0.78rem", margin: 0, lineHeight: 1.4 }}>
              📍 Zuständig für: <strong>{info.region}</strong>
            </p>
            <p style={{ color: "#4a6080", fontSize: "0.74rem", margin: "2px 0 0", lineHeight: 1.4 }}>
              {info.bezirk}
            </p>
          </IonLabel>
        </IonItem>
      )}
    </>
  );
}

// ── Haupt-Formular ────────────────────────────────────────────────────────────
interface Props {
  state: ProfilFormState;
  onChange: (next: ProfilFormState) => void;
  hideTypeSwitch?: boolean;
  /** Callback wenn Bild im Pending-Modus ausgewählt wurde (Registrierung). */
  onPendingAvatar?: (file: File | null) => void;
}

export const ProfilFormFields: React.FC<Props> = ({ state, onChange, hideTypeSwitch, onPendingAvatar }) => {
  function set<K extends keyof ProfilFormState>(key: K, value: ProfilFormState[K]) {
    onChange({ ...state, [key]: value });
  }

  return (
    <>
      <ProfilbildUpload
        fileId={state.avatar_file_id}
        onChange={(id) => set("avatar_file_id", id)}
        onPendingFile={onPendingAvatar}
      />
      {!hideTypeSwitch && (
        <div className="ion-padding">
          <IonSegment
            value={state.type}
            onIonChange={(e) => set("type", (e.detail.value as ProfileType) ?? "talent")}
          >
            <IonSegmentButton value="talent">
              <IonLabel>Azubi</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="betrieb">
              <IonLabel>Betrieb</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>
      )}

      <IonList>
        {/* Handwerkskammer immer ganz oben */}
        <HandwerkskammerField
          value={state.handwerkskammer}
          onChange={(v) => set("handwerkskammer", v)}
        />

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
                  <IonSelectOption key={a} value={a}>{a}</IonSelectOption>
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
            <GewerkPicker
              value={state.gewerk}
              onChange={(v) => set("gewerk", v)}
            />
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
            <BerufsschulePicker
              value={state.berufsschule}
              gewerk={state.gewerk}
              onChange={(v) => set("berufsschule", v)}
            />
            <BeschulungsmodellFelder
              hauptform={state.beschulungsmodell_hauptform}
              unterform={state.beschulungsmodell_unterform}
              freitext={state.beschulungsmodell_freitext}
              onChange={(hf, uf, ft) => onChange({
                ...state,
                beschulungsmodell_hauptform: hf,
                beschulungsmodell_unterform: uf,
                beschulungsmodell_freitext:  ft,
              })}
            />
            <IonItem>
              <IonInput
                label="Fähigkeiten (Komma-getrennt, optional)"
                labelPlacement="stacked"
                placeholder="z.B. CNC-Fräse, CAD, Restaurierung"
                value={state.faehigkeiten}
                onIonInput={(e) => set("faehigkeiten", e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="E-Mail Ausbildungsbeauftragte/r *"
                labelPlacement="stacked"
                type="email"
                placeholder="ausbilder@betrieb.de"
                value={state.ausbildungsbeauftragter_email}
                onIonInput={(e) => set("ausbildungsbeauftragter_email", e.detail.value ?? "")}
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
              <IonInput
                label="Straße *"
                labelPlacement="stacked"
                value={state.strasse}
                onIonInput={(e) => set("strasse", e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Hausnummer *"
                labelPlacement="stacked"
                value={state.hausnummer}
                onIonInput={(e) => set("hausnummer", e.detail.value ?? "")}
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
                  label="Ort *"
                  labelPlacement="stacked"
                  value={state.ort}
                  onIonInput={(e) => set("ort", e.detail.value ?? "")}
                />
              </div>
            </IonItem>
            <GewerkMultiPicker
              value={state.gewerke}
              onChange={(v) => set("gewerke", v)}
            />

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
                  <IonSelectOption key={a} value={a}>{a}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonInput
                label="Name Ausbildungsbeauftragte/r *"
                labelPlacement="stacked"
                value={state.ansprechpartner}
                onIonInput={(e) => set("ansprechpartner", e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="E-Mail Ausbildungsbeauftragte/r *"
                labelPlacement="stacked"
                type="email"
                value={state.ansprechpartner_email}
                onIonInput={(e) => set("ansprechpartner_email", e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem lines="none" style={{ "--background": "#f0f8ff" }}>
              <p style={{ fontSize: "0.82rem", color: "#555", margin: "6px 0", lineHeight: 1.5 }}>
                ⚠️ Diese E-Mail-Adresse muss mit der E-Mail übereinstimmen,
                die Ihr/e Azubi bei der Registrierung als Ausbildungsbeauftragte/r
                angegeben hat – nur so können Sie Bewerbungen Ihrer Azubis einsehen
                und freigeben.
              </p>
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
            <IonItem>
              <IonLabel>Initiativbewerbungen annehmen</IonLabel>
              <IonToggle
                slot="end"
                checked={state.initiativbewerbungen}
                onIonChange={(e) => set("initiativbewerbungen", e.detail.checked)}
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
    if (!state.ausbildungsbeauftragter_email.trim()) missing.push("E-Mail Ausbildungsbeauftragte/r");
    if (!state.unternehmen.trim()) missing.push("Ausbildungsbetrieb");
    if (!state.handwerkskammer.trim()) missing.push("Institution / Kammer");
    if (!state.berufsschule.trim()) missing.push("Berufsschule");
  } else {
    if (!state.name.trim()) missing.push("Firmenname");
    if (!state.strasse.trim()) missing.push("Straße");
    if (!state.hausnummer.trim()) missing.push("Hausnummer");
    if (!state.plz.trim()) missing.push("PLZ");
    if (!state.ort.trim()) missing.push("Ort");
    if (state.gewerke.length === 0) missing.push("Gewerk (mind. 1)");
    if (!state.handwerkskammer.trim()) missing.push("Institution / Kammer");
    if (!state.anrede) missing.push("Anrede Ansprechpartner:in");
    if (!state.ansprechpartner.trim()) missing.push("Ansprechpartner:in");
    if (!state.ansprechpartner_email.trim()) missing.push("E-Mail Ausbildungsbeauftragte/r");
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
    ort: isTalent ? `${state.plz.trim()} ${state.ort.trim().replace(/^\d{5}\s+/, "")}`.trim() || null : null,
    adresse: !isTalent ? adresseZusammenfuegen(state.strasse.trim(), state.hausnummer.trim(), state.plz.trim(), state.ort.trim()) || null : null,
    // Azubi: einzelnes Gewerk; Betrieb: kommagetrennte Liste im gewerk-Feld
    gewerk: isTalent
      ? state.gewerk.trim() || null
      : state.gewerke.join(", ") || null,
    handwerkskammer: state.handwerkskammer.trim() || null,
    lehrjahr: isTalent && state.lehrjahr ? (Number(state.lehrjahr) as 1 | 2 | 3 | 4) : null,
    unternehmen: isTalent ? state.unternehmen.trim() || null : null,
    berufsschule: isTalent ? state.berufsschule.trim() || null : null,
    beschulungsmodell: isTalent
      ? beschulungsmodellZusammenfuegen(
          state.beschulungsmodell_hauptform,
          state.beschulungsmodell_unterform,
          state.beschulungsmodell_freitext,
        ) || null
      : null,
    faehigkeiten: isTalent ? split(state.faehigkeiten) : [],
    ansprechpartner: !isTalent ? state.ansprechpartner.trim() || null : null,
    ansprechpartner_email: !isTalent ? state.ansprechpartner_email.trim() || null : null,
    spezialisierung: !isTalent ? split(state.spezialisierung) : [],
    initiativbewerbungen: !isTalent ? state.initiativbewerbungen : null,
    ausbildungsbeauftragter_email: isTalent ? state.ausbildungsbeauftragter_email?.trim() || null : null,
    user_id: "",
    avatar_file_id: state.avatar_file_id,
  };
}
