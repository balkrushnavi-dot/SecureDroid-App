import React from 'react';
import { ShieldCheck, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAppScanner } from '../../hooks/useAppScanner';

interface AppSecurityAuditorScreenProps {
  onBack?: () => void;
}

export function AppSecurityAuditorScreen({ onBack }: AppSecurityAuditorScreenProps) {
  const { apps, loading, error, rescan } = useAppScanner();

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
          <h1 className="text-xl font-semibold tracking-wide">App Security Auditor</h1>
        </div>
        <button 
          onClick={rescan}
          className="px-3 py-1.5 text-xs font-medium bg-cyan-600/20 border border-cyan-500/40 text-cyan-400 rounded-lg hover:bg-cyan-600/30 transition-colors"
        >
          Rescan Apps
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Content States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center flex-1 py-20 text-cyan-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mb-3" />
          <p className="text-sm text-slate-400">Auditing installed applications...</p>
        </div>
      ) : apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-20 text-center text-slate-400">
          <ShieldCheck className="w-12 h-12 text-cyan-500/50 mb-3" />
          <p className="text-base font-medium text-slate-300">No application risks detected</p>
          <p className="text-xs text-slate-500 mt-1">Your installed apps appear secure or environment is in preview mode.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <div key={app.packageName} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-white">{app.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{app.packageName}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 text-xs rounded-full uppercase font-semibold ${
                  app.riskLevel === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                  app.riskLevel === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {app.riskLevel}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
