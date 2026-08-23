import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  HardDrive,
  Cpu,
  Smartphone,
  RefreshCw,
  Info,
  Radio,
  Zap,
  Power
} from 'lucide-react';
import {
  SecureDroidTopBar,
  SecureDroidCard,
  SecureDroidStatusChip,
  SecureDroidSectionHeader,
  SecureDroidButton
} from '../ui/designSystem';
import {
  DeviceSecurityStateType,
  SystemLayer
} from '../../types/securedroid';
import { DEVICE_SECURITY_STATE_DATA } from '../../data/featurePackData';

interface DeviceSecurityStateScreenProps {
  onBack: () => void;
  onTriggerReboot?: () => void;
  onTriggerLockdown?: () => void;
  isLight?: boolean;
}

export const DeviceSecurityStateScreen: React.FC<DeviceSecurityStateScreenProps> = ({
  onBack,
  onTriggerReboot,
  onTriggerLockdown,
  isLight = false,
}) => {
  const [activeState, setActiveState] = useState<DeviceSecurityStateType>('AFTER_FIRST_UNLOCK');

  const states: DeviceSecurityStateType[] = [
    'BEFORE_FIRST_UNLOCK',
    'AFTER_FIRST_UNLOCK',
    'LOCKED',
    'UNLOCKED',
    'LOCKDOWN',
    'REBOOT_PENDING',
  ];

  const stateDetails = DEVICE_SECURITY_STATE_DATA[activeState];

  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar
        title="Device Security State"
        subtitle="Before-First-Unlock (BFU) vs After-First-Unlock (AFU)"
        onBack={onBack}
        isLight={isLight}
      />

      <div className="pt-4 space-y-4">
        {/* State Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {states.map((st) => {
            const isSelected = activeState === st;
            const isBfu = st === 'BEFORE_FIRST_UNLOCK';
            return (
              <button
                key={st}
                onClick={() => setActiveState(st)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? isLight
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                      : 'bg-zinc-100 text-zinc-900 border-zinc-100 shadow-sm'
                    : isLight
                    ? 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-800'
                    : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-semibold">
                    {st === 'BEFORE_FIRST_UNLOCK' && 'BFU State'}
                    {st === 'AFTER_FIRST_UNLOCK' && 'AFU State'}
                    {st === 'LOCKED' && 'Screen Locked'}
                    {st === 'UNLOCKED' && 'Active Session'}
                    {st === 'LOCKDOWN' && 'Lockdown'}
                    {st === 'REBOOT_PENDING' && 'Auto-Reboot'}
                  </span>
                  {isBfu && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                      MAX
                    </span>
                  )}
                </div>
                <p className={`text-[10px] mt-1 line-clamp-1 ${
                  isSelected
                    ? isLight ? 'text-zinc-300' : 'text-zinc-700'
                    : isLight ? 'text-zinc-500' : 'text-zinc-400'
                }`}>
                  {st === 'BEFORE_FIRST_UNLOCK' && 'Keys sealed in TEE'}
                  {st === 'AFTER_FIRST_UNLOCK' && 'CE keys in RAM'}
                  {st === 'LOCKED' && 'Auth tokens paused'}
                  {st === 'UNLOCKED' && 'Full user session'}
                  {st === 'LOCKDOWN' && 'Biometrics revoked'}
                  {st === 'REBOOT_PENDING' && 'Memory zeroing'}
                </p>
              </button>
            );
          })}
        </div>

        {/* 1. Hero State Explanation Card */}
        <SecureDroidCard isLight={isLight} highlight className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <span className={`text-[10px] font-medium uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Active State Inspection
              </span>
              <h3 className="font-semibold text-base mt-0.5">{stateDetails.title}</h3>
            </div>
            <SecureDroidStatusChip
              status={stateDetails.keysInRam ? 'DEGRADED' : 'SECURE'}
              label={stateDetails.keysInRam ? 'KEYS IN RAM' : 'KEYS SEALED (TEE)'}
              isLight={isLight}
            />
          </div>

          <p className={`text-xs mt-3 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
            {stateDetails.description}
          </p>

          {/* Quick Subsystem Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-zinc-800/20 mt-4 text-xs font-mono">
            <div className={`p-2 rounded-xl ${isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-900 text-zinc-300'}`}>
              <span className="text-[10px] text-zinc-500 block font-sans">Storage Decryption</span>
              <span className="font-medium">{stateDetails.keysInRam ? 'CE Decrypted' : 'DE Only'}</span>
            </div>
            <div className={`p-2 rounded-xl ${isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-900 text-zinc-300'}`}>
              <span className="text-[10px] text-zinc-500 block font-sans">Biometrics</span>
              <span className="font-medium">{stateDetails.biometricsAllowed ? 'Permitted' : 'Blocked'}</span>
            </div>
            <div className={`p-2 rounded-xl ${isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-900 text-zinc-300'}`}>
              <span className="text-[10px] text-zinc-500 block font-sans">USB Data Pins</span>
              <span className="font-medium">{stateDetails.usbState}</span>
            </div>
            <div className={`p-2 rounded-xl ${isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-900 text-zinc-300'}`}>
              <span className="text-[10px] text-zinc-500 block font-sans">Secure VM</span>
              <span className="font-medium">{stateDetails.vmState}</span>
            </div>
          </div>
        </SecureDroidCard>

        {/* 2. Cryptographic Memory Breakdown */}
        <SecureDroidSectionHeader title="Cryptographic Architecture" isLight={isLight} />

        <div className="space-y-3">
          <SecureDroidCard isLight={isLight} className="p-4">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Credential Encrypted (CE) vs Device Encrypted (DE)</h4>
                <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  {stateDetails.encryptionState}
                </p>
                <div className={`mt-2 p-2 rounded-lg text-[11px] font-mono ${
                  isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-900 text-zinc-400'
                }`}>
                  <strong>fscrypt policy:</strong> AES-256-XTS payload encryption + AES-256-CTS filename encryption tied to Qualcomm QSEE TrustZone RPMB key.
                </div>
              </div>
            </div>
          </SecureDroidCard>

          {stateDetails.properties.map((prop, idx) => (
            <SecureDroidCard key={idx} isLight={isLight} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{prop.propertyName}</h4>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {prop.layer}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    {prop.description}
                  </p>
                  <p className={`text-[11px] font-mono mt-2 text-zinc-500`}>
                    Mechanism: {prop.technicalMechanism}
                  </p>
                </div>
                <SecureDroidStatusChip
                  status={prop.status === 'ACTIVE' ? 'SECURE' : prop.status === 'LOCKED' ? 'ISOLATED' : 'DEGRADED'}
                  label={prop.status}
                  isLight={isLight}
                />
              </div>
            </SecureDroidCard>
          ))}
        </div>
      </div>
    </div>
  );
};
