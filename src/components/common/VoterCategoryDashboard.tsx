import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { FamilyMember, VoterCategory } from '../../types';
import { VoterCategoryBadge, getVoterCategoryConfig } from './VoterCategoryBadge';
import { Users, Filter, Search, X, Check, ArrowRight } from 'lucide-react';

interface VoterCategoryDashboardProps {
  villageId?: string;
  wardId?: string;
  title?: string;
  onNavigateToFamily?: (familyId: string) => void;
  className?: string;
}

export const VoterCategoryDashboard: React.FC<VoterCategoryDashboardProps> = ({
  villageId,
  wardId,
  title,
  onNavigateToFamily,
  className = ''
}) => {
  const { members, families, villages, wards, updateMemberVoterInfo } = useDatabase();
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'GREEN' | 'YELLOW' | 'RED' | 'NOT_VERIFIED' | 'NON_VOTER'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  // Filter relevant members by village / ward if provided
  const relevantMembers = members.filter(m => {
    const fam = families.find(f => f.id === m.familyId);
    if (!fam) return false;
    if (wardId && fam.wardId !== wardId) return false;
    if (villageId && fam.villageId !== villageId) return false;
    return true;
  });

  const totalVoters = relevantMembers.filter(m => m.isVoter && m.voterStatus !== 'NO').length;
  
  // Counts by category
  const greenCount = relevantMembers.filter(m => {
    const isVoterYes = m.isVoter && m.voterStatus !== 'NO';
    return isVoterYes && (m.voterCategory === 'GREEN' || !m.voterCategory);
  }).length;

  const yellowCount = relevantMembers.filter(m => {
    const isVoterYes = m.isVoter && m.voterStatus !== 'NO';
    return isVoterYes && m.voterCategory === 'YELLOW';
  }).length;

  const redCount = relevantMembers.filter(m => {
    const isVoterYes = m.isVoter && m.voterStatus !== 'NO';
    return isVoterYes && m.voterCategory === 'RED';
  }).length;

  const notVerifiedCount = relevantMembers.filter(m => m.voterStatus === 'NOT VERIFIED').length;
  const nonVotersCount = relevantMembers.filter(m => !m.isVoter || m.voterStatus === 'NO').length;

  // Filtered members list when a user clicks a category
  const filteredList = relevantMembers.filter(m => {
    const isVoterYes = m.isVoter && m.voterStatus !== 'NO';
    const cat = m.voterCategory || 'GREEN';

    if (selectedFilter === 'GREEN' && (!isVoterYes || cat !== 'GREEN')) return false;
    if (selectedFilter === 'YELLOW' && (!isVoterYes || cat !== 'YELLOW')) return false;
    if (selectedFilter === 'RED' && (!isVoterYes || cat !== 'RED')) return false;
    if (selectedFilter === 'NOT_VERIFIED' && m.voterStatus !== 'NOT VERIFIED') return false;
    if (selectedFilter === 'NON_VOTER' && (m.isVoter && m.voterStatus !== 'NO')) return false;
    if (selectedFilter === 'ALL' && !isVoterYes) return false; // In ALL voters mode, show all voters

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = m.name.toLowerCase().includes(q);
      const matchFather = m.fatherHusbandName.toLowerCase().includes(q);
      const matchEpic = m.voterEpicNumber?.toLowerCase().includes(q);
      const matchFam = m.familyId.toLowerCase().includes(q);
      if (!matchName && !matchFather && !matchEpic && !matchFam) return false;
    }

    return true;
  });

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-700">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wide">
              {title || 'Voter Categorization & Strategic Insights'}
            </h3>
            <p className="text-[11px] text-gray-500">
              Interactive breakdown • Click any category badge to filter or assign
            </p>
          </div>
        </div>

        {selectedFilter !== 'ALL' && (
          <button
            onClick={() => setSelectedFilter('ALL')}
            className="flex items-center space-x-1 text-xs text-blue-700 hover:text-blue-900 font-bold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 self-start cursor-pointer"
          >
            <span>Showing: {selectedFilter}</span>
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Interactive Voters & Category Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Voters */}
        <button
          type="button"
          onClick={() => setSelectedFilter('ALL')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            selectedFilter === 'ALL'
              ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-400/20 shadow-xs'
              : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">
              Total Voters
            </span>
            <span className="text-xs font-bold text-blue-700">🗳️</span>
          </div>
          <span className="text-2xl font-black text-gray-900 block mt-1">
            {totalVoters.toLocaleString()}
          </span>
          <span className="text-[10px] text-gray-500 block mt-0.5">
            {relevantMembers.length > 0 ? `${Math.round((totalVoters / relevantMembers.length) * 100)}% of population` : '0%'}
          </span>
        </button>

        {/* GREEN Category */}
        <button
          type="button"
          onClick={() => setSelectedFilter('GREEN')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            selectedFilter === 'GREEN'
              ? 'bg-emerald-100/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-emerald-50 hover:bg-emerald-100/50 border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-emerald-800 block text-[10px] uppercase font-extrabold tracking-wider">
              🟢 Green
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
              {totalVoters > 0 ? `${Math.round((greenCount / totalVoters) * 100)}%` : '0%'}
            </span>
          </div>
          <span className="text-2xl font-black text-emerald-950 block mt-1">
            {greenCount.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
            Favorable / Strong
          </span>
        </button>

        {/* YELLOW Category */}
        <button
          type="button"
          onClick={() => setSelectedFilter('YELLOW')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            selectedFilter === 'YELLOW'
              ? 'bg-amber-100/70 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-amber-50 hover:bg-amber-100/50 border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-amber-800 block text-[10px] uppercase font-extrabold tracking-wider">
              🟡 Yellow
            </span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
              {totalVoters > 0 ? `${Math.round((yellowCount / totalVoters) * 100)}%` : '0%'}
            </span>
          </div>
          <span className="text-2xl font-black text-amber-950 block mt-1">
            {yellowCount.toLocaleString()}
          </span>
          <span className="text-[10px] text-amber-700 font-medium block mt-0.5">
            Moderate / Leaning
          </span>
        </button>

        {/* RED Category */}
        <button
          type="button"
          onClick={() => setSelectedFilter('RED')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            selectedFilter === 'RED'
              ? 'bg-rose-100/70 border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
              : 'bg-rose-50 hover:bg-rose-100/50 border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-rose-800 block text-[10px] uppercase font-extrabold tracking-wider">
              🔴 Red
            </span>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
              {totalVoters > 0 ? `${Math.round((redCount / totalVoters) * 100)}%` : '0%'}
            </span>
          </div>
          <span className="text-2xl font-black text-rose-950 block mt-1">
            {redCount.toLocaleString()}
          </span>
          <span className="text-[10px] text-rose-700 font-medium block mt-0.5">
            Needs Attention / Swing
          </span>
        </button>
      </div>

      {/* Interactive Citizen/Voter Table List for Selected Filter */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-800">
              {selectedFilter === 'ALL'
                ? 'All Registered Voters'
                : selectedFilter === 'GREEN'
                ? '🟢 Green Category Voters'
                : selectedFilter === 'YELLOW'
                ? '🟡 Yellow Category Voters'
                : selectedFilter === 'RED'
                ? '🔴 Red Category Voters'
                : 'Voters List'}{' '}
              ({filteredList.length})
            </span>
            <span className="text-[10px] text-gray-500 font-normal">
              (Admin can click the dot/badge to change category instantly)
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search member by name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:border-blue-500 w-48 sm:w-60"
            />
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[600px]">
            <thead className="bg-slate-100 text-gray-600 uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-gray-200">
              <tr>
                <th className="p-2.5">Member Name & Category</th>
                <th className="p-2.5">Age / Gen</th>
                <th className="p-2.5">Father / Husband</th>
                <th className="p-2.5">Voter Status</th>
                <th className="p-2.5 text-center">Admin Category Control</th>
                <th className="p-2.5 text-right">Family</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-400">
                    No citizens match the selected voter category.
                  </td>
                </tr>
              ) : (
                filteredList.map(m => {
                  const fam = families.find(f => f.id === m.familyId);
                  const isVoterYes = m.isVoter && m.voterStatus !== 'NO';
                  const cat = m.voterCategory || 'GREEN';

                  return (
                    <tr key={m.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-2.5 font-bold text-gray-900">
                        <div className="flex items-center space-x-2">
                          <span>{m.name}</span>
                          {/* Live Category Dot Beside Person's Name throughout the system */}
                          <VoterCategoryBadge
                            memberId={m.id}
                            isVoter={m.isVoter}
                            voterStatus={m.voterStatus}
                            voterCategory={m.voterCategory}
                            showStatusLabel={false}
                            size="sm"
                          />
                        </div>
                        {m.voterEpicNumber && (
                          <span className="text-[10px] font-mono text-gray-400 block font-normal">
                            EPIC: {m.voterEpicNumber}
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-gray-700">
                        {m.age} yrs • {m.gender}
                      </td>
                      <td className="p-2.5 text-gray-600">{m.fatherHusbandName}</td>
                      <td className="p-2.5">
                        {isVoterYes ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                            Yes
                          </span>
                        ) : m.voterStatus === 'NOT VERIFIED' ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            Not Verified
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                            No
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="inline-flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
                          <button
                            type="button"
                            title="Set Green"
                            onClick={() =>
                              updateMemberVoterInfo(m.id, {
                                voterCategory: 'GREEN',
                                voterStatus: 'YES',
                                isVoter: true
                              })
                            }
                            className={`px-1.5 py-0.5 text-xs rounded transition-all cursor-pointer ${
                              cat === 'GREEN' && isVoterYes
                                ? 'bg-emerald-500 text-white shadow-xs font-bold scale-105'
                                : 'hover:bg-emerald-100 text-emerald-800 opacity-60 hover:opacity-100'
                            }`}
                          >
                            🟢 Grn
                          </button>
                          <button
                            type="button"
                            title="Set Yellow"
                            onClick={() =>
                              updateMemberVoterInfo(m.id, {
                                voterCategory: 'YELLOW',
                                voterStatus: 'YES',
                                isVoter: true
                              })
                            }
                            className={`px-1.5 py-0.5 text-xs rounded transition-all cursor-pointer ${
                              cat === 'YELLOW' && isVoterYes
                                ? 'bg-amber-500 text-white shadow-xs font-bold scale-105'
                                : 'hover:bg-amber-100 text-amber-800 opacity-60 hover:opacity-100'
                            }`}
                          >
                            🟡 Ylw
                          </button>
                          <button
                            type="button"
                            title="Set Red"
                            onClick={() =>
                              updateMemberVoterInfo(m.id, {
                                voterCategory: 'RED',
                                voterStatus: 'YES',
                                isVoter: true
                              })
                            }
                            className={`px-1.5 py-0.5 text-xs rounded transition-all cursor-pointer ${
                              cat === 'RED' && isVoterYes
                                ? 'bg-rose-500 text-white shadow-xs font-bold scale-105'
                                : 'hover:bg-rose-100 text-rose-800 opacity-60 hover:opacity-100'
                            }`}
                          >
                            🔴 Red
                          </button>
                        </div>
                      </td>
                      <td className="p-2.5 text-right font-mono text-[11px]">
                        {onNavigateToFamily ? (
                          <button
                            type="button"
                            onClick={() => onNavigateToFamily(m.familyId)}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-bold"
                          >
                            {m.familyId} →
                          </button>
                        ) : (
                          <span className="text-gray-600">{m.familyId}</span>
                        )}
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
