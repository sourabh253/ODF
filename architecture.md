# ODForce — Architecture Document (v2 — post-pricing-pivot)

This supersedes the original architecture.md. The core change: worker-set Hourly/Full-Day pricing is retired in favor of a centralized, fixed-price Service Catalog with cart-style selection. Everything else built in Phases 1, 2, 3, and 5 is unchanged and stays as-is.

## 1. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React (Vite) + Tailwind CSS + React Router v6 | Fast dev loop, utility-first styling, standard routing |
| Icons | lucide-react | Consistent icon set |
| Backend | Node.js + Express.js | Same language as frontend, huge ecosystem, easy free deployment |
| Database | MongoDB Atlas (Mongoose ODM) | Flexible schema fits fast-evolving worker/booking data; free tier |
| Auth | JWT + bcrypt | Stateless sessions, no OTP per spec. Now includes a third role: `admin` |
| Real-time | Socket.io | Live booking request / accept / reject / completion updates, JWT-authenticated, per-user rooms (`user:<id>`) |
| Image/File uploads | Cloudinary | Free tier, CDN-hosted, no server disk storage needed |
| Payments | Razorpay (Test Mode) | UPI-first, Indian market, full sandbox for demo-safe testing |
| Frontend hosting | Vercel | Free, auto-deploy from GitHub |
| Backend hosting | Render (or Railway) | Free tier, auto-deploy from GitHub |

## 2. High-Level App Flow (updated)

```
Visitor → Landing Page ("/")
   ├── "ODF for Job" → Worker Portal → Worker Sign In/Register → Worker Dashboard
   └── Profile icon → Customer Auth Modal → Customer Dashboard ("/dashboard")

Customer Dashboard → Select a skill category → Browse Service Catalog (nested tree)
   → Add services with quantity steppers → Cart Summary → "Done"
   → Choose Your Worker (filtered by category) → Worker profile (ratings/reviews) → Send Request
   → [pending]  (request carries itemized cart + customer location + server-calculated total)

Worker Dashboard → Work Requests panel (live via Socket.io) → Accept / Reject
   ├── Reject → Customer notified live → booking ends
   └── Accept → Customer notified live → Payment Options unlocked
       ├── Cash on Service → booking confirmed instantly (no coupons)
       └── Pay Before → Coupon/Offers → Razorpay Test Checkout → booking confirmed
   (Total shown = sum of selected services + flat ₹80 inspection fee, always exactly once per booking)

Worker marks job "in-progress" on arrival → "Work Completed" →
Customer sees verification prompt → Customer "Confirm Completion" →
  Booking → completed → Settlement fires automatically:
    Cash booking   → platform fee DEDUCTED from worker's Wallet
    Pay Before     → (amount actually collected − platform fee) CREDITED to worker's Wallet
  → Customer can leave a Review → Worker's rating/analytics recompute

Worker Wallet → Withdraw → blocked while any booking is in-progress
   or work-completed-pending-confirmation for that worker
```

## 3. Request Routing (backend)

```
/api/auth/*      → auth routes (register/login for customer + worker + admin, /me)
/api/catalog/*   → service catalog browsing (nested category trees, prices).
                   READ routes (main-categories, categories, tree, subcategories,
                   services, search, service/:id) are PUBLIC — the landing page,
                   navbar search and category browsing must work for anonymous
                   visitors. Only /api/catalog/admin/* (CRUD) stays behind
                   protect + authorize('admin'). [Changed 2026-09-25 for the
                   marketplace UI retouch; 2 E2E checks updated to match.]
/api/customers/* → worker discovery, worker profile views (unchanged)
/api/worker/*    → worker profile CRUD, availability, analytics (pricing fields removed)
/api/bookings/*  → booking lifecycle: create (cart-based), accept, reject, start, complete,
                   confirm-completion, cancel, list — status enum expanded (see §6);
                   POST /simulate-payment is the LIVE Pay Before checkout (server
                   recalculates coupon + total, marks paid, confirms the booking)
/api/payments/*  → coupon validation, Razorpay order creation, payment verification
                   (Razorpay endpoints kept for later; no gateway account is in use yet)
/api/wallet/*    → NEW: worker wallet balance, transaction history, withdrawal
/api/reviews/*   → review submission
/api/upload      → Cloudinary file upload (photos, ID docs)
/api/admin/*     → admin login already implemented (Phase 3 addition); dispute/management
                   endpoints deferred to a later phase

Socket.io: JWT-authenticated connections, server-derived room per user (user:<id>),
not a client-declared join. Events: new_booking_request, booking_accepted, booking_rejected,
and (new, Phase 9) work_completed / booking_confirmed for the completion handshake.
```

Note: CORS and Socket.io origin config must allow **both** `http://localhost:5173` and `http://127.0.0.1:5173` — a real mismatch was hit and fixed during Phase 3 (browser used `127.0.0.1`, server only allowed `localhost`). Keep both in the allowed-origins array going forward, not a single string.

## 4. Folder Structure (additions marked NEW)

```
odforce/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # Navbar (search+location+cart), Footer, LocationSelector, ProtectedRoute
│   │   │   ├── search/        # GlobalServiceSearch (debounced navbar/hero search, suggestions)
│   │   │   ├── catalog/       # ServiceCard, ServiceCarousel, CategorySection, CategoryTile,
│   │   │   │                  # SectionHeader, Skeletons (NEW, shared by landing + catalog + dashboard)
│   │   │   ├── landing/       # HeroSection, PopularServices (NEW)
│   │   │   ├── cart/          # CartDrawer (navbar cart panel over CartContext) (NEW)
│   │   │   ├── auth/          # CustomerAuthModal, WorkerLoginModal, WorkerRegisterFlow
│   │   │   ├── worker/        # WorkerProfileSetup, WorkerDashboard, WorkRequestsPanel,
│   │   │   │                  # WalletPanel (NEW), ActiveJobsPanel (NEW), Settings, Analytics, Ratings
│   │   │   └── customer/      # CategoryBrowser (NEW), CartSummary (NEW), WorkerSelection (NEW),
│   │   │                      # WorkerProfileView, PaymentOptions, PayBefore
│   │   ├── data/              # serviceImages.js — central image map, all URLs HTTP-200 verified (NEW)
│   │   ├── hooks/             # useDebounce (NEW)
│   │   ├── utils/             # catalogLinks, catalogTree (flatten/group/popular pick) (NEW)
│   │   ├── pages/
│   │   ├── context/           # AuthContext, SocketContext, ThemeContext, LanguageContext, CartContext (NEW)
│   │   ├── services/          # authService, catalogService (NEW), workerService, customerService,
│   │   │                      # bookingService, paymentService, walletService (NEW)
│   │   ├── i18n/
│   │   └── App.jsx
│
├── server/
│   ├── config/                # db.js, cloudinary.js, razorpay.js
│   ├── models/                # User (role: customer|worker|admin), Worker (pricing fields REMOVED),
│   │                          # Booking (restructured, see §6), ServiceCatalog (NEW), Wallet (NEW),
│   │                          # Review, Notification, Coupon
│   ├── controllers/           # authController, catalogController (NEW), workerController, customerController,
│   │                          # bookingController, paymentController, walletController (NEW), reviewController
│   ├── routes/                # ...existing..., catalogRoutes (NEW), walletRoutes (NEW)
│   ├── middleware/             # authMiddleware (JWT verify + role check incl. admin), errorHandler
│   ├── scripts/                # seedAdmin.js (already built), seedCatalog.js (NEW)
│   ├── sockets/
│   ├── utils/
│   └── server.js
│
├── .env.example (both client and server)
└── README.md
```

## 5. Frontend Routes (updated)

```
/                                        Landing Page
/worker-portal                           Worker Portal
/worker-dashboard                        Worker Dashboard (sidebar panel shell)
/dashboard                               Customer Dashboard (category entry point)
/dashboard/category/:categorySlug        NEW: Service Catalog browser + cart for one category
/dashboard/choose-worker                 NEW: filtered worker selection after cart is built
/dashboard/worker/:workerId              Worker Profile Page (ratings/reviews, Send Request)
/customer/booking/:id/payment-options    Payment Options (itemized total, not hourly-derived)
/customer/booking/:id/pay-before         Pay Before checkout (coupon + Razorpay)
/booking-dashboard                       Current/Previous/Completed/Cancelled
/help                                    Help / FAQ
```

## 6. Core Data Models (updated)

```javascript
// User — unchanged, already includes admin role
role: enum ["customer", "worker", "admin"]

// Worker — PRICING FIELDS REMOVED (hourlyCharge, fullDayCharge no longer exist)
// Worker retains: skills[], experienceYears, isAvailable, rating, totalReviews,
// totalJobsCompleted, totalJobsRejected, all profile/identity/bank fields as before.

// ServiceCatalog — NEW, platform-wide, not per-worker
{
  category: String,          // "Plumbing", "Electrician", ...
  subCategory: String,
  serviceName: String,
  price: Number,              // null if isQuotationOnly
  isQuotationOnly: Boolean,
  unit: String,                // optional, e.g. "per seat"
  isActive: Boolean
}

// Booking — RESTRUCTURED
{
  customerId, workerId,
  selectedServices: [{ serviceId, serviceName, unitPrice, quantity }],  // snapshotted at booking time
  inspectionFee: Number,        // flat platform constant, currently ₹80, charged once per booking
  servicesTotal: Number,        // server-calculated sum
  totalAmount: Number,          // servicesTotal + inspectionFee + tip
  couponCode: String,           // only set when a coupon actually discounted the payment
  discountAmount: Number,       // coupon discount applied at Pay Before checkout (default 0)
  amountPaid: Number,           // what the customer actually paid (totalAmount − discountAmount)
  status: enum ["pending", "rejected", "accepted", "confirmed", "in-progress",
                "work-completed-pending-confirmation", "completed", "cancelled"],
  paymentMode: enum ["cash-on-service", "pay-before", null],
  paymentStatus: enum ["not-required", "pending", "paid", "settled"],
  customerLocation: { address, lat, lng },
  createdAt, acceptedAt, workCompletedAt, confirmedAt
}

// Wallet — NEW, 1:1 with Worker
{
  workerId,
  balance: Number,
  transactions: [{ bookingId, type: enum ["platform-fee-deduction","earning-credit","withdrawal",
                    "manual-adjustment","manual-credit","manual-debit"],
                    amount, balanceAfter, note, createdAt }]
}

// Platform constants (server config, never client-editable) — server/config/platform.js
PLATFORM_CONFIG = {
  INSPECTION_FEE: 80,
  MIN_WALLET_BALANCE_FOR_CASH_BOOKINGS: 300,   // enforced when a customer picks Cash on Service
  PLATFORM_FEE_PERCENT: 10,                     // of the amount actually collected
}
```

## 7. Real-Time Event Contract (updated)

| Event | Direction | Payload |
|---|---|---|
| (connection) | client → server | JWT-authenticated; server derives room `user:<id>` — client does not declare its own room |
| `new_booking_request` | server → worker | itemized booking summary + customer location |
| `booking_accepted` | server → customer | updated booking object |
| `booking_rejected` | server → customer | `{ bookingId }` |
| `work_completed` *(new, Phase 9)* | server → customer | `{ bookingId }` — triggers the "please verify" prompt |
| `booking_confirmed` *(new, Phase 9)* | server → worker | `{ bookingId }` — triggers wallet settlement confirmation |

## 8. Environment Variables

**server/.env**
```
MONGO_URI=
PORT=5000
JWT_SECRET=
CLIENT_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
ADMIN_PASSWORD=            # used only by scripts/seedAdmin.js; never stored, never logged
```

**client/.env**
```
VITE_API_URL=http://localhost:5000
```