import { useEffect, useState, useRef } from "react";
import { Query } from "appwrite";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonSpinner,
} from "@ionic/react";
import {
  databases,
  DB_LEHRSTELLEN,
  COL_BEWERTUNGEN,
  BEWERTUNG_KATEGORIEN,
  type Bewertung,
} from "../lib/appwrite";

// inline=true: renders without IonCard wrapper, for embedding inside another card


function avg(vals: number[]) {
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function Stars({ value, size = "1.05rem" }: { value: number; size?: string }) {
  const rounded = Math.round(value);
  return (
    <span style={{ lineHeight: 1 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= rounded ? "#f5a623" : "#e0e0e0", fontSize: size }}>
          ★
        </span>
      ))}
    </span>
  );
}

/**
 * Kommentar-Text mit „mehr lesen" – zeigt zunächst max. 4 Zeilen und blendet
 * nur dann einen Umschalter ein, wenn der Text tatsächlich abgeschnitten wird.
 */
function KommentarText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el) setTruncated(el.scrollHeight > el.clientHeight + 1);
  }, [text]);

  return (
    <>
      <p
        ref={ref}
        style={{
          margin: "6px 0 0",
          fontSize: "0.82rem",
          color: "#4a6080",
          lineHeight: 1.5,
          ...(expanded
            ? {}
            : {
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }),
        }}
      >
        {text}
      </p>
      {(truncated || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            marginTop: 4,
            color: "#47BCC2",
            fontSize: "0.74rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {expanded ? "weniger anzeigen" : "mehr lesen"}
        </button>
      )}
    </>
  );
}

interface Props {
  userId: string | null | undefined;
  profileType: "talent" | "betrieb";
  inline?: boolean;
}

const BewertungsKasten: React.FC<Props> = ({ userId, profileType, inline = false }) => {
  const [bewertungen, setBewertungen] = useState<Bewertung[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setBewertungen([]);
    if (!userId) {
      setLoaded(true);
      return;
    }
    setLoaded(false);
    databases
      .listDocuments<Bewertung>(DB_LEHRSTELLEN, COL_BEWERTUNGEN, [
        Query.equal("rated_user_id", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(50),
      ])
      .then((r) => setBewertungen(r.documents))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [userId]);

  if (!loaded) {
    if (inline) return null;
    return (
      <IonCard>
        <IonCardContent style={{ display: "flex", justifyContent: "center", padding: 20 }}>
          <IonSpinner name="crescent" />
        </IonCardContent>
      </IonCard>
    );
  }

  if (bewertungen.length === 0) {
    const emptyContent = (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 0",
          color: "#9aa5b8",
        }}
      >
        <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>★</span>
        <span style={{ fontSize: "0.88rem" }}>Noch keine Bewertungen vorhanden</span>
      </div>
    );
    if (inline) {
      return (
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #e8ecf4" }}>
          <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1E367A", marginBottom: 4 }}>
            Bewertungen
          </p>
          {emptyContent}
        </div>
      );
    }
    return (
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Bewertungen</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>{emptyContent}</IonCardContent>
      </IonCard>
    );
  }

  const kat1Avg = avg(bewertungen.map((b) => b.kat1));
  const kat2Avg = avg(bewertungen.map((b) => b.kat2));
  const kat3Avg = avg(bewertungen.map((b) => b.kat3));
  const gesamtAvg = avg([kat1Avg, kat2Avg, kat3Avg]);
  const kategorien = BEWERTUNG_KATEGORIEN[profileType];
  const mitKommentar = bewertungen.filter((b) => b.kommentar);

  const content = (
    <>
      {/* Gesamtwertung */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
          padding: "12px 16px",
          background: "linear-gradient(135deg, #fffbf0 0%, #fff8e1 100%)",
          borderRadius: 12,
          border: "1px solid #f5c842",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.4rem", fontWeight: 800, color: "#1E367A", lineHeight: 1 }}>
            {gesamtAvg.toFixed(1)}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#4a6080", marginTop: 2 }}>
            {bewertungen.length} Bewertung{bewertungen.length !== 1 ? "en" : ""}
          </div>
        </div>
        <div>
          <Stars value={gesamtAvg} size="1.6rem" />
          <div style={{ fontSize: "0.8rem", color: "#4a6080", marginTop: 4 }}>Gesamtbewertung</div>
        </div>
      </div>

      {/* Kriterien 2×2 Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        {([
          [kategorien[0], kat1Avg],
          [kategorien[1], kat2Avg],
          [kategorien[2], kat3Avg],
        ] as [string, number][]).map(([label, val], i) => (
          <div
            key={label}
            style={{
              gridColumn: i === 2 ? "1 / -1" : undefined,
              background: "#f0f2f8",
              borderRadius: 10,
              padding: "10px 14px",
              ...(i === 2 ? { maxWidth: "calc(50% - 4px)" } : {}),
            }}
          >
            <div style={{ fontSize: "0.78rem", color: "#4a6080", fontWeight: 600, marginBottom: 4 }}>
              {label}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Stars value={val} size="0.95rem" />
              <span style={{ fontSize: "0.82rem", color: "#4a6080", fontWeight: 700 }}>{val.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Letzte Kommentare – horizontal scrollbar */}
      {mitKommentar.length > 0 && (
        <>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1E367A", marginBottom: 8 }}>
            Kommentare
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              overflowX: "auto",
              paddingBottom: 6,
            }}
          >
            {mitKommentar.slice(0, 10).map((b) => (
              <div
                key={b.$id}
                style={{
                  minWidth: 200,
                  maxWidth: 200,
                  flexShrink: 0,
                  background: "#f0f2f8",
                  borderRadius: 10,
                  padding: "10px 12px",
                  borderLeft: "3px solid #47BCC2",
                }}
              >
                <Stars value={avg([b.kat1, b.kat2, b.kat3])} size="0.88rem" />
                <KommentarText text={b.kommentar ?? ""} />
                <p style={{ margin: "6px 0 0", fontSize: "0.72rem", color: "#aab" }}>
                  {new Date(b.$createdAt).toLocaleDateString("de-DE")}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );

  if (inline) {
    return (
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #e8ecf4" }}>
        <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1E367A", marginBottom: 12 }}>
          Bewertungen
        </p>
        {content}
      </div>
    );
  }

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Bewertungen</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>{content}</IonCardContent>
    </IonCard>
  );
};

export default BewertungsKasten;
