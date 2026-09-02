# ODForce — Architecture Document

## 1. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React (Vite) + Tailwind CSS + React Router v6 | Fast dev loop, utility-first styling, standard routing |
| Icons | lucide-react | Consistent icon set |
| Backend | Node.js + Express.js | Same language as frontend, huge ecosystem, easy free deployment |
| Database | MongoDB Atlas (Mongoose ODM) | Flexible schema fits fast-evolving worker/booking data; free tier |
| Auth | JWT + bcrypt | Stateless sessions, no OTP per spec |
| Real-time | Socket.io | Live booking request / accept / reject updates |
| Image/File uploads | Cloudinary | Free tier, CDN-hosted, no server disk storage needed |
| Payments | Razorpay (Test Mode) | UPI-first, Indian market, full sandbox for demo-safe testing |
| Frontend hosting | Vercel | Free, auto-deploy from GitHub |
| Backend hosting | Render (or Railway) | Free tier, auto-deploy from GitHub |

## 2. High-Level App Flow

```
Visitor → Landing Page ("/")
   ├── "ODF for Job" → Worker Portal → Worker Sign In/Register → Worker Dashboard
   └── Profile icon → Customer Auth Modal → Customer Dashboard ("/dashboard")

Customer Dashboard → Search (location + skill) → Worker Cards → Worker Profile
   → Send Booking Request (Hourly/Full-Day) → [pending]

Worker Dashboard → Work Requests panel (live via Socket.io) → Accept / Reject
   ├── Reject → Customer notified live → booking ends
   └── Accept → Customer notified live → Payment Options unlocked
       ├── Cash on Service → booking confirmed instantly (no coupons)
       └── Pay Before → Coupon/Offers → Razorpay Test Checkout → booking confirmed

Booking reaches "completed" (worker marks job done) →
   Wallet credited (worker) + Customer can leave a Review →
   Worker's rating/analytics recomputed
```

## 3. Request Routing (backend)

```
Client → API Gateway pattern via Express Router mounts:
  /api/auth/*      → auth routes (register/login for both roles, /me)
  /api/customers/* → worker discovery, worker profile views
  /api/worker/*    → worker profile CRUD, availability, analytics
  /api/bookings/*  → booking lifecycle (create, accept, reject, complete, cancel, list)
  /api/payments/*  → coupon validation, Razorpay order creation, payment verification
  /api/wallet/*    → worker wallet/earnings
  /api/reviews/*   → review submission
  /api/upload      → Cloudinary file upload (photos, ID docs)

Socket.io runs on the same HTTP server, alongside Express, using room-per-userId
for targeted real-time events (new_booking_request, booking_accepted, booking_rejected).
```

## 4. Folder Structure

```
odforce/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # Navbar, Footer, HelpPanel, LanguageSwitcher, ThemeToggle, ProtectedRoute
│   │   │   ├── landing/       # Hero, About, ServiceCategories, WhyChoose, HowItWorks, Testimonials, FAQ
│   │   │   ├── auth/          # CustomerAuthModal, WorkerLoginModal, WorkerRegisterFlow
│   │   │   ├── worker/        # dashboard panels: Profile, Settings, Wallet, Analytics, WorkRequests, Ratings
│   │   │   └── customer/      # WorkerCard, SearchBar, WorkerProfileView, BookingFlow, PaymentOptions
│   │   ├── pages/             # one file per route (see routes list below)
│   │   ├── context/           # AuthContext, SocketContext, ThemeContext, LanguageContext
│   │   ├── services/          # authService, workerService, customerService, bookingService, paymentService
│   │   ├── i18n/               # strings.js (per-language key-value pairs)
│   │   └── App.jsx
│
├── server/
│   ├── config/                # db.js, cloudinary.js, razorpay.js
│   ├── models/                # User, Worker, Booking, Wallet, Review, Notification, Coupon
│   ├── controllers/           # authController, workerController, customerController,
│   │                          # bookingController, paymentController, walletController, reviewController
│   ├── routes/                 # authRoutes, workerRoutes, customerRoutes, bookingRoutes,
│   │                          # paymentRoutes, walletRoutes, reviewRoutes, uploadRoutes
│   ├── middleware/             # authMiddleware (JWT verify + role check), errorHandler
│   ├── sockets/                # socketHandler.js
│   ├── utils/                  # generateToken.js, asyncHandler.js
│   └── server.js
│
├── .env.example (both client and server each have their own)
└── README.md
```

## 5. Frontend Routes

```
/                                  Landing Page
/worker-portal                     Worker Portal (marketing + Sign In/Register entry)
/worker-dashboard                  Worker Dashboard (sidebar panel shell, single page)
/dashboard                         Customer Dashboard (search + results)
/dashboard/worker/:workerId        Worker Profile Page (customer-facing, booking flow)
/customer/booking/:id/payment-options   Payment Options (Cash on Service / Pay Before)
/customer/booking/:id/pay-before        Pay Before checkout (coupon + Razorpay)
/booking-dashboard                 Customer's booking history (Current/Previous/Completed/Cancelled)
/help                              Help / FAQ
```

## 6. Core Data Models (see architecture-level schema; full field lists live in code)
`User` (auth identity + role) → `Worker` (extended profile, 1:1 with User) / customer data lives directly on `User` + a lightweight profile.
`Booking` (the central object linking customer, worker, status, payment).
`Wallet` (1:1 with Worker, transaction log).
`Review` (1:1 with a completed Booking).
`Notification` (per-user, real-time-triggered).
`Coupon` (used only in Pay Before flow).

## 7. Real-Time Event Contract (Socket.io)
| Event | Direction | Payload |
|---|---|---|
| `join` | client → server | `{ userId }` — joins that user's room right after connecting |
| `new_booking_request` | server → worker | booking summary (customer name, type, date, time, duration, amount) |
| `booking_accepted` | server → customer | updated booking object |
| `booking_rejected` | server → customer | `{ bookingId }` |

## 8. Environment Variables

**server/.env**
```
MONGO_URI=
PORT=5000
JWT_SECRET=
CLIENT_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

**client/.env**
```
VITE_API_URL=http://localhost:5000
```
