# ODForce — Development Phases (v2 — post-pricing-pivot)

This supersedes the original phases.md. Phases 1, 2, 3, and 5 are complete and unchanged. Phase 4 is complete for worker *discovery* but its booking-creation mechanism is being replaced. Old Phase 6 (payment) was never built, so there is nothing to undo there — the pivot slots in cleanly as the new Phase 6 onward.

Build strictly in order. Do not start a phase until the previous one is fully functional and tested per `rules.md`'s testing checklist. Update `memory.md` after every phase, honestly distinguishing "written" from "verified."

## Phase 1 — Foundation + Landing Page — ✅ COMPLETE, VERIFIED
Unchanged. No further action.

## Phase 2 — Authentication (Customer + Worker) — ✅ COMPLETE, VERIFIED
Unchanged. Note: an `admin` role was also added to the User model ahead of schedule during Phase 3 work — keep it, it's used starting Phase 12.

## Phase 3 — Full Worker Registration + Worker Dashboard Shell — ✅ COMPLETE, VERIFIED
Unchanged, including the admin login endpoint and `seed:admin` script built alongside it.
**One change required going forward:** the Worker Registration form's Work Details step currently collects `hourlyCharge`/`fullDayCharge` with a ₹300 minimum. Per the pivot, workers no longer set their own prices — remove these fields from the registration form and from the Worker model. This is a small, contained edit, done as part of Phase 6 below (not a standalone phase).

## Phase 4 — Customer Discovery + Booking Request — ⚠️ PARTIALLY SUPERSEDED
Worker search/filtering and the worker profile page (ratings, reviews, skills display) remain valid and unchanged. **The booking-creation mechanism built in this phase — Hourly/Full-Day selection with a server-calculated amount from the worker's stored rate — is retired** and replaced by the cart-based flow in Phase 6/7 below. Do not delete the worker discovery UI; only the booking-type selector and its amount calculation are replaced.

## Phase 5 — Real-Time Accept/Reject Flow — ✅ COMPLETE, VERIFIED
Unchanged. The Socket.io engine (JWT-authenticated, server-derived rooms, atomic pending-only transitions) is pricing-model-agnostic and needs no changes for the pivot.

## Phase 6 — Service Catalog + Cart-Based Booking *(next phase to build)*
- Build `ServiceCatalog` model; seed it from the provided category price lists (Plumbing, Electrician, AC Service & Repair, Carpenter, Professional Cleaning, and any others available).
- Remove `hourlyCharge`/`fullDayCharge` from the Worker model and from the Worker Registration form's Work Details step.
- Build the category browser: customer picks a skill category → sees the nested service tree with prices → adds items via quantity steppers → cart summary with a running total, held in a `CartContext` so it survives navigation.
- Retire the Hourly/Full-Day selector from the existing Worker Profile Page booking flow.

## Phase 7 — Choose Your Worker + Itemized Request + Payment
- After the cart is built, filter workers by `skills[]` matching the selected category; show worker cards → full profile (ratings/reviews) → "Send Request".
- The request carries the itemized cart, customer location, and a server-calculated total: `sum(selectedServices) + ₹80 inspection fee` (charged exactly once per booking, regardless of item count).
- Reuse the existing Phase 5 accept/reject engine unchanged.
- On acceptance, build the itemized Payment Options page: line items, total, a note that the worker arrives within 20 minutes of payment, Cash on Service (no coupons) and Pay Before (coupon + Razorpay Test Mode, signature-verified server-side) — same underlying payment mechanics originally planned for old Phase 6, now fed by the new amount source.

## Phase 8 — Worker Wallet Core
- Build the `Wallet` model, auto-created with a ₹0 balance on worker registration.
- Build the real Wallet panel in the Worker Dashboard (currently a placeholder), showing balance and transaction history.
- Enforce the ₹300 minimum-balance gate specifically at the moment of **accepting a new Cash-on-Service booking** — never at login/browsing, and never retroactively cancelling existing work.

## Phase 9 — Booking Completion, Confirmation & Settlement
- Add the missing lifecycle transitions: worker marks `confirmed` → `in-progress` on arrival, then `work-completed-pending-confirmation` when done; customer sees a verification prompt and taps "Confirm Completion" → `completed`.
- Settlement fires automatically on confirmation: Cash bookings **deduct** the platform fee from the wallet; Pay Before bookings **credit** `totalAmount − platform fee` to the wallet.
- Build withdrawal, blocked while the worker has any booking in `in-progress` or `work-completed-pending-confirmation`.
- **Before building this phase**, the exact `PLATFORM_FEE_PERCENT` (or flat fee) must be decided — it is currently a placeholder in `architecture.md`.

## Phase 10 — Reviews, Analytics, Settings, Theme
- Review submission tied to `completed` bookings; worker's average rating recomputes.
- Analytics panel computed from real Booking/Wallet data (total/completed/rejected jobs, income stats, monthly performance).
- Settings panel (change password, notification/privacy preferences).
- Real light/dark theme toggle.

## Phase 11 — Polish + Deployment
Full responsive/UI consistency pass, language switcher fully functional, production deployment (MongoDB Atlas → Render backend → Vercel frontend), CORS locked to the real production domain, environment variables set on hosting platforms only.

## Phase 12+ — Admin Dashboard & Dispute Resolution *(deliberately deferred)*
The admin role, login, and seed mechanism already exist (built ahead of schedule in Phase 3). Full dispute-mediation tooling (investigation view, additional-work approval flow, resolution actions) is designed for later, after the core booking/payment/wallet loop has been running and proven. The `Booking` status enum already has room for a future `disputed` state without rework.

---

### Notes for whichever AI model is executing this plan
- Confirm the actual current state of the codebase against this plan before continuing — check `memory.md`'s real Update Log, and spot-check the files themselves, especially anything this document marks as "superseded" or "removed." A feature description in a planning doc is not proof it's been changed in code yet.
- When reworking Phase 4's booking-creation code in Phase 6, do not touch the worker-discovery/search code that's confirmed working — isolate the change to booking creation and the pricing source only.
- Do not skip ahead to a later phase's features while earlier phases have unresolved placeholders, unless explicitly asked to.