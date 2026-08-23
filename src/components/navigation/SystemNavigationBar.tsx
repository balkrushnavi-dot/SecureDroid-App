import React from 'react';
import { ArrowLeft, Circle, Square, Search, Volume2, Power, Shield, Settings, Grid } from 'lucide-react';
import { SystemScreen, NavigationMode } from '../../types/securedroid';

interface SystemNavigationBarProps {
  onBack: () => void;
  onHome: () => void;
  onRecents: () => void;
  onSearch: () => void;
  onOpenVolume: () => void;
  onOpenPower: () => void;
  currentScreen: SystemScreen;
  navigationMode?: NavigationMode;
  isLight?: boolean;
}

export const SystemNavigationBar: React.FC<SystemNavigationBarProps> = ({
  onBack,
  onHome,
  onRecents,
  onSearch,
  onOpenVolume,
  onOpenPower,
  currentScreen,
  navigationMode = '3-button',
  isLight = false,
}) => {
  const isHomeScreen = currentScreen === 'homescreen';

  // If using native mobile device navigation, hide the on-screen software navigation bar
  if (navigationMode === 'native_mobile') {
    return null;
  }

  return (
    <nav
      aria-label="System navigation"
      className={`fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-2 border-t transition-colors select-none ${
        isLight
          ? 'bg-zinc-100/95 border-zinc-200 text-zinc-700 backdrop-blur-md'
          : 'bg-zinc-950/95 border-zinc-850 text-zinc-300 backdrop-blur-md'
      }`}
    >
      {/* Quick helper controls on the sides */}
      <div className="flex items-center gap-1">
        <button
          onClick={onSearch}
          className={`p-2 rounded-full transition-colors ${
            isLight ? 'hover:bg-zinc-200 active:bg-zinc-300 text-zinc-600' : 'hover:bg-zinc-850 active:bg-zinc-800 text-zinc-400'
          }`}
          aria-label="Search system"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          onClick={onOpenVolume}
          className={`p-2 rounded-full transition-colors ${
            isLight ? 'hover:bg-zinc-200 active:bg-zinc-300 text-zinc-600' : 'hover:bg-zinc-850 active:bg-zinc-800 text-zinc-400'
          }`}
          aria-label="Volume panel"
          title="Volume controls"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Navigation: 3-Button or Gesture Pill */}
      {navigationMode === '3-button' ? (
        <div className="flex items-center gap-10">
          {/* Back button */}
          <button
            onClick={onBack}
            className={`p-3 rounded-full transition-all active:scale-90 ${
              isLight ? 'hover:bg-zinc-200 text-zinc-700' : 'hover:bg-zinc-850 text-zinc-300'
            }`}
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Home button */}
          <button
            onClick={onHome}
            className={`p-3 rounded-full transition-all active:scale-90 ${
              isHomeScreen
                ? isLight
                  ? 'text-zinc-900'
                  : 'text-zinc-100'
                : isLight
                ? 'hover:bg-zinc-200 text-zinc-500'
                : 'hover:bg-zinc-850 text-zinc-400'
            }`}
            aria-label="Home"
          >
            <Circle className="w-5 h-5 fill-current" />
          </button>

          {/* Recents / Multitasking Overview button */}
          <button
            onClick={onRecents}
            className={`p-3 rounded-full transition-all active:scale-90 ${
              currentScreen === 'recents'
                ? isLight
                  ? 'text-zinc-900'
                  : 'text-zinc-100'
                : isLight
                ? 'hover:bg-zinc-200 text-zinc-500'
                : 'hover:bg-zinc-850 text-zinc-400'
            }`}
            aria-label="Overview"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Android 14 Gesture Pill */
        <div className="flex justify-center flex-1 py-2">
          <div
            onClick={onHome}
            className={`w-32 h-1 rounded-full cursor-pointer transition-all hover:scale-105 active:scale-95 ${
              isLight ? 'bg-zinc-400 hover:bg-zinc-600' : 'bg-zinc-600 hover:bg-zinc-400'
            }`}
            title="Swipe up for Home / Hold for Recents"
          />
        </div>
      )}

      {/* Power menu trigger */}
      <div className="flex items-center">
        <button
          onClick={onOpenPower}
          className={`p-2 rounded-full transition-colors ${
            isLight ? 'hover:bg-zinc-200 active:bg-zinc-300 text-zinc-600' : 'hover:bg-zinc-850 active:bg-zinc-800 text-zinc-400'
          }`}
          aria-label="Power menu"
          title="Power / Restart"
        >
          <Power className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};
