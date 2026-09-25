// Platform-wide constants — server-side source of truth, never client-editable.
// See architecture.md §6 (PLATFORM_CONFIG).
const PLATFORM_CONFIG = {
  INSPECTION_FEE: 80,
  MIN_WALLET_BALANCE_FOR_CASH_BOOKINGS: 300,
  PLATFORM_FEE_PERCENT: 10,
};

export default PLATFORM_CONFIG;
