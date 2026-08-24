import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  ChevronRight,
  Info,
  XCircle
} from 'lucide-react';
import {
  SecureDroidTopBar,
  SecureDroidCard,
  SecureDroidStatusChip,
  SecureDroidSectionHeader,
} from '../ui/designSystem';
import { SecureDroidNative } from '../../services/native/SecureDroidNative';
import type { NativeInstalledApp } from '../../types/native';

interface AppSecurityAuditorScreenProps {
  onBack: () => void;
  isLight?: boolean;
}

export const AppSecurityAuditorScreen: React.FC<AppSecurityAuditorScreenProps> = ({
  onBack,
  isLight = false,
}) => {
  const [apps, setApps] = useState<NativeInstalledApp[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedApp, setSelectedApp] = useState<NativeInstalledApp | null>(null);

  const runAudit = useCallback(async () => {
    setIsScanning(true);
    setErrorMessage(null);

    const result = await SecureDroidNative.getInstalledApps();

    if (!result.success || !result.data) {
      setErrorMessage(result.message || 'Failed to retrieve application evidence from the native bridge.');
      setApps([]);
    } else {
      setApps(result.data);
      if (result.data.length > 0 && !selectedApp) {
        setSelectedApp(result.data[0]);
      }
    }
    setIsScanning(false);
  }, [selectedApp]);

  useEffect(() => {
    void runAudit();
  }, [runAudit]);

  const filteredApps = apps.filter(app =>
    app.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.packageName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar
        title="App Security Auditor"
        subtitle="Factual Package Evidence & Risk Analysis"
        onBack={onBack}
        isLight={isLight}
      />

      <div className="pt-4 space-y-4">
        {/* Honest Architecture Explanation Banner */}
        <SecureDroidCard isLight={isLight} highlight className="p-4 border-l-4 border-l-sky-500">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold">Evidence-Based Analysis Only</h4>
              <p className={`text-[11px] mt-0.5 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                This screen processes real Android <code className="font-mono text-sky-300">PackageManager</code> facts (installer source, target SDK, and requested permissions). It does not perform heuristic antivirus scanning or assume malicious intent.
              </p>
            </div>
          </div>
        </SecureDroidCard>

        {/* Scan Controls & Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search installed packages..."
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border transition-colors ${
                isLight 
                  ? 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500' 
                  : 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-600'
              }`}
            />
          </div>

          <button
            onClick={() => void runAudit()}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Refresh'}</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* App Inspection Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Left Column: App List */}
          <div className="lg:col-span-5 space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {filteredAppList(filteredApps, selectedApp, setSelectedApp, isLight)}
          </div>

          {/* Right Column: Detailed Factual Inspector */}
          <div className="lg:col-span-7">
            {selectedApp ? (
              <AppDetailsPanel app={selectedApp} isLight={isLight} />
            ) : (
              <div className="p-12 text-center text-xs text-zinc-500 font-mono bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                Select an application from the list to inspect its package evidence.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

function filteredAppList(
  apps: NativeInstalledApp[],
  selectedApp: NativeInstalledApp | null,
  setSelectedApp: (app: NativeInstalledApp) => void,
  isLight: boolean
) {
  if (apps.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-zinc-500 font-mono">
        No packages discovered.
      </div>
    );
  }

  return apps.map((app) => {
    const isSelected = selectedApp?.packageName === app.packageName;
    return (
      <button
        key={app.packageName}
        onClick={() => setSelectedApp(app)}
        className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
          isSelected
            ? 'bg-sky-500/10 border-sky-500/40 shadow-sm'
            : isLight
            ? 'bg-white border-zinc-200 hover:bg-zinc-100 text-zinc-800'
            : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-850 text-zinc-200'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-sky-400 font-bold font-mono text-xs shrink-0">
            {app.label.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold truncate flex items-center gap-1.5">
              <span className="truncate">{app.label}</span>
              {app.isSystemApp && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-zinc-800 text-zinc-400 shrink-0">
                  SYS
                </span>
              )}
            </div>
            <div className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">
              {app.packageName}
            </div>
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-sky-400 translate-x-0.5' : 'text-zinc-600'}`} />
      </button>
    );
  });
}

function AppDetailsPanel({ app, isLight }: { app: NativeInstalledApp; isLight: boolean }) {
  const isSideloaded = !app.isSystemApp && !app.installerPackage;
  const isStaleSdk = app.targetSdk < 29;

  return (
    <SecureDroidCard isLight={isLight} className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-zinc-800/40 pb-4">
        <div>
          <h3 className="font-bold text-base">{app.label}</h3>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">{app.packageName}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-950 border border-zinc-800 text-zinc-300">
              v{app.versionName || '1.0'} ({app.versionCode})
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-950 border border-zinc-800 text-sky-300">
              Target SDK {app.targetSdk}
            </span>
            {app.isSystemApp && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                System Package
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Factual Findings Callouts */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
          Evidence Checks
        </span>

        {isSideloaded && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Sideloaded Application</strong>
              <p className="text-[11px] opacity-80 mt-0.5">No installer package name recorded. Likely installed outside an official app store.</p>
            </div>
          </div>
        )}

        {isStaleSdk && !app.isSystemApp && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Stale Target SDK ({app.targetSdk})</strong>
              <p className="text-[11px] opacity-80 mt-0.5">Targets an older Android API level; may not fully adhere to modern scoped storage defaults.</p>
            </div>
          </div>
        )}

        {app.isDebuggable && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Debuggable Flag Enabled</strong>
              <p className="text-[11px] opacity-80 mt-0.5">This application explicitly exposes debugging hooks in its manifest.</p>
            </div>
          </div>
        )}

        {!isSideloaded && !isStaleSdk && !app.isDebuggable && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>No critical configuration anomalies detected against standard ruleset.</span>
          </div>
        )}
      </div>

      {/* Technical Metadata Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className={`p-2.5 rounded-xl ${isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-950 text-zinc-300'}`}>
          <span className="text-[10px] text-zinc-500 block font-sans">Installer Source</span>
          <span className="truncate block">{app.installerPackage || 'Unknown / Sideloaded'}</span>
        </div>
        <div className={`p-2.5 rounded-xl ${isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-950 text-zinc-300'}`}>
          <span className="text-[10px] text-zinc-500 block font-sans">Launchable Intent</span>
          <span className="font-medium">{app.isLaunchable ? 'Yes' : 'No (Background Service/Provider)'}</span>
        </div>
      </div>

      {/* Requested Permissions List */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
          Requested Permissions ({app.requestedPermissions.length})
        </span>
        <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
          {app.requestedPermissions.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">No declared permissions.</p>
          ) : (
            app.requestedPermissions.map((perm, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-zinc-950 border border-zinc-850 text-[11px] font-mono text-zinc-400 break-all">
                {perm}
              </div>
            ))
          )}
        </div>
      </div>
    </SecureDroidCard>
  );
}
