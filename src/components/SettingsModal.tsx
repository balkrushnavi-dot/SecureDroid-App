import React from 'react';
import { DeviceProfile } from '../types/securedroid';
import { DEVICE_PROFILES } from '../data/deviceProfiles';
import { X, Smartphone, Shield, HardDrive, RefreshCw, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: DeviceProfile;
  setProfile: (p: DeviceProfile) => void;
  onRunScan: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  currentProfile,
  setProfile,
  onRunScan,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="settings-modal-container"
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-bold text-white">Diagnostics & Device Target</h3>
          </div>
          <button
            id="close-settings-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="space-y-2">
            <span className="font-semibold text-slate-300 block">Select Device Target for Inspection:</span>
            <div className="space-y-2">
              {DEVICE_PROFILES.map((p) => {
                const isSelected = p.id === currentProfile.id;
                return (
                  <button
                    key={p.id}
                    id={`select-profile-${p.id}`}
                    onClick={() => {
                      setProfile(p);
                      onClose();
                    }}
                    className={`w-full flex items-start justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-sky-500/10 border-sky-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold flex items-center gap-1.5">
                        {p.name}
                        {p.isReferenceDevice && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Reference
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{p.chipset} • {p.androidVersion}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
            <button
              id="settings-trigger-scan-btn"
              onClick={() => {
                onClose();
                onRunScan();
              }}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
              Re-run Capability Probe
            </button>

            <button
              id="settings-close-btn"
              onClick={onClose}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
