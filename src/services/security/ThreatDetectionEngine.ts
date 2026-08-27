import type {
  NativeInstalledApp,
  ThreatAssessmentReport,
  ThreatFinding,
} from '../../types/native';

/**
 * Local package-evidence threat engine.
 *
 * This engine evaluates observable Android PackageManager metadata.
 *
 * It does NOT claim:
 * - malware detection
 * - behavioral analysis
 * - network interception
 * - kernel protection
 * - Verified Boot verification
 * - SELinux verification
 * - system-level firewall enforcement
 *
 * Ordinary CAMERA / LOCATION / MICROPHONE / CONTACTS permissions are deliberately
 * excluded from the risk rules because those permissions are common and
 * are not vulnerabilities by themselves.
 *
 * IMPORTANT: System apps (Bluetooth, Phone Services, Google Play Services,
 * System UI, etc.) legitimately require many permissions to function.
 * They are excluded from high-impact permission findings and from
 * the "BROAD PERMS" metric.
 */
export class ThreatDetectionEngine {

  /**
   * Permissions with materially broader security implications.
   */
  private static readonly HIGH_IMPACT_PERMISSIONS = new Set<string>([
    'android.permission.READ_SMS',
    'android.permission.RECEIVE_SMS',
    'android.permission.SEND_SMS',
    'android.permission.READ_CALL_LOG',
    'android.permission.WRITE_CALL_LOG',
    'android.permission.SYSTEM_ALERT_WINDOW',
    'android.permission.REQUEST_INSTALL_PACKAGES',
    'android.permission.WRITE_SECURE_SETTINGS',
    'android.permission.BIND_ACCESSIBILITY_SERVICE',
    'android.permission.BIND_DEVICE_ADMIN',
  ]);

  private static readonly TRUSTED_INSTALLERS = new Set<string>([
    'com.android.vending',                    // Google Play
    'com.google.android.packageinstaller',    // Android Package Installer
    'com.android.packageinstaller',           // Legacy Package Installer
    'com.amazon.venezia',                     // Amazon Appstore
    'com.sec.android.app.samsungapps',        // Galaxy Store
    'com.xiaomi.mipicks',                     // Xiaomi GetApps
    'com.xiaomi.market',                      // Xiaomi Market
    'com.huawei.appmarket',                   // Huawei AppGallery
    'com.xiaomi.discover',                    // Xiaomi System Apps Updater
  ]);

  private static readonly LEGACY_TARGET_SDK = 31;

  public static evaluate(
    apps: NativeInstalledApp[],
  ): ThreatAssessmentReport {

    const findings: ThreatFinding[] = [];

    let debuggableCount = 0;
    let sideloadedCount = 0;
    let excessivePermissionApps = 0;
    let outdatedSdkCount = 0;

    // Separate user apps for accurate metrics
    const userApps = apps.filter(app => !app.isSystemApp);

    for (const app of apps) {

      /*
       * ----------------------------------------------------------
       * DEBUGGABLE
       * ----------------------------------------------------------
       *
       * Note: Debuggable check applies to ALL apps, including system apps,
       * because a debuggable system app is also a security concern.
       * However, we only count it in the metric for user apps.
       */
      if (app.isDebuggable) {

        // Only count debuggable user apps in the metric
        if (!app.isSystemApp) {
          debuggableCount++;
        }

        findings.push({
          id: `threat_debuggable_${app.packageName}`,
          ruleId: 'RULE_APP_DEBUGGABLE',
          title: `Debuggable Package: ${app.label}`,
          description:
            `Package ${app.packageName} is marked android:debuggable=true. ` +
            `This is a production security concern because additional ` +
            `debugging capabilities are enabled.`,
          severity: 'HIGH',
          affectedPackage: app.packageName,
          evidence: [
            'android:debuggable=true',
            `version: ${app.versionName}`,
          ],
          recommendation:
            'Verify that this package is intentionally debuggable. ' +
            'Production builds should normally disable debugging.',
        });
      }

      /*
       * ----------------------------------------------------------
       * INSTALLATION SOURCE
       * ----------------------------------------------------------
       *
       * System apps are pre-installed and not evaluated for
       * sideload/store-source risk.
       */
      if (!app.isSystemApp) {

        const installer = app.installerPackage;

        /*
         * Null installer is UNKNOWN.
         *
         * Do not silently turn UNKNOWN into "malicious sideload".
         */
        if (installer === undefined || installer === null || installer === '') {

          // Count as sideloaded only if not from a known store
          sideloadedCount++;

          findings.push({
            id: `threat_unknown_installer_${app.packageName}`,
            ruleId: 'RULE_UNKNOWN_INSTALLER',
            title: `Unknown Installation Source: ${app.label}`,
            description:
              'Android did not expose a recorded installer for this package. ' +
              'This is an unknown-source signal and is not proof of malicious software.',
            severity: 'LOW',
            affectedPackage: app.packageName,
            evidence: [
              'installerPackage: UNKNOWN',
            ],
            recommendation:
              'Review the application installation source in Android App Info.',
          });

        } else if (
          !this.TRUSTED_INSTALLERS.has(installer)
        ) {

          sideloadedCount++;

          findings.push({
            id: `threat_sideload_${app.packageName}`,
            ruleId: 'RULE_UNRECOGNIZED_INSTALLER',
            title: `Unrecognized Installer: ${app.label}`,
            description:
              `The package reports installer "${installer}", which is not ` +
              `one of SecureDroid's recognized application stores.`,
            severity: 'MEDIUM',
            affectedPackage: app.packageName,
            evidence: [
              `installerPackage: ${installer}`,
            ],
            recommendation:
              'Verify that the application was intentionally installed from this source.',
          });
        }
      }

      /*
       * ----------------------------------------------------------
       * HIGH-IMPACT PERMISSIONS
       * ----------------------------------------------------------
       *
       * IMPORTANT: System apps (Bluetooth, Phone Services, Google Play Services,
       * System UI, etc.) legitimately require many permissions to function.
       * They are EXCLUDED from this finding entirely.
       */
      if (!app.isSystemApp) {

        const declaredPermissions =
          Array.isArray(app.requestedPermissions)
            ? app.requestedPermissions
            : [];

        const highImpactPermissions =
          declaredPermissions
            .filter((permission) =>
              this.HIGH_IMPACT_PERMISSIONS.has(permission)
            )
            .filter(
              (permission, index, array) =>
                array.indexOf(permission) === index,
            );

        /*
         * Three or more high-impact permissions constitutes a broad
         * permission footprint.
         *
         * Normal CAMERA / LOCATION / AUDIO / CONTACTS permissions are
         * deliberately not included.
         */
        if (highImpactPermissions.length >= 3) {

          excessivePermissionApps++;

          const severity =
            highImpactPermissions.length >= 5
              ? 'HIGH'
              : 'MEDIUM';

          findings.push({
            id: `threat_high_impact_permissions_${app.packageName}`,
            ruleId: 'RULE_HIGH_IMPACT_PERMISSIONS',
            title: `High-Impact Permission Footprint: ${app.label}`,
            description:
              `The application declares ${highImpactPermissions.length} ` +
              `high-impact permissions. Permission declaration alone does ` +
              `not prove that the permissions are granted or abused.`,
            severity,
            affectedPackage: app.packageName,
            evidence: highImpactPermissions,
            recommendation:
              'Review whether each high-impact permission is necessary for the application.',
          });
        }
      }

      /*
       * ----------------------------------------------------------
       * LEGACY TARGET SDK
       * ----------------------------------------------------------
       *
       * Do not flag OEM/system packages using this application-level
       * rule.
       */
      if (
        !app.isSystemApp &&
        app.targetSdk > 0 &&
        app.targetSdk < this.LEGACY_TARGET_SDK
      ) {

        outdatedSdkCount++;

        findings.push({
          id: `threat_legacy_sdk_${app.packageName}`,
          ruleId: 'RULE_LEGACY_TARGET_SDK',
          title: `Legacy Target SDK (${app.targetSdk}): ${app.label}`,
          description:
            `This application targets Android API ${app.targetSdk}. ` +
            `Older target SDK levels may miss newer platform security ` +
            `behavior and restrictions.`,
          severity: 'MEDIUM',
          affectedPackage: app.packageName,
          evidence: [
            `targetSdk: ${app.targetSdk}`,
          ],
          recommendation:
            'Prefer an updated application version targeting a current Android API level.',
        });
      }
    }

    /*
     * ----------------------------------------------------------
     * OVERALL RESULT
     * ----------------------------------------------------------
     */
    let overallRisk: ThreatAssessmentReport['overallRiskLevel'] =
      'SAFE';

    if (
      findings.some(
        (finding) => finding.severity === 'CRITICAL',
      )
    ) {
      overallRisk = 'CRITICAL_RISK';

    } else if (
      findings.some(
        (finding) => finding.severity === 'HIGH',
      )
    ) {
      overallRisk = 'HIGH_RISK';

    } else if (
      findings.some(
        (finding) => finding.severity === 'MEDIUM',
      )
    ) {
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
        excessivePermissionAppsFound: excessivePermissionApps,
        outdatedTargetSdkAppsFound: outdatedSdkCount,
      },
    };
  }
}
