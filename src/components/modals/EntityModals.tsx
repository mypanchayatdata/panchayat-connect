import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { 
  CommunityProblem, 
  FollowUpTicket, 
  DevelopmentWork, 
  PersonalAssistance, 
  KeyPerson, 
  Temple, 
  CulturalEvent, 
  Reminder, 
  Village, 
  Ward, 
  PriorityLevel, 
  PersonCategory,
  DirectAssistanceType,
  DirectAssistanceStatus,
  SchemeApplication
} from '../../types';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  TicketCheck, 
  Hammer, 
  Users, 
  Landmark, 
  Calendar, 
  Bell, 
  Building,
  HeartHandshake,
  AlertCircle
} from 'lucide-react';

interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 
    | 'issue'
    | 'problem' 
    | 'ticket' 
    | 'devWork' 
    | 'assistance' 
    | 'scheme'
    | 'person' 
    | 'temple' 
    | 'event' 
    | 'reminder' 
    | 'village' 
    | 'ward';
  initialData?: any;
}

const SCHEME_MASTER_OPTIONS = [
  'PMAY (Pradhan Mantri Awas Yojana)',
  'PM-KISAN (Samman Nidhi)',
  'Old Age Pension (Madhu Babu / NSAP)',
  'Widow Pension (Madhu Babu / IGNWPS)',
  'Disability Pension (Madhu Babu / IGNDPS)',
  'NFSA Ration Food Security Card',
  'Ayushman Bharat / PM-JAY Health Card',
  'Subhadra Yojana (Women Financial Support)',
  'MGNREGA 100-Days Job Card',
  'Kalia Farmer Livelihood Scheme',
  'Pradhan Mantri Ujjwala LPG Gas Scheme',
  'Biju Swasthya Kalyan Yojana (BSKY)',
  'Mo Ghara Rural Housing',
  'Mission Shakti SHG Loan & Subsidies',
  'Other Government Welfare Scheme'
];

export const EntityModal: React.FC<GenericModalProps> = ({ isOpen, onClose, type, initialData }) => {
  const {
    panchayat,
    villages,
    wards,
    families,
    members,
    schemes,
    problems,
    tickets,
    devWorks,
    generateNextProblemId,
    generateNextTicketId,
    addProblem,
    updateProblem,
    addTicket,
    updateTicket,
    addDevWork,
    updateDevWork,
    addAssistance,
    updateAssistance,
    addScheme,
    updateScheme,
    addKeyPerson,
    updateKeyPerson,
    addTemple,
    updateTemple,
    addEvent,
    updateEvent,
    addReminder,
    addVillage,
    updateVillage,
    addWard,
    updateWard
  } = useDatabase();

  // Helper to determine initial assistance type
  const getInitialAssistanceType = (): DirectAssistanceType => {
    const raw = initialData?.assistanceType || initialData?.assistance_type;
    if (raw === 'SCHEME_ASSISTANCE' || raw === 'Scheme Assistance' || raw === 'Government Scheme Facilitation') {
      return 'SCHEME_ASSISTANCE';
    }
    if (raw === 'OTHER' || raw === 'Other') {
      return 'OTHER';
    }
    return 'PERSONAL_ASSISTANCE';
  };

  const getInitialAssistanceStatus = (): DirectAssistanceStatus => {
    const raw = initialData?.status;
    if (raw === 'DONE' || raw === 'Done' || raw === 'Completed' || raw === 'Sanctioned') return 'DONE';
    if (raw === 'APPLIED' || raw === 'Applied' || raw === 'In Progress') return 'APPLIED';
    return 'PENDING';
  };

  // Common Form States
  const [villageId, setVillageId] = useState(initialData?.villageId || villages[0]?.id || 'NGV001');
  const [wardId, setWardId] = useState(initialData?.wardId || wards[0]?.id || 'NGV001-W01');
  const [familyId, setFamilyId] = useState(initialData?.familyId || initialData?.family_id || families[0]?.id || '');
  const [title, setTitle] = useState(initialData?.title || initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [priority, setPriority] = useState<PriorityLevel>(initialData?.priority || 'Medium');
  const [status, setStatus] = useState(initialData?.status || 'Open');

  // Problem specific
  const [problemCategory, setProblemCategory] = useState<CommunityProblem['category']>(initialData?.category || 'Drinking Water / Borewell');
  const [reportedBy, setReportedBy] = useState(initialData?.reportedBy || '');
  const [contactNumber, setContactNumber] = useState(initialData?.contactNumber || initialData?.phone || '');
  const [officialDepartment, setOfficialDepartment] = useState(initialData?.officialDepartment || 'Gram Panchayat Kalyanpur');

  // Ticket specific
  const initialTicketScope: 'INDIVIDUAL_FAMILY' | 'COMMUNITY_VILLAGE_WARD' =
    initialData?.ticketScope ||
    (type === 'problem' || type === 'issue' || (initialData?.villageId && !initialData?.familyId)
      ? 'COMMUNITY_VILLAGE_WARD'
      : 'INDIVIDUAL_FAMILY');
  const [ticketScope, setTicketScope] = useState<'INDIVIDUAL_FAMILY' | 'COMMUNITY_VILLAGE_WARD'>(initialTicketScope);
  const [ticketHelpType, setTicketHelpType] = useState<string>(
    initialData?.helpType || (initialData?.category === 'Scheme Assistance' ? 'GOVT_SCHEME' : 'PERSONAL_HELP')
  );
  const [ticketCategory, setTicketCategory] = useState<FollowUpTicket['category']>(
    initialData?.category || (initialData?.helpType === 'GOVT_SCHEME' ? 'Scheme Assistance' : 'Educational Aid')
  );
  const [ticketSchemeName, setTicketSchemeName] = useState<string>(
    initialData?.schemeName || SCHEME_MASTER_OPTIONS[0]
  );
  const [ticketCustomSchemeName, setTicketCustomSchemeName] = useState<string>('');
  const [ticketMemberId, setTicketMemberId] = useState<string>(initialData?.memberId || '');
  const [ticketAmountOrBenefit, setTicketAmountOrBenefit] = useState<string>(initialData?.amountOrBenefit || '');
  const [ticketNotes, setTicketNotes] = useState<string>(initialData?.notes || '');
  const [ticketReportedBy, setTicketReportedBy] = useState<string>(initialData?.reportedBy || '');
  const [ticketContactNumber, setTicketContactNumber] = useState<string>(initialData?.contactNumber || '');
  const [targetDate, setTargetDate] = useState(initialData?.targetDate || new Date().toISOString().slice(0, 10));

  // Development Work
  const [schemeSource, setSchemeSource] = useState<DevelopmentWork['schemeSource']>(initialData?.schemeSource || '15th Finance Commission');
  const [budgetRs, setBudgetRs] = useState<number>(initialData?.budgetRs || 250000);
  const [progressPercentage, setProgressPercentage] = useState<number>(initialData?.progressPercentage || 0);

  // Direct Assistance States
  const [directType, setDirectType] = useState<DirectAssistanceType>(getInitialAssistanceType);
  const [assistanceMemberId, setAssistanceMemberId] = useState<string>(initialData?.memberId || initialData?.member_id || '');
  const [schemeName, setSchemeName] = useState<string>(initialData?.schemeName || initialData?.scheme_name || SCHEME_MASTER_OPTIONS[0]);
  const [customSchemeName, setCustomSchemeName] = useState<string>('');
  const [assistanceDate, setAssistanceDate] = useState<string>(initialData?.date || new Date().toISOString().slice(0, 10));
  const [assistanceStatus, setAssistanceStatus] = useState<DirectAssistanceStatus>(getInitialAssistanceStatus);
  const [assistanceNote, setAssistanceNote] = useState<string>(initialData?.note || initialData?.socialWorkerNotes || '');
  const [nextFollowupAt, setNextFollowupAt] = useState<string>(initialData?.nextFollowupAt || initialData?.next_followup_at || '');
  const [completionDate, setCompletionDate] = useState<string>(initialData?.completionDate || initialData?.completion_date || '');
  const [validationError, setValidationError] = useState<string>('');

  // Scheme Application Specific States
  const [schemeAppStatus, setSchemeAppStatus] = useState<SchemeApplication['status']>(initialData?.status || 'Sanctioned / Active');
  const [schemeAppNumber, setSchemeAppNumber] = useState<string>(initialData?.applicationNumber || '');
  const [schemeBenefitAmount, setSchemeBenefitAmount] = useState<string>(initialData?.amountOrBenefit || '');
  const [schemeAppliedDate, setSchemeAppliedDate] = useState<string>(initialData?.appliedDate || new Date().toISOString().slice(0, 10));
  const [schemeSanctionedDate, setSchemeSanctionedDate] = useState<string>(initialData?.sanctionedDate || (initialData?.status === 'Sanctioned / Active' ? new Date().toISOString().slice(0, 10) : ''));
  const [schemeNotes, setSchemeNotes] = useState<string>(initialData?.notes || '');

  // Key Person
  const [personCategory, setPersonCategory] = useState<PersonCategory>(initialData?.category || 'Youth Leader');
  const [designation, setDesignation] = useState(initialData?.designation || '');

  // Temple
  const [deity, setDeity] = useState(initialData?.deity || '');
  const [majorFestival, setMajorFestival] = useState(initialData?.majorFestival || '');

  // Event
  const [eventType, setEventType] = useState<CulturalEvent['type']>(initialData?.type || 'Festival');
  const [venue, setVenue] = useState(initialData?.venue || '');
  const [estimatedDateOrMonth, setEstimatedDateOrMonth] = useState(initialData?.estimatedDateOrMonth || '');

  // Reminder
  const [reminderDueDate, setReminderDueDate] = useState(initialData?.dueDate || new Date().toISOString().slice(0, 10));
  const [reminderDueTime, setReminderDueTime] = useState(initialData?.dueTime || '10:00 AM');

  // Village
  const [villageCode, setVillageCode] = useState(initialData?.code || 'VIL00' + (villages.length + 1));

  // Ward
  const [wardNumber, setWardNumber] = useState<number>(initialData?.wardNumber || wards.length + 1);
  const [wardMemberName, setWardMemberName] = useState(initialData?.wardMemberName || '');

  // Synchronize state when initialData or type or isOpen changes
  React.useEffect(() => {
    if (!isOpen) return;
    setValidationError('');
    setVillageId(initialData?.villageId || villages[0]?.id || 'NGV001');
    setWardId(initialData?.wardId || wards[0]?.id || 'NGV001-W01');
    setFamilyId(initialData?.familyId || initialData?.family_id || families[0]?.id || '');
    setTitle(initialData?.title || initialData?.name || '');
    setDescription(initialData?.description || '');
    setPriority(initialData?.priority || 'Medium');
    setStatus(initialData?.status || (type === 'assistance' ? getInitialAssistanceStatus() : 'Open'));

    // Problem
    setProblemCategory(initialData?.category || 'Drinking Water / Borewell');
    setReportedBy(initialData?.reportedBy || '');
    setContactNumber(initialData?.contactNumber || initialData?.phone || '');
    setOfficialDepartment(initialData?.officialDepartment || 'Gram Panchayat Kalyanpur');

    // Ticket
    const resolvedScope: 'INDIVIDUAL_FAMILY' | 'COMMUNITY_VILLAGE_WARD' =
      initialData?.ticketScope ||
      (type === 'problem' || type === 'issue' || (initialData?.villageId && !initialData?.familyId)
        ? 'COMMUNITY_VILLAGE_WARD'
        : 'INDIVIDUAL_FAMILY');
    setTicketScope(resolvedScope);
    const resolvedHelpType = initialData?.helpType || (initialData?.category === 'Scheme Assistance' ? 'GOVT_SCHEME' : 'PERSONAL_HELP');
    setTicketHelpType(resolvedHelpType);
    setTicketCategory(initialData?.category || (resolvedHelpType === 'GOVT_SCHEME' ? 'Scheme Assistance' : 'Educational Aid'));
    setTicketSchemeName(initialData?.schemeName || SCHEME_MASTER_OPTIONS[0]);
    setTicketCustomSchemeName('');
    setTicketMemberId(initialData?.memberId || '');
    setTicketAmountOrBenefit(initialData?.amountOrBenefit || '');
    setTicketNotes(initialData?.notes || '');
    setTicketReportedBy(initialData?.reportedBy || '');
    setTicketContactNumber(initialData?.contactNumber || '');
    setTargetDate(initialData?.targetDate || new Date().toISOString().slice(0, 10));

    // DevWork
    setSchemeSource(initialData?.schemeSource || '15th Finance Commission');
    setBudgetRs(initialData?.budgetRs ?? 250000);
    setProgressPercentage(initialData?.progressPercentage ?? 0);

    // Direct Assistance
    setDirectType(getInitialAssistanceType());
    setAssistanceMemberId(initialData?.memberId || initialData?.member_id || '');
    setSchemeName(initialData?.schemeName || initialData?.scheme_name || SCHEME_MASTER_OPTIONS[0]);
    setCustomSchemeName('');
    setAssistanceDate(initialData?.date || new Date().toISOString().slice(0, 10));
    setAssistanceStatus(getInitialAssistanceStatus());
    setAssistanceNote(initialData?.note || initialData?.socialWorkerNotes || '');
    setNextFollowupAt(initialData?.nextFollowupAt || initialData?.next_followup_at || '');
    setCompletionDate(initialData?.completionDate || initialData?.completion_date || '');

    // Scheme application
    setSchemeAppStatus(initialData?.status || 'Sanctioned / Active');
    setSchemeAppNumber(initialData?.applicationNumber || '');
    setSchemeBenefitAmount(initialData?.amountOrBenefit || '');
    setSchemeAppliedDate(initialData?.appliedDate || new Date().toISOString().slice(0, 10));
    setSchemeSanctionedDate(initialData?.sanctionedDate || (initialData?.status === 'Sanctioned / Active' ? new Date().toISOString().slice(0, 10) : ''));
    setSchemeNotes(initialData?.notes || '');

    // Key person
    setPersonCategory(initialData?.category || 'Youth Leader');
    setDesignation(initialData?.designation || '');

    // Temple
    setDeity(initialData?.deity || '');
    setMajorFestival(initialData?.majorFestival || '');

    // Event
    setEventType(initialData?.type || 'Festival');
    setVenue(initialData?.venue || '');
    setEstimatedDateOrMonth(initialData?.estimatedDateOrMonth || '');

    // Reminder
    setReminderDueDate(initialData?.dueDate || new Date().toISOString().slice(0, 10));
    setReminderDueTime(initialData?.dueTime || '10:00 AM');

    // Village / Ward
    setVillageCode(initialData?.code || initialData?.id || ('VIL00' + (villages.length + 1)));
    if (initialData?.wardNumber) {
      setWardNumber(initialData.wardNumber);
    } else {
      const targetVId = initialData?.villageId || villages[0]?.id || 'NGV001';
      const vWards = wards.filter(w => w.villageId === targetVId);
      const maxWNum = vWards.length > 0 ? Math.max(...vWards.map(w => w.wardNumber || 0)) : 0;
      setWardNumber(maxWNum + 1);
    }
    setWardMemberName(initialData?.wardMemberName || '');
    if (type === 'ward' && initialData) {
      setContactNumber(initialData.contactNumber || initialData.phone || '');
      setDescription(initialData.areaDescription || initialData.description || '');
    }
  }, [isOpen, initialData, type, villages, wards]);

  if (!isOpen) return null;

  // Selected family members list for dropdown
  const selectedFamilyMembers = members.filter(m => m.familyId === familyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    const todayStr = new Date().toISOString().slice(0, 10);

    if (type === 'issue' || type === 'problem' || type === 'ticket') {
      const isCommunity = ticketScope === 'COMMUNITY_VILLAGE_WARD';

      if (isCommunity) {
        // Community Problem / Issue -> Stored in problems (Community Problems section)
        const pid = initialData?.id || generateNextProblemId(wardId);
        const isSolved = status === 'Completed' || status === 'Resolved' || status === 'Closed';
        const problemObj: CommunityProblem = {
          id: pid,
          villageId,
          wardId,
          title: title.trim() || `${problemCategory} Issue`,
          category: problemCategory,
          priority,
          status: isSolved ? 'Completed' : (status === 'In Progress' ? 'In Progress' : 'Open'),
          reportedDate: initialData?.reportedDate || initialData?.createdDate || todayStr,
          reportedBy: ticketReportedBy.trim() || reportedBy.trim() || 'Ward Resident',
          contactNumber: ticketContactNumber.trim() || contactNumber.trim() || undefined,
          officialDepartment: officialDepartment.trim() || 'Gram Panchayat Kalyanpur',
          latestAction: isSolved ? (description.trim() || `Issue resolved and verified on ${todayStr}`) : undefined,
          actionTaken: isSolved ? (description.trim() || `Issue resolved and verified on ${todayStr}`) : undefined,
          description: description.trim() || title.trim() || `${problemCategory} Issue`,
          resolvedDate: isSolved ? (initialData?.resolvedDate || todayStr) : undefined
        };
        if (initialData?.id && problems.some(p => p.id === initialData.id)) {
          updateProblem(problemObj);
        } else {
          addProblem(problemObj);
        }
      } else {
        // Individual / Family Issue -> Stored in tickets & linked to Family Profile & auto-synced to assistance
        const targetFamilyId = familyId || families[0]?.id || 'NGV001-W01-F001';
        const tid = initialData?.id || generateNextTicketId(targetFamilyId);
        const isSolved = status === 'Resolved' || status === 'Closed' || status === 'Completed';

        const finalScheme = (ticketHelpType === 'GOVT_SCHEME')
          ? (ticketSchemeName === 'Other Government Welfare Scheme' && ticketCustomSchemeName.trim() ? ticketCustomSchemeName.trim() : ticketSchemeName)
          : undefined;

        let finalCategory: FollowUpTicket['category'] = ticketCategory;
        if (ticketHelpType === 'GOVT_SCHEME') finalCategory = 'Scheme Assistance';
        else if (ticketHelpType === 'PERSONAL_HELP') finalCategory = 'Educational Aid';
        else if (ticketHelpType === 'PENSION') finalCategory = 'Pension Issue';
        else if (ticketHelpType === 'MEDICAL_AID') finalCategory = 'Health Assistance';
        else if (ticketHelpType === 'DOCUMENTATION') finalCategory = 'Aadhaar / Documentation';
        else if (ticketHelpType === 'DISPUTE') finalCategory = 'Dispute / Grievance';

        const defaultTitle = finalScheme ? `${finalScheme} Assistance Request` : `${finalCategory} Grievance`;

        const ticketObj: FollowUpTicket = {
          id: tid,
          ticketScope: 'INDIVIDUAL_FAMILY',
          ticketType: ticketHelpType === 'GOVT_SCHEME' ? 'scheme' : 'personal_help',
          familyId: targetFamilyId,
          memberId: ticketMemberId || undefined,
          villageId: families.find(f => f.id === targetFamilyId)?.villageId || villageId,
          wardId: families.find(f => f.id === targetFamilyId)?.wardId || wardId,
          title: title.trim() || defaultTitle,
          category: finalCategory,
          priority,
          status: isSolved ? 'Resolved' : (status as any),
          assignedTo: 'Social Worker (Field Admin)',
          createdDate: initialData?.createdDate || todayStr,
          targetDate: targetDate || todayStr,
          resolvedDate: isSolved ? (initialData?.resolvedDate || todayStr) : undefined,
          description: description.trim() || title.trim() || defaultTitle,
          notes: ticketNotes.trim() || undefined,
          helpType: ticketHelpType as any,
          schemeName: finalScheme,
          amountOrBenefit: ticketAmountOrBenefit.trim() || undefined,
          contactNumber: ticketContactNumber.trim() || contactNumber.trim() || undefined,
          reportedBy: ticketReportedBy.trim() || reportedBy.trim() || undefined,
          autoSyncAssistance: true
        };
        if (initialData?.id && tickets.some(t => t.id === initialData.id)) {
          updateTicket(ticketObj);
        } else {
          addTicket(ticketObj);
        }
      }
    } else if (type === 'devWork') {
      const dwId = initialData?.id || `DW-${villageId.slice(0, 2)}-00${devWorks.length + 1}`;
      const dwObj: DevelopmentWork = {
        id: dwId,
        villageId,
        wardId,
        title: title || 'Public Infrastructure Work',
        schemeSource,
        budgetRs: Number(budgetRs) || 100000,
        sanctionedAmountRs: Number(budgetRs) || 100000,
        status: status as any,
        startDate: todayStr,
        progressPercentage: Number(progressPercentage) || 0,
        description: description || title
      };
      if (initialData?.id) updateDevWork(dwObj);
      else addDevWork(dwObj);
    } else if (type === 'assistance') {
      // Validation for Personal and Other notes
      const trimmedNote = (assistanceNote || '').trim();
      if (directType === 'PERSONAL_ASSISTANCE' && !trimmedNote) {
        setValidationError('Personal Assistance Note is required. Please describe the personal assistance/help provided.');
        return;
      }
      if (directType === 'OTHER' && !trimmedNote) {
        setValidationError('Other Assistance Note is required. Please describe what assistance was provided.');
        return;
      }

      const targetFamilyId = familyId || initialData?.familyId || initialData?.family_id || families[0]?.id || '';
      const selFamily = families.find(f => f.id === targetFamilyId);
      const selMember = members.find(m => m.id === assistanceMemberId);
      const beneName = selMember ? selMember.name : (selFamily ? `${selFamily.familyHeadName} (Head)` : 'Citizen');

      const finalScheme = directType === 'SCHEME_ASSISTANCE'
        ? (schemeName === 'Other Government Welfare Scheme' && customSchemeName.trim() ? customSchemeName.trim() : schemeName)
        : undefined;

      const astId = initialData?.id || initialData?.assistance_id || `AST-2026-00${Date.now().toString().slice(-4)}`;
      const now = new Date().toISOString();

      const astObj: PersonalAssistance = {
        id: astId,
        assistance_id: astId,
        familyId: targetFamilyId,
        family_id: targetFamilyId,
        memberId: assistanceMemberId || undefined,
        member_id: assistanceMemberId || undefined,
        beneficiaryName: beneName,
        villageId: selFamily?.villageId || villageId,
        wardId: selFamily?.wardId || wardId,
        assistanceType: directType,
        assistance_type: directType,
        schemeId: finalScheme,
        scheme_id: finalScheme,
        schemeName: finalScheme,
        note: trimmedNote || undefined,
        description: description.trim() || (
          directType === 'SCHEME_ASSISTANCE'
            ? `${finalScheme} facilitation for family`
            : trimmedNote
        ),
        date: assistanceDate || todayStr,
        status: assistanceStatus,
        nextFollowupAt: nextFollowupAt || undefined,
        next_followup_at: nextFollowupAt || undefined,
        completionDate: assistanceStatus === 'DONE' ? (completionDate || assistanceDate || todayStr) : (completionDate || undefined),
        completion_date: assistanceStatus === 'DONE' ? (completionDate || assistanceDate || todayStr) : (completionDate || undefined),
        createdAt: initialData?.createdAt || initialData?.created_at || now,
        created_at: initialData?.createdAt || initialData?.created_at || now,
        updatedAt: now,
        updated_at: now,
        createdBy: initialData?.createdBy || initialData?.created_by || 'Admin',
        created_by: initialData?.createdBy || initialData?.created_by || 'Admin'
      };

      if (initialData?.id || initialData?.assistance_id) {
        updateAssistance(astObj);
      } else {
        addAssistance(astObj);
      }
    } else if (type === 'scheme') {
      const selectedFam = families.find(f => f.id === familyId);
      const applicantMember = members.find(m => m.id === assistanceMemberId);
      const applicantName = applicantMember ? applicantMember.name : (selectedFam?.familyHeadName || 'Citizen');
      const finalScheme = schemeName === 'Other Government Welfare Scheme' && customSchemeName.trim()
        ? customSchemeName.trim()
        : schemeName;

      const schId = initialData?.id || `SCH-${Date.now().toString().slice(-4)}`;
      const schObj: SchemeApplication = {
        id: schId,
        schemeName: finalScheme,
        familyId,
        memberId: assistanceMemberId || undefined,
        villageId: selectedFam?.villageId || villageId,
        wardId: selectedFam?.wardId || wardId,
        applicantName,
        status: schemeAppStatus,
        appliedDate: schemeAppliedDate || todayStr,
        sanctionedDate: schemeAppStatus === 'Sanctioned / Active' ? (schemeSanctionedDate || todayStr) : (schemeSanctionedDate || undefined),
        amountOrBenefit: schemeBenefitAmount || undefined,
        applicationNumber: schemeAppNumber || `OD-SCH-${Date.now().toString().slice(-6)}`,
        notes: schemeNotes || description || undefined
      };

      if (initialData?.id) {
        updateScheme(schObj);
      } else {
        addScheme(schObj);
      }
    } else if (type === 'person') {
      const kpId = initialData?.id || `KP-00${Date.now().toString().slice(-3)}`;
      const kpObj: KeyPerson = {
        id: kpId,
        name: title || 'Key Community Stakeholder',
        category: personCategory,
        villageId,
        wardId,
        phone: contactNumber || '+91 94370 00000',
        designation,
        notes: description
      };
      if (initialData?.id) updateKeyPerson(kpObj);
      else addKeyPerson(kpObj);
    } else if (type === 'temple') {
      const tmId = initialData?.id || `TM-${villageId.slice(0, 2)}-00${Date.now().toString().slice(-3)}`;
      const tmObj: Temple = {
        id: tmId,
        villageId,
        wardId,
        name: title || 'Village Temple',
        deity: deity || 'Deity',
        majorFestival: majorFestival || 'Annual Mela',
        facilityStatus: 'Good',
        description
      };
      if (initialData?.id) updateTemple(tmObj);
      else addTemple(tmObj);
    } else if (type === 'event') {
      const evId = initialData?.id || `EV-${villageId.slice(0, 2)}-00${Date.now().toString().slice(-3)}`;
      const evObj: CulturalEvent = {
        id: evId,
        villageId,
        name: title || 'Village Cultural Event',
        type: eventType,
        estimatedDateOrMonth: estimatedDateOrMonth || 'Upcoming',
        leadOrganizers: reportedBy || 'Village Committee',
        venue: venue || 'Village Main Ground',
        description
      };
      if (initialData?.id) updateEvent(evObj);
      else addEvent(evObj);
    } else if (type === 'reminder') {
      const remId = initialData?.id || `REM-00${Date.now().toString().slice(-3)}`;
      const remObj: Reminder = {
        id: remId,
        title: title || 'Field Reminder',
        dueDate: reminderDueDate,
        dueTime: reminderDueTime,
        priority,
        relatedEntityType: 'General',
        completed: false,
        notes: description
      };
      addReminder(remObj);
    } else if (type === 'village') {
      const vId = initialData?.id || villageCode.trim() || ('VIL00' + (villages.length + 1));
      const vObj: Village = {
        id: vId,
        panchayatId: panchayat.id,
        code: villageCode.trim() || vId,
        name: title.trim() || 'New Village',
        description: description.trim()
      };
      if (initialData?.id || villages.some(v => v.id === vId)) updateVillage(vObj);
      else addVillage(vObj);
    } else if (type === 'ward') {
      const targetVilId = villageId || (initialData?.villageId) || villages[0]?.id || 'NGV001';
      const wId = initialData?.id || `${targetVilId}-W${Number(wardNumber).toString().padStart(2, '0')}`;
      const wObj: Ward = {
        id: wId,
        villageId: targetVilId,
        wardNumber: Number(wardNumber) || 1,
        wardMemberName: wardMemberName.trim() || 'Ward Representative',
        contactNumber: contactNumber.trim() || '+91 94370 00000',
        areaDescription: description.trim()
      };
      if (initialData?.id || wards.some(w => w.id === wId)) updateWard(wObj);
      else addWard(wObj);
    }

    onClose();
  };

  const getHeaderInfo = () => {
    switch (type) {
      case 'issue': return { title: initialData ? 'Edit Issue / Grievance' : 'Report an Issue (Community / Individual)', icon: <AlertTriangle className="w-5 h-5 text-rose-500" /> };
      case 'problem': return { title: initialData ? 'Edit Community Problem / Issue' : 'Report Community Problem / Issue', icon: <AlertTriangle className="w-5 h-5 text-amber-500" /> };
      case 'ticket': return { title: initialData ? 'Edit Individual / Family Issue Ticket' : 'Report Individual / Family Issue', icon: <TicketCheck className="w-5 h-5 text-purple-500" /> };
      case 'devWork': return { title: initialData ? 'Edit Development & Infrastructure Work' : 'Development & Infrastructure Work', icon: <Hammer className="w-5 h-5 text-blue-500" /> };
      case 'assistance': return { title: initialData ? 'Edit Direct Citizen Assistance' : 'MY DIRECT ASSISTANCE', icon: <HeartHandshake className="w-5 h-5 text-emerald-400" /> };
      case 'scheme': return { title: initialData ? 'Edit Scheme Application Record' : 'Government Welfare Scheme Enrollment', icon: <Building className="w-5 h-5 text-indigo-400" /> };
      case 'person': return { title: initialData ? 'Edit Stakeholder Profile' : 'Community Leader / Key Stakeholder', icon: <Users className="w-5 h-5 text-teal-500" /> };
      case 'temple': return { title: initialData ? 'Edit Temple Details' : 'Village Temple / Religious Facility', icon: <Landmark className="w-5 h-5 text-orange-500" /> };
      case 'event': return { title: initialData ? 'Edit Cultural Event' : 'Cultural Event / Festival', icon: <Calendar className="w-5 h-5 text-pink-500" /> };
      case 'reminder': return { title: initialData ? 'Edit Follow-up Task' : 'Add Task / Follow-up Reminder', icon: <Bell className="w-5 h-5 text-amber-500" /> };
      case 'village': return { title: initialData ? `Edit Village: ${initialData.name || initialData.code || ''}` : 'Add Village to Panchayat', icon: <Building className="w-5 h-5 text-indigo-500" /> };
      case 'ward': return { title: initialData ? `Edit Ward ${initialData.wardNumber || ''} Details` : 'Add Ward to Village', icon: <Building className="w-5 h-5 text-indigo-500" /> };
    }
  };

  const header = getHeaderInfo();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900 text-white">
          <div className="flex items-center space-x-2.5">
            {header.icon}
            <div>
              <h3 className="text-base font-black tracking-wide">
                {initialData ? `Edit ${header.title}` : `Record ${header.title}`}
              </h3>
              {type === 'assistance' && (
                <p className="text-[11px] text-slate-300">
                  Combined Scheme Assistance, Personal Assistance & Other Help
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start space-x-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* SPECIALIZED FORM FOR: MY DIRECT ASSISTANCE               */}
          {/* ======================================================== */}
          {type === 'assistance' ? (
            <div className="space-y-4">
              {/* 1. ASSISTANCE TYPE SELECTOR */}
              <div>
                <label className="block text-slate-800 font-bold mb-1.5 uppercase text-[11px] tracking-wider">
                  Assistance Type *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setDirectType('SCHEME_ASSISTANCE'); setValidationError(''); }}
                    className={`py-2.5 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      directType === 'SCHEME_ASSISTANCE'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-sm mb-0.5">🏛️</div>
                    <div className="text-xs">Scheme Assistance</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setDirectType('PERSONAL_ASSISTANCE'); setValidationError(''); }}
                    className={`py-2.5 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      directType === 'PERSONAL_ASSISTANCE'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-sm mb-0.5">🤝</div>
                    <div className="text-xs">Personal Assistance</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setDirectType('OTHER'); setValidationError(''); }}
                    className={`py-2.5 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      directType === 'OTHER'
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-sm mb-0.5">📦</div>
                    <div className="text-xs">Other</div>
                  </button>
                </div>
              </div>

              {/* 2. LINKED FAMILY & MEMBER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    Family / Household *
                  </label>
                  <select
                    value={familyId || ''}
                    onChange={e => {
                      setFamilyId(e.target.value);
                      setAssistanceMemberId('');
                    }}
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {families.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.familyHeadName} ({f.id}) - {f.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    Beneficiary Member (Optional)
                  </label>
                  <select
                    value={assistanceMemberId || ''}
                    onChange={e => setAssistanceMemberId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="">Entire Family / Family Head</option>
                    {selectedFamilyMembers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.relationWithHead || 'Member'}, Age: {m.age})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. DATE & STATUS WORKFLOW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={assistanceDate || ''}
                    onChange={e => setAssistanceDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">Status Workflow *</label>
                  <select
                    value={assistanceStatus || 'PENDING'}
                    onChange={e => setAssistanceStatus(e.target.value as DirectAssistanceStatus)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="PENDING">🟡 PENDING (Follow-up required)</option>
                    <option value="APPLIED">🔵 APPLIED (Submitted / In Progress)</option>
                    <option value="DONE">🟢 DONE (Completed & Saved)</option>
                  </select>
                </div>
              </div>

              {/* 4. CONDITIONAL FIELDS: SCHEME ASSISTANCE */}
              {directType === 'SCHEME_ASSISTANCE' && (
                <div className="space-y-3 p-3.5 bg-blue-50/70 rounded-xl border border-blue-200">
                  <div className="text-[11px] font-extrabold uppercase text-blue-900 flex items-center space-x-1.5">
                    <span>🏛️ Scheme Master Connection</span>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Scheme Name *</label>
                    <select
                      value={schemeName || ''}
                      onChange={e => setSchemeName(e.target.value)}
                      className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    >
                      {SCHEME_MASTER_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {schemeName === 'Other Government Welfare Scheme' && (
                    <div>
                      <label className="block text-slate-800 font-bold mb-1">Specify Custom Scheme Name *</label>
                      <input
                        type="text"
                        placeholder="Enter government scheme name"
                        value={customSchemeName || ''}
                        onChange={e => setCustomSchemeName(e.target.value)}
                        className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Description / Application Details</label>
                    <input
                      type="text"
                      placeholder="e.g. Facilitated biometric e-KYC and submitted BDO application."
                      value={description || ''}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Scheme Note</label>
                    <textarea
                      rows={2}
                      placeholder="Enter specific scheme progress note or remarks..."
                      value={assistanceNote || ''}
                      onChange={e => setAssistanceNote(e.target.value)}
                      className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* 5. CONDITIONAL FIELDS: PERSONAL ASSISTANCE */}
              {directType === 'PERSONAL_ASSISTANCE' && (
                <div className="space-y-3 p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase text-emerald-900">
                      🤝 Personal Direct Help
                    </span>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Note is strictly required
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-900 font-extrabold mb-1">
                      PERSONAL ASSISTANCE NOTE <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Example: Helped the family with land document correction."
                      value={assistanceNote || ''}
                      onChange={e => {
                        setAssistanceNote(e.target.value);
                        if (validationError) setValidationError('');
                      }}
                      className="w-full bg-white border-2 border-emerald-400 rounded-lg px-3 py-2 text-slate-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                    />
                    <p className="text-[10px] text-emerald-800 mt-1">
                      This note will be permanently connected to this Family Profile.
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-semibold mb-1">Additional Details (Optional)</label>
                    <input
                      type="text"
                      placeholder="Additional context or outcome notes..."
                      value={description || ''}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* 6. CONDITIONAL FIELDS: OTHER ASSISTANCE */}
              {directType === 'OTHER' && (
                <div className="space-y-3 p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase text-indigo-900">
                      📦 Other Local Assistance
                    </span>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Note is strictly required
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-900 font-extrabold mb-1">
                      OTHER ASSISTANCE NOTE <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Example: Helped the family with another local administrative matter."
                      value={assistanceNote || ''}
                      onChange={e => {
                        setAssistanceNote(e.target.value);
                        if (validationError) setValidationError('');
                      }}
                      className="w-full bg-white border-2 border-indigo-400 rounded-lg px-3 py-2 text-slate-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                    />
                    <p className="text-[10px] text-indigo-800 mt-1">
                      Save this note with the assistance record.
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-semibold mb-1">Additional Details (Optional)</label>
                    <input
                      type="text"
                      placeholder="Additional details..."
                      value={description || ''}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full bg-white border border-indigo-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* 7. NEXT FOLLOW-UP & COMPLETION DATE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-800 font-semibold mb-1">Next Follow-up Date (Optional)</label>
                  <input
                    type="date"
                    value={nextFollowupAt || ''}
                    onChange={e => setNextFollowupAt(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-semibold mb-1">Completion Date (Optional)</label>
                  <input
                    type="date"
                    value={completionDate || ''}
                    onChange={e => setCompletionDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          ) : type === 'scheme' ? (
            /* ======================================================== */
            /* SPECIALIZED FORM FOR: GOVERNMENT WELFARE SCHEME          */
            /* ======================================================== */
            <div className="space-y-4">
              {/* Clarification banner */}
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-xs flex items-start space-x-2">
                <span className="text-base shrink-0">🏛️</span>
                <div>
                  <strong className="block font-bold">Official Government Welfare Scheme Record</strong>
                  <span className="text-indigo-800 text-[11px]">
                    Track statutory central/state entitlements (PMAY, PM-KISAN, NFSA, Pensions, Subhadra). These will appear with a green tick mark (✅) on the family profile.
                  </span>
                </div>
              </div>

              {/* Scheme Program Selector */}
              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  Government Welfare Scheme Name *
                </label>
                <select
                  value={schemeName || ''}
                  onChange={e => setSchemeName(e.target.value)}
                  className="w-full bg-white border border-indigo-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {SCHEME_MASTER_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {schemeName === 'Other Government Welfare Scheme' && (
                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    Specify Custom Welfare Scheme Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter official scheme name..."
                    value={customSchemeName || ''}
                    onChange={e => setCustomSchemeName(e.target.value)}
                    className="w-full bg-white border border-indigo-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {/* Linked Household & Member */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    Target Family / Household *
                  </label>
                  <select
                    value={familyId || ''}
                    onChange={e => {
                      setFamilyId(e.target.value);
                      setAssistanceMemberId('');
                    }}
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    {families.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.familyHeadName} ({f.id}) - {f.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    Applicant / Beneficiary Member
                  </label>
                  <select
                    value={assistanceMemberId || ''}
                    onChange={e => setAssistanceMemberId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Entire Family / Family Head</option>
                    {selectedFamilyMembers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.relationWithHead || m.relation || 'Member'}, Age: {m.age})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status & Application Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    Sanction / Workflow Status *
                  </label>
                  <select
                    value={schemeAppStatus || 'Sanctioned / Active'}
                    onChange={e => setSchemeAppStatus(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Sanctioned / Active">✅ Sanctioned / Active (Enrolled Beneficiary)</option>
                    <option value="Pending Approval">⏳ Pending Approval (BDO / Block Office)</option>
                    <option value="Under Verification">🔍 Under Verification (Field Inquiry)</option>
                    <option value="Document Required">📄 Document Required (Aadhaar / Land Proof)</option>
                    <option value="Rejected">❌ Rejected / Ineligible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    Govt Application / Portal Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. OD-PMAYG-2026-8819"
                    value={schemeAppNumber || ''}
                    onChange={e => setSchemeAppNumber(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Amount / Benefit & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-slate-800 font-bold mb-1">
                    Benefit / Subsidy
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹1,20,000"
                    value={schemeBenefitAmount || ''}
                    onChange={e => setSchemeBenefitAmount(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">Applied Date</label>
                  <input
                    type="date"
                    value={schemeAppliedDate || ''}
                    onChange={e => setSchemeAppliedDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">Sanction Date</label>
                  <input
                    type="date"
                    value={schemeSanctionedDate || ''}
                    onChange={e => setSchemeSanctionedDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  Field Remarks / Office Follow-up Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Facilitated biometric e-KYC and submitted BDO application."
                  value={schemeNotes || ''}
                  onChange={e => setSchemeNotes(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          ) : (type === 'ticket' || type === 'problem' || type === 'issue') ? (
            /* ======================================================== */
            /* UNIFIED ISSUE FORM: COMMUNITY vs INDIVIDUAL/FAMILY       */
            /* ======================================================== */
            <div className="space-y-4">
              {/* Scope & Level Selector */}
              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs uppercase tracking-wider">
                  Issue Scope & Classification *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTicketScope('COMMUNITY_VILLAGE_WARD')}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start space-x-2.5 cursor-pointer ${
                      ticketScope === 'COMMUNITY_VILLAGE_WARD'
                        ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-400/40 text-amber-950 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${ticketScope === 'COMMUNITY_VILLAGE_WARD' ? 'text-amber-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-extrabold text-xs">🏘️ Community Problem / Issue</div>
                      <div className="text-[10px] text-slate-500 font-medium">Village & Ward: Water, Roads, Power, Sanitation</div>
                      <span className="inline-block mt-1 text-[9px] font-bold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded">
                        Stored in: Community Section
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTicketScope('INDIVIDUAL_FAMILY')}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start space-x-2.5 cursor-pointer ${
                      ticketScope === 'INDIVIDUAL_FAMILY'
                        ? 'bg-purple-50/90 border-purple-500 ring-2 ring-purple-400/40 text-purple-950 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <HeartHandshake className={`w-5 h-5 shrink-0 mt-0.5 ${ticketScope === 'INDIVIDUAL_FAMILY' ? 'text-purple-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-extrabold text-xs">👤 Individual / Family Issue</div>
                      <div className="text-[10px] text-slate-500 font-medium">Household grievance, Govt schemes, Pension, Relief</div>
                      <span className="inline-block mt-1 text-[9px] font-bold text-purple-800 bg-purple-100/70 px-1.5 py-0.5 rounded">
                        Stored in: Family Profile
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* INDIVIDUAL / FAMILY HELP SECTION */}
              {ticketScope === 'INDIVIDUAL_FAMILY' ? (
                <div className="space-y-3.5 bg-purple-50/40 p-3.5 rounded-xl border border-purple-200/80">
                  {/* Auto-sync Notification Banner */}
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg flex items-start space-x-2 text-emerald-900 text-[11px]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Auto-Sync to My Assistance: </span>
                      Tickets for Govt Schemes and Personal Help automatically sync with the <span className="font-semibold underline">My Direct Assistance</span> pane. Solving or updating the ticket will keep the history synced!
                    </div>
                  </div>

                  {/* Target Family Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-800 font-bold mb-1 text-xs">
                        Target Household / Family *
                      </label>
                      <select
                        required
                        value={familyId || ''}
                        onChange={e => {
                          setFamilyId(e.target.value);
                          setTicketMemberId('');
                        }}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-purple-500"
                      >
                        {families.map(f => (
                          <option key={f.id} value={f.id}>
                            {f.familyHeadName} ({f.id}) - {f.address}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-800 font-bold mb-1 text-xs">
                        Beneficiary Member
                      </label>
                      <select
                        value={ticketMemberId || ''}
                        onChange={e => setTicketMemberId(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Whole Family / Head ({families.find(f => f.id === familyId)?.familyHeadName || 'Head'})</option>
                        {selectedFamilyMembers.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.relationship}, Age: {m.age || 'N/A'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Help Type (Govt Scheme vs Personal Help vs Medical etc.) */}
                  <div>
                    <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                      Help Category / Nature of Support *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTicketHelpType('GOVT_SCHEME');
                          setTicketCategory('Scheme Assistance');
                        }}
                        className={`p-2 rounded-lg border text-left text-xs font-bold transition-all ${
                          ticketHelpType === 'GOVT_SCHEME'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        🏛️ Govt Welfare Scheme
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTicketHelpType('PERSONAL_HELP');
                          setTicketCategory('Educational Aid');
                        }}
                        className={`p-2 rounded-lg border text-left text-xs font-bold transition-all ${
                          ticketHelpType === 'PERSONAL_HELP'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        🤝 Direct / Personal Aid
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTicketHelpType('MEDICAL_AID');
                          setTicketCategory('Health Assistance');
                        }}
                        className={`p-2 rounded-lg border text-left text-xs font-bold transition-all ${
                          ticketHelpType === 'MEDICAL_AID'
                            ? 'bg-red-600 text-white border-red-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        🏥 Medical & Health
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTicketHelpType('PENSION');
                          setTicketCategory('Pension Issue');
                        }}
                        className={`p-2 rounded-lg border text-left text-xs font-bold transition-all ${
                          ticketHelpType === 'PENSION'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        🧓 Pension Assistance
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTicketHelpType('DOCUMENTATION');
                          setTicketCategory('Aadhaar / Documentation');
                        }}
                        className={`p-2 rounded-lg border text-left text-xs font-bold transition-all ${
                          ticketHelpType === 'DOCUMENTATION'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        📄 Aadhaar / Ration / Docs
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTicketHelpType('DISPUTE');
                          setTicketCategory('Dispute / Grievance');
                        }}
                        className={`p-2 rounded-lg border text-left text-xs font-bold transition-all ${
                          ticketHelpType === 'DISPUTE'
                            ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        ⚖️ Dispute Resolution
                      </button>
                    </div>
                  </div>

                  {/* Scheme Selection if Govt Scheme */}
                  {ticketHelpType === 'GOVT_SCHEME' && (
                    <div className="bg-white p-3 rounded-lg border border-blue-200 space-y-2">
                      <label className="block text-blue-950 font-extrabold text-xs">
                        Select Government Scheme *
                      </label>
                      <select
                        value={ticketSchemeName || ''}
                        onChange={e => setTicketSchemeName(e.target.value)}
                        className="w-full bg-blue-50/50 border border-blue-300 rounded-md px-2.5 py-1.5 text-xs text-blue-950 font-bold focus:ring-2 focus:ring-blue-500"
                      >
                        {SCHEME_MASTER_OPTIONS.map(sch => (
                          <option key={sch} value={sch}>{sch}</option>
                        ))}
                      </select>

                      {ticketSchemeName === 'Other Government Welfare Scheme' && (
                        <input
                          type="text"
                          required
                          placeholder="Enter custom scheme name..."
                          value={ticketCustomSchemeName || ''}
                          onChange={e => setTicketCustomSchemeName(e.target.value)}
                          className="w-full bg-white border border-blue-300 rounded-md px-2.5 py-1.5 text-xs text-slate-900"
                        />
                      )}
                    </div>
                  )}

                  {/* Benefit / Amount info */}
                  <div>
                    <label className="block text-slate-800 font-bold mb-1 text-xs">
                      Benefit Amount / Material Aid Description (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ₹5,000 Emergency Support, PMAY House Sanction, Monthly ₹1000 Pension"
                      value={ticketAmountOrBenefit || ''}
                      onChange={e => setTicketAmountOrBenefit(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>
              ) : (
                /* COMMUNITY / VILLAGE-WARD PUBLIC ISSUE SECTION */
                <div className="space-y-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {/* Location Selector */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-800 font-bold mb-1 text-xs">Village *</label>
                      <select
                        value={villageId || ''}
                        onChange={e => setVillageId(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md px-2 py-1.5 text-xs text-slate-900"
                      >
                        {villages.map(v => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-800 font-bold mb-1 text-xs">Ward *</label>
                      <select
                        value={wardId || ''}
                        onChange={e => setWardId(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md px-2 py-1.5 text-xs text-slate-900"
                      >
                        {wards.filter(w => w.villageId === villageId).map((w, idx) => (
                          <option key={`em-ward-prob-${w.id}-${idx}`} value={w.id}>Ward {w.wardNumber}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Public Issue Category & Department */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-800 font-bold mb-1 text-xs">Issue Category *</label>
                      <select
                        value={problemCategory || 'Drinking Water / Borewell'}
                        onChange={e => setProblemCategory(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-md px-2 py-1.5 text-xs text-slate-900 font-medium"
                      >
                        <option value="Drinking Water / Borewell">Drinking Water / Borewell</option>
                        <option value="Road / Drainage">Road / Drainage</option>
                        <option value="Street Lighting">Street Lighting</option>
                        <option value="Electricity Line">Electricity Line</option>
                        <option value="Sanitation">Sanitation</option>
                        <option value="School / Anganwadi">School / Anganwadi</option>
                        <option value="Pond / Water Body">Pond / Water Body</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-800 font-bold mb-1 text-xs">Responsible Department</label>
                      <input
                        type="text"
                        placeholder="e.g. RWSS, TPCODL, Gram Panchayat"
                        value={officialDepartment || ''}
                        onChange={e => setOfficialDepartment(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md px-2 py-1.5 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Reported By & Contact */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-800 font-bold mb-1 text-xs">Reported By (Citizen / Leader)</label>
                      <input
                        type="text"
                        placeholder="e.g. Ward Member, Ramesh Sahoo"
                        value={ticketReportedBy || ''}
                        onChange={e => setTicketReportedBy(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md px-2 py-1.5 text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-800 font-bold mb-1 text-xs">Contact Phone</label>
                      <input
                        type="text"
                        placeholder="e.g. 98610XXXXX"
                        value={ticketContactNumber || ''}
                        onChange={e => setTicketContactNumber(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md px-2 py-1.5 text-xs text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Title / Subject */}
              <div>
                <label className="block text-slate-800 font-bold mb-1 text-xs">
                  Ticket Subject / Action Summary *
                </label>
                <input
                  type="text"
                  required
                  placeholder={ticketScope === 'INDIVIDUAL_FAMILY' ? 'e.g. Apply for PMAY house sanction / Expedite Disability Pension' : 'e.g. Broken submersible pump near Ward 2 Temple'}
                  value={title || ''}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Priority & Target Date & Status */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-1 text-xs">Priority</label>
                  <select
                    value={priority || 'Medium'}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900"
                  >
                    <option value="High">🔴 High Priority</option>
                    <option value="Medium">🟡 Medium Priority</option>
                    <option value="Low">🟢 Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1 text-xs">Target Date</label>
                  <input
                    type="date"
                    value={targetDate || ''}
                    onChange={e => setTargetDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1 text-xs">Status *</label>
                  <select
                    value={status || 'Open'}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-bold text-purple-950 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Open">🟡 Open (Pending)</option>
                    <option value="In Progress">🔵 In Progress (Applied)</option>
                    <option value="Follow-up Scheduled">🟣 Follow-up Scheduled</option>
                    <option value="Resolved">🟢 Solved / Resolved (Done)</option>
                    <option value="Closed">⚪ Closed (Done)</option>
                  </select>
                </div>
              </div>

              {/* Detailed Description / Field Remarks */}
              <div>
                <label className="block text-slate-800 font-bold mb-1 text-xs">
                  Detailed Field Note / Citizen Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide background context, family conditions, documents collected, or BDO/Panchayat steps required..."
                  value={description || ''}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* STANDARD ENTITY FORMS (PROBLEMS, TICKETS, DEV WORKS, ETC)*/
            /* ======================================================== */
            <>
              {/* Location Picker */}
              {type !== 'village' && (
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Village</label>
                    <select
                      value={villageId || ''}
                      onChange={e => setVillageId(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5"
                    >
                      {villages.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>

                  {type !== 'ward' && (
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Ward</label>
                      <select
                        value={wardId || ''}
                        onChange={e => setWardId(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5"
                      >
                        {wards.filter(w => w.villageId === villageId).map((w, idx) => (
                          <option key={`em-ward-gen-${w.id}-${idx}`} value={w.id}>Ward {w.wardNumber}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Title / Name (hidden for ward since ward has its own dedicated fields) */}
              {type !== 'ward' && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    {type === 'person' ? 'Full Name' : type === 'temple' ? 'Temple Name' : type === 'event' ? 'Festival / Event Title' : type === 'village' ? 'Village Name' : 'Title / Subject'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={type === 'village' ? 'e.g. Nuagaon / Kalyanpur / Balarampur' : 'e.g. Broken culvert / Subhashree Nayak'}
                    value={title || ''}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  />
                </div>
              )}

              {/* Village-Specific Details */}
              {type === 'village' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Village Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NGV001"
                      value={villageCode || ''}
                      onChange={e => setVillageCode(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5 font-mono text-xs uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Gram Panchayat</label>
                    <input
                      type="text"
                      disabled
                      value={panchayat.name || ''}
                      className="w-full bg-gray-100 border border-gray-300 rounded-md px-2 py-1.5 text-gray-600 cursor-not-allowed text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Type-Specific Fields */}
              {type === 'problem' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Category</label>
                    <select
                      value={problemCategory || 'Drinking Water / Borewell'}
                      onChange={e => setProblemCategory(e.target.value as any)}
                      className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5"
                    >
                      <option value="Drinking Water / Borewell">Drinking Water / Borewell</option>
                      <option value="Road / Drainage">Road / Drainage</option>
                      <option value="Street Lighting">Street Lighting</option>
                      <option value="Sanitation">Sanitation</option>
                      <option value="School / Anganwadi">School / Anganwadi</option>
                      <option value="Pond / Water Body">Pond / Water Body</option>
                      <option value="Electricity Line">Electricity Line</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Priority</label>
                    <select
                      value={priority || 'Medium'}
                      onChange={e => setPriority(e.target.value as any)}
                      className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5 font-bold"
                    >
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Status</label>
                    <select
                      value={status || 'Open'}
                      onChange={e => setStatus(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Department</label>
                    <input
                      type="text"
                      placeholder="e.g. RWSS, TPCODL, Gram Panchayat"
                      value={officialDepartment || ''}
                      onChange={e => setOfficialDepartment(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5"
                    />
                  </div>
                </div>
              )}

              {type === 'devWork' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Scheme / Funding Source</label>
                    <select
                      value={schemeSource || '15th Finance Commission'}
                      onChange={e => setSchemeSource(e.target.value as any)}
                      className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5"
                    >
                      <option value="15th Finance Commission">15th Finance Commission</option>
                      <option value="Panchayat Development Fund">Panchayat Development Fund</option>
                      <option value="CFC / SFC">CFC / SFC</option>
                      <option value="MLA LAD">MLA LAD</option>
                      <option value="MP LAD">MP LAD</option>
                      <option value="MGNREGA">MGNREGA</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Budget (₹)</label>
                    <input
                      type="number"
                      value={budgetRs ?? 0}
                      onChange={e => setBudgetRs(Number(e.target.value))}
                      className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Status</label>
                    <select
                      value={status || 'Proposed'}
                      onChange={e => setStatus(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5"
                    >
                      <option value="Proposed">Proposed</option>
                      <option value="Pending Approval">Pending Approval</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Progress (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={progressPercentage ?? 0}
                      onChange={e => setProgressPercentage(Number(e.target.value))}
                      className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5"
                    />
                  </div>
                </div>
              )}

              {type === 'person' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Category</label>
                    <select
                      value={personCategory || 'Youth Leader'}
                      onChange={e => setPersonCategory(e.target.value as any)}
                      className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5"
                    >
                      <option value="Youth Leader">Youth Leader</option>
                      <option value="SHG President">SHG President</option>
                      <option value="Teacher / Retired Govt Staff">Teacher / Retired Govt Staff</option>
                      <option value="Religious / Temple Head">Religious / Temple Head</option>
                      <option value="Farmer / Cooperative Leader">Farmer / Cooperative Leader</option>
                      <option value="Influential Elder">Influential Elder</option>
                      <option value="Business / Shopkeeper">Business / Shopkeeper</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Designation / Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Maa Mangala SHG Secretary"
                      value={designation || ''}
                      onChange={e => setDesignation(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-gray-700 font-semibold mb-1">Contact Phone</label>
                    <input
                      type="text"
                      placeholder="+91 94370 00000"
                      value={contactNumber || ''}
                      onChange={e => setContactNumber(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5"
                    />
                  </div>
                </div>
              )}

              {type === 'temple' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Main Deity</label>
                    <input
                      type="text"
                      placeholder="e.g. Lord Shiva / Maa Mangala"
                      value={deity || ''}
                      onChange={e => setDeity(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Major Annual Festival</label>
                    <input
                      type="text"
                      placeholder="e.g. Maha Shivaratri / Chaitra Mela"
                      value={majorFestival || ''}
                      onChange={e => setMajorFestival(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5"
                    />
                  </div>
                </div>
              )}

              {type === 'event' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Event Type</label>
                    <select
                      value={eventType || 'Festival'}
                      onChange={e => setEventType(e.target.value as any)}
                      className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5"
                    >
                      <option value="Festival">Religious Festival</option>
                      <option value="Jatra / Drama">Jatra / Cultural Drama</option>
                      <option value="Fair / Mela">Village Fair / Mela</option>
                      <option value="Sports Tournament">Sports Tournament</option>
                      <option value="Community Feast">Community Feast</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Venue / Location</label>
                    <input
                      type="text"
                      placeholder="Village Field / Temple Mandap"
                      value={venue || ''}
                      onChange={e => setVenue(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-gray-700 font-semibold mb-1">Approximate Date / Month</label>
                    <input
                      type="text"
                      placeholder="e.g. June 14-16 / Chaitra Mangalabara"
                      value={estimatedDateOrMonth || ''}
                      onChange={e => setEstimatedDateOrMonth(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5"
                    />
                  </div>
                </div>
              )}

              {type === 'reminder' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Due Date</label>
                    <input
                      type="date"
                      value={reminderDueDate || ''}
                      onChange={e => setReminderDueDate(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Time</label>
                    <input
                      type="text"
                      placeholder="10:00 AM"
                      value={reminderDueTime || ''}
                      onChange={e => setReminderDueTime(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5"
                    />
                  </div>
                </div>
              )}

              {type === 'ward' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Ward Number *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={wardNumber ?? 1}
                        onChange={e => setWardNumber(Number(e.target.value))}
                        className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Ward Member Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Sri/Smt..."
                        value={wardMemberName || ''}
                        onChange={e => setWardMemberName(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Ward Member Contact Mobile</label>
                    <input
                      type="text"
                      placeholder="+91 94370 00000"
                      value={contactNumber || ''}
                      onChange={e => setContactNumber(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5 font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Description / Notes */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Details & Field Notes</label>
                <textarea
                  rows={3}
                  placeholder="Detailed description, actions needed, context..."
                  value={description || ''}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                />
              </div>
            </>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-2.5 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>
                {initialData
                  ? 'Save Changes'
                  : (type === 'issue' || type === 'problem' || type === 'ticket')
                  ? (ticketScope === 'COMMUNITY_VILLAGE_WARD' ? 'Submit Community Issue' : 'Submit Individual Issue')
                  : type === 'assistance'
                  ? 'Record Direct Assistance'
                  : type === 'scheme'
                  ? 'Enroll Scheme Application'
                  : 'Create Record'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
