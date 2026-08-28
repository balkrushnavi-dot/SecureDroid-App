package org.securedroid.diagnostics

import android.app.KeyguardManager
import android.app.admin.DevicePolicyManager
import android.content.Context
import android.hardware.biometrics.BiometricManager
import android.os.Build
import android.os.UserManager
import android.provider.Settings
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyInfo
import android.security.keystore.KeyProperties
import java.security.KeyStore
import javax.crypto.KeyGenerator

enum class DiagnosticState {
    YES,
    NO,
    UNKNOWN
}

class DeviceDiagnostics(
    private val context: Context
) {

    data class DeviceSecurityStatus(
        val hasScreenLock: Boolean,
        val encryptionState: DiagnosticState,
        val securityPatchLevel: String,
        val usbDebuggingEnabled: Boolean,
        val developerOptionsEnabled: Boolean,
        val unknownSourcesState: DiagnosticState,
        val biometricAvailable: Boolean,
        val biometricEnrolled: Boolean,
        val keyStoreAvailable: Boolean,
        val strongBoxAvailable: Boolean
    ) {
        /**
         * Compatibility helper.
         *
         * This must never be used to infer encryption when the
         * underlying state is UNKNOWN.
         */
        val isDeviceEncrypted: Boolean
            get() = encryptionState == DiagnosticState.YES

        val unknownSourcesEnabled: Boolean
            get() = unknownSourcesState == DiagnosticState.YES
    }

    fun getSecurityStatus(): DeviceSecurityStatus {
        val keyguardManager =
            context.getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager

        val hasScreenLock =
            keyguardManager?.isKeyguardSecure == true

        val encryptionState = detectEncryptionState()

        val securityPatchLevel =
            Build.VERSION.SECURITY_PATCH.orEmpty()

        val usbDebuggingEnabled =
            readGlobalSetting(Settings.Global.ADB_ENABLED) == 1

        val developerOptionsEnabled =
            readGlobalSetting(Settings.Global.DEVELOPMENT_SETTINGS_ENABLED) == 1

        /*
         * INSTALL_NON_MARKET_APPS is not a reliable modern Android
         * device-wide security indicator.
         *
         * Android 8+ uses per-application REQUEST_INSTALL_PACKAGES
         * permission instead. Therefore we deliberately report
         * UNKNOWN here instead of falsely claiming that unknown
         * sources are globally enabled/disabled.
         */
        val unknownSourcesState =
            DiagnosticState.UNKNOWN

        val biometricResult =
            detectBiometricState()

        return DeviceSecurityStatus(
            hasScreenLock = hasScreenLock,
            encryptionState = encryptionState,
            securityPatchLevel = securityPatchLevel,
            usbDebuggingEnabled = usbDebuggingEnabled,
            developerOptionsEnabled = developerOptionsEnabled,
            unknownSourcesState = unknownSourcesState,
            biometricAvailable = biometricResult.first,
            biometricEnrolled = biometricResult.second,
            keyStoreAvailable = getKeyStoreStatus(),
            strongBoxAvailable = hasStrongBox()
        )
    }

    private fun detectEncryptionState(): DiagnosticState {
        /*
         * IMPORTANT:
         *
         * UserManager.isUserUnlocked() means credential-protected
         * storage is currently unlocked. It does NOT mean the device
         * storage is encrypted.
         *
         * Never use it as an encryption test.
         */

        val devicePolicyManager =
            context.getSystemService(Context.DEVICE_POLICY_SERVICE)
                    as? DevicePolicyManager

        if (devicePolicyManager != null) {
            try {
                @Suppress("DEPRECATION")
                val status =
                    devicePolicyManager.storageEncryptionStatus

                when (status) {
                    DevicePolicyManager.ENCRYPTION_STATUS_ACTIVE,
                    DevicePolicyManager.ENCRYPTION_STATUS_ACTIVE_PER_USER -> {
                        return DiagnosticState.YES
                    }

                    DevicePolicyManager.ENCRYPTION_STATUS_UNSUPPORTED,
                    DevicePolicyManager.ENCRYPTION_STATUS_INACTIVE -> {
                        return DiagnosticState.NO
                    }
                }
            } catch (_: Exception) {
                // Fall through to UNKNOWN.
            }
        }

        /*
         * Modern Android devices generally enforce encryption,
         * but SecureDroid must not infer that from API level alone.
         */
        return DiagnosticState.UNKNOWN
    }

    private fun detectBiometricState(): Pair<Boolean, Boolean> {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val biometricManager =
                context.getSystemService(BiometricManager::class.java)

            if (biometricManager != null) {
                val capability =
                    biometricManager.canAuthenticate(
                        BiometricManager.Authenticators.BIOMETRIC_STRONG or
                            BiometricManager.Authenticators.BIOMETRIC_WEAK
                    )

                return when (capability) {
                    BiometricManager.BIOMETRIC_SUCCESS ->
                        true to true

                    BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED ->
                        true to false

                    BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE,
                    BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE ->
                        false to false

                    else ->
                        false to false
                }
            }
        }

        /*
         * Older Android fallback.
         */
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            @Suppress("DEPRECATION")
            val fingerprintManager =
                context.getSystemService(Context.FINGERPRINT_SERVICE)
                        as? android.hardware.fingerprint.FingerprintManager

            if (fingerprintManager != null) {
                @Suppress("DEPRECATION")
                return fingerprintManager.isHardwareDetected to
                    fingerprintManager.hasEnrolledFingerprints()
            }
        }

        return false to false
    }

    private fun readGlobalSetting(name: String): Int {
        return try {
            Settings.Global.getInt(
                context.contentResolver,
                name,
                0
            )
        } catch (_: Exception) {
            0
        }
    }

    fun getKeyStoreStatus(): Boolean {
        return try {
            val keyStore =
                KeyStore.getInstance("AndroidKeyStore")

            keyStore.load(null)

            true
        } catch (_: Exception) {
            false
        }
    }

    fun hasStrongBox(): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) {
            return false
        }

        val alias =
            "securedroid_strongbox_probe"

        return try {
            val keyStore =
                KeyStore.getInstance("AndroidKeyStore")

            keyStore.load(null)

            if (keyStore.containsAlias(alias)) {
                keyStore.deleteEntry(alias)
            }

            val keyGenerator =
                KeyGenerator.getInstance(
                    KeyProperties.KEY_ALGORITHM_AES,
                    "AndroidKeyStore"
                )

            val spec =
                KeyGenParameterSpec.Builder(
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

            val key =
                keyGenerator.generateKey()

            /*
             * Confirm that the generated key is hardware-backed.
             * StrongBox-specific generation succeeding is the primary
             * capability test; the key is deleted immediately.
             */
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

            keyInfo.isInsideSecureHardware
        } catch (_: Exception) {
            false
        } finally {
            try {
                val keyStore =
                    KeyStore.getInstance("AndroidKeyStore")

                keyStore.load(null)

                if (keyStore.containsAlias(alias)) {
                    keyStore.deleteEntry(alias)
                }
            } catch (_: Exception) {
                // Cleanup failure must not change the capability result.
            }
        }
    }
}
