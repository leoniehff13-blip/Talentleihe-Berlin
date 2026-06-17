import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonText,
  IonSpinner,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonNote,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonAccordion,
  IonAccordionGroup,
} from "@ionic/react";
import { chevronBackOutline, personOutline, businessOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Query } from "appwrite";
import {
  databases,
  DB_LEHRSTELLEN,
  COL_APPRENTICESHIPS,
  COL_BEWERBUNGEN,
  BEWERBUNG_STATUS_LABEL,
  BEWERBUNG_STATUS_COLOR,
  type Anzeige,
  type Bewerbung,
} from "../lib/appwrite";
import { useAuth } from "../lib/AuthContext";
import AuthGate from "../components/AuthGate";

interface AnzeigeMitBewerbungen extends Anzeige {
  bewerbungen: Bewerbung[];
}

const VerbundbueroUebersichtInner: React.FC = () => {
  const { profile } = useAuth();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<{
    beworben: AnzeigeMitBewerbungen[];
    aktuell: AnzeigeMitBewerbungen[];
    abgeschlossen: AnzeigeMitBewerbungen[];
  }>({ beworben: [], aktuell: [], abgeschlossen: [] });

  useEffect(() => {
    if (profile?.role !== "verbundbuero") {
      setError("Diese Seite ist nur für Mitarbeitende des Verbundbüros zugänglich.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // 1) Alle Bewerbungen laden (max 200 für den Anfang)
        const bewerbungenRes = await databases.listDocuments<Bewerbung>(
          DB_LEHRSTELLEN,
          COL_BEWERBUNGEN,
          [Query.orderDesc("$createdAt"), Query.limit(200)]
        );
        const bewerbungen = bewerbungenRes.documents;

        // 2) Eindeutige Anzeigen-IDs ermitteln
        const anzeigeIds = Array.from(
          new Set(bewerbungen.map((b) => b.apprenticeship_id))
        );
        if (anzeigeIds.length === 0) {
          if (!cancelled) {
            setGroups({ beworben: [], aktuell: [], abgeschlossen: [] });
            setLoading(false);
          }
          return;
        }

        // 3) Anzeigen in einem Rutsch laden
        const anzeigenRes = await databases.listDocuments<Anzeige>(
          DB_LEHRSTELLEN,
          COL_APPRENTICESHIPS,
          [Query.equal("$id", anzeigeIds), Query.limit(anzeigeIds.length)]
        );
        const anzeigeMap = new Map<string, Anzeige>();
        anzeigenRes.documents.forEach((a) => anzeigeMap.set(a.$id, a));

        // 4) Bewerbungen pro Anzeige zusammenfassen
        const merged: AnzeigeMitBewerbungen[] = [];
        for (const id of anzeigeIds) {
          const a = anzeigeMap.get(id);
          if (!a) continue;
          const bws = bewerbungen.filter((b) => b.apprenticeship_id === id);
          merged.push({ ...a, bewerbungen: bws });
        }

        // 5) In drei Kategorien sortieren
        const now = Date.now();
        const beworben: AnzeigeMitBewerbungen[] = [];
        const aktuell: AnzeigeMitBewerbungen[] = [];
        const abgeschlossen: AnzeigeMitBewerbungen[] = [];

        for (const a of merged) {
          const start = a.startdatum ? new Date(a.startdatum).getTime() : null;
          const ende = a.enddatum ? new Date(a.enddatum).getTime() : null;

          // Aktuell stattfindend: Startdatum erreicht UND Enddatum noch nicht
          const istAktuell =
            start !== null && start <= now && (ende === null || ende >= now);

          // Abgeschlossen: Enddatum überschritten
          const istAbgeschlossen = ende !== null && ende < now;

          if (istAbgeschlossen) {
            abgeschlossen.push(a);
          } else if (istAktuell) {
            aktuell.push(a);
          } else {
            beworben.push(a);
          }
        }

        if (!cancelled) {
          setGroups({ beworben, aktuell, abgeschlossen });
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [profile]);

  function renderListe(items: AnzeigeMitBewerbungen[]) {
    if (items.length === 0) {
      return (
        <div className="ion-padding">
          <IonText color="medium">
            <p>Aktuell keine Einträge in dieser Kategorie.</p>
          </IonText>
        </div>
      );
    }
    return (
      <IonList>
        {items.map((a) => {
          const istTalent = a.type === "talent_angebot";
          const offene = a.bewerbungen.filter((b) => b.status === "ausstehend").length;
          const angenommene = a.bewerbungen.filter((b) => b.status === "angenommen").length;
          return (
            <IonItem
              key={a.$id}
              button
              onClick={() => history.push(`/verbundbuero-anzeige/${a.$id}`)}
              detail
            >
              {/* Icon links: Person für Talent-Angebot, Firma für Einsatz */}
              <IonIcon
                slot="start"
                icon={istTalent ? personOutline : businessOutline}
                color={istTalent ? "tertiary" : "primary"}
                aria-label={istTalent ? "Talent-Angebot" : "Einsatz"}
                style={{ fontSize: 28 }}
              />
              <IonLabel>
                {/* Zeile 1: Name des Betriebs/Talents */}
                <h2 style={{ fontWeight: 700 }}>{a.firma || "—"}</h2>
                {/* Zeile 2: Gewerk + Ort */}
                <p>
                  {a.gewerk}
                  {a.ort && ` · ${a.ort}`}
                </p>
                {/* Zeile 3: Start- und Enddatum */}
                <IonNote>
                  {a.startdatum
                    ? `Start ${new Date(a.startdatum).toLocaleDateString("de-DE")}`
                    : "Start —"}
                  {a.enddatum
                    ? ` · Ende ${new Date(a.enddatum).toLocaleDateString("de-DE")}`
                    : ""}
                </IonNote>
                <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <IonBadge color="warning">
                    {a.bewerbungen.length} Bewerb.
                  </IonBadge>
                  {offene > 0 && (
                    <IonBadge color={BEWERBUNG_STATUS_COLOR.ausstehend}>
                      {offene} offen
                    </IonBadge>
                  )}
                  {angenommene > 0 && (
                    <IonBadge color={BEWERBUNG_STATUS_COLOR.angenommen}>
                      {angenommene} angenommen
                    </IonBadge>
                  )}
                </div>
              </IonLabel>
            </IonItem>
          );
        })}
      </IonList>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => history.replace("/konto")} fill="clear">
              <IonIcon slot="start" icon={chevronBackOutline} />
              Zurück
            </IonButton>
          </IonButtons>
          <IonTitle>Aktuelle Bewerbungen</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
            <IonSpinner name="crescent" />
          </div>
        )}

        {error && (
          <div className="ion-padding">
            <IonText color="danger">
              <p>{error}</p>
            </IonText>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Sichtbarer Zurück-Button im Body, damit er nicht in der
                Toolbar verloren geht */}
            <div className="ion-padding" style={{ paddingBottom: 0 }}>
              <IonButton
                fill="outline"
                color="secondary"
                size="small"
                onClick={() => history.replace("/konto")}
              >
                <IonIcon slot="start" icon={chevronBackOutline} />
                Zurück zum Konto
              </IonButton>
            </div>

            <IonCard>
              <IonCardContent>
                <IonText color="medium">
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>
                    Übersicht aller Einsätze und Talent-Angebote, auf die sich
                    schon mindestens eine Person beworben hat. Die Einträge sind
                    nach Status gruppiert.
                  </p>
                </IonText>
              </IonCardContent>
            </IonCard>

            <IonAccordionGroup multiple value={["beworben", "aktuell", "abgeschlossen"]}>
              <IonAccordion value="beworben">
                <IonItem slot="header" color="light">
                  <IonLabel>
                    Auf die sich beworben wurde
                    <IonBadge color="primary" style={{ marginLeft: 8 }}>
                      {groups.beworben.length}
                    </IonBadge>
                  </IonLabel>
                </IonItem>
                <div slot="content">{renderListe(groups.beworben)}</div>
              </IonAccordion>

              <IonAccordion value="aktuell">
                <IonItem slot="header" color="light">
                  <IonLabel>
                    Aktuell stattfindend
                    <IonBadge color="success" style={{ marginLeft: 8 }}>
                      {groups.aktuell.length}
                    </IonBadge>
                  </IonLabel>
                </IonItem>
                <div slot="content">{renderListe(groups.aktuell)}</div>
              </IonAccordion>

              <IonAccordion value="abgeschlossen">
                <IonItem slot="header" color="light">
                  <IonLabel>
                    Bereits abgeschlossen
                    <IonBadge color="medium" style={{ marginLeft: 8 }}>
                      {groups.abgeschlossen.length}
                    </IonBadge>
                  </IonLabel>
                </IonItem>
                <div slot="content">{renderListe(groups.abgeschlossen)}</div>
              </IonAccordion>
            </IonAccordionGroup>

            {/* Status-Legende - damit die Farben verständlich bleiben */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle style={{ fontSize: 14 }}>Status-Legende</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(Object.keys(BEWERBUNG_STATUS_LABEL) as Array<keyof typeof BEWERBUNG_STATUS_LABEL>).map(
                    (k) => (
                      <IonBadge key={k} color={BEWERBUNG_STATUS_COLOR[k]}>
                        {BEWERBUNG_STATUS_LABEL[k]}
                      </IonBadge>
                    )
                  )}
                </div>
              </IonCardContent>
            </IonCard>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

const VerbundbueroUebersicht: React.FC = () => (
  <AuthGate title="Aktuelle Bewerbungen" backHref="/konto">
    <VerbundbueroUebersichtInner />
  </AuthGate>
);

export default VerbundbueroUebersicht;
