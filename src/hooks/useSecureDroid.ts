import { useState, useEffect, useCallback } from 'react';
import { registerPlugin } from '@capacitor/core';

interface SecureDroidPluginShape {
  checkConnection(): Promise<{
    connected?: boolean;
    message?: string;
  }>;

  getInstalledApps(): Promise<{
    success?: boolean;
    apps?: AppInfo[];
    count?: number;
    message?: string;
  }>;

  scanForRisks(): Promise<{
    success?: boolean;
    totalApps?: number;
    totalRiskyApps?: number;
    riskDetails?: RiskInfo[];
    message?: string;
  }>;
}

const SecureDroid =
  registerPlugin<SecureDroidPluginShape>('SecureDroid');

export interface AppInfo {
  packageName: string;
  appName: string;
  versionName: string;
  versionCode: number;
  targetSdk?: number;
  minSdk?: number;
  isSystemApp: boolean;
  isEnabled?: boolean;
  isLaunchable?: boolean;
  installTime: number;
  updateTime: number;
  installSource: string;
  installerKnown?: boolean;
  isSideloaded: boolean;
  isDebuggable?: boolean;
  permissions: string[];
}

export interface RiskInfo {
  appName: string;
  packageName: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL' | string;
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
  isSystemApp?: boolean;  // Added to filter system apps
}

export const useSecureDroid = () => {

  const [apps, setApps] = useState<AppInfo[]>([]);
  const [risks, setRisks] = useState<RiskInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(100);

  const loadData = useCallback(async () => {

    setLoading(true);
    setError(null);

    try {

      /*
       * ----------------------------------------------------------
       * CONNECTION
       * ----------------------------------------------------------
       */
      const connection =
        await SecureDroid.checkConnection();

      if (!connection?.connected) {

        setConnected(false);
        setError(
          connection?.message ||
          'SecureDroid native bridge is unavailable.',
        );

        setApps([]);
        setRisks([]);
        setScore(0);

        return;
      }

      setConnected(true);

      /*
       * ----------------------------------------------------------
       * INSTALLED APPLICATIONS
       * ----------------------------------------------------------
       */
      const appsResult =
        await SecureDroid.getInstalledApps();

      if (
        !appsResult ||
        !Array.isArray(appsResult.apps)
      ) {

        throw new Error(
          appsResult?.message ||
          'Installed application evidence is unavailable.',
        );
      }

      const appList =
        appsResult.apps;

      setApps(appList);

      /*
       * ----------------------------------------------------------
       * RISK SCAN
       * ----------------------------------------------------------
       */
      const riskResult =
        await SecureDroid.scanForRisks();

      const allRiskDetails =
        Array.isArray(riskResult?.riskDetails)
          ? riskResult.riskDetails
          : [];

      /*
       * ----------------------------------------------------------
       * FILTER OUT SYSTEM APPS FROM RISK COUNT
       * ----------------------------------------------------------
       *
       * System apps (Bluetooth, Phone Services, Google Play Services,
       * System UI, etc.) legitimately require many permissions to function.
       * They should NOT be counted as "risky apps" on the Home dashboard
       * or in the Threat Model Center.
       *
       * We filter by checking if the app is a system app using either:
       * 1. The isSystemApp flag if present in the risk data
       * 2. Cross-referencing with the apps list
       */
      const userAppPackageNames = new Set(
        appList
          .filter(app => !app.isSystemApp)
          .map(app => app.packageName)
      );

      const userAppRisks =
        allRiskDetails.filter((risk) => {
          // If the risk data has an isSystemApp flag, use it
          if (risk.isSystemApp === true) {
            return false;
          }
          // Otherwise cross-reference with the apps list
          return userAppPackageNames.has(risk.packageName);
        });

      /*
       * Only MEDIUM/HIGH/CRITICAL findings count as
       * "risky apps" on the Home dashboard.
       *
       * LOW findings remain useful in the detailed auditor,
       * but should not inflate the headline risk count.
       */
      const meaningfulRisks =
        userAppRisks.filter((risk) =>
          risk.riskLevel === 'MEDIUM' ||
          risk.riskLevel === 'HIGH' ||
          risk.riskLevel === 'CRITICAL'
        );

      setRisks(meaningfulRisks);

      /*
       * ----------------------------------------------------------
       * MEASURABLE DASHBOARD SCORE
       * ----------------------------------------------------------
       *
       * This score is derived from actual findings.
       *
       * HIGH/CRITICAL = 8 points
       * MEDIUM         = 3 points
       * LOW            = 1 point
       *
       * The result is bounded to 0..100.
       *
       * Most importantly, it uses the freshly received
       * riskDetails rather than stale React state.
       */
      const highRiskCount =
        meaningfulRisks.filter(
          (risk) =>
            risk.riskLevel === 'HIGH' ||
            risk.riskLevel === 'CRITICAL',
        ).length;

      const mediumRiskCount =
        meaningfulRisks.filter(
          (risk) =>
            risk.riskLevel === 'MEDIUM',
        ).length;

      const lowRiskCount =
        meaningfulRisks.filter(
          (risk) =>
            risk.riskLevel === 'LOW',
        ).length;

      const penalty =
        (highRiskCount * 8) +
        (mediumRiskCount * 3) +
        (lowRiskCount * 1);

      const calculatedScore =
        Math.max(
          0,
          Math.min(
            100,
            100 - penalty,
          ),
        );

      setScore(calculatedScore);

    } catch (err: unknown) {

      console.error(
        'SecureDroid data load failed:',
        err,
      );

      setApps([]);
      setRisks([]);
      setScore(0);

      setConnected(false);

      setError(
        err instanceof Error
          ? err.message
          : 'SecureDroid security data could not be loaded.',
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
    loading,
    connected,
    error,
    score,
    reload: loadData,
  };
};
