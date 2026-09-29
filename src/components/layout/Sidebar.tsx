import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Milestone,
  Home,
  Users,
  Vote,
  FileCheck,
  TicketCheck,
  Briefcase,
  AlertTriangle,
  Hammer,
  Landmark,
  Calendar,
  Baby,
  ShieldAlert,
  BarChart3,
  Clock,
  Settings,
  X
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpen,
  onClose
}) => {
  const {
    villages,
    wards,
    families,
    members,
    problems,
    tickets,
    schemes,
    reminders,
    assistance
  } = useDatabase();

  const todayStr = new Date().toISOString().slice(0, 10);
  const openTicketsCount = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const pendingProblemsCount = problems.filter(p => p.status !== 'Completed').length;
  const pendingSchemesCount = schemes.filter(s => s.status.includes('Pending') || s.status.includes('Verification')).length;
  const todayRemindersCount = reminders.filter(r => r.dueDate === todayStr && !r.completed).length;
  const specialVotersCount = members.filter(m => m.isVoter && m.voterStatus !== 'NO').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Core' },
    { id: 'special-voters', label: '🗳️ Special Voters', icon: Vote, count: specialVotersCount, badgeColor: 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30', category: 'Electoral Strategy' },
    { id: 'panchayat', label: 'Panchayat', icon: Building2, category: 'Hierarchy' },
    { id: 'villages', label: 'Villages', icon: MapPin, count: villages.length, category: 'Hierarchy' },
    { id: 'wards', label: 'Wards', icon: Milestone, count: wards.length, category: 'Hierarchy' },
    { id: 'families', label: 'Families', icon: Home, count: families.length, category: 'Citizens' },
    { id: 'people', label: 'People & Leaders', icon: Users, category: 'Citizens' },
    { id: 'schemes', label: 'Schemes', icon: FileCheck, count: pendingSchemesCount > 0 ? pendingSchemesCount : undefined, badgeColor: 'bg-indigo-100 text-indigo-800', category: 'Citizen Welfare' },
    { id: 'tickets', label: 'Family Issues & Tickets', icon: TicketCheck, count: openTicketsCount > 0 ? openTicketsCount : undefined, badgeColor: 'bg-purple-100 text-purple-800', category: 'Citizen Welfare' },
    { id: 'my-work', label: 'My Field Work', icon: Briefcase, count: assistance.length, category: 'Field Work' },
    { id: 'community-problems', label: 'Community Problems & Issues', icon: AlertTriangle, count: pendingProblemsCount > 0 ? pendingProblemsCount : undefined, badgeColor: 'bg-amber-100 text-amber-800', category: 'Community' },
    { id: 'development-works', label: 'Development Works', icon: Hammer, category: 'Community' },
    { id: 'temples', label: 'Temples', icon: Landmark, category: 'Culture' },
    { id: 'events-culture', label: 'Events & Culture', icon: Calendar, category: 'Culture' },
    { id: 'births', label: 'Birth Records', icon: Baby, category: 'Registry' },
    { id: 'deaths', label: 'Death Records', icon: ShieldAlert, category: 'Registry' },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, category: 'Analytics' },
    { id: 'reminders', label: 'Reminders', icon: Clock, count: todayRemindersCount > 0 ? todayRemindersCount : undefined, badgeColor: 'bg-rose-100 text-rose-800', category: 'Management' },
    { id: 'settings', label: 'Settings & Logs', icon: Settings, category: 'Management' }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out border-r border-slate-800 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header on Mobile */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800 lg:hidden">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🇮🇳</span>
            <span className="font-bold text-white text-base">Panchayat Connect</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5 custom-scrollbar text-xs font-medium">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const prevItem = navItems[idx - 1];
            const showCategoryHeader = !prevItem || prevItem.category !== item.category;

            return (
              <React.Fragment key={item.id}>
                {showCategoryHeader && (
                  <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 select-none">
                    {item.category}
                  </div>
                )}

                <button
                  id={`nav-${item.id}`}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors group ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.count !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeColor || 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 text-[11px] text-slate-400 flex items-center justify-between">
          <div>
            <div className="font-semibold text-slate-300">Administrative Unit</div>
            <div className="text-[10px] text-slate-500">Puri District, Odisha</div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" title="Online & Connected" />
        </div>
      </aside>
    </>
  );
};
