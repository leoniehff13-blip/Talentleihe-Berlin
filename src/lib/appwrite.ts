import { Client, Account, Databases, Storage, type Models } from "appwrite";

/**
 * Appwrite Client – wird einmal initialisiert und überall in der App importiert.
 *
 * Konfiguration läuft über Vite-Umgebungsvariablen (`.env.local`).
 * Erlaubt sind nur Variablen mit dem Präfix `VITE_`, weil Vite nur diese
 * an den Browser ausliefert.
 *
 *   VITE_APPWRITE_ENDPOINT     z.B. https://cloud.appwrite.io/v1
 *   VITE_APPWRITE_PROJECT_ID   die Project-ID aus der Appwrite-Konsole
 */

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT as string | undefined;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID as string | undefined;

if (!endpoint || !projectId) {
  // Hilfreiche Meldung, falls jemand vergessen hat, .env.local anzulegen.
  // eslint-disable-next-line no-console
  console.warn(
    "[Appwrite] VITE_APPWRITE_ENDPOINT oder VITE_APPWRITE_PROJECT_ID fehlt. " +
      "Lege eine Datei .env.local im Projekt-Root an (siehe .env.example)."
  );
}

export const client = new Client()
  .setEndpoint(endpoint ?? "https://cloud.appwrite.io/v1")
  .setProject(projectId ?? "");

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

/* -------- Datenbank- und Collection-Konstanten -------- */
export const DB_LEHRSTELLEN = "lehrstellen";
export const COL_APPRENTICESHIPS = "apprenticeships";

/* -------- Typen für die Lehrstellen-Tabelle -------- */
export type Bundesland =
  | "Baden-Württemberg"
  | "Bayern"
  | "Berlin"
  | "Brandenburg"
  | "Bremen"
  | "Hamburg"
  | "Hessen"
  | "Mecklenburg-Vorpommern"
  | "Niedersachsen"
  | "Nordrhein-Westfalen"
  | "Rheinland-Pfalz"
  | "Saarland"
  | "Sachsen"
  | "Sachsen-Anhalt"
  | "Schleswig-Holstein"
  | "Thüringen";

export const BUNDESLAENDER: Bundesland[] = [
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen",
];

export interface Lehrstelle extends Models.Document {
  gewerk: string;
  firma: string;
  ort: string;
  startdatum: string;
  enddatum: string | null;
  kontakt_email: string;
  spezialisierungen: string[];
  mindestalter: number | null;
  vorerfahrung: string | null;
  aufgabenbeschreibung: string;
  adresse: string | null;
  plz: string | null;
  stadt: string | null;
  bundesland: Bundesland | null;
  handwerkskammer: string | null;
}
