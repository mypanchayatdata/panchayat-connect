import React, { useState, useEffect } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Family, FamilyMember, EconomicStatusCode } from '../../types';
import { X, Plus, Trash2, CheckCircle2, User, Building, Home, ShieldCheck, AlertCircle } from 'lucide-react';

interface FamilyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingFamily?: Family;
}

interface EditableMemberRow extends Partial<FamilyMember> {
  tempId: string;
}

export const FamilyFormModal: React.FC<FamilyFormModalProps> = ({ isOpen, onClose, existingFamily }) => {
  const {
    panchayat,
    villages,
    wards,
    addFamilyWithMembers,
    updateFamily,
    getFamilyMembers,
    addMember,
    updateMember,
    deleteMember,
    generateNextFamilyId,
    generateNextMemberId
  } = useDatabase();

  const [villageId, setVillageId] = useState('');
  const [wardId, setWardId] = useState('');
  const [familyId, setFamilyId] = useState('');
  const [familyHeadName, setFamilyHeadName] = useState('');
  const [contactPersonName, setContactPersonName] = useState('');
  const [primaryMobile, setPrimaryMobile] = useState('');
  const [alternativeMobile, setAlternativeMobile] = useState('');
  const [address, setAddress] = useState('');
  const [economicStatus, setEconomicStatus] = useState<EconomicStatusCode>(2);
  const [rationCardNumber, setRationCardNumber] = useState('');
  const [rationCardType, setRationCardType] = useState<Family['rationCardType']>('PHH (Priority)');
  const [houseType, setHouseType] = useState<Family['houseType']>('Pucca');
  const [sanitationFacility, setSanitationFacility] = useState(true);
  const [drinkingWaterSource, setDrinkingWaterSource] = useState<Family['drinkingWaterSource']>('Piped Water');
  const [electricityConnection, setElectricityConnection] = useState(true);
  const [notes, setNotes] = useState('');

  // Spreadsheet-style members
  const [membersRows, setMembersRows] = useState<EditableMemberRow[]>([]);
  const [deletedMemberIds, setDeletedMemberIds] = useState<string[]>([]);

  // Initialize or reset form
  useEffect(() => {
    if (!isOpen) return;

    if (existingFamily) {
      setVillageId(existingFamily.villageId || '');
      setWardId(existingFamily.wardId || '');
      setFamilyId(existingFamily.id || '');
      setFamilyHeadName(existingFamily.familyHeadName || '');
      setContactPersonName(existingFamily.contactPersonName || existingFamily.familyHeadName || '');
      setPrimaryMobile(existingFamily.primaryMobile || '');
      setAlternativeMobile(existingFamily.alternativeMobile || '');
      setAddress(existingFamily.address || '');
      setEconomicStatus(existingFamily.economicStatus ?? 2);
      setRationCardNumber(existingFamily.rationCardNumber || '');
      setRationCardType(existingFamily.rationCardType || 'PHH (Priority)');
      setHouseType(existingFamily.houseType || 'Pucca');
      setSanitationFacility(existingFamily.sanitationFacility ?? true);
      setDrinkingWaterSource(existingFamily.drinkingWaterSource || 'Piped Water');
      setElectricityConnection(existingFamily.electricityConnection ?? true);
      setNotes(existingFamily.notes || '');

      const currentMembers = getFamilyMembers(existingFamily.id);
      setMembersRows(
        currentMembers.map(m => ({
          ...m,
          name: m.name || '',
          fatherHusbandName: m.fatherHusbandName || '',
          relation: m.relation || 'Other',
          age: m.age ?? 25,
          dob: m.dob || '',
          gender: m.gender || 'Male',
          isVoter: m.isVoter ?? true,
          occupation: m.occupation || '',
          hasGovernmentJob: m.hasGovernmentJob ?? false,
          governmentDepartment: m.governmentDepartment || '',
          mobile: m.mobile || '',
          education: m.education || '',
          maritalStatus: m.maritalStatus || 'Married',
          status: m.status || 'Active',
          notes: m.notes || '',
          tempId: m.id
        }))
      );
      setDeletedMemberIds([]);
    } else {
      // Default selections for new family
      const defaultVillage = villages[0]?.id || 'NGV001';
      const availableWards = wards.filter(w => w.villageId === defaultVillage);
      const defaultWard = availableWards[0]?.id || 'NGV001-W01';

      setVillageId(defaultVillage);
      setWardId(defaultWard);
      const autoId = generateNextFamilyId(defaultWard);
      setFamilyId(autoId);

      setFamilyHeadName('');
      setContactPersonName('');
      setPrimaryMobile('');
      setAlternativeMobile('');
      setAddress('');
      setEconomicStatus(2);
      setRationCardNumber('');
      setRationCardType('PHH (Priority)');
      setHouseType('Pucca');
      setSanitationFacility(true);
      setDrinkingWaterSource('Piped Water');
      setElectricityConnection(true);
      setNotes('');

      // Pre-create 1 blank row for Head of family
      setMembersRows([
        {
          tempId: 'new-1',
          name: '',
          fatherHusbandName: '',
          relation: 'Head',
          age: 45,
          dob: '',
          gender: 'Male',
          isVoter: true,
          occupation: 'Agriculture / Cultivation',
          hasGovernmentJob: false,
          governmentDepartment: '',
          mobile: '',
          education: '10th Matric',
          maritalStatus: 'Married',
          status: 'Active',
          notes: ''
        }
      ]);
      setDeletedMemberIds([]);
    }
  }, [isOpen, existingFamily]);

  // When Village changes, update available Wards and recalculate Family ID
  const handleVillageChange = (newVillageId: string) => {
    setVillageId(newVillageId);
    const vWards = wards.filter(w => w.villageId === newVillageId);
    const newWardId = vWards[0]?.id || '';
    setWardId(newWardId);
    if (newWardId && !existingFamily) {
      setFamilyId(generateNextFamilyId(newWardId));
    }
  };

  // When Ward changes, update Family ID automatically
  const handleWardChange = (newWardId: string) => {
    setWardId(newWardId);
    if (newWardId && !existingFamily) {
      setFamilyId(generateNextFamilyId(newWardId));
    }
  };

  // Synchronize first member's name with Family Head if user wants
  const handleMemberChange = (index: number, field: keyof EditableMemberRow, value: any) => {
    const updated = [...membersRows];
    updated[index] = { ...updated[index], [field]: value };

    // If relation is 'Head' or first row and family head is empty, sync
    if (index === 0 && field === 'name' && !familyHeadName) {
      setFamilyHeadName(value);
      if (!contactPersonName) setContactPersonName(value);
    }
    if (index === 0 && field === 'mobile' && !primaryMobile) {
      setPrimaryMobile(value);
    }

    setMembersRows(updated);
  };

  const handleAddMemberRow = () => {
    const nextIndex = membersRows.length + 1;
    const newRow: EditableMemberRow = {
      tempId: `new-${Date.now()}-${nextIndex}`,
      name: '',
      fatherHusbandName: familyHeadName || '',
      relation: nextIndex === 2 ? 'Spouse' : nextIndex === 3 ? 'Son' : nextIndex === 4 ? 'Daughter' : 'Other',
      age: 25,
      dob: '',
      gender: nextIndex === 2 ? 'Female' : 'Male',
      isVoter: true,
      occupation: 'Self-employed / Labor',
      hasGovernmentJob: false,
      governmentDepartment: '',
      mobile: primaryMobile || '',
      education: 'Secondary',
      maritalStatus: 'Unmarried',
      status: 'Active',
      notes: ''
    };
    setMembersRows([...membersRows, newRow]);
  };

  const handleRemoveMemberRow = (index: number) => {
    const target = membersRows[index];
    if (target.id) {
      setDeletedMemberIds(prev => [...prev, target.id!]);
    }
    setMembersRows(membersRows.filter((_, i) => i !== index));
  };

  // Automatic Calculation: Government Job in Family
  const govtJobMembers = membersRows.filter(m => m.hasGovernmentJob && m.name && m.name.trim().length > 0);
  const hasGovtJobInFamily = govtJobMembers.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!familyHeadName.trim()) {
      alert('Please enter the Family Head Name');
      return;
    }
    if (!primaryMobile.trim()) {
      alert('Please enter a Primary Mobile number');
      return;
    }

    const currentTimestamp = new Date().toISOString().slice(0, 10);

    const familyPayload: Family = {
      id: familyId,
      panchayatId: panchayat.id,
      villageId,
      wardId,
      familyHeadName: familyHeadName.trim(),
      contactPersonName: contactPersonName.trim() || familyHeadName.trim(),
      primaryMobile: primaryMobile.trim(),
      alternativeMobile: alternativeMobile.trim() || undefined,
      address: address.trim() || `Ward ${wardId}`,
      economicStatus,
      rationCardNumber: rationCardNumber.trim() || undefined,
      rationCardType,
      houseType,
      sanitationFacility,
      drinkingWaterSource,
      electricityConnection,
      notes: notes.trim() || undefined,
      createdAt: existingFamily?.createdAt || currentTimestamp,
      updatedAt: currentTimestamp
    };

    if (existingFamily) {
      // Update existing family
      updateFamily(familyPayload);

      // Delete removed members
      deletedMemberIds.forEach(mId => deleteMember(mId));

      // Update or add members
      membersRows.forEach((row, idx) => {
        if (!row.name || !row.name.trim()) return;

        if (row.id) {
          // Existing member
          updateMember({
            ...(row as FamilyMember),
            familyId: familyPayload.id
          });
        } else {
          // New member added during edit
          const genMemberId = `${familyPayload.id}-M${(idx + 1).toString().padStart(2, '0')}`;
          addMember({
            id: genMemberId,
            familyId: familyPayload.id,
            name: row.name.trim(),
            fatherHusbandName: row.fatherHusbandName?.trim() || familyHeadName,
            relation: row.relation || 'Other',
            age: Number(row.age) || 30,
            dob: row.dob || undefined,
            gender: row.gender || 'Male',
            isVoter: !!row.isVoter,
            voterEpicNumber: row.voterEpicNumber?.trim() || undefined,
            occupation: row.occupation?.trim() || 'General',
            hasGovernmentJob: !!row.hasGovernmentJob,
            governmentDepartment: row.governmentDepartment?.trim() || undefined,
            mobile: row.mobile?.trim() || undefined,
            education: row.education?.trim() || 'Literate',
            maritalStatus: row.maritalStatus || 'Married',
            status: row.status || 'Active',
            notes: row.notes?.trim() || undefined
          });
        }
      });
    } else {
      // Create new family with members
      const newMembers: FamilyMember[] = membersRows
        .filter(row => row.name && row.name.trim().length > 0)
        .map((row, idx) => {
          const genMemberId = `${familyPayload.id}-M${(idx + 1).toString().padStart(2, '0')}`;
          return {
            id: genMemberId,
            familyId: familyPayload.id,
            name: row.name!.trim(),
            fatherHusbandName: row.fatherHusbandName?.trim() || familyHeadName,
            relation: row.relation || 'Other',
            age: Number(row.age) || 30,
            dob: row.dob || undefined,
            gender: row.gender || 'Male',
            isVoter: !!row.isVoter,
            voterEpicNumber: row.voterEpicNumber?.trim() || undefined,
            occupation: row.occupation?.trim() || 'Labor',
            hasGovernmentJob: !!row.hasGovernmentJob,
            governmentDepartment: row.governmentDepartment?.trim() || undefined,
            mobile: row.mobile?.trim() || undefined,
            education: row.education?.trim() || 'Literate',
            maritalStatus: row.maritalStatus || 'Married',
            status: row.status || 'Active',
            notes: row.notes?.trim() || undefined
          };
        });

      addFamilyWithMembers(familyPayload, newMembers);
    }

    onClose();
  };

  if (!isOpen) return null;

  const filteredWards = wards.filter(w => w.villageId === villageId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {existingFamily ? `Edit Household: ${existingFamily.familyHeadName}` : 'Fast Family & Household Registration'}
              </h2>
              <p className="text-xs text-slate-300">
                Central Relational Record | Auto-generated ID: <span className="font-mono text-blue-300 font-semibold">{familyId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION 1: Family Location & Identifiers */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
              <Building className="w-4 h-4 mr-1.5 text-blue-600" />
              Administrative Location & Auto-Hierarchy
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Panchayat</label>
                <input
                  type="text"
                  disabled
                  value={panchayat.name || ''}
                  className="w-full text-xs bg-gray-200 border border-gray-300 rounded-lg px-3 py-2 text-gray-700 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Village <span className="text-red-500">*</span>
                </label>
                <select
                  value={villageId || ''}
                  onChange={e => handleVillageChange(e.target.value)}
                  className="w-full text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                >
                  {villages.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ward <span className="text-red-500">*</span>
                </label>
                <select
                  value={wardId || ''}
                  onChange={e => handleWardChange(e.target.value)}
                  className="w-full text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                >
                  {filteredWards.map((w, idx) => (
                    <option key={`ffm-ward-${w.id}-${idx}`} value={w.id}>
                      Ward {w.wardNumber} ({w.wardMemberName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Family ID (AUTOMATIC)
                </label>
                <input
                  type="text"
                  readOnly
                  value={familyId || ''}
                  className="w-full text-xs bg-blue-50 border border-blue-300 rounded-lg px-3 py-2 text-blue-900 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Family Head & Household Information */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
              <User className="w-4 h-4 mr-1.5 text-blue-600" />
              Household Head & Socio-Economic Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Family Head Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sri Rabindra Nath Nayak"
                  value={familyHeadName || ''}
                  onChange={e => {
                    setFamilyHeadName(e.target.value);
                    if (!contactPersonName) setContactPersonName(e.target.value);
                  }}
                  className="w-full text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  placeholder="Can be Head or Family Member"
                  value={contactPersonName || ''}
                  onChange={e => setContactPersonName(e.target.value)}
                  className="w-full text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Primary Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={primaryMobile || ''}
                  onChange={e => setPrimaryMobile(e.target.value)}
                  className="w-full text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Alternative Mobile
                </label>
                <input
                  type="tel"
                  placeholder="Secondary / Son / Relative"
                  value={alternativeMobile || ''}
                  onChange={e => setAlternativeMobile(e.target.value)}
                  className="w-full text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Residential Address / Sahi / Landmark
                </label>
                <input
                  type="text"
                  placeholder="e.g. Plot 42, Main Road near Shiv Mandir, Ward 1"
                  value={address || ''}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Economic Status & Automatic Govt Job Indicator */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Economic Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={economicStatus ?? 2}
                  onChange={e => setEconomicStatus(Number(e.target.value) as EconomicStatusCode)}
                  className="w-full text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 — Well</option>
                  <option value={2}>2 — Moderate</option>
                  <option value={3}>3 — Low</option>
                </select>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Code & label: <strong>{economicStatus === 1 ? '1 — Well' : economicStatus === 2 ? '2 — Moderate' : '3 — Low'}</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Government Job in Family (Automatic)
                </label>
                <div className={`text-xs px-3 py-2 rounded-lg border flex items-center font-medium ${
                  hasGovtJobInFamily ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-gray-100 text-gray-700 border-gray-300'
                }`}>
                  {hasGovtJobInFamily ? (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-1 text-emerald-700" />
                      <span>
                        Yes: <strong>{govtJobMembers.map(m => m.name).join(', ')}</strong> ({govtJobMembers[0].governmentDepartment || 'Govt Employed'})
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 mr-1 text-gray-400" />
                      <span>No Government Employment in Family</span>
                    </>
                  )}
                </div>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Automatically calculated from member list below
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ration Card (NFSA / AAY)
                </label>
                <div className="flex space-x-2">
                  <select
                    value={rationCardType || 'PHH (Priority)'}
                    onChange={e => setRationCardType(e.target.value as any)}
                    className="text-xs bg-white border border-gray-300 rounded-lg px-2 py-2 text-gray-900"
                  >
                    <option value="PHH (Priority)">PHH (Priority)</option>
                    <option value="AAY (Antyodaya)">AAY (Antyodaya)</option>
                    <option value="NPHH">NPHH</option>
                    <option value="None">None</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Card No."
                    value={rationCardNumber || ''}
                    onChange={e => setRationCardNumber(e.target.value)}
                    className="flex-1 text-xs bg-white border border-gray-300 rounded-lg px-2 py-2 text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: SPREADSHEET-STYLE FAMILY MEMBER ENTRY */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-gray-800 flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1.5 text-indigo-600" />
                  Individual Family Members (Spreadsheet Entry)
                </h3>
                <p className="text-xs text-gray-500">
                  Quick inline grid entry. No separate popups needed per member.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddMemberRow}
                className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Member Row</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-xs max-h-72">
              <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
                <thead className="bg-slate-100 text-gray-700 uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-gray-200">
                  <tr>
                    <th className="p-2 w-8 text-center">#</th>
                    <th className="p-2 w-40">Member Name *</th>
                    <th className="p-2 w-36">Father's/Husband's</th>
                    <th className="p-2 w-28">Relation</th>
                    <th className="p-2 w-16">Age</th>
                    <th className="p-2 w-20">Gender</th>
                    <th className="p-2 w-16 text-center">Voter?</th>
                    <th className="p-2 w-32">Occupation</th>
                    <th className="p-2 w-24 text-center">Govt Job?</th>
                    <th className="p-2 w-32">Govt Department</th>
                    <th className="p-2 w-28">Mobile</th>
                    <th className="p-2 w-28">Education</th>
                    <th className="p-2 w-24">Marital</th>
                    <th className="p-2 w-20">Status</th>
                    <th className="p-2 w-10 text-center">Del</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {membersRows.map((row, idx) => (
                    <tr key={row.tempId || idx} className="hover:bg-blue-50/40">
                      <td className="p-2 text-center text-gray-400 font-mono font-semibold">
                        {idx + 1}
                      </td>

                      {/* Name */}
                      <td className="p-1">
                        <input
                          type="text"
                          required
                          placeholder="Full Name"
                          value={row.name || ''}
                          onChange={e => handleMemberChange(idx, 'name', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-900 focus:border-blue-500"
                        />
                      </td>

                      {/* Father/Husband */}
                      <td className="p-1">
                        <input
                          type="text"
                          placeholder="Father/Husband"
                          value={row.fatherHusbandName || ''}
                          onChange={e => handleMemberChange(idx, 'fatherHusbandName', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-900"
                        />
                      </td>

                      {/* Relation */}
                      <td className="p-1">
                        <select
                          value={row.relation || 'Other'}
                          onChange={e => handleMemberChange(idx, 'relation', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded px-1.5 py-1 text-xs text-gray-900"
                        >
                          <option value="Head">Head</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Son">Son</option>
                          <option value="Daughter">Daughter</option>
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Brother">Brother</option>
                          <option value="Sister">Sister</option>
                          <option value="Daughter-in-law">Daughter-in-law</option>
                          <option value="Son-in-law">Son-in-law</option>
                          <option value="Grandson">Grandson</option>
                          <option value="Granddaughter">Granddaughter</option>
                          <option value="Other">Other</option>
                        </select>
                      </td>

                      {/* Age */}
                      <td className="p-1">
                        <input
                          type="number"
                          min="0"
                          max="120"
                          value={row.age ?? 25}
                          onChange={e => handleMemberChange(idx, 'age', Number(e.target.value))}
                          className="w-full bg-white border border-gray-200 rounded px-1.5 py-1 text-xs text-gray-900"
                        />
                      </td>

                      {/* Gender */}
                      <td className="p-1">
                        <select
                          value={row.gender || 'Male'}
                          onChange={e => handleMemberChange(idx, 'gender', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded px-1 py-1 text-xs text-gray-900"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </td>

                      {/* Voter */}
                      <td className="p-1 text-center">
                        <input
                          type="checkbox"
                          checked={!!row.isVoter}
                          onChange={e => handleMemberChange(idx, 'isVoter', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </td>

                      {/* Occupation */}
                      <td className="p-1">
                        <input
                          type="text"
                          placeholder="e.g. Farming, Labor"
                          value={row.occupation || ''}
                          onChange={e => handleMemberChange(idx, 'occupation', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-900"
                        />
                      </td>

                      {/* Government Job */}
                      <td className="p-1 text-center">
                        <input
                          type="checkbox"
                          checked={!!row.hasGovernmentJob}
                          onChange={e => handleMemberChange(idx, 'hasGovernmentJob', e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                      </td>

                      {/* Govt Department */}
                      <td className="p-1">
                        <input
                          type="text"
                          disabled={!row.hasGovernmentJob}
                          placeholder={row.hasGovernmentJob ? 'e.g. School Teacher' : 'N/A'}
                          value={row.governmentDepartment || ''}
                          onChange={e => handleMemberChange(idx, 'governmentDepartment', e.target.value)}
                          className={`w-full border rounded px-2 py-1 text-xs ${
                            row.hasGovernmentJob
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                              : 'bg-gray-100 border-gray-200 text-gray-400'
                          }`}
                        />
                      </td>

                      {/* Mobile */}
                      <td className="p-1">
                        <input
                          type="tel"
                          placeholder="Phone"
                          value={row.mobile || ''}
                          onChange={e => handleMemberChange(idx, 'mobile', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-900"
                        />
                      </td>

                      {/* Education */}
                      <td className="p-1">
                        <input
                          type="text"
                          placeholder="e.g. 10th, B.A."
                          value={row.education || ''}
                          onChange={e => handleMemberChange(idx, 'education', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-900"
                        />
                      </td>

                      {/* Marital */}
                      <td className="p-1">
                        <select
                          value={row.maritalStatus || 'Married'}
                          onChange={e => handleMemberChange(idx, 'maritalStatus', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded px-1 py-1 text-xs text-gray-900"
                        >
                          <option value="Married">Married</option>
                          <option value="Unmarried">Unmarried</option>
                          <option value="Widowed">Widowed</option>
                          <option value="Divorced">Divorced</option>
                        </select>
                      </td>

                      {/* Status */}
                      <td className="p-1">
                        <select
                          value={row.status || 'Active'}
                          onChange={e => handleMemberChange(idx, 'status', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded px-1 py-1 text-xs text-gray-900"
                        >
                          <option value="Active">Active</option>
                          <option value="Migrated">Migrated</option>
                          <option value="Deceased">Deceased</option>
                        </select>
                      </td>

                      {/* Delete */}
                      <td className="p-1 text-center">
                        {membersRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMemberRow(idx)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove row"
                          >
                            <Trash2 className="w-3.5 h-3.5 mx-auto" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 4: Housing & Infrastructure Details */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
              Dwelling & Basic Amenities
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-gray-600 font-medium mb-1">House Structure</label>
                <select
                  value={houseType || 'Pucca'}
                  onChange={e => setHouseType(e.target.value as any)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1.5"
                >
                  <option value="Pucca">Pucca (RCC Roof)</option>
                  <option value="Semi-Pucca">Semi-Pucca (Asbestos/Tiles)</option>
                  <option value="Kutcha">Kutcha (Thatch/Mud)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">Water Source</label>
                <select
                  value={drinkingWaterSource || 'Piped Water'}
                  onChange={e => setDrinkingWaterSource(e.target.value as any)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1.5"
                >
                  <option value="Piped Water">Piped Water Connection</option>
                  <option value="Tube Well">Tube Well</option>
                  <option value="Open Well">Open Well</option>
                  <option value="Canal/Pond">Canal / Pond</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-5">
                <input
                  type="checkbox"
                  id="sanitation"
                  checked={sanitationFacility}
                  onChange={e => setSanitationFacility(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="sanitation" className="text-gray-700 font-medium">
                  Toilet / Latrine Facility
                </label>
              </div>

              <div className="flex items-center space-x-2 pt-5">
                <input
                  type="checkbox"
                  id="electricity"
                  checked={electricityConnection}
                  onChange={e => setElectricityConnection(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="electricity" className="text-gray-700 font-medium">
                  Electricity Metered Connection
                </label>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs text-gray-600 font-medium mb-1">Social Worker Field Notes</label>
              <textarea
                rows={2}
                placeholder="Specific field observations, vulnerability indicators, pending documentation..."
                value={notes || ''}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Total Members to Save: <span className="font-bold text-gray-900">{membersRows.filter(r => r.name).length}</span>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{existingFamily ? 'Update Household' : 'Save Household & Members'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
