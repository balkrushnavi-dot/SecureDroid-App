package org.securedroid.capability

import android.content.Context
import android.net.VpnService
import android.os.Build
import android.provider.Settings

class NormalModeProvider(
    private val context: Context
) : CapabilityProvider {

    override fun getMode(): SecureDroidMode {
        /*
         * Normal Mode is the fallback application-level mode.
         *
         * Device Owner / Managed Profile detection is handled
         * by ManagedDeviceProvider.
         */
        return SecureDroidMode.NORMAL
    }

    override fun getCapabilities(): List<SecurityCapability> {
        return listOf(
            secureStorageCapability(),
            vpnCapability(),
            secureWorkspaceCapability(),
            secureClipboardCapability(),
            biometricCapability(),
            encryptedDatabaseCapability(),
            applicationAuditCapability(),
            deviceManagementLimitation(),
            kernelFirewallLimitation(),
            rootLimitation()
        )
    }

    private fun secureStorageCapability(): SecurityCapability {
        return SecurityCapability(
            id = "SECURE_STORAGE",
            name = "Encrypted Secure Storage",
            category = "STORAGE",
            state = CapabilityState.SUPPORTED,
            evidence = "SecureDroid can use Android Keystore-backed cryptographic keys for application-managed encrypted data.",
            securityMeaning = "Sensitive SecureDroid application data can be encrypted before storage.",
            limitations = "This protects data managed by SecureDroid; it does not encrypt arbitrary files belonging to other applications.",
            remediation = null,
            provider = "NormalModeProvider",
            isReal = true,
            canAppChange = true,
            requiredPrivilege = "ANDROID_KEYSTORE",
            implementationLayer = "APPLICATION"
        )
    }

    private fun vpnCapability(): SecurityCapability {
        val prepareIntent = try {
            VpnService.prepare(context)
        } catch (_: Exception) {
            null
        }

        val state =
            if (prepareIntent == null) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.LIMITED
            }

        return SecurityCapability(
            id = "APPLICATION_VPN_FIREWALL",
            name = "Application-Level VPN Firewall",
            category = "NETWORK_SECURITY",
            state = state,
            evidence = if (prepareIntent == null) {
                "Android VPN authorization is currently available to SecureDroid."
            } else {
                "Android requires user authorization before SecureDroid can establish its VPN."
            },
            securityMeaning = "SecureDroid can route traffic through an application-managed VPN tunnel.",
            limitations = "This is not a kernel firewall and does not provide root-level packet filtering.",
            remediation = if (prepareIntent != null) {
                "Grant SecureDroid VPN permission."
            } else {
                null
            },
            provider = "NormalModeProvider",
            isReal = true,
            canAppChange = true,
            requiredPrivilege = "VPN_USER_AUTHORIZATION",
            implementationLayer = "APPLICATION_VPN"
        )
    }

    private fun secureWorkspaceCapability(): SecurityCapability {
        return SecurityCapability(
            id = "SECURE_WORKSPACE",
            name = "Secure Workspace",
            category = "APPLICATION_SECURITY",
            state = CapabilityState.SUPPORTED,
            evidence = "SecureDroid can isolate its own application UI and data using Android application-level controls.",
            securityMeaning = "Provides an application-level protected workspace for SecureDroid-managed content.",
            limitations = "This is not a second Android OS, virtual machine, or kernel-level sandbox.",
            remediation = null,
            provider = "NormalModeProvider",
            isReal = true,
            canAppChange = true,
            requiredPrivilege = null,
            implementationLayer = "APPLICATION"
        )
    }

    private fun secureClipboardCapability(): SecurityCapability {
        return SecurityCapability(
            id = "SECURE_CLIPBOARD",
            name = "Secure Clipboard Controls",
            category = "PRIVACY",
            state = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.LIMITED
            },
            evidence = "SecureDroid can control clipboard behavior within its own application context.",
            securityMeaning = "Reduces accidental exposure of sensitive data copied through SecureDroid.",
            limitations = "A normal application cannot universally control clipboard access by every other application.",
            remediation = null,
            provider = "NormalModeProvider",
            isReal = true,
            canAppChange = true,
            requiredPrivilege = null,
            implementationLayer = "APPLICATION"
        )
    }

    private fun biometricCapability(): SecurityCapability {
        val biometricManager =
            androidx.biometric.BiometricManager.from(context)

        val result = biometricManager.canAuthenticate(
            androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_STRONG
        )

        val state = when (result) {
            androidx.biometric.BiometricManager.BIOMETRIC_SUCCESS ->
                CapabilityState.SUPPORTED

            androidx.biometric.BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED ->
                CapabilityState.LIMITED

            else ->
                CapabilityState.UNAVAILABLE
        }

        return SecurityCapability(
            id = "BIOMETRIC_AUTHENTICATION",
            name = "Strong Biometric Authentication",
            category = "AUTHENTICATION",
            state = state,
            evidence = when (result) {
                androidx.biometric.BiometricManager.BIOMETRIC_SUCCESS ->
                    "Android reports strong biometric authentication is available."

                androidx.biometric.BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED ->
                    "Strong biometric hardware is available but no biometric is enrolled."

                else ->
                    "Strong biometric authentication is not currently available."
            },
            securityMeaning = "Can require biometric authentication before accessing protected SecureDroid content.",
            limitations = "SecureDroid cannot force biometric authentication for unrelated applications.",
            remediation = if (
                result ==
                androidx.biometric.BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED
            ) {
                "Enroll a supported biometric in Android security settings."
            } else {
                null
            },
            provider = "NormalModeProvider",
            isReal = true,
            canAppChange = false,
            requiredPrivilege = "BIOMETRIC_STRONG",
            implementationLayer = "ANDROID_API"
        )
    }

    private fun encryptedDatabaseCapability(): SecurityCapability {
        return SecurityCapability(
            id = "ENCRYPTED_LOCAL_DATABASE",
            name = "Encrypted Local Database",
            category = "STORAGE",
            state = CapabilityState.SUPPORTED,
            evidence = "SecureDroid can encrypt sensitive database fields using application-managed cryptographic keys.",
            securityMeaning = "Reduces exposure of sensitive application data stored locally.",
            limitations = "Database encryption does not protect data after it is decrypted inside the running application.",
            remediation = null,
            provider = "NormalModeProvider",
            isReal = true,
            canAppChange = true,
            requiredPrivilege = "ANDROID_KEYSTORE",
            implementationLayer = "APPLICATION"
        )
    }

    private fun applicationAuditCapability(): SecurityCapability {
        return SecurityCapability(
            id = "SECURITY_AUDIT",
            name = "Application Security Audit",
            category = "MONITORING",
            state = CapabilityState.SUPPORTED,
            evidence = "SecureDroid can inspect information exposed through Android application APIs.",
            securityMeaning = "Allows SecureDroid to identify observable application and device security conditions.",
            limitations = "Results are limited to information available to a normal Android application.",
            remediation = null,
            provider = "NormalModeProvider",
            isReal = true,
            canAppChange = false,
            requiredPrivilege = null,
            implementationLayer = "APPLICATION"
        )
    }

    private fun deviceManagementLimitation(): SecurityCapability {
        return SecurityCapability(
            id = "DEVICE_MANAGEMENT",
            name = "Android Device Management",
            category = "DEVICE_MANAGEMENT",
            state = CapabilityState.REQUIRES_DEVICE_OWNER,
            evidence = "DevicePolicyManager management capabilities require appropriate Android Enterprise provisioning.",
            securityMeaning = "Device Owner can enforce device-wide management policies.",
            limitations = "Normal Mode cannot enforce Device Owner policies.",
            remediation = "Provision SecureDroid as Device Owner or use an appropriate managed-profile configuration.",
            provider = "NormalModeProvider",
            isReal = false,
            canAppChange = false,
            requiredPrivilege = "DEVICE_OWNER",
            implementationLayer = "ANDROID_ENTERPRISE"
        )
    }

    private fun kernelFirewallLimitation(): SecurityCapability {
        return SecurityCapability(
            id = "KERNEL_FIREWALL",
            name = "Kernel-Level Firewall",
            category = "NETWORK_SECURITY",
            state = CapabilityState.REQUIRES_SYSTEM_PRIVILEGE,
            evidence = "A normal Android application does not have kernel firewall administration privileges.",
            securityMeaning = "Kernel-level firewalling can enforce packet policies below the application layer.",
            limitations = "SecureDroid does not have kernel or root privileges in Normal Mode.",
            remediation = "Not available through the normal application security model.",
            provider = "NormalModeProvider",
            isReal = false,
            canAppChange = false,
            requiredPrivilege = "ROOT_OR_SYSTEM",
            implementationLayer = "KERNEL"
        )
    }

    private fun rootLimitation(): SecurityCapability {
        return SecurityCapability(
            id = "ROOT_ACCESS",
            name = "Root Access",
            category = "PRIVILEGE",
            state = CapabilityState.UNAVAILABLE,
            evidence = "SecureDroid operates as a normal Android application and does not require root.",
            securityMeaning = "Root access would provide privileged access outside the normal Android application sandbox.",
            limitations = "SecureDroid intentionally does not depend on root privileges.",
            remediation = null,
            provider = "NormalModeProvider",
            isReal = false,
            canAppChange = false,
            requiredPrivilege = "ROOT",
            implementationLayer = "SYSTEM"
        )
    }
}
