import { useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import Footer from "../components/Footer";
import TopNav from "../components/TopNav";

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

function InfoCard({ icon, title, children, accentColor = C.teal, defaultOpen = false }: {
  icon: string; title: string; children: React.ReactNode; accentColor?: string; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: C.white, borderRadius: 16, boxShadow: "0 2px 12px rgba(30,54,122,0.08)", marginBottom: 16, overflow: "hidden", border: "1px solid rgba(30,54,122,0.07)" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "18px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
        <span style={{ fontSize: "1.5rem", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", background: accentColor + "18", borderRadius: 10, flexShrink: 0 }}>{icon}</span>
        <span style={{ flex: 1, fontFamily: '"Quicksand", sans-serif', fontWeight: 700, fontSize: "1.05rem", color: C.blue, lineHeight: 1.3 }}>{title}</span>
        <span style={{ color: accentColor, fontSize: "1.1rem", transition: "transform 0.22s", transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>&#9662;</span>
      </button>
      {open && <div style={{ padding: "0 20px 20px 20px", borderTop: `2px solid ${accentColor}22` }}>{children}</div>}
    </div>
  );
}

function Bullet({ color = C.teal, children }: { color?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
      <span style={{ color, fontWeight: 800, marginTop: 1, flexShrink: 0 }}>&#8226;</span>
      <span style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.93rem", color: C.textMid, lineHeight: 1.55 }}>{children}</span>
    </div>
  );
}

function ModelTile({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: C.tealLight, borderRadius: 12, padding: "14px 16px", marginBottom: 10, borderLeft: `4px solid ${C.teal}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ background: C.teal, color: "#fff", fontWeight: 800, fontSize: "0.8rem", borderRadius: 6, padding: "2px 8px", fontFamily: '"Quicksand", sans-serif' }}>{number}</span>
        <strong style={{ fontFamily: '"Quicksand", sans-serif', color: C.blue, fontSize: "0.95rem" }}>{title}</strong>
      </div>
      <p style={{ margin: 0, fontFamily: '"Quicksand", sans-serif', fontSize: "0.88rem", color: C.textMid, lineHeight: 1.55 }}>{children}</p>
    </div>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: C.tealLight, borderRadius: 10, padding: "10px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <span style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.85rem", color: C.textMid }}>{label}</span>
      <span style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.88rem", color: C.blue, fontWeight: 700, textAlign: "right" }}>{value}</span>
    </div>
  );
}

type PartnerEntry = [string, string];
type PartnerGroup = [string, PartnerEntry[]];

const PARTNER_GROUPS: PartnerGroup[] = [
  ["Kammern & Verbände", [
    ["Handwerkskammer Berlin (HWK)", "https://www.hwk-berlin.de"],
    ["Handwerkskammer Frankfurt (Oder), Region Ostbrandenburg", "https://www.hwk-ff.de"],
    ["Industrie- und Handelskammer zu Berlin (IHK Berlin)", "https://www.ihk.de/berlin"],
    ["Verband der Freien Berufe in Berlin e.V. (VfB)", "https://www.freie-berufe-berlin.de"],
    ["Vereinigung der Unternehmensverbände Berlin-Brandenburg e.V. (UVB)", "https://www.uvb-online.de"],
  ]],
  ["Berufsgruppen-Kammern & -Verbände", [
    ["Apothekerkammer Berlin", "http://www.akberlin.de"],
    ["Architektenkammer Berlin", "http://www.ak-berlin.de"],
    ["Baukammer Berlin", "http://www.baukammerberlin.de"],
    ["Berlin-Brandenburger Verband der Steuerberater, Wirtschaftsprüfer und vereidigten Buchprüfer e.V.", "https://www.bbv-steuerberater.de"],
    ["Berliner Apotheker-Verein e.V.", "http://www.bav-berlin.de"],
    ["Bund Deutscher Landschaftsarchitekt:innen, Landesverband Berlin/Brandenburg e.V.", "https://www.bdla.de/berlin-brandenburg"],
    ["Bund der Öffentlich bestellten Vermessungsingenieure e.V., Landesgruppe Berlin", "http://www.bdvi-berlin.de"],
    ["BDÜ – Bundesverband der Dolmetscher und Übersetzer, Landesverband Berlin-Brandenburg e.V.", "http://www.bb.bdue.de"],
    ["Hartmannbund – Verband der Ärztinnen und Ärzte Deutschlands, Landesverband Berlin", "https://www.hartmannbund.de/der-verband/landesverbande/berlin/"],
    ["Kassenzahnärztliche Vereinigung Berlin (KZV Berlin)", "http://www.kzv-berlin.de"],
    ["Rechtsanwaltskammer Berlin", "https://www.rak-berlin.de"],
    ["Steuerberaterkammer Berlin", "http://www.stbk-berlin.de"],
    ["Steuerberaterverband Berlin-Brandenburg e.V.", "https://www.stbverband.de"],
    ["VBI – Verband Beratender Ingenieure, Landesverband Berlin-Brandenburg", "https://www.vbi.de/landesverbaende/berlin-brandenburg/"],
    ["Verband der Restauratoren e.V., Landesgruppe Berlin/Brandenburg", "https://www.restauratoren.de/der-vdr/landesgruppen/landesgruppe-berlinbrandenburg/"],
    ["Vereinigung freischaffender Architekten e.V., Landesgruppe Berlin-Brandenburg", "http://www.vfa-bb.de"],
    ["Wirtschaftsprüferkammer, Landesgeschäftsstelle Berlin", "http://www.wpk.de/wpk/organisation/landespraesidenten/"],
  ]],
];

const Informationen: React.FC = () => (
  <IonPage>
    <TopNav />
    <IonContent fullscreen style={{ "--background": C.bg } as React.CSSProperties}>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueMid} 100%)`, padding: "clamp(80px,14vw,120px) clamp(20px,5vw,60px) clamp(40px,7vw,60px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -40, width: 200, height: 200, borderRadius: "50%", background: `${C.teal}18` }} />
        <div style={{ position: "absolute", bottom: -40, left: -30, width: 150, height: 150, borderRadius: "50%", background: `${C.green}15` }} />
        <div style={{ display: "inline-block", background: `${C.teal}25`, borderRadius: 30, padding: "6px 18px", marginBottom: 16 }}>
          <span style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.8rem", fontWeight: 700, color: C.teal, letterSpacing: "0.12em", textTransform: "uppercase" }}>Wissen &amp; Hintergründe</span>
        </div>
        <h1 style={{ fontFamily: '"Quicksand", sans-serif', fontWeight: 800, fontSize: "clamp(1.7rem,4vw,2.4rem)", color: "#fff", margin: "0 0 12px", lineHeight: 1.2 }}>
          Verbundausbildung<br />in Berlin
        </h1>
        <p style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "1rem", color: "rgba(255,255,255,0.78)", margin: "0 auto", maxWidth: 520, lineHeight: 1.6 }}>
          Alles Wichtige zu Verbundausbildung, Förderung und den Berliner Institutionen – branchenübergreifend und faktenbasiert.
        </p>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 12, marginTop: 28 }}>
          {[
            { val: "22", label: "Träger-Institutionen" },
            { val: "seit 2014", label: "Verbundberatung Berlin" },
            { val: "kostenlos", label: "für Berliner Betriebe" },
          ].map(({ val, label }) => (
            <div key={val} style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)", borderRadius: 12, padding: "10px 18px", textAlign: "center" }}>
              <div style={{ fontFamily: '"Quicksand", sans-serif', fontWeight: 800, fontSize: "1.3rem", color: C.teal }}>{val}</div>
              <div style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px clamp(16px,4vw,32px) 60px" }}>

        {/* 1. Was ist Verbundausbildung */}
        <InfoCard icon="🔗" title="Was ist Verbundausbildung?" accentColor={C.teal} defaultOpen>
          <p style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.93rem", color: C.textMid, lineHeight: 1.65, margin: "14px 0 6px" }}>
            Bei der Verbundausbildung kooperieren mehrere Betriebe – und ggf. überbetriebliche Bildungsstätten –, um gemeinsam alle vorgeschriebenen Ausbildungsinhalte zu vermitteln, die ein einzelner Betrieb allein nicht vollständig abdecken kann oder möchte.
          </p>
          <p style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.85rem", color: C.textMid, margin: "0 0 16px" }}>
            Rechtliche Grundlage: <strong style={{ color: C.blue }}>§ 10 Abs. 5 BBiG</strong> (Ausbildungsvertrag im Verbund) und <strong style={{ color: C.blue }}>§ 27 Abs. 2 BBiG</strong> (Berufsausbildung in einer Einrichtung außerhalb des Ausbildungsbetriebs).
          </p>
          <p style={{ fontFamily: '"Quicksand", sans-serif', fontWeight: 700, fontSize: "0.95rem", color: C.blue, margin: "0 0 12px" }}>Die vier anerkannten Modelle:</p>
          <ModelTile number="1" title="Leitbetrieb mit Partnerbetrieb">
            Ein Leitbetrieb steuert die Ausbildung, schließt Kooperationsverträge mit Partnerbetrieben für fehlende Inhalte und trägt die Ausbildungsvergütung. Die Kosten externer Anteile übernimmt der Partnerbetrieb.
          </ModelTile>
          <ModelTile number="2" title="Auftragsausbildung">
            Der Stammbetrieb beauftragt einen externen Bildungsdienstleister für bestimmte Ausbildungsabschnitte (tageweise bis zu einem Jahr). Flexibel und ohne neue Vertragsbeziehungen für den Azubi.
          </ModelTile>
          <ModelTile number="3" title="Ausbildungskonsortium">
            Mehrere gleichberechtigte Betriebe bilden abwechselnd aus. Der Ausbildungsvertrag läuft beim Stammbetrieb, der durchgehend die Vergütung zahlt.
          </ModelTile>
          <ModelTile number="4" title="Ausbildungsverein">
            Ein Verein ist formaler Vertragspartner der Azubis, die praktische Ausbildung findet in den Mitgliedsbetrieben statt. Reduziert den administrativen Aufwand erheblich.
          </ModelTile>
          <p style={{ fontFamily: '"Quicksand", sans-serif', fontWeight: 700, fontSize: "0.9rem", color: C.teal, margin: "14px 0 8px" }}>Vorteile für alle Beteiligten:</p>
          <Bullet>Vollständige Ausbildung trotz spezialisierter Betriebsstruktur</Bullet>
          <Bullet>Azubis gewinnen Einblicke in verschiedene Betriebe und Arbeitsweisen</Bullet>
          <Bullet>Kleinbetriebe können ausbilden, die es allein nicht könnten</Bullet>
          <Bullet>Reduziert das Risiko von Ausbildungsabbrüchen durch Betriebswechsel</Bullet>
          <Bullet>Stärkt regionale Ausbildungskapazitäten branchenübergreifend</Bullet>
        </InfoCard>

        {/* 2. Verbundausbildung in Berlin */}
        <InfoCard icon="🏙️" title="Verbundausbildung in Berlin – die 22 Träger-Institutionen" accentColor={C.blue}>
          <p style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.93rem", color: C.textMid, lineHeight: 1.65, margin: "14px 0 14px" }}>
            Berlin verfügt seit 2014 über eine vom <strong style={{ color: C.blue }}>Senat für Arbeit, Soziales, Gleichstellung, Integration, Vielfalt und Antidiskriminierung</strong> finanzierte, branchenübergreifende Verbundberatung. Sie wird vom <strong style={{ color: C.blue }}>Verein zur Förderung der beruflichen Bildung Berlin e.V. (vfbb)</strong> getragen und ist für Berliner Betriebe <strong style={{ color: C.teal }}>kostenlos</strong>.
          </p>
          {PARTNER_GROUPS.map(([group, items]) => (
            <div key={group} style={{ marginBottom: 14 }}>
              <p style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.82rem", fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>{group}</p>
              <div style={{ background: C.tealLight, borderRadius: 10, padding: "10px 14px" }}>
                {items.map(([name, url]) => (
                  <div key={name} style={{ padding: "5px 0", borderBottom: "1px solid rgba(71,188,194,0.15)" }}>
                    <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.85rem", color: C.blue, textDecoration: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>{name}</span>
                      <span style={{ color: C.teal, flexShrink: 0, marginLeft: 8 }}>&#8599;</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </InfoCard>

        {/* 3. Verbundberatung */}
        <InfoCard icon="🤝" title="Die Verbundberatung Berlin – kostenloses Beratungsangebot" accentColor={C.teal}>
          <p style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.93rem", color: C.textMid, lineHeight: 1.65, margin: "14px 0 14px" }}>
            Die <strong style={{ color: C.blue }}>Verbundberatung Duale Berufsausbildung Berlin</strong> unterstützt Berliner Unternehmen aller Branchen kostenlos bei:
          </p>
          <Bullet>Suche nach einem geeigneten Verbundpartner</Bullet>
          <Bullet>Gestaltung und Prüfung des Kooperationsvertrages</Bullet>
          <Bullet>Beantragung und Abrechnung von Fördermitteln (FBB-Programm)</Bullet>
          <Bullet>Klärung von Zuständigkeitsfragen zwischen verschiedenen Kammern</Bullet>
          <a href="https://verbundberatung-berlin.de/kontakt/" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, background: C.teal, color: "#fff", borderRadius: 10, padding: "12px 16px", fontFamily: '"Quicksand", sans-serif', fontWeight: 700, fontSize: "0.9rem", textDecoration: "none" }}>
            <span>📞</span>
            <span>Kontakt zur Verbundberatung Berlin</span>
            <span style={{ marginLeft: "auto", opacity: 0.8 }}>→</span>
          </a>
          <div style={{ background: C.tealLight, borderRadius: 10, padding: "14px 16px", marginTop: 10 }}>
            <p style={{ margin: "0 0 4px", fontFamily: '"Quicksand", sans-serif', fontWeight: 700, color: C.blue, fontSize: "0.9rem" }}>📌 Marktplatz Verbundausbildung</p>
            <p style={{ margin: 0, fontFamily: '"Quicksand", sans-serif', fontSize: "0.85rem", color: C.textMid }}>
              Über{" "}
              <a href="https://verbundberatung-berlin.de/marktplatz/" target="_blank" rel="noopener noreferrer" style={{ color: C.teal, fontWeight: 700 }}>verbundberatung-berlin.de/marktplatz</a>
              {" "}können Betriebe gezielt passende Verbundpartner finden. Träger: HWK Berlin, IHK Berlin und UVB.
            </p>
          </div>
          <div style={{ background: "#fff8e6", borderRadius: 10, padding: "12px 14px", marginTop: 10, borderLeft: "3px solid #f0a030" }}>
            <p style={{ margin: "0 0 2px", fontFamily: '"Quicksand", sans-serif', fontWeight: 700, color: C.blue, fontSize: "0.88rem" }}>Splitterberufe – Berliner Besonderheit</p>
            <p style={{ margin: 0, fontFamily: '"Quicksand", sans-serif', fontSize: "0.85rem", color: C.textMid, lineHeight: 1.5 }}>
              Berufe, für die in Berlin keine eigene Berufsschulklasse zustande kommt, müssen auswärtige Schulen besuchen. Förderung ab 2025: <strong>24 € pro auswärtigem Schultag</strong> (zuvor 12 €).
            </p>
          </div>
        </InfoCard>

        {/* 4. Förderung FBB */}
        <InfoCard icon="💶" title="Berliner Förderung – Das FBB-Programm" accentColor={C.green}>
          <p style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.93rem", color: C.textMid, lineHeight: 1.65, margin: "14px 0 14px" }}>
            Das Land Berlin fördert Verbundausbildung über das <strong style={{ color: C.blue }}>Programm zur Förderung der Berufsausbildung im Land Berlin (FBB)</strong>. Anträge werden über die jeweils zuständige Kammer eingereicht.
          </p>
          <p style={{ fontFamily: '"Quicksand", sans-serif', fontWeight: 700, fontSize: "0.9rem", color: C.blue, margin: "0 0 10px" }}>Förderhöhe – max. 40 € pro Verbundtag:</p>
          <Badge label="2-jährige Ausbildung" value="bis zu 2.500 €" />
          <Badge label="3-jährige Ausbildung" value="bis zu 6.500 €" />
          <Badge label="3,5-jährige Ausbildung" value="bis zu 7.500 €" />
          <p style={{ fontFamily: '"Quicksand", sans-serif', fontWeight: 700, fontSize: "0.9rem", color: C.blue, margin: "14px 0 8px" }}>Zusatzförderung für:</p>
          <Bullet color={C.green}>Personen ohne Schulabschluss oder mit Förderbedarf</Bullet>
          <Bullet color={C.green}>Frauen in männertypischen / Männer in frauentypischen Berufen</Bullet>
          <Bullet color={C.green}>Alleinerziehende und Pflegende Angehörige</Bullet>
          <Bullet color={C.green}>Geflüchtete mit Aufenthaltstitel oder Duldung</Bullet>
          <Bullet color={C.green}>Übernahme von Azubis aus Insolvenzbetrieben</Bullet>
          <div style={{ background: C.greenLight, borderRadius: 10, padding: "12px 14px", marginTop: 12, borderLeft: `3px solid ${C.green}` }}>
            <p style={{ margin: "0 0 4px", fontFamily: '"Quicksand", sans-serif', fontWeight: 700, color: C.blue, fontSize: "0.88rem" }}>Antragstellung</p>
            <p style={{ margin: "0 0 10px", fontFamily: '"Quicksand", sans-serif', fontSize: "0.85rem", color: C.textMid, lineHeight: 1.5 }}>
              Frist: <strong>6 Monate</strong> nach Beginn der Verbundausbildung. Antragsteller ist der ausbildende Betrieb. Für Handwerksbetriebe: <strong>fbb@hwk-berlin.de</strong>
            </p>
            <a href="https://service.berlin.de/dienstleistung/354529/" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.green, color: "#fff", borderRadius: 8, padding: "9px 14px", fontFamily: '"Quicksand", sans-serif', fontWeight: 700, fontSize: "0.85rem", textDecoration: "none" }}>
              Direkt zum Antrag →
            </a>
          </div>
          <div style={{ background: C.tealLight, borderRadius: 10, padding: "12px 14px", marginTop: 10 }}>
            <p style={{ margin: 0, fontFamily: '"Quicksand", sans-serif', fontSize: "0.85rem", color: C.textMid }}>
              <strong style={{ color: C.blue }}>Neu ab 2025/26:</strong> Digitale Verbundformate sind förderfähig. Zuschuss zur Prüfungsvorbereitung steigt auf <strong>440 €</strong>. Berliner Betriebe können jetzt auch Partner außerhalb Berlins einbeziehen.
            </p>
          </div>
        </InfoCard>

        {/* 5. Rechtliches */}
        <InfoCard icon="⚖️" title="Rechtlicher Rahmen &amp; Zuständigkeiten" accentColor={C.blue}>
          <p style={{ fontFamily: '"Quicksand", sans-serif', fontSize: "0.93rem", color: C.textMid, lineHeight: 1.65, margin: "14px 0 14px" }}>
            Die Zuständigkeit für Ausbildungsberufe liegt in Deutschland bei den jeweiligen Kammern. In Berlin sind – je nach Branche – verschiedene Institutionen zuständig:
          </p>
          <Bullet color={C.blue}><strong>Handwerk</strong> – Handwerkskammer Berlin oder HWK Frankfurt (Oder)</Bullet>
          <Bullet color={C.blue}><strong>Industrie &amp; Handel</strong> – IHK Berlin</Bullet>
          <Bullet color={C.blue}><strong>Freie Berufe</strong> (Ärzte, Anwälte, Architekten u. a.) – jeweilige Berufskammer</Bullet>
          <Bullet color={C.blue}><strong>Landwirtschaft</strong> – Landwirtschaftskammer</Bullet>
          <div style={{ background: "#fff8e6", borderRadius: 10, padding: "12px 14px", marginTop: 10, borderLeft: "3px solid #f0a030" }}>
            <p style={{ margin: "0 0 2px", fontFamily: '"Quicksand", sans-serif', fontWeight: 700, color: C.blue, fontSize: "0.88rem" }}>Kammerübergreifende Verbünde</p>
            <p style={{ margin: 0, fontFamily: '"Quicksand", sans-serif', fontSize: "0.85rem", color: C.textMid, lineHeight: 1.5 }}>
              Kooperieren Betriebe aus verschiedenen Zuständigkeitsbereichen (z. B. Handwerk + Industrie), sind ggf. mehrere Kammern beteiligt. Verträge, Prüfungsanmeldungen und Förderanträge müssen jeweils bei der zuständigen Stelle eingereicht werden. Die Verbundberatung Berlin unterstützt bei der Klärung.
            </p>
          </div>
        </InfoCard>

      </div>
      <Footer />
    </IonContent>
  </IonPage>
);

export default Informationen;
