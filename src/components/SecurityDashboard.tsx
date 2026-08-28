import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Wifi, 
  AlertTriangle, 
  FileText, 
  Smartphone, 
  ChevronRight, 
  CheckCircle2, 
  Activity,
  Lock,
  RefreshCw
} from 'lucide-react';
import { SecureDroidNative } from '../services/native/SecureDroidNative';

interface SecurityDashboardProps {
  onNavigate: (screen: 'network' | 'apps' | 'hardening' | 'logs') => void;
}

export function SecurityDashboard({ onNavigate }: SecurityDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [securityScore, setSecurityScore] = useState(85);
  const [vpnActive, setVpnActive] = useState(false);
  const [riskyAppCount, setRiskyAppCount] = useState(0);
  const [wifiSecure, setWifiSecure] = useState(true);
  const [recentEventsCount, setRecentEventsCount] = useState(0);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [hardeningRes, vpnRes, appsRes, wifiRes, logsRes] = await Promise.all([
        SecureDroidNative.getHardeningReport(),
        SecureDroidNative.getVpnStatus(),
        SecureDroidNative.scanForRisks(),
        SecureDroidNative.getWifiSecurityReport(),
        SecureDroidNative.getSecurityLogs(10)
      ]);

      if (hardeningRes.success && hardeningRes.data) {
        setSecurityScore(hardeningRes.data.score ?? 85);
      }

      if (vpnRes.success && vpnRes.data) {
        setVpnActive(Boolean(vpnRes.data.isActive || vpnRes.data.isConnected));
      }

      if (appsRes.success && Array.isArray(appsRes.data)) {
        setRiskyAppCount(appsRes.data.length);
      }

      if (wifiRes.success && wifiRes.data) {
        setWifiSecure(wifiRes.data.isSecure !== false);
      }

      if (logsRes.success && Array.isArray(logsRes.data)) {
        setRecentEventsCount(logsRes.data.length);
      }
    } catch (e) {
      console.error('Failed to load dashboard metrics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 pb-28">
      {/* Professional Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">SecureDroid Core</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white mt-0.5">Security Posture</h1>
        </div>
        <button 
          onClick={fetchDashboardData}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Refresh Telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Hero Security Score Card */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/80 to-slate-950 border border-slate-800/80 shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Overall Defense Index</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">{securityScore}</span>
              <span className="text-xs text-slate-500 font-medium">/ 100</span>
            </div>
            <p className="text-[11px] text-emerald-400 font-medium flex items-center space-x-1 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{securityScore >= 80 ? 'Device hardening optimal' : 'Review hardening recommendations'}</span>
            </p>
          </div>

          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${
            securityScore >= 80 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}>
            <Shield className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Quick Navigation & Status Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Network & VPN Card */}
        <div 
          onClick={() => onNavigate('network')}
          className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className={`p-2.5 rounded-xl border ${
              vpnActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800/80 text-slate-400 border-slate-700/50'
            }`}>
              <Wifi className="w-4 h-4" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white tracking-tight">Network Tunnel</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {vpnActive ? 'Active & Filtered' : 'Disconnected'}
            </p>
          </div>
        </div>

        {/* App Risk Card */}
        <div 
          onClick={() => onNavigate('apps')}
          className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className={`p-2.5 rounded-xl border ${
              riskyAppCount > 0 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
            }`}>
              <Smartphone className="w-4 h-4" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white tracking-tight">App Auditor</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {riskyAppCount > 0 ? `${riskyAppCount} risk findings` : 'All apps secure'}
            </p>
          </div>
        </div>

        {/* Device Hardening Card */}
        <div 
          onClick={() => onNavigate('hardening')}
          className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Lock className="w-4 h-4" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white tracking-tight">Hardening</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Device posture check</p>
          </div>
        </div>

        {/* Security Audit Logs Card */}
        <div 
          onClick={() => onNavigate('logs')}
          className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FileText className="w-4 h-4" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white tracking-tight">Audit Logs</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{recentEventsCount} recorded events</p>
          </div>
        </div>
      </div>

      {/* System Status Summary Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 space-y-2.5">
        <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Environment Health</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
            <span className="text-slate-300">Wi-Fi Security Status</span>
            <span className={`font-medium ${wifiSecure ? 'text-emerald-400' : 'text-amber-400'}`}>
              {wifiSecure ? 'Secure Network' : 'Unvalidated Hotspot'}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-300">Local Threat Engine</span>
            <span className="font-medium text-cyan-400">Active (On-Device)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecurityDashboard;
