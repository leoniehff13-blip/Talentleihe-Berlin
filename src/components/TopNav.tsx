import { useState, useEffect } from "react";
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

  // Auf Nicht-Homepage-Seiten immer weißen Hintergrund
  const showBg = scrolled || location.pathname !== "/home";

  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      height: "56px",
      background: showBg ? "#ffffff" : "transparent",
      boxShadow: showBg ? "0 1px 8px rgba(0,0,0,0.08)" : "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 clamp(20px, 5vw, 60px)",
      zIndex: 9999,
      transition: "background 0.2s, box-shadow 0.2s",
    }}>

      {/* Logo oben links */}
      <span
        onClick={() => history.push("/home")}
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

      {/* Nav-Punkte oben rechts */}
      <div style={{ display: "flex", gap: "24px" }}>
        {NAV_ITEMS.map(({ label, href }) => {
          const active = location.pathname === href || location.pathname.startsWith(href + "/");
          return (
            <button
              key={href}
              onClick={() => history.push(href)}
              style={{
                fontFamily: '"Syne", sans-serif',
                fontSize: "1.0rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: active ? "#3a88fe" : "#6aaaff",
                background: "transparent",
                border: "none",
                padding: "4px 0",
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
    </nav>
  );
};

export default TopNav;
