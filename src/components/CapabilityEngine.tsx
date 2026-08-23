import React, { useState } from 'react';
import { DeviceProfile, CapabilityItem, QualitativeSecurityTier } from '../types/securedroid';
import { DEVICE_PROFILES } from '../data/deviceProfiles';
import { getCapabilitiesForProfile } from '../data/capabilitiesData';
import { CapabilityDetailModal } from './CapabilityDetailModal';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  RefreshCw,
  Cpu,
  ShieldCheck,
  Layers,
  Terminal,
  Info,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface CapabilityEngineProps {
  currentProfile: DeviceProfile;
  setProfile: (profile: DeviceProfile) => void;
  qualitativeTier: QualitativeSecurityTier;
  isLight?: boolean;
}

export const CapabilityEngine: React.FC<CapabilityEngineProps> = ({
  currentProfile,
  setProfile,
  qualitativeTier,
  isLight = false,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedCapability, setSelectedCapability] = useState<CapabilityItem | null>(null);

  const capabilities = getCapabilitiesForProfile(currentProfile);

  const triggerScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 600);
  };

  const getStatusBadge = (state: string) => {
    switch (state) {
      case 'SUPPORTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> SUPPORTED
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> PARTIAL
          </span>
        );
      case 'UNSUPPORTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" /> UNSUPPORTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-700">
            <HelpCircle className="w-3.5 h-3.5" /> UNKNOWN
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Device Profile Selector Banner */}
      <div className={`border rounded-3xl p-5 shadow-sm ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-1">
              <Cpu className="w-3.5 h-3.5" /> TARGET HARDWARE & RUNTIME PROFILE
            </div>
            <h2 className={`text-xl font-bold ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>{currentProfile.name}</h2>
            <p className={`text-xs mt-1 font-mono ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {currentProfile.chipset} • {currentProfile.androidVersion}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={currentProfile.id}
              onChange={(e) => {
                const found = DEVICE_PROFILES.find((p) => p.id === e.target.value);
                if (found) setProfile(found);
              }}
              className={`text-xs rounded-xl px-3 py-2 border font-mono focus:outline-none ${
                isLight ? 'bg-zinc-50 border-zinc-300 text-zinc-800' : 'bg-zinc-950 border-zinc-750 text-zinc-200'
              }`}
            >
              {DEVICE_PROFILES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <button
              onClick={triggerScan}
              disabled={isScanning}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                isLight
                  ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800'
                  : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              Re-Scan Hardware
            </button>
          </div>
        </div>

        {currentProfile.notes && (
          <div className={`mt-4 pt-3 border-t text-xs p-3.5 rounded-2xl border font-mono ${
            isLight
              ? 'bg-zinc-50 border-zinc-200 text-zinc-700'
              : 'bg-zinc-950 border-zinc-800 text-zinc-300'
          }`}>
            <span className="text-amber-400 font-semibold">Hardware Assessment:</span> {currentProfile.notes}
          </div>
        )}
      </div>

      {/* Qualitative Security Tier Overview */}
      <div className={`border rounded-3xl p-5 ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-sm">Qualitative Security Classification</h3>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
            {qualitativeTier}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
          <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Root of Trust</span>
            <p className="font-medium text-xs mt-1">Qualcomm SoC TEE (QSEE)</p>
          </div>
          <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Verified Boot</span>
            <p className="font-medium text-xs mt-1">AVB 2.0 Locked & Enforced</p>
          </div>
          <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'}`}>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">StrongBox HSM</span>
            <p className="font-medium text-xs mt-1 text-amber-400">Unavailable on SoC</p>
          </div>
        </div>
      </div>

      {/* Capability Probes List */}
      <div className={`border rounded-3xl p-5 ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold tracking-wide font-mono uppercase text-zinc-400">
            Runtime Capability Probes ({capabilities.length})
          </h3>
          <span className="text-xs text-zinc-500 font-mono">Tap any probe for evidence</span>
        </div>

        <div className="space-y-3">
          {capabilities.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedCapability(item)}
              className={`border rounded-2xl p-4 transition-all cursor-pointer ${
                isLight
                  ? 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-800'
                  : 'bg-zinc-950 hover:bg-zinc-850 border-zinc-800 text-zinc-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-sm">{item.name}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    isLight ? 'bg-zinc-200 text-zinc-700' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(item.state)}
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </div>
              </div>

              <p className={`text-xs mt-2 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {item.details || item.securityMeaning}
              </p>

              <div className="mt-2.5 pt-2 border-t border-zinc-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-mono text-zinc-500">
                <span className="truncate">
                  <strong className="text-zinc-400">Probe:</strong> {item.technicalProbe || item.evidence}
                </span>
                {item.pocoSpecificNote && (
                  <span className="text-sky-400 font-mono text-[10px]">
                    [POCO]: {item.pocoSpecificNote}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Capability Detail Modal */}
      {selectedCapability && (
        <CapabilityDetailModal
          capability={selectedCapability}
          onClose={() => setSelectedCapability(null)}
          isLight={isLight}
        />
      )}
    </div>
  );
};
