import { useEffect, useState } from 'react';
import { AlertCircle, MapPin, Search, Star, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import customerService from '../services/customerService';
import bookingService from '../services/bookingService';
import { useSocket } from '../context/SocketContext';

const SKILLS = [
  'Home Cleaning', 'Electrician', 'Plumber', 'Carpenter', 'AC Service & Repair',
  'Pest Control', 'Gardening & Landscaping', 'Painter', 'Water Tank Cleaning',
  'Housekeeping Staff', 'Car Wash & Detailing', 'Laundry & Dry Cleaning',
  'Maid Services', 'CCTV Installation & Maintenance', 'RO/Water Purifier Service',
  'Refrigerator Repair', 'Washing Machine Repair',
];

const CustomerDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [skill, setSkill] = useState('');
  const [city, setCity] = useState('');
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState([]);

  const search = async (event) => {
    event?.preventDefault();
    setLoading(true);
    setError('');
    try {
      setWorkers(await customerService.searchWorkers({ skill, city }, user.token));
      setSearched(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Worker search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    search();
  }, []);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setBookings(await bookingService.getMyBookings(user.token));
      } catch (err) {
        setError(err.response?.data?.message || 'Booking status could not be loaded.');
      }
    };
    loadBookings();
  }, [user.token]);

  useEffect(() => {
    if (!socket) return undefined;
    const updateBooking = (updatedBooking) => {
      setBookings((current) => current.some((booking) => booking._id === updatedBooking._id)
        ? current.map((booking) => booking._id === updatedBooking._id ? updatedBooking : booking)
        : [updatedBooking, ...current]);
    };
    socket.on('booking_accepted', updateBooking);
    socket.on('booking_rejected', updateBooking);
    return () => {
      socket.off('booking_accepted', updateBooking);
      socket.off('booking_rejected', updateBooking);
    };
  }, [socket]);

  return (
    <div className="min-h-screen bg-surface py-12">
      <div className="container-custom">
        <div className="mb-8 max-w-2xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">Find your next helping hand</p>
          <h1 className="text-4xl font-bold text-secondary">Hire trusted workers nearby</h1>
          <p className="mt-3 text-slate-600">Search available professionals by service and location. Requests remain pending until the worker responds.</p>
        </div>

        <form onSubmit={search} className="mb-10 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_1fr_auto]">
          <label className="flex items-center gap-3 rounded-lg border border-slate-300 px-4 py-2.5 focus-within:border-primary">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="sr-only">Current location or city</span>
            <input value={city} onChange={(event) => setCity(event.target.value)} className="w-full outline-none" placeholder="Current location or city" />
          </label>
          <label className="flex items-center gap-3 rounded-lg border border-slate-300 px-4 py-2.5 focus-within:border-primary">
            <UserRound className="h-5 w-5 text-primary" />
            <span className="sr-only">Choose a skill</span>
            <select value={skill} onChange={(event) => setSkill(event.target.value)} className="w-full bg-transparent outline-none">
              <option value="">All skills</option>
              {SKILLS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <button type="submit" disabled={loading} className="btn-primary gap-2 px-6">
            <Search className="h-4 w-4" /> {loading ? 'Searching...' : 'Search workers'}
          </button>
        </form>

        {error && <div className="mb-6 flex items-center gap-2 rounded-lg bg-danger/10 p-4 text-sm text-danger"><AlertCircle className="h-5 w-5" />{error}</div>}
        <div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-bold text-secondary">Available workers</h2><span className="text-sm text-slate-500">{workers.length} found</span></div>
        {searched && workers.length === 0 && !loading && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">No available workers match that search.</div>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {workers.map((worker) => <WorkerCard key={worker._id} worker={worker} />)}
        </div>
        {bookings.length > 0 && <section className="mt-12"><h2 className="mb-4 text-2xl font-bold text-secondary">Your booking requests</h2><div className="grid gap-4 lg:grid-cols-2">{bookings.map((booking) => <BookingStatus key={booking._id} booking={booking} />)}</div></section>}
      </div>
    </div>
  );
};

const WorkerCard = ({ worker }) => (
  <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
    <div className="flex items-center gap-4 bg-secondary p-5 text-white">
      <img src={worker.profilePhotoUrl} alt={worker.userId?.fullName || 'Worker'} className="h-16 w-16 rounded-full border-2 border-primary object-cover" />
      <div><h3 className="font-semibold">{worker.userId?.fullName || 'ODForce worker'}</h3><p className="text-sm text-slate-300">{worker.occupation}</p></div>
    </div>
    <div className="space-y-4 p-5">
      <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-1 text-slate-500"><Star className="h-4 w-4 fill-warning text-warning" />{worker.rating?.toFixed(1) || '0.0'} ({worker.totalReviews || 0})</span><span className="font-semibold text-primary">₹{worker.hourlyCharge}/hr</span></div>
      <div className="flex flex-wrap gap-2">{worker.skills?.slice(0, 3).map((item) => <span key={item} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{item}</span>)}</div>
      <p className="text-sm text-slate-500">{worker.city}, {worker.state} · {worker.experienceYears} years experience</p>
      <Link to={`/dashboard/worker/${worker._id}`} className="btn-secondary w-full">View profile</Link>
    </div>
  </article>
);

const BookingStatus = ({ booking }) => <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold text-secondary">{booking.workerId?.userId?.fullName || 'Worker request'}</h3><p className="mt-1 text-sm text-slate-500">{booking.bookingType === 'hourly' ? `${booking.duration} hour(s)` : 'Full day'} · ₹{booking.estimatedPayment}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${booking.status === 'accepted' ? 'bg-success/10 text-success' : booking.status === 'rejected' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>{booking.status}</span></div><p className="mt-3 text-sm text-slate-500">{new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}</p></article>;

export default CustomerDashboard;
