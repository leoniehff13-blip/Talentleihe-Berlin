import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonSpinner,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonChip,
  IonLabel,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
  chevronBackOutline,
  personOutline,
  businessOutline,
  checkmarkCircle,
  ellipseOutline,
} from "ionicons/icons";
import { Query } from "appwrite";
import {
  databases,
  DB_LEHRSTELLEN,
  COL_APPRENTICESHIPS,
  COL_BEWERBUNGEN,
  COL_PROFILES,
  extractOwnerId,
  type Anzeige,
  type Bewerbung,
  type Profile,
} from "../lib/appwrite";
import AuthGate from "../components/AuthGate";

interface ProgressStep {
  label: string;
  done: boolean;
  current: boolean;
}

function profilHeadline(p: Profile | null, fallback: string): string {
  if (!p) return fallback;
  if (p.type === "talent") {
    return [p.anrede, p.vorname, p.name].filter(Boolean).join(" ") || fallback;
  }
  return p.name || fallback;
}

const VerbundbueroAnzeigeDetailInner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anzeige, setAnzeige] = useState<Anzeige | null>(null);
  const [bewerbungen, setBewerbungen] = useState<Bewerbung[]>([]);
  const [talentProfile, setTalentProfile] = useState<Profile | null>(null);
  const [betriebProfile, setBetriebProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Anzeige laden
        const a = await databases.getDocument<Anzeige>(
          DB_LEHRSTELLEN,
          COL_APPRENTICESHIPS,
          id
        );
        // Bewerbungen zu dieser Anzeige laden
        const bRes = await databases.listDocuments<Bewerbung>(
          DB_LEHRSTELLEN,
          COL_BEWERBUNGEN,
          [
            Query.equal("apprenticeship_id", id),
            Query.orderDesc("$createdAt"),
            Query.limit(50),
          ]
        );
        const bws = bRes.documents;

        // Anbieter-User-ID aus Permissions oder owner_id holen
        const ownerId = a.owner_id || extractOwnerId(a.$permissions ?? []);

        // Auswahl: bevorzugt angenommene Bewerbung, sonst die erste
        const angenommen = bws.find((b) => b.status === "angenommen");
        const lead = angenommen ?? bws[0];

        // Talent-/Betrieb-IDs ermitteln je nach Anzeigentyp
        // - Bei Einsatz (Betrieb-Anzeige): owner = Betrieb, Bewerber = Talent
        // - Bei Talent-Angebot: owner = Talent, Bewerber = Betrieb
        const istEinsatz = a.type === "einsatz";
        const betriebUserId = istEinsatz ? ownerId : lead?.applicant_user_id;
        const talentUserId = istEinsatz ? lead?.applicant_user_id : ownerId;

        // Profile laden (jeweils einzeln, da sie u.U. fehlen können)
        const pPromises: Promise<Profile | null>[] = [
          talentUserId
            ? databases
                .listDocuments<Profile>(DB_LEHRSTELLEN, COL_PROFILES, [
                  Query.equal("user_id", talentUserId),
                  Query.limit(1),
                ])
                .then((r) => r.documents[0] ?? null)
                .catch(() => null)
            : Promise.resolve(null),
          betriebUserId
            ? databases
                .listDocuments<Profile>(DB_LEHRSTELLEN, COL_PROFILES, [
                  Query.equal("user_id", betriebUserId),
                  Query.limit(1),
                ])
                .then((r) => r.documents[0] ?? null)
                .catch(() => null)
            : Promise.resolve(null),
        ];
        const [tP, bP] = await Promise.all(pPromises);

        if (cancelled) return;
        setAnzeige(a);
        setBewerbungen(bws);
        setTalentProfile(tP);
        setBetriebProfile(bP);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  function buildSteps(): ProgressStep[] {
    if (!anzeige) return [];
    const now = Date.now();
    const start = anzeige.startdatum ? new Date(anzeige.startdatum).getTime() : null;
    const ende = anzeige.enddatum ? new Date(anzeige.enddatum).getTime() : null;
    const hatBewerbung = bewerbungen.length > 0;
    const hatAngenommen = bewerbungen.some((b) => b.status === "angenommen");
    const istAktiv = start !== null && start <= now && (ende === null || ende >= now);
    const istAbgeschlossen = ende !== null && ende < now;
    // Bewertungs-Step: aktiv sobald abgeschlossen — wir prüfen das später,
    // falls eine Bewertungs-Tabelle abgefragt werden soll. Vorerst nur visuell.
    const steps: ProgressStep[] = [
      {
        label: "Anfrage gesendet",
        done: hatBewerbung,
        current: hatBewerbung && !hatAngenommen,
      },
      {
        label: "Anfrage angenommen",
        done: hatAngenommen,
        current: hatAngenommen && !istAktiv && !istAbgeschlossen,
      },
      {
        label: "Einsatz aktiv",
        done: istAktiv || istAbgeschlossen,
        current: istAktiv,
      },
      {
        label: "Einsatz abgeschlossen",
        done: istAbgeschlossen,
        current: istAbgeschlossen,
      },
    ];
    return steps;
  }

  function renderProfilCard(
    p: Profile | null,
    title: string,
    icon: string,
    accent: string
  ) {
    return (
      <IonCard style={{ height: "100%" }}>
        <IonCardHeader>
          <IonCardSubtitle
            style={{ display: "flex", alignItems: "center", gap: 8, color: accent }}
          >
            <IonIcon icon={icon} />
            {title}
          </IonCardSubtitle>
          <IonCardTitle style={{ fontSize: 16 }}>
            {profilHeadline(p, "—")}
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent style={{ fontSize: 13, lineHeight: 1.55 }}>
          {p ? (
            <>
              {p.gewerk && (
                <p>
                  <strong>Gewerk:</strong> {p.gewerk}
                </p>
              )}
              {p.type === "talent" && p.lehrjahr != null && (
                <p>
                  <strong>Lehrjahr:</strong> {p.lehrjahr}
                </p>
              )}
              {p.type === "talent" && p.unternehmen && (
                <p>
                  <strong>Ausbildungsbetrieb:</strong> {p.unternehmen}
                </p>
              )}
              {p.type === "talent" && p.berufsschule && (
                <p>
                  <strong>Berufsschule:</strong> {p.berufsschule}
                </p>
              )}
              {p.handwerkskammer && (
                <p>
                  <strong>HWK:</strong> {p.handwerkskammer}
                </p>
              )}
              {p.type === "talent" && p.ort && (
                <p>
                  <strong>Ort:</strong> {p.ort}
                </p>
              )}
              {p.type === "betrieb" && p.adresse && (
                <p>
                  <strong>Adresse:</strong> {p.adresse}
                </p>
              )}
              {p.type === "betrieb" && p.ansprechpartner && (
                <p>
                  <strong>Ansprechpartner:</strong> {p.ansprechpartner}
                </p>
              )}
              {p.type === "betrieb" && p.ansprechpartner_email && (
                <p style={{ wordBreak: "break-all" }}>
                  <strong>Mail:</strong> {p.ansprechpartner_email}
                </p>
              )}
              {p.type === "talent" && p.faehigkeiten?.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  {p.faehigkeiten.map((f) => (
                    <IonChip key={f} color="primary" outline>
                      <IonLabel>{f}</IonLabel>
                    </IonChip>
                  ))}
                </div>
              )}
              {p.type === "betrieb" && p.spezialisierung?.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  {p.spezialisierung.map((s) => (
                    <IonChip key={s} color="primary" outline>
                      <IonLabel>{s}</IonLabel>
                    </IonChip>
                  ))}
                </div>
              )}
            </>
          ) : (
            <IonText color="medium">
              <p style={{ margin: 0 }}>Profil-Daten nicht verfügbar.</p>
            </IonText>
          )}
        </IonCardContent>
      </IonCard>
    );
  }

  const steps = buildSteps();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton
              fill="clear"
              onClick={() => history.replace("/verbundbuero-uebersicht")}
            >
              <IonIcon slot="start" icon={chevronBackOutline} />
              Zurück
            </IonButton>
          </IonButtons>
          <IonTitle>{anzeige?.firma ?? "Detail"}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
            <IonSpinner name="crescent" />
          </div>
        )}

        {error && (
          <IonText color="danger">
            <p>{error}</p>
          </IonText>
        )}

        {anzeige && (
          <>
            {/* Anzeige oben */}
            <IonCard>
              <IonCardHeader>
                <IonCardSubtitle>
                  {anzeige.firma}{" "}
                  <IonBadge
                    color={anzeige.type === "talent_angebot" ? "tertiary" : "primary"}
                    style={{ marginLeft: 8 }}
                  >
                    {anzeige.type === "talent_angebot" ? "Talent-Angebot" : "Einsatz"}
                  </IonBadge>
                </IonCardSubtitle>
                <IonCardTitle>{anzeige.gewerk}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {anzeige.ort && (
                  <p>
                    <strong>Ort:</strong> {anzeige.ort}
                  </p>
                )}
                {(anzeige.startdatum || anzeige.enddatum) && (
                  <p>
                    {anzeige.startdatum && (
                      <>
                        <strong>Start:</strong>{" "}
                        {new Date(anzeige.startdatum).toLocaleDateString("de-DE")}
                      </>
                    )}
                    {anzeige.enddatum && (
                      <>
                        {" "}
                        &middot; <strong>Ende:</strong>{" "}
                        {new Date(anzeige.enddatum).toLocaleDateString("de-DE")}
                      </>
                    )}
                  </p>
                )}
                {anzeige.aufgabenbeschreibung && (
                  <p style={{ marginTop: 8 }}>{anzeige.aufgabenbeschreibung}</p>
                )}
                {anzeige.spezialisierungen?.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    {anzeige.spezialisierungen.map((s) => (
                      <IonChip key={s} color="primary">
                        <IonLabel>{s}</IonLabel>
                      </IonChip>
                    ))}
                  </div>
                )}
              </IonCardContent>
            </IonCard>

            {/* Talent links, Betrieb rechts */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginTop: 4,
              }}
            >
              {renderProfilCard(
                talentProfile,
                "Talent",
                personOutline,
                "var(--ion-color-tertiary-shade)"
              )}
              {renderProfilCard(
                betriebProfile,
                "Betrieb",
                businessOutline,
                "var(--ion-color-primary)"
              )}
            </div>

            {/* Fortschritts-Tracker */}
            <IonCard style={{ marginTop: 12 }}>
              <IonCardHeader>
                <IonCardTitle style={{ fontSize: 16 }}>Fortschritt</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {/* Balken */}
                <div
                  style={{
                    position: "relative",
                    height: 6,
                    background: "var(--ion-color-light-shade)",
                    borderRadius: 4,
                    marginBottom: 16,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: `${(steps.filter((s) => s.done).length / Math.max(1, steps.length)) * 100}%`,
                      background: "var(--ion-color-success)",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
                {/* Punkte */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${steps.length}, 1fr)`,
                    gap: 8,
                  }}
                >
                  {steps.map((s, i) => (
                    <div
                      key={i}
                      style={{
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <IonIcon
                        icon={s.done ? checkmarkCircle : ellipseOutline}
                        color={s.done ? "success" : s.current ? "primary" : "medium"}
                        style={{ fontSize: 28 }}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          color: s.current
                            ? "var(--ion-color-primary)"
                            : s.done
                              ? "var(--ion-text-color)"
                              : "var(--ion-color-medium)",
                          fontWeight: s.current ? 600 : 400,
                          lineHeight: 1.3,
                        }}
                      >
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </IonCardContent>
            </IonCard>

            {/* Bewerbungs-Zusammenfassung */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle style={{ fontSize: 16 }}>
                  Bewerbungen ({bewerbungen.length})
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {bewerbungen.length === 0 && (
                  <IonText color="medium">
                    <p style={{ margin: 0 }}>Noch keine Bewerbungen.</p>
                  </IonText>
                )}
                {bewerbungen.map((b) => (
                  <div
                    key={b.$id}
                    style={{
                      padding: "8px 0",
                      borderBottom: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <strong>{b.applicant_name || "Unbekannt"}</strong>
                      <IonBadge>{b.status}</IonBadge>
                    </div>
                    <IonText color="medium">
                      <p style={{ margin: 0, fontSize: 13 }}>{b.nachricht}</p>
                    </IonText>
                  </div>
                ))}
              </IonCardContent>
            </IonCard>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

const VerbundbueroAnzeigeDetail: React.FC = () => (
  <AuthGate title="Detail" backHref="/verbundbuero-uebersicht">
    <VerbundbueroAnzeigeDetailInner />
  </AuthGate>
);

export default VerbundbueroAnzeigeDetail;
