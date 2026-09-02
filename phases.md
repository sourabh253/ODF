# ODForce — Development Phases

Build strictly in this order. Do not start a phase until the previous one is fully functional and tested per `rules.md`'s testing checklist. After finishing each phase, update `memory.md` before stopping.

## Phase 1 — Foundation + Landing Page
Project skeleton (client + server per `architecture.md`), MongoDB Atlas connected, Express server running, fully responsive Landing Page (Navbar with ODF logo, "ODF for Job" button, Help, Language selector, Profile icon; Hero, About, Service Categories using the canonical skill list, Why Choose Us, How It Works, Testimonials, FAQ, Footer). No auth logic yet — buttons are wired to open the right modal/route shell but backend auth isn't built yet.

## Phase 2 — Authentication (Customer + Worker)
Full JWT auth: Customer Auth Modal (Sign In / Register with live-location capture), Worker Portal page with Worker Sign In / Register (basic fields only — full profile form is Phase 3). No OTP. Passwords hashed. AuthContext + ProtectedRoute wired, role-based route protection. Session persists across refresh.

## Phase 3 — Full Worker Registration + Worker Dashboard Shell
Multi-step Worker Registration (skills-first, then personal/location/work details/identity & bank/review), Cloudinary photo/document upload. Worker Dashboard built as a single page with sidebar panel-switching. Profile panel fully functional. Availability toggle (Duty ON/OFF) wired to DB. Other panels (Settings, Theme, Wallet, Analytics, Work Requests, Ratings) are placeholders at the end of this phase only — flagged as `NOT DONE — Phase X` in `memory.md` if not yet built.

## Phase 4 — Customer Discovery + Booking Request
Customer Dashboard: 3-part search bar (live location, skill, search button), Worker Card grid, full Worker Profile Page with Hourly/Full-Day booking selector. Sending a request creates a `pending` Booking with server-calculated `estimatedPayment`. No payment UI yet.

## Phase 5 — Real-Time Accept/Reject Flow
Socket.io wired both directions. Worker's Work Requests panel shows live incoming requests with Accept/Reject. Customer's booking state updates live on accept/reject, and is also re-verified via API on page refresh (not socket-only). No double-accept/reject possible.

## Phase 6 — Payments + Booking Dashboard
Payment Options page (reachable only after acceptance): Cash on Service (instant confirm, zero coupon/offer UI) and Pay Before (Booking Summary + Coupon validation + Offers + Razorpay Test Mode checkout with server-side signature verification). Booking Dashboard with Current/Previous/Completed/Cancelled tabs pulling real data.

## Phase 7 — Booking Lifecycle Completion + Wallet + Reviews + Analytics + Settings
- Booking lifecycle completion: a way for the worker to mark a confirmed job as `in-progress`/`completed`, and for the customer to cancel before it starts.
- Wallet panel: real balance, today/weekly/monthly earnings, transaction history, minimum ₹300 notice — credited automatically when a booking is marked completed.
- Review flow: customer can rate/comment after a booking reaches `completed`; worker's average rating recomputes.
- Analytics panel: total/completed/rejected jobs, average rating, monthly performance, income stats — computed from real Booking/Review data.
- Settings panel: change password, notification/privacy preferences, logout.
- Theme toggle: real light/dark mode.

## Phase 8 — Polish + Deployment
Full responsive/UI consistency pass across every page and panel. Language switcher verified functional for all key strings. Production deployment: MongoDB Atlas (already set up) → backend to Render → frontend to Vercel, with CORS locked to the real frontend domain and environment variables set on both hosting platforms (never committed to the repo).

---

### Notes for whichever AI model is executing this plan
- Confirm the actual current state of the codebase against this plan before continuing — do not assume a phase is complete just because it's listed here as done in `memory.md`; spot-check the real files first, especially routing/wiring between frontend pages and backend endpoints (this project has previously stalled exactly here — see `memory.md` history if present).
- Do not skip ahead to a later phase's features while earlier phases have unresolved placeholders, unless the user explicitly asks for that specific feature out of order.
