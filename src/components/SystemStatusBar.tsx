import React from 'react';
import { Wifi, Signal, Battery, Shield, Eye, Lock, VolumeX } from 'lucide-react';
import { PrivacyCenterState } from '../types/securedroid';

interface SystemStatusBarProps {
  privacyState: PrivacyCenterState;
  onOpenQuickSettings: () => void;
  onOpenPrivacyCenter: () => void;
  isLockdownActive?: boolean;
  timeString: string;
  isLight?: boolean;
  batteryLevel?: number;
  isVpnActive?: boolean;
  isDndActive?: boolean;
}

export const SystemStatusBar: React.FC<SystemStatusBarProps> = ({
  privacyState,
  onOpenQuickSettings,
  onOpenPrivacyCenter,
  isLockdownActive = false,
  timeString,
  isLight = false,
  batteryLevel = 84,
  isVpnActive = true,
  isDndActive = false,
}) => {
  const isCameraActive = privacyState.activeCameraApps.length > 0;
  const isMicActive = privacyState.activeMicApps.length > 0;
  const isLocationActive = privacyState.activeLocationApps.length > 0;
  const isSensorActive = isCameraActive || isMicActive || isLocationActive;

  return (
    <div
      onClick={onOpenQuickSettings}
      role="button"
      tabIndex={0}
      aria-label="Status bar. Click or drag to open Quick Settings and Notifications."
      className={`w-full select-none cursor-pointer z-40 px-5 pt-2.5 pb-2 transition-colors flex items-center justify-between text-xs font-medium tracking-tight border-b ${
        isLight
          ? 'bg-zinc-100/95 border-zinc-200 text-zinc-800 backdrop-blur-md'
          : 'bg-zinc-950/95 border-zinc-900 text-zinc-200 backdrop-blur-md'
      }`}
    >
      {/* Left side: Real-time Clock and subtle notification/lockdown status */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-[13px] tracking-normal font-sans">
          {timeString}
        </span>

        {isLockdownActive && (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-mono border border-rose-500/30">
            <Lock className="w-2.5 h-2.5" />
            LOCKDOWN
          </span>
        )}

        {isDndActive && (
          <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
        )}
      </div>

      {/* Center: Active Privacy Sensor Indicator Pill */}
      {isSensorActive ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenPrivacyCenter();
          }}
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium shadow-sm transition-colors ${
            isLight ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-900'
          }`}
          title="Hardware sensors active in foreground app"
        >
          <div className={`w-1.5 h-1.5 rounded-full ${isLight ? 'bg-white' : 'bg-zinc-900'}`} />
          {isCameraActive && <span>Camera</span>}
          {isMicActive && <span>Mic</span>}
          {isLocationActive && <span>GPS</span>}
        </button>
      ) : (
        <div className="flex items-center gap-1 opacity-60">
          <Shield className="w-3 h-3 text-zinc-400" />
          <span className="text-[10px] text-zinc-400 font-mono">SecureDroid</span>
        </div>
      )}

      {/* Right side: Hardware Radios & Battery Level */}
      <div className="flex items-center gap-2 text-zinc-400">
        {isVpnActive && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
            isLight ? 'bg-zinc-200 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
          }`}>
            VPN
          </span>
        )}
        <Wifi className="w-3.5 h-3.5" />
        <Signal className="w-3.5 h-3.5" />
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-mono">{batteryLevel}%</span>
          <Battery className="w-4 h-4 text-zinc-400" />
        </div>
      </div>
    </div>
  );
};
