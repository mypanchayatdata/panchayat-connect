import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';
import { 
  Menu, 
  Search, 
  Plus, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  Shield, 
  Home, 
  AlertTriangle, 
  TicketCheck, 
  Hammer, 
  HeartHandshake, 
  Users, 
  Clock, 
  ChevronDown,
  Building,
  CheckCircle2,
  Filter,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { UserRole } from '../../types';

interface TopNavbarProps {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  onOpenAdvancedSearch: () => void;
  onOpenAI: () => void;
  onOpenNotifications: () => void;
  onOpenQuickAdd: (type: string) => void;
  onNavigate: (view: string, targetId?: string) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onToggleSidebar,
  onOpenSearch,
  onOpenAdvancedSearch,
  onOpenAI,
  onOpenNotifications,
  onOpenQuickAdd,
  onNavigate
}) => {
  const { currentUser, currentRole, switchRole, logout } = useAuth();
  const { tickets, reminders, problems, panchayat, unreadNotificationsCount } = useDatabase();

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const addMenuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setIsAddMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notifications calculation
  const todayStr = new Date().toISOString().slice(0, 10);
  const overdueTickets = tickets.filter(t => t.targetDate < todayStr && t.status !== 'Resolved' && t.status !== 'Closed');
  const todayReminders = reminders.filter(r => r.dueDate === todayStr && !r.completed);
  const highPriorityProblems = problems.filter(p => p.priority === 'High' && p.status !== 'Completed');
  const totalNotifs = overdueTickets.length + todayReminders.length + highPriorityProblems.length;

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-blue-900/50 shadow-md">
      <div className="flex items-center justify-between px-3 sm:px-6 h-16">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center space-x-3">
          <button
            id="btn-sidebar-toggle"
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-hidden transition-colors"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            onClick={() => onNavigate('dashboard')} 
            className="cursor-pointer select-none flex items-center space-x-2.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-base shadow-sm border border-blue-400">
              🇮🇳
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-blue-300 transition-colors">
                  Panchayat Connect
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-950 text-blue-300 border border-blue-800/80">
                  {panchayat.name.split(' ')[0]} GP
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none hidden sm:block tracking-wide">
                Community Information & Field Work Management System
              </p>
            </div>
          </div>
        </div>

        {/* Center: Universal Search & Filter Triggers */}
        <div className="flex-1 max-w-lg mx-2 sm:mx-4 hidden md:flex items-center space-x-2">
          <button
            id="btn-universal-search"
            onClick={onOpenSearch}
            className="flex-1 flex items-center justify-between bg-slate-800/90 hover:bg-slate-800 text-slate-300 hover:text-white px-3.5 py-2 rounded-lg border border-slate-700 text-xs shadow-inner transition-colors group"
          >
            <div className="flex items-center space-x-2.5">
              <Search className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
              <span>Search families, voters, problems, schemes...</span>
            </div>
            <kbd className="hidden lg:inline-block bg-slate-900 border border-slate-700 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded text-slate-400">
              Ctrl+K
            </kbd>
          </button>

          <button
            id="btn-advanced-filters"
            onClick={onOpenAdvancedSearch}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 text-xs font-semibold shadow-xs transition-colors shrink-0"
            title="Advanced Multi-Criteria Filters"
          >
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden lg:inline">Filters</span>
          </button>

          <button
            id="btn-ai-assistant"
            onClick={onOpenAI}
            className="flex items-center space-x-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-300 px-3 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
            title="Universal AI Assistant with Gemini"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden xl:inline">AI Co-pilot</span>
          </button>
        </div>

        {/* Right: Quick Actions, Notifications, Profile */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Mobile Quick Action Buttons */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenAdvancedSearch}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            title="Advanced Filters"
          >
            <Filter className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenAI}
            className="md:hidden p-2 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-slate-800"
            title="AI Assistant"
          >
            <Sparkles className="w-5 h-5" />
          </button>

          {/* Quick [+ Add] Dropdown */}
          <div className="relative" ref={addMenuRef}>
            <button
              id="btn-quick-add"
              onClick={() => setIsAddMenuOpen(prev => !prev)}
              className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {isAddMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-1.5 z-50 text-gray-800 animate-in fade-in-50">
                <div className="px-3 py-1.5 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Quick Data Entry
                </div>

                {/* Unified Report an Issue Section */}
                <button
                  onClick={() => { onOpenQuickAdd('issue'); setIsAddMenuOpen(false); }}
                  className="w-full flex items-center px-3.5 py-2 text-xs hover:bg-rose-50 text-rose-950 font-extrabold bg-rose-50/70 border-b border-rose-100"
                >
                  <AlertTriangle className="w-4 h-4 mr-2.5 text-rose-600 shrink-0" />
                  <span>🚨 Report Issue (Community / Individual)</span>
                </button>

                <button
                  onClick={() => { onOpenQuickAdd('problem'); setIsAddMenuOpen(false); }}
                  className="w-full flex items-center px-3.5 py-1.5 text-xs hover:bg-amber-50 text-amber-950 font-bold bg-amber-50/40"
                >
                  <AlertTriangle className="w-3.5 h-3.5 mr-2.5 text-amber-600 shrink-0" />
                  <span>+ 🏘️ Community Problem / Issue</span>
                </button>

                <button
                  onClick={() => { onOpenQuickAdd('ticket_family'); setIsAddMenuOpen(false); }}
                  className="w-full flex items-center px-3.5 py-1.5 text-xs hover:bg-purple-50 text-purple-950 font-bold bg-purple-50/40"
                >
                  <TicketCheck className="w-3.5 h-3.5 mr-2.5 text-purple-600 shrink-0" />
                  <span>+ 👤 Individual / Family Issue</span>
                </button>

                <div className="my-1 border-t border-gray-100"></div>

                <button
                  onClick={() => { onOpenQuickAdd('family'); setIsAddMenuOpen(false); }}
                  className="w-full flex items-center px-3.5 py-2 text-xs hover:bg-blue-50 text-blue-950 font-semibold"
                >
                  <Home className="w-4 h-4 mr-2.5 text-blue-600 shrink-0" />
                  + Family & Members
                </button>

                <button
                  onClick={() => { onOpenQuickAdd('scheme'); setIsAddMenuOpen(false); }}
                  className="w-full flex items-center px-3.5 py-2 text-xs hover:bg-indigo-50 text-indigo-950 font-bold bg-indigo-50/40"
                >
                  <Building className="w-4 h-4 mr-2.5 text-indigo-600 shrink-0" />
                  + Govt Welfare Scheme
                </button>

                <button
                  onClick={() => { onOpenQuickAdd('assistance'); setIsAddMenuOpen(false); }}
                  className="w-full flex items-center px-3.5 py-2 text-xs hover:bg-emerald-50 text-emerald-950 font-medium"
                >
                  <HeartHandshake className="w-4 h-4 mr-2.5 text-emerald-600 shrink-0" />
                  + My Direct Assistance
                </button>

                <button
                  onClick={() => { onOpenQuickAdd('devWork'); setIsAddMenuOpen(false); }}
                  className="w-full flex items-center px-3.5 py-2 text-xs hover:bg-blue-50 text-gray-800 font-medium"
                >
                  <Hammer className="w-4 h-4 mr-2.5 text-blue-600 shrink-0" />
                  + Development Work
                </button>

                <button
                  onClick={() => { onOpenQuickAdd('person'); setIsAddMenuOpen(false); }}
                  className="w-full flex items-center px-3.5 py-2 text-xs hover:bg-teal-50 text-gray-800 font-medium"
                >
                  <Users className="w-4 h-4 mr-2.5 text-teal-600 shrink-0" />
                  + Community Leader / Person
                </button>

                <button
                  onClick={() => { onOpenQuickAdd('reminder'); setIsAddMenuOpen(false); }}
                  className="w-full flex items-center px-3.5 py-2 text-xs hover:bg-amber-50 text-gray-800 font-medium border-t border-gray-100"
                >
                  <Clock className="w-4 h-4 mr-2.5 text-amber-600 shrink-0" />
                  + Field Reminder / Task
                </button>
              </div>
            )}
          </div>

          {/* Notifications Trigger */}
          <button
            id="btn-notifications"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Notification Center (Field Alerts, Overdue Tickets, Reminders)"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Admin Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              id="btn-admin-profile"
              onClick={() => setIsProfileOpen(prev => !prev)}
              className="flex items-center space-x-2 pl-2 pr-1 sm:px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center border border-blue-400">
                {currentUser?.name.charAt(0) || 'A'}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold text-white leading-tight">
                  {currentUser?.name || 'Administrator'}
                </div>
                <div className="text-[10px] text-blue-400 leading-tight flex items-center space-x-1">
                  <Shield className="w-2.5 h-2.5 inline" />
                  <span>{currentRole}</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 text-gray-800 animate-in fade-in-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-900">{currentUser?.name}</p>
                  <p className="text-[11px] text-gray-500">{currentUser?.email}</p>
                  <p className="text-[10px] text-blue-700 font-semibold mt-0.5">{currentUser?.designation}</p>
                </div>

                {/* Role Switcher Demo */}
                <div className="px-3 py-2 border-b border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Switch Active Role
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    {(['Super Admin', 'Admin', 'Field User', 'Viewer'] as UserRole[]).map(role => (
                      <button
                        key={role}
                        onClick={() => switchRole(role)}
                        className={`px-2 py-1 rounded text-left font-medium transition-colors ${
                          currentRole === role
                            ? 'bg-slate-900 text-white font-bold'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => { onNavigate('settings'); setIsProfileOpen(false); }}
                  className="w-full flex items-center px-4 py-2 text-xs hover:bg-amber-50 text-amber-900 font-bold"
                >
                  <KeyRound className="w-4 h-4 mr-2 text-amber-600" />
                  Set Admin Username & Password
                </button>

                <button
                  onClick={() => { onNavigate('settings'); setIsProfileOpen(false); }}
                  className="w-full flex items-center px-4 py-2 text-xs hover:bg-gray-100 text-gray-700"
                >
                  <Building className="w-4 h-4 mr-2 text-gray-500" />
                  Panchayat & System Settings
                </button>

                <button
                  onClick={() => { logout(); setIsProfileOpen(false); }}
                  className="w-full flex items-center px-4 py-2 text-xs hover:bg-rose-50 text-rose-600 font-semibold border-t border-gray-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
