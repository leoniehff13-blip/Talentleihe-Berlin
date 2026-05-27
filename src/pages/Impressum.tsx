import { IonContent, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";

const Impressum: React.FC = () => {
  const history = useHistory();
  return (
    <IonPage>
      <IonContent fullscreen>
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "clamp(80px, 12vw, 120px) clamp(20px, 5vw, 48px) 60px", fontFamily: '"Nunito", sans-serif', color: "#1E367A" }}>
          <button
            onClick={() => history.goBack()}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#47BCC2", fontWeight: 700, fontSize: "0.9rem", marginBottom: "32px", padding: 0, display: "flex", alignItems: "center", gap: "6px" }}
          >
            ← Zurück
          </button>

          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "8px" }}>Impressum</h1>
          <p style={{ color: "#4a6080", fontSize: "0.9rem", marginBottom: "40px" }}>Angaben gemäß § 5 TMG</p>

          <Section title="Anbieter">
            <p>Handwerkskammer Berlin<br />
            Blücherstraße 68<br />
            10961 Berlin</p>
          </Section>

          <Section title="Kontakt">
            <p>Telefon: <a href="tel:+493059000" style={{ color: "#47BCC2" }}>030 59000-0</a><br />
            E-Mail: <a href="mailto:info@hwk-berlin.de" style={{ color: "#47BCC2" }}>info@hwk-berlin.de</a><br />
            Web: <a href="https://www.hwk-berlin.de" target="_blank" rel="noopener noreferrer" style={{ color: "#47BCC2" }}>www.hwk-berlin.de</a></p>
          </Section>

          <Section title="Verantwortlich für den Inhalt">
            <p>Handwerkskammer Berlin<br />
            Blücherstraße 68, 10961 Berlin</p>
          </Section>

          <Section title="Haftungsausschluss">
            <p style={{ lineHeight: 1.7, color: "#4a6080", fontSize: "0.9rem" }}>
              Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte übernehmen wir jedoch keine Gewähr. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
            </p>
          </Section>

          <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid #e0e4ee", fontSize: "0.78rem", color: "#a0aabb" }}>
            <p>Dieser Bereich wird noch befüllt.</p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1E367A", marginBottom: "10px", paddingBottom: "8px", borderBottom: "2px solid #47BCC2" }}>
        {title}
      </h2>
      <div style={{ color: "#4a6080", fontSize: "0.93rem", lineHeight: 1.7 }}>
        {children}
      </div>
    </div>
  );
}

export default Impressum;
