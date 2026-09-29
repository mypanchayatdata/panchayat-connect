import React from 'react';
import { Family, FamilyMember, Panchayat, Village, Ward, PersonalAssistance, SchemeApplication, FollowUpTicket } from '../../types';

interface FamilyProfilePrintViewProps {
  family: Family;
  members: FamilyMember[];
  village?: Village;
  ward?: Ward;
  panchayat: Panchayat;
  assistance?: PersonalAssistance[];
  schemes?: SchemeApplication[];
  tickets?: FollowUpTicket[];
  includeVoterCategory?: boolean;
  includeAssistance?: boolean;
  includeSignatures?: boolean;
}

export const FamilyProfilePrintView: React.FC<FamilyProfilePrintViewProps> = ({
  family,
  members,
  village,
  ward,
  panchayat,
  assistance = [],
  schemes = [],
  tickets = [],
  includeVoterCategory = true,
  includeAssistance = true,
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

  const voters = members.filter(m => m.isVoter && m.voterStatus !== 'NO');
  const greenVoters = voters.filter(m => m.voterCategory === 'GREEN' || !m.voterCategory).length;
  const yellowVoters = voters.filter(m => m.voterCategory === 'YELLOW').length;
  const redVoters = voters.filter(m => m.voterCategory === 'RED').length;
  const notVerifiedVoters = members.filter(m => m.voterStatus === 'NOT VERIFIED').length;

  const govtJobHolders = members.filter(m => m.hasGovernmentJob);

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
              Block: <span className="font-bold">{panchayat.block}</span> | District: <span className="font-bold">{panchayat.district}</span> | AC: <span className="font-bold">{panchayat.assemblyConstituency}</span>
            </div>
            <div className="text-[10px] font-medium text-slate-600">
              Gram Panchayat Household Register & Field Verification Dossier (Form GP-HR-01)
            </div>
          </div>

          <div className="w-20 text-right shrink-0">
            <div className="text-[9px] text-slate-600 font-bold uppercase">Doc Ref:</div>
            <div className="font-mono text-[10px] font-bold text-slate-900">{family.id}</div>
            <div className="text-[9px] text-slate-500 mt-0.5">{currentDate}</div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. DOCUMENT METADATA BAR                                 */}
      {/* ======================================================== */}
      <div className="bg-slate-100 border border-slate-300 rounded px-3 py-1.5 mb-4 flex flex-wrap items-center justify-between text-[11px]">
        <div>
          <span className="text-slate-600 font-medium">Household ID: </span>
          <strong className="font-mono text-slate-950">{family.id}</strong>
        </div>
        <div>
          <span className="text-slate-600 font-medium">Village: </span>
          <strong className="text-slate-950">{village?.name || 'N/A'} ({village?.code || ''})</strong>
        </div>
        <div>
          <span className="text-slate-600 font-medium">Ward: </span>
          <strong className="text-slate-950">Ward No. {ward?.wardNumber || 'N/A'}</strong>
        </div>
        <div>
          <span className="text-slate-600 font-medium">Printed On: </span>
          <span className="text-slate-950 font-semibold">{currentDate} {currentTime}</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. SECTION A: HOUSEHOLD PARTICULARS                     */}
      {/* ======================================================== */}
      <div className="mb-4 print-avoid-break">
        <div className="bg-slate-900 text-white font-bold px-2.5 py-1 text-[11px] uppercase tracking-wider flex items-center justify-between rounded-t">
          <span>Section A: Household & Socio-Economic Particulars</span>
          <span className="text-[10px] font-normal text-slate-300">Form Ref: GP-HH-SEC-A</span>
        </div>

        <table className="w-full border border-slate-300 text-[11px] border-collapse">
          <tbody>
            <tr className="border-b border-slate-300">
              <td className="w-1/4 bg-slate-50 p-2 font-bold text-slate-700 border-r border-slate-300">Name of Family Head:</td>
              <td className="w-1/4 p-2 font-black text-slate-950 border-r border-slate-300 uppercase">{family.familyHeadName}</td>
              <td className="w-1/4 bg-slate-50 p-2 font-bold text-slate-700 border-r border-slate-300">Primary Contact Mobile:</td>
              <td className="w-1/4 p-2 font-mono font-bold text-slate-950">{family.primaryMobile || 'N/A'}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="bg-slate-50 p-2 font-bold text-slate-700 border-r border-slate-300">Residential Address:</td>
              <td className="p-2 text-slate-900 border-r border-slate-300" colSpan={3}>
                {family.address}, {village?.name}, Ward {ward?.wardNumber}, {panchayat.name} GP, Pin: {panchayat.pincode}
              </td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="bg-slate-50 p-2 font-bold text-slate-700 border-r border-slate-300">Economic Status Code:</td>
              <td className="p-2 font-bold border-r border-slate-300">
                {family.economicStatus === 1 && <span className="text-blue-900">Code 1 — Well-off / Prosperous</span>}
                {family.economicStatus === 2 && <span className="text-amber-900">Code 2 — Moderate / Middle-income</span>}
                {family.economicStatus === 3 && <span className="text-rose-900 font-black">Code 3 — Low Income / Priority BPL</span>}
              </td>
              <td className="bg-slate-50 p-2 font-bold text-slate-700 border-r border-slate-300">Ration Card Details:</td>
              <td className="p-2 font-bold text-slate-950">
                {family.rationCardType || 'None'} {family.rationCardNumber ? `(${family.rationCardNumber})` : ''}
              </td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="bg-slate-50 p-2 font-bold text-slate-700 border-r border-slate-300">House / Roof Type:</td>
              <td className="p-2 text-slate-900 border-r border-slate-300">{family.houseType || 'Pucca'} Structure</td>
              <td className="bg-slate-50 p-2 font-bold text-slate-700 border-r border-slate-300">Drinking Water / Sanitation:</td>
              <td className="p-2 text-slate-900">
                {family.drinkingWaterSource || 'Piped Water'} | Toilet: {family.sanitationFacility ? 'Yes' : 'No'}
              </td>
            </tr>
            <tr>
              <td className="bg-slate-50 p-2 font-bold text-slate-700 border-r border-slate-300">Govt Job in Household:</td>
              <td className="p-2 font-bold border-r border-slate-300" colSpan={3}>
                {govtJobHolders.length > 0 ? (
                  <span className="text-blue-900">
                    YES — {govtJobHolders.map(m => `${m.name} (${m.governmentDepartment || 'State Govt'})`).join(', ')}
                  </span>
                ) : (
                  <span className="text-slate-600">No Government Employment Logged</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ======================================================== */}
      {/* 4. SECTION B: 🗳️ VOTER SUMMARY & ELECTORAL BREAKDOWN     */}
      {/* ======================================================== */}
      {includeVoterCategory && (
        <div className="mb-4 print-avoid-break">
          <div className="bg-slate-900 text-white font-bold px-2.5 py-1 text-[11px] uppercase tracking-wider flex items-center justify-between rounded-t">
            <span>Section B: Electoral Roll & Strategic Voter Categorization Summary</span>
            <span className="text-[10px] font-normal text-slate-300">Confidential Field Record</span>
          </div>

          <div className="border border-slate-300 border-t-0 p-3 bg-slate-50/70">
            <div className="grid grid-cols-5 gap-2 text-center">
              {/* Total Members */}
              <div className="p-2 bg-white border border-slate-300 rounded">
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Total Members</span>
                <span className="text-base font-black text-slate-900 block">{members.length}</span>
                <span className="text-[9px] text-slate-500 block">Residents</span>
              </div>

              {/* Total Voters */}
              <div className="p-2 bg-white border border-slate-800 rounded">
                <span className="text-[9px] font-bold text-slate-800 uppercase block">Total Voters</span>
                <span className="text-base font-black text-slate-950 block">{voters.length}</span>
                <span className="text-[9px] text-slate-600 font-semibold block">
                  {members.length > 0 ? `${Math.round((voters.length / members.length) * 100)}% Electorate` : '0%'}
                </span>
              </div>

              {/* 🟢 Green Voters */}
              <div className="p-2 bg-emerald-50 border border-emerald-500 rounded">
                <span className="text-[9px] font-black text-emerald-900 uppercase block">🟢 Green Voters</span>
                <span className="text-base font-black text-emerald-950 block">{greenVoters}</span>
                <span className="text-[9px] text-emerald-800 font-bold block">
                  {voters.length > 0 ? `${Math.round((greenVoters / voters.length) * 100)}% Favorable` : '0%'}
                </span>
              </div>

              {/* 🟡 Yellow Voters */}
              <div className="p-2 bg-amber-50 border border-amber-500 rounded">
                <span className="text-[9px] font-black text-amber-900 uppercase block">🟡 Yellow Voters</span>
                <span className="text-base font-black text-amber-950 block">{yellowVoters}</span>
                <span className="text-[9px] text-amber-800 font-bold block">
                  {voters.length > 0 ? `${Math.round((yellowVoters / voters.length) * 100)}% Moderate` : '0%'}
                </span>
              </div>

              {/* 🔴 Red Voters */}
              <div className="p-2 bg-rose-50 border border-rose-500 rounded">
                <span className="text-[9px] font-black text-rose-900 uppercase block">🔴 Red Voters</span>
                <span className="text-base font-black text-rose-950 block">{redVoters}</span>
                <span className="text-[9px] text-rose-800 font-bold block">
                  {voters.length > 0 ? `${Math.round((redVoters / voters.length) * 100)}% Attention` : '0%'}
                </span>
              </div>
            </div>

            {notVerifiedVoters > 0 && (
              <div className="mt-2 text-[10px] text-amber-800 font-semibold flex items-center justify-between bg-amber-100/70 p-1.5 rounded border border-amber-300">
                <span>⚠️ Note: {notVerifiedVoters} family member(s) have unverified voter status requiring booth verification.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. SECTION C: FAMILY MEMBERS REGISTER                    */}
      {/* ======================================================== */}
      <div className="mb-4 print-avoid-break">
        <div className="bg-slate-900 text-white font-bold px-2.5 py-1 text-[11px] uppercase tracking-wider flex items-center justify-between rounded-t">
          <span>Section C: Family Members Nominal Roll & Voter Matrix ({members.length} Members)</span>
          <span className="text-[10px] font-normal text-slate-300">Electoral & Demographic Roll</span>
        </div>

        <table className="w-full border border-slate-300 text-[10.5px] border-collapse">
          <thead className="bg-slate-200 text-slate-900 font-bold border-b border-slate-300 uppercase text-[9.5px]">
            <tr>
              <th className="p-1.5 border-r border-slate-300 text-center w-8">#</th>
              <th className="p-1.5 border-r border-slate-300 text-left">Member Name</th>
              <th className="p-1.5 border-r border-slate-300 text-left">Father's / Husband's</th>
              <th className="p-1.5 border-r border-slate-300 text-left">Relation</th>
              <th className="p-1.5 border-r border-slate-300 text-center">Age/Sex</th>
              <th className="p-1.5 border-r border-slate-300 text-center">Voter Status</th>
              <th className="p-1.5 border-r border-slate-300 text-left">EPIC No.</th>
              {includeVoterCategory && (
                <th className="p-1.5 border-r border-slate-300 text-center">Category</th>
              )}
              <th className="p-1.5 text-left">Occupation / Job</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {members.map((m, idx) => {
              const isVoterYes = m.isVoter && m.voterStatus !== 'NO';
              const cat = m.voterCategory || 'GREEN';

              return (
                <tr key={m.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="p-1.5 border-r border-slate-300 text-center font-bold text-slate-600">{idx + 1}</td>
                  <td className="p-1.5 border-r border-slate-300 font-black text-slate-950">
                    {m.name}
                    {m.relation === 'Head' && <span className="ml-1 text-[9px] font-bold text-blue-800">[Head]</span>}
                  </td>
                  <td className="p-1.5 border-r border-slate-300 text-slate-700">{m.fatherHusbandName || '—'}</td>
                  <td className="p-1.5 border-r border-slate-300 font-medium text-slate-800">{m.relation}</td>
                  <td className="p-1.5 border-r border-slate-300 text-center text-slate-800">
                    {m.age} Y / {m.gender.charAt(0)}
                  </td>
                  <td className="p-1.5 border-r border-slate-300 text-center font-bold">
                    {isVoterYes ? (
                      <span className="text-emerald-900 font-bold">YES</span>
                    ) : m.voterStatus === 'NOT VERIFIED' ? (
                      <span className="text-amber-800 font-bold">UNVERIFIED</span>
                    ) : (
                      <span className="text-slate-500 font-normal">NO</span>
                    )}
                  </td>
                  <td className="p-1.5 border-r border-slate-300 font-mono text-[10px] text-slate-900">
                    {m.voterEpicNumber || '—'}
                  </td>
                  {includeVoterCategory && (
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-[9.5px]">
                      {isVoterYes ? (
                        cat === 'GREEN' ? (
                          <span className="text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">🟢 GREEN</span>
                        ) : cat === 'YELLOW' ? (
                          <span className="text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">🟡 YELLOW</span>
                        ) : (
                          <span className="text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-300">🔴 RED</span>
                        )
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  )}
                  <td className="p-1.5 text-slate-800">
                    {m.occupation || 'Household'}
                    {m.hasGovernmentJob && (
                      <span className="ml-1 text-[9px] font-bold text-blue-800 block">
                        ★ Govt: {m.governmentDepartment || 'State'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ======================================================== */}
      {/* 6. SECTION D: 🤝 MY DIRECT ASSISTANCE HISTORY            */}
      {/* ======================================================== */}
      {includeAssistance && (
        <div className="mb-4 print-avoid-break">
          <div className="bg-slate-900 text-white font-bold px-2.5 py-1 text-[11px] uppercase tracking-wider flex items-center justify-between rounded-t">
            <span>Section D: My Direct Assistance & Grassroots Service Record</span>
            <span className="text-[10px] font-normal text-slate-300">
              {assistance.length} {assistance.length === 1 ? 'Action Logged' : 'Actions Logged'}
            </span>
          </div>

          {assistance.length === 0 ? (
            <div className="border border-slate-300 border-t-0 p-3 text-center text-slate-500 italic bg-white text-[11px]">
              No direct assistance or scheme facilitation records currently logged for this household.
            </div>
          ) : (
            <table className="w-full border border-slate-300 text-[10.5px] border-collapse">
              <thead className="bg-slate-200 text-slate-900 font-bold border-b border-slate-300 uppercase text-[9.5px]">
                <tr>
                  <th className="p-1.5 border-r border-slate-300 text-left w-20">Type</th>
                  <th className="p-1.5 border-r border-slate-300 text-left">Beneficiary</th>
                  <th className="p-1.5 border-r border-slate-300 text-left">Scheme / Action Detail</th>
                  <th className="p-1.5 border-r border-slate-300 text-left">Field Officer Note / Direct Help Provided</th>
                  <th className="p-1.5 border-r border-slate-300 text-center w-16">Status</th>
                  <th className="p-1.5 text-center w-20">Recorded / Done</th>
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
                        {isScheme ? (
                          <span className="text-blue-900">🏛️ SCHEME</span>
                        ) : isPersonal ? (
                          <span className="text-emerald-900">🤝 PERSONAL</span>
                        ) : (
                          <span className="text-indigo-900">📦 OTHER</span>
                        )}
                      </td>
                      <td className="p-1.5 border-r border-slate-300 font-black text-slate-950">
                        {a.beneficiaryName || family.familyHeadName}
                      </td>
                      <td className="p-1.5 border-r border-slate-300 text-slate-800">
                        {isScheme && (a.schemeName || a.scheme_name || a.schemeId) ? (
                          <strong className="text-blue-950 block">{a.schemeName || a.scheme_name || a.schemeId}</strong>
                        ) : null}
                        {a.description && <span className="text-slate-600 block">{a.description}</span>}
                      </td>
                      <td className="p-1.5 border-r border-slate-300 text-slate-900">
                        {a.note ? (
                          <div className="font-semibold text-slate-950 bg-slate-100 p-1 rounded border border-slate-300 text-[10px]">
                            "{a.note}"
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">No specific note attached</span>
                        )}
                      </td>
                      <td className="p-1.5 border-r border-slate-300 text-center font-black">
                        {statusDone ? (
                          <span className="text-emerald-900 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 text-[9px]">DONE</span>
                        ) : statusApplied ? (
                          <span className="text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded border border-blue-300 text-[9px]">APPLIED</span>
                        ) : (
                          <span className="text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 text-[9px]">PENDING</span>
                        )}
                      </td>
                      <td className="p-1.5 text-center text-slate-700 text-[9.5px]">
                        <div>{a.date}</div>
                        {a.completionDate && (
                          <div className="text-emerald-800 font-bold text-[9px]">Done: {a.completionDate}</div>
                        )}
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
      {/* 7. SECTION E: GOVERNMENT WELFARE SCHEMES REGISTER       */}
      {/* ======================================================== */}
      <div className="mb-4 print-avoid-break">
        <div className="bg-slate-900 text-white font-bold px-2.5 py-1 text-[11px] uppercase tracking-wider flex items-center justify-between rounded-t">
          <span>Section E: Government Welfare Schemes Register ({schemes.length} Schemes Linked)</span>
          <span className="text-[10px] font-normal text-slate-300">Central & State Entitlements</span>
        </div>

        {schemes.length === 0 ? (
          <div className="border border-slate-300 border-t-0 p-3 text-center text-slate-500 italic bg-white text-[11px]">
            No official government welfare schemes currently recorded for this household.
          </div>
        ) : (
          <table className="w-full border border-slate-300 text-[10.5px] border-collapse bg-white">
            <thead className="bg-slate-200 text-slate-900 font-bold border-b border-slate-300 uppercase text-[9.5px]">
              <tr>
                <th className="p-1.5 border-r border-slate-300 text-left">Scheme Program</th>
                <th className="p-1.5 border-r border-slate-300 text-left">Beneficiary / Applicant</th>
                <th className="p-1.5 border-r border-slate-300 text-left">Application / Reg No.</th>
                <th className="p-1.5 border-r border-slate-300 text-left">Benefit / Subsidy</th>
                <th className="p-1.5 border-r border-slate-300 text-center w-28">Status</th>
                <th className="p-1.5 text-center w-24">Sanction Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {schemes.map((s, idx) => {
                const isActive = s.status === 'Sanctioned / Active';
                return (
                  <tr key={s.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-1.5 border-r border-slate-300 font-black text-slate-950">
                      <div className="flex items-center space-x-1">
                        {isActive && <span className="text-emerald-700 font-black">✅</span>}
                        <span>{s.schemeName}</span>
                      </div>
                    </td>
                    <td className="p-1.5 border-r border-slate-300 font-bold text-slate-800">
                      {s.applicantName || family.familyHeadName}
                    </td>
                    <td className="p-1.5 border-r border-slate-300 font-mono text-[10px] text-slate-700">
                      {s.applicationNumber || '—'}
                    </td>
                    <td className="p-1.5 border-r border-slate-300 font-semibold text-emerald-950">
                      {s.amountOrBenefit || 'Statutory Benefit'}
                    </td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-[9.5px]">
                      {isActive ? (
                        <span className="text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                          {s.status}
                        </span>
                      )}
                    </td>
                    <td className="p-1.5 text-center text-slate-700 text-[10px]">
                      {s.sanctionedDate || s.appliedDate || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Action Tickets Section */}
      {tickets.length > 0 && (
        <div className="mb-4 print-avoid-break">
          <div className="bg-slate-800 text-white font-bold px-2.5 py-1 text-[11px] uppercase tracking-wider flex items-center justify-between rounded-t">
            <span>Section F: Citizen Grievance &amp; Service Tickets ({tickets.length})</span>
            <span className="text-[10px] font-normal text-slate-300">Action &amp; Delivery Register</span>
          </div>
          <table className="w-full border border-slate-300 text-[10px] border-collapse bg-white">
            <thead className="bg-slate-200 text-slate-900 font-bold border-b border-slate-300 uppercase text-[9px]">
              <tr>
                <th className="p-1.5 border-r border-slate-300 text-left">Ticket Title &amp; Category</th>
                <th className="p-1.5 border-r border-slate-300 text-left">Grievance &amp; Work Done / Action Taken</th>
                <th className="p-1.5 border-r border-slate-300 text-center w-16">Priority</th>
                <th className="p-1.5 border-r border-slate-300 text-right w-20">Benefit (₹)</th>
                <th className="p-1.5 text-center w-24">Status / Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {tickets.map((t, idx) => {
                const isResolved = t.status === 'Resolved' || t.status === 'Closed';
                return (
                  <tr key={t.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-1.5 border-r border-slate-300 font-bold text-slate-950">
                      <div>{t.title}</div>
                      <span className="block text-[9px] text-slate-500 font-normal">{t.category}</span>
                      <span className="text-[8px] font-mono text-slate-400">ID: {t.id}</span>
                    </td>
                    <td className="p-1.5 border-r border-slate-300 text-slate-700 text-[9.5px]">
                      <div>{t.description}</div>
                      {(t.actionTaken || t.notes) && (
                        <div className="text-[9px] text-emerald-950 bg-emerald-50/70 p-1 rounded border border-emerald-200 mt-0.5">
                          <strong>Action Taken:</strong> {t.actionTaken || t.notes}
                        </div>
                      )}
                      {t.resolutionNotes && (
                        <div className="text-[8.5px] text-slate-600 mt-0.5">
                          <em>Outcome:</em> {t.resolutionNotes}
                        </div>
                      )}
                    </td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold text-[9px]">
                      <span className={t.priority === 'High' ? 'text-rose-700' : 'text-slate-700'}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="p-1.5 border-r border-slate-300 text-right font-mono font-bold text-slate-900 text-[9.5px]">
                      {t.financialBenefitRs ? `₹${t.financialBenefitRs.toLocaleString()}` : '—'}
                    </td>
                    <td className="p-1.5 text-center font-bold text-[9px]">
                      <span className={`px-1.5 py-0.5 rounded ${
                        isResolved 
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                          : 'bg-purple-100 text-purple-900 border border-purple-300'
                      }`}>
                        {t.status}
                      </span>
                      <div className="text-[8.5px] text-slate-500 font-normal mt-0.5">
                        {isResolved ? (t.resolvedDate || t.targetDate) : `Target: ${t.targetDate}`}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. SECTION F: OFFICIAL VERIFICATION & SIGNATURES BLOCK   */}
      {/* ======================================================== */}
      {includeSignatures && (
        <div className="border border-slate-400 bg-slate-50 p-4 rounded mt-6 print-avoid-break">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-700 text-center mb-6 pb-1 border-b border-slate-300">
            Official Certification & Verification for Physical Record Submission
          </div>

          <p className="text-[10px] text-slate-600 text-justify mb-8">
            I hereby certify that the particulars furnished above regarding the household members, socio-economic category, electoral enrollment, and welfare assistance history have been verified against the Gram Panchayat Field Register and spot inquiry.
          </p>

          <div className="grid grid-cols-3 gap-6 text-center text-[10px]">
            {/* Citizen Signature */}
            <div className="flex flex-col justify-end">
              <div className="border-b-2 border-dashed border-slate-500 pb-1 mb-1.5 h-10 flex items-end justify-center">
                <span className="text-[9px] text-slate-400 italic">(Signature / LTI)</span>
              </div>
              <strong className="text-slate-950 uppercase">{family.familyHeadName}</strong>
              <span className="text-slate-600 text-[9px]">Citizen / Family Head</span>
            </div>

            {/* Ward Member Signature */}
            <div className="flex flex-col justify-end">
              <div className="border-b-2 border-dashed border-slate-500 pb-1 mb-1.5 h-10 flex items-end justify-center">
                <span className="text-[9px] text-slate-400 italic">(Signature & Seal)</span>
              </div>
              <strong className="text-slate-950">{ward?.wardMemberName || 'Elected Ward Member'}</strong>
              <span className="text-slate-600 text-[9px]">Ward Member (Ward No. {ward?.wardNumber})</span>
            </div>

            {/* PEO / Sarpanch Signature */}
            <div className="flex flex-col justify-end">
              <div className="border-b-2 border-dashed border-slate-500 pb-1 mb-1.5 h-10 flex items-end justify-center">
                <span className="text-[9px] text-slate-400 italic">(Official Panchayat Seal)</span>
              </div>
              <strong className="text-slate-950">{panchayat.sarpanchName || panchayat.panchayatExecutiveOfficer}</strong>
              <span className="text-slate-600 text-[9px]">Sarpanch / Panchayat Executive Officer</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer Notice */}
      <div className="mt-4 pt-2 border-t border-slate-300 text-[9px] text-slate-500 flex items-center justify-between">
        <span>Gram Panchayat Field Management System • Official Confidential Dossier</span>
        <span>Page 1 of 1 • System Generated</span>
      </div>
    </div>
  );
};
