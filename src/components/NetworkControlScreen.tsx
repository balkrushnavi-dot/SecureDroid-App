import React, { useState, useEffect } from 'react';
import { Wifi, Shield, ArrowLeft, Power, Plus, Trash2, Globe, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import { useSecureDroid } from '../hooks/useSecureDroid';
import { SecureDroidNative } from '../services/native/SecureDroidNative';

interface NetworkControlScreenProps {
  onBack?: () => void;
}

export function NetworkControlScreen({ onBack }: NetworkControlScreenProps) {
  const { vpnActive, loading, refresh } = useSecureDroid();
  const [toggling, setToggling] = useState(false);
  
  const [blockedDomains, setBlockedDomains] = useState<string[]>([]);
  const [allowedDomains, setAllowedDomains] = useState<string[]>([]);
  const [inputDomain, setInputDomain] = useState('');
  const [activeTab, setActiveTab] = useState<'blocked' | 'allowed'>('blocked');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [wifiReport, setWifiReport] = useState<any>(null);

  const loadData = async () => {
    try {
      const [domainRes, wifiRes] = await Promise.all([
        SecureDroidNative.getBlockedDomains(),
        SecureDroidNative.getWifiSecurityReport()
      ]);

      if (domainRes.success && domainRes.data) {
        setBlockedDomains(domainRes.data.blockedDomains || []);
        setAllowedDomains(domainRes.data.allowedDomains || []);
      }

      if (wifiRes.success && wifiRes.data) {
        setWifiReport(wifiRes.data);
      }
    } catch (e) {
      console.error('Failed to load network security data', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleVpn = async () => {
    setToggling(true);
    try {
      if (vpnActive) {
        await SecureDroidNative.stopVpn();
      } else {
        await SecureDroidNative.requestVpnPermission();
        await SecureDroidNative.startVpn();
      }
      await refresh();
    } catch (e) {
      console.error('VPN toggle failed', e);
    } finally {
      setToggling(false);
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputDomain.trim()) return;

    const domain = inputDomain.trim();
    const res = activeTab === 'blocked' 
      ? await SecureDroidNative.addBlockedDomain(domain)
      : await SecureDroidNative.addAllowedDomain(domain);

    if (res.success) {
      setInputDomain('');
      loadData();
      setActionMessage(`Added ${domain} to ${activeTab}`);
      setTimeout(() => setActionMessage(null), 2500);
    }
  };

  const handleRemoveDomain = async (domain: string) => {
    const res = activeTab === 'blocked'
      ? await SecureDroidNative.removeBlockedDomain(domain)
      : await SecureDroidNative.removeAllowedDomain(domain);

    if (res.success) {
      loadData();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 pb-28">
      {/* Minimal Header */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button 
              onClick={onBack} 
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-base font-semibold tracking-tight text-white">Network Protection</h1>
            <p className="text-[11px] text-slate-400">Tunnel telemetry & DNS filters</p>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-medium">{actionMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-cyan-400 space-y-3">
          <div className="animate-spin rounded-full h-7 w-7 border-2 border-cyan-400 border-t-transparent" />
          <p className="text-xs text-slate-400 font-medium">Analyzing network state...</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {/* Hero Tunnel Status Card */}
          <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                vpnActive 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-950/40' 
                  : 'bg-slate-800/80 text-slate-400 border border-slate-700/50'
              }`}>
                <Wifi className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-semibold text-white tracking-tight">Secure VPN Tunnel</h3>
                  <span className={`w-2 h-2 rounded-full ${vpnActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {vpnActive ? 'Active loopback encryption & filter' : 'Tunnel is currently disconnected'}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleVpn}
              disabled={toggling}
              className={`px-4 py-2 rounded-xl font-medium text-xs flex items-center space-x-1.5 transition-all ${
                vpnActive 
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20' 
                  : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{toggling ? '...' : vpnActive ? 'Disconnect' : 'Connect'}</span>
            </button>
          </div>

          {/* Environment & Wi-Fi Security Pill */}
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-slate-800/60 text-cyan-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-200">Network Environment</p>
                <p className="text-[10px] text-slate-400">
                  {wifiReport?.findings?.[0]?.summary || 'Standard encrypted connection'}
                </p>
              </div>
            </div>
            <span className={`text-[10px] px-2.5 py-1 rounded-lg font-medium ${
              wifiReport?.isSecure !== false 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {wifiReport?.isSecure !== false ? 'Secure' : 'Warning'}
            </span>
          </div>

          {/* Restructured Domain Filters Section */}
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-semibold text-slate-200 tracking-wide uppercase">Domain Filtering</h4>
              </div>
              
              {/* Minimal Segmented Tabs */}
              <div className="flex bg-slate-950 p-0.5 rounded-xl border border-slate-800/80">
                <button
                  onClick={() => setActiveTab('blocked')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    activeTab === 'blocked' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Blocked ({blockedDomains.length})
                </button>
                <button
                  onClick={() => setActiveTab('allowed')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    activeTab === 'allowed' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Allowed ({allowedDomains.length})
                </button>
              </div>
            </div>

            {/* Clean Input Form */}
            <form onSubmit={handleAddDomain} className="flex gap-2 pt-1">
              <input
                type="text"
                value={inputDomain}
                onChange={(e) => setInputDomain(e.target.value)}
                placeholder={activeTab === 'blocked' ? 'Add domain to block (e.g. tracker.com)' : 'Add domain to allow (e.g. site.com)'}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/60 transition-colors"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-sky-500/10 border border-sky-500/30 hover:bg-sky-500/20 text-sky-400 text-xs font-medium flex items-center space-x-1 transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>

            {/* Domain List Stream */}
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {(activeTab === 'blocked' ? blockedDomains : allowedDomains).length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No custom {activeTab} domains configured.
                </div>
              ) : (
                (activeTab === 'blocked' ? blockedDomains : allowedDomains).map((domain) => (
                  <div 
                    key={domain} 
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-900 hover:border-slate-800 transition-colors group"
                  >
                    <span className="text-xs font-mono text-slate-300 truncate max-w-[240px]">{domain}</span>
                    <button
                      onClick={() => handleRemoveDomain(domain)}
                      className="text-slate-600 group-hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/10"
                      title="Remove domain"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NetworkControlScreen;
