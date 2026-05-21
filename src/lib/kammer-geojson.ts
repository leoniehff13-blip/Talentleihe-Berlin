/**
 * Vereinfachte GeoJSON-Polygone für die Zuständigkeitsbereiche
 * der beiden für Talentleihe Berlin relevanten Handwerkskammern.
 *
 * HWK Berlin            → Stadtgebiet Berlin   → Farbe Teal  (#47BCC2)
 * HWK Frankfurt (Oder)  → Region Ostbrandenburg → Farbe Blau  (#1E367A)
 *
 * Die Koordinaten sind vereinfachte Näherungspolygone.
 * Für exakte Grenzen: GeoJSON der Landkreise von
 * https://gdz.bkg.bund.de/ (BKG Open Data) oder
 * https://www.openstreetmap.org herunterladen.
 *
 * Format: GeoJSON FeatureCollection, EPSG:4326 (WGS 84)
 */

export interface KammerArea {
  name: string;
  shortName: string;
  color: string;
  fillColor: string;
  geojson: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;
}

// ── Stadtgebiet Berlin ────────────────────────────────────────────────────────
// Vereinfachtes 16-Punkt-Polygon, das die Berliner Stadtgrenze gut annähert.
const BERLIN_POLYGON: GeoJSON.Feature<GeoJSON.Polygon> = {
  type: "Feature",
  properties: { name: "Handwerkskammer Berlin" },
  geometry: {
    type: "Polygon",
    coordinates: [[
      [13.088, 52.412], // Spandau West
      [13.147, 52.571], // Heiligensee NW
      [13.222, 52.648], // Frohnau N
      [13.348, 52.677], // Rosenthal/Buch N
      [13.465, 52.677], // Blankenfelde N
      [13.575, 52.648], // Wartenberg NO
      [13.692, 52.612], // Hoppegarten-Grenze O
      [13.761, 52.556], // Mahlsdorf O
      [13.761, 52.467], // Grünau SO
      [13.700, 52.367], // Schmöckwitz S
      [13.558, 52.338], // Lichtenrade S
      [13.388, 52.338], // Marienfelde S
      [13.248, 52.365], // Steglitz SW
      [13.148, 52.400], // Spandau SW
      [13.088, 52.412], // zurück Start
    ]],
  },
};

// ── Region Ostbrandenburg (HWK Frankfurt/Oder) ────────────────────────────────
// Landkreise: Barnim, Märkisch-Oderland, Oder-Spree, Uckermark
// + kreisfreie Stadt Frankfurt (Oder)
// Dargestellt als vereinfachtes MultiPolygon.
//
// Uckermark (nördlichster Landkreis, nördlich von Barnim)
const UCKERMARK: GeoJSON.Position[] = [
  [13.205, 53.046], // SW
  [13.205, 53.280], // NW
  [13.560, 53.505], // N
  [14.050, 53.295], // NO
  [14.225, 53.046], // O
  [14.050, 52.976], // SO (Barnim-Grenze)
  [13.560, 52.938], // S
  [13.205, 53.046], // zurück
];

// Barnim (nördlich von Berlin)
const BARNIM: GeoJSON.Position[] = [
  [13.465, 52.677], // SW (an Berlin-Grenze)
  [13.465, 52.938], // NW
  [13.872, 52.976], // NO
  [14.058, 52.820], // O
  [13.965, 52.677], // SO
  [13.700, 52.612], // S (an Berlin-Grenze)
  [13.465, 52.677], // zurück
];

// Märkisch-Oderland (östlich von Berlin, nördlich der Spree)
const MAERKISCH_ODERLAND: GeoJSON.Position[] = [
  [13.700, 52.467], // SW (an Berlin)
  [13.700, 52.677], // NW (Barnim-Grenze)
  [13.965, 52.677], // N
  [14.480, 52.680], // NO (Oder)
  [14.580, 52.520], // O (Oder)
  [14.380, 52.350], // SO
  [14.050, 52.350], // S
  [13.760, 52.467], // SW
  [13.700, 52.467], // zurück
];

// Oder-Spree (südöstlich von Berlin)
const ODER_SPREE: GeoJSON.Position[] = [
  [13.560, 52.338], // SW (an Berlin)
  [13.760, 52.338], // W
  [14.050, 52.350], // NW
  [14.380, 52.350], // N
  [14.700, 52.180], // NO (Oder)
  [14.600, 52.000], // O
  [14.100, 51.970], // SO
  [13.680, 52.050], // S
  [13.560, 52.200], // SW
  [13.560, 52.338], // zurück
];

// Frankfurt (Oder) – kreisfreie Stadt (kleines Polygon an der Oder)
const FRANKFURT_ODER: GeoJSON.Position[] = [
  [14.430, 52.290], // SW
  [14.430, 52.390], // NW
  [14.580, 52.390], // NO
  [14.580, 52.290], // SO
  [14.430, 52.290], // zurück
];

const OSTBRANDENBURG_MULTIPOLYGON: GeoJSON.Feature<GeoJSON.MultiPolygon> = {
  type: "Feature",
  properties: { name: "Handwerkskammer Frankfurt (Oder), Region Ostbrandenburg" },
  geometry: {
    type: "MultiPolygon",
    coordinates: [
      [UCKERMARK],
      [BARNIM],
      [MAERKISCH_ODERLAND],
      [ODER_SPREE],
      [FRANKFURT_ODER],
    ],
  },
};

// ── Export ────────────────────────────────────────────────────────────────────
export const KAMMER_AREAS: KammerArea[] = [
  {
    name: "Handwerkskammer Berlin",
    shortName: "HWK Berlin",
    color: "#47BCC2",
    fillColor: "#47BCC2",
    geojson: BERLIN_POLYGON,
  },
  {
    name: "Handwerkskammer Frankfurt (Oder), Region Ostbrandenburg",
    shortName: "HWK Ostbrandenburg",
    color: "#1E367A",
    fillColor: "#1E367A",
    geojson: OSTBRANDENBURG_MULTIPOLYGON,
  },
];
