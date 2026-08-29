import { useCallback, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { SecureDroidNative } from '../services/native/SecureDroidNative';

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

const stringValue = (value: unknown, fallback = '') =>
  typeof value === 'string' ? value : fallback;

const numberValue = (value: unknown, fallback = 0) =>
  typeof value === 'number' && Number.isFinite(value)
    ? value
    : fallback;

const booleanValue = (value: unknown, fallback = false) =>
  typeof value === 'boolean' ? value : fallback;

const stringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];

const normalizeApp = (value: unknown): AppInfo => {
  const raw = value as Record<string, unknown>;

  const requestedPermissions = stringArray(
    raw.requestedPermissions ?? raw.permissions,
  );

  const grantedPermissions = stringArray(raw.grantedPermissions);

  const dangerousPermissions = stringArray(
    raw.dangerousPermissions,
  );

  const firstInstallTime = numberValue(
    raw.firstInstallTime ?? raw.installTime,
  );

  const lastUpdateTime = numberValue(
    raw.lastUpdateTime ?? raw.updateTime,
  );

  const installerPackage =
    stringValue(
      raw.installerPackage ??
        raw.installerPackageName,
    ) || undefined;

  const installSource = stringValue(
    raw.installSource ??
      raw.installerPackage ??
      raw.installerPackageName,
    'UNKNOWN',
  );

  const enabled = booleanValue(
    raw.enabled ?? raw.isEnabled,
    true,
  );

  return {
    packageName: stringValue(raw.packageName, 'UNKNOWN'),
    appName: stringValue(
      raw.label ?? raw.appName ?? raw.packageName,
      'Unknown application',
    ),
    label:
      stringValue(raw.label ?? raw.appName) || undefined,
    versionName: stringValue(raw.versionName, 'Unknown'),
    versionCode: numberValue(raw.versionCode),
    targetSdk: numberValue(raw.targetSdk),
    minSdk: numberValue(raw.minSdk),
    isSystemApp: booleanValue(raw.isSystemApp),
    isEnabled: enabled,
    isLaunchable:
      typeof raw.isLaunchable === 'boolean'
        ? raw.isLaunchable
        : undefined,
    firstInstallTime,
    lastUpdateTime,
    installTime: firstInstallTime,
    updateTime: lastUpdateTime,
    requestedPermissions,
    grantedPermissions,
    dangerousPermissions,
    installerPackage,
    installSource,
    installerKnown:
      typeof raw.installerKnown === 'boolean'
        ? raw.installerKnown
        : installerPackage !== undefined,
    isSideloaded: booleanValue(raw.isSideloaded),
    isDebuggable:
      typeof raw.isDebuggable === 'boolean'
        ? raw.isDebuggable
        : undefined,
    enabled,
    permissions: requestedPermissions,
    signingCertSha256:
      stringValue(raw.signingCertSha256) || undefined,
  };
};

const normalizeRisk = (
  value: unknown,
  apps: Map<string, AppInfo>,
): RiskInfo => {
  const raw = value as Record<string, unknown>;

  const packageName = stringValue(raw.packageName);
  const app = apps.get(packageName);

  const rawFindings = Array.isArray(raw.findings)
    ? raw.findings
    : [];

  const findings = rawFindings.map((finding) => {
    const item = finding as Record<string, unknown>;

    return {
      code:
        stringValue(item.id ?? item.code) || undefined,
      title:
        stringValue(
          item.title ?? item.summary,
          'Security finding',
        ),
      description: stringValue(
        item.summary ?? item.description,
      ),
      severity: stringValue(
        item.severity ?? item.level,
        'UNKNOWN',
      ),
      points:
        typeof item.points === 'number'
          ? item.points
          : undefined,
    };
  });

  return {
    appName: stringValue(
      raw.label ?? raw.appName,
      app?.appName ?? packageName,
    ),
    packageName,
    riskLevel: stringValue(
      raw.overallRisk ??
        raw.riskLevel ??
        raw.severity,
      'UNKNOWN',
    ),
    securityScore:
      typeof raw.securityScore === 'number'
        ? raw.securityScore
        : typeof raw.score === 'number'
          ? raw.score
          : undefined,
    findingCount: findings.length,
    findings,
    reason:
      stringValue(raw.reason ?? raw.summary) || undefined,
    installSource: app?.installSource,
    isSystemApp: app?.isSystemApp,
  };
};

export const useSecureDroid = () => {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [risks, setRisks] = useState<RiskInfo[]>([]);
  const [hardeningFindings, setHardeningFindings] =
    useState<HardeningFinding[]>([]);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      setLoading(false);
      setConnected(false);
      setError('Native Android services are unavailable in browser preview.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const connection =
        await SecureDroidNative.checkConnection();

      if (
        !connection.success ||
        connection.data?.connected !== true
      ) {
        setConnected(false);
        setError(
          connection.message ||
            'SecureDroid native bridge is unavailable.',
        );
        return;
      }

      setConnected(true);

      const appsResult =
        await SecureDroidNative.getInstalledApps();

      if (
        appsResult.success &&
        Array.isArray(appsResult.data)
      ) {
        const normalizedApps = appsResult.data
          .map(normalizeApp)
          .filter(
            (app) =>
              app.packageName !== 'UNKNOWN' &&
              app.packageName.length > 0,
          );

        setApps(normalizedApps);

        const appMap = new Map(
          normalizedApps.map((app) => [
            app.packageName,
            app,
          ]),
        );

        try {
          const risksResult =
            await SecureDroidNative.getAppRiskReports();

          if (
            risksResult.success &&
            Array.isArray(risksResult.data)
          ) {
            setRisks(
              risksResult.data
                .map((risk) =>
                  normalizeRisk(risk, appMap),
                )
                .filter((risk) =>
                  appMap.has(risk.packageName),
                ),
            );
          }
        } catch {
          setRisks([]);
        }
      }

      try {
        const hardeningResult =
          await SecureDroidNative.getHardeningReport();

        if (
          hardeningResult.success &&
          hardeningResult.data
        ) {
          const value = hardeningResult.data.score;

          if (
            typeof value === 'number' &&
            Number.isFinite(value)
          ) {
            setScore(
              Math.max(0, Math.min(100, value)),
            );
          }

          if (
            Array.isArray(
              hardeningResult.data.findings,
            )
          ) {
            const findings =
              hardeningResult.data.findings
                .map((finding) => {
                  const item =
                    finding as Record<string, unknown>;

                  const level =
                    stringValue(
                      item.level,
                    );

                  if (
                    level !== 'GOOD' &&
                    level !== 'WARNING' &&
                    level !== 'CRITICAL'
                  ) {
                    return null;
                  }

                  return {
                    id: stringValue(
                      item.id,
                      'UNKNOWN',
                    ),
                    level,
                    summary: stringValue(
                      item.summary,
                    ),
                  } as HardeningFinding;
                })
                .filter(
                  (
                    item,
                  ): item is HardeningFinding =>
                    item !== null,
                );

            setHardeningFindings(findings);
          }
        }
      } catch {
        setHardeningFindings([]);
      }
    } catch (nativeError: unknown) {
      setConnected(false);
      setApps([]);
      setRisks([]);
      setScore(0);
      setHardeningFindings([]);

      setError(
        nativeError instanceof Error
          ? nativeError.message
          : 'SecureDroid native security services failed.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return {
    apps,
    risks,
    hardeningFindings,
    score,
    loading,
    connected,
    error,
    usingMock: false,
    reload: loadData,
  };
};
