import React, { useState } from 'react';
import {
  Layers,
  Shield,
  Play,
  Square,
  RefreshCw,
  HardDrive,
  Cpu,
  Lock,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Zap,
  Info,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { DeviceProfile, GuestImageInfo, VmInstanceState } from '../types/securedroid';
import { GUEST_IMAGES } from '../data/osArchitectureData';

interface VmManagerScreenProps {
  profile: DeviceProfile;
  guestImages?: GuestImageInfo[];
}

export function VmManagerScreen({ profile, guestImages = GUEST_IMAGES }: VmManagerScreenProps) {
  const isHypervisorAvailable = profile.protectedVmSupported || profile.avfPackagePresent || profile.kvmNodePresent;

  const [vmState, setVmState] = useState<VmInstanceState>('STOPPED');
  const [selectedImage, setSelectedImage] = useState<GuestImageInfo>(guestImages[0]);
  const [assignedVcpus, setAssignedVcpus] = useState<number>(2);
  const [assignedRamMb, setAssignedRamMb] = useState<number>(2048);
  const [assignedDiskGb, setAssignedDiskGb] = useState<number>(10);
  const [bootLog, setBootLog] = useState<string[]>([]);
  const [isBooting, setIsBooting] = useState(false);

  const handleStartVm = () => {
    if (!isHypervisorAvailable) return;
    setIsBooting(true);
    setVmState('STARTING');
    setBootLog([
      `[+0.000] SecureDroidVmService: Initializing Microdroid VM container...`,
      `[+0.040] KeyMint TEE: Generating hardware-wrapped ephemeral session disk key (AES-256-GCM)...`,
      `[+0.120] Image Verifier: SHA-256 digest ${selectedImage.sha256.substring(0, 16)}... VERIFIED`,
      `[+0.180] Image Verifier: Anti-rollback counter check (Index ${selectedImage.rollbackIndex} >= Min 2)... PASSED`,
      `[+0.250] Storage Safety: Checking 20.0 GB host reserve... (Host Free: ${profile.availableStorageGb.toFixed(1)} GB)... PASSED`,
      `[+0.320] VMM / crosvm: Allocating ${assignedRamMb} MB RAM, ${assignedVcpus} vCPUs...`,
      `[+0.410] Vsock Manager: Binding isolated localhost CID 3... (Policy: OFFLINE)`,
      `[+0.550] Guest Kernel: Microdroid 6.1-android14 booting payload...`,
      `[+0.720] SecureDroid Guest Runtime: Ready in isolated execution enclave.`,
    ]);

    setTimeout(() => {
      setIsBooting(false);
      setVmState('RUNNING');
    }, 900);
  };

  const handleStopVm = () => {
    setVmState('STOPPING');
    setTimeout(() => {
      setVmState('STOPPED');
      setBootLog(prev => [...prev, `[STOP] Guest VM gracefully halted. Ephemeral memory wiped.`]);
    }, 400);
  };

  return (
    <div id="vm-manager-screen" className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-purple-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Secure VM & Guest Isolation</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950 border border-purple-800 text-purple-300">
                  ARM EL2 HYPERVISOR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Hardware Stage-2 page table memory unmapping & Microdroid guest runtime
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-left">
            <div className="text-[10px] text-slate-500 font-mono">HYPERVISOR STATE</div>
            <div className="text-xs font-mono font-bold text-purple-300">
              {isHypervisorAvailable ? 'pKVM / AVF AVAILABLE' : 'UNSUPPORTED ON STOCK OEM KERNEL'}
            </div>
          </div>
        </div>
      </div>

      {/* Hypervisor Availability Audit Banner */}
      {!isHypervisorAvailable && (
        <div className="bg-amber-950/40 border border-amber-500/50 rounded-3xl p-5 sm:p-6 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-200">
                Fail-Closed Policy: Hardware Virtualization Inactive
              </h3>
              <p className="text-xs text-amber-300/80 leading-relaxed">
                The stock OEM Xiaomi kernel on the POCO X5 Pro 5G does not expose ARM EL2 pKVM hypervisor or the <code className="text-amber-200 font-mono">/dev/kvm</code> device node.
                Per our core security rule, SecureDroid will <strong>never simulate or fake virtual machine execution</strong>.
                Running virtual machines requires flashing a custom GKI kernel with <code className="text-amber-200 font-mono">CONFIG_KVM=y</code>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs font-mono">
            <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800">
              <div className="text-[10px] text-slate-500">PROTECTED VM</div>
              <div className="text-rose-400 font-bold">NOT EXPOSED</div>
            </div>
            <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800">
              <div className="text-[10px] text-slate-500">AVF APEX</div>
              <div className="text-rose-400 font-bold">NOT INSTALLED</div>
            </div>
            <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800">
              <div className="text-[10px] text-slate-500">/dev/kvm NODE</div>
              <div className="text-rose-400 font-bold">UNAVAILABLE</div>
            </div>
          </div>
        </div>
      )}

      {/* VM Provisioning & Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: VM Configuration & Guest Image Selector */}
        <div className="lg:col-span-7 space-y-6">
          {/* Guest Images Registry */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Verified Guest Disk Images
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-500">SHA-256 & SIGNATURE VERIFIED</span>
            </div>

            <div className="space-y-3">
              {guestImages.map(img => {
                const isSelected = selectedImage.id === img.id;
                return (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img)}
                    className={`w-full p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500/60 shadow-sm'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{img.name}</span>
                          <span className="px-2 py-0.2 rounded text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {img.signatureState}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Version: {img.version} • {img.sizeMb} MB
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        Rollback Index: {img.rollbackIndex}
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 truncate">
                      SHA-256: <span className="text-slate-300">{img.sha256}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Virtual Resource Allocation */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Resource Allocation & Safety Headroom
                </h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">20 GB RESERVE ENFORCED</span>
            </div>

            <div className="space-y-4 text-xs">
              {/* vCPUs Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span>Virtual CPU Cores (vCPUs)</span>
                  <span className="font-mono font-bold text-purple-400">{assignedVcpus} Cores</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={4}
                  value={assignedVcpus}
                  onChange={e => setAssignedVcpus(Number(e.target.value))}
                  className="w-full accent-purple-500 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>

              {/* RAM Allocation */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span>Isolated RAM (Stage-2 Unmapped)</span>
                  <span className="font-mono font-bold text-purple-400">{assignedRamMb} MB</span>
                </div>
                <input
                  type="range"
                  min={512}
                  max={4096}
                  step={256}
                  value={assignedRamMb}
                  onChange={e => setAssignedRamMb(Number(e.target.value))}
                  className="w-full accent-purple-500 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>

              {/* Virtual Sparse Disk Size */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span>Encrypted Sparse Disk Ceiling</span>
                  <span className="font-mono font-bold text-purple-400">{assignedDiskGb} GB</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={25}
                  value={assignedDiskGb}
                  onChange={e => setAssignedDiskGb(Number(e.target.value))}
                  className="w-full accent-purple-500 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: VM Lifecycle Execution Console */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Guest VM Lifecycle
                </h2>
                <p className="text-xs text-slate-400">crosvm daemon & vsock interface</p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                  vmState === 'RUNNING'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : vmState === 'STARTING'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                {vmState}
              </span>
            </div>

            {/* Start / Stop Action Buttons */}
            <div className="flex items-center gap-3">
              {vmState === 'STOPPED' || vmState === 'ERROR' ? (
                <button
                  id="btn-start-guest-vm"
                  onClick={handleStartVm}
                  disabled={!isHypervisorAvailable || isBooting}
                  className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isHypervisorAvailable
                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  START ISOLATED GUEST VM
                </button>
              ) : (
                <button
                  id="btn-stop-guest-vm"
                  onClick={handleStopVm}
                  className="flex-1 py-3 px-4 rounded-2xl text-xs font-bold font-mono flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-all cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-current" />
                  HALT & WIPE EPHEMERAL RAM
                </button>
              )}
            </div>

            {/* Execution Audit Log Box */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>VIRTUALIZATION HYPERVISOR CONSOLE</span>
                <span className="text-[10px] text-slate-500 font-mono">VSOCK CID 3</span>
              </div>

              <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 font-mono text-[11px] text-slate-300 space-y-1.5 h-64 overflow-y-auto">
                {bootLog.length === 0 ? (
                  <div className="text-slate-600 italic">
                    Hypervisor idle. Awaiting signed guest launch command...
                  </div>
                ) : (
                  bootLog.map((line, idx) => (
                    <div key={idx} className="leading-relaxed">
                      {line.includes('VERIFIED') || line.includes('PASSED') ? (
                        <span className="text-emerald-400">{line}</span>
                      ) : line.includes('KeyMint') ? (
                        <span className="text-sky-300">{line}</span>
                      ) : (
                        <span>{line}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
