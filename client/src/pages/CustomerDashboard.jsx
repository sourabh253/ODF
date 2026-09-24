import { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, LayoutGrid, Scissors, SprayCan, Sparkles, Wind, Zap, LayoutList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import bookingService from '../services/bookingService';
import catalogService from '../services/catalogService';

const MAIN_CATEGORY_ICONS = {
  "Women's Salon & Spa": Scissors,
  "Men's Salon & Massage": Scissors,
  'Cleaning': SprayCan,
  'AC & Appliance Repair': Wind,
  'Electrician, Plumber & Carpenter': Zap,
};

const ALL_SERVICES_ENTRY = { _id: '__all__', name: 'All Services', icon: LayoutList };

const CustomerDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [bookings, setBookings] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setBookings(await bookingService.getMyBookings(user.token));
      } catch (err) {
        // Silent fail for initial load
      }
    };
    loadBookings();
  }, [user.token]);

  useEffect(() => {
    const loadMainCategories = async () => {
      try {
        const cats = await catalogService.getMainCategories(user.token);
        setMainCategories(cats);
      } catch (err) {
        setError('Failed to load service categories');
      }
    };
    loadMainCategories();
  }, [user.token]);

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

  const displayCategories = [
    ...mainCategories.map(name => ({ _id: name, name, icon: MAIN_CATEGORY_ICONS[name] || Sparkles })),
    ALL_SERVICES_ENTRY,
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container-custom">
        {/* Hero */}
        <div className="mb-8 max-w-2xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">Welcome, {user.fullName}</p>
          <h1 className="text-4xl font-bold text-secondary">What do you need done?</h1>
          <p className="mt-3 text-slate-600">Browse our service categories and book trusted workers in your area.</p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-danger/10 p-4 text-sm text-danger">
            <AlertCircle className="h-5 w-5" /> {error}
          </div>
        )}

        {/* Quick Links */}
        <div className="flex gap-3 mb-8">
          <Link to="/booking-dashboard" className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-primary hover:text-primary transition-colors">
            <LayoutGrid className="w-4 h-4" /> My Bookings
            {activeBookings.length > 0 && (
              <span className="bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{activeBookings.length}</span>
            )}
          </Link>
        </div>

        {/* Active Bookings Banner */}
        {activeBookings.length > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-8">
            <h3 className="font-bold text-secondary mb-3">Active Bookings</h3>
            <div className="space-y-2">
              {activeBookings.slice(0, 3).map(booking => (
                <div key={booking._id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {booking.workerId?.userId?.fullName || booking.workerId?.occupation || 'Worker'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {booking.selectedServices?.map(s => s.serviceName).join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
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
                      <Link to="/booking-dashboard" className="text-xs text-primary font-medium hover:underline">Confirm</Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Service Categories */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-secondary mb-4">Browse Services</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {displayCategories.map(cat => {
            const IconComponent = cat.icon;
            const linkTo = cat._id === '__all__'
              ? '/dashboard/search'
              : `/dashboard/main/${encodeURIComponent(cat.name)}`;
            return (
              <Link
                key={cat._id}
                to={linkTo}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md hover:border-primary transition-all group"
              >
                <div className="mb-3 text-primary"><IconComponent className="w-8 h-8" strokeWidth={1.5} /></div>
                <h3 className="font-semibold text-secondary text-sm group-hover:text-primary transition-colors">{cat.name}</h3>
                <div className="flex items-center gap-1 mt-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Browse services <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
