import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import catalogService from '../services/catalogService';

const MainCategoryPage = () => {
  const { mainCategorySlug } = useParams();
  const { user } = useAuth();
  const mainCategory = decodeURIComponent(mainCategorySlug);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const cats = await catalogService.getCategories(user.token, mainCategory);
        setCategories(cats);
      } catch (err) {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.token, mainCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="container-custom">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-slate-200 rounded" />
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link to="/dashboard" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-secondary font-medium">{mainCategory}</span>
        </nav>

        <div className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-bold text-secondary">{mainCategory}</h1>
          <p className="mt-2 text-slate-600">Select a service category to browse available services and prices.</p>
        </div>

        {categories.length === 0 ? (
          <p className="text-slate-500">No service categories found.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categories.map(cat => (
              <Link
                key={cat}
                to={`/dashboard/category/${encodeURIComponent(cat)}?mainCategory=${encodeURIComponent(mainCategory)}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md hover:border-primary transition-all group"
              >
                <h3 className="font-semibold text-secondary text-sm group-hover:text-primary transition-colors">{cat}</h3>
                <div className="flex items-center gap-1 mt-3 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Browse services <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainCategoryPage;
