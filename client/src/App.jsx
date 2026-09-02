import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import LandingPage from './pages/LandingPage';
import WorkerPortal from './pages/WorkerPortal';
import WorkerDashboardPage from './pages/WorkerDashboardPlaceholder';
import CustomerDashboard from './pages/CustomerDashboard';
import WorkerProfilePage from './pages/WorkerProfilePage';
import HelpPlaceholder from './pages/HelpPlaceholder';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Wrapper that conditionally shows Navbar/Footer
// Worker Dashboard has its own full-height layout — no shared nav needed
const AppLayout = () => {
  const location = useLocation();
  const isWorkerDashboard = location.pathname === '/worker-dashboard';

  return (
    <div className="flex flex-col min-h-screen">
      {!isWorkerDashboard && <Navbar />}
      <main className={isWorkerDashboard ? 'flex-grow' : 'flex-grow'}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/worker-portal" element={<WorkerPortal />} />
          <Route path="/help" element={<HelpPlaceholder />} />

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
            path="/dashboard/worker/:workerId"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <WorkerProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!isWorkerDashboard && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SocketProvider>
          <AppLayout />
        </SocketProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
