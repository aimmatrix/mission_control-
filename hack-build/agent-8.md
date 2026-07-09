# Agent 8 — Theme & mobile polish

**Product (one line):** Mission Control — a mobile-first web app that risk-scores PRs from autonomous coding agents and lets a human approve/reject them from a phone.
**Your mission:** the global dark control-room feel and phone ergonomics — the demo happens on a real phone screen, recorded. Global CSS, icons, and web-app metadata only; you never edit components.

## Files you OWN (create/edit only these)
- `app/globals.css`
- `app/manifest.ts` (new — Next.js MetadataRoute.Manifest)
- `public/**` (icons, favicon assets)

## NEVER touch
- `tailwind.config.ts` (design tokens are LOCKED: `ctrl-bg #0a0f14`, `ctrl-panel #111823`, `ctrl-line #1f2a36`, `ctrl-fg #e6edf3`, `ctrl-dim #8b98a5`, `risk-low #34d399`, `risk-medium #fbbf24`, `risk-high #f87171`)
- `app/layout.tsx`, `app/page.tsx`, all other `app/**` files, `components/**`, `lib/**`, `fixtures/**`, `package.json`

## What to build (globals.css — additive, keep the existing rules)
- Base typography rhythm; `text-wrap: balance` on headings; a thin custom scrollbar.
- Focus-visible rings in the risk-green accent; smooth scrolling for the `#queue` anchor.
- Safe-area padding for notched phones (`env(safe-area-inset-*)`) on body/header offsets via utility classes.
- Subtle control-room texture: a faint radial glow or scanline-free gradient on the body background (CSS only — must not tank scroll perf).
- A `@keyframes` pulse utility class (e.g. `.pulse-dot`) other streams can adopt for "live" indicators — define it here; do NOT edit their files to apply it.
- Reduced-motion media query disabling the pulse.

## Manifest & icons
- `app/manifest.ts`: name "Mission Control", `display: "standalone"`, `background_color`/`theme_color: "#0a0f14"`, icons.
- Generate simple icons into `public/` (a green dot on `#0a0f14` is fine — script or hand-made SVG→PNG; **no new npm deps in package.json**).

## Definition of Done
- Site feels native on a phone: no white flash, no horizontal scroll at 390px, safe areas respected, add-to-homescreen shows the right name/color.
- Smoke test: `npm run build` passes; Lighthouse mobile run has no layout-shift regressions from your CSS.

## If you need a change to a locked/shared file
STOP and ask the human. Do not edit `tailwind.config.ts`, `app/layout.tsx`, `package.json`, or another agent's files.
