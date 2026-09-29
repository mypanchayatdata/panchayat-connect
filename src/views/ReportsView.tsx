import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  Building,
  Home,
  Users,
  CheckCircle2,
  FileCheck,
  AlertTriangle,
  Milestone,
  FileText,
  ChevronRight,
  ShieldCheck,
  ClipboardCheck,
  Award,
  IndianRupee,
  Search,
  Filter
} from 'lucide-react';
import { PrintModal } from '../components/print/PrintModal';
import { SingleActionItem } from '../components/print/SingleActionPrintView';
import { Family, Ward, CommunityProblem, DevelopmentWork, FollowUpTicket, PersonalAssistance } from '../types';

interface ReportsViewProps {
  onNavigate: (view: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onNavigate }) => {
  const {
    panchayat,
    villages,
    wards,
    families,
    members,
    schemes,
    problems,
    devWorks,
    assistance,
    tickets,
    getVillageStats,
    getWardStats,
    getWardFamilies,
    getWardKeyPeople,
    getWardProblems,
    getWardDevWorks,
    getWardSchemes,
    getFamilyMembers,
    getFamilySchemes,
    getFamilyTickets,
    getFamilyAssistance
  } = useDatabase();

  const [activeReport, setActiveReport] = useState<'demographics' | 'schemes' | 'problems' | 'atr' | 'print-dossiers'>('atr');

  // Print selection state
  const [selectedWardForPrint, setSelectedWardForPrint] = useState<Ward | null>(wards[0] || null);
  const [selectedFamilyForPrint, setSelectedFamilyForPrint] = useState<Family | null>(families[0] || null);
  const [selectedAtrWardId, setSelectedAtrWardId] = useState<string>('all');
  const [atrCategoryFilter, setAtrCategoryFilter] = useState<string>('all');
  const [atrSearchQuery, setAtrSearchQuery] = useState<string>('');

  const [activePrintModal, setActivePrintModal] = useState<{ 
    type: 'family' | 'ward' | 'atr' | 'single-action'; 
    entity?: Family | Ward;
    actionItem?: SingleActionItem;
    wardId?: string;
  } | null>(null);

  // Filtered Completed / Solved Items for ATR
  const solvedProblems = problems.filter(p => {
    const isSolved = p.status === 'Completed' || p.status === 'Resolved';
    const wardMatch = selectedAtrWardId === 'all' || p.wardId === selectedAtrWardId;
    const catMatch = atrCategoryFilter === 'all' || p.category === atrCategoryFilter;
    const q = atrSearchQuery.toLowerCase().trim();
    const qMatch = !q || p.title.toLowerCase().includes(q) || (p.actionTaken && p.actionTaken.toLowerCase().includes(q));
    return isSolved && wardMatch && catMatch && qMatch;
  });

  const completedDevWorks = devWorks.filter(dw => {
    const isCompleted = dw.status === 'Completed';
    const wardMatch = selectedAtrWardId === 'all' || dw.wardId === selectedAtrWardId;
    const catMatch = atrCategoryFilter === 'all' || dw.schemeSource === atrCategoryFilter;
    const q = atrSearchQuery.toLowerCase().trim();
    const qMatch = !q || dw.title.toLowerCase().includes(q) || (dw.actionTaken && dw.actionTaken.toLowerCase().includes(q));
    return isCompleted && wardMatch && catMatch && qMatch;
  });

  const resolvedTickets = tickets.filter(t => {
    const isResolved = t.status === 'Resolved' || t.status === 'Closed';
    const wardMatch = selectedAtrWardId === 'all' || t.wardId === selectedAtrWardId;
    const catMatch = atrCategoryFilter === 'all' || t.category === atrCategoryFilter;
    const q = atrSearchQuery.toLowerCase().trim();
    const qMatch = !q || t.title.toLowerCase().includes(q) || (t.actionTaken && t.actionTaken.toLowerCase().includes(q));
    return isResolved && wardMatch && catMatch && qMatch;
  });

  // Calculate totals
  const totalProblemExp = solvedProblems.reduce((sum, p) => sum + (p.expenditureRs || 0), 0);
  const totalDevWorkExp = completedDevWorks.reduce((sum, dw) => sum + (dw.actualExpenditureRs || dw.budgetRs || 0), 0);
  const totalTicketBenefit = resolvedTickets.reduce((sum, t) => sum + (t.financialBenefitRs || 0), 0);
  const grandTotalExpenditureBenefit = totalProblemExp + totalDevWorkExp + totalTicketBenefit;

  // Export CSV Functionality for Families
  const exportFamiliesCSV = () => {
    const headers = [
      'Family ID',
      'Panchayat',
      'Village',
      'Ward',
      'Family Head',
      'Primary Mobile',
      'Address',
      'Economic Status',
      'Ration Card Type',
      'Total Members'
    ];

    const rows = families.map(f => {
      const v = villages.find(vil => vil.id === f.villageId);
      const w = wards.find(wrd => wrd.id === f.wardId);
      const fMembers = members.filter(m => m.familyId === f.id);
      const ecoLabel = f.economicStatus === 1 ? '1 - Well' : f.economicStatus === 2 ? '2 - Moderate' : '3 - Low';

      return [
        `"${f.id}"`,
        `"${panchayat.name}"`,
        `"${v?.name || ''}"`,
        `"Ward ${w?.wardNumber || ''}"`,
        `"${f.familyHeadName}"`,
        `"${f.primaryMobile}"`,
        `"${f.address.replace(/"/g, '""')}"`,
        `"${ecoLabel}"`,
        `"${f.rationCardType || ''}"`,
        fMembers.length
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Panchayat_Families_Report_${panchayat.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Action Taken Report (ATR) CSV
  const exportActionTakenCSV = () => {
    const headers = [
      'Category Type',
      'Record ID',
      'Title / Project',
      'Category / Scheme',
      'Village',
      'Ward',
      'Date Reported / Initiated',
      'Date Solved / Completed',
      'Work Done / Action Taken',
      'Resolution Notes / Outcome',
      'In-Charge / Officer',
      'Expenditure / Benefit (Rs)',
      'Verification Proof'
    ];

    const rows: string[] = [];

    // Problems
    solvedProblems.forEach(p => {
      const v = villages.find(vil => vil.id === p.villageId);
      const w = wards.find(wrd => wrd.id === p.wardId);
      rows.push([
        '"Community Problem Solved"',
        `"${p.id}"`,
        `"${p.title.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        `"${v?.name || ''}"`,
        `"Ward ${w?.wardNumber || ''}"`,
        `"${p.reportedDate || ''}"`,
        `"${p.resolvedDate || p.reportedDate}"`,
        `"${(p.actionTaken || p.latestAction || p.description || '').replace(/"/g, '""')}"`,
        `"${(p.resolutionNotes || '').replace(/"/g, '""')}"`,
        `"${p.resolvedBy || p.officialDepartment || ''}"`,
        `${p.expenditureRs || 0}`,
        `"${(p.resolutionProof || '').replace(/"/g, '""')}"`
      ].join(','));
    });

    // Dev works
    completedDevWorks.forEach(dw => {
      const v = villages.find(vil => vil.id === dw.villageId);
      const w = wards.find(wrd => wrd.id === dw.wardId);
      rows.push([
        '"Development Work Completed"',
        `"${dw.id}"`,
        `"${dw.title.replace(/"/g, '""')}"`,
        `"${dw.schemeSource}"`,
        `"${v?.name || ''}"`,
        `"Ward ${w?.wardNumber || ''}"`,
        `"${dw.startDate || ''}"`,
        `"${dw.actualCompletionDate || dw.targetCompletionDate}"`,
        `"${(dw.actionTaken || dw.description || '').replace(/"/g, '""')}"`,
        `"${(dw.completionNotes || '').replace(/"/g, '""')}"`,
        `"${dw.completedBy || dw.contractorName || ''}"`,
        `${dw.actualExpenditureRs || dw.budgetRs || 0}`,
        `"${(dw.completionCertificateNo || '').replace(/"/g, '""')}"`
      ].join(','));
    });

    // Tickets
    resolvedTickets.forEach(t => {
      const v = villages.find(vil => vil.id === t.villageId);
      const w = wards.find(wrd => wrd.id === t.wardId);
      rows.push([
        '"Grievance Ticket Resolved"',
        `"${t.id}"`,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${t.category}"`,
        `"${v?.name || ''}"`,
        `"Ward ${w?.wardNumber || ''}"`,
        `"${t.createdDate || ''}"`,
        `"${t.resolvedDate || t.targetDate}"`,
        `"${(t.actionTaken || t.description || '').replace(/"/g, '""')}"`,
        `"${(t.resolutionNotes || t.notes || '').replace(/"/g, '""')}"`,
        `"${t.resolvedBy || t.assignedTo || ''}"`,
        `${t.financialBenefitRs || 0}`,
        `"${(t.resolutionProof || '').replace(/"/g, '""')}"`
      ].join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Action_Taken_Report_ATR_${panchayat.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Administrative Reports &amp; Physical Document Submission</span>
            </h1>
            <p className="text-xs text-gray-500">
              Aggregated Village, Ward, Household Demographics, Welfare Schemes, and Action Taken Reports (ATR)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportActionTakenCSV}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Download full Action Taken Report CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export ATR CSV</span>
            </button>
            <button
              onClick={exportFamiliesCSV}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Families CSV</span>
            </button>
            <button
              onClick={() => setActivePrintModal({ type: 'atr', wardId: selectedAtrWardId })}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print ATR (A4)</span>
            </button>
          </div>
        </div>

        {/* Report Section Tabs */}
        <div className="flex space-x-2 border-b border-gray-200 pb-2 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveReport('atr')}
            className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer flex items-center space-x-1.5 ${
              activeReport === 'atr' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Work Done &amp; Issues Solved (ATR)</span>
            <span className="ml-1 bg-white/20 text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {solvedProblems.length + completedDevWorks.length + resolvedTickets.length}
            </span>
          </button>
          <button
            onClick={() => setActiveReport('print-dossiers')}
            className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer flex items-center space-x-1.5 ${
              activeReport === 'print-dossiers' ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Physical Document Dossiers (A4 Print)</span>
          </button>
          <button
            onClick={() => setActiveReport('demographics')}
            className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer ${
              activeReport === 'demographics' ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Village &amp; Ward Breakdown
          </button>
          <button
            onClick={() => setActiveReport('schemes')}
            className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer ${
              activeReport === 'schemes' ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Welfare Schemes Backlog
          </button>
          <button
            onClick={() => setActiveReport('problems')}
            className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer ${
              activeReport === 'problems' ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Community Grievances Analysis
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. ACTION TAKEN REPORT (ATR) - WORK DONE & ISSUES SOLVED  */}
      {/* ======================================================== */}
      {activeReport === 'atr' && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Solved Problems</span>
                <span className="text-2xl font-black text-emerald-950 mt-1 block">{solvedProblems.length}</span>
                <span className="text-[11px] text-emerald-700 font-semibold">Repairs &amp; Civic Fixes</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Dev Works Done</span>
                <span className="text-2xl font-black text-blue-950 mt-1 block">{completedDevWorks.length}</span>
                <span className="text-[11px] text-blue-700 font-semibold">Civil Infrastructure</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl text-blue-700 border border-blue-200">
                <Milestone className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Resolved Tickets</span>
                <span className="text-2xl font-black text-purple-950 mt-1 block">{resolvedTickets.length}</span>
                <span className="text-[11px] text-purple-700 font-semibold">Family &amp; Citizen Aid</span>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl text-purple-700 border border-purple-200">
                <FileCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-900 font-bold uppercase tracking-wider block">Total Work Value / Benefit</span>
                <span className="text-2xl font-black text-emerald-900 font-mono mt-1 block">
                  ₹{grandTotalExpenditureBenefit.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-emerald-800 font-semibold">Delivered on Ground</span>
              </div>
              <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-xs">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Filters and Actions Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              {/* Search */}
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search solved work or action description..."
                  value={atrSearchQuery}
                  onChange={e => setAtrSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Ward Filter */}
              <div className="w-44">
                <select
                  value={selectedAtrWardId}
                  onChange={e => setSelectedAtrWardId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900"
                >
                  <option value="all">Whole Panchayat (All Wards)</option>
                  {wards.map((w, idx) => (
                    <option key={`atr-ward-filter-${w.id}-${idx}`} value={w.id}>
                      Ward {w.wardNumber} — {w.wardMemberName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActivePrintModal({ type: 'atr', wardId: selectedAtrWardId })}
                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Preview &amp; Print Full ATR (FORM GP-ATR-03)</span>
              </button>
            </div>
          </div>

          {/* Section 1: Solved Community Problems Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2 bg-slate-50/50">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-100 text-emerald-900 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">
                    Solved Community Problems &amp; Ground Repairs ({solvedProblems.length})
                  </h3>
                  <p className="text-[11px] text-gray-500">Drinking water, roads, electricity, sanitation, and civic repairs</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-900 font-mono">
                Total Exp: ₹{totalProblemExp.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                <thead className="bg-slate-100 text-gray-700 uppercase text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3">Problem / Ward</th>
                    <th className="p-3">Action Taken &amp; Work Done on Ground</th>
                    <th className="p-3">Resolved Date &amp; In-Charge</th>
                    <th className="p-3 text-right">Expenditure</th>
                    <th className="p-3 text-center">Resolution Slip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {solvedProblems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500 italic">
                        No solved community problems found for the selected filter.
                      </td>
                    </tr>
                  ) : (
                    solvedProblems.map(p => {
                      const v = villages.find(vil => vil.id === p.villageId);
                      const w = wards.find(wrd => wrd.id === p.wardId);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 align-top max-w-[240px]">
                            <div className="font-extrabold text-gray-900 text-xs">{p.title}</div>
                            <div className="text-[11px] text-gray-500 mt-0.5">
                              {p.category} • {v?.name} (Ward {w?.wardNumber})
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Ref: #{p.id}</div>
                          </td>
                          <td className="p-3 align-top">
                            <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg text-[11px] text-slate-900 font-medium leading-relaxed">
                              {p.actionTaken || p.latestAction || p.description}
                            </div>
                            {p.resolutionNotes && (
                              <div className="text-[10.5px] text-slate-600 mt-1 italic">
                                Notes: {p.resolutionNotes}
                              </div>
                            )}
                            {p.resolutionProof && (
                              <div className="text-[9.5px] text-emerald-800 font-mono mt-0.5">
                                Verification: {p.resolutionProof}
                              </div>
                            )}
                          </td>
                          <td className="p-3 align-top whitespace-nowrap">
                            <div className="font-bold text-gray-900">{p.resolvedDate || p.reportedDate}</div>
                            <div className="text-[11px] text-gray-600 mt-0.5">{p.resolvedBy || p.officialDepartment || 'Gram Panchayat'}</div>
                            <span className="inline-block mt-1 bg-emerald-100 text-emerald-900 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-emerald-300">
                              VERIFIED SOLVED
                            </span>
                          </td>
                          <td className="p-3 align-top text-right whitespace-nowrap">
                            <span className="font-mono font-extrabold text-emerald-950 text-xs block">
                              {p.expenditureRs ? `₹${p.expenditureRs.toLocaleString('en-IN')}` : 'Public Service'}
                            </span>
                          </td>
                          <td className="p-3 align-top text-center whitespace-nowrap">
                            <button
                              onClick={() => setActivePrintModal({
                                type: 'single-action',
                                actionItem: { type: 'problem', data: p }
                              })}
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold inline-flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
                              title="Print Official Resolution Certificate Slip"
                            >
                              <Printer className="w-3 h-3 text-emerald-400" />
                              <span>Print Slip</span>
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

          {/* Section 2: Completed Development Works Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2 bg-slate-50/50">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 text-blue-900 rounded-lg">
                  <Milestone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">
                    Completed Infrastructure &amp; Development Works ({completedDevWorks.length})
                  </h3>
                  <p className="text-[11px] text-gray-500">Roads, CC pavements, solar lighting, community halls, and drains</p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-900 font-mono">
                Total Exp: ₹{totalDevWorkExp.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                <thead className="bg-slate-100 text-gray-700 uppercase text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3">Project Title / Scheme</th>
                    <th className="p-3">Physical Scope Completed &amp; MB Ref</th>
                    <th className="p-3">Completion Date &amp; Agency</th>
                    <th className="p-3 text-right">Actual Expenditure</th>
                    <th className="p-3 text-center">Completion Slip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {completedDevWorks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500 italic">
                        No completed development works found for the selected filter.
                      </td>
                    </tr>
                  ) : (
                    completedDevWorks.map(dw => {
                      const v = villages.find(vil => vil.id === dw.villageId);
                      const w = wards.find(wrd => wrd.id === dw.wardId);
                      return (
                        <tr key={dw.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 align-top max-w-[240px]">
                            <div className="font-extrabold text-gray-900 text-xs">{dw.title}</div>
                            <div className="text-[11px] text-blue-700 font-semibold mt-0.5">
                              {dw.schemeSource} • {v?.name} (Ward {w?.wardNumber})
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: #{dw.id}</div>
                          </td>
                          <td className="p-3 align-top">
                            <div className="p-2 bg-blue-50/50 border border-blue-200 rounded-lg text-[11px] text-slate-900 font-medium leading-relaxed">
                              {dw.actionTaken || dw.description}
                            </div>
                            {dw.completionCertificateNo && (
                              <div className="text-[9.5px] text-slate-600 font-mono mt-1">
                                <strong>MB Ref / Cert:</strong> {dw.completionCertificateNo}
                              </div>
                            )}
                          </td>
                          <td className="p-3 align-top whitespace-nowrap">
                            <div className="font-bold text-gray-900">{dw.actualCompletionDate || dw.targetCompletionDate}</div>
                            <div className="text-[11px] text-gray-600 mt-0.5">{dw.contractorName || 'Panchayat Agency'}</div>
                            {dw.supervisingEngineer && (
                              <div className="text-[10px] text-slate-500">JE: {dw.supervisingEngineer}</div>
                            )}
                          </td>
                          <td className="p-3 align-top text-right whitespace-nowrap">
                            <span className="font-mono font-extrabold text-blue-950 text-xs block">
                              ₹{(dw.actualExpenditureRs || dw.budgetRs).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              Budget: ₹{dw.budgetRs.toLocaleString('en-IN')}
                            </span>
                          </td>
                          <td className="p-3 align-top text-center whitespace-nowrap">
                            <button
                              onClick={() => setActivePrintModal({
                                type: 'single-action',
                                actionItem: { type: 'devwork', data: dw }
                              })}
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold inline-flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
                              title="Print Official Completion Certificate Slip"
                            >
                              <Printer className="w-3 h-3 text-blue-400" />
                              <span>Print Slip</span>
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

          {/* Section 3: Resolved Citizen Grievances & Aid Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2 bg-slate-50/50">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 text-purple-900 rounded-lg">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">
                    Resolved Citizen Grievances &amp; Direct Assistance Delivered ({resolvedTickets.length})
                  </h3>
                  <p className="text-[11px] text-gray-500">Pension sanction, ration cards, disability aid, health assistance</p>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-900 font-mono">
                Total Benefit: ₹{totalTicketBenefit.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                <thead className="bg-slate-100 text-gray-700 uppercase text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3">Beneficiary / Ticket</th>
                    <th className="p-3">Action Taken &amp; Benefit Outcome</th>
                    <th className="p-3">Resolved Date &amp; Handled By</th>
                    <th className="p-3 text-right">Benefit Value</th>
                    <th className="p-3 text-center">Resolution Slip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {resolvedTickets.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500 italic">
                        No resolved citizen tickets found for the selected filter.
                      </td>
                    </tr>
                  ) : (
                    resolvedTickets.map(t => {
                      const v = villages.find(vil => vil.id === t.villageId);
                      const w = wards.find(wrd => wrd.id === t.wardId);
                      return (
                        <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 align-top max-w-[240px]">
                            <div className="font-extrabold text-gray-900 text-xs">{t.title}</div>
                            <div className="text-[11px] text-purple-700 font-semibold mt-0.5">
                              {t.category} • {v?.name} (Ward {w?.wardNumber})
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Ticket: #{t.id}</div>
                          </td>
                          <td className="p-3 align-top">
                            <div className="p-2 bg-purple-50/50 border border-purple-200 rounded-lg text-[11px] text-slate-900 font-medium leading-relaxed">
                              {t.actionTaken || t.description}
                            </div>
                            {t.resolutionNotes && (
                              <div className="text-[10.5px] text-slate-600 mt-1 italic">
                                Outcome: {t.resolutionNotes}
                              </div>
                            )}
                          </td>
                          <td className="p-3 align-top whitespace-nowrap">
                            <div className="font-bold text-gray-900">{t.resolvedDate || t.targetDate}</div>
                            <div className="text-[11px] text-gray-600 mt-0.5">{t.resolvedBy || t.assignedTo || 'Social Worker'}</div>
                            <span className="inline-block mt-1 bg-purple-100 text-purple-900 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-purple-300">
                              RESOLVED &amp; CLOSED
                            </span>
                          </td>
                          <td className="p-3 align-top text-right whitespace-nowrap">
                            <span className="font-mono font-extrabold text-purple-950 text-xs block">
                              {t.financialBenefitRs ? `₹${t.financialBenefitRs.toLocaleString('en-IN')}` : 'Service Aid'}
                            </span>
                          </td>
                          <td className="p-3 align-top text-center whitespace-nowrap">
                            <button
                              onClick={() => setActivePrintModal({
                                type: 'single-action',
                                actionItem: { type: 'ticket', data: t }
                              })}
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold inline-flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
                              title="Print Official Service Resolution Slip"
                            >
                              <Printer className="w-3 h-3 text-purple-400" />
                              <span>Print Slip</span>
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
      )}

      {/* ======================================================== */}
      {/* 2. PHYSICAL DOCUMENT DOSSIERS (A4 PRINT CARDS)            */}
      {/* ======================================================== */}
      {activeReport === 'print-dossiers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. ACTION TAKEN REPORT (ATR) PRINT CARD */}
          <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-md p-6 flex flex-col justify-between space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
              NEW &bull; STATUTORY REPORT
            </div>
            <div>
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                <div className="p-3 bg-emerald-700 rounded-xl text-white shadow-xs">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                    FORM GP-ATR-03
                  </span>
                  <h3 className="text-base font-extrabold text-gray-900 mt-0.5">
                    Action Taken &amp; Work Done Report (ATR)
                  </h3>
                </div>
              </div>

              <p className="text-xs text-gray-600 mt-3">
                Generates a formal, CSS-optimized A4 official Action Taken Report (ATR) documenting all completed civic repairs, solved community grievances, executed infrastructure works, and citizen welfare assistance. Includes financial auditing matrix, officer verification, and seal signature blocks.
              </p>

              {/* Select Scope for ATR */}
              <div className="mt-4 space-y-2">
                <label className="text-xs font-bold text-gray-700 block">
                  Select Geographic Scope for ATR:
                </label>
                <select
                  value={selectedAtrWardId}
                  onChange={e => setSelectedAtrWardId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 bg-gray-50 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">Whole Panchayat (All Wards Combined)</option>
                  {wards.map((w, idx) => {
                    const v = villages.find(vil => vil.id === w.villageId);
                    return (
                      <option key={`atr-select-${w.id}-${idx}`} value={w.id}>
                        Ward No. {w.wardNumber} — {w.wardMemberName} ({v?.name || ''})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="mt-4 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-700">
                  <span>Solved Grievances &amp; Repairs:</span>
                  <strong className="text-emerald-950 font-bold">{solvedProblems.length} Items</strong>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Completed Dev Works:</span>
                  <strong className="text-blue-950 font-bold">{completedDevWorks.length} Projects</strong>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Resolved Citizen Tickets:</span>
                  <strong className="text-purple-950 font-bold">{resolvedTickets.length} Beneficiaries</strong>
                </div>
                <div className="flex justify-between text-slate-700 pt-1 border-t border-emerald-200">
                  <span>Total Work Value / Benefit:</span>
                  <strong className="text-emerald-900 font-mono font-black">
                    ₹{grandTotalExpenditureBenefit.toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => setActivePrintModal({ type: 'atr', wardId: selectedAtrWardId })}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Preview &amp; Print ATR Report (A4)</span>
              </button>

              <button
                onClick={exportActionTakenCSV}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export ATR Data (CSV)</span>
              </button>
            </div>
          </div>

          {/* 2. WARD OFFICIAL REPORT PRINT CARD */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                <div className="p-3 bg-blue-600 rounded-xl text-white">
                  <Milestone className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    FORM GP-WD-02
                  </span>
                  <h3 className="text-base font-extrabold text-gray-900 mt-0.5">
                    Ward Administration &amp; Electoral Report
                  </h3>
                </div>
              </div>

              <p className="text-xs text-gray-600 mt-3">
                Generates a formal, CSS-optimized A4 report formatted for physical document submission. Includes ward demographic matrix, voter summary &amp; categorization (🟢/🟡/🔴), household nominal roll, completed works, and official seal signature blocks.
              </p>

              {/* Select Ward */}
              <div className="mt-4 space-y-2">
                <label className="text-xs font-bold text-gray-700 block">
                  Select Ward to Generate Dossier:
                </label>
                <select
                  value={selectedWardForPrint?.id || ''}
                  onChange={e => {
                    const w = wards.find(wrd => wrd.id === e.target.value);
                    if (w) setSelectedWardForPrint(w);
                  }}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-500"
                >
                  {wards.map((w, idx) => {
                    const v = villages.find(vil => vil.id === w.villageId);
                    return (
                      <option key={`rep-ward-${w.id}-${idx}`} value={w.id}>
                        Ward No. {w.wardNumber} — {w.wardMemberName} ({v?.name || ''})
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedWardForPrint && (
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-700">
                    <span>Ward Jurisdiction:</span>
                    <strong className="text-slate-950">Ward {selectedWardForPrint.wardNumber} ({villages.find(v => v.id === selectedWardForPrint.villageId)?.name})</strong>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Elected Ward Member:</span>
                    <strong className="text-slate-950">{selectedWardForPrint.wardMemberName}</strong>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Households / Population:</span>
                    <strong className="text-slate-950">
                      {getWardFamilies(selectedWardForPrint.id).length} Families • {members.filter(m => getWardFamilies(selectedWardForPrint.id).map(f => f.id).includes(m.familyId)).length} Residents
                    </strong>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (selectedWardForPrint) {
                  setActivePrintModal({ type: 'ward', entity: selectedWardForPrint });
                }
              }}
              disabled={!selectedWardForPrint}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Preview &amp; Print Ward Report (A4)</span>
            </button>
          </div>

          {/* 3. FAMILY PROFILE DOSSIER PRINT CARD */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                <div className="p-3 bg-purple-600 rounded-xl text-white">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    FORM GP-HR-01
                  </span>
                  <h3 className="text-base font-extrabold text-gray-900 mt-0.5">
                    Family Household Verification Dossier
                  </h3>
                </div>
              </div>

              <p className="text-xs text-gray-600 mt-3">
                Generates a formal, CSS-optimized A4 household verification document formatted for official physical submission. Includes household socio-economic particulars, voter roll matrix, assistance received, tickets resolved, and citizen &amp; officer signature stamps.
              </p>

              {/* Select Family */}
              <div className="mt-4 space-y-2">
                <label className="text-xs font-bold text-gray-700 block">
                  Select Family / Household to Generate Dossier:
                </label>
                <select
                  value={selectedFamilyForPrint?.id || ''}
                  onChange={e => {
                    const f = families.find(fam => fam.id === e.target.value);
                    if (f) setSelectedFamilyForPrint(f);
                  }}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 bg-gray-50 focus:ring-2 focus:ring-purple-500"
                >
                  {families.map(f => {
                    const v = villages.find(vil => vil.id === f.villageId);
                    const w = wards.find(wrd => wrd.id === f.wardId);
                    return (
                      <option key={f.id} value={f.id}>
                        {f.familyHeadName} ({f.id}) — {v?.name || ''}, W-{w?.wardNumber || ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedFamilyForPrint && (
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-700">
                    <span>Head of Household:</span>
                    <strong className="text-slate-950">{selectedFamilyForPrint.familyHeadName} ({selectedFamilyForPrint.id})</strong>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Location:</span>
                    <strong className="text-slate-950">
                      {villages.find(v => v.id === selectedFamilyForPrint.villageId)?.name} • Ward {wards.find(w => w.id === selectedFamilyForPrint.wardId)?.wardNumber}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Members / Voters:</span>
                    <strong className="text-slate-950">
                      {getFamilyMembers(selectedFamilyForPrint.id).length} Members ({getFamilyMembers(selectedFamilyForPrint.id).filter(m => m.isVoter).length} Voters)
                    </strong>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (selectedFamilyForPrint) {
                  setActivePrintModal({ type: 'family', entity: selectedFamilyForPrint });
                }
              }}
              disabled={!selectedFamilyForPrint}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-purple-400" />
              <span>Preview &amp; Print Family Dossier (A4)</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. DEMOGRAPHICS REPORT                                    */}
      {/* ======================================================== */}
      {activeReport === 'demographics' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-900">
              Gram Panchayat Demographic &amp; Household Matrix
            </h3>
            <span className="text-xs text-gray-500">As of today's field registry</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[850px]">
              <thead className="bg-slate-100 text-gray-700 uppercase text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3">Village Name</th>
                  <th className="p-3">Wards</th>
                  <th className="p-3">Families</th>
                  <th className="p-3">Population</th>
                  <th className="p-3">Male / Female</th>
                  <th className="p-3">Voters</th>
                  <th className="p-3">Voter %</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {villages.map(v => {
                  const stats = getVillageStats(v.id);
                  const vWards = wards.filter(w => w.villageId === v.id);

                  return (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-gray-900 flex items-center space-x-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span>{v.name}</span>
                      </td>
                      <td className="p-3 font-medium text-gray-600">
                        {vWards.map(w => `W-${w.wardNumber}`).join(', ') || 'None'}
                      </td>
                      <td className="p-3 font-semibold text-gray-800">{stats.familiesCount}</td>
                      <td className="p-3 font-semibold text-gray-800">{stats.population}</td>
                      <td className="p-3 text-gray-600">{stats.maleCount} / {stats.femaleCount}</td>
                      <td className="p-3 font-bold text-blue-600">{stats.votersCount}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {stats.population > 0 ? ((stats.votersCount / stats.population) * 100).toFixed(1) : 0}%
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            const firstWard = vWards[0];
                            if (firstWard) {
                              setActivePrintModal({ type: 'ward', entity: firstWard });
                            }
                          }}
                          className="px-2.5 py-1 text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-semibold inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Ward</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. WELFARE SCHEMES BACKLOG                                */}
      {/* ======================================================== */}
      {activeReport === 'schemes' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-900">
              Government Schemes Penetration &amp; Pending Pipeline
            </h3>
            <span className="text-xs text-gray-500">Beneficiary delivery analysis</span>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 border-b border-gray-200">
            <div className="p-3 bg-white rounded-xl border border-gray-200">
              <span className="text-xs text-gray-500 font-medium">Total Tracked Applications</span>
              <strong className="text-xl font-extrabold text-gray-900 block mt-1">{schemes.length}</strong>
            </div>
            <div className="p-3 bg-white rounded-xl border border-emerald-200 bg-emerald-50/20">
              <span className="text-xs text-emerald-800 font-medium">Sanctioned &amp; Disbursed</span>
              <strong className="text-xl font-extrabold text-emerald-700 block mt-1">
                {schemes.filter(s => s.status === 'Sanctioned').length}
              </strong>
            </div>
            <div className="p-3 bg-white rounded-xl border border-amber-200 bg-amber-50/20">
              <span className="text-xs text-amber-800 font-medium">Under Verification / Pending</span>
              <strong className="text-xl font-extrabold text-amber-700 block mt-1">
                {schemes.filter(s => s.status === 'Applied' || s.status === 'Pending').length}
              </strong>
            </div>
            <div className="p-3 bg-white rounded-xl border border-rose-200 bg-rose-50/20">
              <span className="text-xs text-rose-800 font-medium">Rejected / Ineligible</span>
              <strong className="text-xl font-extrabold text-rose-700 block mt-1">
                {schemes.filter(s => s.status === 'Rejected').length}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. COMMUNITY PROBLEMS BREAKDOWN                           */}
      {/* ======================================================== */}
      {activeReport === 'problems' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-900">
              Community Grievances &amp; Resolution Tracking
            </h3>
            <button
              onClick={() => setActiveReport('atr')}
              className="text-xs text-emerald-800 font-bold hover:underline flex items-center space-x-1"
            >
              <span>View Full Action Taken Report (ATR)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-rose-50 rounded-xl text-rose-900">
              <span className="block text-[10px] uppercase font-bold">High Priority</span>
              <strong className="text-xl font-extrabold">{problems.filter(p => p.priority === 'High').length}</strong>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-900">
              <span className="block text-[10px] uppercase font-bold">Open / In Progress</span>
              <strong className="text-xl font-extrabold">{problems.filter(p => p.status !== 'Completed').length}</strong>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-900">
              <span className="block text-[10px] uppercase font-bold">Resolved / Fixed</span>
              <strong className="text-xl font-extrabold">{problems.filter(p => p.status === 'Completed').length}</strong>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODALS FOR PRINT PREVIEW & GENERATION                     */}
      {/* ======================================================== */}
      {activePrintModal && activePrintModal.type === 'ward' && activePrintModal.entity && (
        <PrintModal
          isOpen={true}
          onClose={() => setActivePrintModal(null)}
          documentType="ward"
          title={`Ward ${(activePrintModal.entity as Ward).wardNumber} Administrative & Electoral Report`}
          ward={activePrintModal.entity as Ward}
          village={villages.find(v => v.id === (activePrintModal.entity as Ward).villageId)}
          panchayat={panchayat}
          wardFamilies={getWardFamilies(activePrintModal.entity.id)}
          wardMembers={members.filter(m => getWardFamilies(activePrintModal.entity!.id).map(f => f.id).includes(m.familyId))}
          wardAssistance={assistance.filter(a => a.wardId === activePrintModal.entity!.id || (a.familyId && getWardFamilies(activePrintModal.entity!.id).map(f => f.id).includes(a.familyId)))}
          devWorks={getWardDevWorks(activePrintModal.entity.id)}
          problems={getWardProblems(activePrintModal.entity.id)}
          keyPeople={getWardKeyPeople(activePrintModal.entity.id)}
          schemes={getWardSchemes(activePrintModal.entity.id)}
        />
      )}

      {activePrintModal && activePrintModal.type === 'family' && activePrintModal.entity && (
        <PrintModal
          isOpen={true}
          onClose={() => setActivePrintModal(null)}
          documentType="family"
          title={`Household Verification Dossier: ${(activePrintModal.entity as Family).familyHeadName} (${activePrintModal.entity.id})`}
          family={activePrintModal.entity as Family}
          familyMembers={getFamilyMembers(activePrintModal.entity.id)}
          village={villages.find(v => v.id === (activePrintModal.entity as Family).villageId)}
          ward={wards.find(w => w.id === (activePrintModal.entity as Family).wardId)}
          panchayat={panchayat}
          assistance={getFamilyAssistance(activePrintModal.entity.id)}
          schemes={getFamilySchemes(activePrintModal.entity.id)}
          tickets={getFamilyTickets(activePrintModal.entity.id)}
        />
      )}

      {activePrintModal && activePrintModal.type === 'atr' && (
        <PrintModal
          isOpen={true}
          onClose={() => setActivePrintModal(null)}
          documentType="atr"
          title={activePrintModal.wardId && activePrintModal.wardId !== 'all' 
            ? `Official Action Taken Report — Ward ${wards.find(w => w.id === activePrintModal.wardId)?.wardNumber}`
            : `Official Action Taken & Work Done Report (Panchayat Whole)`}
          panchayat={panchayat}
          villages={villages}
          wards={wards}
          selectedWardId={activePrintModal.wardId}
          allProblems={problems}
          allDevWorks={devWorks}
          allTickets={tickets}
          allAssistance={assistance}
        />
      )}

      {activePrintModal && activePrintModal.type === 'single-action' && activePrintModal.actionItem && (
        <PrintModal
          isOpen={true}
          onClose={() => setActivePrintModal(null)}
          documentType="single-action"
          title="Official Work Done & Grievance Resolution Certificate Slip"
          panchayat={panchayat}
          villages={villages}
          wards={wards}
          actionItem={activePrintModal.actionItem}
        />
      )}
    </div>
  );
};
