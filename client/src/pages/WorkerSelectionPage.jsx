import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import customerService from '../services/customerService';
import bookingService from '../services/bookingService';
import { MapPin, Star, ArrowLeft, ShoppingCart, Send, CheckCircle, AlertCircle } from 'lucide-react';

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

  const handleSendRequest = async () => {
    if (!selectedWorker) return;
    setSending(true);
    setError('');
    try {
      await bookingService.createBooking({
        workerId: selectedWorker._id,
        selectedServices: cartItems.map(item => ({
          serviceId: item._id,
          quantity: item.quantity,
        })),
        customerLocation: user.location || { address: 'Location not set' },
      }, user.token);
      setBookingSent(true);
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
                  const isSelected = selectedWorker?._id === worker._id;
                  return (
                    <div
                      key={worker._id}
                      onClick={() => setSelectedWorker(worker)}
                      className={`bg-white rounded-2xl border-2 shadow-sm p-5 cursor-pointer transition-all ${
                        isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                      }`}
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
                        {isSelected && <CheckCircle className="w-6 h-6 text-primary shrink-0" />}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {worker.skills?.slice(0, 3).map(skill => (
                          <span key={skill} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{skill}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                        <MapPin className="w-3 h-3" /> {worker.city}, {worker.state}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedWorker && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSendRequest}
                  disabled={sending}
                  className="btn-primary flex items-center gap-2 px-8"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Sending...' : 'Send Booking Request'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WorkerSelectionPage;
