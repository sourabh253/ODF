import { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CustomerAuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    location: { lat: null, lng: null, address: '' }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  
  const { loginCustomer, registerCustomer } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          location: {
            ...formData.location,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Location Captured'
          }
        });
        setLocationLoading(false);
        setError('');
      },
      () => {
        setError('Unable to retrieve your location. Please ensure location permissions are granted.');
        setLocationLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await loginCustomer({ email: formData.email, password: formData.password });
        onClose();
        navigate('/dashboard');
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (!formData.location.lat) {
          setError('Live location is required for registration');
          setLoading(false);
          return;
        }
        await registerCustomer({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          location: formData.location
        });
        onClose();
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden relative max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
          
          <h2 className="text-2xl font-bold text-secondary mb-6 mt-2">
            {isLogin ? 'Sign in to ODForce' : 'Create an Account'}
          </h2>

          {error && <div className="bg-danger/10 text-danger p-3 rounded-lg mb-4 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input type="text" name="fullName" required className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
                  <input type="tel" name="phone" required className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" onChange={handleChange} />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input type="email" name="email" required className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" onChange={handleChange} />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input type="password" name="password" required className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" onChange={handleChange} />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                  <input type="password" name="confirmPassword" required className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Service Location</label>
                  <button 
                    type="button"
                    onClick={handleGetLocation}
                    disabled={locationLoading}
                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-lg p-4 text-slate-600 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                  >
                    <MapPin className="w-5 h-5" />
                    {locationLoading ? 'Detecting Location...' : formData.location.lat ? 'Location Captured ✓' : 'Use My Live Location'}
                  </button>
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-6 py-3">
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Register'}
            </button>
          </form>

          <div className="mt-6 text-center text-slate-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAuthModal;
