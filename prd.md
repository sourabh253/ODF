# ODForce — Product Requirements Document (PRD)

## 1. Vision
ODForce ("On Demand Force") is a web platform connecting **customers** with **skilled and unskilled workers** (electricians, plumbers, cleaners, etc.) for on-demand hourly or full-day hire. It replaces informal, middleman-driven local hiring with a centralized, trustworthy, instant-booking platform.

## 2. Target Users
- **Customers**: individuals/households needing home services on demand — urgent repairs, scheduled upkeep, or one-off jobs.
- **Workers**: skilled/unskilled laborers (electricians, plumbers, carpenters, cleaners, drivers, etc.) looking for steady, direct-to-customer work without a middleman.

There are only **two roles** in this system: Customer and Worker. No admin panel is required in v1 unless explicitly requested later.

## 3. Core Value Proposition
- Customers get verified, rated workers matched to their exact need and location, with transparent pricing.
- Workers get direct bookings, fair pay, and control over their own availability and rates — no commission-hungry middleman.
- Trust is built through ratings, verified profiles, and a clear accept/reject/payment flow that protects both sides.

## 4. Core Features (v1 scope)

### Customer-facing
- Browse/search available workers by skill and location
- View full worker profiles (skills, experience, charges, ratings, reviews)
- Send a booking request (Hourly or Full-Day) — no payment until the worker accepts
- Real-time notification when a worker accepts/rejects
- Two payment paths once accepted: **Cash on Service** (no coupons) or **Pay Before** (coupons/offers + real UPI checkout)
- Booking Dashboard: current, previous, completed, cancelled bookings
- Leave a rating/review after job completion
- Multi-language UI (Hindi, English, Marathi, Telugu, Tamil, Malayalam, Gujarati)
- Live-location-aware search

### Worker-facing
- Multi-step registration: skills-first, then personal info, location, work details, identity & bank details, terms agreement
- No OTP verification anywhere
- Single-page dashboard (sidebar panels, not routed pages): Profile, Settings, Theme, Wallet/Earnings, Analytics, Work Requests/Bookings, Availability toggle (Duty ON/OFF), Notifications, Ratings
- Accept/Reject incoming booking requests in real time
- View earnings, transaction history, and per-job ratings

### Platform-wide
- JWT-based authentication, separate flows for Customer and Worker
- Real-time updates (booking requests, accept/reject) via Socket.io
- Help/FAQ section
- Language switcher (functional, not decorative)

## 5. Skill Categories (canonical list — use exactly these across the app)
Home Cleaning, Electrician, Plumber, Carpenter, AC Service & Repair, Pest Control, Gardening & Landscaping, Painter, Water Tank Cleaning, Housekeeping Staff, Car Wash & Detailing, Laundry & Dry Cleaning, Maid Services, CCTV Installation & Maintenance, RO/Water Purifier Service, Refrigerator Repair, Washing Machine Repair

## 6. Critical Business Rules (never violate these)
- A customer **cannot** pay before the worker accepts the booking request.
- **Cash on Service never shows coupons or offers.** Coupons/offers exist only in Pay Before.
- No OTP verification anywhere in registration/login.
- Minimum job charge on the platform is **₹300** (enforced on worker's hourly charge).
- Worker Dashboard is a single page with panel-switching via state — not multiple routes.
- Customer side can use normal routed pages.

## 7. Out of Scope (v1)
- Admin panel / dispute resolution tooling
- Native mobile apps (web-responsive only)
- Multi-currency support
- Full real-money production payments (build against Razorpay **Test Mode** only)
- Full translation of every UI string (language switcher must be functional for key strings; exhaustive i18n coverage is a stretch goal, not a blocker)

## 8. Success Criteria for v1
- A customer can register, search, book, get accepted, pay (either path), and see the booking in their dashboard — end to end, no dead ends.
- A worker can register, go live (Duty ON), receive a request in real time, accept/reject it, get paid, and see it reflected in Wallet/Analytics.
- No page or button in the app is a placeholder or a dead click in the final delivered state.
