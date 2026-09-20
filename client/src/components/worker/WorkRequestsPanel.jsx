import { useEffect, useState } from 'react';
import { AlertCircle, CalendarDays, Check, Clock, MapPin, X, Play, CheckCircle, ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import bookingService from '../../services/bookingService';

const WorkRequestsPanel = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');
  const [error, setError] = useState('');

  const loadBookings = async () => {
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
    if (user.token) loadBookings();
  }, [user.token]);

  useEffect(() => {
    if (!socket) return;
    const handleNewRequest = (data) => {
      setBookings(prev => {
        const exists = prev.some(b => b._id === data.booking?._id);
        if (exists) return prev;
        return [data.booking, ...prev];
      });
    };
    socket.on('new_booking_request', handleNewRequest);
    return () => socket.off('new_booking_request', handleNewRequest);
  }, [socket]);

  const handleAction = async (bookingId, status) => {
    setActionId(bookingId);
    setError('');
    try {
      await bookingService.updateStatus(bookingId, status, user.token);
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status } : b));
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setActionId('');
    }
  };

  const handleStart = async (bookingId) => {
    setActionId(bookingId);
    setError('');
    try {
      await bookingService.startBooking(bookingId, user.token);
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'in-progress' } : b));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start booking');
    } finally {
      setActionId('');
    }
  };

  const handleComplete = async (bookingId) => {
    setActionId(bookingId);
    setError('');
    try {
      await bookingService.completeWork(bookingId, user.token);
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'work-completed-pending-confirmation' } : b));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete work');
    } finally {
      setActionId('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pending = bookings.filter(b => b.status === 'pending');
  const active = bookings.filter(b => ['accepted', 'in-progress', 'work-completed-pending-confirmation'].includes(b.status));
  const past = bookings.filter(b => ['completed', 'rejected', 'cancelled'].includes(b.status));

  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary mb-6">Work Requests</h2>

      {error && (
        <div className="bg-danger/10 text-danger p-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>No booking requests yet.</p>
          <p className="text-sm mt-1">When customers send requests, they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending Requests */}
          {pending.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-warning uppercase tracking-wide mb-3">Pending Requests ({pending.length})</h3>
              <div className="space-y-3">
                {pending.map(booking => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    actionId={actionId}
                    onAccept={() => handleAction(booking._id, 'accepted')}
                    onReject={() => handleAction(booking._id, 'rejected')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Active Jobs */}
          {active.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">Active Jobs ({active.length})</h3>
              <div className="space-y-3">
                {active.map(booking => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    actionId={actionId}
                    onStart={() => handleStart(booking._id)}
                    onComplete={() => handleComplete(booking._id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Past Bookings ({past.length})</h3>
              <div className="space-y-3">
                {past.map(booking => (
                  <BookingCard key={booking._id} booking={booking} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const BookingCard = ({ booking, actionId, onAccept, onReject, onStart, onComplete }) => {
  const isPending = booking.status === 'pending';
  const isAccepted = booking.status === 'accepted';
  const isInProgress = booking.status === 'in-progress';
  const isAwaitingConfirmation = booking.status === 'work-completed-pending-confirmation';
  const isLoading = actionId === booking._id;
  const customerName = booking.customerId?.fullName || 'Customer';
  const services = booking.selectedServices?.map(s => `${s.serviceName} × ${s.quantity}`).join(', ') || 'Service';

  const statusColors = {
    pending: 'bg-warning/10 text-warning',
    accepted: 'bg-success/10 text-success',
    rejected: 'bg-danger/10 text-danger',
    'in-progress': 'bg-info/10 text-info',
    'work-completed-pending-confirmation': 'bg-warning/10 text-warning',
    completed: 'bg-primary/10 text-primary',
    cancelled: 'bg-danger/10 text-danger',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-secondary">{customerName}</h4>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColors[booking.status] || 'bg-slate-100 text-slate-500'}`}>
              {booking.status}
            </span>
          </div>
          <p className="text-sm text-slate-500 mb-1">{services}</p>
          <p className="text-lg font-bold text-primary">₹{booking.totalAmount}</p>
          {booking.customerLocation?.address && (
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" /> {booking.customerLocation.address}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-1">
            {new Date(booking.createdAt).toLocaleDateString()} at {new Date(booking.createdAt).toLocaleTimeString()}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {isPending && onAccept && (
            <>
              <button onClick={onAccept} disabled={isLoading} className="bg-success text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-success/90 disabled:opacity-50 flex items-center gap-1">
                <Check className="w-4 h-4" /> {isLoading ? '...' : 'Accept'}
              </button>
              <button onClick={onReject} disabled={isLoading} className="bg-danger/10 text-danger px-4 py-2 rounded-lg text-sm font-semibold hover:bg-danger/20 disabled:opacity-50 flex items-center gap-1">
                <X className="w-4 h-4" /> {isLoading ? '...' : 'Reject'}
              </button>
            </>
          )}
          {isAccepted && onStart && (
            <button onClick={onStart} disabled={isLoading} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 flex items-center gap-1">
              <Play className="w-4 h-4" /> {isLoading ? '...' : 'Start Work'}
            </button>
          )}
          {isInProgress && onComplete && (
            <button onClick={onComplete} disabled={isLoading} className="bg-success text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-success/90 disabled:opacity-50 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> {isLoading ? '...' : 'Mark Complete'}
            </button>
          )}
          {isAwaitingConfirmation && (
            <span className="text-xs text-warning font-medium text-center">Waiting for customer confirmation</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkRequestsPanel;
