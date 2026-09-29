import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { CommunityProblem } from '../types';
import {
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Building,
  CheckCircle2,
  Clock,
  ExternalLink,
  Phone,
  Edit2,
  Trash2,
  Printer,
  ClipboardCheck
} from 'lucide-react';
import { PrintModal } from '../components/print/PrintModal';
import { SingleActionItem } from '../components/print/SingleActionPrintView';

interface CommunityProblemsViewProps {
  onNavigate: (view: string, targetId?: string) => void;
  onOpenQuickAdd: (type: string, initialData?: any) => void;
  selectedProblemId?: string;
}

export const CommunityProblemsView: React.FC<CommunityProblemsViewProps> = ({
  onNavigate,
  onOpenQuickAdd,
  selectedProblemId
}) => {
  const {
    panchayat,
    problems,
    devWorks,
    tickets,
    assistance,
    villages,
    wards,
    updateProblem,
    deleteProblem
  } = useDatabase();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterVillage, setFilterVillage] = useState('all');
  const [filterWard, setFilterWard] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Print modal states
  const [printActionItem, setPrintActionItem] = useState<SingleActionItem | null>(null);
  const [showAtrPrint, setShowAtrPrint] = useState(false);

  // Dynamic Wards based on selected village
  const availableWards = filterVillage === 'all'
    ? wards
    : wards.filter(w => w.villageId === filterVillage);

  const filteredProblems = problems.filter(p => {
    const vMatch = filterVillage === 'all' || p.villageId === filterVillage;
    const wMatch = filterWard === 'all' || p.wardId === filterWard;
    const catMatch = filterCategory === 'all' || p.category === filterCategory;
    const priMatch = filterPriority === 'all' || p.priority === filterPriority;
    const statMatch = filterStatus === 'all' || p.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const qMatch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.actionTaken && p.actionTaken.toLowerCase().includes(q)) ||
      p.reportedBy.toLowerCase().includes(q) ||
      p.officialDepartment?.toLowerCase().includes(q);

    return vMatch && wMatch && catMatch && priMatch && statMatch && qMatch;
  });

  const handleStatusChange = (problem: CommunityProblem, newStatus: CommunityProblem['status']) => {
    updateProblem({
      ...problem,
      status: newStatus,
      resolvedDate: newStatus === 'Completed' ? (problem.resolvedDate || new Date().toISOString().split('T')[0]) : problem.resolvedDate
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete problem "${title}"?`)) {
      deleteProblem(id);
    }
  };

  const totalCount = problems.length;
  const openCount = problems.filter(p => p.status === 'Open').length;
  const inProgressCount = problems.filter(p => p.status === 'In Progress').length;
  const solvedCount = problems.filter(p => p.status === 'Completed' || (p.status as any) === 'Resolved').length;

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Community Problems &amp; Infrastructure Grievances</span>
            </h1>
            <p className="text-xs text-gray-500">
              Grassroots community issues, drinking water, roads, electricity, sanitation tracking, and Action Taken Reports
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAtrPrint(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Print Action Taken Report (ATR) for solved community problems"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print ATR Report</span>
            </button>

            <button
              onClick={() => onOpenQuickAdd('problem')}
              className="flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Report Community Problem</span>
            </button>
          </div>
        </div>

        {/* 1-Click Status Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
          <span className="text-xs font-bold text-gray-500 mr-1">Quick Status:</span>
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            All Issues ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('Open')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'Open'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
            }`}
          >
            🟡 Open ({openCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('In Progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'In Progress'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200'
            }`}
          >
            🔵 In Process ({inProgressCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('Completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'Completed'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
            }`}
          >
            🟢 Solved / Completed ({solvedCount})
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 text-xs">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search problems or action..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white"
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
                <option key={`cp-ward-${w.id}-${idx}`} value={w.id}>Ward {w.wardNumber} ({w.id})</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 font-medium"
            >
              <option value="all">All Categories</option>
              <option value="Drinking Water / Borewell">Drinking Water</option>
              <option value="Road / Drainage">Road / Drainage</option>
              <option value="Street Lighting">Street Lighting</option>
              <option value="Sanitation">Sanitation</option>
              <option value="School / Anganwadi">School / Anganwadi</option>
              <option value="Pond / Water Body">Pond / Water Body</option>
            </select>
          </div>

          <div>
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 font-medium"
            >
              <option value="all">All Priorities</option>
              <option value="High">🔴 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🟢 Low</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Completed">🟢 Completed / Solved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Problems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProblems.map(p => {
          const v = villages.find(vil => vil.id === p.villageId);
          const w = wards.find(wrd => wrd.id === p.wardId);
          const isCompleted = p.status === 'Completed';

          return (
            <div
              key={p.id}
              className={`bg-white p-4.5 rounded-xl border transition-all flex flex-col justify-between text-xs ${
                isCompleted 
                  ? 'border-emerald-300 bg-emerald-50/10 shadow-xs' 
                  : 'border-gray-200 shadow-xs hover:border-amber-400'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold text-gray-400">{p.id}</span>
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.priority === 'High' ? 'bg-rose-100 text-rose-800' :
                      p.priority === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {p.priority}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCompleted ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isCompleted ? '✓ Solved' : p.status}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-gray-900 mt-2">{p.title}</h3>
                <p className="text-gray-600 mt-1 line-clamp-2">{p.description}</p>

                {/* Ground Action Taken & Work Done Display */}
                {p.actionTaken && (
                  <div className="mt-2.5 p-2 bg-emerald-50/80 border border-emerald-200 rounded-lg text-emerald-950 text-[11px] leading-relaxed">
                    <div className="font-bold flex items-center text-emerald-900 text-[10px] uppercase mb-0.5">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                      Work Done / Action Taken:
                    </div>
                    {p.actionTaken}
                    {p.expenditureRs ? (
                      <div className="mt-1 font-mono font-bold text-emerald-900 text-[10px] flex items-center justify-between">
                        <span>Exp: ₹{p.expenditureRs.toLocaleString('en-IN')}</span>
                        {p.resolvedBy && <span className="font-sans font-medium text-slate-600">By: {p.resolvedBy}</span>}
                      </div>
                    ) : null}
                  </div>
                )}

                <div className="mt-3 p-2.5 bg-gray-50 rounded-xl space-y-1 text-gray-600 text-[11px]">
                  <p className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">Location:</span>
                    <span>{v?.name || p.villageId} • Ward {w?.wardNumber || p.wardId}</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-gray-500">Department:</span>
                    <span className="font-bold text-gray-900">{p.officialDepartment || 'Gram Panchayat'}</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-gray-500">Reported By:</span>
                    <span>{p.reportedBy} ({p.reportedDate})</span>
                  </p>
                  {p.resolvedDate && (
                    <p className="flex items-center justify-between text-emerald-800 font-semibold">
                      <span>Date Solved:</span>
                      <span>{p.resolvedDate}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Status Update & Actions */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <select
                    value={p.status}
                    onChange={e => handleStatusChange(p, e.target.value as any)}
                    className="text-[11px] bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 font-semibold cursor-pointer"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed (Solved)</option>
                  </select>

                  {p.contactNumber && (
                    <a
                      href={`tel:${p.contactNumber}`}
                      className="flex items-center space-x-1 text-amber-800 font-bold hover:underline text-[11px]"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </a>
                  )}
                </div>

                {/* Print Resolution Slip & Edit/Delete Actions */}
                <div className="flex items-center space-x-1.5">
                  {isCompleted && (
                    <button
                      type="button"
                      onClick={() => setPrintActionItem({ type: 'problem', data: p })}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-bold inline-flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
                      title="Print Official Resolution Certificate Slip"
                    >
                      <Printer className="w-3 h-3 text-emerald-400" />
                      <span>Print Slip</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenQuickAdd('problem', p)}
                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                    title="Edit Problem"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id, p.title)}
                    className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                    title="Delete Problem"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Single Action Resolution Slip Print Modal */}
      {printActionItem && (
        <PrintModal
          isOpen={true}
          onClose={() => setPrintActionItem(null)}
          documentType="single-action"
          title="Official Grievance Resolution & Work Done Certificate Slip"
          panchayat={panchayat}
          villages={villages}
          wards={wards}
          actionItem={printActionItem}
        />
      )}

      {/* Full ATR Print Modal */}
      {showAtrPrint && (
        <PrintModal
          isOpen={true}
          onClose={() => setShowAtrPrint(false)}
          documentType="atr"
          title="Official Action Taken Report (ATR) — Solved Problems & Civic Works"
          panchayat={panchayat}
          villages={villages}
          wards={wards}
          selectedWardId={filterWard !== 'all' ? filterWard : 'all'}
          allProblems={problems}
          allDevWorks={devWorks}
          allTickets={tickets}
          allAssistance={assistance}
        />
      )}
    </div>
  );
};
