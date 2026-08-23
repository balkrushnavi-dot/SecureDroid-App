import React from 'react';
import { Power, RotateCcw, Lock, PhoneCall, ShieldAlert, X } from 'lucide-react';

interface PowerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLockdown: () => void;
  onRestart: () => void;
  onPowerOff: () => void;
  isLight?: boolean;
}

export const PowerMenu: React.FC<PowerMenuProps> = ({
  isOpen,
  onClose,
  onLockdown,
  onRestart,
  onPowerOff,
  isLight = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-md transition-opacity"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border transition-all animate-in zoom-in-95 duration-150 ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/40">
          <div>
            <h3 className="font-semibold text-base">Power Options</h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              SecureDroid Power & Isolation Controls
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-5">
          {/* Lockdown Mode (First-class security feature) */}
          <button
            onClick={() => {
              onLockdown();
              onClose();
            }}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 active:bg-rose-500/30 border border-rose-500/30 text-rose-300 transition-all text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Lock className="w-6 h-6 text-rose-400" />
            </div>
            <span className="text-xs font-semibold text-rose-200">Lockdown</span>
            <span className="text-[10px] text-rose-300/80 mt-0.5">Disable biometrics & USB</span>
          </button>

          {/* Emergency Call */}
          <button
            onClick={() => {
              onClose();
            }}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 active:bg-amber-500/30 border border-amber-500/30 text-amber-300 transition-all text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <PhoneCall className="w-6 h-6 text-amber-400" />
            </div>
            <span className="text-xs font-semibold text-amber-200">Emergency</span>
            <span className="text-[10px] text-amber-300/80 mt-0.5">SOS & Location broadcast</span>
          </button>

          {/* Restart */}
          <button
            onClick={() => {
              onRestart();
              onClose();
            }}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all text-center group ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-slate-200'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-slate-700/40 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <RotateCcw className="w-6 h-6 text-slate-300" />
            </div>
            <span className="text-xs font-semibold">Restart</span>
            <span className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Soft reboot & clean RAM
            </span>
          </button>

          {/* Power Off */}
          <button
            onClick={() => {
              onPowerOff();
              onClose();
            }}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all text-center group ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-slate-200'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-slate-700/40 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Power className="w-6 h-6 text-slate-300" />
            </div>
            <span className="text-xs font-semibold">Power off</span>
            <span className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Shut down subsystem
            </span>
          </button>
        </div>

        <p className={`text-[11px] text-center mt-5 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
          SecureDroid OS • Zero-Simulation Fail-Closed Security
        </p>
      </div>
    </div>
  );
};
