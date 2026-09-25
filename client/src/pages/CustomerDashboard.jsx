import { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, LayoutGrid, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import bookingService from '../services/bookingService';
import catalogService from '../services/catalogService';
import CategoryTile from '../components/catalog/CategoryTile';
import { QuickCategorySkeleton } from '../components/catalog/Skeletons';
import { mainCategoryLink } from '../utils/catalogLinks';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [bookings, setBookings] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.token) {
      setBookings([]);
      return;
    }
    const loadBookings = async () => {
      try {
        setBookings(await bookingService.getMyBookings(user.token));
      } catch (err) {
        // Silent fail for initial load
      }
    };
    loadBookings();
  }, [user?.token]);

  const loadMainCategories = async () => {
    setLoadingCategories(true);
    setError('');
    try {
      const cats = await catalogService.getMainCategories(user?.token);
      setMainCategories(cats);
    } catch (err) {
      setError('Failed to load service categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    loadMainCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  useEffect(() => {
    if (!socket) return;
    const handleBookingAccepted = (data) => {
      setBookings(prev => prev.map(b => b._id === data.bookingId ? { ...b, status: 'accepted' } : b));
    };
    const handleBookingRejected = (data) => {
      setBookings(prev => prev.map(b => b._id === data.bookingId ? { ...b, status: 'rejected', autoExpired: data.autoExpired } : b));
    };
    const handleWorkCompleted = (data) => {
      setBookings(prev => prev.map(b => b._id === data.bookingId ? { ...b, status: 'work-completed-pending-confirmation' } : b));
    };
    const handleBookingConfirmed = (data) => {
      setBookings(prev => prev.map(b => b._id === data.bookingId ? { ...b, status: 'confirmed' } : b));
    };
    const handleWorkStarted = (data) => {
      setBookings(prev => prev.map(b => b._id === data.bookingId ? { ...b, status: 'in-progress' } : b));
    };
    socket.on('booking_accepted', handleBookingAccepted);
    socket.on('booking_rejected', handleBookingRejected);
    socket.on('work_completed', handleWorkCompleted);
    socket.on('booking_confirmed', handleBookingConfirmed);
    socket.on('work_started', handleWorkStarted);
    return () => {
      socket.off('booking_accepted', handleBookingAccepted);
      socket.off('booking_rejected', handleBookingRejected);
      socket.off('work_completed', handleWorkCompleted);
      socket.off('booking_confirmed', handleBookingConfirmed);
      socket.off('work_started', handleWorkStarted);
    };
  }, [socket]);

  const activeBookings = bookings.filter(b => ['pending', 'accepted', 'confirmed', 'in-progress', 'work-completed-pending-confirmation'].includes(b.status));

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container-custom">
        {/* Hero */}
        <div className="mb-8 max-w-2xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
            {user ? `Welcome, ${user.fullName}` : 'Browse our catalog'}
          </p>
          <h1 className="text-4xl font-bold text-secondary">What do you need done?</h1>
          <p className="mt-3 text-slate-600">
            Browse our service categories and book trusted workers in your area.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
            <button
              type="button"
              onClick={loadMainCategories}
              className="ml-auto inline-flex items-center gap-1.5 font-semibold underline"
            >
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        )}

        {/* Quick Links */}
        {user && (
          <div className="mb-8 flex gap-3">
            <Link
              to="/booking-dashboard"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-primary hover:text-primary"
            >
              <LayoutGrid className="h-4 w-4" /> My Bookings
              {activeBookings.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {activeBookings.length}
                </span>
              )}
            </Link>
          </div>
        )}

        {/* Active Bookings Banner */}
        {activeBookings.length > 0 && (
          <div className="mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <h3 className="mb-3 font-bold text-secondary">Active Bookings</h3>
            <div className="space-y-2">
              {activeBookings.slice(0, 3).map(booking => (
                <div key={booking._id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700">
                      {booking.workerId?.userId?.fullName || booking.workerId?.occupation || 'Worker'}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {booking.selectedServices?.map(s => s.serviceName).join(', ')}
                    </p>
                  </div>
                  <div className="ml-3 flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      booking.status === 'accepted' ? 'bg-info/10 text-info' :
                      booking.status === 'confirmed' ? 'bg-success/10 text-success' :
                      booking.status === 'pending' ? 'bg-warning/10 text-warning' :
                      booking.status === 'in-progress' ? 'bg-info/10 text-info' :
                      'bg-warning/10 text-warning'
                    }`}>
                      {booking.status === 'accepted' ? 'Awaiting Payment' :
                       booking.status === 'confirmed' ? 'Confirmed' :
                       booking.status}
                    </span>
                    {booking.status === 'work-completed-pending-confirmation' && (
                      <Link to="/booking-dashboard" className="text-xs font-medium text-primary hover:underline">
                        Confirm
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Service Categories */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-secondary">Browse Services</h2>
          <span className="hidden text-sm text-slate-400 sm:block">
            Use the search bar above to find a specific service
          </span>
        </div>

        {loadingCategories ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <QuickCategorySkeleton key={item} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {mainCategories.map((name) => (
              <CategoryTile
                key={name}
                name={name}
                to={mainCategoryLink(name)}
                description="Browse services"
              />
            ))}
          </div>
        )}

        {!loadingCategories && !error && mainCategories.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
            <p className="font-semibold text-secondary">No service categories available</p>
            <p className="mt-1 text-sm text-slate-400">Please check back soon.</p>
          </div>
        )}

        {!loadingCategories && user && (
          <div className="mt-8 flex justify-end">
            <Link
              to="/booking-dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
            >
              View booking history <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
