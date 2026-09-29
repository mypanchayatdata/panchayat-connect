import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Family, FamilyMember, SchemeApplication } from '../../types';
import {
  CheckCircle2,
  Plus,
  Clock,
  AlertCircle,
  FileText,
  Building,
  Check,
  Edit2,
  Trash2,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';

export interface MasterSchemeDef {
  key: string;
  name: string;
  category: 'Housing' | 'Agriculture' | 'Social Security / Pension' | 'Food & Nutrition' | 'Health' | 'Women Empowerment' | 'Employment' | 'Energy';
  icon: string;
  defaultBenefit: string;
  description: string;
}

export const MASTER_GOVT_SCHEMES: MasterSchemeDef[] = [
  {
    key: 'PMAY',
    name: 'PMAY (Pradhan Mantri Awas Yojana)',
    category: 'Housing',
    icon: '🏠',
    defaultBenefit: '₹1,20,000 subsidy + 90 days MGNREGA labor',
    description: 'Pucca house grant for rural Kutcha / homeless households.'
  },
  {
    key: 'PMKISAN',
    name: 'PM-KISAN (Samman Nidhi)',
    category: 'Agriculture',
    icon: '🌾',
    defaultBenefit: '₹6,000 / year (₹2,000 x 3 tranches)',
    description: 'Direct income support for landholding farming families.'
  },
  {
    key: 'OLD_AGE_PENSION',
    name: 'Old Age Pension (IGNOAPS)',
    category: 'Social Security / Pension',
    icon: '👵',
    defaultBenefit: '₹1,000 to ₹1,500 / month',
    description: 'Monthly social security allowance for senior citizens (60+ yrs).'
  },
  {
    key: 'WIDOW_PENSION',
    name: 'Widow Pension (IGNWPS)',
    category: 'Social Security / Pension',
    icon: '👩',
    defaultBenefit: '₹1,000 / month direct transfer',
    description: 'Financial security allowance for widowed women.'
  },
  {
    key: 'DISABILITY_PENSION',
    name: 'Disability Pension (IGNDPS)',
    category: 'Social Security / Pension',
    icon: '♿',
    defaultBenefit: '₹1,000 to ₹1,500 / month',
    description: 'Monthly pension for persons with benchmark disability (40%+).'
  },
  {
    key: 'NFSA_RATION',
    name: 'NFSA Ration Food Security',
    category: 'Food & Nutrition',
    icon: '🍚',
    defaultBenefit: '5 kg free food grains per family member / month',
    description: 'Subsidized/free food grains under National Food Security Act.'
  },
  {
    key: 'AYUSHMAN_BHARAT',
    name: 'Ayushman Bharat / PM-JAY',
    category: 'Health',
    icon: '🏥',
    defaultBenefit: '₹5,00,000 free hospitalization coverage / year',
    description: 'Cashless secondary and tertiary healthcare card.'
  },
  {
    key: 'SUBHADRA_YOJANA',
    name: 'Subhadra Yojana / Women Empowerment',
    category: 'Women Empowerment',
    icon: '🌸',
    defaultBenefit: '₹10,000 / year (₹5,000 x 2 installments for 5 yrs)',
    description: 'State women empowerment financial support voucher scheme.'
  },
  {
    key: 'MGNREGA',
    name: 'MGNREGA Job Card',
    category: 'Employment',
    icon: '👷',
    defaultBenefit: '100 days guaranteed wage employment / household',
    description: 'Guaranteed wage employment for rural adult manual labor.'
  },
  {
    key: 'KALIA_FARMER',
    name: 'Kalia / State Farmer Support',
    category: 'Agriculture',
    icon: '🌱',
    defaultBenefit: '₹4,000 / year financial aid + crop loan assistance',
    description: 'Cultivator and landless agriculture laborer livelihood fund.'
  },
  {
    key: 'UJJWALA_LPG',
    name: 'Ujjwala LPG Scheme',
    category: 'Energy',
    icon: '🔥',
    defaultBenefit: 'Free LPG connection + subsidized cylinder refills',
    description: 'Clean cooking fuel LPG gas connection for BPL/PHH women.'
  },
  {
    key: 'MO_GHARA',
    name: 'Mo Ghara Rural Housing',
    category: 'Housing',
    icon: '🏡',
    defaultBenefit: 'Housing loan capital subsidy up to ₹60,000',
    description: 'Credit-linked rural housing upgrade and conversion scheme.'
  },
  {
    key: 'MISSION_SHAKTI',
    name: 'Mission Shakti SHG Loan & Subsidies',
    category: 'Women Empowerment',
    icon: '💼',
    defaultBenefit: '0% interest bank loans up to ₹5,00,000 for SHG women',
    description: 'Women self-help group microfinance and entrepreneurship support.'
  }
];

interface FamilySchemesChecklistProps {
  family: Family;
  onOpenQuickAdd?: (type: string, initialData?: any) => void;
  onNavigate?: (view: string, targetId?: string) => void;
  compact?: boolean;
}

export const FamilySchemesChecklist: React.FC<FamilySchemesChecklistProps> = ({
  family,
  onOpenQuickAdd,
  onNavigate,
  compact = false
}) => {
  const {
    schemes,
    members,
    addScheme,
    updateScheme,
    deleteScheme
  } = useDatabase();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ENROLLED' | 'AVAILABLE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchemeToEnroll, setSelectedSchemeToEnroll] = useState<MasterSchemeDef | null>(null);
  const [enrollMemberId, setEnrollMemberId] = useState<string>('');
  const [enrollStatus, setEnrollStatus] = useState<SchemeApplication['status']>('Sanctioned / Active');
  const [enrollAmount, setEnrollAmount] = useState<string>('');
  const [enrollAppNo, setEnrollAppNo] = useState<string>('');
  const [enrollNotes, setEnrollNotes] = useState<string>('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customSchemeName, setCustomSchemeName] = useState('');

  // Family members list
  const familyMembers = members.filter(m => m.familyId === family.id);
  // Family schemes existing in DB
  const familySchemes = schemes.filter(s => s.familyId === family.id);

  // Match scheme application to a master definition or custom
  const getExistingSchemeRecord = (masterDef: MasterSchemeDef) => {
    return familySchemes.find(s => {
      const dbName = s.schemeName.toLowerCase();
      const defKey = masterDef.key.toLowerCase();
      const defName = masterDef.name.toLowerCase();

      if (defKey === 'pmay' && (dbName.includes('pmay') || dbName.includes('awas'))) return true;
      if (defKey === 'pmkisan' && (dbName.includes('pm-kisan') || dbName.includes('pmkisan') || dbName.includes('kisan'))) return true;
      if (defKey === 'old_age_pension' && (dbName.includes('old age') || dbName.includes('ignoaps') || dbName.includes('mbpy'))) return true;
      if (defKey === 'widow_pension' && (dbName.includes('widow') || dbName.includes('ignwps'))) return true;
      if (defKey === 'disability_pension' && (dbName.includes('disability') || dbName.includes('igndps') || dbName.includes('divyang'))) return true;
      if (defKey === 'nfsa_ration' && (dbName.includes('ration') || dbName.includes('nfsa') || dbName.includes('food security') || dbName.includes('aay') || dbName.includes('phh'))) return true;
      if (defKey === 'ayushman_bharat' && (dbName.includes('ayushman') || dbName.includes('pm-jay') || dbName.includes('pmjay') || dbName.includes('bsky'))) return true;
      if (defKey === 'subhadra_yojana' && (dbName.includes('subhadra') || dbName.includes('women empowerment'))) return true;
      if (defKey === 'mgnrega' && (dbName.includes('mgnrega') || dbName.includes('nrega') || dbName.includes('job card'))) return true;
      if (defKey === 'kalia_farmer' && (dbName.includes('kalia'))) return true;
      if (defKey === 'ujjwala_lpg' && (dbName.includes('ujjwala') || dbName.includes('lpg') || dbName.includes('gas'))) return true;
      if (defKey === 'mo_ghara' && (dbName.includes('mo ghara') || dbName.includes('moghar'))) return true;
      if (defKey === 'mission_shakti' && (dbName.includes('mission shakti') || dbName.includes('shg'))) return true;

      return dbName.includes(defName) || defName.includes(dbName);
    });
  };

  // Find extra schemes that don't match any master scheme
  const extraFamilySchemes = familySchemes.filter(s => {
    return !MASTER_GOVT_SCHEMES.some(m => getExistingSchemeRecord(m)?.id === s.id);
  });

  const enrolledCount = MASTER_GOVT_SCHEMES.filter(m => !!getExistingSchemeRecord(m)).length + extraFamilySchemes.length;

  const handleOpenEnrollModal = (masterDef: MasterSchemeDef) => {
    setSelectedSchemeToEnroll(masterDef);
    setEnrollMemberId(familyMembers[0]?.id || '');
    setEnrollStatus('Sanctioned / Active');
    setEnrollAmount(masterDef.defaultBenefit);
    setEnrollAppNo(`APP-${masterDef.key}-${Date.now().toString().slice(-4)}`);
    setEnrollNotes('');
  };

  const handleSaveEnrollment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchemeToEnroll) return;

    const applicant = familyMembers.find(m => m.id === enrollMemberId);
    const applicantName = applicant ? applicant.name : family.familyHeadName;
    const newId = `SCH-${selectedSchemeToEnroll.key}-${Date.now().toString().slice(-4)}`;
    const todayStr = new Date().toISOString().slice(0, 10);

    const newApp: SchemeApplication = {
      id: newId,
      schemeName: selectedSchemeToEnroll.name as any,
      familyId: family.id,
      memberId: enrollMemberId || undefined,
      villageId: family.villageId,
      wardId: family.wardId,
      applicantName,
      status: enrollStatus,
      appliedDate: todayStr,
      sanctionedDate: enrollStatus === 'Sanctioned / Active' ? todayStr : undefined,
      amountOrBenefit: enrollAmount || selectedSchemeToEnroll.defaultBenefit,
      applicationNumber: enrollAppNo || `APP-${Date.now().toString().slice(-6)}`,
      notes: enrollNotes || `Enrolled via Scheme Checklist for ${applicantName}`
    };

    addScheme(newApp);
    setSelectedSchemeToEnroll(null);
  };

  const handleSaveCustomScheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSchemeName.trim()) return;

    const applicant = familyMembers.find(m => m.id === enrollMemberId);
    const applicantName = applicant ? applicant.name : family.familyHeadName;
    const newId = `SCH-CUST-${Date.now().toString().slice(-4)}`;
    const todayStr = new Date().toISOString().slice(0, 10);

    const newApp: SchemeApplication = {
      id: newId,
      schemeName: customSchemeName.trim() as any,
      familyId: family.id,
      memberId: enrollMemberId || undefined,
      villageId: family.villageId,
      wardId: family.wardId,
      applicantName,
      status: enrollStatus,
      appliedDate: todayStr,
      sanctionedDate: enrollStatus === 'Sanctioned / Active' ? todayStr : undefined,
      amountOrBenefit: enrollAmount || 'Government Benefit',
      applicationNumber: enrollAppNo || `APP-${Date.now().toString().slice(-6)}`,
      notes: enrollNotes || `Custom scheme enrollment`
    };

    addScheme(newApp);
    setIsAddingCustom(false);
    setCustomSchemeName('');
  };

  const handleQuickStatusToggle = (existingRec: SchemeApplication) => {
    const nextStatus: SchemeApplication['status'] =
      existingRec.status === 'Sanctioned / Active'
        ? 'Pending Approval'
        : 'Sanctioned / Active';
    updateScheme({
      ...existingRec,
      status: nextStatus,
      sanctionedDate: nextStatus === 'Sanctioned / Active' ? new Date().toISOString().slice(0, 10) : existingRec.sanctionedDate
    });
  };

  const getStatusBadge = (status: SchemeApplication['status']) => {
    switch (status) {
      case 'Sanctioned / Active':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
            <span>Sanctioned / Active</span>
          </span>
        );
      case 'Pending Approval':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-700" />
            <span>Pending Approval</span>
          </span>
        );
      case 'Under Verification':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <Clock className="w-3 h-3 text-blue-700" />
            <span>Under Verification</span>
          </span>
        );
      case 'Document Required':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
            <FileText className="w-3 h-3 text-purple-700" />
            <span>Document Required</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
            <AlertCircle className="w-3 h-3 text-rose-700" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-800">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* ======================================================== */}
      {/* 1. HEADER & CLEAR DISTINCTION BANNER                    */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4.5 rounded-2xl border border-indigo-500/30 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-400/30 text-xl">
              🏛️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-base font-black text-white tracking-wide uppercase">
                  GOVERNMENT WELFARE SCHEMES CHECKLIST
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs border border-emerald-400/30">
                  {enrolledCount} of {MASTER_GOVT_SCHEMES.length} Enrolled (✅)
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Official State & Central Entitlements (PMAY, PM-KISAN, NFSA, Pensions, Subhadra)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                setIsAddingCustom(true);
                setEnrollMemberId(familyMembers[0]?.id || '');
                setEnrollStatus('Sanctioned / Active');
                setEnrollAmount('');
                setEnrollAppNo(`APP-CUST-${Date.now().toString().slice(-4)}`);
                setEnrollNotes('');
              }}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Other Scheme</span>
            </button>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('schemes')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
              >
                All Schemes →
              </button>
            )}
          </div>
        </div>

        {/* CLARIFICATION NOTE: SCHEME VS MY DIRECT ASSISTANCE */}
        <div className="mt-3.5 pt-3 border-t border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div className="bg-indigo-900/40 border border-indigo-400/30 p-2.5 rounded-xl flex items-start space-x-2">
            <span className="text-base">🏛️</span>
            <div>
              <strong className="text-indigo-200 block font-bold">Official Govt Welfare Schemes:</strong>
              <span className="text-slate-300">Statutory benefits sanctioned via BDO/Govt portals (Tick marked below with status ✅).</span>
            </div>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl flex items-start space-x-2">
            <span className="text-base">🤝</span>
            <div>
              <strong className="text-emerald-200 block font-bold">My Direct Assistance Record:</strong>
              <span className="text-slate-300">Personal social worker / representative aid (financial relief, food bags, direct help) logged separately below.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. FILTER & SEARCH STRIP                                */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center space-x-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              activeFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Programs ({MASTER_GOVT_SCHEMES.length + extraFamilySchemes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('ENROLLED')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center space-x-1 ${
              activeFilter === 'ENROLLED'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span>✅ Already Enrolled ({enrolledCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('AVAILABLE')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center space-x-1 ${
              activeFilter === 'AVAILABLE'
                ? 'bg-blue-700 text-white'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <span>➕ Available to Apply ({MASTER_GOVT_SCHEMES.length - MASTER_GOVT_SCHEMES.filter(m => !!getExistingSchemeRecord(m)).length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Search scheme name or benefit..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MASTER SCHEMES CHECKLIST GRID                        */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {MASTER_GOVT_SCHEMES
          .filter(m => {
            const rec = getExistingSchemeRecord(m);
            if (activeFilter === 'ENROLLED' && !rec) return false;
            if (activeFilter === 'AVAILABLE' && !!rec) return false;
            if (searchQuery) {
              const q = searchQuery.toLowerCase();
              return (
                m.name.toLowerCase().includes(q) ||
                m.category.toLowerCase().includes(q) ||
                m.description.toLowerCase().includes(q) ||
                (rec && (rec.applicantName.toLowerCase().includes(q) || rec.status.toLowerCase().includes(q)))
              );
            }
            return true;
          })
          .map(masterDef => {
            const existingRec = getExistingSchemeRecord(masterDef);
            const isEnrolled = !!existingRec;

            return (
              <div
                key={masterDef.key}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isEnrolled
                    ? 'bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 border-emerald-300 ring-1 ring-emerald-400/30 shadow-xs'
                    : 'bg-white hover:bg-slate-50/80 border-gray-200 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start space-x-2.5 min-w-0">
                    {/* Tick Mark or Available Badge */}
                    <div className="shrink-0 mt-0.5">
                      {isEnrolled ? (
                        <div
                          title="Already Enrolled / Active Scheme"
                          className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs ring-2 ring-emerald-200"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <div
                          title="Available to Apply"
                          className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 border border-slate-300 flex items-center justify-center font-bold text-xs"
                        >
                          {masterDef.icon}
                        </div>
                      )}
                    </div>

                    {/* Scheme Name & Category */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h5 className="font-extrabold text-xs text-gray-900 leading-tight">
                          {masterDef.name}
                        </h5>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {masterDef.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                        {masterDef.description}
                      </p>
                    </div>
                  </div>

                  {/* Top Right: Status Badge or Add Button */}
                  <div className="shrink-0">
                    {isEnrolled ? (
                      <div>{getStatusBadge(existingRec.status)}</div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenEnrollModal(masterDef)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Apply / Add</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Enrolled Details Card */}
                {isEnrolled && existingRec && (
                  <div className="mt-2.5 pt-2.5 border-t border-emerald-200/80 bg-emerald-100/30 p-2.5 rounded-xl space-y-1 text-xs">
                    <div className="flex flex-wrap items-center justify-between text-[11px] gap-2">
                      <span className="text-gray-700">
                        Beneficiary / Applicant: <strong className="text-emerald-950 font-bold">{existingRec.applicantName}</strong>
                      </span>
                      {existingRec.applicationNumber && (
                        <span className="font-mono text-[10px] text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                          {existingRec.applicationNumber}
                        </span>
                      )}
                    </div>

                    {existingRec.amountOrBenefit && (
                      <div className="text-[11px] text-emerald-900 font-semibold flex items-center space-x-1">
                        <span>Benefit:</span>
                        <span className="font-bold">{existingRec.amountOrBenefit}</span>
                      </div>
                    )}

                    {existingRec.notes && (
                      <p className="text-[10px] text-gray-600 italic">
                        "{existingRec.notes}"
                      </p>
                    )}

                    {/* Action Bar */}
                    <div className="pt-1.5 flex items-center justify-between text-[10px]">
                      <span className="text-gray-500">
                        Applied: {existingRec.appliedDate}
                        {existingRec.sanctionedDate && ` • Sanctioned: ${existingRec.sanctionedDate}`}
                      </span>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleQuickStatusToggle(existingRec)}
                          className="text-indigo-700 hover:text-indigo-900 font-bold hover:underline cursor-pointer"
                        >
                          {existingRec.status === 'Sanctioned / Active' ? 'Mark Pending' : 'Mark Sanctioned ✅'}
                        </button>
                        {onOpenQuickAdd && (
                          <button
                            type="button"
                            onClick={() => onOpenQuickAdd('scheme', existingRec)}
                            className="text-blue-600 hover:text-blue-800 font-bold hover:underline flex items-center space-x-0.5 cursor-pointer"
                            title="Edit Scheme Application details"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove ${existingRec.schemeName} application record?`)) {
                              deleteScheme(existingRec.id);
                            }
                          }}
                          className="text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer flex items-center space-x-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

        {/* Extra Custom Schemes not in master list */}
        {extraFamilySchemes.map(extraRec => (
          <div
            key={extraRec.id}
            className="p-3.5 rounded-2xl border bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 border-emerald-300 ring-1 ring-emerald-400/30 shadow-xs"
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-start space-x-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs ring-2 ring-emerald-200 shrink-0 mt-0.5">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-gray-900 leading-tight">
                    {extraRec.schemeName}
                  </h5>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 mt-0.5 inline-block">
                    Custom Welfare Scheme
                  </span>
                </div>
              </div>
              <div className="shrink-0">
                {getStatusBadge(extraRec.status)}
              </div>
            </div>

            <div className="mt-2.5 pt-2.5 border-t border-emerald-200/80 bg-emerald-100/30 p-2.5 rounded-xl space-y-1 text-xs">
              <div className="flex flex-wrap items-center justify-between text-[11px] gap-2">
                <span className="text-gray-700">
                  Beneficiary: <strong className="text-emerald-950 font-bold">{extraRec.applicantName}</strong>
                </span>
                {extraRec.applicationNumber && (
                  <span className="font-mono text-[10px] text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                    {extraRec.applicationNumber}
                  </span>
                )}
              </div>
              {extraRec.amountOrBenefit && (
                <div className="text-[11px] text-emerald-900 font-semibold">
                  Benefit: <strong>{extraRec.amountOrBenefit}</strong>
                </div>
              )}
              <div className="pt-1.5 flex items-center justify-between text-[10px]">
                <span className="text-gray-500">Applied: {extraRec.appliedDate}</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleQuickStatusToggle(extraRec)}
                    className="text-emerald-800 hover:text-emerald-950 font-bold hover:underline cursor-pointer"
                  >
                    {extraRec.status === 'Sanctioned / Active' ? 'Mark Pending' : 'Mark Sanctioned ✅'}
                  </button>
                  {onOpenQuickAdd && (
                    <button
                      type="button"
                      onClick={() => onOpenQuickAdd('scheme', extraRec)}
                      className="text-blue-600 hover:text-blue-800 font-bold hover:underline flex items-center space-x-0.5 cursor-pointer"
                      title="Edit Scheme Details"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Remove ${extraRec.schemeName} record?`)) {
                        deleteScheme(extraRec.id);
                      }
                    }}
                    className="text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer flex items-center space-x-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ======================================================== */}
      {/* 4. MODAL: ENROLL / APPLY IN SELECTED SCHEME             */}
      {/* ======================================================== */}
      {selectedSchemeToEnroll && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <span className="text-2xl">{selectedSchemeToEnroll.icon}</span>
                <div>
                  <h3 className="text-sm font-black tracking-wide">
                    Add Scheme: {selectedSchemeToEnroll.name}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Enrolling household of {family.familyHeadName} ({family.id})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSchemeToEnroll(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEnrollment} className="p-5 space-y-3.5 text-xs">
              {/* Applicant Member */}
              <div>
                <label className="block text-gray-800 font-bold mb-1">
                  Applicant / Beneficiary Family Member *
                </label>
                <select
                  value={enrollMemberId}
                  onChange={e => setEnrollMemberId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">{family.familyHeadName} (Family Head)</option>
                  {familyMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.relation}, Age: {m.age}, Gender: {m.gender})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-800 font-bold mb-1">
                    Application / Sanction Status *
                  </label>
                  <select
                    value={enrollStatus}
                    onChange={e => setEnrollStatus(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Sanctioned / Active">✅ Sanctioned / Active (Active Beneficiary)</option>
                    <option value="Pending Approval">⏳ Pending Approval (BDO / Portal)</option>
                    <option value="Under Verification">🔍 Under Verification (Field Survey)</option>
                    <option value="Document Required">📄 Document Required (Aadhaar / Land)</option>
                    <option value="Rejected">❌ Rejected / Ineligible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-800 font-bold mb-1">
                    Application / Beneficiary ID
                  </label>
                  <input
                    type="text"
                    value={enrollAppNo}
                    onChange={e => setEnrollAppNo(e.target.value)}
                    placeholder="e.g. OD-PMAY-2026-9901"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Benefit Details */}
              <div>
                <label className="block text-gray-800 font-bold mb-1">
                  Sanction Amount / Entitlement Details
                </label>
                <input
                  type="text"
                  value={enrollAmount}
                  onChange={e => setEnrollAmount(e.target.value)}
                  placeholder="e.g. ₹1,20,000 + 90 days MGNREGA"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-gray-800 font-bold mb-1">
                  Field Remarks / Office Follow-up Notes
                </label>
                <textarea
                  rows={2}
                  value={enrollNotes}
                  onChange={e => setEnrollNotes(e.target.value)}
                  placeholder="e.g. Geo-tagging photo taken; verified ration card and land record."
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-2.5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedSchemeToEnroll(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-sm flex items-center space-x-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Save Scheme Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MODAL: ADD CUSTOM WELFARE SCHEME                     */}
      {/* ======================================================== */}
      {isAddingCustom && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🏛️</span>
                <h3 className="text-sm font-black tracking-wide">
                  Add Custom Government Welfare Scheme
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingCustom(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomScheme} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-800 font-bold mb-1">
                  Scheme Program Name *
                </label>
                <input
                  type="text"
                  required
                  value={customSchemeName}
                  onChange={e => setCustomSchemeName(e.target.value)}
                  placeholder="e.g. State Fishery Subsidy / Cattle Shed Grant / Solar Pump"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-800 font-bold mb-1">
                  Applicant / Beneficiary Family Member *
                </label>
                <select
                  value={enrollMemberId}
                  onChange={e => setEnrollMemberId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">{family.familyHeadName} (Family Head)</option>
                  {familyMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.relation}, Age: {m.age})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-800 font-bold mb-1">
                    Application / Sanction Status *
                  </label>
                  <select
                    value={enrollStatus}
                    onChange={e => setEnrollStatus(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Sanctioned / Active">✅ Sanctioned / Active</option>
                    <option value="Pending Approval">⏳ Pending Approval</option>
                    <option value="Under Verification">🔍 Under Verification</option>
                    <option value="Document Required">📄 Document Required</option>
                    <option value="Rejected">❌ Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-800 font-bold mb-1">
                    Application Number
                  </label>
                  <input
                    type="text"
                    value={enrollAppNo}
                    onChange={e => setEnrollAppNo(e.target.value)}
                    placeholder="e.g. CUST-2026-009"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-800 font-bold mb-1">
                  Benefit / Subsidy Amount
                </label>
                <input
                  type="text"
                  value={enrollAmount}
                  onChange={e => setEnrollAmount(e.target.value)}
                  placeholder="e.g. ₹50,000 subsidy"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2.5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-sm flex items-center space-x-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Save Custom Scheme</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
