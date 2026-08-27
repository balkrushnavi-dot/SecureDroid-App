package org.securedroid.diagnostics

import android.content.Context
import android.os.Build
import android.provider.Settings
import android.hardware.fingerprint.FingerprintManager
import android.os.UserManager
import android.app.KeyguardManager
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.security.KeyStore
import javax.crypto.KeyGenerator

class DeviceDiagnostics(
    private val context: Context
) {

    data class DeviceSecurityStatus(
        val hasScreenLock: Boolean,
        val isDeviceEncrypted: Boolean,
        val securityPatchLevel: String,
        val usbDebuggingEnabled: Boolean,
        val developerOptionsEnabled: Boolean,
        val unknownSourcesEnabled: Boolean,
        val biometricAvailable: Boolean,
        val biometricEnrolled: Boolean
    )

    fun getSecurityStatus(): DeviceSecurityStatus {
        val keyguardManager = context.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
        val hasScreenLock = keyguardManager.isKeyguardSecure

        val isDeviceEncrypted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            context.getSystemService(UserManager::class.java)?.isUserUnlocked ?: false
        } else {
            @Suppress("DEPRECATION")
            keyguardManager.isKeyguardSecure
        }

        val securityPatchLevel = Build.VERSION.SECURITY_PATCH

        val usbDebuggingEnabled = Settings.Global.getInt(
            context.contentResolver,
            Settings.Global.ADB_ENABLED,
            0
        ) == 1

        val developerOptionsEnabled = Settings.Global.getInt(
            context.contentResolver,
            Settings.Global.DEVELOPMENT_SETTINGS_ENABLED,
            0
        ) == 1

        val unknownSourcesEnabled = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Settings.Secure.getInt(
                context.contentResolver,
                Settings.Secure.INSTALL_NON_MARKET_APPS,
                0
            ) == 1
        } else {
            Settings.Global.getInt(
                context.contentResolver,
                Settings.Global.INSTALL_NON_MARKET_APPS,
                0
            ) == 1
        }

        val fingerprintManager = context.getSystemService(Context.FINGERPRINT_SERVICE) as? FingerprintManager
        val biometricAvailable = fingerprintManager?.isHardwareDetected ?: false
        val biometricEnrolled = fingerprintManager?.hasEnrolledFingerprints() ?: false

        return DeviceSecurityStatus(
            hasScreenLock = hasScreenLock,
            isDeviceEncrypted = isDeviceEncrypted,
            securityPatchLevel = securityPatchLevel,
            usbDebuggingEnabled = usbDebuggingEnabled,
            developerOptionsEnabled = developerOptionsEnabled,
            unknownSourcesEnabled = unknownSourcesEnabled,
            biometricAvailable = biometricAvailable,
            biometricEnrolled = biometricEnrolled
        )
    }

    fun getKeyStoreStatus(): Boolean {
        return try {
            val keyStore = KeyStore.getInstance("AndroidKeyStore")
            keyStore.load(null)
            true
        } catch (_: Exception) {
            false
        }
    }

    fun hasStrongBox(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            try {
                val keyGenerator = KeyGenerator.getInstance(
                    KeyProperties.KEY_ALGORITHM_AES,
                    "AndroidKeyStore"
                )
                val keyGenParameterSpec = KeyGenParameterSpec.Builder(
                    "test_key",
                    KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
                )
                    .setBlockModes(KeyProperties.BLOCK_MODE_CBC)
                    .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_PKCS7)
                    .setIsStrongBoxBacked(true)
                    .build()
                keyGenerator.init(keyGenParameterSpec)
                keyGenerator.generateKey()
                true
            } catch (_: Exception) {
                false
            }
        } else {
            false
        }
    }
}
