import React, { useState } from 'react';
import {
  Code,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Lock,
  Terminal,
  Cpu,
  RefreshCw,
  Zap,
  Sliders,
  SlidersHorizontal,
  FileCheck,
  Smartphone
} from 'lucide-react';
import {
  SecureDroidTopBar,
  SecureDroidCard,
  SecureDroidStatusChip,
  SecureDroidSectionHeader,
  SecureDroidButton,
  SecureDroidSwitch
} from '../ui/designSystem';
import { SecurityPostureProfile } from '../../types/securedroid';
import { SECURITY_POSTURE_PROFILES } from '../../data/featurePackData';

// 1. Developer & Debug Security Screen
export const DeveloperDebugSecurityScreen: React.FC<{ onBack: () => void; isLight?: boolean }> = ({
  onBack,
  isLight = false,
}) => {
  const [usbDebugging, setUsbDebugging] = useState<boolean>(false);
  const [wirelessAdb, setWirelessAdb] = useState<boolean>(false);
  const [oemUnlocking, setOemUnlocking] = useState<boolean>(false);

  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar
        title="Developer & Debug Security"
        subtitle="ADB Authorization, OEM Lock & Interface Lockdown"
        onBack={onBack}
        isLight={isLight}
      />

      <div className="pt-4 space-y-4">
        <SecureDroidCard isLight={isLight} highlight className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-800 text-zinc-200'
            }`}>
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Hardened Debug Gateways</h3>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Prevents unauthorized physical shell execution and privileged socket exposure
              </p>
            </div>
          </div>
        </SecureDroidCard>

        <SecureDroidSectionHeader title="Interface Controls" isLight={isLight} />

        <div className="space-y-3">
          <SecureDroidCard isLight={isLight} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-sm">USB Debugging (ADB)</h4>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  Requires RSA-4096 host key authentication. Automatically revokes authorizations after 7 days.
                </p>
              </div>
              <SecureDroidSwitch checked={usbDebugging} onChange={() => setUsbDebugging(!usbDebugging)} isLight={isLight} />
            </div>
          </SecureDroidCard>

          <SecureDroidCard isLight={isLight} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-sm">Wireless ADB Network Debugging</h4>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  Opens TLS-secured ADB daemon over local Wi-Fi. Disabled by default in SecureDroid.
                </p>
              </div>
              <SecureDroidSwitch checked={wirelessAdb} onChange={() => setWirelessAdb(!wirelessAdb)} isLight={isLight} />
            </div>
          </SecureDroidCard>

          <SecureDroidCard isLight={isLight} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-sm">OEM Bootloader Unlocking</h4>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  Allows flashing custom boot images. Disabling prevents unauthorized recovery flashing.
                </p>
              </div>
              <SecureDroidSwitch checked={oemUnlocking} onChange={() => setOemUnlocking(!oemUnlocking)} isLight={isLight} />
            </div>
          </SecureDroidCard>
        </div>
      </div>
    </div>
  );
};

// 2. Security Posture Profiles Screen
export const SecurityPostureProfilesScreen: React.FC<{ onBack: () => void; isLight?: boolean }> = ({
  onBack,
  isLight = false,
}) => {
  const [profiles, setProfiles] = useState<SecurityPostureProfile[]>(SECURITY_POSTURE_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState<string>('ENHANCED');

  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar
        title="Security Posture Profiles"
        subtitle="One-Tap Threat Tier Presets"
        onBack={onBack}
        isLight={isLight}
      />

      <div className="pt-4 space-y-4">
        <SecureDroidSectionHeader title="Operational Security Profiles" isLight={isLight} />

        <div className="space-y-3">
          {profiles.map((prof) => {
            const isActive = activeProfileId === prof.id;
            return (
              <SecureDroidCard
                key={prof.id}
                isLight={isLight}
                highlight={isActive}
                className="p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{prof.name}</h4>
                      {isActive && (
                        <SecureDroidStatusChip status="SECURE" label="CURRENT ACTIVE" isLight={isLight} />
                      )}
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                      {prof.description}
                    </p>
                  </div>

                  <SecureDroidButton
                    variant={isActive ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setActiveProfileId(prof.id)}
                    isLight={isLight}
                    className="shrink-0"
                  >
                    {isActive ? 'Applied' : 'Apply'}
                  </SecureDroidButton>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-800/20 text-[11px] font-mono">
                  <div className={`p-2 rounded-lg ${isLight ? 'bg-zinc-100' : 'bg-zinc-900 text-zinc-300'}`}>
                    <span className="text-zinc-500 block font-sans text-[10px]">Auto-Reboot</span>
                    <span>{prof.autoReboot}</span>
                  </div>
                  <div className={`p-2 rounded-lg ${isLight ? 'bg-zinc-100' : 'bg-zinc-900 text-zinc-300'}`}>
                    <span className="text-zinc-500 block font-sans text-[10px]">Sensors</span>
                    <span>{prof.sensors}</span>
                  </div>
                  <div className={`p-2 rounded-lg ${isLight ? 'bg-zinc-100' : 'bg-zinc-900 text-zinc-300'}`}>
                    <span className="text-zinc-500 block font-sans text-[10px]">USB Policy</span>
                    <span>{prof.usb}</span>
                  </div>
                  <div className={`p-2 rounded-lg ${isLight ? 'bg-zinc-100' : 'bg-zinc-900 text-zinc-300'}`}>
                    <span className="text-zinc-500 block font-sans text-[10px]">Exploit Defenses</span>
                    <span>{prof.exploitMitigations}</span>
                  </div>
                </div>
              </SecureDroidCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};
