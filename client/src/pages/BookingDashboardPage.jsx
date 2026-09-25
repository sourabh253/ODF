import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import bookingService from '../services/bookingService';
import reviewService from '../services/reviewService';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, Loader, Star } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { color: 'bg-warning/10 text-warning', icon: Clock, label: 'Pending' },
  accepted: { color: 'bg-info/10 text-info', icon: Clock, label: 'Awaiting Payment' },
  rejected: { color: 'bg-danger/10 text-danger', icon: XCircle, label: 'Rejected' },
  confirmed: { color: 'bg-success/10 text-success', icon: CheckCircle, label: 'Confirmed' },
  'in-progress': { color: 'bg-info/10 text-info', icon: Loader, label: 'In Progress' },
  'work-completed-pending-confirmation': { color: 'bg-warning/10 text-warning', icon: Clock, label: 'Awaiting Confirmation' },
  completed: { color: 'bg-primary/10 text-primary', icon: CheckCircle, label: 'Completed' },
  cancelled: { color: 'bg-danger/10 text-danger', icon: XCircle, label: 'Cancelled' },
};

const ReviewModal = ({ booking, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({ bookingId: booking._id, rating, comment });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-secondary mb-2">Rate Your Experience</h3>
        <p className="text-sm text-slate-500 mb-4">
          How was your experience with {booking.workerId?.userId?.fullName || 'the worker'}?
        </p>
        {error && (
          <div className="bg-danger/10 text-danger p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-sm font-medium text-secondary mb-2 block">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button" onClick={() => setRating(s)} className="p-1">
                  <Star className={`w-8 h-8 transition-colors ${s <= rating ? 'fill-warning text-warning' : 'text-slate-300 hover:text-warning/50'}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="text-sm font-medium text-secondary mb-2 block">Comment (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={3}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BookingDashboardPage = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [confirmingId, setConfirmingId] = useState(null);
  const [reviewBooking, setReviewBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getMyBookings(user.token);
      setBookings(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchBookings();
  }, [user?.token]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = (data) => {
      setBookings(prev => prev.map(b => b._id === data.bookingId ? { ...b, status: data.status || b.status, autoExpired: data.autoExpired || b.autoExpired } : b));
    };
    socket.on('booking_accepted', handleUpdate);
    socket.on('booking_rejected', handleUpdate);
    socket.on('booking_confirmed', handleUpdate);
    socket.on('work_completed', (data) => {
      setBookings(prev => prev.map(b => b._id === data.bookingId ? { ...b, status: 'work-completed-pending-confirmation' } : b));
    });
    socket.on('work_started', (data) => {
      setBookings(prev => prev.map(b => b._id === data.bookingId ? { ...b, status: 'in-progress' } : b));
    });
    return () => {
      socket.off('booking_accepted', handleUpdate);
      socket.off('booking_rejected', handleUpdate);
      socket.off('booking_confirmed', handleUpdate);
      socket.off('work_completed');
      socket.off('work_started');
    };
  }, [socket]);

  const handleConfirmCompletion = async (bookingId) => {
    setConfirmingId(bookingId);
    try {
      await bookingService.confirmCompletion(bookingId, user.token);
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'completed', confirmedAt: new Date().toISOString() } : b));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm completion');
    } finally {
      setConfirmingId(null);
    }
  };

  const handleReviewSubmit = async (data) => {
    await reviewService.submitReview(data, user.token);
    setReviewBooking(null);
  };

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => {
    if (filter === 'active') return ['pending', 'accepted', 'confirmed', 'in-progress', 'work-completed-pending-confirmation'].includes(b.status);
    if (filter === 'completed') return b.status === 'completed';
    if (filter === 'cancelled') return ['cancelled', 'rejected'].includes(b.status);
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container-custom max-w-4xl">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> <span className="text-sm font-medium">Dashboard</span>
        </button>

        <h1 className="text-2xl font-bold text-secondary mb-6">My Bookings</h1>

        {error && (
          <div className="bg-danger/10 text-danger p-4 rounded-xl mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'active', 'completed', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-primary'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <p className="text-slate-500">No bookings found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map(booking => {
              const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
              const Icon = config.icon;
              const workerName = booking.workerId?.userId?.fullName || booking.workerId?.occupation || 'Worker';
              const services = booking.selectedServices?.map(s => s.serviceName).join(', ') || 'Service';

              return (
                <div key={booking._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-secondary">{workerName}</h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.color}`}>
                          <Icon className="w-3 h-3" /> {config.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-1">{services}</p>
                      <p className="text-lg font-bold text-primary">
                        ₹{booking.discountAmount > 0 ? (booking.amountPaid ?? booking.totalAmount) : booking.totalAmount}
                        {booking.discountAmount > 0 && (
                          <span className="ml-2 text-xs font-medium text-slate-400 line-through">₹{booking.totalAmount}</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(booking.createdAt).toLocaleDateString()} at {new Date(booking.createdAt).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      {booking.status === 'accepted' && (
                        <button
                          onClick={() => navigate(`/booking/${booking._id}/payment-options`)}
                          className="btn-primary text-xs px-3 py-1.5"
                        >
                          Choose Payment
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <span className="text-xs text-success font-medium px-2">Waiting for worker to start</span>
                      )}
                      {booking.status === 'work-completed-pending-confirmation' && (
                        <button
                          onClick={() => handleConfirmCompletion(booking._id)}
                          disabled={confirmingId === booking._id}
                          className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          {confirmingId === booking._id ? 'Confirming...' : 'Confirm Completion'}
                        </button>
                      )}
                      {booking.status === 'completed' && (
                        <button
                          onClick={() => setReviewBooking(booking)}
                          className="bg-warning/10 text-warning px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-warning/20 flex items-center gap-1"
                        >
                          <Star className="w-3 h-3" /> Leave Review
                        </button>
                      )}
                    </div>
                  </div>
                  {booking.autoExpired && (
                    <p className="text-xs text-warning mt-2 font-medium">Expired — no response within 5 minutes</p>
                  )}
                  {booking.paymentMode === 'cash-on-service' && booking.status === 'completed' && (
                    <p className="text-xs text-info mt-2 font-medium">Cash payment — please pay the worker directly in person</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
};

export default BookingDashboardPage;
