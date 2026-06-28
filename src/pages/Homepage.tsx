import { IonContent, IonPage, useIonRouter } from "@ionic/react";
import Footer from "../components/Footer";
import { useAuth } from "../lib/AuthContext";

const Homepage: React.FC = () => {
  const { user, profile } = useAuth();
  const ionRouter = useIonRouter();

  const istEingeloggt = Boolean(user);
  const istTalent = profile?.type === "talent";
  const istBetrieb = profile?.type === "betrieb";

  const ctaPrimary = !istEingeloggt
    ? { label: "Profil anlegen", href: "/registrieren" }
    : istTalent
      ? { label: "Azubi-Angebot anlegen", href: "/meine-anzeigen" }
      : istBetrieb
        ? { label: "Einsatz ausschreiben", href: "/meine-anzeigen" }
        : { label: "Profil ergänzen", href: "/konto" };

  return (
    <IonPage>
      <IonContent fullscreen>
        <style>{`
          .ww-page {
            --gold: #47BCC2;
            --gold-light: #70D0D5;
            --blue-deep: #1E367A;
            --cream: #ffffff;
            --text-dark: #1E367A;
            --text-mid: #4a6080;
            --font-display: "Nunito", sans-serif;
            --font-body: "Nunito", sans-serif;
            background: var(--cream);
            color: var(--text-dark);
            font-family: var(--font-body);
          }

          /* HERO */
          .ww-hero {
            position: relative;
            width: 100%;
            min-height: 86vh;
            display: flex;
            align-items: flex-end;
            overflow: hidden;
            background: var(--cream);
          }
          .ww-hero-bg {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, #EFF1F6 0%, #e4f5f6 60%, #EFF1F6 100%);
          }
          .ww-hero-bg::after {
            content: "";
            position: absolute;
            inset: 0;
            background: none;
          }
          .ww-hero-tag {
            position: absolute; top: 28px; right: clamp(20px, 5vw, 60px);
            font-family: var(--font-body);
            font-size: 0.6rem;
            letter-spacing: 0.15em;
            color: var(--gold);
            text-transform: uppercase;
            padding: 4px 8px;
            border: 1px solid var(--gold);
            border-radius: 3px;
            z-index: 2;
          }
          .ww-hero-content {
            position: relative;
            z-index: 1;
            width: 100%;
            padding: clamp(60px, 8vw, 100px) clamp(20px, 6vw, 80px) clamp(48px, 6vw, 80px);
          }
          .ww-hero-kicker {
            font-family: var(--font-body);
            font-size: 0.7rem;
            font-weight: 500;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: var(--gold);
            margin-bottom: 18px;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .ww-hero-kicker::before {
            content: "";
            display: block;
            width: 36px;
            height: 1px;
            background: var(--gold);
          }
          .ww-hero-headline {
            font-family: var(--font-display);
            font-weight: 800;
            font-size: clamp(2.5rem, 9vw, 5.5rem);
            line-height: 0.95;
            letter-spacing: -0.04em;
            color: var(--text-dark);
            max-width: 14ch;
          }
          .ww-hero-headline em {
            font-style: normal;
            color: var(--gold);
          }
          .ww-hero-sub {
            font-family: var(--font-body);
            font-size: clamp(0.95rem, 1.6vw, 1.2rem);
            font-weight: 300;
            color: var(--text-mid);
            max-width: 48ch;
            line-height: 1.65;
            margin-top: 24px;
          }
          .ww-hero-actions {
            display: flex;
            gap: 12px;
            margin-top: 32px;
            flex-wrap: wrap;
          }
          .ww-btn-primary {
            background: var(--gold);
            color: var(--blue-deep);
            font-family: var(--font-body);
            font-weight: 600;
            font-size: 0.9rem;
            letter-spacing: 0.02em;
            padding: 14px 28px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: background 0.2s, transform 0.15s;
          }
          .ww-btn-primary:hover {
            background: var(--gold-light);
            transform: translateY(-2px);
          }
          .ww-btn-ghost {
            background: transparent;
            color: var(--blue-deep);
            font-family: var(--font-body);
            font-weight: 400;
            font-size: 0.9rem;
            padding: 14px 28px;
            border: 1px solid rgba(30, 54, 122, 0.35);
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: border-color 0.2s, color 0.2s, transform 0.15s;
          }
          .ww-btn-ghost:hover {
            border-color: var(--gold);
            color: var(--gold);
            transform: translateY(-2px);
          }
          .ww-hero-stats {
            display: flex;
            gap: clamp(20px, 4vw, 48px);
            margin-top: clamp(40px, 6vw, 64px);
            flex-wrap: wrap;
          }
          .ww-hero-stat-number {
            font-family: var(--font-display);
            font-size: clamp(1.6rem, 5vw, 2.5rem);
            font-weight: 800;
            color: var(--text-dark);
            letter-spacing: -0.04em;
            line-height: 1;
          }
          .ww-hero-stat-number span { color: var(--gold); }
          .ww-hero-stat-label {
            font-size: 0.7rem;
            font-weight: 400;
            color: var(--text-mid);
            letter-spacing: 0.08em;
            text-transform: uppercase;
            margin-top: 6px;
          }

          /* INTRO BAND */
          .ww-intro-band {
            background: var(--blue-deep);
            padding: 28px clamp(20px, 6vw, 80px);
            display: flex;
            align-items: center;
            gap: 28px;
            flex-wrap: wrap;
          }
          .ww-intro-band-label {
            font-family: var(--font-body);
            font-size: 0.7rem;
            font-weight: 500;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: var(--gold);
            white-space: nowrap;
          }
          .ww-intro-band-divider {
            width: 1px;
            height: 28px;
            background: rgba(255, 255, 255, 0.15);
          }
          .ww-intro-band-chambers {
            display: flex;
            gap: 22px;
            align-items: center;
            flex-wrap: wrap;
          }
          .ww-chamber-tag {
            font-family: var(--font-body);
            font-size: 0.78rem;
            font-weight: 400;
            color: rgba(255, 255, 255, 0.6);
            text-decoration: none;
            transition: color 0.2s;
          }
          .ww-chamber-tag:hover {
            color: var(--gold);
          }
          .ww-chamber-dot {
            width: 3px;
            height: 3px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
          }

          /* HOW IT WORKS */
          .ww-how {
            background: var(--cream);
            padding: clamp(64px, 9vw, 120px) clamp(20px, 6vw, 80px);
            display: grid;
            grid-template-columns: 1fr;
            gap: 40px;
          }
          @media (min-width: 720px) {
            .ww-how {
              grid-template-columns: 1fr 1fr;
              gap: 64px;
            }
          }
          .ww-section-kicker {
            font-family: var(--font-body);
            font-size: 0.7rem;
            font-weight: 500;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: var(--gold);
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .ww-section-kicker::before {
            content: "";
            display: block;
            width: 28px;
            height: 1px;
            background: var(--gold);
          }
          .ww-section-title {
            font-family: var(--font-display);
            font-weight: 800;
            font-size: clamp(1.8rem, 5vw, 3rem);
            letter-spacing: -0.035em;
            line-height: 1.05;
            color: var(--text-dark);
          }
          .ww-how-intro p {
            font-size: clamp(0.95rem, 1.4vw, 1.1rem);
            font-weight: 300;
            color: var(--text-mid);
            line-height: 1.7;
            margin-top: 20px;
            max-width: 42ch;
          }
          .ww-how-cta {
            margin-top: 28px;
          }
          .ww-how-steps {
            display: flex;
            flex-direction: column;
            gap: 0;
          }
          .ww-how-step {
            display: grid;
            grid-template-columns: 80px 1fr;
            gap: 16px;
            padding: 24px 0;
            border-bottom: 1px solid rgba(0, 0, 0, 0.07);
          }
          .ww-how-step:last-child { border-bottom: none; }
          .ww-how-step-num {
            font-family: var(--font-display);
            font-weight: 800;
            font-size: 2rem;
            letter-spacing: -0.05em;
            color: var(--gold);
            line-height: 1;
            padding-top: 2px;
          }
          .ww-how-step-title {
            font-family: var(--font-display);
            font-weight: 700;
            font-size: 1.05rem;
            color: var(--text-dark);
            margin-bottom: 6px;
          }
          .ww-how-step-body {
            font-size: 0.88rem;
            font-weight: 300;
            color: var(--text-mid);
            line-height: 1.6;
          }

          /* OUTRO */
          .ww-outro {
            background: var(--blue-deep);
            color: white;
            padding: clamp(60px, 8vw, 100px) clamp(20px, 6vw, 80px);
            text-align: center;
          }
          .ww-outro-inner {
            max-width: 600px;
            margin: 0 auto;
          }
          .ww-outro-title {
            font-family: var(--font-display);
            font-weight: 800;
            font-size: clamp(1.6rem, 4.5vw, 2.6rem);
            letter-spacing: -0.035em;
            line-height: 1.1;
          }
          .ww-outro-title em {
            font-style: normal;
            color: var(--gold);
          }
          .ww-outro-sub {
            font-size: clamp(0.9rem, 1.4vw, 1.05rem);
            font-weight: 300;
            color: rgba(255, 255, 255, 0.7);
            margin-top: 16px;
            line-height: 1.65;
          }
          .ww-outro-actions {
            margin-top: 28px;
            display: flex;
            gap: 12px;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
          }

          /* LEGAL FOOTER */
          .ww-legal {
            background: #f0f2f7;
            padding: 24px clamp(20px, 6vw, 80px);
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }
          .ww-legal-link {
            font-family: var(--font-body);
            font-size: 0.78rem;
            color: var(--text-mid);
            text-decoration: none;
            padding: 4px 8px;
            border-radius: 4px;
            transition: color 0.2s;
          }
          .ww-legal-link:hover { color: var(--gold); }
          .ww-legal-sep {
            color: #c0c8d8;
            font-size: 0.7rem;
          }
          .ww-legal-copy {
            width: 100%;
            text-align: center;
            font-family: var(--font-body);
            font-size: 0.72rem;
            color: #a0aabb;
            margin-top: 8px;
          }
        `}</style>

        <div className="ww-page">
          {/* HERO */}
          <section className="ww-hero">
            <div className="ww-hero-bg" />
            <span className="ww-hero-tag">Beta</span>

            <div className="ww-hero-content">
              <div className="ww-hero-kicker">VerbundPraxis für das Berliner Handwerk</div>
              <h1 className="ww-hero-headline">
                Azubi trifft
                <br />
                <em>Betrieb.</em>
              </h1>
              <p className="ww-hero-sub">
                VerbundPraxis Berlin verbindet Auszubildende und Betriebe in der Hauptstadtregion
                — getragen von der Handwerkskammer Berlin. Flexibel. Fair. Zukunftssicher.
              </p>

              <div className="ww-hero-actions">
                <a
                  className="ww-btn-primary"
                  href={ctaPrimary.href}
                  onClick={(e) => {
                    e.preventDefault();
                    ionRouter.push(ctaPrimary.href, "root", "replace");
                  }}
                >
                  {ctaPrimary.label}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <a
                  className="ww-btn-ghost"
                  href="/anzeigen"
                  onClick={(e) => {
                    e.preventDefault();
                    ionRouter.push("/anzeigen", "root", "replace");
                  }}
                >
                  VerbundPraxis entdecken
                </a>
              </div>

              <div className="ww-hero-stats">
                <div>
                  <div className="ww-hero-stat-number">2</div>
                  <div className="ww-hero-stat-label">Handwerkskammern</div>
                </div>
                <div>
                  <div className="ww-hero-stat-number">
                    115<span>+</span>
                  </div>
                  <div className="ww-hero-stat-label">Ausbildungsberufe</div>
                </div>
                <div>
                  <div className="ww-hero-stat-number">
                    360<span>k</span>
                  </div>
                  <div className="ww-hero-stat-label">Auszubildende</div>
                </div>
              </div>
            </div>
          </section>

          {/* INTRO BAND */}
          <div className="ww-intro-band">
            <div className="ww-intro-band-label">Partner</div>
            <div className="ww-intro-band-divider" />
            <div className="ww-intro-band-chambers">
              <a
                className="ww-chamber-tag"
                href="https://www.hwk-berlin.de"
                target="_blank"
                rel="noopener noreferrer"
              >
                HWK Berlin
              </a>

            </div>
          </div>

          {/* HOW IT WORKS */}
          <section className="ww-how">
            <div className="ww-how-intro">
              <div className="ww-section-kicker">So funktioniert's</div>
              <h2 className="ww-section-title">
                Einfach.
                <br />
                Transparent.
                <br />
                Effektiv.
              </h2>
              <p>
                VerbundPraxis Berlin macht den Austausch im Handwerk einfach: Auszubildende
                können zeitweise in anderen Betrieben arbeiten — beide Seiten
                gewinnen.
              </p>

              <div className="ww-how-cta">
                <a
                  className="ww-btn-primary"
                  href="/informationen"
                  onClick={(e) => {
                    e.preventDefault();
                    ionRouter.push("/informationen", "root", "replace");
                  }}
                  style={{ background: "#96B740", color: "white" }}
                >
                  Mehr Informationen
                </a>
              </div>
            </div>

            <div className="ww-how-steps">
              <div className="ww-how-step">
                <div className="ww-how-step-num">01</div>
                <div>
                  <div className="ww-how-step-title">Profil erstellen</div>
                  <div className="ww-how-step-body">
                    Azubi oder Betrieb registrieren, Fähigkeiten und Bedarf
                    eintragen — in wenigen Minuten startklar.
                  </div>
                </div>
              </div>
              <div className="ww-how-step">
                <div className="ww-how-step-num" style={{ color: "#96B740" }}>02</div>
                <div>
                  <div className="ww-how-step-title">Match finden</div>
                  <div className="ww-how-step-body">
                    Passende Betriebe oder Azubis nach Region, Gewerk und
                    Verfügbarkeit filtern — auf Karte oder in der Liste.
                  </div>
                </div>
              </div>
              <div className="ww-how-step">
                <div className="ww-how-step-num">03</div>
                <div>
                  <div className="ww-how-step-title">Anfrage senden</div>
                  <div className="ww-how-step-body">
                    Direkt im Detail einer Anzeige Kontakt aufnehmen.
                    Bewerbungen und Anfragen sind im Konto jederzeit
                    nachvollziehbar.
                  </div>
                </div>
              </div>
              <div className="ww-how-step">
                <div className="ww-how-step-num" style={{ color: "#96B740" }}>04</div>
                <div>
                  <div className="ww-how-step-title">Los geht's</div>
                  <div className="ww-how-step-body">
                    Sobald beide Seiten zusagen, wechselt der Azubi temporär den
                    Betrieb. Beide gewinnen neue Erfahrungen und Verbindungen.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* OUTRO */}
          <section className="ww-outro">
            <div className="ww-outro-inner">
              <h2 className="ww-outro-title">
                Zeit, dein <em>Handwerk</em>
                <br />
                neu zu denken.
              </h2>
              <p className="ww-outro-sub">
                Egal ob du als Azubi neue Erfahrungen sammeln oder als Betrieb
                passende Azubis entdecken willst — VerbundPraxis Berlin bringt euch zusammen.
              </p>
              <div className="ww-outro-actions">
                <a
                  className="ww-btn-primary"
                  href={ctaPrimary.href}
                  onClick={(e) => {
                    e.preventDefault();
                    ionRouter.push(ctaPrimary.href, "root", "replace");
                  }}
                >
                  {ctaPrimary.label}
                </a>
                {!istEingeloggt && (
                  <a
                    className="ww-btn-ghost"
                    href="/login"
                    onClick={(e) => {
                      e.preventDefault();
                      ionRouter.push("/login", "root", "replace");
                    }}
                    style={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}
                  >
                    Schon Konto? Einloggen
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* LEGAL FOOTER */}
          <Footer />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Homepage;
