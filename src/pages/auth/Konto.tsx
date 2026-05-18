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
} from "@ionic/react";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  briefcaseOutline,
  documentTextOutline,
  chevronForward,
} from "ionicons/icons";
import { useAuth } from "../../lib/AuthContext";
import Login from "./Login";
import {
  ProfilFormFields,
  EMPTY_PROFIL,
  validateProfil,
  profilStateToInput,
  adresseAufteilen,
  ortAufteilen,
  type ProfilFormState,
} from "../../components/ProfilFormFields";

const Konto: React.FC = () => {
  const { user, profile, loading, logout, saveProfile } = useAuth();
  const history = useHistory();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProfilFormState>(EMPTY_PROFIL);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
    await logout();
    history.replace("/lehrstellen");
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
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
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

  if (!user) {
    return <Login />;
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
          <IonButtons slot="end">
            <IonButton onClick={() => setEditing(true)}>Profil bearbeiten</IonButton>
          </IonButtons>
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
                    <h3>Gewerk</h3>
                    <p>{profile.gewerk ?? "—"}</p>
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
                Meine Bewerbungen
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
      </IonContent>
    </IonPage>
  );
};

export default Konto;
