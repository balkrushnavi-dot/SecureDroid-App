import React from 'react';
import { FileText, Clock, ArrowLeft } from 'lucide-react';
import { useSecureDroid } from '../../hooks/useSecureDroid';

interface SecurityAuditLogScreenProps {
  onBack?: () => void;
}

export function SecurityAuditLogScreen({ onBack }: SecurityAuditLogScreenProps) {
  const { auditLogs, loading, refresh } = useSecureDroid();

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
          <h1 className="text-xl font-semibold tracking-wide">Security Audit Log</h1>
        </div>
        <button 
          onClick={refresh}
          className="px-3 py-1.5 text-xs font-medium bg-cyan-600/20 border border-cyan-500/40 text-cyan-400 rounded-lg hover:bg-cyan-600/30 transition-colors"
        >
          Refresh Logs
        </button>
      </div>

      {/* Content States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center flex-1 py-20 text-cyan-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mb-3" />
          <p className="text-sm text-slate-400">Loading audit events...</p>
        </div>
      ) : auditLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-20 text-center text-slate-400">
          <FileText className="w-12 h-12 text-slate-600 mb-3" />
          <p className="text-base font-medium text-slate-300">No Audit Events Recorded</p>
          <p className="text-xs text-slate-500 mt-1">System telemetry events will appear here as they occur.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-cyan-400 font-mono flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                  log.severity === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                  log.severity === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                  'bg-slate-800 text-slate-300'
                }`}>
                  {log.severity}
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-1">{log.event}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
