import React, { useState, useMemo } from 'react';
import { CommunityProblem, FollowUpTicket, Village, Ward, Family } from '../../types';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  HeartHandshake,
  Check,
  ChevronRight,
  Filter,
  Plus,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  Building
} from 'lucide-react';

export type TicketScopeFilter = 'ALL' | 'COMMUNITY' | 'INDIVIDUAL';

interface TicketSummarySplitViewProps {
  problems: CommunityProblem[];
  tickets: FollowUpTicket[];
  villages: Village[];
  wards: Ward[];
  families: Family[];
  selectedVillageId?: string;
  selectedWardId?: string;
  onNavigate: (view: string, targetId?: string) => void;
  onOpenQuickAdd: (type: string, initialData?: any) => void;
  onSolveProblem?: (problemId: string, e?: React.MouseEvent) => void;
  onSolveTicket?: (ticketId: string, e?: React.MouseEvent) => void;
}

interface UnifiedTicketItem {
  id: string;
  scope: 'COMMUNITY' | 'INDIVIDUAL';
  title: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  status: string;
  isSolved: boolean;
  villageId?: string;
  villageName?: string;
  wardId?: string;
  familyId?: string;
  familyHeadName?: string;
  reportedDate: string;
  resolvedDate?: string;
  actionOrNotes?: string;
  reportedBy?: string;
  officialDepartment?: string;
}

export const TicketSummarySplitView: React.FC<TicketSummarySplitViewProps> = ({
  problems,
  tickets,
  villages,
  wards,
  families,
  selectedVillageId = 'all',
  selectedWardId = 'all',
  onNavigate,
  onOpenQuickAdd,
  onSolveProblem,
  onSolveTicket
}) => {
  const [scopeFilter, setScopeFilter] = useState<TicketScopeFilter>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'High' | 'Medium' | 'Low'>('ALL');

  // Filter raw data by active Village / Ward hierarchy
  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      const vMatch = selectedVillageId === 'all' || p.villageId === selectedVillageId;
      const wMatch = selectedWardId === 'all' || p.wardId === selectedWardId;
      return vMatch && wMatch;
    });
  }, [problems, selectedVillageId, selectedWardId]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const fam = t.familyId ? families.find(f => f.id === t.familyId) : null;
      const vId = t.villageId || fam?.villageId;
      const wId = t.wardId || fam?.wardId;
      const vMatch = selectedVillageId === 'all' || vId === selectedVillageId;
      const wMatch = selectedWardId === 'all' || wId === selectedWardId;
      return vMatch && wMatch;
    });
  }, [tickets, families, selectedVillageId, selectedWardId]);

  // Convert Community Problems to Unified Representation
  const unifiedProblems = useMemo<UnifiedTicketItem[]>(() => {
    return filteredProblems.map(p => {
      const v = villages.find(vil => vil.id === p.villageId);
      const isSolved = p.status === 'Completed' || (p.status as any) === 'Resolved' || (p.status as any) === 'Closed';
      return {
        id: p.id,
        scope: 'COMMUNITY',
        title: p.title,
        category: p.category,
        priority: p.priority,
        status: p.status,
        isSolved,
        villageId: p.villageId,
        villageName: v?.name || p.villageId,
        wardId: p.wardId,
        reportedDate: p.reportedDate,
        resolvedDate: p.resolvedDate,
        actionOrNotes: p.actionTaken || p.latestAction || p.description,
        reportedBy: p.reportedBy,
        officialDepartment: p.officialDepartment
      };
    });
  }, [filteredProblems, villages]);

  // Convert Individual / Family Tickets to Unified Representation
  const unifiedTickets = useMemo<UnifiedTicketItem[]>(() => {
    return filteredTickets.map(t => {
      const fam = families.find(f => f.id === t.familyId);
      const v = villages.find(vil => vil.id === (t.villageId || fam?.villageId));
      const isSolved = t.status === 'Resolved' || t.status === 'Closed' || t.status === 'Completed';
      return {
        id: t.id,
        scope: 'INDIVIDUAL',
        title: t.title,
        category: t.category,
        priority: t.priority,
        status: t.status,
        isSolved,
        villageId: t.villageId || fam?.villageId,
        villageName: v?.name || t.villageId,
        wardId: t.wardId || fam?.wardId,
        familyId: t.familyId,
        familyHeadName: fam?.familyHeadName,
        reportedDate: t.createdDate,
        resolvedDate: t.resolvedDate,
        actionOrNotes: t.notes || t.description,
        reportedBy: t.reportedBy || fam?.familyHeadName,
        officialDepartment: t.schemeName ? `Scheme: ${t.schemeName}` : undefined
      };
    });
  }, [filteredTickets, families, villages]);

  // Combined Items
  const allItems = useMemo<UnifiedTicketItem[]>(() => {
    return [...unifiedProblems, ...unifiedTickets];
  }, [unifiedProblems, unifiedTickets]);

  // Selected Scope Items
  const scopeItems = useMemo(() => {
    if (scopeFilter === 'COMMUNITY') return unifiedProblems;
    if (scopeFilter === 'INDIVIDUAL') return unifiedTickets;
    return allItems;
  }, [scopeFilter, unifiedProblems, unifiedTickets, allItems]);

  // Pending vs Solved Split
  const pendingItems = useMemo(() => {
    return scopeItems.filter(item => {
      const priMatch = priorityFilter === 'ALL' || item.priority === priorityFilter;
      return !item.isSolved && priMatch;
    });
  }, [scopeItems, priorityFilter]);

  const solvedItems = useMemo(() => {
    return scopeItems.filter(item => {
      const priMatch = priorityFilter === 'ALL' || item.priority === priorityFilter;
      return item.isSolved && priMatch;
    });
  }, [scopeItems, priorityFilter]);

  // Counts for Badges
  const allSolvedCount = allItems.filter(i => i.isSolved).length;
  const allPendingCount = allItems.filter(i => !i.isSolved).length;

  const communitySolvedCount = unifiedProblems.filter(i => i.isSolved).length;
  const communityPendingCount = unifiedProblems.filter(i => !i.isSolved).length;

  const individualSolvedCount = unifiedTickets.filter(i => i.isSolved).length;
  const individualPendingCount = unifiedTickets.filter(i => !i.isSolved).length;

  // Active counts for the current selection
  const currentSolvedCount = solvedItems.length;
  const currentPendingCount = pendingItems.length;
  const currentTotal = currentSolvedCount + currentPendingCount;
  const resolutionPercentage = currentTotal > 0 ? Math.round((currentSolvedCount / currentTotal) * 100) : 0;

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
      {/* Header with Title & Scope Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-black text-gray-900 tracking-tight">
                TICKETS & GRIEVANCES RESOLUTION DASHBOARD
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Split View
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Single-click comparative analysis of Solved vs Pending issues across Community & Individual scopes
            </p>
          </div>
        </div>

        {/* Quick Report Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onOpenQuickAdd('problem')}
            className="flex items-center space-x-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            title="Report Village / Ward public problem (Stored in Community)"
          >
            <Plus className="w-3.5 h-3.5 text-amber-600" />
            <span>+ Community Problem</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenQuickAdd('ticket')}
            className="flex items-center space-x-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            title="Create citizen or household follow-up ticket (Stored in Family Profile)"
          >
            <Plus className="w-3.5 h-3.5 text-purple-600" />
            <span>+ Individual Ticket</span>
          </button>
        </div>
      </div>

      {/* SINGLE-CLICK SCOPE FILTER TABS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Tab 1: All Scopes */}
        <button
          type="button"
          onClick={() => setScopeFilter('ALL')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            scopeFilter === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-slate-900/10'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <span>🌐 All Scopes Combined</span>
            </span>
            <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
              scopeFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-800'
            }`}>
              {allItems.length} Total
            </span>
          </div>
          <div className="flex items-center space-x-3 mt-2 text-xs">
            <span className="font-semibold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Solved: <strong>{allSolvedCount}</strong></span>
            </span>
            <span className="opacity-40">|</span>
            <span className="font-semibold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Pending: <strong>{allPendingCount}</strong></span>
            </span>
          </div>
        </button>

        {/* Tab 2: Community Scope */}
        <button
          type="button"
          onClick={() => setScopeFilter('COMMUNITY')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            scopeFilter === 'COMMUNITY'
              ? 'bg-amber-700 text-white border-amber-800 shadow-sm ring-2 ring-amber-600/30'
              : 'bg-amber-50/50 hover:bg-amber-50 text-gray-800 border-amber-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <span>🏘️ Community Scope</span>
            </span>
            <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
              scopeFilter === 'COMMUNITY' ? 'bg-white/20 text-white' : 'bg-amber-200 text-amber-900'
            }`}>
              {unifiedProblems.length} Issues
            </span>
          </div>
          <div className="flex items-center space-x-3 mt-2 text-xs">
            <span className="font-semibold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Solved: <strong>{communitySolvedCount}</strong></span>
            </span>
            <span className="opacity-40">|</span>
            <span className="font-semibold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-300"></span>
              <span>Pending: <strong>{communityPendingCount}</strong></span>
            </span>
          </div>
        </button>

        {/* Tab 3: Individual / Family Scope */}
        <button
          type="button"
          onClick={() => setScopeFilter('INDIVIDUAL')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            scopeFilter === 'INDIVIDUAL'
              ? 'bg-purple-800 text-white border-purple-900 shadow-sm ring-2 ring-purple-600/30'
              : 'bg-purple-50/50 hover:bg-purple-50 text-gray-800 border-purple-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <span>👤 Individual / Family Scope</span>
            </span>
            <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
              scopeFilter === 'INDIVIDUAL' ? 'bg-white/20 text-white' : 'bg-purple-200 text-purple-900'
            }`}>
              {unifiedTickets.length} Tickets
            </span>
          </div>
          <div className="flex items-center space-x-3 mt-2 text-xs">
            <span className="font-semibold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Solved: <strong>{individualSolvedCount}</strong></span>
            </span>
            <span className="opacity-40">|</span>
            <span className="font-semibold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-purple-300"></span>
              <span>Pending: <strong>{individualPendingCount}</strong></span>
            </span>
          </div>
        </button>
      </div>

      {/* Priority Filter Bar */}
      <div className="flex items-center justify-between text-xs pt-1">
        <div className="flex items-center space-x-2">
          <span className="text-gray-500 font-bold">Filter Priority:</span>
          <div className="flex items-center space-x-1">
            {(['ALL', 'High', 'Medium', 'Low'] as const).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  priorityFilter === p
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {p === 'ALL' ? 'All Priorities' : p}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-600 font-medium">
          Resolution Rate: <strong className="text-emerald-700 font-bold">{resolutionPercentage}%</strong> ({currentSolvedCount} of {currentTotal})
        </div>
      </div>

      {/* SPLIT-VIEW COUNT & ITEMS CONTAINER (Solved vs Pending) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4.5">
        {/* ======================================================== */}
        {/* LEFT COLUMN: PENDING / IN-PROGRESS TICKETS               */}
        {/* ======================================================== */}
        <div className="bg-amber-50/40 rounded-2xl border border-amber-200 p-4.5 flex flex-col justify-between space-y-4">
          <div>
            {/* Column Header & Big Count */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-1.5 text-amber-800 font-black text-xs uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Pending & In-Process</span>
                </div>
                <div className="text-3xl font-black text-gray-900 mt-1">
                  {currentPendingCount}
                  <span className="text-xs font-semibold text-gray-500 ml-2">
                    Awaiting Action
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  {scopeFilter === 'COMMUNITY' ? 'Community Only' : scopeFilter === 'INDIVIDUAL' ? 'Citizen Only' : 'Combined Scopes'}
                </span>
                <div className="text-[11px] text-gray-500 mt-1">
                  High Priority: <strong className="text-rose-600">{pendingItems.filter(i => i.priority === 'High').length}</strong>
                </div>
              </div>
            </div>

            {/* Pending Items List */}
            <div className="mt-4 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {pendingItems.length === 0 ? (
                <div className="py-8 text-center text-gray-400 bg-white/80 rounded-xl border border-dashed border-amber-200">
                  <CheckCircle2 className="w-7 h-7 mx-auto text-emerald-500 mb-1.5" />
                  <p className="text-xs font-bold text-gray-700">All caught up!</p>
                  <p className="text-[11px] text-gray-400">No pending issues in this selection.</p>
                </div>
              ) : (
                pendingItems.map(item => {
                  const isCommunity = item.scope === 'COMMUNITY';
                  return (
                    <div
                      key={`pending-${item.scope}-${item.id}`}
                      className="p-3 bg-white rounded-xl border border-amber-100 hover:border-amber-300 shadow-2xs transition-all flex flex-col justify-between text-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-mono text-[10px] font-bold text-gray-400">{item.id}</span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                              isCommunity ? 'bg-amber-100 text-amber-900' : 'bg-purple-100 text-purple-900'
                            }`}>
                              {isCommunity ? '🏘️ Community' : '👤 Individual'}
                            </span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                              item.priority === 'High' ? 'bg-rose-100 text-rose-800' :
                              item.priority === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {item.priority}
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-900 leading-snug">{item.title}</h4>
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                            {item.category} • {item.villageName || item.villageId} {item.wardId ? `• Ward ${item.wardId}` : ''}
                            {item.familyHeadName ? ` • ${item.familyHeadName}` : ''}
                          </p>
                        </div>

                        {/* Quick Mark Solved Button */}
                        <div className="shrink-0">
                          {isCommunity && onSolveProblem ? (
                            <button
                              type="button"
                              onClick={(e) => onSolveProblem(item.id, e)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                              title="Mark problem as Solved and archive in Community section"
                            >
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Mark Solved</span>
                            </button>
                          ) : !isCommunity && onSolveTicket ? (
                            <button
                              type="button"
                              onClick={(e) => onSolveTicket(item.id, e)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                              title="Mark ticket as Resolved and update Family Profile"
                            >
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Mark Solved</span>
                            </button>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1.5 border-t border-gray-50">
                        <span>Reported: {item.reportedDate} {item.reportedBy ? `by ${item.reportedBy}` : ''}</span>
                        <button
                          type="button"
                          onClick={() => onNavigate(isCommunity ? 'community-problems' : 'tickets', item.id)}
                          className="text-blue-600 hover:text-blue-800 font-bold hover:underline flex items-center space-x-0.5"
                        >
                          <span>Open Details</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">
              Showing {pendingItems.length} active items
            </span>
            <button
              type="button"
              onClick={() => onNavigate(scopeFilter === 'COMMUNITY' ? 'community-problems' : 'tickets')}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center space-x-1"
            >
              <span>View Full Pending Register</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: SOLVED / RESOLVED TICKETS                  */}
        {/* ======================================================== */}
        <div className="bg-emerald-50/40 rounded-2xl border border-emerald-200 p-4.5 flex flex-col justify-between space-y-4">
          <div>
            {/* Column Header & Big Count */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-1.5 text-emerald-800 font-black text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Solved & Resolved</span>
                </div>
                <div className="text-3xl font-black text-gray-900 mt-1">
                  {currentSolvedCount}
                  <span className="text-xs font-semibold text-emerald-700 ml-2">
                    Action Completed
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                  {resolutionPercentage}% Success Rate
                </span>
                <div className="text-[11px] text-gray-500 mt-1">
                  Stored & Verified
                </div>
              </div>
            </div>

            {/* Solved Items List */}
            <div className="mt-4 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {solvedItems.length === 0 ? (
                <div className="py-8 text-center text-gray-400 bg-white/80 rounded-xl border border-dashed border-emerald-200">
                  <Clock className="w-7 h-7 mx-auto text-gray-300 mb-1.5" />
                  <p className="text-xs font-bold text-gray-700">No solved records in this filter</p>
                  <p className="text-[11px] text-gray-400">Mark pending items above to build history.</p>
                </div>
              ) : (
                solvedItems.map(item => {
                  const isCommunity = item.scope === 'COMMUNITY';
                  return (
                    <div
                      key={`solved-${item.scope}-${item.id}`}
                      className="p-3 bg-white rounded-xl border border-emerald-100 hover:border-emerald-300 shadow-2xs transition-all flex flex-col justify-between text-xs space-y-2"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-[10px] font-bold text-gray-400">{item.id}</span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                              isCommunity ? 'bg-amber-100 text-amber-900' : 'bg-purple-100 text-purple-900'
                            }`}>
                              {isCommunity ? '🏘️ Community' : '👤 Individual'}
                            </span>
                            <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                              ✓ Solved
                            </span>
                          </div>

                          {item.resolvedDate && (
                            <span className="text-[10px] font-medium text-gray-400">
                              Resolved: {item.resolvedDate}
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-gray-900 leading-snug">{item.title}</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {item.category} • {item.villageName || item.villageId} {item.wardId ? `• Ward ${item.wardId}` : ''}
                          {item.familyHeadName ? ` • ${item.familyHeadName}` : ''}
                        </p>

                        {/* Action Taken Note */}
                        {item.actionOrNotes && (
                          <div className="mt-2 p-2 bg-emerald-50/80 rounded-lg border border-emerald-100 text-[11px] text-emerald-950">
                            <span className="font-bold text-emerald-900 block text-[10px] uppercase">
                              Action Taken / Resolution:
                            </span>
                            <p className="line-clamp-2 leading-relaxed">{item.actionOrNotes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1.5 border-t border-gray-50">
                        <span className="font-medium text-emerald-800">
                          {isCommunity ? 'Stored in Community Section' : 'Stored in Family Profile'}
                        </span>
                        <button
                          type="button"
                          onClick={() => onNavigate(isCommunity ? 'community-problems' : 'tickets', item.id)}
                          className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline flex items-center space-x-0.5"
                        >
                          <span>Inspect Record</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">
              Showing {solvedItems.length} solved items
            </span>
            <button
              type="button"
              onClick={() => onNavigate(scopeFilter === 'COMMUNITY' ? 'community-problems' : 'tickets')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center space-x-1"
            >
              <span>Browse Solved Archive</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
