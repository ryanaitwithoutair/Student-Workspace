import React from 'react';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/workspace/Sidebar';
import { TopBar } from '../components/workspace/TopBar';
import { SpacesView } from '../components/workspace/SpacesView';
import { CalendarView } from '../components/workspace/CalendarView';
import { SoundsView } from '../components/workspace/SoundsView';
import { TimerView } from '../components/workspace/TimerView';
import { QuotesView } from '../components/workspace/QuotesView';

export const WorkspacePage = () => {
  const { activeTab, activeSpace } = useApp();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'spaces':
        return <SpacesView />;
      case 'calendar':
        return <CalendarView />;
      case 'sounds':
        return <SoundsView />;
      case 'timer':
        return <TimerView />;
      case 'quotes':
        return <QuotesView />;
      default:
        return <SpacesView />;
    }
  };

  const opacity = activeSpace?.overlayOpacity !== undefined ? activeSpace.overlayOpacity : 0.8;
  const overlayGradient = `linear-gradient(to bottom, rgba(9, 9, 11, ${opacity}), rgba(9, 9, 11, ${Math.min(1, opacity + 0.1)}))`;

  const bgStyle = activeSpace?.type === 'image' 
    ? { backgroundImage: `${overlayGradient}, url(${activeSpace.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: activeSpace?.bg || '#09090b' };

  return (
    <div className="flex h-screen w-screen overflow-hidden select-none transition-all duration-500" style={bgStyle}>
      {/* Collapsible Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Minimal Top Bar */}
        <TopBar />

        {/* Tab View Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
          <div className="max-w-7xl mx-auto">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
};
