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

interface Filters {
  ort: string;
  gewerk: string;
  startVon: string;
  startBis: string;
  mindestalter: string; // "" = egal, "kein" = nur ohne, "16"|"18"|"21" = bis zu …
}

const EMPTY_FILTERS: Filters = {
  ort: "",
  gewerk: "",
  startVon: "",
  startBis: "",
  mindestalter: "",
};

const LehrstellenInner: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Lehrstelle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const load = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const queries: string[] = [Query.orderDesc("startdatum"), Query.limit(100)];

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
        // „bis 16/18/21" → Lehrstellen mit mindestalter <= ausgewähltem Wert
        queries.push(Query.lessThanEqual("mindestalter", Number(filters.mindestalter)));
      }

      const result = await databases.listDocuments<Lehrstelle>(
        DB_LEHRSTELLEN,
        COL_APPRENTICESHIPS,
        queries
      );

      // Client-seitige Filter (Substring-Suche)
      const ortLower = filters.ort.trim().toLowerCase();
      const gewerkLower = filters.gewerk.trim().toLowerCase();
      const filtered = result.documents.filter((d) => {
        if (ortLower && !(d.ort ?? "").toLowerCase().includes(ortLower)) return false;
        if (gewerkLower && !(d.gewerk ?? "").toLowerCase().includes(gewerkLower)) return false;
        return true;
      });

      setItems(filtered);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [filters, user]);

  useEffect(() => {
    load();
  }, [load]);

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const filterCount = Object.entries(filters).filter(([, v]) => v).length;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Talentleihe</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={(e) => load().finally(() => e.detail.complete())}>
          <IonRefresherContent />
        </IonRefresher>

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
                    label="Ort"
                    labelPlacement="stacked"
                    placeholder="z. B. Hamburg"
                    value={filters.ort}
                    onIonInput={(e) => setFilter("ort", e.detail.value ?? "")}
                  />
                </IonItem>
                <IonItem>
                  <IonInput
                    label="Gewerk"
                    labelPlacement="stacked"
                    placeholder="z. B. Tischler"
                    value={filters.gewerk}
                    onIonInput={(e) => setFilter("gewerk", e.detail.value ?? "")}
                  />
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
          <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
            <IonSpinner name="crescent" />
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
              <p>Keine Treffer für diese Filter.</p>
            </IonText>
          </div>
        )}

        {!loading && items.length > 0 && (
          <IonList>
            {items.map((item) => {
              const itemIsTalent = item.type === "talent_angebot";
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
