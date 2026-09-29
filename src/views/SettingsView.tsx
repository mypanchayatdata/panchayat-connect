import React, { useState, useRef } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  Shield,
  Download,
  Upload,
  RotateCcw,
  History,
  CheckCircle2,
  AlertTriangle,
  Database,
  Home,
  Building,
  TicketCheck,
  HeartHandshake,
  FileCheck,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Users,
  Eye,
  EyeOff,
  Lock,
  KeyRound,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Phone,
  UserPlus,
  X
} from 'lucide-react';
import { User, Family, Village, Ward, CommunityProblem, FollowUpTicket, PersonalAssistance, SchemeApplication } from '../types';

interface SettingsViewProps {
  onNavigate?: (view: string, targetId?: string) => void;
  onOpenQuickAdd?: (type: string, initialData?: any) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate, onOpenQuickAdd }) => {
  const {
    panchayat,
    villages,
    wards,
    families,
    members,
    problems,
    tickets,
    assistance,
    schemes,
    auditLogs,
    users,
    addUser,
    updateUser,
    deleteUser,
    deleteFamily,
    deleteVillage,
    deleteWard,
    deleteProblem,
    deleteTicket,
    deleteAssistance,
    deleteScheme,
    resetToInitialData,
    exportDatabaseJSON,
    importDatabaseJSON
  } = useDatabase();

  const { 
    currentUser, 
    currentRole, 
    switchRole, 
    switchUser, 
    canDelete, 
    canEdit, 
    isAdmin,
    updateAdminCredentials,
    updateUserPassword,
    getAdminCredentials
  } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Main navigation tab within Admin end
  const [activeAdminTab, setActiveAdminTab] = useState<
    'master-data' | 'rbac' | 'admin-credentials' | 'backup' | 'audit'
  >('master-data');

  // Master Data sub-tab
  const [masterSubTab, setMasterSubTab] = useState<
    'families' | 'villages' | 'problems' | 'tickets' | 'assistance' | 'schemes'
  >('families');

  // Search & Filter states for Admin Master Data
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVillage, setFilterVillage] = useState('all');
  const [filterWard, setFilterWard] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterScope, setFilterScope] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Dedicated Admin Credentials Management Form State
  const initialAdminCreds = getAdminCredentials();
  const [adminUsernameInput, setAdminUsernameInput] = useState(initialAdminCreds.username || 'admin');
  const [adminPasswordInput, setAdminPasswordInput] = useState(initialAdminCreds.password || 'admin123');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState(initialAdminCreds.password || 'admin123');
  const [adminNameInput, setAdminNameInput] = useState(initialAdminCreds.name || currentUser?.name || 'Deepak Rautaray');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [credentialStatus, setCredentialStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);

  // Sync state if admin credentials or user change
  React.useEffect(() => {
    const creds = getAdminCredentials();
    setAdminUsernameInput(creds.username || 'admin');
    setAdminPasswordInput(creds.password || 'admin123');
    setConfirmPasswordInput(creds.password || 'admin123');
    setAdminNameInput(creds.name || currentUser?.name || 'Deepak Rautaray');
  }, [currentUser]);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Empty', color: 'bg-gray-200', text: 'text-gray-400' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
    if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-amber-500', text: 'text-amber-600' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' };
  };

  const handleSaveAdminCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialStatus(null);
    setIsUpdatingCreds(true);

    const cleanUsername = adminUsernameInput.trim().toLowerCase().replace(/\s+/g, '');
    const cleanPassword = adminPasswordInput.trim();

    if (!cleanUsername || cleanUsername.length < 3) {
      setCredentialStatus({ type: 'error', message: 'Admin username must be at least 3 characters long.' });
      setIsUpdatingCreds(false);
      return;
    }

    if (!cleanPassword || cleanPassword.length < 4) {
      setCredentialStatus({ type: 'error', message: 'Admin password must be at least 4 characters long.' });
      setIsUpdatingCreds(false);
      return;
    }

    if (cleanPassword !== confirmPasswordInput.trim()) {
      setCredentialStatus({ type: 'error', message: 'New Password and Confirm Password do not match. Please verify.' });
      setIsUpdatingCreds(false);
      return;
    }

    const res = await updateAdminCredentials(cleanUsername, cleanPassword, adminNameInput.trim());
    setIsUpdatingCreds(false);
    if (res.success) {
      setCredentialStatus({ type: 'success', message: res.message });
      showToast(res.message);
    } else {
      setCredentialStatus({ type: 'error', message: res.message });
    }
  };

  // User Management in Admin Panel
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showUserModalPassword, setShowUserModalPassword] = useState(false);
  const [userFormData, setUserFormData] = useState<Partial<User>>({
    name: '',
    username: '',
    email: '',
    phone: '',
    role: 'Field User',
    designation: 'Ward Mobilizer / Field Worker',
    password: ''
  });

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setShowUserModalPassword(false);
    setUserFormData({
      name: '',
      username: '',
      email: '',
      phone: '',
      role: 'Field User',
      designation: 'Ward Mobilizer / Data Collector',
      password: 'field' + Math.floor(100 + Math.random() * 900)
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (u: User) => {
    setEditingUser(u);
    setShowUserModalPassword(false);
    setUserFormData({
      name: u.name,
      username: u.username,
      email: u.email,
      phone: u.phone,
      role: u.role,
      designation: u.designation,
      password: u.password || (u.role === 'Admin' ? 'admin123' : 'password123')
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name?.trim() || !userFormData.username?.trim()) {
      showToast('Name and username are required.');
      return;
    }
    const cleanUsername = userFormData.username.trim().toLowerCase().replace(/\s+/g, '');
    const userPassword = userFormData.password?.trim() || (editingUser?.password || 'password123');

    if (editingUser) {
      const updated: User = {
        ...editingUser,
        name: userFormData.name.trim(),
        username: cleanUsername,
        email: userFormData.email?.trim() || `${cleanUsername}@panchayat.org`,
        phone: userFormData.phone?.trim() || '+91 94370 00000',
        role: (userFormData.role as any) || 'Field User',
        designation: userFormData.designation?.trim() || 'Field Data Collector',
        password: userPassword
      };
      updateUser(updated);
      showToast(`Updated user details & login credentials for ${updated.name}`);
    } else {
      const newId = `USR-${Date.now().toString().slice(-4)}`;
      const created: User = {
        id: newId,
        name: userFormData.name.trim(),
        username: cleanUsername,
        email: userFormData.email?.trim() || `${cleanUsername}@panchayat.org`,
        phone: userFormData.phone?.trim() || '+91 94370 00000',
        role: (userFormData.role as any) || 'Field User',
        designation: userFormData.designation?.trim() || 'Field Data Collector',
        password: userPassword
      };
      addUser(created);
      showToast(`Added new user ${created.name} (@${created.username})`);
    }
    setIsUserModalOpen(false);
  };

  const handleDeleteUser = (u: User) => {
    if (window.confirm(`Delete user account "${u.name}" (@${u.username})?`)) {
      deleteUser(u.id);
      showToast(`Removed user ${u.name}`);
    }
  };

  const handleExport = () => {
    const jsonStr = exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Panchayat_Connect_Backup_${panchayat.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Database backup exported successfully!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const success = importDatabaseJSON(content);
      if (success) {
        showToast('Database restored successfully from file!');
      } else {
        alert('Failed to import database. Please verify JSON file format.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data back to the default Gram Panchayat seed data? Any unsaved edits will be replaced.')) {
      resetToInitialData();
      showToast('Database reset to initial sample data.');
    }
  };

  // Generic Deletion Handlers with Confirmation
  const handleDeleteFamily = (f: Family) => {
    if (window.confirm(`Are you sure you want to permanently delete Family "${f.familyHeadName}" (${f.id}) and all its member records? This action cannot be undone.`)) {
      deleteFamily(f.id);
      showToast(`Family ${f.id} deleted successfully.`);
    }
  };

  const handleDeleteVillage = (v: Village) => {
    const villageWards = wards.filter(w => w.villageId === v.id);
    const villageFamilies = families.filter(f => f.villageId === v.id);
    if (window.confirm(`Are you sure you want to delete Village "${v.name}" (${v.code})? It contains ${villageWards.length} wards and ${villageFamilies.length} households.`)) {
      deleteVillage(v.id);
      showToast(`Village ${v.name} deleted successfully.`);
    }
  };

  const handleDeleteWard = (w: Ward) => {
    const wardFamilies = families.filter(f => f.wardId === w.id);
    if (window.confirm(`Are you sure you want to delete Ward ${w.wardNumber} (${w.id})? It has ${wardFamilies.length} associated families.`)) {
      deleteWard(w.id);
      showToast(`Ward ${w.wardNumber} deleted successfully.`);
    }
  };

  const handleDeleteProblem = (p: CommunityProblem) => {
    if (window.confirm(`Are you sure you want to delete Community Problem "${p.title}" (${p.id})?`)) {
      deleteProblem(p.id);
      showToast(`Community Problem ${p.id} deleted successfully.`);
    }
  };

  const handleDeleteTicket = (t: FollowUpTicket) => {
    if (window.confirm(`Are you sure you want to delete Field Ticket "${t.title}" (${t.id})?`)) {
      deleteTicket(t.id);
      showToast(`Field Ticket ${t.id} deleted successfully.`);
    }
  };

  const handleDeleteAssistance = (a: PersonalAssistance) => {
    if (window.confirm(`Are you sure you want to delete Assistance record for "${a.beneficiaryName}" (${a.id})?`)) {
      deleteAssistance(a.id);
      showToast(`Assistance record ${a.id} deleted successfully.`);
    }
  };

  const handleDeleteScheme = (s: SchemeApplication) => {
    if (window.confirm(`Are you sure you want to delete Scheme Application for "${s.applicantName}" - ${s.schemeName} (${s.id})?`)) {
      deleteScheme(s.id);
      showToast(`Scheme Application ${s.id} deleted successfully.`);
    }
  };

  // Filtered master data sets
  const q = searchQuery.toLowerCase().trim();

  const filteredFamilies = families.filter(f => {
    const vilMatch = filterVillage === 'all' || f.villageId === filterVillage;
    const wrdMatch = filterWard === 'all' || f.wardId === filterWard;
    const qMatch = !q || f.id.toLowerCase().includes(q) || f.familyHeadName.toLowerCase().includes(q) || f.primaryMobile.includes(q) || f.address.toLowerCase().includes(q);
    return vilMatch && wrdMatch && qMatch;
  });

  const filteredProblems = problems.filter(p => {
    const vilMatch = filterVillage === 'all' || p.villageId === filterVillage;
    const statMatch = filterStatus === 'all' || p.status === filterStatus;
    const qMatch = !q || p.id.toLowerCase().includes(q) || p.title.toLowerCase().includes(q) || p.reportedBy.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    return vilMatch && statMatch && qMatch;
  });

  const filteredTickets = tickets.filter(t => {
    const scopeMatch = filterScope === 'all' || (filterScope === 'family' ? t.ticketScope !== 'COMMUNITY_VILLAGE_WARD' : t.ticketScope === 'COMMUNITY_VILLAGE_WARD');
    const statMatch = filterStatus === 'all' || t.status === filterStatus;
    const qMatch = !q || t.id.toLowerCase().includes(q) || t.title.toLowerCase().includes(q) || t.schemeName?.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    return scopeMatch && statMatch && qMatch;
  });

  const filteredAssistance = assistance.filter(a => {
    const aType = a.assistanceType || a.assistance_type;
    const typeMatch = filterType === 'all' || aType === filterType;
    const statMatch = filterStatus === 'all' || a.status === filterStatus;
    const qMatch = !q || a.id.toLowerCase().includes(q) || a.beneficiaryName?.toLowerCase().includes(q) || a.schemeName?.toLowerCase().includes(q) || a.note?.toLowerCase().includes(q);
    return typeMatch && statMatch && qMatch;
  });

  const filteredSchemes = schemes.filter(s => {
    const statMatch = filterStatus === 'all' || s.status === filterStatus;
    const qMatch = !q || s.id.toLowerCase().includes(q) || s.applicantName.toLowerCase().includes(q) || s.schemeName.toLowerCase().includes(q) || s.familyId.toLowerCase().includes(q);
    return statMatch && qMatch;
  });

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {feedbackMessage && (
        <div className="p-3.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg flex items-center space-x-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">⚙️</span>
            <span className="text-xs uppercase font-extrabold tracking-widest text-blue-400">
              Gram Panchayat Administration Control
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            ADMIN DATA MANAGEMENT & SETTINGS
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Full administrative control over all core entities: Edit, Delete, Create, and Audit Families, Villages, Wards, Problems, Field Tickets, Direct Assistance, and Schemes.
          </p>
        </div>

        {/* Global Action Shortcut */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveAdminTab('admin-credentials')}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95"
            title="Set administrator username and password"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Set Admin Username & Password</span>
          </button>
          <button
            onClick={() => onOpenQuickAdd?.('family')}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Family</span>
          </button>
          <button
            onClick={() => onOpenQuickAdd?.('village')}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Village</span>
          </button>
        </div>
      </div>

      {/* Main Admin Navigation Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap gap-1.5 text-xs font-bold">
        <button
          onClick={() => setActiveAdminTab('master-data')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeAdminTab === 'master-data'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Master Data CRUD Manager</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('admin-credentials')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeAdminTab === 'admin-credentials'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Admin Username & Password</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('rbac')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeAdminTab === 'rbac'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Role Permissions (RBAC)</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('backup')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeAdminTab === 'backup'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Backup & Disaster Recovery</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('audit')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeAdminTab === 'audit'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>System Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: MASTER DATA CRUD MANAGER */}
      {activeAdminTab === 'master-data' && (
        <div className="space-y-5">
          {/* Master Entity Sub-tabs */}
          <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => { setMasterSubTab('families'); setSearchQuery(''); }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  masterSubTab === 'families'
                    ? 'bg-slate-900 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Families & Citizens ({families.length})</span>
              </button>

              <button
                onClick={() => { setMasterSubTab('villages'); setSearchQuery(''); }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  masterSubTab === 'villages'
                    ? 'bg-slate-900 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Villages & Wards ({villages.length}V / {wards.length}W)</span>
              </button>

              <button
                onClick={() => { setMasterSubTab('problems'); setSearchQuery(''); }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  masterSubTab === 'problems'
                    ? 'bg-slate-900 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Community Problems ({problems.length})</span>
              </button>

              <button
                onClick={() => { setMasterSubTab('tickets'); setSearchQuery(''); }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  masterSubTab === 'tickets'
                    ? 'bg-slate-900 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <TicketCheck className="w-3.5 h-3.5 text-purple-500" />
                <span>Field Tickets ({tickets.length})</span>
              </button>

              <button
                onClick={() => { setMasterSubTab('assistance'); setSearchQuery(''); }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  masterSubTab === 'assistance'
                    ? 'bg-slate-900 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5 text-emerald-500" />
                <span>Direct Assistance ({assistance.length})</span>
              </button>

              <button
                onClick={() => { setMasterSubTab('schemes'); setSearchQuery(''); }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  masterSubTab === 'schemes'
                    ? 'bg-slate-900 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Govt Schemes ({schemes.length})</span>
              </button>
            </div>

            {/* Quick Add for active entity */}
            <div>
              {masterSubTab === 'families' && (
                <button
                  onClick={() => onOpenQuickAdd?.('family')}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ New Household</span>
                </button>
              )}
              {masterSubTab === 'villages' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => onOpenQuickAdd?.('village')}
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Add Village</span>
                  </button>
                  <button
                    onClick={() => onOpenQuickAdd?.('ward')}
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Add Ward</span>
                  </button>
                </div>
              )}
              {masterSubTab === 'problems' && (
                <button
                  onClick={() => onOpenQuickAdd?.('problem')}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Report Problem</span>
                </button>
              )}
              {masterSubTab === 'tickets' && (
                <button
                  onClick={() => onOpenQuickAdd?.('ticket')}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Create Field Ticket</span>
                </button>
              )}
              {masterSubTab === 'assistance' && (
                <button
                  onClick={() => onOpenQuickAdd?.('assistance')}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Record Assistance</span>
                </button>
              )}
              {masterSubTab === 'schemes' && (
                <button
                  onClick={() => onOpenQuickAdd?.('scheme')}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Enroll Scheme</span>
                </button>
              )}
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
            <div className="relative col-span-1 sm:col-span-2">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={`Search ${masterSubTab}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {masterSubTab === 'families' && (
              <>
                <select
                  value={filterVillage}
                  onChange={e => setFilterVillage(e.target.value)}
                  className="px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800"
                >
                  <option value="all">All Villages</option>
                  {villages.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>

                <select
                  value={filterWard}
                  onChange={e => setFilterWard(e.target.value)}
                  className="px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800"
                >
                  <option value="all">All Wards</option>
                  {wards.map((w, idx) => (
                    <option key={`set-ward-${w.id}-${idx}`} value={w.id}>Ward {w.wardNumber}</option>
                  ))}
                </select>
              </>
            )}

            {masterSubTab === 'problems' && (
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800"
              >
                <option value="all">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            )}

            {masterSubTab === 'tickets' && (
              <>
                <select
                  value={filterScope}
                  onChange={e => setFilterScope(e.target.value)}
                  className="px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800"
                >
                  <option value="all">All Scopes</option>
                  <option value="family">🤝 Family Help Tickets</option>
                  <option value="community">🏘️ Community Tickets</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800"
                >
                  <option value="all">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </>
            )}

            {masterSubTab === 'assistance' && (
              <>
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800"
                >
                  <option value="all">All Assistance Types</option>
                  <option value="SCHEME_ASSISTANCE">🏛️ Scheme Assistance</option>
                  <option value="PERSONAL_ASSISTANCE">🤝 Personal Assistance</option>
                  <option value="OTHER">📦 Other</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800"
                >
                  <option value="all">All Statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="APPLIED">APPLIED</option>
                  <option value="DONE">DONE</option>
                </select>
              </>
            )}
          </div>

          {/* SUB-TAB 1: FAMILIES & CITIZENS TABLE */}
          {masterSubTab === 'families' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">
                    Master Families & Households Database ({filteredFamilies.length} / {families.length})
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Direct administrative CRUD controls. Click Edit to open household spreadsheet or Delete to purge.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-gray-700 uppercase text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="p-3">Family ID</th>
                      <th className="p-3">Head of Family</th>
                      <th className="p-3">Village / Ward</th>
                      <th className="p-3">Contact Mobile</th>
                      <th className="p-3">Economic Class</th>
                      <th className="p-3">Members (Voters)</th>
                      <th className="p-3">Ration Card</th>
                      <th className="p-3 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans text-xs">
                    {filteredFamilies.map(f => {
                      const v = villages.find(vil => vil.id === f.villageId);
                      const w = wards.find(wrd => wrd.id === f.wardId);
                      const fMembers = members.filter(m => m.familyId === f.id);
                      const voterCount = fMembers.filter(m => m.isVoter).length;

                      return (
                        <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-mono font-bold text-blue-700">{f.id}</td>
                          <td className="p-3">
                            <strong className="text-gray-900 block">{f.familyHeadName}</strong>
                            <span className="text-[10px] text-gray-400">{f.address}</span>
                          </td>
                          <td className="p-3 text-gray-700">
                            {v?.name || f.villageId} • Ward {w?.wardNumber || '1'}
                          </td>
                          <td className="p-3 font-mono text-gray-700">
                            {f.primaryMobile ? (
                              <a href={`tel:${f.primaryMobile}`} className="hover:underline flex items-center">
                                <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                {f.primaryMobile}
                              </a>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              f.economicStatus === 1 ? 'bg-blue-100 text-blue-800' :
                              f.economicStatus === 2 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              Class {f.economicStatus}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-gray-900">{fMembers.length}</span> members
                            <span className="text-gray-400 text-[10px] ml-1">({voterCount} Voters)</span>
                          </td>
                          <td className="p-3 text-gray-600 text-[11px]">
                            {f.rationCardType?.split(' ')[0] || 'PHH'} {f.rationCardNumber ? `(${f.rationCardNumber})` : ''}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => onNavigate?.('families', f.id)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                                title="View Dossier"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onOpenQuickAdd?.('family', f)}
                                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg cursor-pointer"
                                title="Edit Household & Members"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteFamily(f)}
                                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg cursor-pointer"
                                title="Delete Household"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-TAB 2: VILLAGES & WARDS MASTER */}
          {masterSubTab === 'villages' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Villages Master */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900">
                      Villages Master ({villages.length})
                    </h3>
                    <p className="text-[11px] text-gray-500">Gram Panchayat territorial villages</p>
                  </div>
                  <button
                    onClick={() => onOpenQuickAdd?.('village')}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Add</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-gray-700 uppercase text-[10px] tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="p-3">Code</th>
                        <th className="p-3">Village Name</th>
                        <th className="p-3">Wards</th>
                        <th className="p-3">Households</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-sans text-xs">
                      {villages.map(v => {
                        const vWards = wards.filter(w => w.villageId === v.id);
                        const vFamilies = families.filter(f => f.villageId === v.id);

                        return (
                          <tr key={v.id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-blue-700">{v.code || v.id}</td>
                            <td className="p-3 font-bold text-gray-900">{v.name}</td>
                            <td className="p-3 text-gray-700">{vWards.length} Wards</td>
                            <td className="p-3 text-gray-700">{vFamilies.length} Families</td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => onNavigate?.('villages', v.id)}
                                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                                  title="View Village Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onOpenQuickAdd?.('village', v)}
                                  className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg cursor-pointer"
                                  title="Edit Village"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteVillage(v)}
                                  className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg cursor-pointer"
                                  title="Delete Village"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Wards Master */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900">
                      Wards Master ({wards.length})
                    </h3>
                    <p className="text-[11px] text-gray-500">Ward numbers and representatives</p>
                  </div>
                  <button
                    onClick={() => onOpenQuickAdd?.('ward')}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Add</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-gray-700 uppercase text-[10px] tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="p-3">Ward ID</th>
                        <th className="p-3">Village</th>
                        <th className="p-3">Ward #</th>
                        <th className="p-3">Representative</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-sans text-xs">
                      {wards.map((w, idx) => {
                        const v = villages.find(vil => vil.id === w.villageId);
                        return (
                          <tr key={`set-ward-tr-${w.id}-${idx}`} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-blue-700">{w.id}</td>
                            <td className="p-3 text-gray-800 font-medium">{v?.name || w.villageId}</td>
                            <td className="p-3 font-bold text-gray-900">Ward {w.wardNumber}</td>
                            <td className="p-3 text-gray-600 text-[11px]">{w.wardMemberName || '—'}</td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => onNavigate?.('wards', w.id)}
                                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                                  title="View Ward View"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onOpenQuickAdd?.('ward', w)}
                                  className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg cursor-pointer"
                                  title="Edit Ward"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteWard(w)}
                                  className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg cursor-pointer"
                                  title="Delete Ward"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: COMMUNITY PROBLEMS MASTER */}
          {masterSubTab === 'problems' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">
                    Community Problems & Public Infrastructure Grievances ({filteredProblems.length} / {problems.length})
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Direct administrative editing and deletion for grassroots community issues.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-gray-700 uppercase text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="p-3">Problem ID</th>
                      <th className="p-3">Title & Category</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Reported By</th>
                      <th className="p-3 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans text-xs">
                    {filteredProblems.map(p => {
                      const v = villages.find(vil => vil.id === p.villageId);
                      const w = wards.find(wrd => wrd.id === p.wardId);

                      return (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-amber-700">{p.id}</td>
                          <td className="p-3">
                            <strong className="text-gray-900 block">{p.title}</strong>
                            <span className="text-[10px] text-gray-500">{p.category}</span>
                          </td>
                          <td className="p-3 text-gray-700">
                            {v?.name} • Ward {w?.wardNumber}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.priority === 'High' ? 'bg-rose-100 text-rose-800' :
                              p.priority === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {p.priority}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="p-3 text-gray-600 text-[11px]">
                            {p.reportedBy} ({p.reportedDate})
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => onNavigate?.('community-problems', p.id)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                                title="View in Problems Dashboard"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onOpenQuickAdd?.('problem', p)}
                                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg cursor-pointer"
                                title="Edit Community Problem"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProblem(p)}
                                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg cursor-pointer"
                                title="Delete Community Problem"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-TAB 4: FIELD TICKETS MASTER */}
          {masterSubTab === 'tickets' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">
                    Follow-Up Field Action Tickets ({filteredTickets.length} / {tickets.length})
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Citizen help and community infrastructure follow-up action tickets.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-gray-700 uppercase text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="p-3">Ticket ID</th>
                      <th className="p-3">Scope / Type</th>
                      <th className="p-3">Title & Category</th>
                      <th className="p-3">Family / Location</th>
                      <th className="p-3">Target Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans text-xs">
                    {filteredTickets.map(t => {
                      const isComm = t.ticketScope === 'COMMUNITY_VILLAGE_WARD';
                      const fam = t.familyId ? families.find(f => f.id === t.familyId) : null;

                      return (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-purple-700">{t.id}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              isComm ? 'bg-slate-100 text-slate-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {isComm ? '🏘️ Community' : '🤝 Family Help'}
                            </span>
                          </td>
                          <td className="p-3">
                            <strong className="text-gray-900 block">{t.title}</strong>
                            <span className="text-[10px] text-blue-600 font-semibold">{t.schemeName || t.category}</span>
                          </td>
                          <td className="p-3 text-gray-700">
                            {fam ? (
                              <button
                                onClick={() => onNavigate?.('families', fam.id)}
                                className="text-blue-600 hover:underline font-semibold"
                              >
                                {fam.familyHeadName} ({fam.id})
                              </button>
                            ) : (
                              <span className="text-gray-500">Ward Problem ({t.wardId || 'GP'})</span>
                            )}
                          </td>
                          <td className="p-3 font-mono text-gray-700">{t.targetDate}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              t.status === 'Resolved' || t.status === 'Closed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : t.status === 'In Progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => onNavigate?.('tickets', t.id)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                                title="View in Tickets Dashboard"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onOpenQuickAdd?.('ticket', t)}
                                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg cursor-pointer"
                                title="Edit Field Ticket"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTicket(t)}
                                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg cursor-pointer"
                                title="Delete Field Ticket"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-TAB 5: DIRECT ASSISTANCE MASTER */}
          {masterSubTab === 'assistance' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">
                    My Direct Assistance Logs ({filteredAssistance.length} / {assistance.length})
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Scheme facilitation, personal assistance, and grassroots social services records.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-gray-700 uppercase text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="p-3">Assistance ID</th>
                      <th className="p-3">Beneficiary</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Scheme / Note</th>
                      <th className="p-3">Family ID</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans text-xs">
                    {filteredAssistance.map(a => {
                      const aType = a.assistanceType || a.assistance_type;
                      const aStatus = a.status;

                      return (
                        <tr key={a.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-emerald-700">{a.id}</td>
                          <td className="p-3 font-bold text-gray-900">{a.beneficiaryName}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              aType === 'SCHEME_ASSISTANCE' ? 'bg-blue-100 text-blue-800' :
                              aType === 'PERSONAL_ASSISTANCE' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                            }`}>
                              {aType === 'SCHEME_ASSISTANCE' ? '🏛️ Scheme' : aType === 'PERSONAL_ASSISTANCE' ? '🤝 Personal' : '📦 Other'}
                            </span>
                          </td>
                          <td className="p-3 max-w-xs truncate text-gray-700">
                            {a.schemeName || a.note || a.description}
                          </td>
                          <td className="p-3 font-mono text-gray-600">
                            {a.familyId ? (
                              <button
                                onClick={() => onNavigate?.('families', a.familyId)}
                                className="text-blue-600 hover:underline font-mono"
                              >
                                {a.familyId}
                              </button>
                            ) : '—'}
                          </td>
                          <td className="p-3 font-mono text-gray-600">{a.date}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              aStatus === 'DONE' ? 'bg-emerald-100 text-emerald-800' :
                              aStatus === 'APPLIED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {aStatus}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => onOpenQuickAdd?.('assistance', a)}
                                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg cursor-pointer"
                                title="Edit Direct Assistance"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteAssistance(a)}
                                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg cursor-pointer"
                                title="Delete Direct Assistance"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-TAB 6: GOVT SCHEMES MASTER */}
          {masterSubTab === 'schemes' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">
                    Government Welfare Scheme Enrollments ({filteredSchemes.length} / {schemes.length})
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    PMAY, PM-KISAN, Pensions, and Welfare Scheme tracking.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-gray-700 uppercase text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="p-3">App ID</th>
                      <th className="p-3">Applicant Name</th>
                      <th className="p-3">Scheme Name</th>
                      <th className="p-3">Family ID</th>
                      <th className="p-3">Applied Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans text-xs">
                    {filteredSchemes.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-indigo-700">{s.id}</td>
                        <td className="p-3 font-bold text-gray-900">{s.applicantName}</td>
                        <td className="p-3 text-blue-900 font-semibold">{s.schemeName}</td>
                        <td className="p-3 font-mono text-gray-600">
                          <button
                            onClick={() => onNavigate?.('families', s.familyId)}
                            className="text-blue-600 hover:underline font-mono"
                          >
                            {s.familyId}
                          </button>
                        </td>
                        <td className="p-3 font-mono text-gray-600">{s.appliedDate}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === 'Sanctioned / Active' ? 'bg-emerald-100 text-emerald-800' :
                            s.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => onOpenQuickAdd?.('scheme', s)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg cursor-pointer"
                              title="Edit Scheme Application"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteScheme(s)}
                              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete Scheme Application"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RBAC */}
      {activeAdminTab === 'rbac' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>Admin Panel & User Access Management</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Configure system operators, field data collectors, and administrative privileges.
            </p>
          </div>

          {/* Active Session & Quick Role Simulator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-gray-200 text-xs space-y-2">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">Active Session</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  {currentUser?.role || 'Admin'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Logged in as:</span>
                <strong className="text-gray-900">{currentUser?.name || 'Administrator'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Username:</span>
                <span className="font-mono text-gray-700">@{currentUser?.username || 'admin'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Designation:</span>
                <span className="text-gray-700">{currentUser?.designation || 'Panchayat Coordinator'}</span>
              </div>
            </div>

            {/* Role Simulation Switcher */}
            <div className="p-4 bg-white rounded-xl border border-gray-200 text-xs space-y-2">
              <label className="text-xs font-bold text-gray-800 block">
                Quick Role Simulator (Test Permissions in Realtime):
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(['Admin', 'Field User', 'Super Admin', 'Viewer'] as const).map(role => (
                  <button
                    key={role}
                    onClick={() => {
                      switchRole(role);
                      showToast(`Switched active security role to ${role}`);
                    }}
                    className={`p-2.5 rounded-xl font-bold border transition-all cursor-pointer text-left ${
                      currentUser?.role === role
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{role === 'Field User' ? 'User (Data Entry)' : role}</span>
                      {currentUser?.role === role && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Access Policy Banner */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs flex items-start space-x-3 text-blue-950">
            <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">System Permission Policy Enforced:</p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-900 text-[11px]">
                <li><strong>Admin Panel & Administrators:</strong> Full authorization to <strong>Edit</strong> and <strong>Delete</strong> any Village, Ward, Household, Member, Scheme, Ticket, or Problem.</li>
                <li><strong>Users / Field Staff:</strong> Authorized to <strong>Fill & Submit</strong> new data across all modules. Record Editing and Deletion are strictly disabled.</li>
                <li><strong>Deletion Control:</strong> Record deletion is permitted <strong>only within the Admin Panel</strong> by authorized administrators.</li>
              </ul>
            </div>
          </div>

          {/* Staff & User Management Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Panchayat Staff & Field Data Collectors ({users.length})</span>
                </h3>
                <p className="text-[11px] text-gray-500">
                  Add staff to fill Panchayat field data. Deletion is restricted to Admin.
                </p>
              </div>

              {canEdit && (
                <button
                  onClick={handleOpenAddUser}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Add User / Field Worker</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-gray-700 uppercase text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3">User & Username</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Designation</th>
                    <th className="p-3">Assigned Role</th>
                    <th className="p-3">Permissions Scope</th>
                    <th className="p-3">Login Password</th>
                    <th className="p-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans text-xs">
                  {users.map(u => {
                    const isUserAdmin = u.role === 'Admin' || u.role === 'Super Admin';
                    const isCurrent = currentUser?.id === u.id;
                    const pwd = u.password || (u.role === 'Admin' ? 'admin123' : u.role === 'Super Admin' ? 'super123' : 'field123');

                    return (
                      <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${isCurrent ? 'bg-blue-50/40' : ''}`}>
                        <td className="p-3">
                          <div className="flex items-center space-x-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              isUserAdmin ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                            }`}>
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <strong className="text-gray-900 block flex items-center space-x-1">
                                <span>{u.name}</span>
                                {isCurrent && (
                                  <span className="text-[9px] bg-blue-600 text-white font-bold px-1.5 py-0.2 rounded">
                                    Current
                                  </span>
                                )}
                              </strong>
                              <span className="font-mono text-gray-500 text-[11px]">@{u.username}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-gray-700">
                          <div>{u.email}</div>
                          <div className="text-gray-400 text-[11px] font-mono">{u.phone}</div>
                        </td>
                        <td className="p-3 text-gray-800 font-medium">
                          {u.designation || 'Field Worker'}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'Super Admin' ? 'bg-purple-100 text-purple-900' :
                            u.role === 'Admin' ? 'bg-indigo-100 text-indigo-900' :
                            u.role === 'Viewer' ? 'bg-gray-100 text-gray-700' :
                            'bg-emerald-100 text-emerald-900'
                          }`}>
                            {u.role === 'Field User' ? 'User (Data Entry)' : u.role}
                          </span>
                        </td>
                        <td className="p-3">
                          {isUserAdmin ? (
                            <span className="text-[11px] text-indigo-800 font-semibold flex items-center space-x-1">
                              <span>Full Access (Add, Edit, Delete)</span>
                            </span>
                          ) : u.role === 'Viewer' ? (
                            <span className="text-[11px] text-gray-500">Read-Only</span>
                          ) : (
                            <span className="text-[11px] text-emerald-800 font-semibold flex items-center space-x-1">
                              <span>Data Entry Only (Fill Records)</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-gray-800 border border-gray-200 font-semibold">
                              {pwd}
                            </span>
                            <button
                              onClick={() => handleCopy(pwd, u.id)}
                              className="p-1 hover:bg-slate-200 rounded text-gray-500 transition-colors cursor-pointer"
                              title="Copy password"
                            >
                              {copiedField === u.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => {
                                switchUser(u);
                                showToast(`Switched active user to ${u.name} (${u.role})`);
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-bold cursor-pointer transition-colors"
                              title="Switch active session to this user to test permissions"
                            >
                              Login / Test
                            </button>
                            {canEdit && (
                              <button
                                onClick={() => handleOpenEditUser(u)}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded cursor-pointer"
                                title="Edit User Details"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded cursor-pointer"
                                title="Delete User Account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ADMIN USERNAME & PASSWORD CREDENTIALS */}
      {activeAdminTab === 'admin-credentials' && (
        <div className="space-y-6 max-w-4xl">
          {/* Main Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div>
                <h2 className="text-lg font-black text-gray-900 flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <span>Set Admin Username & Password</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1 max-w-xl">
                  Configure the primary Administrator account credentials. This account holds full authorization to edit and delete records, manage system policies, and oversee field workers.
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <Shield className="w-3.5 h-3.5 mr-1 text-amber-700" />
                  Master Administrator
                </span>
              </div>
            </div>

            {/* Current Active Credentials Overview */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Current Admin Username
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-mono font-extrabold text-blue-900">
                    @{initialAdminCreds.username}
                  </span>
                  <button
                    onClick={() => handleCopy(initialAdminCreds.username, 'curr_user')}
                    className="p-1 hover:bg-slate-200 rounded text-gray-500 transition-colors cursor-pointer"
                    title="Copy username"
                  >
                    {copiedField === 'curr_user' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Current Admin Password
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-mono font-extrabold text-gray-900">
                    {initialAdminCreds.password ? '••••••••' : 'admin123'}
                  </span>
                  <button
                    onClick={() => handleCopy(initialAdminCreds.password || 'admin123', 'curr_pass')}
                    className="p-1 hover:bg-slate-200 rounded text-gray-500 transition-colors cursor-pointer"
                    title="Copy password"
                  >
                    {copiedField === 'curr_pass' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                  Security Status
                </span>
                <div className="flex items-center space-x-1.5 mt-1 text-xs font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Password Protection Active</span>
                </div>
              </div>
            </div>

            {/* Credential Status Alert */}
            {credentialStatus && (
              <div
                className={`mt-5 p-3.5 rounded-xl border text-xs font-medium flex items-center space-x-2.5 ${
                  credentialStatus.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {credentialStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{credentialStatus.message}</span>
              </div>
            )}

            {/* Edit Credentials Form */}
            <form onSubmit={handleSaveAdminCredentials} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Admin Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={adminNameInput}
                    onChange={e => setAdminNameInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="e.g. Deepak Rautaray"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Display name for the administrator in audit logs and headers.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Admin Username (Login ID) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-gray-400 font-mono font-bold text-sm">
                      @
                    </span>
                    <input
                      type="text"
                      required
                      value={adminUsernameInput}
                      onChange={e => setAdminUsernameInput(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      className="w-full pl-8 pr-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-mono font-bold text-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="admin"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Must be at least 3 letters/numbers without spaces. Used for login.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      New Admin Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(prev => !prev)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      {showAdminPassword ? (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Show</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      value={adminPasswordInput}
                      onChange={e => setAdminPasswordInput(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-mono text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Enter new password"
                    />
                  </div>

                  {/* Password strength indicator */}
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden flex space-x-0.5">
                      <div
                        className={`h-full rounded-full transition-all ${
                          getPasswordStrength(adminPasswordInput).color
                        }`}
                        style={{
                          width: `${(getPasswordStrength(adminPasswordInput).score / 3) * 100}%`
                        }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-bold ${
                        getPasswordStrength(adminPasswordInput).text
                      }`}
                    >
                      Strength: {getPasswordStrength(adminPasswordInput).label}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Minimum 4 characters. Recommended: 8+ characters with mixed case & numbers.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Confirm New Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Show</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPasswordInput}
                      onChange={e => setConfirmPasswordInput(e.target.value)}
                      className={`w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border rounded-xl text-sm font-mono text-gray-900 focus:bg-white focus:ring-2 focus:border-transparent outline-none transition-all ${
                        confirmPasswordInput && confirmPasswordInput !== adminPasswordInput
                          ? 'border-rose-400 focus:ring-rose-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Re-enter new password"
                    />
                  </div>
                  <div className="mt-2 text-[10px] font-semibold">
                    {confirmPasswordInput && confirmPasswordInput === adminPasswordInput ? (
                      <span className="text-emerald-600 flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Passwords match</span>
                      </span>
                    ) : confirmPasswordInput ? (
                      <span className="text-rose-600 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Passwords do not match</span>
                      </span>
                    ) : (
                      <span className="text-gray-400">Re-enter the password to confirm</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAdminUsernameInput('admin');
                    setAdminPasswordInput('admin123');
                    setConfirmPasswordInput('admin123');
                    showToast('Values reset in form. Click Save below to apply.');
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Reset Form to Default (admin / admin123)
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="submit"
                    disabled={isUpdatingCreds}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isUpdatingCreds ? 'Saving Credentials...' : 'Save Admin Username & Password'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Quick Guidance Box */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-xs text-amber-950">
            <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-amber-900 font-extrabold">Administrator Access & Security Notice</strong>
              <p className="text-amber-900 text-[11px] leading-relaxed">
                Changes made to the Administrator username and password take effect immediately. These credentials allow full access to edit and delete all village records, households, schemes, and field tickets. You can sign in using these updated credentials at any time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BACKUP & RESTORE */}
      {activeAdminTab === 'backup' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6 max-w-3xl">
          <div>
            <h2 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
              <Download className="w-5 h-5 text-blue-600" />
              <span>Database Backup, Restoration & Reset</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Export an uncorrupted JSON snapshot of all Panchayat records or restore from a previously exported backup file.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
              <span className="font-bold text-blue-900 block text-xs">Export Backup</span>
              <p className="text-[11px] text-blue-700">Save full encrypted JSON database copy to local disk.</p>
              <button
                onClick={handleExport}
                className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
              <span className="font-bold text-gray-900 block text-xs">Restore Backup</span>
              <p className="text-[11px] text-gray-600">Load and restore data from a previously exported JSON backup.</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload JSON</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
            </div>

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
              <span className="font-bold text-rose-900 block text-xs">Factory Reset</span>
              <p className="text-[11px] text-rose-700">Restore all records to the original Gram Panchayat seed data.</p>
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Seed</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeAdminTab === 'audit' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
              <History className="w-5 h-5 text-purple-600" />
              <span>System Audit Log & Activity Trail ({auditLogs.length})</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Timestamped record of all administrative operations (CREATE, UPDATE, DELETE) for data accountability.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-gray-700 uppercase text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Entity Type & ID</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                {auditLogs.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="p-3 text-gray-500">{new Date(l.timestamp).toLocaleString()}</td>
                    <td className="p-3 font-bold text-gray-900 font-sans">{l.user}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        l.action === 'CREATE' ? 'bg-emerald-100 text-emerald-800' :
                        l.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                        l.action === 'DELETE' ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {l.action}
                      </span>
                    </td>
                    <td className="p-3 text-purple-800 font-semibold">{l.entityType} ({l.entityId})</td>
                    <td className="p-3 text-gray-700 font-sans">{l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm">
                  {editingUser ? `Edit Staff User: ${editingUser.name}` : 'Add User to Fill Data'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px]">
                <strong>Staff Permission Guide:</strong> Users assigned with <em>"User (Data Entry)"</em> will be able to add and submit new data entries across all Panchayat registers. Deletion is restricted to Admin panel.
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Satyabrata Barik"
                  value={userFormData.name || ''}
                  onChange={e => setUserFormData({ ...userFormData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Username (Login ID) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. satya_field"
                    value={userFormData.username || ''}
                    onChange={e => setUserFormData({ ...userFormData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Assigned Role *</label>
                  <select
                    value={userFormData.role || 'Field User'}
                    onChange={e => setUserFormData({ ...userFormData, role: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-2 font-semibold text-gray-900 bg-white"
                  >
                    <option value="Field User">User (Data Entry - Fill Only)</option>
                    <option value="Admin">Admin (Full Edit & Delete)</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Viewer">Viewer (Read-Only)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="satya@panchayat.org"
                    value={userFormData.email || ''}
                    onChange={e => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    placeholder="+91 94370 00000"
                    value={userFormData.phone || ''}
                    onChange={e => setUserFormData({ ...userFormData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Designation / Role Title</label>
                <input
                  type="text"
                  placeholder="e.g. Ward Mobilizer, Field Officer, ASHA Lead"
                  value={userFormData.designation || ''}
                  onChange={e => setUserFormData({ ...userFormData, designation: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-gray-700 font-bold">Account Login Password *</label>
                  <button
                    type="button"
                    onClick={() => {
                      const gen = 'panchayat' + Math.floor(100 + Math.random() * 900);
                      setUserFormData(prev => ({ ...prev, password: gen }));
                    }}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                  >
                    🎲 Generate Password
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showUserModalPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter account password (min 4 characters)"
                    value={userFormData.password || ''}
                    onChange={e => setUserFormData({ ...userFormData, password: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2 text-gray-900 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUserModalPassword(prev => !prev)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showUserModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Staff account will use username (@{userFormData.username || 'username'}) and this password to sign in.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  {editingUser ? 'Save User Changes' : 'Create User Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
