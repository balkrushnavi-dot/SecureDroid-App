import React from 'react';
import {
  Smartphone,
  Shield,
  Wifi,
  HardDrive,
  Cpu,
  Trash2,
  Pause,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Eye,
  Camera,
  Mic,
  MapPin,
  Lock,
  Globe
} from 'lucide-react';
import {
  SecureDroidTopBar,
  SecureDroidCard,
  SecureDroidButton,
  SecureDroidSectionHeader,
  SecureDroidSwitch,
  SecureDroidStatusChip
} from './ui/designSystem';
import { AppSandboxInfo, NetworkAccessLevel, PermissionCategory } from '../types/securedroid';

interface AppDetailScreenProps {
  app: AppSandboxInfo;
  onBack: () => void;
  onUpdateNetworkAccess: (pkgName: string, level: NetworkAccessLevel) => void;
  onToggleHardenedMalloc?: (pkgName: string) => void;
  onToggleStrictIoctl?: (pkgName: string) => void;
  onTogglePermission: (pkgName: string, perm: PermissionCategory) => void;
  isLight?: boolean;
}

export const AppDetailScreen: React.FC<AppDetailScreenProps> = ({
  app,
  onBack,
  onUpdateNetworkAccess,
  onToggleHardenedMalloc,
  onToggleStrictIoctl,
  onTogglePermission,
  isLight = false,
}) => {
  const allPermissions: {
    id: PermissionCategory;
    key: keyof AppSandboxInfo['permissions'];
    name: string;
    icon: any;
  }[] = [
    { id: 'CAMERA', key: 'camera', name: 'Camera Access', icon: Camera },
    { id: 'MIC', key: 'microphone', name: 'Microphone Audio', icon: Mic },
    { id: 'LOCATION', key: 'location', name: 'Location GPS', icon: MapPin },
    { id: 'STORAGE', key: 'contacts', name: 'Storage & Contacts', icon: HardDrive },
    { id: 'SENSORS', key: 'sensors', name: 'Motion Sensors', icon: Eye },
  ];

  return (
    <div className={`min-h-full p-4 pb-24 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      <SecureDroidTopBar
        title={app.name}
        subtitle={`UID ${app.uid} • ${app.packageName}`}
        onBack={onBack}
        isLight={isLight}
      />

      {/* 1. App Header Card */}
      <div className="pt-4 pb-2">
        <SecureDroidCard isLight={isLight} highlight className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 flex items-center justify-center text-purple-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-base">{app.name}</h3>
                <p className="text-xs text-slate-400 font-mono">v{app.version || '1.0'}</p>
              </div>
            </div>
            <SecureDroidStatusChip
              status={app.isSystemApp ? 'DEGRADED' : 'SECURE'}
              label={app.isSystemApp ? 'System App' : 'Sandboxed User App'}
              isLight={isLight}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-700/20 mt-4 text-xs font-mono">
            <div>
              <span className="text-slate-400">SELinux Context: </span>
              <span className="text-slate-200">{app.selinuxDomain}</span>
            </div>
            <div>
              <span className="text-slate-400">Storage Used: </span>
              <span className="text-slate-200">{app.storageUsedMb || 0} MB</span>
            </div>
          </div>
        </SecureDroidCard>
      </div>

      {/* 2. Network Isolation Controls */}
      <SecureDroidSectionHeader title="Network Firewall Rule" isLight={isLight} />
      <SecureDroidCard isLight={isLight} className="p-4 space-y-3 mb-4">
        <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Per-app eBPF network firewall rule enforced at socket connect() syscalls.
        </p>
        <div className="flex gap-2">
          {(['ALLOW', 'VPN_ONLY', 'DENY'] as NetworkAccessLevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => onUpdateNetworkAccess(app.packageName, lvl)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${
                app.networkAccess === lvl
                  ? lvl === 'DENY'
                    ? 'bg-rose-600 border-rose-500 text-white'
                    : lvl === 'VPN_ONLY'
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-sky-600 border-sky-500 text-white'
                  : isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-700'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              {lvl === 'ALLOW' ? 'Unrestricted' : lvl === 'VPN_ONLY' ? 'VPN Only' : 'Block Network'}
            </button>
          ))}
        </div>
      </SecureDroidCard>

      {/* 3. Memory & Exploit Hardening */}
      <SecureDroidSectionHeader title="Memory & Sandbox Hardening" isLight={isLight} />
      <SecureDroidCard isLight={isLight} className="p-4 space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-xs font-semibold">Hardened Memory Allocator</h5>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Replace standard jemalloc with hardened_malloc guard pages
            </p>
          </div>
          <SecureDroidSwitch
            checked={true}
            onChange={() => onToggleHardenedMalloc && onToggleHardenedMalloc(app.packageName)}
            isLight={isLight}
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-700/20">
          <div>
            <h5 className="text-xs font-semibold">Strict ioctl() Syscall Filtering</h5>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Block unusual GPU/driver ioctls to eliminate kernel privilege escalation paths
            </p>
          </div>
          <SecureDroidSwitch
            checked={true}
            onChange={() => onToggleStrictIoctl && onToggleStrictIoctl(app.packageName)}
            isLight={isLight}
          />
        </div>
      </SecureDroidCard>

      {/* 4. Permissions Assigned to App */}
      <SecureDroidSectionHeader title="Runtime Permissions" isLight={isLight} />
      <div className="space-y-2 mb-4">
        {allPermissions.map((p) => {
          const Icon = p.icon;
          const permState = app.permissions ? app.permissions[p.key] : 'DENIED';
          const isGranted = permState === 'GRANTED' || permState === 'COARSE_ONLY';
          return (
            <div
              key={p.id}
              className={`p-3 rounded-2xl border flex items-center justify-between ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900/80 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium">{p.name}</span>
              </div>
              <button
                onClick={() => onTogglePermission(app.packageName, p.id)}
                className={`px-3 py-1 rounded-xl text-xs font-medium ${
                  isGranted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {isGranted ? (permState === 'COARSE_ONLY' ? 'Coarse Only' : 'Granted') : 'Denied'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
