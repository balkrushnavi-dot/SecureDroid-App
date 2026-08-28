/**
 * SecureDroid Capability Model
 *
 * Security rule:
 * A capability must never be presented as available merely because
 * the UI expects it. Its state must be backed by runtime evidence.
 */

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

export type CapabilityCategory =
    | 'DEVICE'
    | 'SECURITY'
    | 'APPLICATION'
    | 'NETWORK'
    | 'STORAGE'
    | 'PRIVACY'
    | 'MANAGEMENT'
    | 'HARDWARE'
    | 'MONITORING';

export type RequiredPrivilege =
    | 'NONE'
    | 'RUNTIME_PERMISSION'
    | 'SPECIAL_PERMISSION'
    | 'VPN_SERVICE'
    | 'DEVICE_ADMIN'
    | 'PROFILE_OWNER'
    | 'DEVICE_OWNER'
    | 'SYSTEM_PRIVILEGE'
    | 'ROOT'
    | 'HARDWARE'
    | 'OS_INTEGRATION';

export type ImplementationLayer =
    | 'WEB'
    | 'CAPACITOR'
    | 'ANDROID_APP'
    | 'ANDROID_ENTERPRISE'
    | 'ANDROID_SYSTEM'
    | 'HARDWARE';

export interface CapabilityEvidence {
    source: string;
    value: string | number | boolean;
    timestamp: number;
    verified: boolean;
}

export interface SecureDroidCapability {
    id: string;
    name: string;
    description: string;

    category: CapabilityCategory;
    state: CapabilityState;

    /**
     * Security-critical explanation of why this state exists.
     */
    evidence: CapabilityEvidence[];

    /**
     * What this capability actually means.
     */
    securityMeaning: string;

    /**
     * What SecureDroid cannot do even when this capability exists.
     */
    limitations: string[];

    /**
     * What the user can do to enable/improve it.
     */
    remediation?: string[];

    provider: string;

    /**
     * MUST be false for simulated/demo capabilities.
     */
    isReal: boolean;

    /**
     * Whether SecureDroid itself can change the capability.
     */
    canAppChange: boolean;

    requiredPrivilege: RequiredPrivilege;
    implementationLayer: ImplementationLayer;
}

export interface CapabilitySnapshot {
    timestamp: number;

    mode: SecureDroidMode;

    androidVersion: string;
    sdkVersion: number;

    capabilities: SecureDroidCapability[];

    /**
     * True only when the snapshot was produced from real Android state.
     */
    isRuntimeVerified: boolean;
}

export interface CapabilityCheckResult {
    capabilityId: string;
    state: CapabilityState;

    isReal: boolean;
    verified: boolean;

    evidence: CapabilityEvidence[];

    message?: string;
    limitation?: string;
    remediation?: string[];
}

/**
 * Canonical capability identifiers.
 *
 * Keep these stable. UI, native code, audit logs and future versions
 * should reference these IDs instead of hard-coded strings.
 */
export const CAPABILITY_IDS = {
    DEVICE_INFO: 'device.info',
    INSTALLED_APPS: 'apps.installed',
    APP_RISK_ANALYSIS: 'apps.risk_analysis',

    SECURE_STORAGE: 'storage.secure',
    BIOMETRIC_AUTH: 'authentication.biometric',
    DEVICE_CREDENTIAL: 'authentication.device_credential',

    VPN_FIREWALL: 'network.vpn_firewall',

    SECURITY_AUDIT: 'security.audit',
    SECURITY_LOG: 'security.audit_log',

    SCREEN_CAPTURE_PROTECTION: 'security.flag_secure',

    DEVICE_ENCRYPTION_STATUS: 'security.device_encryption',
    SECURE_LOCK_SCREEN: 'security.secure_lock_screen',

    KEYSTORE: 'hardware.android_keystore',
    STRONGBOX: 'hardware.strongbox',

    MANAGED_PROFILE: 'management.managed_profile',
    PROFILE_OWNER: 'management.profile_owner',
    DEVICE_OWNER: 'management.device_owner',

    APPLICATION_POLICY: 'management.application_policy',
    DEVICE_RESTRICTIONS: 'management.device_restrictions',

    NOTIFICATION_ACCESS: 'privacy.notification_access',

    CAMERA: 'hardware.camera',
    SENSORS: 'hardware.sensors',

    VM_HARDWARE: 'hardware.virtualization',

    BACKUP_RESTORE: 'storage.encrypted_backup',
} as const;

export type CapabilityId =
    typeof CAPABILITY_IDS[keyof typeof CAPABILITY_IDS];
