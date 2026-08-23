export type CapabilityCategory =
  | 'PLATFORM'
  | 'VIRTUALIZATION'
  | 'CRYPTOGRAPHY'
  | 'STORAGE'
  | 'NETWORK'
  | 'SANDBOX'
  | 'GUEST_INTEGRITY'
  | 'PRIVACY'
  | 'SYSTEM_INTEGRITY';

export type PermissionCategory =
  | 'CAMERA'
  | 'MIC'
  | 'MICROPHONE'
  | 'LOCATION'
  | 'CONTACTS'
  | 'CALENDAR'
  | 'FILES'
  | 'PHONE'
  | 'SMS'
  | 'NOTIFICATIONS'
  | 'SENSORS'
  | 'NEARBY_DEVICES'
  | 'CLIPBOARD'
  | 'STORAGE';

export type CapabilityState =
  | 'SUPPORTED'
  | 'PARTIAL'
  | 'UNSUPPORTED'
  | 'UNKNOWN'
  | 'DEMO'
  | 'DESIGN_ONLY'
  | 'REQUIRES_PERMISSION'
  | 'REQUIRES_DEVICE_OWNER'
  | 'REQUIRES_SYSTEM_APP'
  | 'REQUIRES_FRAMEWORK'
  | 'REQUIRES_SYSTEM_SERVER'
  | 'REQUIRES_KERNEL'
  | 'REQUIRES_HYPERVISOR'
  | 'REQUIRES_FIRMWARE'
  | 'REQUIRES_HARDWARE';

export type SystemLayer =
  | 'APPLICATION'
  | 'SYSTEM_APP'
  | 'FRAMEWORK'
  | 'SYSTEM_SERVER'
  | 'NATIVE_SERVICE'
  | 'KERNEL'
  | 'HYPERVISOR'
  | 'FIRMWARE'
  | 'HARDWARE';

export type PlatformRequirementTag =
  | 'APPLICATION LEVEL AVAILABLE'
  | 'REQUIRES SYSTEM PRIVILEGE'
  | 'REQUIRES FRAMEWORK MODIFICATION'
  | 'REQUIRES SYSTEM SERVER SERVICE'
  | 'REQUIRES KERNEL SUPPORT'
  | 'REQUIRES HYPERVISOR SUPPORT'
  | 'REQUIRES PLATFORM / FIRMWARE SUPPORT'
  | 'REQUIRES HARDWARE SUPPORT';

export type ProviderType =
  | 'DemoCapabilityProvider'
  | 'AndroidCapabilityProvider'
  | 'SecureDroidSystemProvider';

export type ImplementationStatus =
  | 'IMPLEMENTED'
  | 'PROTOTYPE'
  | 'REQUIRES INTEGRATION'
  | 'UNAVAILABLE';

export interface ArchitectureRegistryItem {
  id: string;
  feature: string;
  category: 'CORE' | 'SECURITY' | 'PRIVACY' | 'VIRTUALIZATION' | 'STORAGE' | 'NETWORK' | 'UPDATE';
  layer: SystemLayer;
  status: ImplementationStatus;
  description: string;
  aospTargetLocation: string;
  requiredDependency: string;
  evidence: string;
}

export type QualitativeSecurityTier =
  | 'PROTECTED'
  | 'ATTENTION_REQUIRED'
  | 'DEGRADED'
  | 'UNKNOWN'
  | 'HARDWARE-BACKED'
  | 'ISOLATED'
  | 'HARDENED'
  | 'STANDARD';

export type SecurityTier =
  | 'HARDWARE_STRONGBOX'
  | 'HARDWARE_TEE'
  | 'TRUSTED_ENVIRONMENT'
  | 'STRONGBOX'
  | 'SOFTWARE_EMULATED'
  | 'UNAVAILABLE'
  | 'UNKNOWN';

export type HostSecurityStatus = 'PROTECTED' | 'ATTENTION_REQUIRED' | 'DEGRADED' | 'UNKNOWN' | 'SECURE' | 'WARNING';

export interface SecurityScoreFormula {
  virtualizationIsolation: number;
  storageEncryption: number;
  hardwareKeyProtection: number;
  guestIntegrity: number;
  networkIsolation: number;
  appSandbox: number;
  privacyControls: number;
  total: number;
  calculatedLevel: number;
  qualitativeTier: QualitativeSecurityTier;
  hostStatus: HostSecurityStatus;
  statusRationale: string;
  unverifiedDeductions: string[];
}

export type VirtualizationBackendType =
  | 'Protected VM (pKVM)'
  | 'Hardware-assisted KVM'
  | 'Android Virtualization Framework (AVF)'
  | 'Software Emulation'
  | 'Container Sandbox'
  | 'Unavailable'
  | 'Unknown';

export interface FullCapabilityModel {
  id: string;
  name: string;
  category: CapabilityCategory;
  state: CapabilityState;
  provider: ProviderType;
  evidence: string;
  securityMeaning: string;
  details?: string;
  technicalProbe?: string;
  platformRequirement?: string;
  requiredChanges?: string;
  systemLayer?: SystemLayer;
  securityImpact?: string;
  requiredPermission?: string;
  requiredPrivilege?: string;
  requiredFramework?: string;
  requiredSystemApp?: string;
  requiredKernel?: string;
  requiredHypervisor?: string;
  requiredFirmware?: string;
  requiredHardware?: string;
  implementationLayer: SystemLayer;
  limitations: string;
  remediation: string;
  canAppChange?: boolean;
  pocoSpecificNote?: string;
  isDemo?: boolean;
}

// Alias for legacy components
export type CapabilityItem = FullCapabilityModel;

export type VmStateEnum =
  | 'UNINITIALIZED'
  | 'PROVISIONING'
  | 'STOPPED'
  | 'STARTING'
  | 'RUNNING'
  | 'PAUSED'
  | 'LOCKED'
  | 'PANIC_LOCKED'
  | 'ERROR'
  | 'DESTROYED';

export type VmInstanceState = 'STOPPED' | 'STARTING' | 'RUNNING' | 'STOPPING' | 'PAUSED' | 'ERROR' | 'UNAVAILABLE';

export type NetworkPolicyMode = 'OFFLINE' | 'INTERNET' | 'VPN_ONLY' | 'RESTRICTED' | 'ISOLATED' | 'HOST_ISOLATED';

export type NetworkAccessLevel = 'ALLOW' | 'DENY' | 'VPN_ONLY';

export type PermissionGrantState = 'GRANTED' | 'DENIED' | 'ASK_EVERY_TIME' | 'COARSE_ONLY';

export interface VmStorageInfo {
  usedGb: number;
  maximumGb: number;
  hostFreeSpaceGb: number;
  safetyReserveGb: number; // 20.0 GB strictly enforced
  safeGrowthGb: number;
  sparseAllocationActive: boolean;
}

export interface VmMetrics {
  cpuUsagePercent: number;
  allocatedRamMb: number;
  usedRamMb: number;
  totalStorageGb: number;
  sparseAllocatedStorageGb: number;
  hostFreeStorageGb: number;
  hostSafetyReserveGb: number;
  networkState: NetworkPolicyMode;
  uptimeSeconds: number;
  thermalStatus: 'NORMAL' | 'WARM' | 'THROTTLED' | 'CRITICAL';
}

export interface CodeFile {
  path: string;
  filename: string;
  category: 'gradle' | 'manifest' | 'core' | 'ui' | 'test' | 'res' | 'service' | 'framework';
  language: 'kotlin' | 'groovy' | 'xml' | 'toml' | 'markdown';
  content: string;
  description: string;
}

export interface DeviceProfile {
  id: string;
  name: string;
  deviceModel?: string;
  isReferenceDevice?: boolean;
  manufacturer: string;
  model: string;
  chipset: string;
  arch: string;
  androidVersion: string;
  kernelVersion: string;
  totalRamGb: number;
  totalStorageGb: number;
  availableStorageGb: number;
  kvmNodePresent: boolean;
  avfPackagePresent: boolean;
  microdroidPresent: boolean;
  protectedVmSupported: boolean;
  keyMintSecurityLevel: SecurityTier;
  strongBoxPresent: boolean;
  verifiedBootState: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'UNKNOWN';
  selinuxMode: 'ENFORCING' | 'PERMISSIVE' | 'DISABLED' | 'UNKNOWN';
  deviceOwnerActive: boolean;
  notes: string;
}

export interface SecurityCategoryAudit {
  id: string;
  title: string;
  category: CapabilityCategory;
  status: 'PASS' | 'WARNING' | 'UNAVAILABLE' | 'UNKNOWN';
  systemLayer: SystemLayer;
  platformRequirement: PlatformRequirementTag;
  summary: string;
  probes: {
    name: string;
    status: 'PASS' | 'WARNING' | 'UNAVAILABLE' | 'UNKNOWN';
    evidence: string;
    details: string;
    systemLayer?: SystemLayer;
    platformRequirement?: PlatformRequirementTag;
  }[];
}

export interface AppSandboxInfo {
  packageName: string;
  name: string;
  version: string;
  iconType: 'browser' | 'messaging' | 'files' | 'camera' | 'banking' | 'system' | 'settings' | 'security' | 'privacy' | 'vm' | 'calculator' | 'gallery';
  uid: number;
  selinuxDomain: string;
  isSystemApp: boolean;
  isPaused?: boolean;
  networkAccess: NetworkAccessLevel;
  backgroundActivity: 'RESTRICTED' | 'OPTIMIZED' | 'UNRESTRICTED';
  scopedStorage: boolean;
  installationSource: 'SYSTEM_IMAGE' | 'VERIFIED_STORE' | 'SIDELOADED' | 'UNKNOWN';
  storageUsedMb: number;
  batteryUsagePercent: number;
  permissions: {
    camera: PermissionGrantState;
    microphone: PermissionGrantState;
    location: PermissionGrantState;
    contacts: PermissionGrantState;
    sensors: PermissionGrantState;
    notifications: PermissionGrantState;
    files?: PermissionGrantState;
    phone?: PermissionGrantState;
    sms?: PermissionGrantState;
    clipboard?: PermissionGrantState;
  };
}

export interface GuestImageInfo {
  id: string;
  name: string;
  version: string;
  buildId: string;
  sha256: string;
  signatureState: 'VERIFIED' | 'UNVERIFIED' | 'INVALID';
  signingKeyAlias: string;
  rollbackIndex: number;
  source: string;
  sizeMb: number;
  isDefault?: boolean;
}

export type GuestOsImage = GuestImageInfo;

export interface VmSnapshot {
  id: string;
  name: string;
  createdAt: string;
  timestamp?: string;
  guestVersion: string;
  sizeMb: number;
  sha256: string;
  status: 'READY' | 'RESTORING' | 'CORRUPTED';
  note: string;
}

export interface SystemUpdateInfo {
  osVersion: string;
  securityPatchLevel: string;
  buildNumber: string;
  channel: 'Stable' | 'Security Hardened';
  slot: 'A' | 'B';
  updateStatus: 'UP_TO_DATE' | 'UPDATE_AVAILABLE' | 'VERIFYING' | 'READY_TO_INSTALL';
  lastCheckedTime: string;
}

export interface SensorAccessLogItem {
  id: string;
  timestamp: string;
  appName: string;
  packageName: string;
  uid: number;
  sensor?: 'CAMERA' | 'MIC' | 'LOCATION' | 'SENSORS' | 'CLIPBOARD' | 'CONTACTS' | 'FILES';
  sensorType?: 'CAMERA' | 'MIC' | 'LOCATION' | 'SENSORS' | 'CLIPBOARD' | 'CONTACTS' | 'FILES';
  actionTaken?: 'AUTHORIZED' | 'BLOCKED';
  wasAllowed?: boolean;
  details?: string;
  isDemo?: boolean;
}

export interface PrivacyCenterState {
  cameraKillSwitch: boolean;
  micKillSwitch: boolean;
  sensorKillSwitch: boolean;
  clipboardAccessAlerts?: boolean;
  clipboardReadAlerts?: boolean;
  clipboardProtection?: boolean;
  activeCameraApps: string[];
  activeMicApps: string[];
  activeLocationApps: string[];
  accessLog: SensorAccessLogItem[];
}

export interface KillSwitchStates {
  cameraBlocked: boolean;
  microphoneBlocked: boolean;
  locationBlocked: boolean;
  sensorsBlocked: boolean;
}

export interface SensorAuditLog {
  id: string;
  timestamp: string;
  sensor: 'Camera' | 'Microphone' | 'Location' | 'Sensors' | 'Clipboard';
  packageName: string;
  action: 'AUTHORIZED' | 'BLOCKED';
  details: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  appName: string;
  timestamp: string;
  category: 'SECURITY' | 'PRIVACY' | 'SYSTEM' | 'COMMUNICATION' | 'UPDATE';
  isSensitive?: boolean;
  isDismissible?: boolean;
  isDemo?: boolean;
  actionLabel?: string;
  actionTargetScreen?: string;
}

export type ThemeMode = 'dark' | 'light' | 'system';
export type AccentColor = 'slate' | 'sage' | 'steel' | 'sand' | 'graphite' | 'emerald' | 'sapphire' | 'amber' | 'amethyst';
export type NavigationMode = '3-button' | 'gesture' | 'native_mobile';

export type SystemScreen =
  // Level 1: Normal System
  | 'lockscreen'
  | 'homescreen'
  | 'app_drawer'
  | 'recents'
  | 'search'
  // Settings hierarchy
  | 'settings'
  | 'settings_network'
  | 'settings_connected'
  | 'settings_usb'
  | 'settings_apps'
  | 'settings_app_detail'
  | 'settings_notifications'
  | 'settings_battery'
  | 'settings_storage'
  | 'settings_sound'
  | 'settings_display'
  | 'settings_wallpaper'
  | 'settings_navigation'
  | 'settings_install_app'
  | 'settings_security_privacy'
  | 'settings_lockdown'
  | 'settings_location'
  | 'settings_users'
  | 'settings_accessibility'
  | 'settings_system'
  | 'settings_about'
  | 'settings_compatibility'
  // Level 2: Security & Privacy Centers
  | 'security_center'
  | 'privacy_center'
  | 'permission_manager'
  | 'app_sandbox'
  | 'network_controls'
  | 'secure_environment'
  | 'guest_images'
  | 'snapshots'
  | 'system_updates'
  | 'lockdown_screen'
  | 'usb_security'
  // Missing Feature Pack Screens (Points 1-30)
  | 'advanced_protection'
  | 'exploit_protection'
  | 'device_security_state'
  | 'authentication_center'
  | 'duress_credentials'
  | 'authentication_duress'
  | 'emergency_protection'
  | 'theft_protection'
  | 'application_verification'
  | 'app_verification'
  | 'securedroid_store'
  | 'browser_security'
  | 'browser_web_security'
  | 'webview_security'
  | 'sensor_privacy_complete'
  | 'complete_sensor_privacy'
  | 'network_privacy_center'
  | 'certificates_trust'
  | 'certificates_passkeys'
  | 'passkeys_security_keys'
  | 'backup_restore'
  | 'backup_restore_security'
  | 'security_audit_log'
  | 'threat_model_center'
  | 'security_profiles'
  | 'security_posture_profiles'
  | 'developer_security'
  | 'developer_debug_security'
  | 'supply_chain_security'
  | 'firmware_security'
  | 'physical_attack_protection'
  | 'security_notifications'
  // Level 3: Advanced Diagnostics
  | 'advanced_diagnostics'
  | 'capability_engine'
  | 'threat_model'
  | 'codebase'
  | 'poco_guide'
  | 'architecture_registry';

// ----------------------------------------------------
// Security Event Severity & Audit Models (Points 19, 26)
// ----------------------------------------------------
export type SecurityEventSeverity = 'INFO' | 'NOTICE' | 'WARNING' | 'HIGH' | 'CRITICAL';
export type SecurityEventSource = 'REAL EVENT' | 'DEMO EVENT' | 'SYSTEM EVENT';

export interface SecurityAuditEvent {
  id: string;
  timestamp: string;
  category: 'SECURITY' | 'PRIVACY' | 'APPLICATIONS' | 'NETWORK' | 'USB' | 'AUTHENTICATION' | 'SECURE_ENVIRONMENT';
  severity: SecurityEventSeverity;
  title: string;
  explanation: string;
  source: SecurityEventSource;
  action: string;
  evidence: string;
  layer?: SystemLayer;
}

// ----------------------------------------------------
// Advanced Protection Mode & Postures (Points 1, 22)
// ----------------------------------------------------
export type ProtectionLevel = 'Standard' | 'Enhanced' | 'Maximum';
export type ProtectionStatus =
  | 'Enabled'
  | 'Available'
  | 'Unavailable'
  | 'Requires SecureDroid OS'
  | 'Requires Hardware'
  | 'Requires Kernel'
  | 'Requires AOSP';

export interface IndividualProtectionItem {
  id: string;
  name: string;
  description: string;
  status: ProtectionStatus;
  layer: SystemLayer;
  requirement: string;
  limitation: string;
  isEnforcedInApk: boolean;
  category: string;
}

export interface SecurityPostureProfile {
  id: string;
  name: 'Balanced' | 'Privacy' | 'Hardened' | 'Maximum' | 'Custom';
  tagline: string;
  description: string;
  activeProtectionsCount: number;
  totalProtectionsCount: number;
  enforcedPolicies: string[];
  platformRequirements: string[];
  realWorldImpact: string;
  autoReboot?: string;
  sensors?: string;
  usb?: string;
  exploitMitigations?: string;
}

// ----------------------------------------------------
// Device Security State (BFU / AFU) (Point 4)
// ----------------------------------------------------
export type DeviceSecurityStateType =
  | 'BEFORE_FIRST_UNLOCK'
  | 'AFTER_FIRST_UNLOCK'
  | 'LOCKED'
  | 'UNLOCKED'
  | 'REBOOT_PENDING'
  | 'LOCKDOWN';

export interface StateSecurityProperty {
  propertyName: string;
  status: 'ACTIVE' | 'DISABLED' | 'LOCKED' | 'EPHEMERAL';
  description: string;
  technicalMechanism: string;
  layer: SystemLayer;
}

// ----------------------------------------------------
// Exploit Protection & Auto Reboot (Points 2, 3)
// ----------------------------------------------------
export type AutoRebootOption =
  | 'Disabled'
  | '10 minutes'
  | '30 minutes'
  | '1 hour'
  | '4 hours'
  | '12 hours'
  | '18 hours'
  | '24 hours'
  | '72 hours';

export interface ExploitProtectionItem {
  id: string;
  name: string;
  status: 'SUPPORTED' | 'PARTIAL' | 'UNAVAILABLE' | 'REQUIRES KERNEL' | 'REQUIRES HARDWARE' | 'REQUIRES AOSP';
  evidence: string;
  securityPurpose: string;
  limitation: string;
  requirement: string;
  layer: SystemLayer;
}

// ----------------------------------------------------
// Threat Model Scenario (Point 20)
// ----------------------------------------------------
export type ThreatProtectionStatus =
  | 'PROTECTED'
  | 'PARTIALLY PROTECTED'
  | 'NOT PROTECTED'
  | 'REQUIRES HARDWARE'
  | 'REQUIRES SECUREDROID OS'
  | 'UNKNOWN';

export interface ThreatScenarioItem {
  id: string;
  title: string;
  scenario: string;
  status: ThreatProtectionStatus;
  why: string;
  evidence: string;
  limitation: string;
  requirement: string;
  mitigatingControls: string[];
}

// ----------------------------------------------------
// Security Transparency "Why is this secure?" (Point 21)
// ----------------------------------------------------
export interface SecurityTransparencyClaim {
  id: string;
  title: string;
  status: 'SUPPORTED' | 'PARTIAL' | 'UNAVAILABLE' | 'REQUIRES HARDWARE' | 'REQUIRES SECUREDROID OS';
  claim: string;
  evidence: string;
  implementation: string;
  limitation: string;
  requirement: string;
}

// ----------------------------------------------------
// App Verification & SecureDroid Store (Points 10, 11)
// ----------------------------------------------------
export interface InstalledAppVerificationDetail {
  packageName: string;
  applicationName: string;
  version: string;
  targetSdk: number;
  minSdk: number;
  installationSource: 'SYSTEM_IMAGE' | 'VERIFIED_STORE' | 'SIDELOADED' | 'UNKNOWN';
  signer: string;
  signingCertificate: string;
  certificateFingerprintSha256: string;
  signatureState: 'VERIFIED_MATCH' | 'CUSTOM_DEV_KEY' | 'UNVERIFIED_SIGNATURE';
  debuggableState: boolean;
  exportedComponentsCount: number;
  dangerousPermissions: string[];
  accessibilityServiceActive: boolean;
  deviceAdminActive: boolean;
  integrityState: 'INTEGRITY_VERIFIED' | 'TAMPER_WARNING' | 'SUSPICIOUS_PROPERTIES';
  securityWarnings: string[];
}

export interface StoreRepositoryApp {
  id: string;
  name: string;
  packageName: string;
  installedVersion?: string;
  availableVersion: string;
  developerIdentity: string;
  signingCertificateSha256: string;
  permissions: string[];
  privacySummary: string;
  updateChannel: 'Stable' | 'Security Hardened' | 'Beta';
  securityStatus: 'VERIFIED' | 'REVIEWED' | 'COMMUNITY';
  reproducibleBuild: boolean;
  reproducibleBuildEvidence?: string;
  sandboxedPlayCompatible: boolean;
  description: string;
  sizeMb: number;
}

// ----------------------------------------------------
// Complete Sensor Privacy (Point 14)
// ----------------------------------------------------
export type ExtendedSensorType =
  | 'Camera'
  | 'Microphone'
  | 'Location'
  | 'Accelerometer'
  | 'Gyroscope'
  | 'Magnetometer'
  | 'Barometer'
  | 'Proximity'
  | 'Ambient Light'
  | 'Step Counter'
  | 'Biometrics'
  | 'Bluetooth Scanning'
  | 'Wi-Fi Scanning'
  | 'NFC'
  | 'UWB'
  | 'Nearby Devices'
  | 'Clipboard';

export interface ExtendedSensorLogEvent {
  id: string;
  timestamp: string;
  appName: string;
  packageName: string;
  sensor: ExtendedSensorType;
  action: 'AUTHORIZED' | 'BLOCKED';
  status: 'ALLOWED_FOREGROUND' | 'KILLED_BACKGROUND' | 'MUTED_KILLSWITCH' | 'RESTRICTED_POLICY';
  source: 'REAL EVENT' | 'DEMO EVENT' | 'SYSTEM EVENT';
  details: string;
}

// ----------------------------------------------------
// Certificates & Passkeys (Points 16, 17)
// ----------------------------------------------------
export interface CertificateTrustItem {
  id: string;
  alias: string;
  subject: string;
  issuer: string;
  isSystemCertificate: boolean;
  expirationDate: string;
  sha256Fingerprint: string;
  trustState: 'SYSTEM_TRUSTED' | 'USER_INSTALLED_WARNING' | 'EXPIRED' | 'UNTRUSTED';
  keyAlgorithm: string;
  details: string;
  warning?: string;
}

export interface PasskeySecurityItem {
  id: string;
  rpId: string;
  rpName: string;
  userName: string;
  credentialType: 'PASSKEY' | 'FIDO2' | 'HARDWARE_KEY';
  hardwareBackedStatus: 'HARDWARE_BACKED' | 'STRONGBOX' | 'SOFTWARE_EMULATED' | 'UNAVAILABLE';
  keyMintSecurityLevel: SecurityTier;
  createdAt: string;
  lastUsed: string;
}

// ----------------------------------------------------
// Backup & Emergency Data Models (Points 5, 6, 18)
// ----------------------------------------------------
export interface BackupSecurityModel {
  isBackupEncrypted: boolean;
  backupDestination: 'ENCRYPTED_USB' | 'LOCAL_ISOLATED_STORAGE' | 'SELF_HOSTED_E2EE';
  backupContents: string[];
  encryptionMechanism: string;
  lastVerifiedDate: string;
  restoreVerificationStatus: 'VERIFIED' | 'UNTESTED' | 'FAILED';
  snapshotVsBackupNote: string;
  disasterRecoveryNote: string;
}

export interface EmergencyActionItem {
  id: string;
  title: string;
  actionType: 'LOCKDOWN' | 'VM_SHUTDOWN' | 'PROFILE_SHUTDOWN' | 'PROFILE_WIPE' | 'SECUREDROID_WIPE' | 'FACTORY_RESET' | 'EMERGENCY_REBOOT';
  description: string;
  whatWillBeDeleted: string;
  whatWillRemain: string;
  isRecoveryPossible: boolean;
  areEncryptionKeysDestroyed: boolean;
  requiredPrivilege: 'USER' | 'DEVICE_OWNER' | 'SYSTEM_PRIVILEGED' | 'HARDWARE_RESET';
  realDeviceRequirement: string;
}

// ----------------------------------------------------
// Complete Domain Models (Section 50)
// ----------------------------------------------------

export interface DeviceState {
  manufacturer: string;
  model: string;
  marketingName: string;
  androidVersion: string;
  apiLevel: number;
  abi: string;
  cpuArchitecture: string;
  cpuCores: number;
  ramTotalMb: number;
  ramAvailableMb: number;
  storageTotalGb: number;
  storageAvailableGb: number;
  batteryLevel: number;
  isCharging: boolean;
  displayResolution: string;
  refreshRateHz: number;
  isBiometricsAvailable: boolean;
  biometricType: 'FINGERPRINT' | 'FACE' | 'NONE';
  isKeyMintAvailable: boolean;
  keyMintSecurityLevel: SecurityTier;
  isStrongBoxAvailable: boolean;
  isSecureLockScreenConfigured: boolean;
  isDeviceOwner: boolean;
  isProfileOwner: boolean;
  isVpnActive: boolean;
  privateDnsMode: 'OFF' | 'AUTOMATIC' | 'STRICT';
  privateDnsHost: string;
  usbState: 'DISCONNECTED' | 'CHARGING' | 'MTP' | 'ADB' | 'RESTRICTED';
  networkType: 'WIFI' | 'CELLULAR_5G' | 'CELLULAR_4G' | 'OFFLINE';
  isCameraHardwareAvailable: boolean;
  isMicHardwareAvailable: boolean;
  isVirtualizationSupported: boolean;
  virtualizationBackend: VirtualizationBackendType;
  isDemoData: boolean;
}

export interface SecurityState {
  overallTier: QualitativeSecurityTier;
  statusRationale: string;
  verifiedBootState: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'UNKNOWN';
  bootloaderLocked: boolean;
  rollbackProtectionActive: boolean;
  systemIntegrityState: 'VERIFIED' | 'MODIFIED' | 'TAMPERED' | 'UNKNOWN';
  kernelIntegrityState: 'ENFORCING' | 'PERMISSIVE' | 'UNKNOWN';
  selinuxMode: 'ENFORCING' | 'PERMISSIVE' | 'DISABLED';
  securityPatchDate: string;
  encryptionState: 'HARDWARE_WRAPPED_FBE' | 'SOFTWARE_FBE' | 'DISABLED';
  keyProtectionType: SecurityTier;
  strongBoxState: 'UNAVAILABLE_HARDWARE' | 'AVAILABLE' | 'NOT_DETECTED';
  networkFirewallEnforced: boolean;
  lockdownActive: boolean;
  usbDataRestrictedWhenLocked: boolean;
  unverifiedDeductions: string[];
}

export interface PrivacyState {
  cameraKillSwitch: boolean;
  micKillSwitch: boolean;
  sensorKillSwitch: boolean;
  clipboardProtection: boolean;
  activeSensors: {
    camera: boolean;
    microphone: boolean;
    location: boolean;
  };
  recentAccessEvents: SensorAccessLogItem[];
}

export interface NetworkState {
  wifiConnected: boolean;
  wifiSsid: string;
  cellularActive: boolean;
  cellularType: '5G NSA' | '5G SA' | 'LTE-A' | 'NONE';
  airplaneMode: boolean;
  vpnActive: boolean;
  vpnOnlyMode: boolean;
  vpnProvider: string;
  privateDnsMode: 'STRICT' | 'AUTOMATIC' | 'OFF';
  privateDnsProvider: string;
  hotspotActive: boolean;
  firewallEnforcementAvailable: boolean;
  blockedAppsCount: number;
}

export interface StorageState {
  totalGb: number;
  usedGb: number;
  availableGb: number;
  systemGb: number;
  appsGb: number;
  mediaGb: number;
  vmAllocatedGb: number;
  vmUsedGb: number;
  safetyReserveGb: number; // strictly 20.0 GB
  canAllocateVmStorage: boolean;
}

export interface VmState {
  instanceState: VmInstanceState;
  guestName: string;
  guestVersion: string;
  guestSha256: string;
  signatureState: 'VERIFIED' | 'UNVERIFIED' | 'INVALID';
  metrics: VmMetrics;
  storage: VmStorageInfo;
  networkMode: NetworkPolicyMode;
  activeSnapshot: string | null;
  snapshots: VmSnapshot[];
  availableImages: GuestImageInfo[];
}

export interface UpdateState {
  currentVersion: string;
  androidBase: string;
  securityPatch: string;
  channel: 'Stable' | 'Security Hardened';
  activeSlot: 'A' | 'B';
  updateStatus: 'UP_TO_DATE' | 'UPDATE_AVAILABLE' | 'DOWNLOADING' | 'VERIFYING' | 'READY_TO_INSTALL';
  availableVersion?: string;
  releaseNotes?: string[];
  lastChecked: string;
}

export interface UserProfileState {
  currentUserId: number;
  currentUserName: string;
  userType: 'OWNER' | 'SECONDARY' | 'GUEST' | 'PRIVATE_PROFILE';
  isGuestActive: boolean;
  isPrivateProfileLocked: boolean;
  profiles: {
    id: number;
    name: string;
    type: 'OWNER' | 'SECONDARY' | 'GUEST' | 'PRIVATE_PROFILE';
    isEncrypted: boolean;
  }[];
}
