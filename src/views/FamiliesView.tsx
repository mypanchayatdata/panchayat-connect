import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { Family, FamilyMember, EconomicStatusCode } from '../types';
import { VoterCategoryBadge } from '../components/common/VoterCategoryBadge';
import { PrintModal } from '../components/print/PrintModal';
import {
  Home,
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Phone,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  TicketCheck,
  HeartHandshake,
  ChevronRight,
  X,
  Building,
  CheckCircle2,
  Calendar,
  Printer
} from 'lucide-react';
import { FamilyFormModal } from '../components/modals/FamilyFormModal';
import { FamilySchemesChecklist } from '../components/common/FamilySchemesChecklist';

interface FamiliesViewProps {
  onNavigate: (view: string, targetId?: string) => void;
  onOpenQuickAdd: (type: string, initialData?: any) => void;
  selectedFamilyId?: string;
}

export const FamiliesView: React.FC<FamiliesViewProps> = ({
  onNavigate,
  onOpenQuickAdd,
  selectedFamilyId
}) => {
  const {
    panchayat,
    villages,
    wards,
    families,
    members,
    schemes,
    tickets,
    assistance,
    getFamilyMembers,
    getFamilySchemes,
    getFamilyTickets,
    getFamilyAssistance,
    deleteFamily,
    deleteMember,
    deleteAssistance,
    deleteTicket,
    deleteScheme,
    updateMember,
    addMember
  } = useDatabase();

  const { canEdit, canDelete, canAdd, isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterVillage, setFilterVillage] = useState('all');
  const [filterWard, setFilterWard] = useState('all');
  const [filterEcoStatus, setFilterEcoStatus] = useState<string>('all');
  const [filterGovtJob, setFilterGovtJob] = useState<string>('all');

  const [activeFamilyId, setActiveFamilyId] = useState<string | null>(selectedFamilyId || null);
  const [editingFamily, setEditingFamily] = useState<Family | undefined>(undefined);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [familyVoterFilter, setFamilyVoterFilter] = useState<'ALL' | 'GREEN' | 'YELLOW' | 'RED'>('ALL');
  const [familyToPrint, setFamilyToPrint] = useState<Family | null>(null);

  // Filtered families calculation
  const filteredFamilies = families.filter(fam => {
    const vMatch = filterVillage === 'all' || fam.villageId === filterVillage;
    const wMatch = filterWard === 'all' || fam.wardId === filterWard;
    const ecoMatch = filterEcoStatus === 'all' || fam.economicStatus.toString() === filterEcoStatus;

    // Check govt job among members
    const famMembers = members.filter(m => m.familyId === fam.id);
    const hasGovt = famMembers.some(m => m.hasGovernmentJob);
    const govtMatch = filterGovtJob === 'all' || (filterGovtJob === 'yes' && hasGovt) || (filterGovtJob === 'no' && !hasGovt);

    const q = searchQuery.toLowerCase().trim();
    const queryMatch =
      !q ||
      fam.id.toLowerCase().includes(q) ||
      fam.familyHeadName.toLowerCase().includes(q) ||
      fam.contactPersonName?.toLowerCase().includes(q) ||
      fam.primaryMobile.includes(q) ||
      fam.address.toLowerCase().includes(q) ||
      fam.rationCardNumber?.toLowerCase().includes(q) ||
      famMembers.some(m => m.name.toLowerCase().includes(q) || m.voterEpicNumber?.toLowerCase().includes(q));

    return vMatch && wMatch && ecoMatch && govtMatch && queryMatch;
  });

  const selectedFamily = activeFamilyId ? families.find(f => f.id === activeFamilyId) : null;
  const selectedFamilyMembers = selectedFamily ? getFamilyMembers(selectedFamily.id) : [];
  const selectedFamilySchemes = selectedFamily ? getFamilySchemes(selectedFamily.id) : [];
  const selectedFamilyTickets = selectedFamily ? getFamilyTickets(selectedFamily.id) : [];
  const selectedFamilyAssistance = selectedFamily ? getFamilyAssistance(selectedFamily.id) : [];

  const handleOpenEdit = (family: Family) => {
    setEditingFamily(family);
    setIsFormModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingFamily(undefined);
    setIsFormModalOpen(true);
  };

  const handleDeleteFamily = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete or archive the household of "${name}" (${id})? All linked members will be deleted.`)) {
      deleteFamily(id);
      if (activeFamilyId === id) setActiveFamilyId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Top Banner & Search Controls */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 flex items-center space-x-2">
              <Home className="w-5 h-5 text-blue-600" />
              <span>Family & Household Central Database</span>
            </h1>
            <p className="text-xs text-gray-500">
              Total {families.length} registered households in {panchayat.name}
            </p>
          </div>

          <button
            id="btn-fast-family-entry"
            onClick={handleOpenCreate}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Fast Family Entry (+ Spreadsheet)</span>
          </button>
        </div>

        {/* Search and Filters Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Universal Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Head, Member, Mobile, Epic, Card..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Village Filter */}
          <div>
            <select
              value={filterVillage}
              onChange={e => { setFilterVillage(e.target.value); setFilterWard('all'); }}
              className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 font-medium"
            >
              <option value="all">All Villages ({villages.length})</option>
              {villages.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          {/* Economic Status Filter */}
          <div>
            <select
              value={filterEcoStatus}
              onChange={e => setFilterEcoStatus(e.target.value)}
              className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 font-medium"
            >
              <option value="all">All Economic Statuses</option>
              <option value="1">1 — Well Off</option>
              <option value="2">2 — Moderate</option>
              <option value="3">3 — Low</option>
            </select>
          </div>

          {/* Government Job Filter */}
          <div>
            <select
              value={filterGovtJob}
              onChange={e => setFilterGovtJob(e.target.value)}
              className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 font-medium"
            >
              <option value="all">Govt Job: All Families</option>
              <option value="yes">Govt Job: Yes (Employed)</option>
              <option value="no">Govt Job: No</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
          <span>
            Showing <strong>{filteredFamilies.length}</strong> of {families.length} families
          </span>
          {(searchQuery || filterVillage !== 'all' || filterEcoStatus !== 'all' || filterGovtJob !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterVillage('all');
                setFilterWard('all');
                setFilterEcoStatus('all');
                setFilterGovtJob('all');
              }}
              className="text-blue-700 font-bold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Family Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredFamilies.map(fam => {
          const famMembers = members.filter(m => m.familyId === fam.id);
          const famSchemes = schemes.filter(s => s.familyId === fam.id);
          const v = villages.find(vil => vil.id === fam.villageId);
          const w = wards.find(wrd => wrd.id === fam.wardId);
          const govtMembers = famMembers.filter(m => m.hasGovernmentJob);
          const isSelected = activeFamilyId === fam.id;

          return (
            <div
              key={fam.id}
              className={`bg-white rounded-xl border p-4.5 transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                  : 'border-gray-200 hover:border-blue-400 hover:shadow-xs'
              }`}
            >
              <div>
                {/* Header: ID and Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {fam.id}
                      </span>
                      {(() => {
                        const headMember = famMembers.find(m => m.relation === 'Head' || m.name === fam.familyHeadName) || famMembers[0];
                        return headMember ? (
                          <VoterCategoryBadge
                            memberId={headMember.id}
                            isVoter={headMember.isVoter}
                            voterStatus={headMember.voterStatus}
                            voterCategory={headMember.voterCategory}
                            showStatusLabel={false}
                            size="sm"
                          />
                        ) : null;
                      })()}
                    </div>
                    <h3 className="text-base font-extrabold text-gray-900 mt-1">
                      {fam.familyHeadName}
                    </h3>
                  </div>

                  {/* Economic Status: 1 = Well, 2 = Moderate, 3 = Low */}
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      fam.economicStatus === 1
                        ? 'bg-blue-100 text-blue-800'
                        : fam.economicStatus === 2
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {fam.economicStatus === 1 ? '1 — Well' : fam.economicStatus === 2 ? '2 — Moderate' : '3 — Low'}
                  </span>
                </div>

                {/* Location & Contact Info */}
                <div className="text-xs text-gray-600 mt-2.5 space-y-1">
                  <p className="flex items-center text-gray-700">
                    <Building className="w-3.5 h-3.5 mr-1.5 text-gray-400 shrink-0" />
                    <span>{v?.name} • Ward {w?.wardNumber}</span>
                  </p>
                  <p className="text-gray-500 text-[11px] line-clamp-1">
                    {fam.address}
                  </p>
                  <p className="flex items-center text-gray-700 pt-0.5">
                    <Phone className="w-3.5 h-3.5 mr-1.5 text-blue-600 shrink-0" />
                    <span className="font-medium">{fam.primaryMobile}</span>
                    {fam.contactPersonName && fam.contactPersonName !== fam.familyHeadName && (
                      <span className="text-[10px] text-gray-400 ml-1.5 font-normal">
                        ({fam.contactPersonName})
                      </span>
                    )}
                  </p>
                </div>

                {/* Government Schemes Quick Indicators */}
                <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-slate-700 flex items-center">
                      <FileCheck className="w-3 h-3 mr-1 text-indigo-600" />
                      Govt Schemes ({famSchemes.length})
                    </span>
                    {famSchemes.length > 0 && (
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        ✅ {famSchemes.filter(s => s.status === 'Sanctioned / Active').length} Active
                      </span>
                    )}
                  </div>
                  {famSchemes.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {famSchemes.slice(0, 3).map(s => (
                        <span key={s.id} className="text-[10px] bg-white border border-indigo-200 text-indigo-900 font-semibold px-1.5 py-0.5 rounded flex items-center space-x-0.5">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>{s.schemeName.replace('Pradhan Mantri', 'PM').replace('National Food Security Act (NFSA) / Ration Card', 'NFSA Ration').replace('PMAY (Awas Yojana)', 'PMAY')}</span>
                        </span>
                      ))}
                      {famSchemes.length > 3 && (
                        <span className="text-[10px] text-slate-500 font-bold self-center">
                          +{famSchemes.length - 3} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">No government schemes linked yet</span>
                  )}
                </div>

                {/* Government Job: Yes / No (With Names) */}
                <div className="mt-2 p-2 rounded-lg text-xs">
                  {govtMembers.length > 0 ? (
                    <div className="bg-blue-50 border border-blue-200 text-blue-900 px-2.5 py-1.5 rounded-lg flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 mr-1.5 shrink-0" />
                      <span className="text-[11px] font-semibold">
                        Govt Job: <strong>{govtMembers.map(m => m.name).join(', ')}</strong> ({govtMembers[0].governmentDepartment || 'Govt'})
                      </span>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 text-gray-500 px-2.5 py-1 rounded-lg text-[11px] flex items-center">
                      <span className="text-gray-400 mr-1.5">•</span>
                      <span>No Government Employment</span>
                    </div>
                  )}
                </div>

                {/* Member Preview Chips */}
                <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-600 font-medium">
                    Members: <strong className="text-gray-900">{famMembers.length}</strong>
                    <span className="text-gray-400 ml-1">
                      ({famMembers.filter(m => m.isVoter).length} Voters)
                    </span>
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Card: {fam.rationCardType?.split(' ')[0] || 'PHH'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setFamilyToPrint(fam)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                    title="Print Official Family Dossier"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => handleOpenEdit(fam)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                      title="Edit Family & Members"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDeleteFamily(fam.id, fam.familyHeadName)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                      title="Delete / Archive Household"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setActiveFamilyId(fam.id)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <span>Household Dossier</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* SELECTED FAMILY DOSSIER MODAL / EXPANDED VIEW */}
      {selectedFamily && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-blue-300 text-xs font-bold">
                      {selectedFamily.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedFamily.economicStatus === 1 ? 'bg-blue-800 text-white' :
                      selectedFamily.economicStatus === 2 ? 'bg-amber-800 text-white' : 'bg-rose-800 text-white'
                    }`}>
                      {selectedFamily.economicStatus === 1 ? '1 — Well' : selectedFamily.economicStatus === 2 ? '2 — Moderate' : '3 — Low'}
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-white mt-0.5">
                    Household: {selectedFamily.familyHeadName}
                  </h2>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFamilyToPrint(selectedFamily)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold border border-slate-700 cursor-pointer shadow-xs transition-colors"
                  title="Print Official Household Dossier"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-400" />
                  <span>Print Dossier</span>
                </button>
                {canEdit && (
                  <button
                    onClick={() => handleOpenEdit(selectedFamily)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Household & Members</span>
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete household "${selectedFamily.familyHeadName}" (${selectedFamily.id})? All linked members will be deleted.`)) {
                        deleteFamily(selectedFamily.id);
                        setActiveFamilyId(null);
                      }
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                    title="Delete Household"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Household</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveFamilyId(null)}
                  className="p-1.5 text-gray-300 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Household Summary Attributes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Location</span>
                  <span className="font-bold text-gray-900">
                    {villages.find(v => v.id === selectedFamily.villageId)?.name} • Ward {wards.find(w => w.id === selectedFamily.wardId)?.wardNumber}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Primary Phone</span>
                  <span className="font-bold text-gray-900">{selectedFamily.primaryMobile}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Ration Card</span>
                  <span className="font-bold text-gray-900">
                    {selectedFamily.rationCardType} ({selectedFamily.rationCardNumber || 'N/A'})
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Dwelling</span>
                  <span className="font-bold text-gray-900">{selectedFamily.houseType} Roof</span>
                </div>
              </div>

              {/* 🗳 PROMINENT FAMILY VOTER SUMMARY */}
              {(() => {
                const famVoters = selectedFamilyMembers.filter(m => m.isVoter && m.voterStatus !== 'NO');
                const famGreen = selectedFamilyMembers.filter(m => (m.isVoter && m.voterStatus !== 'NO') && (m.voterCategory === 'GREEN' || !m.voterCategory)).length;
                const famYellow = selectedFamilyMembers.filter(m => (m.isVoter && m.voterStatus !== 'NO') && m.voterCategory === 'YELLOW').length;
                const famRed = selectedFamilyMembers.filter(m => (m.isVoter && m.voterStatus !== 'NO') && m.voterCategory === 'RED').length;
                const famNotVerified = selectedFamilyMembers.filter(m => m.voterStatus === 'NOT VERIFIED').length;

                return (
                  <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white p-4.5 rounded-2xl border border-blue-800/40 shadow-md">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">🗳️</span>
                        <h4 className="font-extrabold text-sm text-white uppercase tracking-wide">
                          VOTER SUMMARY
                        </h4>
                      </div>
                      {familyVoterFilter !== 'ALL' && (
                        <button
                          type="button"
                          onClick={() => setFamilyVoterFilter('ALL')}
                          className="text-[11px] text-blue-300 hover:text-white font-bold bg-blue-900/60 px-2 py-0.5 rounded-lg border border-blue-700/60 cursor-pointer"
                        >
                          Clear Filter (Show All Members)
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
                      {/* Total Voters */}
                      <button
                        type="button"
                        onClick={() => setFamilyVoterFilter('ALL')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          familyVoterFilter === 'ALL'
                            ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-400/30 shadow-xs'
                            : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700'
                        }`}
                      >
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          Total Voters
                        </span>
                        <span className="text-xl font-black text-white block mt-0.5">
                          {famVoters.length}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          of {selectedFamilyMembers.length} members
                        </span>
                      </button>

                      {/* 🟢 Green */}
                      <button
                        type="button"
                        onClick={() => setFamilyVoterFilter('GREEN')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          familyVoterFilter === 'GREEN'
                            ? 'bg-emerald-900/50 border-emerald-400 ring-2 ring-emerald-400/30 shadow-xs'
                            : 'bg-emerald-950/40 hover:bg-emerald-900/40 border-emerald-800/60'
                        }`}
                      >
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 block">
                          🟢 Green
                        </span>
                        <span className="text-xl font-black text-emerald-200 block mt-0.5">
                          {famGreen}
                        </span>
                        <span className="text-[10px] text-emerald-400 block">
                          Favorable / Supporter
                        </span>
                      </button>

                      {/* 🟡 Yellow */}
                      <button
                        type="button"
                        onClick={() => setFamilyVoterFilter('YELLOW')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          familyVoterFilter === 'YELLOW'
                            ? 'bg-amber-900/50 border-amber-400 ring-2 ring-amber-400/30 shadow-xs'
                            : 'bg-amber-950/40 hover:bg-amber-900/40 border-amber-800/60'
                        }`}
                      >
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 block">
                          🟡 Yellow
                        </span>
                        <span className="text-xl font-black text-amber-200 block mt-0.5">
                          {famYellow}
                        </span>
                        <span className="text-[10px] text-amber-400 block">
                          Moderate / Swing
                        </span>
                      </button>

                      {/* 🔴 Red */}
                      <button
                        type="button"
                        onClick={() => setFamilyVoterFilter('RED')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          familyVoterFilter === 'RED'
                            ? 'bg-rose-900/50 border-rose-400 ring-2 ring-rose-400/30 shadow-xs'
                            : 'bg-rose-950/40 hover:bg-rose-900/40 border-rose-800/60'
                        }`}
                      >
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-300 block">
                          🔴 Red
                        </span>
                        <span className="text-xl font-black text-rose-200 block mt-0.5">
                          {famRed}
                        </span>
                        <span className="text-[10px] text-rose-400 block">
                          Needs Attention
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* SPREADSHEET-STYLE FAMILY MEMBERS TABLE */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>
                      Family Members (
                      {selectedFamilyMembers.filter(m => {
                        if (familyVoterFilter === 'ALL') return true;
                        const isVoterYes = m.isVoter && m.voterStatus !== 'NO';
                        const cat = m.voterCategory || 'GREEN';
                        return isVoterYes && cat === familyVoterFilter;
                      }).length} of {selectedFamilyMembers.length})
                    </span>
                    {familyVoterFilter !== 'ALL' && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        Filtering by {familyVoterFilter}
                      </span>
                    )}
                  </h3>
                  <span className="text-xs text-gray-500 font-medium">
                    Voters: <strong>{selectedFamilyMembers.filter(m => m.isVoter && m.voterStatus !== 'NO').length}</strong>
                  </span>
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-xs">
                  <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                    <thead className="bg-slate-100 text-gray-700 uppercase text-[10px] tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="p-2.5">Member ID</th>
                        <th className="p-2.5">Name</th>
                        <th className="p-2.5">Father's / Husband's</th>
                        <th className="p-2.5">Relation</th>
                        <th className="p-2.5">Age/Gen</th>
                        <th className="p-2.5 text-center">Voter Status</th>
                        <th className="p-2.5 text-center">Voter Category</th>
                        <th className="p-2.5">Occupation</th>
                        <th className="p-2.5">Govt Employment</th>
                        <th className="p-2.5">Status</th>
                        {(canEdit || canDelete) && (
                          <th className="p-2.5 text-right">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedFamilyMembers
                        .filter(m => {
                          if (familyVoterFilter === 'ALL') return true;
                          const isVoterYes = m.isVoter && m.voterStatus !== 'NO';
                          const cat = m.voterCategory || 'GREEN';
                          return isVoterYes && cat === familyVoterFilter;
                        })
                        .map(m => {
                          const isVoterYes = m.isVoter && m.voterStatus !== 'NO';
                          return (
                            <tr key={m.id} className="hover:bg-gray-50/80">
                              <td className="p-2.5 font-mono text-gray-500 text-[11px]">{m.id}</td>
                              <td className="p-2.5 font-bold text-gray-900">
                                <div className="flex items-center space-x-1.5">
                                  <span>{m.name}</span>
                                  <VoterCategoryBadge
                                    memberId={m.id}
                                    isVoter={m.isVoter}
                                    voterStatus={m.voterStatus}
                                    voterCategory={m.voterCategory}
                                    showStatusLabel={false}
                                    size="sm"
                                  />
                                </div>
                              </td>
                              <td className="p-2.5 text-gray-600">{m.fatherHusbandName}</td>
                              <td className="p-2.5 font-medium text-gray-800">{m.relation}</td>
                              <td className="p-2.5 text-gray-700">{m.age} / {m.gender.charAt(0)}</td>
                              <td className="p-2.5 text-center">
                                {isVoterYes ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                    YES
                                  </span>
                                ) : m.voterStatus === 'NOT VERIFIED' ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                    NOT VERIFIED
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                                    NO
                                  </span>
                                )}
                                {m.voterEpicNumber && (
                                  <span className="block text-[9px] font-mono text-gray-400 mt-0.5">
                                    {m.voterEpicNumber}
                                  </span>
                                )}
                              </td>
                              <td className="p-2.5 text-center">
                                <VoterCategoryBadge
                                  memberId={m.id}
                                  isVoter={m.isVoter}
                                  voterStatus={m.voterStatus}
                                  voterCategory={m.voterCategory}
                                  showStatusLabel={true}
                                  size="sm"
                                />
                              </td>
                              <td className="p-2.5 text-gray-700">{m.occupation}</td>
                              <td className="p-2.5">
                                {m.hasGovernmentJob ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300">
                                    {m.governmentDepartment || 'Govt Job'}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-[11px]">—</span>
                                )}
                              </td>
                              <td className="p-2.5">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                  {m.status}
                                </span>
                              </td>
                              {(canEdit || canDelete) && (
                                <td className="p-2.5 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end space-x-1">
                                    {canEdit && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEdit(selectedFamily)}
                                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                        title="Edit Member (Opens Household Editor)"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    {canDelete && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (confirm(`Remove member "${m.name}" (${m.id}) from this household?`)) {
                                            deleteMember(m.id);
                                          }
                                        }}
                                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                                        title="Delete Member"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ======================================================== */}
              {/* MASTER GOVERNMENT WELFARE SCHEMES CHECKLIST (TICK MARKS)  */}
              {/* ======================================================== */}
              <FamilySchemesChecklist 
                family={selectedFamily} 
                onNavigate={onNavigate} 
                onOpenQuickAdd={onOpenQuickAdd}
              />

              {/* ======================================================== */}
              {/* MY DIRECT ASSISTANCE (UNIFIED FAMILY ASSISTANCE LOG)       */}
              {/* ======================================================== */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 p-5 rounded-2xl border border-blue-800/40 text-white shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/80">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white tracking-wide flex items-center space-x-2">
                        <span>MY DIRECT ASSISTANCE</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-400/30">
                          {selectedFamilyAssistance.length} {selectedFamilyAssistance.length === 1 ? 'Record' : 'Records'}
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        Combined Scheme Assistance, Personal Assistance & Other Direct Support
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => onOpenQuickAdd('assistance', {
                        familyId: selectedFamily.id,
                        villageId: selectedFamily.villageId,
                        wardId: selectedFamily.wardId
                      })}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Record Assistance</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('my-work')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
                    >
                      Field Diary →
                    </button>
                  </div>
                </div>

                {/* Assistance Cards List */}
                {selectedFamilyAssistance.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    <p>No direct assistance records logged for this household yet.</p>
                    <button
                      type="button"
                      onClick={() => onOpenQuickAdd('assistance', {
                        familyId: selectedFamily.id,
                        villageId: selectedFamily.villageId,
                        wardId: selectedFamily.wardId
                      })}
                      className="mt-2 text-blue-400 hover:underline font-bold"
                    >
                      + Record first assistance case for {selectedFamily.familyHeadName}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 mt-3.5">
                    {selectedFamilyAssistance.map(a => {
                      const isScheme = a.assistanceType === 'SCHEME_ASSISTANCE' || a.assistanceType === 'Scheme Assistance' || a.assistanceType === 'Government Scheme Facilitation';
                      const isOther = a.assistanceType === 'OTHER' || a.assistanceType === 'Other';
                      const isPersonal = !isScheme && !isOther;

                      const statusDone = a.status === 'DONE' || a.status === 'Done' || a.status === 'Completed' || a.status === 'Sanctioned';
                      const statusApplied = a.status === 'APPLIED' || a.status === 'Applied' || a.status === 'In Progress';

                      return (
                        <div
                          key={a.id}
                          className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/90 text-xs hover:border-blue-500/50 transition-all"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center space-x-2">
                              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                                isScheme
                                  ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                                  : isPersonal
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30'
                              }`}>
                                {isScheme ? '🏛️ Scheme Assistance' : isPersonal ? '🤝 Personal Assistance' : '📦 Other'}
                              </span>

                              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                                statusDone
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : statusApplied
                                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              }`}>
                                {statusDone ? '🟢 DONE' : statusApplied ? '🔵 APPLIED' : '🟡 PENDING'}
                              </span>

                              <span className="text-[10px] text-slate-400 font-mono">
                                {a.id}
                              </span>
                            </div>

                            <span className="text-[11px] text-slate-400 flex items-center">
                              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                              {a.date}
                            </span>
                          </div>

                          {/* Scheme Name if Scheme Assistance */}
                          {isScheme && (a.schemeName || a.scheme_name || a.schemeId) && (
                            <div className="mt-2 text-xs font-bold text-blue-300 flex items-center space-x-1.5">
                              <span>Scheme:</span>
                              <span className="text-white bg-blue-900/60 px-2 py-0.5 rounded border border-blue-700/50">
                                {a.schemeName || a.scheme_name || a.schemeId}
                              </span>
                            </div>
                          )}

                          {/* Note Field Display (Personal Assistance Note / Other Note / Scheme Note) */}
                          {a.note && (
                            <div className={`mt-2 p-3 rounded-lg border text-xs ${
                              isPersonal
                                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-100'
                                : isOther
                                ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-100'
                                : 'bg-slate-900/60 border-slate-700 text-slate-200'
                            }`}>
                              <div className="font-bold text-[10px] uppercase tracking-wider mb-0.5 text-slate-400">
                                {isPersonal ? 'Personal Assistance Note:' : isOther ? 'Other Assistance Note:' : 'Field Note:'}
                              </div>
                              <p className="font-semibold text-xs text-white">
                                "{a.note}"
                              </p>
                            </div>
                          )}

                          {/* Description if different from note */}
                          {a.description && a.description !== a.note && (
                            <p className="text-slate-300 mt-1.5 text-xs">
                              {a.description}
                            </p>
                          )}

                          {/* Beneficiary, Next Follow-up & Completion Date */}
                          <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                            <span>
                              Beneficiary: <strong className="text-slate-200">{a.beneficiaryName}</strong>
                            </span>

                              <div className="flex items-center space-x-3">
                                {a.nextFollowupAt && (
                                  <span className="text-amber-300 font-medium">
                                    Follow-up: {a.nextFollowupAt}
                                  </span>
                                )}
                                {a.completionDate && (
                                  <span className="text-emerald-300 font-medium">
                                    Completed: {a.completionDate}
                                  </span>
                                )}
                                {(canEdit || canDelete) && (
                                  <div className="flex items-center space-x-1 pl-2 border-l border-slate-700">
                                    {canEdit && (
                                      <button
                                        type="button"
                                        onClick={() => onOpenQuickAdd('assistance', a)}
                                        className="p-1 text-blue-400 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
                                        title="Edit Assistance"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    {canDelete && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (window.confirm(`Delete assistance record for ${a.beneficiaryName}?`)) {
                                            deleteAssistance(a.id);
                                          }
                                        }}
                                        className="p-1 text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 rounded transition-colors cursor-pointer"
                                        title="Delete Assistance"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Linked Action Tickets */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200">
                  <h4 className="font-bold text-gray-900 flex items-center">
                    <TicketCheck className="w-4 h-4 mr-1.5 text-purple-600" />
                    <span>Follow-up Action Tickets ({selectedFamilyTickets.length})</span>
                  </h4>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => onOpenQuickAdd('ticket', {
                        familyId: selectedFamily.id,
                        villageId: selectedFamily.villageId,
                        wardId: selectedFamily.wardId
                      })}
                      className="text-[11px] text-purple-700 bg-purple-100 hover:bg-purple-200 px-2 py-0.5 rounded font-bold transition-colors cursor-pointer"
                    >
                      + New Ticket
                    </button>
                    <button
                      onClick={() => onNavigate('tickets')}
                      className="text-[11px] text-purple-700 font-semibold hover:underline"
                    >
                      Tickets Dashboard →
                    </button>
                  </div>
                </div>
                {selectedFamilyTickets.length === 0 ? (
                  <p className="text-gray-400 py-3 text-center">No pending action tickets for this household.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedFamilyTickets.map(t => (
                      <div key={t.id} className="p-2.5 bg-white rounded-lg border border-slate-200 flex justify-between items-start shadow-2xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-gray-900 text-xs">{t.title}</p>
                          {t.schemeName && (
                            <p className="text-[10px] text-blue-700 font-bold">🏛️ {t.schemeName}</p>
                          )}
                          <p className="text-[10px] text-gray-500">Target: {t.targetDate} • {t.category}</p>
                          {t.ticketAssistanceId && (
                            <span className="inline-block text-[9px] text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              ✓ Synced to Assistance
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-1.5 shrink-0 ml-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            t.status === 'Resolved' || t.status === 'Completed' || t.status === 'Closed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {t.status}
                          </span>
                          {(canEdit || canDelete) && (
                            <div className="flex items-center space-x-1">
                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={() => onOpenQuickAdd('ticket', t)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                  title="Edit Ticket"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Delete field ticket "${t.title}"?`)) {
                                      deleteTicket(t.id);
                                    }
                                  }}
                                  className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                  title="Delete Ticket"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-gray-100 border-t border-gray-200 flex justify-between text-xs text-gray-600">
              <span>Record Created: {selectedFamily.createdAt}</span>
              <button
                onClick={() => setActiveFamilyId(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fast Family Entry Modal */}
      <FamilyFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        existingFamily={editingFamily}
      />

      {/* Official Family Profile Print Modal */}
      {familyToPrint && (
        <PrintModal
          isOpen={!!familyToPrint}
          onClose={() => setFamilyToPrint(null)}
          documentType="family"
          title={`Household Verification Dossier: ${familyToPrint.familyHeadName} (${familyToPrint.id})`}
          family={familyToPrint}
          familyMembers={getFamilyMembers(familyToPrint.id)}
          village={villages.find(v => v.id === familyToPrint.villageId)}
          ward={wards.find(w => w.id === familyToPrint.wardId)}
          panchayat={panchayat}
          assistance={getFamilyAssistance(familyToPrint.id)}
          schemes={getFamilySchemes(familyToPrint.id)}
          tickets={getFamilyTickets(familyToPrint.id)}
        />
      )}
    </div>
  );
};
