import React, { useState, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { TicketSummarySplitView } from '../components/dashboard/TicketSummarySplitView';
import {
  Users,
  Home,
  Building2,
  FileCheck,
  AlertTriangle,
  TicketCheck,
  Briefcase,
  ArrowRight,
  TrendingUp,
  Plus,
  Clock,
  ShieldCheck,
  MapPin,
  Sparkles,
  Filter,
  CheckCircle2,
  RotateCcw,
  Search,
  Check,
  HeartHandshake,
  FolderCheck
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (view: string, targetId?: string) => void;
  onOpenQuickAdd: (type: string, initialData?: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenQuickAdd }) => {
  const {
    panchayat,
    villages,
    wards,
    families,
    members,
    schemes,
    problems,
    tickets,
    assistance,
    reminders,
    getPanchayatStats,
    getVillageStats,
    solveProblem,
    solveTicket
  } = useDatabase();

  const [selectedVillageId, setSelectedVillageId] = useState<string>('all');
  const [selectedWardId, setSelectedWardId] = useState<string>('all');

  // One-click Solved Issues filters
  const [solvedScopeFilter, setSolvedScopeFilter] = useState<'ALL' | 'COMMUNITY' | 'INDIVIDUAL'>('ALL');
  const [solvedCategoryFilter, setSolvedCategoryFilter] = useState<string>('all');
  const [solvedSearchTerm, setSolvedSearchTerm] = useState<string>('');

  const stats = getPanchayatStats();
  const todayStr = new Date().toISOString().slice(0, 10);

  // Dynamic Wards under selected village (guaranteed unique by id)
  const availableWards = useMemo(() => {
    const list = selectedVillageId === 'all'
      ? wards
      : wards.filter(w => w.villageId === selectedVillageId);
    const seen = new Set<string>();
    return list.filter(w => {
      if (!w || !w.id || seen.has(w.id)) return false;
      seen.add(w.id);
      return true;
    });
  }, [wards, selectedVillageId]);

  // Real-time filtered entities across hierarchy (Panchayat -> Village -> Ward)
  const displayFamilies = families.filter(f => {
    const vMatch = selectedVillageId === 'all' || f.villageId === selectedVillageId;
    const wMatch = selectedWardId === 'all' || f.wardId === selectedWardId;
    return vMatch && wMatch;
  });

  const displayMembers = members.filter(m => {
    const vMatch = selectedVillageId === 'all' || m.villageId === selectedVillageId;
    const wMatch = selectedWardId === 'all' || m.wardId === selectedWardId;
    return vMatch && wMatch;
  });

  const displayVotersCount = displayMembers.filter(m => m.isVoter && m.voterStatus !== 'NO').length;

  const displaySchemes = schemes.filter(s => {
    const vMatch = selectedVillageId === 'all' || s.villageId === selectedVillageId;
    const wMatch = selectedWardId === 'all' || s.wardId === selectedWardId;
    return vMatch && wMatch;
  });

  const displayProblems = problems.filter(p => {
    const vMatch = selectedVillageId === 'all' || p.villageId === selectedVillageId;
    const wMatch = selectedWardId === 'all' || p.wardId === selectedWardId;
    return vMatch && wMatch;
  });

  const displayTickets = tickets.filter(t => {
    const fam = t.familyId ? families.find(f => f.id === t.familyId) : null;
    const vId = t.villageId || fam?.villageId;
    const wId = t.wardId || fam?.wardId;
    const vMatch = selectedVillageId === 'all' || vId === selectedVillageId;
    const wMatch = selectedWardId === 'all' || wId === selectedWardId;
    return vMatch && wMatch;
  });

  const [communityBarTab, setCommunityBarTab] = useState<'ALL' | 'IN_PROGRESS' | 'SOLVED' | 'URGENT'>('ALL');

  const communityBarProblems = useMemo(() => {
    if (communityBarTab === 'SOLVED') {
      return displayProblems.filter(p => p.status === 'Completed' || (p.status as any) === 'Resolved' || (p.status as any) === 'Closed').slice(0, 4);
    }
    if (communityBarTab === 'IN_PROGRESS') {
      return displayProblems.filter(p => p.status === 'In Progress').slice(0, 4);
    }
    if (communityBarTab === 'URGENT') {
      return displayProblems.filter(p => p.priority === 'High' && p.status !== 'Completed').slice(0, 4);
    }
    return displayProblems.slice(0, 4);
  }, [displayProblems, communityBarTab]);

  const urgentProblems = displayProblems.filter(p => p.priority === 'High' && p.status !== 'Completed').slice(0, 3);
  const activeTickets = displayTickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').slice(0, 3);
  const recentAssistance = assistance.slice(0, 3);
  const todayRemindersList = reminders.filter(r => r.dueDate === todayStr && !r.completed);

  // Quick Solve Handlers
  const handleQuickSolveProblem = (problemId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let resolution: string | null = null;
    try {
      resolution = window.prompt('Enter quick resolution / action taken note for this community problem:', 'Issue resolved and verified on ground');
    } catch {
      resolution = 'Issue resolved and verified on ground';
    }
    if (resolution !== null) {
      solveProblem(problemId, resolution || 'Issue resolved and verified on ground');
    }
  };

  const handleQuickSolveTicket = (ticketId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let resolution: string | null = null;
    try {
      resolution = window.prompt('Enter quick resolution / action taken note for this individual ticket:', 'Assistance provided and verified');
    } catch {
      resolution = 'Assistance provided and verified';
    }
    if (resolution !== null) {
      solveTicket(ticketId, resolution || 'Assistance provided and verified');
    }
  };

  // Solved Community Problems
  const solvedCommunityList = useMemo(() => {
    return displayProblems.filter(p => p.status === 'Completed' || (p.status as any) === 'Resolved' || (p.status as any) === 'Closed');
  }, [displayProblems]);

  // Solved Individual / Family Tickets
  const solvedIndividualList = useMemo(() => {
    return displayTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed' || t.status === 'Completed');
  }, [displayTickets]);

  // Unified Solved Items representation
  const allSolvedItems = useMemo(() => {
    const communityItems = solvedCommunityList.map(p => {
      const v = villages.find(vil => vil.id === p.villageId);
      return {
        id: p.id,
        scope: 'COMMUNITY' as const,
        scopeLabel: 'Community Problem & Issue',
        storageLocation: 'Community Section',
        title: p.title,
        category: p.category,
        villageId: p.villageId,
        villageName: v?.name || p.villageId,
        wardId: p.wardId,
        familyId: undefined,
        familyHeadName: undefined,
        reportedDate: p.reportedDate,
        resolvedDate: p.resolvedDate || p.reportedDate || todayStr,
        actionOrNote: p.latestAction || p.description,
        departmentOrContext: p.officialDepartment || 'Gram Panchayat & Line Depts',
        reportedBy: p.reportedBy,
        priority: p.priority,
        rawProblem: p
      };
    });

    const individualItems = solvedIndividualList.map(t => {
      const fam = families.find(f => f.id === t.familyId);
      const v = villages.find(vil => vil.id === (t.villageId || fam?.villageId));
      return {
        id: t.id,
        scope: 'INDIVIDUAL' as const,
        scopeLabel: 'Individual / Family Issue',
        storageLocation: 'Family Profile',
        title: t.title,
        category: t.category,
        villageId: t.villageId || fam?.villageId,
        villageName: v?.name || t.villageId,
        wardId: t.wardId || fam?.wardId,
        familyId: t.familyId,
        familyHeadName: fam?.familyHeadName,
        reportedDate: t.createdDate,
        resolvedDate: t.resolvedDate || t.targetDate || todayStr,
        actionOrNote: t.notes || t.description,
        departmentOrContext: t.schemeName ? `Scheme: ${t.schemeName}` : 'Field Worker Assistance',
        reportedBy: t.reportedBy || (fam ? `${fam.familyHeadName} (Head)` : undefined),
        priority: t.priority,
        rawTicket: t
      };
    });

    return [...communityItems, ...individualItems].sort((a, b) => {
      const dateA = a.resolvedDate || '';
      const dateB = b.resolvedDate || '';
      return dateB.localeCompare(dateA);
    });
  }, [solvedCommunityList, solvedIndividualList, villages, families, todayStr]);

  // Distinct categories available in current scope for one-click filter chips
  const availableSolvedCategories = useMemo(() => {
    let baseList = allSolvedItems;
    if (solvedScopeFilter === 'COMMUNITY') {
      baseList = allSolvedItems.filter(i => i.scope === 'COMMUNITY');
    } else if (solvedScopeFilter === 'INDIVIDUAL') {
      baseList = allSolvedItems.filter(i => i.scope === 'INDIVIDUAL');
    }
    const map = new Map<string, number>();
    baseList.forEach(i => {
      if (i.category) {
        map.set(i.category, (map.get(i.category) || 0) + 1);
      }
    });
    return Array.from(map.entries()).map(([cat, count]) => ({ category: cat, count }));
  }, [allSolvedItems, solvedScopeFilter]);

  // Filtered Solved Items based on user selection
  const filteredSolvedItems = useMemo(() => {
    return allSolvedItems.filter(item => {
      // 1. One-click Scope filter: 'ALL' | 'COMMUNITY' | 'INDIVIDUAL'
      if (solvedScopeFilter === 'COMMUNITY' && item.scope !== 'COMMUNITY') return false;
      if (solvedScopeFilter === 'INDIVIDUAL' && item.scope !== 'INDIVIDUAL') return false;

      // 2. Subcategory filter
      if (solvedCategoryFilter !== 'all' && item.category !== solvedCategoryFilter) return false;

      // 3. Search query
      if (solvedSearchTerm.trim()) {
        const q = solvedSearchTerm.toLowerCase().trim();
        const matches =
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          (item.actionOrNote && item.actionOrNote.toLowerCase().includes(q)) ||
          (item.familyHeadName && item.familyHeadName.toLowerCase().includes(q)) ||
          (item.familyId && item.familyId.toLowerCase().includes(q)) ||
          (item.villageName && item.villageName.toLowerCase().includes(q)) ||
          (item.departmentOrContext && item.departmentOrContext.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [allSolvedItems, solvedScopeFilter, solvedCategoryFilter, solvedSearchTerm]);

  const selectedVillage = villages.find(v => v.id === selectedVillageId);
  const selectedWard = wards.find(w => w.id === selectedWardId);

  // Pending schemes backlog count for display
  const pendingSchemesCount = displaySchemes.filter(s => s.status === 'Pending Approval' || s.status === 'Under Verification').length;
  const sanctionedSchemesCount = displaySchemes.filter(s => s.status === 'Sanctioned / Active').length;
  const openTicketsCount = displayTickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length;

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Top Banner: Administrative Head */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-md border border-blue-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">🇮🇳</span>
            <span className="text-xs uppercase font-bold tracking-widest text-blue-400">
              Gram Panchayat Administration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {panchayat.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Block: <strong>{panchayat.block}</strong> | District: <strong>{panchayat.district}</strong> | AC: <strong>{panchayat.assemblyConstituency}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onOpenQuickAdd('issue')}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Report Issue</span>
          </button>
          <button
            onClick={() => onOpenQuickAdd('family')}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Family</span>
          </button>
          <button
            onClick={() => onOpenQuickAdd('scheme')}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Enroll Scheme</span>
          </button>
          <button
            onClick={() => onNavigate('my-work')}
            className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Briefcase className="w-4 h-4 text-blue-400" />
            <span>Field Work Diary</span>
          </button>
        </div>
      </div>

      {/* 🌐 REAL-TIME PANCHAYAT HIERARCHICAL FILTER BAR (Panchayat -> Village -> Ward) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-200/60">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wide">
                  Real-Time Hierarchy Filter
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Panchayat → Village → Ward
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                Instantly aggregates Families, Population, Schemes & Tickets across administrative jurisdictions
              </p>
            </div>
          </div>

          {(selectedVillageId !== 'all' || selectedWardId !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSelectedVillageId('all');
                setSelectedWardId('all');
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              <span>Reset to Whole Panchayat</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
          {/* Village Selector */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              Select Village ({villages.length} in Panchayat)
            </label>
            <select
              value={selectedVillageId}
              onChange={e => {
                setSelectedVillageId(e.target.value);
                setSelectedWardId('all');
              }}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">🌐 All Villages ({villages.length}) - Whole Panchayat</option>
              {villages.map(v => {
                const vFams = families.filter(f => f.villageId === v.id).length;
                return (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.code}) — {vFams} Families
                  </option>
                );
              })}
            </select>
          </div>

          {/* Ward Selector */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              Select Ward ({availableWards.length} Available)
            </label>
            <select
              value={selectedWardId}
              onChange={e => setSelectedWardId(e.target.value)}
              disabled={selectedVillageId !== 'all' && availableWards.length === 0}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
            >
              <option value="all">
                {selectedVillageId === 'all'
                  ? `🏘️ All Wards (${wards.length})`
                  : `🏘️ All Wards in ${selectedVillage?.name || 'Village'} (${availableWards.length})`}
              </option>
              {availableWards.map((w, idx) => {
                const wFams = families.filter(f => f.wardId === w.id).length;
                const vOfWard = villages.find(v => v.id === w.villageId);
                return (
                  <option key={`dash-opt-ward-${w.id}-${idx}`} value={w.id}>
                    Ward {w.wardNumber} ({w.id}){selectedVillageId === 'all' ? ` - ${vOfWard?.name}` : ''} ({wFams} Families)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Active Jurisdiction Breadcrumb */}
          <div className="sm:col-span-2 lg:col-span-1 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                Active Jurisdiction Scope
              </span>
              <strong className="text-gray-900 text-xs font-black">
                {selectedVillage ? selectedVillage.name : 'All Villages'}
                {selectedWard ? ` > Ward ${selectedWard.wardNumber}` : ' > All Wards'}
              </strong>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
              {displayFamilies.length} Families
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Families */}
        <div
          onClick={() => onNavigate('families')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:border-blue-500 cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Households</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{displayFamilies.length}</div>
          <p className="text-xs text-gray-500 mt-1 flex items-center justify-between">
            <span>Families recorded</span>
            <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">View →</span>
          </p>
        </div>

        {/* Total Population / Members */}
        <div
          onClick={() => onNavigate('people')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:border-blue-500 cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Population</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{displayMembers.length}</div>
          <p className="text-xs text-gray-500 mt-1 flex items-center justify-between">
            <span>Voters: <strong>{displayVotersCount}</strong></span>
            <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">Directory →</span>
          </p>
        </div>

        {/* Pending Scheme Backlog */}
        <div
          onClick={() => onNavigate('schemes')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:border-indigo-500 cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <FileCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Govt Schemes</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            {displaySchemes.length}
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center justify-between">
            <span>✅ {sanctionedSchemesCount} Sanctioned | ⏳ {pendingSchemesCount} Pending</span>
            <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform">Track →</span>
          </p>
        </div>

        {/* Open Tickets & Follow-ups */}
        <div
          onClick={() => onNavigate('tickets')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:border-purple-500 cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
              <TicketCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Action Tickets</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{openTicketsCount}</div>
          <p className="text-xs text-gray-500 mt-1 flex items-center justify-between">
            <span>{displayTickets.length} Total in scope</span>
            <span className="text-purple-600 font-semibold group-hover:translate-x-0.5 transition-transform">Solve →</span>
          </p>
        </div>
      </div>

      {/* 🗳 DEDICATED SPECIAL VOTER CARD (Prominent Dashboard Section) */}
      {(() => {
        const specialVotersTotal = displayMembers.filter(m => m.isVoter && m.voterStatus !== 'NO').length;
        const specialGreen = displayMembers.filter(m => (m.isVoter && m.voterStatus !== 'NO') && (m.voterCategory === 'GREEN' || !m.voterCategory)).length;
        const specialYellow = displayMembers.filter(m => (m.isVoter && m.voterStatus !== 'NO') && m.voterCategory === 'YELLOW').length;
        const specialRed = displayMembers.filter(m => (m.isVoter && m.voterStatus !== 'NO') && m.voterCategory === 'RED').length;
        const specialNotVerified = displayMembers.filter(m => m.voterStatus === 'NOT VERIFIED').length;

        return (
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white p-5 sm:p-6 rounded-2xl shadow-lg border border-emerald-500/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/60">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl shadow-inner">
                  <span className="text-2xl">🗳️</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                      SPECIAL VOTER
                    </h2>
                    <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Live Categorization
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Electoral outreach & strategic voter categorization for {selectedVillage ? selectedVillage.name : panchayat.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('special-voters', 'ALL')}
                className="self-start sm:self-auto flex items-center space-x-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black shadow-md transition-transform active:scale-95 cursor-pointer"
              >
                <span>View All Voters</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Metric Boxes Grid (Clickable) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
              {/* TOTAL VOTERS */}
              <button
                type="button"
                onClick={() => onNavigate('special-voters', 'ALL')}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-400 p-3.5 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-blue-300">
                    TOTAL VOTERS
                  </span>
                  <span className="text-xs text-blue-400">🗳️</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1 group-hover:text-blue-200">
                  {specialVotersTotal.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-blue-300 flex items-center justify-between mt-1">
                  <span>Show all voters</span>
                  <span>→</span>
                </span>
              </button>

              {/* 🟢 GREEN */}
              <button
                type="button"
                onClick={() => onNavigate('special-voters', 'GREEN')}
                className="bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-700/50 hover:border-emerald-400 p-3.5 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                    🟢 GREEN
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-900/80 text-emerald-300">
                    {specialVotersTotal > 0 ? `${Math.round((specialGreen / specialVotersTotal) * 100)}%` : '0%'}
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-200 mt-1">
                  {specialGreen.toLocaleString()}
                </div>
                <span className="text-[10px] text-emerald-400 group-hover:text-emerald-200 flex items-center justify-between mt-1">
                  <span>Show Green voters</span>
                  <span>→</span>
                </span>
              </button>

              {/* 🟡 YELLOW */}
              <button
                type="button"
                onClick={() => onNavigate('special-voters', 'YELLOW')}
                className="bg-amber-950/50 hover:bg-amber-900/60 border border-amber-700/50 hover:border-amber-400 p-3.5 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                    🟡 YELLOW
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-900/80 text-amber-300">
                    {specialVotersTotal > 0 ? `${Math.round((specialYellow / specialVotersTotal) * 100)}%` : '0%'}
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-200 mt-1">
                  {specialYellow.toLocaleString()}
                </div>
                <span className="text-[10px] text-amber-400 group-hover:text-amber-200 flex items-center justify-between mt-1">
                  <span>Show Yellow voters</span>
                  <span>→</span>
                </span>
              </button>

              {/* 🔴 RED */}
              <button
                type="button"
                onClick={() => onNavigate('special-voters', 'RED')}
                className="bg-rose-950/50 hover:bg-rose-900/60 border border-rose-700/50 hover:border-rose-400 p-3.5 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-300">
                    🔴 RED
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-900/80 text-rose-300">
                    {specialVotersTotal > 0 ? `${Math.round((specialRed / specialVotersTotal) * 100)}%` : '0%'}
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-rose-200 mt-1">
                  {specialRed.toLocaleString()}
                </div>
                <span className="text-[10px] text-rose-400 group-hover:text-rose-200 flex items-center justify-between mt-1">
                  <span>Show Red voters</span>
                  <span>→</span>
                </span>
              </button>

              {/* ⚠ NOT VERIFIED */}
              <button
                type="button"
                onClick={() => onNavigate('special-voters', 'NOT_VERIFIED')}
                className="bg-orange-950/50 hover:bg-orange-900/60 border border-orange-700/50 hover:border-orange-400 p-3.5 rounded-xl text-left transition-all group cursor-pointer col-span-2 sm:col-span-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-300">
                    ⚠ NOT VERIFIED
                  </span>
                  <span className="text-xs">⚠️</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-orange-200 mt-1">
                  {specialNotVerified.toLocaleString()}
                </div>
                <span className="text-[10px] text-orange-400 group-hover:text-orange-200 flex items-center justify-between mt-1">
                  <span>Verify status</span>
                  <span>→</span>
                </span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* 🏛 GOVERNMENT WELFARE SCHEMES OVERVIEW (Live Automatic Aggregation) */}
      {(() => {
        const totalEnrolled = displaySchemes.length;
        const sanctionedCount = displaySchemes.filter(s => s.status === 'Sanctioned / Active').length;
        const pendingCount = displaySchemes.filter(s => s.status === 'Pending Approval' || s.status === 'Under Verification').length;
        const docsCount = displaySchemes.filter(s => s.status === 'Document Required').length;
        const rejectedCount = displaySchemes.filter(s => s.status === 'Rejected').length;
        const sanctionRate = totalEnrolled > 0 ? Math.round((sanctionedCount / totalEnrolled) * 100) : 0;

        // Group dynamically by schemeName
        const schemeProgramMap: Record<string, { total: number; sanctioned: number; pending: number }> = {};
        displaySchemes.forEach(s => {
          const name = s.schemeName || 'Other Welfare Scheme';
          if (!schemeProgramMap[name]) {
            schemeProgramMap[name] = { total: 0, sanctioned: 0, pending: 0 };
          }
          schemeProgramMap[name].total += 1;
          if (s.status === 'Sanctioned / Active') {
            schemeProgramMap[name].sanctioned += 1;
          } else if (s.status === 'Pending Approval' || s.status === 'Under Verification') {
            schemeProgramMap[name].pending += 1;
          }
        });

        const programEntries = Object.entries(schemeProgramMap).sort((a, b) => b[1].total - a[1].total);

        return (
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base sm:text-lg font-black text-gray-900 uppercase tracking-wide">
                      GOVERNMENT WELFARE SCHEMES OVERVIEW
                    </h2>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ⚡ Automatic Live Sync
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Live aggregation of all manual & enrolled family schemes across {selectedVillage ? selectedVillage.name : panchayat.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => onOpenQuickAdd('scheme')}
                  className="flex items-center space-x-1 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Enroll Scheme</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('schemes')}
                  className="flex items-center space-x-1 px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <span>All Schemes ({schemes.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Overall Metric Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Total Enrolments</span>
                <div className="text-2xl font-black text-indigo-950 mt-1">{totalEnrolled}</div>
                <span className="text-[11px] text-indigo-600">Across enrolled households</span>
              </div>
              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Sanctioned / Active</span>
                <div className="text-2xl font-black text-emerald-950 mt-1">{sanctionedCount}</div>
                <span className="text-[11px] text-emerald-700 font-semibold">{sanctionRate}% Sanction Rate</span>
              </div>
              <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-100">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">In Pipeline / Pending</span>
                <div className="text-2xl font-black text-amber-950 mt-1">{pendingCount}</div>
                <span className="text-[11px] text-amber-700">Awaiting official sanction</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Doc Required / Other</span>
                <div className="text-2xl font-black text-slate-800 mt-1">{docsCount + rejectedCount}</div>
                <span className="text-[11px] text-slate-500">{docsCount} Docs, {rejectedCount} Rejected</span>
              </div>
            </div>

            {/* Scheme Program Distribution Grid */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Live Enrolment by Scheme Program ({programEntries.length})
                </h3>
                <span className="text-[11px] text-gray-400">Click any scheme to inspect in registry</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {programEntries.length === 0 ? (
                  <div className="col-span-full text-center py-6 text-xs text-gray-400">
                    No schemes recorded for this geographic selection. Use "+ Enroll Scheme" to add one!
                  </div>
                ) : (
                  programEntries.map(([progName, pStats]) => {
                    const progRate = pStats.total > 0 ? Math.round((pStats.sanctioned / pStats.total) * 100) : 0;
                    return (
                      <div
                        key={progName}
                        onClick={() => onNavigate('schemes')}
                        className="p-3.5 rounded-xl border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/20 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-xs text-gray-900 group-hover:text-indigo-900 leading-snug line-clamp-1">
                            {progName}
                          </h4>
                          <span className="text-xs font-mono font-black text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 shrink-0">
                            {pStats.total}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                            <span className="text-emerald-700 font-semibold">{pStats.sanctioned} Sanctioned ({progRate}%)</span>
                            <span className="text-amber-700">{pStats.pending} Pending</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
                            <div
                              style={{ width: `${progRate}%` }}
                              className="bg-emerald-500 h-full rounded-full transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Village & Ward Breakdowns */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-700" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              {selectedVillageId === 'all'
                ? `Villages in ${panchayat.name} (${villages.length})`
                : `Wards in ${selectedVillage?.name} (${availableWards.length})`}
            </h2>
          </div>
          <button
            onClick={() => onNavigate(selectedVillageId === 'all' ? 'villages' : 'wards')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center cursor-pointer"
          >
            <span>{selectedVillageId === 'all' ? 'All Village Dashboards' : 'All Wards Directory'}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {selectedVillageId === 'all' ? (
          /* Show All Villages */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {villages.map(v => {
              const vStats = getVillageStats(v.id);
              const vSchemes = schemes.filter(s => s.villageId === v.id).length;
              return (
                <div
                  key={v.id}
                  onClick={() => {
                    setSelectedVillageId(v.id);
                    setSelectedWardId('all');
                  }}
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:border-blue-500 cursor-pointer transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-900">{v.name}</h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {v.code}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{v.description}</p>

                  <div className="grid grid-cols-4 gap-1.5 mt-4 pt-3 border-t border-gray-100 text-center text-xs">
                    <div className="bg-gray-50 p-1.5 rounded-lg">
                      <span className="text-gray-400 block text-[9px]">Wards</span>
                      <strong className="text-gray-800 font-bold">{vStats.wardsCount}</strong>
                    </div>
                    <div className="bg-gray-50 p-1.5 rounded-lg">
                      <span className="text-gray-400 block text-[9px]">Families</span>
                      <strong className="text-gray-800 font-bold">{vStats.familiesCount}</strong>
                    </div>
                    <div className="bg-gray-50 p-1.5 rounded-lg">
                      <span className="text-gray-400 block text-[9px]">Voters</span>
                      <strong className="text-blue-700 font-bold">{vStats.voters}</strong>
                    </div>
                    <div className="bg-indigo-50 p-1.5 rounded-lg">
                      <span className="text-indigo-500 block text-[9px]">Schemes</span>
                      <strong className="text-indigo-800 font-bold">{vSchemes}</strong>
                    </div>
                  </div>

                  <div className="mt-3 text-[11px] flex items-center justify-between text-gray-600">
                    <span>Open Problems: <strong className="text-amber-600">{vStats?.problemsStats?.open ?? vStats?.problems?.open ?? 0}</strong></span>
                    <span className="text-blue-600 font-semibold hover:underline">Filter Village →</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Show Wards under selected village */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {availableWards.map((w, idx) => {
              const wFams = families.filter(f => f.wardId === w.id).length;
              const wMembers = members.filter(m => m.wardId === w.id);
              const wVoters = wMembers.filter(m => m.isVoter && m.voterStatus !== 'NO').length;
              const wSchemes = schemes.filter(s => s.wardId === w.id).length;
              const isSelected = selectedWardId === w.id;

              return (
                <div
                  key={`dash-card-ward-${w.id}-${idx}`}
                  onClick={() => setSelectedWardId(isSelected ? 'all' : w.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-400/30 shadow-sm'
                      : 'bg-white border-gray-200 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-gray-900">Ward {w.wardNumber}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {w.id}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 font-medium">
                    Member: {w.wardMemberName || 'Unassigned'}
                  </p>
                  {w.contactNumber && (
                    <p className="text-[11px] text-gray-500">{w.contactNumber}</p>
                  )}

                  <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t border-gray-100 text-center text-xs">
                    <div className="bg-gray-50 p-1.5 rounded-lg">
                      <span className="text-[9px] text-gray-400 block">Families</span>
                      <strong className="font-bold text-gray-800">{wFams}</strong>
                    </div>
                    <div className="bg-gray-50 p-1.5 rounded-lg">
                      <span className="text-[9px] text-gray-400 block">Voters</span>
                      <strong className="font-bold text-blue-700">{wVoters}</strong>
                    </div>
                    <div className="bg-indigo-50 p-1.5 rounded-lg">
                      <span className="text-[9px] text-indigo-500 block">Schemes</span>
                      <strong className="font-bold text-indigo-800">{wSchemes}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 📊 TICKETS & GRIEVANCES RESOLUTION DASHBOARD (Split-View Solved vs Pending with 1-Click Scope Filter) */}
      <TicketSummarySplitView
        problems={problems}
        tickets={tickets}
        villages={villages}
        wards={wards}
        families={families}
        selectedVillageId={selectedVillageId}
        selectedWardId={selectedWardId}
        onNavigate={onNavigate}
        onOpenQuickAdd={onOpenQuickAdd}
        onSolveProblem={handleQuickSolveProblem}
        onSolveTicket={handleQuickSolveTicket}
      />

      {/* Two Column Layout: Community Problems & Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Community Problems & Issues Bar */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-gray-900">Community Problems &amp; Issues Bar</h3>
              </div>
              <button
                onClick={() => onNavigate('community-problems')}
                className="text-xs text-blue-600 font-semibold hover:underline self-start sm:self-auto"
              >
                View Register ({displayProblems.length})
              </button>
            </div>

            {/* Quick Status Bar Tabs inside the Card */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3 p-1 bg-gray-50 rounded-lg border border-gray-100 text-[11px]">
              <button
                type="button"
                onClick={() => setCommunityBarTab('ALL')}
                className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  communityBarTab === 'ALL'
                    ? 'bg-white text-gray-900 shadow-2xs border border-gray-200'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                All ({displayProblems.length})
              </button>
              <button
                type="button"
                onClick={() => setCommunityBarTab('IN_PROGRESS')}
                className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  communityBarTab === 'IN_PROGRESS'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-blue-700 hover:text-blue-900'
                }`}
              >
                In Process ({displayProblems.filter(p => p.status === 'In Progress').length})
              </button>
              <button
                type="button"
                onClick={() => setCommunityBarTab('URGENT')}
                className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  communityBarTab === 'URGENT'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-rose-700 hover:text-rose-900'
                }`}
              >
                Urgent ({displayProblems.filter(p => p.priority === 'High' && p.status !== 'Completed').length})
              </button>
              <button
                type="button"
                onClick={() => setCommunityBarTab('SOLVED')}
                className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  communityBarTab === 'SOLVED'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                Solved ({displayProblems.filter(p => p.status === 'Completed' || (p.status as any) === 'Resolved').length})
              </button>
            </div>

            <div className="space-y-2.5">
              {communityBarProblems.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">
                  {communityBarTab === 'SOLVED' ? 'No solved community problems found in this filter.' : 'No problems matching this status!'}
                </p>
              ) : (
                communityBarProblems.map(p => {
                  const isSolved = p.status === 'Completed' || (p.status as any) === 'Resolved' || (p.status as any) === 'Closed';
                  const isInProcess = p.status === 'In Progress';
                  return (
                    <div
                      key={p.id}
                      onClick={() => onNavigate('community-problems', p.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSolved
                          ? 'border-emerald-200 bg-emerald-50/20 hover:bg-emerald-50/40'
                          : isInProcess
                          ? 'border-blue-200 bg-blue-50/20 hover:bg-blue-50/40'
                          : 'border-gray-100 hover:border-amber-300 hover:bg-amber-50/30'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-900 truncate">{p.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSolved
                            ? 'bg-emerald-100 text-emerald-800'
                            : isInProcess
                            ? 'bg-blue-100 text-blue-800'
                            : p.priority === 'High'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isSolved ? '✓ Solved' : p.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                        <span>Ward: {p.wardId} | {p.category}</span>
                        <span className="text-gray-400">
                          {isSolved && p.resolvedDate ? `Solved: ${p.resolvedDate}` : `Reported: ${p.reportedDate}`}
                        </span>
                      </div>

                      {/* Action Taken Display for Solved / In-Process issues */}
                      {(p.actionTaken || p.latestAction) && (
                        <div className="mt-1.5 text-[10px] text-gray-600 bg-white/80 p-1.5 rounded border border-gray-100">
                          <strong className="text-gray-700">{isSolved ? 'Action Taken: ' : 'Latest Action: '}</strong>
                          <span>{p.actionTaken || p.latestAction}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-100">
                        <span className="text-[10px] text-emerald-700 font-medium">Scope: Community Problem</span>
                        {!isSolved ? (
                          <button
                            type="button"
                            onClick={(e) => handleQuickSolveProblem(p.id, e)}
                            className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200 flex items-center space-x-1 cursor-pointer transition-colors"
                          >
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Mark Solved (Store in Community)</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-bold flex items-center space-x-0.5">
                            <span>Stored in Community Section</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => onOpenQuickAdd('issue')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Report Issue</span>
            </button>
            <button
              onClick={() => onOpenQuickAdd('problem')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Report Community Problem</span>
            </button>
          </div>
        </div>

        {/* Right Column: Active Field Action Tickets */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-sm text-gray-900">Active Field Action Tickets</h3>
              </div>
              <button
                onClick={() => onNavigate('tickets')}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                View All ({displayTickets.length})
              </button>
            </div>

            <div className="space-y-3">
              {activeTickets.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">No active follow-up tickets in this jurisdiction.</p>
              ) : (
                activeTickets.map(t => (
                  <div
                    key={t.id}
                    onClick={() => onNavigate('tickets', t.id)}
                    className="p-3 rounded-lg border border-gray-100 hover:border-purple-300 hover:bg-purple-50/30 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-900 truncate">{t.title}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        t.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                      <span>{t.familyId ? `Family: ${t.familyId}` : `Village: ${t.villageId || 'N/A'}`} | {t.category}</span>
                      <span className="font-medium text-gray-600">Target: {t.targetDate}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-100">
                      <span className="text-[10px] text-purple-700 font-medium">Scope: Individual / Family</span>
                      <button
                        type="button"
                        onClick={(e) => handleQuickSolveTicket(t.id, e)}
                        className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded border border-purple-200 flex items-center space-x-1 cursor-pointer transition-colors"
                      >
                        <Check className="w-2.5 h-2.5 text-purple-600" />
                        <span>Mark Solved (Store in Family)</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => onOpenQuickAdd('issue')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Report Issue</span>
            </button>
            <button
              onClick={() => onOpenQuickAdd('ticket')}
              className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Follow-up Ticket</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🏆 SOLVED PROBLEMS & ISSUES (ONE-CLICK CATEGORIES) */}
      {/* ======================================================== */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
        {/* Header with Title & Summary Badges */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                  SOLVED PROBLEMS & ISSUES ARCHIVE
                </h2>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {allSolvedItems.length} Resolved
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                One-click categorization of solved community works (stored in Community) and resolved individual/family issues (stored in Family Profile)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenQuickAdd('issue')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Report Issue (Community / Individual)</span>
            </button>
          </div>
        </div>

        {/* 1-CLICK SCOPE CATEGORY SELECTOR TABS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Tab 1: All Solved */}
          <button
            type="button"
            onClick={() => {
              setSolvedScopeFilter('ALL');
              setSolvedCategoryFilter('all');
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              solvedScopeFilter === 'ALL'
                ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-900 shadow-sm ring-2 ring-slate-900/10'
                : 'bg-gray-50/80 hover:bg-gray-100 text-gray-700 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                All Solved Issues
              </span>
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                solvedScopeFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-800'
              }`}>
                {allSolvedItems.length}
              </span>
            </div>
            <div className="text-xl font-black mt-1">
              {allSolvedItems.length} <span className="text-xs font-normal opacity-70">Total Resolved</span>
            </div>
            <p className="text-[11px] mt-1 opacity-75">
              Combined Community Infrastructure & Individual Citizen Cases
            </p>
          </button>

          {/* Tab 2: Community Solved */}
          <button
            type="button"
            onClick={() => {
              setSolvedScopeFilter('COMMUNITY');
              setSolvedCategoryFilter('all');
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              solvedScopeFilter === 'COMMUNITY'
                ? 'bg-gradient-to-br from-emerald-800 to-teal-900 text-white border-emerald-900 shadow-sm ring-2 ring-emerald-600/30'
                : 'bg-emerald-50/40 hover:bg-emerald-50 text-gray-800 border-emerald-200/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
                <span>🏘️ Community Issues</span>
              </span>
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                solvedScopeFilter === 'COMMUNITY' ? 'bg-white/20 text-white' : 'bg-emerald-200 text-emerald-900'
              }`}>
                {solvedCommunityList.length}
              </span>
            </div>
            <div className="text-xl font-black mt-1">
              {solvedCommunityList.length} <span className="text-xs font-normal opacity-75">Works Done</span>
            </div>
            <p className="text-[11px] mt-1 font-medium text-emerald-700">
              Stored in: <strong>Community Section</strong>
            </p>
          </button>

          {/* Tab 3: Individual / Family Solved */}
          <button
            type="button"
            onClick={() => {
              setSolvedScopeFilter('INDIVIDUAL');
              setSolvedCategoryFilter('all');
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              solvedScopeFilter === 'INDIVIDUAL'
                ? 'bg-gradient-to-br from-purple-900 to-indigo-950 text-white border-purple-900 shadow-sm ring-2 ring-purple-600/30'
                : 'bg-purple-50/40 hover:bg-purple-50 text-gray-800 border-purple-200/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
                <span>👤 Individual / Family</span>
              </span>
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                solvedScopeFilter === 'INDIVIDUAL' ? 'bg-white/20 text-white' : 'bg-purple-200 text-purple-900'
              }`}>
                {solvedIndividualList.length}
              </span>
            </div>
            <div className="text-xl font-black mt-1">
              {solvedIndividualList.length} <span className="text-xs font-normal opacity-75">Assisted</span>
            </div>
            <p className="text-[11px] mt-1 font-medium text-purple-700">
              Stored in: <strong>Family Profile</strong>
            </p>
          </button>
        </div>

        {/* SUB-CATEGORY CHIPS & INSTANT SEARCH */}
        <div className="space-y-2.5 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="text-xs font-bold text-gray-700 flex items-center space-x-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>One-Click Category Filter:</span>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search solved issue, village, family..."
                value={solvedSearchTerm}
                onChange={e => setSolvedSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-blue-500"
              />
              {solvedSearchTerm && (
                <button
                  onClick={() => setSolvedSearchTerm('')}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Subcategory Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSolvedCategoryFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                solvedCategoryFilter === 'all'
                  ? 'bg-blue-700 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              All Categories ({
                solvedScopeFilter === 'ALL'
                  ? allSolvedItems.length
                  : solvedScopeFilter === 'COMMUNITY'
                  ? solvedCommunityList.length
                  : solvedIndividualList.length
              })
            </button>

            {availableSolvedCategories.map(({ category, count }) => (
              <button
                key={category}
                type="button"
                onClick={() => setSolvedCategoryFilter(category)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 ${
                  solvedCategoryFilter === category
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <span>{category}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  solvedCategoryFilter === category ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* LIST OF SOLVED ISSUES */}
        {filteredSolvedItems.length === 0 ? (
          <div className="py-10 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <CheckCircle2 className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p className="text-xs font-semibold text-gray-600">No solved problems or issues found matching the selected filter.</p>
            <p className="text-[11px] text-gray-400 mt-1">Try switching categories or clearing your search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredSolvedItems.map(item => {
              const isCommunity = item.scope === 'COMMUNITY';
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                    isCommunity
                      ? 'bg-white border-emerald-200/90 hover:border-emerald-400 hover:shadow-xs'
                      : 'bg-white border-purple-200/90 hover:border-purple-400 hover:shadow-xs'
                  }`}
                >
                  <div>
                    {/* Badge & Date Row */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          isCommunity
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-purple-50 text-purple-800 border-purple-200'
                        }`}>
                          {isCommunity ? '🏘️ COMMUNITY ISSUE' : '👤 INDIVIDUAL ISSUE'}
                        </span>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {item.category}
                        </span>
                      </div>

                      <span className="text-[11px] font-bold text-emerald-700 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Solved {item.resolvedDate}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-gray-900 text-sm leading-snug">
                      {item.title}
                    </h4>

                    {/* Storage location confirmation */}
                    <div className="mt-1.5 flex items-center space-x-1 text-[11px]">
                      <span className="text-gray-500 font-medium">Stored in:</span>
                      <span className={`font-bold px-2 py-0.5 rounded ${
                        isCommunity
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-purple-100 text-purple-900'
                      }`}>
                        {isCommunity ? '📁 Community Section' : `📁 Family Profile (${item.familyHeadName || item.familyId || 'Individual'})`}
                      </span>
                    </div>

                    {/* Resolution Note or Action Taken */}
                    {item.actionOrNote && (
                      <div className={`mt-2.5 p-2.5 rounded-lg border text-xs ${
                        isCommunity
                          ? 'bg-emerald-50/40 border-emerald-200/60 text-emerald-950'
                          : 'bg-purple-50/40 border-purple-200/60 text-purple-950'
                      }`}>
                        <div className="font-extrabold text-[10px] uppercase tracking-wide opacity-70 mb-0.5">
                          {isCommunity ? 'Action Taken / Verification:' : 'Outcome / Resolution Note:'}
                        </div>
                        <p className="font-medium text-gray-800">
                          "{item.actionOrNote}"
                        </p>
                      </div>
                    )}

                    {/* Location details */}
                    <div className="mt-2 text-[11px] text-gray-500 flex flex-wrap items-center gap-2">
                      <span>Village: <strong>{item.villageName}</strong></span>
                      {item.wardId && <span>• Ward: <strong>{item.wardId}</strong></span>}
                      {item.reportedBy && <span>• Reported by: <strong>{item.reportedBy}</strong></span>}
                    </div>
                  </div>

                  {/* One-Click Action Footer */}
                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-gray-400">
                      ID: {item.id}
                    </span>

                    {isCommunity ? (
                      <button
                        type="button"
                        onClick={() => onNavigate('community-problems', item.id)}
                        className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200 flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <span>View in Community Section</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onNavigate('families', item.familyId)}
                        className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded-lg border border-purple-200 flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <span>Open Family Profile</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
