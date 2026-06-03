#!/bin/bash
# Umbenennung: "Lehrstelle" → "Anzeige" in der Talentleihe-Berlin App
# Ausführen aus dem Projektroot: bash rename-lehrstelle.sh

set -e
echo "🔄 Starte Umbenennung Lehrstelle → Anzeige..."

# ── 1. Text-Ersetzungen in allen .tsx/.ts Dateien ──────────────────────────

# Routen (Reihenfolge wichtig: längere zuerst)
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's|/meine-lehrstellen|/meine-anzeigen|g' \
  -e 's|/lehrstellen|/anzeigen|g'

# Import-Pfade (Dateireferenzen)
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e "s|from '.*LehrstellenMap'|from '../components/AnzeigenMap'|g" \
  -e "s|from \".*LehrstellenMap\"|from '../components/AnzeigenMap'|g" \
  -e "s|from '.*LehrstelleDetail'|from '../pages/AnzeigeDetail'|g" \
  -e "s|from \".*LehrstelleDetail\"|from '../pages/AnzeigeDetail'|g" \
  -e "s|from '.*LehrstelleForm'|from '../pages/AnzeigeForm'|g" \
  -e "s|from \".*LehrstelleForm\"|from '../pages/AnzeigeForm'|g" \
  -e "s|from '.*MeineLehrstellen'|from '../pages/MeineAnzeigen'|g" \
  -e "s|from \".*MeineLehrstellen\"|from '../pages/MeineAnzeigen'|g" \
  -e 's|import Lehrstellen |import Anzeigen |g' \
  -e "s|from '.*pages/Lehrstellen'|from '../pages/Anzeigen'|g" \
  -e "s|from \".*pages/Lehrstellen\"|from '../pages/Anzeigen'|g"

# Komponenten-Namen in Code (nicht in Strings/Texten)
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's|<LehrstellenMap|<AnzeigenMap|g' \
  -e 's|LehrstellenMap />|AnzeigenMap />|g' \
  -e 's|import LehrstellenMap|import AnzeigenMap|g' \
  -e 's|import LehrstelleDetail|import AnzeigeDetail|g' \
  -e 's|import LehrstelleForm|import AnzeigeForm|g' \
  -e 's|import MeineLehrstellen|import MeineAnzeigen|g' \
  -e 's|<LehrstelleDetail />|<AnzeigeDetail />|g' \
  -e 's|<LehrstelleForm />|<AnzeigeForm />|g' \
  -e 's|<MeineLehrstellen />|<MeineAnzeigen />|g' \
  -e 's|<Lehrstellen />|<Anzeigen />|g'

# TypeScript-Typ (in appwrite.ts und Komponenten)
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's|type Lehrstelle |type Anzeige |g' \
  -e 's|type Lehrstelle$|type Anzeige|g' \
  -e 's|: Lehrstelle\b|: Anzeige|g' \
  -e 's|<Lehrstelle>|<Anzeige>|g' \
  -e 's|Lehrstelle\[\]|Anzeige[]|g' \
  -e 's|useState<Lehrstelle|useState<Anzeige|g' \
  -e 's|useState<Lehrstelle\[\]|useState<Anzeige[]|g' \
  -e 's|import.*type Lehrstelle|import { type Anzeige|g'

# Sichtbarer UI-Text (Deutsch) – NICHT in Informationen.tsx
find src -name "*.tsx" ! -name "Informationen.tsx" | xargs sed -i '' \
  -e 's|Meine Lehrstellen|Meine Anzeigen|g' \
  -e 's|Meine Lehrstelle|Meine Anzeige|g' \
  -e 's|Neue Lehrstelle|Neue Anzeige|g' \
  -e 's|"Lehrstellen"|"Anzeigen"|g' \
  -e "s|'Lehrstellen'|'Anzeigen'|g"

# Appwrite-Konstanten NICHT anfassen (DB_LEHRSTELLEN, COL_APPRENTICESHIPS bleiben)

# ── 2. Dateien umbenennen ──────────────────────────────────────────────────

mv src/pages/Lehrstellen.tsx        src/pages/Anzeigen.tsx        2>/dev/null && echo "✅ Lehrstellen.tsx → Anzeigen.tsx" || echo "⏭  Lehrstellen.tsx nicht gefunden"
mv src/pages/LehrstelleDetail.tsx   src/pages/AnzeigeDetail.tsx   2>/dev/null && echo "✅ LehrstelleDetail.tsx → AnzeigeDetail.tsx" || echo "⏭  LehrstelleDetail.tsx nicht gefunden"
mv src/pages/LehrstelleForm.tsx     src/pages/AnzeigeForm.tsx     2>/dev/null && echo "✅ LehrstelleForm.tsx → AnzeigeForm.tsx" || echo "⏭  LehrstelleForm.tsx nicht gefunden"
mv src/pages/MeineLehrstellen.tsx   src/pages/MeineAnzeigen.tsx   2>/dev/null && echo "✅ MeineLehrstellen.tsx → MeineAnzeigen.tsx" || echo "⏭  MeineLehrstellen.tsx nicht gefunden"
mv src/components/LehrstellenMap.tsx src/components/AnzeigenMap.tsx 2>/dev/null && echo "✅ LehrstellenMap.tsx → AnzeigenMap.tsx" || echo "⏭  LehrstellenMap.tsx nicht gefunden"

# ── 3. Interne Komponentennamen in umbenannten Dateien anpassen ───────────

for f in src/pages/Anzeigen.tsx src/pages/AnzeigeDetail.tsx src/pages/AnzeigeForm.tsx src/pages/MeineAnzeigen.tsx src/components/AnzeigenMap.tsx; do
  [ -f "$f" ] && sed -i '' \
    -e 's|const LehrstellenInner|const AnzeigenInner|g' \
    -e 's|const Lehrstellen:|const Anzeigen:|g' \
    -e 's|const LehrstelleDetailInner|const AnzeigeDetailInner|g' \
    -e 's|const LehrstelleDetail:|const AnzeigeDetail:|g' \
    -e 's|const LehrstelleFormInner|const AnzeigeFormInner|g' \
    -e 's|const LehrstelleForm:|const AnzeigeForm:|g' \
    -e 's|const MeineLehrstellenInner|const MeineAnzeigenInner|g' \
    -e 's|const MeineLehrstellen:|const MeineAnzeigen:|g' \
    -e 's|const LehrstellenMap:|const AnzeigenMap:|g' \
    -e 's|<LehrstellenInner|<AnzeigenInner|g' \
    -e 's|<LehrstelleDetailInner|<AnzeigeDetailInner|g' \
    -e 's|<LehrstelleFormInner|<AnzeigeFormInner|g' \
    -e 's|<MeineLehrstellenInner|<MeineAnzeigenInner|g' \
    -e 's|export default Lehrstellen|export default Anzeigen|g' \
    -e 's|export default LehrstelleDetail|export default AnzeigeDetail|g' \
    -e 's|export default LehrstelleForm|export default AnzeigeForm|g' \
    -e 's|export default MeineLehrstellen|export default MeineAnzeigen|g' \
    -e 's|export default LehrstellenMap|export default AnzeigenMap|g' \
    "$f" && echo "✅ Interne Namen in $f angepasst"
done

echo ""
echo "✅ Umbenennung abgeschlossen!"
echo "👉 Prüfe: git diff --stat"
echo "👉 Dann: git add -A && git commit -m 'Refactor: Lehrstelle → Anzeige' && git push"
