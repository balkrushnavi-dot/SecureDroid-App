import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { SecureDroidNative } from '../services/native/SecureDroidNative';
import type {
    NativeInstalledApp,
    NativeAppRiskReport,
} from '../types/native';

// ============================================================
// TYPES
// ============================================================

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
    findings: RiskFinding[];
    reason?: string;
    installSource?: string;
    isSystemApp?: boolean;
}

export type SecurityDataState =
    | 'LOADING'
    | 'AVAILABLE'
    | 'UNAVAILABLE'
    | 'UNKNOWN'
    | 'ERROR';

export interface HardeningFinding {
    id?: string;
    code?: string;
    level?: string;
    severity?: string;
    title?: string;
    summary?: string;
    description?: string;
    points?: number;
}

export interface HardeningState {
    state: SecurityDataState;
    score: number | null;
    findings: HardeningFinding[];
    message?: string;
}

export interface SecureDroidDataState {
    apps: SecurityDataState;
    risks: SecurityDataState;
    hardening: SecurityDataState;
}

// ============================================================
// EMPTY / SAFE INITIAL STATE
// ============================================================

const EMPTY_HARDENING: HardeningState = {
    state: 'UNKNOWN',
    score: null,
    findings: [],
    message: 'Hardening data has not been measured yet.',
};

// ============================================================
// HELPERS
// ============================================================

function normalizeRiskLevel(value: unknown): string {
    if (typeof value !== 'string' || !value.trim()) {
        return 'UNKNOWN';
    }

    return value.trim().toUpperCase();
}

function normalizeFinding(finding: any): RiskFinding {
    return {
        code: typeof finding?.code === 'string'
            ? finding.code
            : undefined,

        title: typeof finding?.title === 'string'
            ? finding.title
            : undefined,

        description: typeof finding?.description === 'string'
            ? finding.description
            : undefined,

        severity: typeof finding?.severity === 'string'
            ? finding.severity.toUpperCase()
            : undefined,

        points: typeof finding?.points === 'number'
            ? finding.points
            : undefined,
    };
}

function normalizeRiskReport(
    report: NativeAppRiskReport,
    app?: NativeInstalledApp,
): RiskInfo {
    const rawFindings = Array.isArray(report?.findings)
        ? report.findings
        : [];

    return {
        appName:
            typeof report?.label === 'string' && report.label.trim()
                ? report.label
                : app?.label || report?.packageName || 'Unknown application',

        packageName:
            report?.packageName || app?.packageName || 'unknown',

        riskLevel: normalizeRiskLevel(report?.overallRisk),

        securityScore:
            typeof (report as any)?.securityScore === 'number'
                ? (report as any).securityScore
                : undefined,

        findingCount: rawFindings.length,

        findings: rawFindings.map(normalizeFinding),

        reason:
            typeof (report as any)?.reason === 'string'
                ? (report as any).reason
                : undefined,

        installSource: app?.installerPackage,

        isSystemApp:
            typeof app?.isSystemApp === 'boolean'
                ? app.isSystemApp
                : undefined,
    };
}

function clampScore(value: unknown): number | null {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return null;
    }

    return Math.min(Math.max(value, 0), 100);
}

// ============================================================
// HOOK
// ============================================================

export const useSecureDroid = () => {
    const isNative = Capacitor.isNativePlatform();

    // --------------------------------------------------------
    // REAL DATA ONLY
    // --------------------------------------------------------

    const [apps, setApps] = useState<AppInfo[]>([]);
    const [risks, setRisks] = useState<RiskInfo[]>([]);

    const [hardening, setHardening] =
        useState<HardeningState>(EMPTY_HARDENING);

    // --------------------------------------------------------
    // CONNECTION STATE
    // --------------------------------------------------------

    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * IMPORTANT:
     *
     * This does NOT mean "demo data".
     *
     * It tells the UI whether the current values came from
     * an actual native Android security provider.
     */
    const [usingMock] = useState(false);

    // --------------------------------------------------------
    // PER-DATA SOURCE STATE
    // --------------------------------------------------------

    const [dataState, setDataState] =
        useState<SecureDroidDataState>({
            apps: 'LOADING',
            risks: 'LOADING',
            hardening: 'LOADING',
        });

    // --------------------------------------------------------
    // LOAD REAL NATIVE DATA
    // --------------------------------------------------------

    const loadData = useCallback(async () => {
        // Reset transient state.
        setLoading(true);
        setError(null);

        // Never pretend that a browser has native Android data.
        if (!isNative) {
            setConnected(false);

            setApps([]);
            setRisks([]);
            setHardening({
                ...EMPTY_HARDENING,
                state: 'UNAVAILABLE',
                message:
                    'SecureDroid native security services are unavailable outside the Android application.',
            });

            setDataState({
                apps: 'UNAVAILABLE',
                risks: 'UNAVAILABLE',
                hardening: 'UNAVAILABLE',
            });

            setError(
                'Native Android security services are unavailable on this platform.',
            );

            setLoading(false);
            return;
        }

        // Clear previous results before a new measurement.
        setApps([]);
        setRisks([]);
        setHardening(EMPTY_HARDENING);

        setDataState({
            apps: 'LOADING',
            risks: 'LOADING',
            hardening: 'LOADING',
        });

        try {
            // =================================================
            // 1. CONNECTION
            // =================================================

            const connectionResult =
                await SecureDroidNative.checkConnection();

            if (
                !connectionResult.success ||
                connectionResult.data?.connected !== true
            ) {
                setConnected(false);

                setDataState({
                    apps: 'UNAVAILABLE',
                    risks: 'UNAVAILABLE',
                    hardening: 'UNAVAILABLE',
                });

                setError(
                    connectionResult.message ||
                        'SecureDroid native bridge is unavailable.',
                );

                setLoading(false);
                return;
            }

            setConnected(true);

            // =================================================
            // 2. INSTALLED APPLICATIONS
            // =================================================

            const appsResult =
                await SecureDroidNative.getInstalledApps();

            let installedApps: NativeInstalledApp[] = [];

            if (appsResult.success && Array.isArray(appsResult.data)) {
                installedApps = appsResult.data;

                setApps(installedApps);
                setDataState(previous => ({
                    ...previous,
                    apps: 'AVAILABLE',
                }));
            } else {
                setApps([]);

                setDataState(previous => ({
                    ...previous,
                    apps: 'UNAVAILABLE',
                }));
            }

            // =================================================
            // 3. APPLICATION RISK REPORTS
            // =================================================

            const riskResult =
                await SecureDroidNative.getAppRiskReports();

            if (
                riskResult.success &&
                Array.isArray(riskResult.data)
            ) {
                /**
                 * Build an authoritative package-name map from
                 * the real installed-app inventory.
                 */
                const appMap = new Map<string, NativeInstalledApp>();

                for (const app of installedApps) {
                    if (
                        app?.packageName &&
                        typeof app.packageName === 'string'
                    ) {
                        appMap.set(app.packageName, app);
                    }
                }

                /**
                 * Never invent isSystemApp.
                 *
                 * Only correlate it from the installed-app
                 * inventory returned by Android.
                 */
                const reports = riskResult.data
                    .filter(
                        report =>
                            !!report &&
                            typeof report.packageName === 'string',
                    )
                    .map(report =>
                        normalizeRiskReport(
                            report,
                            appMap.get(report.packageName),
                        ),
                    );

                /**
                 * Only expose meaningful risk findings.
                 *
                 * LOW / INFO / UNKNOWN findings are not counted
                 * as actionable risks here.
                 */
                const meaningfulRisks = reports.filter(report =>
                    ['MEDIUM', 'HIGH', 'CRITICAL'].includes(
                        report.riskLevel,
                    ),
                );

                // Explicitly replace old data, including with [].
                setRisks(meaningfulRisks);

                setDataState(previous => ({
                    ...previous,
                    risks: 'AVAILABLE',
                }));
            } else {
                // Do not preserve stale risk information.
                setRisks([]);

                setDataState(previous => ({
                    ...previous,
                    risks: 'UNAVAILABLE',
                }));
            }

            // =================================================
            // 4. DEVICE HARDENING
            // =================================================

            const hardeningResult =
                await SecureDroidNative.getHardeningReport();

            if (
                hardeningResult.success &&
                hardeningResult.data
            ) {
                const score =
                    clampScore(hardeningResult.data.score);

                const findings = Array.isArray(
                    hardeningResult.data.findings,
                )
                    ? hardeningResult.data.findings
                    : [];

                /**
                 * A missing score is NOT converted into 0.
                 *
                 * 0 is a real measurable score.
                 * null means "not measured / unavailable".
                 */
                setHardening({
                    state:
                        score !== null
                            ? 'AVAILABLE'
                            : 'UNKNOWN',

                    score,

                    findings,

                    message:
                        score !== null
                            ? undefined
                            : 'Native hardening service returned no valid score.',
                });

                setDataState(previous => ({
                    ...previous,
                    hardening:
                        score !== null
                            ? 'AVAILABLE'
                            : 'UNKNOWN',
                }));
            } else {
                setHardening({
                    ...EMPTY_HARDENING,
                    state: 'UNAVAILABLE',
                    message:
                        hardeningResult.message ||
                        'Device hardening data is unavailable.',
                });

                setDataState(previous => ({
                    ...previous,
                    hardening: 'UNAVAILABLE',
                }));
            }

            // =================================================
            // FINAL ERROR STATE
            // =================================================

            const failedSources = Object.entries({
                apps: dataState.apps,
                risks: dataState.risks,
                hardening: dataState.hardening,
            }).filter(([, state]) =>
                ['UNAVAILABLE', 'ERROR'].includes(state),
            );

            if (failedSources.length > 0) {
                setError(
                    `${failedSources.length} security data source${
                        failedSources.length === 1 ? '' : 's'
                    } unavailable.`,
                );
            }
        } catch (nativeError: any) {
            /**
             * Native failure must never fall back to fabricated
             * security information.
             */
            setConnected(false);

            setApps([]);
            setRisks([]);

            setHardening({
                ...EMPTY_HARDENING,
                state: 'ERROR',
                message:
                    nativeError?.message ||
                    'Unexpected native security service failure.',
            });

            setDataState({
                apps: 'ERROR',
                risks: 'ERROR',
                hardening: 'ERROR',
            });

            setError(
                nativeError?.message ||
                    'Failed to load native SecureDroid security data.',
            );
        } finally {
            setLoading(false);
        }
    }, [isNative]);

    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {
        void loadData();
    }, [loadData]);

    // ============================================================
    // DERIVED VALUES
    // ============================================================

    const score = hardening.score ?? 0;

    const hardeningScoreAvailable =
        hardening.state === 'AVAILABLE' &&
        hardening.score !== null;

    // ============================================================
    // PUBLIC API
    // ============================================================

    return {
        // Real native data.
        apps,
        risks,

        // Hardening.
        score,
        hardeningFindings: hardening.findings,
        hardening,

        // Connection.
        loading,
        connected,
        error,

        // Production is never allowed to silently use demo data.
        usingMock,

        // Per-source availability.
        dataState,

        // Convenience flags.
        appsAvailable: dataState.apps === 'AVAILABLE',
        risksAvailable: dataState.risks === 'AVAILABLE',
        hardeningAvailable: hardeningScoreAvailable,

        // Reload.
        reload: loadData,
    };
};
