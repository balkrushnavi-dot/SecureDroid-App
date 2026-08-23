import React, { useState } from 'react';
import {
  HardDrive,
  Shield,
  Lock,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Cpu,
  Zap,
  Info
} from 'lucide-react';
import { DeviceProfile } from '../types/securedroid';

interface StorageControlScreenProps {
  profile: DeviceProfile;
}

export function StorageControlScreen({ profile }: StorageControlScreenProps) {
  const hostTotalGb = 256.0;
  const hostFreeGb = profile.availableStorageGb;
  const hostUsedGb = hostTotalGb - hostFreeGb;
  const safetyReserveGb = 20.0;
  const safeHeadroomGb = Math.max(0, hostFreeGb - safetyReserveGb);

  const [virtualDiskSparseSizeGb, setVirtualDiskSparseSizeGb] = useState(8.4);
  const [virtualDiskCapacityGb, setVirtualDiskCapacityGb] = useState(150.0);
  const [isWiping, setIsWiping] = useState(false);
  const [wipeSuccess, setWipeSuccess] = useState(false);

  const handleCryptographicWipe = () => {
    setIsWiping(true);
    setTimeout(() => {
      setIsWiping(false);
      setWipeSuccess(true);
      setVirtualDiskSparseSizeGb(0.1);
      setTimeout(() => setWipeSuccess(false), 4000);
    }, 1200);
  };

  return (
    <div id="storage-control-screen" className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-amber-400">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Encrypted Storage & Safety Floor</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 border border-amber-800 text-amber-300">
                  AES-256 HARDWARE KEYMINT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dynamic sparse allocation and strict 20.0 GB host operating system protection floor
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-left">
            <div className="text-[10px] text-slate-500 font-mono">BACKEND SERVICE</div>
            <div className="text-xs font-mono font-bold text-amber-300">SecureDroidStorageService</div>
          </div>
        </div>
      </div>

      {/* Host Storage Safety Floor Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Host Flash Storage & Safety Floor
            </h2>
            <p className="text-xs text-slate-400">
              Physical UFS 3.1 256 GB internal flash partition allocation
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              SAFETY RESERVE ACTIVE ({safetyReserveGb.toFixed(1)} GB)
            </span>
          </div>
        </div>

        {/* Visual Multi-Segment Storage Bar */}
        <div className="space-y-2">
          <div className="h-6 rounded-xl bg-slate-950 border border-slate-800 flex overflow-hidden p-0.5">
            {/* Host Used */}
            <div
              style={{ width: `${(hostUsedGb / hostTotalGb) * 100}%` }}
              className="bg-slate-700 h-full rounded-l-lg transition-all"
              title={`Host Used: ${hostUsedGb.toFixed(1)} GB`}
            />
            {/* VM Sparse Footprint */}
            <div
              style={{ width: `${(virtualDiskSparseSizeGb / hostTotalGb) * 100}%` }}
              className="bg-amber-500 h-full transition-all"
              title={`VM Disk Footprint: ${virtualDiskSparseSizeGb.toFixed(1)} GB`}
            />
            {/* Safe Headroom */}
            <div
              style={{ width: `${(safeHeadroomGb / hostTotalGb) * 100}%` }}
              className="bg-emerald-500/60 h-full transition-all"
              title={`Safe VM Growth Headroom: ${safeHeadroomGb.toFixed(1)} GB`}
            />
            {/* 20 GB Reserved Floor */}
            <div
              style={{ width: `${(safetyReserveGb / hostTotalGb) * 100}%` }}
              className="bg-rose-500/80 h-full rounded-r-lg transition-all"
              title={`Mandatory Host Safety Floor: ${safetyReserveGb.toFixed(1)} GB`}
            />
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-700 shrink-0" />
              <div>
                <div className="text-slate-400 text-[10px]">Host System & Apps</div>
                <div className="font-mono font-bold text-white">{hostUsedGb.toFixed(1)} GB</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-500 shrink-0" />
              <div>
                <div className="text-slate-400 text-[10px]">VM Sparse Image</div>
                <div className="font-mono font-bold text-amber-400">{virtualDiskSparseSizeGb.toFixed(1)} GB</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-500/60 shrink-0" />
              <div>
                <div className="text-slate-400 text-[10px]">Safe Headroom</div>
                <div className="font-mono font-bold text-emerald-400">{safeHeadroomGb.toFixed(1)} GB</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-rose-500/80 shrink-0" />
              <div>
                <div className="text-slate-400 text-[10px]">Safety Floor (Reserved)</div>
                <div className="font-mono font-bold text-rose-400">{safetyReserveGb.toFixed(1)} GB</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sparse Container & Cryptographic Reset */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sparse Virtual Disk Engine */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Sparse Virtual Disk Container
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">ext4 on dm-crypt</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Maximum Virtual Ceiling</span>
                <span className="font-mono font-bold text-white">{virtualDiskCapacityGb} GB</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Actual Host Flash Consumed</span>
                <span className="font-mono font-bold text-amber-400">{virtualDiskSparseSizeGb.toFixed(1)} GB</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Storage Key Protection</span>
                <span className="font-mono font-bold text-sky-400">KeyMint Hardware-Wrapped</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              SecureDroid utilizes dynamic sparse allocation headers. Physical disk space is claimed from the host storage pool only as the guest OS writes actual data, preserving maximum flash life and free space.
            </p>
          </div>
        </div>

        {/* Cryptographic Instant Sanitization */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Cryptographic Instant Sanitization
              </h2>
            </div>
            <span className="text-[10px] font-mono text-rose-400">NIST SP 800-88</span>
          </div>

          <div className="space-y-2 text-xs">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Instantly destroys the master hardware KeyMint encryption key in the Qualcomm QSEE enclave.
              All underlying encrypted blocks immediately become unrecoverable random noise without requiring slow physical flash rewrites.
            </p>
          </div>

          {wipeSuccess && (
            <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-2xl p-3 text-xs text-emerald-300 font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Key destroyed. Container cryptographically sanitized.
            </div>
          )}

          <button
            id="btn-cryptographic-wipe"
            onClick={handleCryptographicWipe}
            disabled={isWiping}
            className="w-full py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {isWiping ? 'SANITIZING HARDWARE KEY...' : 'EXECUTE CRYPTOGRAPHIC WIPE'}
          </button>
        </div>
      </div>
    </div>
  );
}
