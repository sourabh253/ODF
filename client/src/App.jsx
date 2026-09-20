import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import WorkerPortal from './pages/WorkerPortal';
import WorkerDashboardPage from './pages/WorkerDashboardEntry';
import CustomerDashboard from './pages/CustomerDashboard';
import MainCategoryPage from './pages/MainCategoryPage';
import WorkerProfilePage from './pages/WorkerProfilePage';
import ServiceCatalogPage from './pages/ServiceCatalogPage';
import WorkerSelectionPage from './pages/WorkerSelectionPage';
import PaymentOptionsPage from './pages/PaymentOptionsPage';
import PayBeforePage from './pages/PayBeforePage';
import BookingDashboardPage from './pages/BookingDashboardPage';
import HelpPage from './pages/HelpPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Wrapper that conditionally shows Navbar/Footer
// Worker Dashboard has its own full-height layout — no shared nav needed
const AppLayout = () => {
  const location = useLocation();
  const isWorkerDashboard = location.pathname === '/worker-dashboard';
  const isAdminDashboard = location.pathname === '/admin-dashboard';

  return (
    <div className="flex flex-col min-h-screen">
      {!isWorkerDashboard && !isAdminDashboard && <Navbar />}
      <main className={isWorkerDashboard || isAdminDashboard ? 'flex-grow' : 'flex-grow'}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/worker-portal" element={<WorkerPortal />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          } />

          <Route
            path="/worker-dashboard"
            element={
              <ProtectedRoute allowedRoles={['worker']}>
                <WorkerDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/main/:mainCategorySlug"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <MainCategoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/category/:categorySlug"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <ServiceCatalogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/choose-worker"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <WorkerSelectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/worker/:workerId"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <WorkerProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/:bookingId/payment-options"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <PaymentOptionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/:bookingId/pay-before"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <PayBeforePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking-dashboard"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <BookingDashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!isWorkerDashboard && !isAdminDashboard && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SocketProvider>
          <LanguageProvider>
            <ThemeProvider>
              <CartProvider>
                <AppLayout />
              </CartProvider>
            </ThemeProvider>
          </LanguageProvider>
        </SocketProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
