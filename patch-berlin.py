#!/usr/bin/env python3
"""
Patch: Grün-Akzent, Berlin-Fokus, HWK-Band auf Berlin reduzieren.
"""
import re, sys

path = '/Users/leoniehoffmann/Talentleihe-Berlin/src/pages/Homepage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

ok = 0

def rep(old, new, label, count=1):
    global c, ok
    if old in c:
        c = c.replace(old, new, count)
        print(f'  ✅ {label}')
        ok += 1
    else:
        print(f'  ⚠️  nicht gefunden: {label}')

# ── 1. Hero-Kicker ───────────────────────────────────────────────────────────
rep(
    'Talentleihe für das Handwerk',
    'Talentleihe für das Berliner Handwerk',
    'Hero kicker → Berlin'
)

# ── 2. Hero-Subtext ──────────────────────────────────────────────────────────
rep(
    'Win/Win verbindet Auszubildende und Handwerksbetriebe — deutschlandweit,\n                durch alle Handwerkskammern. Flexibel. Fair. Zukunftssicher.',
    'Talentleihe Berlin verbindet Auszubildende und Betriebe in der Hauptstadtregion\n                — vermittelt durch die Handwerkskammer Berlin. Flexibel. Fair. Zukunftssicher.',
    'Hero subtext → Berlin'
)

# ── 3. Stat 1: 53 Handwerkskammern → 1 ──────────────────────────────────────
rep(
    '53<span>+</span>',
    '1',
    'Stat: 53+ → 1'
)
rep(
    '>Handwerkskammern<',
    '>Handwerkskammer Berlin<',
    'Stat label → Handwerkskammer Berlin'
)

# ── 4. „Mehr Informationen"-Button: dunkelblau → grün ────────────────────────
rep(
    'style={{ background: "var(--blue-deep)", color: "white" }}',
    'style={{ background: "#96B740", color: "white" }}',
    'Button "Mehr Informationen" → grün'
)

# ── 5. How-Abschnitt: Win/Win → Talentleihe Berlin ──────────────────────────
rep(
    'Win/Win macht die Talentleihe im Handwerk einfach: Auszubildende\n                können zeitweise in anderen Betrieben arbeiten — beide Seiten\n                gewinnen.',
    'Talentleihe Berlin macht den Austausch im Handwerk einfach: Auszubildende\n                können zeitweise in anderen Betrieben arbeiten — beide Seiten\n                gewinnen.',
    'How-Text: Win/Win → Talentleihe Berlin'
)

# ── 6. Outro: Win/Win → Talentleihe Berlin ───────────────────────────────────
rep(
    'Win/Win bringt euch zusammen.',
    'Talentleihe Berlin bringt euch zusammen.',
    'Outro: Win/Win → Talentleihe Berlin'
)

# ── 7. Step-Nummern 01 + 03: teal bleibt, 02 + 04: grün per inline style ────
rep(
    '<div className="ww-how-step-num">02</div>',
    '<div className="ww-how-step-num" style={{ color: "#96B740" }}>02</div>',
    'Step 02 → grün'
)
rep(
    '<div className="ww-how-step-num">04</div>',
    '<div className="ww-how-step-num" style={{ color: "#96B740" }}>04</div>',
    'Step 04 → grün'
)

# ── 8. HWK-Band: alle Kammern → nur HWK Berlin ──────────────────────────────
chambers_new = '''            <div className="ww-intro-band-chambers">
              <a
                className="ww-chamber-tag"
                href="https://www.hwk-berlin.de"
                target="_blank"
                rel="noopener noreferrer"
              >
                hwk-berlin.de
              </a>
            </div>'''

c_new = re.sub(
    r'<div className="ww-intro-band-chambers">.*?</div>',
    chambers_new,
    c,
    count=1,
    flags=re.DOTALL
)
if c_new != c:
    c = c_new
    print('  ✅ HWK-Band → nur Berlin')
    ok += 1
else:
    print('  ⚠️  nicht gefunden: HWK-Band')

# ── 9. Band-Label: Kammern → Partner ────────────────────────────────────────
rep(
    '>Kammern<',
    '>Partner<',
    'Band-Label → Partner'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print(f'\n{ok}/9 Änderungen angewendet.')
