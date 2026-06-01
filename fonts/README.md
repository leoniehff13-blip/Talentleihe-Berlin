# Schriftdateien

Hier kommen die TheSans-Schriftdateien hin. Es werden folgende Dateien erwartet:

```
TheSans-Regular.woff2
TheSans-Regular.woff
TheSans-SemiBold.woff2
TheSans-SemiBold.woff
TheSans-Bold.woff2
TheSans-Bold.woff
```

`.woff2` ist Pflicht (wird von allen modernen Browsern bevorzugt). `.woff` ist
optional als Fallback für sehr alte Browser. Falls du nur `.ttf` oder `.otf`
hast, kannst du sie online (z. B. https://transfonter.org) zu `.woff2` konvertieren.

**Wichtig:** „TheSans" ist eine kommerzielle Schrift von **LucasFonts**. Du
brauchst eine gültige Web-Lizenz, um die Dateien hier abzulegen und mit der
App auszuliefern. Solange die Dateien fehlen, fällt die App automatisch auf
die System-Sans-Serif-Schrift zurück (in `src/theme/variables.css` als
`--ion-font-family` definiert).
