# Agency Operations Platform (AOP)

**Register:** product

## Product Purpose

Internal operations tool for a freelance agency that bids on Upwork. Tracks the full lifecycle from a raw lead through delivery: **Bid → Interview → Meeting → Deal → Project → Delivery → QA.** Multi-tenant by Organization so the same install runs multiple agencies.

The core entity is a **Project**, which moves through a defined pipeline:
`DISCOVERED → SCRIPT_REVIEW → UNDER_REVIEW → ASSIGNED → BID_SUBMITTED → VIEWED → MESSAGED → INTERVIEW → WON → IN_PROGRESS → COMPLETED` (with `LOST` / `CANCELLED` as terminal off-ramps).

## Users

Internal staff working inside a single org at a time. Roles, by frequency of dashboard use:

- **Bidders** — scan inbound Upwork jobs, draft bids, submit and track them. Live in Projects and Jobs all day.
- **Closers** — own conversations that progress past first reply, manage meetings, push deals to WON.
- **Developers** — receive WON projects, work tasks through to delivery.
- **QA** — run reviews against deliverables before sign-off.
- **Script writers** — produce scripts for bid messages and follow-ups.
- **Leadership** — read analytics, configure orgs and users, rarely touch operational pages.

Everyone sees a sidebar gated by role. Bidders never see admin pages; leadership rarely touches Tasks.

## Brand & Tone

The platform is internal, but the chosen design voice is **(dot)connect** — a high-contrast, engineering-blueprint aesthetic. Deep ink against a warm off-white canvas, a vivid orange as a singular brand wash, technical blue for interactive accents. Compact, precise typography (AeonikPro). Flat surfaces, no shadows, no glassmorphism. The tone is *measured, authoritative, technical* — not playful, not loud, not corporate-blue.

## Anti-References

- **Salesforce / HubSpot CRM** — bloated, modal-heavy, color-coded chaos.
- **Generic dark SaaS dashboards** — blue gradients, glow effects, neon graphs. The reflexive "dashboard look."
- **Trello / Jira card walls** — colored side-stripe cards, sticky-note pastels.
- **Crypto-style neon-on-black panels** — unrelated to the product, often the AI default.

## Strategic Principles

1. **Operators over executives.** Every page is designed for a bidder/closer/developer doing real work. Numbers and lists beat hero metrics and trend cards.
2. **The Project is the work.** Pipeline state, owner, niche, and last activity should be answerable at a glance from any project surface.
3. **Density is comfort.** Operators look at this all day; they want information, not breathing room. Tight typography, 24px rhythm, no luxury whitespace.
4. **Subtle layering, no shadows.** Hierarchy is built from Vanilla Cream (canvas) → Parchment (cards) → Midnight Ink (action). Never elevation tricks.
5. **One accent, used sparingly.** Orange is a wash, not a UI color. Blue is interactive only. Ink and cream do the heavy lifting.
