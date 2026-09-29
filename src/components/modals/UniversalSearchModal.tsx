import React, { useState, useEffect, useRef } from 'react';
import { useDatabase, SearchResultItem } from '../../context/DatabaseContext';
import { 
  Search, 
  X, 
  Home, 
  User, 
  AlertTriangle, 
  TicketCheck, 
  FileCheck, 
  Landmark, 
  Users, 
  ArrowRight,
  Filter,
  Sparkles
} from 'lucide-react';

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, targetId?: string) => void;
  onOpenAdvancedFilters?: () => void;
  onOpenAI?: (query?: string) => void;
}

export const UniversalSearchModal: React.FC<UniversalSearchModalProps> = ({ 
  isOpen, 
  onClose, 
  onNavigate,
  onOpenAdvancedFilters,
  onOpenAI
}) => {
  const { searchAll } = useDatabase();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length > 0) {
      setResults(searchAll(query));
    } else {
      setResults([]);
    }
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (item: SearchResultItem) => {
    onNavigate(item.targetView, item.targetId);
    onClose();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'family': return <Home className="w-4 h-4 text-blue-600" />;
      case 'member': return <User className="w-4 h-4 text-sky-600" />;
      case 'problem': return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'ticket': return <TicketCheck className="w-4 h-4 text-purple-600" />;
      case 'scheme': return <FileCheck className="w-4 h-4 text-indigo-600" />;
      case 'person': return <Users className="w-4 h-4 text-blue-600" />;
      case 'temple': return <Landmark className="w-4 h-4 text-orange-600" />;
      default: return <Search className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 px-2 sm:px-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in-50"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-gray-200 bg-gray-50/70">
          <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none text-gray-900 placeholder-gray-400 text-sm sm:text-base focus:outline-hidden"
            placeholder="Search families, members, voters, problems, schemes, tickets, temples..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'Enter' && results.length > 0) handleSelect(results[0]);
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 text-xs font-semibold px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 shrink-0 cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Quick Action Bar for Filters & AI */}
        <div className="px-4 py-2 bg-slate-50 border-b border-gray-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            {onOpenAdvancedFilters && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdvancedFilters();
                }}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                <span>Multi-Criteria Filters</span>
              </button>
            )}
            {onOpenAI && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAI(query || undefined);
                }}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-300 hover:bg-blue-100 text-blue-800 font-semibold transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Ask AI Assistant</span>
              </button>
            )}
          </div>
          <span className="text-[11px] text-gray-400 hidden sm:inline">
            {results.length} instantaneous matches
          </span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-gray-100 flex-1">
          {query.trim().length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Type any citizen name, ID, phone, ward, or topic to search</p>
              <p className="text-xs text-gray-400 mt-1">Try: "Nayak", "PMAY", "Water", "Ward 1", "Teacher"</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <p className="text-sm font-medium">No matching records found for "{query}"</p>
              <p className="text-xs text-gray-400 mt-1">Try our multi-criteria filters or ask the AI assistant</p>
              <div className="mt-4 flex justify-center space-x-2">
                {onOpenAdvancedFilters && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdvancedFilters();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold cursor-pointer"
                  >
                    Open Advanced Filters
                  </button>
                )}
                {onOpenAI && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAI(query);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                  >
                    Search with AI
                  </button>
                )}
              </div>
            </div>
          ) : (
            results.map(item => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => handleSelect(item)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50/70 cursor-pointer transition-colors group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-gray-900 truncate">{item.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 uppercase tracking-wide">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{item.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-400 group-hover:text-blue-600 pl-3 shrink-0">
                  <span className="text-xs font-medium mr-1 hidden sm:inline">Go</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-2.5 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
          <span>Relational Search Engine</span>
          <span>Press <strong>Enter</strong> to open, <strong>Esc</strong> to dismiss</span>
        </div>
      </div>
    </div>
  );
};
