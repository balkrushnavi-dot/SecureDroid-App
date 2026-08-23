import React from 'react';
import {
  Shield,
  Home,
  ShieldCheck,
  Eye,
  Smartphone,
  Globe,
  Layers,
  HardDrive,
  RotateCcw,
  Users,
  Sliders,
  Cpu,
  FileCode,
  Lock,
  Terminal,
  Settings
} from 'lucide-react';
import { HostSecurityStatus, QualitativeSecurityTier } from '../types/securedroid';

export type ActiveTab =
  | 'dashboard'
  | 'security'
  | 'privacy'
  | 'sandbox'
  | 'network'
  | 'vm_manager'
  | 'storage'
  | 'updates'
  | 'profiles'
  | 'architecture'
  | 'device'
  | 'codebase'
  | 'poco_guide';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  securityLevel: number;
  qualitativeTier?: QualitativeSecurityTier;
  hostStatus?: HostSecurityStatus;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  securityLevel,
  qualitativeTier = 'HARDWARE-BACKED',
  hostStatus = 'SECURE',
  onOpenSettings,
}) => {
  const primaryTabs = [
    { id: 'dashboard' as ActiveTab, label: 'Home', icon: Home },
    { id: 'security' as ActiveTab, label: 'Security Center', icon: ShieldCheck },
    { id: 'privacy' as ActiveTab, label: 'Privacy Center', icon: Eye },
    { id: 'sandbox' as ActiveTab, label: 'App Sandbox', icon: Smartphone },
    { id: 'network' as ActiveTab, label: 'Network Firewall', icon: Globe },
    { id: 'vm_manager' as ActiveTab, label: 'Secure VM', icon: Layers },
    { id: 'storage' as ActiveTab, label: 'Storage Floor', icon: HardDrive },
    { id: 'updates' as ActiveTab, label: 'Updates & A/B', icon: RotateCcw },
    { id: 'profiles' as ActiveTab, label: 'User Profiles', icon: Users },
    { id: 'architecture' as ActiveTab, label: 'OS Layers', icon: Sliders },
    { id: 'device' as ActiveTab, label: 'Device Profile', icon: Cpu },
    { id: 'codebase' as ActiveTab, label: 'Source Spec', icon: FileCode },
    { id: 'poco_guide' as ActiveTab, label: 'POCO Guide', icon: Terminal },
  ];

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-9 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white tracking-tight text-base font-mono">SECUREDROID OS</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 font-mono font-bold border border-sky-500/30">
                  2.0 AOSP
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl text-xs font-mono">
              <span className="text-slate-400">Host:</span>
              <span
                className={`font-bold ${
                  hostStatus === 'SECURE'
                    ? 'text-emerald-400'
                    : hostStatus === 'DEGRADED'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {hostStatus}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Tier:</span>
              <span className="text-emerald-400 font-bold">{qualitativeTier}</span>
            </div>

            {onOpenSettings && (
              <button
                id="header-settings-button"
                onClick={onOpenSettings}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                title="Target Device Diagnostics"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 overflow-x-auto no-scrollbar border-t border-slate-900/90 pt-1 pb-2">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
