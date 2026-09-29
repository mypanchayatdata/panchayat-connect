import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Users,
  Home,
  Milestone,
  AlertTriangle,
  Hammer,
  Landmark,
  Calendar,
  FileCheck,
  Plus,
  ArrowRight,
  Briefcase,
  Search,
  Filter,
  ShieldCheck,
  Edit,
  Trash2
} from 'lucide-react';
import { VoterCategoryDashboard } from '../components/common/VoterCategoryDashboard';

interface VillagesViewProps {
  onNavigate: (view: string, targetId?: string) => void;
  onOpenQuickAdd: (type: string, initialData?: any) => void;
  selectedVillageId?: string;
}

export const VillagesView: React.FC<VillagesViewProps> = ({
  onNavigate,
  onOpenQuickAdd,
  selectedVillageId
}) => {
  const {
    panchayat,
    villages,
    wards,
    deleteVillage,
    deleteWard,
    getVillageStats,
    getVillageKeyPeople,
    getVillageProblems,
    getVillageDevWorks,
    getVillageTemples,
    getVillageEvents,
    getVillageFamilies
  } = useDatabase();

  const { canEdit, canDelete, canAdd, isAdmin } = useAuth();

  const [activeVillageId, setActiveVillageId] = useState<string>(
    selectedVillageId || villages[0]?.id || 'NGV001'
  );

  const activeVillage = villages.find(v => v.id === activeVillageId) || villages[0];
  const stats = activeVillage ? getVillageStats(activeVillage.id) : null;
  const villageWards = wards.filter(w => w.villageId === activeVillageId);
  const nextWardNumber = villageWards.length > 0 ? Math.max(...villageWards.map(w => w.wardNumber || 0)) + 1 : 1;
  const villagePeople = activeVillage ? getVillageKeyPeople(activeVillage.id) : [];
  const villageProblems = activeVillage ? getVillageProblems(activeVillage.id) : [];
  const villageDevWorks = activeVillage ? getVillageDevWorks(activeVillage.id) : [];
  const villageTemples = activeVillage ? getVillageTemples(activeVillage.id) : [];
  const villageEvents = activeVillage ? getVillageEvents(activeVillage.id) : [];
  const villageFamilies = activeVillage ? getVillageFamilies(activeVillage.id) : [];

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Village Switcher Tab Bar */}
      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 shrink-0">
            Select Village:
          </span>
          {villages.map(v => (
            <button
              key={v.id}
              onClick={() => setActiveVillageId(v.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeVillageId === v.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {v.name} ({v.code})
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenQuickAdd('village')}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Village</span>
          </button>
          <button
            onClick={() => onOpenQuickAdd('ward')}
            className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Ward</span>
          </button>
        </div>
      </div>

      {activeVillage && stats && (
        <>
          {/* Village Header Profile */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className="p-3.5 bg-blue-600 rounded-2xl text-white shadow-md">
                  <MapPin className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      Code: {activeVillage.code}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                      Gram Panchayat: {panchayat.name}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
                    Village: {activeVillage.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {activeVillage.description || 'Administrative Village under Kalyanpur Gram Panchayat'}
                  </p>
                </div>
              </div>

              {/* Quick Actions for this Village */}
              <div className="flex flex-wrap items-center gap-2">
                {canEdit && (
                  <button
                    onClick={() => onOpenQuickAdd('village', activeVillage)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors"
                    title="Edit Village Name, Code & Boundaries"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Village</span>
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete Village "${activeVillage.name}" (${activeVillage.code})? This will delete this village from Panchayat records.`)) {
                        deleteVillage(activeVillage.id);
                        const rem = villages.filter(v => v.id !== activeVillage.id);
                        if (rem.length > 0) setActiveVillageId(rem[0].id);
                      }
                    }}
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    title="Delete Village from Panchayat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
                {canAdd && (
                  <>
                    <button
                      onClick={() => onOpenQuickAdd('ward', { villageId: activeVillage.id, wardNumber: nextWardNumber })}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Ward</span>
                    </button>
                    <button
                      onClick={() => onOpenQuickAdd('family', { villageId: activeVillage.id })}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Family</span>
                    </button>
                    <button
                      onClick={() => onOpenQuickAdd('problem', { villageId: activeVillage.id })}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Grievance</span>
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

            {/* Demographics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-6 pt-5 border-t border-gray-100 text-center text-xs">
              <div className="bg-gray-50 p-2.5 rounded-xl">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Wards</span>
                <strong className="text-gray-900 font-extrabold text-base">{stats.wardsCount}</strong>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-xl">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Families</span>
                <strong className="text-gray-900 font-extrabold text-base">{stats.familiesCount}</strong>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-xl">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Total Members</span>
                <strong className="text-gray-900 font-extrabold text-base">{stats.membersCount}</strong>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-xl">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Male</span>
                <strong className="text-blue-700 font-extrabold text-base">{stats.male}</strong>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-xl">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Female</span>
                <strong className="text-pink-700 font-extrabold text-base">{stats.female}</strong>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-xl">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Children (&lt;18)</span>
                <strong className="text-purple-700 font-extrabold text-base">{stats.children}</strong>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <span className="text-emerald-800 block text-[10px] uppercase font-bold">Voters</span>
                <strong className="text-emerald-700 font-extrabold text-base">{stats.voters}</strong>
              </div>
            </div>
          </div>

          {/* Village Voter Categorization (Green / Yellow / Red) */}
          <VoterCategoryDashboard
            villageId={activeVillage.id}
            title={`${activeVillage.name} Village Voters (${stats.voters}) — 🟢 Green / 🟡 Yellow / 🔴 Red`}
            onNavigateToFamily={famId => onNavigate('families', famId)}
          />

          {/* Family Socio-Economic & Government Job Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Economic Status Distribution */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Home className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold text-gray-900 uppercase">
                    Family Economic Classification
                  </h3>
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  {stats.familiesCount} Total
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                  <span className="text-red-700 block text-[11px] font-bold">3 — Low Status</span>
                  <span className="text-xl font-extrabold text-red-900 block mt-1">
                    {stats?.familyEconomics?.low ?? stats?.economicStats?.low ?? 0}
                  </span>
                  <span className="text-[10px] text-gray-500">Vulnerable / BPL</span>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="text-amber-700 block text-[11px] font-bold">2 — Moderate</span>
                  <span className="text-xl font-extrabold text-amber-900 block mt-1">
                    {stats?.familyEconomics?.moderate ?? stats?.economicStats?.moderate ?? 0}
                  </span>
                  <span className="text-[10px] text-gray-500">Middle Household</span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-emerald-700 block text-[11px] font-bold">1 — Well Off</span>
                  <span className="text-xl font-extrabold text-emerald-900 block mt-1">
                    {stats?.familyEconomics?.well ?? stats?.economicStats?.well ?? 0}
                  </span>
                  <span className="text-[10px] text-gray-500">Self-Sufficient</span>
                </div>
              </div>

              {/* Govt Job Summary for Village */}
              <div className="mt-3 p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-950">Families with Govt Employment:</span>
                </div>
                <strong className="text-sm font-extrabold text-blue-900">
                  {stats?.familyEconomics?.withGovtJob ?? stats?.economicStats?.withGovtJob ?? stats?.govtJobFamiliesCount ?? 0} Households
                </strong>
              </div>
            </div>

            {/* Scheme Statistics for Village */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-bold text-gray-900 uppercase">
                    Welfare Scheme Coverage & Pending
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('schemes')}
                  className="text-xs text-indigo-600 font-semibold hover:underline"
                >
                  Details →
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <span className="text-indigo-800 block text-[11px] font-bold">PMAY (Housing)</span>
                  <span className="text-xl font-extrabold text-indigo-950 block mt-1">
                    {stats?.schemes?.pmayPending ?? stats?.schemeStats?.pmayPending ?? 0} Pending
                  </span>
                  <span className="text-[10px] text-gray-500">Sanction Queue</span>
                </div>

                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-blue-800 block text-[11px] font-bold">PM-KISAN</span>
                  <span className="text-xl font-extrabold text-blue-950 block mt-1">
                    {stats?.schemes?.pmkisanPending ?? stats?.schemeStats?.pmkisanPending ?? 0} Pending
                  </span>
                  <span className="text-[10px] text-gray-500">eKYC & Land Seed</span>
                </div>

                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-purple-800 block text-[11px] font-bold">Pension Plans</span>
                  <span className="text-xl font-extrabold text-purple-950 block mt-1">
                    {stats?.schemes?.pensionPending ?? stats?.schemeStats?.pensionPending ?? 0} Pending
                  </span>
                  <span className="text-[10px] text-gray-500">Old Age / Widow</span>
                </div>
              </div>

              <div className="mt-3 p-3 bg-gray-50 rounded-xl text-xs flex justify-between">
                <span className="text-gray-600">Total Village Scheme Applications Tracked:</span>
                <strong className="font-bold text-gray-900">{stats?.schemes?.totalTracked ?? stats?.schemeStats?.total ?? 0}</strong>
              </div>
            </div>
          </div>

          {/* Wards in this Village */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Milestone className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-gray-900 uppercase">
                  Wards in {activeVillage.name} ({villageWards.length})
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenQuickAdd('ward', { villageId: activeVillage.id, wardNumber: nextWardNumber })}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Ward</span>
                </button>
                <button
                  onClick={() => onNavigate('wards')}
                  className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
                >
                  All Wards View →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {villageWards.map((w, idx) => {
                const wFamilies = villageFamilies.filter(f => f.wardId === w.id);
                return (
                  <div
                    key={`vil-ward-${w.id}-${idx}`}
                    className="p-3.5 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/20 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-gray-900">Ward {w.wardNumber}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                            {w.id}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {canEdit && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                onOpenQuickAdd('ward', w);
                              }}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded cursor-pointer"
                              title="Edit Ward Details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                if (confirm(`Delete Ward ${w.wardNumber} (${w.id})?`)) {
                                  deleteWard(w.id);
                                }
                              }}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded cursor-pointer"
                              title="Delete Ward"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-blue-800 font-semibold mt-1">
                        Member: {w.wardMemberName}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Ph: {w.contactNumber}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600">
                      <span>Households: <strong>{wFamilies.length}</strong></span>
                      <button
                        type="button"
                        onClick={() => onNavigate('wards', w.id)}
                        className="text-blue-600 font-semibold hover:underline cursor-pointer"
                      >
                        Open Ward →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key People in Village */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-teal-600" />
                <h3 className="text-xs font-bold text-gray-900 uppercase">
                  Important Persons & Leaders in {activeVillage.name} ({villagePeople.length})
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
              {villagePeople.map(p => (
                <div key={p.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">{p.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                      {p.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-0.5">{p.designation}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Contact: {p.phone}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Community Grievances & Development in Village */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Village Grievances */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-bold text-gray-900 uppercase">
                    Grievances in {activeVillage.name} ({villageProblems.length})
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('community-problems')}
                  className="text-xs text-amber-700 font-semibold hover:underline"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {villageProblems.map(p => (
                  <div key={p.id} className="p-2.5 border border-gray-100 rounded-lg hover:bg-amber-50/20">
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>{p.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {p.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-500 mt-0.5">
                      <span>Ward: {p.wardId} | {p.category}</span>
                      <span>Priority: {p.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Village Development Works */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Hammer className="w-4 h-4 text-blue-500" />
                  <h3 className="text-xs font-bold text-gray-900 uppercase">
                    Development Works ({villageDevWorks.length})
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('development-works')}
                  className="text-xs text-blue-700 font-semibold hover:underline"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {villageDevWorks.map(dw => (
                  <div key={dw.id} className="p-2.5 border border-gray-100 rounded-lg hover:bg-blue-50/20">
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>{dw.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {dw.status} ({dw.progressPercentage}%)
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-500 mt-0.5">
                      <span>Source: {dw.schemeSource}</span>
                      <strong className="text-gray-900">₹{dw.budgetRs.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
