/**
 * SecureDroid Native Android Integration Types
 * Strict typing for Capacitor Bridge & Android Native Kotlin Services
 */

export type NativeErrorCode =
  | 'PERMISSION_DENIED'
  | 'NOT_SUPPORTED'
  | 'HARDWARE_UNAVAILABLE'
  | 'AUTHENTICATION_FAILED'
  | 'USER_CANCELLED'
  | 'ANDROID_RESTRICTION'
  | 'SERVICE_UNAVAILABLE'
  | 'INVALID_ARGUMENT'
  | 'UNKNOWN_ERROR';

export interface NativeResult<T> {
  success: boolean;
  data?: T;
  errorCode?: NativeErrorCode;
  message?: string;
  recoverable?: boolean;
  isSupported?: boolean;
  runtimePlatform?: 'android_native' | 'web_preview';
}

// 1. Device Information
export interface NativeDeviceInfo {
  manufacturer: string;
  brand: string;
  model: string;
  device: string;
  product: string;
  androidVersion: string;
  sdkVersion: number;
  securityPatch: string;
  kernelVersion: string;
  cpuArchitecture: string;
  supportedAbis: string[];
  totalRamMb: number;
  availableRamMb: number;
  totalStorageBytes: number;
  availableStorageBytes: number;
  screenWidth: number;
  screenHeight: number;
  screenDensity: number;
  locale: string;
  timezone: string;
  uptimeSeconds: number;
  isCharging: boolean;
  isEmulator: boolean;
  buildFingerprint: string;
  bootloaderLocked?: boolean;
  kvmVirtualizationSupported?: boolean;
}

// 2. Battery Status
export interface NativeBatteryStatus {
  percentage: number;
  isCharging: boolean;
  chargingSource: 'AC' | 'USB' | 'WIRELESS' | 'NONE' | 'UNKNOWN';
  health: 'GOOD' | 'OVERHEAT' | 'DEAD' | 'OVER_VOLTAGE' | 'UNSPECIFIED_FAILURE' | 'COLD' | 'UNKNOWN';
  temperatureCelsius: number | null;
  voltageMillivolts: number | null;
  currentNowMicroamperes: number | null;
  capacityMicroampereHours: number | null;
  estimatedRemainingMinutes: number | null;
}

// 3. Network State
export interface NativeNetworkState {
  isConnected: boolean;
  connectionType: 'WIFI' | 'CELLULAR' | 'ETHERNET' | 'BLUETOOTH' | 'VPN' | 'NONE' | 'UNKNOWN';
  isValidated: boolean;
  isMetered: boolean;
  isVpnActive: boolean;
  ipAddress?: string;
  dnsServers: string[];
  ssid?: string;
  linkSpeedMbps?: number;
  rxBytes: number;
  txBytes: number;
  downlinkSpeedKbps?: number;
  uplinkSpeedKbps?: number;
  captivePortalDetected?: boolean;
}

// 4. Storage Info
export interface NativeStorageInfo {
  internalTotalBytes: number;
  internalAvailableBytes: number;
  internalUsedBytes: number;
  internalUsagePercent: number;
  externalStorageAvailable: boolean;
  externalTotalBytes?: number;
  externalAvailableBytes?: number;
  externalUsedBytes?: number;
}

// 5. Sensors
export interface NativeSensorInfo {
  id: string;
  name: string;
  vendor: string;
  type: number;
  typeName: string;
  powerMa: number;
  resolution: number;
  maxRange: number;
  isAvailable: boolean;
}

export interface LiveSensorReading {
  sensorType: string;
  values: number[];
  accuracy: number;
  timestamp: number;
}

// 6. Camera Info
export interface NativeCameraCapability {
  hasCamera: boolean;
  hasFrontCamera: boolean;
  hasBackCamera: boolean;
  hasFlash: boolean;
  supportedResolutions: string[];
  maxZoomRatio: number;
  permissionGranted: boolean;
}

export interface CapturePhotoResult {
  filePath?: string;
  dataUrl?: string;
  mimeType: string;
  width: number;
  height: number;
  savedToMediaStore: boolean;
}

// 7. Biometrics
export interface NativeBiometricStatus {
  isAvailable: boolean;
  biometricType: 'FINGERPRINT' | 'FACE' | 'IRIS' | 'MULTIPLE' | 'NONE';
  hardwarePresent: boolean;
  enrolled: boolean;
  canAuthenticateStrong: boolean;
  canAuthenticateWeak: boolean;
  canAuthenticateDeviceCredential: boolean;
}

export interface BiometricAuthResult {
  authenticated: boolean;
  authType?: 'BIOMETRIC_STRONG' | 'BIOMETRIC_WEAK' | 'DEVICE_CREDENTIAL';
  timestamp: number;
}

// 8. Permissions
export type RuntimePermissionName =
  | 'CAMERA'
  | 'ACCESS_FINE_LOCATION'
  | 'ACCESS_COARSE_LOCATION'
  | 'RECORD_AUDIO'
  | 'POST_NOTIFICATIONS'
  | 'READ_CONTACTS'
  | 'WRITE_CONTACTS'
  | 'READ_CALENDAR'
  | 'WRITE_CALENDAR'
  | 'READ_MEDIA_IMAGES'
  | 'READ_EXTERNAL_STORAGE'
  | 'WRITE_EXTERNAL_STORAGE';

export interface PermissionStatusMap {
  [permission: string]: {
    granted: boolean;
    canRequest: boolean;
    shouldShowRationale: boolean;
  };
}

// 9 & 10. Installed Apps & Launcher
export interface NativeInstalledApp {
  packageName: string;
  label: string;
  versionName: string;
  versionCode: number;
  targetSdk: number;
  minSdk: number;
  isSystemApp: boolean;
  isLaunchable: boolean;
  iconBase64?: string;
  firstInstallTime: number;
  lastUpdateTime: number;
  requestedPermissions: string[];
  grantedPermissions: string[];
  dangerousPermissions: string[];
  installerPackage?: string;
  isDebuggable: boolean;
  signingCertSha256?: string;
  enabled: boolean;
}

// 11. Calendar
export interface NativeCalendarEvent {
  id: string;
  calendarId: string;
  calendarName: string;
  title: string;
  description?: string;
  location?: string;
  startTime: number;
  endTime: number;
  allDay: boolean;
  organizer?: string;
}

// 12. Contacts
export interface NativeContact {
  id: string;
  displayName: string;
  phoneNumbers: { number: string; type: string }[];
  emailAddresses: { email: string; type: string }[];
  photoUri?: string;
  starred: boolean;
}

// 13. Files
export interface NativeFileInfo {
  name: string;
  path: string;
  sizeBytes: number;
  mimeType: string;
  lastModified: number;
  isDirectory: boolean;
  uri?: string;
}

// 14. Notifications
export interface NativeCapturedNotification {
  id: string;
  packageName: string;
  appName: string;
  title: string;
  text: string;
  timestamp: number;
  category?: string;
  isClearable: boolean;
}

// 17. Real Security Dashboard Assessment
export interface SystemSecurityAssessment {
  overallScore: number;
  qualitativeTier: 'HARDENED' | 'ELEVATED' | 'BALANCED' | 'ATTENTION_REQUIRED';
  timestamp: number;
  checks: SecurityCheckItem[];
  remediationSuggestions: string[];
}

export interface SecurityCheckItem {
  id: string;
  name: string;
  category: 'OS_INTEGRITY' | 'DEVICE_ENCRYPTION' | 'AUTHENTICATION' | 'PERMISSIONS' | 'NETWORK' | 'DEBUGGING';
  status: 'PASSED' | 'WARNING' | 'FAILED' | 'INFO';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  details: string;
  remediation?: string;
}

// 21. Keystore Secure Storage
export interface SecureStorageItem {
  key: string;
  value: string;
  requiresBiometric?: boolean;
}

// 24. Security Audit Log
export interface NativeSecurityEvent {
  id: string;
  timestamp: number;
  category: 'PERMISSION' | 'AUTH' | 'NETWORK' | 'SCAN' | 'CONFIG' | 'AUDIT' | 'EMERGENCY' | 'BACKUP';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  description: string;
  source: string;
  metadata?: Record<string, string | number | boolean>;
}

// 25. VPN Controls
export interface NativeVpnStatus {
  isActive: boolean;
  establishedTime?: number;
  bytesReceived: number;
  bytesTransmitted: number;
  blockedDomainsCount: number;
  activeDns: string;
  filterMode: 'BLOCKLIST' | 'STRICT' | 'ALLOWLIST' | 'DISABLED';
}

// 27. Threat Detection Engine
export interface ThreatFinding {
  id: string;
  ruleId: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  affectedPackage?: string;
  evidence: string[];
  recommendation: string;
}

export interface ThreatAssessmentReport {
  timestamp: number;
  scannedAppsCount: number;
  overallRiskLevel: 'SAFE' | 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK' | 'CRITICAL_RISK';
  findings: ThreatFinding[];
  integrityIndicators: {
    debuggableAppsFound: number;
    sideloadedAppsFound: number;
    excessivePermissionAppsFound: number;
    outdatedTargetSdkAppsFound: number;
  };
}

// 28. Backup & Restore
export interface EncryptedBackupArchive {
  version: number;
  createdAt: number;
  payloadEncryptedBase64: string;
  ivBase64: string;
  saltBase64: string;
  authTagBase64: string;
  manifest: {
    configCount: number;
    logCount: number;
    appSettingsCount: number;
  };
}

// 30. Virtualization / VM Capability
export interface VmHardwareCapability {
  isSupported: boolean;
  backendType: 'ARM_PKVM' | 'KVM_DEVICE' | 'RESTRICTED_SANDBOX' | 'UNAVAILABLE';
  kvmNodeAccessible: boolean;
  hypervisorVendor?: string;
  allocatedMemoryMb?: number;
  supportedGuestArchitectures: string[];
  limitationNotice: string;
}
