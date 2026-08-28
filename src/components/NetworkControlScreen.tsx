import React, { useState } from 'react';
import { Wifi, Shield, ArrowLeft, Power } from 'lucide-react';
import { useSecureDroid } from '../hooks/useSecureDroid';

interface NetworkControlScreenProps {
  onBack?: () => void;
}

export function NetworkControlScreen({ onBack }: NetworkControlScreenProps) {
  const { vpnActive, loading, refresh } = useSecureDroid();
  const [toggling, setToggling] = useState(false);

  const handleToggleVpn = async () => {
    setToggling(true);
    // Simulate or invoke native VPN toggle action
    setTimeout(() => {
      setToggling(false);
      refresh();
    }, 600);
  };

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
          <h1 className="text-xl font-semibold tracking-wide">Network Protection</h1>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center flex-1 py-20 text-cyan-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mb-3" />
          <p className="text-sm text-slate-400">Checking network tunnels...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
              vpnActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              <Wifi className="w-8 h-8" />
            </div>
            <h3 className="text-base font-medium text-white">Secure VPN Tunnel</h3>
            <p className="text-xs text-slate-400 mt-1">
              {vpnActive ? 'All device traffic is encrypted and filtered.' : 'VPN protection is currently inactive.'}
            </p>

            <button
              onClick={handleToggleVpn}
              disabled={toggling}
              className={`mt-5 px-5 py-2.5 rounded-xl font-medium text-sm flex items-center space-x-2 transition-colors ${
                vpnActive 
                  ? 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20' 
                  : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{toggling ? 'Updating...' : vpnActive ? 'Disconnect VPN' : 'Connect VPN'}</span>
            </button>
          </div>

          {/* Features Info */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Network Security Features</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>DNS Leak Protection & Malicious Domain Blocking</span>
              </li>
              <li className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Local Loopback Tunnel for Traffic Inspection</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
