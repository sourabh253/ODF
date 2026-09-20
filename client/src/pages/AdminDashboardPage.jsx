import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';
import {
  LayoutDashboard, Users, Briefcase, Wallet, ShieldCheck,
  LogOut, Menu, X, ChevronRight, Check, XIcon, Clock, TrendingUp
} from 'lucide-react';

const AdminDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'workers', label: 'Workers', icon: Briefcase },
    { id: 'verifications', label: 'Verifications', icon: ShieldCheck },
    { id: 'wallets', label: 'Wallets', icon: Wallet },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  const renderPanel = () => {
    switch (activePanel) {
      case 'dashboard': return <DashboardPanel />;
      case 'customers': return <CustomersPanel />;
      case 'workers': return <WorkersPanel />;
      case 'verifications': return <VerificationsPanel />;
      case 'wallets': return <WalletsPanel />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed md:relative z-30 md:z-auto
        w-64 h-full bg-secondary text-white flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm">ODForce Admin</h2>
              <p className="text-xs text-slate-400">{user?.fullName}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActivePanel(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activePanel === id
                  ? 'bg-primary text-white'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
              {id === 'verifications' && <VerificationsBadge />}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-1">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h1 className="text-lg font-bold text-secondary capitalize">{activePanel}</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {renderPanel()}
        </main>
      </div>
    </div>
  );
};

// Badge showing pending verification count
const VerificationsBadge = () => {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminService.getPendingVerifications(user.token);
        setCount(data.length);
      } catch (err) { /* silent */ }
    };
    if (user?.token) load();
  }, [user?.token]);

  if (count === 0) return null;
  return (
    <span className="ml-auto bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full">
      {count}
    </span>
  );
};

// ─── Dashboard Panel ──────────────────────────────────────
const DashboardPanel = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setStats(await adminService.getDashboardStats(user.token));
      } catch (err) { /* silent */ }
      finally { setLoading(false); }
    };
    if (user?.token) load();
  }, [user?.token]);

  if (loading) return <div className="animate-pulse h-48 bg-slate-200 rounded-xl" />;
  if (!stats) return <p className="text-slate-400">Failed to load stats</p>;

  const cards = [
    { label: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'bg-primary/10 text-primary' },
    { label: 'Total Workers', value: stats.totalWorkers, icon: Briefcase, color: 'bg-info/10 text-info' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: TrendingUp, color: 'bg-warning/10 text-warning' },
    { label: 'Completed', value: stats.completedBookings, icon: Check, color: 'bg-success/10 text-success' },
    { label: 'Active Bookings', value: stats.activeBookings, icon: Clock, color: 'bg-info/10 text-info' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: Wallet, color: 'bg-success/10 text-success' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-slate-500">{label}</span>
          </div>
          <p className="text-2xl font-bold text-secondary">{value}</p>
        </div>
      ))}
    </div>
  );
};

// ─── Customers Panel ──────────────────────────────────────
const CustomersPanel = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setCustomers(await adminService.getCustomers(user.token));
      } catch (err) { /* silent */ }
      finally { setLoading(false); }
    };
    if (user?.token) load();
  }, [user?.token]);

  if (loading) return <div className="animate-pulse h-64 bg-slate-200 rounded-xl" />;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Phone</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map(c => (
              <tr key={c._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-secondary">{c.fullName}</td>
                <td className="px-4 py-3 text-slate-500">{c.email}</td>
                <td className="px-4 py-3 text-slate-500">{c.phone || '-'}</td>
                <td className="px-4 py-3 text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {customers.length === 0 && <p className="text-center py-8 text-slate-400">No customers yet</p>}
    </div>
  );
};

// ─── Workers Panel ──────────────────────────────────────
const WorkersPanel = () => {
  const { user } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setWorkers(await adminService.getWorkers(user.token));
      } catch (err) { /* silent */ }
      finally { setLoading(false); }
    };
    if (user?.token) load();
  }, [user?.token]);

  const handleToggle = async (userId) => {
    try {
      const result = await adminService.toggleWorkerStatus(userId, user.token);
      setWorkers(prev => prev.map(w =>
        w.userId?._id === userId ? { ...w, userId: { ...w.userId, isActive: result.isActive } } : w
      ));
    } catch (err) { /* silent */ }
  };

  if (loading) return <div className="animate-pulse h-64 bg-slate-200 rounded-xl" />;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Skills</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Verification</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {workers.map(w => (
              <tr key={w._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-secondary">{w.userId?.fullName || '-'}</td>
                <td className="px-4 py-3 text-slate-500">{w.userId?.email || '-'}</td>
                <td className="px-4 py-3 text-slate-500">{w.skills?.join(', ')}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    w.verificationStatus === 'verified' ? 'bg-success/10 text-success' :
                    w.verificationStatus === 'rejected' ? 'bg-danger/10 text-danger' :
                    'bg-warning/10 text-warning'
                  }`}>
                    {w.verificationStatus || 'pending'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    w.userId?.isActive ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {w.userId?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggle(w.userId?._id)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    {w.userId?.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {workers.length === 0 && <p className="text-center py-8 text-slate-400">No workers yet</p>}
    </div>
  );
};

// ─── Verifications Panel ──────────────────────────────────
const VerificationsPanel = () => {
  const { user } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    try {
      setWorkers(await adminService.getPendingVerifications(user.token));
    } catch (err) { /* silent */ }
    finally { setLoading(false); }
  };

  const handleVerify = async (workerId, status) => {
    try {
      await adminService.updateWorkerVerification(workerId, status, user.token);
      setWorkers(prev => prev.filter(w => w._id !== workerId));
    } catch (err) { /* silent */ }
  };

  if (loading) return <div className="animate-pulse h-64 bg-slate-200 rounded-xl" />;

  return (
    <div className="space-y-4">
      {workers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-success mx-auto mb-3 opacity-50" />
          <p className="text-slate-400">No pending verifications</p>
        </div>
      ) : (
        workers.map(w => (
          <div key={w._id} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={w.profilePhotoUrl}
                alt=""
                className="w-12 h-12 rounded-full object-cover bg-slate-100"
              />
              <div>
                <p className="font-semibold text-secondary">{w.userId?.fullName}</p>
                <p className="text-xs text-slate-400">{w.userId?.email}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {w.skills?.join(', ')} · {w.experienceYears}yr exp · {w.city}, {w.state}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVerify(w._id, 'verified')}
                className="flex items-center gap-1 bg-success/10 hover:bg-success/20 text-success px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Check className="w-4 h-4" /> Approve
              </button>
              <button
                onClick={() => handleVerify(w._id, 'rejected')}
                className="flex items-center gap-1 bg-danger/10 hover:bg-danger/20 text-danger px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <XIcon className="w-4 h-4" /> Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// ─── Wallets Panel ──────────────────────────────────────
const WalletsPanel = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjustModal, setAdjustModal] = useState(null);
  const [adjustForm, setAdjustForm] = useState({ amount: '', note: '' });
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setWallets(await adminService.getWallets(user.token));
      } catch (err) { /* silent */ }
      finally { setLoading(false); }
    };
    if (user?.token) load();
  }, [user?.token]);

  const handleAdjust = async () => {
    if (!adjustForm.amount || !adjustForm.note) return;
    setAdjusting(true);
    try {
      const result = await adminService.adjustWallet(adjustModal.workerUserId._id, Number(adjustForm.amount), adjustForm.note, user.token);
      setWallets(prev => prev.map(w => w._id === result._id ? result : w));
      setAdjustModal(null);
      setAdjustForm({ amount: '', note: '' });
    } catch (err) { /* silent */ }
    finally { setAdjusting(false); }
  };

  if (loading) return <div className="animate-pulse h-64 bg-slate-200 rounded-xl" />;

  return (
    <div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Worker</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Balance</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Transactions</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {wallets.map(w => (
                <tr key={w._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-secondary">{w.workerUserId?.fullName || '-'}</td>
                  <td className="px-4 py-3 font-bold text-secondary">₹{w.balance?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-500">{w.transactions?.length || 0}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setAdjustModal(w)}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {wallets.length === 0 && <p className="text-center py-8 text-slate-400">No wallets yet</p>}
      </div>

      {/* Adjust Modal */}
      {adjustModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-bold text-secondary mb-4">
              Adjust Wallet — {adjustModal.workerUserId?.fullName}
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Current balance: <span className="font-bold">₹{adjustModal.balance?.toLocaleString()}</span>
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500">Amount (negative to deduct)</label>
                <input
                  type="number"
                  value={adjustForm.amount}
                  onChange={(e) => setAdjustForm({ ...adjustForm, amount: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 mt-1 focus:outline-none focus:border-primary text-sm"
                  placeholder="+500 or -200"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Reason</label>
                <input
                  type="text"
                  value={adjustForm.note}
                  onChange={(e) => setAdjustForm({ ...adjustForm, note: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 mt-1 focus:outline-none focus:border-primary text-sm"
                  placeholder="Adjustment reason"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setAdjustModal(null); setAdjustForm({ amount: '', note: '' }); }}
                className="flex-1 border border-slate-300 text-slate-600 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjust}
                disabled={adjusting || !adjustForm.amount || !adjustForm.note}
                className="flex-1 bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover disabled:opacity-50"
              >
                {adjusting ? 'Saving...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
