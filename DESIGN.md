# Design System — (dot)connect for AOP

A high-contrast digital-blueprint aesthetic adapted to an internal operations dashboard. Light theme only.

## Colors

| Token | Value | Role |
|---|---|---|
| `--ink` | `#001011` | Primary text, filled-action background, strong borders |
| `--storm` | `#0f1e1f` | Secondary text, muted borders, badge text |
| `--blue` | `#007aff` | Outlined-button borders/text, interactive accents, focus rings |
| `--orange` | `#fd5321` | Singular wash for decorative bands, hero accents. Never a UI fill, never text. |
| `--cream` | `#fcfbf8` | Page canvas, button text, icon surfaces |
| `--parchment` | `#ededea` | Card and secondary-surface fill |
| `--mist` | `#c1c4c2` | Subtle borders, dividers |

**Strategy:** Restrained. Cream canvas + Parchment cards + Ink ink. Blue only on interactive accents. Orange is rare and intentional — never for primary CTAs.

**Status colors** (operational necessity, not in the original spec):
- success → derived from `--ink` with a green tint at chroma 0.07; used for badge fills only
- warning → `--orange` (the brand orange does double duty)
- destructive → a deep red kept off the brand palette: `#a8261b`

## Typography

**Primary:** AeonikPro Regular (400, 500). Loaded via `db.onlinewebfonts.com` CDN. Fallback: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.

**Secondary:** DotConnect for display headings. Optional, used only on auth and headline surfaces.

### Scale

| Token | Size | Line height | Tracking |
|---|---|---|---|
| `text-caption` | 16px | 1.5 | 0.01em |
| `text-body-sm` | 18px | 1.4 | 0.01em |
| `text-body` | 21px | 1.4 | -0.012em |
| `text-subheading` | 24px | 1.1 | -0.012em |
| `text-heading-sm` | 32px | 1.1 | -0.02em |
| `text-heading` | 36px | 1.1 | -0.02em |
| `text-heading-lg` | 72px | 0.9 | -0.025em |
| `text-display` | 101px | 0.8 | -0.025em |

OpenType features: `"dlig", "ss02", "ss08"` on all text.

## Surfaces

| Level | Color | Use |
|---|---|---|
| 0 | Vanilla Cream `#fcfbf8` | Page canvas |
| 1 | Parchment `#ededea` | Cards, sidebar, secondary surfaces |
| 2 | Goldenrod Orange `#fd5321` | Hero washes, decorative bands (used sparingly) |
| 3 | Midnight Ink `#001011` | Filled actions, hero ink panels |

## Shape

- **Cards:** 20px radius
- **Buttons:** 24px radius (pill-ish on small text)
- **Badges:** 8px radius
- **Inputs:** 12px radius
- **Decorative blocks:** 48px radius

No drop shadows. Hierarchy is by surface, not elevation.

## Spacing

8px base. Scale: 8, 16, 24, 32, 48, 64, 72, 80, 96, 160.

- Section gap: 48px
- Card padding: 24px (32px for marketing-style offer cards)
- Element gap: 24px

## Components

### Filled Brand Button
Background: Midnight Ink. Text: Vanilla Cream. Radius: 24px. Padding: 13px / 24px. AeonikPro 16px. Hover: ink lifts to `color-mix(in oklch, var(--ink) 90%, var(--cream))`.

### Outlined Accent Button
Background: transparent. Border: 1px Accent Blue. Text: Accent Blue. Radius: 24px. Padding: 13px / 24px. Hover: fills with `color-mix(in oklch, var(--blue) 8%, transparent)`.

### Offer Card (marketing-grade)
Parchment background, 20px radius, 32px padding. No shadow.

### Feature Card (dashboard-grade)
Parchment background, 20px radius, 24px padding. No shadow. The default for dashboard content.

### Status Badge
Background: `rgba(252, 251, 248, 0.8)` (translucent cream). Text: Storm Gray. Radius: 8px. Padding: 4px / 16px. AeonikPro 16px.

### Navigation Link
Text: Midnight Ink. Inactive: plain. Active: thin underline below baseline (uses AeonikPro ligatures + a 1px Ink underline).

## Motion

- Ease-out-quart / ease-out-expo, never bounce.
- Don't animate layout properties.
- Default duration: 200ms. Sheet/dialog: 240ms.

## Bans (project-specific, in addition to the shared impeccable laws)

- No side-stripe colored borders on cards (Kanban included — color status via badge, not stripe).
- No glow shadows. No `box-shadow` larger than `0 0 0 1px var(--mist)` for focus rings.
- No gradient backgrounds. The brand is flat.
- Goldenrod Orange is never used as text or as a primary fill on UI controls.
- No dark mode. The theme is light. Period.
