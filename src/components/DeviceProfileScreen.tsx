import React, { useEffect, useState } from 'react';
import { DeviceProfile, SecurityScoreFormula } from '../types/securedroid';
import { DEVICE_PROFILES } from '../data/deviceProfiles';
import { SecureDroidNative } from '../services/native/SecureDroidNative';
import type { NativeDeviceInfo } from '../types/native';
import {
  Smartphone,
  Cpu,
  HardDrive,
  Shield,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  RefreshCw,
} from 'lucide-react';

interface DeviceProfileScreenProps {
  currentProfile: DeviceProfile;
  setProfile: (profile: DeviceProfile) => void;
  securityScore: SecurityScoreFormula;
}

export function DeviceProfileScreen({
  currentProfile,
  setProfile,
  securityScore,
}: DeviceProfileScreenProps) {
  const [liveInfo, setLiveInfo] = useState<NativeDeviceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [runtimePlatform, setRuntimePlatform] = useState<string>('web_preview');

  const fetchLiveInfo = async () => {
    setIsLoading(true);
    try {
      const res = await SecureDroidNative.getDeviceInfo();
      if (res.success && res.data) {
        setLiveInfo(res.data);
        if (res.runtimePlatform) {
          setRuntimePlatform(res.runtimePlatform);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveInfo();
  }, []);

  return (
    <div id="device-profile-screen-container" className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-sky-400" />
              HARDWARE & ARCHITECTURE DIAGNOSTICS
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Device Profile</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                runtimePlatform === 'android_native'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-sky-500/10 border-sky-500/30 text-sky-400'
              }`}>
                {runtimePlatform === 'android_native' ? '● NATIVE ANDROID ENVIRONMENT' : '● WEB / SANDBOX RUNTIME'}
              </span>
              <span className="text-xs text-slate-400">
                {liveInfo ? `${liveInfo.manufacturer} ${liveInfo.model}` : currentProfile.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchLiveInfo}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 text-xs font-mono rounded-xl border border-slate-700 transition"
              title="Refresh live hardware state"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {/* Diagnostic Target Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">Target:</span>
              <select
                id="active-target-device-select"
                value={currentProfile.id}
                onChange={(e) => {
                  const target = DEVICE_PROFILES.find((p) => p.id === e.target.value);
                  if (target) setProfile(target);
                }}
                className="bg-slate-950 text-slate-200 border border-slate-700 text-xs font-mono rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500"
              >
                {DEVICE_PROFILES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.isReferenceDevice ? '(Reference)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Current Device Hardware Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
          <span className="text-slate-500 font-mono text-[10px] uppercase">DEVICE IDENTITY</span>
          <div className="text-sm font-bold text-white">
            {liveInfo ? `${liveInfo.brand} • ${liveInfo.model}` : `${currentProfile.manufacturer} • ${currentProfile.model}`}
          </div>
          <p className="text-slate-400 text-[11px] font-mono">
            {liveInfo ? `Product: ${liveInfo.product}` : currentProfile.name}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
          <span className="text-slate-500 font-mono text-[10px] uppercase">SOC & CPU ARCHITECTURE</span>
          <div className="text-sm font-bold text-slate-200">
            {liveInfo ? `${liveInfo.cpuArchitecture} (${liveInfo.supportedAbis.join(', ')})` : currentProfile.chipset}
          </div>
          <p className="text-slate-400 text-[11px] font-mono">
            Uptime: {liveInfo ? `${Math.round(liveInfo.uptimeSeconds / 60)} min` : 'Active'}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
          <span className="text-slate-500 font-mono text-[10px] uppercase">OS & PATCH LEVEL</span>
          <div className="text-sm font-bold text-slate-200">
            {liveInfo ? `Android ${liveInfo.androidVersion} (API ${liveInfo.sdkVersion})` : currentProfile.androidVersion}
          </div>
          <p className="text-slate-400 text-[11px] font-mono truncate">
            {liveInfo ? `Patch: ${liveInfo.securityPatch}` : currentProfile.kernelVersion}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
          <span className="text-slate-500 font-mono text-[10px] uppercase">MEMORY (RAM)</span>
          <div className="text-sm font-bold text-slate-200">
            {liveInfo ? `${(liveInfo.totalRamMb / 1024).toFixed(1)} GB Total (${(liveInfo.availableRamMb / 1024).toFixed(1)} GB Free)` : `${currentProfile.totalRamGb} GB LPDDR4X / LPDDR5`}
          </div>
          <p className="text-slate-400 text-[11px]">Hardware-backed allocation floor</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
          <span className="text-slate-500 font-mono text-[10px] uppercase">HOST STORAGE HEADROOM</span>
          <div className="text-sm font-bold text-slate-200">
            {liveInfo
              ? `${(liveInfo.availableStorageBytes / (1024 ** 3)).toFixed(1)} GB Free / ${(liveInfo.totalStorageBytes / (1024 ** 3)).toFixed(1)} GB Total`
              : `${currentProfile.availableStorageGb.toFixed(1)} GB Free / ${currentProfile.totalStorageGb} GB Total`}
          </div>
          <p className="text-emerald-400 text-[11px]">
            Safety reserve: 20 GB enforced
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
          <span className="text-slate-500 font-mono text-[10px] uppercase">VIRTUALIZATION / HYPERVISOR</span>
          <div className="text-sm font-bold text-slate-200">
            {liveInfo?.kvmVirtualizationSupported ? 'Hardware /dev/kvm Ready' : 'User-Space pKVM Sandbox'}
          </div>
          <p className="text-slate-400 text-[11px]">
            {liveInfo?.kvmVirtualizationSupported ? 'Kernel hardware virtualization exposed' : 'Protected sandbox mode active'}
          </p>
        </div>
      </div>

      {/* Side-by-Side Comparison: Current Device vs Reference Device (Pixel 8) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              CAPABILITY BENCHMARK
            </div>
            <h3 className="text-lg font-bold text-white">
              Current Device vs Reference Device
            </h3>
          </div>

          <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono rounded-lg">
            Reference device capabilities NEVER alter current device scores.
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                <th className="py-3 px-3">Capability Vector</th>
                <th className="py-3 px-3 bg-slate-950/40 text-slate-200">
                  Current Target ({currentProfile.model})
                </th>
                <th className="py-3 px-3 text-indigo-300">
                  Reference Device (Pixel 8 / Titan M2)
                </th>
                <th className="py-3 px-3">Architectural Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {/* Row 1: Protected VM */}
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Protected VM (pKVM)</td>
                <td className="py-3 px-3 bg-slate-950/40">
                  {currentProfile.protectedVmSupported ? (
                    <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> SUPPORTED</span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> UNAVAILABLE</span>
                  )}
                </td>
                <td className="py-3 px-3 text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> SUPPORTED (EL2)
                </td>
                <td className="py-3 px-3 text-slate-400 font-sans text-[11px]">
                  Pixel 8 configures ARM EL2 pKVM hypervisor at boot; stock POCO stock kernel disables it.
                </td>
              </tr>

              {/* Row 2: AVF Framework */}
              <tr>
                <td className="py-3 px-3 font-semibold text-white">AVF APEX Framework</td>
                <td className="py-3 px-3 bg-slate-950/40">
                  {currentProfile.avfPackagePresent ? (
                    <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> INSTALLED</span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> NOT INCLUDED</span>
                  )}
                </td>
                <td className="py-3 px-3 text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> COM.ANDROID.VIRT
                </td>
                <td className="py-3 px-3 text-slate-400 font-sans text-[11px]">
                  Google GKI builds bundle AVF by default; Xiaomi omits the virtualization APEX.
                </td>
              </tr>

              {/* Row 3: KeyMint Tier */}
              <tr>
                <td className="py-3 px-3 font-semibold text-white">KeyMint Hardware Tier</td>
                <td className="py-3 px-3 bg-slate-950/40">
                  <span className="text-sky-400">{currentProfile.keyMintSecurityLevel}</span>
                </td>
                <td className="py-3 px-3 text-indigo-400">
                  HARDWARE_STRONGBOX
                </td>
                <td className="py-3 px-3 text-slate-400 font-sans text-[11px]">
                  Pixel 8 uses discrete Titan M2 chip; POCO uses integrated Qualcomm Snapdragon TEE.
                </td>
              </tr>

              {/* Row 4: Verified Boot */}
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Verified Boot (AVB 2.0)</td>
                <td className="py-3 px-3 bg-slate-950/40">
                  <span className={currentProfile.verifiedBootState === 'GREEN' ? 'text-emerald-400' : 'text-amber-400'}>
                    {currentProfile.verifiedBootState}
                  </span>
                </td>
                <td className="py-3 px-3 text-emerald-400">
                  GREEN
                </td>
                <td className="py-3 px-3 text-slate-400 font-sans text-[11px]">
                  Both enforce cryptographic bootloader image signature verification on stock firmware.
                </td>
              </tr>

              {/* Row 5: SELinux */}
              <tr>
                <td className="py-3 px-3 font-semibold text-white">SELinux Policy</td>
                <td className="py-3 px-3 bg-slate-950/40">
                  <span className={currentProfile.selinuxMode === 'ENFORCING' ? 'text-emerald-400' : 'text-rose-400'}>
                    {currentProfile.selinuxMode}
                  </span>
                </td>
                <td className="py-3 px-3 text-emerald-400">
                  ENFORCING
                </td>
                <td className="py-3 px-3 text-slate-400 font-sans text-[11px]">
                  Mandatory Access Control active on both devices.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
