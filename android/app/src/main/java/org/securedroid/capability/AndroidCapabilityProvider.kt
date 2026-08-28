package org.securedroid.capability

import android.app.KeyguardManager
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.UserManager
import android.provider.Settings
import androidx.biometric.BiometricManager

/**
 * Android-specific capability provider.
 *
 * This class only reports capabilities that can be evidenced through
 * public Android APIs. It does not assume root, system privileges,
 * kernel access, or undocumented OEM behavior.
 */
class AndroidCapabilityProvider(
    private val context: Context
) {

    private val packageManager: PackageManager =
        context.packageManager

    private val userManager: UserManager? =
        context.getSystemService(Context.USER_SERVICE)

    private val keyguardManager: KeyguardManager? =
        context.getSystemService(Context.KEYGUARD_SERVICE)

    /**
     * Returns the Android platform capabilities that can be detected
     * without elevated privileges.
     */
    fun getCapabilities(): List<Capability> {
        return listOf(
            detectSecureLockScreen(),
            detectBiometric(),
            detectUsbDebugging(),
            detectDeveloperOptions(),
            detectSecurityPatch(),
            detectUserUnlocked(),
            detectPackageVisibility(),
            detectVpnService()
        )
    }

    /**
     * Secure lock screen.
     *
     * isKeyguardSecure means Android has a secure credential configured.
     * It does NOT prove resistance to advanced physical attacks.
     */
    private fun detectSecureLockScreen(): Capability {

        val secure = try {
            keyguardManager?.isKeyguardSecure
        } catch (_: Exception) {
            null
        }

        return Capability(
            id = "android_secure_lock_screen",
            name = "Secure lock screen",
            category = CapabilityCategory.AUTHENTICATION,
            state = when (secure) {
                true -> CapabilityState.SUPPORTED
                false -> CapabilityState.LIMITED
                null -> CapabilityState.UNKNOWN
            },
            evidence = when (secure) {
                true ->
                    "Android reports that a secure keyguard credential is configured."

                false ->
                    "Android reports that no secure keyguard credential is configured."

                null ->
                    "Secure keyguard state could not be determined."
            },
            securityMeaning =
                "A secure lock screen provides protection against casual unauthorized physical access.",
            limitations =
                "This does not prove protection against advanced physical extraction or hardware attacks.",
            remediation =
                if (secure == false) {
                    "Configure a PIN, password, or another supported secure screen lock."
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

    /**
     * Modern biometric capability detection.
     */
    private fun detectBiometric(): Capability {

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            return Capability(
                id = "android_biometric",
                name = "Biometric authentication",
                category = CapabilityCategory.AUTHENTICATION,
                state = CapabilityState.UNAVAILABLE,
                evidence =
                    "This Android version does not support the biometric APIs required by SecureDroid.",
                securityMeaning =
                    "SecureDroid cannot use Android biometric authentication on this platform.",
                limitations =
                    "Requires a newer Android platform.",
                remediation = null,
                provider = CapabilityProvider.ANDROID,
                isReal = true,
                canAppChange = false,
                requiredPrivilege = RequiredPrivilege.NORMAL_APP,
                implementationLayer = ImplementationLayer.APPLICATION
            )
        }

        val result = try {
            BiometricManager
                .from(context)
                .canAuthenticate(
                    BiometricManager.Authenticators.BIOMETRIC_STRONG or
                        BiometricManager.Authenticators.BIOMETRIC_WEAK
                )
        } catch (_: Exception) {
            return Capability(
                id = "android_biometric",
                name = "Biometric authentication",
                category = CapabilityCategory.AUTHENTICATION,
                state = CapabilityState.UNKNOWN,
                evidence =
                    "Android biometric capability could not be determined.",
                securityMeaning =
                    "SecureDroid cannot conclusively determine biometric availability.",
                limitations =
                    "The platform did not return a usable biometric status.",
                remediation = null,
                provider = CapabilityProvider.ANDROID,
                isReal = true,
                canAppChange = false,
                requiredPrivilege = RequiredPrivilege.NORMAL_APP,
                implementationLayer = ImplementationLayer.APPLICATION
            )
        }

        val state = when (result) {

            BiometricManager.BIOMETRIC_SUCCESS ->
                CapabilityState.SUPPORTED

            BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED ->
                CapabilityState.LIMITED

            BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE ->
                CapabilityState.UNAVAILABLE

            BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE ->
                CapabilityState.LIMITED

            else ->
                CapabilityState.UNKNOWN
        }

        val evidence = when (result) {

            BiometricManager.BIOMETRIC_SUCCESS ->
                "Android reports that biometric authentication is available."

            BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED ->
                "Biometric authentication is supported, but no biometric credential is enrolled."

            BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE ->
                "Android reports that no biometric hardware is available."

            BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE ->
                "Biometric hardware exists but is currently unavailable."

            else ->
                "Android returned biometric status code $result."
        }

        return Capability(
            id = "android_biometric",
            name = "Biometric authentication",
            category = CapabilityCategory.AUTHENTICATION,
            state = state,
            evidence = evidence,
            securityMeaning =
                "SecureDroid can use Android's BiometricPrompt authentication framework.",
            limitations =
                "SecureDroid does not control the biometric sensor or Android's underlying biometric implementation.",
            remediation =
                if (state == CapabilityState.LIMITED) {
                    "Enroll a supported biometric in Android Security settings."
                } else {
                    null
                },
            provider = CapabilityProvider.ANDROID,
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.USER_ACTION,
            implementationLayer = ImplementationLayer.APPLICATION
        )
    }

    /**
     * USB debugging state.
     *
     * This is informational only. SecureDroid does not disable ADB
     * in Normal Mode.
     */
    private fun detectUsbDebugging(): Capability {

        val enabled = try {
            Settings.Global.getInt(
                context.contentResolver,
                Settings.Global.ADB_ENABLED,
                0
            ) == 1
        } catch (_: Exception) {
            return Capability(
                id = "android_usb_debugging",
                name = "USB debugging",
                category = CapabilityCategory.SYSTEM_SECURITY,
                state = CapabilityState.UNKNOWN,
                evidence =
                    "Android did not expose the current ADB setting.",
                securityMeaning =
                    "USB debugging can increase the attack surface when physical and authorization controls are weak.",
                limitations =
                    "SecureDroid cannot assume that ADB is disabled simply because the setting cannot be read.",
                remediation =
                    "Review Developer Options and USB debugging settings.",
                provider = CapabilityProvider.ANDROID,
                isReal = true,
                canAppChange = false,
                requiredPrivilege = RequiredPrivilege.USER_ACTION,
                implementationLayer = ImplementationLayer.PLATFORM
            )
        }

        return Capability(
            id = "android_usb_debugging",
            name = "USB debugging",
            category = CapabilityCategory.SYSTEM_SECURITY,
            state = if (enabled) {
                CapabilityState.LIMITED
            } else {
                CapabilityState.SUPPORTED
            },
            evidence = if (enabled) {
                "Android reports that ADB/USB debugging is enabled."
            } else {
                "Android reports that ADB/USB debugging is disabled."
            },
            securityMeaning =
                "USB debugging exposes Android debugging functionality that can increase device attack surface.",
            limitations =
                "SecureDroid does not control ADB in Normal Mode.",
            remediation =
                if (enabled) {
                    "Disable USB debugging in Developer Options when it is not required."
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

    /**
     * Developer Options state.
     *
     * This is not automatically a vulnerability. It is an observable
     * device configuration signal.
     */
    private fun detectDeveloperOptions(): Capability {

        val enabled = try {
            Settings.Global.getInt(
                context.contentResolver,
                Settings.Global.DEVELOPMENT_SETTINGS_ENABLED,
                0
            ) == 1
        } catch (_: Exception) {
            return Capability(
                id = "android_developer_options",
                name = "Developer Options",
                category = CapabilityCategory.SYSTEM_SECURITY,
                state = CapabilityState.UNKNOWN,
                evidence =
                    "Developer Options state could not be determined.",
                securityMeaning =
                    "Developer Options expose additional development and debugging controls.",
                limitations =
                    "Presence of Developer Options alone does not prove that the device is compromised.",
                remediation =
                    "Review Developer Options if they are not intentionally enabled.",
                provider = CapabilityProvider.ANDROID,
                isReal = true,
                canAppChange = false,
                requiredPrivilege = RequiredPrivilege.USER_ACTION,
                implementationLayer = ImplementationLayer.PLATFORM
            )
        }

        return Capability(
            id = "android_developer_options",
            name = "Developer Options",
            category = CapabilityCategory.SYSTEM_SECURITY,
            state = if (enabled) {
                CapabilityState.LIMITED
            } else {
                CapabilityState.SUPPORTED
            },
            evidence = if (enabled) {
                "Android reports that Developer Options are enabled."
            } else {
                "Android reports that Developer Options are disabled."
            },
            securityMeaning =
                "Developer Options expose additional debugging and development controls.",
            limitations =
                "Developer Options being enabled is not evidence of malware or compromise.",
            remediation =
                if (enabled) {
                    "Disable Developer Options if they are not needed."
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

    /**
     * Android security patch level.
     *
     * SecureDroid reports the actual patch string instead of inventing
     * a binary secure/insecure result.
     */
    private fun detectSecurityPatch(): Capability {

        val patch = try {
            Build.VERSION.SECURITY_PATCH
        } catch (_: Exception) {
            ""
        }

        if (patch.isBlank() || patch.startsWith("1970")) {
            return Capability(
                id = "android_security_patch",
                name = "Android security patch",
                category = CapabilityCategory.SYSTEM_SECURITY,
                state = CapabilityState.UNKNOWN,
                evidence =
                    "Android did not expose a valid security patch level.",
                securityMeaning =
                    "SecureDroid cannot reliably determine the device's patch level.",
                limitations =
                    "Patch freshness cannot be established without a valid patch date.",
                remediation =
                    "Check Android System Update settings.",
                provider = CapabilityProvider.ANDROID,
                isReal = true,
                canAppChange = false,
                requiredPrivilege = RequiredPrivilege.USER_ACTION,
                implementationLayer = ImplementationLayer.PLATFORM
            )
        }

        return Capability(
            id = "android_security_patch",
            name = "Android security patch",
            category = CapabilityCategory.SYSTEM_SECURITY,
            state = CapabilityState.SUPPORTED,
            evidence =
                "Android reports security patch level: $patch",
            securityMeaning =
                "The reported patch level provides evidence of the Android security-update state.",
            limitations =
                "SecureDroid does not independently verify every security fix represented by the patch date.",
            remediation =
                "Install available Android security updates when offered.",
            provider = CapabilityProvider.ANDROID,
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.USER_ACTION,
            implementationLayer = ImplementationLayer.PLATFORM
        )
    }

    /**
     * User-unlocked state.
     *
     * This MUST NOT be interpreted as encryption status.
     */
    private fun detectUserUnlocked(): Capability {

        val unlocked = try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                userManager?.isUserUnlocked
            } else {
                null
            }
        } catch (_: Exception) {
            null
        }

        return Capability(
            id = "android_user_unlocked",
            name = "User unlocked state",
            category = CapabilityCategory.SYSTEM_SECURITY,
            state = when (unlocked) {
                true -> CapabilityState.SUPPORTED
                false -> CapabilityState.LIMITED
                null -> CapabilityState.UNKNOWN
            },
            evidence = when (unlocked) {
                true ->
                    "Android reports that the current user is unlocked."

                false ->
                    "Android reports that the current user is currently locked."

                null ->
                    "Current user unlock state could not be determined."
            },
            securityMeaning =
                "The state determines whether credential-protected user data is currently available to applications.",
            limitations =
                "This is NOT evidence that device storage is encrypted.",
            remediation = null,
            provider = CapabilityProvider.ANDROID,
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.NORMAL_APP,
            implementationLayer = ImplementationLayer.PLATFORM
        )
    }

    /**
     * Package visibility.
     *
     * SecureDroid may only see packages allowed by Android package
     * visibility rules and manifest declarations.
     */
    private fun detectPackageVisibility(): Capability {

        val canQueryPackages = try {
            packageManager.getInstalledPackages(
                PackageManager.GET_META_DATA
            )
            true
        } catch (_: SecurityException) {
            false
        } catch (_: Exception) {
            false
        }

        return Capability(
            id = "android_package_visibility",
            name = "Installed application visibility",
            category = CapabilityCategory.APPLICATION_MANAGEMENT,
            state = if (canQueryPackages) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.LIMITED
            },
            evidence = if (canQueryPackages) {
                "Android allowed SecureDroid to query installed package information."
            } else {
                "Android restricted installed-package information."
            },
            securityMeaning =
                "SecureDroid can inspect applications visible through Android's package-management APIs.",
            limitations =
                "Android package visibility restrictions may prevent SecureDroid from seeing every package unless appropriate manifest visibility is declared.",
            remediation = null,
            provider = CapabilityProvider.ANDROID,
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.NORMAL_APP,
            implementationLayer = ImplementationLayer.PLATFORM
        )
    }

    /**
     * Checks whether the platform exposes Android's VPN service.
     */
    private fun detectVpnService(): Capability {

        val vpnAvailable = try {
            context.packageManager.hasSystemFeature(
                PackageManager.FEATURE_TELEPHONY
            ) || Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP
        } catch (_: Exception) {
            false
        }

        return Capability(
            id = CapabilityIds.VPN_SERVICE,
            name = "Application-level VPN",
            category = CapabilityCategory.NETWORK,
            state = if (vpnAvailable) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.UNAVAILABLE
            },
            evidence = if (vpnAvailable) {
                "Android exposes the VpnService API required by SecureDroid."
            } else {
                "Required Android VPN functionality could not be confirmed."
            },
            securityMeaning =
                "SecureDroid can implement application-level network filtering through Android VpnService.",
            limitations =
                "VpnService is not equivalent to a kernel firewall. It also does not automatically provide encrypted internet transport.",
            remediation = null,
            provider = CapabilityProvider.ANDROID,
            isReal = true,
            canAppChange = true,
            requiredPrivilege = RequiredPrivilege.USER_APPROVAL,
            implementationLayer = ImplementationLayer.VPN
        )
    }

    /**
     * Returns a single capability by ID.
     */
    fun getCapability(id: String): Capability? {
        return getCapabilities().firstOrNull {
            it.id == id
        }
    }

    /**
     * Returns the Android API level.
     */
    fun getApiLevel(): Int {
        return Build.VERSION.SDK_INT
    }

    /**
     * Returns the Android release string.
     */
    fun getAndroidRelease(): String {
        return Build.VERSION.RELEASE ?: "unknown"
    }

    /**
     * Returns the device security patch string.
     */
    fun getSecurityPatchLevel(): String {
        return Build.VERSION.SECURITY_PATCH
    }
}
