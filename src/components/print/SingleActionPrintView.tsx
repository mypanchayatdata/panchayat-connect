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

export interface SingleActionItem {
  type: 'problem' | 'ticket' | 'devwork' | 'assistance';
  data: CommunityProblem | FollowUpTicket | DevelopmentWork | PersonalAssistance;
}

interface SingleActionPrintViewProps {
  panchayat: Panchayat;
  villages: Village[];
  wards: Ward[];
  actionItem: SingleActionItem;
}

export const SingleActionPrintView: React.FC<SingleActionPrintViewProps> = ({
  panchayat,
  villages,
  wards,
  actionItem
}) => {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const getWard = (wardId?: string) => wards.find(w => w.id === wardId);
  const getVillage = (villageId?: string) => villages.find(v => v.id === villageId);

  // Extract common fields based on item type
  let id = '';
  let title = '';
  let category = '';
  let wardId = '';
  let villageId = '';
  let reportedDate = '';
  let solvedDate = '';
  let reportedBy = '';
  let solvedBy = '';
  let actionTaken = '';
  let notes = '';
  let expenditure = 0;
  let beneficiaries = '';
  let proof = '';
  let itemTypeLabel = '';

  if (actionItem.type === 'problem') {
    const p = actionItem.data as CommunityProblem;
    id = p.id;
    title = p.title;
    category = p.category;
    wardId = p.wardId;
    villageId = p.villageId;
    reportedDate = p.reportedDate;
    solvedDate = p.resolvedDate || p.reportedDate;
    reportedBy = p.reportedBy + (p.contactNumber ? ` (${p.contactNumber})` : '');
    solvedBy = p.resolvedBy || p.officialDepartment || 'Gram Panchayat';
    actionTaken = p.actionTaken || p.latestAction || p.description;
    notes = p.resolutionNotes || p.description;
    expenditure = p.expenditureRs || 0;
    beneficiaries = p.estimatedBeneficiaries ? `~${p.estimatedBeneficiaries} Residents` : 'Local Community';
    proof = p.resolutionProof || 'Spot inspection verified by Ward Member';
    itemTypeLabel = 'COMMUNITY GRIEVANCE RESOLUTION';
  } else if (actionItem.type === 'ticket') {
    const t = actionItem.data as FollowUpTicket;
    id = t.id;
    title = t.title;
    category = t.category;
    wardId = t.wardId || '';
    villageId = t.villageId || '';
    reportedDate = t.createdDate;
    solvedDate = t.resolvedDate || t.targetDate;
    reportedBy = t.reportedBy || t.familyId || 'Ward Resident';
    solvedBy = t.resolvedBy || t.assignedTo || 'Social Worker';
    actionTaken = t.actionTaken || t.description;
    notes = t.resolutionNotes || t.notes || '';
    expenditure = t.financialBenefitRs || 0;
    beneficiaries = 'Individual Family Beneficiary';
    proof = t.resolutionProof || 'Beneficiary voucher verified';
    itemTypeLabel = 'CITIZEN GRIEVANCE / SERVICE TICKET';
  } else if (actionItem.type === 'devwork') {
    const dw = actionItem.data as DevelopmentWork;
    id = dw.id;
    title = dw.title;
    category = dw.schemeSource;
    wardId = dw.wardId;
    villageId = dw.villageId;
    reportedDate = dw.startDate || '—';
    solvedDate = dw.actualCompletionDate || dw.targetCompletionDate || 'Completed';
    reportedBy = `Supervising Engineer: ${dw.supervisingEngineer || 'Panchayat JE'}`;
    solvedBy = dw.completedBy || dw.contractorName || 'Panchayat Agency';
    actionTaken = dw.actionTaken || dw.description;
    notes = dw.completionNotes || dw.description;
    expenditure = dw.actualExpenditureRs || dw.budgetRs;
    beneficiaries = 'Public Ward Community';
    proof = dw.completionCertificateNo || 'Measurement Book (MB) Entry Verified';
    itemTypeLabel = 'INFRASTRUCTURE DEVELOPMENT WORK';
  } else if (actionItem.type === 'assistance') {
    const a = actionItem.data as PersonalAssistance;
    id = a.id;
    title = a.schemeName || a.description || 'Citizen Welfare Assistance';
    category = String(a.assistanceType);
    wardId = a.wardId || '';
    villageId = a.villageId || '';
    reportedDate = a.date;
    solvedDate = a.completionDate || a.date;
    reportedBy = a.beneficiaryName || a.familyId;
    solvedBy = a.resolvedBy || 'Field Admin / Social Worker';
    actionTaken = a.actionTaken || a.note || a.description || '';
    notes = a.outcome || a.note || '';
    expenditure = a.financialValueRs || 0;
    beneficiaries = 'Direct Household Citizen';
    proof = 'Direct Service Handover Document';
    itemTypeLabel = 'DIRECT WELFARE ASSISTANCE';
  }

  const ward = getWard(wardId);
  const village = getVillage(villageId);

  return (
    <div id="single-action-slip-print" className="bg-white text-slate-900 text-xs leading-relaxed max-w-[210mm] mx-auto p-4 sm:p-6 print:p-0 print:max-w-none">
      {/* Header */}
      <div className="border-b-2 border-slate-900 pb-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 border-2 border-slate-800 rounded-full flex flex-col items-center justify-center p-1 bg-slate-50 text-center">
              <span className="text-base font-black leading-none">🏛️</span>
              <span className="text-[7px] font-black uppercase text-slate-800 mt-0.5">GP SEAL</span>
            </div>
            <div>
              <div className="text-[9px] font-bold text-slate-600 uppercase">
                Panchayati Raj &amp; Drinking Water Department, Govt of Odisha
              </div>
              <h1 className="text-lg font-black tracking-tight text-slate-950 uppercase leading-none mt-0.5">
                {panchayat?.name || 'Kalyanpur'} Gram Panchayat
              </h1>
              <div className="text-[10px] text-slate-700 mt-0.5">
                Block: <strong>{panchayat?.block || 'Pipili'}</strong> | District: <strong>{panchayat?.district || 'Puri'}</strong>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block bg-slate-900 text-white font-bold text-[9px] px-2 py-0.5 rounded uppercase mb-1">
              FORM GP-RES-01
            </span>
            <div className="font-mono text-[10px] font-bold text-slate-800">SLIP #{id}</div>
            <div className="text-[9px] text-slate-600">Date: {currentDate}</div>
          </div>
        </div>

        <div className="mt-2.5 bg-emerald-900 text-white py-1.5 px-3 rounded flex items-center justify-between">
          <span className="font-black text-xs uppercase tracking-wide">
            CERTIFICATE OF WORK DONE &amp; GRIEVANCE RESOLUTION
          </span>
          <span className="text-[9px] font-bold text-emerald-200 bg-emerald-950/80 px-2 py-0.5 rounded uppercase">
            {itemTypeLabel}
          </span>
        </div>
      </div>

      {/* Case Details Bar */}
      <div className="bg-slate-100 border border-slate-300 rounded p-3 mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <div>
            <span className="text-slate-500 font-bold block text-[9.5px] uppercase">Record Ref ID:</span>
            <strong className="font-mono text-slate-950">{id}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-bold block text-[9.5px] uppercase">Ward / Village:</span>
            <strong className="text-slate-950">
              {ward ? `Ward ${ward.wardNumber}` : 'Ward'} ({village?.name || 'Village'})
            </strong>
          </div>
          <div>
            <span className="text-slate-500 font-bold block text-[9.5px] uppercase">Date Reported:</span>
            <strong className="text-slate-950">{reportedDate}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-bold block text-[9.5px] uppercase">Date Solved:</span>
            <strong className="text-emerald-900 font-black">{solvedDate}</strong>
          </div>
        </div>
      </div>

      {/* Section 1: Item Particulars */}
      <div className="border border-slate-300 rounded mb-4 overflow-hidden">
        <div className="bg-slate-800 text-white font-bold px-3 py-1 text-[10.5px] uppercase">
          1. Issue / Project Description &amp; Beneficiaries
        </div>
        <div className="p-3 bg-white space-y-2">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Subject / Title:</span>
            <span className="text-sm font-black text-slate-950 block">{title}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-[10.5px]">
            <div>
              <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Category / Scheme:</span>
              <span className="font-semibold text-slate-800">{category}</span>
            </div>
            <div>
              <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Target Beneficiaries:</span>
              <span className="font-semibold text-blue-900">{beneficiaries}</span>
            </div>
            <div>
              <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Reported By / Applicant:</span>
              <span className="font-semibold text-slate-800">{reportedBy}</span>
            </div>
            <div>
              <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Status Verification:</span>
              <span className="inline-block bg-emerald-100 text-emerald-900 font-black text-[9.5px] px-2 py-0.5 rounded border border-emerald-300">
                ✅ COMPLETED &amp; RESOLVED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Action Taken & Work Done */}
      <div className="border border-emerald-400 bg-emerald-50/40 rounded mb-4 overflow-hidden">
        <div className="bg-emerald-900 text-white font-bold px-3 py-1 text-[10.5px] uppercase flex justify-between items-center">
          <span>2. Action Taken &amp; Physical Work Executed on Ground</span>
          <span className="text-[9px] text-emerald-200 font-normal">Ground Proof</span>
        </div>
        <div className="p-3 bg-white space-y-2.5">
          <div>
            <span className="text-[10px] font-bold text-emerald-900 uppercase block mb-1">
              Detailed Work Done Description:
            </span>
            <div className="bg-emerald-50/60 p-2.5 rounded border border-emerald-200 text-slate-900 text-[11px] leading-relaxed font-medium">
              {actionTaken}
            </div>
          </div>

          {notes && (
            <div>
              <span className="text-[10px] font-bold text-slate-600 uppercase block">Resolution Notes / Outcome:</span>
              <div className="text-[10.5px] text-slate-700 italic bg-slate-50 p-2 rounded border border-slate-200">
                "{notes}"
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-[10px]">
            <div>
              <span className="text-slate-500 font-bold uppercase block text-[9px]">Officer / Agency In-Charge:</span>
              <strong className="text-slate-900">{solvedBy}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase block text-[9px]">Public Cost / Benefit Value:</span>
              <strong className="text-emerald-900 font-mono text-xs">
                {expenditure > 0 ? `₹${expenditure.toLocaleString('en-IN')}` : 'Public Service'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase block text-[9px]">Official Verification Proof:</span>
              <strong className="text-slate-800 font-mono text-[9.5px]">{proof}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Citizen Handover & Acknowledgment */}
      <div className="border border-slate-300 rounded mb-4 p-3 bg-slate-50">
        <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
          3. Citizen / Local Resident Acknowledgment
        </div>
        <p className="text-[10px] text-slate-600 text-justify mb-4">
          I/We hereby confirm that the aforesaid work/repair has been satisfactorily completed in our area, and the grievance has been successfully addressed to our full satisfaction.
        </p>
        <div className="flex justify-between items-end text-[10px] pt-4">
          <div className="text-slate-600">
            <div>Beneficiary / Citizen Name: _______________________</div>
            <div className="text-[9px] text-slate-500 mt-1">Contact No: _______________________</div>
          </div>
          <div className="text-center">
            <div className="h-6 border-b border-dashed border-slate-400 w-40 mb-1"></div>
            <span className="text-[9px] text-slate-700 font-semibold">Citizen Signature / Thumb Impression</span>
          </div>
        </div>
      </div>

      {/* Section 4: Signatures & Panchayat Seal */}
      <div className="border border-slate-400 bg-white p-3 rounded">
        <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-800 text-center mb-2 pb-1 border-b border-slate-300">
          Official Attestation &amp; Sign-off
        </div>
        <div className="grid grid-cols-3 gap-6 text-center text-[10px] mt-4">
          <div>
            <div className="h-8 border-b border-dashed border-slate-400 mb-1"></div>
            <strong className="text-slate-950 block">{ward?.wardMemberName || 'Ward Member'}</strong>
            <span className="text-[8.5px] text-slate-500">Elected Ward Member</span>
          </div>
          <div>
            <div className="h-8 border-b border-dashed border-slate-400 mb-1"></div>
            <strong className="text-slate-950 block">Panchayat Executive Officer</strong>
            <span className="text-[8.5px] text-slate-500">{panchayat?.name || 'Kalyanpur'} GP</span>
          </div>
          <div>
            <div className="h-8 border-b border-dashed border-slate-400 mb-1"></div>
            <strong className="text-slate-950 block">{panchayat?.sarpanchName || 'Sarpanch'}</strong>
            <span className="text-[8.5px] text-slate-500">Sarpanch (Panchayat Seal)</span>
          </div>
        </div>
      </div>

      <div className="text-[8px] text-slate-500 flex justify-between items-center mt-3">
        <span>Form GP-RES-01 | Gram Panchayat Governance Information System</span>
        <span>Generated: {currentDate}</span>
      </div>
    </div>
  );
};
