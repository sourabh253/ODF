import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';
import { Banknote, CreditCard, ArrowLeft, AlertCircle } from 'lucide-react';

const PaymentOptionsPage = () => {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [setting, setSetting] = useState(false);

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

  const selectPaymentMode = async (mode) => {
    setSetting(true);
    setError('');
    try {
      if (mode === 'pay-before') {
        await bookingService.setPaymentMode(bookingId, 'pay-before', user.token);
        navigate(`/booking/${bookingId}/pay-before`);
      } else {
        await bookingService.setPaymentMode(bookingId, 'cash-on-service', user.token);
        navigate('/booking-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set payment mode');
    } finally {
      setSetting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
          <p className="text-slate-600 mb-4">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container-custom max-w-2xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> <span className="text-sm font-medium">Back</span>
        </button>

        <h1 className="text-2xl font-bold text-secondary mb-2">Payment Options</h1>
        <p className="text-slate-500 mb-6">Choose how you'd like to pay</p>

        {error && (
          <div className="bg-danger/10 text-danger p-4 rounded-xl mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        {/* Booking Summary */}
        {booking && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <h3 className="font-bold text-secondary mb-4">Booking Summary</h3>
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
              <div className="flex justify-between font-bold text-secondary text-lg border-t border-slate-100 pt-2">
                <span>Total</span><span>₹{booking.totalAmount}</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Options */}
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => selectPaymentMode('cash-on-service')}
            disabled={setting}
            className="bg-white rounded-2xl border-2 border-slate-200 hover:border-primary p-6 text-left transition-all hover:shadow-md group"
          >
            <Banknote className="w-10 h-10 text-success mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-secondary mb-1">Cash on Service</h3>
            <p className="text-sm text-slate-500">Pay cash after the work is done</p>
          </button>

          <button
            onClick={() => selectPaymentMode('pay-before')}
            disabled={setting}
            className="bg-white rounded-2xl border-2 border-slate-200 hover:border-primary p-6 text-left transition-all hover:shadow-md group"
          >
            <CreditCard className="w-10 h-10 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-secondary mb-1">Pay Before</h3>
            <p className="text-sm text-slate-500">Pay online via UPI before work starts</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptionsPage;
