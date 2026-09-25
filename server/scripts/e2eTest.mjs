import 'dotenv/config';
import mongoose from 'mongoose';
import crypto from 'crypto';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';
import Wallet from '../models/Wallet.js';
import Notification from '../models/Notification.js';
import Review from '../models/Review.js';
import Coupon from '../models/Coupon.js';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:5000';
const STAMP = Date.now();

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok: !!ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name}${detail ? ` | ${detail}` : ''}`);
};

async function api(method, path, { token, body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* no body */ }
  return { status: res.status, data };
}

const created = {
  emails: [],
  workerUserIds: [],
  workerIds: [],
  bookingIds: [],
  reviewBookingIds: [],
  couponBaseline: new Map(),
};

function workerProfilePayload(skills, city = 'Pune') {
  return {
    profilePhotoUrl: 'https://ui-avatars.com/api/?name=E2E+Worker&background=15803D&color=fff',
    gender: 'Male',
    dob: '1995-04-12',
    address: '1 E2E Test Road',
    city,
    state: 'Maharashtra',
    pinCode: '411001',
    occupation: 'Plumber',
    skills,
    experienceYears: 5,
    workingHours: '9am - 6pm',
    languagesKnown: ['English', 'Hindi'],
    identityInfo: { documentType: 'Aadhar', documentNumber: '123456789012', documentUrl: 'https://example.com/id.png' },
    bankDetails: { accountHolderName: 'E2E Worker', accountNumber: '1234567890', ifscCode: 'HDFC0001234', bankName: 'HDFC' },
    emergencyContact: { name: 'E2E Contact', phone: '9000000001', relation: 'Friend' },
    agreedToTerms: true,
  };
}

async function cleanup() {
  if (created.couponBaseline.size) {
    for (const [code, usedCount] of created.couponBaseline) {
      await Coupon.updateOne({ code }, { $set: { usedCount } });
    }
  }
  if (created.bookingIds.length) {
    await Review.deleteMany({ bookingId: { $in: created.bookingIds } });
    await Notification.deleteMany({ bookingId: { $in: created.bookingIds } });
    await Booking.deleteMany({ _id: { $in: created.bookingIds } });
  }
  if (created.workerIds.length) {
    await Wallet.deleteMany({ workerId: { $in: created.workerIds } });
    await Worker.deleteMany({ _id: { $in: created.workerIds } });
  }
  if (created.emails.length) {
    const users = await User.find({ email: { $in: created.emails } }).select('_id');
    const userIds = users.map(u => u._id);
    if (userIds.length) {
      await Notification.deleteMany({ userId: { $in: userIds } });
      await Review.deleteMany({ customerId: { $in: userIds } });
      await User.deleteMany({ _id: { $in: userIds } });
    }
  }
}

async function main() {
  await connectDB();

  // ───────────────────────── 1. HEALTH ─────────────────────────
  const health = await api('GET', '/api/health');
  check('Health endpoint returns 200', health.status === 200 && health.data?.status === 'ok', `status=${health.status}`);

  // ───────────────────────── 2. AUTH ─────────────────────────
  const custEmail = `e2e-cust-${STAMP}@odforce.test`;
  const workEmail = `e2e-work-${STAMP}@odforce.test`;
  const work2Email = `e2e-work2-${STAMP}@odforce.test`;
  created.emails.push(custEmail, workEmail, work2Email);

  const custReg = await api('POST', '/api/auth/customer/register', {
    body: { fullName: 'E2E Customer', email: custEmail, phone: `98${String(STAMP).slice(-8)}`, password: 'Passw0rd!123', location: { address: '1 Test Road, Pune', lat: 18.52, lng: 73.85 } },
  });
  check('Customer register -> 201', custReg.status === 201 && !!custReg.data?.token, `status=${custReg.status}`);
  const custToken = custReg.data?.token;

  const dupReg = await api('POST', '/api/auth/customer/register', {
    body: { fullName: 'E2E Customer', email: custEmail, phone: '9811112222', password: 'Passw0rd!123' },
  });
  check('Duplicate email register -> 400', dupReg.status === 400 && /already exists/i.test(dupReg.data?.message || ''), `status=${dupReg.status} msg=${dupReg.data?.message}`);

  const custLogin = await api('POST', '/api/auth/customer/login', { body: { email: custEmail, password: 'Passw0rd!123' } });
  check('Customer login -> 200 + token', custLogin.status === 200 && !!custLogin.data?.token, `status=${custLogin.status}`);

  const custBadLogin = await api('POST', '/api/auth/customer/login', { body: { email: custEmail, password: 'wrong-password' } });
  check('Customer wrong password -> 401', custBadLogin.status === 401, `status=${custBadLogin.status}`);

  const workReg = await api('POST', '/api/auth/worker/register', {
    body: { fullName: 'E2E Worker One', email: workEmail, phone: `97${String(STAMP).slice(-8)}`, password: 'Passw0rd!123' },
  });
  check('Worker register -> 201', workReg.status === 201 && !!workReg.data?.token, `status=${workReg.status}`);
  const workToken = workReg.data?.token;
  created.workerUserIds.push(workReg.data?._id);

  const work2Reg = await api('POST', '/api/auth/worker/register', {
    body: { fullName: 'E2E Worker Two', email: work2Email, phone: `96${String(STAMP).slice(-8)}`, password: 'Passw0rd!123' },
  });
  check('Second worker register -> 201', work2Reg.status === 201, `status=${work2Reg.status}`);
  const work2Token = work2Reg.data?.token;
  created.workerUserIds.push(work2Reg.data?._id);

  const workLoginBad = await api('POST', '/api/auth/worker/login', { body: { identifier: workEmail, password: 'nope' } });
  check('Worker wrong password -> 401', workLoginBad.status === 401, `status=${workLoginBad.status}`);

  const workLogin = await api('POST', '/api/auth/worker/login', { body: { identifier: workEmail, password: 'Passw0rd!123' } });
  check('Worker login (email identifier) -> 200', workLogin.status === 200 && !!workLogin.data?.token, `status=${workLogin.status}`);

  const adminUser = await User.findOne({ role: 'admin' }).select('email');
  check('Admin seed account exists in DB', !!adminUser, adminUser ? `email=${adminUser.email}` : 'none found');
  const adminLogin = await api('POST', '/api/auth/admin/login', { body: { email: adminUser?.email, password: process.env.ADMIN_PASSWORD || '' } });
  check('Admin login -> 200 + token', adminLogin.status === 200 && !!adminLogin.data?.token, `status=${adminLogin.status}`);
  const adminToken = adminLogin.data?.token;

  const adminLoginBad = await api('POST', '/api/auth/admin/login', { body: { email: adminUser?.email, password: 'definitely-wrong' } });
  check('Admin wrong password -> 401', adminLoginBad.status === 401, `status=${adminLoginBad.status}`);

  const me = await api('GET', '/api/auth/me', { token: custToken });
  check('GET /api/auth/me returns customer role', me.status === 200 && me.data?.role === 'customer', `role=${me.data?.role}`);

  const cpBad = await api('PATCH', '/api/auth/change-password', { token: custToken, body: { currentPassword: 'wrong', newPassword: 'NewPass123!' } });
  check('change-password wrong current -> 401', cpBad.status === 401, `status=${cpBad.status}`);
  const cpShort = await api('PATCH', '/api/auth/change-password', { token: custToken, body: { currentPassword: 'Passw0rd!123', newPassword: '123' } });
  check('change-password short new -> 400', cpShort.status === 400, `status=${cpShort.status}`);
  const cpOk = await api('PATCH', '/api/auth/change-password', { token: custToken, body: { currentPassword: 'Passw0rd!123', newPassword: 'NewPass123!' } });
  check('change-password success -> 200', cpOk.status === 200, `status=${cpOk.status}`);
  const relogin = await api('POST', '/api/auth/customer/login', { body: { email: custEmail, password: 'NewPass123!' } });
  check('Login with new password works', relogin.status === 200, `status=${relogin.status}`);

  // ───────────────────────── 3. ROLE-BASED ROUTE PROTECTION ─────────────────────────
  const noToken = await api('GET', '/api/catalog/tree');
  check('Catalog tree readable without token -> 200', noToken.status === 200, `status=${noToken.status}`);
  const adminNoToken = await api('POST', '/api/catalog/admin/service', { body: {} });
  check('No token -> admin catalog CRUD 401', adminNoToken.status === 401, `status=${adminNoToken.status}`);

  const custAdmin = await api('GET', '/api/admin/dashboard', { token: custToken });
  check('Customer blocked from admin dashboard', custAdmin.status === 403, `status=${custAdmin.status}`);
  const custWallet = await api('GET', '/api/wallet', { token: custToken });
  check('Customer blocked from worker wallet', custWallet.status === 403, `status=${custWallet.status}`);
  const workCreateBooking = await api('POST', '/api/bookings', { token: workToken, body: { workerId: 'x', selectedServices: [{}], customerLocation: { address: 'x' } } });
  check('Worker blocked from creating bookings', workCreateBooking.status === 403, `status=${workCreateBooking.status}`);
  const workCreateOrder = await api('POST', '/api/payments/create-order', { token: workToken, body: { bookingId: 'x' } });
  check('Worker blocked from create-order', workCreateOrder.status === 403, `status=${workCreateOrder.status}`);
  const custAdminService = await api('POST', '/api/catalog/admin/service', { token: custToken, body: {} });
  check('Customer blocked from admin catalog CRUD', custAdminService.status === 403, `status=${custAdminService.status}`);
  const adminBookingsMine = await api('GET', '/api/bookings/mine', { token: adminToken });
  check('Admin blocked from customer/worker bookings list', adminBookingsMine.status === 403, `status=${adminBookingsMine.status}`);

  // ───────────────────────── 4. CATALOG ─────────────────────────
  const mainCats = await api('GET', '/api/catalog/main-categories', { token: custToken });
  check('Main categories -> 200, non-empty', mainCats.status === 200 && Array.isArray(mainCats.data) && mainCats.data.length > 0, `count=${mainCats.data?.length}`);

  const cats = await api('GET', '/api/catalog/categories', { token: custToken });
  check('Categories -> 200, non-empty', cats.status === 200 && Array.isArray(cats.data) && cats.data.length > 0, `count=${cats.data?.length}`);

  const tree = await api('GET', '/api/catalog/tree', { token: custToken });
  const treeKeys = tree.data && typeof tree.data === 'object' ? Object.keys(tree.data) : [];
  check('Catalog tree -> hierarchical object', tree.status === 200 && treeKeys.length > 0, `mainCategories=${treeKeys.length}`);

  const search = await api('GET', '/api/catalog/search?q=plumber', { token: custToken });
  check('Search "plumber" returns results', search.status === 200 && Array.isArray(search.data) && search.data.length > 0, `count=${search.data?.length}`);

  const categoryName = cats.data?.[0];
  const servicesRes = await api('GET', `/api/catalog/${encodeURIComponent(categoryName)}/services`, { token: custToken });
  const services = Array.isArray(servicesRes.data) ? servicesRes.data : [];
  check('Services by category -> non-empty', servicesRes.status === 200 && services.length > 0, `category=${categoryName} count=${services.length}`);
  const svc1 = services[0];
  const svc2 = services[1] || services[0];

  const svcById = await api('GET', `/api/catalog/service/${svc1._id}`, { token: custToken });
  check('Service by id -> 200', svcById.status === 200 && svcById.data?._id === svc1._id);

  const svcBad = await api('GET', '/api/catalog/service/aaaaaaaaaaaaaaaaaaaaaaaa', { token: custToken });
  check('Missing service id -> 404', svcBad.status === 404, `status=${svcBad.status}`);

  // ───────────────────────── 5. WORKER PROFILE SETUP ─────────────────────────
  const profile1 = await api('POST', '/api/worker/profile', { token: workToken, body: workerProfilePayload([categoryName]) });
  check('Worker profile create -> 201', profile1.status === 201, `status=${profile1.status}`);
  const worker1 = profile1.data;
  created.workerIds.push(worker1?._id);

  const profileDup = await api('POST', '/api/worker/profile', { token: workToken, body: workerProfilePayload([categoryName]) });
  check('Duplicate worker profile -> 400', profileDup.status === 400, `status=${profileDup.status}`);

  const profileNoSkills = await api('POST', '/api/worker/profile', { token: work2Token, body: { ...workerProfilePayload([]) } });
  check('Worker profile without skills -> 400', profileNoSkills.status === 400, `status=${profileNoSkills.status}`);

  const profile2 = await api('POST', '/api/worker/profile', { token: work2Token, body: workerProfilePayload([categoryName]) });
  check('Second worker profile -> 201', profile2.status === 201, `status=${profile2.status}`);
  const worker2 = profile2.data;
  created.workerIds.push(worker2?._id);

  const avail = await api('PUT', '/api/worker/availability', { token: workToken, body: { isAvailable: true } });
  check('Worker goes available (Duty ON)', avail.status === 200 && avail.data?.isAvailable === true, `isAvailable=${avail.data?.isAvailable}`);
  await api('PUT', '/api/worker/availability', { token: work2Token, body: { isAvailable: true } });

  const discovery = await api('GET', `/api/customers/workers?skill=${encodeURIComponent(categoryName)}&city=Pune`, { token: custToken });
  check('Customer discovery finds available worker', discovery.status === 200 && Array.isArray(discovery.data) && discovery.data.some(w => w._id === worker1._id), `count=${discovery.data?.length}`);

  // ───────────────────────── 6. GATE TEST (balance = 0, cash-on-service) ─────────────────────────
  const location = { address: '2 Test Road, Pune', lat: 18.53, lng: 73.86 };
  const qty = 2;
  const expectedTotal = svc1.price * qty + svc2.price + 80;

  const gateBooking = await api('POST', '/api/bookings', {
    token: custToken,
    body: { workerId: worker1._id, selectedServices: [{ serviceId: svc1._id, quantity: qty }, { serviceId: svc2._id, quantity: 1 }], customerLocation: location },
  });
  check('Booking create -> 201 with server-side pricing', gateBooking.status === 201 && gateBooking.data?.totalAmount === expectedTotal, `total=${gateBooking.data?.totalAmount} expected=${expectedTotal}`);
  created.bookingIds.push(gateBooking.data?._id);

  const tampered = await api('POST', '/api/bookings', {
    token: custToken,
    body: { workerId: worker1._id, selectedServices: [{ serviceId: svc1._id, quantity: 1, price: 1, unitPrice: 1, lineTotal: 1 }], customerLocation: location, totalAmount: 5, tip: -50 },
  });
  check('Client-sent prices ignored (server recalculates)', tampered.status === 201 && tampered.data?.totalAmount === svc1.price + 80, `total=${tampered.data?.totalAmount} expected=${svc1.price + 80}`);
  created.bookingIds.push(tampered.data?._id);

  const noLocation = await api('POST', '/api/bookings', { token: custToken, body: { workerId: worker1._id, selectedServices: [{ serviceId: svc1._id, quantity: 1 }] } });
  check('Booking without location -> 400', noLocation.status === 400, `status=${noLocation.status}`);

  const badService = await api('POST', '/api/bookings', { token: custToken, body: { workerId: worker1._id, selectedServices: [{ serviceId: 'aaaaaaaaaaaaaaaaaaaaaaaa', quantity: 1 }], customerLocation: location } });
  check('Booking with unknown service -> 400', badService.status === 400, `status=${badService.status}`);

  // accept the tampered booking so it does not linger as pending
  await api('PATCH', `/api/bookings/${tampered.data?._id}/status`, { token: workToken, body: { status: 'rejected' } });

  const gateAccept = await api('PATCH', `/api/bookings/${gateBooking.data?._id}/status`, { token: workToken, body: { status: 'accepted' } });
  check('Worker accepts booking -> 200', gateAccept.status === 200 && gateAccept.data?.status === 'accepted', `status=${gateAccept.data?.status}`);

  const gateWalletBefore = await api('GET', '/api/wallet', { token: workToken });
  const balanceBeforeGate = gateWalletBefore.data?.balance;
  const gateCash = await api('PATCH', `/api/bookings/${gateBooking.data?._id}/payment-mode`, { token: custToken, body: { paymentMode: 'cash-on-service' } });
  const gateBlocked = gateCash.status === 400 || gateCash.status === 409;
  check('Cash-on-service blocked below ₹300 wallet minimum (Phase 8 gate)', gateBlocked && balanceBeforeGate < 300, `balance=${balanceBeforeGate} status=${gateCash.status} msg=${gateCash.data?.message}`);
  await api('PATCH', `/api/bookings/${gateBooking.data?._id}/cancel`, { token: workToken });

  // ───────────────────────── 7. FUND WALLET VIA ADMIN ─────────────────────────
  const adjust = await api('POST', '/api/admin/wallets/adjust', { token: adminToken, body: { workerUserId: workReg.data._id, amount: 1000, note: 'E2E test funding' } });
  check('Admin wallet adjust -> 200', adjust.status === 200 && adjust.data?.balance >= 1000, `balance=${adjust.data?.balance}`);

  // ───────────────────────── 8. BOOKING LIFECYCLE #1 — ACCEPT + CASH SETTLEMENT ─────────────────────────
  const cashBooking = await api('POST', '/api/bookings', {
    token: custToken,
    body: { workerId: worker1._id, selectedServices: [{ serviceId: svc1._id, quantity: qty }, { serviceId: svc2._id, quantity: 1 }], customerLocation: location },
  });
  created.bookingIds.push(cashBooking.data?._id);
  const cashId = cashBooking.data?._id;
  check('Cash booking created', cashBooking.status === 201 && cashBooking.data?.status === 'pending', `status=${cashBooking.data?.status}`);

  const custList = await api('GET', '/api/bookings/mine', { token: custToken });
  check('Customer sees booking in list (fresh read)', custList.status === 200 && custList.data?.some(b => b._id === cashId), `count=${custList.data?.length}`);
  const workList = await api('GET', '/api/bookings/mine', { token: workToken });
  check('Worker sees booking in list (fresh read)', workList.status === 200 && workList.data?.some(b => b._id === cashId), `count=${workList.data?.length}`);

  const wrongWorkerReject = await api('PATCH', `/api/bookings/${cashId}/status`, { token: work2Token, body: { status: 'rejected' } });
  check('Non-assigned worker cannot touch booking -> 403', wrongWorkerReject.status === 403, `status=${wrongWorkerReject.status}`);
  const custAccept = await api('PATCH', `/api/bookings/${cashId}/status`, { token: custToken, body: { status: 'accepted' } });
  check('Customer cannot accept own booking -> 403', custAccept.status === 403, `status=${custAccept.status}`);

  const cashAccept = await api('PATCH', `/api/bookings/${cashId}/status`, { token: workToken, body: { status: 'accepted' } });
  check('Worker accepts cash booking', cashAccept.status === 200 && cashAccept.data?.status === 'accepted', `status=${cashAccept.data?.status}`);

  const cashMode = await api('PATCH', `/api/bookings/${cashId}/payment-mode`, { token: custToken, body: { paymentMode: 'cash-on-service' } });
  check('Cash-on-service selected (wallet funded)', cashMode.status === 200 && cashMode.data?.status === 'confirmed' && cashMode.data?.paymentStatus === 'not-required', `status=${cashMode.data?.status} pay=${cashMode.data?.paymentStatus}`);

  const badMode = await api('PATCH', `/api/bookings/${cashId}/payment-mode`, { token: custToken, body: { paymentMode: 'bitcoin' } });
  check('Invalid payment mode -> 400', badMode.status === 400, `status=${badMode.status}`);

  const startTooEarly = await api('PATCH', `/api/bookings/${cashId}/start`, { token: custToken });
  check('Customer cannot start work -> 403', startTooEarly.status === 403, `status=${startTooEarly.status}`);

  const start = await api('PATCH', `/api/bookings/${cashId}/start`, { token: workToken });
  check('Worker starts work -> in-progress', start.status === 200 && start.data?.status === 'in-progress', `status=${start.data?.status}`);

  const confirmEarly = await api('PATCH', `/api/bookings/${cashId}/confirm`, { token: custToken });
  check('Customer cannot confirm before work done -> 409', confirmEarly.status === 409, `status=${confirmEarly.status}`);

  const complete = await api('PATCH', `/api/bookings/${cashId}/complete`, { token: workToken });
  check('Worker completes -> pending confirmation', complete.status === 200 && complete.data?.status === 'work-completed-pending-confirmation', `status=${complete.data?.status}`);

  const wrongConfirm = await api('PATCH', `/api/bookings/${cashId}/confirm`, { token: workToken });
  check('Worker cannot confirm completion -> 403', wrongConfirm.status === 403, `status=${wrongConfirm.status}`);

  const walletBeforeSettle = (await api('GET', '/api/wallet', { token: workToken })).data?.balance;
  const confirm = await api('PATCH', `/api/bookings/${cashId}/confirm`, { token: custToken });
  check('Customer confirms -> completed', confirm.status === 200 && confirm.data?.status === 'completed', `status=${confirm.data?.status}`);

  const walletAfterSettle = (await api('GET', '/api/wallet', { token: workToken })).data?.balance;
  const expectedFee = Math.round(expectedTotal * 0.10);
  check('Cash settlement deducts 10% platform fee', walletAfterSettle === walletBeforeSettle - expectedFee, `before=${walletBeforeSettle} after=${walletAfterSettle} expectedFee=${expectedFee}`);
  check('Wallet never driven negative by settlement', walletAfterSettle >= 0, `balance=${walletAfterSettle}`);

  const doubleConfirm = await api('PATCH', `/api/bookings/${cashId}/confirm`, { token: custToken });
  check('Double confirm -> 409', doubleConfirm.status === 409, `status=${doubleConfirm.status}`);

  const workerAfter = await api('GET', '/api/worker/profile', { token: workToken });
  check('Worker totalJobsCompleted incremented', (workerAfter.data?.totalJobsCompleted || 0) >= 1, `totalJobsCompleted=${workerAfter.data?.totalJobsCompleted}`);

  // ───────────────────────── 9. BOOKING LIFECYCLE #2 — REJECT PATH ─────────────────────────
  const rejBooking = await api('POST', '/api/bookings', {
    token: custToken,
    body: { workerId: worker1._id, selectedServices: [{ serviceId: svc1._id, quantity: 1 }], customerLocation: location },
  });
  created.bookingIds.push(rejBooking.data?._id);
  const rejId = rejBooking.data?._id;

  const rejAgain = await api('PATCH', `/api/bookings/${rejId}/status`, { token: workToken, body: { status: 'accepted' } });
  check('Accept before decision works', rejAgain.status === 200, `status=${rejAgain.status}`);

  const rejectPendingOnly = await api('PATCH', `/api/bookings/${rejId}/status`, { token: workToken, body: { status: 'rejected' } });
  check('Reject after accept -> 409 (pending only)', rejectPendingOnly.status === 409, `status=${rejectPendingOnly.status}`);

  const rejBooking2 = await api('POST', '/api/bookings', {
    token: custToken,
    body: { workerId: worker1._id, selectedServices: [{ serviceId: svc1._id, quantity: 1 }], customerLocation: location },
  });
  created.bookingIds.push(rejBooking2.data?._id);
  const reject = await api('PATCH', `/api/bookings/${rejBooking2.data?._id}/status`, { token: workToken, body: { status: 'rejected' } });
  check('Worker rejects booking', reject.status === 200 && reject.data?.status === 'rejected', `status=${reject.data?.status}`);

  const invalidStatus = await api('PATCH', `/api/bookings/${rejBooking2.data?._id}/status`, { token: workToken, body: { status: 'completed' } });
  check('Invalid status transition value -> 400', invalidStatus.status === 400, `status=${invalidStatus.status}`);

  // ───────────────────────── 10. PAY BEFORE + COUPONS ─────────────────────────
  const pbBooking = await api('POST', '/api/bookings', {
    token: custToken,
    body: { workerId: worker1._id, selectedServices: [{ serviceId: svc1._id, quantity: qty }, { serviceId: svc2._id, quantity: 1 }], customerLocation: location },
  });
  created.bookingIds.push(pbBooking.data?._id);
  const pbId = pbBooking.data?._id;
  const pbTotal = pbBooking.data?.totalAmount;

  await api('PATCH', `/api/bookings/${pbId}/status`, { token: workToken, body: { status: 'accepted' } });
  const pbMode = await api('PATCH', `/api/bookings/${pbId}/payment-mode`, { token: custToken, body: { paymentMode: 'pay-before' } });
  check('Pay-before mode keeps booking accepted + payment pending', pbMode.status === 200 && pbMode.data?.status === 'accepted' && pbMode.data?.paymentStatus === 'pending', `status=${pbMode.data?.status} pay=${pbMode.data?.paymentStatus}`);

  const flat = await Coupon.findOne({ code: 'FLAT50' }).select('usedCount');
  const welcome = await Coupon.findOne({ code: 'WELCOME20' }).select('usedCount');
  if (flat) created.couponBaseline.set('FLAT50', flat.usedCount || 0);
  if (welcome) created.couponBaseline.set('WELCOME20', welcome.usedCount || 0);

  const goodCoupon = await api('POST', '/api/payments/coupon/validate', { token: custToken, body: { code: 'flat50', bookingId: pbId } });
  check('Valid coupon -> discount applied', goodCoupon.status === 200 && goodCoupon.data?.valid === true && goodCoupon.data?.discount === 50, `discount=${goodCoupon.data?.discount} final=${goodCoupon.data?.finalAmount}`);

  const badCoupon = await api('POST', '/api/payments/coupon/validate', { token: custToken, body: { code: 'NOPE99', bookingId: pbId } });
  check('Invalid coupon -> 400', badCoupon.status === 400, `status=${badCoupon.status} msg=${badCoupon.data?.message}`);

  const expiredCoupon = await api('POST', '/api/payments/coupon/validate', { token: custToken, body: { code: 'WELCOME20', bookingId: pbId } });
  check('Expired coupon -> 400', expiredCoupon.status === 400, `status=${expiredCoupon.status} msg=${expiredCoupon.data?.message}`);

  const save10 = await api('POST', '/api/payments/coupon/validate', { token: custToken, body: { code: 'SAVE10', bookingId: pbId } });
  if (pbTotal < 300) {
    check('Below-minimum coupon -> 400', save10.status === 400, `status=${save10.status} msg=${save10.data?.message}`);
  } else {
    check('Percentage coupon computes discount', save10.status === 200 && save10.data?.discount === Math.min(Math.round(pbTotal * 0.10), 150), `total=${pbTotal} discount=${save10.data?.discount}`);
  }

  const payWithCoupon = await api('POST', '/api/bookings/simulate-payment', { token: custToken, body: { bookingId: pbId, couponCode: 'FLAT50' } });
  check('Pay-before payment with coupon -> paid + confirmed', payWithCoupon.status === 200 && payWithCoupon.data?.paymentStatus === 'paid' && payWithCoupon.data?.status === 'confirmed', `status=${payWithCoupon.status} discount=${payWithCoupon.data?.discount}`);

  const pbFresh = (await api('GET', '/api/bookings/mine', { token: custToken })).data?.find(b => b._id === pbId);
  check('Payment state persisted to DB', pbFresh?.status === 'confirmed' && pbFresh?.paymentStatus === 'paid', `status=${pbFresh?.status} pay=${pbFresh?.paymentStatus}`);
  check('Coupon discount persisted on booking (amount actually paid)', pbFresh?.amountPaid === pbTotal - 50 && pbFresh?.discountAmount === 50 && pbFresh?.couponCode === 'FLAT50', `amountPaid=${pbFresh?.amountPaid} discount=${pbFresh?.discountAmount} code=${pbFresh?.couponCode}`);
  check('List price left intact for display', pbFresh?.totalAmount === pbTotal, `totalAmount=${pbFresh?.totalAmount}`);

  const couponAfter = await Coupon.findOne({ code: 'FLAT50' }).select('usedCount');
  check('Coupon usage counter incremented', (couponAfter?.usedCount || 0) === (created.couponBaseline.get('FLAT50') || 0) + 1, `usedCount=${couponAfter?.usedCount}`);

  const payAgain = await api('POST', '/api/bookings/simulate-payment', { token: custToken, body: { bookingId: pbId } });
  check('Double payment -> 409', payAgain.status === 409, `status=${payAgain.status}`);

  const startPb = await api('PATCH', `/api/bookings/${pbId}/start`, { token: workToken });
  check('Worker starts paid booking', startPb.status === 200 && startPb.data?.status === 'in-progress', `status=${startPb.data?.status}`);
  await api('PATCH', `/api/bookings/${pbId}/complete`, { token: workToken });

  const walletBeforePb = (await api('GET', '/api/wallet', { token: workToken })).data?.balance;
  const confirmPb = await api('PATCH', `/api/bookings/${pbId}/confirm`, { token: custToken });
  const walletAfterPb = (await api('GET', '/api/wallet', { token: workToken })).data?.balance;
  const paidAmount = pbTotal - 50;
  const expectedCredit = paidAmount - Math.round(paidAmount * 0.10);
  check('Pay-before settlement credits amount actually paid minus fee', walletAfterPb === walletBeforePb + expectedCredit, `before=${walletBeforePb} after=${walletAfterPb} expectedCredit=${expectedCredit} (paidAmount=${paidAmount})`);

  const pbSettled = (await api('GET', '/api/bookings/mine', { token: custToken })).data?.find(b => b._id === pbId);
  check('Pay-before booking marked settled after confirmation', pbSettled?.paymentStatus === 'settled', `pay=${pbSettled?.paymentStatus}`);

  const cashPayment = await api('POST', '/api/bookings/simulate-payment', { token: custToken, body: { bookingId: cashId } });
  check('Cash booking cannot be paid online (paths separated)', cashPayment.status === 409, `status=${cashPayment.status} msg=${cashPayment.data?.message}`);

  // ───────────────────────── 11. RAZORPAY ORDER + SIGNATURE VERIFICATION ─────────────────────────
  const rzBooking = await api('POST', '/api/bookings', {
    token: custToken,
    body: { workerId: worker1._id, selectedServices: [{ serviceId: svc1._id, quantity: 1 }], customerLocation: location },
  });
  created.bookingIds.push(rzBooking.data?._id);
  const rzId = rzBooking.data?._id;
  await api('PATCH', `/api/bookings/${rzId}/status`, { token: workToken, body: { status: 'accepted' } });
  await api('PATCH', `/api/bookings/${rzId}/payment-mode`, { token: custToken, body: { paymentMode: 'pay-before' } });

  const order = await api('POST', '/api/payments/create-order', { token: custToken, body: { bookingId: rzId } });
  if (order.status === 200 && order.data?.orderId) {
    check('Razorpay order created (test keys valid)', true, `orderId=${order.data.orderId} amount=${order.data.amount}`);
    const body = `${order.data.orderId}|pay_e2etest`;
    const goodSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
    const tampered = await api('POST', '/api/payments/verify', { token: custToken, body: { razorpay_order_id: order.data.orderId, razorpay_payment_id: 'pay_e2etest', razorpay_signature: 'f'.repeat(64), bookingId: rzId } });
    check('Tampered signature -> 400', tampered.status === 400, `status=${tampered.status}`);
    const verified = await api('POST', '/api/payments/verify', { token: custToken, body: { razorpay_order_id: order.data.orderId, razorpay_payment_id: 'pay_e2etest', razorpay_signature: goodSig, bookingId: rzId } });
    check('Valid HMAC signature -> 200', verified.status === 200, `status=${verified.status}`);
    const rzFresh = (await api('GET', '/api/bookings/mine', { token: custToken })).data?.find(b => b._id === rzId);
    check('Verified payment moves booking to confirmed (worker can start)', rzFresh?.status === 'confirmed' && rzFresh?.paymentStatus === 'paid', `status=${rzFresh?.status} pay=${rzFresh?.paymentStatus}`);
  } else {
    check('Razorpay order created (test keys valid)', false, `status=${order.status} msg=${order.data?.message}`);
  }
  await api('PATCH', `/api/bookings/${rzId}/cancel`, { token: workToken });

  // ───────────────────────── 12. WALLET ─────────────────────────
  const noAmount = await api('POST', '/api/wallet/withdraw', { token: workToken, body: {} });
  check('Withdraw without amount -> 400', noAmount.status === 400, `status=${noAmount.status}`);
  const tooMuch = await api('POST', '/api/wallet/withdraw', { token: workToken, body: { amount: 99999999 } });
  check('Over-balance withdraw -> 400', tooMuch.status === 400, `status=${tooMuch.status}`);

  const activeBooking = await api('POST', '/api/bookings', {
    token: custToken,
    body: { workerId: worker1._id, selectedServices: [{ serviceId: svc1._id, quantity: 1 }], customerLocation: location },
  });
  created.bookingIds.push(activeBooking.data?._id);
  const activeId = activeBooking.data?._id;
  await api('PATCH', `/api/bookings/${activeId}/status`, { token: workToken, body: { status: 'accepted' } });
  await api('PATCH', `/api/bookings/${activeId}/payment-mode`, { token: custToken, body: { paymentMode: 'cash-on-service' } });
  await api('PATCH', `/api/bookings/${activeId}/start`, { token: workToken });

  const activeWithdraw = await api('POST', '/api/wallet/withdraw', { token: workToken, body: { amount: 10 } });
  check('Withdraw blocked during active booking', activeWithdraw.status === 400 && /active/i.test(activeWithdraw.data?.message || ''), `status=${activeWithdraw.status} msg=${activeWithdraw.data?.message}`);

  await api('PATCH', `/api/bookings/${activeId}/cancel`, { token: workToken });

  const credit = await api('POST', '/api/wallet/credit', { token: workToken, body: { amount: 500, accountHolderName: 'E2E', accountNumber: '1234567890', ifsc: 'HDFC0001234' } });
  check('Manual credit -> 200 (simulated banking)', credit.status === 200, `status=${credit.status} balance=${credit.data?.balance}`);

  const withdraw = await api('POST', '/api/wallet/withdraw', { token: workToken, body: { amount: 100 } });
  check('Withdraw succeeds after active booking cleared', withdraw.status === 200, `status=${withdraw.status} balance=${withdraw.data?.balance}`);

  const txns = await api('GET', '/api/wallet/transactions', { token: workToken });
  check('Transaction ledger returns history', txns.status === 200 && Array.isArray(txns.data?.transactions) && txns.data.transactions.length > 0, `count=${txns.data?.transactions?.length}`);

  const custWalletTxn = await api('GET', '/api/wallet/transactions', { token: custToken });
  check('Customer blocked from wallet transactions', custWalletTxn.status === 403, `status=${custWalletTxn.status}`);

  // ───────────────────────── 13. REVIEWS ─────────────────────────
  const earlyReview = await api('POST', '/api/reviews', { token: custToken, body: { bookingId: rejBooking2.data?._id, rating: 5, comment: 'nope' } });
  check('Review on non-completed booking -> 400', earlyReview.status === 400, `status=${earlyReview.status}`);

  const review = await api('POST', '/api/reviews', { token: custToken, body: { bookingId: cashId, rating: 4, comment: 'Solid E2E work' } });
  check('Review on completed booking -> 201', review.status === 201, `status=${review.status}`);
  created.reviewBookingIds.push(cashId);

  const dupReview = await api('POST', '/api/reviews', { token: custToken, body: { bookingId: cashId, rating: 5, comment: 'again' } });
  check('Duplicate review -> 400', dupReview.status === 400, `status=${dupReview.status}`);

  const badRating = await api('POST', '/api/reviews', { token: custToken, body: { bookingId: pbId, rating: 9 } });
  check('Rating out of range -> 400', badRating.status === 400, `status=${badRating.status}`);

  const workerView = await api('GET', `/api/customers/workers/${worker1._id}`, { token: custToken });
  check('Worker rating recomputed after review', workerView.status === 200 && workerView.data?.rating > 0 && workerView.data?.totalReviews >= 1, `rating=${workerView.data?.rating} reviews=${workerView.data?.totalReviews}`);

  const workerReviews = await api('GET', `/api/reviews/worker/${worker1._id}`, { token: custToken });
  check('Worker review list -> 200', workerReviews.status === 200 && Array.isArray(workerReviews.data) && workerReviews.data.length > 0, `count=${workerReviews.data?.length}`);

  // ───────────────────────── 14. NOTIFICATIONS ─────────────────────────
  const custNotifs = await api('GET', '/api/notifications', { token: custToken });
  const custNotifList = custNotifs.data?.notifications;
  check('Customer notifications persisted', custNotifs.status === 200 && Array.isArray(custNotifList) && custNotifList.length > 0, `count=${custNotifList?.length}`);
  const workNotifs = await api('GET', '/api/notifications', { token: workToken });
  const workNotifList = workNotifs.data?.notifications;
  check('Worker notifications persisted', workNotifs.status === 200 && Array.isArray(workNotifList) && workNotifList.length > 0, `count=${workNotifList?.length}`);

  const markAll = await api('PATCH', '/api/notifications/read-all', { token: custToken });
  check('Mark all notifications read -> 200', markAll.status === 200, `status=${markAll.status}`);
  const afterRead = await api('GET', '/api/notifications', { token: custToken });
  check('Unread count drops after mark-all', afterRead.status === 200 && (afterRead.data?.unreadCount ?? -1) === 0, `unread=${afterRead.data?.unreadCount}`);

  // ───────────────────────── 15. ADMIN ─────────────────────────
  const dash = await api('GET', '/api/admin/dashboard', { token: adminToken });
  check('Admin dashboard stats -> 200', dash.status === 200 && typeof dash.data === 'object' && dash.data !== null, `keys=${dash.data ? Object.keys(dash.data).length : 0}`);
  const custListAdmin = await api('GET', '/api/admin/customers', { token: adminToken });
  check('Admin customer list contains test customer', custListAdmin.status === 200 && (custListAdmin.data || []).some(c => c.email === custEmail), `count=${custListAdmin.data?.length}`);
  const workListAdmin = await api('GET', '/api/admin/workers', { token: adminToken });
  check('Admin worker list contains test worker', workListAdmin.status === 200 && (workListAdmin.data || []).some(w => w._id === worker1._id || w.userId?._id === workReg.data._id), `count=${workListAdmin.data?.length}`);
  const verifs = await api('GET', '/api/admin/workers/verifications', { token: adminToken });
  check('Admin pending verifications -> 200 array', verifs.status === 200 && Array.isArray(verifs.data), `count=${verifs.data?.length}`);
  const verify = await api('PATCH', `/api/admin/workers/${worker1._id}/verify`, { token: adminToken, body: { verificationStatus: 'verified' } });
  check('Admin verifies worker', verify.status === 200 && verify.data?.verificationStatus === 'verified', `status=${verify.data?.verificationStatus}`);
  const adminBookings = await api('GET', '/api/admin/bookings', { token: adminToken });
  check('Admin bookings list -> 200', adminBookings.status === 200, `count=${adminBookings.data?.length}`);
  const adminWallets = await api('GET', '/api/admin/wallets', { token: adminToken });
  check('Admin wallets list -> 200', adminWallets.status === 200, `count=${adminWallets.data?.length}`);
  const adminAllReviews = await api('GET', '/api/reviews/admin/all', { token: adminToken });
  check('Admin reviews list -> 200', adminAllReviews.status === 200, `count=${adminAllReviews.data?.length}`);
  const toggle = await api('PATCH', `/api/admin/workers/${workReg.data._id}/toggle`, { token: adminToken, body: {} });
  check('Admin toggle worker status -> 200', toggle.status === 200, `status=${toggle.status} active=${toggle.data?.isActive ?? toggle.data?.isAvailable}`);

  // stale pending bookings (auto-expire) — only run if nothing pre-existing would be hit
  const staleOthers = await Booking.countDocuments({ status: 'pending', createdAt: { $lt: new Date(Date.now() - 5 * 60 * 1000) } });
  if (staleOthers === 0) {
    const expBooking = await api('POST', '/api/bookings', { token: custToken, body: { workerId: worker1._id, selectedServices: [{ serviceId: svc1._id, quantity: 1 }], customerLocation: location } });
    created.bookingIds.push(expBooking.data?._id);
    // Mongoose timestamps silently ignore $set createdAt — use the native collection.
    await Booking.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(expBooking.data._id) },
      { $set: { createdAt: new Date(Date.now() - 6 * 60 * 1000) } }
    );
    const backdated = await Booking.findById(expBooking.data._id).select('createdAt').lean();
    console.log(`  [debug] backdated createdAt=${backdated.createdAt.toISOString()} ageMin=${((Date.now() - backdated.createdAt) / 60000).toFixed(1)}`);
    const expired = await api('POST', '/api/bookings/auto-expire', { token: adminToken });
    const afterExp = (await api('GET', '/api/bookings/mine', { token: custToken })).data?.find(b => b._id === expBooking.data?._id);
    check('Auto-expire turns stale pending into rejected', expired.status === 200 && afterExp?.status === 'rejected', `status=${afterExp?.status} expired=${expired.data?.expiredCount}`);
  } else {
    check('Auto-expire turns stale pending into rejected', false, `SKIPPED: ${staleOthers} pre-existing stale pending booking(s) would be mutated`);
  }

  // ───────────────────────── SUMMARY ─────────────────────────
  const failed = results.filter(r => !r.ok);
  console.log('\n==================== E2E SUMMARY ====================');
  console.log(`TOTAL: ${results.length}  PASS: ${results.length - failed.length}  FAIL: ${failed.length}`);
  for (const f of failed) console.log(`  FAIL: ${f.name} — ${f.detail}`);
}

let exitCode = 0;
try {
  await main();
} catch (err) {
  exitCode = 1;
  console.error('E2E RUN ABORTED:', err);
} finally {
  try {
    await cleanup();
    console.log('Cleanup complete.');
  } catch (err) {
    console.error('Cleanup failed:', err.message);
  }
  await mongoose.disconnect();
  const failed = results.filter(r => !r.ok);
  process.exit(exitCode || (failed.length ? 1 : 0));
}
