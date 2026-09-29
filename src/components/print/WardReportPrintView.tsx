import React from 'react';
import {
  Ward,
  Village,
  Panchayat,
  Family,
  FamilyMember,
  PersonalAssistance,
  DevelopmentWork,
  CommunityProblem,
  KeyPerson,
  SchemeApplication
} from '../../types';

interface WardReportPrintViewProps {
  ward: Ward;
  village?: Village;
  panchayat: Panchayat;
  families: Family[];
  members: FamilyMember[];
  assistance?: PersonalAssistance[];
  devWorks?: DevelopmentWork[];
  problems?: CommunityProblem[];
  keyPeople?: KeyPerson[];
  schemes?: SchemeApplication[];
  includeVoterCategory?: boolean;
  includeAssistance?: boolean;
  includeFamiliesList?: boolean;
  includeSignatures?: boolean;
}

export const WardReportPrintView: React.FC<WardReportPrintViewProps> = ({
  ward,
  village,
  panchayat,
  families = [],
  members = [],
  assistance = [],
  devWorks = [],
  problems = [],
  keyPeople = [],
  schemes = [],
  includeVoterCategory = true,
  includeAssistance = true,
  includeFamiliesList = true,
  includeSignatures = true
}) => {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Demographics
  const totalFamilies = families.length;
  const totalMembers = members.length;
  const maleCount = members.filter(m => m.gender === 'Male').length;
  const femaleCount = members.filter(m => m.gender === 'Female').length;
  const childrenCount = members.filter(m => m.age < 18).length;

  const voters = members.filter(m => m.isVoter && m.voterStatus !== 'NO');
  const greenVoters = voters.filter(m => m.voterCategory === 'GREEN' || !m.voterCategory).length;
  const yellowVoters = voters.filter(m => m.voterCategory === 'YELLOW').length;
  const redVoters = voters.filter(m => m.voterCategory === 'RED').length;
  const notVerifiedVoters = members.filter(m => m.voterStatus === 'NOT VERIFIED').length;

  // Economics
  const wellEco = families.filter(f => f.economicStatus === 1).length;
  const moderateEco = families.filter(f => f.economicStatus === 2).length;
  const lowEco = families.filter(f => f.economicStatus === 3).length;
  const govtJobFamilies = families.filter(f => {
    const fMems = members.filter(m => m.familyId === f.id);
    return fMems.some(m => m.hasGovernmentJob);
  }).length;

  return (
    <div className="bg-white text-slate-900 font-sans p-6 sm:p-8 max-w-[210mm] mx-auto print:p-0 print:max-w-none text-xs leading-relaxed">
      {/* ======================================================== */}
      {/* 1. OFFICIAL GOVERNMENT / PANCHAYAT LETTERHEAD HEADER     */}
      {/* ======================================================== */}
      <div className="border-b-2 border-slate-900 pb-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="w-14 h-14 flex items-center justify-center border border-slate-800 rounded-lg p-1 bg-slate-50 shrink-0">
            <span className="text-3xl select-none" role="img" aria-label="National Emblem">🏛️</span>
          </div>

          <div className="text-center flex-1 px-3">
            <div className="text-[10px] font-bold tracking-widest text-slate-700 uppercase">
              Government of Odisha • Department of Panchayati Raj & Drinking Water
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-950 uppercase tracking-tight">
              {panchayat.name.toUpperCase()} GRAM PANCHAYAT
            </h1>
            <div className="text-[11px] font-semibold text-slate-800">
              Ward Administration, Electoral Matrix & Field Governance Dossier (Form GP-WD-02)
            </div>
            <div className="text-[10px] font-medium text-slate-600">
              Block: <span className="font-bold">{panchayat.block}</span> | District: <span className="font-bold">{panchayat.district}</span> | AC: <span className="font-bold">{panchayat.assemblyConstituency}</span>
            </div>
          </div>

          <div className="w-24 text-right shrink-0">
            <div className="text-[9px] text-slate-600 font-bold uppercase">Ward Code:</div>
            <div className="font-mono text-[10.5px] font-bold text-slate-900">{ward.id}</div>
            <div className="text-[9px] text-slate-500 mt-0.5">{currentDate}</div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. WARD PROFILE & GOVERNANCE BAR                         */}
      {/* ======================================================== */}
      <div className="bg-slate-100 border border-slate-300 rounded px-3.5 py-2 mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <div>
            <span className="text-slate-600 font-medium block text-[10px] uppercase">Ward Jurisdiction:</span>
            <strong className="text-slate-950 text-sm">Ward No. {ward.wardNumber}</strong>
          </div>
          <div>
            <span className="text-slate-600 font-medium block text-[10px] uppercase">Village:</span>
            <strong className="text-slate-950">{village?.name || 'Village'} ({village?.code || ''})</strong>
          </div>
          <div>
            <span className="text-slate-600 font-medium block text-[10px] uppercase">Elected Ward Member:</span>
            <strong className="text-slate-950">{ward.wardMemberName}</strong>
          </div>
          <div>
            <span className="text-slate-600 font-medium block text-[10px] uppercase">Contact Phone:</span>
            <strong className="font-mono text-slate-950">{ward.contactNumber || 'N/A'}</strong>
          </div>
        </div>
        {ward.areaDescription && (
          <div className="mt-1.5 pt-1.5 border-t border-slate-200 text-[10.5px] text-slate-700">
            <span className="font-bold text-slate-900">Area Boundaries / Landmarks:</span> {ward.areaDescription}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. SECTION 1: DEMOGRAPHICS & POPULATION MATRIX           */}
      {/* ======================================================== */}
      <div className="mb-4 print-avoid-break">
        <div className="bg-slate-900 text-white font-bold px-2.5 py-1 text-[11px] uppercase tracking-wider flex items-center justify-between rounded-t">
          <span>Section 1: Ward Demographics & Socio-Economic Census Summary</span>
          <span className="text-[10px] font-normal text-slate-300">Official Field Statistics</span>
        </div>

        <div className="border border-slate-300 border-t-0 p-3 bg-white">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[9px] font-bold text-slate-500 uppercase block">Total Households</span>
              <strong className="text-base font-black text-slate-950 block">{totalFamilies}</strong>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[9px] font-bold text-slate-500 uppercase block">Total Population</span>
              <strong className="text-base font-black text-slate-950 block">{totalMembers}</strong>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[9px] font-bold text-slate-500 uppercase block">Male</span>
              <strong className="text-base font-bold text-slate-900 block">{maleCount}</strong>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[9px] font-bold text-slate-500 uppercase block">Female</span>
              <strong className="text-base font-bold text-slate-900 block">{femaleCount}</strong>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[9px] font-bold text-slate-500 uppercase block">Children (&lt;18)</span>
              <strong className="text-base font-bold text-slate-900 block">{childrenCount}</strong>
            </div>
            <div className="p-2 bg-blue-50 border border-blue-300 rounded">
              <span className="text-[9px] font-bold text-blue-900 uppercase block">Voters</span>
              <strong className="text-base font-black text-blue-950 block">{voters.length}</strong>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-200 grid grid-cols-4 gap-2 text-center text-[10.5px]">
            <div className="bg-rose-50/70 p-1.5 rounded border border-rose-200">
              <span className="text-rose-900 font-bold block text-[9.5px]">Low Income (BPL):</span>
              <strong className="text-rose-950 text-xs">{lowEco} Households</strong>
            </div>
            <div className="bg-amber-50/70 p-1.5 rounded border border-amber-200">
              <span className="text-amber-900 font-bold block text-[9.5px]">Moderate Income:</span>
              <strong className="text-amber-950 text-xs">{moderateEco} Households</strong>
            </div>
            <div className="bg-blue-50/70 p-1.5 rounded border border-blue-200">
              <span className="text-blue-900 font-bold block text-[9.5px]">Well-off:</span>
              <strong className="text-blue-950 text-xs">{wellEco} Households</strong>
            </div>
            <div className="bg-slate-100 p-1.5 rounded border border-slate-300">
              <span className="text-slate-800 font-bold block text-[9.5px]">Govt Job in Family:</span>
              <strong className="text-slate-950 text-xs">{govtJobFamilies} Households</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. SECTION 2: 🗳️ WARD ELECTORAL & VOTER CATEGORIZATION    */}
      {/* ======================================================== */}
      {includeVoterCategory && (
        <div className="mb-4 print-avoid-break">
          <div className="bg-slate-900 text-white font-bold px-2.5 py-1 text-[11px] uppercase tracking-wider flex items-center justify-between rounded-t">
            <span>Section 2: Ward Voter Categorization & Electoral Roll Analysis</span>
            <span className="text-[10px] font-normal text-slate-300">Confidential Strategy Record</span>
          </div>

          <div className="border border-slate-300 border-t-0 p-3 bg-slate-50/70">
            <div className="grid grid-cols-4 gap-2.5 text-center">
              {/* TOTAL WARD VOTERS */}
              <div className="p-2 bg-white border border-slate-800 rounded">
                <span className="text-[9px] font-bold text-slate-700 uppercase block">Registered Voters</span>
                <span className="text-lg font-black text-slate-950 block mt-0.5">{voters.length}</span>
                <span className="text-[9px] text-slate-600 block">
                  {totalMembers > 0 ? `${Math.round((voters.length / totalMembers) * 100)}% of Ward Population` : '0%'}
                </span>
              </div>

              {/* 🟢 GREEN (Favorable Supporters) */}
              <div className="p-2 bg-emerald-50 border border-emerald-600 rounded">
                <span className="text-[9px] font-black text-emerald-900 uppercase block">🟢 Green Supporters</span>
                <span className="text-lg font-black text-emerald-950 block mt-0.5">{greenVoters}</span>
                <span className="text-[9px] text-emerald-800 font-bold block">
                  {voters.length > 0 ? `${Math.round((greenVoters / voters.length) * 100)}% Favorable Base` : '0%'}
                </span>
              </div>

              {/* 🟡 YELLOW (Moderate / Swing) */}
              <div className="p-2 bg-amber-50 border border-amber-600 rounded">
                <span className="text-[9px] font-black text-amber-900 uppercase block">🟡 Yellow Moderates</span>
                <span className="text-lg font-black text-amber-950 block mt-0.5">{yellowVoters}</span>
                <span className="text-[9px] text-amber-800 font-bold block">
                  {voters.length > 0 ? `${Math.round((yellowVoters / voters.length) * 100)}% Swing Voters` : '0%'}
                </span>
              </div>

              {/* 🔴 RED (Critical / Outreach Needed) */}
              <div className="p-2 bg-rose-50 border border-rose-600 rounded">
                <span className="text-[9px] font-black text-rose-900 uppercase block">🔴 Red Priority</span>
                <span className="text-lg font-black text-rose-950 block mt-0.5">{redVoters}</span>
                <span className="text-[9px] text-rose-800 font-bold block">
                  {voters.length > 0 ? `${Math.round((redVoters / voters.length) * 100)}% Needs Outreach` : '0%'}
                </span>
              </div>
            </div>

            {notVerifiedVoters > 0 && (
              <div className="mt-2 text-[10px] text-amber-900 font-semibold bg-amber-100 p-1.5 rounded border border-amber-300 text-center">
                ⚠️ Verification Note: {notVerifiedVoters} citizen(s) in this ward have unverified voter status requiring booth verification.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. SECTION 3: 🏠 WARD HOUSEHOLD DIRECTORY & NOMINAL ROLL  */}
      {/* ======================================================== */}
      {includeFamiliesList && (
        <div className="mb-4 print-avoid-break">
          <div className="bg-slate-900 text-white font-bold px-2.5 py-1 text-[11px] uppercase tracking-wider flex items-center justify-between rounded-t">
            <span>Section 3: Ward Household Register & Roster ({families.length} Households)</span>
            <span className="text-[10px] font-normal text-slate-300">Census & Voter Record</span>
          </div>

          <table className="w-full border border-slate-300 text-[10px] border-collapse">
            <thead className="bg-slate-200 text-slate-900 font-bold border-b border-slate-300 uppercase text-[9px]">
              <tr>
                <th className="p-1.5 border-r border-slate-300 text-center w-6">#</th>
                <th className="p-1.5 border-r border-slate-300 text-left">Household ID</th>
                <th className="p-1.5 border-r border-slate-300 text-left">Family Head Name</th>
                <th className="p-1.5 border-r border-slate-300 text-left">Contact Mobile</th>
                <th className="p-1.5 border-r border-slate-300 text-center">Eco Status</th>
                <th className="p-1.5 border-r border-slate-300 text-center">Members</th>
                <th className="p-1.5 border-r border-slate-300 text-center">Voters</th>
                {includeVoterCategory && (
                  <th className="p-1.5 border-r border-slate-300 text-center">Head Category</th>
                )}
                <th className="p-1.5 text-left">Govt Job Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {families.map((f, idx) => {
                const fMembers = members.filter(m => m.familyId === f.id);
                const fVoters = fMembers.filter(m => m.isVoter && m.voterStatus !== 'NO');
                const headMember = fMembers.find(m => m.relation === 'Head' || m.name === f.familyHeadName) || fMembers[0];
                const govtMems = fMembers.filter(m => m.hasGovernmentJob);

                const headCat = headMember?.voterCategory || 'GREEN';

                return (
                  <tr key={f.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-slate-600">{idx + 1}</td>
                    <td className="p-1.5 border-r border-slate-300 font-mono font-bold text-slate-900">{f.id}</td>
                    <td className="p-1.5 border-r border-slate-300 font-black text-slate-950">{f.familyHeadName}</td>
                    <td className="p-1.5 border-r border-slate-300 font-mono text-slate-800">{f.primaryMobile || '—'}</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold">
                      {f.economicStatus === 1 ? (
                        <span className="text-blue-900">1 (Well)</span>
                      ) : f.economicStatus === 2 ? (
                        <span className="text-amber-900">2 (Mod)</span>
                      ) : (
                        <span className="text-rose-900 font-bold">3 (Low)</span>
                      )}
                    </td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-slate-900">{fMembers.length}</td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-blue-950">{fVoters.length}</td>
                    {includeVoterCategory && (
                      <td className="p-1.5 border-r border-slate-300 text-center font-bold text-[9px]">
                        {headCat === 'GREEN' ? (
                          <span className="text-emerald-800 bg-emerald-100 px-1 py-0.5 rounded border border-emerald-300">🟢 GREEN</span>
                        ) : headCat === 'YELLOW' ? (
                          <span className="text-amber-800 bg-amber-100 px-1 py-0.5 rounded border border-amber-300">🟡 YELLOW</span>
                        ) : (
                          <span className="text-rose-800 bg-rose-100 px-1 py-0.5 rounded border border-rose-300">🔴 RED</span>
                        )}
                      </td>
                    )}
                    <td className="p-1.5 text-slate-800">
                      {govtMems.length > 0 ? (
                        <span className="text-blue-900 font-bold text-[9.5px]">
                          Yes ({govtMems.map(m => m.name).join(', ')})
                        </span>
                      ) : (
                        <span className="text-slate-400">No</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. SECTION 4: 🤝 WARD DIRECT ASSISTANCE LOG              */}
      {/* ======================================================== */}
      {includeAssistance && (
        <div className="mb-4 print-avoid-break">
          <div className="bg-slate-900 text-white font-bold px-2.5 py-1 text-[11px] uppercase tracking-wider flex items-center justify-between rounded-t">
            <span>Section 4: Direct Citizen Assistance & Scheme Facilitation Log in Ward {ward.wardNumber}</span>
            <span className="text-[10px] font-normal text-slate-300">{assistance.length} Records</span>
          </div>

          {assistance.length === 0 ? (
            <div className="border border-slate-300 border-t-0 p-3 text-center text-slate-500 italic bg-white text-[11px]">
              No direct assistance cases logged for Ward {ward.wardNumber} yet.
            </div>
          ) : (
            <table className="w-full border border-slate-300 text-[10px] border-collapse">
              <thead className="bg-slate-200 text-slate-900 font-bold border-b border-slate-300 uppercase text-[9px]">
                <tr>
                  <th className="p-1.5 border-r border-slate-300 text-left w-16">Type</th>
                  <th className="p-1.5 border-r border-slate-300 text-left">Beneficiary / Family</th>
                  <th className="p-1.5 border-r border-slate-300 text-left">Scheme / Action Item</th>
                  <th className="p-1.5 border-r border-slate-300 text-left">Field Assistance Note / Description</th>
                  <th className="p-1.5 border-r border-slate-300 text-center w-14">Status</th>
                  <th className="p-1.5 text-center w-20">Date / Done</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {assistance.map((a, idx) => {
                  const isScheme = a.assistanceType === 'SCHEME_ASSISTANCE' || a.assistanceType === 'Scheme Assistance' || a.assistanceType === 'Government Scheme Facilitation';
                  const isOther = a.assistanceType === 'OTHER' || a.assistanceType === 'Other';
                  const isPersonal = !isScheme && !isOther;

                  const statusDone = a.status === 'DONE' || a.status === 'Done' || a.status === 'Completed' || a.status === 'Sanctioned';
                  const statusApplied = a.status === 'APPLIED' || a.status === 'Applied' || a.status === 'In Progress';

                  return (
                    <tr key={a.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="p-1.5 border-r border-slate-300 font-bold">
                        {isScheme ? '🏛️ SCHEME' : isPersonal ? '🤝 PERSONAL' : '📦 OTHER'}
                      </td>
                      <td className="p-1.5 border-r border-slate-300 font-bold text-slate-950">
                        {a.beneficiaryName}
                        {a.familyId && <span className="text-[9px] text-slate-500 font-mono block">({a.familyId})</span>}
                      </td>
                      <td className="p-1.5 border-r border-slate-300 text-slate-900">
                        {a.schemeName ? <strong className="text-blue-900 block">{a.schemeName}</strong> : null}
                        {a.description && <span className="text-slate-600 block">{a.description}</span>}
                      </td>
                      <td className="p-1.5 border-r border-slate-300 text-slate-950 font-medium">
                        {a.note ? (
                          <div className="bg-slate-100 p-1 rounded border border-slate-300 text-[9.5px]">
                            "{a.note}"
                          </div>
                        ) : '—'}
                      </td>
                      <td className="p-1.5 border-r border-slate-300 text-center font-black">
                        {statusDone ? (
                          <span className="text-emerald-900 font-bold">DONE</span>
                        ) : statusApplied ? (
                          <span className="text-blue-900 font-bold">APPLIED</span>
                        ) : (
                          <span className="text-amber-900 font-bold">PENDING</span>
                        )}
                      </td>
                      <td className="p-1.5 text-center text-slate-700 text-[9px]">
                        <div>{a.date}</div>
                        {a.completionDate && <div className="text-emerald-800 font-bold">Done: {a.completionDate}</div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. SECTION 5: 🏗️ DEVELOPMENT WORKS & INFRASTRUCTURE       */}
      {/* ======================================================== */}
      {devWorks.length > 0 && (
        <div className="mb-4 print-avoid-break">
          <div className="bg-slate-900 text-white font-bold px-2.5 py-1 text-[11px] uppercase tracking-wider flex items-center justify-between rounded-t">
            <span>Section 5: Public Infrastructure & Development Works in Ward {ward.wardNumber} ({devWorks.length} Projects)</span>
            <span className="text-[10px] font-normal text-slate-300">Sanctioned & Active Works</span>
          </div>

          <table className="w-full border border-slate-300 text-[10px] border-collapse">
            <thead className="bg-slate-200 text-slate-900 font-bold border-b border-slate-300 uppercase text-[9px]">
              <tr>
                <th className="p-1.5 border-r border-slate-300 text-left">Project Title &amp; Scope Completed</th>
                <th className="p-1.5 border-r border-slate-300 text-left">Funding Scheme</th>
                <th className="p-1.5 border-r border-slate-300 text-right">Sanctioned / Exp (₹)</th>
                <th className="p-1.5 border-r border-slate-300 text-center">Status / Completion</th>
                <th className="p-1.5 text-left">Agency &amp; Engineer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {devWorks.map((dw, idx) => (
                <tr key={dw.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="p-1.5 border-r border-slate-300 text-slate-950">
                    <strong className="block text-[10.5px]">{dw.title}</strong>
                    {(dw.actionTaken || dw.description) && (
                      <div className="text-[9px] text-emerald-950 bg-emerald-50/60 p-1 rounded border border-emerald-200 mt-1 font-medium">
                        <strong>Work Done:</strong> {dw.actionTaken || dw.description}
                      </div>
                    )}
                    {dw.completionCertificateNo && (
                      <div className="text-[8px] text-slate-500 font-mono mt-0.5">
                        MB Ref: {dw.completionCertificateNo}
                      </div>
                    )}
                  </td>
                  <td className="p-1.5 border-r border-slate-300 text-slate-700">{dw.schemeSource}</td>
                  <td className="p-1.5 border-r border-slate-300 text-right font-mono font-bold text-slate-900">
                    <div>₹{dw.budgetRs.toLocaleString()}</div>
                    {dw.actualExpenditureRs && (
                      <div className="text-[8.5px] text-emerald-800">
                        Exp: ₹{dw.actualExpenditureRs.toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="p-1.5 border-r border-slate-300 text-center font-bold">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                      dw.status === 'Completed' ? 'text-emerald-900 bg-emerald-100 border border-emerald-300' :
                      dw.status === 'In Progress' ? 'text-blue-900 bg-blue-100 border border-blue-300' : 'text-amber-900 bg-amber-100 border border-amber-300'
                    }`}>
                      {dw.status}
                    </span>
                    {(dw.actualCompletionDate || dw.targetCompletionDate) && (
                      <div className="text-[8.5px] text-slate-600 font-normal mt-0.5">
                        {dw.status === 'Completed' ? `Done: ${dw.actualCompletionDate || dw.targetCompletionDate}` : `Target: ${dw.targetCompletionDate}`}
                      </div>
                    )}
                  </td>
                  <td className="p-1.5 text-slate-700 text-[9px]">
                    <div className="font-semibold text-slate-900">{dw.contractorName || 'Panchayat Agency'}</div>
                    {dw.supervisingEngineer && (
                      <div className="text-[8px] text-slate-500">{dw.supervisingEngineer}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. SECTION 6: ⚠️ COMMUNITY GRIEVANCES & KEY STAKEHOLDERS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 gap-3 mb-4 print-avoid-break">
        {/* Problems */}
        <div>
          <div className="bg-slate-800 text-white font-bold px-2.5 py-1 text-[10px] uppercase rounded-t flex justify-between items-center">
            <span>Community Problems &amp; Grievances ({problems.length})</span>
            <span className="text-[8px] text-emerald-300">Action Status</span>
          </div>
          <table className="w-full border border-slate-300 text-[9.5px] border-collapse bg-white">
            <tbody>
              {problems.length === 0 ? (
                <tr><td className="p-2 text-slate-500 italic">No community problems currently reported</td></tr>
              ) : (
                problems.map(p => (
                  <tr key={p.id} className="border-b border-slate-200">
                    <td className="p-1.5 text-slate-900">
                      <div className="font-bold text-slate-950">{p.title}</div>
                      <div className="text-[8.5px] text-slate-500">{p.category}</div>
                      {(p.actionTaken || p.latestAction) && (
                        <div className="text-[8.5px] text-emerald-950 bg-emerald-50 p-1 rounded border border-emerald-200 mt-0.5">
                          <strong>Action Taken:</strong> {p.actionTaken || p.latestAction}
                        </div>
                      )}
                    </td>
                    <td className="p-1.5 text-right font-bold w-24">
                      <span className={`px-1 py-0.5 rounded text-[8.5px] inline-block ${
                        p.status === 'Completed' 
                          ? 'text-emerald-900 bg-emerald-100 border border-emerald-300' 
                          : 'text-amber-900 bg-amber-100 border border-amber-300'
                      }`}>
                        {p.status}
                      </span>
                      {p.resolvedDate && (
                        <div className="text-[8px] text-slate-500 font-normal mt-0.5">
                          {p.resolvedDate}
                        </div>
                      )}
                      {p.expenditureRs && (
                        <div className="text-[8px] text-slate-700 font-mono">
                          ₹{p.expenditureRs.toLocaleString()}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Key Persons */}
        <div>
          <div className="bg-slate-800 text-white font-bold px-2.5 py-1 text-[10px] uppercase rounded-t">
            Key Ward Stakeholders ({keyPeople.length})
          </div>
          <table className="w-full border border-slate-300 text-[9.5px] border-collapse bg-white">
            <tbody>
              {keyPeople.length === 0 ? (
                <tr><td className="p-2 text-slate-500 italic">No specific key stakeholders mapped</td></tr>
              ) : (
                keyPeople.map(kp => (
                  <tr key={kp.id} className="border-b border-slate-200">
                    <td className="p-1.5 font-bold text-slate-900">{kp.name}</td>
                    <td className="p-1.5 text-slate-700">{kp.category}</td>
                    <td className="p-1.5 text-right font-mono text-slate-600">{kp.phone}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 9. SECTION 7: OFFICIAL SIGN-OFF & PHYSICAL SUBMISSION     */}
      {/* ======================================================== */}
      {includeSignatures && (
        <div className="border border-slate-400 bg-slate-50 p-4 rounded mt-6 print-avoid-break">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-700 text-center mb-6 pb-1 border-b border-slate-300">
            Ward Administrative Certification & Physical Record Submission
          </div>

          <p className="text-[10px] text-slate-600 text-justify mb-8">
            This is to certify that the statistical information, voter categorization, household nominal rolls, public works status, and direct citizen assistance cases recorded above for Ward No. {ward.wardNumber} have been reviewed and verified for official Gram Panchayat physical documentation.
          </p>

          <div className="grid grid-cols-3 gap-6 text-center text-[10px]">
            {/* Ward Member Signature */}
            <div className="flex flex-col justify-end">
              <div className="border-b-2 border-dashed border-slate-500 pb-1 mb-1.5 h-10 flex items-end justify-center">
                <span className="text-[9px] text-slate-400 italic">(Signature & Seal)</span>
              </div>
              <strong className="text-slate-950">{ward.wardMemberName}</strong>
              <span className="text-slate-600 text-[9px]">Elected Ward Member (Ward {ward.wardNumber})</span>
            </div>

            {/* Field Officer Signature */}
            <div className="flex flex-col justify-end">
              <div className="border-b-2 border-dashed border-slate-500 pb-1 mb-1.5 h-10 flex items-end justify-center">
                <span className="text-[9px] text-slate-400 italic">(Signature)</span>
              </div>
              <strong className="text-slate-950">Gram Rozgar Sevak / Field Inspector</strong>
              <span className="text-slate-600 text-[9px]">Field Verification Officer</span>
            </div>

            {/* PEO / Sarpanch Signature */}
            <div className="flex flex-col justify-end">
              <div className="border-b-2 border-dashed border-slate-500 pb-1 mb-1.5 h-10 flex items-end justify-center">
                <span className="text-[9px] text-slate-400 italic">(Official Gram Panchayat Seal)</span>
              </div>
              <strong className="text-slate-950">{panchayat.sarpanchName || panchayat.panchayatExecutiveOfficer}</strong>
              <span className="text-slate-600 text-[9px]">Sarpanch / Panchayat Executive Officer</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer Notice */}
      <div className="mt-4 pt-2 border-t border-slate-300 text-[9px] text-slate-500 flex items-center justify-between">
        <span>{panchayat.name} Gram Panchayat • Ward Administrative & Electoral Performance Dossier</span>
        <span>Page 1 of 1 • Official Field Document</span>
      </div>
    </div>
  );
};
