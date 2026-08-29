import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { SecureDroidNative } from '../services/native/SecureDroidNative';
import type {
  NativeInstalledApp,
  NativeAppRiskReport,
} from '../types/native';

// ============================================================
// PUBLIC TYPES
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
// NORMALIZATION HELPERS
// ============================================================

const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const asNumber = (value: unknown, fallback = 0): number =>
  typeof value === 'number' && Number.isFinite(value)
    ? value
    : fallback;

const asBoolean = (
  value: unknown,
  fallback = false,
): boolean =>
  typeof value === 'boolean' ? value : fallback;

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter(
        (item): item is string => typeof item === 'string',
      )
    : [];

const normalizeApp = (app: NativeInstalledApp): AppInfo => {
  const raw = app as unknown as Record<string, unknown>;

  const requestedPermissions = asStringArray(
    raw.requestedPermissions ?? raw.permissions,
  );

  const grantedPermissions = asStringArray(
    raw.grantedPermissions,
  );

  const dangerousPermissions = asStringArray(
    raw.dangerousPermissions,
  );

  const installerPackage =
    asString(
      raw.installerPackage ??
        raw.installerPackageName ??
        raw.installSource,
      '',
    ) || undefined;

  const installSource =
    asString(
      raw.installSource ??
        raw.installerPackage ??
        raw.installerPackageName,
      'UNKNOWN',
    );

  const firstInstallTime = asNumber(
    raw.firstInstallTime ?? raw.installTime,
    0,
  );

  const lastUpdateTime = asNumber(
    raw.lastUpdateTime ?? raw.updateTime,
    0,
  );

  const enabled = asBoolean(
    raw.enabled ?? raw.isEnabled,
    true,
  );

  return {
    packageName: asString(
      raw.packageName,
      'UNKNOWN',
    ),

    appName: asString(
      raw.label ?? raw.appName ?? raw.packageName,
      'Unknown application',
    ),

    label:
      asString(
        raw.label ?? raw.appName,
        '',
      ) || undefined,

    versionName: asString(
      raw.versionName,
      'Unknown',
    ),

    versionCode: asNumber(
      raw.versionCode,
      0,
    ),

    targetSdk: asNumber(
      raw.targetSdk,
      0,
    ),

    minSdk: asNumber(
      raw.minSdk,
      0,
    ),

    isSystemApp: asBoolean(
      raw.isSystemApp,
      false,
    ),

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

    isSideloaded: asBoolean(
      raw.isSideloaded,
      false,
    ),

    isDebuggable:
      typeof raw.isDebuggable === 'boolean'
        ? raw.isDebuggable
        : undefined,

    enabled,

    permissions: requestedPermissions,

    signingCertSha256:
      asString(
        raw.signingCertSha256,
        '',
      ) || undefined,
  };
};

const normalizeRisk = (
  report: NativeAppRiskReport,
  appByPackage: Map<string, AppInfo>,
): RiskInfo => {
  const raw = report as unknown as Record<string, unknown>;

  const packageName = asString(
    raw.packageName,
    '',
  );

  const relatedApp = appByPackage.get(packageName);

  const rawFindings = Array.isArray(raw.findings)
    ? raw.findings
    : [];

  const findings = rawFindings.map((finding) => {
    const item =
      finding as Record<string, unknown>;

    return {
      code:
        asString(
          item.id ?? item.code,
          '',
        ) || undefined,

      title:
        asString(
          item.title ?? item.summary,
          'Security finding',
        ),

      description:
        asString(
          item.summary ?? item.description,
          '',
        ),

      severity:
        asString(
          item.severity ?? item.level,
          'UNKNOWN',
        ),

      points:
        typeof item.points === 'number'
          ? item.points
          : undefined,
    };
  });

  const riskLevel = asString(
    raw.overallRisk ??
      raw.riskLevel ??
      raw.severity,
    'UNKNOWN',
  );

  const securityScore =
    typeof raw.securityScore === 'number'
      ? raw.securityScore
      : typeof raw.score === 'number'
        ? raw.score
        : undefined;

  return {
    appName:
      asString(
        raw.label ?? raw.appName,
        relatedApp?.appName ?? packageName,
      ),

    packageName,

    riskLevel,

    securityScore,

    findingCount: findings.length,

    findings,

    reason:
      asString(
        raw.reason ?? raw.summary,
        '',
      ) || undefined,

    installSource:
      relatedApp?.installSource,

    isSystemApp:
      relatedApp?.isSystemApp,
  };
};

// ============================================================
// HOOK
// ============================================================

export const useSecureDroid = () => {
  const isNative = Capacitor.isNativePlatform();

  /*
   * IMPORTANT:
   *
   * Empty state means "no data loaded".
   *
   * It does NOT mean:
   * - safe
   * - protected
   * - no threats
   * - no risky apps
   * - score = 100
   */
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [risks, setRisks] = useState<RiskInfo[]>([]);

  const [loading, setLoading] =
    useState<boolean>(false);

  const [connected, setConnected] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string | null>(null);

  /*
   * A score of 0 here means "no score available".
   *
   * It must not be interpreted by the UI as:
   * "device has a security score of zero".
   *
   * The current consuming screens expect a number,
   * so the public type is preserved.
   */
  const [score, setScore] =
    useState<number>(0);

  const [hardeningFindings, setHardeningFindings] =
    useState<HardeningFinding[]>([]);

  /*
   * Kept for compatibility with existing consumers.
   *
   * This is permanently false in production.
   * There is no mock-data fallback.
   */
  const [usingMock] =
    useState<boolean>(false);

  // ==========================================================
  // LOAD REAL NATIVE DATA
  // ==========================================================

  const loadData = useCallback(async () => {
    /*
     * WEB PREVIEW
     *
     * There is no Android PackageManager here.
     * Therefore there is no legitimate installed-app inventory.
     */
    if (!isNative) {
      setApps([]);
      setRisks([]);
      setScore(0);
      setHardeningFindings([]);
      setConnected(false);
      setError(
        'SecureDroid security data is unavailable in web preview. Run the Android application to access native security data.',
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    /*
     * Clear stale data before loading.
     *
     * This prevents an old scan from being displayed as
     * current security information after a failed reload.
     */
    setApps([]);
    setRisks([]);
    setScore(0);
    setHardeningFindings([]);

    let connectionSucceeded = false;
    const errors: string[] = [];

    try {
      // ======================================================
      // 1. NATIVE CONNECTION
      // ======================================================

      try {
        const connection =
          await SecureDroidNative.checkConnection();

        if (
          connection.success &&
          connection.data?.connected === true
        ) {
          connectionSucceeded = true;
          setConnected(true);
        } else {
          setConnected(false);

          errors.push(
            connection.message ??
              'SecureDroid native bridge is unavailable.',
          );
        }
      } catch (connectionError: unknown) {
        setConnected(false);

        errors.push(
          connectionError instanceof Error
            ? connectionError.message
            : 'SecureDroid native connection check failed.',
        );
      }

      /*
       * Do not continue pretending native services work
       * when the bridge itself is unavailable.
       */
      if (!connectionSucceeded) {
        setError(
          errors.join(' ') ||
            'SecureDroid native services are unavailable.',
        );

        return;
      }

      // ======================================================
      // 2. INSTALLED APPLICATION INVENTORY
      // ======================================================

      let appsResult;

      try {
        appsResult =
          await SecureDroidNative.getInstalledApps();
      } catch (appsError: unknown) {
        errors.push(
          appsError instanceof Error
            ? appsError.message
            : 'Failed to retrieve installed applications.',
        );

        setError(errors.join(' '));

        return;
      }

      if (
        !appsResult.success ||
        !Array.isArray(appsResult.data)
      ) {
        errors.push(
          appsResult.message ??
            'Installed application inventory is unavailable.',
        );

        setError(errors.join(' '));

        return;
      }

      const normalizedApps =
        appsResult.data
          .map(normalizeApp)
          .filter(
            (app) =>
              app.packageName !== 'UNKNOWN' &&
              app.packageName.trim().length > 0,
          );

      setApps(normalizedApps);

      const appByPackage =
        new Map<string, AppInfo>(
          normalizedApps.map((app) => [
            app.packageName,
            app,
          ]),
        );

      // ======================================================
      // 3. APPLICATION RISK ANALYSIS
      // ======================================================

      try {
        const riskResult =
          await SecureDroidNative.getAppRiskReports();

        if (
          !riskResult.success ||
          !Array.isArray(riskResult.data)
        ) {
          errors.push(
            riskResult.message ??
              'Application risk analysis is unavailable.',
          );
        } else {
          const normalizedRisks =
            riskResult.data
              .map((report) =>
                normalizeRisk(
                  report,
                  appByPackage,
                ),
              )
              .filter(
                (risk) =>
                  risk.packageName.length > 0 &&
                  appByPackage.has(
                    risk.packageName,
                  ),
              );

          /*
           * IMPORTANT:
           *
           * Do not manufacture risk entries for applications
           * that the native analyzer did not report.
           *
           * Also do not convert "no findings" into "safe".
           */
          setRisks(normalizedRisks);
        }
      } catch (riskError: unknown) {
        errors.push(
          riskError instanceof Error
            ? riskError.message
            : 'Application risk analysis failed.',
        );
      }

      // ======================================================
      // 4. DEVICE HARDENING
      // ======================================================

      try {
        const hardeningResult =
          await SecureDroidNative.getHardeningReport();

        if (
          !hardeningResult.success ||
          !hardeningResult.data
        ) {
          errors.push(
            hardeningResult.message ??
              'Device hardening assessment is unavailable.',
          );
        } else {
          const nativeScore =
            hardeningResult.data.score;

          /*
           * Only accept a finite numeric score.
           * Do not invent a default such as 85.
           */
          if (
            typeof nativeScore === 'number' &&
            Number.isFinite(nativeScore)
          ) {
            setScore(
              Math.max(
                0,
                Math.min(
                  100,
                  nativeScore,
                ),
              ),
            );
          } else {
            setScore(0);

            errors.push(
              'Device hardening returned no valid security score.',
            );
          }

          const findings =
            Array.isArray(
              hardeningResult.data.findings,
            )
              ? hardeningResult.data.findings
                  .map((finding) => {
                    const item =
                      finding as Record<
                        string,
                        unknown
                      >;

                    const level =
                      asString(
                        item.level,
                        'UNKNOWN',
                      );

                    if (
                      level !== 'GOOD' &&
                      level !== 'WARNING' &&
                      level !== 'CRITICAL'
                    ) {
                      return null;
                    }

                    return {
                      id: asString(
                        item.id,
                        'UNKNOWN',
                      ),

                      level,

                      summary: asString(
                        item.summary,
                        '',
                      ),
                    } satisfies HardeningFinding;
                  })
                  .filter(
                    (
                      finding,
                    ): finding is HardeningFinding =>
                      finding !== null,
                  )
              : [];

          setHardeningFindings(
            findings,
          );
        }
      } catch (hardeningError: unknown) {
        errors.push(
          hardeningError instanceof Error
            ? hardeningError.message
            : 'Device hardening assessment failed.',
        );
      }

      // ======================================================
      // 5. FINAL STATE
      // ======================================================

      /*
       * Connection succeeded even if an individual security
       * subsystem failed.
       *
       * Therefore:
       *
       * connected = native bridge is alive
       *
       * error = one or more security data sources failed
       *
       * This prevents a partial native failure from being
       * falsely represented as total bridge failure.
       */
      setConnected(true);

      if (errors.length > 0) {
        setError(
          errors.join(' '),
        );
      } else {
        setError(null);
      }
    } catch (fatalError: unknown) {
      /*
       * Unexpected failure.
       *
       * Never substitute demo data.
       */
      setConnected(
        connectionSucceeded,
      );

      setApps([]);
      setRisks([]);
      setScore(0);
      setHardeningFindings([]);

      setError(
        fatalError instanceof Error
          ? fatalError.message
          : 'SecureDroid failed to load security data.',
      );
    } finally {
      setLoading(false);
    }
  }, [isNative]);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // ==========================================================
  // PUBLIC API
  // ==========================================================

  return {
    apps,
    risks,

    loading,

    connected,

    error,

    score,

    hardeningFindings,

    /*
     * Legacy compatibility field.
     *
     * Always false because production SecureDroid must not
     * present simulated security data.
     */
    usingMock,

    reload: loadData,
  };
};
