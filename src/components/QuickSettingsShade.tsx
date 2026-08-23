import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  Bluetooth,
  Plane,
  Flashlight,
  RotateCw,
  BatteryCharging,
  VolumeX,
  MapPin,
  Radio,
  Shield,
  Camera,
  Mic,
  Eye,
  Sliders,
  Sun,
  Moon,
  Monitor,
  Lock,
  ChevronDown,
  X,
  Trash2,
  Cpu,
  Power,
  Settings
} from 'lucide-react';
import { PrivacyCenterState, SystemNotification, SystemScreen, ThemeMode } from '../types/securedroid';

interface QuickSettingsShadeProps {
  isOpen: boolean;
  onClose: () => void;
  privacyState: PrivacyCenterState;
  onToggleCameraKillswitch: () => void;
  onToggleMicKillswitch: () => void;
  onToggleSensorKillswitch: () => void;
  isVpnOnlyActive: boolean;
  onToggleVpnOnly: () => void;
  isInternetOff: boolean;
  onToggleInternet: () => void;
  isLockdownActive: boolean;
  onToggleLockdown: () => void;
  onNavigateTab: (screen: SystemScreen) => void;
  notifications: SystemNotification[];
  onDismissNotification: (id: string) => void;
  onClearAllNotifications: () => void;
  themeMode: ThemeMode;
  onCycleThemeMode: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isDnd: boolean;
  onToggleDnd: () => void;
  isLight?: boolean;
}

export const QuickSettingsShade: React.FC<QuickSettingsShadeProps> = ({
  isOpen,
  onClose,
  privacyState,
  onToggleCameraKillswitch,
  onToggleMicKillswitch,
  onToggleSensorKillswitch,
  isVpnOnlyActive,
  onToggleVpnOnly,
  isInternetOff,
  onToggleInternet,
  isLockdownActive,
  onToggleLockdown,
  onNavigateTab,
  notifications,
  onDismissNotification,
  onClearAllNotifications,
  themeMode,
  onCycleThemeMode,
  isDarkMode,
  onToggleDarkMode,
  isDnd,
  onToggleDnd,
  isLight = false,
}) => {
  const [brightness, setBrightness] = useState(80);
  const [isBluetoothOn, setIsBluetoothOn] = useState(true);
  const [isAirplaneOn, setIsAirplaneOn] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isBatterySaver, setIsBatterySaver] = useState(false);
  const [isLocationOn, setIsLocationOn] = useState(true);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-md transition-all animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-xl mx-auto flex flex-col flex-1 max-h-[90vh] mt-2 rounded-3xl p-5 shadow-2xl border overflow-hidden ${
          isLight
            ? 'bg-zinc-100/95 border-zinc-200 text-zinc-900'
            : 'bg-zinc-900/95 border-zinc-800 text-zinc-100'
        }`}
      >
        {/* Top Handle & Quick Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/30">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Quick Controls</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              isLight ? 'bg-zinc-200 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
            }`}>
              {themeMode.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                onNavigateTab('settings');
                onClose();
              }}
              className={`p-2 rounded-xl transition-colors ${
                isLight ? 'hover:bg-zinc-200 text-zinc-700' : 'hover:bg-zinc-800 text-zinc-300'
              }`}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors ${
                isLight ? 'hover:bg-zinc-200 text-zinc-700' : 'hover:bg-zinc-800 text-zinc-300'
              }`}
              title="Close shade"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Brightness Slider */}
        <div className="py-3 flex items-center gap-3">
          <Sun className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="range"
            min={10}
            max={100}
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${
              isLight ? 'bg-zinc-200 accent-zinc-800' : 'bg-zinc-800 accent-zinc-200'
            }`}
          />
          <span className="text-xs font-mono font-medium text-zinc-400 w-8">{brightness}%</span>
        </div>

        {/* Quick Settings Grid */}
        <div className="grid grid-cols-4 gap-2 py-2">
          {/* Internet */}
          <button
            onClick={onToggleInternet}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
              !isInternetOff
                ? isLight
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-zinc-100 text-zinc-900 border-zinc-100'
                : isLight
                ? 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                : 'bg-zinc-800/80 border-zinc-750 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            {!isInternetOff ? <Wifi className="w-4 h-4 mb-1" /> : <WifiOff className="w-4 h-4 mb-1" />}
            <span className="text-[11px] font-medium leading-tight truncate w-full">
              {!isInternetOff ? 'Internet' : 'Offline'}
            </span>
          </button>

          {/* Bluetooth */}
          <button
            onClick={() => setIsBluetoothOn(!isBluetoothOn)}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
              isBluetoothOn
                ? isLight
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-zinc-100 text-zinc-900 border-zinc-100'
                : isLight
                ? 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                : 'bg-zinc-800/80 border-zinc-750 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <Bluetooth className="w-4 h-4 mb-1" />
            <span className="text-[11px] font-medium leading-tight truncate w-full">Bluetooth</span>
          </button>

          {/* VPN Only Mode */}
          <button
            onClick={onToggleVpnOnly}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
              isVpnOnlyActive
                ? isLight
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-zinc-100 text-zinc-900 border-zinc-100'
                : isLight
                ? 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                : 'bg-zinc-800/80 border-zinc-750 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <Shield className="w-4 h-4 mb-1" />
            <span className="text-[11px] font-medium leading-tight truncate w-full">VPN Only</span>
          </button>

          {/* Theme Mode Cycle (System / Dark / Light) */}
          <button
            onClick={onCycleThemeMode}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
              isLight
                ? 'bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50'
                : 'bg-zinc-800/80 border-zinc-750 text-zinc-200 hover:bg-zinc-800'
            }`}
            title={`Active: ${themeMode} theme`}
          >
            {themeMode === 'system' ? (
              <Monitor className="w-4 h-4 mb-1 text-zinc-400" />
            ) : isDarkMode ? (
              <Moon className="w-4 h-4 mb-1 text-zinc-300" />
            ) : (
              <Sun className="w-4 h-4 mb-1 text-zinc-700" />
            )}
            <span className="text-[11px] font-medium leading-tight truncate w-full capitalize">
              {themeMode === 'system' ? 'System' : themeMode === 'dark' ? 'Dark' : 'Light'}
            </span>
          </button>

          {/* Camera Killswitch */}
          <button
            onClick={onToggleCameraKillswitch}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
              privacyState.cameraKillSwitch
                ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
                : isLight
                ? 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                : 'bg-zinc-800/80 border-zinc-750 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Camera className="w-4 h-4 mb-1" />
            <span className="text-[11px] font-medium leading-tight truncate w-full">
              {privacyState.cameraKillSwitch ? 'Cam Cut' : 'Cam On'}
            </span>
          </button>

          {/* Mic Killswitch */}
          <button
            onClick={onToggleMicKillswitch}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
              privacyState.micKillSwitch
                ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
                : isLight
                ? 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                : 'bg-zinc-800/80 border-zinc-750 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Mic className="w-4 h-4 mb-1" />
            <span className="text-[11px] font-medium leading-tight truncate w-full">
              {privacyState.micKillSwitch ? 'Mic Cut' : 'Mic On'}
            </span>
          </button>

          {/* Sensor Killswitch */}
          <button
            onClick={onToggleSensorKillswitch}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
              privacyState.sensorKillSwitch
                ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
                : isLight
                ? 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                : 'bg-zinc-800/80 border-zinc-750 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Eye className="w-4 h-4 mb-1" />
            <span className="text-[11px] font-medium leading-tight truncate w-full">Sensors</span>
          </button>

          {/* Do Not Disturb */}
          <button
            onClick={onToggleDnd}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
              isDnd
                ? 'bg-amber-600 border-amber-600 text-white shadow-sm'
                : isLight
                ? 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                : 'bg-zinc-800/80 border-zinc-750 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <VolumeX className="w-4 h-4 mb-1" />
            <span className="text-[11px] font-medium leading-tight truncate w-full">DND</span>
          </button>

          {/* Location */}
          <button
            onClick={() => setIsLocationOn(!isLocationOn)}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
              isLocationOn
                ? isLight
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-zinc-100 text-zinc-900 border-zinc-100'
                : isLight
                ? 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                : 'bg-zinc-800/80 border-zinc-750 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <MapPin className="w-4 h-4 mb-1" />
            <span className="text-[11px] font-medium leading-tight truncate w-full">Location</span>
          </button>

          {/* Torch */}
          <button
            onClick={() => setIsTorchOn(!isTorchOn)}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
              isTorchOn
                ? isLight
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-zinc-100 text-zinc-900 border-zinc-100'
                : isLight
                ? 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                : 'bg-zinc-800/80 border-zinc-750 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <Flashlight className="w-4 h-4 mb-1" />
            <span className="text-[11px] font-medium leading-tight truncate w-full">Torch</span>
          </button>

          {/* Auto Rotate */}
          <button
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
              isAutoRotate
                ? isLight
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-zinc-100 text-zinc-900 border-zinc-100'
                : isLight
                ? 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                : 'bg-zinc-800/80 border-zinc-750 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <RotateCw className="w-4 h-4 mb-1" />
            <span className="text-[11px] font-medium leading-tight truncate w-full">Rotate</span>
          </button>

          {/* Lockdown Mode */}
          <button
            onClick={onToggleLockdown}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
              isLockdownActive
                ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
                : isLight
                ? 'bg-white border-zinc-200 text-rose-600 hover:bg-zinc-50'
                : 'bg-zinc-800/80 border-zinc-750 text-rose-400 hover:bg-zinc-800'
            }`}
          >
            <Lock className="w-4 h-4 mb-1" />
            <span className="text-[11px] font-medium leading-tight truncate w-full">Lockdown</span>
          </button>
        </div>

        {/* Notifications Section */}
        <div className="flex-1 flex flex-col min-h-0 pt-3 border-t border-zinc-800/30">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Notifications ({notifications.length})
            </span>
            {notifications.length > 0 && (
              <button
                onClick={onClearAllNotifications}
                className={`text-xs flex items-center gap-1 transition-colors ${
                  isLight ? 'text-zinc-500 hover:text-zinc-800' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {notifications.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-500">
                No new notifications
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    isLight
                      ? 'bg-white border-zinc-200 text-zinc-800'
                      : 'bg-zinc-800/70 border-zinc-750 text-zinc-200'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-medium text-zinc-400">{notif.appName}</span>
                      <span className="text-[10px] text-zinc-500">{notif.timestamp}</span>
                    </div>
                    <h5 className="text-xs font-medium leading-tight">{notif.title}</h5>
                    <p className={`text-xs mt-0.5 leading-normal ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                      {notif.message}
                    </p>
                    {notif.actionLabel && notif.actionTargetScreen && (
                      <button
                        onClick={() => {
                          onNavigateTab(notif.actionTargetScreen as SystemScreen);
                          onClose();
                        }}
                        className={`mt-2 text-xs font-medium ${isLight ? 'text-zinc-900 hover:underline' : 'text-zinc-100 hover:underline'}`}
                      >
                        {notif.actionLabel} &rarr;
                      </button>
                    )}
                  </div>
                  {notif.isDismissible && (
                    <button
                      onClick={() => onDismissNotification(notif.id)}
                      className={`p-1 rounded-full ${isLight ? 'hover:bg-zinc-100 text-zinc-400' : 'hover:bg-zinc-700 text-zinc-400'}`}
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
