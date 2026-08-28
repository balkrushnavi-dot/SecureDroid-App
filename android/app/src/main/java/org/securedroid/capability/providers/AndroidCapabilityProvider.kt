package org.securedroid.capability.providers

import android.app.KeyguardManager
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.UserManager
import android.security.keystore.KeyInfo
import android.security.keystore.KeyProperties
import android.security.keystore.KeyGenParameterSpec
import java.security.KeyStore
import javax.crypto.KeyGenerator

import org.securedroid.capability.Capability
import org.securedroid.capability.CapabilityCategory
import org.securedroid.capability.CapabilityIds
import org.securedroid.capability.CapabilityState
import org.securedroid.capability.ImplementationLayer
import org.securedroid.capability.RequiredPrivilege

class AndroidCapabilityProvider(
private val context: Context
) : CapabilityProvider {

override val id: String = "android"
override val name: String = "Android Capability Provider"

override fun getCapabilities(): List<Capability> {
    return listOf(
        evaluateAndroidVersion(),
        evaluateKeystore(),
        evaluateStrongBox(),
        evaluateSecureLockScreen(),
        evaluateUserUnlocked()
    )
}

private fun evaluateAndroidVersion(): Capability {
    return Capability(
        id = "android.platform.version",
        name = "Android Platform",
        category = CapabilityCategory.SYSTEM,
        state = CapabilityState.SUPPORTED,
        evidence = "API ${Build.VERSION.SDK_INT} (${Build.VERSION.RELEASE})",
        securityMeaning = "SecureDroid is running on a real Android platform.",
        limitations = null,
        remediation = null,
        provider = id,
        isReal = true,
        canAppChange = false,
        requiredPrivilege = RequiredPrivilege.NONE,
        implementationLayer = ImplementationLayer.ANDROID_API
    )
}

private fun evaluateKeystore(): Capability {
    return try {
        val keyStore = KeyStore.getInstance("AndroidKeyStore")
        keyStore.load(null)

        Capability(
            id = CapabilityIds.KEYSTORE,
            name = "Android Keystore",
            category = CapabilityCategory.STORAGE,
            state = CapabilityState.SUPPORTED,
            evidence = "AndroidKeyStore initialized successfully.",
            securityMeaning = "SecureDroid can use Android's application-accessible hardware/software-backed key storage.",
            limitations = "Keystore availability does not by itself prove that every key is hardware-backed.",
            remediation = null,
            provider = id,
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.NONE,
            implementationLayer = ImplementationLayer.HARDWARE
        )
    } catch (e: Exception) {
        Capability(
            id = CapabilityIds.KEYSTORE,
            name = "Android Keystore",
            category = CapabilityCategory.STORAGE,
            state = CapabilityState.UNAVAILABLE,
            evidence = e.javaClass.simpleName,
            securityMeaning = "SecureDroid could not initialize Android Keystore.",
            limitations = "Encrypted features relying on Android Keystore may be unavailable.",
            remediation = "Retry after restarting the device.",
            provider = id,
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.NONE,
            implementationLayer = ImplementationLayer.HARDWARE
        )
    }
}

private fun evaluateStrongBox(): Capability {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) {
        return Capability(
            id = CapabilityIds.STRONGBOX,
            name = "StrongBox Keymaster",
            category = CapabilityCategory.HARDWARE,
            state = CapabilityState.UNAVAILABLE,
            evidence = "StrongBox APIs require Android 9 / API 28 or newer.",
            securityMeaning = "StrongBox-backed keys cannot be requested on this Android version.",
            limitations = "The device may still have other secure key-storage mechanisms.",
            remediation = "Use a device running Android 9 or newer.",
            provider = id,
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.NONE,
            implementationLayer = ImplementationLayer.HARDWARE
        )
    }

    return try {
        val alias = "securedroid_capability_test_key"

        val keyStore = KeyStore.getInstance("AndroidKeyStore")
        keyStore.load(null)

        if (keyStore.containsAlias(alias)) {
            keyStore.deleteEntry(alias)
        }

        val keyGenerator = KeyGenerator.getInstance(
            KeyProperties.KEY_ALGORITHM_AES,
            "AndroidKeyStore"
        )

        val spec = KeyGenParameterSpec.Builder(
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
        val key = keyGenerator.generateKey()

        var hardwareBacked = false

        try {
            val keyFactory = java.security.KeyFactory.getInstance(
                key.algorithm,
                "AndroidKeyStore"
            )

            val keyInfo = keyFactory.getKeySpec(
                key,
                KeyInfo::class.java
            ) as KeyInfo

            hardwareBacked =
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    keyInfo.securityLevel >=
                        KeyProperties.SECURITY_LEVEL_TRUSTED_ENVIRONMENT
                } else {
                    @Suppress("DEPRECATION")
                    keyInfo.isInsideSecureHardware
                }
        } catch (_: Exception) {
            /*
             * Successful StrongBox key generation is already strong
             * evidence that the requested StrongBox-backed key was
             * accepted by the platform.
             */
            hardwareBacked = true
        } finally {
            try {
                keyStore.deleteEntry(alias)
            } catch (_: Exception) {
            }
        }

        if (hardwareBacked) {
            Capability(
                id = CapabilityIds.STRONGBOX,
                name = "StrongBox Keymaster",
                category = CapabilityCategory.HARDWARE,
                state = CapabilityState.SUPPORTED,
                evidence = "StrongBox-backed AES key was successfully generated.",
                securityMeaning = "The device accepted a key-generation request backed by StrongBox or an equivalent secure hardware security level.",
                limitations = null,
                remediation = null,
                provider = id,
                isReal = true,
                canAppChange = false,
                requiredPrivilege = RequiredPrivilege.NONE,
                implementationLayer = ImplementationLayer.HARDWARE
            )
        } else {
            Capability(
                id = CapabilityIds.STRONGBOX,
                name = "StrongBox Keymaster",
                category = CapabilityCategory.HARDWARE,
                state = CapabilityState.UNKNOWN,
                evidence = "StrongBox key generation succeeded, but hardware security level could not be independently verified.",
                securityMeaning = "SecureDroid cannot make a stronger hardware-backed claim.",
                limitations = "Hardware security level verification was inconclusive.",
                remediation = null,
                provider = id,
                isReal = true,
                canAppChange = false,
                requiredPrivilege = RequiredPrivilege.NONE,
                implementationLayer = ImplementationLayer.HARDWARE
            )
        }
    } catch (e: Exception) {
        Capability(
            id = CapabilityIds.STRONGBOX,
            name = "StrongBox Keymaster",
            category = CapabilityCategory.HARDWARE,
            state = CapabilityState.UNAVAILABLE,
            evidence = e.javaClass.simpleName,
            securityMeaning = "SecureDroid could not create a StrongBox-backed test key.",
            limitations = "This does not prove that the device has no secure hardware; the API request may simply be unsupported or restricted.",
            remediation = null,
            provider = id,
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.NONE,
            implementationLayer = ImplementationLayer.HARDWARE
        )
    }
}

private fun evaluateSecureLockScreen(): Capability {
    val keyguardManager =
        context.getSystemService(Context.KEYGUARD_SERVICE)
            as? KeyguardManager

    if (keyguardManager == null) {
        return Capability(
            id = CapabilityIds.SECURE_LOCK_SCREEN,
            name = "Secure Lock Screen",
            category = CapabilityCategory.AUTHENTICATION,
            state = CapabilityState.UNKNOWN,
            evidence = "KeyguardManager unavailable.",
            securityMeaning = "SecureDroid cannot determine whether a secure lock screen is configured.",
            limitations = "Android did not provide the required system service.",
            remediation = null,
            provider = id,
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.NONE,
            implementationLayer = ImplementationLayer.ANDROID_API
        )
    }

    val secure = keyguardManager.isKeyguardSecure

    return Capability(
        id = CapabilityIds.SECURE_LOCK_SCREEN,
        name = "Secure Lock Screen",
        category = CapabilityCategory.AUTHENTICATION,
        state = if (secure) {
            CapabilityState.SUPPORTED
        } else {
            CapabilityState.UNAVAILABLE
        },
        evidence = "Keyguard secure state: $secure",
        securityMeaning = if (secure) {
            "A PIN, password, pattern, or equivalent secure lock is configured."
        } else {
            "No secure lock screen is configured."
        },
        limitations = if (secure) {
            null
        } else {
            "Device physical-access protection is weaker."
        },
        remediation = if (secure) {
            null
        } else {
            "Configure a secure screen lock in Android Settings."
        },
        provider = id,
        isReal = true,
        canAppChange = false,
        requiredPrivilege = RequiredPrivilege.NONE,
        implementationLayer = ImplementationLayer.ANDROID_API
    )
}

private fun evaluateUserUnlocked(): Capability {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
        return Capability(
            id = "android.user.unlocked",
            name = "User Unlock State",
            category = CapabilityCategory.SYSTEM,
            state = CapabilityState.UNKNOWN,
            evidence = "Direct user-unlock API requires Android 7 / API 24.",
            securityMeaning = "SecureDroid cannot reliably query the direct user-unlock state.",
            limitations = "Legacy Android version.",
            remediation = null,
            provider = id,
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.NONE,
            implementationLayer = ImplementationLayer.ANDROID_API
        )
    }

    val userManager =
        context.getSystemService(UserManager::class.java)

    if (userManager == null) {
        return Capability(
            id = "android.user.unlocked",
            name = "User Unlock State",
            category = CapabilityCategory.SYSTEM,
            state = CapabilityState.UNKNOWN,
            evidence = "UserManager unavailable.",
            securityMeaning = "SecureDroid cannot determine the current user unlock state.",
            limitations = "Required Android system service is unavailable.",
            remediation = null,
            provider = id,
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.NONE,
            implementationLayer = ImplementationLayer.ANDROID_API
        )
    }

    val unlocked = userManager.isUserUnlocked

    return Capability(
        id = "android.user.unlocked",
        name = "User Unlock State",
        category = CapabilityCategory.SYSTEM,
        state = if (unlocked) {
            CapabilityState.SUPPORTED
        } else {
            CapabilityState.LIMITED
        },
        evidence = "UserManager.isUserUnlocked = $unlocked",
        securityMeaning = if (unlocked) {
            "Credential-protected user storage is currently available."
        } else {
            "The user has not unlocked the device after boot."
        },
        limitations = if (unlocked) {
            null
        } else {
            "Some credential-protected operations may be unavailable until first unlock."
        },
        remediation = if (unlocked) {
            null
        } else {
            "Unlock the device."
        },
        provider = id,
        isReal = true,
        canAppChange = false,
        requiredPrivilege = RequiredPrivilege.NONE,
        implementationLayer = ImplementationLayer.ANDROID_API
    )
}

}
