import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { FollowUpTicket } from '../types';
import {
  TicketCheck,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building,
  User,
  Calendar,
  ExternalLink,
  HeartHandshake,
  Landmark,
  Layers,
  MapPin,
  Edit2,
  Trash2
} from 'lucide-react';

interface TicketsViewProps {
  onNavigate: (view: string, targetId?: string) => void;
  onOpenQuickAdd: (type: string, initialData?: any) => void;
  selectedTicketId?: string;
}

export const TicketsView: React.FC<TicketsViewProps> = ({
  onNavigate,
  onOpenQuickAdd,
  selectedTicketId
}) => {
  const {
    tickets,
    families,
    villages,
    wards,
    members,
    updateTicket,
    addTicket,
    deleteTicket
  } = useDatabase();

  const { canEdit, canDelete, canAdd, isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterVillage, setFilterVillage] = useState('all');
  const [filterWard, setFilterWard] = useState('all');
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'INDIVIDUAL_FAMILY' | 'COMMUNITY_VILLAGE_WARD' | 'SCHEMES' | 'PERSONAL_HELP'>('ALL');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const todayStr = new Date().toISOString().slice(0, 10);

  // Dynamic Wards based on selected village
  const availableWards = filterVillage === 'all'
    ? wards
    : wards.filter(w => w.villageId === filterVillage);

  // Counts
  const totalCount = tickets.length;
  const familyTicketsCount = tickets.filter(t => t.ticketScope === 'INDIVIDUAL_FAMILY' || (t.familyId && !t.ticketScope)).length;
  const communityTicketsCount = tickets.filter(t => t.ticketScope === 'COMMUNITY_VILLAGE_WARD' || (!t.familyId && t.ticketScope === 'COMMUNITY_VILLAGE_WARD')).length;
  const schemeTicketsCount = tickets.filter(t => t.helpType === 'GOVT_SCHEME' || t.category === 'Scheme Assistance' || t.schemeName).length;
  const personalHelpCount = tickets.filter(t => t.helpType === 'PERSONAL_HELP' || t.ticketType === 'personal_help').length;

  const filteredTickets = tickets.filter(t => {
    const isCommunity = t.ticketScope === 'COMMUNITY_VILLAGE_WARD' || (!t.familyId && t.ticketScope === 'COMMUNITY_VILLAGE_WARD');
    const isFamily = !isCommunity;
    const isScheme = t.helpType === 'GOVT_SCHEME' || t.category === 'Scheme Assistance' || Boolean(t.schemeName);
    const isPersonal = t.helpType === 'PERSONAL_HELP' || t.ticketType === 'personal_help';

    let scopeMatch = true;
    if (scopeFilter === 'INDIVIDUAL_FAMILY') scopeMatch = isFamily;
    else if (scopeFilter === 'COMMUNITY_VILLAGE_WARD') scopeMatch = isCommunity;
    else if (scopeFilter === 'SCHEMES') scopeMatch = isScheme;
    else if (scopeFilter === 'PERSONAL_HELP') scopeMatch = isPersonal;

    // Village & Ward matching
    const fam = t.familyId ? families.find(f => f.id === t.familyId) : null;
    const itemVillageId = t.villageId || (fam ? fam.villageId : undefined);
    const itemWardId = t.wardId || (fam ? fam.wardId : undefined);

    const vMatch = filterVillage === 'all' || itemVillageId === filterVillage;
    const wMatch = filterWard === 'all' || itemWardId === filterWard;

    const priMatch = filterPriority === 'all' || t.priority === filterPriority;
    const statMatch = filterStatus === 'all' || t.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const qMatch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      (t.familyId && t.familyId.toLowerCase().includes(q)) ||
      (t.schemeName && t.schemeName.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q));

    return scopeMatch && vMatch && wMatch && priMatch && statMatch && qMatch;
  });

  const handleStatusChange = (ticket: FollowUpTicket, newStatus: FollowUpTicket['status']) => {
    updateTicket({
      ...ticket,
      status: newStatus,
      resolvedDate: (newStatus === 'Resolved' || newStatus === 'Closed') ? (ticket.resolvedDate || todayStr) : undefined
    });
  };

  const handleDeleteTicket = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete ticket "${title}"? This cannot be undone.`)) {
      deleteTicket(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 flex items-center space-x-2">
              <TicketCheck className="w-5 h-5 text-purple-600" />
              <span>Field Work Follow-up & Help Tickets</span>
            </h1>
            <p className="text-xs text-gray-500">
              Community Ward Issues, Citizen Help Tickets & Auto-Synced Welfare Assistance
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenQuickAdd('family_ticket', { ticketScope: 'INDIVIDUAL_FAMILY' })}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>+ Family / Citizen Help</span>
            </button>

            <button
              onClick={() => onOpenQuickAdd('community_ticket', { ticketScope: 'COMMUNITY_VILLAGE_WARD' })}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Building className="w-4 h-4" />
              <span>+ Community / Ward Ticket</span>
            </button>
          </div>
        </div>

        {/* Auto-sync notice */}
        <div className="bg-purple-50/60 border border-purple-200/70 px-3 py-2 rounded-xl flex items-center justify-between text-[11px] text-purple-900">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 text-[10px]">
              ✨ Auto-Sync Active
            </span>
            <span>
              Citizen & Scheme tickets automatically sync to the <strong>My Direct Assistance</strong> pane and Family Profiles upon saving or solving!
            </span>
          </div>
          <button
            onClick={() => onNavigate('myWork')}
            className="font-bold underline hover:text-purple-950 shrink-0 ml-2"
          >
            View Assistance Pane →
          </button>
        </div>

        {/* Scope Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-3">
          <button
            onClick={() => setScopeFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              scopeFilter === 'ALL'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Tickets ({totalCount})
          </button>

          <button
            onClick={() => setScopeFilter('INDIVIDUAL_FAMILY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              scopeFilter === 'INDIVIDUAL_FAMILY'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            🤝 Individual / Family Help ({familyTicketsCount})
          </button>

          <button
            onClick={() => setScopeFilter('COMMUNITY_VILLAGE_WARD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              scopeFilter === 'COMMUNITY_VILLAGE_WARD'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🏘️ Community / Village-Ward ({communityTicketsCount})
          </button>

          <button
            onClick={() => setScopeFilter('SCHEMES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              scopeFilter === 'SCHEMES'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            🏛️ Govt Scheme Help ({schemeTicketsCount})
          </button>

          <button
            onClick={() => setScopeFilter('PERSONAL_HELP')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              scopeFilter === 'PERSONAL_HELP'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            💚 Personal / Direct Aid ({personalHelpCount})
          </button>
        </div>

        {/* Search and Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Village Filter */}
          <div>
            <select
              value={filterVillage}
              onChange={e => {
                setFilterVillage(e.target.value);
                setFilterWard('all');
              }}
              className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 font-medium"
            >
              <option value="all">All Villages ({villages.length})</option>
              {villages.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          {/* Ward Filter */}
          <div>
            <select
              value={filterWard}
              onChange={e => setFilterWard(e.target.value)}
              disabled={filterVillage !== 'all' && availableWards.length === 0}
              className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 font-medium disabled:opacity-50"
            >
              <option value="all">All Wards ({availableWards.length})</option>
              {availableWards.map((w, idx) => (
                <option key={`tck-ward-${w.id}-${idx}`} value={w.id}>Ward {w.wardNumber} ({w.id})</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 font-medium"
            >
              <option value="all">All Priorities</option>
              <option value="High">🔴 High Priority</option>
              <option value="Medium">🟡 Medium Priority</option>
              <option value="Low">🟢 Low Priority</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="Open">🟡 Open (Pending)</option>
              <option value="In Progress">🔵 In Progress (Applied)</option>
              <option value="Follow-up Scheduled">🟣 Follow-up Scheduled</option>
              <option value="Resolved">🟢 Resolved / Solved</option>
              <option value="Closed">⚪ Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTickets.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-gray-200 text-center">
            <TicketCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-extrabold text-gray-800 text-base">No Tickets Found</h3>
            <p className="text-xs text-gray-500 mt-1">
              No field tickets match your active filters. Create a new citizen help or community ticket.
            </p>
          </div>
        ) : (
          filteredTickets.map(t => {
            const isCommunity = t.ticketScope === 'COMMUNITY_VILLAGE_WARD' || (!t.familyId && t.ticketScope === 'COMMUNITY_VILLAGE_WARD');
            const fam = t.familyId ? families.find(f => f.id === t.familyId) : null;
            const mem = t.memberId ? members.find(m => m.id === t.memberId) : null;
            const vil = t.villageId ? villages.find(v => v.id === t.villageId) : (fam ? villages.find(v => v.id === fam.villageId) : null);
            const wrd = t.wardId ? wards.find(w => w.id === t.wardId) : (fam ? wards.find(w => w.id === fam.wardId) : null);
            const isOverdue = t.targetDate < todayStr && t.status !== 'Resolved' && t.status !== 'Closed';

            return (
              <div
                key={t.id}
                className={`bg-white p-4.5 rounded-2xl border transition-all flex flex-col justify-between text-xs ${
                  isOverdue
                    ? 'border-rose-300 ring-1 ring-rose-300 shadow-xs'
                    : t.status === 'Resolved' || t.status === 'Closed'
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : 'border-gray-200 hover:border-purple-400 hover:shadow-xs'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold text-gray-400">
                      {t.id}
                    </span>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Scope Badge */}
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        isCommunity
                          ? 'bg-slate-100 text-slate-800 border-slate-200'
                          : 'bg-purple-100 text-purple-800 border-purple-200'
                      }`}>
                        {isCommunity ? '🏘️ Community' : '🤝 Family Help'}
                      </span>

                      {/* Priority */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.priority === 'High' ? 'bg-rose-100 text-rose-800' :
                        t.priority === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {t.priority}
                      </span>

                      {/* Status */}
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        t.status === 'Resolved' || t.status === 'Closed'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : t.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  </div>

                  {/* Title & Scheme name */}
                  <h3 className="text-sm font-extrabold text-gray-900 mt-2.5 leading-snug">
                    {t.title}
                  </h3>

                  {t.schemeName && (
                    <div className="mt-1.5 inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 font-bold text-[11px] border border-blue-200">
                      <Landmark className="w-3 h-3 text-blue-600" />
                      <span>{t.schemeName}</span>
                    </div>
                  )}

                  {t.amountOrBenefit && (
                    <div className="mt-1 text-[11px] font-bold text-emerald-700">
                      💰 Benefit / Aid: {t.amountOrBenefit}
                    </div>
                  )}

                  <p className="text-gray-600 mt-1.5 line-clamp-2 text-xs leading-relaxed">
                    {t.description}
                  </p>

                  {/* Details Card */}
                  <div className="mt-3 p-2.5 bg-gray-50 rounded-xl space-y-1.5 text-gray-600">
                    {!isCommunity && t.familyId && (
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-800">Target Family:</span>
                        <button
                          onClick={() => onNavigate('families', t.familyId)}
                          className="text-blue-600 font-bold hover:underline font-mono"
                        >
                          {fam ? `${fam.familyHeadName} (${fam.id})` : t.familyId}
                        </button>
                      </div>
                    )}

                    {!isCommunity && mem && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-500">Beneficiary Member:</span>
                        <span className="font-bold text-gray-800">{mem.name} ({mem.relationship})</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-500 flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                        Location:
                      </span>
                      <span className="font-medium text-gray-700">
                        {vil?.name || 'Village'} {wrd ? `• Ward ${wrd.wardNumber}` : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                        Target Date:
                      </span>
                      <span className={`font-bold ${isOverdue ? 'text-rose-600' : 'text-gray-800'}`}>
                        {t.targetDate} {isOverdue && '(OVERDUE)'}
                      </span>
                    </div>

                    {t.ticketAssistanceId && (
                      <div className="pt-1 border-t border-gray-200/60 flex items-center justify-between text-[10px] text-emerald-800 font-semibold">
                        <span className="flex items-center">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-1" />
                          Synced to Assistance Pane
                        </span>
                        <button
                          onClick={() => onNavigate('myWork')}
                          className="text-emerald-700 hover:underline font-mono"
                        >
                          {t.ticketAssistanceId} →
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Update Control & Actions */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Status:</span>
                    <select
                      value={t.status}
                      onChange={e => handleStatusChange(t, e.target.value as any)}
                      className="text-[11px] bg-white border border-gray-300 rounded-lg px-2 py-1 text-gray-800 font-bold focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    >
                      <option value="Open">🟡 Open (Pending)</option>
                      <option value="In Progress">🔵 In Progress (Applied)</option>
                      <option value="Follow-up Scheduled">🟣 Follow-up Scheduled</option>
                      <option value="Resolved">🟢 Resolved / Solved</option>
                      <option value="Closed">⚪ Closed</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!isCommunity && t.familyId ? (
                      <button
                        onClick={() => onNavigate('families', t.familyId)}
                        className="text-xs font-bold text-purple-700 hover:underline flex items-center shrink-0 cursor-pointer"
                      >
                        <span>Family Profile</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onNavigate('problems')}
                        className="text-xs font-bold text-slate-700 hover:underline flex items-center shrink-0 cursor-pointer"
                      >
                        <span>Ward Problems</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </button>
                    )}

                    {(canEdit || canDelete) && (
                      <div className="flex items-center space-x-1 pl-1 border-l border-gray-200">
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => onOpenQuickAdd(isCommunity ? 'community_ticket' : 'family_ticket', t)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            title="Edit Ticket"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTicket(t.id, t.title)}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Delete Ticket"
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
          })
        )}
      </div>
    </div>
  );
};

