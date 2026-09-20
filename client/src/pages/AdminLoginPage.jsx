import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.loginAdmin({ email, password });
      localStorage.setItem('user', JSON.stringify(data));
      if (data.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        setError('Access denied — admin only');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-secondary">Admin Portal</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to access the admin dashboard</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          {error && (
            <div className="bg-danger/10 text-danger p-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 mt-1 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 mt-1 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm pr-10"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
