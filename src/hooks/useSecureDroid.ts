import { useState, useEffect, useCallback } from 'react';
import { SecureDroidNative } from '../services/native/SecureDroidNative';
import type { NativeInstalledApp, NativeAppRiskReport } from '../types/native';

// Re-export types for convenience
export type AppInfo = NativeInstalledApp;

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

export const useSecureDroid = () => {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [risks, setRisks] = useState<RiskInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(100);
  const [hardeningFindings, setHardeningFindings] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Check connection
      const connResult = await SecureDroidNative.checkConnection();
      if (!connResult.success || !connResult.data?.connected) {
        setConnected(false);
        setError(connResult.message || 'Native bridge unavailable.');
        setApps([]);
        setRisks([]);
        setScore(0);
        return;
      }
      setConnected(true);

      // 2. Get installed apps
      const appsResult = await SecureDroidNative.getInstalledApps();
      if (!appsResult.success || !appsResult.data) {
        throw new Error(appsResult.message || 'Failed to get installed apps.');
      }
      const appList = appsResult.data;
      setApps(appList);

      // 3. Get risk reports
      const riskResult = await SecureDroidNative.getAppRiskReports();
      const allRiskDetails = riskResult.success && riskResult.data
        ? riskResult.data.map((report: NativeAppRiskReport) => ({
            appName: report.label,
            packageName: report.packageName,
            riskLevel: report.overallRisk,
            findings: report.findings,
            isSystemApp: false,
          }))
        : [];

      // Filter out system apps
      const userAppPackageNames = new Set(
        appList.filter(app => !app.isSystemApp).map(app => app.packageName)
      );
      const userAppRisks = allRiskDetails.filter(risk =>
        userAppPackageNames.has(risk.packageName)
      );

      // Keep only MEDIUM/HIGH/CRITICAL
      const meaningfulRisks = userAppRisks.filter(risk =>
        ['MEDIUM', 'HIGH', 'CRITICAL'].includes(risk.riskLevel.toUpperCase())
      );
      setRisks(meaningfulRisks);

      // 4. Get device hardening report
      const hardeningResult = await SecureDroidNative.getHardeningReport();
      let deviceScore = 0;
      if (hardeningResult.success && hardeningResult.data) {
        deviceScore = hardeningResult.data.score;
        setHardeningFindings(hardeningResult.data.findings || []);
      } else {
        deviceScore = -1; // unknown
        setHardeningFindings([]);
      }

      // Use hardening score as the primary security score
      if (deviceScore >= 0) {
        setScore(deviceScore);
      } else {
        setScore(0); // fallback to 0 with unknown state
      }

    } catch (err: unknown) {
      console.error('SecureDroid data load failed:', err);
      setApps([]);
      setRisks([]);
      setScore(0);
      setConnected(false);
      setError(err instanceof Error ? err.message : 'Failed to load security data.');
    } finally {
      setLoading(false);
    }
  }, []);

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
    reload: loadData,
  };
};
