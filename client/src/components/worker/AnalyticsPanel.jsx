import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/bookingService';
import walletService from '../../services/walletService';
import { BarChart2, TrendingUp, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';

const AnalyticsPanel = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    completedJobs: 0,
    rejectedJobs: 0,
    cancelledJobs: 0,
    pendingJobs: 0,
    totalEarnings: 0,
    avgRating: 0,
    totalReviews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [bookings, wallet] = await Promise.all([
          bookingService.getMyBookings(user.token),
          walletService.getTransactions(user.token),
        ]);

        const completed = bookings.filter(b => b.status === 'completed');
        const earnings = completed.reduce((sum, b) => {
          const base = b.paymentMode === 'pay-before' ? (b.amountPaid ?? b.totalAmount) : b.totalAmount;
          const fee = Math.round(base * 0.10);
          return sum + (b.paymentMode === 'pay-before' ? base - fee : -fee);
        }, 0);

        setStats({
          totalJobs: bookings.length,
          completedJobs: completed.length,
          rejectedJobs: bookings.filter(b => b.status === 'rejected').length,
          cancelledJobs: bookings.filter(b => b.status === 'cancelled').length,
          pendingJobs: bookings.filter(b => b.status === 'pending').length,
          totalEarnings: wallet.balance || 0,
          avgRating: completed.length > 0
            ? (completed.reduce((sum, b) => sum + (b.workerId?.rating || 0), 0) / completed.length).toFixed(1)
            : '0.0',
          totalReviews: wallet.transactions?.length || 0,
        });
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchStats();
  }, [user?.token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Jobs', value: stats.totalJobs, icon: BarChart2, color: 'text-primary' },
    { label: 'Completed', value: stats.completedJobs, icon: CheckCircle, color: 'text-success' },
    { label: 'Rejected', value: stats.rejectedJobs, icon: XCircle, color: 'text-danger' },
    { label: 'Cancelled', value: stats.cancelledJobs, icon: XCircle, color: 'text-slate-400' },
    { label: 'Pending', value: stats.pendingJobs, icon: Clock, color: 'text-warning' },
    { label: 'Wallet Balance', value: `₹${stats.totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'text-success' },
  ];

  const completionRate = stats.totalJobs > 0
    ? ((stats.completedJobs / stats.totalJobs) * 100).toFixed(1)
    : '0.0';

  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary mb-6">Analytics</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className="text-sm text-slate-500">{label}</span>
            </div>
            <p className="text-2xl font-bold text-secondary">{value}</p>
          </div>
        ))}
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-bold text-secondary mb-4">Performance Summary</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-slate-500 mb-1">Completion Rate</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-success rounded-full transition-all"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <span className="text-sm font-bold text-secondary">{completionRate}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Acceptance Rate</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{
                    width: `${stats.totalJobs > 0
                      ? ((stats.completedJobs + stats.rejectedJobs) / stats.totalJobs * 100).toFixed(1)
                      : 0}%`
                  }}
                />
              </div>
              <span className="text-sm font-bold text-secondary">
                {stats.totalJobs > 0
                  ? ((stats.completedJobs + stats.rejectedJobs) / stats.totalJobs * 100).toFixed(1)
                  : '0.0'}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
