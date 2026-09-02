import { useEffect, useState } from 'react';
import { ArrowLeft, AlertCircle, CalendarDays, Clock3, Languages, MapPin, Send, Star } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import customerService from '../services/customerService';
import bookingService from '../services/bookingService';
import { useSocket } from '../context/SocketContext';

const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary';

const WorkerProfilePage = () => {
  const { workerId } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [bookingType, setBookingType] = useState('hourly');
  const [form, setForm] = useState({ duration: 1, scheduledDate: '', scheduledTime: '', serviceAddress: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (!socket || !booking?._id) return undefined;
    const handleBookingUpdate = (updatedBooking) => {
      if (updatedBooking._id === booking._id) setBooking(updatedBooking);
    };
    socket.on('booking_accepted', handleBookingUpdate);
    socket.on('booking_rejected', handleBookingUpdate);
    return () => {
      socket.off('booking_accepted', handleBookingUpdate);
      socket.off('booking_rejected', handleBookingUpdate);
    };
  }, [socket, booking?._id]);

  useEffect(() => {
    const loadWorker = async () => {
      try {
        setWorker(await customerService.getWorker(workerId, user.token));
      } catch (err) {
        setError(err.response?.data?.message || 'Worker profile could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    loadWorker();
  }, [workerId, user.token]);

  const updateForm = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submitBooking = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const created = await bookingService.createBooking({
        workerId,
        bookingType,
        duration: bookingType === 'hourly' ? Number(form.duration) : 1,
        scheduledDate: form.scheduledDate,
        scheduledTime: form.scheduledTime,
        serviceAddress: form.serviceAddress,
      }, user.token);
      setBooking(created);
    } catch (err) {
      setError(err.response?.data?.message || 'We could not send your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-surface"><div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" /></div>;
  if (!worker) return <div className="container-custom py-24 text-center"><p className="mb-6 text-danger">{error}</p><Link to="/dashboard" className="btn-primary">Back to search</Link></div>;

  return (
    <div className="min-h-screen bg-surface py-12">
      <div className="container-custom">
        <Link to="/dashboard" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-primary"><ArrowLeft className="h-4 w-4" /> Back to workers</Link>
        {error && <div className="mb-6 flex items-center gap-2 rounded-lg bg-danger/10 p-4 text-sm text-danger"><AlertCircle className="h-5 w-5" />{error}</div>}
        {booking ? <BookingSuccess booking={booking} onDashboard={() => navigate('/dashboard')} /> : (
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-5 bg-secondary p-8 text-white sm:flex-row sm:items-center">
                <img src={worker.profilePhotoUrl} alt={worker.userId?.fullName || 'Worker'} className="h-28 w-28 rounded-full border-4 border-primary object-cover" />
                <div><h1 className="text-3xl font-bold">{worker.userId?.fullName || 'ODForce worker'}</h1><p className="mt-1 text-slate-300">{worker.occupation} · {worker.experienceYears} years experience</p><p className="mt-3 flex items-center gap-2 text-sm text-slate-300"><Star className="h-4 w-4 fill-warning text-warning" /> {worker.rating?.toFixed(1) || '0.0'} from {worker.totalReviews || 0} reviews</p></div>
              </div>
              <div className="grid gap-6 p-8 sm:grid-cols-2">
                <Info title="Skills"><div className="flex flex-wrap gap-2">{worker.skills?.map((item) => <span key={item} className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">{item}</span>)}</div></Info>
                <Info title="Pricing"><p className="text-slate-700">₹{worker.hourlyCharge} per hour</p><p className="mt-1 text-slate-500">₹{worker.fullDayCharge} per full day</p></Info>
                <Info title="Location"><p className="flex items-start gap-2 text-slate-600"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{worker.address}, {worker.city}, {worker.state} - {worker.pinCode}</p></Info>
                <Info title="Languages"><p className="flex items-start gap-2 text-slate-600"><Languages className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{worker.languagesKnown?.join(', ')}</p></Info>
              </div>
            </section>

            <section className="h-fit rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-secondary">Request this worker</h2>
              <p className="mt-2 text-sm text-slate-500">Your request will remain pending until the worker responds.</p>
              <div className="mt-6 grid grid-cols-2 gap-3"><Choice active={bookingType === 'hourly'} onClick={() => setBookingType('hourly')} title="Hourly" detail={`₹${worker.hourlyCharge}/hour`} /><Choice active={bookingType === 'full-day'} onClick={() => setBookingType('full-day')} title="Full-Day" detail={`₹${worker.fullDayCharge}/day`} /></div>
              <form onSubmit={submitBooking} className="mt-6 space-y-4">
                {bookingType === 'hourly' && <label className="block text-sm font-medium text-slate-700">Hours<input required type="number" min="1" max="24" name="duration" value={form.duration} onChange={updateForm} className={`${inputClass} mt-1`} /></label>}
                <label className="block text-sm font-medium text-slate-700">Service date<input required type="date" name="scheduledDate" value={form.scheduledDate} onChange={updateForm} className={`${inputClass} mt-1`} /></label>
                <label className="block text-sm font-medium text-slate-700">Preferred time<input required type="time" name="scheduledTime" value={form.scheduledTime} onChange={updateForm} className={`${inputClass} mt-1`} /></label>
                <label className="block text-sm font-medium text-slate-700">Service address<textarea required rows="3" name="serviceAddress" value={form.serviceAddress} onChange={updateForm} className={`${inputClass} mt-1`} placeholder="Where should the worker come?" /></label>
                <button type="submit" disabled={submitting} className="btn-primary w-full gap-2 py-3"><Send className="h-4 w-4" />{submitting ? 'Sending request...' : 'Send booking request'}</button>
              </form>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

const Info = ({ title, children }) => <div><h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">{title}</h3>{children}</div>;
const Choice = ({ active, onClick, title, detail }) => <button type="button" onClick={onClick} className={`rounded-xl border-2 p-4 text-left transition-colors ${active ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}><span className={`block font-semibold ${active ? 'text-primary' : 'text-slate-700'}`}>{title}</span><span className="mt-1 block text-sm text-slate-500">{detail}</span></button>;
const BookingSuccess = ({ booking, onDashboard }) => <div className="mx-auto max-w-2xl rounded-2xl border border-success/20 bg-white p-10 text-center shadow-sm"><div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success"><Clock3 className="h-7 w-7" /></div><h1 className="text-3xl font-bold text-secondary">{booking.status === 'pending' ? 'Request sent' : `Request ${booking.status}`}</h1><p className="mt-3 text-slate-600">{booking.status === 'pending' ? 'Your booking request is pending. The worker must respond before any payment step becomes available.' : `The worker has ${booking.status} your booking request.`}</p><div className="mx-auto mt-6 max-w-sm rounded-xl bg-slate-50 p-5 text-left text-sm"><p><strong>Status:</strong> <span className={`font-semibold ${booking.status === 'accepted' ? 'text-success' : booking.status === 'rejected' ? 'text-danger' : 'text-warning'}`}>{booking.status}</span></p><p className="mt-2"><strong>Type:</strong> {booking.bookingType === 'hourly' ? `${booking.duration} hour(s)` : 'Full day'}</p><p className="mt-2"><strong>Estimated amount:</strong> ₹{booking.estimatedPayment}</p><p className="mt-2"><strong>Date:</strong> {new Date(booking.scheduledDate).toLocaleDateString()}</p></div><button type="button" onClick={onDashboard} className="btn-primary mt-8">Back to dashboard</button></div>;

export default WorkerProfilePage;
