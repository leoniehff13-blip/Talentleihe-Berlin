import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonBadge,
  IonSpinner,
  IonText,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonRefresher,
  IonRefresherContent,
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonRange,
  IonModal,
  IonSearchbar,
  IonButtons,
  IonToggle,
} from "@ionic/react";
import Footer from "../components/Footer";
import { useEffect, useState, useCallback } from "react";
import { Query } from "appwrite";
import {
  databases,
  DB_LEHRSTELLEN,
  COL_APPRENTICESHIPS,
  COL_PROFILES,
  MINDESTALTER_OPTIONS,
  type Anzeige,
  type Profile,
} from "../lib/appwrite";
import { useAuth } from "../lib/AuthContext";
import AuthGate from "../components/AuthGate";
import AnzeigenMap from '../components/AnzeigenMap';
import { geocode, buildItemQuery, haversineKm } from "../lib/geocode";
import { GEWERKE, gewerkStamm } from "../lib/gewerke";
import { BERLIN_REGION_KAMMERN } from "../lib/handwerkskammern";

interface Filters {
  ortOrPlz: string;
  umkreis: number;
  gewerke: string[];
  kammer: string;
  startVon: string;
  startBis: string;
  mindestalter: string;
}

const EMPTY_FILTERS: Filters = {
  ortOrPlz: "",
  umkreis: 50,
  gewerke: [],
  kammer: "",
  startVon: "",
  startBis: "",
  mindestalter: "",
};

function GewerkMultiPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
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

  const label =
    value.length === 0
      ? "Alle Gewerke"
      : value.length === 1
        ? value[0]
        : `${value.length} Gewerke ausgewählt`;

  return (
    <>
      <IonItem button detail={false} onClick={handleOpen}>
        <IonLabel position="stacked">Gewerk</IonLabel>
        <div style={{ padding: "10px 0 6px", color: value.length ? "var(--ion-text-color)" : "#999", fontSize: "1rem" }}>
          {label}
        </div>
      </IonItem>

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
              <IonItem key={g} button detail={false} onClick={() => toggle(g)}
                style={draft.includes(g) ? { "--background": "rgba(71,188,194,0.1)" } : {}}>
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

type ViewMode = "liste" | "karte";


const AnzeigenInner: React.FC = () => {
  const { user, profile, profileLoading } = useAuth();
  const [items, setItems] = useState<Anzeige[]>([]);
  const [betriebProfile, setBetriebProfile] = useState<Profile[]>([]);
  const [zeigAlleBetriebe, setZeigAlleBetriebe] = useState(false);
  const [nurOffene, setNurOffene] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [view, setView] = useState<ViewMode>("liste");
  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [ortVorbefuellt, setOrtVorbefuellt] = useState(false);

  // Ort und Gewerke aus Profil vorausfüllen (einmalig, überschreibbar)
  useEffect(() => {
    if (ortVorbefuellt || !profile) return;

    if (profile.type === "talent") {
      const ort = profile.ort?.trim();
      const gewerk = profile.gewerk?.trim();
      setFilters((prev) => ({
        ...prev,
        ...(ort ? { ortOrPlz: ort } : {}),
        ...(gewerk ? { gewerke: [gewerk] } : {}),
      }));
    } else if (profile.type === "betrieb") {
      // gewerk-Feld enthält kommagetrennte Gewerke-Liste
      const gewerke = (profile.gewerk ?? "")
        .split(",").map((s) => s.trim()).filter(Boolean);
      if (gewerke.length > 0) {
        setFilters((prev) => ({ ...prev, gewerke }));
      }
    }

    setOrtVorbefuellt(true);
  }, [profile, ortVorbefuellt]);

  // Welcher Anzeigentyp soll je nach Rolle gezeigt werden?
  // Azubi sieht Angebote der Betriebe → "einsatz"
  // Betrieb sieht Angebote der Azubis → "talent_angebot"
  // Wer noch kein Profil hat, sieht alles, mit einem Hinweis-Banner.
  const angezeigterTyp: "einsatz" | "talent_angebot" | null =
    profile?.type === "talent"
      ? "einsatz"
      : profile?.type === "betrieb"
        ? "talent_angebot"
        : null;

  const subtitleText =
    angezeigterTyp === "einsatz"
      ? "Aktuelle Einsätze von Betrieben"
      : angezeigterTyp === "talent_angebot"
        ? "Aktuelle Azubi-Angebote"
        : "Alle aktuellen Angebote";

  // Alle Betriebe laden (nur für Talent-Ansicht)
  useEffect(() => {
    if (!zeigAlleBetriebe || profile?.type !== "talent") return;
    let cancelled = false;
    async function loadBetriebe() {
      const result = await databases.listDocuments<Profile>(
        DB_LEHRSTELLEN,
        COL_PROFILES,
        [Query.equal("type", "betrieb"), Query.limit(100)]
      );
      if (!cancelled) setBetriebProfile(result.documents);
    }
    loadBetriebe();
    return () => { cancelled = true; };
  }, [zeigAlleBetriebe, profile]);

  const load = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    // Warten bis das Profil geladen ist – sonst läuft die Abfrage ohne Typ-Filter
    // und zeigt kurz alle Typen (einsatz + talent_angebot) gleichzeitig.
    if (profileLoading) return;
    setLoading(true);
    setError(null);
    try {
      // Regionale Eingrenzung über die Handwerkskammer statt über bundesland:
      // Das Anzeigen-Formular setzt bundesland immer auf null, füllt aber
      // handwerkskammer aus einem Dropdown. Wir zeigen daher genau die zwei
      // für VerbundPraxis relevanten Kammern (Berlin + Frankfurt/Oder).
      const queries: string[] = [
        Query.orderDesc("startdatum"),
        Query.limit(100),
        Query.equal("handwerkskammer", [...BERLIN_REGION_KAMMERN]),
      ];

      // Rollenspezifischer Typ-Filter
      if (angezeigterTyp) {
        queries.push(Query.equal("type", angezeigterTyp));
      }

      // Datum-Filter: Einsatz ist verfügbar wenn startdatum ≤ Ende des filterBis-Tages
      // (enddatum ≥ filterVon → clientseitig, da Appwrite kein OR unterstützt)
      if (filters.startBis) {
        queries.push(Query.lessThanEqual("startdatum", filters.startBis + "T23:59:59.999Z"));
      }

      // Mindestalter: serverseitig nur, wenn nach „kein" oder konkretem Wert gefiltert wird
      if (filters.mindestalter === "kein") {
        queries.push(Query.isNull("mindestalter"));
      } else if (filters.mindestalter) {
        queries.push(Query.lessThanEqual("mindestalter", Number(filters.mindestalter)));
      }

      const result = await databases.listDocuments<Anzeige>(
        DB_LEHRSTELLEN,
        COL_APPRENTICESHIPS,
        queries
      );

      // Client-seitige Filter
      let filtered = result.documents.filter((d) => {
        // Gewerk-Multi-Filter
        if (filters.gewerke.length > 0) {
          const itemStamm = gewerkStamm(d.gewerk ?? "");
          const matches = filters.gewerke.some((g) => {
            const sel = gewerkStamm(g);
            return itemStamm.includes(sel) || sel.includes(itemStamm);
          });
          if (!matches) return false;
        }
        // Kammer-Filter
        if (filters.kammer && d.handwerkskammer !== filters.kammer) {
          return false;
        }
        // Datum: Einsatz-Zeitraum muss mit dem Filterbereich überlappen
        // Vergleich nur auf Datumsteil (YYYY-MM-DD) → Zeitzone spielt keine Rolle
        if (filters.startVon || filters.startBis) {
          const toD = (iso: string) => iso.substring(0, 10);
          const vonDate = filters.startVon || null;
          const bisDate = filters.startBis || null;
          const startDate = toD(d.startdatum);
          const endDate = d.enddatum ? toD(d.enddatum) : null;

          if (endDate !== null) {
            // Mit Enddatum → echte Überschneidung prüfen
            if (bisDate !== null && startDate > bisDate) return false; // beginnt nach Filterende
            if (vonDate !== null && endDate < vonDate) return false;   // endet vor Filterbeginn
          } else {
            // Ohne Enddatum → nur Startdatum verwenden (kein "läuft ewig" annehmen)
            if (vonDate !== null && startDate < vonDate) return false; // begann vor Filterstart
            if (bisDate !== null && startDate > bisDate) return false; // beginnt nach Filterende
          }
        }
        return true;
      });

      // Geografischer Filter (Ort/PLZ + Umkreis)
      const suche = filters.ortOrPlz.trim();
      if (suche) {
        setGeoStatus(`Suche „${suche}" wird geocodiert…`);
        const searchCoords = await geocode(suche + ", Deutschland");
        if (!searchCoords) {
          setGeoStatus(`Standort „${suche}" konnte nicht gefunden werden.`);
          setItems([]);
          return;
        }

        const inRange: Anzeige[] = [];
        for (let i = 0; i < filtered.length; i++) {
          setGeoStatus(`Prüfe Anzeige ${i + 1} von ${filtered.length}…`);
          const item = filtered[i];
          const q = buildItemQuery(item);
          if (!q) continue;
          const itemCoords = await geocode(q);
          if (itemCoords && haversineKm(searchCoords, itemCoords) <= filters.umkreis) {
            inRange.push(item);
          }
        }
        filtered = inRange;
        setGeoStatus(null);
      }

      setItems(filtered);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [filters, user, angezeigterTyp, profileLoading]);

  useEffect(() => {
    load();
  }, [load]);

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const filterCount = [
    filters.ortOrPlz,
    filters.gewerke.length > 0 ? "1" : "",
    filters.kammer,
    filters.startVon,
    filters.startBis,
    filters.mindestalter,
  ].filter(Boolean).length;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>VerbundPraxis</IonTitle>
        </IonToolbar>
        <IonToolbar>
          {profile?.type !== "betrieb" && (
            <IonSegment
              value={view}
              onIonChange={(e) => setView((e.detail.value as ViewMode) ?? "liste")}
            >
              <IonSegmentButton value="liste">
                <IonLabel>Liste</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="karte">
                <IonLabel>Karte</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={(e) => load().finally(() => e.detail.complete())}>
          <IonRefresherContent />
        </IonRefresher>

        <div
          style={{
            padding: "12px 16px 4px",
            color: "var(--ion-color-secondary)",
            fontWeight: 600,
          }}
        >
          {subtitleText}
          {!profile && user && (
            <div
              style={{
                marginTop: 6,
                fontWeight: 400,
                fontSize: 13,
                color: "var(--ion-color-medium)",
              }}
            >
              Tipp: Vervollständige dein Profil unter „Konto", damit du gezielt
              die für dich passenden Anzeigen siehst.
            </div>
          )}
        </div>

        {profile?.type === "talent" && (
          <IonItem lines="none">
            <IonLabel>Alle Betriebe anzeigen</IonLabel>
            <IonToggle
              slot="end"
              checked={zeigAlleBetriebe}
              onIonChange={(e) => setZeigAlleBetriebe(e.detail.checked)}
            />
          </IonItem>
        )}
        {profile?.type === "talent" && !zeigAlleBetriebe && (
          <IonItem lines="none">
            <IonLabel>Nur aktuell offene Einsätze</IonLabel>
            <IonToggle
              slot="end"
              checked={nurOffene}
              onIonChange={(e) => setNurOffene(e.detail.checked)}
            />
          </IonItem>
        )}
        <IonAccordionGroup>
          <IonAccordion value="filter">
            <IonItem slot="header">
              <IonLabel>
                Filter{filterCount ? ` (${filterCount} aktiv)` : ""}
              </IonLabel>
            </IonItem>
            <div slot="content">
              <IonList>
                <IonItem>
                  <IonInput
                    label="Ort oder PLZ"
                    labelPlacement="stacked"
                    placeholder="z. B. Berlin oder 10115"
                    value={filters.ortOrPlz}
                    // Debounce: erst 500 ms nach dem letzten Tastenanschlag neu
                    // laden – sonst löst jeder Buchstabe einen kompletten Reload
                    // inkl. Geocoding aus (Race Conditions möglich).
                    debounce={500}
                    onIonInput={(e) => setFilter("ortOrPlz", e.detail.value ?? "")}
                  />
                </IonItem>
                {profile?.type !== "betrieb" && (
                  <IonItem>
                    <IonLabel position="stacked">
                      Umkreis: {filters.umkreis} km
                    </IonLabel>
                    <IonRange
                      min={0}
                      max={200}
                      step={5}
                      snaps
                      ticks={false}
                      pin={true}
                      pinFormatter={(v: number) => `${v} km`}
                      value={filters.umkreis}
                      onIonInput={(e) => {
                        const v = (e.detail.value as number) ?? 50;
                        setFilter("umkreis", v);
                      }}
                      disabled={!filters.ortOrPlz.trim()}
                    >
                      <IonLabel slot="start" style={{ fontSize: 12 }}>0</IonLabel>
                      <IonLabel slot="end" style={{ fontSize: 12 }}>200</IonLabel>
                    </IonRange>
                  </IonItem>
                )}
                <GewerkMultiPicker
                  value={filters.gewerke}
                  onChange={(v) => setFilter("gewerke", v)}
                />
                <IonItem>
                  <IonLabel position="stacked">Handwerkskammer</IonLabel>
                  <IonSelect
                    interface="alert"
                    placeholder="Beide Kammern"
                    value={filters.kammer}
                    onIonChange={(e) => setFilter("kammer", String(e.detail.value ?? ""))}
                  >
                    <IonSelectOption value="">Beide Kammern</IonSelectOption>
                    {BERLIN_REGION_KAMMERN.map((k) => (
                      <IonSelectOption key={k} value={k}>
                        {k}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonInput
                    label="Verfügbar ab"
                    labelPlacement="stacked"
                    type="date"
                    value={filters.startVon}
                    onIonInput={(e) => setFilter("startVon", e.detail.value ?? "")}
                  />
                </IonItem>
                <IonItem>
                  <IonInput
                    label="Verfügbar bis"
                    labelPlacement="stacked"
                    type="date"
                    value={filters.startBis}
                    onIonInput={(e) => setFilter("startBis", e.detail.value ?? "")}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Mindestalter</IonLabel>
                  <IonSelect
                    interface="popover"
                    value={filters.mindestalter}
                    onIonChange={(e) => setFilter("mindestalter", String(e.detail.value ?? ""))}
                  >
                    <IonSelectOption value="">egal</IonSelectOption>
                    <IonSelectOption value="kein">nur ohne Mindestalter</IonSelectOption>
                    {MINDESTALTER_OPTIONS.map((alter) => (
                      <IonSelectOption key={alter} value={String(alter)}>
                        passt für {alter}-Jährige
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              </IonList>
              <div className="ion-padding">
                <IonButton
                  expand="block"
                  fill="outline"
                  color="medium"
                  disabled={!filterCount}
                  onClick={() => setFilters(EMPTY_FILTERS)}
                >
                  Filter zurücksetzen
                </IonButton>
              </div>
            </div>
          </IonAccordion>
        </IonAccordionGroup>

        {loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              padding: 32,
            }}
          >
            <IonSpinner name="crescent" />
            {geoStatus && (
              <IonText color="medium">
                <p style={{ margin: 0, fontSize: 13 }}>{geoStatus}</p>
              </IonText>
            )}
          </div>
        )}

        {error && (
          <div className="ion-padding">
            <IonText color="danger">
              <p>Fehler beim Laden: {error}</p>
            </IonText>
          </div>
        )}

        {!zeigAlleBetriebe && !loading && !error && items.length === 0 && (
          <div className="ion-padding">
            <IonText color="medium">
              <p>
                {geoStatus
                  ? geoStatus
                  : filterCount
                    ? "Keine Treffer für diese Filter."
                    : angezeigterTyp === "einsatz"
                      ? "Aktuell sind keine Einsätze von Betrieben ausgeschrieben."
                      : angezeigterTyp === "talent_angebot"
                        ? "Aktuell stehen keine Azubi-Angebote online."
                        : "Aktuell sind keine Anzeigen vorhanden."}
              </p>
            </IonText>
          </div>
        )}

        {zeigAlleBetriebe && profile?.type === "talent" && (
          <IonList>
            {betriebProfile.map((bp) => (
              <IonItem key={bp.$id} routerLink={`/profil/${bp.user_id}`} detail>
                <IonLabel>
                  <h2>{bp.name}</h2>
                  <p>{(bp.gewerk ?? "").split(",").map(s => s.trim()).filter(Boolean).join(" · ")}</p>
                  <IonNote>{bp.ort ?? ""}</IonNote>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}

        {!zeigAlleBetriebe && !loading && view === "liste" && (() => {
          const today = new Date(); today.setHours(0,0,0,0);
          const sichtbar = nurOffene
            ? items.filter(item => {
                const start = new Date(item.startdatum);
                const end = item.enddatum ? new Date(item.enddatum) : null;
                return start <= today && (end === null || end >= today);
              })
            : items;
          if (!sichtbar.length) return null;
          return (
          <IonList>
            {sichtbar.map((item) => {
              const itemIsTalent = item.type === "talent_angebot";
              const kammer = item.handwerkskammer ?? "";
              const kammerKurz = kammer.includes("Frankfurt")
                ? "HWK Ostbrandenburg"
                : kammer.includes("Berlin")
                  ? "HWK Berlin"
                  : kammer;
              return (
                <IonItem
                  key={item.$id}
                  routerLink={`/anzeigen/${item.$id}`}
                  detail
                >
                  <IonLabel>
                    {profile?.type === "betrieb" ? (
                      <>
                        <h2>{item.talent_name || item.firma}</h2>
                        <p>{item.gewerk}{item.firma ? ` · ${item.firma}` : ""}</p>
                        <IonNote>
                          Verfügbar ab:{" "}
                          {new Date(item.startdatum).toLocaleDateString("de-DE")}
                          {kammerKurz ? ` · ${kammerKurz}` : ""}
                        </IonNote>
                      </>
                    ) : (
                      <>
                        <h2>{item.firma}</h2>
                        <p>{item.gewerk} · {item.ort}</p>
                        <IonNote>
                          {itemIsTalent ? "Verfügbar ab" : "Start"}:{" "}
                          {new Date(item.startdatum).toLocaleDateString("de-DE")}
                          {kammerKurz ? ` · ${kammerKurz}` : ""}
                        </IonNote>
                      </>
                    )}
                  </IonLabel>
                  <IonBadge color={itemIsTalent ? "tertiary" : "primary"} slot="end">
                    {itemIsTalent ? "Azubi" : "Einsatz"}
                  </IonBadge>
                </IonItem>
              );
            })}
          </IonList>
          );
        })()}

        {!zeigAlleBetriebe && !loading && items.length > 0 && view === "karte" && (
          <div className="ion-padding" style={{ paddingTop: 8 }}>
            <AnzeigenMap items={items} showKammerAreas />
            <IonText color="medium">
              <p style={{ fontSize: 12, marginTop: 8 }}>
                Tipp: Beim ersten Laden werden die Adressen einmalig geocodiert
                (max. 1 pro Sekunde). Beim nächsten Mal sind alle Pins sofort
                da. Klick auf einen Pin öffnet die Anzeige.
              </p>
            </IonText>
          </div>
        )}
        <Footer />
      </IonContent>
    </IonPage>
  );
};

const Anzeigen: React.FC = () => (
  <AuthGate title="VerbundPraxis">
    <AnzeigenInner />
  </AuthGate>
);

export default Anzeigen;
