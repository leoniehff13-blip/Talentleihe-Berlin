import { useState, useEffect, useRef } from "react";
import { useLocation, useHistory } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Home", href: "/home" },
  { label: "Talentleihe", href: "/lehrstellen" },
  { label: "Infos", href: "/informationen" },
  { label: "Konto", href: "/konto" },
];

const TopNav: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
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
    history.push(href);
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
          boxShadow: showBg ? "0 1px 8px rgba(0,0,0,0.08)" : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 clamp(16px, 5vw, 60px)",
          transition: "background 0.2s, box-shadow 0.2s",
        }}>

          {/* Logo */}
          <span
            onClick={() => navigate("/home")}
            style={{
              fontFamily: '"Syne", sans-serif',
              fontWeight: 800,
              fontSize: "1.4rem",
              letterSpacing: "-0.04em",
              color: "#3a88fe",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            WT
          </span>

          {/* Desktop-Navigation */}
          <div className="topnav-desktop" style={{ gap: "24px" }}>
            {NAV_ITEMS.map(({ label, href }) => {
              const active = location.pathname === href || location.pathname.startsWith(href + "/");
              return (
                <button
                  key={href}
                  onClick={() => navigate(href)}
                  style={{
                    fontFamily: '"Syne", sans-serif',
                    fontSize: "1.0rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: active ? "#3a88fe" : "#6aaaff",
                    background: "transparent",
                    border: "none",
                    padding: "8px 0",
                    cursor: "pointer",
                    fontWeight: 800,
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#3a88fe"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = active ? "#3a88fe" : "#6aaaff"; }}
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
                width: menuOpen ? "22px" : "22px",
                height: "2px",
                background: "#3a88fe",
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
            borderTop: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
            display: "flex",
            flexDirection: "column",
          }}>
            {NAV_ITEMS.map(({ label, href }) => {
              const active = location.pathname === href || location.pathname.startsWith(href + "/");
              return (
                <button
                  key={href}
                  onClick={() => navigate(href)}
                  style={{
                    fontFamily: '"Syne", sans-serif',
                    fontSize: "0.85rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    fontWeight: 800,
                    color: active ? "#3a88fe" : "#0d1b38",
                    background: active ? "rgba(58,136,254,0.06)" : "transparent",
                    border: "none",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
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
