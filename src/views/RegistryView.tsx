import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Baby, ShieldAlert, Plus, Search, Building } from 'lucide-react';

interface RegistryViewProps {
  onNavigate: (view: string, targetId?: string) => void;
  onOpenQuickAdd: (type: string) => void;
  defaultTab?: 'births' | 'deaths';
}

export const RegistryView: React.FC<RegistryViewProps> = ({
  onNavigate,
  onOpenQuickAdd,
  defaultTab = 'births'
}) => {
  const {
    births,
    deaths,
    villages,
    wards,
    families
  } = useDatabase();

  const [activeTab, setActiveTab] = useState<'births' | 'deaths'>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBirths = births.filter(b => {
    const q = searchQuery.toLowerCase().trim();
    return !q || b.childName.toLowerCase().includes(q) || b.motherName.toLowerCase().includes(q) || b.fatherName.toLowerCase().includes(q);
  });

  const filteredDeaths = deaths.filter(d => {
    const q = searchQuery.toLowerCase().trim();
    return !q || d.deceasedPersonName.toLowerCase().includes(q) || d.causeOfDeath?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 flex items-center space-x-2">
              <Baby className="w-5 h-5 text-indigo-600" />
              <span>Vital Statistics & Registries (Births & Deaths)</span>
            </h1>
            <p className="text-xs text-gray-500">
              Grassroots vital records linked to family census, certificates, and social security pensions
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex space-x-2 border-b border-gray-200 pb-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('births')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-1.5 ${
              activeTab === 'births'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Baby className="w-3.5 h-3.5" />
            <span>Birth Records ({births.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('deaths')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-1.5 ${
              activeTab === 'deaths'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Death Records ({deaths.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: BIRTH RECORDS */}
      {activeTab === 'births' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead className="bg-slate-100 text-gray-700 uppercase text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3">Child Name</th>
                  <th className="p-3">Date of Birth</th>
                  <th className="p-3">Gender</th>
                  <th className="p-3">Mother & Father</th>
                  <th className="p-3">Family ID</th>
                  <th className="p-3">Certificate</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBirths.map(b => (
                  <tr key={b.id} className="hover:bg-indigo-50/20">
                    <td className="p-3 font-bold text-gray-900">{b.childName}</td>
                    <td className="p-3 text-gray-700">{b.dob}</td>
                    <td className="p-3 text-gray-700">{b.gender}</td>
                    <td className="p-3 text-gray-600">
                      M: {b.motherName} | F: {b.fatherName}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-blue-700">
                      <button onClick={() => onNavigate('families', b.familyId)} className="hover:underline font-bold">
                        {b.familyId}
                      </button>
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        b.certificateIssued ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.certificateIssued ? 'Issued' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onNavigate('families', b.familyId)}
                        className="text-xs font-semibold text-indigo-700 hover:underline"
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

      {/* VIEW 2: DEATH RECORDS */}
      {activeTab === 'deaths' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[750px]">
              <thead className="bg-slate-100 text-gray-700 uppercase text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3">Deceased Person</th>
                  <th className="p-3">Date of Death</th>
                  <th className="p-3">Age</th>
                  <th className="p-3">Cause of Death</th>
                  <th className="p-3">Family ID</th>
                  <th className="p-3">Pension Action</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDeaths.map(d => (
                  <tr key={d.id} className="hover:bg-rose-50/20">
                    <td className="p-3 font-bold text-gray-900">{d.deceasedPersonName}</td>
                    <td className="p-3 text-gray-700">{d.dod}</td>
                    <td className="p-3 text-gray-700">{d.age} Years</td>
                    <td className="p-3 text-gray-600">{d.causeOfDeath || 'Natural / Age'}</td>
                    <td className="p-3 font-mono text-[11px] text-blue-700">
                      <button onClick={() => onNavigate('families', d.familyId)} className="hover:underline font-bold">
                        {d.familyId}
                      </button>
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        d.socialSecurityInitiated ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {d.socialSecurityInitiated ? 'Pension Initiated' : 'Action Needed'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onNavigate('families', d.familyId)}
                        className="text-xs font-semibold text-rose-700 hover:underline"
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
