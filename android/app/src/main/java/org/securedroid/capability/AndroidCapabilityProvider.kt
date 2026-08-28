package org.securedroid.capability

import android.app.KeyguardManager
import android.content.Context
import android.os.Build
import android.os.UserManager
import android.security.keystore.KeyInfo
import android.security.keystore.KeyProperties
import java.security.KeyStore
import javax.crypto.KeyGenerator

class AndroidCapabilityProvider(
    private val context: Context
) : CapabilityProvider {

    override fun getMode(): SecureDroidMode {
        return SecureDroidMode.UNKNOWN
    }

    override fun getCapabilities(): List<SecurityCapability> {
        return listOf(
            screenLockCapability(),
            androidKeystoreCapability(),
            strongBoxCapability(),
            hardwareBackedKeyCapability(),
            userUnlockedCapability(),
            verifiedBootCapability(),
            selinuxCapability()
        )
    }

    private fun screenLockCapability(): SecurityCapability {
        val keyguardManager =
            context.getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager

        val secure = keyguardManager?.isKeyguardSecure == true

        return SecurityCapability(
            id = "SCREEN_LOCK",
            name = "Secure Screen Lock",
            category = "DEVICE_SECURITY",
            state = if (secure) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.LIMITED
            },
            evidence = if (secure) {
                "Keyguard reports a secure lock method is configured."
            } else {
                "Keyguard does not report a secure lock method."
            },
            securityMeaning = "A secure screen lock protects device access.",
            limitations = null,
            remediation = if (!secure) {
                "Configure a PIN, password, or supported secure biometric lock."
            } else {
                null
            },
            provider = "AndroidCapabilityProvider",
            isReal = true,
            canAppChange = false,
            requiredPrivilege = null,
            implementationLayer = "ANDROID_API"
        )
    }

    private fun androidKeystoreCapability(): SecurityCapability {
        val available = try {
            val keyStore = KeyStore.getInstance("AndroidKeyStore")
            keyStore.load(null)
            true
        } catch (_: Exception) {
            false
        }

        return SecurityCapability(
            id = "ANDROID_KEYSTORE",
            name = "Android Keystore",
            category = "CRYPTOGRAPHY",
            state = if (available) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.UNAVAILABLE
            },
            evidence = if (available) {
                "Android Keystore initialized successfully."
            } else {
                "Android Keystore could not be initialized."
            },
            securityMeaning = "Provides platform-managed cryptographic key storage.",
            limitations = null,
            remediation = null,
            provider = "AndroidCapabilityProvider",
            isReal = true,
            canAppChange = false,
            requiredPrivilege = null,
            implementationLayer = "ANDROID_KEYSTORE"
        )
    }

    private fun strongBoxCapability(): SecurityCapability {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) {
            return SecurityCapability(
                id = "STRONGBOX",
                name = "StrongBox",
                category = "HARDWARE_SECURITY",
                state = CapabilityState.UNAVAILABLE,
                evidence = "StrongBox APIs require Android 9 / API 28 or newer.",
                securityMeaning = "StrongBox can provide hardware-backed isolated key storage.",
                limitations = "The Android version does not expose StrongBox support.",
                remediation = "Use a device with StrongBox support.",
                provider = "AndroidCapabilityProvider",
                isReal = true,
                canAppChange = false,
                requiredPrivilege = null,
                implementationLayer = "HARDWARE"
            )
        }

        val supported = try {
            val keyGenerator = KeyGenerator.getInstance(
                KeyProperties.KEY_ALGORITHM_AES,
                "AndroidKeyStore"
            )

            val alias = "securedroid_strongbox_probe"

            val keyStore = KeyStore.getInstance("AndroidKeyStore")
            keyStore.load(null)

            if (keyStore.containsAlias(alias)) {
                keyStore.deleteEntry(alias)
            }

            val spec =
                android.security.keystore.KeyGenParameterSpec.Builder(
                    alias,
                    KeyProperties.PURPOSE_ENCRYPT or
                        KeyProperties.PURPOSE_DECRYPT
                )
                    .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                    .setEncryptionPaddings(
                        KeyProperties.ENCRYPTION_PADDING_NONE
                    )
                    .setKeySize(256)
                    .setIsStrongBoxBacked(true)
                    .build()

            keyGenerator.init(spec)
            keyGenerator.generateKey()

            keyStore.deleteEntry(alias)

            true
        } catch (_: Exception) {
            false
        }

        return SecurityCapability(
            id = "STRONGBOX",
            name = "StrongBox",
            category = "HARDWARE_SECURITY",
            state = if (supported) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.UNAVAILABLE
            },
            evidence = if (supported) {
                "A StrongBox-backed AES key could be generated successfully."
            } else {
                "StrongBox-backed key generation was not available."
            },
            securityMeaning = "Provides stronger hardware-isolated key protection when supported.",
            limitations = if (!supported) {
                "This device/API combination did not provide usable StrongBox-backed AES key generation."
            } else {
                null
            },
            remediation = null,
            provider = "AndroidCapabilityProvider",
            isReal = true,
            canAppChange = false,
            requiredPrivilege = "STRONGBOX_HARDWARE",
            implementationLayer = "HARDWARE"
        )
    }

    private fun hardwareBackedKeyCapability(): SecurityCapability {
        val result = try {
            val keyStore = KeyStore.getInstance("AndroidKeyStore")
            keyStore.load(null)

            val alias = "securedroid_hardware_probe"

            if (keyStore.containsAlias(alias)) {
                keyStore.deleteEntry(alias)
            }

            val generator = KeyGenerator.getInstance(
                KeyProperties.KEY_ALGORITHM_AES,
                "AndroidKeyStore"
            )

            val spec =
                android.security.keystore.KeyGenParameterSpec.Builder(
                    alias,
                    KeyProperties.PURPOSE_ENCRYPT or
                        KeyProperties.PURPOSE_DECRYPT
                )
                    .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                    .setEncryptionPaddings(
                        KeyProperties.ENCRYPTION_PADDING_NONE
                    )
                    .setKeySize(256)
                    .build()

            generator.init(spec)

            val key = generator.generateKey()

            val keyFactory =
                java.security.KeyFactory.getInstance(
                    key.algorithm,
                    "AndroidKeyStore"
                )

            val keyInfo =
                keyFactory.getKeySpec(
                    key,
                    KeyInfo::class.java
                ) as KeyInfo

            val hardwareBacked =
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    keyInfo.securityLevel ==
                        KeyProperties.SECURITY_LEVEL_TRUSTED_ENVIRONMENT ||
                        keyInfo.securityLevel ==
                        KeyProperties.SECURITY_LEVEL_STRONGBOX
                } else {
                    @Suppress("DEPRECATION")
                    keyInfo.isInsideSecureHardware
                }

            keyStore.deleteEntry(alias)

            hardwareBacked
        } catch (_: Exception) {
            false
        }

        return SecurityCapability(
            id = "HARDWARE_BACKED_KEYS",
            name = "Hardware-Backed Cryptographic Keys",
            category = "HARDWARE_SECURITY",
            state = if (result) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.UNKNOWN
            },
            evidence = if (result) {
                "Generated probe key reports a hardware-backed security level."
            } else {
                "A hardware-backed key could not be positively verified."
            },
            securityMeaning = "Keys can be protected by Android's hardware-backed keystore when supported.",
            limitations = if (!result) {
                "Secure hardware backing could not be positively established."
            } else {
                null
            },
            remediation = null,
            provider = "AndroidCapabilityProvider",
            isReal = true,
            canAppChange = false,
            requiredPrivilege = "HARDWARE_KEYSTORE",
            implementationLayer = "ANDROID_KEYSTORE"
        )
    }

    private fun userUnlockedCapability(): SecurityCapability {
        val userManager =
            context.getSystemService(Context.USER_SERVICE) as? UserManager

        val unlocked = userManager?.isUserUnlocked ?: false

        return SecurityCapability(
            id = "USER_UNLOCKED",
            name = "User Storage Unlocked",
            category = "DEVICE_STATE",
            state = if (unlocked) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.LIMITED
            },
            evidence = if (unlocked) {
                "Android reports that the current user is unlocked."
            } else {
                "Android reports that the current user is locked."
            },
            securityMeaning = "Determines whether credential-protected user storage is currently accessible.",
            limitations = null,
            remediation = if (!unlocked) {
                "Unlock the device."
            } else {
                null
            },
            provider = "AndroidCapabilityProvider",
            isReal = true,
            canAppChange = false,
            requiredPrivilege = null,
            implementationLayer = "ANDROID_API"
        )
    }

    private fun verifiedBootCapability(): SecurityCapability {
        return SecurityCapability(
            id = "VERIFIED_BOOT",
            name = "Verified Boot",
            category = "PLATFORM_INTEGRITY",
            state = CapabilityState.UNKNOWN,
            evidence = "A normal application does not have sufficient authority to independently establish the complete boot-chain integrity state.",
            securityMeaning = "Verified Boot protects the Android boot chain against unauthorized modification.",
            limitations = "SecureDroid does not claim direct verification of the device's complete Verified Boot state.",
            remediation = null,
            provider = "AndroidCapabilityProvider",
            isReal = false,
            canAppChange = false,
            requiredPrivilege = "OS_INTEGRATION",
            implementationLayer = "OS"
        )
    }

    private fun selinuxCapability(): SecurityCapability {
        return SecurityCapability(
            id = "SELINUX_ENFORCING",
            name = "SELinux Enforcement",
            category = "PLATFORM_INTEGRITY",
            state = CapabilityState.UNKNOWN,
            evidence = "SecureDroid does not have authoritative OS-level access to independently attest the complete SELinux enforcement state.",
            securityMeaning = "SELinux provides mandatory access controls within Android.",
            limitations = "Do not display SELinux as verified unless an authoritative Android API or trusted attestation source provides evidence.",
            remediation = null,
            provider = "AndroidCapabilityProvider",
            isReal = false,
            canAppChange = false,
            requiredPrivilege = "OS_INTEGRATION",
            implementationLayer = "OS"
        )
    }
}
