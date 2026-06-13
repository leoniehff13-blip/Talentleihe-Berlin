import { useState, useEffect, useRef, useCallback } from "react";
import { useIonRouter } from "@ionic/react";
import { IonIcon } from "@ionic/react";
import { notifications } from "ionicons/icons";
import { databases, DB_LEHRSTELLEN, COL_BEWERBUNGEN, type Bewerbung } from "../lib/appwrite";
import { useAuth } from "../lib/AuthContext";
import { Query } from "appwrite";

const LS_KEY = "notifications_last_seen";

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  ausstehend:      { bg: "#FFF3CD", color: "#856404", label: "Ausstehend" },
  angenommen:      { bg: "#D1E7DD", color: "#0A3622", label: "Angenommen" },
  abgelehnt:       { bg: "#F8D7DA", color: "#58151C", label: "Abgelehnt" },
  zurueckgezogen:  { bg: "#E2E3E5", color: "#41464B", label: "Zurückgezogen" },
};

function getStatusStyle(status: string) {
  return STATUS_COLORS[status] ?? { bg: "#E2E3E5", color: "#41464B", label: status };
}

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const ionRouter = useIonRouter();
  const [bewerbungen, setBewerbungen] = useState<Bewerbung[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  const fetchBewerbungen = useCallback(async () => {
    if (!user) return;
    try {
      const res = await databases.listDocuments<Bewerbung>(
        DB_LEHRSTELLEN,
        COL_BEWERBUNGEN,
        [
          Query.equal("posting_owner_id", user.$id),
          Query.orderDesc("$createdAt"),
          Query.limit(20),
        ]
      );
      const docs = res.documents;
      setBewerbungen(docs);

      const lastSeen = localStorage.getItem(LS_KEY);
      if (!lastSeen) {
        setUnreadCount(docs.length);
      } else {
        const lastSeenDate = new Date(lastSeen);
        setUnreadCount(docs.filter(b => new Date(b.$createdAt) > lastSeenDate).length);
      }
    } catch (err) {
      console.error("NotificationBell: fetch error", err);
    }
  }, [user]);

  // Initial fetch + 60s interval
  useEffect(() => {
    if (!user) return;
    fetchBewerbungen();
    const interval = setInterval(fetchBewerbungen, 60_000);
    return () => clearInterval(interval);
  }, [user, fetchBewerbungen]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleBellClick = () => {
    if (!open) {
      localStorage.setItem(LS_KEY, new Date().toISOString());
      setUnreadCount(0);
    }
    setOpen(o => !o);
  };

  const navigate = (href: string) => {
    setOpen(false);
    ionRouter.push(href, "forward", "push");
  };

  if (!user) return null;

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      {/* Bell button */}
      <div
        ref={bellRef}
        onClick={handleBellClick}
        role="button"
        aria-label="Benachrichtigungen"
        aria-expanded={open}
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "36px",
          height: "36px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
          borderRadius: "50%",
        }}
      >
        <IonIcon
          icon={notifications}
          style={{ fontSize: "24px", color: "#47BCC2", display: "block" }}
        />
        {unreadCount > 0 && (
          <span
            aria-label={`${unreadCount} ungelesene Benachrichtigungen`}
            style={{
              position: "absolute",
              top: "1px",
              right: "1px",
              minWidth: "18px",
              height: "18px",
              background: "#e53e3e",
              color: "#ffffff",
              borderRadius: "50%",
              fontSize: "11px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
              padding: "0 3px",
              boxSizing: "border-box",
              pointerEvents: "none",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: "320px",
            maxWidth: "380px",
            background: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(30,54,122,0.16), 0 2px 8px rgba(0,0,0,0.08)",
            zIndex: 10000,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{
            padding: "14px 16px",
            borderBottom: "1px solid rgba(30,54,122,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <span style={{
              fontFamily: '"Quicksand", sans-serif',
              fontWeight: 700,
              fontSize: "1rem",
              color: "#1E367A",
            }}>
              Nachrichten
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Schließen"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                color: "#4a6080",
                lineHeight: 1,
                padding: "2px 6px",
              }}
            >
              ×
            </button>
          </div>

          {/* List */}
          <div style={{ maxHeight: "360px", overflowY: "auto" }}>
            {bewerbungen.length === 0 ? (
              <div style={{
                padding: "32px 16px",
                textAlign: "center",
                fontFamily: '"Quicksand", sans-serif',
                color: "#4a6080",
                fontSize: "0.9rem",
              }}>
                Noch keine Nachrichten
              </div>
            ) : (
              bewerbungen.map(b => {
                const statusStyle = getStatusStyle(b.status);
                return (
                  <div
                    key={b.$id}
                    onClick={() => navigate(`/meine-anzeigen/${b.apprenticeship_id}/bewerbungen`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === "Enter" && navigate(`/meine-anzeigen/${b.apprenticeship_id}/bewerbungen`)}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid rgba(30,54,122,0.06)",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "#f5f7fa"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: '"Quicksand", sans-serif',
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          color: "#1E367A",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}>
                          {b.applicant_name ?? "Unbekannt"}
                        </div>
                        <div style={{
                          fontFamily: '"Quicksand", sans-serif',
                          fontSize: "0.82rem",
                          color: "#4a6080",
                          marginTop: "2px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}>
                          {b.apprenticeship_titel ?? "—"}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
                        <span style={{
                          fontSize: "0.75rem",
                          color: "#6c7a8a",
                          fontFamily: '"Quicksand", sans-serif',
                          whiteSpace: "nowrap",
                        }}>
                          {new Date(b.$createdAt).toLocaleDateString("de-DE")}
                        </span>
                        <span style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          fontFamily: '"Quicksand", sans-serif',
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          borderRadius: "6px",
                          padding: "2px 7px",
                          whiteSpace: "nowrap",
                        }}>
                          {statusStyle.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: "10px 16px",
            borderTop: "1px solid rgba(30,54,122,0.08)",
          }}>
            <button
              onClick={() => navigate("/meine-anzeigen")}
              style={{
                width: "100%",
                padding: "10px",
                background: "#47BCC2",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontFamily: '"Quicksand", sans-serif',
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#3aa8ae"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#47BCC2"; }}
            >
              Alle anzeigen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
