import React, { useState, useMemo, useEffect } from 'react';
import { SystemStatusBar } from './components/SystemStatusBar';
import { SystemNavigationBar } from './components/navigation/SystemNavigationBar';
import { VolumePanel } from './components/system/VolumePanel';
import { PowerMenu } from './components/system/PowerMenu';
import { QuickSettingsShade } from './components/QuickSettingsShade';
import { LockScreenView } from './components/LockScreenView';
import { SystemHomeScreen } from './components/SystemHomeScreen';
import { AppDrawerScreen } from './components/launcher/AppDrawerScreen';
import { RecentAppsScreen } from './components/launcher/RecentAppsScreen';
import { GlobalSearchScreen } from './components/launcher/GlobalSearchScreen';

// Settings Screens
import {
  SettingsHomeScreen,
  SettingsNetworkScreen,
  SettingsConnectedScreen,
  SettingsBatteryScreen,
  SettingsStorageScreen,
  SettingsWallpaperScreen,
  SettingsAboutScreen
} from './components/settings/SettingsScreens';
import { SettingsNavigationScreen } from './components/settings/SettingsNavigationScreen';
import { InstallAppScreen } from './components/settings/InstallAppScreen';

// Security & Privacy Screens (Level 2)
import { SecurityCenterScreen } from './components/SecurityCenterScreen';
import { PrivacyCenterScreen } from './components/PrivacyCenterScreen';
import { PermissionManagerScreen } from './components/PermissionManagerScreen';
import { SecureEnvironmentScreen } from './components/SecureEnvironmentScreen';
import { SystemUpdatesScreen } from './components/SystemUpdatesScreen';
import { AppSandboxScreen } from './components/AppSandboxScreen';
import { AppDetailScreen } from './components/AppDetailScreen';

// Advanced Diagnostics (Level 3)
import { AdvancedDiagnosticsScreen } from './components/AdvancedDiagnosticsScreen';
import { UserProfilesScreen } from './components/UserProfilesScreen';
import { NetworkControlScreen } from './components/NetworkControlScreen';
import { CodeExplorer } from './components/CodeExplorer';
import { PocoDeploymentGuide } from './components/PocoDeploymentGuide';
import { OsArchitectureScreen } from './components/OsArchitectureScreen';
import { CapabilityEngine } from './components/CapabilityEngine';
import { DeviceProfileScreen } from './components/DeviceProfileScreen';

// 31-Point Feature Pack Screens (Level 2 & Deep Security Modules)
import { AdvancedProtectionScreen } from './components/security/AdvancedProtectionScreen';
import { ExploitProtectionScreen } from './components/security/ExploitProtectionScreen';
import { DeviceSecurityStateScreen } from './components/security/DeviceSecurityStateScreen';
import { AuthenticationDuressScreen } from './components/security/AuthenticationDuressScreen';
import { EmergencyProtectionScreen } from './components/security/EmergencyProtectionScreen';
import { TheftProtectionScreen } from './components/security/TheftProtectionScreen';
import { AppVerificationScreen } from './components/security/AppVerificationScreen';
import { SecureDroidStoreScreen } from './components/security/SecureDroidStoreScreen';
import { BrowserWebSecurityScreen } from './components/security/BrowserWebSecurityScreen';
import { CompleteSensorPrivacyScreen } from './components/security/CompleteSensorPrivacyScreen';
import { CertificatesPasskeysScreen } from './components/security/CertificatesPasskeysScreen';
import { BackupRestoreScreen } from './components/security/BackupRestoreScreen';
import { SecurityAuditLogScreen } from './components/security/SecurityAuditLogScreen';
import { ThreatModelCenterScreen } from './components/security/ThreatModelCenterScreen';
import {
  DeveloperDebugSecurityScreen,
  SecurityPostureProfilesScreen
} from './components/security/SystemIntegrityScreens';

import { DEVICE_PROFILES } from './data/deviceProfiles';
import { getCapabilitiesForProfile } from './data/capabilitiesData';
import { calculateSecurityScore } from './utils/securityCalculator';
import {
  INITIAL_PRIVACY_STATE,
  SAMPLE_SANDBOX_APPS,
  GUEST_IMAGES,
  SAMPLE_SNAPSHOTS,
  INITIAL_SYSTEM_NOTIFICATIONS
} from './data/osArchitectureData';
import {
  CapabilityItem,
  DeviceProfile,
  SecurityScoreFormula,
  PrivacyCenterState,
  AppSandboxInfo,
  NetworkAccessLevel,
  PermissionGrantState,
  SystemScreen,
  VmSnapshot,
  VmStorageInfo,
  AccentColor,
  ThemeMode,
  NavigationMode,
  SystemNotification
} from './types/securedroid';

export default function App() {
  // Navigation State (Current Active Screen & History Stack)
  const [currentScreen, setCurrentScreen] = useState<SystemScreen>('homescreen');
  const [screenHistory, setScreenHistory] = useState<SystemScreen[]>(['homescreen']);
  const [selectedAppPackage, setSelectedAppPackage] = useState<string | null>(null);

  // Device Profile & Security State
  const [currentProfile, setCurrentProfile] = useState<DeviceProfile>(DEVICE_PROFILES[0]); // POCO X5 Pro 5G

  // Device Lock State & Overlays
  const [isDeviceLocked, setIsDeviceLocked] = useState(false);
  const [isLockdownModeActive, setIsLockdownModeActive] = useState(false);
  const [isShadeOpen, setIsShadeOpen] = useState(false);
  const [isVolumePanelOpen, setIsVolumePanelOpen] = useState(false);
  const [isPowerMenuOpen, setIsPowerMenuOpen] = useState(false);

  // Navigation Mode (Supports '3-button' | 'gesture' | 'native_mobile')
  const [navigationMode, setNavigationMode] = useState<NavigationMode>('3-button');

  // PWA Standalone Mode & Installation Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    // Detect if the app is running in Standalone PWA mode on a mobile device
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // If already running as a standalone installed app on mobile, default to native_mobile navigation
    if (isStandaloneMode) {
      setNavigationMode('native_mobile');
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Hardware Back Button / Mobile System Gesture Integration (HTML5 History API)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.history) {
      window.history.replaceState({ screen: 'homescreen' }, '');
    }

    const handlePopState = () => {
      // If overlays are open, close them first
      if (isShadeOpen) {
        setIsShadeOpen(false);
        return;
      }
      if (isVolumePanelOpen) {
        setIsVolumePanelOpen(false);
        return;
      }
      if (isPowerMenuOpen) {
        setIsPowerMenuOpen(false);
        return;
      }

      setScreenHistory((prev) => {
        if (prev.length > 1) {
          const newHistory = [...prev];
          newHistory.pop();
          const targetScreen = newHistory[newHistory.length - 1];
          setCurrentScreen(targetScreen);
          return newHistory;
        } else {
          setCurrentScreen('homescreen');
          return ['homescreen'];
        }
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isShadeOpen, isVolumePanelOpen, isPowerMenuOpen]);

  // Mobile Touch Edge-Swipe to Go Back Gesture
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStartX(e.touches[0].clientX);
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = Math.abs(touchEndY - touchStartY);

    // If swipe started from left edge (< 40px) and moved horizontally > 70px with low vertical movement
    if (touchStartX < 40 && deltaX > 70 && deltaY < 80) {
      handleBack();
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Volume Levels & DND State
  const [mediaVolume, setMediaVolume] = useState(70);
  const [ringVolume, setRingVolume] = useState(85);
  const [alarmVolume, setAlarmVolume] = useState(90);
  const [isDnd, setIsDnd] = useState(false);

  // Theme & Personalization (Supports 'system' | 'dark' | 'light')
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });
  const [accentColor, setAccentColor] = useState<AccentColor>('slate');

  // Reactively track system color scheme changes when themeMode is 'system'
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    // Sync initial value
    setSystemPrefersDark(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isDarkMode = themeMode === 'system' ? systemPrefersDark : themeMode === 'dark';

  // Notifications List
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_SYSTEM_NOTIFICATIONS);

  // Privacy & Sensor State
  const [privacyState, setPrivacyState] = useState<PrivacyCenterState>(INITIAL_PRIVACY_STATE);

  // Installed Sandboxed Apps
  const [apps, setApps] = useState<AppSandboxInfo[]>(SAMPLE_SANDBOX_APPS);

  // Network Controls
  const [isInternetOff, setIsInternetOff] = useState(false);
  const [isVpnOnlyActive, setIsVpnOnlyActive] = useState(true);

  // VM Snapshots & Storage State
  const [snapshots, setSnapshots] = useState<VmSnapshot[]>(SAMPLE_SNAPSHOTS);
  const vmStorage: VmStorageInfo = {
    usedGb: 54.2,
    maximumGb: currentProfile.totalStorageGb,
    hostFreeSpaceGb: currentProfile.totalStorageGb - 54.2,
    safetyReserveGb: 20.0,
    safeGrowthGb: currentProfile.totalStorageGb - 54.2 - 20.0,
    sparseAllocationActive: true,
  };

  // Real-time system clock string
  const [timeString, setTimeString] = useState('14:32');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 20000);
    return () => clearInterval(interval);
  }, []);

  // Capabilities & Qualitative Security Score Calculation
  const capabilities = useMemo<CapabilityItem[]>(() => {
    return getCapabilitiesForProfile(currentProfile);
  }, [currentProfile]);

  const securityScore = useMemo<SecurityScoreFormula>(() => {
    return calculateSecurityScore(currentProfile);
  }, [currentProfile]);

  // Navigation Handlers
  const navigateTo = (screen: SystemScreen) => {
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({ screen }, '');
    }
    setScreenHistory((prev) => [...prev, screen]);
    setCurrentScreen(screen);
  };

  const handleBack = () => {
    if (screenHistory.length > 1) {
      const newHistory = [...screenHistory];
      newHistory.pop();
      const prevScreen = newHistory[newHistory.length - 1];
      setScreenHistory(newHistory);
      setCurrentScreen(prevScreen);
    } else {
      setCurrentScreen('homescreen');
    }
  };

  const handleHome = () => {
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({ screen: 'homescreen' }, '');
    }
    setScreenHistory(['homescreen']);
    setCurrentScreen('homescreen');
  };

  const handleRecents = () => {
    if (currentScreen === 'recents') {
      handleBack();
    } else {
      navigateTo('recents');
    }
  };

  const handleSearch = () => {
    navigateTo('search');
  };

  const handleOpenAppDetail = (pkgName: string) => {
    setSelectedAppPackage(pkgName);
    navigateTo('settings_app_detail');
  };

  // Sensor Killswitch Handlers
  const handleToggleCameraKillswitch = () => {
    setPrivacyState((prev) => {
      const nextState = !prev.cameraKillSwitch;
      const newLog = {
        id: `acc-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        appName: 'Camera HAL Controller',
        packageName: 'android.hardware.camera',
        uid: 1047,
        sensor: 'CAMERA' as const,
        actionTaken: nextState ? ('BLOCKED' as const) : ('AUTHORIZED' as const),
        details: nextState ? 'Global camera killswitch active.' : 'Camera hardware feed active.',
        isDemo: false,
      };
      return {
        ...prev,
        cameraKillSwitch: nextState,
        activeCameraApps: nextState ? [] : prev.activeCameraApps,
        accessLog: [newLog, ...prev.accessLog].slice(0, 40),
      };
    });
  };

  const handleToggleMicKillswitch = () => {
    setPrivacyState((prev) => {
      const nextState = !prev.micKillSwitch;
      const newLog = {
        id: `acc-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        appName: 'AudioFlinger Subsystem',
        packageName: 'android.hardware.audio',
        uid: 1041,
        sensor: 'MIC' as const,
        actionTaken: nextState ? ('BLOCKED' as const) : ('AUTHORIZED' as const),
        details: nextState ? 'Microphone muted with zero-bytes.' : 'Microphone audio feed restored.',
        isDemo: false,
      };
      return {
        ...prev,
        micKillSwitch: nextState,
        activeMicApps: nextState ? [] : prev.activeMicApps,
        accessLog: [newLog, ...prev.accessLog].slice(0, 40),
      };
    });
  };

  const handleToggleSensorKillswitch = () => {
    setPrivacyState((prev) => {
      const nextState = !prev.sensorKillSwitch;
      const newLog = {
        id: `acc-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        appName: 'SensorManager HAL',
        packageName: 'android.hardware.sensors',
        uid: 1000,
        sensor: 'SENSORS' as const,
        actionTaken: nextState ? ('BLOCKED' as const) : ('AUTHORIZED' as const),
        details: nextState ? 'Motion/gyro sensors disconnected.' : 'Sensors polling resumed.',
        isDemo: false,
      };
      return {
        ...prev,
        sensorKillSwitch: nextState,
        accessLog: [newLog, ...prev.accessLog].slice(0, 40),
      };
    });
  };

  const handleToggleClipboardAlerts = () => {
    setPrivacyState((prev) => ({
      ...prev,
      clipboardAccessAlerts: !prev.clipboardAccessAlerts,
    }));
  };

  const handleToggleLockdownMode = () => {
    setIsLockdownModeActive((prev) => {
      const next = !prev;
      if (next) {
        setIsDeviceLocked(true);
      }
      return next;
    });
  };

  // App Permissions & Firewall Management
  const handleUpdateAppNetwork = (packageName: string, level: NetworkAccessLevel) => {
    setApps((prev) => prev.map((a) => (a.packageName === packageName ? { ...a, networkAccess: level } : a)));
  };

  const handleUpdateAppPermission = (packageName: string, permKey: string, granted: boolean) => {
    setApps((prev) =>
      prev.map((a) => {
        if (a.packageName === packageName) {
          return {
            ...a,
            permissions: {
              ...a.permissions,
              [permKey]: granted ? ('GRANTED' as PermissionGrantState) : ('DENIED' as PermissionGrantState),
            } as typeof a.permissions,
          };
        }
        return a;
      })
    );
  };

  // Snapshot Management
  const handleCreateSnapshot = (name: string) => {
    const newSnap: VmSnapshot = {
      id: `snap-${Date.now()}`,
      name,
      createdAt: new Date().toLocaleString(),
      guestVersion: '2.0.4-signed',
      sizeMb: 140.0,
      sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      status: 'READY',
      note: 'User point-in-time snapshot',
    };
    setSnapshots((prev) => [newSnap, ...prev]);
  };

  const handleRestoreSnapshot = (id: string) => {
    // Verified snapshot restore simulation without throwing modal DOMException
    const restoreNotification: SystemNotification = {
      id: `restore-${Date.now()}`,
      title: 'Snapshot Restored',
      message: `Memory state rolled back to verified baseline (${id}).`,
      appName: 'Microdroid Manager',
      timestamp: 'Just now',
      category: 'SECURITY',
      isDismissible: true,
    };
    setNotifications((prev) => [restoreNotification, ...prev]);
  };

  const handleDeleteSnapshot = (id: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    setNotifications((prev) => prev.filter((n) => !n.isDismissible));
  };

  const isLight = !isDarkMode;
  const activeSelectedApp = apps.find((a) => a.packageName === selectedAppPackage) || apps[0];

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100'
      }`}
    >
      {/* 1. Android Top System Status Bar */}
      <SystemStatusBar
        privacyState={privacyState}
        onOpenQuickSettings={() => setIsShadeOpen(true)}
        onOpenPrivacyCenter={() => navigateTo('privacy_center')}
        isLockdownActive={isLockdownModeActive}
        timeString={timeString}
        isLight={isLight}
        batteryLevel={84}
        isVpnActive={isVpnOnlyActive}
        isDndActive={isDnd}
      />

      {/* 2. Lock Screen Overlay (if locked) */}
      <LockScreenView
        isLocked={isDeviceLocked}
        onUnlock={() => setIsDeviceLocked(false)}
        isLockdownActive={isLockdownModeActive}
        onToggleLockdown={handleToggleLockdownMode}
        hostStatus={securityScore.hostStatus}
        qualitativeTier={securityScore.qualitativeTier}
        timeString={timeString}
        isLight={isLight}
      />

      {/* 3. Quick Settings Notification Shade Pull-down */}
      <QuickSettingsShade
        isOpen={isShadeOpen}
        onClose={() => setIsShadeOpen(false)}
        privacyState={privacyState}
        onToggleCameraKillswitch={handleToggleCameraKillswitch}
        onToggleMicKillswitch={handleToggleMicKillswitch}
        onToggleSensorKillswitch={handleToggleSensorKillswitch}
        isVpnOnlyActive={isVpnOnlyActive}
        onToggleVpnOnly={() => setIsVpnOnlyActive(!isVpnOnlyActive)}
        isInternetOff={isInternetOff}
        onToggleInternet={() => setIsInternetOff(!isInternetOff)}
        isLockdownActive={isLockdownModeActive}
        onToggleLockdown={handleToggleLockdownMode}
        onNavigateTab={(scr) => {
          navigateTo(scr);
          setIsShadeOpen(false);
        }}
        notifications={notifications}
        onDismissNotification={handleDismissNotification}
        onClearAllNotifications={handleClearAllNotifications}
        themeMode={themeMode}
        onCycleThemeMode={() => {
          if (themeMode === 'system') setThemeMode('dark');
          else if (themeMode === 'dark') setThemeMode('light');
          else setThemeMode('system');
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => {
          setThemeMode(isDarkMode ? 'light' : 'dark');
        }}
        isDnd={isDnd}
        onToggleDnd={() => setIsDnd(!isDnd)}
        isLight={isLight}
      />

      {/* 4. Floating Volume Panel */}
      <VolumePanel
        isOpen={isVolumePanelOpen}
        onClose={() => setIsVolumePanelOpen(false)}
        isLight={isLight}
        mediaVolume={mediaVolume}
        setMediaVolume={setMediaVolume}
        ringVolume={ringVolume}
        setRingVolume={setRingVolume}
        alarmVolume={alarmVolume}
        setAlarmVolume={setAlarmVolume}
        isDnd={isDnd}
        setIsDnd={setIsDnd}
      />

      {/* 5. Floating Power Menu & Lockdown Dialog */}
      <PowerMenu
        isOpen={isPowerMenuOpen}
        onClose={() => setIsPowerMenuOpen(false)}
        onLockdown={handleToggleLockdownMode}
        onRestart={() => {
          setIsPowerMenuOpen(false);
          setIsDeviceLocked(true);
        }}
        onPowerOff={() => {
          setIsPowerMenuOpen(false);
          setIsDeviceLocked(true);
        }}
        isLight={isLight}
      />

      {/* 6. Active Screen Viewport */}
      <main className={`flex-1 max-w-4xl w-full mx-auto overflow-y-auto ${
        navigationMode === 'native_mobile' ? 'pb-6' : 'pb-16'
      }`}>
        {/* Level 1: Normal System Experience */}
        {currentScreen === 'homescreen' && (
          <SystemHomeScreen
            profile={currentProfile}
            hostStatus={securityScore.hostStatus}
            qualitativeTier={securityScore.qualitativeTier}
            privacyState={privacyState}
            onNavigateTab={navigateTo}
            onOpenAppDrawer={() => navigateTo('app_drawer')}
            onOpenSearch={handleSearch}
            isLight={isLight}
          />
        )}

        {currentScreen === 'app_drawer' && (
          <AppDrawerScreen
            apps={apps}
            onOpenApp={(pkg) => handleOpenAppDetail(pkg)}
            onOpenAppDetail={handleOpenAppDetail}
            onNavigate={navigateTo}
            isLight={isLight}
          />
        )}

        {currentScreen === 'recents' && (
          <RecentAppsScreen
            apps={apps}
            onSelectApp={navigateTo}
            onClearAll={() => navigateTo('homescreen')}
            onOpenAppDetail={handleOpenAppDetail}
            isLight={isLight}
          />
        )}

        {currentScreen === 'search' && (
          <GlobalSearchScreen
            onClose={handleBack}
            onNavigate={navigateTo}
            onOpenAppDetail={handleOpenAppDetail}
            apps={apps}
            isLight={isLight}
          />
        )}

        {/* Android Settings Subsystem */}
        {currentScreen === 'settings' && (
          <SettingsHomeScreen
            onNavigate={navigateTo}
            profile={currentProfile}
            hostStatus={securityScore.hostStatus}
            qualitativeTier={securityScore.qualitativeTier}
            isLight={isLight}
          />
        )}

        {currentScreen === 'settings_network' && (
          <SettingsNetworkScreen
            onBack={handleBack}
            isInternetOff={isInternetOff}
            onToggleInternet={() => setIsInternetOff(!isInternetOff)}
            isVpnOnlyActive={isVpnOnlyActive}
            onToggleVpnOnly={() => setIsVpnOnlyActive(!isVpnOnlyActive)}
            isLight={isLight}
          />
        )}

        {currentScreen === 'settings_connected' && (
          <SettingsConnectedScreen onBack={handleBack} isLight={isLight} />
        )}

        {currentScreen === 'settings_navigation' && (
          <SettingsNavigationScreen
            onBack={handleBack}
            navigationMode={navigationMode}
            onSelectNavigationMode={setNavigationMode}
            isLight={isLight}
          />
        )}

        {currentScreen === 'settings_install_app' && (
          <InstallAppScreen
            onBack={handleBack}
            deferredPrompt={deferredPrompt}
            onInstallPwa={handleInstallPwa}
            isStandalone={isStandalone}
            isLight={isLight}
          />
        )}

        {currentScreen === 'settings_apps' && (
          <AppSandboxScreen
            apps={apps}
            onUpdateAppNetwork={handleUpdateAppNetwork}
            onUpdateAppPermission={(pkg, perm, state) =>
              handleUpdateAppPermission(pkg, perm, state === 'GRANTED')
            }
          />
        )}

        {currentScreen === 'settings_app_detail' && (
          <AppDetailScreen
            app={activeSelectedApp}
            onBack={handleBack}
            onUpdateNetworkAccess={handleUpdateAppNetwork}
            onToggleHardenedMalloc={() => {}}
            onToggleStrictIoctl={() => {}}
            onTogglePermission={(pkg, perm) => {
              const currentGranted = (activeSelectedApp.permissions as any)?.[perm.toLowerCase()] === 'GRANTED';
              handleUpdateAppPermission(pkg, perm.toLowerCase(), !currentGranted);
            }}
            isLight={isLight}
          />
        )}

        {currentScreen === 'settings_battery' && (
          <SettingsBatteryScreen onBack={handleBack} isLight={isLight} />
        )}

        {currentScreen === 'settings_storage' && (
          <SettingsStorageScreen onBack={handleBack} profile={currentProfile} isLight={isLight} />
        )}

        {currentScreen === 'settings_wallpaper' && (
          <SettingsWallpaperScreen
            onBack={handleBack}
            accent={accentColor}
            setAccent={setAccentColor}
            themeMode={themeMode}
            setThemeMode={setThemeMode}
            isLight={isLight}
          />
        )}

        {currentScreen === 'settings_sound' && (
          <div className="p-4">
            <VolumePanel
              isOpen={true}
              onClose={handleBack}
              isLight={isLight}
              mediaVolume={mediaVolume}
              setMediaVolume={setMediaVolume}
              ringVolume={ringVolume}
              setRingVolume={setRingVolume}
              alarmVolume={alarmVolume}
              setAlarmVolume={setAlarmVolume}
              isDnd={isDnd}
              setIsDnd={setIsDnd}
            />
          </div>
        )}

        {currentScreen === 'settings_about' && (
          <SettingsAboutScreen
            onBack={handleBack}
            onOpenDiagnostics={() => navigateTo('advanced_diagnostics')}
            profile={currentProfile}
            isLight={isLight}
          />
        )}

        {/* Level 2: Security & Privacy Centers */}
        {currentScreen === 'security_center' && (
          <SecurityCenterScreen
            onBack={handleBack}
            onNavigate={navigateTo}
            hostStatus={securityScore.hostStatus}
            qualitativeTier={securityScore.qualitativeTier}
            profile={currentProfile}
            isLight={isLight}
          />
        )}

        {currentScreen === 'privacy_center' && (
          <PrivacyCenterScreen
            privacyState={privacyState}
            onToggleCameraKillswitch={handleToggleCameraKillswitch}
            onToggleMicKillswitch={handleToggleMicKillswitch}
            onToggleSensorKillswitch={handleToggleSensorKillswitch}
            onToggleClipboardAlerts={handleToggleClipboardAlerts}
            sensorLogs={privacyState.accessLog}
            onNavigate={navigateTo}
            onBack={handleBack}
            isLight={isLight}
          />
        )}

        {currentScreen === 'permission_manager' && (
          <PermissionManagerScreen
            apps={apps}
            onBack={handleBack}
            onUpdateAppPermission={(pkg, perm, val) =>
              handleUpdateAppPermission(pkg, perm.toLowerCase(), val)
            }
            isLight={isLight}
          />
        )}

        {currentScreen === 'secure_environment' && (
          <SecureEnvironmentScreen
            profile={currentProfile}
            vmStorage={vmStorage}
            guestImages={GUEST_IMAGES}
            snapshots={snapshots}
            onCreateSnapshot={handleCreateSnapshot}
            onRestoreSnapshot={handleRestoreSnapshot}
            onDeleteSnapshot={handleDeleteSnapshot}
            onNavigate={navigateTo}
            onBack={handleBack}
            isLight={isLight}
          />
        )}

        {currentScreen === 'system_updates' && (
          <SystemUpdatesScreen onBack={handleBack} isLight={isLight} />
        )}

        {currentScreen === 'app_sandbox' && (
          <AppSandboxScreen
            apps={apps}
            onUpdateAppNetwork={handleUpdateAppNetwork}
            onUpdateAppPermission={(pkg, perm, state) =>
              handleUpdateAppPermission(pkg, perm, state === 'GRANTED')
            }
          />
        )}

        {/* Feature Pack Screen Renders */}
        {currentScreen === 'advanced_protection' && (
          <AdvancedProtectionScreen onBack={handleBack} isLight={isLight} />
        )}

        {currentScreen === 'exploit_protection' && (
          <ExploitProtectionScreen onBack={handleBack} isLight={isLight} />
        )}

        {currentScreen === 'device_security_state' && (
          <DeviceSecurityStateScreen
            onBack={handleBack}
            onTriggerLockdown={handleToggleLockdownMode}
            isLight={isLight}
          />
        )}

        {currentScreen === 'authentication_duress' && (
          <AuthenticationDuressScreen onBack={handleBack} isLight={isLight} />
        )}

        {currentScreen === 'emergency_protection' && (
          <EmergencyProtectionScreen
            onBack={handleBack}
            onLockdown={handleToggleLockdownMode}
            isLight={isLight}
          />
        )}

        {currentScreen === 'theft_protection' && (
          <TheftProtectionScreen onBack={handleBack} isLight={isLight} />
        )}

        {currentScreen === 'app_verification' && (
          <AppVerificationScreen onBack={handleBack} isLight={isLight} />
        )}

        {currentScreen === 'securedroid_store' && (
          <SecureDroidStoreScreen onBack={handleBack} isLight={isLight} />
        )}

        {currentScreen === 'browser_web_security' && (
          <BrowserWebSecurityScreen onBack={handleBack} isLight={isLight} />
        )}

        {currentScreen === 'complete_sensor_privacy' && (
          <CompleteSensorPrivacyScreen onBack={handleBack} isLight={isLight} />
        )}

        {currentScreen === 'certificates_passkeys' && (
          <CertificatesPasskeysScreen onBack={handleBack} isLight={isLight} />
        )}

        {currentScreen === 'backup_restore' && (
          <BackupRestoreScreen onBack={handleBack} isLight={isLight} />
        )}

        {currentScreen === 'security_audit_log' && (
          <SecurityAuditLogScreen onBack={handleBack} isLight={isLight} />
        )}

        {currentScreen === 'threat_model_center' && (
          <ThreatModelCenterScreen onBack={handleBack} isLight={isLight} />
        )}

        {currentScreen === 'developer_debug_security' && (
          <DeveloperDebugSecurityScreen onBack={handleBack} isLight={isLight} />
        )}

        {currentScreen === 'security_posture_profiles' && (
          <SecurityPostureProfilesScreen onBack={handleBack} isLight={isLight} />
        )}

        {/* Additional Level 2 & Settings Screens */}
        {currentScreen === 'settings_users' && (
          <div className="p-4">
            <UserProfilesScreen />
          </div>
        )}

        {(currentScreen === 'settings_system' || currentScreen === 'system_updates') && (
          <SystemUpdatesScreen onBack={handleBack} isLight={isLight} />
        )}

        {(currentScreen === 'network_controls' || currentScreen === 'network_privacy_center') && (
          <div className="p-4">
            <NetworkControlScreen
              isInternetOff={isInternetOff}
              onToggleInternet={() => setIsInternetOff(!isInternetOff)}
              isVpnOnlyActive={isVpnOnlyActive}
              onToggleVpnOnly={() => setIsVpnOnlyActive(!isVpnOnlyActive)}
            />
          </div>
        )}

        {currentScreen === 'codebase' && (
          <div className="p-4">
            <CodeExplorer />
          </div>
        )}

        {currentScreen === 'poco_guide' && (
          <div className="p-4">
            <PocoDeploymentGuide />
          </div>
        )}

        {currentScreen === 'architecture_registry' && (
          <div className="p-4">
            <OsArchitectureScreen />
          </div>
        )}

        {currentScreen === 'capability_engine' && (
          <div className="p-4">
            <CapabilityEngine
              currentProfile={currentProfile}
              setProfile={setCurrentProfile}
              qualitativeTier={securityScore.qualitativeTier}
              isLight={isLight}
            />
          </div>
        )}

        {/* Level 3: Advanced Diagnostics Console */}
        {currentScreen === 'advanced_diagnostics' && (
          <AdvancedDiagnosticsScreen
            profile={currentProfile}
            capabilities={capabilities}
            onBack={handleBack}
            onNavigate={navigateTo}
            isLight={isLight}
          />
        )}
      </main>

      {/* 7. Android System Navigation Bar (3-Button, Gesture Bar, or Hidden for Native Mobile) */}
      <SystemNavigationBar
        onBack={handleBack}
        onHome={handleHome}
        onRecents={handleRecents}
        onSearch={handleSearch}
        onOpenVolume={() => setIsVolumePanelOpen(true)}
        onOpenPower={() => setIsPowerMenuOpen(true)}
        currentScreen={currentScreen}
        navigationMode={navigationMode}
        isLight={isLight}
      />
    </div>
  );
}
