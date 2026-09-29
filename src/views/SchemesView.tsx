import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { SchemeApplication } from '../types';
import {
  FileCheck,
  Search,
  Filter,
  Plus,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ExternalLink,
  Edit,
  Trash2
} from 'lucide-react';

interface SchemesViewProps {
  onNavigate: (view: string, targetId?: string) => void;
  onOpenQuickAdd: (type: string, initialData?: any) => void;
}

export const SchemesView: React.FC<SchemesViewProps> = ({ onNavigate, onOpenQuickAdd }) => {
  const {
    schemes,
    families,
    villages,
    wards,
    addScheme,
    updateScheme,
    deleteScheme
  } = useDatabase();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterScheme, setFilterScheme] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterVillage, setFilterVillage] = useState('all');
  const [filterWard, setFilterWard] = useState('all');

  // Scheme list
  const uniqueSchemes = Array.from(new Set(schemes.map(s => s.schemeName)));

  // Filtered wards based on selected village
  const availableWards = filterVillage === 'all'
    ? wards
    : wards.filter(w => w.villageId === filterVillage);

  const filteredSchemes = schemes.filter(s => {
    const schemeMatch = filterScheme === 'all' || s.schemeName === filterScheme;
    const statusMatch = filterStatus === 'all' || s.status === filterStatus;
    const villageMatch = filterVillage === 'all' || s.villageId === filterVillage;
    const wardMatch = filterWard === 'all' || s.wardId === filterWard;
    const q = searchQuery.toLowerCase().trim();
    const qMatch =
      !q ||
      s.applicantName.toLowerCase().includes(q) ||
      s.schemeName.toLowerCase().includes(q) ||
      s.applicationNumber?.toLowerCase().includes(q) ||
      s.familyId.toLowerCase().includes(q);

    return schemeMatch && statusMatch && villageMatch && wardMatch && qMatch;
  });

  const getStatusBadge = (status: SchemeApplication['status']) => {
    switch (status) {
      case 'Sanctioned / Active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Pending Approval':
      case 'Under Verification':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Document Required':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleStatusChange = (scheme: SchemeApplication, newStatus: SchemeApplication['status']) => {
    updateScheme({
      ...scheme,
      status: newStatus
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              <span>Government Welfare Schemes Tracker</span>
            </h1>
            <p className="text-xs text-gray-500">
              PMAY, PM-KISAN, Pensions, NFSA Ration & Social Assistance Applications
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              onClick={() => onOpenQuickAdd('scheme')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Enroll Govt Scheme</span>
            </button>
            <button
              onClick={() => onOpenQuickAdd('assistance')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Direct Assistance</span>
            </button>
          </div>
        </div>

        {/* Filters Strip with Panchayat -> Village -> Ward hierarchy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search applicant, app number, family ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={filterVillage}
              onChange={e => {
                setFilterVillage(e.target.value);
                setFilterWard('all');
              }}
              className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 font-medium cursor-pointer"
            >
              <option value="all">All Villages ({villages.length})</option>
              {villages.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.code})</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterWard}
              onChange={e => setFilterWard(e.target.value)}
              disabled={filterVillage !== 'all' && availableWards.length === 0}
              className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 font-medium cursor-pointer disabled:opacity-50"
            >
              <option value="all">All Wards ({availableWards.length})</option>
              {availableWards.map((w, idx) => (
                <option key={`sch-ward-${w.id}-${idx}`} value={w.id}>Ward {w.wardNumber} ({w.id})</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterScheme}
              onChange={e => setFilterScheme(e.target.value)}
              className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 font-medium cursor-pointer"
            >
              <option value="all">All Programs ({uniqueSchemes.length})</option>
              {uniqueSchemes.map(sch => (
                <option key={sch} value={sch}>{sch}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Filter Line (Status & Reset) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-600 text-[11px]">Status:</span>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-900 font-medium cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Sanctioned / Active">Sanctioned / Active</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Under Verification">Under Verification</option>
              <option value="Document Required">Document Required</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="text-gray-500 text-[11px]">
            Showing <strong>{filteredSchemes.length}</strong> of {schemes.length} scheme records
            {(filterVillage !== 'all' || filterWard !== 'all' || filterScheme !== 'all' || filterStatus !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setFilterVillage('all');
                  setFilterWard('all');
                  setFilterScheme('all');
                  setFilterStatus('all');
                  setSearchQuery('');
                }}
                className="ml-2 text-indigo-600 hover:underline font-bold"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scheme Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSchemes.map(s => {
          const v = villages.find(vil => vil.id === s.villageId);
          const w = wards.find(wrd => wrd.id === s.wardId);
          const fam = families.find(f => f.id === s.familyId);

          return (
            <div
              key={s.id}
              className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-xs hover:border-indigo-400 transition-all flex flex-col justify-between text-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 text-[11px]">
                    {s.schemeName}
                  </span>
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(s.status)}`}>
                      {s.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenQuickAdd('scheme', s)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                      title="Edit Scheme Record"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete application for ${s.schemeName} (${s.applicantName})?`)) {
                          deleteScheme(s.id);
                        }
                      }}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-gray-900 mt-2">
                  {s.applicantName}
                </h3>
                <p className="text-[11px] text-gray-500 font-mono">
                  App No: {s.applicationNumber || 'Under Generation'}
                </p>

                <div className="mt-3 space-y-1 text-gray-600">
                  <p className="flex items-center text-gray-700">
                    <Building className="w-3.5 h-3.5 mr-1.5 text-gray-400 shrink-0" />
                    <span>{v?.name || 'Village'} • Ward {w?.wardNumber || 'N/A'}</span>
                  </p>
                  <p className="flex items-center text-gray-700">
                    <span className="font-semibold text-gray-900 mr-1">Family ID:</span>
                    <button
                      onClick={() => onNavigate('families', s.familyId)}
                      className="text-blue-600 hover:underline font-mono"
                    >
                      {s.familyId}
                    </button>
                  </p>
                  <p className="text-gray-500 text-[11px]">
                    Applied: {s.appliedDate}
                    {s.sanctionedDate && ` • Sanctioned: ${s.sanctionedDate}`}
                  </p>
                </div>

                {(s.amountOrBenefit || s.benefitDetails) && (
                  <div className="mt-3 p-2 bg-gray-50 rounded-lg text-gray-700 text-[11px]">
                    <span className="font-bold text-gray-900">Entitlement: </span>
                    <span>{s.amountOrBenefit || s.benefitDetails}</span>
                  </div>
                )}
                {s.notes && (
                  <p className="mt-2 text-[10px] text-gray-500 italic">
                    "{s.notes}"
                  </p>
                )}
              </div>

              {/* Status Update Control */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <select
                  value={s.status}
                  onChange={e => handleStatusChange(s, e.target.value as any)}
                  className="text-[11px] bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 font-semibold cursor-pointer"
                >
                  <option value="Under Verification">Under Verification</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Document Required">Document Required</option>
                  <option value="Sanctioned / Active">Sanctioned / Active</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onOpenQuickAdd('scheme', s)}
                    className="text-xs font-semibold text-blue-700 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onNavigate('families', s.familyId)}
                    className="text-xs font-semibold text-indigo-700 hover:underline flex items-center"
                  >
                    <span>Dossier</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
