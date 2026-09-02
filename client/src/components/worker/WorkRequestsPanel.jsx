import { useEffect, useState } from 'react';
import { AlertCircle, CalendarDays, Check, Clock, MapPin, X } from 'lucide-react';
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
      setBookings(await bookingService.getMyBookings(user.token));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Work requests could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user.token]);

  useEffect(() => {
    if (!socket) return undefined;
    const handleNewRequest = (booking) => {
      setBookings((current) => current.some((item) => item._id === booking._id) ? current : [booking, ...current]);
    };
    socket.on('new_booking_request', handleNewRequest);
    return () => socket.off('new_booking_request', handleNewRequest);
  }, [socket]);

  const updateStatus = async (bookingId, status) => {
    setActionId(bookingId);
    setError('');
    try {
      const updated = await bookingService.updateStatus(bookingId, status, user.token);
      setBookings((current) => current.map((booking) => booking._id === updated._id ? updated : booking));
    } catch (err) {
      setError(err.response?.data?.message || 'This booking could not be updated. Refresh and try again.');
      await loadBookings();
    } finally {
      setActionId('');
    }
  };

  const pending = bookings.filter((booking) => booking.status === 'pending');

  return (
    <div>
      <div className="mb-6"><h2 className="text-2xl font-bold text-secondary">Work Requests</h2><p className="mt-1 text-sm text-slate-500">New requests arrive here instantly. Your response is saved on the server.</p></div>
      {error && <div className="mb-5 flex items-center gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger"><AlertCircle className="h-4 w-4" />{error}</div>}
      {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">Loading requests...</div> : bookings.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">No booking requests yet. Stay available for new work.</div> : (
        <div className="space-y-4">
          {pending.length > 0 && <p className="text-sm font-semibold uppercase tracking-wide text-primary">Pending requests</p>}
          {bookings.map((booking) => <BookingRequest key={booking._id} booking={booking} disabled={actionId === booking._id} onAction={updateStatus} />)}
        </div>
      )}
    </div>
  );
};

const BookingRequest = ({ booking, disabled, onAction }) => {
  const customer = booking.customerId?.fullName || 'Customer';
  const isPending = booking.status === 'pending';
  return <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="text-lg font-semibold text-secondary">{customer}</h3><p className="mt-1 text-sm text-slate-500">{booking.bookingType === 'hourly' ? `${booking.duration} hour(s)` : 'Full day'} · ₹{booking.estimatedPayment}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${booking.status === 'pending' ? 'bg-warning/10 text-warning' : booking.status === 'accepted' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>{booking.status}</span></div><div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-3"><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" />{new Date(booking.scheduledDate).toLocaleDateString()}</span><span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />{booking.scheduledTime}</span><span className="flex items-start gap-2 sm:col-span-1"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{booking.serviceAddress}</span></div>{isPending && <div className="mt-6 flex gap-3"><button type="button" disabled={disabled} onClick={() => onAction(booking._id, 'accepted')} className="btn-primary gap-2"><Check className="h-4 w-4" />Accept</button><button type="button" disabled={disabled} onClick={() => onAction(booking._id, 'rejected')} className="btn-secondary gap-2 text-danger"><X className="h-4 w-4" />Reject</button></div>}</article>;
};

export default WorkRequestsPanel;
