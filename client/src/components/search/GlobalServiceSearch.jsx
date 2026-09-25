import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Loader2, Search, SearchX, X } from 'lucide-react';
import catalogService from '../../services/catalogService';
import { useAuth } from '../../context/AuthContext';
import useDebounce from '../../hooks/useDebounce';
import { getCategoryImage } from '../../data/serviceImages';
import { categoryLink } from '../../utils/catalogLinks';

const RECENT_KEY = 'odf_recent_searches';
const POPULAR_SEARCHES = [
  'AC Service & Repair',
  'Deep Cleaning',
  'Haircut',
  'Plumber',
  'Electrician',
  'Facial & Skin Care',
];

const readRecent = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveRecent = (term) => {
  const clean = term.trim();
  if (!clean) return readRecent();
  const next = [clean, ...readRecent().filter((t) => t.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
};

const GlobalServiceSearch = ({ variant = 'navbar' }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const requestRef = useRef(0);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useState(readRecent);
  const [retryTick, setRetryTick] = useState(0);

  const debouncedQuery = useDebounce(query, 300);
  const trimmed = debouncedQuery.trim();

  useEffect(() => {
    const requestId = ++requestRef.current;
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setError('');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');
    catalogService
      .searchServices(user?.token, trimmed)
      .then((data) => {
        if (requestId !== requestRef.current) return;
        setResults(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (requestId !== requestRef.current) return;
        if (!cancelled) setError('Search is unavailable right now.');
      })
      .finally(() => {
        if (requestId === requestRef.current) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [trimmed, user?.token, retryTick]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [trimmed]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const categories = useMemo(() => {
    const seen = new Set();
    return results
      .filter((service) => {
        if (!service.category || seen.has(service.category)) return false;
        seen.add(service.category);
        return true;
      })
      .slice(0, 5);
  }, [results]);

  const services = useMemo(() => {
    const term = trimmed.toLowerCase();
    const matches = results.filter((service) => service.serviceName?.toLowerCase().includes(term));
    return (matches.length ? matches : []).slice(0, 6);
  }, [results, trimmed]);

  const items = useMemo(
    () => [
      ...categories.map((service) => ({ service, type: 'category' })),
      ...services.map((service) => ({ service, type: 'service' })),
    ],
    [categories, services]
  );

  const go = (service) => {
    setRecent(saveRecent(query || service.category));
    setOpen(false);
    navigate(categoryLink(service.category, service.mainCategory));
  };

  const runSearch = (term) => {
    setQuery(term);
    setOpen(true);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) return setOpen(true);
      if (items.length) setActiveIndex((prev) => (prev + 1) % items.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (items.length) setActiveIndex((prev) => (prev <= 0 ? items.length - 1 : prev - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const target = items[activeIndex] || items[0];
      if (target) go(target.service);
      else if (trimmed) {
        setRecent(saveRecent(trimmed));
        setOpen(false);
      }
    } else if (event.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const showPanel = open;
  const showIdle = showPanel && !trimmed;
  const showResults = showPanel && !!trimmed;
  const isEmpty = showResults && !loading && !error && items.length === 0;

  const inputBase =
    variant === 'hero'
      ? 'h-14 w-full rounded-2xl border-2 border-slate-200 bg-white pl-12 pr-12 text-base text-secondary placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all'
      : 'h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm text-secondary placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all';

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search
          className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${
            variant === 'hero' ? 'w-5 h-5' : 'w-4 h-4'
          }`}
        />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls="global-search-listbox"
          aria-autocomplete="list"
          aria-label="Search for services"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={variant === 'hero' ? 'Search for AC repair, deep cleaning, haircut…' : 'Search services'}
          className={inputBase}
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className={variant === 'hero' ? 'w-5 h-5' : 'w-4 h-4'} />
          </button>
        )}
        {!query && loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
        )}
      </div>

      {showIdle && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10 z-50">
          {recent.length > 0 && (
            <div className="mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Recent searches
              </p>
              <div className="flex flex-wrap gap-2">
                {recent.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => runSearch(term)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Clock className="w-3 h-3" /> {term}
                  </button>
                ))}
              </div>
            </div>
          )}
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Popular searches
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => runSearch(term)}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-primary hover:text-primary transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {showResults && (
        <div
          id="global-search-listbox"
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 z-50"
        >
          {loading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-primary" /> Searching services…
            </div>
          )}

          {error && !loading && (
            <div className="px-4 py-3 text-sm">
              <p className="text-danger mb-2">{error}</p>
              <button
                type="button"
                onClick={() => setRetryTick((tick) => tick + 1)}
                className="text-primary font-semibold hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          {isEmpty && (
            <div className="px-4 py-6 text-center">
              <SearchX className="w-6 h-6 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-600 mb-1">No services found for “{trimmed}”.</p>
              <p className="text-xs text-slate-400">Try “AC repair”, “cleaning” or “haircut”.</p>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="p-2">
              {categories.length > 0 && (
                <p className="px-2 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Categories
                </p>
              )}
              {categories.map((service, index) => {
                const isActive = activeIndex === index;
                return (
                  <button
                    key={`cat-${service.category}`}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => go(service)}
                    className={`w-full flex items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors ${
                      isActive ? 'bg-primary/10' : 'hover:bg-slate-50'
                    }`}
                  >
                    <img
                      src={getCategoryImage(service.category)}
                      alt=""
                      loading="lazy"
                      className="w-9 h-9 rounded-lg object-cover bg-slate-100"
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-secondary truncate">
                        {service.category}
                      </span>
                      <span className="block text-xs text-slate-400 truncate">
                        {service.mainCategory}
                      </span>
                    </span>
                    <span className="text-xs font-medium text-primary shrink-0">View services</span>
                  </button>
                );
              })}

              {services.length > 0 && (
                <p className="px-2 pt-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Services
                </p>
              )}
              {services.map((service, index) => {
                const itemIndex = categories.length + index;
                const isActive = activeIndex === itemIndex;
                return (
                  <button
                    key={service._id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onMouseEnter={() => setActiveIndex(itemIndex)}
                    onClick={() => go(service)}
                    className={`w-full flex items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors ${
                      isActive ? 'bg-primary/10' : 'hover:bg-slate-50'
                    }`}
                  >
                    <img
                      src={getCategoryImage(service.category)}
                      alt=""
                      loading="lazy"
                      className="w-9 h-9 rounded-lg object-cover bg-slate-100"
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-slate-700 truncate">
                        {service.serviceName}
                      </span>
                      <span className="block text-xs text-slate-400 truncate">{service.category}</span>
                    </span>
                    <span className="text-sm font-bold text-primary shrink-0">
                      {service.isQuotationOnly ? 'Quote' : `₹${service.price}`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalServiceSearch;
