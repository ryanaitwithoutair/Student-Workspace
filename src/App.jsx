import React from 'react';
import { AppProvider } from './context/AppContext';
import { RouterView } from './router/router';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { WorkspacePage } from './pages/WorkspacePage';

export function App() {
  const routes = {
    '/': <LandingPage />,
    '/auth': <AuthPage />,
    '/login': <AuthPage initialSignUp={false} />,
    '/signup': <AuthPage initialSignUp={true} />,
    '/app': <WorkspacePage />,
    '*': <LandingPage />
  };

  return (
    <AppProvider>
      <RouterView routes={routes} />
    </AppProvider>
  );
}

export default App;
