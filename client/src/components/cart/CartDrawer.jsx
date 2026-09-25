import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { openAuthModal } from '../../services/authModal';
import { getServiceImage } from '../../data/serviceImages';

const CartDrawer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems,
    cartCategory,
    updateQuantity,
    removeFromCart,
    clearCart,
    servicesTotal,
    INSPECTION_FEE,
    totalAmount,
    itemCount,
  } = useCart();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCheckout = () => {
    setOpen(false);
    if (user && user.role === 'customer') {
      navigate('/dashboard/choose-worker');
    } else {
      openAuthModal();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open cart, ${itemCount} items`}
        className="relative flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors"
      >
        <ShoppingCart className="w-5 h-5" />
        {itemCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[1.15rem] h-[1.15rem] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-secondary/40 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          <aside
            role="dialog"
            aria-label="Your cart"
            className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            <header className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-secondary flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" /> Your cart
                </h2>
                {cartCategory && cartItems.length > 0 && (
                  <p className="text-xs text-slate-400">{cartCategory}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close cart"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {cartItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                  <ShoppingCart className="w-9 h-9 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-2">Your cart is empty</h3>
                <p className="text-sm text-slate-500 mb-6">
                  Browse our service categories and add the jobs you need done.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate('/#services');
                  }}
                  className="btn-primary py-2.5 px-6"
                >
                  Explore services
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex gap-3 rounded-2xl border border-slate-200 p-3"
                    >
                      <img
                        src={getServiceImage(item)}
                        alt=""
                        loading="lazy"
                        className="w-16 h-16 rounded-xl object-cover bg-slate-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-secondary truncate">{item.serviceName}</p>
                        <p className="text-xs text-slate-400 mb-2">
                          ₹{item.price} / {item.unit}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={`Decrease ${item.serviceName} quantity`}
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold text-secondary">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase ${item.serviceName} quantity`}
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Remove ${item.serviceName}`}
                            onClick={() => removeFromCart(item._id)}
                            className="ml-auto w-7 h-7 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger flex items-center justify-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <footer className="border-t border-slate-100 px-5 py-4 space-y-2">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Services ({itemCount} items)</span>
                    <span>₹{servicesTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Inspection fee</span>
                    <span>₹{INSPECTION_FEE}</span>
                  </div>
                  <div className="flex justify-between font-bold text-secondary text-base border-t border-slate-100 pt-2">
                    <span>Total</span>
                    <span>₹{totalAmount}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full btn-primary py-3 mt-2 text-sm"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {user ? 'Choose Worker' : 'Sign in to continue'}
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="w-full text-xs text-slate-400 hover:text-danger transition-colors py-1"
                  >
                    Clear cart
                  </button>
                </footer>
              </>
            )}
          </aside>
        </div>
      )}
    </>
  );
};

export default CartDrawer;
