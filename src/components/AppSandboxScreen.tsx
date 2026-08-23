import React, { useState } from 'react';
import {
  Smartphone,
  Shield,
  Globe,
  Camera,
  Mic,
  MapPin,
  Users,
  EyeOff,
  Bell,
  Lock,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Search
} from 'lucide-react';
import { AppSandboxInfo, NetworkAccessLevel, PermissionGrantState } from '../types/securedroid';

interface AppSandboxScreenProps {
  apps: AppSandboxInfo[];
  onUpdateAppNetwork: (packageName: string, level: NetworkAccessLevel) => void;
  onUpdateAppPermission: (packageName: string, permKey: string, state: PermissionGrantState) => void;
}

export function AppSandboxScreen({
  apps,
  onUpdateAppNetwork,
  onUpdateAppPermission,
}: AppSandboxScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<AppSandboxInfo>(apps[0] || null);

  const filteredApps = apps.filter(app =>
    (app.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (app.packageName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (app.uid !== undefined ? app.uid.toString() : '').includes(searchQuery)
  );

  return (
    <div id="app-sandbox-screen" className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-indigo-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Hardened App Sandbox & Permissions</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-950 border border-indigo-800 text-indigo-300">
                  UID & SELINUX DOMAINS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Granular per-app network firewalling, isolated SELinux categories, and permission controls
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-left">
            <div className="text-[10px] text-slate-500 font-mono">ENFORCEMENT LAYER</div>
            <div className="text-xs font-mono font-bold text-indigo-300">Linux UID + SELinux MAC</div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: App List & Search */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search apps by name, package, or UID..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* App List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredApps.map(app => {
              const isSelected = selectedApp?.packageName === app.packageName;
              return (
                <button
                  key={app.packageName}
                  id={`app-item-${app.packageName}`}
                  onClick={() => setSelectedApp(app)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-sm'
                      : 'bg-slate-900/80 border-slate-800/80 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 font-bold font-mono text-sm shrink-0">
                      {app.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{app.name}</span>
                        {app.isSystemApp && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-300">
                            SYSTEM
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[180px]">
                        UID {app.uid} • {app.networkAccess}
                      </div>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isSelected ? 'text-indigo-400 translate-x-1' : 'text-slate-600'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected App Sandbox Details & Hardened Controls */}
        <div className="lg:col-span-7">
          {selectedApp ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
              {/* App Overview */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 font-bold font-mono text-lg">
                    {selectedApp.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">{selectedApp.name}</h2>
                    <p className="text-xs text-slate-400 font-mono">{selectedApp.packageName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-300">
                        Linux UID: {selectedApp.uid}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-indigo-300">
                        Domain: {selectedApp.selinuxDomain.split(':')[2]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Network Firewall Setting (Per-App) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Network Access Firewall
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-sky-400">
                    REQUIRES SYSTEM PRIVILEGE / eBPF
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(['ALLOW', 'VPN_ONLY', 'DENY'] as const).map(level => {
                    const isActive = selectedApp.networkAccess === level;
                    return (
                      <button
                        key={level}
                        id={`btn-network-${level}`}
                        onClick={() => onUpdateAppNetwork(selectedApp.packageName, level)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold font-mono border transition-all cursor-pointer ${
                          isActive
                            ? level === 'ALLOW'
                              ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                              : level === 'VPN_ONLY'
                              ? 'bg-indigo-950 border-indigo-500 text-indigo-200'
                              : 'bg-rose-950 border-rose-500 text-rose-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400">
                  {selectedApp.networkAccess === 'ALLOW' && 'Direct LAN and WAN traffic permitted.'}
                  {selectedApp.networkAccess === 'VPN_ONLY' && 'Sockets blocked unless routed through encrypted VPN tunnel interface.'}
                  {selectedApp.networkAccess === 'DENY' && 'All network sockets dropped at kernel socket filter level (zero internet).'}
                </p>
              </div>

              {/* Granular Permission Toggles */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Hardware & Framework Permissions
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    APPLICATION RUNTIME ENFORCEMENT
                  </span>
                </div>

                <div className="space-y-2">
                  {[
                    { key: 'camera', label: 'Camera Sensor', icon: Camera },
                    { key: 'microphone', label: 'Microphone Audio', icon: Mic },
                    { key: 'location', label: 'Precise Location', icon: MapPin },
                    { key: 'contacts', label: 'Contacts & Address Book', icon: Users },
                    { key: 'sensors', label: 'Motion & Gyro Sensors', icon: EyeOff },
                    { key: 'notifications', label: 'Notifications', icon: Bell },
                  ].map(perm => {
                    const currentState = (selectedApp.permissions as any)[perm.key] as PermissionGrantState || 'DENIED';
                    const Icon = perm.icon;

                    return (
                      <div
                        key={perm.key}
                        className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-slate-900 text-slate-400">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-slate-200">{perm.label}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {(['GRANTED', 'ASK_EVERY_TIME', 'DENIED'] as const).map(state => (
                            <button
                              key={state}
                              onClick={() => onUpdateAppPermission(selectedApp.packageName, perm.key, state)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                                currentState === state
                                  ? state === 'GRANTED'
                                    ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                                    : state === 'ASK_EVERY_TIME'
                                    ? 'bg-amber-950 border border-amber-500 text-amber-300'
                                    : 'bg-rose-950 border border-rose-500 text-rose-300'
                                  : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              {state === 'GRANTED' ? 'ALLOW' : state === 'ASK_EVERY_TIME' ? 'ASK' : 'DENY'}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SELinux & Sandbox Isolation Spec */}
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/80 space-y-2 text-xs">
                <div className="font-semibold text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>SELinux Category Isolation</span>
                </div>
                <div className="font-mono text-[11px] text-slate-400 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  {selectedApp.selinuxDomain}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Unique MLS category pair (<code className="text-slate-400 font-mono">c{selectedApp.uid % 1000},c{256 + (selectedApp.uid % 100)}</code>) prevents other untrusted applications from reading or writing to this app's private internal storage directories, even across root exploits.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 font-mono bg-slate-900 border border-slate-800 rounded-3xl">
              Select an application on the left to inspect and configure its sandbox.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
