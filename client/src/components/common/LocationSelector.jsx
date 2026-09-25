import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ChevronDown, Loader2, MapPin, Navigation, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LOCATION_KEY = 'odf_location';

const readSavedLocation = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCATION_KEY)) || null;
  } catch {
    return null;
  }
};

const LocationSelector = () => {
  const { user } = useAuth();
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(readSavedLocation);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const profileAddress = user?.location?.address;
  const label = profileAddress || saved?.label || 'Set location';

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Location is not supported by this browser.');
      return;
    }
    setError('');
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: 'Current location',
        };
        localStorage.setItem(LOCATION_KEY, JSON.stringify(next));
        setSaved(next);
        setDetecting(false);
        setOpen(false);
      },
      () => {
        setDetecting(false);
        setError('Location permission denied. You can still browse every service.');
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Choose your location"
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors max-w-[10rem]"
      >
        <MapPin className="w-4 h-4 shrink-0 text-primary" />
        <span className="truncate">{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10 z-50">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className="text-sm font-bold text-secondary">Your location</p>
              <p className="text-xs text-slate-400">Used to show services available near you.</p>
            </div>
            <button
              type="button"
              aria-label="Close location menu"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {(profileAddress || saved) && (
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/10 px-3 py-2.5">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-medium text-secondary truncate">{label}</span>
            </div>
          )}

          <button
            type="button"
            onClick={detectLocation}
            disabled={detecting}
            className="w-full btn-primary py-2.5 text-sm"
          >
            {detecting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Detecting…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Navigation className="w-4 h-4" /> Use my live location
              </span>
            )}
          </button>

          {error && <p className="mt-2 text-xs text-danger">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
