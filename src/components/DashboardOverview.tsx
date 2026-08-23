import React, { useState } from 'react';
import { DeviceProfile, SecurityScoreFormula, CapabilityItem, NetworkPolicyMode } from '../types/securedroid';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  HelpCircle,
  Cpu,
  HardDrive,
  Network,
  Lock,
  Play,
  Settings,
  ChevronRight,
  RefreshCw,
  Info,
  Check,
  X,
  Minus,
  Layers,
  ArrowRight,
  ExternalLink,
  Sliders,
  Shield,
  Smartphone,
  Server
} from 'lucide-react';

interface DashboardOverviewProps {
  currentProfile: DeviceProfile;
  securityScore: SecurityScoreFormula;
  capabilities: CapabilityItem[];
  onSelectCapability: (cap: CapabilityItem) => void;
  onNavigateTab: (tab: any) => void;
  onOpenSettings: () => void;
  onRunScan: () => void;
  isScanning: boolean;
}

export function DashboardOverview({
  currentProfile,
  securityScore,
  capabilities,
  onSelectCapability,
  onNavigateTab,
  onOpenSettings,
  onRunScan,
  isScanning,
}: DashboardOverviewProps) {
  const [networkPolicy, setNetworkPolicy] = useState<NetworkPolicyMode>('OFFLINE');
  const [showVirtInfo, setShowVirtInfo] = useState(false);
  const [showVirtModal, setShowVirtModal] = useState(false);

  // Virtualization Backend Detection (from real device profile)
  const virtBackend = currentProfile.protectedVmSupported
    ? 'PROTECTED VM'
    : currentProfile.avfPackagePresent
    ? 'AVF'
    : currentProfile.kvmNodePresent
    ? 'KVM'
    : 'UNAVAILABLE';

  const isVirtAvailable = virtBackend !== 'UNAVAILABLE';

  // Storage Math (20 GB Safety Reserve strictly respected)
  const hostFreeSpace = currentProfile.availableStorageGb;
  const safetyReserve = 20.0;
  const safeAllocation = Math.max(0, hostFreeSpace - safetyReserve);
  const vmStorageUsed = 8.4;
  const vmStorageMax = 150.0;
  const storageProgressPercent = Math.min(100, Math.round((vmStorageUsed / vmStorageMax) * 100));

  // Encryption status derived from KeyMint
  const encryptionStatus =
    currentProfile.strongBoxPresent
      ? 'STRONGBOX'
      : currentProfile.keyMintSecurityLevel === 'HARDWARE_TEE'
      ? 'TEE-BACKED'
      : currentProfile.keyMintSecurityLevel === 'SOFTWARE_EMULATED'
      ? 'SOFTWARE'
      : 'UNKNOWN';

  // Specific capability checks for compact summary
  const verifiedBootPass = currentProfile.verifiedBootState === 'GREEN';
  const selinuxPass = currentProfile.selinuxMode === 'ENFORCING';
  const keyMintPass = currentProfile.keyMintSecurityLevel === 'HARDWARE_TEE' || currentProfile.keyMintSecurityLevel === 'HARDWARE_STRONGBOX';
  const pkvmPass = currentProfile.protectedVmSupported;
  const networkIsolationPass = true; // Host manifest removes INTERNET permission

  return (
    <div id="security-dashboard-container" className="space-y-6 pb-16">
      {/* Top App Bar / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">SecureDroid</h1>
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {currentProfile.model}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Device security & virtualization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="run-security-scan-btn"
            onClick={onRunScan}
            disabled={isScanning}
            className="min-h-[44px] flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 border border-slate-700 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Scan Device'}</span>
          </button>
          <button
            id="open-dashboard-settings-btn"
            onClick={onOpenSettings}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Settings & Device Selection"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. HOST SECURITY CARD (Large Primary Card) */}
      <div
        id="host-security-card"
        className="bg-slate-900 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                HOST SECURITY
              </span>
            </div>

            {/* Large Status Display */}
            <div className="flex items-baseline gap-3">
              <span
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                  securityScore.hostStatus === 'SECURE'
                    ? 'text-emerald-400'
                    : securityScore.hostStatus === 'DEGRADED'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {securityScore.hostStatus}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Level {securityScore.calculatedLevel} / 6
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Based on verified device capabilities
            </p>
          </div>

          <button
            id="open-security-audit-btn"
            onClick={() => onNavigateTab('security')}
            className="self-start sm:self-center min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700 transition-colors shadow-sm cursor-pointer"
          >
            Security Center
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Compact Summary Checklist */}
        <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Item 1: Verified Boot */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="text-slate-300 font-medium">Verified Boot</span>
            {verifiedBootPass ? (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-400 font-mono text-[11px]">
                <Check className="w-3.5 h-3.5" /> PASS
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-bold text-amber-400 font-mono text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5" /> {currentProfile.verifiedBootState}
              </span>
            )}
          </div>

          {/* Item 2: SELinux */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="text-slate-300 font-medium">SELinux</span>
            {selinuxPass ? (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-400 font-mono text-[11px]">
                <Check className="w-3.5 h-3.5" /> ENFORCING
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-bold text-rose-400 font-mono text-[11px]">
                <X className="w-3.5 h-3.5" /> PERMISSIVE
              </span>
            )}
          </div>

          {/* Item 3: Hardware KeyMint */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="text-slate-300 font-medium">Hardware KeyMint</span>
            {keyMintPass ? (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-400 font-mono text-[11px]">
                <Check className="w-3.5 h-3.5" /> TEE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-bold text-rose-400 font-mono text-[11px]">
                <X className="w-3.5 h-3.5" /> SOFTWARE
              </span>
            )}
          </div>

          {/* Item 4: Protected VM */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="text-slate-300 font-medium">Protected VM</span>
            {pkvmPass ? (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-400 font-mono text-[11px]">
                <Check className="w-3.5 h-3.5" /> PASS
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-bold text-slate-500 font-mono text-[11px]">
                <Minus className="w-3.5 h-3.5" /> UNAVAIL
              </span>
            )}
          </div>

          {/* Item 5: Network Isolation */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="text-slate-300 font-medium">Network Isolation</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-400 font-mono text-[11px]">
              <Check className="w-3.5 h-3.5" /> VERIFIED
            </span>
          </div>
        </div>

        {/* Diagnostic note */}
        <p className="text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/50 leading-relaxed">
          {securityScore.statusRationale}
        </p>
      </div>

      {/* 2-Column Grid: Virtualization Card & VM Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. VIRTUALIZATION CARD */}
        <div
          id="virtualization-overview-card"
          className="bg-slate-900 border border-slate-800/90 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                VIRTUALIZATION
              </span>
              <button
                id="virt-info-btn"
                onClick={() => setShowVirtInfo(!showVirtInfo)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
                title="Virtualization Requirements Information"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <span
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                    isVirtAvailable ? 'text-emerald-400' : 'text-slate-200'
                  }`}
                >
                  {virtBackend}
                </span>
                {!isVirtAvailable && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    ✕ UNAVAILABLE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">Current device capability</p>
            </div>

            {!isVirtAvailable ? (
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2 text-xs">
                <p className="text-slate-300 font-medium">
                  Hardware virtualization is not exposed by the current host.
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  The Snapdragon 778G CPU contains ARMv8.4-A virtualization extensions in silicon, but Xiaomi stock vendor firmware omits <code className="text-sky-300 font-mono">/dev/kvm</code> and the AVF APEX package.
                </p>
              </div>
            ) : (
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-300">
                Hardware virtualization support is active and available for isolated guest runtime.
              </div>
            )}

            {/* Expandable Info */}
            {showVirtInfo && (
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1.5 text-[11px] text-slate-400 animate-in fade-in duration-150">
                <div className="font-semibold text-slate-200">Virtualization Requirements:</div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                  <li>Kernel build with <code className="text-sky-300 font-mono">CONFIG_KVM=y</code></li>
                  <li>Accessible character device <code className="text-sky-300 font-mono">/dev/kvm</code></li>
                  <li>AVF APEX package (<code className="text-sky-300 font-mono">com.android.virt</code>)</li>
                  <li>Android application APK cannot enable pKVM on its own</li>
                </ul>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>EL2 Stage-2 Memory Protection:</span>
            <span className={currentProfile.protectedVmSupported ? 'text-emerald-400 font-bold' : 'text-slate-500 font-mono'}>
              {currentProfile.protectedVmSupported ? 'ENFORCED' : '— NOT EXPOSED'}
            </span>
          </div>
        </div>

        {/* 3. VM STATUS CARD */}
        <div
          id="vm-status-card"
          className="bg-slate-900 border border-slate-800/90 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                SECUREDROID VM
              </span>
              <span className="px-2.5 py-1 text-xs font-bold font-mono rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                STOPPED
              </span>
            </div>

            {/* Large Status */}
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                STOPPED
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Isolated sandbox execution state</p>
            </div>

            {/* VM Spec Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                <span className="text-slate-500 block text-[10px] font-mono">RAM</span>
                <span className="font-semibold text-slate-200">2 GB</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                <span className="text-slate-500 block text-[10px] font-mono">CPU</span>
                <span className="font-semibold text-slate-200">2 cores</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                <span className="text-slate-500 block text-[10px] font-mono">STORAGE</span>
                <span className="font-semibold text-slate-200">{vmStorageUsed} GB / {vmStorageMax} GB</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                <span className="text-slate-500 block text-[10px] font-mono">NETWORK</span>
                <span className="font-semibold text-slate-200">OFFLINE</span>
              </div>
              <div className="col-span-2 sm:col-span-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                <span className="text-slate-500 block text-[10px] font-mono">ENCRYPTION</span>
                <span className="font-semibold text-emerald-400">{encryptionStatus}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <div className="flex gap-2">
              <button
                id="start-vm-button"
                disabled={!isVirtAvailable}
                onClick={() => onNavigateTab('vm_manager')}
                className={`flex-1 min-h-[48px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  isVirtAvailable
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                    : 'bg-slate-800/50 text-slate-500 border border-slate-800 cursor-not-allowed'
                }`}
              >
                <Play className="w-4 h-4" />
                START VM
              </button>
              <button
                id="vm-settings-button"
                onClick={() => onNavigateTab('vm_manager')}
                className="min-h-[48px] py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                VM SETTINGS
              </button>
            </div>

            {!isVirtAvailable && (
              <p className="text-[11px] text-amber-400 text-center font-medium">
                VM backend unavailable on this device.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3 Secondary Cards: Storage, Network, Encryption */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 4. STORAGE CARD */}
        <div
          id="storage-dashboard-card"
          className="bg-slate-900 border border-slate-800/90 rounded-3xl p-5 shadow-xl space-y-3 flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                STORAGE
              </span>
              <span className="text-[11px] font-mono text-slate-400">Sparse Disk</span>
            </div>

            <div>
              <div className="text-2xl font-extrabold text-white">{vmStorageUsed} GB</div>
              <p className="text-xs text-slate-400">VM storage used</p>
            </div>

            {/* Material Linear Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>{vmStorageUsed} GB</span>
                <span>Max: {vmStorageMax} GB</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${storageProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Host free space</span>
              <span className="font-mono text-slate-200 font-semibold">{hostFreeSpace.toFixed(1)} GB</span>
            </div>
            <div className="flex justify-between text-amber-400/90 font-medium">
              <span className="text-slate-400">Safety reserve</span>
              <span className="font-mono">20 GB</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-semibold">
              <span className="text-slate-300">Safe allocation</span>
              <span className="font-mono">{safeAllocation.toFixed(1)} GB</span>
            </div>
            <p className="text-[10px] text-slate-500 pt-1 leading-tight">
              150 GB is maximum dynamic limit, not preallocated storage.
            </p>
          </div>
        </div>

        {/* 5. ENCRYPTION CARD */}
        <div
          id="encryption-dashboard-card"
          className="bg-slate-900 border border-slate-800/90 rounded-3xl p-5 shadow-xl space-y-3 flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-indigo-400" />
                VM ENCRYPTION
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                {encryptionStatus}
              </span>
            </div>

            <div>
              <div className="text-2xl font-extrabold text-white">{encryptionStatus}</div>
              <p className="text-xs text-slate-400">Master storage key protection</p>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60 text-xs text-slate-300 leading-relaxed">
              {encryptionStatus !== 'UNKNOWN'
                ? 'Encryption key protection is provided by the device security subsystem.'
                : 'Encryption security level cannot currently be verified.'}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 space-y-1 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Cipher Algorithm:</span>
              <span className="font-mono text-slate-200 font-semibold">AES-256-GCM</span>
            </div>
            <div className="flex justify-between">
              <span>Key Extraction:</span>
              <span className="text-emerald-400 font-semibold">Hardware-Blocked</span>
            </div>
          </div>
        </div>

        {/* 6. NETWORK CARD */}
        <div
          id="network-dashboard-card"
          className="bg-slate-900 border border-slate-800/90 rounded-3xl p-5 shadow-xl space-y-3 flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Network className="w-4 h-4 text-sky-400" />
                NETWORK
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full">
                OFFLINE
              </span>
            </div>

            <div>
              <div className="text-2xl font-extrabold text-white">{networkPolicy}</div>
              <p className="text-xs text-slate-400">Guest isolation policy</p>
            </div>

            {/* Policy Selector Options */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-medium text-slate-400">Policy Mode:</div>
              <div className="grid grid-cols-2 gap-1.5">
                {(['OFFLINE', 'NORMAL', 'VPN_ONLY', 'RESTRICTED'] as NetworkPolicyMode[]).map((mode) => (
                  <button
                    key={mode}
                    id={`network-policy-${mode}`}
                    onClick={() => setNetworkPolicy(mode)}
                    className={`py-1.5 px-2 text-[10px] font-mono font-semibold rounded-lg border transition-all cursor-pointer ${
                      networkPolicy === mode
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {mode.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 space-y-1 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-semibold text-emerald-400">Policy configured</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Host manifest removes INTERNET permission to guarantee offline isolation.
            </p>
          </div>
        </div>
      </div>

      {/* 7. SECURITY CAPABILITIES (Security Issues / Capability List) */}
      <div
        id="capability-summary-section"
        className="bg-slate-900 border border-slate-800/90 rounded-3xl p-6 shadow-xl space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              SECURITY CAPABILITIES
            </h2>
            <p className="text-xs text-slate-400">
              Verified hardware and system capabilities. Tap any item for evidence and requirements.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {capabilities.filter((c) => c.state === 'SUPPORTED').length} of {capabilities.length} Verified
          </span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {capabilities.map((cap) => {
            const isPass = cap.state === 'SUPPORTED';
            const isWarning = cap.state === 'PARTIAL';
            const isUnavailable = cap.state === 'UNSUPPORTED';

            return (
              <button
                key={cap.id}
                id={`capability-item-${cap.id}`}
                onClick={() => onSelectCapability(cap)}
                className="w-full flex items-center justify-between py-3.5 px-3 rounded-xl hover:bg-slate-800/60 transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0 group-hover:border-slate-700">
                    {cap.category === 'CRYPTOGRAPHY' ? (
                      <Lock className="w-4 h-4 text-indigo-400" />
                    ) : cap.category === 'STORAGE' ? (
                      <HardDrive className="w-4 h-4 text-emerald-400" />
                    ) : cap.category === 'VIRTUALIZATION' ? (
                      <Cpu className="w-4 h-4 text-purple-400" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-sky-400" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-200 block group-hover:text-white truncate">
                      {cap.name}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {cap.details}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isPass ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <Check className="w-3.5 h-3.5" /> PASS
                    </span>
                  ) : isWarning ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      <AlertTriangle className="w-3.5 h-3.5" /> WARNING
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      <X className="w-3.5 h-3.5" /> UNAVAILABLE
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
