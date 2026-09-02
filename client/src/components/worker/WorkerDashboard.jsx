import { useState, useEffect } from 'react';
import {
  User, Settings, Palette, Wallet, BarChart2, ClipboardList,
  Star, Bell, LogOut, Menu, X, Power, AlertCircle, Pencil, Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import workerService from '../../services/workerService';
import WorkRequestsPanel from './WorkRequestsPanel';

// ─── Placeholder Panel ───────────────────────────────────────────
const PlaceholderPanel = ({ title, icon: Icon, phase }) => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-slate-400" />
    </div>
    <h3 className="text-xl font-bold text-slate-700 mb-2">{title}</h3>
    <p className="text-slate-400 text-sm max-w-xs">
      This panel is fully functional in <span className="font-semibold text-primary">{phase}</span>.
      Check back after that phase is complete.
    </p>
  </div>
);

// ─── Profile Panel ───────────────────────────────────────────────
const ProfilePanel = ({ worker, user, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    occupation: worker?.occupation || '',
    hourlyCharge: worker?.hourlyCharge || '',
    fullDayCharge: worker?.fullDayCharge || '',
    workingHours: worker?.workingHours || '',
    address: worker?.address || '',
    city: worker?.city || '',
    state: worker?.state || '',
    pinCode: worker?.pinCode || '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (Number(form.hourlyCharge) < 300) {
      setError('Minimum hourly charge is ₹300');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const updated = await workerService.updateProfile({
        ...form,
        hourlyCharge: Number(form.hourlyCharge),
        fullDayCharge: Number(form.fullDayCharge),
      }, user.token);
      onUpdate(updated);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-800 bg-white text-sm';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-secondary">My Profile</h2>
        {!editing
          ? <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-2 text-sm">
              <Pencil className="w-4 h-4" /> Edit Profile
            </button>
          : <div className="flex gap-2">
              <button onClick={() => { setEditing(false); setError(''); }} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                <Check className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
        }
      </div>

      {error && (
        <div className="bg-danger/10 text-danger p-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4" />{error}
        </div>
      )}

      {/* Profile Header */}
      <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-200 mb-6">
        <img
          src={worker?.profilePhotoUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.fullName)}
          alt={user?.fullName}
          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow"
        />
        <div>
          <h3 className="text-xl font-bold text-secondary">{user?.fullName}</h3>
          <p className="text-slate-500">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
              {worker?.occupation}
            </span>
            <span className="flex items-center gap-1 text-sm text-slate-500">
              <Star className="w-4 h-4 fill-warning text-warning" />
              {worker?.rating?.toFixed(1) || '0.0'} ({worker?.totalReviews || 0} reviews)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Work Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h4 className="font-semibold text-slate-700 mb-4">Work Information</h4>
          <div className="space-y-3">
            <Field label="Occupation" name="occupation" value={form.occupation} editing={editing} onChange={handleChange} inputClass={inputClass} />
            <Field label="Hourly Charge (₹)" name="hourlyCharge" value={form.hourlyCharge} type="number" editing={editing} onChange={handleChange} inputClass={inputClass} hint="Min ₹300" />
            <Field label="Full Day Charge (₹)" name="fullDayCharge" value={form.fullDayCharge} type="number" editing={editing} onChange={handleChange} inputClass={inputClass} />
            <Field label="Working Hours" name="workingHours" value={form.workingHours} editing={editing} onChange={handleChange} inputClass={inputClass} />
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h4 className="font-semibold text-slate-700 mb-4">Location</h4>
          <div className="space-y-3">
            <Field label="Address" name="address" value={form.address} editing={editing} onChange={handleChange} inputClass={inputClass} />
            <Field label="City" name="city" value={form.city} editing={editing} onChange={handleChange} inputClass={inputClass} />
            <Field label="State" name="state" value={form.state} editing={editing} onChange={handleChange} inputClass={inputClass} />
            <Field label="PIN Code" name="pinCode" value={form.pinCode} editing={editing} onChange={handleChange} inputClass={inputClass} />
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h4 className="font-semibold text-slate-700 mb-4">Performance Stats</h4>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Jobs Done" value={worker?.totalJobsCompleted || 0} color="text-success" />
            <StatCard label="Rejected" value={worker?.totalJobsRejected || 0} color="text-danger" />
            <StatCard label="Rating" value={(worker?.rating || 0).toFixed(1)} color="text-warning" />
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h4 className="font-semibold text-slate-700 mb-4">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {(worker?.skills || []).map(skill => (
              <span key={skill} className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, name, value, type = 'text', editing, onChange, inputClass, hint }) => (
  <div>
    <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
    {editing
      ? <input type={type} name={name} value={value} onChange={onChange} className={`${inputClass} mt-1`} />
      : <p className="text-slate-800 font-medium mt-0.5">{value || '—'}</p>
    }
    {hint && editing && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
  </div>
);

const StatCard = ({ label, value, color }) => (
  <div className="bg-slate-50 rounded-lg p-3 text-center">
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
    <div className="text-xs text-slate-500 mt-1">{label}</div>
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'work-requests', label: 'Work Requests', icon: ClipboardList },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'ratings', label: 'Ratings', icon: Star },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'theme', label: 'Theme', icon: Palette },
];

const WorkerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dutyToggling, setDutyToggling] = useState(false);
  const [dashboardError, setDashboardError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await workerService.getMyProfile(user.token);
        setWorker(data);
      } catch (err) {
        setDashboardError(err.response?.data?.message || 'We could not load your profile. Please refresh and try again.');
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchProfile();
  }, [user]);

  const handleDutyToggle = async () => {
    if (!worker) return;
    setDutyToggling(true);
    try {
      const result = await workerService.updateAvailability(!worker.isAvailable, user.token);
      setWorker(prev => ({ ...prev, isAvailable: result.isAvailable }));
    } catch (err) {
      setDashboardError(err.response?.data?.message || 'Availability could not be updated. Please try again.');
    } finally {
      setDutyToggling(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderPanel = () => {
    switch (activePanel) {
      case 'profile':
        return <ProfilePanel worker={worker} user={user} onUpdate={setWorker} />;
      case 'work-requests':
        return <WorkRequestsPanel />;
      case 'wallet':
        return <PlaceholderPanel title="Wallet & Earnings" icon={Wallet} phase="Phase 7" />;
      case 'analytics':
        return <PlaceholderPanel title="Analytics" icon={BarChart2} phase="Phase 7" />;
      case 'ratings':
        return <PlaceholderPanel title="Ratings & Reviews" icon={Star} phase="Phase 7" />;
      case 'notifications':
        return <PlaceholderPanel title="Notifications" icon={Bell} phase="Phase 5" />;
      case 'settings':
        return <PlaceholderPanel title="Settings" icon={Settings} phase="Phase 7" />;
      case 'theme':
        return <PlaceholderPanel title="Theme" icon={Palette} phase="Phase 7" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-30 md:z-auto
        w-64 h-full bg-secondary text-white flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Worker Identity */}
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={worker?.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName)}&background=15803D&color=fff`}
              alt={user?.fullName}
              className="w-11 h-11 rounded-full object-cover border-2 border-primary"
            />
            <div>
              <p className="font-semibold text-sm leading-tight">{user?.fullName}</p>
              <p className="text-xs text-slate-400">{worker?.occupation || 'Worker'}</p>
            </div>
          </div>

          {/* Duty Toggle — prominent */}
          <button
            onClick={handleDutyToggle}
            disabled={dutyToggling}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              worker?.isAvailable
                ? 'bg-success/20 text-success border border-success/30 hover:bg-success/30'
                : 'bg-slate-700 text-slate-400 border border-slate-600 hover:bg-slate-600'
            } disabled:opacity-50`}
          >
            <Power className="w-4 h-4" />
            {dutyToggling ? 'Updating...' : worker?.isAvailable ? 'Duty ON — Go Offline' : 'Duty OFF — Go Online'}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActivePanel(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                activePanel === id
                  ? 'bg-primary/20 text-primary border-r-2 border-primary'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-600" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-bold text-slate-800">{NAV_ITEMS.find(n => n.id === activePanel)?.label || 'Dashboard'}</h1>
          </div>
          <div className={`hidden md:flex items-center gap-2 text-sm font-semibold ${worker?.isAvailable ? 'text-success' : 'text-slate-400'}`}>
            <div className={`w-2 h-2 rounded-full ${worker?.isAvailable ? 'bg-success animate-pulse' : 'bg-slate-400'}`} />
            {worker?.isAvailable ? 'Duty ON' : 'Duty OFF'}
          </div>
        </div>

        <div className="p-6 lg:p-8">
          {dashboardError && (
            <div className="mb-6 rounded-lg bg-danger/10 p-3 text-sm text-danger" role="alert">
              {dashboardError}
            </div>
          )}
          {renderPanel()}
        </div>
      </main>
    </div>
  );
};

export default WorkerDashboard;
