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
  IonNote,
  IonChip,
  IonLabel,
  IonSpinner,
  IonText,
  IonList,
  IonItem,
  IonIcon,
} from "@ionic/react";
import Footer from "../../components/Footer";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Query } from "appwrite";
import {
  briefcaseOutline,
  documentTextOutline,
  chevronForward,
  createOutline,
  mailUnreadOutline,
  checkmarkCircleOutline,
} from "ionicons/icons";
import { useAuth } from "../../lib/AuthContext";
import { translateError } from "../../lib/errors";
import {
  databases,
  DB_LEHRSTELLEN,
  COL_BEWERTUNGEN,
  BEWERTUNG_KATEGORIEN,
  type Bewertung,
} from "../../lib/appwrite";
import Login from "./Login";
import DokumenteUpload from "../../components/DokumenteUpload";
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

const Konto: React.FC = () => {
  const { user, profile, loading, profileLoading, logout, saveProfile, sendVerification } = useAuth();

  const history = useHistory();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProfilFormState>(EMPTY_PROFIL);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);
  const [verifyBusy, setVerifyBusy] = useState(false);

  async function handleResendVerification() {
    setVerifyMsg(null);
    setVerifyBusy(true);
    try {
      await sendVerification();
      setVerifyMsg("Bestätigungsmail wurde gesendet. Bitte prüfe dein Postfach (auch den Spam-Ordner).");
    } catch (err: unknown) {
      setVerifyMsg(translateError(err));
    } finally {
      setVerifyBusy(false);
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
        </IonContent>
      </IonPage>
    );
  }

  // Profil-Anzeige als Hub
  const isTalent = profile.type === "talent";
  const headlineName = isTalent
    ? [profile.anrede, profile.vorname, profile.name].filter(Boolean).join(" ")
    : profile.name;
  const anzeigenLabel = isTalent ? "Meine Talent-Angebote" : "Meine Einsätze";

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
            <IonCardSubtitle>
              {isTalent ? "Talent (Azubi)" : "Betrieb"}
            </IonCardSubtitle>
            <IonCardTitle>{headlineName || "—"}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>{user.email}</p>
          </IonCardContent>
        </IonCard>

        {/* E-Mail-Verifizierungs-Status */}
        {user.emailVerification ? (
          <IonChip color="success" style={{ marginBottom: 8 }}>
            <IonIcon icon={checkmarkCircleOutline} />
            <IonLabel>E-Mail bestätigt</IonLabel>
          </IonChip>
        ) : (
          <IonCard color="warning">
            <IonCardContent>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                <IonIcon icon={mailUnreadOutline} style={{ fontSize: 22, marginRight: 10 }} />
                <strong>E-Mail noch nicht bestätigt</strong>
              </div>
              <p style={{ margin: "0 0 12px", fontSize: "0.9rem" }}>
                Bitte bestätige deine E-Mail-Adresse über den Link, den wir dir
                geschickt haben.
              </p>
              <IonButton
                size="small"
                fill="solid"
                color="light"
                disabled={verifyBusy}
                onClick={handleResendVerification}
              >
                {verifyBusy ? "Senden…" : "Bestätigungsmail erneut senden"}
              </IonButton>
              {verifyMsg && (
                <p style={{ margin: "10px 0 0", fontSize: "0.85rem" }}>{verifyMsg}</p>
              )}
            </IonCardContent>
          </IonCard>
        )}

        {isTalent ? (
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
        ) : (
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
        )}

        {/* Profil bearbeiten */}
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

        {/* Bewerbungsunterlagen (nur für Talents) */}
        {isTalent && <DokumenteUpload mode="manage" />}

        {/* Bewertungen */}
        <BewertungSection userId={user.$id} profileType={profile.type} />

        {/* Hub-Karten */}
        <IonCard button onClick={() => history.push("/meine-lehrstellen")}>
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

        <IonCard button onClick={() => history.push("/meine-bewerbungen")}>
          <IonCardContent style={{ display: "flex", alignItems: "center" }}>
            <IonIcon
              icon={documentTextOutline}
              color="primary"
              style={{ fontSize: 28, marginRight: 16 }}
            />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, color: "var(--ion-color-secondary)" }}>
                Eingegangene Bewerbungen
              </h3>
              <p style={{ margin: 0, color: "var(--ion-color-medium)" }}>
                Anfragen und Bewerbungen verfolgen
              </p>
            </div>
            <IonIcon icon={chevronForward} color="medium" />
          </IonCardContent>
        </IonCard>

        <IonButton expand="block" color="medium" onClick={handleLogout} style={{ marginTop: 16 }}>
          Logout
        </IonButton>
        <Footer />
      </IonContent>
    </IonPage>
  );
};

export default Konto;
