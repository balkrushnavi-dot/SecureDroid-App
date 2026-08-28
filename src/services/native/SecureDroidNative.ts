import { Capacitor } from '@capacitor/core';

import type {
  NativeResult,
  NativeInstalledApp,
  NativeAppRiskReport,
  NativeSecurityEvent,
  NativeVpnStatus,
} from '../../types/native';

import {
  SecureDroidNativePlugin,
} from './SecureDroidPlugin';

export type {
  SecureDroidPlugin,
} from './SecureDroidPlugin';

/**
 * SecureDroid Native Service
 *
 * This is the single TypeScript adapter between the React UI
 * and the Android Capacitor plugin.
 *
 * Android plugin name:
 *
 *   @CapacitorPlugin(name = "SecureDroid")
 *
 * The actual Capacitor registration is centralized in:
 *
 *   ./SecureDroidPlugin.ts
 */
class SecureDroidNativeService {
  private readonly isNative =
    Capacitor.isNativePlatform();

  // ============================================================
  // CONNECTION
  // ============================================================

  async checkConnection(): Promise<
    NativeResult<{
      connected: boolean;
      plugin?: string;
      platform?: string;
      message?: string;
      timestamp?: number;
    }>
  > {
    if (!this.isNative) {
      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          'SecureDroid native bridge requires Android execution.',
        isSupported: false,
        runtimePlatform: 'web_preview',
      };
    }

    try {
      const raw =
        await SecureDroidNativePlugin.checkConnection();

      if (!raw || raw.connected === false) {
        return {
          success: false,
          errorCode: 'SERVICE_UNAVAILABLE',
          message:
            raw?.message ||
            'SecureDroid native bridge is unavailable.',
          isSupported: true,
          runtimePlatform: 'android_native',
        };
      }

      return {
        success: true,
        data: raw,
        message:
          raw.message ||
          'SecureDroid native bridge available.',
        isSupported: true,
        runtimePlatform: 'android_native',
      };
    } catch (error: any) {
      console.error(
        '[SecureDroid] checkConnection failed:',
        error
      );

      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          error?.message ||
          'SecureDroid native bridge is unavailable.',
        isSupported: false,
        runtimePlatform: 'android_native',
      };
    }
  }

  // ============================================================
  // INSTALLED APPLICATIONS
  // ============================================================

  async getInstalledApps(): Promise<
    NativeResult<NativeInstalledApp[]>
  > {
    if (!this.isNative) {
      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          'Installed-app evidence requires native Android execution.',
        isSupported: false,
        runtimePlatform: 'web_preview',
      };
    }

    try {
      const raw =
        await SecureDroidNativePlugin.getInstalledApps();

      if (!raw || raw.success === false) {
        return {
          success: false,
          errorCode:
            raw?.errorCode ||
            'SERVICE_UNAVAILABLE',
          message:
            raw?.message ||
            'Installed-app evidence is unavailable from the native Android bridge.',
          isSupported: false,
          runtimePlatform: 'android_native',
        };
      }

      const rawApps =
        Array.isArray(raw.data)
          ? raw.data
          : Array.isArray(raw.apps)
            ? raw.apps
            : [];

      const apps: NativeInstalledApp[] =
        rawApps.map(
          (app: any): NativeInstalledApp => {
            const requestedPermissions =
              Array.isArray(
                app.requestedPermissions
              )
                ? app.requestedPermissions
                : Array.isArray(
                    app.permissions
                  )
                  ? app.permissions
                  : [];

            const dangerousPermissions =
              Array.isArray(
                app.dangerousPermissions
              )
                ? app.dangerousPermissions
                : requestedPermissions.filter(
                    (permission: string) =>
                      this.isDangerousPermission(
                        permission
                      )
                  );

            const installerPackage =
              app.installerPackage ??
              app.installerPackageName ??
              (
                app.installSource &&
                app.installSource !== 'UNKNOWN'
                  ? app.installSource
                  : undefined
              );

            return {
              packageName: String(
                app.packageName || ''
              ),

              label: String(
                app.label ||
                  app.appName ||
                  app.packageName ||
                  'Unknown application'
              ),

              versionName: String(
                app.versionName ||
                  'Unknown'
              ),

              versionCode: Number(
                app.versionCode || 0
              ),

              targetSdk: Number(
                app.targetSdk || 0
              ),

              minSdk: Number(
                app.minSdk || 0
              ),

              isSystemApp: Boolean(
                app.isSystemApp
              ),

              isLaunchable: Boolean(
                app.isLaunchable
              ),

              iconBase64:
                typeof app.iconBase64 ===
                'string'
                  ? app.iconBase64
                  : undefined,

              firstInstallTime: Number(
                app.firstInstallTime ??
                  app.installTime ??
                  0
              ),

              lastUpdateTime: Number(
                app.lastUpdateTime ??
                  app.updateTime ??
                  0
              ),

              requestedPermissions,

              grantedPermissions:
                Array.isArray(
                  app.grantedPermissions
                )
                  ? app.grantedPermissions
                  : [],

              dangerousPermissions,

              installerPackage,

              isDebuggable: Boolean(
                app.isDebuggable
              ),

              signingCertSha256:
                typeof app.signingCertSha256 ===
                'string'
                  ? app.signingCertSha256
                  : undefined,

              enabled: Boolean(
                app.enabled ??
                  app.isEnabled ??
                  true
              ),
            };
          }
        );

      return {
        success: true,
        data: apps,
        isSupported: true,
        runtimePlatform: 'android_native',
      };
    } catch (error: any) {
      console.error(
        '[SecureDroid] getInstalledApps failed:',
        error
      );

      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          error?.message ||
          'Installed-app evidence is unavailable from the native Android bridge.',
        isSupported: false,
        runtimePlatform: 'android_native',
      };
    }
  }

  // ============================================================
  // APPLICATION RISK ANALYSIS
  // ============================================================

  async scanForRisks(): Promise<
    NativeResult<NativeAppRiskReport[]>
  > {
    if (!this.isNative) {
      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          'Application risk analysis requires native Android execution.',
        isSupported: false,
        runtimePlatform: 'web_preview',
      };
    }

    try {
      const raw =
        await SecureDroidNativePlugin.scanForRisks();

      if (!raw || raw.success === false) {
        return {
          success: false,
          errorCode:
            raw?.errorCode ||
            'SERVICE_UNAVAILABLE',
          message:
            raw?.message ||
            'Application risk analysis is unavailable.',
          isSupported: false,
          runtimePlatform: 'android_native',
        };
      }

      const rawReports =
        Array.isArray(raw.data)
          ? raw.data
          : Array.isArray(
              raw.riskDetails
            )
            ? raw.riskDetails
            : [];

      const reports =
        rawReports.map(
          (report: any): NativeAppRiskReport => {
            const rawFindings =
              Array.isArray(
                report.findings
              )
                ? report.findings
                : [];

            const findings =
              rawFindings.map(
                (
                  finding: any,
                  index: number
                ) => ({
                  id: String(
                    finding.id ||
                      finding.code ||
                      `finding_${index}`
                  ),

                  level:
                    this.normalizeRiskLevel(
                      finding.level ||
                        finding.severity
                    ),

                  summary: String(
                    finding.summary ||
                      finding.title ||
                      finding.description ||
                      'Security finding'
                  ),
                })
              );

            return {
              packageName: String(
                report.packageName ||
                  ''
              ),

              label: String(
                report.label ||
                  report.appName ||
                  report.packageName ||
                  'Unknown application'
              ),

              overallRisk:
                this.normalizeRiskLevel(
                  report.overallRisk ||
                    report.riskLevel
                ),

              findings,
            };
          }
        );

      return {
        success: true,
        data: reports,
        isSupported: true,
        runtimePlatform: 'android_native',
      };
    } catch (error: any) {
      console.error(
        '[SecureDroid] scanForRisks failed:',
        error
      );

      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          error?.message ||
          'Application risk analysis is unavailable.',
        isSupported: false,
        runtimePlatform: 'android_native',
      };
    }
  }

  // ============================================================
  // APPLICATION RISK REPORTS
  // ============================================================

  async getAppRiskReports(): Promise<
    NativeResult<NativeAppRiskReport[]>
  > {
    if (!this.isNative) {
      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          'Application risk analysis requires native Android execution.',
        isSupported: false,
        runtimePlatform: 'web_preview',
      };
    }

    try {
      const raw =
        await SecureDroidNativePlugin.getAppRiskReports();

      if (!raw || raw.success === false) {
        return {
          success: false,
          errorCode:
            raw?.errorCode ||
            'SERVICE_UNAVAILABLE',
          message:
            raw?.message ||
            'App risk reports are unavailable.',
          isSupported: false,
          runtimePlatform: 'android_native',
        };
      }

      const rawReports =
        Array.isArray(raw.data)
          ? raw.data
          : Array.isArray(raw.reports)
            ? raw.reports
            : [];

      const reports =
        rawReports.map(
          (report: any): NativeAppRiskReport => {
            const rawFindings =
              Array.isArray(
                report.findings
              )
                ? report.findings
                : [];

            const findings =
              rawFindings.map(
                (
                  finding: any,
                  index: number
                ) => ({
                  id: String(
                    finding.id ||
                      finding.code ||
                      `finding_${index}`
                  ),

                  level:
                    this.normalizeRiskLevel(
                      finding.level ||
                        finding.severity
                    ),

                  summary: String(
                    finding.summary ||
                      finding.title ||
                      finding.description ||
                      'Security finding'
                  ),
                })
              );

            return {
              packageName: String(
                report.packageName ||
                  ''
              ),

              label: String(
                report.label ||
                  report.appName ||
                  report.packageName ||
                  'Unknown application'
              ),

              overallRisk:
                this.normalizeRiskLevel(
                  report.overallRisk ||
                    report.riskLevel
                ),

              findings,
            };
          }
        );

      return {
        success: true,
        data: reports,
        isSupported: true,
        runtimePlatform: 'android_native',
      };
    } catch (error: any) {
      console.error(
        '[SecureDroid] getAppRiskReports failed:',
        error
      );

      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          error?.message ||
          'App risk reports are unavailable.',
        isSupported: false,
        runtimePlatform: 'android_native',
      };
    }
  }

  // ============================================================
  // DEVICE HARDENING
  // ============================================================

  async getHardeningReport(): Promise<
    NativeResult<any>
  > {
    if (!this.isNative) {
      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          'Device hardening analysis requires native Android execution.',
        isSupported: false,
        runtimePlatform: 'web_preview',
      };
    }

    try {
      const raw =
        await SecureDroidNativePlugin.getHardeningReport();

      if (!raw || raw.success === false) {
        return {
          success: false,
          errorCode:
            raw?.errorCode ||
            'SERVICE_UNAVAILABLE',
          message:
            raw?.message ||
            'Device hardening report is unavailable.',
          isSupported: false,
          runtimePlatform: 'android_native',
        };
      }

      const data =
        raw.data &&
        typeof raw.data === 'object'
          ? {
              ...raw.data,
              score:
                raw.data.score ??
                raw.score,

              findings:
                raw.data.findings ??
                raw.findings,
            }
          : {
              score: raw.score,
              findings: raw.findings,
            };

      return {
        success: true,
        data,
        isSupported: true,
        runtimePlatform: 'android_native',
        message: raw.message,
      };
    } catch (error: any) {
      console.error(
        '[SecureDroid] getHardeningReport failed:',
        error
      );

      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          error?.message ||
          'Device hardening report is unavailable.',
        isSupported: false,
        runtimePlatform: 'android_native',
      };
    }
  }

  async getDeviceHardening(): Promise<
    NativeResult<any>
  > {
    return this.getHardeningReport();
  }

  // ============================================================
  // VPN PERMISSION
  // ============================================================

  async requestVpnPermission(): Promise<
    NativeResult<{
      granted: boolean;
      permissionRequested?: boolean;
      state?: string;
    }>
  > {
    if (!this.isNative) {
      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          'VPN permission requires native Android execution.',
        isSupported: false,
        runtimePlatform: 'web_preview',
      };
    }

    try {
      const raw =
        await SecureDroidNativePlugin.requestVpnPermission();

      if (!raw || raw.success === false) {
        return {
          success: false,
          errorCode:
            raw?.errorCode ||
            'SERVICE_UNAVAILABLE',
          message:
            raw?.message ||
            'Unable to request VPN permission.',
          isSupported: true,
          runtimePlatform: 'android_native',
        };
      }

      return {
        success: true,
        data: {
          granted: !!raw.granted,
          permissionRequested:
            !!raw.permissionRequested,
          state: raw.state,
        },
        message: raw.message,
        isSupported: true,
        runtimePlatform: 'android_native',
      };
    } catch (error: any) {
      console.error(
        '[SecureDroid] requestVpnPermission failed:',
        error
      );

      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          error?.message ||
          'Unable to request VPN permission.',
        isSupported: false,
        runtimePlatform: 'android_native',
      };
    }
  }

  // ============================================================
  // VPN STATUS
  // ============================================================

  async getVpnStatus(): Promise<
    NativeResult<NativeVpnStatus>
  > {
    if (!this.isNative) {
      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          'VPN status requires native Android execution.',
        isSupported: false,
        runtimePlatform: 'web_preview',
      };
    }

    try {
      const raw =
        await SecureDroidNativePlugin.getVpnStatus();

      if (!raw || raw.success === false) {
        return {
          success: false,
          errorCode:
            raw?.errorCode ||
            'SERVICE_UNAVAILABLE',
          message:
            raw?.message ||
            'VPN status is unavailable.',
          isSupported: true,
          runtimePlatform: 'android_native',
        };
      }

      if (!raw.data) {
        return {
          success: false,
          errorCode: 'INVALID_RESPONSE',
          message:
            'VPN status response did not contain data.',
          isSupported: true,
          runtimePlatform: 'android_native',
        };
      }

      return {
        success: true,
        data: raw.data,
        message: raw.message,
        isSupported: true,
        runtimePlatform: 'android_native',
      };
    } catch (error: any) {
      console.error(
        '[SecureDroid] getVpnStatus failed:',
        error
      );

      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          error?.message ||
          'VPN status is unavailable.',
        isSupported: false,
        runtimePlatform: 'android_native',
      };
    }
  }

  // ============================================================
  // VPN START
  // ============================================================

  async startVpn(): Promise<
    NativeResult<{
      state?: string;
      permissionRequired?: boolean;
    }>
  > {
    if (!this.isNative) {
      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          'Starting the VPN requires native Android execution.',
        isSupported: false,
        runtimePlatform: 'web_preview',
      };
    }

    try {
      const raw =
        await SecureDroidNativePlugin.startVpn();

      if (!raw) {
        return {
          success: false,
          errorCode: 'INVALID_RESPONSE',
          message:
            'VPN start returned no response.',
          isSupported: true,
          runtimePlatform: 'android_native',
        };
      }

      return {
        success: !!raw.success,
        data: {
          state: raw.state,
          permissionRequired:
            !!raw.permissionRequired,
        },
        errorCode:
          raw.success
            ? undefined
            : raw.permissionRequired
              ? 'PERMISSION_REQUIRED'
              : raw.errorCode ||
                'VPN_START_FAILED',
        message:
          raw.message ||
          (
            raw.permissionRequired
              ? 'VPN permission is required.'
              : raw.success
                ? 'VPN start requested.'
                : 'Unable to start VPN.'
          ),
        isSupported: true,
        runtimePlatform: 'android_native',
      };
    } catch (error: any) {
      console.error(
        '[SecureDroid] startVpn failed:',
        error
      );

      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          error?.message ||
          'Unable to start VPN.',
        isSupported: false,
        runtimePlatform: 'android_native',
      };
    }
  }

  // ============================================================
  // VPN STOP
  // ============================================================

  async stopVpn(): Promise<
    NativeResult<{
      state?: string;
    }>
  > {
    if (!this.isNative) {
      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          'Stopping the VPN requires native Android execution.',
        isSupported: false,
        runtimePlatform: 'web_preview',
      };
    }

    try {
      const raw =
        await SecureDroidNativePlugin.stopVpn();

      if (!raw) {
        return {
          success: false,
          errorCode: 'INVALID_RESPONSE',
          message:
            'VPN stop returned no response.',
          isSupported: true,
          runtimePlatform: 'android_native',
        };
      }

      return {
        success: !!raw.success,
        data: {
          state: raw.state,
        },
        errorCode:
          raw.success
            ? undefined
            : raw.errorCode ||
              'VPN_STOP_FAILED',
        message:
          raw.message ||
          (
            raw.success
              ? 'VPN stop requested.'
              : 'Unable to stop VPN.'
          ),
        isSupported: true,
        runtimePlatform: 'android_native',
      };
    } catch (error: any) {
      console.error(
        '[SecureDroid] stopVpn failed:',
        error
      );

      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          error?.message ||
          'Unable to stop VPN.',
        isSupported: false,
        runtimePlatform: 'android_native',
      };
    }
  }

  // ============================================================
  // SECURITY AUDIT LOGS
  // ============================================================

  async getSecurityLogs(
    limit = 50,
    category?: string
  ): Promise<
    NativeResult<NativeSecurityEvent[]>
  > {
    if (!this.isNative) {
      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          'Security logs require native Android execution.',
        isSupported: false,
        runtimePlatform: 'web_preview',
      };
    }

    try {
      const raw =
        await SecureDroidNativePlugin.getSecurityLogs({
          limit,
          category,
        });

      if (!raw || raw.success === false) {
        return {
          success: false,
          errorCode:
            raw?.errorCode ||
            'SERVICE_UNAVAILABLE',
          message:
            raw?.message ||
            'Security logs are unavailable.',
          isSupported: true,
          runtimePlatform: 'android_native',
        };
      }

      const rawEvents =
        Array.isArray(raw.data)
          ? raw.data
          : Array.isArray(raw.value)
            ? raw.value
            : [];

      const events =
        rawEvents.map(
          (
            event: any,
            index: number
          ): NativeSecurityEvent => ({
            id: String(
              event.id ||
                `event_${index}`
            ),

            timestamp: Number(
              event.timestamp ||
                Date.now()
            ),

            category:
              this.normalizeEventCategory(
                event.category
              ),

            severity:
              this.normalizeEventSeverity(
                event.severity
              ),

            description: String(
              event.description ||
                'Security event'
            ),

            source: String(
              event.source ||
                'SecureDroid'
            ),

            metadata:
              event.metadata &&
              typeof event.metadata ===
                'object'
                ? event.metadata
                : undefined,
          })
        );

      return {
        success: true,
        data: events,
        isSupported: true,
        runtimePlatform: 'android_native',
      };
    } catch (error: any) {
      console.error(
        '[SecureDroid] getSecurityLogs failed:',
        error
      );

      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          error?.message ||
          'Security logs are unavailable.',
        isSupported: false,
        runtimePlatform: 'android_native',
      };
    }
  }

  // ============================================================
  // WRITE SECURITY EVENT
  // ============================================================

  async logSecurityEvent(
    event: Omit<
      NativeSecurityEvent,
      'id' | 'timestamp'
    >
  ): Promise<
    NativeResult<NativeSecurityEvent>
  > {
    if (!this.isNative) {
      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          'Security event logging requires native Android execution.',
        isSupported: false,
        runtimePlatform: 'web_preview',
      };
    }

    try {
      const raw =
        await SecureDroidNativePlugin.logSecurityEvent({
          event,
        });

      if (!raw || raw.success === false) {
        return {
          success: false,
          errorCode:
            raw?.errorCode ||
            'SERVICE_UNAVAILABLE',
          message:
            raw?.message ||
            'Unable to write security event.',
          isSupported: true,
          runtimePlatform: 'android_native',
        };
      }

      const source =
        raw.data &&
        typeof raw.data === 'object'
          ? raw.data
          : raw;

      const normalizedEvent:
        NativeSecurityEvent = {
        id: String(
          source.id ||
            `evt_${Date.now()}`
        ),

        timestamp: Number(
          source.timestamp ||
            Date.now()
        ),

        category:
          this.normalizeEventCategory(
            source.category ||
              event.category
          ),

        severity:
          this.normalizeEventSeverity(
            source.severity ||
              event.severity
          ),

        description: String(
          source.description ||
            event.description ||
            'Security event'
        ),

        source: String(
          source.source ||
            event.source ||
            'SecureDroid'
        ),

        metadata:
          source.metadata &&
          typeof source.metadata ===
            'object'
            ? source.metadata
            : undefined,
      };

      return {
        success: true,
        data: normalizedEvent,
        isSupported: true,
        runtimePlatform: 'android_native',
      };
    } catch (error: any) {
      console.error(
        '[SecureDroid] logSecurityEvent failed:',
        error
      );

      return {
        success: false,
        errorCode: 'SERVICE_UNAVAILABLE',
        message:
          error?.message ||
          'Unable to write security event.',
        isSupported: false,
        runtimePlatform: 'android_native',
      };
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================

  private normalizeRiskLevel(
    value: any
  ): 'LOW' | 'MEDIUM' | 'HIGH' {
    switch (
      String(value || '').toUpperCase()
    ) {
      case 'HIGH':
      case 'CRITICAL':
        return 'HIGH';

      case 'MEDIUM':
      case 'MODERATE':
        return 'MEDIUM';

      case 'LOW':
      default:
        return 'LOW';
    }
  }

  private normalizeEventSeverity(
    value: any
  ): 'INFO' | 'WARNING' | 'CRITICAL' {
    switch (
      String(value || '').toUpperCase()
    ) {
      case 'CRITICAL':
        return 'CRITICAL';

      case 'WARNING':
      case 'WARN':
        return 'WARNING';

      case 'INFO':
      default:
        return 'INFO';
    }
  }

  private normalizeEventCategory(
    value: any
  ): NativeSecurityEvent['category'] {
    switch (
      String(value || '').toUpperCase()
    ) {
      case 'PERMISSION':
        return 'PERMISSION';

      case 'AUTH':
      case 'AUTHENTICATION':
        return 'AUTH';

      case 'NETWORK':
        return 'NETWORK';

      case 'SCAN':
      case 'APPLICATIONS':
        return 'SCAN';

      case 'CONFIG':
        return 'CONFIG';

      case 'EMERGENCY':
        return 'EMERGENCY';

      case 'BACKUP':
        return 'BACKUP';

      case 'AUDIT':
      case 'SECURITY':
      default:
        return 'AUDIT';
    }
  }

  private isDangerousPermission(
    permission: string
  ): boolean {
    const dangerousPermissions =
      new Set([
        'android.permission.CAMERA',
        'android.permission.RECORD_AUDIO',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.READ_CONTACTS',
        'android.permission.WRITE_CONTACTS',
        'android.permission.READ_CALENDAR',
        'android.permission.WRITE_CALENDAR',
        'android.permission.READ_SMS',
        'android.permission.SEND_SMS',
        'android.permission.RECEIVE_SMS',
        'android.permission.CALL_PHONE',
        'android.permission.READ_CALL_LOG',
        'android.permission.WRITE_CALL_LOG',
        'android.permission.READ_PHONE_STATE',
        'android.permission.READ_PHONE_NUMBERS',
        'android.permission.BODY_SENSORS',
        'android.permission.ACTIVITY_RECOGNITION',
        'android.permission.READ_MEDIA_IMAGES',
        'android.permission.READ_MEDIA_VIDEO',
        'android.permission.READ_MEDIA_AUDIO',
        'android.permission.POST_NOTIFICATIONS',
      ]);

    return dangerousPermissions.has(
      permission
    );
  }
}

export const SecureDroidNative =
  new SecureDroidNativeService();
