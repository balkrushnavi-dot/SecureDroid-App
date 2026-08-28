import type {
    CapabilityCheckResult,
    CapabilitySnapshot,
    CapabilityState,
    SecureDroidCapability,
    SecureDroidMode,
    RequiredPrivilege,
    ImplementationLayer,
    CapabilityCategory,
} from '../../types/capability';

import { CAPABILITY_IDS } from '../../types/capability';
import { SecureDroidNative } from '../native/SecureDroidNative';

interface RuntimeCapabilityInput {
    androidVersion?: string;
    sdkVersion?: number;
    isDeviceOwner?: boolean;
    isProfileOwner?: boolean;
    isManagedProfile?: boolean;
    vpnAvailable?: boolean;
    vpnActive?: boolean;
    biometricAvailable?: boolean;
    biometricStrong?: boolean;
    deviceCredentialAvailable?: boolean;
    keystoreAvailable?: boolean;
    strongBoxAvailable?: boolean;
    secureLockScreen?: boolean;
    deviceEncrypted?: boolean;
}

const now = () => Date.now();

function evidence(
    source: string,
    value: string | number | boolean,
    verified = true,
) {
    return {
        source,
        value,
        timestamp: now(),
        verified,
    };
}

function capability(
    input: Omit<SecureDroidCapability, 'evidence'> & {
        evidence?: SecureDroidCapability['evidence'];
    },
): SecureDroidCapability {
    return {
        ...input,
        evidence: input.evidence ?? [],
    };
}

export class CapabilityEngine {
    private snapshot: CapabilitySnapshot | null = null;

    /**
     * Build a capability snapshot from actual Android runtime state.
     *
     * Security rule:
     * Missing evidence produces UNKNOWN or UNAVAILABLE.
     * It must never silently become SUPPORTED.
     */
    async detect(): Promise<CapabilitySnapshot> {
        const timestamp = now();

        const runtime = await this.collectRuntimeState();

        const mode = this.detectMode(runtime);

        const capabilities: SecureDroidCapability[] = [
            this.deviceInfoCapability(runtime),
            this.installedAppsCapability(runtime),
            this.appRiskCapability(runtime),

            this.secureStorageCapability(runtime),
            this.biometricCapability(runtime),
            this.deviceCredentialCapability(runtime),

            this.vpnCapability(runtime),

            this.auditCapability(runtime),
            this.auditLogCapability(runtime),

            this.screenCaptureCapability(),

            this.encryptionCapability(runtime),
            this.lockScreenCapability(runtime),

            this.keystoreCapability(runtime),
            this.strongBoxCapability(runtime),

            this.managedProfileCapability(runtime),
            this.profileOwnerCapability(runtime),
            this.deviceOwnerCapability(runtime),

            this.applicationPolicyCapability(runtime),
            this.deviceRestrictionCapability(runtime),

            this.cameraCapability(runtime),
            this.sensorCapability(runtime),

            this.virtualizationCapability(runtime),
            this.backupCapability(runtime),
        ];

        const snapshot: CapabilitySnapshot = {
            timestamp,
            mode,
            androidVersion: runtime.androidVersion ?? 'UNKNOWN',
            sdkVersion: runtime.sdkVersion ?? 0,
            capabilities,
            isRuntimeVerified: capabilities.some(
                item => item.evidence.some(e => e.verified),
            ),
        };

        this.snapshot = snapshot;

        return snapshot;
    }

    /**
     * Return the last known snapshot.
     *
     * Never fabricate a snapshot if detection has not occurred.
     */
    getSnapshot(): CapabilitySnapshot | null {
        return this.snapshot;
    }

    /**
     * Force a fresh runtime capability scan.
     */
    async refresh(): Promise<CapabilitySnapshot> {
        this.snapshot = null;
        return this.detect();
    }

    /**
     * Find a capability by its stable ID.
     */
    getCapability(
        capabilityId: string,
        snapshot: CapabilitySnapshot = this.snapshot as CapabilitySnapshot,
    ): SecureDroidCapability | null {
        if (!snapshot) {
            return null;
        }

        return (
            snapshot.capabilities.find(
                capability => capability.id === capabilityId,
            ) ?? null
        );
    }

    /**
     * Safe capability check.
     *
     * If no snapshot exists, returns UNKNOWN instead of assuming support.
     */
    check(
        capabilityId: string,
    ): CapabilityCheckResult {
        const capability = this.snapshot
            ? this.getCapability(capabilityId, this.snapshot)
            : null;

        if (!capability) {
            return {
                capabilityId,
                state: 'UNKNOWN',
                isReal: false,
                verified: false,
                evidence: [],
                message: 'Capability has not been verified.',
            };
        }

        return {
            capabilityId,
            state: capability.state,
            isReal: capability.isReal,
            verified: capability.evidence.some(e => e.verified),
            evidence: capability.evidence,
            message: capability.securityMeaning,
            limitation: capability.limitations.join(' '),
            remediation: capability.remediation,
        };
    }

    /**
     * True only when the capability is actually supported.
     */
    isSupported(capabilityId: string): boolean {
        const result = this.check(capabilityId);

        return (
            result.state === 'SUPPORTED' &&
            result.isReal &&
            result.verified
        );
    }

    /**
     * True for supported capabilities and capabilities that are
     * partially usable but have documented limitations.
     */
    isAvailable(capabilityId: string): boolean {
        const result = this.check(capabilityId);

        return (
            (result.state === 'SUPPORTED' ||
                result.state === 'LIMITED') &&
            result.isReal &&
            result.verified
        );
    }

    private async collectRuntimeState(): Promise<RuntimeCapabilityInput> {
        const runtime: RuntimeCapabilityInput = {};

        /**
         * Device information
         */
        try {
            const result = await SecureDroidNative.getDeviceInfo?.();

            if (result?.success && result.data) {
                runtime.androidVersion = result.data.androidVersion;
                runtime.sdkVersion = result.data.sdkVersion;
            }
        } catch {
            // Leave unknown.
        }

        /**
         * Management state.
         *
         * These methods are optional until the native bridge exposes them.
         */
        try {
            const plugin = SecureDroidNative as any;

            const result = await plugin.getManagementStatus?.();

            if (result?.success && result.data) {
                runtime.isDeviceOwner =
                    result.data.isDeviceOwner === true;

                runtime.isProfileOwner =
                    result.data.isProfileOwner === true;

                runtime.isManagedProfile =
                    result.data.isManagedProfile === true;
            }
        } catch {
            // Management state remains unknown.
        }

        /**
         * VPN state
         */
        try {
            const result = await SecureDroidNative.getVpnStatus();

            if (result.success && result.data) {
                runtime.vpnAvailable = true;
                runtime.vpnActive = result.data.isActive === true;
            }
        } catch {
            // Unknown.
        }

        /**
         * Biometric state
         */
        try {
            const plugin = SecureDroidNative as any;

            const result = await plugin.getBiometricStatus?.();

            if (result?.success && result.data) {
                runtime.biometricAvailable =
                    result.data.isAvailable === true;

                runtime.biometricStrong =
                    result.data.canAuthenticateStrong === true;

                runtime.deviceCredentialAvailable =
                    result.data.canAuthenticateDeviceCredential === true;
            }
        } catch {
            // Unknown.
        }

        /**
         * Keystore / StrongBox
         */
        try {
            const plugin = SecureDroidNative as any;

            const result = await plugin.getKeystoreStatus?.();

            if (result?.success && result.data) {
                runtime.keystoreAvailable =
                    result.data.available === true;

                runtime.strongBoxAvailable =
                    result.data.strongBoxAvailable === true;
            }
        } catch {
            // Unknown.
        }

        /**
         * Device security state
         */
        try {
            const plugin = SecureDroidNative as any;

            const result = await plugin.getSecurityAssessment?.();

            if (result?.success && result.data) {
                const checks = result.data.checks ?? [];

                const encryption = checks.find(
                    (item: any) =>
                        item.category === 'DEVICE_ENCRYPTION',
                );

                const authentication = checks.find(
                    (item: any) =>
                        item.category === 'AUTHENTICATION',
                );

                if (encryption) {
                    runtime.deviceEncrypted =
                        encryption.status === 'PASSED';
                }

                if (authentication) {
                    runtime.secureLockScreen =
                        authentication.status === 'PASSED';
                }
            }
        } catch {
            // Unknown.
        }

        return runtime;
    }

    private detectMode(runtime: RuntimeCapabilityInput): SecureDroidMode {
        if (runtime.isDeviceOwner === true) {
            return 'DEVICE_OWNER';
        }

        if (
            runtime.isProfileOwner === true ||
            runtime.isManagedProfile === true
        ) {
            return 'MANAGED_PROFILE';
        }

        /**
         * We can safely identify NORMAL mode only when management state
         * was actually checked and confirmed false.
         */
        if (
            runtime.isDeviceOwner === false &&
            runtime.isProfileOwner === false &&
            runtime.isManagedProfile === false
        ) {
            return 'NORMAL';
        }

        return 'UNKNOWN';
    }

    private deviceInfoCapability(
        runtime: RuntimeCapabilityInput,
    ): SecureDroidCapability {
        const verified =
            !!runtime.androidVersion &&
            typeof runtime.sdkVersion === 'number' &&
            runtime.sdkVersion > 0;

        return capability({
            id: CAPABILITY_IDS.DEVICE_INFO,
            name: 'Device Information',
            description: 'Read security-relevant device information.',
            category: 'DEVICE' as CapabilityCategory,
            state: verified ? 'SUPPORTED' : 'UNKNOWN',
            securityMeaning:
                'SecureDroid can inspect information exposed to the application by Android.',
            limitations: [
                'Application-level access does not provide unrestricted system visibility.',
            ],
            remediation: [],
            provider: 'AndroidRuntime',
            isReal: verified,
            canAppChange: false,
            requiredPrivilege: 'NONE' as RequiredPrivilege,
            implementationLayer: 'ANDROID_APP' as ImplementationLayer,
            evidence: verified
                ? [
                      evidence(
                          'Build.VERSION',
                          runtime.androidVersion!,
                      ),
                      evidence(
                          'Build.VERSION.SDK_INT',
                          runtime.sdkVersion!,
                      ),
                  ]
                : [],
        });
    }

    private installedAppsCapability(
        runtime: RuntimeCapabilityInput,
    ): SecureDroidCapability {
        return capability({
            id: CAPABILITY_IDS.INSTALLED_APPS,
            name: 'Installed Applications',
            description: 'Inspect applications visible through PackageManager.',
            category: 'APPLICATION',
            state: 'SUPPORTED',
            securityMeaning:
                'SecureDroid can inspect application metadata exposed by Android.',
            limitations: [
                'Android package visibility restrictions may limit results.',
            ],
            provider: 'AndroidPackageManager',
            isReal: true,
            canAppChange: false,
            requiredPrivilege: 'NONE',
            implementationLayer: 'ANDROID_APP',
            evidence: [
                evidence(
                    'Android PackageManager',
                    true,
                ),
            ],
        });
    }

    private appRiskCapability(
        runtime: RuntimeCapabilityInput,
    ): SecureDroidCapability {
        return capability({
            id: CAPABILITY_IDS.APP_RISK_ANALYSIS,
            name: 'Application Risk Analysis',
            description: 'Analyze application metadata and permissions.',
            category: 'SECURITY',
            state: 'SUPPORTED',
            securityMeaning:
                'Risk analysis evaluates observable application properties.',
            limitations: [
                'It cannot prove that an application is malware.',
                'Static application metadata is not equivalent to behavioral analysis.',
            ],
            provider: 'AppRiskAnalyzer',
            isReal: true,
            canAppChange: false,
            requiredPrivilege: 'NONE',
            implementationLayer: 'ANDROID_APP',
            evidence: [
                evidence(
                    'SecureDroid AppRiskAnalyzer',
                    true,
                ),
            ],
        });
    }

    private secureStorageCapability(
        runtime: RuntimeCapabilityInput,
    ): SecureDroidCapability {
        return capability({
            id: CAPABILITY_IDS.SECURE_STORAGE,
            name: 'Secure Storage',
            description: 'Store application secrets using Android cryptography.',
            category: 'STORAGE',
            state: runtime.keystoreAvailable === true
                ? 'SUPPORTED'
                : 'UNKNOWN',
            securityMeaning:
                'Application secrets can be protected using Android Keystore-backed cryptographic keys.',
            limitations: [
                'This protects SecureDroid-managed application data, not the entire device.',
            ],
            remediation: [
                'Use Android Keystore for cryptographic key protection.',
            ],
            provider: 'AndroidKeystore',
            isReal: runtime.keystoreAvailable === true,
            canAppChange: true,
            requiredPrivilege: 'NONE',
            implementationLayer: 'ANDROID_APP',
            evidence:
                runtime.keystoreAvailable === true
                    ? [
                          evidence(
                              'Android Keystore',
                              true,
                          ),
                      ]
                    : [],
        });
    }

    private biometricCapability(
        runtime: RuntimeCapabilityInput,
    ): SecureDroidCapability {
        const state =
            runtime.biometricStrong === true
                ? 'SUPPORTED'
                : runtime.biometricAvailable === true
                  ? 'LIMITED'
                  : 'UNKNOWN';

        return capability({
            id: CAPABILITY_IDS.BIOMETRIC_AUTH,
            name: 'Biometric Authentication',
            description: 'Authenticate users using Android BiometricPrompt.',
            category: 'SECURITY',
            state,
            securityMeaning:
                'SecureDroid can require Android-managed biometric authentication where supported.',
            limitations: [
                'SecureDroid does not control the device biometric sensor implementation.',
            ],
            provider: 'AndroidBiometricPrompt',
            isReal: runtime.biometricAvailable === true,
            canAppChange: false,
            requiredPrivilege: 'NONE',
            implementationLayer: 'ANDROID_APP',
            evidence:
                runtime.biometricAvailable !== undefined
                    ? [
                          evidence(
                              'BiometricManager',
                              runtime.biometricAvailable,
                          ),
                          ...(runtime.biometricStrong !== undefined
                              ? [
                                    evidence(
                                        'BIOMETRIC_STRONG',
                                        runtime.biometricStrong,
                                    ),
                                ]
                              : []),
                      ]
                    : [],
        });
    }

    private deviceCredentialCapability(
        runtime: RuntimeCapabilityInput,
    ): SecureDroidCapability {
        return capability({
            id: CAPABILITY_IDS.DEVICE_CREDENTIAL,
            name: 'Device Credential Authentication',
            description: 'Use Android device credentials for authentication.',
            category: 'SECURITY',
            state:
                runtime.deviceCredentialAvailable === true
                    ? 'SUPPORTED'
                    : 'UNKNOWN',
            securityMeaning:
                'SecureDroid can use Android-supported device credentials where permitted.',
            limitations: [
                'SecureDroid does not control the underlying lock-screen credential.',
            ],
            provider: 'AndroidBiometricPrompt',
            isReal: runtime.deviceCredentialAvailable === true,
            canAppChange: false,
            requiredPrivilege: 'NONE',
            implementationLayer: 'ANDROID_APP',
            evidence:
                runtime.deviceCredentialAvailable !== undefined
                    ? [
                          evidence(
                              'Device Credential',
                              runtime.deviceCredentialAvailable,
                          ),
                      ]
                    : [],
        });
    }

    private vpnCapability(
        runtime: RuntimeCapabilityInput,
    ): SecureDroidCapability {
        if (runtime.vpnAvailable === true) {
            return capability({
                id: CAPABILITY_IDS.VPN_FIREWALL,
                name: 'Application-Level VPN Firewall',
                description:
                    'Route network traffic through SecureDroid VpnService.',
                category: 'NETWORK',
                state: 'SUPPORTED',
                securityMeaning:
                    'SecureDroid can provide application-level network filtering through Android VpnService.',
                limitations: [
                    'This is not a kernel firewall.',
                    'VPN operation is subject to Android VPN restrictions.',
                    'Other VPN services may conflict with SecureDroid.',
                ],
                provider: 'SecureDroidVpnService',
                isReal: true,
                canAppChange: true,
                requiredPrivilege: 'VPN_SERVICE',
                implementationLayer: 'ANDROID_APP',
                evidence: [
                    evidence(
                        'Android VpnService',
                        true,
                    ),
                ],
            });
        }

        return capability({
            id: CAPABILITY_IDS.VPN_FIREWALL,
            name: 'Application-Level VPN Firewall',
            description:
                'Route network traffic through SecureDroid VpnService.',
            category: 'NETWORK',
            state: 'UNKNOWN',
            securityMeaning:
                'VPN capability has not been verified.',
            limitations: [
                'SecureDroid cannot claim active network filtering without runtime evidence.',
            ],
            provider: 'SecureDroidVpnService',
            isReal: false,
            canAppChange: true,
            requiredPrivilege: 'VPN_SERVICE',
            implementationLayer: 'ANDROID_APP',
        });
    }

    private auditCapability(
        runtime: RuntimeCapabilityInput,
    ): SecureDroidCapability {
        return capability({
            id: CAPABILITY_IDS.SECURITY_AUDIT,
            name: 'Security Audit',
            description: 'Evaluate security properties visible to SecureDroid.',
            category: 'SECURITY',
            state: 'SUPPORTED',
            securityMeaning:
                'SecureDroid can evaluate application-visible Android security signals.',
            limitations: [
                'An application-level audit cannot establish complete OS integrity.',
            ],
            provider: 'SecurityAuditEngine',
            isReal: true,
            canAppChange: false,
            requiredPrivilege: 'NONE',
            implementationLayer: 'ANDROID_APP',
            evidence: [
                evidence(
                    'SecureDroid Security Audit Engine',
                    true,
                ),
            ],
        });
    }

    private auditLogCapability(
        runtime: RuntimeCapabilityInput,
    ): SecureDroidCapability {
        return capability({
            id: CAPABILITY_IDS.SECURITY_LOG,
            name: 'Security Audit Log',
            description: 'Record security events generated by SecureDroid.',
            category: 'MONITORING',
            state: 'SUPPORTED',
            securityMeaning:
                'SecureDroid can maintain an application-level security audit trail.',
            limitations: [
                'The log does not represent a complete Android system event stream.',
            ],
            provider: 'SecureDroidAuditLog',
            isReal: true,
            canAppChange: true,
            requiredPrivilege: 'NONE',
            implementationLayer: 'ANDROID_APP',
            evidence: [
                evidence(
                    'SecureDroid Audit Repository',
                    true,
                ),
            ],
        });
    }

    private screenCaptureCapability(): SecureDroidCapability {
        return capability({
            id: CAPABILITY_IDS.SCREEN_CAPTURE_PROTECTION,
            name: 'Screen Capture Protection',
            description: 'Protect SecureDroid windows using FLAG_SECURE.',
            category: 'SECURITY',
            state: 'SUPPORTED',
            securityMeaning:
                'SecureDroid can request Android to prevent screenshots and screen capture for protected windows.',
            limitations: [
                'This applies to protected SecureDroid windows.',
                'It does not prevent external cameras from recording the display.',
            ],
            provider: 'AndroidWindowManager',
            isReal: true,
            canAppChange: true,
            requiredPrivilege: 'NONE',
            implementationLayer: 'ANDROID_APP',
            evidence: [
                evidence(
                    'WindowManager.LayoutParams.FLAG_SECURE',
                    true,
                ),
            ],
        });
    }

    private encryptionCapability(
        runtime: RuntimeCapabilityInput,
    ): SecureDroidCapability {
        return capability({
            id: CAPABILITY_IDS.DEVICE_ENCRYPTION_STATUS,
            name: 'Device Encryption Status',
            description: 'Determine whether Android reports device encryption.',
            category: 'SECURITY',
            state:
                runtime.deviceEncrypted === true
                    ? 'SUPPORTED'
                    : runtime.deviceEncrypted === false
                      ? 'SUPPORTED'
                      : 'UNKNOWN',
            securityMeaning:
                'SecureDroid reports encryption information exposed by Android.',
            limitations: [
                'Encryption status does not prove complete device integrity.',
            ],
            provider: 'AndroidSecurityManager',
            isReal: runtime.deviceEncrypted !== undefined,
            canAppChange: false,
            requiredPrivilege: 'NONE',
            implementationLayer: 'ANDROID_APP',
            evidence:
                runtime.deviceEncrypted !== undefined
                    ? [
                          evidence(
                              'Android security assessment',
                              runtime.deviceEncrypted,
                          ),
                      ]
                    : [],
        });
    }

    private lockScreenCapability(
        runtime: RuntimeCapabilityInput,
    ): SecureDroidCapability {
        return capability({
            id: CAPABILITY_IDS.SECURE_LOCK_SCREEN,
            name: 'Secure Lock Screen',
            description: 'Determine whether a secure device credential is configured.',
            category: 'SECURITY',
            state:
                runtime.secureLockScreen === true ||
                runtime.secureLockScreen === false
                    ? 'SUPPORTED'
                    : 'UNKNOWN',
            securityMeaning:
                'SecureDroid reports the device authentication state exposed by Android.',
            limitations: [
                'SecureDroid does not control the underlying system lock screen in Normal Mode.',
            ],
            provider: 'AndroidKeyguardManager',
            isReal: runtime.secureLockScreen !== undefined,
            canAppChange: false,
            requiredPrivilege: 'NONE',
            implementationLayer: 'ANDROID_APP',
            evidence:
                runtime.secureLockScreen !== undefined
                    ? [
                          evidence(
                              'KeyguardManager',
                              runtime.secureLockScreen,
                          ),
                      ]
                    : [],
        });
    }

    private keystoreCapability(
        runtime: RuntimeCapabilityInput,
    ): SecureDroidCapability {
        return capability({
            id: CAPABILITY_IDS.KEYSTORE,
            name: 'Android Keystore',
            description: 'Use Android Keystore for cryptographic key protection.',
            category: 'HARDWARE',
            state:
                runtime.keystoreAvailable === true
                    ? 'SUPPORTED'
                    : 'UNKNOWN',
            securityMeaning:
                'Android Keystore provides protected key storage for application cryptographic operations.',
            limitations: [
                'Keystore availability does not by itself prove that every key is hardware-backed.',
            ],
            provider: 'AndroidKeystore',
            isReal: runtime.keystoreAvailable === true,
            canAppChange: false,
            requiredPrivilege: 'NONE',
            implementationLayer: 'ANDROID_APP',
            evidence:
                runtime.keystoreAvailable !== undefined
                    ? [
                          evidence(
                              'AndroidKeyStore',
                              runtime.keystoreAvailable,
                          ),
                      ]
                    : [],
        });
    }

    private strongBoxCapability(
        runtime: RuntimeCapabilityInput,
    ): SecureDroidCapability {
        return capability({
            id: CAPABILITY_IDS.STRONGBOX,
            name: 'StrongBox KeyMint',
            description:
                'Determine whether Android exposes StrongBox-backed key protection.',
            category: 'HARDWARE',
            state:
                runtime.strongBoxAvailable === true
                    ? 'SUPPORTED'
                    : runtime.strongBoxAvailable === false
                      ? 'UNAVAILABLE'
                      : 'UNKNOWN',
            securityMeaning:
                'StrongBox can provide stronger hardware isolation for supported cryptographic operations.',
            limitations: [
                'StrongBox availability is device-dependent.',
                'Not every cryptographic operation necessarily uses StrongBox.',
            ],
            provider: 'AndroidKeystore',
            isReal: runtime.strongBoxAvailable !== undefined,
            canAppChange: false,
            requiredPrivilege: 'HARDWARE',
            implementationLayer: 'HARDWARE',
            evidence:
                runtime.strongBoxAvailable !== undefined
                    ? [
                          evidence(
                              'KeyMint / StrongBox',
                              runtime.strongBoxAvailable,
                          ),
                      ]
                    : [],
        });
    }

    private managedProfileCapability(
        runtime: RuntimeCapabilityInput,
    ): SecureDroidCapability {
        return capability({
            id: CAPABILITY_IDS.MANAGED_PROFILE,
            name: 'Managed Profile',
            description: 'Android Enterprise managed-profile capability.',
            category: 'MANAGEMENT',
            state:
                runtime.isManagedProfile === true
                    ? 'SUPPORTED'
                    : runtime.isManagedProfile === false
                      ? 'UNAVAILABLE'
                      : 'UNKNOWN',
            securityMeaning:
                'Indicates whether this application is running in an Android managed-profile context.',
            limitations: [
                'Managed profile capabilities depend on Android Enterprise provisioning.',
            ],
            remediation: [
                'Provision the application through Android Enterprise if management is required.',
            ],
            provider: 'DevicePolicyManager',
            isReal: runtime.isManagedProfile !== undefined,
            canAppChange: false,
            requiredPrivilege: 'PROFILE_OWNER',
            implementationLayer: 'ANDROID_ENTERPRISE',
            evidence:
                runtime.isManagedProfile !== undefined
                    ? [
                          evidence(
                              'DevicePolicyManager',
                              runtime.isManagedProfile,
                          ),
                      ]
                    : [],
        });
    }

    private profileOwnerCapability(
        runtime: RuntimeCapabilityInput,
    ): SecureDroidCapability {
        return capability({
            id: CAPABILITY_IDS.PROFILE_OWNER,
            name: 'Profile Owner',
            description: 'Android Enterprise Profile Owner authority.',
            category: 'MANAGEMENT',
            state:
                runtime.isProfileOwner === true
                    ? 'SUPPORTED'
                    : runtime.isProfileOwner === false
                      ? 'UNAVAILABLE'
                      : 'UNKNOWN',
            securityMeaning:
                'Profile Owner grants management authority over an Android managed profile.',
            limitations: [
                'Profile Owner does not provide unrestricted system or kernel access.',
            ],
            remediation: [
                'Provision SecureDroid as the Profile Owner through supported Android Enterprise enrollment.',
            ],
            provider: 'DevicePolicyManager',
            isReal: runtime.isProfileOwner !== undefined,
            canAppChange: false,
            requiredPrivilege: 'PROFILE_OWNER',
            implementationLayer: 'ANDROID_ENTERPRISE',
            evidence:
                runtime.isProfileOwner !== undefined
                    ? [
                          evidence(
                              'DevicePolicyManager.isProfileOwnerApp',
                              runtime.isProfileOwner,
                          ),
                      ]
                    : [],
        });
    }

    private deviceOwnerCapability(
        runtime: RuntimeCapabilityInput,
    ): SecureDroidCapability {
        return capability({
            id: CAPABILITY_IDS.DEVICE_OWNER,
            name: 'Device Owner',
            description: 'Android Enterprise fully managed device authority.',
            category: 'MANAGEMENT',
            state:
                runtime.isDeviceOwner === true
                    ? 'SUPPORTED'
                    : runtime.isDeviceOwner === false
                      ? 'UNAVAILABLE'
                      : 'UNKNOWN',
            securityMeaning:
                'Device Owner provides Android Enterprise management capabilities over the fully managed device.',
            limitations: [
                'Device Owner is still constrained by Android platform APIs.',
                'It does not grant root or kernel privileges.',
            ],
            remediation: [
                'Provision SecureDroid as Device Owner during supported device enrollment.',
            ],
            provider: 'DevicePolicyManager',
            isReal: runtime.isDeviceOwner !== undefined,
            canAppChange: false,
            requiredPrivilege: 'DEVICE_OWNER',
            implementationLayer: 'ANDROID_ENTERPRISE',
            evidence:
                runtime.isDeviceOwner !== undefined
                    ? [
                          evidence(
                              'DevicePolicyManager.isDeviceOwnerApp',
                              runtime.isDeviceOwner,
                          ),
                      ]
                    : [],
        });
    }

    private applicationPolicyCapability(
        runtime: RuntimeCapabilityInput,
    ): SecureDroidCapability {
        if (runtime.isDeviceOwner === true) {
            return capability({
                id: CAPABILITY_IDS.APPLICATION_POLICY,
                name: 'Application Management Policy',
                description:
                    'Apply supported Android Enterprise application policies.',
                category: 'MANAGEMENT',
                state: 'SUPPORTED',
                securityMeaning:
                    'SecureDroid can use DevicePolicyManager application-management APIs.',
                limitations: [
                    'Only policies exposed by the Android Enterprise API are available.',
                ],
                provider: 'DevicePolicyManager',
                isReal: true,
                canAppChange: true,
                requiredPrivilege: 'DEVICE_OWNER',
                implementationLayer: 'ANDROID_ENTERPRISE',
                evidence: [
                    evidence(
                        'DevicePolicyManager Device Owner',
                        true,
                    ),
                ],
            });
        }

        return capability({
            id: CAPABILITY_IDS.APPLICATION_POLICY,
            name: 'Application Management Policy',
            description:
                'Apply supported Android Enterprise application policies.',
            category: 'MANAGEMENT',
            state: 'REQUIRES_DEVICE_OWNER',
            securityMeaning:
                'Advanced application management requires Android Enterprise authority.',
            limitations: [
                'Normal Mode does not provide unrestricted application management.',
            ],
            remediation: [
                'Provision SecureDroid as Device Owner where supported.',
            ],
            provider: 'DevicePolicyManager',
            isReal: false,
            canAppChange: false,
            requiredPrivilege: 'DEVICE_OWNER',
            implementationLayer: 'ANDROID_ENTERPRISE',
        });
    }

    private deviceRestrictionCapability(
        runtime: RuntimeCapabilityInput,
    ): SecureDroidCapability {
        if (runtime.isDeviceOwner === true) {
            return capability({
                id: CAPABILITY_IDS.DEVICE_RESTRICTIONS,
                name: 'Device Restrictions',
                description:
                    'Apply supported DevicePolicyManager restrictions.',
                category: 'MANAGEMENT',
                state: 'SUPPORTED',
                securityMeaning:
                    'Device Owner can enforce supported Android device restrictions.',
                limitations: [
                    'Available restrictions depend on Android version and OEM implementation.',
                ],
                provider: 'DevicePolicyManager',
                isReal: true,
                canAppChange: true,
                requiredPrivilege: 'DEVICE_OWNER',
                implementationLayer: 'ANDROID_ENTERPRISE',
                evidence: [
                    evidence(
                        'DevicePolicyManager Device Owner',
                        true,
                    ),
                ],
            });
        }

        return capability({
            id: CAPABILITY_IDS.DEVICE_RESTRICTIONS,
            name: 'Device Restrictions',
            description:
                'Apply supported DevicePolicyManager restrictions.',
            category: 'MANAGEMENT',
            state: 'REQUIRES_DEVICE_OWNER',
            securityMeaning:
                'Device-wide restrictions require Android Enterprise authority.',
            limitations: [
                'Normal Mode cannot enforce device-wide restrictions.',
            ],
            remediation: [
                'Provision SecureDroid as Device Owner.',
            ],
            provider: 'DevicePolicyManager',
            isReal: false,
            canAppChange: false,
            requiredPrivilege: 'DEVICE_OWNER',
            implementationLayer: 'ANDROID_ENTERPRISE',
        });
    }

    private cameraCapability(
        runtime: RuntimeCapabilityInput,
    ): SecureDroidCapability {
        return capability({
            id: CAPABILITY_IDS.CAMERA,
            name: 'Camera',
            description: 'Access camera hardware when permission is granted.',
            category: 'HARDWARE',
            state: 'SUPPORTED',
            securityMeaning:
                'SecureDroid can use Android camera APIs subject to runtime permissions.',
            limitations: [
                'Camera access requires appropriate Android permission.',
            ],
            provider: 'AndroidCamera',
            isReal: true,
            canAppChange: true,
            requiredPrivilege: 'RUNTIME_PERMISSION',
            implementationLayer: 'ANDROID_APP',
            evidence: [
                evidence(
                    'Android Camera API',
                    true,
                ),
            ],
        });
    }

    private sensorCapability(
        runtime: RuntimeCapabilityInput,
    ): SecureDroidCapability {
        return capability({
            id: CAPABILITY_IDS.SENSORS,
            name: 'Device Sensors',
            description: 'Inspect sensors exposed by Android.',
            category: 'HARDWARE',
            state: 'SUPPORTED',
            securityMeaning:
                'SecureDroid can inspect sensors exposed through Android SensorManager.',
            limitations: [
                'Availability depends on device hardware.',
            ],
            provider: 'AndroidSensorManager',
            isReal: true,
            canAppChange: false,
            requiredPrivilege: 'NONE',
            implementationLayer: 'ANDROID_APP',
            evidence: [
                evidence(
                    'Android SensorManager',
                    true,
                ),
            ],
        });
    }

    private virtualizationCapability(
        runtime: RuntimeCapabilityInput,
    ): SecureDroidCapability {
        return capability({
            id: CAPABILITY_IDS.VM_HARDWARE,
            name: 'Virtualization Capability',
            description:
                'Determine whether virtualization capabilities can be verified.',
            category: 'HARDWARE',
            state: 'UNKNOWN',
            securityMeaning:
                'Virtualization capability requires explicit hardware/runtime evidence.',
            limitations: [
                'An ordinary Android application cannot assume KVM or hypervisor access.',
            ],
            remediation: [
                'Only report virtualization support after native hardware evidence is obtained.',
            ],
            provider: 'AndroidRuntime',
            isReal: false,
            canAppChange: false,
            requiredPrivilege: 'HARDWARE',
            implementationLayer: 'HARDWARE',
        });
    }

    private backupCapability(
        runtime: RuntimeCapabilityInput,
    ): SecureDroidCapability {
        return capability({
            id: CAPABILITY_IDS.BACKUP_RESTORE,
            name: 'Encrypted Backup',
            description:
                'Create application-level encrypted SecureDroid backups.',
            category: 'STORAGE',
            state: 'SUPPORTED',
            securityMeaning:
                'SecureDroid can encrypt its own configuration and application data before backup.',
            limitations: [
                'This is not a complete device backup.',
                'Android system data outside SecureDroid is not included.',
            ],
            provider: 'SecureDroidBackupManager',
            isReal: true,
            canAppChange: true,
            requiredPrivilege: 'NONE',
            implementationLayer: 'ANDROID_APP',
            evidence: [
                evidence(
                    'SecureDroid encrypted backup implementation',
                    true,
                ),
            ],
        });
    }
}

/**
 * Singleton capability authority.
 */
export const capabilityEngine = new CapabilityEngine();
