import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import customerService from '../services/customerService';
import bookingService from '../services/bookingService';
import { MapPin, Star, Clock, Briefcase, ArrowLeft, Send, CheckCircle, AlertCircle } from 'lucide-react';

const WorkerProfilePage = () => {
  const { workerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingSent, setBookingSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const data = await customerService.getWorker(workerId, user.token);
        setWorker(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load worker profile');
      } finally {
        setLoading(false);
      }
    };
    if (user?.token && workerId) fetchWorker();
  }, [workerId, user?.token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Error</h2>
          <p className="text-slate-500 mb-4">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  if (!worker) return null;

  const user_ = worker.userId || {};

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container-custom max-w-3xl">
        {/* Back button */}
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-hover p-6 text-white">
            <div className="flex items-center gap-5">
              <img
                src={worker.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user_.fullName)}&background=fff&color=15803D`}
                alt={user_.fullName}
                className="w-20 h-20 rounded-full object-cover border-4 border-white/30 shadow-lg"
              />
              <div>
                <h1 className="text-2xl font-bold">{user_.fullName}</h1>
                <p className="text-white/80">{worker.occupation}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {worker.rating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-white/60">|</span>
                  <span className="text-sm">{worker.totalReviews || 0} reviews</span>
                  <span className="text-white/60">|</span>
                  <span className="text-sm">{worker.totalJobsCompleted || 0} jobs done</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-6">
            {/* Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoCard icon={Briefcase} label="Experience" value={`${worker.experienceYears || 0} yrs`} />
              <InfoCard icon={Clock} label="Working Hours" value={worker.workingHours || '—'} />
              <InfoCard icon={MapPin} label="City" value={worker.city || '—'} />
              <InfoCard
                icon={Star}
                label="Availability"
                value={worker.isAvailable ? 'Available' : 'Offline'}
                valueClass={worker.isAvailable ? 'text-success' : 'text-slate-400'}
              />
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {(worker.skills || []).map(skill => (
                  <span key={skill} className="bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {(worker.languagesKnown || []).map(lang => (
                  <span key={lang} className="bg-slate-100 text-slate-600 text-sm px-3 py-1 rounded-full">
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Location</h3>
              <p className="text-slate-700">{worker.address}, {worker.city}, {worker.state} - {worker.pinCode}</p>
            </div>

            {/* Status Messages */}
            {bookingSent && (
              <div className="bg-success/10 text-success p-4 rounded-xl flex items-center gap-3">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Booking request sent! You will be notified when the worker responds.</span>
              </div>
            )}

            {!worker.isAvailable && !bookingSent && (
              <div className="bg-warning/10 text-warning p-4 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <span>This worker is currently offline and cannot accept new bookings.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon: Icon, label, value, valueClass = 'text-slate-800' }) => (
  <div className="bg-slate-50 rounded-xl p-3 text-center">
    <Icon className="w-5 h-5 text-primary mx-auto mb-1" />
    <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
    <p className={`text-sm font-semibold mt-0.5 ${valueClass}`}>{value}</p>
  </div>
);

export default WorkerProfilePage;
