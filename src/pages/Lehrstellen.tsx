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
} from "@ionic/react";
import { useEffect, useState, useCallback } from "react";
import { Query } from "appwrite";
import {
  databases,
  DB_LEHRSTELLEN,
  COL_APPRENTICESHIPS,
  MINDESTALTER_OPTIONS,
  type Lehrstelle,
} from "../lib/appwrite";
import { useAuth } from "../lib/AuthContext";
import AuthGate from "../components/AuthGate";
import LehrstellenMap from "../components/LehrstellenMap";
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


const LehrstellenInner: React.FC = () => {
  const { user, profile } = useAuth();
  const [items, setItems] = useState<Lehrstelle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [view, setView] = useState<ViewMode>("liste");
  const [geoStatus, setGeoStatus] = useState<string | null>(null);

  // Welcher Anzeigentyp soll je nach Rolle gezeigt werden?
  // Talent (Azubi) sieht Angebote der Betriebe → "einsatz"
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
        ? "Aktuelle Talent-Angebote von Azubis"
        : "Alle aktuellen Angebote";

  const load = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Berlin UND Brandenburg (HWK Frankfurt/Oder) – beide Kammerbereiche
      const queries: string[] = [
        Query.orderDesc("startdatum"),
        Query.limit(100),
        Query.equal("bundesland", ["Berlin", "Brandenburg"]),
      ];

      // Rollenspezifischer Typ-Filter
      if (angezeigterTyp) {
        queries.push(Query.equal("type", angezeigterTyp));
      }

      // Server-seitige Filter, die Appwrite direkt unterstützt
      if (filters.startVon) {
        queries.push(Query.greaterThanEqual("startdatum", new Date(filters.startVon).toISOString()));
      }
      if (filters.startBis) {
        queries.push(Query.lessThanEqual("startdatum", new Date(filters.startBis).toISOString()));
      }

      // Mindestalter: serverseitig nur, wenn nach „kein" oder konkretem Wert gefiltert wird
      if (filters.mindestalter === "kein") {
        queries.push(Query.isNull("mindestalter"));
      } else if (filters.mindestalter) {
        queries.push(Query.lessThanEqual("mindestalter", Number(filters.mindestalter)));
      }

      const result = await databases.listDocuments<Lehrstelle>(
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

        const inRange: Lehrstelle[] = [];
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
  }, [filters, user, angezeigterTyp]);

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
          <IonTitle>Talentleihe</IonTitle>
        </IonToolbar>
        <IonToolbar>
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
                    onIonInput={(e) => setFilter("ortOrPlz", e.detail.value ?? "")}
                  />
                </IonItem>
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
                    label="Start ab"
                    labelPlacement="stacked"
                    type="date"
                    value={filters.startVon}
                    onIonInput={(e) => setFilter("startVon", e.detail.value ?? "")}
                  />
                </IonItem>
                <IonItem>
                  <IonInput
                    label="Start bis"
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

        {!loading && !error && items.length === 0 && (
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
                        ? "Aktuell stehen keine Talent-Angebote von Azubis online."
                        : "Aktuell sind keine Anzeigen vorhanden."}
              </p>
            </IonText>
          </div>
        )}

        {!loading && items.length > 0 && view === "liste" && (
          <IonList>
            {items.map((item) => {
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
                  routerLink={`/lehrstellen/${item.$id}`}
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
                      {kammerKurz ? ` · ${kammerKurz}` : ""}
                    </IonNote>
                  </IonLabel>
                  <IonBadge color={itemIsTalent ? "tertiary" : "primary"} slot="end">
                    {itemIsTalent ? "Talent" : "Einsatz"}
                  </IonBadge>
                </IonItem>
              );
            })}
          </IonList>
        )}

        {!loading && items.length > 0 && view === "karte" && (
          <div className="ion-padding" style={{ paddingTop: 8 }}>
            <LehrstellenMap items={items} showKammerAreas />
            <IonText color="medium">
              <p style={{ fontSize: 12, marginTop: 8 }}>
                Tipp: Beim ersten Laden werden die Adressen einmalig geocodiert
                (max. 1 pro Sekunde). Beim nächsten Mal sind alle Pins sofort
                da. Klick auf einen Pin öffnet die Anzeige.
              </p>
            </IonText>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

const Lehrstellen: React.FC = () => (
  <AuthGate title="Talentleihe">
    <LehrstellenInner />
  </AuthGate>
);

export default Lehrstellen;
