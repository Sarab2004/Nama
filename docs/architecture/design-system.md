# Design system

## Source of truth

Public frontend visuals are driven by:

`src/styles/nama-design-tokens.css`

This file owns brand palette, light/dark semantic tokens, shared radius/motion/focus values, and component-oriented aliases (`--button-*`, `--card-*`, `--footer-*`, etc.).

`src/app/(frontend)/globals.css` imports those tokens and bridges them into the existing Tailwind v4 / shadcn semantic variables (`--background`, `--foreground`, `--primary-foreground`, …) so utilities like `bg-primary`, `text-muted-foreground`, and `border-border` resolve to Nama tokens without a second palette.

## Brand colors

| Role | Token | Usage |
| --- | --- | --- |
| Primary | Burgundy / `--brand-red-*` → `--primary` | Main CTAs, links, focus emphasis (~20%) |
| Accent | Olive gold / `--brand-olive-*` → `--accent` | Sparse highlights, list bullets, accent buttons (~10%) |
| Neutral | Warm neutrals / `--neutral-*` | Page surfaces and text (~70%) |

Do not hardcode hex/rgb values in public UI components. Prefer semantic tokens (`--text`, `--border`, `--primary`, …) or Tailwind classes that map to them.

## Theme

- Attribute: `data-theme="light" | "dark"` on `html` (and scoped overrides on sections such as heroes).
- Persistence key: `localStorage.nama-theme` (`light` | `dark` | `auto`). Legacy `payload-theme` is migrated on read.
- Init script: `InitTheme` runs before paint to avoid theme flash.
- Auto mode follows `prefers-color-scheme` and updates on system change.
- Existing `ThemeSelector` remains the control; it is available in Header and Footer.

Payload Admin is out of scope and does not import the frontend token bridge.

## Typography

- Persian: Vazirmatn via `next/font/google` (`--font-vazirmatn`), with Peyda local files as fallback.
- English: Inter via `next/font/google` (`--font-inter`).
- Body line-height targets Persian readability (`1.85` from tokens).
- Rich text / prose colors map to Nama text/link/divider tokens in `tailwind.config.mjs`.

## Layout

- Content max width: `--container` → `--container-lg` (`1180px`).
- `.container` utility uses that token with responsive horizontal padding.

## Components

Reuse existing primitives; style through tokens:

- Buttons (`src/components/ui/button.tsx`) — primary / outline / accent / ghost / destructive
- Cards — `.nama-card` + `src/components/ui/card.tsx`
- Inputs / textareas — input token borders and focus ring
- Header — `.site-header` (`--header-bg`)
- Footer — `.site-footer` (`--footer-*`)
- Services cards / sections — `.nama-card`

## Motion and accessibility

- Durations/easing: `--duration-*`, `--ease-*`
- Focus: `--focus-ring`, `--focus-width`, `--focus-offset`
- `prefers-reduced-motion` is honored in tokens and hover transforms use `motion-safe:` where relevant
- Target WCAG AA contrast for primary (white on burgundy) and accent (dark on olive)

## Adding new UI

1. Use semantic tokens or bridged Tailwind classes.
2. Do not introduce a parallel CSS theme or UI library.
3. Keep Accent usage sparse.
4. Verify light + dark + RTL + keyboard focus.
