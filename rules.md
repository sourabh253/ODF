# ODForce — Development Rules

## 1. Required Libraries (do not substitute without a strong reason)
- Frontend: `react`, `react-dom`, `react-router-dom`, `axios`, `socket.io-client`, `lucide-react`, `tailwindcss`
- Backend: `express`, `mongoose`, `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv`, `socket.io`, `cloudinary`, `multer`, `razorpay`

## 2. Security Rules (non-negotiable)
- **Never commit `.env` files.** Both `client/` and `server/` must have `.env` in `.gitignore` from the very first commit.
- **Never hardcode secrets, API keys, or credentials** in any source file. Everything sensitive comes from `process.env` / `import.meta.env`.
- Passwords are always hashed with bcrypt before storage — never store plaintext, ever.
- JWT is verified server-side on every protected route via middleware — never trust a role or user ID sent from the client body/query.
- All money-affecting calculations (booking amount, coupon discount, final payment amount) are computed **server-side** — never trust a client-sent amount.
- Razorpay payments must be verified via HMAC signature server-side before marking any booking as paid.
- MongoDB Atlas Network Access should allow the developer's current IP (or `0.0.0.0/0` for active development convenience — acceptable for a student project, not for real production).

## 3. Error Handling Standards
- Every async Express route handler must be wrapped (via an `asyncHandler` utility or try/catch) so unhandled promise rejections don't hang requests or crash the server.
- A single global error-handling middleware in `server.js` catches everything and returns a consistent JSON error shape: `{ message: string }` with an appropriate HTTP status code.
- Frontend API calls must handle both network failures and non-2xx responses gracefully — show the user a real message, never a raw stack trace or a silent failure.
- Validate all user input on both frontend (UX, immediate feedback) and backend (source of truth, security) — never rely on frontend validation alone.

## 4. Code Style & Architecture Rules
- Controllers contain business logic; routes only wire HTTP verbs+paths to controller functions — keep routes thin.
- One Mongoose model per file in `models/`, one controller file per resource.
- Reusable UI (buttons, cards, modals, form inputs) go in `components/common/` — do not duplicate the same markup across pages.
- Keep the Worker Dashboard as a single page with panel-switching via React state (`activePanel`) — do NOT convert it into multiple routes.
- Keep Cash on Service and Pay Before as strictly separate code paths — never share a component that could accidentally leak coupon/offer UI into Cash on Service.
- Any place a booking's payment/estimated amount is calculated, use the worker's actual stored rate (`hourlyCharge`/`fullDayCharge`) — never a value passed from the frontend.

## 5. What to Avoid
- Do not add OTP verification anywhere — explicitly out of scope per the PRD.
- Do not use `localStorage`/`sessionStorage` for JWTs or any sensitive data long-term without accepting the XSS trade-off; if used for convenience, document it as a known limitation. Theme and language preference are fine to persist locally.
- Do not leave any button, page, or flow as a placeholder, `console.log`, or "Coming soon" in a final delivered phase — every phase's deliverable must be fully functional.
- Do not invent new field names that don't match `architecture.md`'s data models without updating that file — the frontend and backend must share one consistent contract.
- Do not build against Razorpay Live Mode — Test Mode only for this project.

## 6. Testing Checklist (before considering any phase "done")
- Test both success and failure paths for every form (e.g. wrong password, duplicate email, expired coupon).
- Test the full booking lifecycle at least twice: once ending in Accept, once ending in Reject.
- Test both payment paths: Cash on Service and Pay Before (with a valid coupon, an invalid coupon, `success@razorpay`, and `failure@razorpay`).
- Refresh the browser mid-flow at least once per major feature to confirm state is read from the database/API, not lost or only held in memory.
- Confirm role-based route protection: a worker cannot reach customer-only routes and vice versa.
