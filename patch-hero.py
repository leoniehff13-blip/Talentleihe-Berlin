#!/usr/bin/env python3
"""Macht den Hero-Bereich hell (weißer/heller Hintergrund, dunkle Texte)."""

import re

path = '/Users/leoniehoffmann/Talentleihe-Berlin/src/pages/Homepage.tsx'

with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

changes = [
    # Hero-Hintergrund: dunkel → hell
    (
        'background: var(--blue-deep);\n          }',
        'background: var(--cream);\n          }',
        1
    ),
    # Hero-BG-Gradient: dunkel → hellgrau/teal
    (
        'background:\n              repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(255,255,255,0.025) 40px, rgba(255,255,255,0.025) 42px),\n              linear-gradient(160deg, #1E367A 0%, #2a4a9a 50%, #1E367A 100%);',
        'background: linear-gradient(135deg, #EFF1F6 0%, #e4f5f6 60%, #EFF1F6 100%);',
        1
    ),
    # Dunkles Overlay entfernen
    (
        'background: linear-gradient(160deg, rgba(11,31,74,0.55) 0%, rgba(11,31,74,0.3) 45%, rgba(11,31,74,0.85) 100%)',
        'background: none',
        1
    ),
    # Headline: weiß → dunkelblau
    (
        'color: white;\n            max-width: 14ch;',
        'color: var(--text-dark);\n            max-width: 14ch;',
        1
    ),
    # Subtext: weiß → mittel
    (
        'color: rgba(255, 255, 255, 0.78);',
        'color: var(--text-mid);',
        1
    ),
    # Ghost-Button: weiß → dunkelblau
    (
        "color: white;\n            font-family: var(--font-body);\n            font-weight: 400;\n            font-size: 0.9rem;\n            padding: 14px 28px;\n            border: 1px solid rgba(255, 255, 255, 0.35);",
        "color: var(--blue-deep);\n            font-family: var(--font-body);\n            font-weight: 400;\n            font-size: 0.9rem;\n            padding: 14px 28px;\n            border: 1px solid rgba(30, 54, 122, 0.35);",
        1
    ),
    # Ghost-Button hover: weiß border weg
    (
        'border-color: var(--gold);\n            color: var(--gold);\n            transform: translateY(-2px)',
        'border-color: var(--gold);\n            color: var(--gold);\n            transform: translateY(-2px)',
        1
    ),
    # Stat-Zahlen: weiß → dunkelblau
    (
        'color: white;\n            letter-spacing: -0.04em;',
        'color: var(--text-dark);\n            letter-spacing: -0.04em;',
        1
    ),
    # Stat-Labels: weiß rgba → mittel
    (
        'color: rgba(255, 255, 255, 0.55);',
        'color: var(--text-mid);',
        1
    ),
    # Hero-Tag: hell machen für hellen Hintergrund
    (
        'color: var(--gold-light);\n            text-transform: uppercase;\n            padding: 4px 8px;\n            border: 1px solid var(--gold);',
        'color: var(--gold);\n            text-transform: uppercase;\n            padding: 4px 8px;\n            border: 1px solid var(--gold);',
        1
    ),
]

total = 0
for old, new, max_count in changes:
    if old in c:
        c = c.replace(old, new, max_count)
        total += 1
        print(f'  ✅ ersetzt: {old[:60].strip()!r}...')
    else:
        print(f'  ⚠️  nicht gefunden: {old[:60].strip()!r}...')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print(f'\n{total}/{len(changes)} Änderungen angewendet.')
