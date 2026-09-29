import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Landmark, Calendar, Plus, Building, Users } from 'lucide-react';

interface TemplesEventsViewProps {
  onNavigate: (view: string, targetId?: string) => void;
  onOpenQuickAdd: (type: string) => void;
}

export const TemplesEventsView: React.FC<TemplesEventsViewProps> = ({
  onNavigate,
  onOpenQuickAdd
}) => {
  const {
    temples,
    events,
    villages,
    wards
  } = useDatabase();

  const [activeTab, setActiveTab] = useState<'temples' | 'events'>('temples');

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 flex items-center space-x-2">
              <Landmark className="w-5 h-5 text-orange-600" />
              <span>Temples, Cultural Events & Heritage</span>
            </h1>
            <p className="text-xs text-gray-500">
              Village religious institutions, annual melas, pujas, and community festivals
            </p>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => onOpenQuickAdd('temple')}
              className="flex items-center space-x-1 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Temple</span>
            </button>
            <button
              onClick={() => onOpenQuickAdd('event')}
              className="flex items-center space-x-1 px-3.5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Event</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex space-x-2 border-b border-gray-200 pb-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('temples')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-1.5 ${
              activeTab === 'temples'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Village Temples ({temples.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-1.5 ${
              activeTab === 'events'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Cultural Events & Festivals ({events.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: TEMPLES */}
      {activeTab === 'temples' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {temples.map(t => {
            const v = villages.find(vil => vil.id === t.villageId);
            const w = wards.find(wrd => wrd.id === t.wardId);

            return (
              <div
                key={t.id}
                className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-xs hover:border-orange-400 transition-all text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] text-gray-400 font-bold">{t.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                      Condition: {t.facilityStatus || 'Good'}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-gray-900 mt-1.5">{t.name}</h3>
                  <p className="text-orange-800 font-semibold text-xs mt-0.5">
                    Deity: {t.deity}
                  </p>

                  <div className="mt-3 space-y-1 text-gray-600 text-[11px]">
                    <p className="flex items-center">
                      <Building className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      <span>{v?.name} {w ? `• Ward ${w.wardNumber}` : ''}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-gray-800">Major Festival:</span> {t.majorFestival}
                    </p>
                    {t.managingCommittee && (
                      <p>
                        <span className="font-semibold text-gray-800">Trust / Committee:</span> {t.managingCommittee}
                      </p>
                    )}
                    {t.headPriestName && (
                      <p>
                        <span className="font-semibold text-gray-800">Pujari:</span> {t.headPriestName}
                      </p>
                    )}
                  </div>

                  {t.description && (
                    <p className="mt-2.5 p-2 bg-gray-50 rounded text-gray-600 text-[11px]">
                      {t.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: CULTURAL EVENTS & FESTIVALS */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(ev => {
            const v = villages.find(vil => vil.id === ev.villageId);

            return (
              <div
                key={ev.id}
                className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-xs hover:border-pink-400 transition-all text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] text-gray-400 font-bold">{ev.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-800">
                      {ev.type}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-gray-900 mt-1.5">{ev.name}</h3>
                  <p className="text-pink-800 font-semibold text-xs mt-0.5">
                    Schedule: {ev.estimatedDateOrMonth}
                  </p>

                  <div className="mt-3 space-y-1 text-gray-600 text-[11px]">
                    <p className="flex items-center">
                      <Building className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      <span>{v?.name} • Venue: {ev.venue}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-gray-800">Organizers:</span> {ev.leadOrganizers}
                    </p>
                  </div>

                  {ev.description && (
                    <p className="mt-2.5 p-2 bg-gray-50 rounded text-gray-600 text-[11px]">
                      {ev.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
