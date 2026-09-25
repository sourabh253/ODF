import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import catalogService from '../services/catalogService';
import { openAuthModal } from '../services/authModal';
import { getCategoryImage } from '../data/serviceImages';
import ServiceCard from '../components/catalog/ServiceCard';
import { ServiceCardSkeleton } from '../components/catalog/Skeletons';
import { ArrowLeft, ChevronRight, RefreshCw, ShoppingCart, Trash2 } from 'lucide-react';

const ServiceCatalogPage = () => {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const mainCategory = searchParams.get('mainCategory');
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    cartItems,
    cartCategory,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    servicesTotal,
    INSPECTION_FEE,
    totalAmount,
    itemCount,
  } = useCart();

  const [catalogTree, setCatalogTree] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [showCart, setShowCart] = useState(false);

  const category = decodeURIComponent(categorySlug || '');

  useEffect(() => {
    let cancelled = false;
    const fetchCatalog = async () => {
      setLoading(true);
      setError('');
      try {
        const tree = await catalogService.getCatalogTree(undefined, mainCategory || undefined);
        if (cancelled) return;
        setCatalogTree(tree);

        let categoryData = null;
        if (mainCategory && tree[mainCategory]?.[category]) {
          categoryData = tree[mainCategory][category];
        } else {
          for (const mc of Object.keys(tree)) {
            if (tree[mc][category]) {
              categoryData = tree[mc][category];
              break;
            }
          }
        }

        if (categoryData) {
          const subs = Object.keys(categoryData);
          if (subs.length > 0 && !selectedSubCategory) {
            setSelectedSubCategory(subs[0]);
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load service catalog');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCatalog();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, mainCategory]);

  const getSubCategories = () => {
    if (mainCategory && catalogTree[mainCategory]?.[category]) {
      return Object.keys(catalogTree[mainCategory][category]);
    }
    for (const mc of Object.keys(catalogTree)) {
      if (catalogTree[mc][category]) {
        return Object.keys(catalogTree[mc][category]);
      }
    }
    return [];
  };

  const getServices = () => {
    if (!selectedSubCategory) return [];
    if (mainCategory && catalogTree[mainCategory]?.[category]?.[selectedSubCategory]) {
      return catalogTree[mainCategory][category][selectedSubCategory];
    }
    for (const mc of Object.keys(catalogTree)) {
      if (catalogTree[mc][category]?.[selectedSubCategory]) {
        return catalogTree[mc][category][selectedSubCategory];
      }
    }
    return [];
  };

  const subCategories = getSubCategories();
  const services = getServices();

  const getQuantity = (serviceId) => cartItems.find((item) => item._id === serviceId)?.quantity || 0;

  const handleAddToCart = (service) => {
    addToCart({ ...service, category }, category);
  };

  const handleChooseWorker = () => {
    if (user && user.role === 'customer') navigate('/dashboard/choose-worker');
    else openAuthModal();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container-custom py-8">
          <div className="mb-6 h-36 animate-pulse rounded-2xl bg-slate-200" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <ServiceCardSkeleton key={item} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="relative mb-6 overflow-hidden rounded-2xl border border-slate-200">
          <img
            src={getCategoryImage(category)}
            alt={category}
            className="h-40 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/85 via-secondary/55 to-transparent" />
          <div className="absolute inset-0 flex items-center gap-4 px-6">
            <button
              type="button"
              onClick={() =>
                mainCategory
                  ? navigate(`/dashboard/main/${encodeURIComponent(mainCategory)}`)
                  : navigate('/')
              }
              aria-label="Go back"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/30"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                {mainCategory || 'All services'}
              </p>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">{category}</h1>
              <p className="text-sm text-slate-200">Select services and add them to your cart</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="ml-auto inline-flex items-center gap-1.5 font-semibold underline"
            >
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        )}

        <div className="flex gap-6">
          {/* Subcategory Sidebar */}
          <div className="w-56 shrink-0">
            <div className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Subcategories
              </h3>
              {subCategories.length === 0 && (
                <p className="px-3 py-2 text-sm text-slate-400">No subcategories</p>
              )}
              {subCategories.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubCategory(sub)}
                  className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    selectedSubCategory === sub
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Services Grid */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                {services.length} service{services.length === 1 ? '' : 's'}
                {selectedSubCategory ? ` in ${selectedSubCategory}` : ''}
              </p>
              {itemCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowCart(!showCart)}
                  className="btn-primary relative py-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" /> Cart ({itemCount})
                  </span>
                </button>
              )}
            </div>

            {services.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
                <p className="font-semibold text-secondary">No services found here yet</p>
                <p className="mt-1 text-sm text-slate-400">
                  Try another subcategory or browse a different category.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {services.map((service) => {
                  const quantity = getQuantity(service._id);
                  return (
                    <ServiceCard
                      key={service._id}
                      service={{ ...service, category }}
                      mainCategory={mainCategory || undefined}
                      inCart={quantity > 0}
                      quantity={quantity}
                      onAdd={() => handleAddToCart(service)}
                      onIncrement={() => updateQuantity(service._id, quantity + 1)}
                      onDecrement={() => updateQuantity(service._id, quantity - 1)}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          {showCart && itemCount > 0 && (
            <div className="w-80 shrink-0">
              <div className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-secondary">Your Cart</h3>
                  <button
                    type="button"
                    onClick={() => setShowCart(false)}
                    className="text-sm text-slate-400 hover:text-slate-600"
                  >
                    Close
                  </button>
                </div>

                {cartCategory && (
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {cartCategory}
                  </p>
                )}

                <div className="mb-4 max-h-64 space-y-3 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-700">
                          {item.serviceName}
                        </p>
                        <p className="text-xs text-slate-400">
                          ₹{item.price} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 hover:bg-slate-200"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary hover:bg-primary/20"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          aria-label="Remove item"
                          onClick={() => removeFromCart(item._id)}
                          className="ml-1 flex h-6 w-6 items-center justify-center rounded bg-danger/10 text-danger hover:bg-danger/20"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Services ({itemCount} items)</span>
                    <span>₹{servicesTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Inspection Fee</span>
                    <span>₹{INSPECTION_FEE}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-secondary">
                    <span>Total</span>
                    <span>₹{totalAmount}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleChooseWorker}
                  className="btn-primary mt-4 w-full py-2.5"
                >
                  <span className="flex items-center justify-center gap-2">
                    {user ? 'Choose Worker' : 'Sign in to continue'}
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={clearCart}
                  className="mt-2 w-full text-sm text-slate-400 transition-colors hover:text-danger"
                >
                  Clear cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCatalogPage;
