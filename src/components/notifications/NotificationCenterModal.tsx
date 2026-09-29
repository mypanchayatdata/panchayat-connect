import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { NotificationItem } from '../../types';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Trash2, 
  Clock, 
  AlertTriangle, 
  TicketCheck, 
  CalendarClock, 
  ArrowRight, 
  CheckCircle2, 
  Volume2, 
  VolumeX,
  Filter
} from 'lucide-react';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, targetId?: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { 
    notifications, 
    unreadNotificationsCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    dismissNotification, 
    clearAllNotifications 
  } = useDatabase();

  const [activeTab, setActiveTab] = useState<'all' | 'overdue' | 'tickets' | 'reminders' | 'problems'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);

  if (!isOpen) return null;

  // Filter based on active tab
  const filteredNotifications = notifications.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'overdue') return item.type === 'overdue_followup';
    if (activeTab === 'tickets') return item.type === 'assigned_ticket' || item.type === 'overdue_followup';
    if (activeTab === 'reminders') return item.type === 'upcoming_reminder';
    if (activeTab === 'problems') return item.type === 'new_problem';
    return true;
  });

  const overdueCount = notifications.filter(n => n.type === 'overdue_followup').length;
  const ticketCount = notifications.filter(n => n.type === 'assigned_ticket' || n.type === 'overdue_followup').length;
  const reminderCount = notifications.filter(n => n.type === 'upcoming_reminder').length;
  const problemCount = notifications.filter(n => n.type === 'new_problem').length;

  const handleNotificationClick = (item: NotificationItem) => {
    markNotificationAsRead(item.id);
    onNavigate(item.targetView, item.targetId);
    onClose();
  };

  const getItemIcon = (type: NotificationItem['type'], priority: string) => {
    switch (type) {
      case 'overdue_followup':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      case 'assigned_ticket':
        return <TicketCheck className="w-5 h-5 text-purple-600" />;
      case 'upcoming_reminder':
        return <CalendarClock className="w-5 h-5 text-amber-600" />;
      case 'new_problem':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-100 text-rose-700 border-rose-200 animate-pulse';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Medium':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-xl h-full sm:h-auto sm:max-h-[85vh] bg-white sm:rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in-50 slide-in-from-bottom-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-base sm:text-lg">Notification Center</h2>
                {unreadNotificationsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white">
                    {unreadNotificationsCount} unread
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Panchayat field follow-ups, overdue alerts & civic grievances
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={soundEnabled ? 'Mute alert sounds' : 'Enable alert sounds'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center space-x-1 px-4 py-2.5 bg-gray-50 border-b border-gray-200 overflow-x-auto text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>All</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-800/20 text-current">
              {notifications.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('overdue')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'overdue'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <span>Overdue</span>
            {overdueCount > 0 && (
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 font-bold">
                {overdueCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'tickets'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>Tickets</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-gray-200 text-gray-700">
              {ticketCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'reminders'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>Reminders</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-gray-200 text-gray-700">
              {reminderCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('problems')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'problems'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>Problems</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-gray-200 text-gray-700">
              {problemCount}
            </span>
          </button>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100 text-xs text-gray-500">
          <span className="font-medium">
            Showing {filteredNotifications.length} notification{filteredNotifications.length === 1 ? '' : 's'}
          </span>
          <div className="flex items-center space-x-2">
            {unreadNotificationsCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-semibold px-2 py-1 rounded hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="flex items-center space-x-1 text-gray-400 hover:text-rose-600 font-medium px-2 py-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear all</span>
              </button>
            )}
          </div>
        </div>

        {/* Notification Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2 space-y-1">
          {filteredNotifications.length === 0 ? (
            <div className="py-14 px-4 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-800 text-base">No active alerts</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                All follow-up tickets, field reminders, and community grievances in this category have been attended to.
              </p>
            </div>
          ) : (
            filteredNotifications.map(item => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`group relative flex items-start space-x-3 p-3.5 rounded-xl cursor-pointer transition-all ${
                  item.isRead 
                    ? 'bg-white hover:bg-gray-50 border border-transparent' 
                    : 'bg-blue-50/60 hover:bg-blue-50 border border-blue-100/80 shadow-xs'
                }`}
              >
                {/* Status Indicator Dot */}
                {!item.isRead && (
                  <div className="absolute top-3.5 left-2 w-2 h-2 rounded-full bg-blue-600" />
                )}

                {/* Icon */}
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  item.type === 'overdue_followup'
                    ? 'bg-rose-100 text-rose-700'
                    : item.type === 'assigned_ticket'
                    ? 'bg-purple-100 text-purple-700'
                    : item.type === 'upcoming_reminder'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {getItemIcon(item.type, item.priority)}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getPriorityBadgeClass(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {item.timestamp}
                    </span>
                  </div>

                  <h4 className={`text-sm mt-1 leading-snug ${item.isRead ? 'font-medium text-gray-800' : 'font-bold text-gray-950'}`}>
                    {item.title}
                  </h4>

                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                    {item.message}
                  </p>

                  <div className="mt-2 flex items-center space-x-2 text-[11px] font-semibold text-blue-700 group-hover:text-blue-800">
                    <span>Jump to {item.targetView}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                {/* Dismiss Button */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    dismissNotification(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-gray-400 hover:text-rose-600 hover:bg-gray-200 transition-all absolute top-3 right-3 cursor-pointer"
                  title="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block animate-pulse" />
            <span>Panchayat live monitoring active</span>
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            Close Center
          </button>
        </div>
      </div>
    </div>
  );
};
