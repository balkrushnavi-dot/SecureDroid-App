import React from 'react';
import { ArrowLeft, Phone, Camera, Mic, MapPin, FileText, Bell } from 'lucide-react';

interface AppDetailScreenProps {
  packageName?: string;
  onBack?: () => void;
}

const PERMISSION_INFO: Record<string, { name: string; description: string; icon: any }> = {
  'android.permission.READ_CALL_LOG': {
    name: 'Read Call Log',
    description: 'Read call history',
    icon: Phone,
  },
  'android.permission.WRITE_CALL_LOG': {
    name: 'Write Call Log',
    description: 'Modify call history',
    icon: Phone,
  },
  'android.permission.CAMERA': {
    name: 'Camera',
    description: 'Take photos and videos',
    icon: Camera,
  },
  'android.permission.RECORD_AUDIO': {
    name: 'Microphone',
    description: 'Record audio',
    icon: Mic,
  },
  'android.permission.ACCESS_FINE_LOCATION': {
    name: 'Fine Location',
    description: 'Access precise device location',
    icon: MapPin,
  },
  'android.permission.READ_CONTACTS': {
    name: 'Read Contacts',
    description: 'Access contact list',
    icon: FileText,
  },
  'android.permission.POST_NOTIFICATIONS': {
    name: 'Notifications',
    description: 'Send push notifications',
    icon: Bell,
  },
};

export function AppDetailScreen({ packageName, onBack }: AppDetailScreenProps) {
  const appName = packageName ? packageName.split('.').pop() || packageName : 'Unknown Application';

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-2">
        {onBack && (
          <button 
            onClick={onBack} 
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-xl font-semibold tracking-wide">App Details</h1>
      </div>

      {/* App Info Card */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center space-x-4">
        <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-xl">
          {appName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">{appName}</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{packageName || 'org.securedroid.app'}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold uppercase">
              Verified Safe
            </span>
          </div>
        </div>
      </div>

      {/* Permissions Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">Requested Permissions</h3>
        <div className="space-y-2">
          {Object.entries(PERMISSION_INFO).map(([key, info]) => {
            const Icon = info.icon;
            return (
              <div key={key} className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/70 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-slate-800/80 text-sky-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-white">{info.name}</h4>
                    <p className="text-[10px] text-slate-400">{info.description}</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  Granted
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
