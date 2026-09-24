import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import customerService from '../services/customerService';
import bookingService from '../services/bookingService';
import { MapPin, Star, ArrowLeft, ShoppingCart, Send, CheckCircle, AlertCircle, X, Clock, Briefcase } from 'lucide-react';

const WorkerProfileModal = ({ worker, onClose, onSendRequest, sending }) => {
  if (!worker) return null;
  const user_ = worker.userId || {};

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-hover p-6 text-white rounded-t-2xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <img
              src={worker.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user_.fullName)}&background=fff&color=15803D`}
              alt={user_.fullName}
              className="w-16 h-16 rounded-full object-cover border-3 border-white/30 shadow-lg"
            />
            <div>
              <h2 className="text-xl font-bold">{user_.fullName}</h2>
              <p className="text-white/80 text-sm">{worker.occupation}</p>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{worker.rating?.toFixed(1) || '0.0'}</span>
                <span className="text-white/60">|</span>
                <span className="text-sm">{worker.totalReviews || 0} reviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-5">
          {/* Quick Info */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <Briefcase className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-slate-400">Experience</p>
              <p className="text-sm font-semibold">{worker.experienceYears || 0} yrs</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-slate-400">Hours</p>
              <p className="text-sm font-semibold">{worker.workingHours || '—'}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <MapPin className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-slate-400">City</p>
              <p className="text-sm font-semibold">{worker.city || '—'}</p>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(worker.skills || []).map(skill => (
                <span key={skill} className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Location</h3>
            <p className="text-sm text-slate-700">{worker.address}, {worker.city}, {worker.state} - {worker.pinCode}</p>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${worker.isAvailable ? 'bg-success' : 'bg-slate-300'}`}></div>
            <span className={`text-sm font-medium ${worker.isAvailable ? 'text-success' : 'text-slate-400'}`}>
              {worker.isAvailable ? 'Available now' : 'Currently offline'}
            </span>
          </div>

          {/* Send Request Button */}
          <button
            onClick={() => onSendRequest(worker)}
            disabled={sending || !worker.isAvailable}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
};

const WorkerSelectionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cartItems, cartCategory, servicesTotal, INSPECTION_FEE, totalAmount, itemCount, clearCart } = useCart();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [sending, setSending] = useState(false);
  const [bookingSent, setBookingSent] = useState(false);
  const [modalWorker, setModalWorker] = useState(null);

  useEffect(() => {
    if (!cartCategory) {
      navigate('/dashboard');
      return;
    }
    const fetchWorkers = async () => {
      try {
        const data = await customerService.searchWorkers({ skill: cartCategory }, user.token);
        setWorkers(data.filter(w => w.isAvailable));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load workers');
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchWorkers();
  }, [cartCategory, user?.token]);

  const handleSendRequest = async (worker) => {
    if (!worker) return;
    setSending(true);
    setError('');
    try {
      await bookingService.createBooking({
        workerId: worker._id,
        selectedServices: cartItems.map(item => ({
          serviceId: item._id,
          quantity: item.quantity,
        })),
        customerLocation: user.location || { address: 'Location not set' },
      }, user.token);
      setBookingSent(true);
      setSelectedWorker(worker);
      setModalWorker(null);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send booking request');
    } finally {
      setSending(false);
    }
  };

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
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> <span className="text-sm font-medium">Back</span>
        </button>

        <h1 className="text-2xl font-bold text-secondary mb-2">Choose Your Worker</h1>
        <p className="text-slate-500 mb-6">Showing available workers for <span className="font-semibold text-primary">{cartCategory}</span></p>

        {error && (
          <div className="bg-danger/10 text-danger p-4 rounded-xl mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        {bookingSent ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-secondary mb-2">Request Sent!</h2>
            <p className="text-slate-500 mb-6">Your booking request has been sent to {selectedWorker?.userId?.fullName}. You will be notified when they respond.</p>
            <button onClick={() => navigate('/dashboard')} className="btn-primary">Back to Dashboard</button>
          </div>
        ) : (
          <>
            {/* Cart Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
              <h3 className="font-bold text-secondary mb-3 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" /> Your Selection ({itemCount} items)
              </h3>
              <div className="space-y-2 mb-3">
                {cartItems.map(item => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.serviceName} × {item.quantity}</span>
                    <span className="font-medium">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between text-sm text-slate-500">
                <span>Inspection Fee</span><span>₹{INSPECTION_FEE}</span>
              </div>
              <div className="flex justify-between font-bold text-secondary mt-2">
                <span>Total</span><span>₹{totalAmount}</span>
              </div>
            </div>

            {/* Worker List */}
            {workers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                <p className="text-slate-500 mb-2">No available workers found for this category.</p>
                <p className="text-sm text-slate-400">Try again later or choose a different category.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {workers.map(worker => {
                  return (
                    <div
                      key={worker._id}
                      onClick={() => setModalWorker(worker)}
                      className="bg-white rounded-2xl border-2 border-slate-200 hover:border-primary shadow-sm p-5 cursor-pointer transition-all hover:shadow-md hover:border-primary"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={worker.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.userId?.fullName)}&background=15803D&color=fff`}
                          alt={worker.userId?.fullName}
                          className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-secondary">{worker.userId?.fullName}</h3>
                          <p className="text-sm text-slate-500">{worker.occupation}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                            <span className="text-sm">{worker.rating?.toFixed(1) || '0.0'}</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-sm text-slate-500">{worker.experienceYears} yrs</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {worker.skills?.slice(0, 3).map(skill => (
                          <span key={skill} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{skill}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                        <MapPin className="w-3 h-3" /> {worker.city}, {worker.state}
                      </div>
                      <p className="text-xs text-primary mt-2 font-medium">View Profile & Send Request →</p>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Worker Profile Modal */}
      {modalWorker && (
        <WorkerProfileModal
          worker={modalWorker}
          onClose={() => setModalWorker(null)}
          onSendRequest={handleSendRequest}
          sending={sending}
        />
      )}
    </div>
  );
};

export default WorkerSelectionPage;
