import React, { useState, useEffect } from 'react';
import { Wifi, Shield, ArrowLeft, Power, Plus, Trash2, Globe, CheckCircle2, AlertTriangle } from 'lucide-react';
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
  const [inputBlocked, setInputBlocked] = useState('');
  const [inputAllowed, setInputAllowed] = useState('');
  const [activeTab, setActiveTab] = useState<'blocked' | 'allowed'>('blocked');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadDomains = async () => {
    try {
      const res = await SecureDroidNative.getBlockedDomains();
      if (res.success && res.data) {
        setBlockedDomains(res.data.blockedDomains || []);
        setAllowedDomains(res.data.allowedDomains || []);
      }
    } catch (e) {
      console.error('Failed to load domain filters', e);
    }
  };

  useEffect(() => {
    loadDomains();
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

  const handleAddBlocked = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputBlocked.trim()) return;
    const res = await SecureDroidNative.addBlockedDomain(inputBlocked.trim());
    if (res.success) {
      setInputBlocked('');
      loadDomains();
      setActionMessage('Domain added to blocklist');
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleRemoveBlocked = async (domain: string) => {
    const res = await SecureDroidNative.removeBlockedDomain(domain);
    if (res.success) {
      loadDomains();
    }
  };

  const handleAddAllowed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputAllowed.trim()) return;
    const res = await SecureDroidNative.addAllowedDomain(inputAllowed.trim());
    if (res.success) {
      setInputAllowed('');
      loadDomains();
      setActionMessage('Domain added to allowlist');
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleRemoveAllowed = async (domain: string) => {
    const res = await SecureDroidNative.removeAllowedDomain(domain);
    if (res.success) {
      loadDomains();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button onClick={onBack} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-xl font-semibold tracking-wide">Network Protection</h1>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-cyan-400">
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
              {vpnActive ? 'All device traffic is encrypted and filtered locally.' : 'VPN protection is currently inactive.'}
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

          {/* Domain Filtering & Blocklist Section */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                Domain Filtering Rules
              </h4>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveTab('blocked')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'blocked' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Blocklist ({blockedDomains.length})
                </button>
                <button
                  onClick={() => setActiveTab('allowed')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'allowed' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Allowlist ({allowedDomains.length})
                </button>
              </div>
            </div>

            {/* Input Form */}
            {activeTab === 'blocked' ? (
              <form onSubmit={handleAddBlocked} className="flex gap-2">
                <input
                  type="text"
                  value={inputBlocked}
                  onChange={(e) => setInputBlocked(e.target.value)}
                  placeholder="Add domain to block (e.g. tracker.com)..."
                  className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </form>
            ) : (
              <form onSubmit={handleAddAllowed} className="flex gap-2">
                <input
                  type="text"
                  value={inputAllowed}
                  onChange={(e) => setInputAllowed(e.target.value)}
                  placeholder="Add domain to allow (e.g. trusted.com)..."
                  className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </form>
            )}

            {/* Domain List */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {activeTab === 'blocked' ? (
                blockedDomains.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No custom blocked domains added.</p>
                ) : (
                  blockedDomains.map((domain) => (
                    <div key={domain} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                      <span className="text-xs font-mono text-slate-200">{domain}</span>
                      <button
                        onClick={() => handleRemoveBlocked(domain)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )
              ) : (
                allowedDomains.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No custom allowed domains added.</p>
                ) : (
                  allowedDomains.map((domain) => (
                    <div key={domain} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                      <span className="text-xs font-mono text-slate-200">{domain}</span>
                      <button
                        onClick={() => handleRemoveAllowed(domain)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )
              )}
            </div>
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

export default NetworkControlScreen;
