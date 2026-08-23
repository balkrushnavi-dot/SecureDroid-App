import React, { useState } from 'react';
import {
  Camera,
  Mic,
  MapPin,
  FolderLock,
  Phone,
  Eye,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import {
  SecureDroidTopBar,
  SecureDroidCard,
  SecureDroidSectionHeader,
  SecureDroidStatusChip
} from './ui/designSystem';
import { AppSandboxInfo, PermissionCategory } from '../types/securedroid';

interface PermissionManagerScreenProps {
  apps: AppSandboxInfo[];
  onBack?: () => void;
  onUpdateAppPermission: (pkgName: string, permissionKey: string, value: boolean) => void;
  isLight?: boolean;
}

export const PermissionManagerScreen: React.FC<PermissionManagerScreenProps> = ({
  apps,
  onBack,
  onUpdateAppPermission,
  isLight = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PermissionCategory>('CAMERA');

  const categories: {
    id: PermissionCategory;
    key: keyof AppSandboxInfo['permissions'];
    name: string;
    icon: any;
    desc: string;
  }[] = [
    { id: 'CAMERA', key: 'camera', name: 'Camera', icon: Camera, desc: 'Apps with hardware camera sensor access' },
    { id: 'MIC', key: 'microphone', name: 'Microphone', icon: Mic, desc: 'Apps with audio recording capabilities' },
    { id: 'LOCATION', key: 'location', name: 'Location', icon: MapPin, desc: 'Apps with precise/coarse GPS positioning' },
    { id: 'STORAGE', key: 'contacts', name: 'Storage & Contacts', icon: FolderLock, desc: 'Apps with contact lists & file vault access' },
    { id: 'SENSORS', key: 'sensors', name: 'Body & Motion Sensors', icon: Eye, desc: 'Apps with accelerometer & gyro data' },
  ];

  const activeCategory = categories.find((c) => c.id === selectedCategory) || categories[0];

  return (
    <div className={`min-h-full p-4 pb-24 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      <SecureDroidTopBar
        title="Permission Manager"
        subtitle="Hardware Sensor & Resource Grants"
        onBack={onBack}
        isLight={isLight}
      />

      {/* Category Horizontal Selector */}
      <div className="flex gap-2 pt-4 pb-3 overflow-x-auto">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-2xl border flex items-center gap-2 transition-all whitespace-nowrap text-xs font-medium ${
                isSelected
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                  : isLight
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Category Description */}
      <div className="py-2 text-xs text-slate-400">
        {activeCategory.desc}
      </div>

      {/* App List for Selected Category */}
      <div className="space-y-2 pt-2">
        {apps.map((app) => {
          const permState = app.permissions ? app.permissions[activeCategory.key] : 'DENIED';
          const isGranted = permState === 'GRANTED' || permState === 'COARSE_ONLY';
          return (
            <SecureDroidCard key={app.packageName} isLight={isLight} className="p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs">{app.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">UID {app.uid}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{app.packageName}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateAppPermission(app.packageName, activeCategory.key, !isGranted)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      isGranted
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : isLight
                        ? 'bg-slate-200 border-slate-300 text-slate-600'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {isGranted ? (permState === 'COARSE_ONLY' ? 'Coarse Only' : 'Allowed') : 'Denied'}
                  </button>
                </div>
              </div>
            </SecureDroidCard>
          );
        })}
      </div>
    </div>
  );
};
