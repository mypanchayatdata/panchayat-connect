import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { DevelopmentWork } from '../types';
import {
  Hammer,
  Search,
  Filter,
  Plus,
  Building,
  CheckCircle2,
  Clock,
  TrendingUp,
  Landmark,
  Printer,
  Milestone,
  FileCheck
} from 'lucide-react';
import { PrintModal } from '../components/print/PrintModal';
import { SingleActionItem } from '../components/print/SingleActionPrintView';

interface DevelopmentWorksViewProps {
  onNavigate: (view: string, targetId?: string) => void;
  onOpenQuickAdd: (type: string) => void;
}

export const DevelopmentWorksView: React.FC<DevelopmentWorksViewProps> = ({
  onNavigate,
  onOpenQuickAdd
}) => {
  const {
    panchayat,
    devWorks,
    problems,
    tickets,
    assistance,
    villages,
    wards,
    updateDevWork
  } = useDatabase();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Print modal states
  const [printActionItem, setPrintActionItem] = useState<SingleActionItem | null>(null);
  const [showAtrPrint, setShowAtrPrint] = useState(false);

  const totalSanctioned = devWorks.reduce((acc, d) => acc + d.sanctionedAmountRs, 0);

  const filteredWorks = devWorks.filter(d => {
    const sMatch = filterSource === 'all' || d.schemeSource === filterSource;
    const statMatch = filterStatus === 'all' || d.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const qMatch =
      !q ||
      d.title.toLowerCase().includes(q) ||
      d.schemeSource.toLowerCase().includes(q) ||
      (d.actionTaken && d.actionTaken.toLowerCase().includes(q)) ||
      d.contractorName?.toLowerCase().includes(q);

    return sMatch && statMatch && qMatch;
  });

  const handleStatusChange = (work: DevelopmentWork, newStatus: DevelopmentWork['status']) => {
    updateDevWork({
      ...work,
      status: newStatus,
      progressPercentage: newStatus === 'Completed' ? 100 : work.progressPercentage,
      actualCompletionDate: newStatus === 'Completed' ? (work.actualCompletionDate || new Date().toISOString().split('T')[0]) : work.actualCompletionDate
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 flex items-center space-x-2">
              <Hammer className="w-5 h-5 text-blue-600" />
              <span>Panchayat Development &amp; Infrastructure Works</span>
            </h1>
            <p className="text-xs text-gray-500">
              Roads, community halls, solar high-mast lights, drains, civil infrastructure, and Action Taken Reports
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAtrPrint(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Print Action Taken Report (ATR) for Infrastructure Projects"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print ATR Report</span>
            </button>

            <button
              onClick={() => onOpenQuickAdd('devWork')}
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Development Work</span>
            </button>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100">
            <span className="text-gray-500 block text-[10px] uppercase font-bold">Total Works</span>
            <strong className="text-lg font-extrabold text-blue-950">{devWorks.length} Projects</strong>
          </div>
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100">
            <span className="text-gray-500 block text-[10px] uppercase font-bold">Total Sanctioned</span>
            <strong className="text-lg font-extrabold text-blue-950">₹{totalSanctioned.toLocaleString('en-IN')}</strong>
          </div>
          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-100">
            <span className="text-gray-500 block text-[10px] uppercase font-bold">In Progress</span>
            <strong className="text-lg font-extrabold text-amber-950">
              {devWorks.filter(d => d.status === 'In Progress').length}
            </strong>
          </div>
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
            <span className="text-emerald-800 block text-[10px] uppercase font-bold">Completed &amp; Verified</span>
            <strong className="text-lg font-extrabold text-emerald-950">
              {devWorks.filter(d => d.status === 'Completed').length}
            </strong>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by title, work done, contractor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={filterSource}
              onChange={e => setFilterSource(e.target.value)}
              className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 font-medium"
            >
              <option value="all">All Funding Schemes</option>
              <option value="15th Finance Commission">15th Finance Commission</option>
              <option value="Panchayat Development Fund">Panchayat Development Fund</option>
              <option value="CFC / SFC">CFC / SFC</option>
              <option value="MLA LAD">MLA LAD</option>
              <option value="MP LAD">MP LAD</option>
              <option value="MGNREGA">MGNREGA</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending Start</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">🟢 Completed &amp; Handed Over</option>
            </select>
          </div>
        </div>
      </div>

      {/* Development Works Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorks.map(dw => {
          const v = villages.find(vil => vil.id === dw.villageId);
          const w = wards.find(wrd => wrd.id === dw.wardId);
          const isCompleted = dw.status === 'Completed';

          return (
            <div
              key={dw.id}
              className={`bg-white p-4.5 rounded-xl border transition-all flex flex-col justify-between text-xs ${
                isCompleted 
                  ? 'border-emerald-300 bg-emerald-50/10 shadow-xs' 
                  : 'border-gray-200 shadow-xs hover:border-blue-400'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[10px]">
                    {dw.schemeSource}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isCompleted ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    dw.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isCompleted ? '✓ Completed' : dw.status}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-gray-900 mt-2">{dw.title}</h3>
                <p className="text-gray-600 mt-1 line-clamp-2">{dw.description}</p>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] font-bold text-gray-700 mb-1">
                    <span>Physical Progress</span>
                    <span>{dw.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        dw.progressPercentage === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${dw.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Work Done / Action Taken on Ground */}
                {dw.actionTaken && (
                  <div className="mt-2.5 p-2 bg-blue-50/80 border border-blue-200 rounded-lg text-slate-900 text-[11px] leading-relaxed">
                    <div className="font-bold flex items-center text-blue-900 text-[10px] uppercase mb-0.5">
                      <FileCheck className="w-3 h-3 mr-1 text-blue-600" />
                      Scope Executed / Work Done:
                    </div>
                    {dw.actionTaken}
                    {dw.completionCertificateNo && (
                      <div className="mt-1 font-mono text-slate-600 text-[9.5px]">
                        <strong>MB Reference / Cert:</strong> {dw.completionCertificateNo}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-3 p-2.5 bg-gray-50 rounded-xl space-y-1 text-gray-600 text-[11px]">
                  <p className="flex items-center justify-between">
                    <span className="text-gray-500">Sanctioned Budget:</span>
                    <strong className="text-gray-900 font-extrabold text-sm">₹{dw.sanctionedAmountRs.toLocaleString('en-IN')}</strong>
                  </p>
                  {dw.actualExpenditureRs && (
                    <p className="flex items-center justify-between text-emerald-800 font-bold">
                      <span>Actual Exp:</span>
                      <span className="font-mono">₹{dw.actualExpenditureRs.toLocaleString('en-IN')}</span>
                    </p>
                  )}
                  <p className="flex items-center justify-between">
                    <span className="text-gray-500">Location:</span>
                    <span>{v?.name} {w ? `• Ward ${w.wardNumber}` : ''}</span>
                  </p>
                  {dw.contractorName && (
                    <p className="flex items-center justify-between">
                      <span className="text-gray-500">Contractor / Agency:</span>
                      <span className="font-medium text-gray-800">{dw.contractorName}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Status Update Control & Print Slip */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <select
                  value={dw.status}
                  onChange={e => handleStatusChange(dw, e.target.value as any)}
                  className="text-[11px] bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 font-semibold cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                <div className="flex items-center space-x-1.5">
                  {isCompleted && (
                    <button
                      type="button"
                      onClick={() => setPrintActionItem({ type: 'devwork', data: dw })}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-bold inline-flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
                      title="Print Official Completion Certificate Slip"
                    >
                      <Printer className="w-3 h-3 text-blue-400" />
                      <span>Print Slip</span>
                    </button>
                  )}
                  <span className="text-gray-400 text-[10px] font-mono">#{dw.id}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Single Action Completion Certificate Slip Modal */}
      {printActionItem && (
        <PrintModal
          isOpen={true}
          onClose={() => setPrintActionItem(null)}
          documentType="single-action"
          title="Official Development Work Completion Certificate Slip"
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
          title="Official Action Taken Report (ATR) — Infrastructure Works Completed"
          panchayat={panchayat}
          villages={villages}
          wards={wards}
          allProblems={problems}
          allDevWorks={devWorks}
          allTickets={tickets}
          allAssistance={assistance}
        />
      )}
    </div>
  );
};
