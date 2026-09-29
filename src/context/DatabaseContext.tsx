import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Panchayat,
  Village,
  Ward,
  Family,
  FamilyMember,
  KeyPerson,
  SchemeApplication,
  FollowUpTicket,
  PersonalAssistance,
  CommunityProblem,
  DevelopmentWork,
  Temple,
  CulturalEvent,
  BirthRecord,
  DeathRecord,
  Reminder,
  AuditLog,
  User,
  NotificationItem,
  VoterStatus,
  VoterCategory,
  UserRole
} from '../types';
import {
  INITIAL_PANCHAYAT,
  INITIAL_VILLAGES,
  INITIAL_WARDS,
  INITIAL_FAMILIES,
  INITIAL_MEMBERS,
  INITIAL_KEY_PEOPLE,
  INITIAL_SCHEMES,
  INITIAL_TICKETS,
  INITIAL_ASSISTANCE,
  INITIAL_PROBLEMS,
  INITIAL_DEV_WORKS,
  INITIAL_TEMPLES,
  INITIAL_EVENTS,
  INITIAL_BIRTHS,
  INITIAL_DEATHS,
  INITIAL_REMINDERS,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS
} from '../data/seedData';

const STORAGE_KEY = 'panchayat_connect_relational_db_v1';

export interface SearchResultItem {
  id: string;
  type: 'family' | 'member' | 'village' | 'ward' | 'problem' | 'ticket' | 'scheme' | 'person' | 'temple' | 'dev_work' | 'event';
  title: string;
  subtitle: string;
  badge: string;
  targetView: string;
  targetId: string;
}

export interface AdvancedFilterOptions {
  panchayatId?: string;
  villageId?: string;
  wardId?: string;
  familyStatus?: string;
  schemeStatus?: string;
  ticketPriority?: string;
  ticketStatus?: string;
  problemPriority?: string;
  searchTerm?: string;
}

export interface FilteredResults {
  families: Family[];
  members: FamilyMember[];
  schemes: SchemeApplication[];
  tickets: FollowUpTicket[];
  problems: CommunityProblem[];
  totalMatches: number;
}

interface DatabaseContextType {
  panchayat: Panchayat;
  villages: Village[];
  wards: Ward[];
  families: Family[];
  members: FamilyMember[];
  schemes: SchemeApplication[];
  tickets: FollowUpTicket[];
  assistance: PersonalAssistance[];
  problems: CommunityProblem[];
  devWorks: DevelopmentWork[];
  keyPeople: KeyPerson[];
  temples: Temple[];
  events: CulturalEvent[];
  births: BirthRecord[];
  deaths: DeathRecord[];
  reminders: Reminder[];
  auditLogs: AuditLog[];
  users: User[];

  // Relational lookups
  getVillage: (id: string) => Village | undefined;
  getWard: (id: string) => Ward | undefined;
  getFamily: (id: string) => Family | undefined;
  getFamilyMembers: (familyId: string) => FamilyMember[];
  getGovtJobInfoForFamily: (familyId: string) => { hasGovtJob: boolean; members: FamilyMember[] };
  getVillageStats: (villageId: string) => any;
  getWardStats: (wardId: string) => any;
  getPanchayatStats: () => any;

  // Village & Ward specific relational helpers
  getVillageKeyPeople: (villageId: string) => KeyPerson[];
  getVillageProblems: (villageId: string) => CommunityProblem[];
  getVillageDevWorks: (villageId: string) => DevelopmentWork[];
  getVillageTemples: (villageId: string) => Temple[];
  getVillageEvents: (villageId: string) => CulturalEvent[];
  getVillageFamilies: (villageId: string) => Family[];

  getWardFamilies: (wardId: string) => Family[];
  getWardKeyPeople: (wardId: string) => KeyPerson[];
  getWardProblems: (wardId: string) => CommunityProblem[];
  getWardDevWorks: (wardId: string) => DevelopmentWork[];
  getWardSchemes: (wardId: string) => SchemeApplication[];

  getFamilySchemes: (familyId: string) => SchemeApplication[];
  getFamilyTickets: (familyId: string) => FollowUpTicket[];
  getFamilyAssistance: (familyId: string) => PersonalAssistance[];

  toggleReminderCompleted: (id: string) => void;
  resetToInitialData: () => void;

  // ID Generators
  generateNextFamilyId: (wardId: string) => string;
  generateNextMemberId: (familyId: string) => string;
  generateNextProblemId: (wardId: string) => string;
  generateNextTicketId: (familyId: string) => string;

  // Search
  searchAll: (query: string) => SearchResultItem[];

  // CRUD actions
  updatePanchayat: (p: Panchayat) => void;
  addVillage: (v: Village) => void;
  updateVillage: (v: Village) => void;
  deleteVillage: (id: string) => void;

  addWard: (w: Ward) => void;
  updateWard: (w: Ward) => void;
  deleteWard: (id: string) => void;

  addUser: (u: User) => void;
  updateUser: (u: User) => void;
  deleteUser: (id: string) => void;

  addFamilyWithMembers: (family: Family, members: FamilyMember[]) => void;
  updateFamily: (family: Family) => void;
  deleteFamily: (id: string) => void;

  addMember: (m: FamilyMember) => void;
  updateMember: (m: FamilyMember) => void;
  updateMemberVoterInfo: (memberId: string, updates: { isVoter?: boolean; voterStatus?: VoterStatus; voterCategory?: VoterCategory; voterEpicNumber?: string }) => void;
  deleteMember: (id: string) => void;
  currentRole: UserRole;

  addScheme: (s: SchemeApplication) => void;
  updateScheme: (s: SchemeApplication) => void;
  deleteScheme: (id: string) => void;

  addTicket: (t: FollowUpTicket) => void;
  updateTicket: (t: FollowUpTicket) => void;
  deleteTicket: (id: string) => void;

  addAssistance: (a: PersonalAssistance) => void;
  updateAssistance: (a: PersonalAssistance) => void;
  deleteAssistance: (id: string) => void;

  addProblem: (p: CommunityProblem) => void;
  updateProblem: (p: CommunityProblem) => void;
  deleteProblem: (id: string) => void;
  solveProblem: (id: string, actionOutcome?: string) => void;
  solveTicket: (id: string, notes?: string) => void;

  addDevWork: (dw: DevelopmentWork) => void;
  updateDevWork: (dw: DevelopmentWork) => void;
  deleteDevWork: (id: string) => void;

  addKeyPerson: (kp: KeyPerson) => void;
  updateKeyPerson: (kp: KeyPerson) => void;
  deleteKeyPerson: (id: string) => void;

  addTemple: (t: Temple) => void;
  updateTemple: (t: Temple) => void;
  deleteTemple: (id: string) => void;

  addEvent: (e: CulturalEvent) => void;
  updateEvent: (e: CulturalEvent) => void;
  deleteEvent: (id: string) => void;

  addBirth: (b: BirthRecord) => void;
  updateBirth: (b: BirthRecord) => void;
  deleteBirth: (id: string) => void;

  addDeath: (d: DeathRecord) => void;
  updateDeath: (d: DeathRecord) => void;
  deleteDeath: (id: string) => void;

  addReminder: (r: Reminder) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;

  logAction: (action: string, entityType: string, entityId: string, details: string) => void;
  resetToSampleData: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (json: string) => boolean;

  // Notifications
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;

  // Advanced Multi-Criteria Filter
  filterData: (options: AdvancedFilterOptions) => FilteredResults;

  // Server Synchronization
  syncWithServer: () => Promise<void>;
  isSyncing: boolean;
}

// Helper to ensure clean, strictly unique lists by ID
function deduplicateList<T extends { id: string }>(items: T[]): T[] {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  const cleanList: T[] = [];
  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    const cleanId = typeof item.id === 'string' ? item.id.trim() : String(item.id || '');
    if (!cleanId || seen.has(cleanId)) continue;
    seen.add(cleanId);
    cleanList.push({ ...item, id: cleanId });
  }
  return cleanList;
}

function loadListFromStorage<T extends { id: string }>(key: string, defaultValue: T[]): T[] {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) {
      const cleanDefault = deduplicateList(defaultValue);
      try {
        localStorage.setItem(key, JSON.stringify(cleanDefault));
      } catch {}
      return cleanDefault;
    }
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      const cleanDefault = deduplicateList(defaultValue);
      try {
        localStorage.setItem(key, JSON.stringify(cleanDefault));
      } catch {}
      return cleanDefault;
    }
    const cleanParsed = deduplicateList(parsed);
    // Write back sanitized list immediately to clean corrupt/duplicate data from localStorage
    try {
      localStorage.setItem(key, JSON.stringify(cleanParsed));
    } catch {}
    return cleanParsed;
  } catch (err) {
    console.error(`Failed to load ${key} from storage:`, err);
    const cleanDefault = deduplicateList(defaultValue);
    try {
      localStorage.setItem(key, JSON.stringify(cleanDefault));
    } catch {}
    return cleanDefault;
  }
}

// Immediate localStorage self-repair on script execution
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(STORAGE_KEY)) {
        const raw = localStorage.getItem(k);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0] && typeof parsed[0] === 'object' && 'id' in parsed[0]) {
              const cleaned = deduplicateList(parsed);
              if (cleaned.length !== parsed.length) {
                localStorage.setItem(k, JSON.stringify(cleaned));
              }
            }
          } catch {}
        }
      }
    }
  } catch (e) {
    console.warn('LocalStorage auto-repair warning:', e);
  }
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [panchayat, setPanchayat] = useState<Panchayat>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_panchayat');
    return saved ? JSON.parse(saved) : INITIAL_PANCHAYAT;
  });

  const [villages, setVillages] = useState<Village[]>(() => {
    return loadListFromStorage(STORAGE_KEY + '_villages', INITIAL_VILLAGES);
  });

  const [wards, setWards] = useState<Ward[]>(() => {
    return loadListFromStorage(STORAGE_KEY + '_wards', INITIAL_WARDS);
  });

  const [families, setFamilies] = useState<Family[]>(() => {
    return loadListFromStorage(STORAGE_KEY + '_families', INITIAL_FAMILIES);
  });

  const [members, setMembers] = useState<FamilyMember[]>(() => {
    return loadListFromStorage(STORAGE_KEY + '_members', INITIAL_MEMBERS);
  });

  const [schemes, setSchemes] = useState<SchemeApplication[]>(() => {
    return loadListFromStorage(STORAGE_KEY + '_schemes', INITIAL_SCHEMES);
  });

  const [tickets, setTickets] = useState<FollowUpTicket[]>(() => {
    return loadListFromStorage(STORAGE_KEY + '_tickets', INITIAL_TICKETS);
  });

  const [assistance, setAssistance] = useState<PersonalAssistance[]>(() => {
    return loadListFromStorage(STORAGE_KEY + '_assistance', INITIAL_ASSISTANCE);
  });

  const [problems, setProblems] = useState<CommunityProblem[]>(() => {
    return loadListFromStorage(STORAGE_KEY + '_problems', INITIAL_PROBLEMS);
  });

  const [devWorks, setDevWorks] = useState<DevelopmentWork[]>(() => {
    return loadListFromStorage(STORAGE_KEY + '_devWorks', INITIAL_DEV_WORKS);
  });

  const [keyPeople, setKeyPeople] = useState<KeyPerson[]>(() => {
    return loadListFromStorage(STORAGE_KEY + '_keyPeople', INITIAL_KEY_PEOPLE);
  });

  const [temples, setTemples] = useState<Temple[]>(() => {
    return loadListFromStorage(STORAGE_KEY + '_temples', INITIAL_TEMPLES);
  });

  const [events, setEvents] = useState<CulturalEvent[]>(() => {
    return loadListFromStorage(STORAGE_KEY + '_events', INITIAL_EVENTS);
  });

  const [births, setBirths] = useState<BirthRecord[]>(() => {
    return loadListFromStorage(STORAGE_KEY + '_births', INITIAL_BIRTHS);
  });

  const [deaths, setDeaths] = useState<DeathRecord[]>(() => {
    return loadListFromStorage(STORAGE_KEY + '_deaths', INITIAL_DEATHS);
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    return loadListFromStorage(STORAGE_KEY + '_reminders', INITIAL_REMINDERS);
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    return loadListFromStorage(STORAGE_KEY + '_auditLogs', INITIAL_AUDIT_LOGS);
  });

  const [users, setUsers] = useState<User[]>(() => {
    const list = loadListFromStorage('panchayat_connect_users', INITIAL_USERS);
    return list.map(u => ({
      ...u,
      password: u.password || (u.role === 'Super Admin' ? 'super123' : u.role === 'Admin' ? 'admin123' : u.role === 'Viewer' ? 'viewer123' : 'field123')
    }));
  });

  useEffect(() => {
    localStorage.setItem('panchayat_connect_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    const handleUsersUpdated = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setUsers(e.detail);
      }
    };
    window.addEventListener('panchayat_connect_users_updated', handleUsersUpdated);
    return () => window.removeEventListener('panchayat_connect_users_updated', handleUsersUpdated);
  }, []);

  // Persistence to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_panchayat', JSON.stringify(panchayat));
  }, [panchayat]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_villages', JSON.stringify(villages));
  }, [villages]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_wards', JSON.stringify(wards));
  }, [wards]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_families', JSON.stringify(families));
  }, [families]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_members', JSON.stringify(members));
  }, [members]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_schemes', JSON.stringify(schemes));
  }, [schemes]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_tickets', JSON.stringify(tickets));
  }, [tickets]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_assistance', JSON.stringify(assistance));
  }, [assistance]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_problems', JSON.stringify(problems));
  }, [problems]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_devWorks', JSON.stringify(devWorks));
  }, [devWorks]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_keyPeople', JSON.stringify(keyPeople));
  }, [keyPeople]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_temples', JSON.stringify(temples));
  }, [temples]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_events', JSON.stringify(events));
  }, [events]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_births', JSON.stringify(births));
  }, [births]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_deaths', JSON.stringify(deaths));
  }, [deaths]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_reminders', JSON.stringify(reminders));
  }, [reminders]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_auditLogs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Logging
  const logAction = (action: string, entityType: string, entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: 'LOG-' + Date.now().toString().slice(-6),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'Administrator',
      role: 'Admin',
      action,
      entityType,
      entityId,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Lookups
  const getVillage = (id: string) => villages.find(v => v.id === id);
  const getWard = (id: string) => wards.find(w => w.id === id);
  const getFamily = (id: string) => families.find(f => f.id === id);
  const getFamilyMembers = (familyId: string) => members.filter(m => m.familyId === familyId);

  const getGovtJobInfoForFamily = (familyId: string) => {
    const famMembers = members.filter(m => m.familyId === familyId);
    const govtMembers = famMembers.filter(m => m.hasGovernmentJob);
    return {
      hasGovtJob: govtMembers.length > 0,
      members: govtMembers
    };
  };

  // Village & Ward Relational queries
  const getVillageKeyPeople = (villageId: string) => keyPeople.filter(kp => kp.villageId === villageId);
  const getVillageProblems = (villageId: string) => problems.filter(p => p.villageId === villageId);
  const getVillageDevWorks = (villageId: string) => devWorks.filter(dw => dw.villageId === villageId);
  const getVillageTemples = (villageId: string) => temples.filter(t => t.villageId === villageId);
  const getVillageEvents = (villageId: string) => events.filter(e => e.villageId === villageId);
  const getVillageFamilies = (villageId: string) => families.filter(f => f.villageId === villageId);

  const getWardFamilies = (wardId: string) => families.filter(f => f.wardId === wardId);
  const getWardKeyPeople = (wardId: string) => keyPeople.filter(kp => kp.wardId === wardId);
  const getWardProblems = (wardId: string) => problems.filter(p => p.wardId === wardId);
  const getWardDevWorks = (wardId: string) => devWorks.filter(dw => dw.wardId === wardId);
  const getWardSchemes = (wardId: string) => {
    const wFamilyIds = families.filter(f => f.wardId === wardId).map(f => f.id);
    return schemes.filter(s => wFamilyIds.includes(s.familyId));
  };

  const getFamilySchemes = (familyId: string) => schemes.filter(s => s.familyId === familyId);
  const getFamilyTickets = (familyId: string) => tickets.filter(t => t.familyId === familyId);
  const getFamilyAssistance = (familyId: string) =>
    assistance.filter(a => a.familyId === familyId || a.family_id === familyId);

  const toggleReminderCompleted = (id: string) => toggleReminder(id);
  const resetToInitialData = () => resetToSampleData();

  // Village Aggregates
  const getVillageStats = (villageId: string) => {
    const villageWards = wards.filter(w => w.villageId === villageId);
    const wardIds = villageWards.map(w => w.id);
    const villageFamilies = families.filter(f => f.villageId === villageId || wardIds.includes(f.wardId));
    const familyIds = villageFamilies.map(f => f.id);
    const villageMembers = members.filter(m => familyIds.includes(m.familyId));

    const male = villageMembers.filter(m => m.gender === 'Male').length;
    const female = villageMembers.filter(m => m.gender === 'Female').length;
    const children = villageMembers.filter(m => m.age < 18).length;
    const voters = villageMembers.filter(m => m.isVoter && m.voterStatus !== 'NO').length;
    const voterGreen = villageMembers.filter(m => (m.isVoter && m.voterStatus !== 'NO') && (m.voterCategory === 'GREEN' || !m.voterCategory)).length;
    const voterYellow = villageMembers.filter(m => (m.isVoter && m.voterStatus !== 'NO') && m.voterCategory === 'YELLOW').length;
    const voterRed = villageMembers.filter(m => (m.isVoter && m.voterStatus !== 'NO') && m.voterCategory === 'RED').length;
    const voterNotVerified = villageMembers.filter(m => m.voterStatus === 'NOT VERIFIED').length;

    const wellCount = villageFamilies.filter(f => f.economicStatus === 1).length;
    const moderateCount = villageFamilies.filter(f => f.economicStatus === 2).length;
    const lowCount = villageFamilies.filter(f => f.economicStatus === 3).length;

    const govtFamiliesCount = villageFamilies.filter(f => {
      const famMembers = members.filter(m => m.familyId === f.id);
      return famMembers.some(m => m.hasGovernmentJob);
    }).length;

    const vSchemes = schemes.filter(s => familyIds.includes(s.familyId));
    const pmayPending = vSchemes.filter(s => s.schemeName.includes('PMAY') && s.status.includes('Pending')).length;
    const pmaySanctioned = vSchemes.filter(s => s.schemeName.includes('PMAY') && s.status.includes('Sanctioned')).length;
    const pmkisan = vSchemes.filter(s => s.schemeName.includes('PM-KISAN') || s.schemeName.includes('KISAN')).length;
    const pmkisanPending = vSchemes.filter(s => (s.schemeName.includes('PM-KISAN') || s.schemeName.includes('KISAN')) && !s.status.includes('Sanctioned')).length;
    const pension = vSchemes.filter(s => s.schemeName.includes('Pension')).length;
    const pensionPending = vSchemes.filter(s => s.schemeName.includes('Pension') && !s.status.includes('Sanctioned')).length;
    const otherPending = vSchemes.filter(s => !s.schemeName.includes('PMAY') && !s.schemeName.includes('KISAN') && !s.schemeName.includes('Pension') && s.status.includes('Pending')).length;
    const pendingTotal = pmayPending + pmkisanPending + pensionPending + otherPending;

    const vProblems = problems.filter(p => p.villageId === villageId);
    const vDevWorks = devWorks.filter(d => d.villageId === villageId);
    const vTemples = temples.filter(t => t.villageId === villageId);
    const vEvents = events.filter(e => e.villageId === villageId);
    const vPeople = keyPeople.filter(kp => kp.villageId === villageId);

    const schemeData = {
      total: vSchemes.length,
      totalTracked: vSchemes.length,
      pmayPending,
      pmaySanctioned,
      pmkisan,
      pmkisanPending,
      pension,
      pensionPending,
      otherPending,
      pending: pendingTotal,
      active: vSchemes.filter(s => s.status.includes('Active') || s.status.includes('Sanctioned')).length,
      completed: pmaySanctioned
    };

    return {
      population: villageMembers.length,
      membersCount: villageMembers.length,
      familiesCount: villageFamilies.length,
      wardsCount: villageWards.length,
      male,
      female,
      children,
      voters,
      voterStats: {
        total: voters,
        green: voterGreen,
        yellow: voterYellow,
        red: voterRed,
        notVerified: voterNotVerified
      },
      economicStats: {
        well: wellCount,
        moderate: moderateCount,
        low: lowCount,
        withGovtJob: govtFamiliesCount
      },
      familyEconomics: {
        well: wellCount,
        moderate: moderateCount,
        low: lowCount,
        withGovtJob: govtFamiliesCount
      },
      govtJobFamiliesCount: govtFamiliesCount,
      schemes: schemeData,
      schemeStats: schemeData,
      schemesStats: schemeData,
      schemesSummary: {
        pmayPending,
        pmkisanPending,
        pensionPending,
        otherPending,
        totalTracked: vSchemes.length
      },
      problemsStats: {
        total: vProblems.length,
        open: vProblems.filter(p => p.status === 'Open').length,
        highPriority: vProblems.filter(p => p.priority === 'High' && p.status !== 'Completed').length,
        inProgress: vProblems.filter(p => p.status === 'In Progress').length,
        completed: vProblems.filter(p => p.status === 'Completed').length,
        pending: vProblems.filter(p => p.status === 'Pending').length
      },
      problems: {
        total: vProblems.length,
        open: vProblems.filter(p => p.status === 'Open').length,
        highPriority: vProblems.filter(p => p.priority === 'High' && p.status !== 'Completed').length,
        inProgress: vProblems.filter(p => p.status === 'In Progress').length,
        completed: vProblems.filter(p => p.status === 'Completed').length,
        pending: vProblems.filter(p => p.status === 'Pending').length
      },
      devWorksStats: {
        total: vDevWorks.length,
        completed: vDevWorks.filter(d => d.status === 'Completed').length,
        inProgress: vDevWorks.filter(d => d.status === 'In Progress').length,
        pending: vDevWorks.filter(d => d.status === 'Pending').length,
        budgetSum: vDevWorks.reduce((acc, curr) => acc + curr.budgetRs, 0)
      },
      devWorks: {
        total: vDevWorks.length,
        completed: vDevWorks.filter(d => d.status === 'Completed').length,
        inProgress: vDevWorks.filter(d => d.status === 'In Progress').length,
        pending: vDevWorks.filter(d => d.status === 'Pending').length,
        budgetSum: vDevWorks.reduce((acc, curr) => acc + curr.budgetRs, 0)
      },
      templesCount: vTemples.length,
      eventsCount: vEvents.length,
      peopleCount: vPeople.length
    };
  };

  // Ward Aggregates
  const getWardStats = (wardId: string) => {
    const wardFamilies = families.filter(f => f.wardId === wardId);
    const familyIds = wardFamilies.map(f => f.id);
    const wardMembers = members.filter(m => familyIds.includes(m.familyId));

    const male = wardMembers.filter(m => m.gender === 'Male').length;
    const female = wardMembers.filter(m => m.gender === 'Female').length;
    const children = wardMembers.filter(m => m.age < 18).length;
    const voters = wardMembers.filter(m => m.isVoter && m.voterStatus !== 'NO').length;
    const voterGreen = wardMembers.filter(m => (m.isVoter && m.voterStatus !== 'NO') && (m.voterCategory === 'GREEN' || !m.voterCategory)).length;
    const voterYellow = wardMembers.filter(m => (m.isVoter && m.voterStatus !== 'NO') && m.voterCategory === 'YELLOW').length;
    const voterRed = wardMembers.filter(m => (m.isVoter && m.voterStatus !== 'NO') && m.voterCategory === 'RED').length;
    const voterNotVerified = wardMembers.filter(m => m.voterStatus === 'NOT VERIFIED').length;

    const wellCount = wardFamilies.filter(f => f.economicStatus === 1).length;
    const moderateCount = wardFamilies.filter(f => f.economicStatus === 2).length;
    const lowCount = wardFamilies.filter(f => f.economicStatus === 3).length;

    const govtFamiliesCount = wardFamilies.filter(f => {
      const famMembers = members.filter(m => m.familyId === f.id);
      return famMembers.some(m => m.hasGovernmentJob);
    }).length;

    const wProblems = problems.filter(p => p.wardId === wardId);
    const wDevWorks = devWorks.filter(d => d.wardId === wardId);
    const wPeople = keyPeople.filter(kp => kp.wardId === wardId);
    const wSchemes = schemes.filter(s => familyIds.includes(s.familyId));

    const pmayPending = wSchemes.filter(s => s.schemeName.includes('PMAY') && s.status.includes('Pending')).length;
    const pmaySanctioned = wSchemes.filter(s => s.schemeName.includes('PMAY') && s.status.includes('Sanctioned')).length;
    const pmkisan = wSchemes.filter(s => s.schemeName.includes('PM-KISAN') || s.schemeName.includes('KISAN')).length;
    const pmkisanPending = wSchemes.filter(s => (s.schemeName.includes('PM-KISAN') || s.schemeName.includes('KISAN')) && !s.status.includes('Sanctioned')).length;
    const pension = wSchemes.filter(s => s.schemeName.includes('Pension')).length;
    const pensionPending = wSchemes.filter(s => s.schemeName.includes('Pension') && !s.status.includes('Sanctioned')).length;
    const otherPending = wSchemes.filter(s => !s.schemeName.includes('PMAY') && !s.schemeName.includes('KISAN') && !s.schemeName.includes('Pension') && s.status.includes('Pending')).length;
    const pendingTotal = wSchemes.filter(s => s.status.includes('Pending') || s.status.includes('Verification')).length;
    const activeTotal = wSchemes.filter(s => s.status.includes('Active') || s.status.includes('Sanctioned')).length;
    const completedTotal = wSchemes.filter(s => s.status.includes('Sanctioned') || s.status.includes('Disbursed')).length;

    const wardSchemeData = {
      total: wSchemes.length,
      totalTracked: wSchemes.length,
      pending: pendingTotal,
      active: activeTotal,
      completed: completedTotal,
      pmayPending,
      pmaySanctioned,
      pmkisan,
      pmkisanPending,
      pension,
      pensionPending,
      otherPending
    };
    
    // Reminders linked to this ward's families
    const wReminders = reminders.filter(r => {
      if (r.relatedEntityType === 'Family' && familyIds.includes(r.relatedEntityId || '')) return true;
      if (r.relatedEntityType === 'Problem') {
        const prob = problems.find(p => p.id === r.relatedEntityId);
        return prob?.wardId === wardId;
      }
      return false;
    });

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayReminders = wReminders.filter(r => r.dueDate === todayStr && !r.completed).length;
    const overdueReminders = wReminders.filter(r => r.dueDate < todayStr && !r.completed).length;
    const upcomingReminders = wReminders.filter(r => r.dueDate > todayStr && !r.completed).length;

    return {
      population: wardMembers.length,
      membersCount: wardMembers.length,
      familiesCount: wardFamilies.length,
      male,
      female,
      children,
      voters,
      voterStats: {
        total: voters,
        green: voterGreen,
        yellow: voterYellow,
        red: voterRed,
        notVerified: voterNotVerified
      },
      economicStats: {
        well: wellCount,
        moderate: moderateCount,
        low: lowCount,
        withGovtJob: govtFamiliesCount
      },
      familyEconomics: {
        well: wellCount,
        moderate: moderateCount,
        low: lowCount,
        withGovtJob: govtFamiliesCount
      },
      govtJobFamiliesCount: govtFamiliesCount,
      problemsStats: {
        total: wProblems.length,
        open: wProblems.filter(p => p.status === 'Open').length,
        highPriority: wProblems.filter(p => p.priority === 'High' && p.status !== 'Completed').length,
        pending: wProblems.filter(p => p.status === 'Pending').length,
        inProgress: wProblems.filter(p => p.status === 'In Progress').length,
        completed: wProblems.filter(p => p.status === 'Completed').length
      },
      problems: {
        total: wProblems.length,
        open: wProblems.filter(p => p.status === 'Open').length,
        highPriority: wProblems.filter(p => p.priority === 'High' && p.status !== 'Completed').length,
        pending: wProblems.filter(p => p.status === 'Pending').length,
        inProgress: wProblems.filter(p => p.status === 'In Progress').length,
        completed: wProblems.filter(p => p.status === 'Completed').length
      },
      devWorksStats: {
        total: wDevWorks.length,
        pending: wDevWorks.filter(d => d.status === 'Pending').length,
        inProgress: wDevWorks.filter(d => d.status === 'In Progress').length,
        completed: wDevWorks.filter(d => d.status === 'Completed').length,
        budgetSum: wDevWorks.reduce((acc, curr) => acc + curr.budgetRs, 0)
      },
      devWorks: {
        total: wDevWorks.length,
        pending: wDevWorks.filter(d => d.status === 'Pending').length,
        inProgress: wDevWorks.filter(d => d.status === 'In Progress').length,
        completed: wDevWorks.filter(d => d.status === 'Completed').length,
        budgetSum: wDevWorks.reduce((acc, curr) => acc + curr.budgetRs, 0)
      },
      schemes: wardSchemeData,
      schemesStats: wardSchemeData,
      schemeStats: wardSchemeData,
      schemesSummary: {
        pmayPending,
        pmkisanPending,
        pensionPending,
        otherPending,
        totalTracked: wSchemes.length
      },
      remindersStats: {
        today: todayReminders,
        overdue: overdueReminders,
        upcoming: upcomingReminders
      },
      peopleCount: wPeople.length
    };
  };

  // Overall Panchayat Aggregates
  const getPanchayatStats = () => {
    const totalPopulation = members.length;
    const totalVoters = members.filter(m => m.isVoter && m.voterStatus !== 'NO').length;
    const voterGreen = members.filter(m => (m.isVoter && m.voterStatus !== 'NO') && (m.voterCategory === 'GREEN' || !m.voterCategory)).length;
    const voterYellow = members.filter(m => (m.isVoter && m.voterStatus !== 'NO') && m.voterCategory === 'YELLOW').length;
    const voterRed = members.filter(m => (m.isVoter && m.voterStatus !== 'NO') && m.voterCategory === 'RED').length;
    const voterNotVerified = members.filter(m => m.voterStatus === 'NOT VERIFIED').length;
    const male = members.filter(m => m.gender === 'Male').length;
    const female = members.filter(m => m.gender === 'Female').length;
    const children = members.filter(m => m.age < 18).length;

    const pmayPending = schemes.filter(s => s.schemeName.includes('PMAY') && s.status.includes('Pending')).length;
    const pmkisanPending = schemes.filter(s => s.schemeName.includes('PM-KISAN') && !s.status.includes('Sanctioned')).length;
    const pensionPending = schemes.filter(s => s.schemeName.includes('Pension') && !s.status.includes('Sanctioned')).length;
    const otherPending = schemes.filter(s => !s.schemeName.includes('PMAY') && !s.schemeName.includes('PM-KISAN') && !s.schemeName.includes('Pension') && s.status.includes('Pending')).length;

    const openTickets = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
    const todayStr = new Date().toISOString().slice(0, 10);
    const overdueTickets = tickets.filter(t => t.targetDate < todayStr && t.status !== 'Resolved' && t.status !== 'Closed').length;
    const todayTickets = tickets.filter(t => t.targetDate === todayStr && t.status !== 'Resolved' && t.status !== 'Closed').length;
    const upcomingTickets = tickets.filter(t => t.targetDate > todayStr && t.status !== 'Resolved' && t.status !== 'Closed').length;

    const keyPeopleByCat: Record<string, number> = {};
    keyPeople.forEach(p => {
      keyPeopleByCat[p.category] = (keyPeopleByCat[p.category] || 0) + 1;
    });

    const pendingProblems = problems.filter(p => p.status === 'Open' || p.status === 'Pending' || p.status === 'In Progress').length;

    const panchayatSchemeData = {
      total: schemes.length,
      totalTracked: schemes.length,
      pmayPending,
      pmkisanPending,
      pensionPending,
      otherPending,
      pending: pmayPending + pmkisanPending + pensionPending + otherPending,
      active: schemes.filter(s => s.status.includes('Active') || s.status.includes('Sanctioned')).length,
      completed: schemes.filter(s => s.status.includes('Sanctioned')).length
    };

    return {
      population: totalPopulation,
      villagesCount: villages.length,
      wardsCount: wards.length,
      totalFamilies: families.length,
      totalMembers: members.length,
      totalVoters,
      voterStats: {
        total: totalVoters,
        green: voterGreen,
        yellow: voterYellow,
        red: voterRed,
        notVerified: voterNotVerified
      },
      male,
      female,
      children,
      keyPeopleByCat,
      templesCount: temples.length,
      eventsCount: events.length,
      problemsCount: problems.length,
      pendingProblems,
      problemsStats: {
        total: problems.length,
        open: problems.filter(p => p.status === 'Open').length,
        highPriority: problems.filter(p => p.priority === 'High' && p.status !== 'Completed').length,
        pending: problems.filter(p => p.status === 'Pending').length,
        inProgress: problems.filter(p => p.status === 'In Progress').length,
        completed: problems.filter(p => p.status === 'Completed').length
      },
      problems: {
        total: problems.length,
        open: problems.filter(p => p.status === 'Open').length,
        highPriority: problems.filter(p => p.priority === 'High' && p.status !== 'Completed').length,
        pending: problems.filter(p => p.status === 'Pending').length,
        inProgress: problems.filter(p => p.status === 'In Progress').length,
        completed: problems.filter(p => p.status === 'Completed').length
      },
      devWorksCount: devWorks.length,
      devWorksStats: {
        total: devWorks.length,
        pending: devWorks.filter(d => d.status === 'Pending').length,
        inProgress: devWorks.filter(d => d.status === 'In Progress').length,
        completed: devWorks.filter(d => d.status === 'Completed').length,
        budgetSum: devWorks.reduce((acc, curr) => acc + curr.budgetRs, 0)
      },
      devWorks: {
        total: devWorks.length,
        pending: devWorks.filter(d => d.status === 'Pending').length,
        inProgress: devWorks.filter(d => d.status === 'In Progress').length,
        completed: devWorks.filter(d => d.status === 'Completed').length,
        budgetSum: devWorks.reduce((acc, curr) => acc + curr.budgetRs, 0)
      },
      schemes: panchayatSchemeData,
      schemeStats: panchayatSchemeData,
      schemesStats: panchayatSchemeData,
      schemesSummary: {
        pmayPending,
        pmkisanPending,
        pensionPending,
        otherPending,
        totalTracked: schemes.length
      },
      followUpSummary: {
        openTickets,
        overdueTickets,
        todayFollowups: todayTickets,
        upcomingFollowups: upcomingTickets
      }
    };
  };

  // ID Generators
  const generateNextFamilyId = (wardId: string) => {
    const wardFamilies = families.filter(f => f.wardId === wardId);
    const maxNum = wardFamilies.reduce((max, f) => {
      const match = f.id.match(/-F(\d+)$/);
      if (match) {
        const n = parseInt(match[1], 10);
        return n > max ? n : max;
      }
      return max;
    }, 0);
    const nextNum = (maxNum + 1).toString().padStart(3, '0');
    return `${wardId}-F${nextNum}`;
  };

  const generateNextMemberId = (familyId: string) => {
    const famMembers = members.filter(m => m.familyId === familyId);
    const maxNum = famMembers.reduce((max, m) => {
      const match = m.id.match(/-M(\d+)$/);
      if (match) {
        const n = parseInt(match[1], 10);
        return n > max ? n : max;
      }
      return max;
    }, 0);
    const nextNum = (maxNum + 1).toString().padStart(2, '0');
    return `${familyId}-M${nextNum}`;
  };

  const generateNextProblemId = (wardId: string) => {
    const ward = wards.find(w => w.id === wardId);
    const wardNum = ward ? `W${ward.wardNumber.toString().padStart(2, '0')}` : 'W01';
    const existing = problems.filter(p => p.id.includes(wardNum));
    const nextNum = (existing.length + 1).toString().padStart(3, '0');
    return `PR-${wardNum}-${nextNum}`;
  };

  const generateNextTicketId = (familyId: string) => {
    const fMatch = familyId.match(/F\d+$/);
    const fPart = fMatch ? fMatch[0] : 'F001';
    const existing = tickets.filter(t => t.id.includes(fPart));
    const nextNum = (existing.length + 1).toString().padStart(3, '0');
    return `TK-${fPart}-${nextNum}`;
  };

  // Search All
  const searchAll = (query: string): SearchResultItem[] => {
    if (!query || query.trim().length === 0) return [];
    const q = query.toLowerCase().trim();
    const results: SearchResultItem[] = [];

    // Search Families
    families.forEach(f => {
      if (
        f.id.toLowerCase().includes(q) ||
        f.familyHeadName.toLowerCase().includes(q) ||
        f.contactPersonName.toLowerCase().includes(q) ||
        f.primaryMobile.includes(q) ||
        f.address.toLowerCase().includes(q) ||
        f.rationCardNumber?.toLowerCase().includes(q)
      ) {
        const village = villages.find(v => v.id === f.villageId);
        results.push({
          id: f.id,
          type: 'family',
          title: `${f.familyHeadName} (${f.id})`,
          subtitle: `${village?.name || 'Village'}, ${f.address} | Mob: ${f.primaryMobile}`,
          badge: f.economicStatus === 1 ? '1 - Well' : f.economicStatus === 2 ? '2 - Moderate' : '3 - Low',
          targetView: 'families',
          targetId: f.id
        });
      }
    });

    // Search Members (and Voter Category Queries)
    const isVoterQuery = q.includes('voter') || q.includes('green') || q.includes('yellow') || q.includes('red') || q.includes('verified');
    const targetCat = q.includes('green') ? 'GREEN' : q.includes('yellow') ? 'YELLOW' : q.includes('red') ? 'RED' : null;

    members.forEach(m => {
      const isVoterYes = m.isVoter && m.voterStatus !== 'NO';
      const voterCategory = m.voterCategory || 'GREEN';

      const directMatch =
        m.name.toLowerCase().includes(q) ||
        m.fatherHusbandName.toLowerCase().includes(q) ||
        m.voterEpicNumber?.toLowerCase().includes(q) ||
        m.mobile?.includes(q) ||
        m.occupation.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q);

      const categoryQueryMatch = isVoterQuery && (
        (targetCat && isVoterYes && voterCategory === targetCat) ||
        (q.includes('not verified') && m.voterStatus === 'NOT VERIFIED') ||
        (q === 'voter' && isVoterYes) ||
        (q === 'voters' && isVoterYes)
      );

      if (directMatch || categoryQueryMatch) {
        let voterBadge = m.isVoter ? 'Voter: YES' : 'Non-Voter';
        if (isVoterYes) {
          voterBadge = voterCategory === 'GREEN' ? '🟢 GREEN' : voterCategory === 'YELLOW' ? '🟡 YELLOW' : '🔴 RED';
        } else if (m.voterStatus === 'NOT VERIFIED') {
          voterBadge = '⚠️ NOT VERIFIED';
        }

        results.push({
          id: m.id,
          type: 'member',
          title: `${m.name} (${m.relation}, ${m.age}y)`,
          subtitle: `Family: ${m.familyId} | ${m.occupation} | Voter: ${m.voterStatus || (m.isVoter ? 'YES' : 'NO')}`,
          badge: voterBadge,
          targetView: 'families',
          targetId: m.familyId
        });
      }
    });

    // Search Problems
    problems.forEach(p => {
      if (
        p.id.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      ) {
        results.push({
          id: p.id,
          type: 'problem',
          title: `${p.title} (${p.id})`,
          subtitle: `Ward: ${p.wardId} | Status: ${p.status} | Dept: ${p.officialDepartment || 'Panchayat'}`,
          badge: p.status,
          targetView: 'community-problems',
          targetId: p.id
        });
      }
    });

    // Search Tickets
    tickets.forEach(t => {
      if (
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      ) {
        results.push({
          id: t.id,
          type: 'ticket',
          title: `${t.title} (${t.id})`,
          subtitle: `Family: ${t.familyId} | Priority: ${t.priority} | Due: ${t.targetDate}`,
          badge: t.status,
          targetView: 'tickets',
          targetId: t.id
        });
      }
    });

    // Search Key People
    keyPeople.forEach(p => {
      if (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.designation?.toLowerCase().includes(q)
      ) {
        results.push({
          id: p.id,
          type: 'person',
          title: `${p.name} (${p.category})`,
          subtitle: `${p.designation || ''} | Phone: ${p.phone}`,
          badge: p.category,
          targetView: 'people',
          targetId: p.id
        });
      }
    });

    // Search Schemes
    schemes.forEach(s => {
      if (
        s.id.toLowerCase().includes(q) ||
        s.schemeName.toLowerCase().includes(q) ||
        s.applicantName.toLowerCase().includes(q) ||
        s.applicationNumber?.toLowerCase().includes(q)
      ) {
        results.push({
          id: s.id,
          type: 'scheme',
          title: `${s.schemeName} - ${s.applicantName}`,
          subtitle: `App No: ${s.applicationNumber || 'N/A'} | Status: ${s.status}`,
          badge: s.status,
          targetView: 'schemes',
          targetId: s.id
        });
      }
    });

    // Search Temples
    temples.forEach(t => {
      if (
        t.name.toLowerCase().includes(q) ||
        t.deity.toLowerCase().includes(q) ||
        t.majorFestival.toLowerCase().includes(q)
      ) {
        results.push({
          id: t.id,
          type: 'temple',
          title: t.name,
          subtitle: `Deity: ${t.deity} | Festival: ${t.majorFestival}`,
          badge: 'Temple',
          targetView: 'temples',
          targetId: t.id
        });
      }
    });

    return results.slice(0, 15);
  };

  // Persistent Notification state
  const [readNotifIds, setReadNotifIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_read_notifs');
    return saved ? JSON.parse(saved) : [];
  });
  const [dismissedNotifIds, setDismissedNotifIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_dismissed_notifs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_read_notifs', JSON.stringify(readNotifIds));
  }, [readNotifIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_dismissed_notifs', JSON.stringify(dismissedNotifIds));
  }, [dismissedNotifIds]);

  // Derived Notifications
  const todayStr = new Date().toISOString().slice(0, 10);
  const next48Hours = new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 10);

  const notifications: NotificationItem[] = useMemo(() => {
    const list: NotificationItem[] = [];

    // 1. Overdue follow-up tickets
    tickets.forEach(t => {
      if (t.targetDate < todayStr && t.status !== 'Resolved' && t.status !== 'Closed') {
        const id = `notif-overdue-${t.id}`;
        if (!dismissedNotifIds.includes(id)) {
          const fam = families.find(f => f.id === t.familyId);
          list.push({
            id,
            type: 'overdue_followup',
            title: `Overdue Follow-up: ${t.title}`,
            message: `Ticket #${t.ticketNumber} for ${fam?.familyHeadName || 'Family'} passed target date (${t.targetDate}). Priority: ${t.priority}.`,
            timestamp: t.targetDate,
            priority: 'Urgent',
            targetView: 'tickets',
            targetId: t.id,
            isRead: readNotifIds.includes(id),
            metadata: { familyId: t.familyId, dueDate: t.targetDate }
          });
        }
      }
    });

    // 2. Newly assigned / active tickets
    tickets.forEach(t => {
      if ((t.status === 'Open' || t.status === 'In Progress') && t.targetDate >= todayStr) {
        const id = `notif-assigned-${t.id}`;
        if (!dismissedNotifIds.includes(id)) {
          list.push({
            id,
            type: 'assigned_ticket',
            title: `Assigned Ticket: ${t.title}`,
            message: `Assigned to ${t.assignedTo}. Category: ${t.category} • Target Date: ${t.targetDate}.`,
            timestamp: t.createdDate || todayStr,
            priority: t.priority,
            targetView: 'tickets',
            targetId: t.id,
            isRead: readNotifIds.includes(id),
            metadata: { familyId: t.familyId, dueDate: t.targetDate }
          });
        }
      }
    });

    // 3. Upcoming reminders
    reminders.forEach(r => {
      if (!r.completed && r.dueDate <= next48Hours) {
        const id = `notif-reminder-${r.id}`;
        if (!dismissedNotifIds.includes(id)) {
          const isOverdue = r.dueDate < todayStr;
          list.push({
            id,
            type: 'upcoming_reminder',
            title: isOverdue ? `Overdue Reminder: ${r.title}` : `Upcoming Reminder: ${r.title}`,
            message: `Due: ${r.dueDate} ${r.dueTime ? 'at ' + r.dueTime : ''} (${r.relatedEntityName || r.relatedEntityType || 'Field Action'}).`,
            timestamp: r.dueDate,
            priority: isOverdue ? 'Urgent' : r.priority,
            targetView: 'reminders',
            targetId: r.id,
            isRead: readNotifIds.includes(id),
            metadata: { dueDate: r.dueDate }
          });
        }
      }
    });

    // 4. Newly reported community problems
    problems.forEach(p => {
      if (p.status !== 'Completed') {
        const id = `notif-problem-${p.id}`;
        if (!dismissedNotifIds.includes(id)) {
          const village = villages.find(v => v.id === p.villageId);
          list.push({
            id,
            type: 'new_problem',
            title: `Community Grievance: ${p.title}`,
            message: `${village?.name || 'Village'} • Category: ${p.category} • Status: ${p.status}.`,
            timestamp: p.reportedDate || todayStr,
            priority: p.priority,
            targetView: 'problems',
            targetId: p.id,
            isRead: readNotifIds.includes(id),
            metadata: { villageId: p.villageId, wardId: p.wardId }
          });
        }
      }
    });

    const priorityWeight: Record<string, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
    return list.sort((a, b) => {
      if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
      const pDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      if (pDiff !== 0) return pDiff;
      return b.timestamp.localeCompare(a.timestamp);
    });
  }, [tickets, reminders, problems, villages, families, readNotifIds, dismissedNotifIds, todayStr, next48Hours]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const markNotificationAsRead = (id: string) => {
    setReadNotifIds(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const markAllNotificationsAsRead = () => {
    setReadNotifIds(notifications.map(n => n.id));
  };

  const dismissNotification = (id: string) => {
    setDismissedNotifIds(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const clearAllNotifications = () => {
    setDismissedNotifIds(notifications.map(n => n.id));
  };

  // Advanced Multi-Criteria Filter Implementation
  const filterData = (options: AdvancedFilterOptions): FilteredResults => {
    const {
      villageId,
      wardId,
      familyStatus,
      schemeStatus,
      ticketPriority,
      ticketStatus,
      problemPriority,
      searchTerm
    } = options;

    const term = (searchTerm || '').trim().toLowerCase();

    // 1. Filter Families
    const filteredFamilies = families.filter(f => {
      if (villageId && villageId !== 'all' && f.villageId !== villageId) return false;
      if (wardId && wardId !== 'all' && f.wardId !== wardId) return false;

      // Family status filter (APL, BPL, Antyodaya, or numeric economic status)
      if (familyStatus && familyStatus !== 'all') {
        if (familyStatus === 'BPL' && f.rationCategory !== 'BPL' && f.economicStatus !== 3) return false;
        if (familyStatus === 'Antyodaya' && f.rationCategory !== 'Antyodaya' && f.economicStatus !== 3) return false;
        if (familyStatus === 'APL' && f.rationCategory !== 'APL' && f.economicStatus !== 1) return false;
        if (familyStatus === 'PHH' && f.rationCategory !== 'PHH') return false;
        if (familyStatus === '1' && f.economicStatus !== 1) return false;
        if (familyStatus === '2' && f.economicStatus !== 2) return false;
        if (familyStatus === '3' && f.economicStatus !== 3) return false;
      }

      if (term) {
        const matchesTerm =
          f.id.toLowerCase().includes(term) ||
          f.familyHeadName.toLowerCase().includes(term) ||
          f.contactPersonName.toLowerCase().includes(term) ||
          f.primaryMobile.includes(term) ||
          f.address.toLowerCase().includes(term) ||
          (f.rationCardNumber && f.rationCardNumber.toLowerCase().includes(term));
        if (!matchesTerm) return false;
      }

      return true;
    });

    const matchingFamilyIds = new Set(filteredFamilies.map(f => f.id));

    // 2. Filter Members
    const filteredMembers = members.filter(m => {
      if (!matchingFamilyIds.has(m.familyId) && (villageId !== 'all' || wardId !== 'all' || familyStatus !== 'all')) {
        return false;
      }
      if (term) {
        return (
          m.name.toLowerCase().includes(term) ||
          m.id.toLowerCase().includes(term) ||
          (m.voterEpicNumber && m.voterEpicNumber.toLowerCase().includes(term)) ||
          (m.mobile && m.mobile.includes(term)) ||
          m.occupation.toLowerCase().includes(term)
        );
      }
      return true;
    });

    // 3. Filter Schemes
    const filteredSchemes = schemes.filter(s => {
      if (villageId && villageId !== 'all') {
        const fam = families.find(f => f.id === s.familyId);
        if (!fam || fam.villageId !== villageId) return false;
      }
      if (wardId && wardId !== 'all') {
        const fam = families.find(f => f.id === s.familyId);
        if (!fam || fam.wardId !== wardId) return false;
      }
      if (schemeStatus && schemeStatus !== 'all') {
        if (!s.status.toLowerCase().includes(schemeStatus.toLowerCase())) return false;
      }
      if (term) {
        const matchesTerm =
          s.id.toLowerCase().includes(term) ||
          s.schemeName.toLowerCase().includes(term) ||
          s.applicantName.toLowerCase().includes(term) ||
          (s.applicationNumber && s.applicationNumber.toLowerCase().includes(term));
        if (!matchesTerm) return false;
      }
      return true;
    });

    // 4. Filter Tickets
    const filteredTickets = tickets.filter(t => {
      if (villageId && villageId !== 'all') {
        const fam = families.find(f => f.id === t.familyId);
        if (!fam || fam.villageId !== villageId) return false;
      }
      if (wardId && wardId !== 'all') {
        const fam = families.find(f => f.id === t.familyId);
        if (!fam || fam.wardId !== wardId) return false;
      }
      if (ticketPriority && ticketPriority !== 'all' && t.priority !== ticketPriority) {
        return false;
      }
      if (ticketStatus && ticketStatus !== 'all' && t.status !== ticketStatus) {
        return false;
      }
      if (term) {
        const matchesTerm =
          t.id.toLowerCase().includes(term) ||
          t.ticketNumber.toLowerCase().includes(term) ||
          t.title.toLowerCase().includes(term) ||
          t.description.toLowerCase().includes(term) ||
          t.assignedTo.toLowerCase().includes(term);
        if (!matchesTerm) return false;
      }
      return true;
    });

    // 5. Filter Community Problems
    const filteredProblems = problems.filter(p => {
      if (villageId && villageId !== 'all' && p.villageId !== villageId) return false;
      if (wardId && wardId !== 'all' && p.wardId !== wardId) return false;
      if (problemPriority && problemPriority !== 'all' && p.priority !== problemPriority) return false;
      if (term) {
        const matchesTerm =
          p.id.toLowerCase().includes(term) ||
          p.problemNumber.toLowerCase().includes(term) ||
          p.title.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term);
        if (!matchesTerm) return false;
      }
      return true;
    });

    const totalMatches =
      filteredFamilies.length +
      filteredMembers.length +
      filteredSchemes.length +
      filteredTickets.length +
      filteredProblems.length;

    return {
      families: filteredFamilies,
      members: filteredMembers,
      schemes: filteredSchemes,
      tickets: filteredTickets,
      problems: filteredProblems,
      totalMatches
    };
  };

  // Server Synchronization
  const [isSyncing, setIsSyncing] = useState(false);

  const syncWithServer = async () => {
    try {
      setIsSyncing(true);
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          panchayat,
          villages,
          wards,
          families,
          members,
          schemes,
          tickets,
          assistance,
          problems,
          devWorks,
          keyPeople,
          temples,
          events,
          births,
          deaths,
          reminders
        })
      });
    } catch (e) {
      console.warn('Sync with server completed in cached mode:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync with server on mutations (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      syncWithServer();
    }, 1500);
    return () => clearTimeout(timer);
  }, [panchayat, villages, wards, families, members, schemes, tickets, assistance, problems, devWorks, keyPeople, temples, events, births, deaths, reminders]);

  // CRUD Implementations
  const updatePanchayat = (p: Panchayat) => {
    setPanchayat(p);
    logAction('UPDATE', 'Panchayat', p.id, `Updated details of Panchayat ${p.name}`);
  };

  const addVillage = (v: Village) => {
    setVillages(prev => {
      const exists = prev.some(item => item.id === v.id);
      return exists ? prev.map(item => item.id === v.id ? v : item) : [...prev, v];
    });
    logAction('CREATE', 'Village', v.id, `Added new Village: ${v.name} (${v.code})`);
  };

  const updateVillage = (v: Village) => {
    setVillages(prev => prev.map(item => item.id === v.id ? v : item));
    logAction('UPDATE', 'Village', v.id, `Updated details of Village: ${v.name}`);
  };

  const deleteVillage = (id: string) => {
    const v = villages.find(x => x.id === id);
    setVillages(prev => prev.filter(item => item.id !== id));
    // Cascade cleanup for wards
    setWards(prev => prev.filter(w => w.villageId !== id));
    // Cascade cleanup for families and linked members
    const removedFamIds = families.filter(f => f.villageId === id).map(f => f.id);
    setFamilies(prev => prev.filter(f => f.villageId !== id));
    setMembers(prev => prev.filter(m => !removedFamIds.includes(m.familyId)));
    // Cascade cleanup for associated community problems and dev works
    setProblems(prev => prev.filter(p => p.villageId !== id));
    setDevWorks(prev => prev.filter(dw => dw.villageId !== id));
    setKeyPeople(prev => prev.filter(kp => kp.villageId !== id));
    setTemples(prev => prev.filter(t => t.villageId !== id));
    setEvents(prev => prev.filter(e => e.villageId !== id));
    logAction('DELETE', 'Village', id, `Removed Village: ${v?.name || id} and all associated wards/households`);
  };

  const addWard = (w: Ward) => {
    setWards(prev => {
      const exists = prev.some(item => item.id === w.id);
      return exists ? prev.map(item => item.id === w.id ? w : item) : [...prev, w];
    });
    logAction('CREATE', 'Ward', w.id, `Added Ward ${w.wardNumber} in Village ${w.villageId}`);
  };

  const updateWard = (w: Ward) => {
    setWards(prev => prev.map(item => item.id === w.id ? w : item));
    logAction('UPDATE', 'Ward', w.id, `Updated Ward ${w.wardNumber} details`);
  };

  const deleteWard = (id: string) => {
    const w = wards.find(x => x.id === id);
    setWards(prev => prev.filter(item => item.id !== id));
    const removedFamIds = families.filter(f => f.wardId === id).map(f => f.id);
    setFamilies(prev => prev.filter(f => f.wardId !== id));
    setMembers(prev => prev.filter(m => !removedFamIds.includes(m.familyId)));
    setProblems(prev => prev.filter(p => p.wardId !== id));
    setDevWorks(prev => prev.filter(dw => dw.wardId !== id));
    logAction('DELETE', 'Ward', id, `Removed Ward: ${w ? `Ward ${w.wardNumber} (${w.id})` : id}`);
  };

  const addUser = (newUser: User) => {
    setUsers(prev => {
      const exists = prev.some(u => u.id === newUser.id || u.username.toLowerCase() === newUser.username.toLowerCase());
      if (exists) {
        return prev.map(u => (u.id === newUser.id || u.username.toLowerCase() === newUser.username.toLowerCase()) ? newUser : u);
      }
      return [...prev, newUser];
    });
    logAction('CREATE', 'User', newUser.id, `Added new user: ${newUser.name} (@${newUser.username}, Role: ${newUser.role})`);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    logAction('UPDATE', 'User', updatedUser.id, `Updated user details for ${updatedUser.name} (${updatedUser.role})`);
  };

  const deleteUser = (id: string) => {
    const targetUser = users.find(x => x.id === id);
    if (!targetUser) return;
    const adminCount = users.filter(x => x.role === 'Admin' || x.role === 'Super Admin').length;
    if ((targetUser.role === 'Admin' || targetUser.role === 'Super Admin') && adminCount <= 1) {
      alert('Action blocked: Cannot delete the primary administrator. At least one administrator account must be retained.');
      return;
    }
    setUsers(prev => prev.filter(x => x.id !== id));
    logAction('DELETE', 'User', id, `Deleted user account: ${targetUser.name} (@${targetUser.username})`);
  };

  const addFamilyWithMembers = (family: Family, newMembers: FamilyMember[]) => {
    setFamilies(prev => {
      const exists = prev.some(item => item.id === family.id);
      return exists ? prev.map(item => item.id === family.id ? family : item) : [family, ...prev];
    });
    if (newMembers.length > 0) {
      setMembers(prev => {
        const newIds = new Set(newMembers.map(m => m.id));
        const filteredPrev = prev.filter(m => !newIds.has(m.id));
        return [...filteredPrev, ...newMembers];
      });
    }
    logAction('CREATE', 'Family', family.id, `Added Family ${family.familyHeadName} (${family.id}) with ${newMembers.length} members`);
  };

  const updateFamily = (family: Family) => {
    setFamilies(prev => prev.map(item => item.id === family.id ? family : item));
    logAction('UPDATE', 'Family', family.id, `Updated Family ${family.familyHeadName} details`);
  };

  const deleteFamily = (id: string) => {
    const f = families.find(x => x.id === id);
    setFamilies(prev => prev.filter(item => item.id !== id));
    setMembers(prev => prev.filter(item => item.familyId !== id));
    logAction('DELETE', 'Family', id, `Removed Family ${f?.familyHeadName || id} and linked members`);
  };

  const addMember = (m: FamilyMember) => {
    setMembers(prev => {
      const exists = prev.some(item => item.id === m.id);
      return exists ? prev.map(item => item.id === m.id ? m : item) : [...prev, m];
    });
    logAction('CREATE', 'Member', m.id, `Added Member ${m.name} to Family ${m.familyId}`);
  };

  const updateMember = (m: FamilyMember) => {
    setMembers(prev => prev.map(item => item.id === m.id ? m : item));
    logAction('UPDATE', 'Member', m.id, `Updated Member: ${m.name}`);
  };

  const updateMemberVoterInfo = (
    memberId: string,
    updates: {
      isVoter?: boolean;
      voterStatus?: VoterStatus;
      voterCategory?: VoterCategory;
      voterEpicNumber?: string;
    }
  ) => {
    setMembers(prev =>
      prev.map(m => {
        if (m.id !== memberId) return m;
        const newIsVoter = updates.isVoter !== undefined ? updates.isVoter : (updates.voterStatus === 'YES' ? true : updates.voterStatus === 'NO' ? false : m.isVoter);
        const newStatus = updates.voterStatus || (newIsVoter ? 'YES' : 'NO');
        const newCat = updates.voterCategory !== undefined ? updates.voterCategory : m.voterCategory;
        const newEpic = updates.voterEpicNumber !== undefined ? updates.voterEpicNumber : m.voterEpicNumber;

        return {
          ...m,
          isVoter: newIsVoter,
          voterStatus: newStatus,
          voterCategory: newCat,
          voterEpicNumber: newEpic
        };
      })
    );
    const target = members.find(m => m.id === memberId);
    logAction(
      'UPDATE',
      'Member Voter Info',
      memberId,
      `Updated voter status (${updates.voterStatus || 'auto'}) / category (${updates.voterCategory || 'unchanged'}) for ${target?.name || memberId}`
    );
  };

  const deleteMember = (id: string) => {
    const m = members.find(x => x.id === id);
    setMembers(prev => prev.filter(item => item.id !== id));
    logAction('DELETE', 'Member', id, `Removed Member: ${m?.name || id}`);
  };

  const addScheme = (s: SchemeApplication) => {
    setSchemes(prev => {
      const exists = prev.some(item => item.id === s.id);
      return exists ? prev.map(item => item.id === s.id ? s : item) : [s, ...prev];
    });
    logAction('CREATE', 'Scheme', s.id, `Created ${s.schemeName} application for ${s.applicantName}`);
  };

  const updateScheme = (s: SchemeApplication) => {
    setSchemes(prev => prev.map(item => item.id === s.id ? s : item));
    logAction('UPDATE', 'Scheme', s.id, `Updated ${s.schemeName} application (${s.status})`);
  };

  const deleteScheme = (id: string) => {
    setSchemes(prev => prev.filter(item => item.id !== id));
    logAction('DELETE', 'Scheme', id, `Removed scheme application ${id}`);
  };

  const syncTicketToAssistance = (t: FollowUpTicket, prevAssistance: PersonalAssistance[]): PersonalAssistance[] => {
    const targetFamilyId = t.familyId;
    const isFamilyScope = t.ticketScope === 'INDIVIDUAL_FAMILY' || !!targetFamilyId || t.ticketType === 'family' || t.ticketType === 'personal_help' || t.ticketType === 'scheme';
    
    // Also sync if it's community ticket with explicit autoSyncAssistance or attached family
    if (!isFamilyScope && !t.autoSyncAssistance && !targetFamilyId) {
      return prevAssistance;
    }

    const effectiveFamilyId = targetFamilyId || families[0]?.id || 'NGV001-W01-F001';
    const targetFamily = families.find(f => f.id === effectiveFamilyId);
    const targetMember = members.find(m => m.id === t.memberId);
    const beneName = targetMember ? targetMember.name : (targetFamily ? `${targetFamily.familyHeadName} (Head)` : 'Citizen Beneficiary');

    const astId = t.ticketAssistanceId || `AST-TK-${t.id}`;
    const now = new Date().toISOString();

    // Status mapping: Resolved/Closed -> DONE; In Progress/Follow-up -> APPLIED; Open -> PENDING
    let astStatus: PersonalAssistance['status'] = 'PENDING';
    if (t.status === 'Resolved' || t.status === 'Closed') {
      astStatus = 'DONE';
    } else if (t.status === 'In Progress' || t.status === 'Follow-up Scheduled') {
      astStatus = 'APPLIED';
    }

    // Assistance Type mapping
    const isScheme = t.helpType === 'GOVT_SCHEME' || t.category === 'Scheme Assistance' || !!t.schemeName || t.ticketType === 'scheme';
    const astType: PersonalAssistance['assistanceType'] = isScheme ? 'SCHEME_ASSISTANCE' : 'PERSONAL_ASSISTANCE';
    const schemeTitle = t.schemeName || (isScheme ? t.title : undefined);

    const existingIndex = prevAssistance.findIndex(
      item => item.id === astId || item.assistance_id === astId || item.ticketId === t.id || item.sourceTicketId === t.id
    );

    const syncedAssistance: PersonalAssistance = {
      id: existingIndex >= 0 ? prevAssistance[existingIndex].id : astId,
      assistance_id: existingIndex >= 0 ? prevAssistance[existingIndex].id : astId,
      ticketId: t.id,
      sourceTicketId: t.id,
      ticketScope: t.ticketScope || (isFamilyScope ? 'INDIVIDUAL_FAMILY' : 'COMMUNITY_VILLAGE_WARD'),
      familyId: effectiveFamilyId,
      family_id: effectiveFamilyId,
      memberId: t.memberId || undefined,
      member_id: t.memberId || undefined,
      beneficiaryName: beneName,
      villageId: t.villageId || targetFamily?.villageId,
      wardId: t.wardId || targetFamily?.wardId,
      assistanceType: astType,
      assistance_type: astType,
      schemeId: schemeTitle,
      scheme_id: schemeTitle,
      schemeName: schemeTitle,
      note: t.notes || t.title,
      description: t.description || t.title,
      date: t.createdDate || now.slice(0, 10),
      status: astStatus,
      completionDate: (astStatus === 'DONE') ? (t.resolvedDate || t.targetDate || now.slice(0, 10)) : undefined,
      completion_date: (astStatus === 'DONE') ? (t.resolvedDate || t.targetDate || now.slice(0, 10)) : undefined,
      nextFollowupAt: t.targetDate,
      next_followup_at: t.targetDate,
      outcome: (astStatus === 'DONE') ? `Resolved via Field Ticket ${t.id}` : undefined,
      createdAt: existingIndex >= 0 ? (prevAssistance[existingIndex].createdAt || now) : now,
      created_at: existingIndex >= 0 ? (prevAssistance[existingIndex].created_at || now) : now,
      updatedAt: now,
      updated_at: now,
      createdBy: 'Ticket Auto-Sync',
      created_by: 'Ticket Auto-Sync'
    };

    if (existingIndex >= 0) {
      const copy = [...prevAssistance];
      copy[existingIndex] = { ...copy[existingIndex], ...syncedAssistance };
      return copy;
    } else {
      return [syncedAssistance, ...prevAssistance];
    }
  };

  const addTicket = (t: FollowUpTicket) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const sanitized: FollowUpTicket = {
      ...t,
      resolvedDate: (t.status === 'Resolved' || t.status === 'Closed') ? (t.resolvedDate || todayStr) : t.resolvedDate
    };
    setTickets(prev => {
      const exists = prev.some(item => item.id === sanitized.id);
      return exists ? prev.map(item => item.id === sanitized.id ? sanitized : item) : [sanitized, ...prev];
    });
    // Auto sync to direct assistance pane if family/individual help or autoSyncAssistance
    setAssistance(prevAst => syncTicketToAssistance(sanitized, prevAst));
    logAction('CREATE', 'Ticket', sanitized.id, `Opened follow-up ticket: ${sanitized.title} (Auto-synced to Assistance Pane)`);
  };

  const updateTicket = (t: FollowUpTicket) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const sanitized: FollowUpTicket = {
      ...t,
      resolvedDate: (t.status === 'Resolved' || t.status === 'Closed') ? (t.resolvedDate || todayStr) : t.resolvedDate
    };
    setTickets(prev => prev.map(item => item.id === sanitized.id ? sanitized : item));
    // Auto update in direct assistance pane
    setAssistance(prevAst => syncTicketToAssistance(sanitized, prevAst));
    logAction('UPDATE', 'Ticket', sanitized.id, `Updated ticket ${sanitized.id} to ${sanitized.status} (Assistance Pane synced)`);
  };

  const solveTicket = (id: string, notes?: string) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const target = tickets.find(t => t.id === id);
    if (!target) return;
    const updated: FollowUpTicket = {
      ...target,
      status: 'Resolved',
      resolvedDate: target.resolvedDate || todayStr,
      notes: notes ? (target.notes ? `${target.notes} | Resolution: ${notes}` : notes) : target.notes
    };
    updateTicket(updated);
    logAction('UPDATE', 'Ticket', id, `Marked individual/family ticket as Solved / Resolved`);
  };

  const deleteTicket = (id: string) => {
    setTickets(prev => prev.filter(item => item.id !== id));
    setAssistance(prev => prev.filter(item => item.ticketId !== id && item.sourceTicketId !== id && item.id !== `AST-TK-${id}`));
    logAction('DELETE', 'Ticket', id, `Removed ticket: ${id}`);
  };

  const addAssistance = (a: PersonalAssistance) => {
    const now = new Date().toISOString();
    const id = a.id || a.assistance_id || `AST-${Date.now()}`;
    const standardized: PersonalAssistance = {
      ...a,
      id,
      assistance_id: id,
      familyId: a.familyId || a.family_id || '',
      family_id: a.familyId || a.family_id || '',
      memberId: a.memberId || a.member_id || undefined,
      member_id: a.memberId || a.member_id || undefined,
      assistanceType: a.assistanceType || a.assistance_type || 'PERSONAL_ASSISTANCE',
      assistance_type: a.assistanceType || a.assistance_type || 'PERSONAL_ASSISTANCE',
      status: a.status || 'PENDING',
      createdAt: a.createdAt || a.created_at || now,
      created_at: a.createdAt || a.created_at || now,
      updatedAt: now,
      updated_at: now,
      createdBy: a.createdBy || a.created_by || 'Admin',
      created_by: a.createdBy || a.created_by || 'Admin'
    };
    setAssistance(prev => {
      const exists = prev.some(item => item.id === id || item.assistance_id === id);
      return exists ? prev.map(item => (item.id === id || item.assistance_id === id) ? standardized : item) : [standardized, ...prev];
    });
    logAction('CREATE', 'Assistance', id, `Recorded direct assistance (${standardized.assistanceType}) for ${standardized.beneficiaryName || standardized.familyId}`);
  };

  const updateAssistance = (a: PersonalAssistance) => {
    const now = new Date().toISOString();
    const id = a.id || a.assistance_id || '';
    setAssistance(prev =>
      prev.map(item => {
        if (item.id === id || item.assistance_id === id) {
          const updated: PersonalAssistance = {
            ...item,
            ...a,
            id,
            assistance_id: id,
            familyId: a.familyId || a.family_id || item.familyId,
            family_id: a.familyId || a.family_id || item.familyId,
            memberId: a.memberId !== undefined ? a.memberId : (a.member_id !== undefined ? a.member_id : item.memberId),
            member_id: a.memberId !== undefined ? a.memberId : (a.member_id !== undefined ? a.member_id : item.memberId),
            assistanceType: a.assistanceType || a.assistance_type || item.assistanceType,
            assistance_type: a.assistanceType || a.assistance_type || item.assistanceType,
            status: a.status || item.status,
            updatedAt: now,
            updated_at: now,
            updatedBy: a.updatedBy || a.updated_by || 'Admin',
            updated_by: a.updatedBy || a.updated_by || 'Admin'
          };
          return updated;
        }
        return item;
      })
    );
    logAction('UPDATE', 'Assistance', id, `Updated assistance record: ${id} (Status: ${a.status})`);
  };

  const deleteAssistance = (id: string) => {
    setAssistance(prev => prev.filter(item => item.id !== id));
    logAction('DELETE', 'Assistance', id, `Removed assistance record: ${id}`);
  };

  const addProblem = (p: CommunityProblem) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const sanitized: CommunityProblem = {
      ...p,
      resolvedDate: (p.status === 'Completed' || (p.status as any) === 'Resolved') ? (p.resolvedDate || todayStr) : p.resolvedDate
    };
    setProblems(prev => {
      const exists = prev.some(item => item.id === sanitized.id);
      return exists ? prev.map(item => item.id === sanitized.id ? sanitized : item) : [sanitized, ...prev];
    });
    logAction('CREATE', 'Problem', sanitized.id, `Reported community problem: ${sanitized.title} (${sanitized.category})`);
  };

  const updateProblem = (p: CommunityProblem) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const sanitized: CommunityProblem = {
      ...p,
      resolvedDate: (p.status === 'Completed' || (p.status as any) === 'Resolved') ? (p.resolvedDate || todayStr) : p.resolvedDate
    };
    setProblems(prev => prev.map(item => item.id === sanitized.id ? sanitized : item));
    logAction('UPDATE', 'Problem', sanitized.id, `Updated problem status to ${sanitized.status}`);
  };

  const solveProblem = (id: string, actionOutcome?: string) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const target = problems.find(p => p.id === id);
    if (!target) return;
    const resolvedNote = actionOutcome || target.actionTaken || target.latestAction || `Issue resolved and verified on ${todayStr}`;
    const updated: CommunityProblem = {
      ...target,
      status: 'Completed',
      resolvedDate: target.resolvedDate || todayStr,
      latestAction: resolvedNote,
      actionTaken: resolvedNote
    };
    updateProblem(updated);
    logAction('UPDATE', 'Problem', id, `Marked community problem as Solved / Completed`);
  };

  const deleteProblem = (id: string) => {
    setProblems(prev => prev.filter(item => item.id !== id));
    logAction('DELETE', 'Problem', id, `Removed problem: ${id}`);
  };

  const addDevWork = (dw: DevelopmentWork) => {
    setDevWorks(prev => {
      const exists = prev.some(item => item.id === dw.id);
      return exists ? prev.map(item => item.id === dw.id ? dw : item) : [dw, ...prev];
    });
    logAction('CREATE', 'DevelopmentWork', dw.id, `Added development work: ${dw.title}`);
  };

  const updateDevWork = (dw: DevelopmentWork) => {
    setDevWorks(prev => prev.map(item => item.id === dw.id ? dw : item));
    logAction('UPDATE', 'DevelopmentWork', dw.id, `Updated development work progress (${dw.progressPercentage}%)`);
  };

  const deleteDevWork = (id: string) => {
    setDevWorks(prev => prev.filter(item => item.id !== id));
    logAction('DELETE', 'DevelopmentWork', id, `Removed development work: ${id}`);
  };

  const addKeyPerson = (kp: KeyPerson) => {
    setKeyPeople(prev => {
      const exists = prev.some(item => item.id === kp.id);
      return exists ? prev.map(item => item.id === kp.id ? kp : item) : [...prev, kp];
    });
    logAction('CREATE', 'Person', kp.id, `Added ${kp.category}: ${kp.name}`);
  };

  const updateKeyPerson = (kp: KeyPerson) => {
    setKeyPeople(prev => prev.map(item => item.id === kp.id ? kp : item));
    logAction('UPDATE', 'Person', kp.id, `Updated details of ${kp.name}`);
  };

  const deleteKeyPerson = (id: string) => {
    setKeyPeople(prev => prev.filter(item => item.id !== id));
    logAction('DELETE', 'Person', id, `Removed person: ${id}`);
  };

  const addTemple = (t: Temple) => {
    setTemples(prev => {
      const exists = prev.some(item => item.id === t.id);
      return exists ? prev.map(item => item.id === t.id ? t : item) : [...prev, t];
    });
    logAction('CREATE', 'Temple', t.id, `Added Temple: ${t.name}`);
  };

  const updateTemple = (t: Temple) => {
    setTemples(prev => prev.map(item => item.id === t.id ? t : item));
    logAction('UPDATE', 'Temple', t.id, `Updated temple: ${t.name}`);
  };

  const deleteTemple = (id: string) => {
    setTemples(prev => prev.filter(item => item.id !== id));
    logAction('DELETE', 'Temple', id, `Removed temple: ${id}`);
  };

  const addEvent = (e: CulturalEvent) => {
    setEvents(prev => {
      const exists = prev.some(item => item.id === e.id);
      return exists ? prev.map(item => item.id === e.id ? e : item) : [...prev, e];
    });
    logAction('CREATE', 'Event', e.id, `Added Cultural Event: ${e.name}`);
  };

  const updateEvent = (e: CulturalEvent) => {
    setEvents(prev => prev.map(item => item.id === e.id ? e : item));
    logAction('UPDATE', 'Event', e.id, `Updated event: ${e.name}`);
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(item => item.id !== id));
    logAction('DELETE', 'Event', id, `Removed event: ${id}`);
  };

  const addBirth = (b: BirthRecord) => {
    setBirths(prev => {
      const exists = prev.some(item => item.id === b.id);
      return exists ? prev.map(item => item.id === b.id ? b : item) : [b, ...prev];
    });
    logAction('CREATE', 'BirthRecord', b.id, `Registered birth of ${b.childName}`);
  };

  const updateBirth = (b: BirthRecord) => {
    setBirths(prev => prev.map(item => item.id === b.id ? b : item));
    logAction('UPDATE', 'BirthRecord', b.id, `Updated birth record: ${b.childName}`);
  };

  const deleteBirth = (id: string) => {
    setBirths(prev => prev.filter(item => item.id !== id));
    logAction('DELETE', 'BirthRecord', id, `Removed birth record: ${id}`);
  };

  const addDeath = (d: DeathRecord) => {
    setDeaths(prev => {
      const exists = prev.some(item => item.id === d.id);
      return exists ? prev.map(item => item.id === d.id ? d : item) : [d, ...prev];
    });
    logAction('CREATE', 'DeathRecord', d.id, `Registered death of ${d.deceasedName}`);
  };

  const updateDeath = (d: DeathRecord) => {
    setDeaths(prev => prev.map(item => item.id === d.id ? d : item));
    logAction('UPDATE', 'DeathRecord', d.id, `Updated death record: ${d.deceasedName}`);
  };

  const deleteDeath = (id: string) => {
    setDeaths(prev => prev.filter(item => item.id !== id));
    logAction('DELETE', 'DeathRecord', id, `Removed death record: ${id}`);
  };

  const addReminder = (r: Reminder) => {
    setReminders(prev => {
      const exists = prev.some(item => item.id === r.id);
      return exists ? prev.map(item => item.id === r.id ? r : item) : [r, ...prev];
    });
    logAction('CREATE', 'Reminder', r.id, `Added reminder: ${r.title}`);
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
    logAction('UPDATE', 'Reminder', id, `Toggled reminder completion status`);
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(item => item.id !== id));
    logAction('DELETE', 'Reminder', id, `Removed reminder: ${id}`);
  };

  const resetToSampleData = () => {
    setPanchayat(INITIAL_PANCHAYAT);
    setVillages(INITIAL_VILLAGES);
    setWards(INITIAL_WARDS);
    setFamilies(INITIAL_FAMILIES);
    setMembers(INITIAL_MEMBERS);
    setSchemes(INITIAL_SCHEMES);
    setTickets(INITIAL_TICKETS);
    setAssistance(INITIAL_ASSISTANCE);
    setProblems(INITIAL_PROBLEMS);
    setDevWorks(INITIAL_DEV_WORKS);
    setKeyPeople(INITIAL_KEY_PEOPLE);
    setTemples(INITIAL_TEMPLES);
    setEvents(INITIAL_EVENTS);
    setBirths(INITIAL_BIRTHS);
    setDeaths(INITIAL_DEATHS);
    setReminders(INITIAL_REMINDERS);
    setAuditLogs(INITIAL_AUDIT_LOGS);

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_KEY)) {
        localStorage.removeItem(key);
      }
    });

    logAction('SYSTEM', 'Database', 'SYSTEM', 'Restored all database tables to sample demonstration dataset');
  };

  const exportDatabaseJSON = () => {
    const fullBackup = {
      panchayat,
      villages,
      wards,
      families,
      members,
      schemes,
      tickets,
      assistance,
      problems,
      devWorks,
      keyPeople,
      temples,
      events,
      births,
      deaths,
      reminders,
      auditLogs,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(fullBackup, null, 2);
  };

  const importDatabaseJSON = (json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (data.panchayat) setPanchayat(data.panchayat);
      if (data.villages) setVillages(deduplicateList(data.villages));
      if (data.wards) setWards(deduplicateList(data.wards));
      if (data.families) setFamilies(deduplicateList(data.families));
      if (data.members) setMembers(deduplicateList(data.members));
      if (data.schemes) setSchemes(deduplicateList(data.schemes));
      if (data.tickets) setTickets(deduplicateList(data.tickets));
      if (data.assistance) setAssistance(deduplicateList(data.assistance));
      if (data.problems) setProblems(deduplicateList(data.problems));
      if (data.devWorks) setDevWorks(deduplicateList(data.devWorks));
      if (data.keyPeople) setKeyPeople(deduplicateList(data.keyPeople));
      if (data.temples) setTemples(deduplicateList(data.temples));
      if (data.events) setEvents(deduplicateList(data.events));
      if (data.births) setBirths(deduplicateList(data.births));
      if (data.deaths) setDeaths(deduplicateList(data.deaths));
      if (data.reminders) setReminders(deduplicateList(data.reminders));
      logAction('IMPORT', 'Database', 'SYSTEM', 'Successfully restored database from JSON backup file');
      return true;
    } catch (e) {
      console.error('Import database JSON error:', e);
      return false;
    }
  };

  return (
    <DatabaseContext.Provider
      value={{
        panchayat,
        villages,
        wards,
        families,
        members,
        schemes,
        tickets,
        assistance,
        problems,
        devWorks,
        keyPeople,
        temples,
        events,
        births,
        deaths,
        reminders,
        auditLogs,
        users,

        getVillage,
        getWard,
        getFamily,
        getFamilyMembers,
        getGovtJobInfoForFamily,
        getVillageStats,
        getWardStats,
        getPanchayatStats,

        getVillageKeyPeople,
        getVillageProblems,
        getVillageDevWorks,
        getVillageTemples,
        getVillageEvents,
        getVillageFamilies,

        getWardFamilies,
        getWardKeyPeople,
        getWardProblems,
        getWardDevWorks,
        getWardSchemes,

        getFamilySchemes,
        getFamilyTickets,
        getFamilyAssistance,

        toggleReminderCompleted,
        resetToInitialData,

        generateNextFamilyId,
        generateNextMemberId,
        generateNextProblemId,
        generateNextTicketId,

        searchAll,

        updatePanchayat,
        addVillage,
        updateVillage,
        deleteVillage,
        addWard,
        updateWard,
        deleteWard,
        addUser,
        updateUser,
        deleteUser,
        addFamilyWithMembers,
        updateFamily,
        deleteFamily,
        addMember,
        updateMember,
        updateMemberVoterInfo,
        deleteMember,
        currentRole: 'Admin' as UserRole,
        addScheme,
        updateScheme,
        deleteScheme,
        addTicket,
        updateTicket,
        deleteTicket,
        addAssistance,
        updateAssistance,
        deleteAssistance,
        addProblem,
        updateProblem,
        deleteProblem,
        solveProblem,
        solveTicket,
        addDevWork,
        updateDevWork,
        deleteDevWork,
        addKeyPerson,
        updateKeyPerson,
        deleteKeyPerson,
        addTemple,
        updateTemple,
        deleteTemple,
        addEvent,
        updateEvent,
        deleteEvent,
        addBirth,
        updateBirth,
        deleteBirth,
        addDeath,
        updateDeath,
        deleteDeath,
        addReminder,
        toggleReminder,
        deleteReminder,

        logAction,
        resetToSampleData,
        exportDatabaseJSON,
        importDatabaseJSON,

        // Notifications
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        dismissNotification,
        clearAllNotifications,

        // Advanced Filter
        filterData,

        // Server Sync
        syncWithServer,
        isSyncing
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
