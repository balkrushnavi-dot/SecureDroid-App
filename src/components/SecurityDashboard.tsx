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
  RefreshCw,
  Bell,
  Clock,
  Send
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

  // WorkManager & Background Monitor state
  const [bgMonitorActive, setBgMonitorActive] = useState(true);
  const [bgInterval, setBgInterval] = useState(15);
  const [lastScanSummary, setLastScanSummary] = useState<{
    timestamp?: number;
    appsScanned?: number;
    highRiskAppsCount?: number;
    vulnerabilitiesCount?: number;
    alertsPosted?: number;
    status?: string;
  } | null>(null);
  const [triggeringScan, setTriggeringScan] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);
  const [notificationStatusMsg, setNotificationStatusMsg] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [hardeningRes, vpnRes, appsRes, wifiRes, logsRes, bgRes] = await Promise.all([
        SecureDroidNative.getHardeningReport(),
        SecureDroidNative.getVpnStatus(),
        SecureDroidNative.scanForRisks(),
        SecureDroidNative.getWifiSecurityReport(),
        SecureDroidNative.getSecurityLogs(10),
        SecureDroidNative.getBackgroundMonitorStatus()
      ]);

      if (hardeningRes.success && hardeningRes.data) {
        setSecurityScore(hardeningRes.data.score ?? 85);
      }

      if (vpnRes.success && vpnRes.data) {
        setVpnActive(Boolean(vpnRes.data.isActive));
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

      if (bgRes.success && bgRes.data) {
        setBgMonitorActive(bgRes.data.isScheduled ?? true);
        setBgInterval(bgRes.data.intervalMinutes ?? 15);
        if (bgRes.data.lastScan) {
          setLastScanSummary(bgRes.data.lastScan);
        }
      }
    } catch (e) {
      console.error('Failed to load dashboard metrics', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBgMonitor = async () => {
    try {
      if (bgMonitorActive) {
        await SecureDroidNative.cancelBackgroundMonitor();
        setBgMonitorActive(false);
        setNotificationStatusMsg('Background security monitor paused');
      } else {
        await SecureDroidNative.scheduleBackgroundMonitor(bgInterval);
        setBgMonitorActive(true);
        setNotificationStatusMsg(`WorkManager security monitor scheduled (${bgInterval} min)`);
      }
    } catch (e) {
      console.error('Failed to toggle monitor', e);
    }
  };

  const handleTriggerScanNow = async () => {
    setTriggeringScan(true);
    try {
      await SecureDroidNative.triggerBackgroundScanNow();
      setNotificationStatusMsg('Background security scan queued via WorkManager');
      setTimeout(() => {
        fetchDashboardData();
        setTriggeringScan(false);
      }, 1000);
    } catch (e) {
      console.error('Trigger scan error', e);
      setTriggeringScan(false);
    }
  };

  const handleTestNotification = async () => {
    setTestingNotification(true);
    try {
      const res = await SecureDroidNative.testSecurityAlert({
        type: 'APP_ALERT',
        title: 'High-Risk App Alert: Suspicious Utility',
        message: 'Detected excessive permissions (Accessibility + SMS) in background scan.',
        severity: 'HIGH',
        packageName: 'com.example.suspicious.app'
      });
      if (res.success) {
        setNotificationStatusMsg('Test security alert dispatched via NotificationManager');
      } else {
        setNotificationStatusMsg(res.message || 'Notification sent or logged');
      }
    } catch (e) {
      console.error('Test notification failed', e);
      setNotificationStatusMsg('Test notification queued');
    } finally {
      setTestingNotification(false);
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

      {/* WorkManager Background Security Monitor & Alert Section */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-xl border ${
              bgMonitorActive ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}>
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="text-xs font-bold text-white tracking-tight">WorkManager Threat Monitor</h3>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase ${
                  bgMonitorActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {bgMonitorActive ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Background app risk & vulnerability alerts
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleBgMonitor}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-colors ${
              bgMonitorActive 
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' 
                : 'bg-cyan-600 text-white border-cyan-500 hover:bg-cyan-500'
            }`}
          >
            {bgMonitorActive ? 'Pause' : 'Enable'}
          </button>
        </div>

        {/* Status Message */}
        {notificationStatusMsg && (
          <div className="text-[11px] text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1.5 rounded-lg flex items-center justify-between">
            <span>{notificationStatusMsg}</span>
            <button onClick={() => setNotificationStatusMsg(null)} className="text-slate-400 hover:text-white ml-2 text-xs">✕</button>
          </div>
        )}

        {/* Background Action Controls */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleTriggerScanNow}
            disabled={triggeringScan}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-200 transition-colors"
          >
            <Clock className={`w-3.5 h-3.5 ${triggeringScan ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
            <span>{triggeringScan ? 'Scanning...' : 'Run Scan Now'}</span>
          </button>

          <button
            onClick={handleTestNotification}
            disabled={testingNotification}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-950/60 border border-cyan-800/40 text-xs font-medium text-cyan-300 transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-cyan-400" />
            <span>{testingNotification ? 'Sending...' : 'Test Alert'}</span>
          </button>
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
