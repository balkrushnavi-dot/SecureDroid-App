import React, { useState } from 'react';
import {
  ShieldAlert,
  Smartphone,
  WifiOff,
  Lock,
  Radio,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  MapPin,
  RefreshCw
} from 'lucide-react';
import {
  SecureDroidTopBar,
  SecureDroidCard,
  SecureDroidStatusChip,
  SecureDroidSectionHeader,
  SecureDroidButton,
  SecureDroidSwitch
} from '../ui/designSystem';

interface TheftProtectionScreenProps {
  onBack: () => void;
  isLight?: boolean;
}

export const TheftProtectionScreen: React.FC<TheftProtectionScreenProps> = ({
  onBack,
  isLight = false,
}) => {
  const [theftDetection, setTheftDetection] = useState<boolean>(true);
  const [offlineLock, setOfflineLock] = useState<boolean>(true);
  const [remoteLockEnabled, setRemoteLockEnabled] = useState<boolean>(true);
  const [simChangeLock, setSimChangeLock] = useState<boolean>(true);
  const [failedAuthThreshold, setFailedAuthThreshold] = useState<number>(5);

  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar
        title="Theft Protection"
        subtitle="Motion Sensing, Offline Locks & Anti-Extraction"
        onBack={onBack}
        isLight={isLight}
      />

      <div className="pt-4 space-y-4">
        <SecureDroidSectionHeader title="Autonomous Device Defense" isLight={isLight} />

        {/* 1. Motion & Snatch Detection */}
        <SecureDroidCard isLight={isLight} className="p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Theft Detection Lock</h4>
                <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  Uses on-device accelerometer & gyroscope HAL to detect sudden snatch motion and instantly lock the screen.
                </p>
              </div>
            </div>
            <SecureDroidSwitch
              checked={theftDetection}
              onChange={() => setTheftDetection(!theftDetection)}
              isLight={isLight}
            />
          </div>
        </SecureDroidCard>

        {/* 2. Offline Lock */}
        <SecureDroidCard isLight={isLight} className="p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <WifiOff className="w-5 h-5 text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Offline Device Auto-Lock</h4>
                <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  Automatically locks the screen and redacts notifications if the device remains completely offline for more than 45 minutes.
                </p>
              </div>
            </div>
            <SecureDroidSwitch
              checked={offlineLock}
              onChange={() => setOfflineLock(!offlineLock)}
              isLight={isLight}
            />
          </div>
        </SecureDroidCard>

        {/* 3. SIM Change Detection */}
        <SecureDroidCard isLight={isLight} className="p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Radio className="w-5 h-5 text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-sm">SIM Ejection / Replacement Lock</h4>
                <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  Triggers immediate Lockdown mode if the physical SIM card is removed or ICCID changes.
                </p>
              </div>
            </div>
            <SecureDroidSwitch
              checked={simChangeLock}
              onChange={() => setSimChangeLock(!simChangeLock)}
              isLight={isLight}
            />
          </div>
        </SecureDroidCard>

        {/* 4. Remote Lock & Wipe Architecture */}
        <SecureDroidSectionHeader title="Remote Management Architecture" isLight={isLight} />

        <SecureDroidCard isLight={isLight} className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-sm">E2EE Remote Lock & Wipe Portal</h4>
                <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  Allows sending end-to-end encrypted push commands from your authenticated secondary workstation.
                </p>
              </div>
            </div>
            <SecureDroidSwitch
              checked={remoteLockEnabled}
              onChange={() => setRemoteLockEnabled(!remoteLockEnabled)}
              isLight={isLight}
            />
          </div>

          <div className={`p-2.5 rounded-xl text-[11px] font-mono ${
            isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-900 text-zinc-400'
          }`}>
            <strong>HONESTY POLICY:</strong> Zero third-party telemetry. Remote commands are signed with your offline private key and validated by SecureDroid OS KeyMint before execution.
          </div>
        </SecureDroidCard>
      </div>
    </div>
  );
};
