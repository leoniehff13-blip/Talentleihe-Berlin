import { IonContent, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";
import Footer from "../components/Footer";

const tocItems = [
  { label: "Präambel", anchor: "praambel" },
  { label: "Verantwortlicher", anchor: "verantwortlicher" },
  { label: "Kontakt Datenschutzbeauftragter", anchor: "dsb" },
  { label: "Übersicht der Verarbeitungen", anchor: "uebersicht" },
  { label: "Maßgebliche Rechtsgrundlagen", anchor: "rechtsgrundlagen" },
  { label: "Sicherheitsmaßnahmen", anchor: "sicherheit" },
  { label: "Übermittlung von personenbezogenen Daten", anchor: "uebermittlung" },
  { label: "Allgemeine Informationen zur Datenspeicherung und Löschung", anchor: "loeschung" },
  { label: "Rechte der betroffenen Personen", anchor: "rechte" },
  { label: "Geschäftliche Leistungen", anchor: "leistungen" },
  { label: "Bereitstellung des Onlineangebots und Webhosting", anchor: "webhosting" },
  { label: "Registrierung, Anmeldung und Nutzerkonto", anchor: "registrierung" },
  { label: "Kontakt- und Anfrageverwaltung", anchor: "kontakt" },
  { label: "Plug-ins und eingebettete Funktionen sowie Inhalte", anchor: "plugins" },
  { label: "Änderung und Aktualisierung", anchor: "aenderung" },
];

const Datenschutz: React.FC = () => {
  const history = useHistory();

  function scrollTo(anchor: string) {
    document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
  }

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

          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "8px" }}>Datenschutzerklärung</h1>
          <p style={{ color: "#4a6080", fontSize: "0.9rem", marginBottom: "40px" }}>Stand: 26. Mai 2026</p>

          {/* Inhaltsübersicht */}
          <div style={{ background: "#f5f7fb", borderRadius: "12px", padding: "20px 24px", marginBottom: "40px", border: "1px solid #e0e4ee" }}>
            <p style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "12px", color: "#1E367A" }}>Inhaltsübersicht</p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {tocItems.map((item) => (
                <li key={item.anchor} style={{ marginBottom: "6px" }}>
                  <button
                    onClick={() => scrollTo(item.anchor)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#47BCC2", fontWeight: 600, fontSize: "0.88rem", padding: 0, textAlign: "left", textDecoration: "underline" }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <Section id="praambel" title="Präambel">
            <p>Mit der folgenden Datenschutzerklärung möchten wir Sie darüber aufklären, welche Arten Ihrer personenbezogenen Daten (nachfolgend auch kurz als „Daten" bezeichnet) wir zu welchen Zwecken und in welchem Umfang im Rahmen der Bereitstellung unserer Applikation verarbeiten.</p>
            <p style={{ marginTop: 8 }}>Die verwendeten Begriffe sind nicht geschlechtsspezifisch.</p>
          </Section>

          <Section id="verantwortlicher" title="Verantwortlicher">
            <p>
              Max Mustermann<br />
              Platzhalterverein e.V.<br />
              Beispielstrasse 1<br />
              54321 Konz<br /><br />
              E-Mail-Adresse: <a href="mailto:vorname.name@beispielsdomain.eu" style={{ color: "#47BCC2" }}>vorname.name@beispielsdomain.eu</a>
            </p>
          </Section>

          <Section id="dsb" title="Kontakt Datenschutzbeauftragter">
            <p><a href="mailto:praxisprojekt5@gmail.com" style={{ color: "#47BCC2" }}>praxisprojekt5@gmail.com</a></p>
          </Section>

          <Section id="uebersicht" title="Übersicht der Verarbeitungen">
            <p>Die nachfolgende Übersicht fasst die Arten der verarbeiteten Daten und die Zwecke ihrer Verarbeitung zusammen und verweist auf die betroffenen Personen.</p>
            <SubSection title="Arten der verarbeiteten Daten">
              <ul style={{ paddingLeft: "20px", lineHeight: 1.9 }}>
                {["Bestandsdaten.", "Beschäftigtendaten.", "Zahlungsdaten.", "Kontaktdaten.", "Inhaltsdaten.", "Vertragsdaten.", "Nutzungsdaten.", "Meta-, Kommunikations- und Verfahrensdaten.", "Protokolldaten."].map((d) => <li key={d}>{d}</li>)}
              </ul>
            </SubSection>
            <SubSection title="Kategorien betroffener Personen">
              <ul style={{ paddingLeft: "20px", lineHeight: 1.9 }}>
                {["Leistungsempfänger und Auftraggeber.", "Beschäftigte.", "Interessenten.", "Kommunikationspartner.", "Nutzer.", "Geschäfts- und Vertragspartner.", "Bildungs- und Kursteilnehmer.", "Dritte Personen.", "Hinweisgeber."].map((d) => <li key={d}>{d}</li>)}
              </ul>
            </SubSection>
            <SubSection title="Zwecke der Verarbeitung">
              <ul style={{ paddingLeft: "20px", lineHeight: 1.9 }}>
                {["Erbringung vertraglicher Leistungen und Erfüllung vertraglicher Pflichten.", "Kommunikation.", "Sicherheitsmaßnahmen.", "Büro- und Organisationsverfahren.", "Organisations- und Verwaltungsverfahren.", "Feedback.", "Bereitstellung unseres Onlineangebotes und Nutzerfreundlichkeit.", "Informationstechnische Infrastruktur.", "Hinweisgeberschutz.", "Geschäftsprozesse und betriebswirtschaftliche Verfahren."].map((d) => <li key={d}>{d}</li>)}
              </ul>
            </SubSection>
          </Section>

          <Section id="rechtsgrundlagen" title="Maßgebliche Rechtsgrundlagen">
            <p><strong>Maßgebliche Rechtsgrundlagen nach der DSGVO:</strong> Im Folgenden erhalten Sie eine Übersicht der Rechtsgrundlagen der DSGVO, auf deren Basis wir personenbezogene Daten verarbeiten.</p>
            <ul style={{ paddingLeft: "20px", lineHeight: 1.9, marginTop: 10 }}>
              <li><strong>Einwilligung (Art. 6 Abs. 1 S. 1 lit. a) DSGVO)</strong> – Die betroffene Person hat ihre Einwilligung in die Verarbeitung der sie betreffenden personenbezogenen Daten für einen spezifischen Zweck oder mehrere bestimmte Zwecke gegeben.</li>
              <li><strong>Vertragserfüllung und vorvertragliche Anfragen (Art. 6 Abs. 1 S. 1 lit. b) DSGVO)</strong> – Die Verarbeitung ist für die Erfüllung eines Vertrags, dessen Vertragspartei die betroffene Person ist, oder zur Durchführung vorvertraglicher Maßnahmen erforderlich.</li>
              <li><strong>Rechtliche Verpflichtung (Art. 6 Abs. 1 S. 1 lit. c) DSGVO)</strong> – Die Verarbeitung ist zur Erfüllung einer rechtlichen Verpflichtung erforderlich, der der Verantwortliche unterliegt.</li>
              <li><strong>Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f) DSGVO)</strong> – Die Verarbeitung ist zur Wahrung der berechtigten Interessen des Verantwortlichen oder eines Dritten notwendig, vorausgesetzt, dass die Interessen, Grundrechte und Grundfreiheiten der betroffenen Person nicht überwiegen.</li>
            </ul>
            <p style={{ marginTop: 12 }}><strong>Nationale Datenschutzregelungen in Deutschland:</strong> Zusätzlich zu den Datenschutzregelungen der DSGVO gelten nationale Regelungen zum Datenschutz in Deutschland. Hierzu gehört insbesondere das Bundesdatenschutzgesetz (BDSG).</p>
          </Section>

          <Section id="sicherheit" title="Sicherheitsmaßnahmen">
            <p>Wir treffen nach Maßgabe der gesetzlichen Vorgaben unter Berücksichtigung des Stands der Technik geeignete technische und organisatorische Maßnahmen, um ein dem Risiko angemessenes Schutzniveau zu gewährleisten.</p>
            <p style={{ marginTop: 8 }}>Zu den Maßnahmen gehören insbesondere die Sicherung der Vertraulichkeit, Integrität und Verfügbarkeit von Daten durch Kontrolle des physischen und elektronischen Zugangs zu den Daten.</p>
            <p style={{ marginTop: 8 }}><strong>Kürzung der IP-Adresse:</strong> Sofern IP-Adressen verarbeitet werden und die Verarbeitung einer vollständigen IP-Adresse nicht erforderlich ist, wird die IP-Adresse gekürzt (auch als „IP-Masking" bezeichnet).</p>
            <p style={{ marginTop: 8 }}><strong>Sicherung von Online-Verbindungen durch TLS-/SSL-Verschlüsselungstechnologie (HTTPS):</strong> Um die Daten der Nutzer vor unerlaubten Zugriffen zu schützen, setzen wir auf TLS-/SSL-Verschlüsselung.</p>
          </Section>

          <Section id="uebermittlung" title="Übermittlung von personenbezogenen Daten">
            <p>Im Rahmen unserer Verarbeitung von personenbezogenen Daten kommt es vor, dass diese an andere Stellen, Unternehmen oder Dienstleister übermittelt werden (z. B. IT-Dienstleister oder Anbieter von eingebundenen Inhalten). In solchen Fällen beachten wir die gesetzlichen Vorgaben und schließen entsprechende Verträge zum Schutz Ihrer Daten ab.</p>
            <p style={{ marginTop: 8 }}><strong>Datenübermittlung innerhalb der Organisation:</strong> Wir können personenbezogene Daten an andere Abteilungen oder Einheiten innerhalb unserer Organisation übermitteln, sofern dies zu administrativen Zwecken oder zur Erfüllung vertragsbezogener Verpflichtungen erforderlich ist.</p>
          </Section>

          <Section id="loeschung" title="Allgemeine Informationen zur Datenspeicherung und Löschung">
            <p>Wir löschen personenbezogene Daten gemäß den gesetzlichen Bestimmungen, sobald die zugrundeliegenden Einwilligungen widerrufen werden oder keine weiteren rechtlichen Grundlagen für die Verarbeitung bestehen.</p>
            <p style={{ marginTop: 8 }}>Aufbewahrung und Löschung von Daten – die folgenden allgemeinen Fristen gelten nach deutschem Recht:</p>
            <ul style={{ paddingLeft: "20px", lineHeight: 1.9, marginTop: 8 }}>
              <li><strong>10 Jahre</strong> – Bücher, Aufzeichnungen, Jahresabschlüsse, Inventare, Lageberichte (§ 147 AO, § 14b UStG, § 257 HGB).</li>
              <li><strong>8 Jahre</strong> – Buchungsbelege, z. B. Rechnungen und Kostenbelege (§ 147 AO, § 257 HGB).</li>
              <li><strong>6 Jahre</strong> – Übrige Geschäftsunterlagen, Handelsbriefe, steuerlich bedeutsame Unterlagen (§ 147 AO, § 257 HGB).</li>
              <li><strong>3 Jahre</strong> – Daten zur Bearbeitung von Gewährleistungs- und Schadensersatzansprüchen, reguläre gesetzliche Verjährungsfrist (§§ 195, 199 BGB).</li>
            </ul>
          </Section>

          <Section id="rechte" title="Rechte der betroffenen Personen">
            <p><strong>Rechte der betroffenen Personen aus der DSGVO:</strong> Ihnen stehen als Betroffene nach der DSGVO verschiedene Rechte zu (Art. 15–21 DSGVO):</p>
            <ul style={{ paddingLeft: "20px", lineHeight: 1.9, marginTop: 10 }}>
              <li><strong>Widerspruchsrecht:</strong> Sie haben das Recht, aus Gründen Ihrer besonderen Situation jederzeit gegen die Verarbeitung Ihrer personenbezogenen Daten Widerspruch einzulegen.</li>
              <li><strong>Widerrufsrecht bei Einwilligungen:</strong> Sie haben das Recht, erteilte Einwilligungen jederzeit zu widerrufen.</li>
              <li><strong>Auskunftsrecht:</strong> Sie haben das Recht, eine Bestätigung darüber zu verlangen, ob betreffende Daten verarbeitet werden, sowie Auskunft und Kopie der Daten zu erhalten.</li>
              <li><strong>Recht auf Berichtigung:</strong> Sie haben das Recht, die Vervollständigung oder Berichtigung Sie betreffender unrichtiger Daten zu verlangen.</li>
              <li><strong>Recht auf Löschung und Einschränkung der Verarbeitung:</strong> Sie haben das Recht, die unverzügliche Löschung Ihrer Daten oder alternativ eine Einschränkung der Verarbeitung zu verlangen.</li>
              <li><strong>Recht auf Datenübertragbarkeit:</strong> Sie haben das Recht, Ihre Daten in einem strukturierten, gängigen und maschinenlesbaren Format zu erhalten.</li>
              <li><strong>Beschwerde bei Aufsichtsbehörde:</strong> Sie haben das Recht auf Beschwerde bei einer Aufsichtsbehörde, insbesondere in dem Mitgliedstaat Ihres gewöhnlichen Aufenthaltsorts.</li>
            </ul>
          </Section>

          <Section id="leistungen" title="Geschäftliche Leistungen">
            <p>Wir verarbeiten personenbezogene Daten unserer Vertrags- und Geschäftspartner zur Anbahnung, Durchführung und Abwicklung von Vertragsverhältnissen.</p>
            <DataTable rows={[
              ["Verarbeitete Datenarten", "Bestandsdaten; Zahlungsdaten; Kontaktdaten; Vertragsdaten."],
              ["Betroffene Personen", "Leistungsempfänger und Auftraggeber; Interessenten; Geschäfts- und Vertragspartner; Bildungs- und Kursteilnehmer."],
              ["Zwecke der Verarbeitung", "Erbringung vertraglicher Leistungen; Kommunikation; Büro- und Organisationsverfahren; Geschäftsprozesse."],
              ["Rechtsgrundlagen", "Vertragserfüllung (Art. 6 Abs. 1 S. 1 lit. b) DSGVO); Rechtliche Verpflichtung (lit. c); Berechtigte Interessen (lit. f)."],
            ]} />
          </Section>

          <Section id="webhosting" title="Bereitstellung des Onlineangebots und Webhosting">
            <p>Wir verarbeiten die Daten der Nutzer, um ihnen unsere Online-Dienste zur Verfügung zu stellen. Zu diesem Zweck verarbeiten wir die IP-Adresse des Nutzers.</p>
            <DataTable rows={[
              ["Verarbeitete Datenarten", "Nutzungsdaten; Meta-, Kommunikations- und Verfahrensdaten; Protokolldaten; Inhaltsdaten."],
              ["Betroffene Personen", "Nutzer (z. B. Webseitenbesucher, Nutzer von Onlinediensten)."],
              ["Zwecke der Verarbeitung", "Bereitstellung unseres Onlineangebotes; Informationstechnische Infrastruktur; Sicherheitsmaßnahmen."],
              ["Rechtsgrundlagen", "Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f) DSGVO)."],
            ]} />
            <p style={{ marginTop: 12 }}>Weitere Hinweise:</p>
            <ul style={{ paddingLeft: "20px", lineHeight: 1.9, marginTop: 6 }}>
              <li><strong>Bereitstellung auf gemietetem Speicherplatz.</strong> Rechtsgrundlagen: Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f) DSGVO).</li>
              <li><strong>Erhebung von Zugriffsdaten und Logfiles:</strong> Logfile-Informationen werden für die Dauer von maximal 30 Tagen gespeichert und danach gelöscht oder anonymisiert. Rechtsgrundlagen: Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f) DSGVO).</li>
              <li><strong>E-Mail-Versand und -Hosting.</strong> Rechtsgrundlagen: Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f) DSGVO).</li>
            </ul>
          </Section>

          <Section id="registrierung" title="Registrierung, Anmeldung und Nutzerkonto">
            <p>Nutzer können ein Nutzerkonto anlegen. Im Rahmen der Registrierung werden die erforderlichen Pflichtangaben verarbeitet. Zu den verarbeiteten Daten gehören insbesondere Login-Informationen (Nutzername, Passwort sowie E-Mail-Adresse).</p>
            <DataTable rows={[
              ["Verarbeitete Datenarten", "Bestandsdaten; Kontaktdaten; Inhaltsdaten; Nutzungsdaten; Protokolldaten."],
              ["Betroffene Personen", "Nutzer."],
              ["Zwecke der Verarbeitung", "Erbringung vertraglicher Leistungen; Sicherheitsmaßnahmen; Organisations- und Verwaltungsverfahren; Bereitstellung unseres Onlineangebotes."],
              ["Aufbewahrung und Löschung", "Löschung nach Kündigung des Nutzerkontos."],
              ["Rechtsgrundlagen", "Vertragserfüllung (Art. 6 Abs. 1 S. 1 lit. b) DSGVO); Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f) DSGVO)."],
            ]} />
            <p style={{ marginTop: 12 }}>Weitere Hinweise:</p>
            <ul style={{ paddingLeft: "20px", lineHeight: 1.9, marginTop: 6 }}>
              <li><strong>Registrierung mit Klarnamen:</strong> Die Nutzung von Pseudonymen ist nicht zulässig.</li>
              <li><strong>Profile der Nutzer sind nicht öffentlich.</strong></li>
              <li><strong>Löschung von Daten nach Kündigung:</strong> Wenn Nutzer ihr Nutzerkonto gekündigt haben, werden deren Daten gelöscht, vorbehaltlich gesetzlicher Aufbewahrungspflichten.</li>
              <li><strong>Keine Aufbewahrungspflicht für Daten:</strong> Es obliegt den Nutzern, ihre Daten bei erfolgter Kündigung vor dem Vertragsende zu sichern.</li>
            </ul>
          </Section>

          <Section id="kontakt" title="Kontakt- und Anfrageverwaltung">
            <p>Bei der Kontaktaufnahme mit uns sowie im Rahmen bestehender Nutzer- und Geschäftsbeziehungen werden die Angaben der anfragenden Personen verarbeitet, soweit dies zur Beantwortung der Kontaktanfragen erforderlich ist.</p>
            <DataTable rows={[
              ["Verarbeitete Datenarten", "Kontaktdaten; Inhaltsdaten; Meta-, Kommunikations- und Verfahrensdaten."],
              ["Betroffene Personen", "Kommunikationspartner."],
              ["Zwecke der Verarbeitung", "Kommunikation; Organisations- und Verwaltungsverfahren; Feedback; Bereitstellung unseres Onlineangebotes."],
              ["Rechtsgrundlagen", "Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f) DSGVO); Vertragserfüllung (Art. 6 Abs. 1 S. 1 lit. b) DSGVO)."],
            ]} />
          </Section>

          <Section id="plugins" title="Plug-ins und eingebettete Funktionen sowie Inhalte">
            <p>Wir binden Funktions- und Inhaltselemente in unser Onlineangebot ein, die von den Servern ihrer jeweiligen Anbieter bezogen werden. Die Einbindung setzt immer voraus, dass die Drittanbieter die IP-Adresse der Nutzer verarbeiten.</p>
            <DataTable rows={[
              ["Verarbeitete Datenarten", "Nutzungsdaten; Meta-, Kommunikations- und Verfahrensdaten."],
              ["Betroffene Personen", "Nutzer."],
              ["Rechtsgrundlagen", "Einwilligung (Art. 6 Abs. 1 S. 1 lit. a) DSGVO); Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f) DSGVO)."],
            ]} />
            <p style={{ marginTop: 12 }}>Weitere Hinweise:</p>
            <ul style={{ paddingLeft: "20px", lineHeight: 1.9, marginTop: 6 }}>
              <li>
                <strong>Google Fonts (Bezug vom Google Server):</strong> Bezug von Schriften zum Zwecke einer technisch sicheren und effizienten Nutzung. Dienstanbieter: Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland.{" "}
                Rechtsgrundlagen: Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f) DSGVO).
              </li>
              <li>
                <strong>OpenStreetMap:</strong> Einbindung der Landkarten des Dienstes „OpenStreetMap" auf Grundlage der Open Data Commons Open Database Lizenz (ODbL). Dienstanbieter: OpenStreetMap Foundation (OSMF).{" "}
                Rechtsgrundlagen: Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f) DSGVO).
              </li>
              <li>
                <strong>Nominatim (Geocoding):</strong> Zur Umwandlung von Adressen in geografische Koordinaten nutzen wir den Dienst Nominatim der OpenStreetMap Foundation. Ergebnisse werden im Sitzungsspeicher (sessionStorage) des Browsers zwischengespeichert. Dienstanbieter: OpenStreetMap Foundation (OSMF).{" "}
                Rechtsgrundlagen: Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f) DSGVO).
              </li>
            </ul>

            <div style={{ marginTop: 20, padding: "16px 20px", background: "#f5f7fb", borderRadius: "10px", border: "1px solid #e0e4ee" }}>
              <p style={{ fontWeight: 700, marginBottom: 8, color: "#1E367A" }}>Backend und Datenspeicherung (Appwrite)</p>
              <p>Für den Betrieb der Plattform setzen wir den Dienst Appwrite ein. Im Rahmen der Nutzung werden personenbezogene Daten wie E-Mail-Adresse, Passwort (verschlüsselt), Profilinformationen und Nutzungsmetadaten auf Appwrite-Servern gespeichert und verarbeitet.</p>
              <DataTable rows={[
                ["Verarbeitete Datenarten", "Bestandsdaten (Name, E-Mail); Inhaltsdaten (Profile, Anzeigen); Nutzungsdaten; Protokolldaten."],
                ["Betroffene Personen", "Registrierte Nutzer (Azubis und Betriebe)."],
                ["Zwecke der Verarbeitung", "Bereitstellung der Plattformfunktionen; Authentifizierung; Datenspeicherung."],
                ["Aufbewahrung und Löschung", "Daten werden bei Kontolöschung entfernt, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen."],
                ["Rechtsgrundlagen", "Vertragserfüllung (Art. 6 Abs. 1 S. 1 lit. b) DSGVO); Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f) DSGVO)."],
                ["Dienstanbieter", "Appwrite Inc.; appwrite.io; Datenschutzerklärung: appwrite.io/privacy"],
              ]} />
            </div>
          </Section>

          <Section id="aenderung" title="Änderung und Aktualisierung">
            <p>Wir bitten Sie, sich regelmäßig über den Inhalt unserer Datenschutzerklärung zu informieren. Wir passen die Datenschutzerklärung an, sobald die Änderungen der von uns durchgeführten Datenverarbeitungen dies erforderlich machen.</p>
            <p style={{ marginTop: 8 }}>Sofern wir in dieser Datenschutzerklärung Adressen und Kontaktinformationen angeben, bitten wir zu beachten, dass die Adressen sich über die Zeit ändern können.</p>
          </Section>

          <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid #e0e4ee", fontSize: "0.78rem", color: "#a0aabb" }}>
            <p>Erstellt mit kostenlosem Datenschutz-Generator.de von Dr. Thomas Schwenke · Stand: 26. Mai 2026</p>
          </div>
        </div>
        <Footer />
      </IonContent>
    </IonPage>
  );
};

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{ marginBottom: "32px", scrollMarginTop: "80px" }}>
      <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1E367A", marginBottom: "10px", paddingBottom: "8px", borderBottom: "2px solid #47BCC2" }}>
        {title}
      </h2>
      <div style={{ color: "#4a6080", fontSize: "0.93rem", lineHeight: 1.7 }}>
        {children}
      </div>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 14 }}>
      <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1E367A", marginBottom: 4 }}>{title}</p>
      {children}
    </div>
  );
}

function DataTable({ rows }: { rows: [string, string][] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12, fontSize: "0.88rem" }}>
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label} style={{ borderBottom: "1px solid #e8ecf4" }}>
            <td style={{ padding: "8px 12px 8px 0", fontWeight: 700, color: "#1E367A", whiteSpace: "nowrap", verticalAlign: "top", width: "38%" }}>{label}</td>
            <td style={{ padding: "8px 0", color: "#4a6080", verticalAlign: "top" }}>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Datenschutz;
