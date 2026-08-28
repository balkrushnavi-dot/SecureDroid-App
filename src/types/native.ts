/**
 * SecureDroid Native Android Integration Types
 *
 * Contract between:
 * React/TypeScript UI
 *        ↓
 * Capacitor bridge
 *        ↓
 * Kotlin native security layer
 *
 * PRINCIPLES
 * - Never represent UNKNOWN as false.
 * - Never represent DEMO data as real data.
 * - Capability state must be explicit.
 * - Native failures must be distinguishable from unsupported features.
 * - Types must describe evidence and limitations where security claims are made.
 */

// ============================================================
// 0. COMMON RESULT TYPES
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
    | 'DEVICE_OWNER_REQUIRED'
    | 'PROFILE_OWNER_REQUIRED'
    | 'SYSTEM_PRIVILEGE_REQUIRED'
    | 'OS_INTEGRATION_REQUIRED'
    | 'UNKNOWN_ERROR';

export type RuntimePlatform =
    | 'android_native'
    | 'web_preview';

export interface NativeSuccess<T> {
    success: true;
    data: T;
    message?: string;
    recoverable?: boolean;
    isSupported?: boolean;
    runtimePlatform?: RuntimePlatform;
}

export interface NativeFailure {
    success: false;
    errorCode: NativeErrorCode;
    message: string;
    recoverable?: boolean;
    isSupported?: boolean;
    runtimePlatform?: RuntimePlatform;
}

export type NativeResult<T> =
    | NativeSuccess<T>
    | NativeFailure;


// ============================================================
// 1. SECUREDROID MODE
// ============================================================

export type SecureDroidMode =
    | 'NORMAL'
    | 'MANAGED_PROFILE'
    | 'DEVICE_OWNER'
    | 'UNKNOWN';

export type SecurityExecutionLayer =
    | 'APP'
    | 'ANDROID_API'
    | 'DEVICE_POLICY'
    | 'VPN_SERVICE'
    | 'KEYSTORE'
    | 'HARDWARE'
    | 'OS_INTEGRATION'
    | 'SYSTEM';


// ============================================================
// 2. CAPABILITY ENGINE
// ============================================================

export type CapabilityState =
    | 'SUPPORTED'
    | 'LIMITED'
    | 'UNAVAILABLE'
    | 'UNKNOWN'
    | 'REQUIRES_DEVICE_OWNER'
    | 'REQUIRES_SYSTEM_PRIVILEGE'
    | 'REQUIRES_HARDWARE'
    | 'REQUIRES_OS_INTEGRATION'
    | 'REQUIRES_PERMISSION'
    | 'DEMO_ONLY'
    | 'ERROR';

export type CapabilityCategory =
    | 'DEVICE'
    | 'SECURITY'
    | 'PRIVACY'
    | 'NETWORK'
    | 'STORAGE'
    | 'APPLICATIONS'
    | 'MANAGEMENT'
    | 'HARDWARE'
    | 'AUTHENTICATION'
    | 'MONITORING';

export interface SecurityCapability {
    id: string;
    name: string;
    category: CapabilityCategory;

    state: CapabilityState;

    /**
     * Human-readable technical evidence supporting the state.
     */
    evidence: string;

    /**
     * What this capability actually means from a security perspective.
     */
    securityMeaning: string;

    /**
     * Known Android/app limitations.
     */
    limitations: string[];

    /**
     * What the user/admin can do to improve availability.
     */
    remediation?: string;

    /**
     * Component that supplied the result.
     */
    provider: string;

    /**
     * True only when the result represents an actual Android observation.
     */
    isReal: boolean;

    /**
     * Whether SecureDroid itself can change the capability state.
     */
    canAppChange: boolean;

    requiredPrivilege?: string;

    implementationLayer: SecurityExecutionLayer;
}


// ============================================================
// 3. DEVICE CAPABILITY / RUNTIME CONTEXT
// ============================================================

export interface NativeRuntimeContext {
    platform: RuntimePlatform;

    mode: SecureDroidMode;

    androidVersion: string;
    sdkVersion: number;

    isDeviceOwner: boolean;
    isProfileOwner: boolean;
    isManagedProfile: boolean;

    vpnAvailable: boolean;
    biometricAvailable: boolean;

    keystoreAvailable: boolean;
    strongBoxAvailable: boolean;

    secureLockScreenEnabled: boolean;

    capabilities: SecurityCapability[];

    timestamp: number;
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
     * null means Android did not provide reliable evidence.
     */
    bootloaderLocked?: boolean | null;

    kvmVirtualizationSupported?: boolean | null;
}


// ============================================================
// 5. BATTERY
// ============================================================

export type BatteryChargingSource =
    | 'AC'
    | 'USB'
    | 'WIRELESS'
    | 'NONE'
    | 'UNKNOWN';

export type BatteryHealth =
    | 'GOOD'
    | 'OVERHEAT'
    | 'DEAD'
    | 'OVER_VOLTAGE'
    | 'UNSPECIFIED_FAILURE'
    | 'COLD'
    | 'UNKNOWN';

export interface NativeBatteryStatus {
    percentage: number;

    isCharging: boolean;

    chargingSource: BatteryChargingSource;

    health: BatteryHealth;

    temperatureCelsius: number | null;

    voltageMillivolts: number | null;

    currentNowMicroamperes: number | null;

    capacityMicroampereHours: number | null;

    estimatedRemainingMinutes: number | null;
}


// ============================================================
// 6. NETWORK
// ============================================================

export type NetworkConnectionType =
    | 'WIFI'
    | 'CELLULAR'
    | 'ETHERNET'
    | 'BLUETOOTH'
    | 'VPN'
    | 'NONE'
    | 'UNKNOWN';

export interface NativeNetworkState {
    isConnected: boolean;

    connectionType: NetworkConnectionType;

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

export type BiometricType =
    | 'FINGERPRINT'
    | 'FACE'
    | 'IRIS'
    | 'MULTIPLE'
    | 'NONE'
    | 'UNKNOWN';

export interface NativeBiometricStatus {
    isAvailable: boolean;

    biometricType: BiometricType;

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

export interface PermissionStatus {
    granted: boolean;
    canRequest: boolean;
    shouldShowRationale: boolean;
}

export interface PermissionStatusMap {
    [permission: string]: PermissionStatus;
}


// ============================================================
// 12. INSTALLED APPLICATIONS
// ============================================================

export interface NativeInstalledApp {
    packageName: string;
    label: string;
    appName?: string;

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
// 17. SECURITY DASHBOARD
// ============================================================

export type SecurityCheckCategory =
    | 'OS_INTEGRITY'
    | 'DEVICE_ENCRYPTION'
    | 'AUTHENTICATION'
    | 'PERMISSIONS'
    | 'NETWORK'
    | 'DEBUGGING';

export type SecurityCheckStatus =
    | 'PASSED'
    | 'WARNING'
    | 'FAILED'
    | 'INFO'
    | 'UNKNOWN'
    | 'UNAVAILABLE';

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
}

export interface SecureStorageCapability {
    available: boolean;

    hardwareBacked: boolean;

    strongBoxBacked: boolean;

    algorithm: string;

    keyAlias?: string;

    evidence: string;

    isReal: boolean;
}


// ============================================================
// 19. SECURITY AUDIT LOG
// ============================================================

export type SecurityEventCategory =
    | 'PERMISSION'
    | 'AUTH'
    | 'NETWORK'
    | 'SCAN'
    | 'CONFIG'
    | 'AUDIT'
    | 'EMERGENCY'
    | 'BACKUP';

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
        string | number | boolean | null
    >;
}


// ============================================================
// 20. VPN
// ============================================================

export type VpnFilterMode =
    | 'BLOCKLIST'
    | 'STRICT'
    | 'ALLOWLIST'
    | 'DISABLED';

export interface NativeVpnStatus {
    isActive: boolean;
    state?: string;

    establishedTime?: number;

    bytesReceived: number;
    bytesTransmitted: number;

    blockedDomainsCount: number;

    activeDns: string;

    filterMode: VpnFilterMode;
}


// ============================================================
// 21. THREAT DETECTION
// ============================================================

export type ThreatSeverity =
    | 'CRITICAL'
    | 'HIGH'
    | 'MEDIUM'
    | 'LOW';

export interface ThreatFinding {
    id: string;

    ruleId: string;

    title: string;

    description: string;

    severity: ThreatSeverity;

    affectedPackage?: string;

    evidence: string[];

    recommendation: string;

    isReal: boolean;
}

export type OverallThreatRisk =
    | 'SAFE'
    | 'LOW_RISK'
    | 'MODERATE_RISK'
    | 'HIGH_RISK'
    | 'CRITICAL_RISK'
    | 'UNKNOWN';

export interface ThreatAssessmentReport {
    timestamp: number;

    scannedAppsCount: number;

    overallRiskLevel: OverallThreatRisk;

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
// 22. BACKUP / RESTORE
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

export type VmBackendType =
    | 'ARM_PKVM'
    | 'KVM_DEVICE'
    | 'RESTRICTED_SANDBOX'
    | 'UNAVAILABLE';

export interface VmHardwareCapability {
    isSupported: boolean;

    backendType: VmBackendType;

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

    /**
     * Stable machine-readable rule code.
     */
    code?: string;

    /**
     * Display title.
     */
    title?: string;

    level: AppRiskLevel;

    summary: string;

    description?: string;

    severity?: SecuritySeverity;

    points?: number;
}

export interface NativeAppRiskReport {
    packageName: string;

    label: string;

    overallRisk: AppRiskLevel;

    securityScore?: number;

    findingCount?: number;

    findings: NativeAppRiskFinding[];

    reason?: string;

    installSource?: string;

    isSystemApp?: boolean;

    isReal: boolean;
}


// ============================================================
// 25. DEVICE HARDENING
// ============================================================

export type HardeningFindingLevel =
    | 'GOOD'
    | 'WARNING'
    | 'CRITICAL'
    | 'UNKNOWN'
    | 'UNAVAILABLE';

export interface NativeHardeningFinding {
    id: string;

    level: HardeningFindingLevel;

    summary: string;

    details?: string;

    evidence?: string;

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
// 26. CONNECTION
// ============================================================

export interface NativeConnectionStatus {
    connected: boolean;

    message?: string;

    pluginVersion?: string;

    androidApiLevel?: number;

    mode?: SecureDroidMode;

    isReal: boolean;
}


// ============================================================
// 27. SCAN RESULT
// ============================================================

export interface NativeScanResult {
    scanId: string;

    timestamp: number;

    appsScanned: number;

    findingsCount: number;

    riskLevel: OverallThreatRisk;

    durationMs?: number;

    report?: ThreatAssessmentReport;

    isReal: boolean;
}


// ============================================================
// 28. DEMO / MOCK IDENTIFICATION
// ============================================================

/**
 * Every native-facing object that can reach the UI should be
 * identifiable as real or non-real.
 */
export interface DataProvenance {
    isReal: boolean;

    source:
        | 'ANDROID_NATIVE'
        | 'CAPACITOR'
        | 'WEB_PREVIEW'
        | 'DEMO'
        | 'UNKNOWN';

    collectedAt: number;

    provider?: string;

    evidence?: string;
}


// ============================================================
// 29. GENERIC SECURITY OBSERVATION
// ============================================================

export interface SecurityObservation {
    id: string;

    name: string;

    value: string | number | boolean | null;

    status:
        | 'VERIFIED'
        | 'SUPPORTED'
        | 'UNKNOWN'
        | 'WARNING'
        | 'UNAVAILABLE';

    evidence: string;

    limitation?: string;

    isReal: boolean;

    timestamp: number;
}

export interface CapabilityReport {
    capabilities: SecurityCapability[];
    timestamp: number;
    isReal: boolean;
}

export interface DeviceManagementStatus {
    isDeviceOwner: boolean;
    isProfileOwner: boolean;
    isManagedProfile: boolean;
    isReal: boolean;
}

export interface NativeServiceHealth {
    healthy: boolean;
    servicesRunning: number;
    isReal: boolean;
}

export interface SecurityEngineStatus {
    active: boolean;
    version: string;
    isReal: boolean;
}

export interface WifiSecurityReport {
    ssid?: string;
    isSecure: boolean;
    securityType?: string;
    isReal: boolean;
}

