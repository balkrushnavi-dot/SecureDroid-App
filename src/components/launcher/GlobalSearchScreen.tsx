import React, { useState, useMemo } from 'react';
import { Search, Shield, Lock, Smartphone, Wifi, Battery, Volume2, HardDrive, Eye, Terminal, ChevronRight, X, Cpu } from 'lucide-react';
import { SecureDroidSearchBar, SecureDroidListItem } from '../ui/designSystem';
import { AppSandboxInfo, SystemScreen } from '../../types/securedroid';

interface GlobalSearchScreenProps {
  onClose: () => void;
  onNavigate: (screen: SystemScreen) => void;
  onOpenAppDetail: (packageName: string) => void;
  apps: AppSandboxInfo[];
  isLight?: boolean;
}

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'APP' | 'SETTING' | 'SECURITY' | 'PRIVACY' | 'DIAGNOSTICS';
  targetScreen?: SystemScreen;
  appPackage?: string;
  icon: any;
}

export const GlobalSearchScreen: React.FC<GlobalSearchScreenProps> = ({
  onClose,
  onNavigate,
  onOpenAppDetail,
  apps,
  isLight = false,
}) => {
  const [query, setQuery] = useState('');

  const searchableItems = useMemo<SearchItem[]>(() => {
    const list: SearchItem[] = [
      // Settings entries
      { id: 'set-net', title: 'Network & Internet', subtitle: 'Wi-Fi, VPN, DNS, Per-App Firewall', category: 'SETTING', targetScreen: 'settings_network', icon: Wifi },
      { id: 'set-apps', title: 'Applications', subtitle: 'Installed apps, sandboxes & permissions', category: 'SETTING', targetScreen: 'settings_apps', icon: Smartphone },
      { id: 'set-bat', title: 'Battery & Power', subtitle: 'Battery usage, saver mode & VM consumption', category: 'SETTING', targetScreen: 'settings_battery', icon: Battery },
      { id: 'set-sto', title: 'Storage & Reserve Floor', subtitle: 'Internal storage & 20GB safety reserve', category: 'SETTING', targetScreen: 'settings_storage', icon: HardDrive },
      { id: 'set-snd', title: 'Sound & Vibration', subtitle: 'Media volume, ringtones, Do Not Disturb', category: 'SETTING', targetScreen: 'settings_sound', icon: Volume2 },
      { id: 'set-sec', title: 'Security & Privacy', subtitle: 'Verified Boot, Encryption, Permissions', category: 'SECURITY', targetScreen: 'security_center', icon: Shield },
      { id: 'set-priv', title: 'Privacy Center & Killswitches', subtitle: 'Camera, mic & sensor hardware isolation', category: 'PRIVACY', targetScreen: 'privacy_center', icon: Eye },
      { id: 'set-vm', title: 'Secure Environment (VM)', subtitle: 'Microdroid isolated virtual machine', category: 'SECURITY', targetScreen: 'secure_environment', icon: Cpu },
      { id: 'set-diag', title: 'Advanced Diagnostics', subtitle: 'Platform capabilities, KeyMint & kernel probes', category: 'DIAGNOSTICS', targetScreen: 'advanced_diagnostics', icon: Terminal },
      { id: 'set-upd', title: 'System Updates', subtitle: 'A/B dual-slot cryptographic updates', category: 'SETTING', targetScreen: 'system_updates', icon: Smartphone },
    ];

    // Add all sandbox apps
    apps.forEach((app) => {
      list.push({
        id: `app-${app.packageName}`,
        title: app.name,
        subtitle: `Package: ${app.packageName} • UID ${app.uid}`,
        category: 'APP',
        appPackage: app.packageName,
        icon: Smartphone,
      });
    });

    return list;
  }, [apps]);

  const results = useMemo(() => {
    if (!query.trim()) return searchableItems.slice(0, 8);
    const q = query.toLowerCase();
    return searchableItems.filter(
      (item) =>
        (item.title || '').toLowerCase().includes(q) ||
        (item.subtitle || '').toLowerCase().includes(q)
    );
  }, [query, searchableItems]);

  const handleSelect = (item: SearchItem) => {
    if (item.appPackage) {
      onOpenAppDetail(item.appPackage);
    } else if (item.targetScreen) {
      onNavigate(item.targetScreen);
    }
  };

  return (
    <div
      className={`min-h-full flex flex-col p-4 pb-20 ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1">
          <SecureDroidSearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search apps, settings & privacy..."
            isLight={isLight}
            onClear={() => setQuery('')}
            autoFocus
          />
        </div>
        <button
          onClick={onClose}
          className={`px-3 py-2 text-xs font-medium rounded-xl ${
            isLight ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          Cancel
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {query ? `Results (${results.length})` : 'Suggested Quick Access'}
        </div>

        {results.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No results found for &ldquo;{query}&rdquo;</p>
            <p className="text-xs mt-1">Try searching for Settings, Camera, VPN, or VM</p>
          </div>
        ) : (
          results.map((item) => (
            <SecureDroidListItem
              key={item.id}
              icon={item.icon}
              title={item.title}
              subtitle={item.subtitle}
              value={
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase ${
                  item.category === 'SECURITY' ? 'bg-emerald-500/15 text-emerald-400' :
                  item.category === 'PRIVACY' ? 'bg-sky-500/15 text-sky-400' :
                  item.category === 'APP' ? 'bg-purple-500/15 text-purple-400' :
                  'bg-slate-500/15 text-slate-400'
                }`}>
                  {item.category}
                </span>
              }
              onClick={() => handleSelect(item)}
              isLight={isLight}
            />
          ))
        )}
      </div>
    </div>
  );
};
