import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Cpu,
  Globe,
  HardDrive,
  FileCheck,
  ChevronRight,
  Eye,
  Terminal,
  Key,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import {
  SecureDroidTopBar,
  SecureDroidCard,
  SecureDroidStatusChip,
  SecureDroidSectionHeader,
  SecureDroidButton
} from './ui/designSystem';
import {
  DeviceProfile,
  HostSecurityStatus,
  QualitativeSecurityTier,
  SystemScreen
} from '../types/securedroid';

interface SecurityCenterScreenProps {
  onBack?: () => void;
  onNavigate: (screen: SystemScreen) => void;
  hostStatus: HostSecurityStatus;
  qualitativeTier: QualitativeSecurityTier;
  profile: DeviceProfile;
  isLight?: boolean;
}

export const SecurityCenterScreen: React.FC<SecurityCenterScreenProps> = ({
  onBack,
  onNavigate,
  hostStatus,
  qualitativeTier,
  profile,
  isLight = false,
}) => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const getTierDetails = (tier: QualitativeSecurityTier) => {
    switch (tier) {
      case 'PROTECTED':
        return {
          title: 'Protected (Hardware Root of Trust)',
          desc: 'Verified Boot AVB 2.0 locked, KeyMint TEE hardware-backed encryption, and SELinux Enforcing.',
          chip: 'PROTECTED',
          chipVariant: 'SECURE' as const,
        };
      case 'HARDWARE-BACKED':
        return {
          title: 'Protected (TEE-Backed)',
          desc: 'Secure World TrustZone active. Bootloader verified and anti-rollback counters current.',
          chip: 'PROTECTED',
          chipVariant: 'SECURE' as const,
        };
      case 'ISOLATED':
        return {
          title: 'Isolated (Virtualization Ready)',
          desc: 'Kernel hypervisor isolation available for guest workloads with hardware sandboxing.',
          chip: 'ISOLATED',
          chipVariant: 'SECURE' as const,
        };
      case 'HARDENED':
        return {
          title: 'Hardened (Software Enforced)',
          desc: 'System software isolation intact, but hardware StrongBox or pKVM is unverified.',
          chip: 'ATTENTION',
          chipVariant: 'DEGRADED' as const,
        };
      case 'STANDARD':
      default:
        return {
          title: 'Security Status Degraded',
          desc: 'Bootloader unlocked or custom kernel detected. Integrity checks failed.',
          chip: 'DEGRADED',
          chipVariant: 'UNAVAILABLE' as const,
        };
    }
  };

  const currentTierInfo = getTierDetails(qualitativeTier);

  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar
        title="Security Center"
        subtitle="Hardware-Backed Fail-Closed Protection"
        onBack={onBack}
        isLight={isLight}
      />

      {/* 1. Qualitative Protection Status Hero Card */}
      <div className="pt-4 pb-2">
        <SecureDroidCard isLight={isLight} highlight className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-800 text-zinc-200'
              }`}>
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className={`text-[10px] font-medium uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Overall System State
                </span>
                <h3 className="font-medium text-base">{currentTierInfo.title}</h3>
              </div>
            </div>
            <SecureDroidStatusChip
              status={currentTierInfo.chipVariant}
              label={currentTierInfo.chip}
              isLight={isLight}
            />
          </div>

          <p className={`text-xs mt-3 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
            {currentTierInfo.desc}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-zinc-800/20 mt-4 text-xs font-mono">
            <div className={`flex items-center gap-1.5 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
              <span>AVB 2.0 Locked</span>
            </div>
            <div className={`flex items-center gap-1.5 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
              <span>KeyMint TEE</span>
            </div>
            <div className={`flex items-center gap-1.5 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
              <span>SELinux Strict</span>
            </div>
            <div className={`flex items-center gap-1.5 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
              <span>FBE Encrypted</span>
            </div>
          </div>
        </SecureDroidCard>
      </div>

      {/* 2. Core Security Subsystems */}
      <SecureDroidSectionHeader title="Core Security Systems" isLight={isLight} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Advanced Protection (Point 1) */}
        <SecureDroidCard
          isLight={isLight}
          className="p-4 flex flex-col justify-between cursor-pointer hover:border-zinc-500 transition-colors"
          onClick={() => onNavigate('advanced_protection')}
        >
          <div>
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-zinc-400" />
                <h4 className="font-medium text-sm">Advanced Protection</h4>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
              }`}>
                MASTER MODE
              </span>
            </div>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Standard, Enhanced, and Maximum Protection master policies with fail-closed kernel hardening.
            </p>
          </div>
          <div className={`pt-3 border-t border-zinc-800/20 mt-3 flex justify-between items-center text-xs ${
            isLight ? 'text-zinc-800' : 'text-zinc-200'
          }`}>
            <span className="font-medium">Configure Hardening Policies</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </SecureDroidCard>

        {/* Exploit Protection & Auto Reboot (Points 2 & 3) */}
        <SecureDroidCard
          isLight={isLight}
          className="p-4 flex flex-col justify-between cursor-pointer hover:border-zinc-500 transition-colors"
          onClick={() => onNavigate('exploit_protection')}
        >
          <div>
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-zinc-400" />
                <h4 className="font-medium text-sm">Exploit Protection & Auto Reboot</h4>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
              }`}>
                MTE / CFI / BFU
              </span>
            </div>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Memory safety, PAC/BTI hardware mitigations, and inactivity BFU watchdog auto-reboot.
            </p>
          </div>
          <div className={`pt-3 border-t border-zinc-800/20 mt-3 flex justify-between items-center text-xs ${
            isLight ? 'text-zinc-800' : 'text-zinc-200'
          }`}>
            <span className="font-medium">Manage Exploit Mitigations</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </SecureDroidCard>

        {/* Device Security State BFU vs AFU (Point 4) */}
        <SecureDroidCard
          isLight={isLight}
          className="p-4 flex flex-col justify-between cursor-pointer hover:border-zinc-500 transition-colors"
          onClick={() => onNavigate('device_security_state')}
        >
          <div>
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-zinc-400" />
                <h4 className="font-medium text-sm">Device Security State</h4>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
              }`}>
                BFU vs AFU
              </span>
            </div>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Inspect CE/DE storage keys in RAM, USB states, biometrics lockdown, and VM isolation.
            </p>
          </div>
          <div className={`pt-3 border-t border-zinc-800/20 mt-3 flex justify-between items-center text-xs ${
            isLight ? 'text-zinc-800' : 'text-zinc-200'
          }`}>
            <span className="font-medium">View Cryptographic State</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </SecureDroidCard>

        {/* Authentication & Duress PIN (Point 5) */}
        <SecureDroidCard
          isLight={isLight}
          className="p-4 flex flex-col justify-between cursor-pointer hover:border-zinc-500 transition-colors"
          onClick={() => onNavigate('authentication_duress')}
        >
          <div>
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-zinc-400" />
                <h4 className="font-medium text-sm">Authentication & Duress PIN</h4>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
              }`}>
                ANTI-COERCION
              </span>
            </div>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              KeyMint throttling, 2-factor device unlock, and covert anti-coercion duress triggers.
            </p>
          </div>
          <div className={`pt-3 border-t border-zinc-800/20 mt-3 flex justify-between items-center text-xs ${
            isLight ? 'text-zinc-800' : 'text-zinc-200'
          }`}>
            <span className="font-medium">Configure Auth & Duress</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </SecureDroidCard>

        {/* Emergency Protection & Key Eviction (Point 6) */}
        <SecureDroidCard
          isLight={isLight}
          className="p-4 flex flex-col justify-between cursor-pointer hover:border-zinc-500 transition-colors"
          onClick={() => onNavigate('emergency_protection')}
        >
          <div>
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h4 className="font-medium text-sm">Emergency Protection</h4>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold`}>
                KEY PURGE
              </span>
            </div>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Instant lockdown, VM termination, and cryptographic key shredding workflows.
            </p>
          </div>
          <div className={`pt-3 border-t border-zinc-800/20 mt-3 flex justify-between items-center text-xs ${
            isLight ? 'text-zinc-800' : 'text-zinc-200'
          }`}>
            <span className="font-medium">Emergency Action Center</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </SecureDroidCard>

        {/* Theft Protection (Point 7) */}
        <SecureDroidCard
          isLight={isLight}
          className="p-4 flex flex-col justify-between cursor-pointer hover:border-zinc-500 transition-colors"
          onClick={() => onNavigate('theft_protection')}
        >
          <div>
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-zinc-400" />
                <h4 className="font-medium text-sm">Theft Protection</h4>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
              }`}>
                HAL SENSORS
              </span>
            </div>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Motion snatch lock, offline auto-lock, SIM ejection lock, and authenticated remote commands.
            </p>
          </div>
          <div className={`pt-3 border-t border-zinc-800/20 mt-3 flex justify-between items-center text-xs ${
            isLight ? 'text-zinc-800' : 'text-zinc-200'
          }`}>
            <span className="font-medium">Manage Anti-Theft Guard</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </SecureDroidCard>

        {/* Application Verification & Signing Blocks (Point 8) */}
        <SecureDroidCard
          isLight={isLight}
          className="p-4 flex flex-col justify-between cursor-pointer hover:border-zinc-500 transition-colors"
          onClick={() => onNavigate('app_verification')}
        >
          <div>
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-zinc-400" />
                <h4 className="font-medium text-sm">App Verification & Signatures</h4>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
              }`}>
                SHA-256 / SDK
              </span>
            </div>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Deep APK certificate audit, target SDK baseline inspection, and pre-install verification.
            </p>
          </div>
          <div className={`pt-3 border-t border-zinc-800/20 mt-3 flex justify-between items-center text-xs ${
            isLight ? 'text-zinc-800' : 'text-zinc-200'
          }`}>
            <span className="font-medium">Inspect Installed Signatures</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </SecureDroidCard>

        {/* SecureDroid Store (Point 9) */}
        <SecureDroidCard
          isLight={isLight}
          className="p-4 flex flex-col justify-between cursor-pointer hover:border-zinc-500 transition-colors"
          onClick={() => onNavigate('securedroid_store')}
        >
          <div>
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-zinc-400" />
                <h4 className="font-medium text-sm">SecureDroid Store</h4>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
              }`}>
                REPRODUCIBLE
              </span>
            </div>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Curated signed repository with verified reproducible builds and Sandboxed Google Play support.
            </p>
          </div>
          <div className={`pt-3 border-t border-zinc-800/20 mt-3 flex justify-between items-center text-xs ${
            isLight ? 'text-zinc-800' : 'text-zinc-200'
          }`}>
            <span className="font-medium">Browse Verified Packages</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </SecureDroidCard>

        {/* Browser & WebView Security (Point 10) */}
        <SecureDroidCard
          isLight={isLight}
          className="p-4 flex flex-col justify-between cursor-pointer hover:border-zinc-500 transition-colors"
          onClick={() => onNavigate('browser_web_security')}
        >
          <div>
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-zinc-400" />
                <h4 className="font-medium text-sm">Browser & WebView Security</h4>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
              }`}>
                CHROMIUM 128
              </span>
            </div>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Process isolation, HTTPS-only enforcement, ad/tracker blockers, and optional JIT elimination.
            </p>
          </div>
          <div className={`pt-3 border-t border-zinc-800/20 mt-3 flex justify-between items-center text-xs ${
            isLight ? 'text-zinc-800' : 'text-zinc-200'
          }`}>
            <span className="font-medium">Configure Web Hardening</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </SecureDroidCard>

        {/* Complete Sensor Privacy (Point 11) */}
        <SecureDroidCard
          isLight={isLight}
          className="p-4 flex flex-col justify-between cursor-pointer hover:border-zinc-500 transition-colors"
          onClick={() => onNavigate('complete_sensor_privacy')}
        >
          <div>
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-zinc-400" />
                <h4 className="font-medium text-sm">Complete Sensor Privacy</h4>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
              }`}>
                12 SENSORS
              </span>
            </div>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Hardware killswitches for Camera, Mic, Gyro, BLE scan & live access audit stream.
            </p>
          </div>
          <div className={`pt-3 border-t border-zinc-800/20 mt-3 flex justify-between items-center text-xs ${
            isLight ? 'text-zinc-800' : 'text-zinc-200'
          }`}>
            <span className="font-medium">Manage Hardware Sensors</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </SecureDroidCard>

        {/* Certificate Trust Store & Passkeys (Points 13 & 14) */}
        <SecureDroidCard
          isLight={isLight}
          className="p-4 flex flex-col justify-between cursor-pointer hover:border-zinc-500 transition-colors"
          onClick={() => onNavigate('certificates_passkeys')}
        >
          <div>
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-zinc-400" />
                <h4 className="font-medium text-sm">Trust Store & Passkeys</h4>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
              }`}>
                FIDO2 / CA
              </span>
            </div>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Root CA store audit with user certificate alerts and KeyMint hardware-backed WebAuthn passkeys.
            </p>
          </div>
          <div className={`pt-3 border-t border-zinc-800/20 mt-3 flex justify-between items-center text-xs ${
            isLight ? 'text-zinc-800' : 'text-zinc-200'
          }`}>
            <span className="font-medium">Manage Certificates & Keys</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </SecureDroidCard>

        {/* Encrypted Backup & Restore (Point 15) */}
        <SecureDroidCard
          isLight={isLight}
          className="p-4 flex flex-col justify-between cursor-pointer hover:border-zinc-500 transition-colors"
          onClick={() => onNavigate('backup_restore')}
        >
          <div>
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-zinc-400" />
                <h4 className="font-medium text-sm">Encrypted Backup & Restore</h4>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
              }`}>
                AES-256-GCM
              </span>
            </div>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Hardware-wrapped encrypted archives to external USB with SHA-256 digest validation.
            </p>
          </div>
          <div className={`pt-3 border-t border-zinc-800/20 mt-3 flex justify-between items-center text-xs ${
            isLight ? 'text-zinc-800' : 'text-zinc-200'
          }`}>
            <span className="font-medium">Manage Encrypted Archives</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </SecureDroidCard>

        {/* Security Posture Profiles (Point 23) */}
        <SecureDroidCard
          isLight={isLight}
          className="p-4 flex flex-col justify-between cursor-pointer hover:border-zinc-500 transition-colors"
          onClick={() => onNavigate('security_posture_profiles')}
        >
          <div>
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-zinc-400" />
                <h4 className="font-medium text-sm">Security Posture Profiles</h4>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
              }`}>
                PRESETS
              </span>
            </div>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Standard, Daily Private, High Risk, Border Crossing, and Isolated Airgap one-tap profiles.
            </p>
          </div>
          <div className={`pt-3 border-t border-zinc-800/20 mt-3 flex justify-between items-center text-xs ${
            isLight ? 'text-zinc-800' : 'text-zinc-200'
          }`}>
            <span className="font-medium">Switch Security Profile</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </SecureDroidCard>

        {/* Developer & Debug Security (Point 18) */}
        <SecureDroidCard
          isLight={isLight}
          className="p-4 flex flex-col justify-between cursor-pointer hover:border-zinc-500 transition-colors"
          onClick={() => onNavigate('developer_debug_security')}
        >
          <div>
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-zinc-400" />
                <h4 className="font-medium text-sm">Developer & Debug Security</h4>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
              }`}>
                ADB / OEM
              </span>
            </div>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              USB debugging timeouts, OEM unlock enforcement, and developer socket protections.
            </p>
          </div>
          <div className={`pt-3 border-t border-zinc-800/20 mt-3 flex justify-between items-center text-xs ${
            isLight ? 'text-zinc-800' : 'text-zinc-200'
          }`}>
            <span className="font-medium">Manage Debug Interfaces</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </SecureDroidCard>

        {/* Threat Model Center (Point 30) */}
        <SecureDroidCard
          isLight={isLight}
          className="p-4 flex flex-col justify-between cursor-pointer hover:border-zinc-500 transition-colors"
          onClick={() => onNavigate('threat_model_center')}
        >
          <div>
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-zinc-400" />
                <h4 className="font-medium text-sm">Threat Model Center</h4>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
              }`}>
                12 SCENARIOS
              </span>
            </div>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Evaluation against physical extraction, zero-days, baseband attacks, and forensic imaging.
            </p>
          </div>
          <div className={`pt-3 border-t border-zinc-800/20 mt-3 flex justify-between items-center text-xs ${
            isLight ? 'text-zinc-800' : 'text-zinc-200'
          }`}>
            <span className="font-medium">Explore Adversary Models</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </SecureDroidCard>

        {/* Security Audit Log (Point 29) */}
        <SecureDroidCard
          isLight={isLight}
          className="p-4 flex flex-col justify-between cursor-pointer hover:border-zinc-500 transition-colors"
          onClick={() => onNavigate('security_audit_log')}
        >
          <div>
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-zinc-400" />
                <h4 className="font-medium text-sm">Security Audit Log</h4>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
              }`}>
                TIMELINE
              </span>
            </div>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Cryptographic event stream with severity classifications and source attribution tags.
            </p>
          </div>
          <div className={`pt-3 border-t border-zinc-800/20 mt-3 flex justify-between items-center text-xs ${
            isLight ? 'text-zinc-800' : 'text-zinc-200'
          }`}>
            <span className="font-medium">Open Security Timeline</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </SecureDroidCard>
      </div>

      {/* 3. Level 3 Diagnostic Drill-down Banner */}
      <SecureDroidCard isLight={isLight} className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="w-4 h-4 text-zinc-400" />
            <div>
              <h4 className="font-medium text-xs">Technical Evidence & Hardware Probes</h4>
              <p className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Inspect raw sysfs node statuses, SELinux policy tables, and KeyMint attestations
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('advanced_diagnostics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              isLight
                ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
            }`}
          >
            Diagnostics &rarr;
          </button>
        </div>
      </SecureDroidCard>
    </div>
  );
};
