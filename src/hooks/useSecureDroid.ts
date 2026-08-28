import { useState, useEffect, useCallback } from 'react';
import { SecureDroidNative } from '../services/native/SecureDroidNative';
import type { NativeInstalledApp, NativeAppRiskReport } from '../types/native';

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
    const [score, setScore] = useState(0);
    const [hardeningFindings, setHardeningFindings] = useState<any[]>([]);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Check connection
            let connResult;
            try {
                connResult = await SecureDroidNative.checkConnection();
            } catch (e: any) {
                setConnected(false);
                setError('Native bridge not available: ' + e.message);
                setLoading(false);
                return;
            }

            if (!connResult.success || !connResult.data?.connected) {
                setConnected(false);
                setError(connResult.message || 'Native bridge unavailable.');
                setLoading(false);
                return;
            }
            setConnected(true);

            // 2. Get installed apps
            let appsResult;
            try {
                appsResult = await SecureDroidNative.getInstalledApps();
            } catch (e: any) {
                setError('Failed to get apps: ' + e.message);
                setLoading(false);
                return;
            }
            if (!appsResult.success || !appsResult.data) {
                setError(appsResult.message || 'Failed to get installed apps.');
                setLoading(false);
                return;
            }
            const appList = appsResult.data;
            setApps(appList);

            // 3. Get risk reports
            let riskResult;
            try {
                riskResult = await SecureDroidNative.getAppRiskReports();
            } catch (e: any) {
                // Non-fatal, we can proceed without risks
                setRisks([]);
            }
            const allRiskDetails = riskResult?.success && riskResult.data
                ? riskResult.data.map((report: NativeAppRiskReport) => ({
                    appName: report.label,
                    packageName: report.packageName,
                    riskLevel: report.overallRisk,
                    findings: report.findings,
                    isSystemApp: false,
                }))
                : [];

            // Filter system apps
            const userAppPackageNames = new Set(
                appList.filter(app => !app.isSystemApp).map(app => app.packageName)
            );
            const userAppRisks = allRiskDetails.filter(risk =>
                userAppPackageNames.has(risk.packageName)
            );
            const meaningfulRisks = userAppRisks.filter(risk =>
                ['MEDIUM', 'HIGH', 'CRITICAL'].includes(risk.riskLevel.toUpperCase())
            );
            setRisks(meaningfulRisks);

            // 4. Get device hardening report
            let hardeningResult;
            try {
                hardeningResult = await SecureDroidNative.getHardeningReport();
            } catch (e: any) {
                // Non-fatal – we set score to 0 and continue
                setScore(0);
                setHardeningFindings([]);
                setLoading(false);
                return;
            }

            if (hardeningResult.success && hardeningResult.data) {
                setScore(hardeningResult.data.score || 0);
                setHardeningFindings(hardeningResult.data.findings || []);
            } else {
                setScore(0);
                setHardeningFindings([]);
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
