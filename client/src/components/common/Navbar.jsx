import { Link, useNavigate } from 'react-router-dom';
import { Globe, User, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import CustomerAuthModal from '../auth/CustomerAuthModal';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const languages = ['English', 'Hindi', 'Marathi', 'Telugu', 'Tamil', 'Malayalam', 'Gujarati'];

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container-custom h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            ODForce
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-slate-600 hover:text-primary font-medium transition-colors">Home</Link>
            <a href="/#services" className="text-slate-600 hover:text-primary font-medium transition-colors">Services</a>
            <a href="/#about" className="text-slate-600 hover:text-primary font-medium transition-colors">About</a>
            <a href="/#contact" className="text-slate-600 hover:text-primary font-medium transition-colors">Contact</a>
            <Link to="/help" className="text-slate-600 hover:text-primary font-medium transition-colors">Help</Link>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {!user || user.role === 'customer' ? (
              <Link to="/worker-portal" className="text-primary font-medium hover:text-primary-hover transition-colors">
                ODF for Job
              </Link>
            ) : null}
            
            <div className="relative">
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1 text-slate-600 hover:text-primary transition-colors p-2 rounded-lg hover:bg-slate-50"
              >
                <Globe className="w-5 h-5" />
              </button>
              
              {/* Language Dropdown - UI only for Phase 1 */}
              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary"
                      onClick={() => setIsLangOpen(false)}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              {user ? (
                <>
                  <button 
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <span className="font-bold">{user.fullName.charAt(0).toUpperCase()}</span>
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1">
                      <div className="px-4 py-2 border-b border-slate-100 mb-1">
                        <div className="text-sm font-bold text-slate-700 truncate">{user.fullName}</div>
                        <div className="text-xs text-slate-500 capitalize">{user.role}</div>
                      </div>
                      <Link 
                        to={user.role === 'worker' ? '/worker-dashboard' : '/dashboard'}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 mt-1 border-t border-slate-100"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <User className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-4 shadow-lg absolute w-full left-0">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-slate-600 font-medium py-2">Home</Link>
            <a href="/#services" onClick={() => setIsMenuOpen(false)} className="block text-slate-600 font-medium py-2">Services</a>
            <a href="/#about" onClick={() => setIsMenuOpen(false)} className="block text-slate-600 font-medium py-2">About</a>
            <a href="/#contact" onClick={() => setIsMenuOpen(false)} className="block text-slate-600 font-medium py-2">Contact</a>
            <Link to="/help" onClick={() => setIsMenuOpen(false)} className="block text-slate-600 font-medium py-2">Help</Link>
            
            <div className="h-px bg-slate-100 my-2"></div>
            
            {user ? (
              <>
                <Link to={user.role === 'worker' ? '/worker-dashboard' : '/dashboard'} onClick={() => setIsMenuOpen(false)} className="block text-slate-800 font-medium py-2">Dashboard</Link>
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="block text-danger font-medium py-2 w-full text-left">Sign Out</button>
              </>
            ) : (
              <>
                <button onClick={() => { setIsAuthModalOpen(true); setIsMenuOpen(false); }} className="block text-slate-800 font-medium py-2 w-full text-left">Customer Sign In</button>
                <Link to="/worker-portal" onClick={() => setIsMenuOpen(false)} className="block text-primary font-medium py-2">ODF for Job (Worker Portal)</Link>
              </>
            )}
          </div>
        )}
      </nav>
      
      <CustomerAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Navbar;
