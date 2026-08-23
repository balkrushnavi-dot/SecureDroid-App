import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Lock,
  Cpu,
  Terminal,
  Radio,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  RefreshCw,
  Zap,
  HelpCircle
} from 'lucide-react';
import {
  SecureDroidTopBar,
  SecureDroidCard,
  SecureDroidStatusChip,
  SecureDroidSectionHeader,
  SecureDroidButton,
  SecureDroidSwitch
} from '../ui/designSystem';
import {
  IndividualProtectionItem,
  ProtectionLevel,
  ProtectionStatus,
  SystemLayer
} from '../../types/securedroid';
import { ADVANCED_PROTECTION_ITEMS } from '../../data/featurePackData';

interface AdvancedProtectionScreenProps {
  onBack: () => void;
  onOpenTransparency?: (item: IndividualProtectionItem) => void;
  isLight?: boolean;
}

export const AdvancedProtectionScreen: React.FC<AdvancedProtectionScreenProps> = ({
  onBack,
  onOpenTransparency,
  isLight = false,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<ProtectionLevel>('Enhanced');
  const [protections, setProtections] = useState<IndividualProtectionItem[]>(ADVANCED_PROTECTION_ITEMS);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedItemForModal, setSelectedItemForModal] = useState<IndividualProtectionItem | null>(null);

  const categories = ['All', 'Application Security', 'Exploit Protection', 'Network Security', 'Privacy', 'Peripheral Security', 'System Integrity'];

  const filteredProtections = protections.filter((p) => {
    if (activeCategory === 'All') return true;
    return p.category === activeCategory;
  });

  const getStatusBadgeVariant = (status: ProtectionStatus) => {
    switch (status) {
      case 'Enabled':
        return 'SECURE' as const;
      case 'Available':
        return 'ISOLATED' as const;
      case 'Unavailable':
      case 'Requires Hardware':
        return 'UNAVAILABLE' as const;
      case 'Requires SecureDroid OS':
      default:
        return 'DEGRADED' as const;
    }
  };

  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar
        title="Advanced Protection"
        subtitle="Master Hardening & Fail-Closed Security Policies"
        onBack={onBack}
        isLight={isLight}
      />

      {/* 1. Master Security Tier Selector */}
      <div className="pt-4 space-y-4">
        <SecureDroidSectionHeader title="Protection Posture" isLight={isLight} />

        <div className="grid grid-cols-3 gap-2">
          {(['Standard', 'Enhanced', 'Maximum'] as ProtectionLevel[]).map((level) => {
            const isSelected = selectedLevel === level;
            return (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? isLight
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                      : 'bg-zinc-100 text-zinc-900 border-zinc-100 shadow-sm'
                    : isLight
                    ? 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-800'
                    : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900 text-zinc-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{level}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <p className={`text-[10px] mt-1 line-clamp-2 ${
                    isSelected
                      ? isLight
                        ? 'text-zinc-300'
                        : 'text-zinc-700'
                      : isLight
                      ? 'text-zinc-500'
                      : 'text-zinc-400'
                  }`}>
                    {level === 'Standard' && 'Default Android security baseline'}
                    {level === 'Enhanced' && 'Recommended SecureDroid hardening'}
                    {level === 'Maximum' && 'Fail-closed high threat defense'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Real Status Callout Banner */}
        <SecureDroidCard isLight={isLight} className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold">Security Enforcement Transparency</h4>
              <p className={`text-[11px] mt-0.5 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                Features marked <strong className="font-mono text-zinc-200">Requires SecureDroid OS</strong> or <strong className="font-mono text-zinc-200">Requires Kernel</strong> demonstrate the exact OS architecture. A standard APK sandbox enforces client protections but cannot override device-wide kernel policies.
              </p>
            </div>
          </div>
        </SecureDroidCard>

        {/* 2. Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? isLight
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-900'
                  : isLight
                  ? 'bg-zinc-200/70 text-zinc-700 hover:bg-zinc-300/70'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3. Granular Protection Toggles List */}
        <div className="space-y-3">
          {filteredProtections.map((item) => (
            <SecureDroidCard key={item.id} isLight={isLight} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <SecureDroidStatusChip
                      status={getStatusBadgeVariant(item.status)}
                      label={item.status}
                      isLight={isLight}
                    />
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      isLight ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {item.layer}
                    </span>
                  </div>
                  <p className={`text-xs mt-1.5 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    {item.description}
                  </p>
                  
                  {/* Technical Requirement / Limitation Box */}
                  <div className={`mt-3 p-2.5 rounded-xl text-[11px] font-mono space-y-1 ${
                    isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-900 text-zinc-300'
                  }`}>
                    <div className="flex items-start gap-1.5">
                      <span className="text-zinc-500 font-sans font-medium shrink-0">Requirement:</span>
                      <span>{item.requirement}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-zinc-500 font-sans font-medium shrink-0">Limitation:</span>
                      <span className={item.isEnforcedInApk ? 'text-emerald-400' : 'text-amber-400'}>
                        {item.limitation}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 shrink-0">
                  <SecureDroidSwitch
                    checked={item.status === 'Enabled' || selectedLevel === 'Maximum'}
                    onChange={() => {
                      setProtections((prev) =>
                        prev.map((p) =>
                          p.id === item.id
                            ? { ...p, status: p.status === 'Enabled' ? 'Available' : 'Enabled' }
                            : p
                        )
                      );
                    }}
                    isLight={isLight}
                  />
                  <button
                    onClick={() => setSelectedItemForModal(item)}
                    className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                      isLight ? 'text-zinc-600 hover:bg-zinc-100' : 'text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Audit</span>
                  </button>
                </div>
              </div>
            </SecureDroidCard>
          ))}
        </div>
      </div>

      {/* Audit Transparency Modal */}
      {selectedItemForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`max-w-md w-full rounded-2xl p-5 shadow-2xl border ${
            isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-100'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/20">
              <h3 className="font-semibold text-sm">Security Transparency Audit</h3>
              <button
                onClick={() => setSelectedItemForModal(null)}
                className={`text-xs px-2.5 py-1 rounded-lg ${
                  isLight ? 'bg-zinc-100 hover:bg-zinc-200' : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="font-semibold text-zinc-400 block mb-0.5">Feature Name</span>
                <p className="font-medium text-sm">{selectedItemForModal.name}</p>
              </div>

              <div>
                <span className="font-semibold text-zinc-400 block mb-0.5">Implementation Layer</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {selectedItemForModal.layer}
                </span>
              </div>

              <div>
                <span className="font-semibold text-zinc-400 block mb-0.5">Current Platform Status</span>
                <SecureDroidStatusChip
                  status={getStatusBadgeVariant(selectedItemForModal.status)}
                  label={selectedItemForModal.status}
                  isLight={isLight}
                />
              </div>

              <div>
                <span className="font-semibold text-zinc-400 block mb-0.5">Technical Requirement</span>
                <p className={`p-2 rounded-lg font-mono text-[11px] ${
                  isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-950 text-zinc-300'
                }`}>
                  {selectedItemForModal.requirement}
                </p>
              </div>

              <div>
                <span className="font-semibold text-zinc-400 block mb-0.5">Real-World Limitation</span>
                <p className={`p-2 rounded-lg font-mono text-[11px] ${
                  isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-950 text-zinc-300'
                }`}>
                  {selectedItemForModal.limitation}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-800/20 flex justify-end">
              <SecureDroidButton
                variant="primary"
                onClick={() => setSelectedItemForModal(null)}
                isLight={isLight}
              >
                Done
              </SecureDroidButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
