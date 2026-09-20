import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notificationService';
import { Bell, Check, CheckCheck, Clock } from 'lucide-react';

const TYPE_ICONS = {
  new_booking_request: '📩',
  booking_accepted: '✅',
  booking_rejected: '❌',
  work_completed: '🔧',
  booking_confirmed: '🎉',
  booking_cancelled: '🚫',
};

const NotificationsPanel = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications(user.token);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id, user.token);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      // silent
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(user.token);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      // silent
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-secondary">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover font-medium transition-colors"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <div
              key={notif._id}
              onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
              className={`bg-white rounded-xl border p-4 flex items-start gap-3 transition-all cursor-pointer ${
                notif.isRead
                  ? 'border-slate-200 opacity-70'
                  : 'border-primary/30 bg-primary/5 hover:shadow-sm'
              }`}
            >
              <span className="text-xl mt-0.5">{TYPE_ICONS[notif.type] || '📋'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`text-sm font-semibold ${notif.isRead ? 'text-slate-600' : 'text-secondary'}`}>
                    {notif.title}
                  </h4>
                  {!notif.isRead && <span className="w-2 h-2 bg-primary rounded-full shrink-0" />}
                </div>
                <p className="text-sm text-slate-500">{notif.message}</p>
                <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {formatTime(notif.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
