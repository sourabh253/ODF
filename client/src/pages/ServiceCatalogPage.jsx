import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import catalogService from '../services/catalogService';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, ChevronRight } from 'lucide-react';

const ServiceCatalogPage = () => {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const mainCategory = searchParams.get('mainCategory');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cartItems, cartCategory, addToCart, updateQuantity, removeFromCart, clearCart, servicesTotal, INSPECTION_FEE, totalAmount, itemCount } = useCart();

  const [catalogTree, setCatalogTree] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [showCart, setShowCart] = useState(false);

  const category = decodeURIComponent(categorySlug || '');

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const tree = await catalogService.getCatalogTree(user.token, mainCategory || undefined);
        setCatalogTree(tree);

        // Find the services for this category
        let categoryData = null;
        if (mainCategory && tree[mainCategory]?.[category]) {
          categoryData = tree[mainCategory][category];
        } else {
          // Search across all main categories
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
        setError(err.response?.data?.message || 'Failed to load service catalog');
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchCatalog();
  }, [user?.token, category, mainCategory]);

  // Find subcategories for the current category
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

  const isInCart = (serviceId) => cartItems.some(item => item._id === serviceId);
  const getCartQuantity = (serviceId) => {
    const item = cartItems.find(item => item._id === serviceId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (service) => {
    addToCart({ ...service, category }, category);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => mainCategory ? navigate(`/dashboard/main/${encodeURIComponent(mainCategory)}`) : navigate('/dashboard')}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-secondary">{category}</h1>
              <p className="text-sm text-slate-500">Select services and add to cart</p>
            </div>
          </div>
          {itemCount > 0 && (
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-hover transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              Cart ({itemCount})
              <span className="absolute -top-2 -right-2 bg-warning text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            </button>
          )}
        </div>

        {error && (
          <div className="bg-danger/10 text-danger p-4 rounded-xl mb-6">{error}</div>
        )}

        <div className="flex gap-6">
          {/* Subcategory Sidebar */}
          <div className="w-56 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 sticky top-24">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Subcategories</h3>
              {subCategories.map(sub => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubCategory(sub)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
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
            {services.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <p>No services found in this subcategory.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {services.map(service => {
                  const inCart = isInCart(service._id);
                  const qty = getCartQuantity(service._id);

                  return (
                    <div key={service._id} className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${inCart ? 'border-primary ring-1 ring-primary/20' : 'border-slate-200 hover:shadow-md'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-secondary text-sm leading-tight">{service.serviceName}</h3>
                        {service.isQuotationOnly && (
                          <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full font-medium">Quote</span>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-xs text-slate-400 mb-3 line-clamp-2">{service.description}</p>
                      )}
                      <div className="flex items-end justify-between mt-auto">
                        <div>
                          <span className="text-lg font-bold text-primary">₹{service.price}</span>
                          <span className="text-xs text-slate-400 ml-1">/ {service.unit}</span>
                        </div>
                        {inCart ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(service._id, qty - 1)}
                              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-bold text-sm">{qty}</span>
                            <button
                              onClick={() => updateQuantity(service._id, qty + 1)}
                              className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(service)}
                            className="flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                          >
                            <Plus className="w-4 h-4" /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          {showCart && (
            <div className="w-80 shrink-0">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-secondary">Your Cart</h3>
                  <button onClick={() => setShowCart(false)} className="text-slate-400 hover:text-slate-600 text-sm">Close</button>
                </div>

                {cartItems.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">Cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                      {cartItems.map(item => (
                        <div key={item._id} className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{item.serviceName}</p>
                            <p className="text-xs text-slate-400">₹{item.price} × {item.quantity}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center hover:bg-primary/20 text-primary">
                              <Plus className="w-3 h-3" />
                            </button>
                            <button onClick={() => removeFromCart(item._id)} className="w-6 h-6 rounded bg-danger/10 flex items-center justify-center hover:bg-danger/20 text-danger ml-1">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 pt-3 space-y-2">
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>Services ({itemCount} items)</span>
                        <span>₹{servicesTotal}</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>Inspection Fee</span>
                        <span>₹{INSPECTION_FEE}</span>
                      </div>
                      <div className="flex justify-between font-bold text-secondary border-t border-slate-100 pt-2">
                        <span>Total</span>
                        <span>₹{totalAmount}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate('/dashboard/choose-worker')}
                      className="w-full btn-primary mt-4 flex items-center justify-center gap-2"
                    >
                      Choose Worker <ChevronRight className="w-4 h-4" />
                    </button>
                    <button onClick={clearCart} className="w-full text-sm text-slate-400 hover:text-danger mt-2 transition-colors">
                      Clear cart
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCatalogPage;
