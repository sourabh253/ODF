import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import workerService from '../services/workerService';
import WorkerProfileSetup from '../components/worker/WorkerProfileSetup';
import WorkerDashboard from '../components/worker/WorkerDashboard';

const WorkerDashboardPage = () => {
  const { user } = useAuth();
  const [profileStatus, setProfileStatus] = useState('checking'); // 'checking' | 'incomplete' | 'complete'
  const [error, setError] = useState('');

  useEffect(() => {
    const checkProfile = async () => {
      try {
        await workerService.getMyProfile(user.token);
        setProfileStatus('complete');
      } catch (err) {
        if (err.response?.status === 404) {
          setProfileStatus('incomplete');
        } else {
          setError(err.response?.data?.message || 'We could not load your worker profile. Please try again.');
          setProfileStatus('error');
        }
      }
    };

    if (user?.token) checkProfile();
  }, [user]);

  if (profileStatus === 'checking') {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (profileStatus === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="mb-2 text-xl font-bold text-secondary">Profile unavailable</h1>
          <p className="mb-6 text-sm text-slate-500">{error}</p>
          <button type="button" onClick={() => window.location.reload()} className="btn-primary">
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (profileStatus === 'incomplete') {
    return <WorkerProfileSetup />;
  }

  return <WorkerDashboard />;
};

export default WorkerDashboardPage;
