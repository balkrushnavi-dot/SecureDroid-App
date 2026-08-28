import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, RefreshCw, ShieldAlert, Info, AlertTriangle, Shield } from 'lucide-react';
import { SecureDroidNative } from '../services/native/SecureDroidNative';
import type { NativeSecurityEvent } from '../types/native';

interface SecurityLogsScreenProps {
  onBack?: () => void;
}

export function SecurityLogsScreen({ onBack }: SecurityLogsScreenProps) {
  const [logs, setLogs] = useState<NativeSecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const categoryFilter = selectedCategory === 'ALL' ? undefined : selectedCategory;
      const res = await SecureDroidNative.getSecurityLogs(100, categoryFilter);
      if (res.success && Array.isArray(res.data)) {
        setLogs(res.data);
      }
    } catch (e) {
      console.error('Failed to load security logs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedCategory]);

  const getSeverityIcon = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'WARNING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button onClick={onBack} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-base font-semibold tracking-tight text-white">Security Audit Logs</h1>
            <p className="text-[11px] text-slate-400">Real-time device event history</p>
          </div>
        </div>
        <button 
          onClick={fetchLogs} 
          disabled={loading}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
        {['ALL', 'AUDIT', 'NETWORK', 'PERMISSION', 'SCAN'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-medium tracking-wide transition-colors shrink-0 ${
              selectedCategory === cat 
                ? 'bg-cyan-500 text-slate-950 font-semibold' 
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Log Feed */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-cyan-400 space-y-3">
          <div className="animate-spin rounded-full h-7 w-7 border-2 border-cyan-400 border-t-transparent" />
          <p className="text-xs text-slate-400 font-medium">Fetching event audit trail...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500">
            <FileText className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-400 font-medium">No audit events recorded for this category.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getSeverityIcon(log.severity)}
                  <span className="text-xs font-medium text-white">{log.source || 'SecureDroid'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium ${getSeverityBadge(log.severity)}`}>
                    {log.severity}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700/50">
                    {log.category}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-normal">{log.description}</p>
              
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/40 text-[10px] text-slate-500">
                <span className="font-mono">{log.id}</span>
                <span>{new Date(log.timestamp).toLocaleTimeString()} · {new Date(log.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SecurityLogsScreen;
