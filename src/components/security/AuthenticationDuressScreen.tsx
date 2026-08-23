import React, { useState } from 'react';
import {
  Key,
  Fingerprint,
  Lock,
  ShieldAlert,
  AlertTriangle,
  Info,
  Clock,
  CheckCircle2,
  RefreshCw,
  EyeOff,
  Sparkles,
  Check,
  X
} from 'lucide-react';
import {
  SecureDroidTopBar,
  SecureDroidCard,
  SecureDroidStatusChip,
  SecureDroidSectionHeader,
  SecureDroidButton,
  SecureDroidSwitch
} from '../ui/designSystem';
import { SecureDroidNative } from '../../services/native/SecureDroidNative';

interface AuthenticationDuressScreenProps {
  onBack: () => void;
  isLight?: boolean;
}

export const AuthenticationDuressScreen: React.FC<AuthenticationDuressScreenProps> = ({
  onBack,
  isLight = false,
}) => {
  const [pinLength, setPinLength] = useState<number>(8);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState<boolean>(true);
  const [isDuressPinConfigured, setIsDuressPinConfigured] = useState<boolean>(true);
  const [duressAction, setDuressAction] = useState<'DECOY_PROFILE' | 'PURGE_KEYS' | 'SILENT_LOCKDOWN'>('DECOY_PROFILE');
  const [isTwoFactorUnlockEnabled, setIsTwoFactorUnlockEnabled] = useState<boolean>(false);
  const [failedAttemptsLockout, setFailedAttemptsLockout] = useState<number>(5);
  const [biometricStatus, setBiometricStatus] = useState<string | null>(null);
  const [isTestingBiometric, setIsTestingBiometric] = useState(false);

  const handleTestBiometric = async () => {
    setIsTestingBiometric(true);
    setBiometricStatus(null);
    try {
      const res = await SecureDroidNative.authenticateBiometric({
        title: 'SecureDroid Biometric Verification',
        subtitle: 'Hardware KeyMint Authentication',
        description: 'Verify your biometric credential to test hardware sensor integration.',
      });
      if (res.success && res.data?.authenticated) {
        setBiometricStatus('SUCCESS');
      } else {
        setBiometricStatus(res.message || 'Authentication not completed');
      }
    } catch (e: any) {
      setBiometricStatus(e.message || 'Authentication failed');
    } finally {
      setIsTestingBiometric(false);
    }
  };

  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar
        title="Authentication & Duress"
        subtitle="Hardware KeyMint Gates, Biometrics & Duress PIN"
        onBack={onBack}
        isLight={isLight}
      />

      <div className="pt-4 space-y-4">
        {/* 1. Primary Screen Lock Security */}
        <SecureDroidSectionHeader title="Master Device Credentials" isLight={isLight} />

        <SecureDroidCard isLight={isLight} className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Alphanumeric High-Entropy PIN / Passphrase</h4>
                <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  Protected by Qualcomm QSEE KeyMint hardware replay-protected memory block (RPMB) rate limiting.
                </p>
              </div>
            </div>
            <SecureDroidStatusChip status="SECURE" label="HARDWARE TEE" isLight={isLight} />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/20 text-xs font-mono">
            <div>
              <span className="text-zinc-500 block text-[10px]">Min Length</span>
              <span>8 Characters</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">Throttling Policy</span>
              <span>Exponential Backoff (5 attempts)</span>
            </div>
          </div>
        </SecureDroidCard>

        {/* 2. Biometric Authentication */}
        <SecureDroidSectionHeader title="Biometrics & Hardware Keys" isLight={isLight} />

        <SecureDroidCard isLight={isLight} className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Fingerprint className="w-5 h-5 text-zinc-400 shrink-0" />
              <div>
                <h4 className="font-medium text-sm">TEE-Backed Fingerprint Unlock</h4>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  Class 3 (Strong) hardware biometric sensor in Secure World.
                </p>
              </div>
            </div>
            <SecureDroidSwitch
              checked={isBiometricsEnabled}
              onChange={() => setIsBiometricsEnabled(!isBiometricsEnabled)}
              isLight={isLight}
            />
          </div>

          {/* Real Biometric Hardware Verification Button */}
          <div className="pt-2 border-t border-zinc-800/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold block text-slate-200">Hardware BiometricPrompt API</span>
              <span className="text-[11px] text-slate-400 block">Invokes real Android KeyStore BiometricPrompt</span>
            </div>
            <button
              onClick={handleTestBiometric}
              disabled={isTestingBiometric}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-mono font-semibold flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <Fingerprint className="w-3.5 h-3.5" />
              {isTestingBiometric ? 'Verifying...' : 'Test Biometric Prompt'}
            </button>
          </div>

          {biometricStatus && (
            <div className={`p-2.5 rounded-xl text-xs font-mono flex items-center gap-2 ${
              biometricStatus === 'SUCCESS'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
            }`}>
              {biometricStatus === 'SUCCESS' ? <Check className="w-4 h-4" /> : <Info className="w-4 h-4" />}
              <span>{biometricStatus === 'SUCCESS' ? 'Biometric authentication succeeded through Android BiometricPrompt.' : biometricStatus}</span>
            </div>
          )}

          {/* 2-Factor Unlock (Fingerprint + PIN) */}
          <div className="pt-3 border-t border-zinc-800/20 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm">2-Factor Device Unlock</h4>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  isLight ? 'bg-zinc-200 text-zinc-800' : 'bg-zinc-800 text-amber-300'
                }`}>
                  Future SecureDroid OS capability
                </span>
              </div>
              <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                Requires BOTH successful fingerprint scan AND alphanumeric password for every screen unlock.
              </p>
            </div>
            <SecureDroidSwitch
              checked={isTwoFactorUnlockEnabled}
              onChange={() => setIsTwoFactorUnlockEnabled(!isTwoFactorUnlockEnabled)}
              isLight={isLight}
            />
          </div>
        </SecureDroidCard>

        {/* 3. Duress Credentials Architecture */}
        <SecureDroidSectionHeader title="Duress Credentials (Anti-Coercion)" isLight={isLight} />

        <SecureDroidCard isLight={isLight} highlight className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Emergency Duress PIN</h4>
                <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  Entering your separate Duress PIN unlocks the device in a deceptive or defensive mode during physical coercion.
                </p>
              </div>
            </div>
            <SecureDroidSwitch
              checked={isDuressPinConfigured}
              onChange={() => setIsDuressPinConfigured(!isDuressPinConfigured)}
              isLight={isLight}
            />
          </div>

          {isDuressPinConfigured && (
            <div className="pt-2 space-y-3">
              <div>
                <label className={`text-[11px] font-medium block mb-1.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  Duress Trigger Action
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'DECOY_PROFILE', title: 'Decoy Safe Profile', desc: 'Opens benign stock OS appearance' },
                    { id: 'SILENT_LOCKDOWN', title: 'Silent Lockdown', desc: 'Disables all biometrics & locks CE keys' },
                    { id: 'PURGE_KEYS', title: 'Purge Vault Keys', desc: 'Wipes Secure Environment keys from RAM' },
                  ].map((act) => (
                    <button
                      key={act.id}
                      onClick={() => setDuressAction(act.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        duressAction === act.id
                          ? isLight
                            ? 'bg-zinc-900 text-white border-zinc-900'
                            : 'bg-zinc-100 text-zinc-900 border-zinc-100'
                          : isLight
                          ? 'bg-zinc-100 border-zinc-200 text-zinc-700'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                      }`}
                    >
                      <span className="text-xs font-semibold block">{act.title}</span>
                      <span className={`text-[10px] mt-0.5 block ${
                        duressAction === act.id
                          ? isLight ? 'text-zinc-300' : 'text-zinc-700'
                          : 'text-zinc-500'
                      }`}>
                        {act.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={`p-2.5 rounded-xl text-[11px] font-mono ${
                isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-900 text-zinc-400'
              }`}>
                <span className="text-amber-400 font-semibold">HONESTY NOTICE:</span> Duress actions require deep SecureDroid OS LockSettingsService integration. Normal APK prototype demonstrates the flow without triggering destructive system operations.
              </div>
            </div>
          )}
        </SecureDroidCard>
      </div>
    </div>
  );
};
