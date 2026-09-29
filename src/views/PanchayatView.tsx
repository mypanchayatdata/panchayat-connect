import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import {
  Building2,
  Users,
  Home,
  MapPin,
  Milestone,
  FileCheck,
  AlertTriangle,
  TicketCheck,
  Calendar,
  Landmark,
  Hammer,
  Clock,
  Edit,
  Plus,
  Phone,
  CheckCircle2,
  Trash2,
  X
} from 'lucide-react';
import { Panchayat } from '../types';
import { useAuth } from '../context/AuthContext';
import { VoterCategoryDashboard } from '../components/common/VoterCategoryDashboard';

interface PanchayatViewProps {
  onNavigate: (view: string, targetId?: string) => void;
  onOpenQuickAdd: (type: string, initialData?: any) => void;
}

export const PanchayatView: React.FC<PanchayatViewProps> = ({ onNavigate, onOpenQuickAdd }) => {
  const {
    panchayat,
    updatePanchayat,
    villages,
    wards,
    deleteVillage,
    deleteWard,
    families,
    members,
    keyPeople,
    temples,
    events,
    problems,
    devWorks,
    schemes,
    tickets,
    reminders,
    getPanchayatStats
  } = useDatabase();

  const { canEdit, canDelete, canAdd, isAdmin } = useAuth();
  const stats = getPanchayatStats();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Panchayat>(panchayat);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePanchayat(editForm);
    setIsEditModalOpen(false);
  };

  const keyPeopleCategories = [
    { label: 'Sarpanch', category: 'Sarpanch', color: 'bg-amber-100 text-amber-800' },
    { label: 'Ward Members', category: 'Ward Member', color: 'bg-blue-100 text-blue-800' },
    { label: 'Teachers', category: 'Teacher', color: 'bg-indigo-100 text-indigo-800' },
    { label: 'Youth Leaders', category: 'Youth Leader', color: 'bg-emerald-100 text-emerald-800' },
    { label: 'Active Women', category: 'Active Women', color: 'bg-rose-100 text-rose-800' },
    { label: 'Respected Persons', category: 'Respected Person', color: 'bg-purple-100 text-purple-800' },
    { label: 'Social Workers', category: 'Social Worker', color: 'bg-teal-100 text-teal-800' },
    { label: 'Healthcare & ASHA', category: 'Healthcare/ASHA', color: 'bg-cyan-100 text-cyan-800' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="p-3.5 bg-blue-600 rounded-2xl text-white shadow-md">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  ID: {panchayat.id}
                </span>
                <span className="text-xs font-semibold text-gray-500">Gram Panchayat Overview</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
                {panchayat.name}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Office: {panchayat.officeAddress}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {canEdit && (
              <button
                onClick={() => { setEditForm(panchayat); setIsEditModalOpen(true); }}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-gray-600" />
                <span>Edit Panchayat</span>
              </button>
            )}
            {canAdd && (
              <>
                <button
                  onClick={() => onOpenQuickAdd('village')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Village</span>
                </button>
                <button
                  onClick={() => onOpenQuickAdd('person')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Person</span>
                </button>
                <button
                  onClick={() => onOpenQuickAdd('problem')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Problem</span>
                </button>
                <button
                  onClick={() => onOpenQuickAdd('devWork')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Dev Work</span>
                </button>
                <button
                  onClick={() => onOpenQuickAdd('temple')}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-xl text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Temple</span>
                </button>
                <button
                  onClick={() => onOpenQuickAdd('event')}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-pink-100 hover:bg-pink-200 text-pink-800 rounded-xl text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Event</span>
                </button>
                <button
                  onClick={() => onOpenQuickAdd('reminder')}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-colors"
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

        {/* Administrative & Constituency Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-gray-100 text-xs">
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Block</span>
            <strong className="text-gray-900 font-bold text-sm">{panchayat.block}</strong>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">District</span>
            <strong className="text-gray-900 font-bold text-sm">{panchayat.district}</strong>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">State</span>
            <strong className="text-gray-900 font-bold text-sm">{panchayat.state}</strong>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Assembly (AC)</span>
            <strong className="text-gray-900 font-bold text-sm">{panchayat.assemblyConstituency}</strong>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Parliament (PC)</span>
            <strong className="text-gray-900 font-bold text-sm">{panchayat.parliamentaryConstituency}</strong>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Pincode</span>
            <strong className="text-gray-900 font-bold text-sm">{panchayat.pincode}</strong>
          </div>
        </div>

        {/* Officials Contact Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
          <div className="flex items-center justify-between p-3 bg-blue-50/70 rounded-xl border border-blue-200">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-blue-800 font-bold">Sarpanch</span>
              <p className="font-bold text-gray-900 text-sm">{panchayat.sarpanchName}</p>
            </div>
            <a
              href={`tel:${panchayat.sarpanchContact}`}
              className="flex items-center space-x-1 text-blue-700 hover:text-blue-900 font-semibold bg-white px-2.5 py-1.5 rounded-lg border border-blue-300 shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{panchayat.sarpanchContact}</span>
            </a>
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50/70 rounded-xl border border-blue-200">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-blue-800 font-bold">Executive Officer (PEO)</span>
              <p className="font-bold text-gray-900 text-sm">{panchayat.panchayatExecutiveOfficer}</p>
            </div>
            <a
              href={`tel:${panchayat.peoContact}`}
              className="flex items-center space-x-1 text-blue-700 hover:text-blue-900 font-semibold bg-white px-2.5 py-1.5 rounded-lg border border-blue-300 shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{panchayat.peoContact}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Primary Demographic Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs text-center">
          <span className="text-gray-400 text-[10px] uppercase font-bold block">Villages</span>
          <span className="text-2xl font-extrabold text-gray-900">{stats.villagesCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs text-center">
          <span className="text-gray-400 text-[10px] uppercase font-bold block">Wards</span>
          <span className="text-2xl font-extrabold text-gray-900">{stats.wardsCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs text-center">
          <span className="text-gray-400 text-[10px] uppercase font-bold block">Total Families</span>
          <span className="text-2xl font-extrabold text-gray-900">{stats.totalFamilies}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs text-center">
          <span className="text-gray-400 text-[10px] uppercase font-bold block">Population</span>
          <span className="text-2xl font-extrabold text-gray-900">{stats.population}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs text-center">
          <span className="text-gray-400 text-[10px] uppercase font-bold block">Total Voters</span>
          <span className="text-2xl font-extrabold text-blue-700">{stats.totalVoters}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs text-center">
          <span className="text-gray-400 text-[10px] uppercase font-bold block">M / F Ratio</span>
          <span className="text-base font-extrabold text-gray-800 pt-1 block">{stats.male} M : {stats.female} F</span>
        </div>
      </div>

      {/* Interactive Panchayat Villages & Wards Structure Directory */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wide flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Panchayat Villages & Wards Structure ({villages.length} Villages / {wards.length} Wards)</span>
            </h3>
            <p className="text-xs text-gray-500">
              Gram Panchayat territorial jurisdiction. Click any village or ward to inspect, edit, or manage households.
            </p>
          </div>
          {canAdd && (
            <button
              onClick={() => onOpenQuickAdd('village')}
              className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Village</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {villages.map(v => {
            const vWards = wards.filter(w => w.villageId === v.id);
            const vFamilies = families.filter(f => f.villageId === v.id);
            const vMembers = members.filter(m => vFamilies.some(f => f.id === m.familyId));
            const vVoters = vMembers.filter(m => m.isVoter).length;
            const wellCount = vFamilies.filter(f => f.economicStatus === 1).length;
            const modCount = vFamilies.filter(f => f.economicStatus === 2).length;
            const lowCount = vFamilies.filter(f => f.economicStatus === 3).length;

            return (
              <div
                key={v.id}
                className="p-4 rounded-xl border border-gray-200 hover:border-blue-400 bg-white hover:bg-blue-50/10 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div>
                      <h4 className="font-extrabold text-base text-gray-900">{v.name}</h4>
                      <span className="text-[11px] font-mono text-gray-500">Code: {v.code || v.id}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {canEdit && (
                        <button
                          onClick={() => onOpenQuickAdd('village', v)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded cursor-pointer"
                          title="Edit Village Details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete Village "${v.name}" (${v.id})? All linked wards and households will also be removed.`)) {
                              deleteVillage(v.id);
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded cursor-pointer"
                          title="Delete Village"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                    {v.description || 'Administrative Village under Gram Panchayat'}
                  </p>

                  {/* Village Metrics */}
                  <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Wards</span>
                      <strong className="text-sm font-black text-gray-900">{vWards.length}</strong>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Households</span>
                      <strong className="text-sm font-black text-gray-900">{vFamilies.length}</strong>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Voters</span>
                      <strong className="text-sm font-black text-blue-700">{vVoters}</strong>
                    </div>
                  </div>

                  {/* Economic Status Distribution */}
                  <div className="mt-2.5 flex items-center justify-between text-[10px] font-bold text-gray-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    <span className="text-blue-800">Well: {wellCount}</span>
                    <span className="text-amber-800">Mod: {modCount}</span>
                    <span className="text-rose-800">Low: {lowCount}</span>
                  </div>

                  {/* Ward Quick Pills */}
                  {vWards.length > 0 && (
                    <div className="mt-3">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        Wards in {v.name}:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {vWards.map(w => (
                          <button
                            key={w.id}
                            onClick={() => onNavigate('wards', w.id)}
                            className="text-[10px] px-2 py-0.5 rounded bg-gray-100 hover:bg-blue-100 hover:text-blue-800 font-bold text-gray-700 transition-colors cursor-pointer"
                            title={`Ward ${w.wardNumber} - Member: ${w.wardMemberName}`}
                          >
                            W{w.wardNumber}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-400 text-[11px]">{vMembers.length} Population</span>
                  <button
                    onClick={() => onNavigate('villages', v.id)}
                    className="font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <span>Open Village View</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panchayat Level Voter Categorization & Management */}
      <VoterCategoryDashboard
        title={`${panchayat.name} Panchayat Voter Categorization (🟢 Green / 🟡 Yellow / 🔴 Red)`}
        onNavigateToFamily={famId => onNavigate('families', famId)}
      />

      {/* People & Community Leaders Summary */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide">
              Key Community People & Leaders ({keyPeople.length})
            </h3>
          </div>
          <button
            onClick={() => onNavigate('people')}
            className="text-xs text-indigo-600 font-semibold hover:underline"
          >
            Open People Directory →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
          {keyPeopleCategories.map(cat => {
            const count = keyPeople.filter(p => p.category === cat.category).length;
            return (
              <div
                key={cat.category}
                onClick={() => onNavigate('people')}
                className="p-3 rounded-xl border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">{cat.label}</span>
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${cat.color}`}>
                    {count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Community Institutions, Problems & Development Works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Community Institutions */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Landmark className="w-4 h-4 text-orange-600" />
              <h4 className="font-bold text-xs text-gray-900 uppercase">Temples & Culture</h4>
            </div>
            <button onClick={() => onNavigate('temples')} className="text-[11px] text-orange-700 hover:underline">
              View
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Temples Recorded:</span>
              <strong className="font-bold text-gray-900">{stats.templesCount}</strong>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Major Cultural Events:</span>
              <strong className="font-bold text-gray-900">{stats.eventsCount}</strong>
            </div>
          </div>
        </div>

        {/* Community Problems Summary */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h4 className="font-bold text-xs text-gray-900 uppercase">Problems Status</h4>
            </div>
            <button onClick={() => onNavigate('community-problems')} className="text-[11px] text-amber-700 hover:underline">
              View
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Total Grievances:</span>
              <strong className="font-bold text-gray-900">{stats.problemsCount}</strong>
            </div>
            <div className="flex justify-between p-2 bg-amber-50 rounded-lg text-amber-900">
              <span>Pending / In Progress:</span>
              <strong className="font-bold">{stats.pendingProblems}</strong>
            </div>
          </div>
        </div>

        {/* Development Works Summary */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Hammer className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-xs text-gray-900 uppercase">Development Works</h4>
            </div>
            <button onClick={() => onNavigate('development-works')} className="text-[11px] text-blue-700 hover:underline">
              View
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Active / Sanctioned:</span>
              <strong className="font-bold text-gray-900">{stats.devWorksCount}</strong>
            </div>
            <div className="flex justify-between p-2 bg-blue-50 rounded-lg text-blue-900">
              <span>Total Sanctioned Budget:</span>
              <strong className="font-bold">
                ₹{devWorks.reduce((acc, d) => acc + d.sanctionedAmountRs, 0).toLocaleString('en-IN')}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns: Scheme Summary & Follow-up Tickets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scheme Backlog Summary */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-sm text-gray-900">Government Scheme Pending Backlog</h3>
            </div>
            <button
              onClick={() => onNavigate('schemes')}
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              All Schemes ({schemes.length}) →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
              <span className="text-gray-600 block text-[11px]">PMAY Pending Sanction</span>
              <strong className="text-xl font-extrabold text-indigo-950">
                {stats?.schemesSummary?.pmayPending ?? 0} Families
              </strong>
            </div>
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
              <span className="text-gray-600 block text-[11px]">PM-KISAN Verification</span>
              <strong className="text-xl font-extrabold text-blue-950">
                {stats?.schemesSummary?.pmkisanPending ?? 0} Farmers
              </strong>
            </div>
            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
              <span className="text-gray-600 block text-[11px]">Pension (Old Age/Widow)</span>
              <strong className="text-xl font-extrabold text-purple-950">
                {stats?.schemesSummary?.pensionPending ?? 0} Beneficiaries
              </strong>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-600 block text-[11px]">Other Welfare Schemes</span>
              <strong className="text-xl font-extrabold text-gray-900">
                {stats?.schemesSummary?.otherPending ?? 0} Pending
              </strong>
            </div>
          </div>
        </div>

        {/* Follow-up Summary */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TicketCheck className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-sm text-gray-900">Follow-up Field Status</h3>
            </div>
            <button
              onClick={() => onNavigate('tickets')}
              className="text-xs text-purple-600 font-semibold hover:underline"
            >
              All Tickets ({tickets.length}) →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
              <span className="text-gray-600 block text-[11px]">Open Tickets</span>
              <strong className="text-xl font-extrabold text-purple-950">
                {stats.followUpSummary.openTickets} Active
              </strong>
            </div>
            <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
              <span className="text-rose-700 block text-[11px] font-bold">Overdue Tickets</span>
              <strong className="text-xl font-extrabold text-rose-700">
                {stats.followUpSummary.overdueTickets} Overdue
              </strong>
            </div>
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
              <span className="text-gray-600 block text-[11px]">Today's Follow-ups</span>
              <strong className="text-xl font-extrabold text-amber-950">
                {stats.followUpSummary.todayFollowups}
              </strong>
            </div>
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
              <span className="text-gray-600 block text-[11px]">Upcoming Follow-ups</span>
              <strong className="text-xl font-extrabold text-blue-950">
                {stats.followUpSummary.upcomingFollowups}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Panchayat Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-slate-900 text-white">
              <h3 className="font-bold text-sm">Edit Panchayat Details</h3>
              <button onClick={() => setIsEditModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Panchayat Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-2.5 py-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Block</label>
                  <input
                    type="text"
                    value={editForm.block}
                    onChange={e => setEditForm({ ...editForm, block: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">District</label>
                  <input
                    type="text"
                    value={editForm.district}
                    onChange={e => setEditForm({ ...editForm, district: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-2.5 py-1.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Sarpanch Name</label>
                  <input
                    type="text"
                    value={editForm.sarpanchName}
                    onChange={e => setEditForm({ ...editForm, sarpanchName: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Sarpanch Contact</label>
                  <input
                    type="text"
                    value={editForm.sarpanchContact}
                    onChange={e => setEditForm({ ...editForm, sarpanchContact: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-2.5 py-1.5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Office Address</label>
                <textarea
                  rows={2}
                  value={editForm.officeAddress}
                  onChange={e => setEditForm({ ...editForm, officeAddress: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-2.5 py-1.5"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 bg-gray-100 rounded-md text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
