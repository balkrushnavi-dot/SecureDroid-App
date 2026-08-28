/**
 * SecureDroid Native Android Integration Types
 *
 * Contract between the React/TypeScript UI and the native Android security layer.
 *
 * Core rule:
 * A value that cannot be verified by Android must be represented as UNKNOWN/null,
 * not inferred as secure or insecure.
 */

// ============================================================
// 0. COMMON SECURITY STATES
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
    | 'UNKNOWN_ERROR';

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

export type SecurityStatus =
    | 'VERIFIED'
    | 'SUPPORTED'
    | 'UNKNOWN'
    | 'WARNING'
    | 'UNAVAILABLE'
    | 'ERROR';

export type SecureDroidMode =
    | 'NORMAL'
    | 'MANAGED_PROFILE'
    | 'DEVICE_OWNER'
    | 'UNKNOWN';

export interface NativeResult<T> {
    success: boolean;
    data?: T;
    errorCode?: NativeErrorCode;
    message?: string;
    recoverable?: boolean;
    isSupported?: boolean;
    runtimePlatform?: 'android_native' | 'web_preview';
}

// ============================================================
// 1. CAPABILITY ENGINE
// ============================================================

export interface SecurityCapability {
    id: string;
    name: string;
    category: string;

    state: CapabilityState;

    /**
     * Evidence explaining why the capability received this state.
     * Example:
     * "DevicePolicyManager.isDeviceOwnerApp() returned true."
     */
    evidence: string;

    /**
     * What this capability actually means from a security perspective.
     */
    securityMeaning: string;

    /**
     * Explicit limitations.
     */
    limitations: string[];

    /**
     * User remediation when applicable.
     */
    remediation?: string;

    /**
     * True only when the underlying information/action is real.
     */
    isReal: boolean;

    /**
     * Whether SecureDroid can change the state itself.
     */
    canAppChange: boolean;

    /**
     * Required privilege, if any.
     */
    requiredPrivilege?: string;

    /**
     * Layer where the capability is implemented.
     */
    implementationLayer:
        | 'APP'
        | 'ANDROID_API'
        | 'DEVICE_POLICY'
        | 'VPN'
        | 'KEYSTORE'
        | 'HARDWARE'
        | 'OS'
        | 'UNKNOWN';

    /**
     * Native provider that produced the result.
     */
    provider?: string;
}

export interface CapabilitySnapshot {
    timestamp: number;
    mode: SecureDroidMode;
    capabilities: SecurityCapability[];
}

// ============================================================
// 2. DEVICE INFORMATION
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
     * Optional because ordinary applications cannot always independently
     * verify bootloader state.
     */
    bootloaderLocked?: boolean;
    bootloaderState?: SecurityStatus;

    /**
     * Do not treat KVM support as proof that a usable VM exists.
     */
    kvmVirtualizationSupported?: boolean;
    virtualizationStatus?: SecurityStatus;
}

// ============================================================
// 3. BATTERY
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
// 4. NETWORK
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
// 5. STORAGE
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
// 6. SENSORS
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
// 7. CAMERA
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
// 8. BIOMETRICS
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
// 9. RUNTIME PERMISSIONS
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

export interface PermissionStatus {
    granted: boolean;
    canRequest: boolean;
    shouldShowRationale: boolean;
}

export interface PermissionStatusMap {
    [permission: string]: PermissionStatus;
}

// ============================================================
// 10. INSTALLED APPLICATIONS
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

    /**
     * Signing certificate information is observational.
     * It does NOT prove that an application is trustworthy.
     */
    signingCertSha256?: string;

    enabled: boolean;
}

// ============================================================
// 11. CALENDAR
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
// 12. CONTACTS
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
// 13. FILES
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
// 14. NOTIFICATIONS
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
// 15. SECURITY CHECKS
// ============================================================

export type SecurityCheckCategory =
    | 'OS_INTEGRITY'
    | 'DEVICE_ENCRYPTION'
    | 'AUTHENTICATION'
    | 'PERMISSIONS'
    | 'NETWORK'
    | 'DEBUGGING'
    | 'APPLICATIONS'
    | 'DEVICE_MANAGEMENT'
    | 'KEYSTORE'
    | 'VPN';

export type SecurityCheckStatus =
    | 'PASSED'
    | 'WARNING'
    | 'FAILED'
    | 'UNKNOWN'
    | 'UNAVAILABLE'
    | 'INFO';

export type SecuritySeverity =
    | 'CRITICAL'
    | 'HIGH'
    | 'MEDIUM'
    | 'LOW'
    | 'INFORMATIONAL';

export interface SecurityCheckItem {
    id: string;
    name: string;

    category: SecurityCheckCategory;

    status: SecurityCheckStatus;
    severity: SecuritySeverity;

    details: string;

    evidence?: string;

    remediation?: string;

    /**
     * False when the check is informational only or inferred.
     */
    isVerified: boolean;
}

// ============================================================
// 16. SECURITY ASSESSMENT
// ============================================================

export type SecurityTier =
    | 'HARDENED'
    | 'ELEVATED'
    | 'BALANCED'
    | 'ATTENTION_REQUIRED'
    | 'UNKNOWN';

export interface SystemSecurityAssessment {
    /**
     * Null means no trustworthy aggregate score is available.
     */
    overallScore: number | null;

    qualitativeTier: SecurityTier;

    timestamp: number;

    checks: SecurityCheckItem[];

    remediationSuggestions: string[];

    /**
     * Number of checks actually evaluated.
     */
    evaluatedChecks: number;

    /**
     * Number of checks whose result is UNKNOWN.
     */
    unknownChecks: number;

    /**
     * Prevents the UI from presenting an inferred score as verified.
     */
    isScoreVerified: boolean;
}

// ============================================================
// 17. KEYSTORE / SECURE STORAGE
// ============================================================

export interface SecureStorageItem {
    key: string;
    value: string;
    requiresBiometric?: boolean;
}

export interface NativeKeystoreStatus {
    available: boolean;

    hardwareBacked:
        | true
        | false
        | null;

    strongBoxAvailable:
        | true
        | false
        | null;

    secureKeyGenerationSupported:
        | true
        | false
        | null;

    status: SecurityStatus;

    evidence: string;
}

// ============================================================
// 18. SECURITY AUDIT LOG
// ============================================================

export type SecurityEventCategory =
    | 'PERMISSION'
    | 'AUTH'
    | 'NETWORK'
    | 'SCAN'
    | 'CONFIG'
    | 'AUDIT'
    | 'EMERGENCY'
    | 'BACKUP'
    | 'DEVICE'
    | 'APPLICATION'
    | 'CAPABILITY';

export type SecurityEventSeverity =
    | 'INFO'
    | 'WARNING'
    | 'CRITICAL';

export interface NativeSecurityEvent {
    id: string;
    timestamp: number;

    category: SecurityEventCategory;

    severity: SecurityEventSeverity;

    description: string;
    source: string;

    metadata?: Record<
        string,
        string | number | boolean
    >;
}

// ============================================================
// 19. VPN
// ============================================================

export type VpnFilterMode =
    | 'BLOCKLIST'
    | 'STRICT'
    | 'ALLOWLIST'
    | 'DISABLED';

export interface NativeVpnStatus {
    isActive: boolean;

    establishedTime?: number;

    bytesReceived: number;
    bytesTransmitted: number;

    blockedDomainsCount: number;

    activeDns: string;

    filterMode: VpnFilterMode;

    /**
     * Explicitly identifies this as application-level VPN protection.
     */
    implementation:
        | 'APPLICATION_VPN'
        | 'UNAVAILABLE'
        | 'UNKNOWN';

    status: SecurityStatus;
}

// ============================================================
// 20. THREAT DETECTION
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

    /**
     * Whether the finding is based on directly observed evidence.
     */
    isVerified: boolean;
}

export type ThreatRiskLevel =
    | 'SAFE'
    | 'LOW_RISK'
    | 'MODERATE_RISK'
    | 'HIGH_RISK'
    | 'CRITICAL_RISK'
    | 'UNKNOWN';

export interface ThreatAssessmentReport {
    timestamp: number;

    scannedAppsCount: number;

    overallRiskLevel: ThreatRiskLevel;

    findings: ThreatFinding[];

    integrityIndicators: {
        debuggableAppsFound: number;
        sideloadedAppsFound: number;
        excessivePermissionAppsFound: number;
        outdatedTargetSdkAppsFound: number;
    };

    /**
     * This is an application-analysis result, not malware proof.
     */
    analysisType:
        | 'APPLICATION_HEURISTICS'
        | 'UNKNOWN';
}

// ============================================================
// 21. BACKUP & RESTORE
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
// 22. VIRTUALIZATION
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

    status: CapabilityState;
}

// ============================================================
// 23. APP RISK AUDITOR
// ============================================================

export interface NativeAppRiskFinding {
    id: string;

    level:
        | 'LOW'
        | 'MEDIUM'
        | 'HIGH'
        | 'CRITICAL';

    summary: string;

    /**
     * Evidence observed from the application package.
     */
    evidence?: string[];

    /**
     * Optional machine-readable rule identifier.
     */
    ruleId?: string;
}

export interface NativeAppRiskReport {
    packageName: string;
    label: string;

    overallRisk:
        | 'LOW'
        | 'MEDIUM'
        | 'HIGH'
        | 'CRITICAL'
        | 'UNKNOWN';

    findings: NativeAppRiskFinding[];

    /**
     * 0–100 only when calculated from verified checks.
     */
    securityScore: number | null;

    analysisType:
        | 'STATIC_PACKAGE_ANALYSIS'
        | 'APPLICATION_HEURISTICS'
        | 'UNKNOWN';

    isVerified: boolean;
}

// ============================================================
// 24. DEVICE HARDENING
// ============================================================

export interface NativeHardeningFinding {
    id: string;

    level:
        | 'GOOD'
        | 'WARNING'
        | 'CRITICAL'
        | 'UNKNOWN';

    summary: string;

    evidence?: string;

    remediation?: string;

    isVerified: boolean;
}

export interface NativeHardeningReport {
    /**
     * Null means the native layer could not produce a trustworthy
     * aggregate score.
     */
    score: number | null;

    findings: NativeHardeningFinding[];

    evaluatedChecks: number;

    unknownChecks: number;

    isScoreVerified: boolean;

    timestamp: number;
}

// ============================================================
// 25. DEVICE MANAGEMENT
// ============================================================

export interface NativeDeviceManagementStatus {
    mode: SecureDroidMode;

    isDeviceOwner: boolean;
    isProfileOwner: boolean;
    isManagedProfile: boolean;

    canManageApplications: boolean;
    canEnforcePolicies: boolean;
    canControlNetworkPolicies: boolean;
    canLockDevice: boolean;
    canWipeDevice: boolean;

    evidence: string[];

    status: CapabilityState;
}

// ============================================================
// 26. SECUREDROID RUNTIME STATUS
// ============================================================

export interface SecureDroidRuntimeStatus {
    connected: boolean;

    mode: SecureDroidMode;

    nativeApiLevel: number;

    capabilities: CapabilitySnapshot;

    timestamp: number;
}
