import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { DirectAssistanceType, DirectAssistanceStatus } from '../types';
import {
  Briefcase,
  HeartHandshake,
  Plus,
  Search,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  Landmark,
  FileText,
  AlertCircle,
  ArrowRight,
  Filter
} from 'lucide-react';

interface MyWorkViewProps {
  onNavigate: (view: string, targetId?: string) => void;
  onOpenQuickAdd: (type: string) => void;
}

export const MyWorkView: React.FC<MyWorkViewProps> = ({ onNavigate, onOpenQuickAdd }) => {
  const {
    assistance,
    families,
    villages,
    wards,
    tickets,
    reminders,
    updateAssistance
  } = useDatabase();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayReminders = reminders.filter(r => r.dueDate === todayStr && !r.completed);

  // Helper for assistance type normalization
  const normalizeType = (typeStr?: string): DirectAssistanceType => {
    if (typeStr === 'SCHEME_ASSISTANCE' || typeStr === 'Scheme Assistance' || typeStr === 'Government Scheme Facilitation') {
      return 'SCHEME_ASSISTANCE';
    }
    if (typeStr === 'OTHER' || typeStr === 'Other') {
      return 'OTHER';
    }
    return 'PERSONAL_ASSISTANCE';
  };

  const normalizeStatus = (statusStr?: string): DirectAssistanceStatus => {
    if (statusStr === 'DONE' || statusStr === 'Done' || statusStr === 'Completed' || statusStr === 'Sanctioned') return 'DONE';
    if (statusStr === 'APPLIED' || statusStr === 'Applied' || statusStr === 'In Progress') return 'APPLIED';
    return 'PENDING';
  };

  // Filter assistance list
  const filteredAssistance = assistance.filter(a => {
    const aType = normalizeType(a.assistanceType || a.assistance_type);
    const aStatus = normalizeStatus(a.status);

    const typeMatch = filterType === 'ALL' || aType === filterType;
    const statusMatch = filterStatus === 'ALL' || aStatus === filterStatus;

    const q = searchQuery.toLowerCase().trim();
    const qMatch =
      !q ||
      a.beneficiaryName?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      a.note?.toLowerCase().includes(q) ||
      a.schemeName?.toLowerCase().includes(q) ||
      a.outcome?.toLowerCase().includes(q) ||
      a.familyId?.toLowerCase().includes(q);

    return typeMatch && statusMatch && qMatch;
  });

  // Calculate breakdown counts
  const totalCount = assistance.length;
  const schemeCount = assistance.filter(a => normalizeType(a.assistanceType || a.assistance_type) === 'SCHEME_ASSISTANCE').length;
  const personalCount = assistance.filter(a => normalizeType(a.assistanceType || a.assistance_type) === 'PERSONAL_ASSISTANCE').length;
  const otherCount = assistance.filter(a => normalizeType(a.assistanceType || a.assistance_type) === 'OTHER').length;

  const pendingCount = assistance.filter(a => normalizeStatus(a.status) === 'PENDING').length;
  const appliedCount = assistance.filter(a => normalizeStatus(a.status) === 'APPLIED').length;
  const doneCount = assistance.filter(a => normalizeStatus(a.status) === 'DONE').length;

  const handleQuickStatusChange = (ast: any, newStatus: DirectAssistanceStatus) => {
    const updated = {
      ...ast,
      status: newStatus,
      completionDate: newStatus === 'DONE' ? (ast.completionDate || todayStr) : ast.completionDate,
      completion_date: newStatus === 'DONE' ? (ast.completion_date || todayStr) : ast.completion_date,
      updatedAt: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    updateAssistance(updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white p-6 rounded-2xl border border-slate-700 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">🤝</span>
            <span className="text-xs uppercase font-bold tracking-widest text-blue-400">
              Grassroots Social Assistance
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            MY DIRECT ASSISTANCE
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Direct citizen services, government welfare scheme facilitation, and personal administrative help for grassroots households.
          </p>
        </div>

        <button
          onClick={() => onOpenQuickAdd('assistance')}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Record Direct Assistance</span>
        </button>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => { setFilterType('ALL'); setFilterStatus('ALL'); }}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs cursor-pointer hover:border-blue-400 transition-all text-center"
        >
          <span className="text-gray-400 text-[10px] uppercase font-bold block">Total Assistance</span>
          <span className="text-2xl font-black text-gray-900">{totalCount}</span>
          <span className="text-[10px] text-gray-500 block mt-0.5">Records logged</span>
        </div>

        <div 
          onClick={() => setFilterType('SCHEME_ASSISTANCE')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs cursor-pointer hover:border-blue-400 transition-all text-center"
        >
          <span className="text-blue-600 text-[10px] uppercase font-bold block flex items-center justify-center space-x-1">
            <span>🏛️ Scheme Assistance</span>
          </span>
          <span className="text-2xl font-black text-blue-700">{schemeCount}</span>
          <span className="text-[10px] text-gray-500 block mt-0.5">Welfare applications</span>
        </div>

        <div 
          onClick={() => setFilterType('PERSONAL_ASSISTANCE')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs cursor-pointer hover:border-emerald-400 transition-all text-center"
        >
          <span className="text-emerald-600 text-[10px] uppercase font-bold block flex items-center justify-center space-x-1">
            <span>🤝 Personal Help</span>
          </span>
          <span className="text-2xl font-black text-emerald-700">{personalCount}</span>
          <span className="text-[10px] text-gray-500 block mt-0.5">Direct family support</span>
        </div>

        <div 
          onClick={() => setFilterType('OTHER')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs cursor-pointer hover:border-indigo-400 transition-all text-center"
        >
          <span className="text-indigo-600 text-[10px] uppercase font-bold block flex items-center justify-center space-x-1">
            <span>📦 Other Assistance</span>
          </span>
          <span className="text-2xl font-black text-indigo-700">{otherCount}</span>
          <span className="text-[10px] text-gray-500 block mt-0.5">Administrative aid</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        {/* Type & Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3 text-xs">
          {/* Type Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-gray-400 font-bold text-[11px] mr-1 uppercase">Type:</span>
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setFilterType('SCHEME_ASSISTANCE')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filterType === 'SCHEME_ASSISTANCE'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              🏛️ Scheme Assistance ({schemeCount})
            </button>
            <button
              onClick={() => setFilterType('PERSONAL_ASSISTANCE')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filterType === 'PERSONAL_ASSISTANCE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              🤝 Personal Assistance ({personalCount})
            </button>
            <button
              onClick={() => setFilterType('OTHER')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filterType === 'OTHER'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              📦 Other ({otherCount})
            </button>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 font-bold text-[11px] mr-1 uppercase">Status:</span>
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                filterStatus === 'ALL' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('PENDING')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                filterStatus === 'PENDING' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              🟡 Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus('APPLIED')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                filterStatus === 'APPLIED' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
              }`}
            >
              🔵 Applied ({appliedCount})
            </button>
            <button
              onClick={() => setFilterStatus('DONE')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                filterStatus === 'DONE' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              🟢 Done ({doneCount})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search assistance log by beneficiary name, family ID, scheme, notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Assistance Log Timeline / Cards */}
      <div className="space-y-3">
        {filteredAssistance.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center">
            <HeartHandshake className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium text-sm">No assistance records match the selected filters.</p>
            <button
              onClick={() => onOpenQuickAdd('assistance')}
              className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700"
            >
              + Record Direct Assistance
            </button>
          </div>
        ) : (
          filteredAssistance.map(a => {
            const v = villages.find(vil => vil.id === a.villageId);
            const w = wards.find(wrd => wrd.id === a.wardId);
            const aType = normalizeType(a.assistanceType || a.assistance_type);
            const aStatus = normalizeStatus(a.status);
            const linkedFamily = families.find(f => f.id === a.familyId);

            return (
              <div
                key={a.id}
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4 text-xs"
              >
                <div className="flex items-start space-x-3.5 flex-1">
                  {/* Type Icon */}
                  <div className={`p-3 rounded-2xl mt-0.5 shrink-0 border ${
                    aType === 'SCHEME_ASSISTANCE'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : aType === 'PERSONAL_ASSISTANCE'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}>
                    {aType === 'SCHEME_ASSISTANCE' ? (
                      <Landmark className="w-5 h-5" />
                    ) : (
                      <HeartHandshake className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header line: Beneficiary + Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-gray-900 text-sm">
                        {a.beneficiaryName || 'Grassroots Citizen'}
                      </span>

                      {/* Type Badge */}
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        aType === 'SCHEME_ASSISTANCE'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : aType === 'PERSONAL_ASSISTANCE'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                      }`}>
                        {aType === 'SCHEME_ASSISTANCE' ? '🏛️ Scheme Assistance' : aType === 'PERSONAL_ASSISTANCE' ? '🤝 Personal Assistance' : '📦 Other Assistance'}
                      </span>

                      {/* Status Badge */}
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        aStatus === 'DONE'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : aStatus === 'APPLIED'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}>
                        {aStatus === 'DONE' ? '🟢 DONE' : aStatus === 'APPLIED' ? '🔵 APPLIED' : '🟡 PENDING'}
                      </span>

                      <span className="text-[10px] text-gray-400 font-mono">
                        {a.id}
                      </span>
                    </div>

                    {/* Scheme Name if Scheme Assistance */}
                    {aType === 'SCHEME_ASSISTANCE' && (a.schemeName || a.scheme_name || a.schemeId) && (
                      <div className="mt-1.5 flex items-center space-x-1.5 text-blue-900 font-bold text-xs bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-200/70 inline-flex">
                        <Landmark className="w-3.5 h-3.5 text-blue-600" />
                        <span>Scheme: {a.schemeName || a.scheme_name || a.schemeId}</span>
                      </div>
                    )}

                    {/* Prominent Notes for Personal / Other / Scheme */}
                    {a.note && (
                      <div className={`mt-2 p-3 rounded-xl border text-xs ${
                        aType === 'PERSONAL_ASSISTANCE'
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                          : aType === 'OTHER'
                          ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}>
                        <div className="font-extrabold text-[10px] uppercase tracking-wider mb-0.5 opacity-80">
                          {aType === 'PERSONAL_ASSISTANCE' ? 'Personal Assistance Note' : aType === 'OTHER' ? 'Other Assistance Note' : 'Field Note'}:
                        </div>
                        <p className="font-semibold text-xs leading-relaxed">
                          "{a.note}"
                        </p>
                      </div>
                    )}

                    {/* Description if different from note */}
                    {a.description && a.description !== a.note && (
                      <p className="text-gray-700 mt-1.5 font-medium text-xs">
                        {a.description}
                      </p>
                    )}

                    {/* Metadata strip: Location, Family, Dates */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                      <span className="flex items-center">
                        <Building className="w-3.5 h-3.5 mr-1 text-gray-400" />
                        {v?.name || 'Village'} {w ? `• Ward ${w.wardNumber}` : ''}
                      </span>

                      {a.familyId && (
                        <span className="flex items-center">
                          <span className="font-bold mr-1 text-gray-700">Family:</span>
                          <button
                            onClick={() => onNavigate('families', a.familyId)}
                            className="text-blue-600 hover:underline font-mono font-bold"
                          >
                            {linkedFamily ? `${linkedFamily.familyHeadName} (${a.familyId})` : a.familyId}
                          </button>
                        </span>
                      )}

                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                        Date: {a.date}
                      </span>

                      {a.nextFollowupAt && (
                        <span className="flex items-center text-amber-700 font-medium">
                          <Clock className="w-3.5 h-3.5 mr-1 text-amber-500" />
                          Follow-up: {a.nextFollowupAt}
                        </span>
                      )}

                      {a.completionDate && (
                        <span className="flex items-center text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Completed: {a.completionDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side actions: Quick Status Toggle & View Family */}
                <div className="flex md:flex-col items-end justify-between gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                  {/* Quick status dropdown */}
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase hidden md:inline">Change:</span>
                    <select
                      value={aStatus}
                      onChange={e => handleQuickStatusChange(a, e.target.value as DirectAssistanceStatus)}
                      className="px-2 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-800 cursor-pointer focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="PENDING">🟡 PENDING</option>
                      <option value="APPLIED">🔵 APPLIED</option>
                      <option value="DONE">🟢 DONE</option>
                    </select>
                  </div>

                  {a.familyId && (
                    <button
                      onClick={() => onNavigate('families', a.familyId)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-bold text-[11px] shadow-xs flex items-center space-x-1 transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Family Profile</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
