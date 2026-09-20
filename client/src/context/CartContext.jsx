import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCategory, setCartCategory] = useState(null);

  const addToCart = useCallback((service, category) => {
    // If adding from a different category, clear the cart first
    if (cartCategory && cartCategory !== category) {
      setCartItems([{ ...service, quantity: 1 }]);
      setCartCategory(category);
      return;
    }

    setCartCategory(category);
    setCartItems(prev => {
      const existing = prev.find(item => item._id === service._id);
      if (existing) {
        return prev.map(item =>
          item._id === service._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...service, quantity: 1 }];
    });
  }, [cartCategory]);

  const updateQuantity = useCallback((serviceId, quantity) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(item => item._id !== serviceId));
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item._id === serviceId ? { ...item, quantity } : item
        )
      );
    }
  }, []);

  const removeFromCart = useCallback((serviceId) => {
    setCartItems(prev => prev.filter(item => item._id !== serviceId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setCartCategory(null);
  }, []);

  const servicesTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const INSPECTION_FEE = 80;
  const totalAmount = servicesTotal + INSPECTION_FEE;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
