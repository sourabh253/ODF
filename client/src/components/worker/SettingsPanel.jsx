import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import { Settings, Lock, Bell, Eye, AlertCircle, Check } from 'lucide-react';

const SettingsPanel = ({ user: authUser }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('password');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [notifications, setNotifications] = useState({
    bookingRequests: true,
    paymentUpdates: true,
    promotions: false,
  });

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setSaving(true);
    try {
      await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword, user.token);
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password' });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Eye },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary mb-6">Settings</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-primary text-white'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {message.text && (
        <div className={`p-3 rounded-lg mb-4 flex items-center gap-2 text-sm ${
          message.type === 'error' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
        }`}>
          {message.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md">
          <h3 className="font-semibold text-secondary mb-4">Change Password</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 mt-1 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 mt-1 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 mt-1 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
              />
            </div>
            <button type="submit" disabled={saving} className="btn-primary text-sm">
              {saving ? 'Saving...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md">
          <h3 className="font-semibold text-secondary mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            {[
              { key: 'bookingRequests', label: 'Booking Requests', desc: 'Get notified when customers send booking requests' },
              { key: 'paymentUpdates', label: 'Payment Updates', desc: 'Get notified about payment and settlement updates' },
              { key: 'promotions', label: 'Promotions & Offers', desc: 'Receive promotional notifications and offers' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[key]}
                  onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                  className="mt-1 w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                />
                <div>
                  <p className="text-sm font-medium text-secondary">{label}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md">
          <h3 className="font-semibold text-secondary mb-4">Privacy Settings</h3>
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary" />
              <div>
                <p className="text-sm font-medium text-secondary">Show Profile to Customers</p>
                <p className="text-xs text-slate-400">Allow customers to find and view your profile</p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary" />
              <div>
                <p className="text-sm font-medium text-secondary">Show Location</p>
                <p className="text-xs text-slate-400">Display your city and state on your profile</p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary" />
              <div>
                <p className="text-sm font-medium text-secondary">Show Phone Number</p>
                <p className="text-xs text-slate-400">Allow customers to see your contact number</p>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
