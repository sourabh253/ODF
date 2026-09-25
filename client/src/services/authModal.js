// Tiny pub/sub so any page can ask the shared Navbar to open the sign-in modal.
// Navbar is the single owner of <CustomerAuthModal /> — no duplicate modals.

const listeners = new Set();

export const openAuthModal = () => listeners.forEach((listener) => listener());

export const subscribeAuthModal = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
