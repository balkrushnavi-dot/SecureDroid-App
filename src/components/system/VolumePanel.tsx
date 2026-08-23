import React from 'react';
import { Volume2, Bell, AlarmClock, PhoneCall, VolumeX, X } from 'lucide-react';
import { SecureDroidSlider } from '../ui/designSystem';

interface VolumePanelProps {
  isOpen: boolean;
  onClose: () => void;
  isLight?: boolean;
  mediaVolume: number;
  setMediaVolume: (v: number) => void;
  ringVolume: number;
  setRingVolume: (v: number) => void;
  alarmVolume: number;
  setAlarmVolume: (v: number) => void;
  isDnd: boolean;
  setIsDnd: (v: boolean) => void;
}

export const VolumePanel: React.FC<VolumePanelProps> = ({
  isOpen,
  onClose,
  isLight = false,
  mediaVolume,
  setMediaVolume,
  ringVolume,
  setRingVolume,
  alarmVolume,
  setAlarmVolume,
  isDnd,
  setIsDnd,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-slate-950/40 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-72 rounded-3xl p-5 shadow-2xl border transition-all animate-in slide-in-from-right duration-200 ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/30">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-emerald-500" />
            <span className="font-semibold text-sm">Sound & Volume</span>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-full ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 pt-4">
          {/* Media Volume */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Volume2 className="w-3.5 h-3.5" /> Media
              </span>
              <span className="font-mono text-emerald-500">{mediaVolume}%</span>
            </div>
            <SecureDroidSlider
              value={mediaVolume}
              min={0}
              max={100}
              onChange={setMediaVolume}
              isLight={isLight}
            />
          </div>

          {/* Ring & Notifications Volume */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Bell className="w-3.5 h-3.5" /> Ring & Notifications
              </span>
              <span className="font-mono text-emerald-500">{ringVolume}%</span>
            </div>
            <SecureDroidSlider
              value={ringVolume}
              min={0}
              max={100}
              onChange={setRingVolume}
              isLight={isLight}
            />
          </div>

          {/* Alarm Volume */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-400">
                <AlarmClock className="w-3.5 h-3.5" /> Alarm
              </span>
              <span className="font-mono text-emerald-500">{alarmVolume}%</span>
            </div>
            <SecureDroidSlider
              value={alarmVolume}
              min={0}
              max={100}
              onChange={setAlarmVolume}
              isLight={isLight}
            />
          </div>

          {/* Do Not Disturb Toggle */}
          <div className="pt-2 border-t border-slate-700/30">
            <button
              onClick={() => setIsDnd(!isDnd)}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-colors ${
                isDnd
                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                  : isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <VolumeX className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium">Do Not Disturb</span>
              </div>
              <span className="text-[11px] font-mono">{isDnd ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
