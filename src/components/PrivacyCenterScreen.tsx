import React, { useState } from 'react';
import {
  Eye,
  Camera,
  Mic,
  MapPin,
  Shield,
  ShieldAlert,
  Clock,
  ChevronRight,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Smartphone,
  Sliders,
  Copy
} from 'lucide-react';
import {
  SecureDroidTopBar,
  SecureDroidCard,
  SecureDroidSwitch,
  SecureDroidSectionHeader,
  SecureDroidStatusChip,
  SecureDroidButton
} from './ui/designSystem';
import { PrivacyCenterState, SensorAccessLogItem, SystemScreen } from '../types/securedroid';

interface PrivacyCenterScreenProps {
  privacyState: PrivacyCenterState;
  onToggleCameraKillswitch: () => void;
  onToggleMicKillswitch: () => void;
  onToggleSensorKillswitch: () => void;
  onToggleClipboardAlerts: () => void;
  sensorLogs: SensorAccessLogItem[];
  onNavigate: (screen: SystemScreen) => void;
  onBack?: () => void;
  isLight?: boolean;
}

export const PrivacyCenterScreen: React.FC<PrivacyCenterScreenProps> = ({
  privacyState,
  onToggleCameraKillswitch,
  onToggleMicKillswitch,
  onToggleSensorKillswitch,
  onToggleClipboardAlerts,
  sensorLogs,
  onNavigate,
  onBack,
  isLight = false,
}) => {
  const [selectedSensorFilter, setSelectedSensorFilter] = useState<'ALL' | 'CAMERA' | 'MIC' | 'LOCATION' | 'CLIPBOARD'>('ALL');

  const filteredLogs = sensorLogs.filter((log) => {
    const sensor = log.sensorType || log.sensor;
    if (selectedSensorFilter === 'ALL') return true;
    if (selectedSensorFilter === 'CAMERA') return sensor === 'CAMERA';
    if (selectedSensorFilter === 'MIC') return sensor === 'MIC';
    if (selectedSensorFilter === 'LOCATION') return sensor === 'LOCATION';
    if (selectedSensorFilter === 'CLIPBOARD') return sensor === 'CLIPBOARD';
    return true;
  });

  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar
        title="Privacy Center"
        subtitle="Hardware Killswitches & Sensor Access Log"
        onBack={onBack}
        isLight={isLight}
      />

      {/* 1. Hardware Killswitches Section */}
      <div className="pt-4">
        <SecureDroidSectionHeader title="Hardware-Level Killswitches" isLight={isLight} />

        <div className="space-y-3 mb-6">
          {/* Camera Killswitch */}
          <SecureDroidCard isLight={isLight}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  privacyState.cameraKillSwitch
                    ? 'bg-rose-600/15 text-rose-500'
                    : isLight
                    ? 'bg-zinc-100 text-zinc-700'
                    : 'bg-zinc-800 text-zinc-300'
                }`}>
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Camera Hardware Isolation</h4>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {privacyState.cameraKillSwitch
                      ? 'Camera HAL blocked. Subsystem returns blank black frames.'
                      : 'Camera hardware available to permitted apps.'}
                  </p>
                </div>
              </div>
              <SecureDroidSwitch
                checked={privacyState.cameraKillSwitch}
                onChange={onToggleCameraKillswitch}
                isLight={isLight}
              />
            </div>
          </SecureDroidCard>

          {/* Microphone Killswitch */}
          <SecureDroidCard isLight={isLight}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  privacyState.micKillSwitch
                    ? 'bg-rose-600/15 text-rose-500'
                    : isLight
                    ? 'bg-zinc-100 text-zinc-700'
                    : 'bg-zinc-800 text-zinc-300'
                }`}>
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Microphone Hardware Isolation</h4>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {privacyState.micKillSwitch
                      ? 'AudioFlinger input muted at native binder level.'
                      : 'Microphone hardware available to permitted apps.'}
                  </p>
                </div>
              </div>
              <SecureDroidSwitch
                checked={privacyState.micKillSwitch}
                onChange={onToggleMicKillswitch}
                isLight={isLight}
              />
            </div>
          </SecureDroidCard>

          {/* Motion & Gyro Sensors Killswitch */}
          <SecureDroidCard isLight={isLight}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  privacyState.sensorKillSwitch
                    ? 'bg-rose-600/15 text-rose-500'
                    : isLight
                    ? 'bg-zinc-100 text-zinc-700'
                    : 'bg-zinc-800 text-zinc-300'
                }`}>
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Sensors (Accelerometer & Gyro)</h4>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {privacyState.sensorKillSwitch
                      ? 'SensorManager events blocked to prevent side-channel keystroke snooping.'
                      : 'Standard sensor access for active apps.'}
                  </p>
                </div>
              </div>
              <SecureDroidSwitch
                checked={privacyState.sensorKillSwitch}
                onChange={onToggleSensorKillswitch}
                isLight={isLight}
              />
            </div>
          </SecureDroidCard>

          {/* Clipboard Access Alerts */}
          <SecureDroidCard isLight={isLight}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
                }`}>
                  <Copy className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Clipboard Read Notifications</h4>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Show immediate system overlay notification whenever an app reads clipboard
                  </p>
                </div>
              </div>
              <SecureDroidSwitch
                checked={privacyState.clipboardReadAlerts ?? privacyState.clipboardAccessAlerts ?? false}
                onChange={onToggleClipboardAlerts}
                isLight={isLight}
              />
            </div>
          </SecureDroidCard>
        </div>
      </div>

      {/* 2. Permission Manager Link */}
      <SecureDroidCard
        isLight={isLight}
        className={`p-4 mb-6 cursor-pointer ${isLight ? 'hover:border-zinc-300' : 'hover:border-zinc-700'}`}
        onClick={() => onNavigate('permission_manager')}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
            }`}>
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Permission Manager</h4>
              <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Fine-grained control over camera, microphone, storage, and location
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </div>
      </SecureDroidCard>

      {/* 3. 24-Hour Sensor Access Audit Log */}
      <div>
        <div className="flex items-center justify-between pb-2">
          <SecureDroidSectionHeader title="24-Hour Sensor Access Audit Log" isLight={isLight} />
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
            isLight ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-800 text-zinc-400'
          }`}>
            LOGGED
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 pb-3 overflow-x-auto">
          {(['ALL', 'CAMERA', 'MIC', 'LOCATION', 'CLIPBOARD'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedSensorFilter(filter)}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
                selectedSensorFilter === filter
                  ? isLight
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-900'
                  : isLight
                  ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  : 'bg-zinc-850 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Log Entries */}
        <div className="space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-6 text-xs text-zinc-500">
              No sensor events recorded for selected filter.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isAllowed = log.wasAllowed !== undefined ? log.wasAllowed : (log.actionTaken === 'AUTHORIZED');
              const sensor = log.sensorType || log.sensor;
              return (
                <div
                  key={log.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between ${
                    isLight ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isAllowed
                        ? isLight
                          ? 'bg-zinc-100 text-zinc-800'
                          : 'bg-zinc-800 text-zinc-200'
                        : 'bg-rose-500/15 text-rose-500'
                    }`}>
                      {sensor === 'CAMERA' && <Camera className="w-4 h-4" />}
                      {sensor === 'MIC' && <Mic className="w-4 h-4" />}
                      {sensor === 'LOCATION' && <MapPin className="w-4 h-4" />}
                      {sensor === 'CLIPBOARD' && <Copy className="w-4 h-4" />}
                      {(sensor === 'SENSORS' || !sensor) && <Eye className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs">{log.appName}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">UID {log.uid}</span>
                      </div>
                      <p className={`text-[11px] mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        {isAllowed ? 'Accessed sensor' : 'Blocked by killswitch policy'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                      isAllowed
                        ? isLight
                          ? 'bg-zinc-100 text-zinc-700'
                          : 'bg-zinc-800 text-zinc-300'
                        : 'bg-rose-500/15 text-rose-500'
                    }`}>
                      {isAllowed ? 'ALLOWED' : 'BLOCKED'}
                    </span>
                    <p className="text-[10px] text-zinc-500 mt-1">{log.timestamp}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
