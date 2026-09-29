import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Clock, Plus, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';

interface RemindersViewProps {
  onNavigate: (view: string, targetId?: string) => void;
  onOpenQuickAdd: (type: string) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  onNavigate,
  onOpenQuickAdd
}) => {
  const {
    reminders,
    toggleReminderCompleted,
    deleteReminder
  } = useDatabase();

  const [filter, setFilter] = useState<'all' | 'today' | 'overdue' | 'completed'>('all');
  const todayStr = new Date().toISOString().slice(0, 10);

  const todayReminders = reminders.filter(r => r.dueDate === todayStr && !r.completed);
  const overdueReminders = reminders.filter(r => r.dueDate < todayStr && !r.completed);
  const upcomingReminders = reminders.filter(r => r.dueDate > todayStr && !r.completed);
  const completedReminders = reminders.filter(r => r.completed);

  const displayList =
    filter === 'today' ? todayReminders :
    filter === 'overdue' ? overdueReminders :
    filter === 'completed' ? completedReminders : reminders;

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span>Field Work Reminders & Follow-up Tasks</span>
          </h1>
          <p className="text-xs text-gray-500">
            Keep track of time-sensitive field inspections, citizen appointments, and scheme deadlines
          </p>
        </div>

        <button
          onClick={() => onOpenQuickAdd('reminder')}
          className="flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Field Reminder</span>
        </button>
      </div>

      {/* Metric Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            filter === 'all' ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span className="text-[10px] uppercase font-bold block opacity-70">All Tasks</span>
          <span className="text-xl font-extrabold">{reminders.length}</span>
        </button>

        <button
          onClick={() => setFilter('today')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            filter === 'today' ? 'bg-amber-600 text-white border-amber-600 shadow-xs' : 'bg-white text-gray-800 border-gray-200 hover:bg-amber-50'
          }`}
        >
          <span className="text-[10px] uppercase font-bold block opacity-70">Today's Due</span>
          <span className="text-xl font-extrabold">{todayReminders.length}</span>
        </button>

        <button
          onClick={() => setFilter('overdue')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            filter === 'overdue' ? 'bg-rose-600 text-white border-rose-600 shadow-xs' : 'bg-white text-gray-800 border-gray-200 hover:bg-rose-50'
          }`}
        >
          <span className="text-[10px] uppercase font-bold block opacity-70">Overdue</span>
          <span className="text-xl font-extrabold">{overdueReminders.length}</span>
        </button>

        <button
          onClick={() => setFilter('completed')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            filter === 'completed' ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-white text-gray-800 border-gray-200 hover:bg-blue-50'
          }`}
        >
          <span className="text-[10px] uppercase font-bold block opacity-70">Completed</span>
          <span className="text-xl font-extrabold">{completedReminders.length}</span>
        </button>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {displayList.length === 0 ? (
          <div className="bg-white p-8 rounded-xl text-center text-gray-400 text-xs">
            No reminders found in this category.
          </div>
        ) : (
          displayList.map(r => {
            const isOverdue = r.dueDate < todayStr && !r.completed;

            return (
              <div
                key={r.id}
                className={`bg-white p-4 rounded-xl border transition-all flex items-start justify-between gap-4 text-xs ${
                  r.completed ? 'opacity-60 bg-gray-50 border-gray-200' :
                  isOverdue ? 'border-rose-300 shadow-2xs' : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={r.completed}
                    onChange={() => toggleReminderCompleted(r.id)}
                    className="w-4 h-4 text-blue-600 rounded mt-0.5 cursor-pointer"
                  />
                  <div>
                    <h3 className={`font-bold text-sm ${r.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {r.title}
                    </h3>
                    <p className="text-gray-600 text-xs mt-0.5">{r.notes}</p>
                    <div className="mt-2 flex items-center space-x-3 text-[11px] text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        Due: {r.dueDate} {r.dueTime ? `at ${r.dueTime}` : ''}
                      </span>
                      {isOverdue && (
                        <span className="text-rose-600 font-bold">⚠️ OVERDUE</span>
                      )}
                      <span className={`px-2 py-0.2 rounded-full font-semibold ${
                        r.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {r.priority} Priority
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteReminder(r.id)}
                  className="text-gray-400 hover:text-red-500 text-xs font-semibold"
                >
                  Delete
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
