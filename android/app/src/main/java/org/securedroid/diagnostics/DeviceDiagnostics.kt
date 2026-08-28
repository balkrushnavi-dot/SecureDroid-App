package org.securedroid.diagnostics

import android.app.KeyguardManager
import android.content.Context
import android.os.Build
import android.os.storage.StorageManager
import android.provider.Settings
import androidx.biometric.BiometricManager
import java.security.KeyStore
import javax.crypto.KeyGenerator
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties

class DeviceDiagnostics(
    private val context: Context
) {

    data class DeviceSecurityStatus(
        val hasScreenLock: Boolean,
        val isDeviceEncrypted: Boolean,
        val encryptionStatusKnown: Boolean,
        val securityPatchLevel: String,
        val usbDebuggingEnabled: Boolean,
        val developerOptionsEnabled: Boolean,
        val unknownSourcesEnabled: Boolean,
        val biometricAvailable: Boolean,
        val biometricEnrolled: Boolean,
        val keyStoreAvailable: Boolean,
        val strongBoxAvailable: Boolean
    )

    fun getSecurityStatus(): DeviceSecurityStatus {
        val keyguardManager =
            context.getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager

        val hasScreenLock =
            keyguardManager?.isKeyguardSecure == true

        val encryptionResult = getEncryptionStatus()

        val securityPatchLevel =
            Build.VERSION.SECURITY_PATCH

        val usbDebuggingEnabled =
            readGlobalSetting(
                Settings.Global.ADB_ENABLED
            )

        val developerOptionsEnabled =
            readGlobalSetting(
                Settings.Global.DEVELOPMENT_SETTINGS_ENABLED
            )

        val unknownSourcesEnabled =
            false

        val biometricManager =
            BiometricManager.from(context)

        val biometricAvailability =
            biometricManager.canAuthenticate(
                BiometricManager.Authenticators.BIOMETRIC_STRONG or
                    BiometricManager.Authenticators.BIOMETRIC_WEAK
            )

        val biometricAvailable =
            biometricAvailability !=
                BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE

        val biometricEnrolled =
            biometricAvailability ==
                BiometricManager.BIOMETRIC_SUCCESS

        val keyStoreAvailable =
            isKeyStoreAvailable()

        val strongBoxAvailable =
            hasStrongBox()

        return DeviceSecurityStatus(
            hasScreenLock = hasScreenLock,
            isDeviceEncrypted = encryptionResult.first,
            encryptionStatusKnown = encryptionResult.second,
            securityPatchLevel = securityPatchLevel,
            usbDebuggingEnabled = usbDebuggingEnabled,
            developerOptionsEnabled = developerOptionsEnabled,
            unknownSourcesEnabled = unknownSourcesEnabled,
            biometricAvailable = biometricAvailable,
            biometricEnrolled = biometricEnrolled,
            keyStoreAvailable = keyStoreAvailable,
            strongBoxAvailable = strongBoxAvailable
        )
    }

    private fun getEncryptionStatus(): Pair<Boolean, Boolean> {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
            return false to false
        }

        return try {
            val storageManager =
                context.getSystemService(
                    Context.STORAGE_SERVICE
                ) as? StorageManager

            if (storageManager == null) {
                false to false
            } else {
                @Suppress("DEPRECATION")
                val encrypted =
                    storageManager.isEncrypted

                encrypted to true
            }
        } catch (_: Exception) {
            false to false
        }
    }

    private fun readGlobalSetting(
        name: String
    ): Boolean {
        return try {
            Settings.Global.getInt(
                context.contentResolver,
                name,
                0
            ) == 1
        } catch (_: Exception) {
            false
        }
    }

    fun getKeyStoreStatus(): Boolean {
        return isKeyStoreAvailable()
    }

    private fun isKeyStoreAvailable(): Boolean {
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
                    .setBlockModes(
                        KeyProperties.BLOCK_MODE_GCM
                    )
                    .setEncryptionPaddings(
                        KeyProperties.ENCRYPTION_PADDING_NONE
                    )
                    .setKeySize(256)
                    .setIsStrongBoxBacked(true)
                    .build()

            keyGenerator.init(spec)
            keyGenerator.generateKey()

            true
        } catch (_: Exception) {
            false
        } finally {
            try {
                KeyStore.getInstance(
                    "AndroidKeyStore"
                ).apply {
                    load(null)
                    if (containsAlias(alias)) {
                        deleteEntry(alias)
                    }
                }
            } catch (_: Exception) {
                // Best effort cleanup.
            }
        }
    }
}
