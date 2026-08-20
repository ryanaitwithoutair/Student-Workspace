import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from '../router/router';
import { Sidebar } from '../components/workspace/Sidebar';
import { TopBar } from '../components/workspace/TopBar';
import { SpacesView } from '../components/workspace/SpacesView';
import { CalendarView } from '../components/workspace/CalendarView';
import { SoundsView } from '../components/workspace/SoundsView';
import { TimerView } from '../components/workspace/TimerView';
import { QuotesWidget } from '../components/workspace/QuotesWidget';
import { FlipClockWidget } from '../components/workspace/FlipClockWidget';
import { TasksWidget } from '../components/workspace/TasksWidget';
import { ChecklistsView } from '../components/workspace/ChecklistsView';
import { AnalyticsView } from '../components/workspace/AnalyticsView';
import { getSpaceOverlayOpacity } from '../utils/overlay';

export const WorkspacePage = () => {
  const { 
    user,
    isAuthLoading,
    activeTab, 
    activeSpace, 
    showQuotesWidget, 
    showFlipClockWidget, 
    showTasksWidget,
    isFocusDimmed 
  } = useApp();

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate('/login');
    }
  }, [user, isAuthLoading, navigate]);

  if (isAuthLoading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#09090b]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'timer':
        return <TimerView />;
      case 'spaces':
        return <SpacesView />;
      case 'calendar':
        return <CalendarView />;
      case 'sounds':
        return <SoundsView />;
      case 'checklists':
        return <ChecklistsView />;
      case 'progress':
      case 'review':
        return <AnalyticsView />;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return <TimerView />;
    }
  };

  const bgStyle = activeSpace?.type === 'image' 
    ? { backgroundImage: `url(${activeSpace.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: activeSpace?.bg || '#09090b' };

  return (
    <div 
      className={`flex h-screen w-screen overflow-hidden select-none transition-all duration-500 relative ${
        isFocusDimmed ? 'focus-mode-dimmed' : ''
      }`} 
      style={bgStyle}
    >
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-300" style={{ background: 'linear-gradient(to bottom, rgba(9,9,11,.18), rgba(9,9,11,.82))', opacity: getSpaceOverlayOpacity(activeSpace) }} />
      {/* Collapsible Compact Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* TopBar rendered conditionally — hidden strictly for Focus Timer section */}
        {activeTab !== 'timer' && <TopBar />}

        {/* Tab View Container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-10 relative">
          <div className="max-w-7xl mx-auto min-h-full relative">
            {renderTabContent()}
          </div>
        </main>
      </div>

      {/* Floating Quotes Widget */}
      {activeTab === 'timer' && showQuotesWidget && <QuotesWidget />}

      {/* Translucent Flip Clock Widget */}
      {activeTab === 'timer' && showFlipClockWidget && <FlipClockWidget />}

      {/* Floating Focus Tasks Widget */}
      {activeTab === 'timer' && showTasksWidget && <TasksWidget />}
    </div>
  );
};
