import React, { useState, useMemo } from 'react';
import { useDatabase, AdvancedFilterOptions } from '../../context/DatabaseContext';
import { 
  Filter, 
  Search, 
  X, 
  Home, 
  Users, 
  FileCheck, 
  TicketCheck, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw, 
  Building, 
  MapPin, 
  Tag, 
  ShieldAlert,
  Download,
  Sparkles
} from 'lucide-react';

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, targetId?: string) => void;
  onOpenAI?: (queryPrompt?: string) => void;
}

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenAI
}) => {
  const { panchayat, villages, wards, filterData } = useDatabase();

  // Filter state
  const [selectedVillageId, setSelectedVillageId] = useState<string>('all');
  const [selectedWardId, setSelectedWardId] = useState<string>('all');
  const [selectedFamilyStatus, setSelectedFamilyStatus] = useState<string>('all');
  const [selectedSchemeStatus, setSelectedSchemeStatus] = useState<string>('all');
  const [selectedTicketPriority, setSelectedTicketPriority] = useState<string>('all');
  const [selectedTicketStatus, setSelectedTicketStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Active view tab for results
  const [resultTab, setResultTab] = useState<'all' | 'families' | 'schemes' | 'tickets' | 'problems' | 'members'>('all');

  // Dynamically filter wards by selected village
  const availableWards = useMemo(() => {
    if (selectedVillageId === 'all') return wards;
    return wards.filter(w => w.villageId === selectedVillageId);
  }, [wards, selectedVillageId]);

  // Compute filtered results
  const filterOptions: AdvancedFilterOptions = useMemo(() => ({
    villageId: selectedVillageId,
    wardId: selectedWardId,
    familyStatus: selectedFamilyStatus,
    schemeStatus: selectedSchemeStatus,
    ticketPriority: selectedTicketPriority,
    ticketStatus: selectedTicketStatus,
    searchTerm: searchTerm.trim()
  }), [
    selectedVillageId,
    selectedWardId,
    selectedFamilyStatus,
    selectedSchemeStatus,
    selectedTicketPriority,
    selectedTicketStatus,
    searchTerm
  ]);

  const results = useMemo(() => {
    return filterData(filterOptions);
  }, [filterData, filterOptions]);

  // Check how many filters are active
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedVillageId !== 'all') count++;
    if (selectedWardId !== 'all') count++;
    if (selectedFamilyStatus !== 'all') count++;
    if (selectedSchemeStatus !== 'all') count++;
    if (selectedTicketPriority !== 'all') count++;
    if (selectedTicketStatus !== 'all') count++;
    if (searchTerm.trim().length > 0) count++;
    return count;
  }, [
    selectedVillageId,
    selectedWardId,
    selectedFamilyStatus,
    selectedSchemeStatus,
    selectedTicketPriority,
    selectedTicketStatus,
    searchTerm
  ]);

  const handleResetFilters = () => {
    setSelectedVillageId('all');
    setSelectedWardId('all');
    setSelectedFamilyStatus('all');
    setSelectedSchemeStatus('all');
    setSelectedTicketPriority('all');
    setSelectedTicketStatus('all');
    setSearchTerm('');
  };

  const handleApplyPreset = (preset: {
    villageId?: string;
    wardId?: string;
    familyStatus?: string;
    schemeStatus?: string;
    ticketPriority?: string;
    ticketStatus?: string;
    searchTerm?: string;
  }) => {
    if (preset.villageId !== undefined) setSelectedVillageId(preset.villageId);
    if (preset.wardId !== undefined) setSelectedWardId(preset.wardId);
    if (preset.familyStatus !== undefined) setSelectedFamilyStatus(preset.familyStatus);
    if (preset.schemeStatus !== undefined) setSelectedSchemeStatus(preset.schemeStatus);
    if (preset.ticketPriority !== undefined) setSelectedTicketPriority(preset.ticketPriority);
    if (preset.ticketStatus !== undefined) setSelectedTicketStatus(preset.ticketStatus);
    if (preset.searchTerm !== undefined) setSearchTerm(preset.searchTerm);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl h-[92vh] sm:h-[88vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in-50"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-4 flex items-center justify-between border-b border-blue-900/50 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-base sm:text-lg">Advanced Search & Filters</h2>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-blue-500 text-slate-950">
                    {activeFilterCount} Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Multi-criteria relational cross-filtering for {panchayat.name}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenAI && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAI(searchTerm || 'Find filtered Panchayat records');
                }}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 text-blue-300 text-xs font-semibold transition-colors cursor-pointer"
                title="Ask AI Assistant about these filters"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>AI Deep Search</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="bg-slate-800/60 px-4 py-2 border-b border-slate-700/80 flex items-center space-x-2 overflow-x-auto text-xs scrollbar-none shrink-0">
          <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider shrink-0">
            Quick Presets:
          </span>
          <button
            onClick={() => handleApplyPreset({ ticketPriority: 'Urgent', ticketStatus: 'all' })}
            className="px-2.5 py-1 rounded-md bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-200 text-xs whitespace-nowrap transition-colors"
          >
            🔴 Urgent Tickets
          </button>
          <button
            onClick={() => handleApplyPreset({ familyStatus: 'BPL' })}
            className="px-2.5 py-1 rounded-md bg-amber-950/80 hover:bg-amber-900 border border-amber-800/80 text-amber-200 text-xs whitespace-nowrap transition-colors"
          >
            🟡 BPL / Low Income
          </button>
          <button
            onClick={() => handleApplyPreset({ familyStatus: 'Antyodaya' })}
            className="px-2.5 py-1 rounded-md bg-purple-950/80 hover:bg-purple-900 border border-purple-800/80 text-purple-200 text-xs whitespace-nowrap transition-colors"
          >
            🟣 Antyodaya (AAY)
          </button>
          <button
            onClick={() => handleApplyPreset({ schemeStatus: 'Pending Approval' })}
            className="px-2.5 py-1 rounded-md bg-blue-950/80 hover:bg-blue-900 border border-blue-800/80 text-blue-200 text-xs whitespace-nowrap transition-colors"
          >
            📋 Pending Schemes
          </button>
          <button
            onClick={() => handleApplyPreset({ searchTerm: 'Water' })}
            className="px-2.5 py-1 rounded-md bg-teal-950/80 hover:bg-teal-900 border border-teal-800/80 text-teal-200 text-xs whitespace-nowrap transition-colors"
          >
            💧 Water Grievances
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs whitespace-nowrap flex items-center space-x-1 ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Search & Filter Controls Grid */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 shrink-0">
          {/* Keyword Search Input */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              className="w-full bg-white border border-gray-300 rounded-xl pl-9 pr-8 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
              placeholder="Search by Family Head, Member Name, EPIC, Mobile, Scheme Name, or Ticket title..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 6 Combinable Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-xs">
            {/* 1. Panchayat */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                Panchayat
              </label>
              <select
                disabled
                className="w-full bg-gray-100 border border-gray-200 rounded-lg p-1.5 text-gray-700 cursor-not-allowed font-medium"
              >
                <option>{panchayat.name.split(' ')[0]} GP</option>
              </select>
            </div>

            {/* 2. Village */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Village
              </label>
              <select
                value={selectedVillageId}
                onChange={e => {
                  setSelectedVillageId(e.target.value);
                  setSelectedWardId('all'); // reset ward when village changes
                }}
                className="w-full bg-white border border-gray-300 rounded-lg p-1.5 text-gray-900 font-medium focus:outline-hidden focus:border-blue-500"
              >
                <option value="all">All Villages ({villages.length})</option>
                {villages.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            {/* 3. Ward */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Ward
              </label>
              <select
                value={selectedWardId}
                onChange={e => setSelectedWardId(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-1.5 text-gray-900 font-medium focus:outline-hidden focus:border-blue-500"
              >
                <option value="all">All Wards ({availableWards.length})</option>
                {availableWards.map((w, idx) => (
                  <option key={`adv-ward-${w.id}-${idx}`} value={w.id}>
                    Ward {w.wardNumber} ({w.wardMemberName ? w.wardMemberName.split(' ')[0] : w.id})
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Family Status */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Family Status
              </label>
              <select
                value={selectedFamilyStatus}
                onChange={e => setSelectedFamilyStatus(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-1.5 text-gray-900 font-medium focus:outline-hidden focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="Antyodaya">Antyodaya (AAY)</option>
                <option value="BPL">BPL (Poor)</option>
                <option value="PHH">PHH (Priority)</option>
                <option value="APL">APL (Above Poverty)</option>
                <option value="1">1 - Well-off</option>
                <option value="2">2 - Moderate</option>
                <option value="3">3 - Low Income</option>
              </select>
            </div>

            {/* 5. Scheme Status */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Scheme Status
              </label>
              <select
                value={selectedSchemeStatus}
                onChange={e => setSelectedSchemeStatus(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-1.5 text-gray-900 font-medium focus:outline-hidden focus:border-blue-500"
              >
                <option value="all">All Schemes</option>
                <option value="Sanctioned">Sanctioned / Active</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Under Verification">Under Verification</option>
                <option value="Document Required">Document Required</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* 6. Ticket Priority */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Ticket Priority
              </label>
              <select
                value={selectedTicketPriority}
                onChange={e => setSelectedTicketPriority(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-1.5 text-gray-900 font-medium focus:outline-hidden focus:border-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Category Tabs */}
        <div className="flex items-center px-4 py-2 border-b border-gray-200 bg-white space-x-1 overflow-x-auto text-xs font-semibold shrink-0 scrollbar-none">
          <button
            onClick={() => setResultTab('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              resultTab === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>All Results</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-blue-800/30 text-current font-bold">
              {results.totalMatches}
            </span>
          </button>

          <button
            onClick={() => setResultTab('families')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              resultTab === 'families'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Families</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-gray-200 text-gray-700">
              {results.families.length}
            </span>
          </button>

          <button
            onClick={() => setResultTab('schemes')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              resultTab === 'schemes'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Schemes</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-gray-200 text-gray-700">
              {results.schemes.length}
            </span>
          </button>

          <button
            onClick={() => setResultTab('tickets')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              resultTab === 'tickets'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <TicketCheck className="w-3.5 h-3.5" />
            <span>Tickets</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-gray-200 text-gray-700">
              {results.tickets.length}
            </span>
          </button>

          <button
            onClick={() => setResultTab('problems')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              resultTab === 'problems'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Problems</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-gray-200 text-gray-700">
              {results.problems.length}
            </span>
          </button>

          <button
            onClick={() => setResultTab('members')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              resultTab === 'members'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Members</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-gray-200 text-gray-700">
              {results.members.length}
            </span>
          </button>
        </div>

        {/* Results List View */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 divide-y divide-gray-100">
          {results.totalMatches === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <h3 className="font-bold text-gray-700 text-base">No matching records found</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                Try widening your filters by selecting "All Villages" or clearing the keyword query.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Families Section */}
              {(resultTab === 'all' || resultTab === 'families') && results.families.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                      <Home className="w-3.5 h-3.5 mr-1 text-blue-600" />
                      Families ({results.families.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {results.families.map(fam => (
                      <div
                        key={fam.id}
                        onClick={() => {
                          onNavigate('families', fam.id);
                          onClose();
                        }}
                        className="p-3 bg-white hover:bg-blue-50/50 border border-gray-200 hover:border-blue-300 rounded-xl cursor-pointer transition-all group shadow-2xs"
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-sm text-gray-900 truncate">
                                {fam.familyHeadName}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                                {fam.id}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {fam.address} • Mob: {fam.primaryMobile}
                            </p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            fam.rationCategory === 'Antyodaya'
                              ? 'bg-purple-100 text-purple-700'
                              : fam.rationCategory === 'BPL'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {fam.rationCategory || (fam.economicStatus === 3 ? 'BPL' : 'APL')}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400 group-hover:text-blue-700 pt-1 border-t border-gray-100">
                          <span>House: {fam.houseType || 'Kaccha'} • Social: {fam.socialCategory || 'OBC'}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schemes Section */}
              {(resultTab === 'all' || resultTab === 'schemes') && results.schemes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                      <FileCheck className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                      Scheme Applications ({results.schemes.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {results.schemes.map(sch => (
                      <div
                        key={sch.id}
                        onClick={() => {
                          onNavigate('schemes', sch.id);
                          onClose();
                        }}
                        className="p-3 bg-white hover:bg-indigo-50/50 border border-gray-200 hover:border-indigo-300 rounded-xl cursor-pointer transition-all group shadow-2xs"
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-sm text-gray-900 block truncate">
                              {sch.schemeName}
                            </span>
                            <p className="text-xs text-gray-600 mt-0.5">
                              Applicant: <strong>{sch.applicantName}</strong> ({sch.familyId})
                            </p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            sch.status === 'Sanctioned / Active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : sch.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {sch.status}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400 group-hover:text-indigo-700 pt-1 border-t border-gray-100">
                          <span>App No: {sch.applicationNumber || sch.id}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tickets Section */}
              {(resultTab === 'all' || resultTab === 'tickets') && results.tickets.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                      <TicketCheck className="w-3.5 h-3.5 mr-1 text-purple-600" />
                      Follow-up Tickets ({results.tickets.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {results.tickets.map(tck => (
                      <div
                        key={tck.id}
                        onClick={() => {
                          onNavigate('tickets', tck.id);
                          onClose();
                        }}
                        className="p-3 bg-white hover:bg-purple-50/50 border border-gray-200 hover:border-purple-300 rounded-xl cursor-pointer transition-all group shadow-2xs"
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-sm text-gray-900 block truncate">
                              {tck.title}
                            </span>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              Assigned to: {tck.assignedTo} • Due: {tck.targetDate}
                            </p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            tck.priority === 'Urgent'
                              ? 'bg-rose-100 text-rose-700'
                              : tck.priority === 'High'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {tck.priority}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400 group-hover:text-purple-700 pt-1 border-t border-gray-100">
                          <span>Status: {tck.status} • Family: {tck.familyId}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Problems Section */}
              {(resultTab === 'all' || resultTab === 'problems') && results.problems.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                      Community Grievances ({results.problems.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {results.problems.map(prb => (
                      <div
                        key={prb.id}
                        onClick={() => {
                          onNavigate('problems', prb.id);
                          onClose();
                        }}
                        className="p-3 bg-white hover:bg-amber-50/50 border border-gray-200 hover:border-amber-300 rounded-xl cursor-pointer transition-all group shadow-2xs"
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-sm text-gray-900 block truncate">
                              {prb.title}
                            </span>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              Category: {prb.category} • Status: {prb.status}
                            </p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            prb.priority === 'High'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {prb.priority}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400 group-hover:text-amber-700 pt-1 border-t border-gray-100">
                          <span>ID: {prb.id}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-900">{results.totalMatches} matches found</span>
            <span className="text-gray-400">|</span>
            <span className="hidden sm:inline">Click any record to inspect directly</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-200 text-gray-700 font-semibold transition-colors"
            >
              Reset Filters
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
