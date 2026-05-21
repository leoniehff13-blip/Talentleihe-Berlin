import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { IonText } from "@ionic/react";
import type { Lehrstelle } from "../lib/appwrite";
import { KAMMER_AREAS } from "../lib/kammer-geojson";

/**
 * Karten-Ansicht für Lehrstellen/Talent-Angebote.
 * Verwendet Leaflet (via index.html als globales `L`) und OpenStreetMap-Kacheln.
 * Geocoding läuft über Nominatim (kostenlos, max 1 req/sec).
 * Ergebnisse werden in sessionStorage gecached.
 *
 * showKammerAreas: zeichnet die Zuständigkeitsbereiche beider Kammern als
 * farbige Flächen (teal = HWK Berlin, blau = HWK Ostbrandenburg).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const L: any;

interface Props {
  items: Lehrstelle[];
  showKammerAreas?: boolean;
}

const CACHE_KEY = "geo-cache-v1";
const NOMINATIM_DELAY_MS = 1100;

type Coords = [number, number];
type CacheMap = Record<string, Coords | null>;

function readCache(): CacheMap {
  try {
    return JSON.parse(sessionStorage.getItem(CACHE_KEY) ?? "{}");
  } catch {
    return {};
  }
}
function writeCache(cache: CacheMap) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* ignore quota errors */
  }
}

function buildQuery(item: Lehrstelle): string {
  const parts: string[] = [];
  if (item.adresse) parts.push(item.adresse);
  if (item.plz) parts.push(item.plz);
  if (item.stadt) parts.push(item.stadt);
  else if (item.ort) parts.push(item.ort);
  return parts.length ? parts.join(", ") + ", Deutschland" : "";
}

async function geocode(query: string): Promise<Coords | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query
  )}&format=json&limit=1&countrycodes=de`;
  try {
    const res = await fetch(url, { headers: { "Accept-Language": "de" } });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data[0]) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    return null;
  } catch {
    return null;
  }
}

const LehrstellenMap: React.FC<Props> = ({ items, showKammerAreas = false }) => {
  const history = useHistory();
  const containerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersLayerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const kammerLayerRef = useRef<any>(null);

  const [progress, setProgress] = useState({ done: 0, total: items.length });
  const [error, setError] = useState<string | null>(null);

  // ── Karte initialisieren — nur einmal ──────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;
    if (typeof L === "undefined") {
      setError(
        "Karten-Bibliothek konnte nicht geladen werden. Bitte Verbindung prüfen und neu laden."
      );
      return;
    }

    const map = L.map(containerRef.current, {
      center: [52.52, 13.405], // Berlin
      zoom: 10,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende',
      maxZoom: 19,
    }).addTo(map);

    // Kammer-Flächen als unterste Schicht hinzufügen
    if (showKammerAreas) {
      const kammerGroup = L.layerGroup().addTo(map);

      for (const area of KAMMER_AREAS) {
        L.geoJSON(area.geojson, {
          style: {
            color: area.color,
            weight: 2,
            opacity: 0.6,
            fillColor: area.fillColor,
            fillOpacity: 0.08,
            dashArray: "5, 4",
          },
        })
          .bindTooltip(area.shortName, {
            permanent: false,
            direction: "center",
            className: "kammer-tooltip",
          })
          .addTo(kammerGroup);
      }

      kammerLayerRef.current = kammerGroup;

      // Legende unten links
      const legend = L.control({ position: "bottomleft" });
      legend.onAdd = () => {
        const div = L.DomUtil.create("div");
        div.innerHTML = `
          <div style="
            background: rgba(255,255,255,0.95);
            border-radius: 8px;
            padding: 8px 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            font-size: 12px;
            font-family: Quicksand, sans-serif;
            line-height: 1.6;
          ">
            <div style="font-weight:700;color:#1E367A;margin-bottom:4px;">Zuständigkeit</div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
              <span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:#47BCC2;opacity:0.5;border:2px solid #47BCC2;flex-shrink:0;"></span>
              <span style="color:#1E367A;">HWK Berlin</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:#1E367A;opacity:0.4;border:2px solid #1E367A;flex-shrink:0;"></span>
              <span style="color:#1E367A;">HWK Ostbrandenburg</span>
            </div>
          </div>`;
        return div;
      };
      legend.addTo(map);
    }

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
      kammerLayerRef.current = null;
    };
  // showKammerAreas ist beim Mount fix — kein Re-Run nötig
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Marker setzen, wenn sich items ändern ─────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;
    const map = mapRef.current;
    const layer = markersLayerRef.current;
    layer.clearLayers();

    setProgress({ done: 0, total: items.length });

    const cache = readCache();
    let cancelled = false;
    const allCoords: Coords[] = [];

    (async () => {
      let done = 0;
      for (const item of items) {
        if (cancelled) return;
        const query = buildQuery(item);
        if (!query) {
          done++;
          setProgress({ done, total: items.length });
          continue;
        }

        let coords = cache[query];
        if (coords === undefined) {
          coords = await geocode(query);
          cache[query] = coords;
          writeCache(cache);
          await new Promise((r) => setTimeout(r, NOMINATIM_DELAY_MS));
        }

        if (cancelled) return;

        if (coords) {
          allCoords.push(coords);
          const isTalent = item.type === "talent_angebot";

          // Pinfarbe nach Kammer: teal = HWK Berlin, blau = HWK Ostbrandenburg
          const isOstbrandenburg =
            item.handwerkskammer?.includes("Frankfurt") ?? false;
          const fillColor = isTalent
            ? isOstbrandenburg ? "#96B740" : "#47BCC2"   // Talent: grün (OB) / teal (Berlin)
            : isOstbrandenburg ? "#2a4a9a" : "#1E367A";  // Einsatz: hellblau (OB) / dunkelblau (Berlin)
          const borderColor = isOstbrandenburg ? "#1E367A" : "#47BCC2";

          const marker = L.circleMarker(coords, {
            radius: 9,
            fillColor,
            color: borderColor,
            weight: 2,
            opacity: 1,
            fillOpacity: 0.85,
          });

          const safeGewerk = String(item.gewerk ?? "").replace(/</g, "&lt;");
          const safeFirma  = String(item.firma  ?? "").replace(/</g, "&lt;");
          const safeOrt    = String(item.ort    ?? "").replace(/</g, "&lt;");
          const typeLabel  = isTalent ? "Talent-Angebot" : "Einsatz";
          const kammerKurz = isOstbrandenburg ? "HWK Ostbrandenburg" : "HWK Berlin";

          marker.bindPopup(
            `<div style="min-width:190px;font-family:Quicksand,sans-serif">
              <div style="font-size:11px;color:#666">${typeLabel} · ${kammerKurz}</div>
              <div style="font-weight:700;color:#1E367A;margin:2px 0 1px">${safeGewerk}</div>
              <div style="margin:0 0 8px;font-size:13px">${safeFirma} · ${safeOrt}</div>
              <a href="/lehrstellen/${item.$id}" data-lehrstelle-id="${item.$id}" class="ww-popup-link"
                style="color:#47BCC2;font-weight:700;cursor:pointer;text-decoration:none">
                Anzeige öffnen →
              </a>
            </div>`
          );

          marker.on("popupopen", (e: { popup: { getElement: () => HTMLElement | null } }) => {
            const popupEl = e.popup.getElement();
            if (!popupEl) return;
            const link = popupEl.querySelector(".ww-popup-link") as HTMLAnchorElement | null;
            if (!link) return;
            link.onclick = (ev: MouseEvent) => {
              ev.preventDefault();
              const id = link.getAttribute("data-lehrstelle-id");
              if (id) history.push(`/lehrstellen/${id}`);
            };
          });

          marker.addTo(layer);
        }

        done++;
        setProgress({ done, total: items.length });
      }

      if (!cancelled && allCoords.length > 0) {
        if (allCoords.length === 1) {
          map.setView(allCoords[0], 11);
        } else {
          map.fitBounds(allCoords, { padding: [40, 40] });
        }
      }
    })();

    return () => { cancelled = true; };
  }, [items, history]);

  if (error) {
    return (
      <div className="ion-padding">
        <IonText color="danger">
          <p>{error}</p>
        </IonText>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={containerRef}
        style={{ height: "60vh", width: "100%", borderRadius: 8 }}
      />
      {progress.total > 0 && progress.done < progress.total && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            background: "rgba(255,255,255,0.95)",
            padding: "8px 12px",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            fontSize: 13,
            color: "var(--ion-color-secondary)",
            zIndex: 1000,
          }}
        >
          Lade Karten-Pins ({progress.done}/{progress.total})…
        </div>
      )}
    </div>
  );
};

export default LehrstellenMap;
