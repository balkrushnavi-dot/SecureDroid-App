import React from 'react';
import { Shield, Settings, Eye, Globe, MessageSquare, Cpu, Trash2, Camera, Info, ExternalLink } from 'lucide-react';
import { AppSandboxInfo, SystemScreen } from '../../types/securedroid';

interface RecentAppsScreenProps {
  apps: AppSandboxInfo[];
  onSelectApp: (screen: SystemScreen) => void;
  onClearAll: () => void;
  onOpenAppDetail: (pkgName: string) => void;
  isLight?: boolean;
}

export const RecentAppsScreen: React.FC<RecentAppsScreenProps> = ({
  apps,
  onSelectApp,
  onClearAll,
  onOpenAppDetail,
  isLight = false,
}) => {
  // Recent preview cards
  const recentCards = [
    {
      id: 'rec-security',
      title: 'Security Center',
      packageName: 'org.securedroid.security',
      targetScreen: 'security_center' as SystemScreen,
      icon: Shield,
      color: 'emerald',
      preview: 'Device protected • Verified Boot AVB 2.0 • Hardware KeyMint TEE',
    },
    {
      id: 'rec-privacy',
      title: 'Privacy Center',
      packageName: 'org.securedroid.privacy',
      targetScreen: 'privacy_center' as SystemScreen,
      icon: Eye,
      color: 'sky',
      preview: 'Camera Killswitch: Ready • Microphone Isolation • Sensor Log',
    },
    {
      id: 'rec-settings',
      title: 'Settings',
      packageName: 'com.android.settings',
      targetScreen: 'settings' as SystemScreen,
      icon: Settings,
      color: 'slate',
      preview: 'Network & Internet • Apps • Battery • Storage Reserve',
    },
    {
      id: 'rec-vm',
      title: 'Secure Environment',
      packageName: 'org.securedroid.vm',
      targetScreen: 'secure_environment' as SystemScreen,
      icon: Cpu,
      color: 'indigo',
      preview: 'Microdroid 2.0.4-signed • 20GB Host Safety Reserve Enforced',
    },
  ];

  return (
    <div
      className={`min-h-full flex flex-col justify-between p-4 pb-20 select-none ${
        isLight ? 'bg-slate-100/90 text-slate-900' : 'bg-slate-950/90 text-slate-100'
      }`}
    >
      <div className="pt-2 pb-3 px-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Recent Applications
        </span>
        <button
          onClick={onClearAll}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            isLight
              ? 'bg-white hover:bg-slate-200 border-slate-200 text-slate-700'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear All
        </button>
      </div>

      {/* Horizontal Carousel of Recent Cards */}
      <div className="flex-1 flex items-center gap-4 overflow-x-auto py-6 px-2 snap-x snap-mandatory">
        {recentCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className={`w-64 sm:w-72 shrink-0 rounded-3xl p-5 border shadow-xl flex flex-col justify-between transition-all hover:scale-[1.02] snap-center cursor-pointer ${
                isLight
                  ? 'bg-white border-slate-200 shadow-slate-200/50'
                  : 'bg-slate-900 border-slate-800 shadow-black/60'
              }`}
              onClick={() => onSelectApp(card.targetScreen)}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs truncate leading-tight">{card.title}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">{card.packageName}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenAppDetail(card.packageName);
                  }}
                  className={`p-1 rounded-full ${
                    isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
                  }`}
                  title="App Info"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card Body Preview Snapshot */}
              <div
                className={`my-4 p-4 rounded-2xl border text-xs min-h-[140px] flex flex-col justify-center ${
                  isLight
                    ? 'bg-slate-50 border-slate-100 text-slate-600'
                    : 'bg-slate-950/60 border-slate-800/60 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-medium text-[11px] text-slate-300">Live Snapshot</span>
                </div>
                <p className="line-clamp-3 leading-relaxed">{card.preview}</p>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectApp(card.targetScreen);
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 hover:text-emerald-400"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Switch to App
                </button>
                <span className="text-[10px] text-slate-500 font-mono">PID 1420</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center text-xs text-slate-500 py-2">
        Swipe up or tap an app card to return to active task
      </div>
    </div>
  );
};
