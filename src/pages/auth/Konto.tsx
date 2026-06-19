import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonChip,
  IonLabel,
  IonSpinner,
  IonText,
  IonList,
  IonItem,
  IonIcon,
  IonAlert,
} from "@ionic/react";
import Footer from "../../components/Footer";
import { useEffect, useState } from "react";
import { Query } from "appwrite";
import {
  briefcaseOutline,
  sendOutline,
  mailOutline,
  chevronForward,
  createOutline,
  checkmarkCircleOutline,
  trashOutline,
  settingsOutline,
} from "ionicons/icons";
import { useAuth } from "../../lib/AuthContext";
import { translateError } from "../../lib/errors";
import { requestAccountDeletion } from "../../lib/accountDeletion";
import {
  databases,
  DB_LEHRSTELLEN,
  COL_BEWERTUNGEN,
  BEWERTUNG_KATEGORIEN,
  type Bewertung,
} from "../../lib/appwrite";
import Login from "./Login";
import DokumenteUpload from "../../components/DokumenteUpload";
import VerifizierungsWand from "../../components/VerifizierungsWand";
import PendingApprovalScreen from "../../components/PendingApprovalScreen";
import {
  ProfilFormFields,
  EMPTY_PROFIL,
  validateProfil,
  profilStateToInput,
  adresseAufteilen,
  ortAufteilen,
  type ProfilFormState,
} from "../../components/ProfilFormFields";

function StarDisplay({ value }: { value: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= Math.round(value) ? "#f5a623" : "#ddd", fontSize: "1.1rem" }}>★</span>
      ))}
      <span style={{ fontSize: "0.82rem", color: "#4a6080", marginLeft: 4 }}>
        {value.toFixed(1)}
      </span>
    </span>
  );
}

function BewertungSection({ userId, profileType }: { userId: string; profileType: "talent" | "betrieb" }) {
  const [bewertungen, setBewertungen] = useState<Bewertung[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    databases.listDocuments<Bewertung>(DB_LEHRSTELLEN, COL_BEWERTUNGEN, [
      Query.equal("rated_user_id", userId),
      Query.orderDesc("$createdAt"),
      Query.limit(50),
    ])
      .then((r) => setBewertungen(r.documents))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [userId]);

  if (!loaded || bewertungen.length === 0) return null;

  const avg = (vals: number[]) => vals.reduce((a, b) => a + b, 0) / vals.length;
  const kat1Avg = avg(bewertungen.map((b) => b.kat1));
  const kat2Avg = avg(bewertungen.map((b) => b.kat2));
  const kat3Avg = avg(bewertungen.map((b) => b.kat3));
  const gesamtAvg = avg([kat1Avg, kat2Avg, kat3Avg]);
  const kategorien = BEWERTUNG_KATEGORIEN[profileType];
  const mitKommentar = bewertungen.filter((b) => b.kommentar);

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Bewertungen</IonCardTitle>
        <IonCardSubtitle>
          {bewertungen.length} Bewertung{bewertungen.length !== 1 ? "en" : ""} · Gesamt:{" "}
          <StarDisplay value={gesamtAvg} />
        </IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>
        <IonList lines="none">
          {([
            [kategorien[0], kat1Avg],
            [kategorien[1], kat2Avg],
            [kategorien[2], kat3Avg],
          ] as [string, number][]).map(([kat, val]) => (
            <IonItem key={kat}>
              <IonLabel><h3>{kat}</h3></IonLabel>
              <div slot="end"><StarDisplay value={val} /></div>
            </IonItem>
          ))}
        </IonList>
        {mitKommentar.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <p style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 8, color: "#1E367A" }}>
              Kommentare:
            </p>
            {mitKommentar.slice(0, 5).map((b) => (
              <div key={b.$id} style={{
                background: "#f5f7fb", borderRadius: 8,
                padding: "10px 12px", marginBottom: 8,
                borderLeft: "3px solid #47BCC2",
              }}>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "#4a6080", lineHeight: 1.5 }}>{b.kommentar}</p>
                <p style={{ margin: "4px 0 0", fontSize: "0.74rem", color: "#aab" }}>
                  {new Date(b.$createdAt).toLocaleDateString("de-DE")}
                </p>
              </div>
            ))}
          </div>
        )}
      </IonCardContent>
    </IonCard>
  );
}


function ProfilFortschritt({ profile }: { profile: import("../../lib/appwrite").Profile }) {
  const isTalent = profile.type === "talent";

  const felder = isTalent
    ? [
        { label: "Anrede",            ok: Boolean(profile.anrede) },
        { label: "Vorname",           ok: Boolean(profile.vorname) },
        { label: "Gewerk",            ok: Boolean(profile.gewerk) },
        { label: "Lehrjahr",          ok: profile.lehrjahr != null },
        { label: "Ausbildungsbetrieb", ok: Boolean(profile.unternehmen) },
        { label: "Handwerkskammer",   ok: Boolean(profile.handwerkskammer) },
        { label: "Berufsschule",      ok: Boolean(profile.berufsschule) },
        { label: "Wohnort",           ok: Boolean(profile.ort) },
        { label: "Fähigkeiten",       ok: (profile.faehigkeiten ?? []).length > 0 },
      ]
    : [
        { label: "Firmenname",             ok: Boolean(profile.name) },
        { label: "Adresse",                ok: Boolean(profile.adresse) },
        { label: "Gewerke",                ok: Boolean(profile.gewerk) },
        { label: "Handwerkskammer",        ok: Boolean(profile.handwerkskammer) },
        { label: "Anrede Ansprechpartner:in", ok: Boolean(profile.anrede) },
        { label: "Ansprechpartner:in",     ok: Boolean(profile.ansprechpartner) },
        { label: "E-Mail Ansprechpartner:in", ok: Boolean(profile.ansprechpartner_email) },
        { label: "Spezialisierungen",      ok: (profile.spezialisierung ?? []).length > 0 },
      ];

  const ausgefuellt = felder.filter((f) => f.ok).length;
  const prozent = Math.round((ausgefuellt / felder.length) * 100);
  const fehlend = felder.filter((f) => !f.ok);

  const farbe =
    prozent === 100
      ? "var(--ion-color-success)"
      : prozent >= 70
      ? "var(--ion-color-primary)"
      : prozent >= 40
      ? "var(--ion-color-warning)"
      : "var(--ion-color-danger)";

  return (
    <IonCard>
      <IonCardHeader style={{ paddingBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <IonCardTitle style={{ fontSize: 15 }}>Profil-Vollständigkeit</IonCardTitle>
          <span style={{ fontWeight: 700, fontSize: 18, color: farbe }}>{prozent}%</span>
        </div>
      </IonCardHeader>
      <IonCardContent>
        {/* Fortschrittsbalken */}
        <div
          style={{
            background: "var(--ion-color-light-shade)",
            borderRadius: 8,
            height: 10,
            overflow: "hidden",
            marginBottom: fehlend.length > 0 ? 14 : 4,
          }}
        >
          <div
            style={{
              width: `${prozent}%`,
              height: "100%",
              borderRadius: 8,
              background: farbe,
              transition: "width 0.5s ease",
            }}
          />
        </div>

        {prozent === 100 ? (
          <IonText color="success">
            <p style={{ margin: 0, fontSize: 13 }}>
              ✓ Profil vollständig ausgefüllt – super!
            </p>
          </IonText>
        ) : (
          <>
            <IonText color="medium">
              <p style={{ margin: "0 0 8px", fontSize: 13 }}>
                Noch {fehlend.length} Feld{fehlend.length !== 1 ? "er" : ""} ausfüllen:
              </p>
            </IonText>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {fehlend.map((f) => (
                <IonChip key={f.label} outline style={{ fontSize: 12, margin: 0 }}>
                  <IonLabel>{f.label}</IonLabel>
                </IonChip>
              ))}
            </div>
          </>
        )}
      </IonCardContent>
    </IonCard>
  );
}

const Konto: React.FC = () => {
  const { user, profile, loading, profileLoading, logout, saveProfile, refresh } = useAuth();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProfilFormState>(EMPTY_PROFIL);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleRequestDeletion() {
    setDeleteBusy(true);
    setDeleteMsg(null);
    try {
      await requestAccountDeletion();
      setDeleteMsg({
        ok: true,
        text: "Wir haben dir eine Bestätigungsmail geschickt. Klicke auf den Link darin, um dein Konto endgültig zu löschen (Link 1 Stunde gültig).",
      });
    } catch (err: unknown) {
      setDeleteMsg({ ok: false, text: translateError(err) });
    } finally {
      setDeleteBusy(false);
    }
  }

  // Wenn das Profil aus dem Context da ist, ins Formular spiegeln.
  useEffect(() => {
    if (profile) {
      setForm({
        type: profile.type,
        anrede: profile.anrede ?? "",
        name: profile.name ?? "",
        vorname: profile.vorname ?? "",
        ...(() => {
          if (profile.type === "talent") {
            const { plz, ort } = ortAufteilen(profile.ort ?? "");
            return { plz, ort, strasse: "", hausnummer: "", adresse: "" };
          } else {
            const { strasse, hausnummer, plz, ort } = adresseAufteilen(profile.adresse ?? "");
            return { strasse, hausnummer, plz, ort, adresse: "" };
          }
        })(),
        gewerk: profile.gewerk ?? "",
        // Betrieb: gewerk-Feld enthält kommagetrennte Gewerke-Liste
        gewerke: profile.type === "betrieb"
          ? (profile.gewerk ?? "").split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        handwerkskammer: profile.handwerkskammer ?? "",
        lehrjahr: profile.lehrjahr != null ? String(profile.lehrjahr) : "",
        unternehmen: profile.unternehmen ?? "",
        berufsschule: profile.berufsschule ?? "",
        faehigkeiten: (profile.faehigkeiten ?? []).join(", "),
        ansprechpartner: profile.ansprechpartner ?? "",
        ansprechpartner_email: profile.ansprechpartner_email ?? "",
        spezialisierung: (profile.spezialisierung ?? []).join(", "),
        initiativbewerbungen: (profile as any).initiativbewerbungen ?? true,
      });
    } else {
      setForm(EMPTY_PROFIL);
    }
  }, [profile]);

  async function handleLogout() {
    // Kein Redirect: Ist der Nutzer ausgeloggt (user === null), zeigt diese
    // Seite automatisch das Login-Formular. So bleibt man auf /konto und kann
    // sich direkt wieder einloggen, statt auf die Lehrstellen-Seite zu springen.
    await logout();
  }

  async function handleSave() {
    setError(null);
    const missing = validateProfil(form);
    if (missing.length) {
      setError("Bitte ausfüllen: " + missing.join(", "));
      return;
    }
    setSaving(true);
    try {
      // Profil-State vor dem Speichern aktualisieren, falls er veraltet ist.
      // Verhindert versehentliches Anlegen eines Doppel-Profils.
      if (!profile) await refresh();
      await saveProfile(profilStateToInput(form));
      setEditing(false);
    } catch (err: unknown) {
      setError(translateError(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading || profileLoading) {
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

  if (!user) {
    // onSuccess={() => {}} verhindert history.replace("/konto") nach dem Login –
    // der Auth-State-Wechsel rendert Konto automatisch neu mit dem Profil.
    return <Login onSuccess={() => {}} />;
  }

  // E-Mail noch nicht bestätigt → Cover-Wand (auch direkt nach der
  // Registrierung). Erst nach Bestätigung wird das Konto nutzbar.
  // E-Mail-Banner statt Vollsperre – Nutzer kommt direkt ins Konto
  const zeigeEmailBanner = !user.emailVerification;

  // Verbundberatung-User ohne Freigabe → Warteschirm
  if (profile?.role === "verbundberatung" && !profile?.approved) {
    return <PendingApprovalScreen />;
  }

  // Nutzer ist eingeloggt, hat aber noch kein Profil → Anlegen-Modus
  const noProfile = !profile;
  if (noProfile || editing) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{noProfile ? "Profil anlegen" : "Profil bearbeiten"}</IonTitle>
            {!noProfile && (
              <IonButtons slot="end">
                <IonButton onClick={() => setEditing(false)}>Abbrechen</IonButton>
              </IonButtons>
            )}
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          {noProfile && (
            <div className="ion-padding">
              <IonText>
                <p>
                  Dein Konto hat noch kein Profil. Bitte ergänze deine Daten,
                  damit dich andere finden können.
                </p>
              </IonText>
            </div>
          )}
          <ProfilFormFields
            state={form}
            onChange={setForm}
            hideTypeSwitch={Boolean(profile)}
          />
          {error && (
            <div className="ion-padding">
              <IonText color="danger">
                <p>{error}</p>
              </IonText>
            </div>
          )}
          <div className="ion-padding">
            <IonButton expand="block" onClick={handleSave} disabled={saving}>
              {saving ? "Speichern…" : "Profil speichern"}
            </IonButton>
          </div>

          {/* Gefahrenzone: Konto löschen – nur beim Bearbeiten eines
              bestehenden Profils, nicht beim Erst-Anlegen. */}
          {!noProfile && (
            <div
              className="ion-padding"
              style={{
                marginTop: 12,
                borderTop: "1px solid rgba(224, 80, 96, 0.18)",
                paddingTop: 20,
              }}
            >
              <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "var(--ion-color-danger)" }}>
                Konto löschen
              </h3>
              <IonText color="medium">
                <p style={{ margin: "0 0 12px", fontSize: 13.5, lineHeight: 1.5 }}>
                  Löscht dein Konto und alle zugehörigen Daten (Profil, Anzeigen,
                  Bewerbungen, Bewertungen und Dokumente) endgültig. Zur Sicherheit
                  schicken wir dir vorher eine Bestätigungsmail.
                </p>
              </IonText>
              <IonButton
                expand="block"
                fill="outline"
                color="danger"
                disabled={deleteBusy}
                onClick={() => setDeleteAlertOpen(true)}
              >
                <IonIcon slot="start" icon={trashOutline} />
                {deleteBusy ? "Sende Bestätigungsmail…" : "Konto löschen"}
              </IonButton>
              {deleteMsg && (
                <div
                  style={{
                    marginTop: 14,
                    padding: "12px 14px",
                    borderRadius: 12,
                    fontSize: 13.5,
                    lineHeight: 1.45,
                    background: deleteMsg.ok ? "rgba(150, 183, 64, 0.12)" : "rgba(224, 80, 96, 0.10)",
                    color: deleteMsg.ok ? "var(--ion-color-success-shade)" : "var(--ion-color-danger-shade)",
                  }}
                >
                  {deleteMsg.text}
                </div>
              )}
            </div>
          )}

          <IonAlert
            isOpen={deleteAlertOpen}
            onDidDismiss={() => setDeleteAlertOpen(false)}
            header="Konto wirklich löschen?"
            message="Wir senden dir eine Bestätigungsmail. Dein Konto wird erst gelöscht, wenn du den Link darin anklickst."
            buttons={[
              { text: "Abbrechen", role: "cancel" },
              {
                text: "Bestätigungsmail senden",
                role: "destructive",
                handler: () => {
                  handleRequestDeletion();
                },
              },
            ]}
          />
        </IonContent>
      </IonPage>
    );
  }

  // Profil-Anzeige als Hub
  const isVerbundbuero = profile.role === "verbundberatung";
  const isTalent = !isVerbundbuero && profile.type === "talent";
  const headlineName = isVerbundbuero
    ? profile.name
    : isTalent
      ? [profile.anrede, profile.vorname, profile.name].filter(Boolean).join(" ")
      : profile.name;
  const anzeigenLabel = isTalent ? "Meine Talent-Angebote" : "Meine Einsätze";
  const rollenLabel = isVerbundbuero
    ? "Mitarbeiter Verbundberatung"
    : isTalent
      ? "Talent (Azubi)"
      : "Betrieb";

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Konto</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        {/* Profil-Karte */}
        <IonCard>
          <IonCardHeader>
            <IonCardSubtitle>{rollenLabel}</IonCardSubtitle>
            <IonCardTitle>{headlineName || "—"}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>{user.email}</p>
          </IonCardContent>
        </IonCard>

        {/* E-Mail-Verifizierungs-Status. Unbestätigte Nutzer:innen erreichen
            diesen Hub gar nicht (sie sehen vorher die VerifizierungsWand),
            daher hier nur noch die Bestätigt-Anzeige. */}
        <IonChip color="success" style={{ marginBottom: 8 }}>
          <IonIcon icon={checkmarkCircleOutline} />
          <IonLabel>E-Mail bestätigt</IonLabel>
        </IonChip>

        {!isVerbundbuero && isTalent ? (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Ausbildung</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList lines="none">
                <IonItem>
                  <IonLabel>
                    <h3>Gewerk</h3>
                    <p>{profile.gewerk ?? "—"}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h3>Lehrjahr</h3>
                    <p>{profile.lehrjahr ? `${profile.lehrjahr}. Lehrjahr` : "—"}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h3>Ausbildungsbetrieb</h3>
                    <p>{profile.unternehmen ?? "—"}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h3>Handwerkskammer</h3>
                    <p>{profile.handwerkskammer ?? "—"}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h3>Berufsschule</h3>
                    <p>{profile.berufsschule ?? "—"}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h3>Wohnort</h3>
                    <p>{profile.ort ? profile.ort : "—"}</p>
                  </IonLabel>
                </IonItem>
                {profile.faehigkeiten?.length > 0 && (
                  <IonItem>
                    <IonLabel>
                      <h3>Fähigkeiten</h3>
                      <div style={{ marginTop: 6 }}>
                        {profile.faehigkeiten.map((f) => (
                          <IonChip key={f} color="primary">
                            <IonLabel>{f}</IonLabel>
                          </IonChip>
                        ))}
                      </div>
                    </IonLabel>
                  </IonItem>
                )}
              </IonList>
            </IonCardContent>
          </IonCard>
        ) : !isVerbundbuero ? (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Betrieb</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList lines="none">
                <IonItem>
                  <IonLabel>
                    <h3>Adresse</h3>
                    <p style={{ whiteSpace: "pre-line" }}>{profile.adresse ?? "—"}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h3>Gewerke</h3>
                    {(() => {
                      const gs = (profile.gewerk ?? "").split(",").map((s) => s.trim()).filter(Boolean);
                      return gs.length > 0 ? (
                        <div style={{ marginTop: 6 }}>
                          {gs.map((g) => (
                            <IonChip key={g} color="primary">
                              <IonLabel>{g}</IonLabel>
                            </IonChip>
                          ))}
                        </div>
                      ) : <p>—</p>;
                    })()}
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h3>Handwerkskammer</h3>
                    <p>{profile.handwerkskammer ?? "—"}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h3>Ansprechpartner:in</h3>
                    <p>
                      {[profile.anrede, profile.ansprechpartner]
                        .filter(Boolean)
                        .join(" ") || "—"}
                    </p>
                    <p>{profile.ansprechpartner_email ?? ""}</p>
                  </IonLabel>
                </IonItem>
                {profile.spezialisierung?.length > 0 && (
                  <IonItem>
                    <IonLabel>
                      <h3>Spezialisierung</h3>
                      <div style={{ marginTop: 6 }}>
                        {profile.spezialisierung.map((s) => (
                          <IonChip key={s} color="primary">
                            <IonLabel>{s}</IonLabel>
                          </IonChip>
                        ))}
                      </div>
                    </IonLabel>
                  </IonItem>
                )}
              </IonList>
            </IonCardContent>
          </IonCard>
        ) : null}

        {/* Profil-Vollständigkeit */}
        {!isVerbundbuero && <ProfilFortschritt profile={profile} />}

        {/* Profil bearbeiten (nicht für Verbundberatung) */}
        {!isVerbundbuero && (
          <IonButton
            expand="block"
            fill="outline"
            color="secondary"
            onClick={() => setEditing(true)}
            style={{ marginBottom: 8 }}
          >
            <IonIcon slot="start" icon={createOutline} />
            Profil bearbeiten
          </IonButton>
        )}

        {/* Bewerbungsunterlagen (nur für Talents) */}
        {isTalent && <DokumenteUpload mode="manage" />}

        {/* Bewertungen (nicht für Verbundberatung) */}
        {!isVerbundbuero && (
          <BewertungSection userId={user.$id} profileType={profile.type as "talent" | "betrieb"} />
        )}

        {/* Verbundberatung-spezifische Karte: Übersicht aller Bewerbungen */}
        {isVerbundbuero && (
          <IonCard
            button
            routerLink="/verbundberatung-uebersicht"
            color="primary"
            style={{ marginTop: 16, marginBottom: 16 }}
          >
            <IonCardContent
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: 28,
              }}
            >
              <IonIcon
                icon={sendOutline}
                style={{ fontSize: 44, color: "#ffffff" }}
              />
              <div style={{ flex: 1 }}>
                <h2
                  style={{
                    margin: 0,
                    color: "#ffffff",
                    fontSize: 22,
                    fontWeight: 700,
                  }}
                >
                  Aktuelle Bewerbungen
                </h2>
                <p
                  style={{
                    margin: "4px 0 0",
                    color: "rgba(255,255,255,0.88)",
                    fontSize: 14,
                  }}
                >
                  Alle Einsätze und Talent-Angebote mit Bewerbungen
                </p>
              </div>
              <IonIcon
                icon={chevronForward}
                style={{ fontSize: 28, color: "#ffffff" }}
              />
            </IonCardContent>
          </IonCard>
        )}

        {/* Hub-Karten (nicht für Verbundberatung – die haben einen anderen Funktionsumfang) */}
        {!isVerbundbuero && (
        <>
        <IonCard button routerLink="/meine-anzeigen">
          <IonCardContent style={{ display: "flex", alignItems: "center" }}>
            <IonIcon
              icon={briefcaseOutline}
              color="primary"
              style={{ fontSize: 28, marginRight: 16 }}
            />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, color: "var(--ion-color-secondary)" }}>
                {anzeigenLabel}
              </h3>
              <p style={{ margin: 0, color: "var(--ion-color-medium)" }}>
                Eigene Anzeigen ansehen, anlegen, bearbeiten
              </p>
            </div>
            <IonIcon icon={chevronForward} color="medium" />
          </IonCardContent>
        </IonCard>

        <IonCard button routerLink="/meine-bewerbungen">
          <IonCardContent style={{ display: "flex", alignItems: "center" }}>
            <IonIcon
              icon={sendOutline}
              color="primary"
              style={{ fontSize: 28, marginRight: 16 }}
            />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, color: "var(--ion-color-secondary)" }}>
                Meine Bewerbungen
              </h3>
              <p style={{ margin: 0, color: "var(--ion-color-medium)" }}>
                Bewerbungen &amp; Anfragen die ich versendet habe
              </p>
            </div>
            <IonIcon icon={chevronForward} color="medium" />
          </IonCardContent>
        </IonCard>

        <IonCard button routerLink="/eingegangene-anfragen">
          <IonCardContent style={{ display: "flex", alignItems: "center" }}>
            <IonIcon
              icon={mailOutline}
              color="primary"
              style={{ fontSize: 28, marginRight: 16 }}
            />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, color: "var(--ion-color-secondary)" }}>
                Eingegangene Anfragen
              </h3>
              <p style={{ margin: 0, color: "var(--ion-color-medium)" }}>
                Anfragen &amp; Bewerbungen die ich erhalten habe
              </p>
            </div>
            <IonIcon icon={chevronForward} color="medium" />
          </IonCardContent>
        </IonCard>
        </>
        )}

        <IonButton
          expand="block"
          fill="outline"
          color="medium"
          routerLink="/einstellungen"
          style={{ marginBottom: 8, marginTop: 16 }}
        >
          <IonIcon slot="start" icon={settingsOutline} />
          Einstellungen
        </IonButton>
        <IonButton expand="block" color="medium" onClick={handleLogout}>
          Logout
        </IonButton>
        <Footer />
      </IonContent>
    </IonPage>
  );
};

export default Konto;
