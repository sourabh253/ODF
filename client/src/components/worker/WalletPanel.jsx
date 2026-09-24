import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import walletService from '../../services/walletService';
import { Wallet, ArrowDownRight, ArrowUpRight, AlertCircle, Plus, Minus, X } from 'lucide-react';

const BankDetailsModal = ({ type, onSubmit, onClose, loading }) => {
  const [amount, setAmount] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    onSubmit({ amount: Number(amount), accountHolderName, accountNumber, ifsc });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-secondary">
            {type === 'credit' ? 'Add Funds (Credit)' : 'Withdraw Funds (Debit)'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          {/* SIMULATED BANKING — no real bank transfer occurs */}
          Simulated banking — bank details captured for reference only
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-secondary block mb-1">Amount (₹)</label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-secondary block mb-1">Account Holder Name</label>
            <input
              type="text"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-secondary block mb-1">Account Number</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="e.g. 1234567890"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-secondary block mb-1">IFSC Code</label>
            <input
              type="text"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value.toUpperCase())}
              placeholder="e.g. SBIN0001234"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading || !amount} className="btn-primary flex-1">
              {loading ? 'Processing...' : type === 'credit' ? 'Add Funds' : 'Withdraw'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const WalletPanel = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalType, setModalType] = useState(null); // 'credit' | 'debit' | null
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleCredit = async (data) => {
    setActionLoading(true);
    setError('');
    try {
      const updated = await walletService.credit(data, user.token);
      setWallet(prev => ({ ...prev, balance: updated.balance, transactions: updated.transactions }));
      setModalType(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Credit failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDebit = async (data) => {
    setActionLoading(true);
    setError('');
    try {
      const updated = await walletService.debit(data, user.token);
      setWallet(prev => ({ ...prev, balance: updated.balance, transactions: updated.transactions }));
      setModalType(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Debit failed');
    } finally {
      setActionLoading(false);
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
      </div>

      {/* Credit / Debit Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setModalType('credit')}
          className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 hover:border-success hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
            <Plus className="w-5 h-5 text-success" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-secondary text-sm">Credit</p>
            <p className="text-xs text-slate-400">Add funds</p>
          </div>
        </button>
        <button
          onClick={() => setModalType('debit')}
          className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 hover:border-danger hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center group-hover:bg-danger/20 transition-colors">
            <Minus className="w-5 h-5 text-danger" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-secondary text-sm">Debit</p>
            <p className="text-xs text-slate-400">Withdraw funds</p>
          </div>
        </button>
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

      {/* Bank Details Modal */}
      {modalType && (
        <BankDetailsModal
          type={modalType}
          onSubmit={modalType === 'credit' ? handleCredit : handleDebit}
          onClose={() => setModalType(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default WalletPanel;
