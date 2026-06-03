import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useIonRouter } from "@ionic/react";

const NAV_ITEMS = [
  { label: "Home",        href: "/home",         owned: ["/home"] },
  { label: "Talentleihe", href: "/anzeigen",   owned: ["/anzeigen"] },
  { label: "Infos",       href: "/informationen", owned: ["/informationen"] },
  { label: "Konto",       href: "/konto",         owned: ["/konto", "/meine-anzeigen", "/meine-bewerbungen", "/bewertung", "/login", "/registrieren"] },
];

function isActive(pathname: string, owned: string[]) {
  return owned.some(p => pathname === p || pathname.startsWith(p + "/"));
}

const TopNav: React.FC = () => {
  const location = useLocation();
  const ionRouter = useIonRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Scroll-Erkennung über Ionics internen Scroll-Container
  useEffect(() => {
    setScrolled(false);
    let cleanup: (() => void) | undefined;
    let rafId: number;

    const attach = () => {
      const ionContent = document.querySelector("ion-content");
      const inner = ionContent?.shadowRoot?.querySelector(".inner-scroll") as HTMLElement | null;
      if (!inner) {
        rafId = requestAnimationFrame(attach);
        return;
      }
      const handler = () => setScrolled(inner.scrollTop > 10);
      inner.addEventListener("scroll", handler, { passive: true });
      cleanup = () => inner.removeEventListener("scroll", handler);
    };

    rafId = requestAnimationFrame(attach);
    return () => {
      cancelAnimationFrame(rafId);
      cleanup?.();
    };
  }, [location.pathname]);

  // Menü schließen bei Klick außerhalb
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Menü schließen bei Routenwechsel
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const showBg = scrolled || location.pathname !== "/home" || menuOpen;

  const navigate = (href: string) => {
    setMenuOpen(false);
    ionRouter.push(href, "root", "replace");
  };

  return (
    <>
      <style>{`
        @media (min-width: 640px) {
          .topnav-desktop { display: flex !important; }
          .topnav-hamburger { display: none !important; }
          .topnav-dropdown { display: none !important; }
        }
        @media (max-width: 639px) {
          .topnav-desktop { display: none !important; }
          .topnav-hamburger { display: flex !important; }
        }
      `}</style>

      <nav ref={menuRef} style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}>
        {/* Hauptleiste */}
        <div style={{
          height: "52px",
          background: showBg ? "#ffffff" : "transparent",
          boxShadow: showBg ? "0 1px 8px rgba(30,54,122,0.10)" : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 clamp(16px, 5vw, 60px)",
          transition: "background 0.2s, box-shadow 0.2s",
        }}>

          {/* Logo */}
          <span
            onClick={() => navigate("/home")}
            style={{ cursor: "pointer", userSelect: "none", display: "flex", alignItems: "center" }}
            aria-label="Talentleihe Berlin – Startseite"
          >
            <svg width="38" height="38" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
              <rect x="0" y="0" width="512" height="512" rx="96" fill="#1E367A"/>
              <g transform="translate(256,148) rotate(-35)" fill="#47BCC2">
                <rect x="-13" y="-15" width="26" height="88" rx="7"/>
                <rect x="-44" y="-62" width="88" height="50" rx="9"/>
                <rect x="36" y="-55" width="24" height="20" rx="4"/>
              </g>
              <text x="256" y="370" textAnchor="middle"
                fontFamily="Quicksand, Arial Rounded MT Bold, Arial, sans-serif"
                fontWeight="800" fontSize="210" letterSpacing="-6" fill="white">TL</text>
              <rect x="106" y="412" width="300" height="16" rx="8" fill="#96B740"/>
            </svg>
          </span>

          {/* Desktop-Navigation */}
          <div className="topnav-desktop" style={{ gap: "24px" }}>
            {NAV_ITEMS.map(({ label, href, owned }) => {
              const active = isActive(location.pathname, owned);
              return (
                <button
                  key={href}
                  onClick={() => navigate(href)}
                  style={{
                    fontFamily: '"Quicksand", sans-serif',
                    fontSize: "1.0rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: active ? "#47BCC2" : "#4a6080",
                    background: "transparent",
                    border: "none",
                    padding: "8px 0",
                    cursor: "pointer",
                    fontWeight: 700,
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#47BCC2"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = active ? "#47BCC2" : "#4a6080"; }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Hamburger-Button (nur Mobile) */}
          <button
            className="topnav-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menü öffnen"
            style={{
              display: "none",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "5px",
              width: "44px",
              height: "44px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "0",
            }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: "block",
                width: "22px",
                height: "2px",
                background: "#47BCC2",
                borderRadius: "2px",
                transition: "transform 0.2s, opacity 0.2s",
                transform: menuOpen
                  ? i === 0 ? "translateY(7px) rotate(45deg)"
                  : i === 2 ? "translateY(-7px) rotate(-45deg)"
                  : "scaleX(0)"
                  : "none",
                opacity: menuOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        </div>

        {/* Mobile Dropdown-Menü */}
        {menuOpen && (
          <div className="topnav-dropdown" style={{
            background: "#ffffff",
            borderTop: "1px solid rgba(30,54,122,0.08)",
            boxShadow: "0 8px 24px rgba(30,54,122,0.12)",
            display: "flex",
            flexDirection: "column",
          }}>
            {NAV_ITEMS.map(({ label, href, owned }) => {
              const active = isActive(location.pathname, owned);
              return (
                <button
                  key={href}
                  onClick={() => navigate(href)}
                  style={{
                    fontFamily: '"Quicksand", sans-serif',
                    fontSize: "0.85rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    color: active ? "#47BCC2" : "#1E367A",
                    background: active ? "rgba(71,188,194,0.10)" : "transparent",
                    border: "none",
                    borderBottom: "1px solid rgba(30,54,122,0.06)",
                    padding: "18px clamp(16px, 5vw, 60px)",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </nav>
    </>
  );
};

export default TopNav;
