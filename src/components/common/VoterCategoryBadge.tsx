import React, { useState, useRef, useEffect } from 'react';
import { VoterCategory, VoterStatus } from '../../types';
import { useDatabase } from '../../context/DatabaseContext';
import { ChevronDown, Check, Shield } from 'lucide-react';

interface VoterCategoryBadgeProps {
  memberId: string;
  isVoter?: boolean;
  voterStatus?: VoterStatus;
  voterCategory?: VoterCategory;
  showStatusLabel?: boolean;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const getVoterCategoryConfig = (category?: VoterCategory) => {
  switch (category) {
    case 'GREEN':
      return {
        emoji: '🟢',
        label: 'Green',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        hover: 'hover:bg-emerald-100'
      };
    case 'YELLOW':
      return {
        emoji: '🟡',
        label: 'Yellow',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        hover: 'hover:bg-amber-100'
      };
    case 'RED':
      return {
        emoji: '🔴',
        label: 'Red',
        color: 'text-rose-700',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
        hover: 'hover:bg-rose-100'
      };
    default:
      return {
        emoji: '⚪',
        label: 'Unassigned',
        color: 'text-gray-500',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        badgeClass: 'bg-gray-100 text-gray-700 border-gray-300',
        hover: 'hover:bg-gray-100'
      };
  }
};

export const VoterCategoryBadge: React.FC<VoterCategoryBadgeProps> = ({
  memberId,
  isVoter,
  voterStatus,
  voterCategory,
  showStatusLabel = false,
  interactive = true,
  size = 'md',
  className = ''
}) => {
  const { updateMemberVoterInfo, currentRole } = useDatabase();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const effectiveStatus: VoterStatus = voterStatus || (isVoter ? 'YES' : 'NO');
  const isVoterYes = effectiveStatus === 'YES' || isVoter === true;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!isVoterYes) {
    if (effectiveStatus === 'NOT VERIFIED') {
      return (
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200 ${className}`}
          title="Voter Status: Not Verified"
        >
          Not Verified
        </span>
      );
    }
    return null;
  }

  const categoryConfig = getVoterCategoryConfig(voterCategory || 'GREEN');

  const handleSelectCategory = (cat: VoterCategory) => {
    updateMemberVoterInfo(memberId, {
      voterCategory: cat,
      voterStatus: 'YES',
      isVoter: true
    });
    setIsOpen(false);
  };

  const handleSelectStatus = (status: VoterStatus) => {
    if (status === 'YES') {
      updateMemberVoterInfo(memberId, {
        voterStatus: 'YES',
        isVoter: true,
        voterCategory: voterCategory || 'GREEN'
      });
    } else {
      updateMemberVoterInfo(memberId, {
        voterStatus: status,
        isVoter: false,
        voterCategory: undefined
      });
    }
    setIsOpen(false);
  };

  const sizeClasses = {
    sm: 'text-xs px-1 py-0.5',
    md: 'text-xs px-1.5 py-0.5',
    lg: 'text-sm px-2 py-1'
  }[size];

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={menuRef}>
      <button
        type="button"
        disabled={!interactive}
        onClick={(e) => {
          e.stopPropagation();
          if (interactive) setIsOpen(!isOpen);
        }}
        title={`Voter: ${effectiveStatus} | Category: ${categoryConfig.label} (Click to change)`}
        className={`inline-flex items-center gap-1 rounded font-bold transition-all ${
          interactive
            ? 'cursor-pointer hover:scale-105 active:scale-95 hover:ring-1 hover:ring-blue-400'
            : 'cursor-default'
        } ${categoryConfig.bg} ${categoryConfig.border} border ${sizeClasses}`}
      >
        <span className="leading-none select-none">{categoryConfig.emoji}</span>
        {showStatusLabel && (
          <span className={`text-[11px] font-bold ${categoryConfig.color}`}>
            {categoryConfig.label}
          </span>
        )}
        {interactive && (
          <ChevronDown className="w-2.5 h-2.5 text-gray-400 opacity-70" />
        )}
      </button>

      {/* Admin / User Interactive Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 mt-1 right-0 sm:left-0 sm:right-auto top-full w-48 bg-white rounded-xl shadow-xl border border-gray-200 p-2 text-xs animate-in fade-in-50 zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-2 py-1 mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
            <span>Set Voter Category</span>
            <span className="text-blue-600 font-semibold flex items-center gap-0.5">
              <Shield className="w-2.5 h-2.5" /> Admin
            </span>
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => handleSelectCategory('GREEN')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left font-medium transition-colors ${
                voterCategory === 'GREEN' || (!voterCategory && effectiveStatus === 'YES')
                  ? 'bg-emerald-50 text-emerald-900 font-bold'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>🟢</span>
                <span>GREEN Category</span>
              </span>
              {(voterCategory === 'GREEN' || (!voterCategory && effectiveStatus === 'YES')) && (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSelectCategory('YELLOW')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left font-medium transition-colors ${
                voterCategory === 'YELLOW'
                  ? 'bg-amber-50 text-amber-900 font-bold'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>🟡</span>
                <span>YELLOW Category</span>
              </span>
              {voterCategory === 'YELLOW' && (
                <Check className="w-3.5 h-3.5 text-amber-600" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSelectCategory('RED')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left font-medium transition-colors ${
                voterCategory === 'RED'
                  ? 'bg-rose-50 text-rose-900 font-bold'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>🔴</span>
                <span>RED Category</span>
              </span>
              {voterCategory === 'RED' && (
                <Check className="w-3.5 h-3.5 text-rose-600" />
              )}
            </button>
          </div>

          <div className="mt-2 pt-1.5 border-t border-gray-100 space-y-1">
            <span className="px-2 text-[10px] text-gray-400 font-bold uppercase block">
              Voter Status
            </span>
            <div className="grid grid-cols-2 gap-1 px-1">
              <button
                type="button"
                onClick={() => handleSelectStatus('NO')}
                className="px-2 py-1 text-[11px] font-semibold rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-center"
              >
                Set as Non-Voter
              </button>
              <button
                type="button"
                onClick={() => handleSelectStatus('NOT VERIFIED')}
                className="px-2 py-1 text-[11px] font-semibold rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-center"
              >
                Not Verified
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
