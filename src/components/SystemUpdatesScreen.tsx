import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Download,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import {
  SecureDroidTopBar,
  SecureDroidCard,
  SecureDroidButton,
  SecureDroidSectionHeader,
  SecureDroidStatusChip
} from './ui/designSystem';

interface SystemUpdatesScreenProps {
  onBack?: () => void;
  isLight?: boolean;
}

export const SystemUpdatesScreen: React.FC<SystemUpdatesScreenProps> = ({
  onBack,
  isLight = false,
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [activeSlot, setActiveSlot] = useState<'Slot A' | 'Slot B'>('Slot A');

  const handleCheckUpdates = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      setUpdateAvailable(false);
    }, 1500);
  };

  return (
    <div className={`min-h-full p-4 pb-24 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      <SecureDroidTopBar
        title="System Updates"
        subtitle="A/B Seamless Dual-Slot Cryptographic Updates"
        onBack={onBack}
        isLight={isLight}
      />

      <div className="pt-4 space-y-4">
        {/* Status Card */}
        <SecureDroidCard isLight={isLight} highlight className="p-5 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-3 text-emerald-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold">Your system is up to date</h3>
          <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            SecureDroid OS 2.0.0 • Security Patch Level: 2026-08-01
          </p>

          <div className="pt-4">
            <SecureDroidButton
              variant="secondary"
              onClick={handleCheckUpdates}
              isLight={isLight}
              icon={RefreshCw}
              disabled={isChecking}
            >
              {isChecking ? 'Verifying update signatures...' : 'Check for Updates'}
            </SecureDroidButton>
          </div>
        </SecureDroidCard>

        {/* Dual Slot Architecture Status */}
        <SecureDroidSectionHeader title="A/B Dual-Slot Partition Status" isLight={isLight} />
        <SecureDroidCard isLight={isLight} className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">Current Active Boot Slot</span>
            </div>
            <span className="font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
              {activeSlot} (boot_a, system_a)
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-700/20">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-sky-400" />
              <span className="font-semibold">Inactive Target Slot</span>
            </div>
            <span className="font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Slot B (boot_b, system_b)
            </span>
          </div>

          <p className={`text-xs mt-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            SecureDroid updates are streamed directly to the inactive slot using cryptographic payload hashes.
            If the newly flashed slot fails to pass hardware AVB 2.0 verification on reboot, the bootloader automatically rolls back to the known-good active slot.
          </p>
        </SecureDroidCard>
      </div>
    </div>
  );
};
