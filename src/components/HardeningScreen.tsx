import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Shield } from 'lucide-react';
import { SecureDroidNative } from '../services/native/SecureDroidNative';

interface HardeningScreenProps {
  onBack?: () => void;
}

export function HardeningScreen({ onBack }: HardeningScreenProps) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHardening = async () => {
    setLoading(true);
    try {
      const res = await SecureDroidNative.getHardeningReport();
      if (res.success && res.data) {
        setReport(res.data);
      }
    } catch (e) {
      console.error('Failed to load hardening report', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHardening();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PASS':
        return <span className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Optimal</span>;
      case 'FAIL':
        return <span className="text-[10px] px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-medium">Action Required</span>;
      case 'WARNING':
        return <span className="text-[10px] px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">Warning</span>;
      default:
        return <span className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 font-medium">Unknown</span>;
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
            <h1 className="text-base font-semibold tracking-tight text-white">Device Hardening</h1>
            <p className="text-[11px] text-slate-400">System security posture & config check</p>
          </div>
        </div>
        <button 
          onClick={fetchHardening} 
          disabled={loading}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-cyan-400 space-y-3">
          <div className="animate-spin rounded-full h-7 w-7 border-2 border-cyan-400 border-t-transparent" />
          <p className="text-xs text-slate-400 font-medium">Evaluating system security flags...</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {/* Score Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-medium tracking-wider">Hardening Index</p>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-3xl font-extrabold text-white tracking-tight">{report?.score ?? 85}</span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>
          </div>

          {/* Hardening Checklist Items */}
          <div className="space-y-2">
            {[
              { label: 'Screen Lock Protection', status: report?.screenLockStatus, desc: 'Requires biometric or PIN passcode' },
              { label: 'USB Debugging Mode', status: report?.usbDebuggingStatus, desc: 'ADB bridge access status' },
              { label: 'Developer Options', status: report?.developerOptionsStatus, desc: 'Advanced debugging toggles' },
              { label: 'Security Patch Level', status: report?.securityPatchStatus, desc: 'Android OS vulnerability updates' },
              { label: 'Unknown App Sources', status: report?.unknownSourcesStatus, desc: 'Sideloaded package permission' },
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-white tracking-tight">{item.label}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                </div>
                {getStatusBadge(item.status)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default HardeningScreen;
