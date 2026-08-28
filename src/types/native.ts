/**
 * SecureDroid Native Android Integration Types
 *
 * Security contract between the React/Capacitor layer and Android native layer.
 *
 * PRINCIPLES:
 * - Never treat missing data as a security failure.
 * - Never treat UNKNOWN as VERIFIED.
 * - Never represent DEMO_ONLY capability as real protection.
 * - Native evidence must accompany security claims where applicable.
 * - Capability state determines what the APK can actually enforce.
 */

// ============================================================
// 0. PLATFORM / MODE
// ============================================================

export type RuntimePlatform =
    | 'android_native'
    | 'web_preview'
    | 'unknown';

export type SecureDroidMode =
    | 'NORMAL'
    | 'MANAGED_PROFILE'
    | 'DEVICE_OWNER'
    | 'UNKNOWN';

export type CapabilityState =
    | 'SUPPORTED'
    | 'LIMITED'
    | 'UNAVAILABLE'
    | 'UNKNOWN'
    | 'REQUIRES_DEVICE_OWNER'
    | 'REQUIRES_SYSTEM_PRIVILEGE'
    | 'REQUIRES_HARDWARE'
    | 'REQUIRES_OS_INTEGRATION'
    | 'DEMO_ONLY'
    | 'ERROR';

export type ImplementationLayer =
    | 'APP'
    | 'CAPACITOR'
    | 'ANDROID_SDK'
    | 'DEVICE_POLICY'
    | 'VPN_SERVICE'
    | 'KEYSTORE'
    | 'HARDWARE'
    | 'OS'
    | 'UNKNOWN';

export type RequiredPrivilege =
    | 'NONE'
    | 'RUNTIME_PERMISSION'
    | 'VPN_PERMISSION'
    | 'DEVICE_ADMIN'
    | 'PROFILE_OWNER'
    | 'DEVICE_OWNER'
    | 'SYSTEM'
    | 'ROOT'
    | 'HARDWARE'
    | 'UNKNOWN';

// ============================================================
// 1. NATIVE RESULT
// ============================================================

export type NativeErrorCode =
    | 'PERMISSION_DENIED'
    | 'NOT_SUPPORTED'
    | 'HARDWARE_UNAVAILABLE'
    | 'AUTHENTICATION_FAILED'
    | 'USER_CANCELLED'
    | 'ANDROID_RESTRICTION'
    | 'SERVICE_UNAVAILABLE'
    | 'INVALID_ARGUMENT'
    | 'TIMEOUT'
    | 'BUSY'
    | 'SECURITY_POLICY_BLOCKED'
    | 'DEVICE_OWNER_REQUIRED'
    | 'SYSTEM_PRIVILEGE_REQUIRED'
    | 'UNKNOWN_ERROR';

export interface NativeResult<T> {
    success: boolean;
    data?: T;

    errorCode?: NativeErrorCode;
    message?: string;

    recoverable?: boolean;
    isSupported?: boolean;

    runtimePlatform?: RuntimePlatform;

    /**
     * True only when the returned value represents
     * an actual native observation.
     */
    isReal?: boolean;

    /**
     * True only for explicitly enabled development/demo data.
     * Production security UI must never interpret this as real evidence.
     */
    isDemo?: boolean;
}

// ============================================================
// 2. CAPABILITY ENGINE
// ============================================================

export interface SecureDroidCapability {
    id: string;
    name: string;
    category: string;

    state: CapabilityState;

    evidence: string;

    securityMeaning: string;

    limitations: string[];

    remediation?: string;

    provider: string;

    isReal: boolean;

    canAppChange: boolean;

    requiredPrivilege: RequiredPrivilege;

    implementationLayer: ImplementationLayer;
}

export interface CapabilityReport {
    timestamp: number;

    mode: SecureDroidMode;

    capabilities: SecureDroidCapability[];

    nativeAvailable: boolean;

    androidApiLevel: number;

    deviceOwner: boolean;

    profileOwner: boolean;

    managedProfile: boolean;

    vpnAvailable: boolean;

    biometricAvailable: boolean;

    hardwareKeystoreAvailable: boolean;

    strongBoxAvailable: boolean;
}

// ============================================================
// 3. DEVICE MANAGEMENT
// ============================================================

export interface DeviceManagementStatus {
    mode: SecureDroidMode;

    deviceAdminActive: boolean;

    profileOwner: boolean;

    deviceOwner: boolean;

    managedProfile: boolean;

    organizationOwned?: boolean;

    canApplyDevicePolicies: boolean;

    canBlockApplications: boolean;

    canEnforcePasswordPolicy: boolean;

    canConfigureKiosk: boolean;

    canControlUserRestrictions: boolean;

    limitations: string[];
}

// ============================================================
// 4. DEVICE INFORMATION
// ============================================================

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

    /**
     * These must only be populated when Android exposes
     * trustworthy evidence for the value.
     */
    bootloaderLocked?: boolean;
    verifiedBootState?: 'VERIFIED' | 'SELF_SIGNED' | 'UNVERIFIED' | 'UNKNOWN';

    kvmVirtualizationSupported?: boolean;
}

// ============================================================
// 5. BATTERY
// ============================================================

export interface NativeBatteryStatus {
    percentage: number;

    isCharging: boolean;

    chargingSource:
        | 'AC'
        | 'USB'
        | 'WIRELESS'
        | 'NONE'
        | 'UNKNOWN';

    health:
        | 'GOOD'
        | 'OVERHEAT'
        | 'DEAD'
        | 'OVER_VOLTAGE'
        | 'UNSPECIFIED_FAILURE'
        | 'COLD'
        | 'UNKNOWN';

    temperatureCelsius: number | null;
    voltageMillivolts: number | null;
    currentNowMicroamperes: number | null;
    capacityMicroampereHours: number | null;

    estimatedRemainingMinutes: number | null;
}

// ============================================================
// 6. NETWORK
// ============================================================

export interface NativeNetworkState {
    isConnected: boolean;

    connectionType:
        | 'WIFI'
        | 'CELLULAR'
        | 'ETHERNET'
        | 'BLUETOOTH'
        | 'VPN'
        | 'NONE'
        | 'UNKNOWN';

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

// ============================================================
// 7. STORAGE
// ============================================================

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

// ============================================================
// 8. SENSORS
// ============================================================

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

// ============================================================
// 9. CAMERA
// ============================================================

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

// ============================================================
// 10. BIOMETRICS
// ============================================================

export interface NativeBiometricStatus {
    isAvailable: boolean;

    biometricType:
        | 'FINGERPRINT'
        | 'FACE'
        | 'IRIS'
        | 'MULTIPLE'
        | 'NONE';

    hardwarePresent: boolean;

    enrolled: boolean;

    canAuthenticateStrong: boolean;
    canAuthenticateWeak: boolean;
    canAuthenticateDeviceCredential: boolean;
}

export interface BiometricAuthResult {
    authenticated: boolean;

    authType?:
        | 'BIOMETRIC_STRONG'
        | 'BIOMETRIC_WEAK'
        | 'DEVICE_CREDENTIAL';

    timestamp: number;
}

// ============================================================
// 11. PERMISSIONS
// ============================================================

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

// ============================================================
// 12. INSTALLED APPS
// ============================================================

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

// ============================================================
// 13. CALENDAR
// ============================================================

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

// ============================================================
// 14. CONTACTS
// ============================================================

export interface NativeContact {
    id: string;

    displayName: string;

    phoneNumbers: {
        number: string;
        type: string;
    }[];

    emailAddresses: {
        email: string;
        type: string;
    }[];

    photoUri?: string;

    starred: boolean;
}

// ============================================================
// 15. FILES
// ============================================================

export interface NativeFileInfo {
    name: string;
    path: string;

    sizeBytes: number;
    mimeType: string;

    lastModified: number;

    isDirectory: boolean;

    uri?: string;
}

// ============================================================
// 16. NOTIFICATIONS
// ============================================================

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

// ============================================================
// 17. SECURITY ASSESSMENT
// ============================================================

export type SecurityCheckStatus =
    | 'PASSED'
    | 'WARNING'
    | 'FAILED'
    | 'INFO'
    | 'UNKNOWN'
    | 'NOT_APPLICABLE';

export type SecuritySeverity =
    | 'CRITICAL'
    | 'HIGH'
    | 'MEDIUM'
    | 'LOW'
    | 'INFORMATIONAL';

export interface SecurityCheckItem {
    id: string;

    name: string;

    category:
        | 'OS_INTEGRITY'
        | 'DEVICE_ENCRYPTION'
        | 'AUTHENTICATION'
        | 'PERMISSIONS'
        | 'NETWORK'
        | 'DEBUGGING'
        | 'APPLICATIONS'
        | 'DEVICE_MANAGEMENT'
        | 'HARDWARE'
        | 'UNKNOWN';

    status: SecurityCheckStatus;

    severity: SecuritySeverity;

    details: string;

    evidence?: string[];

    remediation?: string;

    /**
     * Prevents UI from displaying a native observation
     * as though it were a simulated/demo result.
     */
    isReal: boolean;
}

export interface SystemSecurityAssessment {
    overallScore: number;

    qualitativeTier:
        | 'HARDENED'
        | 'ELEVATED'
        | 'BALANCED'
        | 'ATTENTION_REQUIRED'
        | 'UNKNOWN';

    timestamp: number;

    checks: SecurityCheckItem[];

    remediationSuggestions: string[];

    isReal: boolean;
}

// ============================================================
// 18. SECURE STORAGE
// ============================================================

export interface SecureStorageItem {
    key: string;
    value: string;

    requiresBiometric?: boolean;

    createdAt?: number;
    updatedAt?: number;
}

// ============================================================
// 19. SECURITY AUDIT LOG
// ============================================================

export interface NativeSecurityEvent {
    id: string;

    timestamp: number;

    category:
        | 'PERMISSION'
        | 'AUTH'
        | 'NETWORK'
        | 'SCAN'
        | 'CONFIG'
        | 'AUDIT'
        | 'EMERGENCY'
        | 'BACKUP'
        | 'DEVICE'
        | 'APPLICATION';

    severity:
        | 'INFO'
        | 'WARNING'
        | 'CRITICAL';

    description: string;

    source: string;

    metadata?: Record<
        string,
        string | number | boolean | null
    >;
}

// ============================================================
// 20. VPN
// ============================================================

export interface NativeVpnStatus {
    isActive: boolean;

    establishedTime?: number;

    bytesReceived: number;
    bytesTransmitted: number;

    blockedDomainsCount: number;

    activeDns: string;

    filterMode:
        | 'BLOCKLIST'
        | 'STRICT'
        | 'ALLOWLIST'
        | 'DISABLED';
}

// ============================================================
// 21. THREAT DETECTION
// ============================================================

export interface ThreatFinding {
    id: string;

    ruleId: string;

    title: string;

    description: string;

    severity:
        | 'CRITICAL'
        | 'HIGH'
        | 'MEDIUM'
        | 'LOW';

    affectedPackage?: string;

    evidence: string[];

    recommendation: string;

    isReal: boolean;
}

export interface ThreatAssessmentReport {
    timestamp: number;

    scannedAppsCount: number;

    overallRiskLevel:
        | 'SAFE'
        | 'LOW_RISK'
        | 'MODERATE_RISK'
        | 'HIGH_RISK'
        | 'CRITICAL_RISK'
        | 'UNKNOWN';

    findings: ThreatFinding[];

    integrityIndicators: {
        debuggableAppsFound: number;
        sideloadedAppsFound: number;
        excessivePermissionAppsFound: number;
        outdatedTargetSdkAppsFound: number;
    };

    isReal: boolean;
}

// ============================================================
// 22. ENCRYPTED BACKUP
// ============================================================

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

// ============================================================
// 23. VIRTUALIZATION
// ============================================================

export interface VmHardwareCapability {
    isSupported: boolean;

    backendType:
        | 'ARM_PKVM'
        | 'KVM_DEVICE'
        | 'RESTRICTED_SANDBOX'
        | 'UNAVAILABLE';

    kvmNodeAccessible: boolean;

    hypervisorVendor?: string;

    allocatedMemoryMb?: number;

    supportedGuestArchitectures: string[];

    limitationNotice: string;

    isReal: boolean;
}

// ============================================================
// 24. APP RISK AUDITOR
// ============================================================

export type AppRiskLevel =
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | 'CRITICAL'
    | 'UNKNOWN';

export interface NativeAppRiskFinding {
    id: string;

    level:
        | 'LOW'
        | 'MEDIUM'
        | 'HIGH'
        | 'CRITICAL';

    summary: string;

    evidence?: string[];

    recommendation?: string;
}

export interface NativeAppRiskReport {
    packageName: string;

    label: string;

    overallRisk: AppRiskLevel;

    securityScore?: number;

    findings: NativeAppRiskFinding[];

    isReal: boolean;
}

// ============================================================
// 25. DEVICE HARDENING
// ============================================================

export interface NativeHardeningFinding {
    id: string;

    level:
        | 'GOOD'
        | 'WARNING'
        | 'CRITICAL'
        | 'UNKNOWN';

    summary: string;

    evidence?: string[];

    remediation?: string;

    isReal: boolean;
}

export interface NativeHardeningReport {
    score: number;

    findings: NativeHardeningFinding[];

    timestamp?: number;

    isReal: boolean;
}

// ============================================================
// 26. NATIVE SERVICE HEALTH
// ============================================================

export interface NativeServiceHealth {
    nativeBridge: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

    pluginRegistered: boolean;

    capabilityEngineAvailable: boolean;

    securityEngineAvailable: boolean;

    vpnServiceAvailable: boolean;

    auditServiceAvailable: boolean;

    timestamp: number;
}

// ============================================================
// 27. SECURITY ENGINE STATUS
// ============================================================

export interface SecurityEngineStatus {
    initialized: boolean;

    running: boolean;

    lastScanTimestamp?: number;

    lastAssessmentTimestamp?: number;

    findingsCount: number;

    currentRisk:
        | 'SAFE'
        | 'LOW_RISK'
        | 'MODERATE_RISK'
        | 'HIGH_RISK'
        | 'CRITICAL_RISK'
        | 'UNKNOWN';

    isReal: boolean;
}
