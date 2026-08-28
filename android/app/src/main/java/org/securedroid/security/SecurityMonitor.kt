package org.securedroid.security

import android.app.KeyguardManager
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Debug
import android.os.SystemClock
import android.provider.Settings
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.security.keystore.KeyInfo
import java.security.KeyStore
import javax.crypto.KeyGenerator

class SecurityMonitor(
    private val context: Context
) {

    private val packageManager: PackageManager =
        context.packageManager

    private val keyguardManager: KeyguardManager? =
        context.getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager

    enum class Status {
        VERIFIED,
        SUPPORTED,
        WARNING,
        UNKNOWN,
        UNAVAILABLE
    }

    enum class Severity {
        INFO,
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    data class Check(
        val id: String,
        val name: String,
        val status: Status,
        val severity: Severity,
        val summary: String,
        val evidence: String,
        val remediation: String? = null,
        val isReal: Boolean = true
    )

    data class SecurityStatusReport(
        val timestamp: Long,
        val checks: List<Check>,
        val score: Int,
        val status: Status,
        val summary: String
    )

    fun getSecurityStatus(): SecurityStatusReport {
        val checks = mutableListOf<Check>()

        checks += checkAndroidVersion()
        checks += checkSecureLockScreen()
        checks += checkScreenLock()
        checks += checkDebuggableBuild()
        checks += checkDeveloperOptions()
        checks += checkAdb()
        checks += checkAppInstallationSource()
        checks += checkKeystore()
        checks += checkHardwareBackedKeystore()
        checks += checkStrongBox()
        checks += checkBiometricCapability()
        checks += checkVpnCapability()
        checks += checkUnknownSources()
        checks += checkDeviceEncryption()
        checks += checkAppIntegrity()
        checks += checkSecurityPatchLevel()

        val score = calculateScore(checks)
        val overallStatus = calculateOverallStatus(checks)

        return SecurityStatusReport(
            timestamp = System.currentTimeMillis(),
            checks = checks,
            score = score,
            status = overallStatus,
            summary = createSummary(overallStatus, score, checks)
        )
    }

    fun scan(): SecurityStatusReport {
        return getSecurityStatus()
    }

    private fun checkAndroidVersion(): Check {
        val sdk = Build.VERSION.SDK_INT

        return Check(
            id = "android_version",
            name = "Android Version",
            status = if (sdk >= Build.VERSION_CODES.S) {
                Status.SUPPORTED
            } else {
                Status.WARNING
            },
            severity = if (sdk >= Build.VERSION_CODES.S) {
                Severity.INFO
            } else {
                Severity.MEDIUM
            },
            summary = "Android API $sdk",
            evidence = "Build.VERSION.SDK_INT=$sdk",
            remediation = if (sdk < Build.VERSION_CODES.S) {
                "Use a device running Android 12 or newer."
            } else {
                null
            }
        )
    }

    private fun checkSecureLockScreen(): Check {
        val secure = try {
            keyguardManager?.isKeyguardSecure
        } catch (_: Exception) {
            null
        }

        return when (secure) {
            true -> Check(
                id = "secure_lock_screen",
                name = "Secure Lock Screen",
                status = Status.VERIFIED,
                severity = Severity.INFO,
                summary = "A secure lock screen is configured.",
                evidence = "KeyguardManager.isKeyguardSecure=true"
            )

            false -> Check(
                id = "secure_lock_screen",
                name = "Secure Lock Screen",
                status = Status.WARNING,
                severity = Severity.HIGH,
                summary = "No secure lock screen is configured.",
                evidence = "KeyguardManager.isKeyguardSecure=false",
                remediation = "Configure a PIN, password, or supported secure screen lock."
            )

            null -> Check(
                id = "secure_lock_screen",
                name = "Secure Lock Screen",
                status = Status.UNKNOWN,
                severity = Severity.MEDIUM,
                summary = "Secure lock-screen state could not be determined.",
                evidence = "KeyguardManager unavailable."
            )
        }
    }

    private fun checkScreenLock(): Check {
        return checkSecureLockScreen()
    }

    private fun checkDebuggableBuild(): Check {
        val debuggable =
            (context.applicationInfo.flags and
                    android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0

        return if (debuggable) {
            Check(
                id = "debuggable_app",
                name = "Application Debuggable State",
                status = Status.WARNING,
                severity = Severity.MEDIUM,
                summary = "This application build is debuggable.",
                evidence = "ApplicationInfo.FLAG_DEBUGGABLE is set.",
                remediation = "Use a release/non-debuggable build for production."
            )
        } else {
            Check(
                id = "debuggable_app",
                name = "Application Debuggable State",
                status = Status.VERIFIED,
                severity = Severity.INFO,
                summary = "The installed application is not marked debuggable.",
                evidence = "ApplicationInfo.FLAG_DEBUGGABLE is not set."
            )
        }
    }

    private fun checkDeveloperOptions(): Check {
        val value = try {
            Settings.Global.getInt(
                context.contentResolver,
                Settings.Global.DEVELOPMENT_SETTINGS_ENABLED,
                0
            )
        } catch (_: Exception) {
            return Check(
                id = "developer_options",
                name = "Developer Options",
                status = Status.UNKNOWN,
                severity = Severity.LOW,
                summary = "Developer-options state could not be determined.",
                evidence = "Settings.Global query failed."
            )
        }

        return if (value == 1) {
            Check(
                id = "developer_options",
                name = "Developer Options",
                status = Status.WARNING,
                severity = Severity.LOW,
                summary = "Developer Options are enabled.",
                evidence = "DEVELOPMENT_SETTINGS_ENABLED=1"
            )
        } else {
            Check(
                id = "developer_options",
                name = "Developer Options",
                status = Status.VERIFIED,
                severity = Severity.INFO,
                summary = "Developer Options are disabled.",
                evidence = "DEVELOPMENT_SETTINGS_ENABLED=0"
            )
        }
    }

    private fun checkAdb(): Check {
        val value = try {
            Settings.Global.getInt(
                context.contentResolver,
                Settings.Global.ADB_ENABLED,
                0
            )
        } catch (_: Exception) {
            return Check(
                id = "adb",
                name = "ADB",
                status = Status.UNKNOWN,
                severity = Severity.LOW,
                summary = "ADB state could not be determined.",
                evidence = "Settings.Global query failed."
            )
        }

        return if (value == 1) {
            Check(
                id = "adb",
                name = "ADB",
                status = Status.WARNING,
                severity = Severity.MEDIUM,
                summary = "ADB is enabled.",
                evidence = "ADB_ENABLED=1",
                remediation = "Disable USB debugging when it is not required."
            )
        } else {
            Check(
                id = "adb",
                name = "ADB",
                status = Status.VERIFIED,
                severity = Severity.INFO,
                summary = "ADB is disabled.",
                evidence = "ADB_ENABLED=0"
            )
        }
    }

    private fun checkAppInstallationSource(): Check {
        val installer = try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                packageManager.getInstallSourceInfo(context.packageName).installingPackageName
            } else {
                @Suppress("DEPRECATION")
                packageManager.getInstallerPackageName(context.packageName)
            }
        } catch (_: Exception) {
            null
        }

        return if (installer == null) {
            Check(
                id = "installation_source",
                name = "Application Installation Source",
                status = Status.UNKNOWN,
                severity = Severity.LOW,
                summary = "Installation source could not be verified.",
                evidence = "Installer package unavailable."
            )
        } else {
            Check(
                id = "installation_source",
                name = "Application Installation Source",
                status = Status.SUPPORTED,
                severity = Severity.INFO,
                summary = "Installation source is observable.",
                evidence = "Installer package: $installer"
            )
        }
    }

    private fun checkKeystore(): Check {
        return try {
            val keyStore = KeyStore.getInstance("AndroidKeyStore")
            keyStore.load(null)

            Check(
                id = "android_keystore",
                name = "Android Keystore",
                status = Status.VERIFIED,
                severity = Severity.INFO,
                summary = "Android Keystore is available.",
                evidence = "AndroidKeyStore initialized successfully."
            )
        } catch (e: Exception) {
            Check(
                id = "android_keystore",
                name = "Android Keystore",
                status = Status.UNAVAILABLE,
                severity = Severity.HIGH,
                summary = "Android Keystore could not be initialized.",
                evidence = e.javaClass.simpleName,
                remediation = "Use a supported Android device with functioning Keystore services."
            )
        }
    }

    private fun checkHardwareBackedKeystore(): Check {
        return try {
            val alias = "securedroid_monitor_probe"

            val keyStore = KeyStore.getInstance("AndroidKeyStore")
            keyStore.load(null)

            if (keyStore.containsAlias(alias)) {
                keyStore.deleteEntry(alias)
            }

            val generator =
                KeyGenerator.getInstance(
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
                .build()

            generator.init(spec)
            generator.generateKey()

            val secretKey = keyStore.getKey(alias, null)
            val factory = javax.crypto.SecretKeyFactory.getInstance(
                secretKey.algorithm,
                "AndroidKeyStore"
            )

            val keyInfo = factory.getKeySpec(
                secretKey,
                KeyInfo::class.java
            ) as KeyInfo

            val hardwareBacked =
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    keyInfo.securityLevel >= KeyProperties.SECURITY_LEVEL_TRUSTED_ENVIRONMENT
                } else {
                    @Suppress("DEPRECATION")
                    keyInfo.isInsideSecureHardware
                }

            keyStore.deleteEntry(alias)

            if (hardwareBacked) {
                Check(
                    id = "hardware_backed_keystore",
                    name = "Hardware-Backed Keystore",
                    status = Status.VERIFIED,
                    severity = Severity.INFO,
                    summary = "A generated Keystore key is hardware-backed.",
                    evidence = "KeyInfo reports secure hardware/security level."
                )
            } else {
                Check(
                    id = "hardware_backed_keystore",
                    name = "Hardware-Backed Keystore",
                    status = Status.WARNING,
                    severity = Severity.MEDIUM,
                    summary = "The generated Keystore key is not reported as hardware-backed.",
                    evidence = "KeyInfo reports software-backed protection."
                )
            }
        } catch (e: Exception) {
            Check(
                id = "hardware_backed_keystore",
                name = "Hardware-Backed Keystore",
                status = Status.UNKNOWN,
                severity = Severity.MEDIUM,
                summary = "Hardware-backed Keystore status could not be verified.",
                evidence = e.javaClass.simpleName
            )
        }
    }

    private fun checkStrongBox(): Check {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) {
            return Check(
                id = "strongbox",
                name = "StrongBox",
                status = Status.UNAVAILABLE,
                severity = Severity.INFO,
                summary = "StrongBox APIs are unavailable on this Android version.",
                evidence = "API level < 28"
            )
        }

        val available = try {
            packageManager.hasSystemFeature(
                PackageManager.FEATURE_STRONGBOX_KEYSTORE
            )
        } catch (_: Exception) {
            false
        }

        return if (available) {
            Check(
                id = "strongbox",
                name = "StrongBox",
                status = Status.SUPPORTED,
                severity = Severity.INFO,
                summary = "The device advertises StrongBox Keystore support.",
                evidence = "PackageManager.FEATURE_STRONGBOX_KEYSTORE=true"
            )
        } else {
            Check(
                id = "strongbox",
                name = "StrongBox",
                status = Status.UNAVAILABLE,
                severity = Severity.INFO,
                summary = "StrongBox is not advertised by this device.",
                evidence = "FEATURE_STRONGBOX_KEYSTORE=false"
            )
        }
    }

    private fun checkBiometricCapability(): Check {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            return Check(
                id = "biometric",
                name = "Biometric Authentication",
                status = Status.UNAVAILABLE,
                severity = Severity.INFO,
                summary = "Modern biometric APIs are unavailable.",
                evidence = "API level < 23"
            )
        }

        val biometricFeature =
            packageManager.hasSystemFeature(
                PackageManager.FEATURE_FINGERPRINT
            ) ||
                    packageManager.hasSystemFeature(
                        "android.hardware.biometrics"
                    )

        return if (biometricFeature) {
            Check(
                id = "biometric",
                name = "Biometric Authentication",
                status = Status.SUPPORTED,
                severity = Severity.INFO,
                summary = "The device advertises biometric hardware.",
                evidence = "PackageManager biometric feature detected."
            )
        } else {
            Check(
                id = "biometric",
                name = "Biometric Authentication",
                status = Status.UNAVAILABLE,
                severity = Severity.LOW,
                summary = "No supported biometric hardware was detected.",
                evidence = "PackageManager biometric feature not detected."
            )
        }
    }

    private fun checkVpnCapability(): Check {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            Check(
                id = "vpn",
                name = "Application VPN Capability",
                status = Status.SUPPORTED,
                severity = Severity.INFO,
                summary = "Android VpnService APIs are available.",
                evidence = "API level >= 21.",
                remediation = "VPN permission must still be explicitly granted by the user."
            )
        } else {
            Check(
                id = "vpn",
                name = "Application VPN Capability",
                status = Status.UNAVAILABLE,
                severity = Severity.MEDIUM,
                summary = "VpnService is unavailable.",
                evidence = "API level < 21"
            )
        }
    }

    private fun checkUnknownSources(): Check {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            return Check(
                id = "unknown_sources",
                name = "Unknown-App Installation Policy",
                status = Status.UNKNOWN,
                severity = Severity.LOW,
                summary = "Per-app unknown-source installation permission is not universally observable.",
                evidence = "Android O+ uses package-specific REQUEST_INSTALL_PACKAGES policy.",
                isReal = true
            )
        }

        val enabled = try {
            Settings.Secure.getInt(
                context.contentResolver,
                "install_non_market_apps",
                0
            )
        } catch (_: Exception) {
            0
        }

        return if (enabled == 1) {
            Check(
                id = "unknown_sources",
                name = "Unknown-App Installation Policy",
                status = Status.WARNING,
                severity = Severity.MEDIUM,
                summary = "Unknown-source installation is enabled.",
                evidence = "install_non_market_apps=1"
            )
        } else {
            Check(
                id = "unknown_sources",
                name = "Unknown-App Installation Policy",
                status = Status.VERIFIED,
                severity = Severity.INFO,
                summary = "Unknown-source installation is disabled.",
                evidence = "install_non_market_apps=0"
            )
        }
    }

    private fun checkDeviceEncryption(): Check {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Check(
                id = "device_encryption",
                name = "Device Encryption",
                status = Status.UNKNOWN,
                severity = Severity.MEDIUM,
                summary = "Full device encryption state is not directly treated as verified by SecureDroid.",
                evidence = "SecureDroid does not infer firmware-level encryption state from unavailable APIs.",
                remediation = "Verify encryption status through Android system settings.",
                isReal = true
            )
        } else {
            Check(
                id = "device_encryption",
                name = "Device Encryption",
                status = Status.UNKNOWN,
                severity = Severity.MEDIUM,
                summary = "Encryption state cannot be reliably verified.",
                evidence = "Android API limitations."
            )
        }
    }

    private fun checkAppIntegrity(): Check {
        return try {
            val info = packageManager.getPackageInfo(
                context.packageName,
                0
            )

            Check(
                id = "app_integrity",
                name = "Application Package Availability",
                status = Status.VERIFIED,
                severity = Severity.INFO,
                summary = "The installed application package is accessible.",
                evidence = "PackageManager returned package information for ${info.packageName}."
            )
        } catch (e: Exception) {
            Check(
                id = "app_integrity",
                name = "Application Package Availability",
                status = Status.WARNING,
                severity = Severity.HIGH,
                summary = "Application package information could not be read.",
                evidence = e.javaClass.simpleName
            )
        }
    }

    private fun checkSecurityPatchLevel(): Check {
        val patch = Build.VERSION.SECURITY_PATCH

        return if (patch.isNullOrBlank()) {
            Check(
                id = "security_patch",
                name = "Android Security Patch",
                status = Status.UNKNOWN,
                severity = Severity.MEDIUM,
                summary = "Security patch level is unavailable.",
                evidence = "Build.VERSION.SECURITY_PATCH is empty."
            )
        } else {
            Check(
                id = "security_patch",
                name = "Android Security Patch",
                status = Status.SUPPORTED,
                severity = Severity.INFO,
                summary = "Android reports security patch $patch.",
                evidence = "Build.VERSION.SECURITY_PATCH=$patch"
            )
        }
    }

    private fun calculateScore(checks: List<Check>): Int {
        if (checks.isEmpty()) return 0

        var score = 100

        checks.forEach { check ->
            score -= when (check.status) {
                Status.VERIFIED -> 0
                Status.SUPPORTED -> 1
                Status.UNKNOWN -> 3
                Status.WARNING -> when (check.severity) {
                    Severity.INFO -> 2
                    Severity.LOW -> 4
                    Severity.MEDIUM -> 8
                    Severity.HIGH -> 15
                    Severity.CRITICAL -> 25
                    else -> 10 // fallback for any other Severity
                }
                Status.UNAVAILABLE -> when (check.severity) {
                    Severity.INFO -> 1
                    Severity.LOW -> 3
                    Severity.MEDIUM -> 5
                    Severity.HIGH -> 10
                    Severity.CRITICAL -> 20
                    else -> 5 // fallback for any other Severity
                }
            }
        }

        return score.coerceIn(0, 100)
    }

    private fun calculateOverallStatus(
        checks: List<Check>
    ): Status {
        if (checks.any {
                it.status == Status.WARNING &&
                        it.severity == Severity.CRITICAL
            }
        ) {
            return Status.WARNING
        }

        if (checks.any {
                it.status == Status.WARNING &&
                        it.severity == Severity.HIGH
            }
        ) {
            return Status.WARNING
        }

        if (checks.any { it.status == Status.UNKNOWN }) {
            return Status.UNKNOWN
        }

        if (checks.any { it.status == Status.WARNING }) {
            return Status.WARNING
        }

        return Status.VERIFIED
    }

    private fun createSummary(
        status: Status,
        score: Int,
        checks: List<Check>
    ): String {
        val warnings = checks.count { it.status == Status.WARNING }
        val unknown = checks.count { it.status == Status.UNKNOWN }

        return when (status) {
            Status.VERIFIED ->
                "Security checks completed. Score: $score/100."

            Status.SUPPORTED ->
                "Security capabilities are available. Score: $score/100."

            Status.WARNING ->
                "Security checks detected $warnings warning(s). Score: $score/100."

            Status.UNKNOWN ->
                "Some security properties could not be verified. Score: $score/100; unknown checks: $unknown."

            Status.UNAVAILABLE ->
                "Required security capability is unavailable. Score: $score/100."
        }
    }

    companion object {
        fun create(context: Context): SecurityMonitor {
            return SecurityMonitor(context.applicationContext)
        }
    }
}
