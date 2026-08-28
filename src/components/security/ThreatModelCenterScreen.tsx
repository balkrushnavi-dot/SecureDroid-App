import React from 'react';
import { AlertTriangle, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useSecureDroid } from '../../hooks/useSecureDroid';

interface ThreatModelCenterScreenProps {
  onBack?: () => void;
}

export function ThreatModelCenterScreen({ onBack }: ThreatModelCenterScreenProps) {
  const { threats, loading, refresh } = useSecureDroid();

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
          <h1 className="text-xl font-semibold tracking-wide">Threat Model Center</h1>
        </div>
        <button 
          onClick={refresh}
          className="px-3 py-1.5 text-xs font-medium bg-cyan-600/20 border border-cyan-500/40 text-cyan-400 rounded-lg hover:bg-cyan-600/30 transition-colors"
        >
          Re-evaluate
        </button>
      </div>

      {/* Content States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center flex-1 py-20 text-cyan-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mb-3" />
          <p className="text-sm text-slate-400">Analyzing threat vectors...</p>
        </div>
      ) : threats.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-20 text-center text-slate-400">
          <ShieldAlert className="w-12 h-12 text-emerald-500/50 mb-3" />
          <p className="text-base font-medium text-slate-300">System Fully Hardened</p>
          <p className="text-xs text-slate-500 mt-1">No active threat vectors identified on the device profile.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {threats.map((threat) => (
            <div key={threat.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium text-white flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>{threat.title}</span>
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                  {threat.risk}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{threat.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
