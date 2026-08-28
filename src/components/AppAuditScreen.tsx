import React, { useState, useEffect } from 'react';
import { ArrowLeft, Smartphone, ShieldAlert, ShieldCheck, RefreshCw, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { SecureDroidNative } from '../services/native/SecureDroidNative';
import type { NativeAppRiskReport } from '../types/native';

interface AppAuditScreenProps {
  onBack?: () => void;
}

export function AppAuditScreen({ onBack }: AppAuditScreenProps) {
  const [reports, setReports] = useState<NativeAppRiskReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await SecureDroidNative.scanForRisks();
      if (res.success && Array.isArray(res.data)) {
        setReports(res.data);
      }
    } catch (e) {
      console.error('Failed to scan app risks', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const getRiskBadge = (risk: string) => {
    switch (risk?.toUpperCase()) {
      case 'HIGH':
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'MEDIUM':
      case 'MODERATE':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
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
            <h1 className="text-base font-semibold tracking-tight text-white">App Risk Auditor</h1>
            <p className="text-[11px] text-slate-400">{reports.length} applications flagged with findings</p>
          </div>
        </div>
        <button 
          onClick={fetchReports} 
          disabled={loading}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* App List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-cyan-400 space-y-3">
          <div className="animate-spin rounded-full h-7 w-7 border-2 border-cyan-400 border-t-transparent" />
          <p className="text-xs text-slate-400 font-medium">Analyzing installed application manifests...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-300 font-medium">All installed applications passed security checks.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {reports.map((app) => {
            const isExpanded = expandedPackage === app.packageName;
            return (
              <div 
                key={app.packageName}
                onClick={() => setExpandedPackage(isExpanded ? null : app.packageName)}
                className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700/80 transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700/50">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-white tracking-tight">{app.label}</h3>
                      <p className="text-[10px] font-mono text-slate-400">{app.packageName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium uppercase ${getRiskBadge(app.overallRisk)}`}>
                      {app.overallRisk} Risk
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </div>
                </div>

                {/* Findings Accordion */}
                {isExpanded && (
                  <div className="pt-2 border-t border-slate-800/60 space-y-2 animate-fadeIn">
                    <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Security Findings ({app.findings.length})</p>
                    <div className="space-y-1.5">
                      {app.findings.map((finding, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-900 flex items-start space-x-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <div className="text-xs">
                            <p className="text-slate-200 font-medium">{finding.summary}</p>
                            <span className="text-[10px] font-mono text-slate-500">{finding.id}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AppAuditScreen;
