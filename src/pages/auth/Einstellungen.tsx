import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonText,
  IonIcon,
  IonAlert,
  IonListHeader,
  IonToggle,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonSpinner,
  IonNote,
} from "@ionic/react";
import {
  chevronBackOutline,
  lockClosedOutline,
  notificationsOutline,
  trashOutline,
  helpCircleOutline
} from "ionicons/icons";
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { account } from "../../lib/appwrite";
import { translateError } from "../../lib/errors";
import { requestAccountDeletion } from "../../lib/accountDeletion";
import { useAuth } from "../../lib/AuthContext";

interface EmailPrefs {
  email_neue_bewerbung: boolean;
  email_bewerbung_update: boolean;
  email_passender_einsatz: boolean;
  email_newsletter: boolean;
}

const DEFAULT_PREFS: EmailPrefs = {
  email_neue_bewerbung: true,
  email_bewerbung_update: true,
  email_passender_einsatz: true,
  email_newsletter: false,
};

const Einstellungen: React.FC = () => {
  const { profile } = useAuth();
  const history = useHistory();

  // Passwort
  const [altesPasswort, setAltesPasswort] = useState("");
  const [neuesPasswort, setNeuesPasswort] = useState("");
  const [neuesPasswortWdh, setNeuesPasswortWdh] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // E-Mail-Benachrichtigungen
  const [prefs, setPrefs] = useState<EmailPrefs>(DEFAULT_PREFS);
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsMsg, setPrefsMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Konto löschen
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const isTalent = profile?.type === "talent" && profile?.role !== "verbundberatung";

  useEffect(() => {
    account
      .getPrefs<Partial<EmailPrefs>>()
      .then((p) => {
        setPrefs({
          email_neue_bewerbung: p.email_neue_bewerbung ?? DEFAULT_PREFS.email_neue_bewerbung,
          email_bewerbung_update:
            p.email_bewerbung_update ?? DEFAULT_PREFS.email_bewerbung_update,
          email_passender_einsatz:
            p.email_passender_einsatz ?? DEFAULT_PREFS.email_passender_einsatz,
          email_newsletter: p.email_newsletter ?? DEFAULT_PREFS.email_newsletter,
        });
      })
      .catch(() => {})
      .finally(() => setPrefsLoading(false));
  }, []);

  async function handlePwSave() {
    setPwMsg(null);
    if (!altesPasswort || !neuesPasswort) {
      setPwMsg({ ok: false, text: "Bitte alle Felder ausfüllen." });
      return;
    }
    if (neuesPasswort !== neuesPasswortWdh) {
      setPwMsg({ ok: false, text: "Die neuen Passwörter stimmen nicht überein." });
      return;
    }
    if (neuesPasswort.length < 8) {
      setPwMsg({ ok: false, text: "Das neue Passwort muss mindestens 8 Zeichen lang sein." });
      return;
    }
    setPwSaving(true);
    try {
      await account.updatePassword(neuesPasswort, altesPasswort);
      setPwMsg({ ok: true, text: "Passwort erfolgreich geändert." });
      setAltesPasswort("");
      setNeuesPasswort("");
      setNeuesPasswortWdh("");
    } catch (err: unknown) {
      setPwMsg({ ok: false, text: translateError(err) });
    } finally {
      setPwSaving(false);
    }
  }

  async function handlePrefsSave() {
    setPrefsMsg(null);
    setPrefsSaving(true);
    try {
      await account.updatePrefs(prefs);
      setPrefsMsg({ ok: true, text: "Einstellungen gespeichert." });
    } catch (err: unknown) {
      setPrefsMsg({ ok: false, text: translateError(err) });
    } finally {
      setPrefsSaving(false);
    }
  }

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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => history.replace("/konto")}>
              <IonIcon slot="start" icon={chevronBackOutline} />
              Zurück
            </IonButton>
          </IonButtons>
          <IonTitle>Einstellungen</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>

        {/* ── Passwort ändern ── */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={lockClosedOutline} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Passwort ändern
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList lines="full">
              <IonItem>
                <IonLabel position="stacked">Aktuelles Passwort</IonLabel>
                <IonInput
                  type="password"
                  value={altesPasswort}
                  onIonInput={(e) => setAltesPasswort(e.detail.value ?? "")}
                  autocomplete="current-password"
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Neues Passwort</IonLabel>
                <IonInput
                  type="password"
                  value={neuesPasswort}
                  onIonInput={(e) => setNeuesPasswort(e.detail.value ?? "")}
                  autocomplete="new-password"
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Neues Passwort wiederholen</IonLabel>
                <IonInput
                  type="password"
                  value={neuesPasswortWdh}
                  onIonInput={(e) => setNeuesPasswortWdh(e.detail.value ?? "")}
                  autocomplete="new-password"
                />
              </IonItem>
            </IonList>
            {pwMsg && (
              <div
                style={{
                  margin: "12px 0 4px",
                  padding: "10px 12px",
                  borderRadius: 10,
                  fontSize: 13.5,
                  background: pwMsg.ok
                    ? "rgba(150,183,64,0.12)"
                    : "rgba(224,80,96,0.10)",
                  color: pwMsg.ok
                    ? "var(--ion-color-success-shade)"
                    : "var(--ion-color-danger-shade)",
                }}
              >
                {pwMsg.text}
              </div>
            )}
            <IonButton
              expand="block"
              onClick={handlePwSave}
              disabled={pwSaving}
              style={{ marginTop: 14 }}
            >
              {pwSaving ? "Speichern…" : "Passwort speichern"}
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* ── E-Mail-Benachrichtigungen ── */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon
                icon={notificationsOutline}
                style={{ marginRight: 8, verticalAlign: "middle" }}
              />
              Benachrichtigungen
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonNote style={{ display: "block", marginBottom: 12, fontSize: 13 }}>
              Plattformbenachrichtigungen sind immer aktiv. Hier kannst du einstellen,
              welche E-Mails du erhalten möchtest.
            </IonNote>
            {prefsLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 16 }}>
                <IonSpinner name="crescent" />
              </div>
            ) : (
              <IonList lines="full">
                <IonItem>
                  <IonLabel>
                    <h3>Neue Bewerbung / Anfrage</h3>
                    <p>E-Mail wenn jemand auf deine Anzeige antwortet</p>
                  </IonLabel>
                  <IonToggle
                    slot="end"
                    checked={prefs.email_neue_bewerbung}
                    onIonChange={(e) =>
                      setPrefs((p) => ({ ...p, email_neue_bewerbung: e.detail.checked }))
                    }
                  />
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h3>Statusänderung bei Bewerbung</h3>
                    <p>E-Mail wenn sich der Status deiner Bewerbung ändert</p>
                  </IonLabel>
                  <IonToggle
                    slot="end"
                    checked={prefs.email_bewerbung_update}
                    onIonChange={(e) =>
                      setPrefs((p) => ({ ...p, email_bewerbung_update: e.detail.checked }))
                    }
                  />
                </IonItem>
                {isTalent && (
                  <IonItem>
                    <IonLabel>
                      <h3>Passende Einsätze</h3>
                      <p>E-Mail wenn neue Einsätze für dein Gewerk erscheinen</p>
                    </IonLabel>
                    <IonToggle
                      slot="end"
                      checked={prefs.email_passender_einsatz}
                      onIonChange={(e) =>
                        setPrefs((p) => ({ ...p, email_passender_einsatz: e.detail.checked }))
                      }
                    />
                  </IonItem>
                )}
                <IonItem>
                  <IonLabel>
                    <h3>Newsletter &amp; Neuigkeiten</h3>
                    <p>Infos über neue Funktionen und Updates</p>
                  </IonLabel>
                  <IonToggle
                    slot="end"
                    checked={prefs.email_newsletter}
                    onIonChange={(e) =>
                      setPrefs((p) => ({ ...p, email_newsletter: e.detail.checked }))
                    }
                  />
                </IonItem>
              </IonList>
            )}
            {prefsMsg && (
              <div
                style={{
                  margin: "12px 0 4px",
                  padding: "10px 12px",
                  borderRadius: 10,
                  fontSize: 13.5,
                  background: prefsMsg.ok
                    ? "rgba(150,183,64,0.12)"
                    : "rgba(224,80,96,0.10)",
                  color: prefsMsg.ok
                    ? "var(--ion-color-success-shade)"
                    : "var(--ion-color-danger-shade)",
                }}
              >
                {prefsMsg.text}
              </div>
            )}
            <IonButton
              expand="block"
              fill="outline"
              onClick={handlePrefsSave}
              disabled={prefsSaving || prefsLoading}
              style={{ marginTop: 14 }}
            >
              {prefsSaving ? "Speichern…" : "Einstellungen speichern"}
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* ── Konto löschen ── */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle style={{ color: "var(--ion-color-danger)" }}>
              <IonIcon
                icon={trashOutline}
                style={{ marginRight: 8, verticalAlign: "middle" }}
              />
              Konto löschen
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color="medium">
              <p style={{ margin: "0 0 14px", fontSize: 13.5, lineHeight: 1.5 }}>
                Löscht dein Konto und alle zugehörigen Daten (Profil, Anzeigen,
                Bewerbungen, Bewertungen und Dokumente) endgültig. Zur Sicherheit
                schicken wir dir vorher eine Bestätigungsmail.
              </p>
            </IonText>
            <IonButton
              expand="block"
              fill="outline"
              color="danger"
              disabled={deleteBusy || deleteMsg?.ok}
              onClick={() => setDeleteAlertOpen(true)}
            >
              <IonIcon slot="start" icon={trashOutline} />
              {deleteBusy ? "Sende Bestätigungsmail…" : deleteMsg?.ok ? "Bestätigungsmail wurde gesendet ✓" : "Konto löschen"}
            </IonButton>
            {deleteMsg && (
              <div
                style={{
                  marginTop: 14,
                  padding: "12px 14px",
                  borderRadius: 12,
                  fontSize: 13.5,
                  lineHeight: 1.45,
                  background: deleteMsg.ok
                    ? "rgba(150,183,64,0.12)"
                    : "rgba(224,80,96,0.10)",
                  color: deleteMsg.ok
                    ? "var(--ion-color-success-shade)"
                    : "var(--ion-color-danger-shade)",
                }}
              >
                {deleteMsg.text}
              </div>
            )}
          </IonCardContent>
        </IonCard>

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

        <div style={{ height: 32 }} />

        {/* ── Hilfe ── */}
        <IonList inset style={{ marginTop: 24 }}>
          <IonListHeader>
            <IonLabel style={{ fontWeight: 700, fontSize: 15 }}>Hilfe</IonLabel>
          </IonListHeader>
          <IonItem
            button
            detail
            onClick={() => window.open("/handbuch.html", "_blank")}
          >
            <IonIcon slot="start" icon={helpCircleOutline} color="primary" />
            <IonLabel>
              <h3>Handbuch öffnen</h3>
              <p>Dokumentation zur VerbundPraxis-Plattform</p>
            </IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Einstellungen;
