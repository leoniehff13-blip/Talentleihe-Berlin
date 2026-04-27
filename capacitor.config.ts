import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "de.winwin.talentleihe",
  appName: "Win-Win Talentleihe",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
