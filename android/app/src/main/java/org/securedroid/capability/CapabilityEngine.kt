package org.securedroid.capability

import android.app.admin.DevicePolicyManager
import android.content.Context
import android.content.pm.PackageManager
import android.net.VpnService
import android.os.Build
import android.os.UserManager
import android.provider.Settings
import android.security.keystore.KeyInfo
import android.security.keystore.KeyProperties
import java.security.KeyStore
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey

/**
 * Central capability detection engine for SecureDroid.
 *
 * Rules:
 * - Never report unsupported capabilities as supported.
 * - Never use demo values in production detection.
 * - UNKNOWN is preferred when Android does not expose enough evidence.
 * - Capability detection does not grant permissions or change device state.
 */
class CapabilityEngine(
    private val context: Context
) {

    private val packageManager: PackageManager = context.packageManager

    private val devicePolicyManager: DevicePolicyManager? =
        context.getSystemService(Context.DEVICE_POLICY_SERVICE)

    private val userManager: UserManager? =
        context.getSystemService(Context.USER_SERVICE)

    fun detect(): CapabilitySnapshot {
        val capabilities = mutableListOf<Capability>()

        val mode = detectMode()

        capabilities += detectVpnCapability()
        capabilities += detectBiometricCapability()
        capabilities += detectKeystoreCapability()
        capabilities += detectStrongBoxCapability()
        capabilities += detectSecureLockScreen()
        capabilities += detectDeviceOwnerCapability()
        capabilities += detectProfileOwnerCapability()
        capabilities += detectManagedProfileCapability()
        capabilities += detectPackageManagementCapability(mode)
        capabilities += detectDevicePolicyCapability(mode)
        capabilities += detectHardwareSecurityCapability()

        return CapabilitySnapshot(
            mode = mode,
            androidVersion = Build.VERSION.SDK_INT,
            androidRelease = Build.VERSION.RELEASE ?: "unknown",
            capabilities = capabilities
        )
    }

    /**
     * Detects the security-management mode available to this APK.
     *
     * DEVICE_OWNER has highest priority because it provides the strongest
     * management authority available to a normal Android application.
     */
    fun detectMode(): SecureDroidMode {

        val dpm = devicePolicyManager

        if (dpm != null) {
            try {
                if (dpm.isDeviceOwnerApp(context.packageName)) {
                    return SecureDroidMode.DEVICE_OWNER
                }
            } catch (_: SecurityException) {
                // Fall through to other detection.
            }
        }

        /*
         * Profile Owner detection.
         *
         * A normal personal application cannot simply become a profile owner.
         * This check only reports the state if Android exposes it.
         */
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            try {
                if (dpm?.isProfileOwnerApp(context.packageName) == true) {
                    return SecureDroidMode.MANAGED_PROFILE
                }
            } catch (_: SecurityException) {
                // Continue.
            }
        }

        /*
         * If Android exposes a managed profile for the current user,
         * report managed-profile capability.
         */
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            try {
                if (userManager?.isManagedProfile == true) {
                    return SecureDroidMode.MANAGED_PROFILE
                }
            } catch (_: SecurityException) {
                // Continue.
            }
        }

        return SecureDroidMode.NORMAL
    }

    private fun detectVpnCapability(): Capability {

        val prepareIntent = try {
            VpnService.prepare(context)
        } catch (_: Exception) {
            null
        }

        return if (prepareIntent == null) {
            Capability(
                id = CapabilityIds.VPN_SERVICE,
                name = "Application-level VPN",
                category = CapabilityCategory.NETWORK,
                state = CapabilityState.SUPPORTED,
                evidence = "VpnService.prepare() returned null; VPN authorization is currently granted.",
                securityMeaning = "SecureDroid can establish an application-level VPN tunnel.",
                limitations = "This is not a kernel firewall and does not provide system-level packet filtering outside Android VPN APIs.",
                remediation = null,
                provider = CapabilityProvider.ANDROID,
                isReal = true,
                canAppChange = true,
                requiredPrivilege = RequiredPrivilege.NORMAL_APP,
                implementationLayer = ImplementationLayer.APPLICATION
            )
        } else {
            Capability(
                id = CapabilityIds.VPN_SERVICE,
                name = "Application-level VPN",
                category = CapabilityCategory.NETWORK,
                state = CapabilityState.SUPPORTED,
                evidence = "Android exposes VpnService for this application; user authorization is required before connection.",
                securityMeaning = "SecureDroid can request an application-level VPN connection.",
                limitations = "VPN authorization has not yet been granted.",
                remediation = "Request Android VPN permission before starting SecureDroid VPN.",
                provider = CapabilityProvider.ANDROID,
                isReal = true,
                canAppChange = true,
                requiredPrivilege = RequiredPrivilege.USER_APPROVAL,
                implementationLayer = ImplementationLayer.APPLICATION
            )
        }
    }

    private fun detectBiometricCapability(): Capability {

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            return Capability(
                id = CapabilityIds.BIOMETRIC,
                name = "Biometric authentication",
                category = CapabilityCategory.AUTHENTICATION,
                state = CapabilityState.UNAVAILABLE,
                evidence = "Biometric APIs required by SecureDroid are unavailable on this Android version.",
                securityMeaning = "SecureDroid cannot use modern Android biometric APIs.",
                limitations = "Requires Android 6.0 or later.",
                remediation = null,
                provider = CapabilityProvider.ANDROID,
                isReal = true,
                canAppChange = false,
                requiredPrivilege = RequiredPrivilege.NORMAL_APP,
                implementationLayer = ImplementationLayer.APPLICATION
            )
        }

        val biometricManager = androidx.biometric.BiometricManager.from(context)

        val result = biometricManager.canAuthenticate(
            androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_STRONG or
                androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_WEAK
        )

        val state = when (result) {
            androidx.biometric.BiometricManager.BIOMETRIC_SUCCESS ->
                CapabilityState.SUPPORTED

            androidx.biometric.BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED ->
                CapabilityState.LIMITED

            androidx.biometric.BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE ->
                CapabilityState.UNAVAILABLE

            androidx.biometric.BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE ->
                CapabilityState.LIMITED

            else ->
                CapabilityState.UNKNOWN
        }

        val evidence = when (result) {
            androidx.biometric.BiometricManager.BIOMETRIC_SUCCESS ->
                "Android reports biometric authentication is available."

            androidx.biometric.BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED ->
                "Biometric hardware/API is available, but no biometric is enrolled."

            androidx.biometric.BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE ->
                "Android reports no biometric hardware is available."

            androidx.biometric.BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE ->
                "Biometric hardware is temporarily unavailable."

            else ->
                "Android returned biometric status code $result."
        }

        return Capability(
            id = CapabilityIds.BIOMETRIC,
            name = "Biometric authentication",
            category = CapabilityCategory.AUTHENTICATION,
            state = state,
            evidence = evidence,
            securityMeaning = "SecureDroid can use Android BiometricPrompt when the platform permits it.",
            limitations = if (state == CapabilityState.SUPPORTED) {
                "Actual authentication security depends on Android's biometric implementation and enrolled credentials."
            } else {
                "Biometric authentication is not currently fully available."
            },
            remediation = if (state == CapabilityState.LIMITED) {
                "Enroll a supported biometric in Android Security settings."
            } else {
                null
            },
            provider = CapabilityProvider.ANDROID,
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.NORMAL_APP,
            implementationLayer = ImplementationLayer.APPLICATION
        )
    }

    private fun detectKeystoreCapability(): Capability {

        val available = try {
            val keyStore = KeyStore.getInstance("AndroidKeyStore")
            keyStore.load(null)
            true
        } catch (_: Exception) {
            false
        }

        return Capability(
            id = CapabilityIds.ANDROID_KEYSTORE,
            name = "Android Keystore",
            category = CapabilityCategory.CRYPTOGRAPHY,
            state = if (available) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.UNAVAILABLE
            },
            evidence = if (available) {
                "AndroidKeyStore initialized successfully."
            } else {
                "AndroidKeyStore could not be initialized."
            },
            securityMeaning = "SecureDroid can use Android-managed cryptographic keys.",
            limitations = "Availability of the Keystore does not by itself prove that every key is hardware-backed.",
            remediation = null,
            provider = CapabilityProvider.ANDROID,
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.NORMAL_APP,
            implementationLayer = ImplementationLayer.PLATFORM
        )
    }

    private fun detectStrongBoxCapability(): Capability {

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) {
            return Capability(
                id = CapabilityIds.STRONGBOX,
                name = "StrongBox KeyMint",
                category = CapabilityCategory.HARDWARE_SECURITY,
                state = CapabilityState.UNAVAILABLE,
                evidence = "StrongBox APIs require Android 9 / API 28 or later.",
                securityMeaning = "SecureDroid cannot request StrongBox-backed keys on this Android version.",
                limitations = "StrongBox support is unavailable at this API level.",
                remediation = null,
                provider = CapabilityProvider.ANDROID,
                isReal = true,
                canAppChange = false,
                requiredPrivilege = RequiredPrivilege.HARDWARE,
                implementationLayer = ImplementationLayer.HARDWARE
            )
        }

        val supported = try {
            val alias = "securedroid_capability_test_strongbox"

            val keyGenerator = KeyGenerator.getInstance(
                KeyProperties.KEY_ALGORITHM_AES,
                "AndroidKeyStore"
            )

            val spec = android.security.keystore.KeyGenParameterSpec.Builder(
                alias,
                KeyProperties.PURPOSE_ENCRYPT or
                    KeyProperties.PURPOSE_DECRYPT
            )
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256)
                .setIsStrongBoxBacked(true)
                .build()

            keyGenerator.init(spec)
            keyGenerator.generateKey()

            val keyStore = KeyStore.getInstance("AndroidKeyStore")
            keyStore.load(null)
            keyStore.deleteEntry(alias)

            true
        } catch (_: Exception) {
            false
        }

        return Capability(
            id = CapabilityIds.STRONGBOX,
            name = "StrongBox KeyMint",
            category = CapabilityCategory.HARDWARE_SECURITY,
            state = if (supported) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.UNAVAILABLE
            },
            evidence = if (supported) {
                "Android successfully generated a StrongBox-backed test key."
            } else {
                "Android could not generate a StrongBox-backed test key."
            },
            securityMeaning = "SecureDroid can request hardware-isolated key storage through Android Keystore.",
            limitations = "A successful test indicates StrongBox-backed key generation was available at test time; it does not prove that every device security component is hardware-backed.",
            remediation = null,
            provider = CapabilityProvider.ANDROID,
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.HARDWARE,
            implementationLayer = ImplementationLayer.HARDWARE
        )
    }

    private fun detectSecureLockScreen(): Capability {

        val keyguard = context.getSystemService(Context.KEYGUARD_SERVICE)
            as? android.app.KeyguardManager

        val secure = keyguard?.isKeyguardSecure

        return Capability(
            id = CapabilityIds.SECURE_LOCK_SCREEN,
            name = "Secure lock screen",
            category = CapabilityCategory.AUTHENTICATION,
            state = when (secure) {
                true -> CapabilityState.SUPPORTED
                false -> CapabilityState.LIMITED
                null -> CapabilityState.UNKNOWN
            },
            evidence = when (secure) {
                true -> "Android reports a secure keyguard is configured."
                false -> "Android reports no secure keyguard is configured."
                null -> "Android keyguard status could not be determined."
            },
            securityMeaning = "A secure device lock provides protection against casual physical access.",
            limitations = "This does not prove resistance to advanced physical attacks.",
            remediation = if (secure == false) {
                "Configure a PIN, password, or supported secure screen lock."
            } else {
                null
            },
            provider = CapabilityProvider.ANDROID,
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.USER_ACTION,
            implementationLayer = ImplementationLayer.PLATFORM
        )
    }

    private fun detectDeviceOwnerCapability(): Capability {

        val isOwner = try {
            devicePolicyManager?.isDeviceOwnerApp(context.packageName) == true
        } catch (_: Exception) {
            false
        }

        return Capability(
            id = CapabilityIds.DEVICE_OWNER,
            name = "Device Owner",
            category = CapabilityCategory.DEVICE_MANAGEMENT,
            state = if (isOwner) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.REQUIRES_DEVICE_OWNER
            },
            evidence = if (isOwner) {
                "Android reports SecureDroid as the Device Owner."
            } else {
                "SecureDroid is not the Device Owner."
            },
            securityMeaning = "Device Owner status enables Android Enterprise device-management APIs.",
            limitations = "A normal application cannot grant itself Device Owner status.",
            remediation = if (!isOwner) {
                "Provision SecureDroid through a supported Android Enterprise/device-owner provisioning flow."
            } else {
                null
            },
            provider = CapabilityProvider.DEVICE_POLICY_MANAGER,
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.DEVICE_OWNER,
            implementationLayer = ImplementationLayer.PLATFORM
        )
    }

    private fun detectProfileOwnerCapability(): Capability {

        val isOwner = try {
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.N &&
                devicePolicyManager?.isProfileOwnerApp(context.packageName) == true
        } catch (_: Exception) {
            false
        }

        return Capability(
            id = CapabilityIds.PROFILE_OWNER,
            name = "Profile Owner",
            category = CapabilityCategory.DEVICE_MANAGEMENT,
            state = if (isOwner) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.REQUIRES_DEVICE_OWNER
            },
            evidence = if (isOwner) {
                "Android reports SecureDroid as Profile Owner."
            } else {
                "SecureDroid is not the Profile Owner."
            },
            securityMeaning = "Profile Owner status enables managed-profile policy APIs.",
            limitations = "Profile Owner status is controlled by Android provisioning and enterprise management.",
            remediation = if (!isOwner) {
                "Provision SecureDroid as a managed profile through Android Enterprise."
            } else {
                null
            },
            provider = CapabilityProvider.DEVICE_POLICY_MANAGER,
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.PROFILE_OWNER,
            implementationLayer = ImplementationLayer.PLATFORM
        )
    }

    private fun detectManagedProfileCapability(): Capability {

        val managedProfile = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            try {
                userManager?.isManagedProfile == true
            } catch (_: Exception) {
                false
            }
        } else {
            false
        }

        return Capability(
            id = CapabilityIds.MANAGED_PROFILE,
            name = "Managed Profile",
            category = CapabilityCategory.DEVICE_MANAGEMENT,
            state = if (managedProfile) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.UNAVAILABLE
            },
            evidence = if (managedProfile) {
                "Android reports the current user as a managed profile."
            } else {
                "Current user is not reported as a managed profile."
            },
            securityMeaning = "Android Enterprise managed-profile controls may be available.",
            limitations = "This does not grant SecureDroid ownership of the entire device.",
            remediation = null,
            provider = CapabilityProvider.ANDROID,
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.PROFILE_OWNER,
            implementationLayer = ImplementationLayer.PLATFORM
        )
    }

    private fun detectPackageManagementCapability(
        mode: SecureDroidMode
    ): Capability {

        val supported = mode == SecureDroidMode.DEVICE_OWNER ||
            mode == SecureDroidMode.MANAGED_PROFILE

        return Capability(
            id = CapabilityIds.PACKAGE_MANAGEMENT,
            name = "Managed application controls",
            category = CapabilityCategory.APPLICATION_MANAGEMENT,
            state = if (supported) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.REQUIRES_DEVICE_OWNER
            },
            evidence = if (supported) {
                "SecureDroid is operating with Android management authority."
            } else {
                "SecureDroid is operating as a normal application."
            },
            securityMeaning = "Managed mode can expose Android Enterprise application-management policies.",
            limitations = "Normal mode cannot arbitrarily disable, uninstall, or administratively control other applications.",
            remediation = if (!supported) {
                "Provision SecureDroid with Android Enterprise management authority."
            } else {
                null
            },
            provider = CapabilityProvider.DEVICE_POLICY_MANAGER,
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.DEVICE_OWNER,
            implementationLayer = ImplementationLayer.PLATFORM
        )
    }

    private fun detectDevicePolicyCapability(
        mode: SecureDroidMode
    ): Capability {

        val supported = mode == SecureDroidMode.DEVICE_OWNER ||
            mode == SecureDroidMode.MANAGED_PROFILE

        return Capability(
            id = CapabilityIds.DEVICE_POLICY,
            name = "Android device policy",
            category = CapabilityCategory.DEVICE_MANAGEMENT,
            state = if (supported) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.REQUIRES_DEVICE_OWNER
            },
            evidence = if (supported) {
                "Android management ownership/profile state is active."
            } else {
                "No Android management ownership is active for SecureDroid."
            },
            securityMeaning = "SecureDroid can use the Android DevicePolicyManager within the authority granted by Android.",
            limitations = "Policies are restricted by Android version, ownership mode, OEM behavior, and available DevicePolicyManager APIs.",
            remediation = if (!supported) {
                "Provision SecureDroid as Device Owner or Profile Owner."
            } else {
                null
            },
            provider = CapabilityProvider.DEVICE_POLICY_MANAGER,
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.DEVICE_OWNER,
            implementationLayer = ImplementationLayer.PLATFORM
        )
    }

    private fun detectHardwareSecurityCapability(): Capability {

        val status = try {
            val keyStore = KeyStore.getInstance("AndroidKeyStore")
            keyStore.load(null)

            val keyGenerator = KeyGenerator.getInstance(
                KeyProperties.KEY_ALGORITHM_AES,
                "AndroidKeyStore"
            )

            val alias = "securedroid_hw_test"

            val spec = android.security.keystore.KeyGenParameterSpec.Builder(
                alias,
                KeyProperties.PURPOSE_ENCRYPT or
                    KeyProperties.PURPOSE_DECRYPT
            )
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256)
                .build()

            keyGenerator.init(spec)

            val secretKey: SecretKey = keyGenerator.generateKey()

            val keyStoreEntry = keyStore.getEntry(alias, null)

            keyStore.deleteEntry(alias)

            if (keyStoreEntry is KeyStore.SecretKeyEntry) {
                val keyFactory = java.security.KeyFactory.getInstance(
                    secretKey.algorithm,
                    "AndroidKeyStore"
                )

                val keyInfo = keyFactory.getKeySpec(
                    secretKey,
                    KeyInfo::class.java
                ) as KeyInfo

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    if (keyInfo.isInsideSecureHardware) {
                        CapabilityState.SUPPORTED
                    } else {
                        CapabilityState.LIMITED
                    }
                } else {
                    if (keyInfo.isInsideSecureHardware) {
                        CapabilityState.SUPPORTED
                    } else {
                        CapabilityState.UNKNOWN
                    }
                }
            } else {
                CapabilityState.UNKNOWN
            }

        } catch (_: Exception) {
            CapabilityState.UNKNOWN
        }

        return Capability(
            id = CapabilityIds.HARDWARE_BACKED_KEYSTORE,
            name = "Hardware-backed Keystore key",
            category = CapabilityCategory.HARDWARE_SECURITY,
            state = status,
            evidence = when (status) {
                CapabilityState.SUPPORTED ->
                    "A generated Android Keystore test key reports secure hardware backing."

                CapabilityState.LIMITED ->
                    "Android Keystore is available, but the generated test key reports no secure-hardware backing."

                else ->
                    "Secure hardware backing could not be conclusively determined."
            },
            securityMeaning = "SecureDroid can determine whether Android reports hardware-backed protection for a test Keystore key.",
            limitations = "This does not prove the presence or security level of StrongBox, Verified Boot, AVB, SELinux, or other system security components.",
            remediation = null,
            provider = CapabilityProvider.ANDROID_KEYSTORE,
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.HARDWARE,
            implementationLayer = ImplementationLayer.HARDWARE
        )
    }
}
