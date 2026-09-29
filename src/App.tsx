import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DatabaseProvider } from './context/DatabaseContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { MobileBottomBar } from './components/layout/MobileBottomBar';
import { UniversalSearchModal } from './components/modals/UniversalSearchModal';
import { FamilyFormModal } from './components/modals/FamilyFormModal';
import { EntityModal } from './components/modals/EntityModals';
import { NotificationCenterModal } from './components/notifications/NotificationCenterModal';
import { AdvancedSearchModal } from './components/search/AdvancedSearchModal';
import { UniversalAIAssistantModal } from './components/ai/UniversalAIAssistantModal';

// Views
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { PanchayatView } from './views/PanchayatView';
import { VillagesView } from './views/VillagesView';
import { WardsView } from './views/WardsView';
import { FamiliesView } from './views/FamiliesView';
import { PeopleView } from './views/PeopleView';
import { SchemesView } from './views/SchemesView';
import { TicketsView } from './views/TicketsView';
import { MyWorkView } from './views/MyWorkView';
import { CommunityProblemsView } from './views/CommunityProblemsView';
import { DevelopmentWorksView } from './views/DevelopmentWorksView';
import { TemplesEventsView } from './views/TemplesEventsView';
import { RegistryView } from './views/RegistryView';
import { ReportsView } from './views/ReportsView';
import { RemindersView } from './views/RemindersView';
import { SettingsView } from './views/SettingsView';
import { SpecialVotersView } from './views/SpecialVotersView';

const MainShell: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [navTargetId, setNavTargetId] = useState<string | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiInitialQuery, setAiInitialQuery] = useState<string>('');

  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<any>(undefined);
  const [entityModalState, setEntityModalState] = useState<{
    isOpen: boolean;
    type: any;
    initialData?: any;
  }>({
    isOpen: false,
    type: 'problem'
  });

  const handleOpenAI = (queryPrompt?: string) => {
    setAiInitialQuery(queryPrompt || '');
    setIsAIOpen(true);
  };

  // Global keyboard shortcut Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const handleNavigate = (view: string, targetId?: string) => {
    setCurrentView(view);
    setNavTargetId(targetId);
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenQuickAdd = (type: string, initialData?: any) => {
    if (type === 'family') {
      setEditingFamily(initialData || undefined);
      setIsFamilyModalOpen(true);
    } else if (type === 'issue') {
      setEntityModalState({
        isOpen: true,
        type: 'issue',
        initialData: initialData || { ticketScope: 'COMMUNITY_VILLAGE_WARD' }
      });
    } else if (type === 'problem' || type === 'community_problem' || type === 'community_ticket' || type === 'ticket_community') {
      setEntityModalState({
        isOpen: true,
        type: 'issue',
        initialData: { ticketScope: 'COMMUNITY_VILLAGE_WARD', ...initialData }
      });
    } else if (type === 'ticket' || type === 'family_ticket' || type === 'ticket_family') {
      setEntityModalState({
        isOpen: true,
        type: 'issue',
        initialData: { ticketScope: 'INDIVIDUAL_FAMILY', ...initialData }
      });
    } else {
      setEntityModalState({
        isOpen: true,
        type: type as any,
        initialData
      });
    }
  };

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onNavigate={handleNavigate} onOpenQuickAdd={handleOpenQuickAdd} />;
      case 'special-voters':
        return <SpecialVotersView onNavigate={handleNavigate} initialCategory={navTargetId as any} />;
      case 'panchayat':
        return <PanchayatView onNavigate={handleNavigate} />;
      case 'villages':
        return <VillagesView onNavigate={handleNavigate} onOpenQuickAdd={handleOpenQuickAdd} selectedVillageId={navTargetId} />;
      case 'wards':
        return <WardsView onNavigate={handleNavigate} onOpenQuickAdd={handleOpenQuickAdd} selectedWardId={navTargetId} />;
      case 'families':
        return <FamiliesView onNavigate={handleNavigate} onOpenQuickAdd={handleOpenQuickAdd} selectedFamilyId={navTargetId} />;
      case 'people':
        return <PeopleView onNavigate={handleNavigate} onOpenQuickAdd={handleOpenQuickAdd} />;
      case 'schemes':
        return <SchemesView onNavigate={handleNavigate} onOpenQuickAdd={handleOpenQuickAdd} />;
      case 'tickets':
        return <TicketsView onNavigate={handleNavigate} onOpenQuickAdd={handleOpenQuickAdd} selectedTicketId={navTargetId} />;
      case 'my-work':
        return <MyWorkView onNavigate={handleNavigate} onOpenQuickAdd={handleOpenQuickAdd} />;
      case 'community-problems':
        return <CommunityProblemsView onNavigate={handleNavigate} onOpenQuickAdd={handleOpenQuickAdd} selectedProblemId={navTargetId} />;
      case 'development-works':
        return <DevelopmentWorksView onNavigate={handleNavigate} onOpenQuickAdd={handleOpenQuickAdd} />;
      case 'temples':
        return <TemplesEventsView onNavigate={handleNavigate} onOpenQuickAdd={handleOpenQuickAdd} />;
      case 'events-culture':
        return <TemplesEventsView onNavigate={handleNavigate} onOpenQuickAdd={handleOpenQuickAdd} />;
      case 'births':
        return <RegistryView onNavigate={handleNavigate} onOpenQuickAdd={handleOpenQuickAdd} defaultTab="births" />;
      case 'deaths':
        return <RegistryView onNavigate={handleNavigate} onOpenQuickAdd={handleOpenQuickAdd} defaultTab="deaths" />;
      case 'reports':
        return <ReportsView onNavigate={handleNavigate} />;
      case 'reminders':
        return <RemindersView onNavigate={handleNavigate} onOpenQuickAdd={handleOpenQuickAdd} />;
      case 'settings':
        return <SettingsView onNavigate={handleNavigate} onOpenQuickAdd={handleOpenQuickAdd} />;
      default:
        return <DashboardView onNavigate={handleNavigate} onOpenQuickAdd={handleOpenQuickAdd} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Sticky Top Navbar */}
      <TopNavbar
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAdvancedSearch={() => setIsAdvancedSearchOpen(true)}
        onOpenAI={() => handleOpenAI()}
        onOpenNotifications={() => setIsNotifsOpen(true)}
        onOpenQuickAdd={handleOpenQuickAdd}
        onNavigate={handleNavigate}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Drawer Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Touch-Friendly Mobile Field Work Navigation Bar */}
      <MobileBottomBar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAI={() => handleOpenAI()}
        onOpenNotifications={() => setIsNotifsOpen(true)}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      {/* Global Universal Relational Search Modal */}
      <UniversalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
        onOpenAdvancedFilters={() => setIsAdvancedSearchOpen(true)}
        onOpenAI={handleOpenAI}
      />

      {/* Advanced Multi-Criteria Cross Filters Modal */}
      <AdvancedSearchModal
        isOpen={isAdvancedSearchOpen}
        onClose={() => setIsAdvancedSearchOpen(false)}
        onNavigate={handleNavigate}
        onOpenAI={handleOpenAI}
      />

      {/* Real-time Field Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotifsOpen}
        onClose={() => setIsNotifsOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Universal AI Assistant (Gemini Search & Multi-turn Co-pilot) Modal */}
      <UniversalAIAssistantModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onNavigate={handleNavigate}
        initialQuery={aiInitialQuery}
      />

      {/* Spreadsheet-style Fast Family Entry Modal */}
      <FamilyFormModal
        isOpen={isFamilyModalOpen}
        existingFamily={editingFamily}
        onClose={() => {
          setIsFamilyModalOpen(false);
          setEditingFamily(undefined);
        }}
      />

      {/* Generic Unified Entity Modal */}
      <EntityModal
        isOpen={entityModalState.isOpen}
        type={entityModalState.type}
        initialData={entityModalState.initialData}
        onClose={() => setEntityModalState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DatabaseProvider>
        <MainShell />
      </DatabaseProvider>
    </AuthProvider>
  );
}
