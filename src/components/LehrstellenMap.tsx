import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { IonText } from "@ionic/react";
import type { Lehrstelle } from "../lib/appwrite";

/**
 * Karten-Ansicht für Lehrstellen/Talent-Angebote.
 * Verwendet Leaflet (via index.html als globales `L`) und OpenStreetMap-Kacheln.
 * Geocoding läuft über Nominatim (kostenlos, max 1 req/sec).
 * Ergebnisse werden in sessionStorage gecached.
 */

// Globale Leaflet-Variable, die per CDN in index.html eingebunden wurde.
// Wir verwenden `any`, damit kein @types/leaflet als npm-Paket nötig ist.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const L: any;

interface Props {
  items: Lehrstelle[];
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

const LehrstellenMap: React.FC<Props> = ({ items }) => {
  const history = useHistory();
  const containerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersLayerRef = useRef<any>(null);

  const [progress, setProgress] = useState({ done: 0, total: items.length });
  const [error, setError] = useState<string | null>(null);

  // Karte initialisieren — nur einmal
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
      zoom: 11,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Marker setzen, wenn sich items ändern
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
          // Nominatim: max 1 Request/Sekunde
          await new Promise((r) => setTimeout(r, NOMINATIM_DELAY_MS));
        }

        if (cancelled) return;

        if (coords) {
          allCoords.push(coords);
          const isTalent = item.type === "talent_angebot";
          const farbe = isTalent ? "#A8C6EE" : "#558DDF";
          const marker = L.circleMarker(coords, {
            radius: 9,
            fillColor: farbe,
            color: "#142F6C",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.85,
          });
          const safeGewerk = String(item.gewerk).replace(/</g, "&lt;");
          const safeFirma = String(item.firma).replace(/</g, "&lt;");
          const safeOrt = String(item.ort).replace(/</g, "&lt;");
          const typeLabel = isTalent ? "Talent-Angebot" : "Einsatz";
          marker.bindPopup(
            `<div style="min-width:180px">
              <div style="font-size:11px;color:#666">${typeLabel}</div>
              <div style="font-weight:700;color:#0b1f4a">${safeGewerk}</div>
              <div style="margin:4px 0 8px">${safeFirma} · ${safeOrt}</div>
              <a href="/lehrstellen/${item.$id}" data-lehrstelle-id="${item.$id}" class="ww-popup-link" style="color:#3a88fe;font-weight:600;cursor:pointer">Anzeige öffnen →</a>
            </div>`
          );
          // Beim Öffnen des Popups den Klick auf den Link abfangen,
          // damit React-Router navigieren kann (kein Full-Page-Reload).
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

      // Wenn wir Marker haben, Karte darauf zoomen
      if (!cancelled && allCoords.length > 0) {
        if (allCoords.length === 1) {
          map.setView(allCoords[0], 11);
        } else {
          map.fitBounds(allCoords, { padding: [40, 40] });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [items]);

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
        style={{
          height: "60vh",
          width: "100%",
          borderRadius: 8,
        }}
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
