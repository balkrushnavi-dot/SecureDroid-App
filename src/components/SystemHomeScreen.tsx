import React from 'react';
import {
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
  Grid,
  Search,
  CheckCircle2,
  Calendar,
  CloudSun,
  Battery,
  HardDrive,
  Lock,
  Phone,
  Terminal,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { DeviceProfile, HostSecurityStatus, PrivacyCenterState, QualitativeSecurityTier, SystemScreen } from '../types/securedroid';

interface SystemHomeScreenProps {
  profile: DeviceProfile;
  hostStatus: HostSecurityStatus;
  qualitativeTier: QualitativeSecurityTier;
  privacyState: PrivacyCenterState;
  onNavigateTab: (screen: SystemScreen) => void;
  onOpenAppDrawer: () => void;
  onOpenSearch: () => void;
  isLight?: boolean;
}

export const SystemHomeScreen: React.FC<SystemHomeScreenProps> = ({
  profile,
  hostStatus,
  qualitativeTier,
  privacyState,
  onNavigateTab,
  onOpenAppDrawer,
  onOpenSearch,
  isLight = false,
}) => {
  const isSecure = hostStatus === 'SECURE';
  const now = new Date();
  const dateStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(now);

  const dockApps = [
    {
      id: 'phone',
      name: 'Phone',
      icon: Phone,
      color: isLight ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-900',
      action: () => onNavigateTab('app_sandbox'),
    },
    {
      id: 'messages',
      name: 'Messages',
      icon: MessageSquare,
      color: isLight ? 'bg-zinc-200 text-zinc-800' : 'bg-zinc-800 text-zinc-200',
      action: () => onNavigateTab('app_sandbox'),
    },
    {
      id: 'browser',
      name: 'Browser',
      icon: Globe,
      color: isLight ? 'bg-zinc-200 text-zinc-800' : 'bg-zinc-800 text-zinc-200',
      action: () => onNavigateTab('browser_web_security'),
    },
    {
      id: 'camera',
      name: 'Camera',
      icon: Camera,
      color: isLight ? 'bg-zinc-200 text-zinc-800' : 'bg-zinc-800 text-zinc-200',
      action: () => onNavigateTab('complete_sensor_privacy'),
    },
    {
      id: 'drawer',
      name: 'Apps',
      icon: Grid,
      color: isLight ? 'bg-zinc-200 text-zinc-800' : 'bg-zinc-800 text-zinc-200',
      action: onOpenAppDrawer,
    },
  ];

  return (
    <div
      className={`min-h-full flex flex-col justify-between p-4 sm:p-6 pb-20 select-none transition-colors ${
        isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'
      }`}
    >
      {/* 1. Top Section: Date, Weather & Search Pill */}
      <div>
        <div className="flex items-center justify-between pt-2 pb-4">
          <div className="flex items-center gap-2">
            <Calendar className={`w-4 h-4 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`} />
            <span className={`text-sm font-medium ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>{dateStr}</span>
          </div>

          <div className={`flex items-center gap-1.5 text-xs ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
            <CloudSun className="w-4 h-4" />
            <span>22°C Clear</span>
          </div>
        </div>

        {/* Minimal System Search Widget */}
        <div
          onClick={onOpenSearch}
          className={`flex items-center px-4 py-3 rounded-2xl border cursor-pointer transition-all active:scale-[0.99] shadow-sm mb-6 ${
            isLight
              ? 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
          }`}
        >
          <Search className="w-4 h-4 mr-3 text-zinc-400" />
          <span className="text-sm">Search apps, settings & privacy...</span>
        </div>

        {/* 2. System Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* Security Status Card */}
          <div
            onClick={() => onNavigateTab('security_center')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all active:scale-[0.99] flex flex-col justify-between ${
              isLight
                ? 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-800 text-zinc-200'
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className={`text-[11px] font-medium uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Security Status
                  </h4>
                  <p className="text-sm font-medium">Device Protected</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </div>

            <div className="space-y-1.5 pt-2 border-t border-zinc-800/30 text-xs">
              <div className={`flex items-center gap-2 ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
                <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span>Verified Boot AVB 2.0 Locked</span>
              </div>
              <div className={`flex items-center gap-2 ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
                <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span>Hardware KeyMint TEE Active</span>
              </div>
            </div>
          </div>

          {/* Secure Environment (VM) Widget */}
          <div
            onClick={() => onNavigateTab('secure_environment')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all active:scale-[0.99] flex flex-col justify-between ${
              isLight
                ? 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-800 text-zinc-200'
                }`}>
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className={`text-[11px] font-medium uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Guest Environment
                  </h4>
                  <p className="text-sm font-medium">Microdroid VM</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </div>

            <div className="pt-2 border-t border-zinc-800/30 flex items-center justify-between text-xs">
              <div>
                <span className={isLight ? 'text-zinc-500' : 'text-zinc-400'}>State: </span>
                <span className="font-mono text-zinc-400">Stopped</span>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium border ${
                isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-700' : 'bg-zinc-800 border-zinc-700 text-zinc-300'
              }`}>
                Open VM &rarr;
              </span>
            </div>
          </div>
        </div>

        {/* 3. Primary Home Screen App Grid (Clean Minimalist Icons) */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-y-5 gap-x-4 pt-1">
          {/* Security Center */}
          <button
            onClick={() => onNavigateTab('security_center')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className={`w-13 h-13 rounded-2xl border flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-all shadow-sm ${
              isLight ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
            }`}>
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium mt-1.5 leading-tight">Security</span>
          </button>

          {/* Privacy Center */}
          <button
            onClick={() => onNavigateTab('privacy_center')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className={`w-13 h-13 rounded-2xl border flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-all shadow-sm ${
              isLight ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
            }`}>
              <Eye className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium mt-1.5 leading-tight">Privacy</span>
          </button>

          {/* Secure Environment */}
          <button
            onClick={() => onNavigateTab('secure_environment')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className={`w-13 h-13 rounded-2xl border flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-all shadow-sm ${
              isLight ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
            }`}>
              <Cpu className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium mt-1.5 leading-tight">VM</span>
          </button>

          {/* Android Settings */}
          <button
            onClick={() => onNavigateTab('settings')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className={`w-13 h-13 rounded-2xl border flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-all shadow-sm ${
              isLight ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
            }`}>
              <Settings className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium mt-1.5 leading-tight">Settings</span>
          </button>

          {/* Vault Files */}
          <button
            onClick={() => onNavigateTab('app_sandbox')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className={`w-13 h-13 rounded-2xl border flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-all shadow-sm ${
              isLight ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
            }`}>
              <FolderLock className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium mt-1.5 leading-tight">Vault</span>
          </button>

          {/* Banking Sandbox */}
          <button
            onClick={() => onNavigateTab('app_sandbox')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className={`w-13 h-13 rounded-2xl border flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-all shadow-sm ${
              isLight ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
            }`}>
              <Landmark className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium mt-1.5 leading-tight">Banking</span>
          </button>

          {/* Calculator */}
          <button
            onClick={() => onNavigateTab('app_sandbox')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className={`w-13 h-13 rounded-2xl border flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-all shadow-sm ${
              isLight ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
            }`}>
              <Calculator className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium mt-1.5 leading-tight">Calculator</span>
          </button>

          {/* Gallery */}
          <button
            onClick={() => onNavigateTab('app_sandbox')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className={`w-13 h-13 rounded-2xl border flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-all shadow-sm ${
              isLight ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
            }`}>
              <ImageIcon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium mt-1.5 leading-tight">Gallery</span>
          </button>

          {/* Advanced Diagnostics */}
          <button
            onClick={() => onNavigateTab('advanced_diagnostics')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className={`w-13 h-13 rounded-2xl border flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-all shadow-sm ${
              isLight ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
            }`}>
              <Terminal className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium mt-1.5 leading-tight">Diagnostics</span>
          </button>
        </div>
      </div>

      {/* 4. Bottom Minimal Dock */}
      <div className="pt-6">
        <div
          className={`flex items-center justify-around py-3 px-4 rounded-3xl border shadow-lg ${
            isLight
              ? 'bg-white/90 border-zinc-200 shadow-zinc-200/50 backdrop-blur-md'
              : 'bg-zinc-900/90 border-zinc-800 shadow-black/50 backdrop-blur-md'
          }`}
        >
          {dockApps.map((app) => {
            const Icon = app.icon;
            return (
              <button
                key={app.id}
                onClick={app.action}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-all shadow-sm ${app.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
