import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import walletService from '../../services/walletService';
import { Wallet, ArrowDownRight, ArrowUpRight, AlertCircle } from 'lucide-react';

const WalletPanel = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const data = await walletService.getTransactions(user.token);
        setWallet(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load wallet');
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchWallet();
  }, [user?.token]);

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) return;
    setWithdrawing(true);
    setError('');
    try {
      const updated = await walletService.withdraw(amount, user.token);
      setWallet(prev => ({ ...prev, balance: updated.balance, transactions: updated.transactions }));
      setWithdrawAmount('');
    } catch (err) {
      setError(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary mb-6">Wallet & Earnings</h2>

      {error && (
        <div className="bg-danger/10 text-danger p-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-primary to-primary-hover rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="w-8 h-8" />
          <span className="text-white/80 text-sm font-medium">Available Balance</span>
        </div>
        <p className="text-4xl font-bold">₹{(wallet?.balance || 0).toLocaleString()}</p>
        {wallet?.balance < 300 && (
          <p className="text-white/70 text-sm mt-2">Minimum ₹300 required to accept cash bookings</p>
        )}
      </div>

      {/* Withdraw */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <h3 className="font-semibold text-slate-700 mb-3">Withdraw Funds</h3>
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Enter amount"
            className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
          />
          <button
            onClick={handleWithdraw}
            disabled={withdrawing || !withdrawAmount}
            className="btn-primary text-sm px-4"
          >
            {withdrawing ? 'Processing...' : 'Withdraw'}
          </button>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-700 mb-4">Transaction History</h3>
        {!wallet?.transactions || wallet.transactions.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {wallet.transactions.map((tx, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.amount > 0 ? 'bg-success/10' : 'bg-danger/10'
                  }`}>
                    {tx.amount > 0 ? (
                      <ArrowDownRight className="w-4 h-4 text-success" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-danger" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{tx.note || tx.type}</p>
                    <p className="text-xs text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-success' : 'text-danger'}`}>
                  {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPanel;
