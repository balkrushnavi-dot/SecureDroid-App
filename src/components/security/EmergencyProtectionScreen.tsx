import React, { useState } from 'react';
import {
  ShieldAlert,
  Trash2,
  Lock,
  Power,
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle2,
  Key,
  Flame,
  ChevronRight
} from 'lucide-react';
import {
  SecureDroidTopBar,
  SecureDroidCard,
  SecureDroidStatusChip,
  SecureDroidSectionHeader,
  SecureDroidButton
} from '../ui/designSystem';
import { EmergencyActionItem } from '../../types/securedroid';
import { EMERGENCY_ACTIONS_DATA } from '../../data/featurePackData';

interface EmergencyProtectionScreenProps {
  onBack: () => void;
  onLockdown?: () => void;
  isLight?: boolean;
}

export const EmergencyProtectionScreen: React.FC<EmergencyProtectionScreenProps> = ({
  onBack,
  onLockdown,
  isLight = false,
}) => {
  const [selectedAction, setSelectedAction] = useState<EmergencyActionItem | null>(null);
  const [confirmationStep, setConfirmationStep] = useState<boolean>(false);
  const [executedNotice, setExecutedNotice] = useState<string | null>(null);

  const handleTriggerAction = (action: EmergencyActionItem) => {
    setSelectedAction(action);
    setConfirmationStep(true);
  };

  const handleExecuteConfirmed = () => {
    if (!selectedAction) return;
    setConfirmationStep(false);
    setExecutedNotice(
      `SAFEGUARD DEMO: "${selectedAction.title}" architecture validated. Cryptographic key eviction flow simulated safely with zero real data destruction.`
    );
    if (selectedAction.actionType === 'LOCKDOWN' && onLockdown) {
      onLockdown();
    }
  };

  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar
        title="Emergency Protection"
        subtitle="Cryptographic Key Eviction & Data Sanitization"
        onBack={onBack}
        isLight={isLight}
      />

      <div className="pt-4 space-y-4">
        {/* Callout Notice */}
        <SecureDroidCard isLight={isLight} className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold">Destructive Action Safety Architecture</h4>
              <p className={`text-[11px] mt-0.5 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                Emergency actions demonstrate real SecureDroid OS cryptographic erasure pathways. In prototype mode, simulations run without destroying local files.
              </p>
            </div>
          </div>
        </SecureDroidCard>

        {executedNotice && (
          <SecureDroidCard isLight={isLight} highlight className="p-4 bg-emerald-950/30 border-emerald-500/50 text-emerald-300">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                <p className="text-xs">{executedNotice}</p>
              </div>
              <button
                onClick={() => setExecutedNotice(null)}
                className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 underline"
              >
                Dismiss
              </button>
            </div>
          </SecureDroidCard>
        )}

        {/* Emergency Actions List */}
        <SecureDroidSectionHeader title="Available Emergency Tiers" isLight={isLight} />

        <div className="space-y-3">
          {EMERGENCY_ACTIONS_DATA.map((item) => {
            const isExtreme = item.actionType === 'PROFILE_WIPE' || item.actionType === 'FACTORY_RESET';
            return (
              <SecureDroidCard key={item.id} isLight={isLight} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        isExtreme
                          ? 'bg-rose-500/20 text-rose-400 font-bold'
                          : isLight
                          ? 'bg-zinc-100 text-zinc-700'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        {item.requiredPrivilege}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                      {item.description}
                    </p>
                  </div>

                  <SecureDroidButton
                    variant={isExtreme ? 'danger' : 'secondary'}
                    size="sm"
                    onClick={() => handleTriggerAction(item)}
                    isLight={isLight}
                    className="shrink-0"
                  >
                    Initiate
                  </SecureDroidButton>
                </div>

                <div className={`mt-3 p-2.5 rounded-xl text-[11px] font-mono grid grid-cols-1 sm:grid-cols-2 gap-2 ${
                  isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-900 text-zinc-300'
                }`}>
                  <div>
                    <strong className="text-zinc-500 font-sans block">Deletions:</strong>
                    <span>{item.whatWillBeDeleted}</span>
                  </div>
                  <div>
                    <strong className="text-zinc-500 font-sans block">Retained Data:</strong>
                    <span>{item.whatWillRemain}</span>
                  </div>
                </div>
              </SecureDroidCard>
            );
          })}
        </div>
      </div>

      {/* Confirmation & Impact Modal Sheet */}
      {confirmationStep && selectedAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`max-w-md w-full rounded-2xl p-5 shadow-2xl border ${
            isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-100'
          }`}>
            <div className="flex items-center gap-2 text-rose-500 pb-3 border-b border-zinc-800/20">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-semibold text-sm">Confirm Emergency Action</h3>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <p className="font-medium text-sm">{selectedAction.title}</p>
              <p className={`leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {selectedAction.description}
              </p>

              <div className={`p-3 rounded-xl space-y-1.5 font-mono text-[11px] ${
                isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-950 text-zinc-300'
              }`}>
                <div><strong>Keys Destroyed:</strong> {selectedAction.areEncryptionKeysDestroyed ? 'YES (Cryptographic Shredding)' : 'NO (RAM Eviction Only)'}</div>
                <div><strong>Recovery Possible:</strong> {selectedAction.isRecoveryPossible ? 'YES' : 'PERMANENTLY IRREVERSIBLE'}</div>
                <div className="text-amber-400"><strong>Constraint:</strong> {selectedAction.realDeviceRequirement}</div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-800/20 flex justify-end gap-2">
              <SecureDroidButton
                variant="secondary"
                onClick={() => setConfirmationStep(false)}
                isLight={isLight}
              >
                Cancel
              </SecureDroidButton>
              <SecureDroidButton
                variant="danger"
                onClick={handleExecuteConfirmed}
                isLight={isLight}
              >
                Confirm Simulation
              </SecureDroidButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
