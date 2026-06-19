import { useState } from "react";
import {
  IonContent,
  IonPage,
} from "@ionic/react";
import Footer from "../components/Footer";
import TopNav from "../components/TopNav";

/* ─── Farbpalette ─────────────────────────────────────────── */
const C = {
  blue:      "#1E367A",
  blueMid:   "#2a4a9a",
  teal:      "#47BCC2",
  tealLight: "#e8f7f8",
  green:     "#96B740",
  greenLight:"#f0f6e4",
  text:      "#1E367A",
  textMid:   "#4a6080",
  bg:        "#f4f6fb",
  white:     "#ffffff",
};

/* ─── Accordion-Karte ─────────────────────────────────────── */
function InfoCard({
  icon,
  title,
  children,
  accentColor = C.teal,
  defaultOpen = false,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
  accentColor?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      style={{
        background: C.white,
        borderRadius: "16px",
        boxShadow: "0 2px 12px rgba(30,54,122,0.08)",
        marginBottom: "16px",
        overflow: "hidden",
        border: `1px solid rgba(30,54,122,0.07)`,
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "18px 20px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontSize: "1.5rem",
            width: "38px",
            height: "38px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: accentColor + "18",
            borderRadius: "10px",
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
        <span
          style={{
            flex: 1,
            fontFamily: '"Quicksand", sans-serif',
            fontWeight: 700,
            fontSize: "1.05rem",
            color: C.blue,
            lineHeight: 1.3,
          }}
        >
          {title}
        </span>
        <span
          style={{
            color: accentColor,
            fontSize: "1.1rem",
            transition: "transform 0.22s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0,
          }}
        >
          ▾
        </span>
      </button>

      {/* Body */}
      {open && (
        <div
          style={{
            padding: "0 20px 20px 20px",
            borderTop: `2px solid ${accentColor}22`,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Aufzählungspunkt ────────────────────────────────────── */
function Bullet({ color = C.teal, children }: { color?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: "10px", marginBottom: "8px", alignItems: "flex-start" }}>
      <span style={{ color, fontWeight: 800, marginTop: "1px", flexShrink: 0 }}>•</span>
      <span style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.93rem", color: C.textMid, lineHeight: 1.55 }}>
        {children}
      </span>
    </div>
  );
}

/* ─── Modell-Kachel ───────────────────────────────────────── */
function ModelTile({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: C.tealLight,
        borderRadius: "12px",
        padding: "14px 16px",
        marginBottom: "10px",
        borderLeft: `4px solid ${C.teal}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
        <span
          style={{
            background: C.teal,
            color: "#fff",
            fontWeight: 800,
            fontSize: "0.8rem",
            borderRadius: "6px",
            padding: "2px 8px",
            fontFamily: '"Quicksand", sans-serif',
          }}
        >
          {number}
        </span>
        <strong style={{ fontFamily: '"Quicksand", sans-serif', color: C.blue, fontSize: "0.95rem" }}>
          {title}
        </strong>
      </div>
      <p style={{ margin: 0, fontFamily: '"Quicksand", sans-serif', fontSize: "0.88rem", color: C.textMid, lineHeight: 1.55 }}>
        {children}
      </p>
    </div>
  );
}

/* ─── Info-Badge ──────────────────────────────────────────── */
function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: C.tealLight,
        borderRadius: "10px",
        padding: "10px 14px",
        marginBottom: "8px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <span style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.85rem", color: C.textMid }}>{label}</span>
      <span style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.88rem", color: C.blue, fontWeight: 700, textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}

/* ─── Hauptseite ──────────────────────────────────────────── */
const Informationen: React.FC = () => {
  return (
    <IonPage>
      <TopNav />
      <IonContent fullscreen style={{ "--background": C.bg } as React.CSSProperties}>
        {/* ── Hero ── */}
        <div
          style={{
            background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueMid} 100%)`,
            padding: "clamp(80px, 14vw, 120px) clamp(20px, 5vw, 60px) clamp(40px, 7vw, 60px)",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Dekorative Kreise */}
          <div style={{ position: "absolute", top: "-60px", right: "-40px", width: "200px", height: "200px", borderRadius: "50%", background: `${C.teal}18` }} />
          <div style={{ position: "absolute", bottom: "-40px", left: "-30px", width: "150px", height: "150px", borderRadius: "50%", background: `${C.green}15` }} />

          <div
            style={{
              display: "inline-block",
              background: `${C.teal}25`,
              borderRadius: "30px",
              padding: "6px 18px",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.8rem", fontWeight: 700, color: C.teal, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Wissen &amp; Hintergründe
            </span>
          </div>

          <h1
            style={{
              fontFamily: '"Quicksand", sans-serif',
              fontWeight: 800,
              fontSize: "clamp(1.7rem, 4vw, 2.4rem)",
              color: "#fff",
              margin: "0 0 12px",
              lineHeight: 1.2,
            }}
          >
            Verbundausbildung<br />im Handwerk
          </h1>
          <p
            style={{
              fontFamily: '"Quicksand", sans-serif',
              fontSize: "1rem",
              color: "rgba(255,255,255,0.78)",
              margin: "0 auto",
              maxWidth: "520px",
              lineHeight: 1.6,
            }}
          >
            Alles Wichtige zu Ausbildung, Verbundmodellen, Förderung und der Berliner Besonderheit – kompakt erklärt.
          </p>

          {/* Stat-Chips */}
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "12px", marginTop: "28px" }}>
            {[
              { val: "20.000", label: "offene Lehrstellen" },
              { val: "250.000", label: "Fachkräftestellen" },
              { val: "53", label: "Handwerkskammern" },
            ].map(({ val, label }) => (
              <div
                key={val}
                style={{
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(4px)",
                  borderRadius: "12px",
                  padding: "10px 18px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontFamily: '"Quicksand", sans-serif', fontWeight: 800, fontSize: "1.3rem", color: C.teal }}>{val}</div>
                <div style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Inhalt ── */}
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "28px clamp(16px, 4vw, 32px) 60px" }}>

          {/* ── 1. Duales System ── */}
          <InfoCard icon="🎓" title="Das duale Ausbildungssystem im Handwerk" accentColor={C.blue}>
            <p style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.93rem", color: C.textMid, lineHeight: 1.65, margin: "14px 0 14px" }}>
              Das deutsche duale System kombiniert <strong style={{ color: C.blue }}>praktische Arbeit im Betrieb</strong> (3–4 Tage/Woche) mit <strong style={{ color: C.blue }}>theoretischem Unterricht</strong> in der Berufsschule (1–2 Tage) oder im Blockunterricht. Die Ausbildung dauert <strong>2–3,5 Jahre</strong> und endet mit der Gesellenprüfung.
            </p>

            <p style={{ fontFamily: '"Quicksand", sans-serif', fontWeight: 700, fontSize: "0.9rem", color: C.blue, margin: "0 0 10px" }}>Vorteile auf einen Blick:</p>
            <Bullet color={C.blue}>Direkter Einstieg in reale Arbeitsabläufe ab Tag 1</Bullet>
            <Bullet color={C.blue}>Praxisnahe Qualifikation + gute Übernahmechancen</Bullet>
            <Bullet color={C.blue}>Niedrige Jugendarbeitslosigkeit im internationalen Vergleich</Bullet>
            <Bullet color={C.blue}>Vielfältige Aufstiegswege (Meister, Studium u. a.)</Bullet>
            <Bullet color={C.blue}>Unternehmen binden Fachkräfte frühzeitig und langfristig</Bullet>
            <Bullet color={C.blue}>Weltweit als Best Practice anerkannt (u. a. Vorbild für China, Schweiz, Österreich)</Bullet>

            <div style={{ background: C.tealLight, borderRadius: "10px", padding: "12px 14px", marginTop: "14px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {[
                ["DQR Niveau 3", "2-jähr. Ausbildung", true],
                ["DQR Niveau 4", "3–3,5-jähr. Ausbildung", true],
                ["53 Kammern", "regional zuständig", false],
              ].map(([val, label, isDqr]) => (
                <div key={val as string} style={{ textAlign: "center", flex: "1 1 100px" }}>
                  {isDqr ? (
                    <a
                      href="https://www.zdh.de/ueber-uns/fachbereich-berufliche-bildung/ausbildung/bildungspolitische-positionen/dqr-deutscher-qualifikationsrahmen-fuer-lebenslanges-lernen/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontFamily: '"Quicksand", sans-serif', fontWeight: 800, color: C.teal, fontSize: "1rem", textDecoration: "underline", textDecorationColor: `${C.teal}60` }}
                    >{val}</a>
                  ) : (
                    <div style={{ fontFamily: '"Quicksand", sans-serif', fontWeight: 800, color: C.teal, fontSize: "1rem" }}>{val}</div>
                  )}
                  <div style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.75rem", color: C.textMid }}>{label}</div>
                </div>
              ))}
            </div>
          </InfoCard>

          {/* ── 2. Verbundausbildung ── */}
          <InfoCard icon="🔗" title="Was ist Verbundausbildung?" accentColor={C.teal}>
            <p style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.93rem", color: C.textMid, lineHeight: 1.65, margin: "14px 0 6px" }}>
              Mehrere Betriebe (und ggf. überbetriebliche Bildungsstätten) vermitteln gemeinsam Ausbildungsinhalte, wenn ein einzelner Betrieb diese nicht vollständig abdecken kann.
            </p>
            <p style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.85rem", color: C.textMid, margin: "0 0 16px" }}>
              Rechtliche Grundlage: <strong style={{ color: C.blue }}>§ 10 Abs. 5 &amp; § 27 Abs. 2 BBiG</strong>
            </p>

            <p style={{ fontFamily: '"Quicksand", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: C.blue, margin: "0 0 12px" }}>Die vier Modelle:</p>

            <ModelTile number="1" title="Leitbetrieb + Partnerbetriebe">
              Der Leitbetrieb steuert die Ausbildung zentral und schließt für fehlende Inhalte Kooperationsverträge mit Partnerbetrieben. Er trägt die Vergütung, die Kosten externer Anteile übernimmt der Partner.
            </ModelTile>
            <ModelTile number="2" title="Auftragsausbildung">
              Der Stammbetrieb entsendet Auszubildende für bestimmte Abschnitte (Tage bis zu einem Jahr) an einen Bildungsdienstleister. Flexible Ergänzung ohne neue Vertragsbeziehungen.
            </ModelTile>
            <ModelTile number="3" title="Ausbildungskonsortium (Ringausbildung)">
              Mehrere gleichberechtigte Betriebe bilden abwechselnd aus. Der Ausbildungsvertrag läuft beim Stammbetrieb, der durchgehend die Vergütung zahlt. Minimaler Verwaltungsaufwand.
            </ModelTile>
            <ModelTile number="4" title="Ausbildungsverein">
              Ein Verein ist formaler Vertragspartner der Auszubildenden, die praktische Ausbildung findet in den Mitgliedsbetrieben statt. Reduziert den administrativen Aufwand erheblich.
            </ModelTile>

            <p style={{ fontFamily: '"Quicksand", sans-serif', fontWeight: 700, fontSize: "0.9rem", color: C.teal, margin: "14px 0 8px" }}>Vorteile:</p>
            <Bullet>Vollständige Ausbildungsinhalte trotz spezialisierter Betriebe</Bullet>
            <Bullet>Klare Verantwortlichkeiten durch gesetzliche Regelung</Bullet>
            <Bullet>Erweiterte Lernorte und Praxiserfahrung für Auszubildende</Bullet>
            <Bullet>Reduziert Kosten bei Ausbildungsabbrüchen und Wechseln</Bullet>

            <p style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.88rem", color: C.textMid, margin: "16px 0 0", lineHeight: 1.55 }}>
              Weiterführende Informationen zur Verbundausbildung im Handwerk findest du beim{" "}
              <a
                href="https://www.zdh.de/ueber-uns/fachbereich-berufliche-bildung/ausbildung/verbundausbildung/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: C.teal, fontWeight: 700, textDecoration: "underline", textDecorationColor: `${C.teal}60` }}
              >
                Zentralverband des Deutschen Handwerks (ZDH)
              </a>.
            </p>
          </InfoCard>

          {/* ── 3. ZDH ── */}
          <InfoCard icon="📊" title="Fachkräftemangel im Handwerk – Die ZDH-Zahlen" accentColor={C.teal}>
            <p style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.93rem", color: C.textMid, lineHeight: 1.65, margin: "14px 0 12px" }}>
              Der <strong style={{ color: C.blue }}>Zentralverband des Deutschen Handwerks (ZDH)</strong> meldet für 2023/2024 rund <strong style={{ color: C.teal }}>20.000 unbesetzte Lehrstellen</strong> bei gleichzeitig <strong style={{ color: C.teal }}>250.000 offenen Fachkräftestellen</strong> im Handwerk.
            </p>
            <p style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.93rem", color: C.textMid, lineHeight: 1.65, margin: "0 0 12px" }}>
              Das Handwerk wird vom ZDH als zentraler Faktor der <strong style={{ color: C.blue }}>Transformation bis 2035</strong> benannt – es trägt maßgeblich zur Umsetzung der Energiewende, zur digitalen Modernisierung sowie zur Stärkung regionaler Wertschöpfung bei.
            </p>
            <div style={{ background: C.greenLight, borderRadius: "10px", padding: "12px 14px", borderLeft: `3px solid ${C.green}` }}>
              <p style={{ margin: 0, fontFamily: '"Quicksand", sans-serif', fontSize: "0.88rem", color: C.textMid, lineHeight: 1.55 }}>
                💡 Investitionen in Ausbildungsstrukturen entlasten nicht nur den Arbeitsmarkt, sondern sichern zugleich die Resilienz und Innovationsfähigkeit ganzer Regionen.
              </p>
            </div>
          </InfoCard>

          {/* ── Berlin ── */}
          <div style={{ marginBottom: "8px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px"
            }}>
              <div style={{ height: "2px", flex: 1, background: `linear-gradient(to right, ${C.teal}, transparent)` }} />
              <span style={{ fontFamily: '"Quicksand", sans-serif', fontWeight: 800, color: C.blue, fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                🏙️ Berlin im Fokus
              </span>
              <div style={{ height: "2px", flex: 1, background: `linear-gradient(to left, ${C.teal}, transparent)` }} />
            </div>
          </div>

          <InfoCard icon="🤝" title="Die Verbundberatung Berlin" accentColor={C.teal}>
            <p style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.93rem", color: C.textMid, lineHeight: 1.65, margin: "14px 0 14px" }}>
              Die 2014 gestartete und von der Senatsverwaltung finanzierte <strong style={{ color: C.blue }}>„Verbundberatung Duale Berufsausbildung Berlin"</strong> unterstützt Berliner Unternehmen branchenübergreifend und <strong style={{ color: C.teal }}>kostenlos</strong> bei:
            </p>
            <Bullet>Suche nach einem geeigneten Verbundpartner</Bullet>
            <Bullet>Gestaltung des Kooperationsvertrages</Bullet>
            <Bullet>Beantragung und Abrechnung der Fördermittel</Bullet>

            <a
              href="https://verbundberatung-berlin.de/kontakt/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginTop: "14px",
                background: C.teal,
                color: "#fff",
                borderRadius: "10px",
                padding: "12px 16px",
                fontFamily: '"Quicksand", sans-serif',
                fontWeight: 700,
                fontSize: "0.9rem",
                textDecoration: "none",
              }}
            >
              <span>📞</span>
              <span>Kontakt zur Verbundberatung Berlin</span>
              <span style={{ marginLeft: "auto", opacity: 0.8 }}>→</span>
            </a>

            <div style={{ background: C.tealLight, borderRadius: "10px", padding: "14px 16px", marginTop: "10px" }}>
              <p style={{ margin: "0 0 4px", fontFamily: '"Quicksand", sans-serif', fontWeight: 700, color: C.blue, fontSize: "0.9rem" }}>📌 Marktplatz Verbundausbildung</p>
              <p style={{ margin: 0, fontFamily: '"Quicksand", sans-serif', fontSize: "0.85rem", color: C.textMid }}>
                <a
                  href="https://verbundberatung-berlin.de/marktplatz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: C.teal, fontWeight: 700, textDecoration: "underline", textDecorationColor: `${C.teal}60` }}
                >verbundberatung-berlin.de/marktplatz</a> – hier finden Betriebe passende Verbundpartner. Partner: HWK Berlin, IHK Berlin, UVB.
              </p>
            </div>

            <div style={{ background: "#fff8e6", borderRadius: "10px", padding: "12px 14px", marginTop: "10px", borderLeft: `3px solid #f0a030` }}>
              <p style={{ margin: "0 0 2px", fontFamily: '"Quicksand", sans-serif', fontWeight: 700, color: C.blue, fontSize: "0.88rem" }}>Splitterberufe – Berliner Sonderfall</p>
              <p style={{ margin: 0, fontFamily: '"Quicksand", sans-serif', fontSize: "0.85rem", color: C.textMid, lineHeight: 1.5 }}>
                Ausbildungsberufe, für die in Berlin keine eigene Berufsschulklasse zustande kommt, müssen auswärtige Schulen besuchen. Förderung ab 2025: <strong>24 € pro auswärtigem Schultag</strong> (zuvor 12 €).
              </p>
            </div>
          </InfoCard>

            <p style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.93rem", color: C.textMid, lineHeight: 1.65, margin: "14px 0 14px" }}>
              Berlin ist bundesweit eine Ausnahme: Auf dem Stadtgebiet und in der direkten Umgebung gibt es <strong style={{ color: C.teal }}>zwei zuständige Handwerkskammern</strong>.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
              <div style={{ background: C.tealLight, borderRadius: "10px", padding: "14px 16px", borderLeft: `4px solid ${C.teal}` }}>
                <a
                  href="https://www.hwk-berlin.de/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ margin: "0 0 4px", fontFamily: '"Quicksand", sans-serif', fontWeight: 800, color: C.teal, fontSize: "0.95rem", textDecoration: "underline", textDecorationColor: `${C.teal}60`, display: "block" }}
                >Handwerkskammer Berlin ↗</a>
                <p style={{ margin: 0, fontFamily: '"Quicksand", sans-serif', fontSize: "0.85rem", color: C.textMid }}>Zuständig für Betriebe mit Sitz im Stadtgebiet Berlin. Administriert das Berliner Förderungsprogramm FBB. Blücherstraße 68, 10961 Berlin.</p>
              </div>
              <div style={{ background: "#f0f4ff", borderRadius: "10px", padding: "14px 16px", borderLeft: `4px solid ${C.blue}` }}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ margin: "0 0 4px", fontFamily: '"Quicksand", sans-serif', fontWeight: 800, color: C.blue, fontSize: "0.95rem", textDecoration: "underline", textDecorationColor: `${C.blue}60`, display: "block" }}
              </div>
            </div>
            <div style={{ background: "#fff8e6", borderRadius: "10px", padding: "12px 14px", borderLeft: `3px solid #f0a030` }}>
              <p style={{ margin: 0, fontFamily: '"Quicksand", sans-serif', fontSize: "0.88rem", color: C.textMid, lineHeight: 1.55 }}>
              </p>
            </div>
          </InfoCard>

          <InfoCard icon="💶" title="Berliner Förderung – Das FBB-Programm" accentColor={C.green}>
            <p style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.93rem", color: C.textMid, lineHeight: 1.65, margin: "14px 0 14px" }}>
              Das Land Berlin fördert Verbundausbildung aktiv über das <strong style={{ color: C.blue }}>Programm zur Förderung der Berufsausbildung im Land Berlin (FBB)</strong>, administriert durch die Handwerkskammer Berlin.
            </p>

            <p style={{ fontFamily: '"Quicksand", sans-serif', fontWeight: 700, fontSize: "0.9rem", color: C.blue, margin: "0 0 10px" }}>Förderhöhe – max. 40 € pro Verbundtag:</p>
            <Badge label="2-jährige Ausbildung" value="bis zu 2.500 €" />
            <Badge label="3-jährige Ausbildung" value="bis zu 6.500 €" />
            <Badge label="3,5-jährige Ausbildung" value="bis zu 7.500 €" />

            <p style={{ fontFamily: '"Quicksand", sans-serif', fontWeight: 700, fontSize: "0.9rem", color: C.blue, margin: "14px 0 8px" }}>Zusatzförderung für:</p>
            <Bullet color={C.green}>Personen ohne Schulabschluss oder mit Förderbedarf</Bullet>
            <Bullet color={C.green}>Frauen in männertypischen / Männer in frauentypischen Berufen</Bullet>
            <Bullet color={C.green}>Alleinerziehende und Pflegende</Bullet>
            <Bullet color={C.green}>Geflüchtete mit Aufenthaltstitel oder Duldung</Bullet>
            <Bullet color={C.green}>Übernahme von Azubis aus Insolvenzbetrieben</Bullet>

            <div style={{ background: C.greenLight, borderRadius: "10px", padding: "12px 14px", marginTop: "12px", borderLeft: `3px solid ${C.green}` }}>
              <p style={{ margin: "0 0 4px", fontFamily: '"Quicksand", sans-serif', fontWeight: 700, color: C.blue, fontSize: "0.88rem" }}>Antragstellung</p>
              <p style={{ margin: "0 0 10px", fontFamily: '"Quicksand", sans-serif', fontSize: "0.85rem", color: C.textMid, lineHeight: 1.5 }}>
                Frist: <strong>6 Monate</strong> nach Beginn der Verbundausbildung. Antragsteller ist der ausbildende Betrieb. Anträge an: <strong>fbb@hwk-berlin.de</strong>
              </p>
              <a
                href="https://service.berlin.de/dienstleistung/354529/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: C.green,
                  color: "#fff",
                  borderRadius: "8px",
                  padding: "9px 14px",
                  fontFamily: '"Quicksand", sans-serif',
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                }}
              >
                Direkt zum Antrag →
              </a>
            </div>

            <div style={{ background: C.tealLight, borderRadius: "10px", padding: "12px 14px", marginTop: "10px" }}>
              <p style={{ margin: 0, fontFamily: '"Quicksand", sans-serif', fontSize: "0.85rem", color: C.textMid }}>
                🆕 <strong style={{ color: C.blue }}>Ab 2025/26:</strong> Digitale Verbundformate sind förderfähig. Zuschuss zur Prüfungsvorbereitung steigt von 400 auf <strong>440 €</strong>. Berliner Betriebe können jetzt auch Partner außerhalb Berlins einbeziehen.
              </p>
            </div>
          </InfoCard>

        </div>
        <Footer />
      </IonContent>
    </IonPage>
  );
};

export default Informationen;
