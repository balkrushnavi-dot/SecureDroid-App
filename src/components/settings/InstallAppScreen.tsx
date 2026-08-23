import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Share2,
  MoreVertical,
  PlusSquare,
  CheckCircle2,
  Shield,
  Sparkles,
  ExternalLink,
  HelpCircle,
  Laptop
} from 'lucide-react';
import {
  SecureDroidTopBar,
  SecureDroidCard,
  SecureDroidSectionHeader,
  SecureDroidButton
} from '../ui/designSystem';

interface InstallAppScreenProps {
  onBack: () => void;
  deferredPrompt: any;
  onInstallPwa: () => void;
  isStandalone: boolean;
  isLight?: boolean;
}

export const InstallAppScreen: React.FC<InstallAppScreenProps> = ({
  onBack,
  deferredPrompt,
  onInstallPwa,
  isStandalone,
  isLight = false,
}) => {
  const [activePlatformTab, setActivePlatformTab] = useState<'android' | 'ios' | 'desktop'>('android');

  return (
    <div className={`min-h-full p-4 pb-24 transition-colors ${isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      <SecureDroidTopBar
        title="Install as Phone App"
        subtitle="Progressive Web App (PWA) Setup Guide"
        onBack={onBack}
        isLight={isLight}
      />

      <div className="pt-4 space-y-4">
        {/* Status Card: Standalone or Browser Mode */}
        <SecureDroidCard isLight={isLight} highlight className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isStandalone
                  ? 'bg-emerald-600/20 text-emerald-500'
                  : isLight
                  ? 'bg-zinc-100 text-zinc-800'
                  : 'bg-zinc-800 text-zinc-200'
              }`}>
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-sm">
                  {isStandalone ? 'Installed as Standalone App' : 'Running in Web Browser'}
                </h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  {isStandalone
                    ? 'Full-screen mode active with native phone gesture integration.'
                    : 'Install on your home screen for full-screen view without browser address bars.'}
                </p>
              </div>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
              isStandalone
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : isLight
                ? 'bg-zinc-100 text-zinc-700'
                : 'bg-zinc-800 text-zinc-300'
            }`}>
              {isStandalone ? 'PWA ACTIVE' : 'WEB MODE'}
            </span>
          </div>

          {/* If prompt is ready, show 1-Click Install Button */}
          {deferredPrompt && !isStandalone && (
            <div className="mt-4 pt-3 border-t border-zinc-800/30">
              <SecureDroidButton
                variant="primary"
                onClick={onInstallPwa}
                isLight={isLight}
                className="w-full py-2.5"
                icon={Download}
              >
                1-Click Install on This Device
              </SecureDroidButton>
            </div>
          )}
        </SecureDroidCard>

        {/* Platform Selection Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActivePlatformTab('android')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
              activePlatformTab === 'android'
                ? isLight
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-900 shadow-sm'
                : isLight
                ? 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            Android (Chrome/Edge)
          </button>
          <button
            onClick={() => setActivePlatformTab('ios')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
              activePlatformTab === 'ios'
                ? isLight
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-900 shadow-sm'
                : isLight
                ? 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            iPhone / iOS (Safari)
          </button>
          <button
            onClick={() => setActivePlatformTab('desktop')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
              activePlatformTab === 'desktop'
                ? isLight
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-900 shadow-sm'
                : isLight
                ? 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            PC / Mac
          </button>
        </div>

        {/* Instructions Content */}
        {activePlatformTab === 'android' && (
          <div className="space-y-3">
            <SecureDroidSectionHeader title="Android Installation Steps" isLight={isLight} />

            <SecureDroidCard isLight={isLight} className="p-4 space-y-3.5">
              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-medium shrink-0 ${
                  isLight ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-900'
                }`}>
                  1
                </div>
                <div>
                  <h4 className="font-medium text-xs">Open in Mobile Browser</h4>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    Open this app's URL on your phone in <strong>Google Chrome</strong>, <strong>Brave</strong>, <strong>Microsoft Edge</strong>, or <strong>Samsung Internet</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-medium shrink-0 ${
                  isLight ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-900'
                }`}>
                  2
                </div>
                <div>
                  <h4 className="font-medium text-xs">Tap Browser Menu (3 Dots)</h4>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    Tap the <strong>⋮</strong> (three vertical dots) in the top-right or bottom-right corner of your browser.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-medium shrink-0 ${
                  isLight ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-900'
                }`}>
                  3
                </div>
                <div>
                  <h4 className="font-medium text-xs">Select "Install app" or "Add to Home screen"</h4>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    Select <strong>Install app</strong> (or <strong>Add to Home screen</strong>). Confirm by tapping <strong>Install</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-medium shrink-0 ${
                  isLight ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-900'
                }`}>
                  4
                </div>
                <div>
                  <h4 className="font-medium text-xs">Launch from App Drawer or Home Screen</h4>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    The <strong>SecureDroid</strong> app icon will now appear in your app launcher just like a native APK. It opens in full-screen standalone mode with your phone's native gesture navigation!
                  </p>
                </div>
              </div>
            </SecureDroidCard>
          </div>
        )}

        {activePlatformTab === 'ios' && (
          <div className="space-y-3">
            <SecureDroidSectionHeader title="iPhone & iPad (Safari) Steps" isLight={isLight} />

            <SecureDroidCard isLight={isLight} className="p-4 space-y-3.5">
              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-medium shrink-0 ${
                  isLight ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-900'
                }`}>
                  1
                </div>
                <div>
                  <h4 className="font-medium text-xs">Open in Apple Safari</h4>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    Open this app link in <strong>Safari</strong> on your iPhone or iPad (iOS requires Safari for home screen installation).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-medium shrink-0 ${
                  isLight ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-900'
                }`}>
                  2
                </div>
                <div>
                  <h4 className="font-medium text-xs">Tap the "Share" Button</h4>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    Tap the <strong>Share</strong> button (box with an upward arrow) in the bottom toolbar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-medium shrink-0 ${
                  isLight ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-900'
                }`}>
                  3
                </div>
                <div>
                  <h4 className="font-medium text-xs">Tap "Add to Home Screen"</h4>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    Scroll down in the action sheet and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1" />.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-medium shrink-0 ${
                  isLight ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-900'
                }`}>
                  4
                </div>
                <div>
                  <h4 className="font-medium text-xs">Tap "Add" in Top Right</h4>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    Tap <strong>Add</strong> to place the standalone SecureDroid app icon onto your home screen.
                  </p>
                </div>
              </div>
            </SecureDroidCard>
          </div>
        )}

        {activePlatformTab === 'desktop' && (
          <div className="space-y-3">
            <SecureDroidSectionHeader title="Desktop (Chrome / Edge / Brave)" isLight={isLight} />

            <SecureDroidCard isLight={isLight} className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Laptop className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-2">
                  <p className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>
                    Click the <strong>Install icon</strong> in your browser's URL address bar (or menu &rarr; <em>"Install SecureDroid OS"</em>).
                  </p>
                  <p className={isLight ? 'text-zinc-500' : 'text-zinc-400'}>
                    The application runs in its own dedicated, high-performance window with no URL bar distractions.
                  </p>
                </div>
              </div>
            </SecureDroidCard>
          </div>
        )}

        {/* Benefits of PWA Mobile App */}
        <SecureDroidSectionHeader title="Mobile App Benefits" isLight={isLight} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className={`p-3 rounded-2xl border ${
            isLight ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
          }`}>
            <div className="font-medium mb-1 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-zinc-500" />
              <span>Full Screen Window</span>
            </div>
            <p className={`text-[11px] ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Runs without browser URL address bars or tabs, looking and feeling like a native Android APK.
            </p>
          </div>

          <div className={`p-3 rounded-2xl border ${
            isLight ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
          }`}>
            <div className="font-medium mb-1 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-zinc-500" />
              <span>Phone Hardware Navigation</span>
            </div>
            <p className={`text-[11px] ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Interacts directly with your phone's back button and edge swipe gestures via History API.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
