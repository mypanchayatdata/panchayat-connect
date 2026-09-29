import React from 'react';
import { 
  CommunityProblem, 
  DevelopmentWork, 
  FollowUpTicket, 
  PersonalAssistance, 
  Panchayat, 
  Village, 
  Ward 
} from '../../types';

interface ActionTakenPrintViewProps {
  panchayat: Panchayat;
  villages: Village[];
  wards: Ward[];
  selectedWardId?: string; // Optional: if filtered to a specific ward
  problems: CommunityProblem[];
  devWorks: DevelopmentWork[];
  tickets: FollowUpTicket[];
  assistance: PersonalAssistance[];
  includeProblems?: boolean;
  includeDevWorks?: boolean;
  includeTickets?: boolean;
  includeAssistance?: boolean;
  includeSignatures?: boolean;
  notes?: string;
}

export const ActionTakenPrintView: React.FC<ActionTakenPrintViewProps> = ({
  panchayat,
  villages,
  wards,
  selectedWardId,
  problems,
  devWorks,
  tickets,
  assistance,
  includeProblems = true,
  includeDevWorks = true,
  includeTickets = true,
  includeAssistance = true,
  includeSignatures = true,
  notes
}) => {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const selectedWard = selectedWardId ? wards.find(w => w.id === selectedWardId) : undefined;
  const selectedVillage = selectedWard ? villages.find(v => v.id === selectedWard.villageId) : undefined;

  // Filter only solved / completed items
  const solvedProblems = problems.filter(p => {
    const isSolved = p.status === 'Completed';
    if (!selectedWardId) return isSolved;
    return isSolved && p.wardId === selectedWardId;
  });

  const completedDevWorks = devWorks.filter(dw => {
    const isDone = dw.status === 'Completed' || dw.progressPercentage === 100;
    if (!selectedWardId) return isDone;
    return isDone && dw.wardId === selectedWardId;
  });

  const resolvedTickets = tickets.filter(t => {
    const isResolved = t.status === 'Resolved' || t.status === 'Closed';
    if (!selectedWardId) return isResolved;
    return isResolved && t.wardId === selectedWardId;
  });

  const completedAssistance = assistance.filter(a => {
    const isDone = a.status === 'DONE';
    if (!selectedWardId) return isDone;
    return isDone && a.wardId === selectedWardId;
  });

  // Calculate financial statistics
  const totalProblemExpenditure = solvedProblems.reduce((sum, p) => sum + (p.expenditureRs || 0), 0);
  const totalDevWorkExpenditure = completedDevWorks.reduce((sum, dw) => sum + (dw.actualExpenditureRs || dw.budgetRs || 0), 0);
  const totalTicketBenefit = resolvedTickets.reduce((sum, t) => sum + (t.financialBenefitRs || 0), 0);
  const totalAssistanceValue = completedAssistance.reduce((sum, a) => sum + (a.financialValueRs || 0), 0);
  const grandTotalExpenditure = totalProblemExpenditure + totalDevWorkExpenditure + totalTicketBenefit + totalAssistanceValue;

  const totalActionsCount = solvedProblems.length + completedDevWorks.length + resolvedTickets.length + completedAssistance.length;

  const getWardLabel = (wardId?: string) => {
    if (!wardId) return 'All Wards';
    const w = wards.find(item => item.id === wardId);
    return w ? `Ward ${w.wardNumber}` : wardId;
  };

  const getVillageName = (villageId?: string) => {
    if (!villageId) return 'GP General';
    const v = villages.find(item => item.id === villageId);
    return v ? v.name : villageId;
  };

  return (
    <div id="action-taken-report-print" className="bg-white text-slate-900 text-xs leading-relaxed max-w-[210mm] mx-auto p-4 sm:p-6 print:p-0 print:max-w-none">
      {/* ======================================================== */}
      {/* 1. OFFICIAL GOVT / PANCHAYAT LETTERHEAD HEADER           */}
      {/* ======================================================== */}
      <div className="border-b-2 border-slate-900 pb-3 mb-4">
        <div className="flex items-center justify-between gap-3">
          {/* Emblem & GP Seal */}
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 border-2 border-slate-800 rounded-full flex flex-col items-center justify-center p-1 bg-slate-50 shrink-0 text-center">
              <span className="text-base font-black text-slate-900 leading-none">🏛️</span>
              <span className="text-[8px] font-black uppercase text-slate-800 mt-0.5 tracking-tighter">PR &amp; DW</span>
              <span className="text-[7px] text-slate-600 font-bold leading-tight">ODISHA</span>
            </div>
            <div>
              <div className="text-[9px] font-bold text-slate-600 tracking-wider uppercase">
                Panchayati Raj &amp; Drinking Water Department, Govt of Odisha
              </div>
              <h1 className="text-xl font-black tracking-tight text-slate-950 uppercase leading-none mt-0.5">
                {panchayat?.name || 'Kalyanpur'} Gram Panchayat
              </h1>
              <div className="text-[10px] text-slate-700 font-medium mt-0.5">
                Block: <strong className="text-slate-900">{panchayat?.block || 'Pipili'}</strong> | 
                District: <strong className="text-slate-900">{panchayat?.district || 'Puri'}</strong> | 
                State: Odisha (PIN: 752104)
              </div>
            </div>
          </div>

          {/* Document Reference Badge */}
          <div className="text-right shrink-0">
            <div className="inline-block bg-emerald-800 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded tracking-wide mb-1">
              FORM GP-ATR-03
            </div>
            <div className="font-mono text-[10px] font-bold text-slate-800">
              REF: ATR/2026/Q1/{selectedWard ? `W0${selectedWard.wardNumber}` : 'GP-ALL'}
            </div>
            <div className="text-[9px] text-slate-600">Generated: {currentDate}</div>
          </div>
        </div>

        {/* Title banner */}
        <div className="mt-3 bg-slate-900 text-white py-1.5 px-3 rounded flex items-center justify-between">
          <div className="font-black text-xs uppercase tracking-wider flex items-center space-x-2">
            <span>✅ OFFICIAL ACTION TAKEN REPORT (ATR) &amp; WORK DONE DOSSIER</span>
          </div>
          <div className="text-[10px] font-medium text-emerald-300">
            {selectedWard 
              ? `Jurisdiction: Ward No. ${selectedWard.wardNumber} (${selectedVillage?.name || ''})` 
              : `Jurisdiction: All Gram Panchayat Wards (1 to ${wards.length})`
            }
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. EXECUTIVE WORK DONE & RESOLUTION SCORECARD            */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
        <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded text-center">
          <span className="text-[9px] font-black uppercase text-emerald-900 block">Total Work Actions Done</span>
          <strong className="text-xl font-black text-emerald-950 block">{totalActionsCount}</strong>
          <span className="text-[8.5px] text-emerald-700 font-bold">100% Physical Ground Proof</span>
        </div>

        <div className="p-2.5 bg-blue-50 border border-blue-300 rounded text-center">
          <span className="text-[9px] font-black uppercase text-blue-900 block">Grievances Solved</span>
          <strong className="text-xl font-black text-blue-950 block">{solvedProblems.length}</strong>
          <span className="text-[8.5px] text-blue-700 font-bold">Borewell, Lights, Drains</span>
        </div>

        <div className="p-2.5 bg-indigo-50 border border-indigo-300 rounded text-center">
          <span className="text-[9px] font-black uppercase text-indigo-900 block">Projects Completed</span>
          <strong className="text-xl font-black text-indigo-950 block">{completedDevWorks.length}</strong>
          <span className="text-[8.5px] text-indigo-700 font-bold">Roads, Anganwadis, Halls</span>
        </div>

        <div className="p-2.5 bg-purple-50 border border-purple-300 rounded text-center">
          <span className="text-[9px] font-black uppercase text-purple-900 block">Citizen Tickets Resolved</span>
          <strong className="text-xl font-black text-purple-950 block">{resolvedTickets.length + completedAssistance.length}</strong>
          <span className="text-[8.5px] text-purple-700 font-bold">Pensions, BSKY, Schemes</span>
        </div>

        <div className="p-2.5 bg-amber-50 border border-amber-300 rounded text-center col-span-2 sm:col-span-1">
          <span className="text-[9px] font-black uppercase text-amber-900 block">Total Public Value / Exp.</span>
          <strong className="text-base font-black text-amber-950 block font-mono">
            ₹{grandTotalExpenditure.toLocaleString('en-IN')}
          </strong>
          <span className="text-[8.5px] text-amber-700 font-bold">Public Funds Mobilized</span>
        </div>
      </div>

      {/* Optional Note / Remarks */}
      {notes && (
        <div className="bg-slate-50 border border-slate-300 p-2 rounded mb-4 text-[10.5px] text-slate-700">
          <strong className="font-bold text-slate-900">Executive ATR Remarks:</strong> {notes}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. SECTION 1: COMMUNITY PROBLEMS & GRIEVANCES SOLVED     */}
      {/* ======================================================== */}
      {includeProblems && (
        <div className="mb-4 print-avoid-break">
          <div className="bg-slate-900 text-white font-bold px-2.5 py-1 text-[11px] uppercase tracking-wider flex items-center justify-between rounded-t">
            <span>Section 1: Community Grievances & Infrastructure Problems Solved ({solvedProblems.length} Items)</span>
            <span className="text-[9.5px] font-normal text-emerald-300">Ground Verification Complete</span>
          </div>

          {solvedProblems.length === 0 ? (
            <div className="border border-slate-300 border-t-0 p-3 text-center text-slate-500 italic bg-white">
              No solved community problems in the selected ward jurisdiction.
            </div>
          ) : (
            <table className="w-full border border-slate-300 text-[10px] border-collapse bg-white">
              <thead className="bg-slate-200 text-slate-900 font-bold border-b border-slate-300 uppercase text-[9px]">
                <tr>
                  <th className="p-1.5 border-r border-slate-300 text-center w-7">#</th>
                  <th className="p-1.5 border-r border-slate-300 text-left w-24">Issue Ref / Ward</th>
                  <th className="p-1.5 border-r border-slate-300 text-left">Grievance / Problem Title</th>
                  <th className="p-1.5 border-r border-slate-300 text-left">Action Taken / Work Done on Ground</th>
                  <th className="p-1.5 border-r border-slate-300 text-left w-28">Officer / Department</th>
                  <th className="p-1.5 border-r border-slate-300 text-right w-20">Cost (₹)</th>
                  <th className="p-1.5 text-center w-20">Solved Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {solvedProblems.map((p, idx) => (
                  <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-slate-600">
                      {idx + 1}
                    </td>
                    <td className="p-1.5 border-r border-slate-300 font-mono text-[9px]">
                      <strong className="text-slate-900 block">{p.id}</strong>
                      <span className="text-slate-600 font-sans block">{getWardLabel(p.wardId)}</span>
                      <span className="text-[8.5px] text-slate-500">{getVillageName(p.villageId)}</span>
                    </td>
                    <td className="p-1.5 border-r border-slate-300 font-bold text-slate-950">
                      <div>{p.title}</div>
                      <span className="inline-block mt-0.5 text-[8.5px] bg-slate-200 px-1 py-0.2 rounded text-slate-700 font-normal">
                        {p.category}
                      </span>
                      {p.estimatedBeneficiaries && (
                        <span className="text-[8.5px] text-blue-900 font-semibold block mt-0.5">
                          Beneficiaries: ~{p.estimatedBeneficiaries} citizens
                        </span>
                      )}
                    </td>
                    <td className="p-1.5 border-r border-slate-300 text-slate-900">
                      <div className="font-semibold text-emerald-950 bg-emerald-50/60 p-1 rounded border border-emerald-200 text-[9.5px]">
                        <strong>Work Done:</strong> {p.actionTaken || p.latestAction || p.description}
                      </div>
                      {p.resolutionNotes && (
                        <div className="text-[9px] text-slate-600 mt-1">
                          <em>Note:</em> {p.resolutionNotes}
                        </div>
                      )}
                      {p.resolutionProof && (
                        <div className="text-[8.5px] text-slate-500 mt-0.5 font-mono">
                          Proof: {p.resolutionProof}
                        </div>
                      )}
                    </td>
                    <td className="p-1.5 border-r border-slate-300 text-slate-800 text-[9px]">
                      <div className="font-bold">{p.resolvedBy || p.reportedBy}</div>
                      <div className="text-slate-600 text-[8.5px]">{p.officialDepartment || 'Gram Panchayat'}</div>
                    </td>
                    <td className="p-1.5 border-r border-slate-300 text-right font-mono font-bold text-slate-900">
                      {p.expenditureRs ? `₹${p.expenditureRs.toLocaleString('en-IN')}` : 'Govt S&M'}
                    </td>
                    <td className="p-1.5 text-center text-slate-800 text-[9px] font-bold">
                      <div className="text-emerald-900">{p.resolvedDate || p.reportedDate}</div>
                      <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded uppercase">
                        SOLVED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. SECTION 2: DEVELOPMENT & INFRASTRUCTURE WORKS DONE    */}
      {/* ======================================================== */}
      {includeDevWorks && (
        <div className="mb-4 print-avoid-break">
          <div className="bg-slate-900 text-white font-bold px-2.5 py-1 text-[11px] uppercase tracking-wider flex items-center justify-between rounded-t">
            <span>Section 2: Public Infrastructure & Development Projects Handed Over ({completedDevWorks.length} Projects)</span>
            <span className="text-[9.5px] font-normal text-emerald-300">100% Physical Execution</span>
          </div>

          {completedDevWorks.length === 0 ? (
            <div className="border border-slate-300 border-t-0 p-3 text-center text-slate-500 italic bg-white">
              No completed development projects in the selected ward jurisdiction.
            </div>
          ) : (
            <table className="w-full border border-slate-300 text-[10px] border-collapse bg-white">
              <thead className="bg-slate-200 text-slate-900 font-bold border-b border-slate-300 uppercase text-[9px]">
                <tr>
                  <th className="p-1.5 border-r border-slate-300 text-center w-7">#</th>
                  <th className="p-1.5 border-r border-slate-300 text-left w-24">Work ID / Ward</th>
                  <th className="p-1.5 border-r border-slate-300 text-left">Project Name & Scheme Source</th>
                  <th className="p-1.5 border-r border-slate-300 text-left">Scope Completed / Work Done</th>
                  <th className="p-1.5 border-r border-slate-300 text-right w-24">Sanctioned / Exp (₹)</th>
                  <th className="p-1.5 border-r border-slate-300 text-left w-28">Supervising Engineer</th>
                  <th className="p-1.5 text-center w-20">Completion Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {completedDevWorks.map((dw, idx) => (
                  <tr key={dw.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-slate-600">
                      {idx + 1}
                    </td>
                    <td className="p-1.5 border-r border-slate-300 font-mono text-[9px]">
                      <strong className="text-slate-900 block">{dw.id}</strong>
                      <span className="text-slate-600 font-sans block">{getWardLabel(dw.wardId)}</span>
                      <span className="text-[8.5px] text-slate-500">{getVillageName(dw.villageId)}</span>
                    </td>
                    <td className="p-1.5 border-r border-slate-300 font-bold text-slate-950">
                      <div>{dw.title}</div>
                      <span className="inline-block mt-0.5 text-[8.5px] bg-blue-100 text-blue-950 px-1 py-0.2 rounded font-semibold">
                        Scheme: {dw.schemeSource}
                      </span>
                      {dw.contractorName && (
                        <div className="text-[8.5px] text-slate-500 font-normal mt-0.5">
                          Agency: {dw.contractorName}
                        </div>
                      )}
                    </td>
                    <td className="p-1.5 border-r border-slate-300 text-slate-900">
                      <div className="font-semibold text-emerald-950 bg-emerald-50/60 p-1 rounded border border-emerald-200 text-[9.5px]">
                        <strong>Completed Scope:</strong> {dw.actionTaken || dw.description}
                      </div>
                      {dw.completionNotes && (
                        <div className="text-[9px] text-slate-600 mt-1">
                          <em>Quality:</em> {dw.completionNotes}
                        </div>
                      )}
                      {dw.completionCertificateNo && (
                        <div className="text-[8.5px] text-slate-500 font-mono mt-0.5">
                          MB Ref: {dw.completionCertificateNo}
                        </div>
                      )}
                    </td>
                    <td className="p-1.5 border-r border-slate-300 text-right font-mono text-[9.5px]">
                      <div className="text-slate-600">Sanc: ₹{dw.sanctionedAmountRs.toLocaleString('en-IN')}</div>
                      <strong className="text-emerald-950 block font-bold">
                        Exp: ₹{(dw.actualExpenditureRs || dw.budgetRs).toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td className="p-1.5 border-r border-slate-300 text-slate-800 text-[9px]">
                      <div className="font-bold">{dw.supervisingEngineer || 'Panchayat Junior Engineer'}</div>
                      <div className="text-slate-600 text-[8.5px]">Pipili Block PWD Unit</div>
                    </td>
                    <td className="p-1.5 text-center text-slate-800 text-[9px] font-bold">
                      <div className="text-emerald-900">{dw.actualCompletionDate || dw.targetCompletionDate || 'Completed'}</div>
                      <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded uppercase">
                        100% DONE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. SECTION 3: CITIZEN TICKETS & DIRECT ASSISTANCE DELIVERED */}
      {/* ======================================================== */}
      {(includeTickets || includeAssistance) && (
        <div className="mb-4 print-avoid-break">
          <div className="bg-slate-900 text-white font-bold px-2.5 py-1 text-[11px] uppercase tracking-wider flex items-center justify-between rounded-t">
            <span>Section 3: Public Grievance Tickets & Direct Citizen Assistance Resolved ({resolvedTickets.length + completedAssistance.length} Beneficiaries)</span>
            <span className="text-[9.5px] font-normal text-emerald-300">Direct Citizen Delivery</span>
          </div>

          {(resolvedTickets.length === 0 && completedAssistance.length === 0) ? (
            <div className="border border-slate-300 border-t-0 p-3 text-center text-slate-500 italic bg-white">
              No resolved tickets or direct assistance in the selected ward jurisdiction.
            </div>
          ) : (
            <table className="w-full border border-slate-300 text-[10px] border-collapse bg-white">
              <thead className="bg-slate-200 text-slate-900 font-bold border-b border-slate-300 uppercase text-[9px]">
                <tr>
                  <th className="p-1.5 border-r border-slate-300 text-center w-7">#</th>
                  <th className="p-1.5 border-r border-slate-300 text-left w-24">Ref / Ward</th>
                  <th className="p-1.5 border-r border-slate-300 text-left">Citizen / Beneficiary Name</th>
                  <th className="p-1.5 border-r border-slate-300 text-left">Grievance &amp; Work Done for Citizen</th>
                  <th className="p-1.5 border-r border-slate-300 text-right w-24">Benefit Value (₹)</th>
                  <th className="p-1.5 border-r border-slate-300 text-left w-24">In-Charge</th>
                  <th className="p-1.5 text-center w-20">Resolved Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {/* Resolved Tickets */}
                {resolvedTickets.map((t, idx) => (
                  <tr key={t.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-slate-600">
                      {idx + 1}
                    </td>
                    <td className="p-1.5 border-r border-slate-300 font-mono text-[9px]">
                      <strong className="text-slate-900 block">{t.id}</strong>
                      <span className="text-slate-600 font-sans block">{getWardLabel(t.wardId)}</span>
                      <span className="text-[8px] bg-purple-100 text-purple-900 font-bold px-1 rounded">TICKET</span>
                    </td>
                    <td className="p-1.5 border-r border-slate-300 font-bold text-slate-950">
                      <div>{t.reportedBy || t.familyId || 'Household Citizen'}</div>
                      <span className="text-[8.5px] text-slate-600 font-mono block">ID: {t.familyId || 'Ward Resident'}</span>
                      <span className="text-[8.5px] text-slate-500">{t.category}</span>
                    </td>
                    <td className="p-1.5 border-r border-slate-300 text-slate-900">
                      <div className="font-bold text-slate-950">{t.title}</div>
                      <div className="font-semibold text-emerald-950 bg-emerald-50/60 p-1 rounded border border-emerald-200 text-[9px] mt-0.5">
                        <strong>Action Taken:</strong> {t.actionTaken || t.description}
                      </div>
                      {t.resolutionNotes && (
                        <div className="text-[8.5px] text-slate-600 mt-0.5">
                          <em>Outcome:</em> {t.resolutionNotes}
                        </div>
                      )}
                      {t.resolutionProof && (
                        <div className="text-[8px] text-slate-500 font-mono">
                          Receipt: {t.resolutionProof}
                        </div>
                      )}
                    </td>
                    <td className="p-1.5 border-r border-slate-300 text-right font-mono font-bold text-slate-900">
                      {t.financialBenefitRs ? `₹${t.financialBenefitRs.toLocaleString('en-IN')}` : 'Service Aid'}
                    </td>
                    <td className="p-1.5 border-r border-slate-300 text-slate-800 text-[9px]">
                      {t.resolvedBy || t.assignedTo || 'Social Worker'}
                    </td>
                    <td className="p-1.5 text-center text-slate-800 text-[9px] font-bold">
                      <div className="text-emerald-900">{t.resolvedDate || t.targetDate}</div>
                      <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded uppercase">
                        RESOLVED
                      </span>
                    </td>
                  </tr>
                ))}

                {/* Completed Assistance */}
                {completedAssistance.map((a, idx) => (
                  <tr key={a.id} className={(resolvedTickets.length + idx) % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-slate-600">
                      {resolvedTickets.length + idx + 1}
                    </td>
                    <td className="p-1.5 border-r border-slate-300 font-mono text-[9px]">
                      <strong className="text-slate-900 block">{a.id}</strong>
                      <span className="text-slate-600 font-sans block">{getWardLabel(a.wardId)}</span>
                      <span className="text-[8px] bg-blue-100 text-blue-900 font-bold px-1 rounded">AID / SCHEME</span>
                    </td>
                    <td className="p-1.5 border-r border-slate-300 font-bold text-slate-950">
                      <div>{a.beneficiaryName}</div>
                      <span className="text-[8.5px] text-slate-600 font-mono block">({a.familyId})</span>
                    </td>
                    <td className="p-1.5 border-r border-slate-300 text-slate-900">
                      <div className="font-bold text-slate-950">{a.schemeName || a.description || 'Citizen Assistance'}</div>
                      <div className="font-semibold text-emerald-950 bg-emerald-50/60 p-1 rounded border border-emerald-200 text-[9px] mt-0.5">
                        <strong>Work Done:</strong> {a.actionTaken || a.note || a.description}
                      </div>
                      {a.outcome && (
                        <div className="text-[8.5px] text-slate-600 mt-0.5">
                          <em>Outcome:</em> {a.outcome}
                        </div>
                      )}
                    </td>
                    <td className="p-1.5 border-r border-slate-300 text-right font-mono font-bold text-slate-900">
                      {a.financialValueRs ? `₹${a.financialValueRs.toLocaleString('en-IN')}` : 'Direct Benefit'}
                    </td>
                    <td className="p-1.5 border-r border-slate-300 text-slate-800 text-[9px]">
                      {a.resolvedBy || 'Field Admin'}
                    </td>
                    <td className="p-1.5 text-center text-slate-800 text-[9px] font-bold">
                      <div className="text-emerald-900">{a.completionDate || a.date}</div>
                      <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded uppercase">
                        DONE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. STATUTORY VERIFICATION & SIGNATURES BLOCK             */}
      {/* ======================================================== */}
      {includeSignatures && (
        <div className="border border-slate-400 bg-slate-50 p-3 rounded mt-4 print-avoid-break">
          <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-800 text-center mb-2 pb-1 border-b border-slate-300">
            Statutory Field Verification &amp; Official Certification Seal
          </div>

          <p className="text-[9.5px] text-slate-600 text-justify mb-8 leading-snug">
            We, the undersigned elected public representatives and administrative officers of <strong>{panchayat?.name || 'Kalyanpur'} Gram Panchayat</strong>, do hereby certify that all works done, grievances solved, infrastructure assets created, and citizen services rendered as listed in this Action Taken Report have been executed in full compliance with Panchayati Raj norms, verified through spot inquiry, and recorded in the permanent Gram Panchayat registers.
          </p>

          <div className="grid grid-cols-3 gap-6 text-center text-[10px]">
            {/* Signature 1 */}
            <div className="flex flex-col items-center">
              <div className="h-10 border-b border-dashed border-slate-500 w-full mb-1"></div>
              <strong className="text-slate-950 font-bold block">
                {selectedWard?.wardMemberName || 'Sri Kailash Chandra Sahoo'}
              </strong>
              <span className="text-slate-600 text-[9px] block">
                Ward Member {selectedWard ? `(Ward ${selectedWard.wardNumber})` : '(Executive Representative)'}
              </span>
              <span className="text-[8px] text-slate-500">Seal &amp; Signature</span>
            </div>

            {/* Signature 2 */}
            <div className="flex flex-col items-center">
              <div className="h-10 border-b border-dashed border-slate-500 w-full mb-1"></div>
              <strong className="text-slate-950 font-bold block">
                Panchayat Executive Officer (PEO)
              </strong>
              <span className="text-slate-600 text-[9px] block">
                {panchayat?.name || 'Kalyanpur'} Gram Panchayat
              </span>
              <span className="text-[8px] text-slate-500">Government Attestation Stamp</span>
            </div>

            {/* Signature 3 */}
            <div className="flex flex-col items-center">
              <div className="h-10 border-b border-dashed border-slate-500 w-full mb-1"></div>
              <strong className="text-slate-950 font-bold block">
                {panchayat?.sarpanchName || 'Smt. Pravasini Behera'}
              </strong>
              <span className="text-slate-600 text-[9px] block">
                Sarpanch / Head of Panchayat
              </span>
              <span className="text-[8px] text-slate-500">Official Panchayat Seal</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-[8.5px] text-slate-500 flex justify-between items-center mt-4 pt-2 border-t border-slate-300">
        <div>
          Official Record: Gram Panchayat Field Operation Database | Pipili Block, Puri District
        </div>
        <div>
          Form GP-ATR-03 | Page 1 of 1 | Printed: {currentDate}
        </div>
      </div>
    </div>
  );
};
