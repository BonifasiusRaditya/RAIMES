# 🎨 RAIMES Hero Section - Quick Reference Card

## Color Palette at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                     RAIMES COLOR SYSTEM                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  DARK ACCENT (Buttons, Headers)                              │
│  ████████████ gray-900 (#111827)                             │
│                                                               │
│  LIGHT BACKGROUNDS                                           │
│  ░░░░░░░░░░░░ bg-white (#ffffff)                             │
│  ▓▓▓▓▓▓▓▓▓▓▓▓ bg-slate-50 (#f8fafc)                           │
│                                                               │
│  ACCENT COLORS                                               │
│  ░░░░░░░░░░░░ Success: text-green-600 (#16a34a)              │
│  ◎◎◎◎◎◎◎◎◎◎◎◎ Warning: text-yellow-400 (#facc15)            │
│                                                               │
│  BORDERS & TEXT                                              │
│  ─────────────── border-gray-200 (#e5e7eb)                   │
│  ───────────────  text-gray-700 (#374151)                    │
│  ───────────────  text-gray-900 (#111827)                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Size Reference

### **Navigation Bar**
```
┌──────────────────────────────────────────────────────────┐
│                                                            │
│  LOGO (h-10)    |   HOME   CONTACT   |     LOGIN BUTTON   │
│  [80px height]  |   [links centered] |   [outline style]  │
│                                                            │
│  py-5 (top/bottom padding)  |  px-8 (left/right padding)  │
│  bg-white border-b          |  shadow-sm                  │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

### **Hero Headlines**
```
Desktop (lg):   text-6xl font-bold
Tablet (md):    text-5xl font-bold
Mobile (sm):    text-4xl font-bold (responsive)

Line height: tight
Letter spacing: tracking-tight
Color: text-gray-900
```

### **Call-to-Action Button**
```
┌─────────────────────────┐
│   Request account       │  px-8 py-3.5
│   (Dark button)         │  rounded-md
│   font-semibold         │  bg-gray-900 text-white
│   Hover: bg-gray-800    │  shadow-md → shadow-lg
└─────────────────────────┘
```

### **Stats Section**
```
TRUSTED BY LEADING MINING COMPANIES
(text-xs uppercase font-semibold text-gray-500)

┌────────────    ┌────────────    ┌────────────
│ 150+           │ 25+            │ 99%
│ (text-3xl      │ (text-3xl      │ (text-3xl
│  font-bold)    │  font-bold)    │  font-bold)
├────────────    ├────────────    ├────────────
│ Mining sites   │ KPIs tracked   │ Compliance
│ (text-sm       │ (text-sm       │ (text-sm
│  text-gray-600)│  text-gray-600)│  text-gray-600)
└────────────    └────────────    └────────────
```

---

## Border Radius Rules

```
BEFORE                    AFTER
────────────             ────────
rounded-full    ──→      REMOVED
rounded-3xl     ──→      rounded-lg
rounded-2xl     ──→      rounded-lg
rounded-xl      ──→      rounded-md
rounded-lg      ──→      rounded-md
rounded-md      ──→      no change
```

### Example Components:
```
Navbar                  rounded-none
Large Cards            rounded-lg
Buttons                rounded-md
Icon Containers        rounded-md
Feature Lists          rounded-lg
```

---

## Feature List Component

### Before (Button-like):
```jsx
╔═════════════════════════╗    ╔═════════════════════════╗
║ Weighted AI scoring     ║    ║ Evidence validation     ║
╚═════════════════════════╝    ╚═════════════════════════╝
(looks clickable → confusing)
```

### After (Checklist):
```jsx
✓ Weighted AI scoring
✓ Evidence-first validation
✓ Stakeholder-ready PDF
✓ Progress tracking

(clearly a list → clear intent)
```

---

## Typography Scale

```
HEROES/HEADINGS
text-6xl (desktop)  │  60px  │  Headline main
text-5xl (tablet)   │  48px  │  Hero heading
text-4xl            │  36px  │  Section heading
text-3xl            │  30px  │  Stats numbers
text-2xl            │  24px  │  Card titles
text-lg             │  18px  │  Body large
text-base           │  16px  │  Body standard
text-sm             │  14px  │  Labels
text-xs             │  12px  │  Captions
```

---

## Spacing & Padding

### Hero Section:
```
py-20           (top/bottom padding of hero)
px-6            (left/right padding)
gap-16          (space between left/right columns)
mt-6            (margin-top between elements)
mt-10           (button spacing)
mt-12           (stats section spacing)
```

### Cards:
```
p-8             (padding inside cards)
gap-8           (gap between card sections)
rounded-lg      (corner radius)
```

### Buttons:
```
px-8 py-3.5     (padding inside button)
rounded-md      (corner radius)
font-semibold   (font weight)
```

---

## Shadow System

```
BEFORE                          AFTER
────────────────────────────────────────
shadow-2xl shadow-purple/15   ──→  shadow-lg
shadow-lg shadow-purple/20    ──→  shadow-md → shadow-lg (hover)
shadow-sm                     ──→  no change
```

### Usage:
```
Cards:    shadow-lg
Buttons:  shadow-md (normal) → shadow-lg (hover)
Subtle:   no shadow
```

---

## Responsive Breakpoints

```
Mobile First Approach:
─────────────────────

Base (mobile)              Default text-4xl, stack vertically
sm (640px)                 Small tablets
md (768px)                 Tablets → text-5xl headline
lg (1024px)                Desktops → text-6xl headline
xl (1280px)                Large screens
```

### Hero Section Grid:
```
Mobile:   grid-cols-1       (single column)
Desktop:  lg:grid-cols-2    (two columns)
Gap:      gap-16            (wider gap on desktop)
```

---

## Animation Guidelines

```
KEEP:
✓ fadeInUp (entrance animations)
✓ scaleIn (card reveal)
✓ staggerChildren (staggered entry)

REMOVE:
✗ whileHover={{ y: -2 }}  (bouncy)
✗ hover:-translate-y-0.5  (lift effect)
✗ No unnecessary micro-animations

PREFER:
→ Color transitions (hover:bg-gray-800)
→ Shadow changes (shadow-md → shadow-lg)
→ Smooth fades
```

---

## Icon System

```
Checkmarks (Features):
<Check className="w-5 h-5 text-green-600 shrink-0" />
─ Size: 5x5 (20px)
─ Color: green-600 (✓ positive)
─ Shrink: shrink-0 (prevent squishing)

Feature Section Icons:
<Icon className="w-6 h-6 text-yellow-400" />
─ Size: 6x6 (24px)
─ Color: yellow-400

General Icons:
<Icon className="w-4 h-4" />
─ Size: 4x4 (16px)
```

---

## Text Color Reference

```
HEADINGS
text-gray-900          Primary headings (#111827)

BODY TEXT
text-gray-700          Main body text (#374151)
text-gray-600          Secondary text (#4b5563)

LABELS / CAPTIONS
text-gray-500          Tertiary labels (#6b7280)

WHITE TEXT (Dark backgrounds)
text-white             On gray-900 background
text-gray-300          Secondary on dark
text-yellow-400        Accent icons on dark
```

---

## CTA Button States

```
NORMAL STATE
bg-gray-900 text-white font-semibold
px-8 py-3.5 rounded-md
shadow-md
cursor: pointer

HOVER STATE
bg-gray-800 (darker)
shadow-lg (enhanced shadow)
transition-colors duration-200

FOCUS STATE (Accessibility)
outline-2 outline-offset-2 outline-gray-900
(add if needed for keyboard users)

DISABLED STATE (if needed)
bg-gray-400 cursor-not-allowed opacity-50
```

---

## Section Backgrounds

```
HERO SECTION
bg-slate-50    (light gray background)

FEATURE CARDS (Dark)
bg-gray-900    (very dark gray)

STEPS SECTION
bg-gray-50     (very light gray)

FEATURES GRID
bg-white       (pure white)

CTA FOOTER
bg-gray-900    (very dark gray)
```

---

## Border System

```
Border Color:        border-gray-200 (#e5e7eb)
Border Width:        border (1px default)
Border Placement:    border / border-t / border-b

Card Borders:
- rounded-lg border border-gray-200

Header Border:
- border-b border-gray-200

Section Dividers:
- border-t border-gray-200 pt-8
```

---

## Quick Component Copy-Paste

### Button (Primary):
```jsx
<Link
  to="/register"
  className="inline-block px-8 py-3.5 rounded-md bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors duration-200 shadow-md hover:shadow-lg"
>
  Request account
</Link>
```

### Card Container:
```jsx
<div className="rounded-lg bg-white border border-gray-200 shadow-lg p-8 flex flex-col gap-8">
  {/* Content */}
</div>
```

### Checklist Item:
```jsx
<div className="flex items-center gap-3">
  <Check className="w-5 h-5 text-green-600 shrink-0" />
  <span className="text-gray-900 font-medium">Feature text</span>
</div>
```

### Section Heading:
```jsx
<h2 className="text-4xl font-bold text-gray-900 text-center">
  Comprehensive, AI-powered mining assessment
</h2>
```

### Badge:
```jsx
<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold">
  <Sparkles className="w-4 h-4" /> Responsible AI Mining
</div>
```

---

## Design Tokens Summary

```
Colors:        Gray-900, Gray-700, Gray-600, Gray-500, Green-600
Borders:       1px gray-200
Radius:        lg (8px) or md (6px)
Shadows:       md (small) or lg (large)
Spacing:       4px to 32px (Tailwind scale)
Typography:    font-bold (headings), font-semibold (buttons)
Transitions:   duration-200 (smooth, not too slow)
```

---

## ✅ Design Checklist

Before using any component:
- [ ] Uses gray/white palette, NOT purple/yellow
- [ ] Border radius is md or lg, NOT xl/2xl/3xl
- [ ] Text is professional, NOT playful
- [ ] Icons have purpose, NOT decoration
- [ ] Spacing is consistent (multiples of 4px)
- [ ] Shadows are subtle, NOT heavy
- [ ] Animations are smooth, NOT bouncy
- [ ] Buttons look clickable (not confusing)
- [ ] Affordances are clear (checkmarks = list)

---

**Reference Card Version:** 1.0
**Last Updated:** December 12, 2025
**Status:** ✅ Ready for Use

