import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Shield,
  Eye,
  Cpu,
  Settings,
  Globe,
  MessageSquare,
  FolderLock,
  Camera,
  Landmark,
  Calculator,
  Image as ImageIcon,
  MoreVertical,
  Info,
  ShieldCheck,
  Pause,
  Trash2,
  Lock,
  ExternalLink,
  PackageCheck
} from 'lucide-react';
import { AppSandboxInfo, SystemScreen } from '../../types/securedroid';
import { SecureDroidSearchBar } from '../ui/designSystem';
import { SecureDroidNative } from '../../services/native/SecureDroidNative';
import type { NativeInstalledApp } from '../../types/native';

interface AppDrawerScreenProps {
  apps: AppSandboxInfo[];
  onOpenApp: (pkgName: string) => void;
  onOpenAppDetail: (pkgName: string) => void;
  onNavigate: (screen: SystemScreen) => void;
  isLight?: boolean;
}

export const AppDrawerScreen: React.FC<AppDrawerScreenProps> = ({
  apps,
  onOpenApp,
  onOpenAppDetail,
  onNavigate,
  isLight = false,
}) => {
  const [search, setSearch] = useState('');
  const [selectedAppMenu, setSelectedAppMenu] = useState<AppSandboxInfo | null>(null);
  const [nativeApps, setNativeApps] = useState<NativeInstalledApp[]>([]);
  const [isNativeEnvironment, setIsNativeEnvironment] = useState(false);

  useEffect(() => {
    async function loadNativeApps() {
      const res = await SecureDroidNative.getInstalledApps();
      if (res.success && res.data && res.data.length > 0) {
        setNativeApps(res.data);
        if (res.runtimePlatform === 'android_native') {
          setIsNativeEnvironment(true);
        }
      }
    }
    loadNativeApps();
  }, []);

  const getAppIcon = (iconType: string) => {
    switch (iconType) {
      case 'security':
        return <Shield className="w-6 h-6 text-emerald-400" />;
      case 'privacy':
        return <Eye className="w-6 h-6 text-sky-400" />;
      case 'vm':
        return <Cpu className="w-6 h-6 text-indigo-400" />;
      case 'settings':
        return <Settings className="w-6 h-6 text-slate-300" />;
      case 'browser':
        return <Globe className="w-6 h-6 text-teal-400" />;
      case 'messaging':
        return <MessageSquare className="w-6 h-6 text-emerald-300" />;
      case 'files':
        return <FolderLock className="w-6 h-6 text-amber-400" />;
      case 'camera':
        return <Camera className="w-6 h-6 text-rose-400" />;
      case 'banking':
        return <Landmark className="w-6 h-6 text-amber-300" />;
      case 'calculator':
        return <Calculator className="w-6 h-6 text-cyan-400" />;
      case 'gallery':
        return <ImageIcon className="w-6 h-6 text-pink-400" />;
      default:
        return <Shield className="w-6 h-6 text-slate-400" />;
    }
  };

  const filteredApps = useMemo(() => {
    if (!search.trim()) return apps;
    const q = search.toLowerCase();
    return apps.filter(
      (a) =>
        (a.name || '').toLowerCase().includes(q) ||
        (a.packageName || '').toLowerCase().includes(q)
    );
  }, [apps, search]);

  const handleLaunch = async (app: AppSandboxInfo) => {
    if (app.packageName === 'org.securedroid.security') {
      onNavigate('security_center');
    } else if (app.packageName === 'org.securedroid.privacy') {
      onNavigate('privacy_center');
    } else if (app.packageName === 'org.securedroid.vm') {
      onNavigate('secure_environment');
    } else if (app.packageName === 'com.android.settings') {
      onNavigate('settings');
    } else {
      if (isNativeEnvironment) {
        const launched = await SecureDroidNative.launchApp({ packageName: app.packageName });
        if (!launched.success) {
          onOpenAppDetail(app.packageName);
        }
      } else {
        onOpenAppDetail(app.packageName);
      }
    }
  };

  return (
    <div
      className={`min-h-full flex flex-col p-4 pb-20 select-none ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Native Indicator */}
      {isNativeEnvironment && (
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <PackageCheck className="w-3.5 h-3.5" />
            Live Android Package Manager Active ({nativeApps.length} Packages)
          </span>
          <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded">REAL ANDROID APIS</span>
        </div>
      )}

      {/* Search Header */}
      <div className="mb-4">
        <SecureDroidSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search apps..."
          isLight={isLight}
          onClear={() => setSearch('')}
        />
      </div>

      {/* App Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-y-6 gap-x-3 pt-2">
          {filteredApps.map((app) => (
            <div
              key={app.packageName}
              onClick={() => handleLaunch(app)}
              onContextMenu={(e) => {
                e.preventDefault();
                setSelectedAppMenu(app);
              }}
              className="flex flex-col items-center justify-start text-center group cursor-pointer"
            >
              <div
                className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-150 group-hover:scale-105 group-active:scale-95 shadow-md ${
                  isLight
                    ? 'bg-white border border-slate-200 shadow-slate-200/50'
                    : 'bg-slate-900 border border-slate-800 shadow-black/40'
                }`}
              >
                {getAppIcon(app.iconType)}

                {/* Subtle isolation indicators */}
                {app.networkAccess === 'DENY' && (
                  <div
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-slate-900 flex items-center justify-center"
                    title="Network Access Denied"
                  >
                    <div className="w-1.5 h-0.5 bg-white rounded-full" />
                  </div>
                )}
                {app.networkAccess === 'VPN_ONLY' && (
                  <div
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center"
                    title="VPN Only Enforced"
                  >
                    <div className="w-1 h-1 bg-white rounded-full" />
                  </div>
                )}
              </div>
              <span
                className={`text-[12px] font-medium mt-2 leading-tight tracking-tight truncate w-full px-1 ${
                  isLight ? 'text-slate-800' : 'text-slate-200'
                }`}
              >
                {app.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Long-press App Context Menu Dialog */}
      {selectedAppMenu && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          onClick={() => setSelectedAppMenu(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl border transition-all animate-in slide-in-from-bottom duration-200 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
            }`}
          >
            <div className="flex items-center gap-3 pb-4 border-b border-slate-700/30">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center">
                {getAppIcon(selectedAppMenu.iconType)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-sm truncate">{selectedAppMenu.name}</h4>
                <p className="text-xs text-slate-400 font-mono truncate">{selectedAppMenu.packageName}</p>
              </div>
            </div>

            <div className="space-y-1 pt-3">
              <button
                onClick={() => {
                  onOpenAppDetail(selectedAppMenu.packageName);
                  setSelectedAppMenu(null);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium ${
                  isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-slate-800 text-slate-200'
                }`}
              >
                <Info className="w-4 h-4 text-emerald-400" />
                App Info & Permissions
              </button>

              <button
                onClick={() => {
                  onNavigate('permission_manager');
                  setSelectedAppMenu(null);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium ${
                  isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-slate-800 text-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                Manage Permissions
              </button>

              <button
                onClick={() => {
                  setSelectedAppMenu(null);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium ${
                  isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-slate-800 text-slate-200'
                }`}
              >
                <Pause className="w-4 h-4 text-amber-400" />
                Pause App Execution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
