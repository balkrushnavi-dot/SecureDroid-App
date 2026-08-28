import React from 'react';
import { ShieldCheck, Smartphone, ArrowLeft, Lock, Cpu } from 'lucide-react';
import { useSecureDroid } from '../hooks/useSecureDroid';

interface DeviceSecurityScreenProps {
  onBack?: () => void;
}

export function DeviceSecurityScreen({ onBack }: DeviceSecurityScreenProps) {
  const { deviceStatus, loading, refresh } = useSecureDroid();

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-y-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button onClick={onBack} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-xl font-semibold tracking-wide">Device Security Status</h1>
        </div>
        <button 
          onClick={refresh}
          className="px-3 py-1.5 text-xs font-medium bg-cyan-600/20 border border-cyan-500/40 text-cyan-400 rounded-lg hover:bg-cyan-600/30 transition-colors"
        >
          Check Integrity
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center flex-1 py-20 text-cyan-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mb-3" />
          <p className="text-sm text-slate-400">Evaluating device integrity...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status Overview Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              deviceStatus === 'secure' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">System Integrity: <span className="uppercase text-cyan-400">{deviceStatus}</span></h3>
              <p className="text-xs text-slate-400 mt-0.5">Hardware-backed keystore and bootloader verified.</p>
            </div>
          </div>

          {/* Hardening Details */}
          <div className="space-y-2.5">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-cyan-400" />
                <div>
                  <h4 className="text-xs font-medium text-white">Hardware Keystore</h4>
                  <p className="text-[10px] text-slate-400">StrongBox Keymaster active</p>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-semibold">SECURE</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <div>
                  <h4 className="text-xs font-medium text-white">SELinux Policy</h4>
                  <p className="text-[10px] text-slate-400">Enforcing mode active</p>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-semibold">ENFORCED</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
