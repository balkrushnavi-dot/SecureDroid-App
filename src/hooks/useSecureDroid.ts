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
// THE HOOK — No Mock Data, Honest Errors
// ============================================================

export const useSecureDroid = () => {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [risks, setRisks] = useState<RiskInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [hardeningFindings, setHardeningFindings] = useState<HardeningFinding[]>([]);
  const isNative = Capacitor.isNativePlatform();

  const loadData = useCallback(async () => {
    if (!isNative) {
      setConnected(false);
      setLoading(false);
      setError('SecureDroid requires a native Android environment to function.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Connection
      let connResult;
      try {
        connResult = await SecureDroidNative.checkConnection();
      } catch {
        setConnected(false);
        setLoading(false);
        setError('Native bridge is unavailable.');
        return;
      }

      if (!connResult.success || !connResult.data?.connected) {
        setConnected(false);
        setLoading(false);
        setError(connResult.message || 'Native bridge is unavailable.');
        return;
      }
      setConnected(true);

      // 2. Apps
      let appsResult;
      try {
        appsResult = await SecureDroidNative.getInstalledApps();
      } catch {
        setConnected(false);
        setLoading(false);
        setError('Failed to scan installed applications.');
        return;
      }

      if (!appsResult.success || !appsResult.data) {
        setConnected(false);
        setLoading(false);
        setError(appsResult.message || 'Failed to scan installed applications.');
        return;
      }

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

      // 3. Risks
      let riskResult;
      try {
        riskResult = await SecureDroidNative.getAppRiskReports();
      } catch {
        setError('Failed to analyze application risks.');
        setLoading(false);
        return;
      }

      if (riskResult.success && riskResult.data) {
        const userAppPackageNames = new Set(
          normalizedApps.filter(app => !app.isSystemApp).map(app => app.packageName)
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

        setRisks(meaningfulRisks.length > 0 ? meaningfulRisks : userAppRisks);
      }

      // 4. Hardening
      let hardeningResult;
      try {
        hardeningResult = await SecureDroidNative.getHardeningReport();
      } catch {
        setError('Failed to analyze device security hardening.');
        setLoading(false);
        return;
      }

      if (hardeningResult.success && hardeningResult.data) {
        setScore(typeof hardeningResult.data.score === 'number' ? hardeningResult.data.score : 0);
        const findings = Array.isArray(hardeningResult.data.findings)
          ? hardeningResult.data.findings.map((f: any): HardeningFinding => ({
              id: String(f.id || ''),
              level: (f.level === 'GOOD' || f.level === 'WARNING' || f.level === 'CRITICAL') ? f.level : 'GOOD',
              summary: String(f.summary || ''),
            }))
          : [];
        setHardeningFindings(findings);
      }

    } catch {
      setConnected(false);
      setError('Failed to load security data.');
    } finally {
      setLoading(false);
    }
  }, [isNative]);

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
    usingMock: false,
    reload: loadData,
  };
};
