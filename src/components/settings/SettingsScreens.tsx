import React, { useState } from 'react';
import {
  Wifi,
  Smartphone,
  Battery,
  HardDrive,
  Volume2,
  Sun,
  Moon,
  Monitor,
  Palette,
  Shield,
  Eye,
  MapPin,
  Users,
  Accessibility,
  Info,
  ChevronRight,
  Bluetooth,
  Usb,
  Lock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sliders,
  Cpu,
  Trash2,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Download,
  MoveHorizontal
} from 'lucide-react';
import {
  SecureDroidTopBar,
  SecureDroidListItem,
  SecureDroidSectionHeader,
  SecureDroidCard,
  SecureDroidSwitch,
  SecureDroidSlider,
  SecureDroidStatusChip,
  SecureDroidButton
} from '../ui/designSystem';
import {
  AppSandboxInfo,
  DeviceProfile,
  HostSecurityStatus,
  QualitativeSecurityTier,
  SystemScreen,
  ThemeMode,
  AccentColor
} from '../../types/securedroid';

// -------------------------------------------------------------
// 1. Settings Home Root Screen
// -------------------------------------------------------------
interface SettingsHomeScreenProps {
  onNavigate: (screen: SystemScreen) => void;
  profile: DeviceProfile;
  hostStatus: HostSecurityStatus;
  qualitativeTier: QualitativeSecurityTier;
  isLight?: boolean;
}

export const SettingsHomeScreen: React.FC<SettingsHomeScreenProps> = ({
  onNavigate,
  profile,
  hostStatus,
  qualitativeTier,
  isLight = false,
}) => {
  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar
        title="Settings"
        subtitle="SecureDroid OS • Minimal Hardened Android"
        isLight={isLight}
      />

      {/* Top Security & Privacy Hero Banner */}
      <div className="pt-4 pb-2">
        <SecureDroidCard
          onClick={() => onNavigate('security_center')}
          isLight={isLight}
          highlight
          className="mb-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-800 text-zinc-200'
              }`}>
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Security & Privacy</h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Protected • Hardware KeyMint TEE • AVB 2.0 Locked
                </p>
              </div>
            </div>
            <SecureDroidStatusChip status={hostStatus} label="Protected" isLight={isLight} />
          </div>
        </SecureDroidCard>
      </div>

      {/* Settings Categories List */}
      <div className="space-y-1">
        <SecureDroidSectionHeader title="Connectivity & Devices" isLight={isLight} />
        <SecureDroidListItem
          icon={Wifi}
          iconBgColor={isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'}
          title="Network & Internet"
          subtitle="Wi-Fi, Mobile, VPN, Private DNS, Per-App Firewall"
          onClick={() => onNavigate('settings_network')}
          isLight={isLight}
        />
        <SecureDroidListItem
          icon={Bluetooth}
          iconBgColor={isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'}
          title="Connected Devices"
          subtitle="Bluetooth, USB Security, Peripheral Lockdown"
          onClick={() => onNavigate('settings_connected')}
          isLight={isLight}
        />

        <SecureDroidSectionHeader title="System & Appearance" isLight={isLight} />
        <SecureDroidListItem
          icon={Smartphone}
          iconBgColor={isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'}
          title="Apps & Sandboxing"
          subtitle="Installed applications, permissions & network isolation"
          onClick={() => onNavigate('settings_apps')}
          isLight={isLight}
        />
        <SecureDroidListItem
          icon={MoveHorizontal}
          iconBgColor={isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'}
          title="System Navigation"
          subtitle="3-Button, Gesture pill, or Native Phone Navigation"
          onClick={() => onNavigate('settings_navigation')}
          isLight={isLight}
        />
        <SecureDroidListItem
          icon={Palette}
          iconBgColor={isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'}
          title="Wallpaper & Style"
          subtitle="System theme, Minimal dark/light mode, Color accents"
          onClick={() => onNavigate('settings_wallpaper')}
          isLight={isLight}
        />
        <SecureDroidListItem
          icon={Sun}
          iconBgColor={isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'}
          title="Display"
          subtitle="Theme mode, Brightness, Screen timeout, Font scale"
          onClick={() => onNavigate('settings_wallpaper')}
          isLight={isLight}
        />
        <SecureDroidListItem
          icon={Volume2}
          iconBgColor={isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'}
          title="Sound & Vibration"
          subtitle="Volume sliders, Do Not Disturb, Haptics"
          onClick={() => onNavigate('settings_sound')}
          isLight={isLight}
        />

        <SecureDroidSectionHeader title="Security & Resources" isLight={isLight} />
        <SecureDroidListItem
          icon={Battery}
          iconBgColor={isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'}
          title="Battery"
          subtitle="84% • Estimated 1d 4h remaining"
          onClick={() => onNavigate('settings_battery')}
          isLight={isLight}
        />
        <SecureDroidListItem
          icon={HardDrive}
          iconBgColor={isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'}
          title="Storage"
          subtitle="54.2 GB used of 256 GB • 20 GB Host safety reserve"
          onClick={() => onNavigate('settings_storage')}
          isLight={isLight}
        />
        <SecureDroidListItem
          icon={Cpu}
          iconBgColor={isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'}
          title="Secure Environment (VM)"
          subtitle="Microdroid isolated guest execution tier"
          onClick={() => onNavigate('secure_environment')}
          isLight={isLight}
        />
        <SecureDroidListItem
          icon={Users}
          iconBgColor={isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'}
          title="Users & Profiles"
          subtitle="Owner profile, Guest mode isolation"
          onClick={() => onNavigate('settings_users')}
          isLight={isLight}
        />
        <SecureDroidListItem
          icon={Accessibility}
          iconBgColor={isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'}
          title="Accessibility"
          subtitle="Display scaling, High contrast, Reduced motion"
          onClick={() => onNavigate('settings_accessibility')}
          isLight={isLight}
        />

        <SecureDroidSectionHeader title="Installation & System" isLight={isLight} />
        <SecureDroidListItem
          icon={Download}
          iconBgColor={isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'}
          title="Install as Phone App"
          subtitle="PWA standalone install guide for Android and iOS"
          onClick={() => onNavigate('settings_install_app')}
          isLight={isLight}
        />
        <SecureDroidListItem
          icon={RotateCcw}
          iconBgColor={isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'}
          title="System"
          subtitle="A/B Updates, Gestures, Backup"
          onClick={() => onNavigate('settings_system')}
          isLight={isLight}
        />
        <SecureDroidListItem
          icon={Info}
          iconBgColor={isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'}
          title="About SecureDroid"
          subtitle={`${profile.name} • Android 14 • Kernel ${profile.kernelVersion}`}
          onClick={() => onNavigate('settings_about')}
          isLight={isLight}
        />
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. Network & Internet Settings Screen
// -------------------------------------------------------------
interface SettingsNetworkScreenProps {
  onBack: () => void;
  isInternetOff: boolean;
  onToggleInternet: () => void;
  isVpnOnlyActive: boolean;
  onToggleVpnOnly: () => void;
  isLight?: boolean;
}

export const SettingsNetworkScreen: React.FC<SettingsNetworkScreenProps> = ({
  onBack,
  isInternetOff,
  onToggleInternet,
  isVpnOnlyActive,
  onToggleVpnOnly,
  isLight = false,
}) => {
  const [privateDns, setPrivateDns] = useState<'dns.quad9.net' | 'cloudflare-dns.com' | 'off'>('dns.quad9.net');

  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar title="Network & Internet" onBack={onBack} isLight={isLight} />

      <div className="pt-4 space-y-4">
        <SecureDroidCard isLight={isLight}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm">Internet Connectivity</h4>
              <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {!isInternetOff ? 'Wi-Fi & Cellular Connected' : 'All network interfaces hardware blocked'}
              </p>
            </div>
            <SecureDroidSwitch
              checked={!isInternetOff}
              onChange={onToggleInternet}
              isLight={isLight}
            />
          </div>
        </SecureDroidCard>

        <SecureDroidSectionHeader title="SecureDroid Network Protection" isLight={isLight} />

        <SecureDroidCard isLight={isLight}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-sm">VPN-Only Lockdown Mode</h4>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Block all cleartext connections when VPN is disconnected
                </p>
              </div>
              <SecureDroidSwitch
                checked={isVpnOnlyActive}
                onChange={onToggleVpnOnly}
                isLight={isLight}
              />
            </div>

            <div className="pt-3 border-t border-zinc-800/40">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className={`font-medium ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Private DNS (DoT / DoH)</span>
                <span className="font-mono text-xs">{privateDns}</span>
              </div>
              <div className="flex gap-2">
                {['dns.quad9.net', 'cloudflare-dns.com', 'off'].map((dns) => (
                  <button
                    key={dns}
                    onClick={() => setPrivateDns(dns as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                      privateDns === dns
                        ? isLight
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-100 text-zinc-900'
                        : isLight
                        ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
                    }`}
                  >
                    {dns}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SecureDroidCard>

        <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
          isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-700' : 'bg-zinc-900/80 border-zinc-800 text-zinc-400'
        }`}>
          <div className="flex items-center gap-2 mb-1 font-medium text-zinc-900 dark:text-zinc-100">
            <Shield className="w-4 h-4" />
            <span>Kernel eBPF Netfilter Policy</span>
          </div>
          <p>
            In production AOSP builds, per-app network policies are enforced via kernel eBPF cgroup filters in netd.
          </p>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 3. Connected Devices & USB Security Screen
// -------------------------------------------------------------
interface SettingsConnectedScreenProps {
  onBack: () => void;
  isLight?: boolean;
}

export const SettingsConnectedScreen: React.FC<SettingsConnectedScreenProps> = ({
  onBack,
  isLight = false,
}) => {
  const [usbDataLocked, setUsbDataLocked] = useState(true);
  const [usbDebugging, setUsbDebugging] = useState(false);

  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar title="Connected Devices & USB" onBack={onBack} isLight={isLight} />

      <div className="pt-4 space-y-4">
        <SecureDroidSectionHeader title="USB Security Policy" isLight={isLight} />

        <SecureDroidCard isLight={isLight}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-sm">Disable USB Data When Locked</h4>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Only allow battery charging when device is locked
                </p>
              </div>
              <SecureDroidSwitch
                checked={usbDataLocked}
                onChange={setUsbDataLocked}
                isLight={isLight}
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800/40">
              <div>
                <h4 className="font-medium text-sm">USB Debugging (ADB)</h4>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Developer debugging interface over USB
                </p>
              </div>
              <SecureDroidSwitch
                checked={usbDebugging}
                onChange={setUsbDebugging}
                isLight={isLight}
              />
            </div>
          </div>
        </SecureDroidCard>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 4. Battery Settings Screen
// -------------------------------------------------------------
interface SettingsBatteryScreenProps {
  onBack: () => void;
  isLight?: boolean;
}

export const SettingsBatteryScreen: React.FC<SettingsBatteryScreenProps> = ({
  onBack,
  isLight = false,
}) => {
  const [batterySaver, setBatterySaver] = useState(false);

  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar title="Battery" onBack={onBack} isLight={isLight} />

      <div className="pt-4 space-y-4">
        <SecureDroidCard isLight={isLight} className="text-center py-6">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
            isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-800 text-zinc-200'
          }`}>
            <Battery className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-light tracking-tight">84%</h2>
          <p className={`text-xs mt-1 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Estimated 1 day 4 hours remaining
          </p>
        </SecureDroidCard>

        <SecureDroidCard isLight={isLight}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm">Battery Saver</h4>
              <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Turn on dark theme, limit background activity & restrict background sensors
              </p>
            </div>
            <SecureDroidSwitch
              checked={batterySaver}
              onChange={setBatterySaver}
              isLight={isLight}
            />
          </div>
        </SecureDroidCard>

        <SecureDroidSectionHeader title="Subsystem Power Breakdown" isLight={isLight} />
        <div className="space-y-2 text-xs">
          <div className={`flex justify-between p-3 rounded-xl border ${
            isLight ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-300'
          }`}>
            <span>Display & System UI</span>
            <span className="font-mono font-medium">42%</span>
          </div>
          <div className={`flex justify-between p-3 rounded-xl border ${
            isLight ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-300'
          }`}>
            <span>Secure Environment (Microdroid VM)</span>
            <span className="font-mono text-zinc-500">0% (Stopped)</span>
          </div>
          <div className={`flex justify-between p-3 rounded-xl border ${
            isLight ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-300'
          }`}>
            <span>Cellular Radio & Wi-Fi</span>
            <span className="font-mono font-medium">18%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 5. Storage Settings Screen (20 GB Safety Reserve)
// -------------------------------------------------------------
interface SettingsStorageScreenProps {
  onBack: () => void;
  profile: DeviceProfile;
  isLight?: boolean;
}

export const SettingsStorageScreen: React.FC<SettingsStorageScreenProps> = ({
  onBack,
  profile,
  isLight = false,
}) => {
  const totalGb = profile.totalStorageGb;
  const usedGb = 54.2;
  const freeGb = totalGb - usedGb;
  const safetyReserveGb = 20.0;
  const safeGrowthAvailable = freeGb - safetyReserveGb;

  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar title="Storage" onBack={onBack} isLight={isLight} />

      <div className="pt-4 space-y-4">
        <SecureDroidCard isLight={isLight}>
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-2xl font-light">{usedGb.toFixed(1)} GB</h3>
              <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Used of {totalGb} GB Total Flash
              </p>
            </div>
            <SecureDroidStatusChip status="SECURE" label="Reserve Protected" isLight={isLight} />
          </div>

          {/* Storage Segment Bar */}
          <div className={`h-2.5 rounded-full overflow-hidden flex my-3 ${isLight ? 'bg-zinc-200' : 'bg-zinc-800'}`}>
            <div className="bg-zinc-600 h-full" style={{ width: '22%' }} title="System Apps & OS" />
            <div className="bg-zinc-400 h-full" style={{ width: '6%' }} title="User Data & Files" />
            <div className="bg-zinc-500 h-full" style={{ width: '2%' }} title="VM Containers" />
            <div className="bg-zinc-750 h-full" style={{ width: `${(safetyReserveGb / totalGb) * 100}%` }} title="20GB Safety Reserve Floor" />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-zinc-600" />
              <span className={isLight ? 'text-zinc-600' : 'text-zinc-400'}>System OS (32.1 GB)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-zinc-400" />
              <span className={isLight ? 'text-zinc-600' : 'text-zinc-400'}>Reserve Floor (20.0 GB)</span>
            </div>
          </div>
        </SecureDroidCard>

        {/* Safety Reserve Floor Explanation */}
        <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
          isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-700' : 'bg-zinc-900 border-zinc-800 text-zinc-300'
        }`}>
          <div className="flex items-center gap-2 mb-1 font-medium text-zinc-900 dark:text-zinc-100">
            <Shield className="w-4 h-4" />
            <span>20.0 GB Host OS Flash Protection Active</span>
          </div>
          <p>
            SecureDroid mandates a 20.0 GB host reserve floor. Virtual machine sparse disk expansion will be automatically
            paused before it can starve host flash. Safe expansion remaining: <strong className="font-mono">{safeGrowthAvailable.toFixed(1)} GB</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 6. Wallpaper & Style Screen (With System Theme & Minimal Accents)
// -------------------------------------------------------------
interface SettingsWallpaperScreenProps {
  onBack: () => void;
  accent: AccentColor;
  setAccent: (a: AccentColor) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isLight?: boolean;
}

export const SettingsWallpaperScreen: React.FC<SettingsWallpaperScreenProps> = ({
  onBack,
  accent,
  setAccent,
  themeMode,
  setThemeMode,
  isLight = false,
}) => {
  const accents: { id: AccentColor; label: string; color: string }[] = [
    { id: 'slate', label: 'Monochrome', color: 'bg-zinc-600' },
    { id: 'sage', label: 'Sage', color: 'bg-stone-500' },
    { id: 'steel', label: 'Steel', color: 'bg-slate-500' },
    { id: 'sand', label: 'Sand', color: 'bg-amber-700/80' },
    { id: 'graphite', label: 'Graphite', color: 'bg-zinc-800' },
  ];

  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar title="Wallpaper & Style" onBack={onBack} isLight={isLight} />

      <div className="pt-4 space-y-4">
        {/* System Theme Mode Selector */}
        <SecureDroidCard isLight={isLight}>
          <div className="mb-3">
            <h4 className="font-medium text-sm">Theme Appearance</h4>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Choose system-synchronized appearance or fixed theme
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setThemeMode('system')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                themeMode === 'system'
                  ? isLight
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                    : 'bg-zinc-100 text-zinc-900 border-zinc-100 shadow-sm'
                  : isLight
                  ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700'
                  : 'bg-zinc-850 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
              }`}
            >
              <Monitor className="w-4 h-4 shrink-0" />
              <span className="text-xs font-medium">System</span>
              <span className="text-[10px] opacity-75">Auto sync</span>
            </button>

            <button
              onClick={() => setThemeMode('dark')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                themeMode === 'dark'
                  ? isLight
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                    : 'bg-zinc-100 text-zinc-900 border-zinc-100 shadow-sm'
                  : isLight
                  ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700'
                  : 'bg-zinc-850 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
              }`}
            >
              <Moon className="w-4 h-4 shrink-0" />
              <span className="text-xs font-medium">Dark</span>
              <span className="text-[10px] opacity-75">Eye-safe</span>
            </button>

            <button
              onClick={() => setThemeMode('light')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                themeMode === 'light'
                  ? isLight
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                    : 'bg-zinc-100 text-zinc-900 border-zinc-100 shadow-sm'
                  : isLight
                  ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700'
                  : 'bg-zinc-850 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
              }`}
            >
              <Sun className="w-4 h-4 shrink-0" />
              <span className="text-xs font-medium">Light</span>
              <span className="text-[10px] opacity-75">Crisp paper</span>
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-zinc-800/30 text-xs">
            <span className={isLight ? 'text-zinc-500' : 'text-zinc-400'}>
              {themeMode === 'system'
                ? 'System mode is active: automatically follows your device OS / browser dark or light preference.'
                : themeMode === 'dark'
                ? 'Dark mode is locked: minimal deep zinc contrast.'
                : 'Light mode is locked: clean high-contrast neutral layout.'}
            </span>
          </div>
        </SecureDroidCard>

        {/* Minimal Neutral Color Accents */}
        <SecureDroidSectionHeader title="Color Palette Accents" isLight={isLight} />
        <div className="grid grid-cols-5 gap-2.5">
          {accents.map((item) => (
            <button
              key={item.id}
              onClick={() => setAccent(item.id)}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                accent === item.id
                  ? isLight
                    ? 'ring-2 ring-zinc-800 border-transparent bg-zinc-100'
                    : 'ring-2 ring-zinc-400 border-transparent bg-zinc-800'
                  : isLight
                  ? 'bg-white border-zinc-200 hover:bg-zinc-50'
                  : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              <div className={`w-6 h-6 rounded-full ${item.color}`} />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 7. About SecureDroid Screen
// -------------------------------------------------------------
interface SettingsAboutScreenProps {
  onBack: () => void;
  onOpenDiagnostics: () => void;
  profile: DeviceProfile;
  isLight?: boolean;
}

export const SettingsAboutScreen: React.FC<SettingsAboutScreenProps> = ({
  onBack,
  onOpenDiagnostics,
  profile,
  isLight = false,
}) => {
  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar title="About SecureDroid" onBack={onBack} isLight={isLight} />

      <div className="pt-4 space-y-4">
        <SecureDroidCard isLight={isLight}>
          <div className="flex items-center gap-3.5 pb-4 border-b border-zinc-800/30">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-800 text-zinc-200'
            }`}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-base">SecureDroid OS</h3>
              <p className={`text-xs font-mono ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>v2.0.0 (Hardened Minimal)</p>
            </div>
          </div>

          <div className="divide-y divide-zinc-800/20 text-xs pt-2">
            <div className="flex justify-between py-2.5">
              <span className={isLight ? 'text-zinc-500' : 'text-zinc-400'}>Device Model</span>
              <span className="font-medium">{profile.name}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className={isLight ? 'text-zinc-500' : 'text-zinc-400'}>Chipset & SoC</span>
              <span className="font-mono">{profile.chipset}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className={isLight ? 'text-zinc-500' : 'text-zinc-400'}>Android Version Base</span>
              <span className="font-mono">14 (Vanilla Ice Cream)</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className={isLight ? 'text-zinc-500' : 'text-zinc-400'}>Linux Kernel Version</span>
              <span className="font-mono">{profile.kernelVersion}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className={isLight ? 'text-zinc-500' : 'text-zinc-400'}>Security Patch Level</span>
              <span className="font-mono font-medium">2026-08-01</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className={isLight ? 'text-zinc-500' : 'text-zinc-400'}>Verified Boot (AVB 2.0)</span>
              <span className="font-mono font-medium">Locked (Green)</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className={isLight ? 'text-zinc-500' : 'text-zinc-400'}>Key Protection</span>
              <span className="font-mono font-medium">Hardware TEE (KeyMint 3.0)</span>
            </div>
          </div>
        </SecureDroidCard>

        {/* Level 3 Link */}
        <SecureDroidButton
          variant="secondary"
          onClick={onOpenDiagnostics}
          isLight={isLight}
          className="w-full py-3"
          icon={ExternalLink}
        >
          Open Advanced Technical Diagnostics
        </SecureDroidButton>
      </div>
    </div>
  );
};
