import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertCircle, ChevronRight, RefreshCw } from 'lucide-react';
import catalogService from '../services/catalogService';
import CategoryTile from '../components/catalog/CategoryTile';
import { QuickCategorySkeleton } from '../components/catalog/Skeletons';
import { categoryLink } from '../utils/catalogLinks';

const MainCategoryPage = () => {
  const { mainCategorySlug } = useParams();
  const mainCategory = decodeURIComponent(mainCategorySlug);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const cats = await catalogService.getCategories(undefined, mainCategory);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch {
      setError('Could not load categories for this section.');
    } finally {
      setLoading(false);
    }
  }, [mainCategory]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container-custom">
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-secondary">{mainCategory}</span>
        </nav>

        <div className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-bold text-secondary">{mainCategory}</h1>
          <p className="mt-2 text-slate-600">
            Select a service category to browse available services and prices.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
            <button
              type="button"
              onClick={load}
              className="ml-auto inline-flex items-center gap-1.5 font-semibold underline"
            >
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <QuickCategorySkeleton key={item} />
            ))}
          </div>
        ) : categories.length === 0 && !error ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <p className="font-semibold text-secondary">No service categories found</p>
            <p className="mt-1 text-sm text-slate-400">Try another category from the home page.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat) => (
              <CategoryTile
                key={cat}
                name={cat}
                to={categoryLink(cat, mainCategory)}
                description="View services & prices"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainCategoryPage;
