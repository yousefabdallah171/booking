# DESIGN.md — Refined Cairo Design System

> **Format**: [impeccable.style](https://impeccable.style/) — a structured design system
> doc that keeps AI-generated UI consistent across sessions and contributors.
>
> This file is the single source of truth for the visual language of this product.
> **Reference it before generating any UI component, page, or screen.**

---

## Aesthetic Direction

**Name**: Refined Cairo
**Tone**: Premium, professional, modern — confident and approachable
**Inspiration**: Cairo's blend of tech modernity and cultural depth
**Brand**: Yousef Abdallah — personal professional brand (YA mark)

The product should feel like a high-end personal brand, not a generic SaaS.
Every screen must communicate trustworthiness, clarity, and expertise.

---

## Logo

`frontend/src/components/shared/Logo.tsx` — renders inline SVG.
- **Mark**: bordered rounded-square with "YA" — always `var(--color-brand)` (never recolored)
- **Wordmark**: "Yousef" — `currentColor` (adapts to light/dark)
- **Subtext**: "ABDALLAH" — `currentColor` at 38% opacity (muted)
- Font: Syne 800 in SVG

**Usage**: Import `<Logo />` for nav bars, footers, auth pages. Never stretch or recolor the YA mark.

---

## Color System

### Brand Tokens (oklch — raw, for gradients & glow effects)

```css
--color-brand:        oklch(.86 .22 128)   /* vibrant lime-green, primary brand */
--color-brand-hover:  oklch(.91 .2  128)   /* lighter on hover */
--color-brand-muted:  color-mix(in oklab, var(--color-brand) 18%, var(--color-surface))
--color-brand-text:   oklch(.83 .18 128)   /* slightly darker for text */
--color-brand-accent: oklch(.78 .15 205)   /* teal complement */
--color-brand-glow:   color-mix(in oklab, var(--color-brand) 22%, transparent)
--gradient-brand:     linear-gradient(135deg, var(--color-brand) 0%, oklch(.77 .2 128) 100%)
```

### Page Background Gradient

Applied to `body` — do NOT override on individual pages:
```css
background:
  radial-gradient(
    circle at 50% -10%,
    color-mix(in oklab, var(--color-brand) 10%, transparent),
    transparent 28rem
  ),
  linear-gradient(
    180deg,
    color-mix(in oklab, var(--color-surface) 82%, var(--color-page)),
    var(--color-page)
  );
```

### Surface Tokens

| Token | Light | Dark |
|---|---|---|
| `--color-page` | `oklch(.97 .006 95)` | `oklch(.10 .016 265)` |
| `--color-surface` | `oklch(.93 .008 95)` | `oklch(.15 .013 265)` |
| `--color-text-primary` | `oklch(.14 .015 265)` | `oklch(.93 .010 90)` |

### shadcn/ui HSL Tokens — Light Mode

```
--background:           45 25% 97%    /* warm white */
--foreground:           230 20% 12%   /* dark navy text */
--card:                 45 20% 94%
--primary:              92 57% 46%    /* brand green (darkened for contrast on light) */
--primary-foreground:   230 20% 5%
--secondary:            230 12% 93%
--muted:                45 15% 91%
--muted-foreground:     230 10% 46%
--accent:               197 42% 48%   /* teal accent */
--border:               230 12% 87%
--ring:                 92 57% 46%
--radius:               0.625rem
```

### shadcn/ui HSL Tokens — Dark Mode

```
--background:           230 20% 8%    /* dark navy */
--foreground:           45 20% 92%    /* warm off-white */
--card:                 230 18% 11%
--primary:              92 65% 62%    /* full-brightness brand green */
--primary-foreground:   230 20% 5%
--secondary:            230 15% 16%
--muted:                230 15% 14%
--muted-foreground:     230 10% 55%
--accent:               197 45% 58%   /* teal accent */
--border:               230 15% 19%
--ring:                 92 65% 62%
```

---

## Typography

### Font Stack

| Role | Font | Variable | Fallback |
|---|---|---|---|
| Display / Headings | DM Serif Display | `--font-display` | Georgia, serif |
| Body English | IBM Plex Sans | `--font-body` | system-ui, sans-serif |
| Body Arabic | **Cairo** | `--font-arabic` | sans-serif |
| Logo / Mark | Syne 800 | (inline SVG) | sans-serif |

### Usage Rules
- Headings: `DM Serif Display`, weight 400. Never bold headings in English.
- Arabic headings: `Cairo`, weight 700 — Cairo is designed for bold Arabic
- Body: IBM Plex Sans (en) / Cairo (ar), weight 400–600
- All Arabic text: always `dir="rtl"` on the nearest block container

---

## Spacing

8px base grid. Multiples: 4, 8, 12, 16, 24, 32, 48, 64, 96px.

---

## Elevation & Surfaces

- **Level 0**: `bg-background` — page canvas (gradient applied by body)
- **Level 1**: `bg-card border border-border` — cards
- **Level 2**: `bg-card shadow-lg` — dialogs
- **Level 3**: `bg-popover shadow-xl` — dropdowns

Shadows: subtle. Dark mode — use `shadow-black/50`. No harsh `box-shadow: 0 0 0 black`.

Brand glow utility: `glow-brand` → `box-shadow: 0 0 24px var(--color-brand-glow)`.

---

## Motion

- Entrance: `animate-fade-in` — 220ms ease-out with `translateY(4px)` start
- Staggered list: `animate-fade-in-stagger` on parent
- Hover: `transition-all duration-150`
- No bounce, no spring physics. Elegant deceleration only.

---

## RTL Support

- Tailwind `rtl:` variants for directional spacing
- CSS logical properties (`padding-inline-start` not `padding-left`)
- Directional icons flip: `rtl:scale-x-[-1]`
- Always `text-start` not `text-left`
- `dir` on `<html>`: `"rtl"` for Arabic, `"ltr"` for English
- Cairo font handles Arabic shaping automatically — no manual letter-spacing on Arabic

---

## Component Conventions

### Buttons
- Primary: `bg-primary text-primary-foreground hover:bg-primary/90`
- Padding: `px-4 py-2` — rounded: `rounded-md`
- Focus: `ring-2 ring-ring ring-offset-2`
- Brand glow on CTA buttons: add `glow-brand` class

### Cards
- `bg-card text-card-foreground rounded-lg border border-border`
- Hover: `hover:border-primary/40`

### Inputs
- `bg-input border border-input rounded-md px-3 py-2`
- Error state: `border-destructive`
- Static labels above inputs — no floating labels

### Status Badges
- PENDING: muted colors
- CONFIRMED: `bg-primary/10 text-primary border border-primary/30`
- FAILED: destructive

### Nav Bar
- Contains: `<Logo />` on the start side, `<LanguageToggle />` + `<ThemeToggle />` on the end side
- RTL: Logo on right, toggles on left

---

## Anti-Patterns (NEVER DO)

- ❌ Recolor or stretch the YA mark in the logo
- ❌ Override the body background gradient on individual pages
- ❌ Purple gradients anywhere
- ❌ Inter, Roboto, Arial as heading fonts
- ❌ Multiple competing accent colors
- ❌ Noto Naskh Arabic (replaced by Cairo — do not reintroduce)
- ❌ Hard drop-shadows (`rgba(0,0,0,0.5)`)
- ❌ `text-left` (use `text-start`)
- ❌ Full-width buttons on desktop
- ❌ Generic "Submit" button labels
- ❌ Toasts in bottom-right (use top-center for RTL compat)
