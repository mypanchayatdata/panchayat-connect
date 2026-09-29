import React, { useState, useMemo, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { FamilyMember, VoterCategory, VoterStatus } from '../types';
import { VoterCategoryBadge, getVoterCategoryConfig } from '../components/common/VoterCategoryBadge';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  ArrowUpDown,
  Building,
  MapPin,
  Milestone,
  Home,
  Phone,
  UserCheck,
  RefreshCw,
  Download,
  SlidersHorizontal,
  X
} from 'lucide-react';

interface SpecialVotersViewProps {
  onNavigate: (view: string, targetId?: string) => void;
  initialCategoryFilter?: string;
}

export const SpecialVotersView: React.FC<SpecialVotersViewProps> = ({
  onNavigate,
  initialCategoryFilter
}) => {
  const { members, families, villages, wards, panchayat, updateMemberVoterInfo } = useDatabase();

  // Active Category Tab: ALL | GREEN | YELLOW | RED | NOT_VERIFIED | NO
  const [activeTab, setActiveTab] = useState<string>(initialCategoryFilter || 'ALL');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVillageId, setSelectedVillageId] = useState<string>('ALL');
  const [selectedWardId, setSelectedWardId] = useState<string>('ALL');
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
  const [ageRange, setAgeRange] = useState<string>('ALL');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Sync initialCategoryFilter when navigated with a targetId
  useEffect(() => {
    if (initialCategoryFilter) {
      if (['ALL', 'GREEN', 'YELLOW', 'RED', 'NOT_VERIFIED', 'NO'].includes(initialCategoryFilter)) {
        setActiveTab(initialCategoryFilter);
      }
    }
  }, [initialCategoryFilter]);

  // Overall Statistics calculated directly from state
  const totalPopulation = members.length;
  const allVoters = members.filter(m => m.isVoter && m.voterStatus !== 'NO');
  const totalVotersCount = allVoters.length;

  const greenVotersCount = members.filter(
    m => (m.isVoter && m.voterStatus !== 'NO') && (m.voterCategory === 'GREEN' || !m.voterCategory)
  ).length;

  const yellowVotersCount = members.filter(
    m => (m.isVoter && m.voterStatus !== 'NO') && m.voterCategory === 'YELLOW'
  ).length;

  const redVotersCount = members.filter(
    m => (m.isVoter && m.voterStatus !== 'NO') && m.voterCategory === 'RED'
  ).length;

  const notVerifiedCount = members.filter(m => m.voterStatus === 'NOT VERIFIED').length;
  const noVotersCount = members.filter(m => !m.isVoter || m.voterStatus === 'NO').length;

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const fam = families.find(f => f.id === m.familyId);
      const isVoterYes = m.isVoter && m.voterStatus !== 'NO';
      const cat = m.voterCategory || 'GREEN';

      // 1. Tab filter
      if (activeTab === 'GREEN') {
        if (!isVoterYes || cat !== 'GREEN') return false;
      } else if (activeTab === 'YELLOW') {
        if (!isVoterYes || cat !== 'YELLOW') return false;
      } else if (activeTab === 'RED') {
        if (!isVoterYes || cat !== 'RED') return false;
      } else if (activeTab === 'NOT_VERIFIED') {
        if (m.voterStatus !== 'NOT VERIFIED') return false;
      } else if (activeTab === 'NO') {
        if (isVoterYes) return false;
      } else if (activeTab === 'ALL') {
        // By default in ALL tab, we show all voters + unverified, or all members
      }

      // 2. Village filter
      if (selectedVillageId !== 'ALL' && fam?.villageId !== selectedVillageId) {
        return false;
      }

      // 3. Ward filter
      if (selectedWardId !== 'ALL' && fam?.wardId !== selectedWardId) {
        return false;
      }

      // 4. Family filter
      if (selectedFamilyId !== 'ALL' && m.familyId !== selectedFamilyId) {
        return false;
      }

      // 5. Status filter
      if (selectedStatus !== 'ALL') {
        if (selectedStatus === 'YES' && !isVoterYes) return false;
        if (selectedStatus === 'NO' && (isVoterYes || m.voterStatus === 'NOT VERIFIED')) return false;
        if (selectedStatus === 'NOT VERIFIED' && m.voterStatus !== 'NOT VERIFIED') return false;
      }

      // 6. Category filter
      if (selectedCategory !== 'ALL') {
        if (!isVoterYes || cat !== selectedCategory) return false;
      }

      // 7. Gender filter
      if (selectedGender !== 'ALL' && m.gender !== selectedGender) {
        return false;
      }

      // 8. Age range filter
      if (ageRange !== 'ALL') {
        if (ageRange === '18-25' && (m.age < 18 || m.age > 25)) return false;
        if (ageRange === '26-40' && (m.age < 26 || m.age > 40)) return false;
        if (ageRange === '41-60' && (m.age < 41 || m.age > 60)) return false;
        if (ageRange === '60+' && m.age < 60) return false;
        if (ageRange === '<18' && m.age >= 18) return false;
      }

      // 9. Search query (Name, Mobile, EPIC, Father/Husband, Family Head, Address)
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = m.name.toLowerCase().includes(q);
        const matchFather = m.fatherHusbandName.toLowerCase().includes(q);
        const matchEpic = m.voterEpicNumber?.toLowerCase().includes(q);
        const matchMobile = m.mobile?.includes(q) || fam?.primaryMobile.includes(q);
        const matchFamId = m.familyId.toLowerCase().includes(q);
        const matchHead = fam?.familyHeadName.toLowerCase().includes(q);
        const matchOcc = m.occupation.toLowerCase().includes(q);

        if (!matchName && !matchFather && !matchEpic && !matchMobile && !matchFamId && !matchHead && !matchOcc) {
          return false;
        }
      }

      return true;
    });
  }, [
    members,
    families,
    activeTab,
    selectedVillageId,
    selectedWardId,
    selectedFamilyId,
    selectedStatus,
    selectedCategory,
    selectedGender,
    ageRange,
    searchQuery
  ]);

  const resetAllFilters = () => {
    setActiveTab('ALL');
    setSearchQuery('');
    setSelectedVillageId('ALL');
    setSelectedWardId('ALL');
    setSelectedFamilyId('ALL');
    setSelectedStatus('ALL');
    setSelectedCategory('ALL');
    setSelectedGender('ALL');
    setAgeRange('ALL');
  };

  const hasActiveFilters =
    activeTab !== 'ALL' ||
    searchQuery !== '' ||
    selectedVillageId !== 'ALL' ||
    selectedWardId !== 'ALL' ||
    selectedFamilyId !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    selectedCategory !== 'ALL' ||
    selectedGender !== 'ALL' ||
    ageRange !== 'ALL';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-md border border-emerald-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">🗳️</span>
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
              Strategic Voter Management System
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            SPECIAL VOTER
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            {panchayat.name} Gram Panchayat • Real-time Voter Categorization & Electoral Outreach
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('panchayat')}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Building className="w-4 h-4 text-emerald-400" />
            <span>Panchayat Overview</span>
          </button>
          <button
            onClick={() => onNavigate('families')}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Family Profiles</span>
          </button>
        </div>
      </div>

      {/* STATISTICS CARDS BANNER (Clickable) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Total Voters */}
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
              : 'bg-white hover:bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
              Total Voters
            </span>
            <span className="text-xs font-bold text-blue-700">🗳️</span>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-1">
            {totalVotersCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5 font-medium">
            {totalPopulation > 0 ? `${Math.round((totalVotersCount / totalPopulation) * 100)}% of citizens` : '0%'}
          </div>
        </button>

        {/* 2. Green Voters */}
        <button
          type="button"
          onClick={() => setActiveTab('GREEN')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'GREEN'
              ? 'bg-emerald-100/90 border-emerald-600 ring-2 ring-emerald-500/30 shadow-md'
              : 'bg-emerald-50/60 hover:bg-emerald-100/60 border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
              🟢 Green
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">
              {totalVotersCount > 0 ? `${Math.round((greenVotersCount / totalVotersCount) * 100)}%` : '0%'}
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-950 mt-1">
            {greenVotersCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-700 mt-0.5 font-medium">
            Favorable / Supporter
          </div>
        </button>

        {/* 3. Yellow Voters */}
        <button
          type="button"
          onClick={() => setActiveTab('YELLOW')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'YELLOW'
              ? 'bg-amber-100/90 border-amber-600 ring-2 ring-amber-500/30 shadow-md'
              : 'bg-amber-50/60 hover:bg-amber-100/60 border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
              🟡 Yellow
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
              {totalVotersCount > 0 ? `${Math.round((yellowVotersCount / totalVotersCount) * 100)}%` : '0%'}
            </span>
          </div>
          <div className="text-2xl font-black text-amber-950 mt-1">
            {yellowVotersCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-amber-700 mt-0.5 font-medium">
            Moderate / Leaning
          </div>
        </button>

        {/* 4. Red Voters */}
        <button
          type="button"
          onClick={() => setActiveTab('RED')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'RED'
              ? 'bg-rose-100/90 border-rose-600 ring-2 ring-rose-500/30 shadow-md'
              : 'bg-rose-50/60 hover:bg-rose-100/60 border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800">
              🔴 Red
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-900">
              {totalVotersCount > 0 ? `${Math.round((redVotersCount / totalVotersCount) * 100)}%` : '0%'}
            </span>
          </div>
          <div className="text-2xl font-black text-rose-950 mt-1">
            {redVotersCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-rose-700 mt-0.5 font-medium">
            Needs Attention / Swing
          </div>
        </button>

        {/* 5. Not Verified */}
        <button
          type="button"
          onClick={() => setActiveTab('NOT_VERIFIED')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'NOT_VERIFIED'
              ? 'bg-orange-100/90 border-orange-500 ring-2 ring-orange-500/30 shadow-md'
              : 'bg-orange-50/60 hover:bg-orange-100/60 border-orange-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-800">
              ⚠ Not Verified
            </span>
            <span className="text-xs">⚠️</span>
          </div>
          <div className="text-2xl font-black text-orange-950 mt-1">
            {notVerifiedCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-orange-700 mt-0.5 font-medium">
            Verification pending
          </div>
        </button>

        {/* 6. Non Voters (NO) */}
        <button
          type="button"
          onClick={() => setActiveTab('NO')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'NO'
              ? 'bg-gray-200 border-gray-500 ring-2 ring-gray-400/30 shadow-md'
              : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-600">
              NO / Ineligible
            </span>
            <span className="text-xs">🚫</span>
          </div>
          <div className="text-2xl font-black text-gray-800 mt-1">
            {noVotersCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5 font-medium">
            Minors / Non-voters
          </div>
        </button>
      </div>

      {/* FILTER & TABS BAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        {/* Quick Category Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'ALL VOTERS', icon: '🗳️', count: totalVotersCount },
              { id: 'GREEN', label: '🟢 GREEN', count: greenVotersCount, color: 'text-emerald-700' },
              { id: 'YELLOW', label: '🟡 YELLOW', count: yellowVotersCount, color: 'text-amber-700' },
              { id: 'RED', label: '🔴 RED', count: redVotersCount, color: 'text-rose-700' },
              { id: 'NOT_VERIFIED', label: '⚠ NOT VERIFIED', count: notVerifiedCount, color: 'text-orange-700' },
              { id: 'NO', label: 'NO', count: noVotersCount, color: 'text-gray-600' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id ? 'bg-slate-700 text-white' : 'bg-white text-gray-800 font-bold'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowAdvancedFilters(prev => !prev)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              showAdvancedFilters || hasActiveFilters
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Multi-Level Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            )}
          </button>
        </div>

        {/* Search Input and Primary Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Universal Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Name, Mobile, EPIC, Family..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Village Filter */}
          <div>
            <select
              value={selectedVillageId}
              onChange={e => {
                setSelectedVillageId(e.target.value);
                setSelectedWardId('ALL');
              }}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">All Villages ({villages.length})</option>
              {villages.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.code})
                </option>
              ))}
            </select>
          </div>

          {/* Ward Filter */}
          <div>
            <select
              value={selectedWardId}
              onChange={e => setSelectedWardId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">All Wards ({wards.length})</option>
              {wards
                .filter(w => selectedVillageId === 'ALL' || w.villageId === selectedVillageId)
                .map((w, idx) => (
                  <option key={`sv-ward-${w.id}-${idx}`} value={w.id}>
                    Ward {w.wardNumber} ({w.wardMemberName || w.id})
                  </option>
                ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">All Voter Categories</option>
              <option value="GREEN">🟢 Green Only</option>
              <option value="YELLOW">🟡 Yellow Only</option>
              <option value="RED">🔴 Red Only</option>
            </select>
          </div>
        </div>

        {/* Extended Advanced Filters Collapsible */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 bg-slate-50/70 p-3 rounded-xl">
            {/* Gender Filter */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Gender</label>
              <select
                value={selectedGender}
                onChange={e => setSelectedGender(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-800"
              >
                <option value="ALL">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Age Range Filter */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Age Range</label>
              <select
                value={ageRange}
                onChange={e => setAgeRange(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-800"
              >
                <option value="ALL">All Ages</option>
                <option value="18-25">18 - 25 years (Youth)</option>
                <option value="26-40">26 - 40 years</option>
                <option value="41-60">41 - 60 years</option>
                <option value="60+">60+ years (Senior Citizen)</option>
                <option value="<18">Under 18 (Minor)</option>
              </select>
            </div>

            {/* Voter Status Filter */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Voter Status</label>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-800"
              >
                <option value="ALL">All Verification Statuses</option>
                <option value="YES">YES (Enrolled Voter)</option>
                <option value="NOT VERIFIED">NOT VERIFIED</option>
                <option value="NO">NO (Non-voter)</option>
              </select>
            </div>

            {/* Reset Action */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={resetAllFilters}
                className="w-full py-1.5 px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}

        {/* Results summary bar */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
          <div>
            Showing <strong>{filteredMembers.length}</strong> matching citizens
            {hasActiveFilters && (
              <span className="ml-1 text-blue-600 font-semibold">• Filters Active</span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* SPECIAL VOTER MEMBERS TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[950px]">
            <thead className="bg-slate-900 text-slate-200 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Member Name & Category</th>
                <th className="p-3 text-center">Age / Gen</th>
                <th className="p-3">Family (Head & ID)</th>
                <th className="p-3">Village</th>
                <th className="p-3 text-center">Ward</th>
                <th className="p-3">Mobile Contact</th>
                <th className="p-3 text-center">Voter Status</th>
                <th className="p-3 text-center">Admin Category Control</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-gray-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-600">No voter records found matching the active criteria.</p>
                    <p className="text-xs text-gray-400 mt-1">Try switching tabs or resetting filters above.</p>
                    <button
                      onClick={resetAllFilters}
                      className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredMembers.map(m => {
                  const fam = families.find(f => f.id === m.familyId);
                  const village = villages.find(v => v.id === fam?.villageId);
                  const ward = wards.find(w => w.id === fam?.wardId);
                  const isVoterYes = m.isVoter && m.voterStatus !== 'NO';
                  const cat = m.voterCategory || 'GREEN';

                  return (
                    <tr key={m.id} className="hover:bg-blue-50/30 transition-colors">
                      {/* 1. Member Name with VoterCategoryBadge */}
                      <td className="p-3 font-bold text-gray-900">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{m.name}</span>
                          <VoterCategoryBadge
                            memberId={m.id}
                            isVoter={m.isVoter}
                            voterStatus={m.voterStatus}
                            voterCategory={m.voterCategory}
                            showStatusLabel={false}
                            size="md"
                          />
                        </div>
                        <div className="flex items-center space-x-2 text-[11px] text-gray-500 font-normal mt-0.5">
                          <span>{m.relation} • {m.fatherHusbandName}</span>
                          {m.voterEpicNumber && (
                            <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1 rounded">
                              EPIC: {m.voterEpicNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. Age / Gender */}
                      <td className="p-3 text-center text-gray-700 font-medium">
                        <span className="text-xs font-bold text-gray-900">{m.age}</span>
                        <span className="block text-[10px] text-gray-500">{m.gender}</span>
                      </td>

                      {/* 3. Family ID & Head */}
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => onNavigate('families', m.familyId)}
                          className="text-left group cursor-pointer"
                        >
                          <span className="font-mono text-[11px] font-bold text-blue-700 group-hover:underline block">
                            {m.familyId}
                          </span>
                          <span className="text-xs text-gray-800 group-hover:text-blue-900 font-semibold block truncate max-w-[150px]">
                            {fam?.familyHeadName || 'Household'}
                          </span>
                        </button>
                      </td>

                      {/* 4. Village */}
                      <td className="p-3 text-gray-700">
                        <span className="font-semibold text-gray-900">{village?.name || 'Nuagaon'}</span>
                        <span className="block text-[10px] text-gray-400 font-mono">{village?.code}</span>
                      </td>

                      {/* 5. Ward */}
                      <td className="p-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold text-xs">
                          W-{ward?.wardNumber || fam?.wardId?.replace(/\D/g, '') || '1'}
                        </span>
                      </td>

                      {/* 6. Mobile */}
                      <td className="p-3 text-gray-700 font-mono text-[11px]">
                        {m.mobile || fam?.primaryMobile ? (
                          <a
                            href={`tel:${m.mobile || fam?.primaryMobile}`}
                            className="text-gray-800 hover:text-blue-700 flex items-center space-x-1"
                          >
                            <Phone className="w-3 h-3 text-blue-600 shrink-0" />
                            <span>{m.mobile || fam?.primaryMobile}</span>
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* 7. Voter Status */}
                      <td className="p-3 text-center">
                        {isVoterYes ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                            YES
                          </span>
                        ) : m.voterStatus === 'NOT VERIFIED' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                            NOT VERIFIED
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500">
                            NO
                          </span>
                        )}
                      </td>

                      {/* 8. Admin Category Control Buttons */}
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200">
                          <button
                            type="button"
                            title="Set Green (Favorable)"
                            onClick={() =>
                              updateMemberVoterInfo(m.id, {
                                voterCategory: 'GREEN',
                                voterStatus: 'YES',
                                isVoter: true
                              })
                            }
                            className={`px-2 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                              cat === 'GREEN' && isVoterYes
                                ? 'bg-emerald-600 text-white shadow-xs scale-105'
                                : 'hover:bg-emerald-100 text-emerald-800 opacity-60 hover:opacity-100'
                            }`}
                          >
                            🟢 Grn
                          </button>
                          <button
                            type="button"
                            title="Set Yellow (Moderate)"
                            onClick={() =>
                              updateMemberVoterInfo(m.id, {
                                voterCategory: 'YELLOW',
                                voterStatus: 'YES',
                                isVoter: true
                              })
                            }
                            className={`px-2 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                              cat === 'YELLOW' && isVoterYes
                                ? 'bg-amber-500 text-white shadow-xs scale-105'
                                : 'hover:bg-amber-100 text-amber-800 opacity-60 hover:opacity-100'
                            }`}
                          >
                            🟡 Ylw
                          </button>
                          <button
                            type="button"
                            title="Set Red (Swing / Needs Attention)"
                            onClick={() =>
                              updateMemberVoterInfo(m.id, {
                                voterCategory: 'RED',
                                voterStatus: 'YES',
                                isVoter: true
                              })
                            }
                            className={`px-2 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                              cat === 'RED' && isVoterYes
                                ? 'bg-rose-600 text-white shadow-xs scale-105'
                                : 'hover:bg-rose-100 text-rose-800 opacity-60 hover:opacity-100'
                            }`}
                          >
                            🔴 Red
                          </button>
                        </div>
                      </td>

                      {/* 9. Actions */}
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => onNavigate('families', m.familyId)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-800 border border-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Family Profile →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
