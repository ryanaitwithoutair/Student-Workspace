import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { RouterView } from './router/router';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { Toast } from './components/common/Toast';

const ToastContainer = () => {
  const { toast, dismissToast } = useApp();
  if (!toast) return null;
  return <Toast message={toast.message} type={toast.type} onClose={dismissToast} />;
};

export function App() {
  const routes = {
    '/': <LandingPage />,
    '/auth': <AuthPage />,
    '/login': <AuthPage />,
    '/reset-password': <ResetPasswordPage />,
    '/app': <WorkspacePage />,
    '*': <LandingPage />
  };

  return (
    <AppProvider>
      <RouterView routes={routes} />
      <ToastContainer />
    </AppProvider>
  );
}

export default App;
