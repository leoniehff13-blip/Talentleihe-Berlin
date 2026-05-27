import { IonContent, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";

const AGB: React.FC = () => {
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

          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "8px" }}>
            Allgemeine Geschäftsbedingungen<br />
            <span style={{ fontSize: "0.6em", fontWeight: 600, color: "#47BCC2" }}>der Plattform Talentleihe Berlin</span>
          </h1>
          <p style={{ color: "#4a6080", fontSize: "0.9rem", marginBottom: "32px" }}>Stand: Mai 2026</p>

          <div style={{
            background: "linear-gradient(135deg, #EAF6F7 0%, #f0f7ff 100%)",
            border: "1.5px solid #47BCC2",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "40px",
            color: "#1E367A",
            fontSize: "0.92rem",
            lineHeight: 1.6,
          }}>
            Diese Plattform ist ein Hochschulprojekt der HSBA Hamburg School of Business Administration und dient der Erprobung digitaler Vermittlung im Rahmen der Verbundausbildung im Berliner und Brandenburger Handwerk.
          </div>

          <Section title="§ 1 Geltungsbereich">
            <Ol>
              <li>Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB") gelten für die Nutzung der Plattform Talentleihe Berlin (nachfolgend „Plattform"), betrieben durch Max Mustermann, Platzhalterverein e.V., Beispielstrasse 1, 54321 Konz (nachfolgend „Betreiber").</li>
              <li>Die Plattform richtet sich ausschließlich an Auszubildende im Handwerk (nachfolgend „Talente") und Handwerksbetriebe (nachfolgend „Betriebe") im Zuständigkeitsbereich der Handwerkskammer Berlin sowie der Handwerkskammer Frankfurt (Oder), Region Ostbrandenburg.</li>
              <li>Mit der Registrierung auf der Plattform erkennen Nutzer diese AGB an. Abweichende Bedingungen der Nutzer gelten nicht.</li>
            </Ol>
          </Section>

          <Section title="§ 2 Leistungsbeschreibung">
            <Ol>
              <li>Die Plattform ermöglicht die digitale Vermittlung im Rahmen der Verbundausbildung: Betriebe können befristete Einsätze ausschreiben, Talente können sich mit einem Profil vorstellen und auf Einsätze bewerben.</li>
              <li>Der Betreiber ist ausschließlich Vermittler. Er wird nicht Vertragspartei der zwischen Betrieben und Talenten geschlossenen Vereinbarungen über Einsätze oder Praktika.</li>
              <li>Die Nutzung der Plattform ist für alle Nutzer kostenlos.</li>
              <li>Ein Anspruch auf Verfügbarkeit oder ununterbrochenen Betrieb der Plattform besteht nicht. Der Betreiber behält sich vor, die Plattform jederzeit zu ändern, einzuschränken oder einzustellen.</li>
            </Ol>
          </Section>

          <Section title="§ 3 Registrierung und Nutzerkonto">
            <Ol>
              <li>Die Nutzung der Plattform setzt eine Registrierung mit einem Nutzerkonto voraus. Natürliche Personen müssen mindestens 16 Jahre alt sein.</li>
              <li>Nutzer sind verpflichtet, bei der Registrierung wahrheitsgemäße und vollständige Angaben zu machen und diese aktuell zu halten.</li>
              <li>Die Nutzung von Pseudonymen ist nicht zulässig. Betriebe müssen unter ihrem tatsächlichen Firmennamen auftreten, Talente unter ihrem Klarnamen.</li>
              <li>Zugangsdaten sind vertraulich zu behandeln. Der Betreiber ist unverzüglich zu informieren, wenn ein unbefugter Zugriff auf das Konto vermutet wird.</li>
              <li>Pro Person oder Betrieb ist nur ein Nutzerkonto zulässig.</li>
              <li>Der Betreiber kann Nutzerkonten ohne Vorankündigung sperren oder löschen, insbesondere bei Verstoß gegen diese AGB.</li>
            </Ol>
          </Section>

          <Section title="§ 4 Pflichten der Nutzer">
            <Ol>
              <li>Nutzer verpflichten sich, die Plattform ausschließlich zu den vorgesehenen Zwecken zu nutzen und geltendes Recht einzuhalten.</li>
              <li>
                Folgende Verhaltensweisen sind untersagt:
                <ul style={{ marginTop: "8px", paddingLeft: "20px", lineHeight: 2 }}>
                  <li>Veröffentlichung falscher, irreführender oder diskriminierender Inhalte</li>
                  <li>Spam oder unerwünschte Kontaktaufnahme</li>
                  <li>Nutzung der Plattform für kommerzielle Zwecke außerhalb der Verbundausbildung</li>
                  <li>Automatisierter Abruf von Daten (Scraping)</li>
                  <li>Jede Form von Belästigung, Bedrohung oder Diskriminierung anderer Nutzer</li>
                </ul>
              </li>
              <li>Nutzer sind selbst verantwortlich für alle Inhalte, die sie auf der Plattform einstellen. Sie stellen den Betreiber von allen Ansprüchen Dritter frei, die aus ihren Inhalten entstehen.</li>
            </Ol>
          </Section>

          <Section title="§ 5 Anzeigen und Vermittlung">
            <Ol>
              <li>Betriebe können Einsätze (befristete Tätigkeiten im Rahmen der Verbundausbildung) ausschreiben. Talente können Talent-Angebote (Profile zur Vorstellung) erstellen.</li>
              <li>Der Betreiber übernimmt keine Garantie für die Richtigkeit, Vollständigkeit oder Aktualität der eingestellten Anzeigen und Profile.</li>
              <li>Kommt es zu einer Vereinbarung zwischen einem Betrieb und einem Talent, sind die Parteien selbst für die rechtliche Ausgestaltung (z. B. Zusatzvereinbarung zum Ausbildungsverhältnis) verantwortlich. Hierfür wird die Einbindung der zuständigen Handwerkskammer empfohlen.</li>
              <li>Der Betreiber kann Anzeigen und Profile ohne Angabe von Gründen entfernen, insbesondere wenn diese gegen diese AGB oder geltendes Recht verstoßen.</li>
              <li>
                Für den Betrieb der Plattform werden folgende Drittanbieter eingesetzt:
                <ul style={{ marginTop: "8px", paddingLeft: "20px", lineHeight: 2 }}>
                  <li><strong>Appwrite</strong> (appwrite.io) – Backend-Dienst für Datenspeicherung und Authentifizierung. Nutzerdaten werden auf Appwrite-Servern verarbeitet.</li>
                  <li><strong>Nominatim / OpenStreetMap</strong> (nominatim.org) – Geocoding-Dienst zur Umwandlung von Adressen in Kartenkoordinaten für die Kartenansicht.</li>
                  <li><strong>CartoDB / CARTO</strong> (carto.com) – Kartenkacheln für die Kartenansicht der Plattform.</li>
                </ul>
                Näheres zur Datenverarbeitung durch diese Dienste ist der Datenschutzerklärung zu entnehmen.
              </li>
            </Ol>
          </Section>

          <Section title="§ 6 Haftung">
            <Ol>
              <li>Der Betreiber haftet nur für Schäden, die auf vorsätzlichem oder grob fahrlässigem Verhalten beruhen. Eine weitergehende Haftung ist, soweit gesetzlich zulässig, ausgeschlossen.</li>
              <li>Der Betreiber haftet nicht für Inhalte Dritter auf der Plattform, für das Zustandekommen oder den Erfolg von Vermittlungen sowie für Schäden, die aus Einsätzen entstehen, die über die Plattform angebahnt wurden.</li>
              <li>Der Betreiber übernimmt keine Verantwortung für externe Websites, auf die von der Plattform verlinkt wird.</li>
            </Ol>
          </Section>

          <Section title="§ 7 Datenschutz">
            <Ol>
              <li>Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer Datenschutzerklärung, die Bestandteil dieser AGB ist.</li>
              <li>Nutzer willigen mit der Registrierung in die Verarbeitung ihrer Daten zum Zweck des Betriebs der Plattform ein.</li>
            </Ol>
          </Section>

          <Section title="§ 8 Änderungen der AGB">
            <Ol>
              <li>Der Betreiber behält sich vor, diese AGB jederzeit zu ändern. Änderungen werden Nutzern per E-Mail oder durch einen Hinweis auf der Plattform mitgeteilt.</li>
              <li>Widerspricht ein Nutzer der Änderung nicht innerhalb von 30 Tagen nach Bekanntgabe, gelten die geänderten AGB als angenommen. Auf dieses Recht wird in der Änderungsmitteilung ausdrücklich hingewiesen.</li>
            </Ol>
          </Section>

          <Section title="§ 9 Kündigung und Löschung">
            <Ol>
              <li>Nutzer können ihr Konto jederzeit ohne Angabe von Gründen löschen, indem sie sich an praxisprojekt5@gmail.com wenden.</li>
              <li>Der Betreiber kann das Vertragsverhältnis jederzeit mit sofortiger Wirkung beenden, insbesondere bei Verstößen gegen diese AGB.</li>
              <li>Nach Löschung des Kontos werden die personenbezogenen Daten des Nutzers gemäß der Datenschutzerklärung gelöscht, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen.</li>
            </Ol>
          </Section>

          <Section title="§ 10 Schlussbestimmungen">
            <Ol>
              <li>Es gilt das Recht der Bundesrepublik Deutschland.</li>
              <li>Ist der Nutzer Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen, ist Gerichtsstand der Sitz des Betreibers.</li>
              <li>Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</li>
            </Ol>
          </Section>

          <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid #e0e4ee", fontSize: "0.78rem", color: "#a0aabb" }}>
            <p>Stand: Mai 2026</p>
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

function Ol({ children }: { children: React.ReactNode }) {
  return (
    <ol style={{ paddingLeft: "20px", margin: 0 }}>
      {children}
    </ol>
  );
}

export default AGB;
