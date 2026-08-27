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
  isSystemApp?: boolean;
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

      // Connection
      const connection = await SecureDroid.checkConnection();

      if (!connection?.connected) {
        setConnected(false);
        setError(connection?.message || 'SecureDroid native bridge is unavailable.');
        setApps([]);
        setRisks([]);
        setScore(0);
        return;
      }

      setConnected(true);

      // Get installed apps
      const appsResult = await SecureDroid.getInstalledApps();

      if (!appsResult || !Array.isArray(appsResult.apps)) {
        throw new Error(appsResult?.message || 'Installed application evidence is unavailable.');
      }

      const appList = appsResult.apps;
      setApps(appList);

      // Get risk scan
      const riskResult = await SecureDroid.scanForRisks();

      const allRiskDetails = Array.isArray(riskResult?.riskDetails)
        ? riskResult.riskDetails
        : [];

      // DEBUG: Log what we got from native
      console.log('🔍 [useSecureDroid] Total risk details from native:', allRiskDetails.length);
      console.log('🔍 [useSecureDroid] Total apps:', appList.length);
      console.log('🔍 [useSecureDroid] System apps:', appList.filter(a => a.isSystemApp).length);
      console.log('🔍 [useSecureDroid] User apps:', appList.filter(a => !a.isSystemApp).length);

      // Filter out system apps
      const userAppPackageNames = new Set(
        appList
          .filter(app => !app.isSystemApp)
          .map(app => app.packageName)
      );

      console.log('🔍 [useSecureDroid] User app package names:', userAppPackageNames.size);

      const userAppRisks = allRiskDetails.filter((risk) => {
        if (risk.isSystemApp === true) {
          return false;
        }
        return userAppPackageNames.has(risk.packageName);
      });

      console.log('🔍 [useSecureDroid] User app risks after filtering:', userAppRisks.length);

      // Log which risks were filtered out
      const filteredOut = allRiskDetails.filter((risk) => {
        if (risk.isSystemApp === true) return true;
        return !userAppPackageNames.has(risk.packageName);
      });
      
      console.log('🔍 [useSecureDroid] Filtered out risks (system apps):', filteredOut.length);
      if (filteredOut.length > 0) {
        console.log('🔍 [useSecureDroid] Sample filtered out:', filteredOut.slice(0, 5).map(r => r.appName));
      }

      // Only MEDIUM/HIGH/CRITICAL count as "risky apps"
      const meaningfulRisks = userAppRisks.filter((risk) =>
        risk.riskLevel === 'MEDIUM' ||
        risk.riskLevel === 'HIGH' ||
        risk.riskLevel === 'CRITICAL'
      );

      console.log('🔍 [useSecureDroid] Meaningful risks (MEDIUM+):', meaningfulRisks.length);

      setRisks(meaningfulRisks);

      // Calculate score
      const highRiskCount = meaningfulRisks.filter(
        (risk) => risk.riskLevel === 'HIGH' || risk.riskLevel === 'CRITICAL'
      ).length;

      const mediumRiskCount = meaningfulRisks.filter(
        (risk) => risk.riskLevel === 'MEDIUM'
      ).length;

      const penalty = (highRiskCount * 8) + (mediumRiskCount * 3);
      const calculatedScore = Math.max(0, Math.min(100, 100 - penalty));

      console.log('🔍 [useSecureDroid] High risk:', highRiskCount, 'Medium risk:', mediumRiskCount, 'Score:', calculatedScore);

      setScore(calculatedScore);

    } catch (err: unknown) {

      console.error('SecureDroid data load failed:', err);

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
