import React from 'react';
import {
  Smartphone,
  Circle,
  Square,
  ArrowLeft,
  Sliders,
  CheckCircle2,
  MoveHorizontal,
  Info,
  ChevronRight,
  Shield
} from 'lucide-react';
import {
  SecureDroidTopBar,
  SecureDroidCard,
  SecureDroidSectionHeader,
  SecureDroidButton,
  SecureDroidSwitch
} from '../ui/designSystem';
import { NavigationMode, SystemScreen } from '../../types/securedroid';

interface SettingsNavigationScreenProps {
  onBack: () => void;
  navigationMode: NavigationMode;
  onSelectNavigationMode: (mode: NavigationMode) => void;
  isLight?: boolean;
}

export const SettingsNavigationScreen: React.FC<SettingsNavigationScreenProps> = ({
  onBack,
  navigationMode,
  onSelectNavigationMode,
  isLight = false,
}) => {
  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar
        title="System Navigation"
        subtitle="Hardware Keys, Gestures & Mobile Integration"
        onBack={onBack}
        isLight={isLight}
      />

      <div className="pt-4 space-y-4">
        {/* Active Navigation Mode Selector */}
        <SecureDroidSectionHeader title="Navigation Style" isLight={isLight} />

        {/* 1. Native Mobile / Phone Navigation (The recommended choice for real phones) */}
        <div
          onClick={() => onSelectNavigationMode('native_mobile')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            navigationMode === 'native_mobile'
              ? isLight
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                : 'bg-zinc-100 text-zinc-900 border-zinc-100 shadow-sm'
              : isLight
              ? 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-800'
              : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900 text-zinc-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                navigationMode === 'native_mobile'
                  ? isLight
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'bg-zinc-200 text-zinc-800'
                  : isLight
                  ? 'bg-zinc-100 text-zinc-700'
                  : 'bg-zinc-800 text-zinc-300'
              }`}>
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">Native Phone Navigation</h4>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    navigationMode === 'native_mobile'
                      ? isLight
                        ? 'bg-zinc-800 text-zinc-300'
                        : 'bg-zinc-300 text-zinc-900'
                      : isLight
                      ? 'bg-zinc-100 text-zinc-700'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    RECOMMENDED FOR MOBILE
                  </span>
                </div>
                <p className={`text-xs mt-1 leading-relaxed ${
                  navigationMode === 'native_mobile'
                    ? isLight
                      ? 'text-zinc-300'
                      : 'text-zinc-700'
                    : isLight
                    ? 'text-zinc-500'
                    : 'text-zinc-400'
                }`}>
                  Hides the on-screen bottom bar completely. Uses your phone's physical hardware back button, system swipe-back edge gestures, and browser history.
                </p>
              </div>
            </div>
            {navigationMode === 'native_mobile' && (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-current" />
            )}
          </div>
        </div>

        {/* 2. Gesture Navigation Bar */}
        <div
          onClick={() => onSelectNavigationMode('gesture')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            navigationMode === 'gesture'
              ? isLight
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                : 'bg-zinc-100 text-zinc-900 border-zinc-100 shadow-sm'
              : isLight
              ? 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-800'
              : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900 text-zinc-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                navigationMode === 'gesture'
                  ? isLight
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'bg-zinc-200 text-zinc-800'
                  : isLight
                  ? 'bg-zinc-100 text-zinc-700'
                  : 'bg-zinc-800 text-zinc-300'
              }`}>
                <MoveHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-medium text-sm">On-Screen Gesture Pill</h4>
                <p className={`text-xs mt-1 leading-relaxed ${
                  navigationMode === 'gesture'
                    ? isLight
                      ? 'text-zinc-300'
                      : 'text-zinc-700'
                    : isLight
                    ? 'text-zinc-500'
                    : 'text-zinc-400'
                }`}>
                  Displays a sleek minimal gesture pill bar at the bottom. Tap pill for Home, swipe or use edge gestures to navigate.
                </p>
              </div>
            </div>
            {navigationMode === 'gesture' && (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-current" />
            )}
          </div>
        </div>

        {/* 3. 3-Button Navigation */}
        <div
          onClick={() => onSelectNavigationMode('3-button')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            navigationMode === '3-button'
              ? isLight
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                : 'bg-zinc-100 text-zinc-900 border-zinc-100 shadow-sm'
              : isLight
              ? 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-800'
              : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900 text-zinc-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                navigationMode === '3-button'
                  ? isLight
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'bg-zinc-200 text-zinc-800'
                  : isLight
                  ? 'bg-zinc-100 text-zinc-700'
                  : 'bg-zinc-800 text-zinc-300'
              }`}>
                <div className="flex items-center gap-0.5 text-xs font-mono">
                  <span>◀</span>
                  <span>●</span>
                  <span>■</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm">3-Button Soft Keys</h4>
                <p className={`text-xs mt-1 leading-relaxed ${
                  navigationMode === '3-button'
                    ? isLight
                      ? 'text-zinc-300'
                      : 'text-zinc-700'
                    : isLight
                    ? 'text-zinc-500'
                    : 'text-zinc-400'
                }`}>
                  Fixed on-screen buttons for Back, Home, and Recents/Overview. Ideal for desktop browsers or simulated tablets.
                </p>
              </div>
            </div>
            {navigationMode === '3-button' && (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-current" />
            )}
          </div>
        </div>

        {/* Mobile Navigation Integration Details */}
        <SecureDroidSectionHeader title="How Phone Navigation Works" isLight={isLight} />
        <SecureDroidCard isLight={isLight} className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1.5">
              <h5 className="font-medium text-zinc-900 dark:text-zinc-100">Full HTML5 History & Hardware Key Integration</h5>
              <p className={isLight ? 'text-zinc-600' : 'text-zinc-400'}>
                • <strong>Android Back Button / Swipe</strong>: Pressing your Android device's hardware back button or swiping from either side edge will naturally navigate back through your app history stack without leaving the app.
              </p>
              <p className={isLight ? 'text-zinc-600' : 'text-zinc-400'}>
                • <strong>Edge Swipe Gesture</strong>: On touch screens, swiping inward from the left screen edge triggers back navigation automatically.
              </p>
              <p className={isLight ? 'text-zinc-600' : 'text-zinc-400'}>
                • <strong>Home Screen Fallback</strong>: When on the Home screen, tapping back will safely keep you on the home dashboard.
              </p>
            </div>
          </div>
        </SecureDroidCard>
      </div>
    </div>
  );
};
