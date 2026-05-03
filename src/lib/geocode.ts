/**
 * Geocoding-Helper für die Talentleihe.
 * Verwendet Nominatim (OpenStreetMap) – kostenlos, max 1 Request/Sekunde.
 * Ergebnisse werden in sessionStorage gecached, sodass Filter und Karte sich
 * den gleichen Cache teilen.
 */

export type Coords = [number, number];

const CACHE_KEY = "geo-cache-v1";
const NOMINATIM_DELAY_MS = 1100;

let lastRequestTime = 0;

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

/**
 * Geocodiert einen freien Text (z. B. "Bielefeld" oder "33602") zu Lat/Lng.
 * Cached das Ergebnis in der Browser-Session.
 */
export async function geocode(query: string): Promise<Coords | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const cache = readCache();
  if (Object.prototype.hasOwnProperty.call(cache, trimmed)) {
    return cache[trimmed];
  }

  // Rate-Limit für Nominatim einhalten
  const now = Date.now();
  const wait = NOMINATIM_DELAY_MS - (now - lastRequestTime);
  if (wait > 0) {
    await new Promise((r) => setTimeout(r, wait));
  }
  lastRequestTime = Date.now();

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      trimmed
    )}&format=json&limit=1&countrycodes=de`;
    const res = await fetch(url, { headers: { "Accept-Language": "de" } });
    if (!res.ok) {
      cache[trimmed] = null;
      writeCache(cache);
      return null;
    }
    const data = await res.json();
    let result: Coords | null = null;
    if (Array.isArray(data) && data[0]) {
      result = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    cache[trimmed] = result;
    writeCache(cache);
    return result;
  } catch {
    cache[trimmed] = null;
    writeCache(cache);
    return null;
  }
}

/** Baut aus einem Anzeigen-Datensatz einen sinnvollen Geocoding-Suchstring. */
export function buildItemQuery(item: {
  adresse?: string | null;
  plz?: string | null;
  stadt?: string | null;
  ort?: string;
}): string {
  const parts: string[] = [];
  if (item.adresse) parts.push(item.adresse);
  if (item.plz) parts.push(item.plz);
  if (item.stadt) parts.push(item.stadt);
  else if (item.ort) parts.push(item.ort);
  return parts.length ? parts.join(", ") + ", Deutschland" : "";
}

/** Luftlinien-Distanz in Kilometern (Haversine-Formel). */
export function haversineKm(a: Coords, b: Coords): number {
  const R = 6371; // Erdradius in km
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const aa =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  return 2 * R * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
}
