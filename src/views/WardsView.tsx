import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import {
  Milestone,
  Users,
  Home,
  MapPin,
  Phone,
  AlertTriangle,
  Hammer,
  FileCheck,
  Clock,
  Plus,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Landmark,
  Printer,
  Edit,
  Trash2,
  Filter
} from 'lucide-react';
import { VoterCategoryDashboard } from '../components/common/VoterCategoryDashboard';
import { VoterCategoryBadge } from '../components/common/VoterCategoryBadge';
import { PrintModal } from '../components/print/PrintModal';

interface WardsViewProps {
  onNavigate: (view: string, targetId?: string) => void;
  onOpenQuickAdd: (type: string, initialData?: any) => void;
  selectedWardId?: string;
}

export const WardsView: React.FC<WardsViewProps> = ({
  onNavigate,
  onOpenQuickAdd,
  selectedWardId
}) => {
  const {
    panchayat,
    villages,
    wards,
    deleteWard,
    deleteFamily,
    families,
    members,
    assistance,
    getWardStats,
    getWardFamilies,
    getWardKeyPeople,
    getWardProblems,
    getWardDevWorks,
    getWardSchemes,
    reminders
  } = useDatabase();

  const { canEdit, canDelete, canAdd, isAdmin } = useAuth();

  const [activeWardId, setActiveWardId] = useState<string>(
    selectedWardId || wards[0]?.id || 'NGV001-W01'
  );
  const [filterVillageId, setFilterVillageId] = useState<string>('all');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Filtered Wards by Village (guaranteed unique by id)
  const filteredWards = React.useMemo(() => {
    const list = wards.filter(w => filterVillageId === 'all' || w.villageId === filterVillageId);
    const seen = new Set<string>();
    return list.filter(w => {
      if (!w || !w.id || seen.has(w.id)) return false;
      seen.add(w.id);
      return true;
    });
  }, [wards, filterVillageId]);

  // If current active ward is not in filtered list, switch to first available in filter
  React.useEffect(() => {
    if (filteredWards.length > 0 && !filteredWards.some(w => w.id === activeWardId)) {
      setActiveWardId(filteredWards[0].id);
    }
  }, [filterVillageId, filteredWards, activeWardId]);

  const activeWard = wards.find(w => w.id === activeWardId) || filteredWards[0] || wards[0];
  const activeVillage = activeWard ? villages.find(v => v.id === activeWard.villageId) : null;
  const stats = activeWard ? getWardStats(activeWard.id) : null;

  const wardFamilies = activeWard ? getWardFamilies(activeWard.id) : [];
  const wardFamilyIds = wardFamilies.map(f => f.id);
  const wardMembers = members.filter(m => wardFamilyIds.includes(m.familyId));
  const wardPeople = activeWard ? getWardKeyPeople(activeWard.id) : [];
  const wardProblems = activeWard ? getWardProblems(activeWard.id) : [];
  const wardDevWorks = activeWard ? getWardDevWorks(activeWard.id) : [];
  const wardSchemes = activeWard ? getWardSchemes(activeWard.id) : [];
  const wardAssistance = assistance.filter(a => 
    (a.wardId === activeWard?.id) || 
    (a.familyId && wardFamilyIds.includes(a.familyId))
  );

  // Ward Reminders
  const todayStr = new Date().toISOString().slice(0, 10);
  const wardReminders = reminders.filter(r => r.relatedEntityId && wardFamilyIds.includes(r.relatedEntityId));
  const todayReminders = wardReminders.filter(r => r.dueDate === todayStr && !r.completed);
  const overdueReminders = wardReminders.filter(r => r.dueDate < todayStr && !r.completed);
  const upcomingReminders = wardReminders.filter(r => r.dueDate > todayStr && !r.completed);

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Ward Selector Header with Real-time Village Filtering */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 overflow-x-auto pb-1 md:pb-0 flex-1">
          {/* Village Filter dropdown */}
          <div className="flex items-center space-x-2 shrink-0 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-bold text-gray-700">Village:</span>
            <select
              value={filterVillageId}
              onChange={e => setFilterVillageId(e.target.value)}
              className="bg-white border border-gray-300 rounded-md px-2 py-0.5 text-xs font-bold text-gray-900 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Villages ({villages.length})</option>
              {villages.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.code})</option>
              ))}
            </select>
          </div>

          {/* Wards list */}
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1 shrink-0">
              Wards ({filteredWards.length}):
            </span>
            {filteredWards.length === 0 ? (
              <span className="text-xs text-gray-400 italic">No wards in this village</span>
            ) : (
              filteredWards.map((w, idx) => {
                const v = villages.find(vil => vil.id === w.villageId);
                return (
                  <button
                    key={`ward-btn-${w.id}-${idx}`}
                    onClick={() => setActiveWardId(w.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      activeWardId === w.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    Ward {w.wardNumber} ({v?.code || ''})
                  </button>
                );
              })
            )}
          </div>
        </div>

        <button
          onClick={() => onOpenQuickAdd('ward', { villageId: filterVillageId !== 'all' ? filterVillageId : activeVillage?.id })}
          className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shrink-0 self-end md:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Ward</span>
        </button>
      </div>

      {activeWard && stats && (
        <>
          {/* Main Field-Work Ward Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className="p-3.5 bg-blue-600 rounded-2xl text-white shadow-md">
                  <Milestone className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      ID: {activeWard.id}
                    </span>
                    <span className="text-xs font-semibold text-gray-600">
                      Village: <strong>{activeVillage?.name}</strong> | GP: <strong>{panchayat.name}</strong>
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
                    Ward {activeWard.wardNumber}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {activeWard.areaDescription || 'Ward territorial area'}
                  </p>
                </div>
              </div>

              {/* Action Buttons as specified in Section 7 */}
              <div className="flex flex-wrap items-center gap-2">
                {canEdit && (
                  <button
                    onClick={() => onOpenQuickAdd('ward', activeWard)}
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    title="Edit Ward Details, Member & Boundaries"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Ward</span>
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete Ward ${activeWard.wardNumber} (${activeWard.id})? This will affect associated household records.`)) {
                        deleteWard(activeWard.id);
                        const rem = wards.filter(w => w.id !== activeWard.id);
                        if (rem.length > 0) setActiveWardId(rem[0].id);
                      }
                    }}
                    className="flex items-center space-x-1 px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    title="Delete Ward from Village"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="flex items-center space-x-1 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer border border-slate-700"
                  title="Print Official Ward Report Dossier"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-400" />
                  <span>Print Ward Report</span>
                </button>
                {canAdd && (
                  <>
                    <button
                      onClick={() => onOpenQuickAdd('ward', { villageId: activeWard.villageId })}
                      className="flex items-center space-x-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      title="Add New Ward to this Village"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Ward</span>
                    </button>
                    <button
                      onClick={() => onOpenQuickAdd('family', { villageId: activeWard.villageId, wardId: activeWard.id })}
                      className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Family</span>
                    </button>
                    <button
                      onClick={() => onOpenQuickAdd('person', { villageId: activeWard.villageId, wardId: activeWard.id })}
                      className="flex items-center space-x-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Person</span>
                    </button>
                    <button
                      onClick={() => onOpenQuickAdd('problem', { villageId: activeWard.villageId, wardId: activeWard.id })}
                      className="flex items-center space-x-1 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Problem</span>
                    </button>
                    <button
                      onClick={() => onOpenQuickAdd('devWork', { villageId: activeWard.villageId, wardId: activeWard.id })}
                      className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Development</span>
                    </button>
                    <button
                      onClick={() => onOpenQuickAdd('temple', { villageId: activeWard.villageId, wardId: activeWard.id })}
                      className="flex items-center space-x-1 px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Temple</span>
                    </button>
                    <button
                      onClick={() => onOpenQuickAdd('event', { villageId: activeWard.villageId })}
                      className="flex items-center space-x-1 px-3 py-2 bg-pink-100 hover:bg-pink-200 text-pink-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Event</span>
                    </button>
                    <button
                      onClick={() => onOpenQuickAdd('reminder')}
                      className="flex items-center space-x-1 px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Reminder</span>
                    </button>
                  </>
                )}
                {!isAdmin && (
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    User Data Entry Mode (Fill records permitted)
                  </span>
                )}
              </div>
            </div>

            {/* Ward Member Banner */}
            <div className="mt-5 p-3.5 bg-blue-50 rounded-xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  {activeWard.wardMemberName.charAt(0)}
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-blue-800 font-bold block">
                    Elected Ward Member
                  </span>
                  <span className="text-sm font-extrabold text-gray-900">{activeWard.wardMemberName}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <a
                  href={`tel:${activeWard.contactNumber}`}
                  className="flex items-center space-x-1 bg-white px-3 py-1.5 rounded-lg border border-blue-300 text-blue-800 font-bold hover:bg-blue-100 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>{activeWard.contactNumber}</span>
                </a>
              </div>
            </div>

            {/* Demographics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 text-center text-xs">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Families</span>
                <strong className="text-gray-900 font-extrabold text-lg">{stats.familiesCount}</strong>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Total Members</span>
                <strong className="text-gray-900 font-extrabold text-lg">{stats.membersCount}</strong>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Male</span>
                <strong className="text-blue-700 font-extrabold text-lg">{stats.male}</strong>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Female</span>
                <strong className="text-pink-700 font-extrabold text-lg">{stats.female}</strong>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Children (&lt;18)</span>
                <strong className="text-purple-700 font-extrabold text-lg">{stats.children}</strong>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                <span className="text-blue-800 block text-[10px] uppercase font-bold">Registered Voters</span>
                <strong className="text-blue-700 font-extrabold text-lg">{stats.voters}</strong>
              </div>
            </div>
          </div>

          {/* Ward Voter Categorization (Green / Yellow / Red) */}
          <VoterCategoryDashboard
            wardId={activeWard.id}
            title={`Ward ${activeWard.wardNumber} Voters (${stats.voters}) — 🟢 Green / 🟡 Yellow / 🔴 Red`}
            onNavigateToFamily={famId => onNavigate('families', famId)}
          />

          {/* 4 Core Field Management Modules: Problems, Dev Works, Schemes, Reminders */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Ward Problems Status */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-bold text-gray-900 uppercase">Ward Problems</h3>
                </div>
                <button
                  onClick={() => onNavigate('community-problems')}
                  className="text-[11px] text-amber-700 font-semibold hover:underline"
                >
                  View
                </button>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between p-1.5 bg-gray-50 rounded">
                  <span className="text-gray-600">Open Grievances:</span>
                  <strong className="text-gray-900">{stats?.problems?.open ?? stats?.problemsStats?.open ?? 0}</strong>
                </div>
                <div className="flex justify-between p-1.5 bg-rose-50 rounded text-rose-900 font-bold">
                  <span>High Priority:</span>
                  <span>{stats?.problems?.highPriority ?? stats?.problemsStats?.highPriority ?? 0}</span>
                </div>
                <div className="flex justify-between p-1.5 bg-amber-50 rounded text-amber-900">
                  <span>In Progress:</span>
                  <strong className="font-bold">{stats?.problems?.inProgress ?? stats?.problemsStats?.inProgress ?? 0}</strong>
                </div>
                <div className="flex justify-between p-1.5 bg-emerald-50 rounded text-emerald-900">
                  <span>Completed / Fixed:</span>
                  <strong className="font-bold">{stats?.problems?.completed ?? stats?.problemsStats?.completed ?? 0}</strong>
                </div>
              </div>
            </div>

            {/* 2. Ward Development Status */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1.5">
                  <Hammer className="w-4 h-4 text-blue-500" />
                  <h3 className="text-xs font-bold text-gray-900 uppercase">Development</h3>
                </div>
                <button
                  onClick={() => onNavigate('development-works')}
                  className="text-[11px] text-blue-700 font-semibold hover:underline"
                >
                  View
                </button>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between p-1.5 bg-gray-50 rounded">
                  <span className="text-gray-600">Sanctioned Works:</span>
                  <strong className="text-gray-900">{stats?.devWorks?.total ?? stats?.devWorksStats?.total ?? 0}</strong>
                </div>
                <div className="flex justify-between p-1.5 bg-amber-50 rounded text-amber-900">
                  <span>Pending Start:</span>
                  <strong className="font-bold">{stats?.devWorks?.pending ?? stats?.devWorksStats?.pending ?? 0}</strong>
                </div>
                <div className="flex justify-between p-1.5 bg-blue-50 rounded text-blue-900">
                  <span>In Progress:</span>
                  <strong className="font-bold">{stats?.devWorks?.inProgress ?? stats?.devWorksStats?.inProgress ?? 0}</strong>
                </div>
                <div className="flex justify-between p-1.5 bg-emerald-50 rounded text-emerald-900">
                  <span>Completed:</span>
                  <strong className="font-bold">{stats?.devWorks?.completed ?? stats?.devWorksStats?.completed ?? 0}</strong>
                </div>
              </div>
            </div>

            {/* 3. Ward Schemes Status */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1.5">
                  <FileCheck className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-xs font-bold text-gray-900 uppercase">Welfare Schemes</h3>
                </div>
                <button
                  onClick={() => onNavigate('schemes')}
                  className="text-[11px] text-indigo-700 font-semibold hover:underline"
                >
                  View
                </button>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between p-1.5 bg-gray-50 rounded">
                  <span className="text-gray-600">Total Tracked:</span>
                  <strong className="text-gray-900">{stats?.schemes?.total ?? stats?.schemesStats?.total ?? 0}</strong>
                </div>
                <div className="flex justify-between p-1.5 bg-indigo-50 rounded text-indigo-900 font-bold">
                  <span>Pending Approval:</span>
                  <span>{stats?.schemes?.pending ?? stats?.schemesStats?.pending ?? 0}</span>
                </div>
                <div className="flex justify-between p-1.5 bg-emerald-50 rounded text-emerald-900">
                  <span>Active Beneficiaries:</span>
                  <strong className="font-bold">{stats?.schemes?.active ?? stats?.schemesStats?.active ?? 0}</strong>
                </div>
                <div className="flex justify-between p-1.5 bg-gray-50 rounded text-gray-700">
                  <span>Completed/Disbursed:</span>
                  <strong className="font-bold">{stats?.schemes?.completed ?? stats?.schemesStats?.completed ?? 0}</strong>
                </div>
              </div>
            </div>

            {/* 4. Ward Reminders Status */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <h3 className="text-xs font-bold text-gray-900 uppercase">Field Reminders</h3>
                </div>
                <button
                  onClick={() => onNavigate('reminders')}
                  className="text-[11px] text-purple-700 font-semibold hover:underline"
                >
                  View
                </button>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between p-1.5 bg-amber-50 rounded text-amber-900 font-bold">
                  <span>Today's Follow-ups:</span>
                  <span>{todayReminders.length}</span>
                </div>
                <div className="flex justify-between p-1.5 bg-rose-50 rounded text-rose-900 font-bold">
                  <span>Overdue Tasks:</span>
                  <span>{overdueReminders.length}</span>
                </div>
                <div className="flex justify-between p-1.5 bg-blue-50 rounded text-blue-900">
                  <span>Upcoming Follow-ups:</span>
                  <strong>{upcomingReminders.length}</strong>
                </div>
                <div className="flex justify-between p-1.5 bg-gray-50 rounded text-gray-700">
                  <span>Total Ward Reminders:</span>
                  <strong>{wardReminders.length}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Families in this Ward */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Home className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-gray-900 uppercase">
                  Families in Ward {activeWard.wardNumber} ({wardFamilies.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigate('families')}
                className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
              >
                Go to Families Database →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {wardFamilies.map(f => {
                const fMembers = members.filter(m => m.familyId === f.id);
                const govtJobMembers = fMembers.filter(m => m.hasGovernmentJob);

                const headMember = fMembers.find(m => m.relation === 'Head' || m.name === f.familyHeadName) || fMembers[0];

                return (
                  <div
                    key={f.id}
                    onClick={() => onNavigate('families', f.id)}
                    className="p-3.5 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/20 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <h4 className="font-bold text-sm text-gray-900 truncate">{f.familyHeadName}</h4>
                        {headMember && (
                          <VoterCategoryBadge member={headMember} showSelect={false} size="sm" />
                        )}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        f.economicStatus === 1 ? 'bg-blue-100 text-blue-800' :
                        f.economicStatus === 2 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {f.economicStatus === 1 ? '1 — Well' : f.economicStatus === 2 ? '2 — Moderate' : '3 — Low'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mt-1">{f.address}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Ph: {f.primaryMobile}</p>

                    {/* Automatic Govt Job Indicator */}
                    <div className="mt-2 text-[11px]">
                      {govtJobMembers.length > 0 ? (
                        <span className="inline-flex items-center text-blue-800 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          <ShieldCheck className="w-3 h-3 mr-1 text-blue-600" />
                          Govt Job: {govtJobMembers.map(m => m.name).join(', ')}
                        </span>
                      ) : (
                        <span className="text-gray-400">No Govt Job</span>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600">
                      <span>Members: <strong>{fMembers.length}</strong> (Voters: {fMembers.filter(m => m.isVoter).length})</span>
                      <div className="flex items-center space-x-1.5">
                        {canEdit && (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              onOpenQuickAdd('family', f);
                            }}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded cursor-pointer"
                            title="Edit Household & Members"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              if (confirm(`Delete Household "${f.familyHeadName}" (${f.id}) and all linked members?`)) {
                                deleteFamily(f.id);
                              }
                            }}
                            className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-100 rounded cursor-pointer"
                            title="Delete Household"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <span className="text-blue-600 font-semibold hover:underline">View →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Community Persons in this Ward */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-teal-600" />
                <h3 className="text-xs font-bold text-gray-900 uppercase">
                  Community Stakeholders & Key Persons in Ward {activeWard.wardNumber} ({wardPeople.length})
                </h3>
              </div>
              <button
                onClick={() => onOpenQuickAdd('person')}
                className="text-xs font-semibold text-teal-700 hover:underline flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Person</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {wardPeople.map(p => (
                <div key={p.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">{p.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                      {p.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-0.5">{p.designation}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Phone: {p.phone}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Official Ward Report Print Modal */}
          {activeWard && (
            <PrintModal
              isOpen={isPrintModalOpen}
              onClose={() => setIsPrintModalOpen(false)}
              documentType="ward"
              title={`Ward ${activeWard.wardNumber} Administrative & Electoral Report`}
              ward={activeWard}
              village={activeVillage || undefined}
              panchayat={panchayat}
              wardFamilies={wardFamilies}
              wardMembers={wardMembers}
              wardAssistance={wardAssistance}
              devWorks={wardDevWorks}
              problems={wardProblems}
              keyPeople={wardPeople}
              schemes={wardSchemes}
            />
          )}
        </>
      )}
    </div>
  );
};
