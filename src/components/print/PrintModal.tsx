import React, { useState } from 'react';
import {
  Printer,
  X,
  SlidersHorizontal,
  Check,
  Eye,
  FileText,
  ClipboardCheck
} from 'lucide-react';
import {
  Family,
  FamilyMember,
  Panchayat,
  Village,
  Ward,
  PersonalAssistance,
  SchemeApplication,
  FollowUpTicket,
  DevelopmentWork,
  CommunityProblem,
  KeyPerson
} from '../../types';
import { FamilyProfilePrintView } from './FamilyProfilePrintView';
import { WardReportPrintView } from './WardReportPrintView';
import { ActionTakenPrintView } from './ActionTakenPrintView';
import { SingleActionPrintView, SingleActionItem } from './SingleActionPrintView';

export interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: 'family' | 'ward' | 'atr' | 'single-action';
  title?: string;

  // For Family Profile
  family?: Family;
  familyMembers?: FamilyMember[];
  assistance?: PersonalAssistance[];
  schemes?: SchemeApplication[];
  tickets?: FollowUpTicket[];

  // For Ward Report
  ward?: Ward;
  wardFamilies?: Family[];
  wardMembers?: FamilyMember[];
  wardAssistance?: PersonalAssistance[];
  devWorks?: DevelopmentWork[];
  problems?: CommunityProblem[];
  keyPeople?: KeyPerson[];

  // For Action Taken Report (ATR)
  villages?: Village[];
  wards?: Ward[];
  selectedWardId?: string;
  allProblems?: CommunityProblem[];
  allDevWorks?: DevelopmentWork[];
  allTickets?: FollowUpTicket[];
  allAssistance?: PersonalAssistance[];
  notes?: string;

  // For Single Action Certificate Slip
  actionItem?: SingleActionItem;

  // Shared
  village?: Village;
  panchayat: Panchayat;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  documentType,
  title,
  family,
  familyMembers = [],
  assistance = [],
  schemes = [],
  tickets = [],
  ward,
  wardFamilies = [],
  wardMembers = [],
  wardAssistance = [],
  devWorks = [],
  problems = [],
  keyPeople = [],
  villages = [],
  wards = [],
  selectedWardId,
  allProblems = [],
  allDevWorks = [],
  allTickets = [],
  allAssistance = [],
  notes,
  actionItem,
  village,
  panchayat
}) => {
  // Configuration toggles for physical document output
  const [includeVoterCategory, setIncludeVoterCategory] = useState(true);
  const [includeAssistanceToggle, setIncludeAssistanceToggle] = useState(true);
  const [includeSignatures, setIncludeSignatures] = useState(true);
  const [includeFamiliesList, setIncludeFamiliesList] = useState(true);

  // ATR specific toggles
  const [includeProblemsToggle, setIncludeProblemsToggle] = useState(true);
  const [includeDevWorksToggle, setIncludeDevWorksToggle] = useState(true);
  const [includeTicketsToggle, setIncludeTicketsToggle] = useState(true);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getDocTypeBadge = () => {
    switch (documentType) {
      case 'family':
        return 'Family Dossier (GP-HR-01)';
      case 'ward':
        return 'Ward Performance Dossier (GP-WD-02)';
      case 'atr':
        return 'Official Action Taken Report (FORM GP-ATR-03)';
      case 'single-action':
        return 'Work Done Certificate Slip (FORM GP-RES-01)';
      default:
        return 'Gram Panchayat Document';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden print:border-none print:shadow-none print:max-h-none print:max-w-none print:w-full print:rounded-none">
        
        {/* ======================================================== */}
        {/* MODAL ACTION BAR (Hidden in print)                        */}
        {/* ======================================================== */}
        <div className="no-print px-6 py-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-xl">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {getDocTypeBadge()}
                </span>
                <span className="text-xs text-slate-400 font-medium">A4 Document Ready</span>
              </div>
              <h2 className="text-base font-black text-white mt-0.5">
                {title || (
                  documentType === 'family' 
                    ? `Household Verification Dossier: ${family?.familyHeadName}` 
                    : documentType === 'ward' 
                    ? `Official Ward ${ward?.wardNumber} Report` 
                    : documentType === 'atr'
                    ? `Official Action Taken & Work Done Report (ATR)`
                    : `Official Work Done & Resolution Certificate`
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-900/40 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Physical Report (A4)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CUSTOMIZATION TOOLBAR (Hidden in print)                  */}
        {/* ======================================================== */}
        <div className="no-print px-6 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 text-slate-400 text-[11px] font-semibold">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Document Print Options:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {documentType === 'atr' ? (
              <>
                <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] text-slate-300 hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={includeProblemsToggle}
                    onChange={e => setIncludeProblemsToggle(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>Solved Problems</span>
                </label>

                <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] text-slate-300 hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={includeDevWorksToggle}
                    onChange={e => setIncludeDevWorksToggle(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>Completed Dev Works</span>
                </label>

                <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] text-slate-300 hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={includeTicketsToggle}
                    onChange={e => setIncludeTicketsToggle(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>Resolved Tickets &amp; Aid</span>
                </label>
              </>
            ) : (
              <>
                <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] text-slate-300 hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={includeVoterCategory}
                    onChange={e => setIncludeVoterCategory(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>Voter Category (🟢/🟡/🔴)</span>
                </label>

                <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] text-slate-300 hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={includeAssistanceToggle}
                    onChange={e => setIncludeAssistanceToggle(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>Work Done / Assistance History</span>
                </label>

                {documentType === 'ward' && (
                  <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] text-slate-300 hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={includeFamiliesList}
                      onChange={e => setIncludeFamiliesList(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span>Household Nominal Roll</span>
                  </label>
                )}
              </>
            )}

            <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={includeSignatures}
                onChange={e => setIncludeSignatures(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-0 w-3.5 h-3.5"
              />
              <span>Official Signature &amp; Seal Block</span>
            </label>
          </div>
        </div>

        {/* ======================================================== */}
        {/* DOCUMENT PREVIEW CONTAINER (Prints cleanly)              */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-800/40 print:p-0 print:bg-white print:overflow-visible">
          <div className="bg-white shadow-2xl rounded-lg mx-auto print:shadow-none print:rounded-none">
            {documentType === 'family' && family ? (
              <FamilyProfilePrintView
                family={family}
                members={familyMembers}
                village={village}
                ward={ward}
                panchayat={panchayat}
                assistance={assistance}
                schemes={schemes}
                tickets={tickets}
                includeVoterCategory={includeVoterCategory}
                includeAssistance={includeAssistanceToggle}
                includeSignatures={includeSignatures}
              />
            ) : documentType === 'ward' && ward ? (
              <WardReportPrintView
                ward={ward}
                village={village}
                panchayat={panchayat}
                families={wardFamilies}
                members={wardMembers}
                assistance={wardAssistance}
                devWorks={devWorks}
                problems={problems}
                keyPeople={keyPeople}
                schemes={schemes}
                includeVoterCategory={includeVoterCategory}
                includeAssistance={includeAssistanceToggle}
                includeFamiliesList={includeFamiliesList}
                includeSignatures={includeSignatures}
              />
            ) : documentType === 'atr' ? (
              <ActionTakenPrintView
                panchayat={panchayat}
                villages={villages}
                wards={wards}
                selectedWardId={selectedWardId}
                problems={allProblems.length > 0 ? allProblems : problems}
                devWorks={allDevWorks.length > 0 ? allDevWorks : devWorks}
                tickets={allTickets.length > 0 ? allTickets : tickets}
                assistance={allAssistance.length > 0 ? allAssistance : assistance}
                includeProblems={includeProblemsToggle}
                includeDevWorks={includeDevWorksToggle}
                includeTickets={includeTicketsToggle}
                includeAssistance={includeTicketsToggle}
                includeSignatures={includeSignatures}
                notes={notes}
              />
            ) : documentType === 'single-action' && actionItem ? (
              <SingleActionPrintView
                panchayat={panchayat}
                villages={villages}
                wards={wards}
                actionItem={actionItem}
              />
            ) : (
              <div className="p-8 text-center text-slate-500">
                No data available for preview.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

