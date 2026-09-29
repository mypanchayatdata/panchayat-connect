export type UserRole = 'Super Admin' | 'Admin' | 'User' | 'Field User' | 'Viewer';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  phone: string;
  avatar?: string;
  password?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
}

export interface Panchayat {
  id: string; // P001
  name: string;
  block: string;
  district: string;
  state: string;
  pincode: string;
  assemblyConstituency: string;
  parliamentaryConstituency: string;
  sarpanchName: string;
  sarpanchContact: string;
  panchayatExecutiveOfficer: string;
  peoContact: string;
  officeAddress: string;
}

export interface Village {
  id: string; // NGV001
  panchayatId: string; // P001
  code: string; // NGV001
  name: string;
  censusCode?: string;
  description?: string;
}

export interface Ward {
  id: string; // NGV001-W05
  villageId: string; // NGV001
  wardNumber: number; // 5
  wardMemberName: string;
  contactNumber: string;
  areaDescription?: string;
}

export type EconomicStatusCode = 1 | 2 | 3;
// 1 = Well, 2 = Moderate, 3 = Low

export type VoterStatus = 'YES' | 'NO' | 'NOT VERIFIED';
export type VoterCategory = 'GREEN' | 'YELLOW' | 'RED';

export interface FamilyMember {
  id: string; // NGV001-W05-F001-M01
  familyId: string; // NGV001-W05-F001
  name: string;
  fatherHusbandName: string;
  relation: 'Head' | 'Spouse' | 'Son' | 'Daughter' | 'Father' | 'Mother' | 'Brother' | 'Sister' | 'Daughter-in-law' | 'Son-in-law' | 'Grandson' | 'Granddaughter' | 'Other';
  age: number;
  dob?: string;
  gender: 'Male' | 'Female' | 'Other';
  isVoter: boolean;
  voterStatus?: VoterStatus;
  voterCategory?: VoterCategory;
  voterEpicNumber?: string;
  occupation: string;
  hasGovernmentJob: boolean;
  governmentDepartment?: string;
  mobile?: string;
  education: string;
  maritalStatus: 'Married' | 'Unmarried' | 'Widowed' | 'Divorced';
  status: 'Active' | 'Migrated' | 'Deceased';
  notes?: string;
}

export interface Family {
  id: string; // NGV001-W05-F001
  panchayatId: string;
  villageId: string;
  wardId: string;
  familyHeadName: string;
  contactPersonName: string;
  primaryMobile: string;
  alternativeMobile?: string;
  address: string;
  rationCardNumber?: string;
  rationCardType?: 'AAY (Antyodaya)' | 'PHH (Priority)' | 'NPHH' | 'None';
  economicStatus: EconomicStatusCode; // 1 = Well, 2 = Moderate, 3 = Low
  houseType?: 'Pucca' | 'Kutcha' | 'Semi-Pucca';
  sanitationFacility?: boolean;
  drinkingWaterSource?: 'Piped Water' | 'Tube Well' | 'Open Well' | 'Canal/Pond';
  electricityConnection?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PersonCategory = 
  | 'Sarpanch' 
  | 'Ward Member' 
  | 'Teacher' 
  | 'Youth' 
  | 'Youth Leader' 
  | 'Active Women' 
  | 'Respected Person' 
  | 'Social Worker' 
  | 'Community Leader' 
  | 'Religious Leader' 
  | 'Healthcare/ASHA' 
  | 'Anganwadi Worker';

export interface KeyPerson {
  id: string;
  name: string;
  category: PersonCategory;
  villageId: string;
  wardId?: string;
  memberId?: string; // If linked to family member
  phone: string;
  email?: string;
  designation?: string;
  organization?: string;
  influenceLevel?: 'High' | 'Medium' | 'Normal';
  notes?: string;
}

export type SchemeName = 
  | 'PMAY (Pradhan Mantri Awas Yojana)'
  | 'PM-KISAN (Samman Nidhi)'
  | 'Old Age Pension (IGNOAPS)'
  | 'Widow Pension (IGNWPS)'
  | 'Disability Pension (IGNDPS)'
  | 'NFSA Ration Food Security'
  | 'Ayushman Bharat / PM-JAY'
  | 'Subhadra Yojana / Women Empowerment'
  | 'MGNREGA Job Card'
  | 'Kalia / State Farmer Support'
  | 'Ujjwala LPG Scheme'
  | 'Biju Swasthya Kalyan Yojana (BSKY)'
  | 'Mo Ghara Rural Housing'
  | 'Mission Shakti SHG Loan & Subsidies'
  | 'Other';

export interface SchemeApplication {
  id: string; // SCH-PMAY-001
  schemeName: SchemeName | string;
  familyId: string;
  memberId?: string;
  villageId?: string;
  wardId?: string;
  applicantName: string;
  status: 'Sanctioned / Active' | 'Pending Approval' | 'Under Verification' | 'Rejected' | 'Document Required';
  appliedDate: string;
  sanctionedDate?: string;
  amountOrBenefit?: string;
  applicationNumber?: string;
  notes?: string;
}

export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type TicketStatus = 'Open' | 'In Progress' | 'Follow-up Scheduled' | 'Resolved' | 'Closed';

export interface FollowUpTicket {
  id: string; // TK-F001-001
  ticketScope?: 'INDIVIDUAL_FAMILY' | 'COMMUNITY_VILLAGE_WARD';
  ticketType?: 'family' | 'community' | 'village_ward' | 'scheme' | 'personal_help';
  familyId?: string;
  memberId?: string;
  villageId?: string;
  wardId?: string;
  title: string;
  category: 'Scheme Assistance' | 'Aadhaar / Documentation' | 'Pension Issue' | 'Dispute / Grievance' | 'Health Assistance' | 'Educational Aid' | 'Water / Electricity' | 'Drinking Water / Borewell' | 'Road / Drainage' | 'Street Lighting' | 'Sanitation' | 'School / Anganwadi' | 'Electricity Line' | 'Other' | string;
  priority: PriorityLevel;
  status: TicketStatus;
  assignedTo: string;
  createdDate: string;
  targetDate: string;
  resolvedDate?: string;
  resolvedBy?: string;
  actionTaken?: string;
  resolutionNotes?: string;
  financialBenefitRs?: number;
  resolutionProof?: string;
  description: string;
  notes?: string;
  helpType?: 'GOVT_SCHEME' | 'PERSONAL_HELP' | 'MEDICAL_AID' | 'PENSION' | 'DOCUMENTATION' | 'COMMUNITY_ISSUE' | 'OTHER';
  schemeName?: string;
  amountOrBenefit?: string;
  ticketAssistanceId?: string;
  contactNumber?: string;
  reportedBy?: string;
  autoSyncAssistance?: boolean;
}

export type DirectAssistanceType = 'SCHEME_ASSISTANCE' | 'PERSONAL_ASSISTANCE' | 'OTHER';
export type DirectAssistanceStatus = 'PENDING' | 'APPLIED' | 'DONE';

export interface PersonalAssistance {
  id: string; // AST-2026-001
  assistance_id?: string;
  ticketId?: string;
  sourceTicketId?: string;
  ticketScope?: 'INDIVIDUAL_FAMILY' | 'COMMUNITY_VILLAGE_WARD';
  familyId: string;
  family_id?: string;
  memberId?: string;
  member_id?: string;
  assistanceType: DirectAssistanceType | string;
  assistance_type?: DirectAssistanceType | string;
  schemeId?: string;
  scheme_id?: string;
  schemeName?: string;
  note?: string;
  description?: string;
  actionTaken?: string;
  date: string;
  status: DirectAssistanceStatus;
  nextFollowupAt?: string;
  next_followup_at?: string;
  completionDate?: string;
  completion_date?: string;
  resolvedBy?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  createdBy?: string;
  created_by?: string;
  updatedBy?: string;
  updated_by?: string;
  beneficiaryName?: string;
  villageId?: string;
  wardId?: string;
  outcome?: string;
  financialValueRs?: number;
  socialWorkerNotes?: string;
  verificationNote?: string;
}

export type DirectAssistance = PersonalAssistance;

export type ProblemStatus = 'Open' | 'Pending' | 'In Progress' | 'Completed';

export interface CommunityProblem {
  id: string; // PR-W05-001
  villageId: string;
  wardId: string;
  title: string;
  category: 'Drinking Water / Borewell' | 'Road / Drainage' | 'Street Lighting' | 'Sanitation' | 'School / Anganwadi' | 'Pond / Water Body' | 'Electricity Line' | 'Health Sub-Centre' | 'Other';
  priority: PriorityLevel;
  status: ProblemStatus;
  reportedDate: string;
  reportedBy: string;
  contactNumber?: string;
  estimatedBeneficiaries?: number;
  officialDepartment?: string;
  latestAction?: string;
  description: string;
  resolvedDate?: string;
  resolvedBy?: string;
  actionTaken?: string;
  resolutionNotes?: string;
  expenditureRs?: number;
  resolutionProof?: string;
}

export type DevWorkStatus = 'Pending' | 'In Progress' | 'Completed';

export interface DevelopmentWork {
  id: string; // DW-NG-001
  villageId: string;
  wardId: string;
  title: string;
  schemeSource: 'Panchayat Development Fund' | '15th Finance Commission' | 'CFC / SFC' | 'MLA LAD' | 'MP LAD' | 'MGNREGA' | 'State Scheme';
  budgetRs: number;
  sanctionedAmountRs: number;
  status: DevWorkStatus;
  startDate?: string;
  targetCompletionDate?: string;
  actualCompletionDate?: string;
  completedBy?: string;
  contractorName?: string;
  supervisingEngineer?: string;
  progressPercentage: number;
  actionTaken?: string;
  completionNotes?: string;
  actualExpenditureRs?: number;
  completionCertificateNo?: string;
  description: string;
}

export interface Temple {
  id: string; // TM-NG-001
  villageId: string;
  wardId?: string;
  name: string;
  deity: string;
  managingCommitteePresident?: string;
  pujariName?: string;
  contactNumber?: string;
  majorFestival: string;
  facilityStatus: 'Good' | 'Needs Renovation' | 'Community Hall Available';
  description?: string;
}

export interface CulturalEvent {
  id: string; // EV-NG-001
  villageId: string;
  name: string;
  type: 'Religious / Puja' | 'Festival' | 'Mela / Fair' | 'Sports Tournament' | 'Health Camp' | 'Gram Sabha';
  estimatedDateOrMonth: string;
  leadOrganizers: string;
  contactNumber?: string;
  venue: string;
  description?: string;
}

export interface BirthRecord {
  id: string;
  familyId: string;
  childName: string;
  gender: 'Male' | 'Female';
  dateOfBirth: string;
  placeOfBirth: string;
  fatherName: string;
  motherName: string;
  birthRegistrationNumber?: string;
  certificateStatus: 'Applied' | 'Issued' | 'Pending';
  remarks?: string;
}

export interface DeathRecord {
  id: string;
  familyId: string;
  deceasedName: string;
  gender: 'Male' | 'Female';
  dateOfDeath: string;
  causeOfDeath?: string;
  deathRegistrationNumber?: string;
  familyAssistanceInitiated: boolean; // e.g. Widow pension, Harischandra Yojana
  certificateStatus: 'Applied' | 'Issued' | 'Pending';
  remarks?: string;
}

export interface Reminder {
  id: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string;
  priority: PriorityLevel;
  relatedEntityType?: 'Family' | 'Ticket' | 'Problem' | 'Scheme' | 'Development' | 'General';
  relatedEntityId?: string;
  relatedEntityName?: string;
  completed: boolean;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  type: 'assigned_ticket' | 'overdue_followup' | 'upcoming_reminder' | 'new_problem';
  title: string;
  message: string;
  timestamp: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  targetView: 'tickets' | 'reminders' | 'problems' | 'families';
  targetId: string;
  isRead: boolean;
  metadata?: {
    villageId?: string;
    wardId?: string;
    familyId?: string;
    dueDate?: string;
  };
}

