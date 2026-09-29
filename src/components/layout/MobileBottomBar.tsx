import React from 'react';
import { 
  LayoutDashboard, 
  Home, 
  Sparkles, 
  Bell, 
  Menu,
  Filter
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

interface MobileBottomBarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAI: () => void;
  onOpenNotifications: () => void;
  onOpenSidebar: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  currentView,
  onNavigate,
  onOpenAI,
  onOpenNotifications,
  onOpenSidebar
}) => {
  const { unreadNotificationsCount } = useDatabase();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/98 backdrop-blur-md border-t border-slate-800 text-slate-400 flex items-center justify-around h-16 px-1 safe-area-pb shadow-2xl">
      {/* 1. Dashboard */}
      <button
        id="btn-mobile-dashboard"
        onClick={() => onNavigate('dashboard')}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors min-h-[44px] ${
          currentView === 'dashboard' ? 'text-blue-400 font-bold' : 'hover:text-slate-200'
        }`}
      >
        <LayoutDashboard className="w-5 h-5 mb-0.5" />
        <span>Dashboard</span>
      </button>

      {/* 2. Families */}
      <button
        id="btn-mobile-families"
        onClick={() => onNavigate('families')}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors min-h-[44px] ${
          currentView === 'families' ? 'text-blue-400 font-bold' : 'hover:text-slate-200'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span>Families</span>
      </button>

      {/* 3. Center Floating AI Assistant */}
      <button
        id="btn-mobile-ai-search"
        onClick={onOpenAI}
        className="flex flex-col items-center justify-center -mt-5 bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full w-13 h-13 shadow-xl border-3 border-slate-900 transition-transform active:scale-95 shrink-0 min-h-[44px]"
        title="Universal AI Assistant"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
      </button>

      {/* 4. Notifications & Alerts */}
      <button
        id="btn-mobile-notifs"
        onClick={onOpenNotifications}
        className="relative flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors hover:text-slate-200 min-h-[44px]"
      >
        <div className="relative">
          <Bell className="w-5 h-5 mb-0.5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
              {unreadNotificationsCount}
            </span>
          )}
        </div>
        <span>Alerts</span>
      </button>

      {/* 5. Menu Drawer */}
      <button
        id="btn-mobile-menu"
        onClick={onOpenSidebar}
        className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium hover:text-slate-200 min-h-[44px]"
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span>Menu</span>
      </button>
    </nav>
  );
};
