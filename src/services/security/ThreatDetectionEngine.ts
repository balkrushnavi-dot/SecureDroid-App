import type { NativeInstalledApp, ThreatAssessmentReport, ThreatFinding } from '../../types/native';

export class ThreatDetectionEngine {
  public static evaluate(apps: NativeInstalledApp[]): ThreatAssessmentReport {
    const findings: ThreatFinding[] = [];
    let debuggableCount = 0;
    let sideloadedCount = 0;
    let excessiveCount = 0;
    let outdatedSdkCount = 0;

    for (const app of apps) {
      // 1. Debuggable check
      if (app.isDebuggable) {
        debuggableCount++;
        findings.push({
          id: `threat_dbg_${app.packageName}`,
          ruleId: 'RULE_APP_DEBUGGABLE',
          title: `Debuggable Package: ${app.label}`,
          description: `Application ${app.packageName} has android:debuggable="true" enabled. This permits memory inspection, code injection, and JDWP debugger attachment.`,
          severity: 'HIGH',
          affectedPackage: app.packageName,
          evidence: [`android:debuggable=true`, `version: ${app.versionName}`],
          recommendation: 'Uninstall or rebuild application in production release mode with debugging flags disabled.',
        });
      }

      // 2. Outdated Target SDK (< 31)
      if (app.targetSdk > 0 && app.targetSdk < 31) {
        outdatedSdkCount++;
        findings.push({
          id: `threat_sdk_${app.packageName}`,
          ruleId: 'RULE_LEGACY_TARGET_SDK',
          title: `Legacy Target SDK (${app.targetSdk}): ${app.label}`,
          description: `Targeting SDK ${app.targetSdk} bypasses modern Android 12+ runtime storage isolation, notification permission prompts, and background execution limits.`,
          severity: 'MEDIUM',
          affectedPackage: app.packageName,
          evidence: [`targetSdk: ${app.targetSdk}`, `minSdk: ${app.minSdk}`],
          recommendation: 'Update application to target Android 14+ (API 34+) to enforce scoped storage and modern security constraints.',
        });
      }

      // 3. Sideloaded / Unknown installer source
      if (!app.isSystemApp && (!app.installerPackage || app.installerPackage === 'com.google.android.packageinstaller')) {
        sideloadedCount++;
      }

      // 4. Excessive Dangerous Permissions
      const dangerousPerms = app.dangerousPermissions || [];
      if (dangerousPerms.length >= 4) {
        excessiveCount++;
        findings.push({
          id: `threat_perm_${app.packageName}`,
          ruleId: 'RULE_EXCESSIVE_PERMISSIONS',
          title: `Broad Permission Footprint: ${app.label}`,
          description: `Application holds ${dangerousPerms.length} dangerous runtime permissions, spanning sensitive storage, location, and communication identifiers.`,
          severity: dangerousPerms.length > 5 ? 'HIGH' : 'MEDIUM',
          affectedPackage: app.packageName,
          evidence: dangerousPerms,
          recommendation: 'Review and revoke non-essential runtime permissions in Android App Info settings.',
        });
      }
    }

    let overallRisk: ThreatAssessmentReport['overallRiskLevel'] = 'SAFE';
    if (findings.some((f) => f.severity === 'CRITICAL')) {
      overallRisk = 'CRITICAL_RISK';
    } else if (findings.some((f) => f.severity === 'HIGH')) {
      overallRisk = 'HIGH_RISK';
    } else if (findings.length > 2) {
      overallRisk = 'MODERATE_RISK';
    } else if (findings.length > 0) {
      overallRisk = 'LOW_RISK';
    }

    return {
      timestamp: Date.now(),
      scannedAppsCount: apps.length,
      overallRiskLevel: overallRisk,
      findings,
      integrityIndicators: {
        debuggableAppsFound: debuggableCount,
        sideloadedAppsFound: sideloadedCount,
        excessivePermissionAppsFound: excessiveCount,
        outdatedTargetSdkAppsFound: outdatedSdkCount,
      },
    };
  }
}
