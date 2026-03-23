import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardModule } from './components/modules/DashboardModule';
import { FinanceModule } from './components/modules/FinanceModule';
import { HRModule } from './components/modules/HRModule';
import { TicketingModule } from './components/modules/TicketingModule';
import { CommercialModule } from './components/modules/CommercialModule';
import { BilletterieModule } from './components/modules/BilletterieModule';
import { VisaModule } from './components/modules/VisaModule';
import { SettingsModule } from './components/modules/SettingsModule';
import { Toaster } from './components/ui/sonner';
import type { MockUser } from './data/mockUsers';

type AppView = 'landing' | 'auth' | 'app';

export default function App() {
  const [view, setView] = useState<AppView>('landing');
  const [user, setUser] = useState<MockUser | null>(null);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogin = (userData: MockUser) => {
    setUser(userData);
    setView('app');
    // Si l'utilisateur n'est pas admin, on redirige vers son module de département
    if (userData.department !== 'admin') {
      setActiveModule(userData.department);
    } else {
      setActiveModule('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
    setActiveModule('dashboard');
  };

  const handleGetStarted = () => {
    setView('auth');
  };

  const handleBackToLanding = () => {
    setView('landing');
  };

  // Landing page
  if (view === 'landing') {
    return (
      <>
        <LandingPage onGetStarted={handleGetStarted} />
        <Toaster />
      </>
    );
  }

  // Auth page
  if (view === 'auth') {
    return (
      <>
        <AuthPage onLogin={handleLogin} onBack={handleBackToLanding} />
        <Toaster />
      </>
    );
  }

  // Main app
  if (!user) {
    return null;
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardModule />;
      case 'finance':
        return <FinanceModule />;
      case 'hr':
        return <HRModule />;
      case 'ticketing':
        return <TicketingModule />;
      case 'commercial':
        return <CommercialModule />;
      case 'billetterie':
        return <BilletterieModule />;
      case 'visa':
        return <VisaModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <DashboardModule />;
    }
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar
        user={user}
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto">
          {renderModule()}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
