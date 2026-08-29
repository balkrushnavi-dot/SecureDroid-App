import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { SecureDroidNative } from '../services/native/SecureDroidNative';
import type { NativeInstalledApp, NativeAppRiskReport } from '../types/native';

// ============================================================
// TYPE EXPORTS — matches all consuming screens
// ============================================================

export interface AppInfo {
  packageName: string;
  appName: string;
  label?: string;
  versionName: string;
  versionCode: number;
  targetSdk?: number;
  minSdk?: number;
  isSystemApp: boolean;
  isEnabled?: boolean;
  isLaunchable?: boolean;
  firstInstallTime: number;
  lastUpdateTime: number;
  installTime: number;
  updateTime: number;
  requestedPermissions: string[];
  grantedPermissions: string[];
  dangerousPermissions: string[];
  installerPackage?: string;
  installSource: string;
  installerKnown?: boolean;
  isSideloaded: boolean;
  isDebuggable?: boolean;
  enabled?: boolean;
  permissions: string[];
  signingCertSha256?: string;
}

export interface RiskInfo {
  appName: string;
  packageName: string;
  riskLevel: string;
  securityScore?: number;
  findingCount?: number;
  findings?: Array<{
    code?: string;
    title?: string;
    description?: string;
    severity?: string;
    points?: number;
  }>;
  reason?: string;
  installSource?: string;
  isSystemApp?: boolean;
}

export interface HardeningFinding {
  id: string;
  level: 'GOOD' | 'WARNING' | 'CRITICAL';
  summary: string;
}

// ============================================================
// MOCK DATA (used when native bridge fails or in web preview)
// ============================================================

const MOCK_APPS: AppInfo[] = [
  {
    packageName: 'com.example.demo',
    appName: 'Demo App',
    label: 'Demo App',
    versionName: '1.0.0',
    versionCode: 1,
    targetSdk: 33,
    minSdk: 21,
    isSystemApp: false,
    isLaunchable: true,
    firstInstallTime: Date.now() - 86400000,
    lastUpdateTime: Date.now(),
    installTime: Date.now() - 86400000,
    updateTime: Date.now(),
    requestedPermissions: ['android.permission.CAMERA'],
    grantedPermissions: ['android.permission.CAMERA'],
    dangerousPermissions: ['android.permission.CAMERA'],
    installerPackage: 'com.android.vending',
    installSource: 'com.android.vending',
    installerKnown: true,
    isSideloaded: false,
    isDebuggable: false,
    enabled: true,
    isEnabled: true,
    permissions: ['android.permission.CAMERA'],
  },
  {
    packageName: 'com.android.chrome',
    appName: 'Chrome',
    label: 'Chrome',
    versionName: '120.0.0',
    versionCode: 120,
    targetSdk: 33,
    minSdk: 21,
    isSystemApp: true,
    isLaunchable: true,
    firstInstallTime: Date.now() - 86400000 * 30,
    lastUpdateTime: Date.now() - 86400000,
    installTime: Date.now() - 86400000 * 30,
    updateTime: Date.now() - 86400000,
    requestedPermissions: ['android.permission.INTERNET'],
    grantedPermissions: ['android.permission.INTERNET'],
    dangerousPermissions: [],
    installerPackage: 'com.android.vending',
    installSource: 'com.android.vending',
    installerKnown: true,
    isSideloaded: false,
    isDebuggable: false,
    enabled: true,
    isEnabled: true,
    permissions: ['android.permission.INTERNET'],
  },
  {
    packageName: 'com.whatsapp',
    appName: 'WhatsApp',
    label: 'WhatsApp',
    versionName: '2.24.0',
    versionCode: 240,
    targetSdk: 33,
    minSdk: 21,
    isSystemApp: false,
    isLaunchable: true,
    firstInstallTime: Date.now() - 86400000 * 5,
    lastUpdateTime: Date.now() - 86400000 * 2,
    installTime: Date.now() - 86400000 * 5,
    updateTime: Date.now() - 86400000 * 2,
    requestedPermissions: ['android.permission.CAMERA', 'android.permission.RECORD_AUDIO', 'android.permission.READ_CONTACTS'],
    grantedPermissions: ['android.permission.CAMERA', 'android.permission.RECORD_AUDIO', 'android.permission.READ_CONTACTS'],
    dangerousPermissions: ['android.permission.CAMERA', 'android.permission.RECORD_AUDIO', 'android.permission.READ_CONTACTS'],
    installerPackage: 'com.android.vending',
    installSource: 'com.android.vending',
    installerKnown: true,
    isSideloaded: false,
    isDebuggable: false,
    enabled: true,
    isEnabled: true,
    permissions: ['android.permission.CAMERA', 'android.permission.RECORD_AUDIO', 'android.permission.READ_CONTACTS'],
  },
];

const MOCK_RISKS: RiskInfo[] = [
  {
    appName: 'Demo App',
    packageName: 'com.example.demo',
    riskLevel: 'HIGH',
    findingCount: 1,
    findings: [{ code: 'CAMERA', title: 'Camera Permission', description: 'App has camera permission', severity: 'HIGH' }],
  },
  {
    appName: 'WhatsApp',
    packageName: 'com.whatsapp',
    riskLevel: 'HIGH',
    findingCount: 1,
    findings: [{ code: 'CONTACTS', title: 'Contacts Permission', description: 'App can read contacts', severity: 'HIGH' }],
  },
];

const MOCK_HARDENING: { score: number; findings: HardeningFinding[] } = {
  score: 60,
  findings: [
    { id: 'SCREEN_LOCK_ENABLED', level: 'GOOD', summary: 'Screen lock is configured.' },
    { id: 'DEVICE_NOT_ENCRYPTED', level: 'WARNING', summary: 'Device storage is not encrypted.' },
  ],
};

// ============================================================
// THE HOOK
// ============================================================

export const useSecureDroid = () => {
  // Always initialized with mock data so the UI never sees undefined
  const [apps, setApps] = useState<AppInfo[]>(MOCK_APPS);
  const [risks, setRisks] = useState<RiskInfo[]>(MOCK_RISKS);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(MOCK_HARDENING.score);
  const [hardeningFindings, setHardeningFindings] = useState<HardeningFinding[]>(MOCK_HARDENING.findings);
  const [usingMock, setUsingMock] = useState(true);
  const isNative = Capacitor.isNativePlatform();

  const loadData = useCallback(async () => {
    // Web preview — use mock data
    if (!isNative) {
      setConnected(true);
      setUsingMock(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Check connection
      let connResult;
      try {
        connResult = await SecureDroidNative.checkConnection();
      } catch {
        setUsingMock(true);
        setError('Native bridge unavailable — using mock data.');
        setLoading(false);
        return;
      }

      if (!connResult.success || !connResult.data?.connected) {
        setUsingMock(true);
        setError('Native bridge unavailable — using mock data.');
        setLoading(false);
        return;
      }
      setConnected(true);
      setUsingMock(false);

      // 2. Get installed apps
      let appsResult;
      try {
        appsResult = await SecureDroidNative.getInstalledApps();
      } catch {
        setUsingMock(true);
        setLoading(false);
        return;
      }

      if (appsResult.success && appsResult.data) {
        const normalizedApps: AppInfo[] = appsResult.data.map((app: any): AppInfo => {
          const requested = app.requestedPermissions || app.permissions || [];
          return {
            packageName: app.packageName || '',
            appName: app.label || app.appName || app.packageName || 'Unknown',
            label: app.label || app.appName || app.packageName || 'Unknown',
            versionName: app.versionName || 'Unknown',
            versionCode: app.versionCode || 0,
            targetSdk: app.targetSdk || 0,
            minSdk: app.minSdk || 0,
            isSystemApp: !!app.isSystemApp,
            isEnabled: app.isEnabled !== undefined ? app.isEnabled : true,
            isLaunchable: !!app.isLaunchable,
            firstInstallTime: app.firstInstallTime || app.installTime || 0,
            lastUpdateTime: app.lastUpdateTime || app.updateTime || 0,
            installTime: app.installTime || app.firstInstallTime || 0,
            updateTime: app.updateTime || app.lastUpdateTime || 0,
            requestedPermissions: requested,
            grantedPermissions: app.grantedPermissions || [],
            dangerousPermissions: app.dangerousPermissions || [],
            installerPackage: app.installerPackage || app.installerPackageName || app.installSource || undefined,
            installSource: app.installSource || app.installerPackage || 'UNKNOWN',
            installerKnown: !!(app.installerPackage || app.installerPackageName || app.installSource),
            isSideloaded: !!app.isSideloaded,
            isDebuggable: !!app.isDebuggable,
            enabled: app.enabled !== undefined ? app.enabled : true,
            permissions: requested,
            signingCertSha256: app.signingCertSha256 || undefined,
          };
        });
        setApps(normalizedApps);
      }

      // 3. Get risk reports
      let riskResult;
      try {
        riskResult = await SecureDroidNative.getAppRiskReports();
      } catch {
        setUsingMock(true);
        setLoading(false);
        return;
      }

      if (riskResult.success && riskResult.data) {
        const currentApps = appsResult?.success && appsResult.data ? appsResult.data : MOCK_APPS;
        const userAppPackageNames = new Set(
          currentApps.filter((app: any) => !app.isSystemApp).map((app: any) => app.packageName)
        );

        const allRiskDetails: RiskInfo[] = riskResult.data.map((report: NativeAppRiskReport): RiskInfo => ({
          appName: report.label || report.packageName || 'Unknown',
          packageName: report.packageName || '',
          riskLevel: report.overallRisk || 'LOW',
          findingCount: report.findings?.length || 0,
          findings: report.findings?.map((f: any) => ({
            code: f.id || f.code || undefined,
            title: f.title || f.summary || 'Finding',
            description: f.summary || f.description || '',
            severity: f.severity || f.level || 'LOW',
            points: f.points || 0,
          })) || [],
          isSystemApp: false,
        }));

        const userAppRisks = allRiskDetails.filter(risk =>
          userAppPackageNames.has(risk.packageName)
        );

        const meaningfulRisks = userAppRisks.filter(risk =>
          ['MEDIUM', 'HIGH', 'CRITICAL'].includes(risk.riskLevel.toUpperCase())
        );

        if (meaningfulRisks.length > 0) {
          setRisks(meaningfulRisks);
        } else if (allRiskDetails.length > 0) {
          // If there are risks but none are medium/high/critical, keep them all (but we'll still filter for display)
          setRisks(userAppRisks);
        }
      }

      // 4. Get hardening report
      let hardeningResult;
      try {
        hardeningResult = await SecureDroidNative.getHardeningReport();
      } catch {
        setUsingMock(true);
        setLoading(false);
        return;
      }

      if (hardeningResult.success && hardeningResult.data) {
        const scoreVal = typeof hardeningResult.data.score === 'number' ? hardeningResult.data.score : 0;
        setScore(scoreVal);
        const findings = Array.isArray(hardeningResult.data.findings)
          ? hardeningResult.data.findings.map((f: any): HardeningFinding => ({
              id: String(f.id || ''),
              level: (f.level === 'GOOD' || f.level === 'WARNING' || f.level === 'CRITICAL') ? f.level : 'GOOD',
              summary: String(f.summary || ''),
            }))
          : [];
        setHardeningFindings(findings);
      }

    } catch (err) {
      console.error('SecureDroid loadData error:', err);
      setUsingMock(true);
      setError('Failed to load real data — using mock data.');
    } finally {
      setLoading(false);
    }
  }, [isNative]);

  // Load once on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    apps,
    risks,
    loading,
    connected,
    error,
    score,
    hardeningFindings,
    usingMock,
    reload: loadData,
  };
};
