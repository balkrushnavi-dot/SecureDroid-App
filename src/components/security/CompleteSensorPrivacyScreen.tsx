import React, { useState } from 'react';
import {
  Eye,
  Mic,
  Camera,
  MapPin,
  Compass,
  Radio,
  Sliders,
  Activity,
  CheckCircle2,
  AlertCircle,
  Bluetooth,
  Wifi,
  Copy,
  Info,
  Clock
} from 'lucide-react';
import {
  SecureDroidTopBar,
  SecureDroidCard,
  SecureDroidStatusChip,
  SecureDroidSectionHeader,
  SecureDroidButton,
  SecureDroidSwitch
} from '../ui/designSystem';
import { ExtendedSensorLogEvent, ExtendedSensorType } from '../../types/securedroid';
import { INITIAL_EXTENDED_SENSOR_LOGS } from '../../data/featurePackData';

interface CompleteSensorPrivacyScreenProps {
  onBack: () => void;
  isLight?: boolean;
}

export const CompleteSensorPrivacyScreen: React.FC<CompleteSensorPrivacyScreenProps> = ({
  onBack,
  isLight = false,
}) => {
  const [logs, setLogs] = useState<ExtendedSensorLogEvent[]>(INITIAL_EXTENDED_SENSOR_LOGS);
  const [filterType, setFilterType] = useState<string>('All');
  const [cameraSwitch, setCameraSwitch] = useState<boolean>(true);
  const [micSwitch, setMicSwitch] = useState<boolean>(true);
  const [motionSensorSwitch, setMotionSensorSwitch] = useState<boolean>(false);
  const [bleScanBlock, setBleScanBlock] = useState<boolean>(true);
  const [clipboardPurge, setClipboardPurge] = useState<boolean>(true);

  const filterCategories = ['All', 'Camera', 'Microphone', 'Location', 'Accelerometer', 'Bluetooth Scanning', 'Clipboard'];

  const filteredLogs = logs.filter((l) => {
    if (filterType === 'All') return true;
    return l.sensor === filterType;
  });

  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar
        title="Complete Sensor Privacy"
        subtitle="Hardware HAL Controls & Real-Time Access Stream"
        onBack={onBack}
        isLight={isLight}
      />

      <div className="pt-4 space-y-4">
        {/* 1. Global Killswitches Section */}
        <SecureDroidSectionHeader title="Hardware Killswitch Matrix" isLight={isLight} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Camera Killswitch */}
          <SecureDroidCard isLight={isLight} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  cameraSwitch ? 'bg-rose-500/10 text-rose-400' : 'bg-zinc-800 text-zinc-300'
                }`}>
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Camera Hardware HAL</h4>
                  <span className="text-[11px] text-zinc-500 block font-mono">
                    {cameraSwitch ? 'SENSOR MUTED' : 'ACTIVE ON-DEMAND'}
                  </span>
                </div>
              </div>
              <SecureDroidSwitch
                checked={cameraSwitch}
                onChange={() => setCameraSwitch(!cameraSwitch)}
                isLight={isLight}
              />
            </div>
          </SecureDroidCard>

          {/* Microphone Killswitch */}
          <SecureDroidCard isLight={isLight} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  micSwitch ? 'bg-rose-500/10 text-rose-400' : 'bg-zinc-800 text-zinc-300'
                }`}>
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Microphone Stream</h4>
                  <span className="text-[11px] text-zinc-500 block font-mono">
                    {micSwitch ? 'ZERO-BYTES DELIVERED' : 'AUDIO ACTIVE'}
                  </span>
                </div>
              </div>
              <SecureDroidSwitch
                checked={micSwitch}
                onChange={() => setMicSwitch(!micSwitch)}
                isLight={isLight}
              />
            </div>
          </SecureDroidCard>

          {/* Motion & Gyro HAL */}
          <SecureDroidCard isLight={isLight} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-800 text-zinc-300">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Motion / Gyro Sensors</h4>
                  <span className="text-[11px] text-zinc-500 block font-mono">
                    {motionSensorSwitch ? 'POLLED BLOCKED' : 'AVAILABLE'}
                  </span>
                </div>
              </div>
              <SecureDroidSwitch
                checked={motionSensorSwitch}
                onChange={() => setMotionSensorSwitch(!motionSensorSwitch)}
                isLight={isLight}
              />
            </div>
          </SecureDroidCard>

          {/* Bluetooth & Wi-Fi Tracking Scan Block */}
          <SecureDroidCard isLight={isLight} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-800 text-zinc-300">
                  <Bluetooth className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Background BLE Scanning</h4>
                  <span className="text-[11px] text-zinc-500 block font-mono">
                    {bleScanBlock ? 'BLOCKED' : 'ALLOWED'}
                  </span>
                </div>
              </div>
              <SecureDroidSwitch
                checked={bleScanBlock}
                onChange={() => setBleScanBlock(!bleScanBlock)}
                isLight={isLight}
              />
            </div>
          </SecureDroidCard>
        </div>

        {/* 2. Real-Time Sensor Access Stream */}
        <SecureDroidSectionHeader title="Sensor Access Audit Stream" isLight={isLight} />

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterType(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filterType === cat
                  ? isLight
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-900'
                  : isLight
                  ? 'bg-zinc-200/70 text-zinc-700 hover:bg-zinc-300/70'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Log Entries */}
        <div className="space-y-2">
          {filteredLogs.map((log) => {
            const isBlocked = log.action === 'BLOCKED';
            return (
              <SecureDroidCard key={log.id} isLight={isLight} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      isBlocked ? 'bg-amber-400' : 'bg-emerald-400'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-xs">{log.appName}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                          isBlocked
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {log.action}
                        </span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                          log.source === 'REAL EVENT'
                            ? 'bg-emerald-950 text-emerald-300'
                            : log.source === 'SYSTEM EVENT'
                            ? 'bg-blue-950 text-blue-300'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {log.source}
                        </span>
                      </div>
                      <p className={`text-[11px] mt-1 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                        {log.details}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                    {log.timestamp}
                  </span>
                </div>
              </SecureDroidCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};
