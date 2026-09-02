# ODForce — Design System

## 1. Design Principles
- Must look like a real commercial platform, not a college project — clean, confident, modern.
- Consistent spacing, consistent component styling, consistent color usage across every page and panel — no page should feel like it came from a different app.
- Desktop/web-first (primary target: 1440px and 1280px viewports), responsive enough not to break at tablet widths (768px+), but mobile-native polish is a secondary concern.
- Subtle depth over flat design: soft shadows, gentle hover states, rounded corners — avoid harsh borders or pure flat blocks.

## 2. Color Palette
Define one primary brand color, a neutral gray scale, and one accent color — apply consistently, do not introduce new colors per page.

| Role | Suggested value | Usage |
|---|---|---|
| Primary (brand) | Deep teal/forest green (e.g. `#0F5132` – `#15803D` range) | Primary buttons, active states, links, brand accents |
| Primary hover/dark | A darker shade of the primary | Button hover states, active nav items |
| Secondary/Ink | Near-black slate (e.g. `#0F172A`) | Headlines, dark surfaces (hero cards, dark sections) |
| Neutral grays | Tailwind's `slate` scale | Body text, borders, backgrounds, muted UI |
| Success | Green (`#16A34A`) | Confirmed bookings, accepted status, positive states |
| Warning | Amber (`#D97706`) | Pending status, cautionary notices |
| Danger | Red (`#DC2626`) | Rejected/cancelled status, destructive actions, form errors |
| Surface/background | White / very light slate (`#F8FAFC`) | Page backgrounds, card surfaces |

Dark mode (for the Worker Dashboard theme toggle): invert surfaces to slate-900/950 range, keep the same brand primary color for continuity, ensure text contrast meets accessibility standards (WCAG AA minimum).

## 3. Typography
- Use a clean, modern sans-serif pairing: one slightly more distinctive font for headings (e.g. a geometric or semi-condensed sans), one highly legible workhorse font for body text (e.g. Inter, or system-ui fallback stack).
- Establish a clear type scale and use it consistently:
  - Hero headline: largest, bold/black weight
  - Section headings: large, semibold
  - Card titles: medium, semibold
  - Body text: regular weight, comfortable line-height (1.5–1.6)
  - Small/meta text (timestamps, labels): smaller size, muted color, letter-spacing for uppercase labels (e.g. section eyebrows, status badges)

## 4. Spacing & Layout
- Use a consistent spacing scale (Tailwind's default 4px-based scale is fine) — don't mix arbitrary pixel values.
- Page content max-width: `max-w-7xl` (or similar), centered, with consistent horizontal padding (`px-6 lg:px-8`) — this was a real bug encountered before (full-bleed hero causing oversized/broken proportions) — always wrap section content in a constrained container.
- Consistent vertical rhythm between sections (e.g. `py-20`/`py-24` per major landing page section).

## 5. Components
- **Buttons**: primary (filled, brand color), secondary (outlined), and text/link style — consistent border-radius (fully rounded/pill or consistent rounded-lg, pick one and use everywhere), subtle hover/active states, disabled state clearly distinguished (opacity + no pointer).
- **Cards**: consistent border-radius, soft shadow, consistent internal padding — used for worker cards, service category cards, testimonial cards, dashboard panel cards.
- **Modals**: centered, dark overlay behind, close (X) button top-right, consistent padding and max-width, smooth open/close (no jarring pop-in).
- **Status badges**: pill-shaped, color-coded per status (pending = amber, accepted/confirmed = green, rejected/cancelled = red, completed = slate/primary).
- **Forms**: consistent input styling (rounded, subtle border, clear focus state), inline validation messages in the danger color, labels always visible (not placeholder-only).
- **Sidebar (Worker Dashboard)**: fixed-width, icon + label per item, clear active-state highlight, Duty ON/OFF toggle visually prominent (not sidebar-buried) with a green/gray state distinction.

## 6. Iconography
Use `lucide-react` exclusively for icons — do not mix icon libraries, for visual consistency.

## 7. Imagery
No external stock photography required — use CSS-based illustrations/compositions, icon-based visuals, or simple SVG graphics consistent with the brand palette. Avoid generic stock-photo aesthetics.

## 8. Accessibility Baseline
- Sufficient color contrast for text on all backgrounds (check brand primary on white, and white text on brand primary).
- All interactive elements reachable/operable via keyboard.
- Form inputs have associated labels, not just placeholder text.
