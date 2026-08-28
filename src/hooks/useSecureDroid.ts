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

      // 3. Get risk reports (using scanForRisks or getAppRiskReports – scanForRisks includes totalRiskyApps)
      // We'll use getAppRiskReports for consistent structure.
      const riskResult = await SecureDroidNative.getAppRiskReports();
      const allRiskDetails = riskResult.success && riskResult.data
        ? riskResult.data.map((report: NativeAppRiskReport) => ({
            appName: report.label,
            packageName: report.packageName,
            riskLevel: report.overallRisk,
            findings: report.findings,
            isSystemApp: false, // not directly known; we'll cross-reference
          }))
        : [];

      // Filter out system apps using the app list
      const userAppPackageNames = new Set(
        appList.filter(app => !app.isSystemApp).map(app => app.packageName)
      );
      const userAppRisks = allRiskDetails.filter(risk =>
        userAppPackageNames.has(risk.packageName)
      );

      // Keep only MEDIUM/HIGH/CRITICAL for display
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
        // If hardening report fails, set score to -1 to indicate unknown.
        deviceScore = -1;
        setHardeningFindings([]);
      }

      // Use hardening score as the primary security score
      // If unknown, keep 0 but indicate with a flag (we can later add a separate state)
      if (deviceScore >= 0) {
        setScore(deviceScore);
      } else {
        setScore(0);
        // Optionally set a flag for UI to show "Unknown"
      }

      // Optionally, we could combine hardening score with app risks, but we keep it separate for clarity.

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
