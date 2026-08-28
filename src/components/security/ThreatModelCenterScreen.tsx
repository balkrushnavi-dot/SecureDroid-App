import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  XCircle,
} from 'lucide-react';

import {
  SecureDroidTopBar,
  SecureDroidCard,
  SecureDroidStatusChip,
  SecureDroidSectionHeader,
  SecureDroidButton,
} from '../ui/designSystem';

import {
  ThreatScenarioItem,
  ThreatProtectionStatus,
} from '../../types/securedroid';

import { THREAT_MODEL_SCENARIOS } from '../../data/threatModelReference';
import { useSecureDroid } from '../../hooks/useSecureDroid';
import type { AppInfo, RiskInfo } from '../../hooks/useSecureDroid';

interface ThreatModelCenterScreenProps {
  onBack: () => void;
  isLight?: boolean;
}

// Trusted installers (same as in native code)
const TRUSTED_INSTALLERS = new Set([
  'com.android.vending',
  'com.google.android.packageinstaller',
  'com.android.packageinstaller',
  'com.amazon.venezia',
  'com.sec.android.app.samsungapps',
  'com.xiaomi.mipicks',
  'com.xiaomi.market',
  'com.huawei.appmarket',
]);

export const ThreatModelCenterScreen: React.FC<ThreatModelCenterScreenProps> = ({
  onBack,
  isLight = false,
}) => {
  const { apps, risks, loading, connected, error, reload } = useSecureDroid();
  const [selectedThreat, setSelectedThreat] = useState<ThreatScenarioItem | null>(null);
  const [scanTimestamp, setScanTimestamp] = useState<number>(Date.now());

  // Compute metrics from apps and risks
  const userApps = apps.filter(app => !app.isSystemApp);
  const totalApps = apps.length;
  const userAppsCount = userApps.length;

  // Compute debuggable count (only user apps)
  const debuggableCount = userApps.filter(app => app.isDebuggable).length;

  // Compute sideloaded count (user apps with no installer or untrusted installer)
  const sideloadedCount = userApps.filter(app =>
    !app.installerPackage || !TRUSTED_INSTALLERS.has(app.installerPackage)
  ).length;

  // Compute broad permissions count: apps with HIGH or CRITICAL risk
  const highRiskCount = risks.filter(r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length;
  const mediumRiskCount = risks.filter(r => r.riskLevel === 'MEDIUM').length;
  const lowRiskCount = risks.filter(r => r.riskLevel === 'LOW').length;

  // Overall risk level
  let overallRisk: 'SAFE' | 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK' | 'CRITICAL_RISK' = 'SAFE';
  if (risks.some(r => r.riskLevel === 'CRITICAL')) {
    overallRisk = 'CRITICAL_RISK';
  } else if (risks.some(r => r.riskLevel === 'HIGH')) {
    overallRisk = 'HIGH_RISK';
  } else if (risks.some(r => r.riskLevel === 'MEDIUM')) {
    overallRisk = 'MODERATE_RISK';
  } else if (risks.some(r => r.riskLevel === 'LOW')) {
    overallRisk = 'LOW_RISK';
  }

  // Legacy SDK count: user apps with targetSdk < 31 (Android 12)
  const legacySdkCount = userApps.filter(app => app.targetSdk && app.targetSdk < 31).length;

  // For findings, we map risks to the expected structure
  const findings = risks.map(risk => ({
    id: `finding_${risk.packageName}`,
    title: risk.findings && risk.findings.length > 0
      ? risk.findings[0].title || `${risk.riskLevel} risk`
      : `${risk.riskLevel} risk detected`,
    description: risk.findings && risk.findings.length > 0
      ? risk.findings[0].description || ''
      : `Security risk identified in ${risk.appName}.`,
    severity: risk.riskLevel,
    affectedPackage: risk.packageName,
    recommendation: risk.findings && risk.findings.length > 0
      ? risk.findings[0].description || 'Review the application.'
      : 'Review the application and its permissions.',
  }));

  // Map to the expected report structure for the UI
  const report = {
    scannedAppsCount: totalApps,
    overallRiskLevel: overallRisk,
    findings: findings,
    integrityIndicators: {
      debuggableAppsFound: debuggableCount,
      sideloadedAppsFound: sideloadedCount,
      excessivePermissionAppsFound: highRiskCount + mediumRiskCount, // broad perms
      outdatedTargetSdkAppsFound: legacySdkCount,
    },
    timestamp: scanTimestamp,
  };

  const getStatusBadge = (status: ThreatProtectionStatus) => {
    switch (status) {
      case 'PROTECTED':
        return { variant: 'SECURE' as const, label: 'PROTECTED' };
      case 'PARTIALLY PROTECTED':
        return { variant: 'ISOLATED' as const, label: 'PARTIAL' };
      case 'REQUIRES HARDWARE':
        return { variant: 'UNAVAILABLE' as const, label: 'REQUIRES HARDWARE' };
      case 'REQUIRES SECUREDROID OS':
        return { variant: 'DEGRADED' as const, label: 'REQUIRES OS' };
      case 'NOT PROTECTED':
        return { variant: 'UNAVAILABLE' as const, label: 'NOT PROTECTED' };
      default:
        return { variant: 'UNAVAILABLE' as const, label: 'UNKNOWN' };
    }
  };

  const getRiskLabel = (level: typeof report.overallRiskLevel) => {
    switch (level) {
      case 'SAFE': return 'SAFE';
      case 'LOW_RISK': return 'LOW RISK';
      case 'MODERATE_RISK': return 'MODERATE RISK';
      case 'HIGH_RISK': return 'HIGH RISK';
      case 'CRITICAL_RISK': return 'CRITICAL RISK';
      default: return 'UNKNOWN';
    }
  };

  const riskClass =
    report?.overallRiskLevel === 'SAFE'
      ? 'bg-emerald-500/15 text-emerald-400'
      : report?.overallRiskLevel === 'CRITICAL_RISK'
        ? 'bg-rose-500/15 text-rose-300'
        : 'bg-amber-500/15 text-amber-300';

  const handleScan = useCallback(() => {
    reload();
    setScanTimestamp(Date.now());
  }, [reload]);

  return (
    <div
      className={`min-h-full p-4 pb-24 transition-colors ${
        isLight
          ? 'bg-zinc-50 text-zinc-900'
          : 'bg-zinc-950 text-zinc-100'
      }`}
    >
      <SecureDroidTopBar
        title="Threat Model Center"
        subtitle="Live Package Evidence + Threat Model Reference"
        onBack={onBack}
        isLight={isLight}
      />

      <div className="pt-4 space-y-4">
        {/* Live Evidence Card */}
        <SecureDroidCard
          isLight={isLight}
          highlight
          className="p-4 space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isLight
                    ? 'bg-zinc-100 text-zinc-800'
                    : 'bg-zinc-800 text-zinc-200'
                }`}
              >
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-medium text-sm">
                  Live Installed-App Threat Assessment
                </h3>
                <p
                  className={`text-xs mt-0.5 ${
                    isLight
                      ? 'text-zinc-500'
                      : 'text-zinc-400'
                  }`}
                >
                  Evidence comes from the Android installed-package
                  scanner and is evaluated locally by the threat engine.
                </p>
              </div>
            </div>

            <button
              onClick={handleScan}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  loading ? 'animate-spin' : ''
                }`}
              />
              <span>
                {loading ? 'Scanning...' : 'Scan Now'}
              </span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-rose-300">
                    Live scan unavailable
                  </p>
                  <p className="text-[11px] text-rose-200/70 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="pt-2 border-t border-zinc-800/20 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div
                  className={`p-3 rounded-xl ${
                    isLight
                      ? 'bg-zinc-100'
                      : 'bg-zinc-900'
                  }`}
                >
                  <span className="block text-[10px] text-zinc-500 font-mono">
                    SCANNED PACKAGES
                  </span>
                  <strong className="text-lg">
                    {report?.scannedAppsCount ?? 0}
                  </strong>
                </div>

                <div
                  className={`p-3 rounded-xl ${
                    isLight
                      ? 'bg-zinc-100'
                      : 'bg-zinc-900'
                  }`}
                >
                  <span className="block text-[10px] text-zinc-500 font-mono">
                    OVERALL RESULT
                  </span>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${riskClass}`}
                  >
                    {getRiskLabel(report?.overallRiskLevel || 'SAFE')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Metric
                  label="DEBUGGABLE"
                  value={report?.integrityIndicators?.debuggableAppsFound ?? 0}
                  isLight={isLight}
                />
                <Metric
                  label="SIDELOADED"
                  value={report?.integrityIndicators?.sideloadedAppsFound ?? 0}
                  isLight={isLight}
                />
                <Metric
                  label="BROAD PERMS"
                  value={report?.integrityIndicators?.excessivePermissionAppsFound ?? 0}
                  isLight={isLight}
                />
                <Metric
                  label="LEGACY SDK"
                  value={report?.integrityIndicators?.outdatedTargetSdkAppsFound ?? 0}
                  isLight={isLight}
                />
              </div>

              {report?.findings && report.findings.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {report.findings.map((finding) => (
                    <div
                      key={finding.id}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          {finding.title}
                        </span>
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                          {finding.severity}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        {finding.description}
                      </p>
                      {finding.affectedPackage && (
                        <p className="text-slate-500 text-[10px] font-mono">
                          Package: {finding.affectedPackage}
                        </p>
                      )}
                      <p className="text-emerald-400 text-[11px]">
                        Recommendation: {finding.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    No findings were generated by the current ruleset.
                  </span>
                </div>
              )}

              <p className="text-[10px] text-zinc-500 font-mono">
                Scan timestamp:{' '}
                {new Date(scanTimestamp).toLocaleString()}
              </p>
            </div>
          )}
        </SecureDroidCard>

        {/* Threat Model Reference */}
        <SecureDroidSectionHeader
          title="Threat Model Reference"
          isLight={isLight}
        />

        <div
          className={`p-3 rounded-xl border text-xs ${
            isLight
              ? 'bg-zinc-100 border-zinc-200 text-zinc-600'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400'
          }`}
        >
          These scenarios describe SecureDroid's intended security
          controls. Their status is architectural/reference data and
          must not be interpreted as proof that the current device
          possesses the required hardware or OS enforcement.
        </div>

        <div className="space-y-3">
          {THREAT_MODEL_SCENARIOS.map((threat) => {
            const badge = getStatusBadge(threat.status);

            return (
              <SecureDroidCard
                key={threat.id}
                isLight={isLight}
                className="p-4 cursor-pointer hover:border-zinc-700 transition-colors"
                onClick={() => setSelectedThreat(threat)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-sm">
                        {threat.title}
                      </h4>
                      <SecureDroidStatusChip
                        status={badge.variant}
                        label={badge.label}
                        isLight={isLight}
                      />
                    </div>
                    <p
                      className={`text-xs mt-1.5 leading-relaxed ${
                        isLight
                          ? 'text-zinc-600'
                          : 'text-zinc-400'
                      }`}
                    >
                      {threat.scenario}
                    </p>
                    <p
                      className={`text-xs mt-2 font-medium ${
                        isLight
                          ? 'text-zinc-800'
                          : 'text-zinc-200'
                      }`}
                    >
                      {threat.why}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0 mt-1" />
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {threat.mitigatingControls.map((control, index) => (
                    <span
                      key={`${threat.id}-control-${index}`}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        isLight
                          ? 'bg-zinc-100 text-zinc-700'
                          : 'bg-zinc-900 text-zinc-300'
                      }`}
                    >
                      {control}
                    </span>
                  ))}
                </div>
              </SecureDroidCard>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedThreat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`max-w-md w-full max-h-[90vh] overflow-y-auto rounded-2xl p-5 shadow-2xl border ${
              isLight
                ? 'bg-white border-zinc-200 text-zinc-900'
                : 'bg-zinc-900 border-zinc-800 text-zinc-100'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/20">
              <h3 className="font-semibold text-sm">
                {selectedThreat.title}
              </h3>
              <button
                onClick={() => setSelectedThreat(null)}
                className={`text-xs px-2.5 py-1 rounded-lg ${
                  isLight
                    ? 'bg-zinc-100 hover:bg-zinc-200'
                    : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <Detail
                label="Adversary Attack Scenario"
                value={selectedThreat.scenario}
                isLight={isLight}
              />
              <Detail
                label="Defense & Rationale"
                value={selectedThreat.why}
                isLight={isLight}
              />
              <Detail
                label="Technical Evidence"
                value={selectedThreat.evidence}
                isLight={isLight}
                mono
              />
              <Detail
                label="Threat Limitation"
                value={selectedThreat.limitation}
                isLight={isLight}
                mono
                warning
              />
              <Detail
                label="Enforcement Requirement"
                value={selectedThreat.requirement}
                isLight={isLight}
                mono
              />
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-800/20 flex justify-end">
              <SecureDroidButton
                variant="primary"
                onClick={() => setSelectedThreat(null)}
                isLight={isLight}
              >
                Done
              </SecureDroidButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for metrics
function Metric({
  label,
  value,
  isLight,
}: {
  label: string;
  value: number;
  isLight: boolean;
}) {
  return (
    <div
      className={`p-2.5 rounded-xl ${
        isLight ? 'bg-zinc-100' : 'bg-zinc-900'
      }`}
    >
      <span className="block text-[9px] text-zinc-500 font-mono">
        {label}
      </span>
      <span className="text-sm font-bold">
        {value}
      </span>
    </div>
  );
}

function Detail({
  label,
  value,
  isLight,
  mono = false,
  warning = false,
}: {
  label: string;
  value: string;
  isLight: boolean;
  mono?: boolean;
  warning?: boolean;
}) {
  return (
    <div>
      <span className="font-semibold text-zinc-400 block mb-0.5">
        {label}
      </span>
      <p
        className={`p-2 rounded-lg ${
          mono ? 'font-mono text-[11px]' : ''
        } ${
          warning
            ? 'bg-zinc-950 text-amber-400'
            : isLight
              ? 'bg-zinc-100 text-zinc-800'
              : 'bg-zinc-950 text-zinc-300'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default ThreatModelCenterScreen;
