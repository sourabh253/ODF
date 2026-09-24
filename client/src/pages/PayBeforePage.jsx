import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';
import paymentService from '../services/paymentService';
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle, Tag } from 'lucide-react';

const PayBeforePage = () => {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const bookings = await bookingService.getMyBookings(user.token);
        const found = bookings.find(b => b._id === bookingId);
        if (found) setBooking(found);
        else setError('Booking not found');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchBooking();
  }, [bookingId, user?.token]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    try {
      const result = await paymentService.validateCoupon(couponCode, bookingId, user.token);
      setCouponDiscount(result.discount || 0);
      setCouponApplied(true);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon');
      setCouponDiscount(0);
      setCouponApplied(false);
    }
  };

  // SIMULATED PAYMENT — no live Razorpay. Calls backend which recalculates, marks paid, confirms.
  const handlePayment = async () => {
    setProcessing(true);
    setError('');
    try {
      const result = await paymentService.simulatePayment(bookingId, couponApplied ? couponCode : null, user.token);
      setPaymentSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-secondary mb-2">Payment Successful!</h2>
          <p className="text-slate-500 mb-6">Your booking is confirmed. The worker will be notified to start the service.</p>
          <button onClick={() => navigate('/booking-dashboard')} className="btn-primary">View My Bookings</button>
        </div>
      </div>
    );
  }

  const finalAmount = booking ? Math.max(0, booking.totalAmount - couponDiscount) : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container-custom max-w-2xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> <span className="text-sm font-medium">Back</span>
        </button>

        <h1 className="text-2xl font-bold text-secondary mb-2">Pay Before Service</h1>
        <p className="text-slate-500 mb-6">Complete your payment to confirm the booking</p>

        {error && (
          <div className="bg-danger/10 text-danger p-4 rounded-xl mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        {/* Booking Summary */}
        {booking && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <h3 className="font-bold text-secondary mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4">
              {booking.selectedServices?.map((svc, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-600">{svc.serviceName} × {svc.quantity}</span>
                  <span className="font-medium">₹{svc.lineTotal}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Services Subtotal</span><span>₹{booking.servicesTotal}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Inspection Fee</span><span>₹{booking.inspectionFee}</span>
              </div>
              {booking.tip > 0 && (
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Tip</span><span>₹{booking.tip}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm text-success font-medium">
                  <span>Coupon Discount</span><span>-₹{couponDiscount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-secondary text-lg border-t border-slate-100 pt-2">
                <span>Total to Pay</span><span>₹{finalAmount}</span>
              </div>
            </div>
          </div>
        )}

        {/* Coupon */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <h3 className="font-bold text-secondary mb-3 flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" /> Have a coupon?
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponApplied(false); setCouponDiscount(0); }}
              placeholder="Enter coupon code"
              className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
            />
            <button onClick={applyCoupon} disabled={couponApplied} className="btn-secondary text-sm px-4">
              {couponApplied ? 'Applied' : 'Apply'}
            </button>
          </div>
          {couponError && <p className="text-danger text-sm mt-2">{couponError}</p>}
          {couponApplied && couponDiscount > 0 && <p className="text-success text-sm mt-2">Coupon applied! You save ₹{couponDiscount}</p>}
        </div>

        {/* Pay Now Button (Simulated) */}
        <button
          onClick={handlePayment}
          disabled={processing || !booking}
          className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-base"
        >
          <CreditCard className="w-5 h-5" />
          {processing ? 'Processing Payment...' : `Pay ₹${finalAmount} Now`}
        </button>
        {/* SIMULATED PAYMENT — no live payment gateway account exists yet. This directly marks payment as successful. Replace with real Razorpay (or another gateway) integration before any real money is involved. */}
        <p className="text-xs text-slate-400 text-center mt-3">Simulated payment — no real money is charged</p>
      </div>
    </div>
  );
};

export default PayBeforePage;
