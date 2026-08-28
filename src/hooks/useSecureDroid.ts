import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { SecureDroidNative } from '../services/native/SecureDroidNative';
import type {
    NativeInstalledApp,
    NativeAppRiskReport,
} from '../types/native';

export type AppInfo = NativeInstalledApp;

export interface RiskFinding {
    code?: string;
    title?: string;
    description?: string;
    severity?: string;
    points?: number;
}

export interface RiskInfo {
    appName: string;
    packageName: string;
    riskLevel: string;
    securityScore?: number;
    findingCount?: number;
    findings?: RiskFinding[];
    reason?: string;
    installSource?: string;
    isSystemApp?: boolean;
}

export type SecurityDataState =
    | 'LOADING'
    | 'AVAILABLE'
    | 'UNAVAILABLE'
    | 'ERROR';

export interface HardeningFinding {
    id?: string;
    code?: string;
    level?: string;
    severity?: string;
    summary?: string;
    title?: string;
    description?: string;
    points?: number;
}

export interface SecurityDataStatus {
    state: SecurityDataState;
    isReal: boolean;
    message: string;
}

/**
 * SecureDroid data hook.
 *
 * Production rules:
 * - Never fabricate installed apps.
 * - Never fabricate risk reports.
 * - Never fabricate security scores.
 * - Native bridge failure is exposed as an error/unavailable state.
 * - Empty native results remain empty.
 */
export const useSecureDroid = () => {
    const [apps, setApps] = useState<AppInfo[]>([]);
    const [risks, setRisks] = useState<RiskInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [score, setScore] = useState<number | null>(null);
    const [hardeningFindings, setHardeningFindings] = useState<
        HardeningFinding[]
    >([]);

    const [dataStatus, setDataStatus] = useState<SecurityDataStatus>({
        state: 'LOADING',
        isReal: false,
        message: 'Loading native security data...',
    });

    const isNative = Capacitor.isNativePlatform();

    const resetToUnavailable = useCallback((message: string) => {
        setConnected(false);
        setApps([]);
        setRisks([]);
        setScore(null);
        setHardeningFindings([]);
        setError(message);

        setDataStatus({
            state: 'UNAVAILABLE',
            isReal: false,
            message,
        });
    }, []);

    const resetToError = useCallback((message: string) => {
        setConnected(false);
        setApps([]);
        setRisks([]);
        setScore(null);
        setHardeningFindings([]);
        setError(message);

        setDataStatus({
            state: 'ERROR',
            isReal: false,
            message,
        });
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        setDataStatus({
            state: 'LOADING',
            isReal: false,
            message: 'Loading native security data...',
        });

        /*
         * Browser/PWA builds do not have access to Android security APIs.
         * Do NOT substitute mock security information.
         */
        if (!isNative) {
            resetToUnavailable(
                'Native Android security services are unavailable in this environment.'
            );
            setLoading(false);
            return;
        }

        try {
            // ========================================================
            // 1. VERIFY NATIVE CONNECTION
            // ========================================================

            const connection = await SecureDroidNative.checkConnection();

            if (!connection.success || !connection.data?.connected) {
                resetToUnavailable(
                    connection.message ||
                        'SecureDroid native security service is unavailable.'
                );
                return;
            }

            setConnected(true);

            // ========================================================
            // 2. INSTALLED APPLICATIONS
            // ========================================================

            const appsResult = await SecureDroidNative.getInstalledApps();

            if (!appsResult.success) {
                resetToError(
                    appsResult.message ||
                        'Unable to retrieve installed applications.'
                );
                return;
            }

            const realApps = Array.isArray(appsResult.data)
                ? appsResult.data
                : [];

            setApps(realApps);

            // ========================================================
            // 3. APPLICATION RISK ANALYSIS
            // ========================================================

            const riskResult =
                await SecureDroidNative.getAppRiskReports();

            if (!riskResult.success) {
                resetToError(
                    riskResult.message ||
                        'Unable to retrieve application risk analysis.'
                );
                return;
            }

            const realReports = Array.isArray(riskResult.data)
                ? riskResult.data
                : [];

            /*
             * Build a lookup from the actual installed-app inventory.
             * This prevents a native risk report for an unknown package
             * from being displayed as a currently installed application.
             */
            const installedAppsByPackage = new Map(
                realApps.map((app) => [
                    app.packageName,
                    app,
                ])
            );

            const normalizedRisks: RiskInfo[] = realReports
                .filter((report: NativeAppRiskReport) =>
                    installedAppsByPackage.has(report.packageName)
                )
                .map((report: NativeAppRiskReport) => {
                    const installedApp =
                        installedAppsByPackage.get(report.packageName);

                    return {
                        appName:
                            report.label ||
                            installedApp?.label ||
                            report.packageName,

                        packageName: report.packageName,

                        riskLevel:
                            report.overallRisk || 'UNKNOWN',

                        findings: Array.isArray(report.findings)
                            ? report.findings
                            : [],

                        findingCount: Array.isArray(report.findings)
                            ? report.findings.length
                            : 0,

                        securityScore:
                            typeof report.securityScore === 'number'
                                ? report.securityScore
                                : undefined,

                        isSystemApp:
                            installedApp?.isSystemApp === true,
                    };
                });

            /*
             * Keep only actionable risk levels for the dashboard.
             * LOW/SAFE applications remain part of the installed-app
             * inventory but are not counted as active security risks.
             */
            const actionableRisks = normalizedRisks.filter((risk) =>
                ['MEDIUM', 'HIGH', 'CRITICAL'].includes(
                    risk.riskLevel.toUpperCase()
                )
            );

            setRisks(actionableRisks);

            // ========================================================
            // 4. DEVICE HARDENING
            // ========================================================

            const hardeningResult =
                await SecureDroidNative.getHardeningReport();

            if (!hardeningResult.success) {
                resetToError(
                    hardeningResult.message ||
                        'Unable to retrieve device hardening information.'
                );
                return;
            }

            const hardening = hardeningResult.data;

            if (!hardening) {
                resetToError(
                    'Native service returned no hardening report.'
                );
                return;
            }

            const nativeScore = hardening.score;

            /*
             * A score of 0 is valid.
             * Therefore do not use `score || 0`, because that can
             * silently turn missing/invalid values into a real-looking 0.
             */
            if (
                typeof nativeScore !== 'number' ||
                !Number.isFinite(nativeScore)
            ) {
                setScore(null);
            } else {
                setScore(
                    Math.min(
                        100,
                        Math.max(0, Math.round(nativeScore))
                    )
                );
            }

            const nativeFindings = Array.isArray(
                hardening.findings
            )
                ? hardening.findings
                : [];

            setHardeningFindings(nativeFindings);

            // ========================================================
            // 5. DATA IS NOW VERIFIED AS NATIVE-SOURCED
            // ========================================================

            setError(null);

            setDataStatus({
                state: 'AVAILABLE',
                isReal: true,
                message:
                    'Security data loaded from the SecureDroid native Android layer.',
            });
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Unexpected native security service failure.';

            resetToError(message);
        } finally {
            setLoading(false);
        }
    }, [
        isNative,
        resetToUnavailable,
        resetToError,
    ]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    return {
        // Actual native application inventory.
        apps,

        // Actual native risk reports.
        risks,

        // Native connection state.
        connected,

        // Loading state.
        loading,

        // Native error.
        error,

        // Null means no verified score is available.
        score,

        // Native hardening findings.
        hardeningFindings,

        // Explicit truth state for UI.
        dataStatus,

        // Native environment flag.
        isNative,

        // Reload native security data.
        reload: loadData,
    };
};
