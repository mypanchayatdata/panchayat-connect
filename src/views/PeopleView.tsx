import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { PersonCategory, KeyPerson } from '../types';
import { VoterCategoryBadge } from '../components/common/VoterCategoryBadge';
import {
  Users,
  Search,
  Filter,
  Plus,
  Phone,
  Edit,
  Trash2,
  Building,
  CheckCircle2,
  UserCheck,
  Briefcase
} from 'lucide-react';

interface PeopleViewProps {
  onNavigate: (view: string, targetId?: string) => void;
  onOpenQuickAdd: (type: string) => void;
}

export const PeopleView: React.FC<PeopleViewProps> = ({ onNavigate, onOpenQuickAdd }) => {
  const {
    panchayat,
    villages,
    wards,
    keyPeople,
    members,
    families,
    deleteKeyPerson
  } = useDatabase();

  const [activeTab, setActiveTab] = useState<'leaders' | 'citizens'>('leaders');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVillage, setSelectedVillage] = useState<string>('all');
  const [voterFilter, setVoterFilter] = useState<'all' | 'voter' | 'non-voter'>('all');

  const categories: PersonCategory[] = [
    'Sarpanch',
    'Ward Member',
    'Teacher',
    'Youth',
    'Youth Leader',
    'Active Women',
    'Respected Person',
    'Social Worker',
    'Community Leader',
    'Religious Leader',
    'Healthcare/ASHA',
    'Anganwadi Worker'
  ];

  // Filtered Community Leaders / Key Stakeholders
  const filteredLeaders = keyPeople.filter(p => {
    const catMatch = selectedCategory === 'all' || p.category === selectedCategory;
    const vMatch = selectedVillage === 'all' || p.villageId === selectedVillage;
    const q = searchQuery.toLowerCase().trim();
    const qMatch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.designation?.toLowerCase().includes(q) ||
      p.notes?.toLowerCase().includes(q);
    return catMatch && vMatch && qMatch;
  });

  // Filtered General Citizen Directory
  const filteredCitizens = members.filter(m => {
    const fam = families.find(f => f.id === m.familyId);
    const vMatch = selectedVillage === 'all' || (fam && fam.villageId === selectedVillage);
    const vtrMatch =
      voterFilter === 'all' ||
      (voterFilter === 'voter' && m.isVoter) ||
      (voterFilter === 'non-voter' && !m.isVoter);
    const q = searchQuery.toLowerCase().trim();
    const qMatch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.fatherHusbandName.toLowerCase().includes(q) ||
      m.occupation.toLowerCase().includes(q) ||
      m.voterEpicNumber?.toLowerCase().includes(q) ||
      m.familyId.toLowerCase().includes(q);
    return vMatch && vtrMatch && qMatch;
  });

  const handleDeleteLeader = (id: string, name: string) => {
    if (window.confirm(`Delete leader record for "${name}"?`)) {
      deleteKeyPerson(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 flex items-center space-x-2">
              <Users className="w-5 h-5 text-teal-600" />
              <span>People & Community Stakeholders Directory</span>
            </h1>
            <p className="text-xs text-gray-500">
              Community Leaders, Youth, Women, Teachers & Citizen Registry
            </p>
          </div>

          <button
            onClick={() => onOpenQuickAdd('person')}
            className="flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Community Stakeholder</span>
          </button>
        </div>

        {/* Tab Switcher: Leaders vs General Citizens */}
        <div className="flex space-x-2 border-b border-gray-200 pb-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('leaders')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'leaders'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Community Leaders & Workers ({keyPeople.length})
          </button>
          <button
            onClick={() => setActiveTab('citizens')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'citizens'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            All Registered Citizens & Voters ({members.length})
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, phone, designation..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white"
            />
          </div>

          {activeTab === 'leaders' ? (
            <div>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 font-medium"
              >
                <option value="all">All Roles / Categories ({categories.length})</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <select
                value={voterFilter}
                onChange={e => setVoterFilter(e.target.value as any)}
                className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 font-medium"
              >
                <option value="all">All Members (Voters & Non-voters)</option>
                <option value="voter">Eligible Voters Only</option>
                <option value="non-voter">Non-voters / Minor</option>
              </select>
            </div>
          )}

          <div>
            <select
              value={selectedVillage}
              onChange={e => setSelectedVillage(e.target.value)}
              className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 font-medium"
            >
              <option value="all">All Villages</option>
              {villages.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* VIEW 1: Community Leaders Cards */}
      {activeTab === 'leaders' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeaders.map(p => {
            const v = villages.find(vil => vil.id === p.villageId);
            const w = wards.find(wrd => wrd.id === p.wardId);

            return (
              <div
                key={p.id}
                className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-xs hover:border-teal-400 hover:shadow-sm transition-all flex flex-col justify-between text-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-gray-400 font-bold">{p.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-900">
                      {p.category}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-gray-900 mt-1.5">{p.name}</h3>
                  <p className="text-gray-600 font-medium text-[11px] mt-0.5">
                    {p.designation || 'Key Stakeholder'}
                  </p>

                  <div className="mt-3 space-y-1 text-gray-600">
                    <p className="flex items-center text-gray-700">
                      <Building className="w-3.5 h-3.5 mr-1.5 text-gray-400 shrink-0" />
                      <span>{v?.name} {w ? `• Ward ${w.wardNumber}` : ''}</span>
                    </p>
                    <p className="flex items-center text-gray-800">
                      <Phone className="w-3.5 h-3.5 mr-1.5 text-teal-600 shrink-0" />
                      <a href={`tel:${p.phone}`} className="hover:underline font-bold">
                        {p.phone}
                      </a>
                    </p>
                  </div>

                  {p.notes && (
                    <p className="mt-2.5 p-2 bg-gray-50 rounded-lg text-gray-500 text-[11px] italic">
                      "{p.notes}"
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => handleDeleteLeader(p.id, p.name)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <a
                    href={`tel:${p.phone}`}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg font-bold"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call Leader</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: General Citizen Directory Table */}
      {activeTab === 'citizens' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[850px]">
              <thead className="bg-slate-100 text-gray-700 uppercase text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3">Citizen Name</th>
                  <th className="p-3">Father's / Husband's</th>
                  <th className="p-3">Family ID</th>
                  <th className="p-3">Age / Gen</th>
                  <th className="p-3">Occupation</th>
                  <th className="p-3 text-center">Voter Status</th>
                  <th className="p-3">Govt Job</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCitizens.map(m => (
                  <tr key={m.id} className="hover:bg-teal-50/20 transition-colors">
                    <td className="p-3 font-bold text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span>{m.name}</span>
                        <VoterCategoryBadge
                          memberId={m.id}
                          isVoter={m.isVoter}
                          voterStatus={m.voterStatus}
                          voterCategory={m.voterCategory}
                          showStatusLabel={false}
                          size="sm"
                        />
                      </div>
                    </td>
                    <td className="p-3 text-gray-600">{m.fatherHusbandName}</td>
                    <td className="p-3 font-mono text-[11px] text-blue-700">
                      <button
                        onClick={() => onNavigate('families', m.familyId)}
                        className="hover:underline font-bold"
                      >
                        {m.familyId}
                      </button>
                    </td>
                    <td className="p-3 text-gray-700">{m.age} / {m.gender}</td>
                    <td className="p-3 text-gray-700">{m.occupation}</td>
                    <td className="p-3 text-center">
                      <VoterCategoryBadge
                        memberId={m.id}
                        isVoter={m.isVoter}
                        voterStatus={m.voterStatus}
                        voterCategory={m.voterCategory}
                        showStatusLabel={true}
                        size="sm"
                      />
                      {m.voterEpicNumber && (
                        <span className="block text-[10px] font-mono text-gray-400 mt-0.5">
                          {m.voterEpicNumber}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {m.hasGovernmentJob ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {m.governmentDepartment || 'Govt Employed'}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onNavigate('families', m.familyId)}
                        className="text-xs font-semibold text-teal-700 hover:underline"
                      >
                        View Family →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
