import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonIcon,
  IonText,
  IonButton,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import {
  searchOutline,
  personAddOutline,
  briefcaseOutline,
  arrowForwardOutline,
  schoolOutline,
  businessOutline,
  handLeftOutline,
} from "ionicons/icons";
import { useAuth } from "../lib/AuthContext";

const Homepage: React.FC = () => {
  const { user, profile } = useAuth();
  const history = useHistory();

  const istEingeloggt = Boolean(user);
  const istTalent = profile?.type === "talent";
  const istBetrieb = profile?.type === "betrieb";

  // Aktionskarte abhängig vom Login-Status
  let aktionsKarte: { titel: string; text: string; cta: string; ziel: string; icon: string };
  if (!istEingeloggt) {
    aktionsKarte = {
      titel: "Konto anlegen",
      text: "Erstelle in zwei Minuten ein Profil als Talent oder Betrieb und sei sichtbar.",
      cta: "Jetzt registrieren",
      ziel: "/registrieren",
      icon: personAddOutline,
    };
  } else if (istTalent) {
    aktionsKarte = {
      titel: "Eigenes Talent-Angebot",
      text: "Zeig Betrieben, was du kannst, was du lernen willst und wann du verfügbar bist.",
      cta: "Talent-Angebot anlegen",
      ziel: "/meine-lehrstellen",
      icon: briefcaseOutline,
    };
  } else if (istBetrieb) {
    aktionsKarte = {
      titel: "Einsatz ausschreiben",
      text: "Beschreibe einen offenen Einsatz und erreiche passende Talente in deiner Region.",
      cta: "Einsatz anlegen",
      ziel: "/meine-lehrstellen",
      icon: briefcaseOutline,
    };
  } else {
    // Eingeloggt, aber noch kein Profil
    aktionsKarte = {
      titel: "Profil vervollständigen",
      text: "Damit dich andere finden können, ergänze noch wenige Angaben in deinem Profil.",
      cta: "Profil ergänzen",
      ziel: "/konto",
      icon: personAddOutline,
    };
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Win-Win Talentleihe</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {/* HERO */}
        <div
          style={{
            background:
              "linear-gradient(135deg, var(--ion-color-secondary) 0%, var(--ion-color-primary) 100%)",
            color: "#ffffff",
            padding: "32px 20px 40px",
            textAlign: "center",
          }}
        >
          <IonIcon
            icon={handLeftOutline}
            style={{ fontSize: 56, marginBottom: 12 }}
          />
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
            Talente verleihen,
            <br />
            Erfahrung gewinnen.
          </h1>
          <p
            style={{
              margin: "12px auto 0",
              maxWidth: 480,
              opacity: 0.92,
              lineHeight: 1.5,
            }}
          >
            Die Plattform für Handwerks-Azubis und -Betriebe, die voneinander
            lernen wollen — temporär, fair und auf Augenhöhe.
          </p>
        </div>

        {/* HAUPT-CTA */}
        <div className="ion-padding">
          <IonCard
            button
            color="primary"
            onClick={() => history.push("/lehrstellen")}
          >
            <IonCardContent
              style={{ display: "flex", alignItems: "center", color: "#fff" }}
            >
              <IonIcon
                icon={searchOutline}
                style={{ fontSize: 32, marginRight: 16 }}
              />
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                  Talentleihe entdecken
                </h2>
                <p style={{ margin: "4px 0 0", opacity: 0.9 }}>
                  Aktuelle Einsätze und Talent-Angebote durchstöbern
                </p>
              </div>
              <IonIcon icon={arrowForwardOutline} style={{ fontSize: 22 }} />
            </IonCardContent>
          </IonCard>

          <IonCard button onClick={() => history.push(aktionsKarte.ziel)}>
            <IonCardContent
              style={{ display: "flex", alignItems: "center" }}
            >
              <IonIcon
                icon={aktionsKarte.icon}
                color="primary"
                style={{ fontSize: 32, marginRight: 16 }}
              />
              <div style={{ flex: 1 }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--ion-color-secondary)",
                  }}
                >
                  {aktionsKarte.titel}
                </h2>
                <p style={{ margin: "4px 0 0", color: "var(--ion-color-medium)" }}>
                  {aktionsKarte.text}
                </p>
              </div>
              <IonIcon icon={arrowForwardOutline} color="medium" style={{ fontSize: 22 }} />
            </IonCardContent>
          </IonCard>
        </div>

        {/* WIE FUNKTIONIERT'S */}
        <div className="ion-padding" style={{ paddingTop: 8 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--ion-color-secondary)",
              marginBottom: 12,
            }}
          >
            So funktioniert's
          </h2>

          <Schritt
            nummer={1}
            icon={personAddOutline}
            titel="Profil anlegen"
            text="Als Talent oder Betrieb in zwei Minuten registriert. Wir merken uns Gewerk, Handwerkskammer und Region."
          />
          <Schritt
            nummer={2}
            icon={schoolOutline}
            titel="Anzeige veröffentlichen"
            text="Talente posten ihre Verfügbarkeit und Lernziele, Betriebe schreiben Einsätze aus."
          />
          <Schritt
            nummer={3}
            icon={businessOutline}
            titel="Direkt Kontakt"
            text="Über die Detailseite per E-Mail anschreiben — ohne Umwege, ohne Vermittlungsgebühren."
          />
        </div>

        {/* SEKUNDÄRE LINKS */}
        <div className="ion-padding" style={{ paddingTop: 0 }}>
          <IonButton
            expand="block"
            fill="outline"
            color="secondary"
            onClick={() => history.push("/informationen")}
          >
            Mehr Informationen
          </IonButton>
          {!istEingeloggt && (
            <IonButton
              expand="block"
              fill="clear"
              color="medium"
              onClick={() => history.push("/login")}
              style={{ marginTop: 4 }}
            >
              Schon registriert? Hier einloggen
            </IonButton>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

const Schritt: React.FC<{
  nummer: number;
  icon: string;
  titel: string;
  text: string;
}> = ({ nummer, icon, titel, text }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      background: "#fff",
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      gap: 14,
    }}
  >
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "var(--ion-color-tertiary)",
        color: "var(--ion-color-secondary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {nummer}
    </div>
    <div style={{ flex: 1 }}>
      <h3
        style={{
          margin: 0,
          fontSize: 15,
          fontWeight: 700,
          color: "var(--ion-color-secondary)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <IonIcon icon={icon} color="primary" style={{ fontSize: 18 }} />
        {titel}
      </h3>
      <IonText color="medium">
        <p style={{ margin: "4px 0 0", fontSize: 14, lineHeight: 1.4 }}>{text}</p>
      </IonText>
    </div>
  </div>
);

export default Homepage;
