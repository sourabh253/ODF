import { Link, useNavigate } from 'react-router-dom';
import { ClipboardList, Globe, HelpCircle, LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { subscribeAuthModal } from '../../services/authModal';
import CustomerAuthModal from '../auth/CustomerAuthModal';
import GlobalServiceSearch from '../search/GlobalServiceSearch';
import LocationSelector from './LocationSelector';
import CartDrawer from '../cart/CartDrawer';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const languages = ['English', 'Hindi', 'Marathi', 'Telugu', 'Tamil', 'Malayalam', 'Gujarati'];

  useEffect(() => subscribeAuthModal(() => setIsAuthModalOpen(true)), []);

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="container-custom flex h-16 items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="ODForce home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white shadow-sm shadow-primary/30">
              O
            </span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="text-lg font-bold text-secondary">ODForce</span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                On demand services
              </span>
            </span>
          </Link>

          {/* ODF for Job — the single header button, next to the logo */}
          <Link
            to="/odf-for-job"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-xs font-bold text-primary transition-colors hover:border-primary hover:bg-primary/10"
          >
            ODF for Job
          </Link>

          {/* Desktop search */}
          <div className="hidden min-w-0 flex-1 lg:block">
            <GlobalServiceSearch variant="navbar" />
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <div className="hidden lg:block">
              <LocationSelector />
            </div>

            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                aria-label="Choose language"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary"
              >
                <Globe className="w-5 h-5" />
              </button>
              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-100 bg-white py-1 shadow-xl">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      className={`block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-slate-50 hover:text-primary ${
                        language === lang ? 'bg-primary/5 font-semibold text-primary' : 'text-slate-700'
                      }`}
                      onClick={() => {
                        setLanguage(lang);
                        setIsLangOpen(false);
                      }}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <CartDrawer />

            <div className="relative">
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    aria-label="Open account menu"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary transition-colors hover:bg-primary/20"
                  >
                    {user.fullName?.charAt(0).toUpperCase()}
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-100 bg-white py-1 shadow-xl">
                      <div className="border-b border-slate-100 px-4 py-2">
                        <div className="truncate text-sm font-bold text-slate-700">{user.fullName}</div>
                        <div className="text-xs capitalize text-slate-500">{user.role}</div>
                      </div>
                      <Link
                        to={user.role === 'worker' ? '/worker-dashboard' : '/dashboard'}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-primary"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                      {user.role === 'customer' && (
                        <Link
                          to="/booking-dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-primary"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <ClipboardList className="h-4 w-4" /> My Bookings
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-1 flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2 text-sm text-danger transition-colors hover:bg-danger/10"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hidden h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-secondary transition-colors hover:border-primary hover:text-primary sm:flex"
                >
                  <User className="h-4 w-4" /> Sign in
                </button>
              )}
            </div>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-50 lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Desktop links */}
        <div className="hidden border-t border-slate-100 lg:block">
          <div className="container-custom flex items-center gap-6 py-2 text-sm font-medium text-slate-600">
            <Link to="/" className="transition-colors hover:text-primary">
              Home
            </Link>
            <Link to="/#services" className="transition-colors hover:text-primary">
              Services
            </Link>
            <Link to="/help" className="transition-colors hover:text-primary">
              Help
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="border-t border-slate-100 bg-white px-6 py-4 shadow-lg lg:hidden">
            <div className="mb-4">
              <GlobalServiceSearch variant="navbar" />
            </div>
            <div className="mb-4 lg:hidden">
              <LocationSelector />
            </div>
            <div className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              <Link to="/" onClick={closeMenu} className="rounded-lg py-2 hover:text-primary">
                Home
              </Link>
              <Link to="/#services" onClick={closeMenu} className="rounded-lg py-2 hover:text-primary">
                Services
              </Link>
              <Link to="/help" onClick={closeMenu} className="rounded-lg py-2 hover:text-primary">
                Help
              </Link>

              <div className="my-2 h-px bg-slate-100" />

              {user ? (
                <>
                  <Link
                    to={user.role === 'worker' ? '/worker-dashboard' : '/dashboard'}
                    onClick={closeMenu}
                    className="flex items-center gap-2 rounded-lg py-2"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  {user.role === 'customer' && (
                    <Link to="/booking-dashboard" onClick={closeMenu} className="flex items-center gap-2 rounded-lg py-2">
                      <ClipboardList className="h-4 w-4" /> My Bookings
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      closeMenu();
                    }}
                    className="flex items-center gap-2 py-2 text-left text-danger"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    closeMenu();
                  }}
                  className="flex items-center gap-2 py-2 text-left font-semibold text-primary"
                >
                  <User className="h-4 w-4" /> Customer Sign In
                </button>
              )}

              <Link to="/help" onClick={closeMenu} className="flex items-center gap-2 py-2 text-slate-500">
                <HelpCircle className="h-4 w-4" /> Help & FAQ
              </Link>
            </div>
          </div>
        )}
      </nav>

      <CustomerAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Navbar;
