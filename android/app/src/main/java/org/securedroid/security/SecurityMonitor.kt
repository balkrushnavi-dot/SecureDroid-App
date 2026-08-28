package org.securedroid.security

import android.app.KeyguardManager
import android.content.Context
import android.os.Build
import android.os.storage.StorageManager
import android.provider.Settings
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyInfo
import android.security.keystore.KeyProperties
import androidx.biometric.BiometricManager
import java.security.KeyStore
import java.time.YearMonth
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException
import java.time.temporal.ChronoUnit
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.SecretKeyFactory
import org.securedroid.apps.AppRiskAnalyzer
import org.securedroid.apps.InstalledAppScanner
import org.securedroid.apps.RiskLevel
import org.securedroid.vpn.SecureVpnManager
import org.securedroid.vpn.VpnState

class SecurityMonitor(
    private val context: Context
) {
    private val appContext = context.applicationContext

    fun analyze(): SecurityReport {
        val checks = performAllChecks()
        val score = calculateScoreFromChecks(checks)
        val grade = SecurityScorePolicy.gradeFor(score)
        val engine = SecurityCheckEngine()
        return engine.evaluate(checks, score, grade)
    }

    fun getSecurityStatus(): SecurityStatusReport {
        val checks = performAllChecks()
        val score = calculateScoreFromChecks(checks)
        val overallStatus = when {
            checks.any { it.status == SecurityStatus.WARNING || it.status == SecurityStatus.ERROR } -> SecurityStatus.WARNING
            checks.any { it.status == SecurityStatus.UNKNOWN } -> SecurityStatus.UNKNOWN
            checks.any { it.status == SecurityStatus.UNAVAILABLE } -> SecurityStatus.UNAVAILABLE
            checks.all { it.status == SecurityStatus.VERIFIED } -> SecurityStatus.VERIFIED
            checks.any { it.status == SecurityStatus.SUPPORTED } -> SecurityStatus.SUPPORTED
            else -> SecurityStatus.UNKNOWN
        }
        return SecurityStatusReport(
            timestamp = System.currentTimeMillis(),
            overallStatus = overallStatus,
            score = score,
            checks = checks,
            isReal = true
        )
    }

    fun performAllChecks(): List<SecurityCheck> {
        val list = mutableListOf<SecurityCheck>()
        list.add(checkScreenLock())
        list.add(checkDeviceEncryption())
        list.add(checkUsbDebugging())
        list.add(checkDeveloperOptions())
        list.add(checkSecurityPatch())
        list.add(checkHardwareBackedKeystore())
        list.add(checkStrongBox())
        list.add(checkBiometrics())
        list.addAll(checkAppSecurity())
        list.add(checkVpnProtection())
        return list
    }

    private fun checkScreenLock(): SecurityCheck {
        val keyguardManager = appContext.getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager
        val isSecure = keyguardManager?.isKeyguardSecure == true

        return if (isSecure) {
            SecurityCheck(
                id = "screen_lock",
                name = "Secure Screen Lock",
                status = SecurityStatus.VERIFIED,
                severity = SecuritySeverity.INFO,
                summary = "A secure lock screen (PIN/Password/Biometric) is enabled.",
                scoreImpact = 0,
                evidence = "KeyguardManager reports isKeyguardSecure = true."
            )
        } else {
            SecurityCheck(
                id = "screen_lock",
                name = "Secure Screen Lock",
                status = SecurityStatus.WARNING,
                severity = SecuritySeverity.CRITICAL,
                summary = "No secure lock screen configured on device.",
                scoreImpact = -25,
                evidence = "KeyguardManager reports isKeyguardSecure = false.",
                remediation = "Set up a PIN, password, or biometric lock in system settings."
            )
        }
    }

    private fun checkDeviceEncryption(): SecurityCheck {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
            return SecurityCheck(
                id = "device_encryption",
                name = "Storage Encryption",
                status = SecurityStatus.UNKNOWN,
                severity = SecuritySeverity.MEDIUM,
                summary = "Device encryption could not be determined on this Android version.",
                scoreImpact = 0,
                evidence = "Requires Android 7.0+"
            )
        }

        return try {
            @Suppress("DEPRECATION")
            val isEncrypted = StorageManager.isEncrypted(appContext.filesDir)
            if (isEncrypted) {
                SecurityCheck(
                    id = "device_encryption",
                    name = "Storage Encryption",
                    status = SecurityStatus.VERIFIED,
                    severity = SecuritySeverity.INFO,
                    summary = "Device storage is encrypted.",
                    scoreImpact = 0,
                    evidence = "StorageManager reports encrypted filesystem."
                )
            } else {
                SecurityCheck(
                    id = "device_encryption",
                    name = "Storage Encryption",
                    status = SecurityStatus.WARNING,
                    severity = SecuritySeverity.CRITICAL,
                    summary = "Device storage is reported as unencrypted.",
                    scoreImpact = -20,
                    evidence = "StorageManager reports unencrypted filesystem.",
                    remediation = "Enable device encryption in Android Settings."
                )
            }
        } catch (e: Exception) {
            SecurityCheck(
                id = "device_encryption",
                name = "Storage Encryption",
                status = SecurityStatus.UNKNOWN,
                severity = SecuritySeverity.MEDIUM,
                summary = "Storage encryption state could not be verified.",
                scoreImpact = 0,
                evidence = e.javaClass.simpleName
            )
        }
    }

    private fun checkUsbDebugging(): SecurityCheck {
        val enabled = try {
            Settings.Global.getInt(appContext.contentResolver, Settings.Global.ADB_ENABLED, 0) == 1
        } catch (_: Exception) {
            false
        }

        return if (enabled) {
            SecurityCheck(
                id = "usb_debugging",
                name = "USB Debugging",
                status = SecurityStatus.WARNING,
                severity = SecuritySeverity.MEDIUM,
                summary = "USB debugging (ADB) is enabled.",
                scoreImpact = -10,
                evidence = "Settings.Global.ADB_ENABLED = 1",
                remediation = "Disable USB debugging in Developer Options when not in development."
            )
        } else {
            SecurityCheck(
                id = "usb_debugging",
                name = "USB Debugging",
                status = SecurityStatus.VERIFIED,
                severity = SecuritySeverity.INFO,
                summary = "USB debugging is disabled.",
                scoreImpact = 0,
                evidence = "Settings.Global.ADB_ENABLED = 0"
            )
        }
    }

    private fun checkDeveloperOptions(): SecurityCheck {
        val enabled = try {
            Settings.Global.getInt(appContext.contentResolver, Settings.Global.DEVELOPMENT_SETTINGS_ENABLED, 0) == 1
        } catch (_: Exception) {
            false
        }

        return if (enabled) {
            SecurityCheck(
                id = "developer_options",
                name = "Developer Options",
                status = SecurityStatus.WARNING,
                severity = SecuritySeverity.LOW,
                summary = "Developer Options are enabled.",
                scoreImpact = -5,
                evidence = "Settings.Global.DEVELOPMENT_SETTINGS_ENABLED = 1",
                remediation = "Turn off Developer Options in Android Settings for maximum hardening."
            )
        } else {
            SecurityCheck(
                id = "developer_options",
                name = "Developer Options",
                status = SecurityStatus.VERIFIED,
                severity = SecuritySeverity.INFO,
                summary = "Developer Options are disabled.",
                scoreImpact = 0,
                evidence = "Settings.Global.DEVELOPMENT_SETTINGS_ENABLED = 0"
            )
        }
    }

    private fun checkSecurityPatch(): SecurityCheck {
        val patchLevel = Build.VERSION.SECURITY_PATCH
        if (patchLevel.isNullOrBlank()) {
            return SecurityCheck(
                id = "security_patch",
                name = "Security Patch Level",
                status = SecurityStatus.UNKNOWN,
                severity = SecuritySeverity.MEDIUM,
                summary = "Security patch level is unavailable.",
                scoreImpact = 0,
                evidence = "Build.VERSION.SECURITY_PATCH is null"
            )
        }

        val patch = try {
            YearMonth.parse(patchLevel, DateTimeFormatter.ofPattern("yyyy-MM"))
        } catch (_: DateTimeParseException) {
            null
        }

        if (patch == null) {
            return SecurityCheck(
                id = "security_patch",
                name = "Security Patch Level",
                status = SecurityStatus.UNKNOWN,
                severity = SecuritySeverity.LOW,
                summary = "Unrecognized security patch date format: $patchLevel",
                scoreImpact = 0,
                evidence = patchLevel
            )
        }

        val current = YearMonth.now()
        val monthsOld = ChronoUnit.MONTHS.between(patch, current)

        return when {
            monthsOld <= 3 -> {
                SecurityCheck(
                    id = "security_patch",
                    name = "Security Patch Level",
                    status = SecurityStatus.VERIFIED,
                    severity = SecuritySeverity.INFO,
                    summary = "Security patch is up-to-date ($patchLevel).",
                    scoreImpact = 0,
                    evidence = "Patch date: $patchLevel (${monthsOld}m ago)"
                )
            }
            monthsOld <= 6 -> {
                SecurityCheck(
                    id = "security_patch",
                    name = "Security Patch Level",
                    status = SecurityStatus.SUPPORTED,
                    severity = SecuritySeverity.LOW,
                    summary = "Security patch is moderately recent ($patchLevel).",
                    scoreImpact = -5,
                    evidence = "Patch date: $patchLevel (${monthsOld}m ago)"
                )
            }
            else -> {
                SecurityCheck(
                    id = "security_patch",
                    name = "Security Patch Level",
                    status = SecurityStatus.WARNING,
                    severity = SecuritySeverity.HIGH,
                    summary = "Security patch is outdated ($patchLevel, ${monthsOld} months old).",
                    scoreImpact = -15,
                    evidence = "Patch date: $patchLevel (${monthsOld}m ago)",
                    remediation = "Check for system software updates in Android Settings."
                )
            }
        }
    }

    private fun checkHardwareBackedKeystore(): SecurityCheck {
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

            val secretKey = keyStore.getKey(alias, null) as SecretKey
            val factory = SecretKeyFactory.getInstance(
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
                SecurityCheck(
                    id = "hardware_backed_keystore",
                    name = "Hardware-Backed Keystore",
                    status = SecurityStatus.VERIFIED,
                    severity = SecuritySeverity.INFO,
                    summary = "A generated Keystore key is hardware-backed (TEE/SE).",
                    scoreImpact = 0,
                    evidence = "KeyInfo reports secure hardware / security level."
                )
            } else {
                SecurityCheck(
                    id = "hardware_backed_keystore",
                    name = "Hardware-Backed Keystore",
                    status = SecurityStatus.WARNING,
                    severity = SecuritySeverity.MEDIUM,
                    summary = "Keystore key is software-emulated, not hardware-backed.",
                    scoreImpact = -10,
                    evidence = "KeyInfo reports software-backed protection."
                )
            }
        } catch (e: Exception) {
            SecurityCheck(
                id = "hardware_backed_keystore",
                name = "Hardware-Backed Keystore",
                status = SecurityStatus.UNKNOWN,
                severity = SecuritySeverity.MEDIUM,
                summary = "Hardware-backed Keystore status could not be verified.",
                scoreImpact = 0,
                evidence = e.javaClass.simpleName
            )
        }
    }

    private fun checkStrongBox(): SecurityCheck {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) {
            return SecurityCheck(
                id = "strongbox",
                name = "StrongBox Keymaster",
                status = SecurityStatus.UNAVAILABLE,
                severity = SecuritySeverity.INFO,
                summary = "StrongBox requires Android 9 (API 28) or newer.",
                scoreImpact = 0,
                evidence = "API ${Build.VERSION.SDK_INT} < 28"
            )
        }

        val alias = "securedroid_strongbox_probe"
        return try {
            val keyStore = KeyStore.getInstance("AndroidKeyStore")
            keyStore.load(null)

            if (keyStore.containsAlias(alias)) {
                keyStore.deleteEntry(alias)
            }

            val generator = KeyGenerator.getInstance(
                KeyProperties.KEY_ALGORITHM_AES,
                "AndroidKeyStore"
            )

            val spec = KeyGenParameterSpec.Builder(
                alias,
                KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
            )
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256)
                .setIsStrongBoxBacked(true)
                .build()

            generator.init(spec)
            generator.generateKey()

            keyStore.deleteEntry(alias)

            SecurityCheck(
                id = "strongbox",
                name = "StrongBox Keymaster",
                status = SecurityStatus.VERIFIED,
                severity = SecuritySeverity.INFO,
                summary = "Dedicated StrongBox hardware security module is available.",
                scoreImpact = 0,
                evidence = "StrongBox key generation succeeded."
            )
        } catch (e: Exception) {
            SecurityCheck(
                id = "strongbox",
                name = "StrongBox Keymaster",
                status = SecurityStatus.UNAVAILABLE,
                severity = SecuritySeverity.LOW,
                summary = "StrongBox hardware is unavailable or not supported on this device.",
                scoreImpact = 0,
                evidence = e.javaClass.simpleName
            )
        }
    }

    private fun checkBiometrics(): SecurityCheck {
        val manager = BiometricManager.from(appContext)
        val authResult = manager.canAuthenticate(
            BiometricManager.Authenticators.BIOMETRIC_STRONG or BiometricManager.Authenticators.BIOMETRIC_WEAK
        )

        return when (authResult) {
            BiometricManager.BIOMETRIC_SUCCESS -> {
                SecurityCheck(
                    id = "biometrics",
                    name = "Biometric Authentication",
                    status = SecurityStatus.VERIFIED,
                    severity = SecuritySeverity.INFO,
                    summary = "Biometric authentication is supported and enrolled.",
                    scoreImpact = 0,
                    evidence = "BiometricManager: BIOMETRIC_SUCCESS"
                )
            }
            BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> {
                SecurityCheck(
                    id = "biometrics",
                    name = "Biometric Authentication",
                    status = SecurityStatus.SUPPORTED,
                    severity = SecuritySeverity.LOW,
                    summary = "Biometric hardware is present, but no biometric is enrolled.",
                    scoreImpact = -5,
                    evidence = "BiometricManager: BIOMETRIC_ERROR_NONE_ENROLLED",
                    remediation = "Enroll fingerprint or face recognition in Android Settings."
                )
            }
            BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE -> {
                SecurityCheck(
                    id = "biometrics",
                    name = "Biometric Authentication",
                    status = SecurityStatus.UNAVAILABLE,
                    severity = SecuritySeverity.INFO,
                    summary = "No biometric hardware is available on this device.",
                    scoreImpact = 0,
                    evidence = "BiometricManager: BIOMETRIC_ERROR_NO_HARDWARE"
                )
            }
            else -> {
                SecurityCheck(
                    id = "biometrics",
                    name = "Biometric Authentication",
                    status = SecurityStatus.UNKNOWN,
                    severity = SecuritySeverity.LOW,
                    summary = "Biometric hardware status could not be determined.",
                    scoreImpact = 0,
                    evidence = "BiometricManager code: $authResult"
                )
            }
        }
    }

    private fun checkAppSecurity(): List<SecurityCheck> {
        val results = mutableListOf<SecurityCheck>()
        try {
            val appScanner = InstalledAppScanner(appContext)
            val apps = appScanner.scan()

            var highRiskCount = 0
            var mediumRiskCount = 0

            apps.forEach { app ->
                if (!app.isSystemApp) {
                    val report = AppRiskAnalyzer.analyze(app)
                    if (report.overallRisk == RiskLevel.HIGH) {
                        highRiskCount++
                    } else if (report.overallRisk == RiskLevel.MEDIUM) {
                        mediumRiskCount++
                    }
                }
            }

            if (highRiskCount > 0) {
                results.add(
                    SecurityCheck(
                        id = "installed_apps_high_risk",
                        name = "High-Risk Applications",
                        status = SecurityStatus.WARNING,
                        severity = SecuritySeverity.HIGH,
                        summary = "$highRiskCount installed application(s) declare critical high-risk permissions.",
                        scoreImpact = -(highRiskCount * 8).coerceAtMost(30),
                        evidence = "High risk app count: $highRiskCount",
                        remediation = "Review installed applications in Application Auditor."
                    )
                )
            }

            if (mediumRiskCount > 0) {
                results.add(
                    SecurityCheck(
                        id = "installed_apps_medium_risk",
                        name = "Moderate-Risk Applications",
                        status = SecurityStatus.SUPPORTED,
                        severity = SecuritySeverity.MEDIUM,
                        summary = "$mediumRiskCount installed application(s) have moderate permission privileges.",
                        scoreImpact = -(mediumRiskCount * 3).coerceAtMost(15),
                        evidence = "Medium risk app count: $mediumRiskCount"
                    )
                )
            }

            if (highRiskCount == 0 && mediumRiskCount == 0) {
                results.add(
                    SecurityCheck(
                        id = "installed_apps_clean",
                        name = "Application Permissions",
                        status = SecurityStatus.VERIFIED,
                        severity = SecuritySeverity.INFO,
                        summary = "No high-risk user applications detected (${apps.size} packages scanned).",
                        scoreImpact = 0,
                        evidence = "Total scanned packages: ${apps.size}"
                    )
                )
            }
        } catch (e: Exception) {
            results.add(
                SecurityCheck(
                    id = "installed_apps_scan_error",
                    name = "Application Permissions",
                    status = SecurityStatus.UNKNOWN,
                    severity = SecuritySeverity.LOW,
                    summary = "Application risk scan encountered an exception.",
                    scoreImpact = 0,
                    evidence = e.javaClass.simpleName
                )
            )
        }
        return results
    }

    private fun checkVpnProtection(): SecurityCheck {
        val vpnManager = SecureVpnManager(appContext)
        val state = vpnManager.getState()

        return if (state == VpnState.CONNECTED) {
            SecurityCheck(
                id = "vpn_protection",
                name = "SecureDroid VPN Protection",
                status = SecurityStatus.VERIFIED,
                severity = SecuritySeverity.INFO,
                summary = "Application-level VPN DNS filtering is active and connected.",
                scoreImpact = 0,
                evidence = "SecureVpnManager reports CONNECTED"
            )
        } else {
            SecurityCheck(
                id = "vpn_protection",
                name = "SecureDroid VPN Protection",
                status = SecurityStatus.SUPPORTED,
                severity = SecuritySeverity.LOW,
                summary = "SecureDroid VPN DNS protection is disconnected.",
                scoreImpact = -10,
                evidence = "SecureVpnManager reports state: ${state.name}",
                remediation = "Enable VPN protection in SecureDroid."
            )
        }
    }

    private fun calculateScoreFromChecks(checks: List<SecurityCheck>): Int {
        var score = 100
        checks.forEach { check ->
            score += check.scoreImpact
        }
        return SecurityScorePolicy.clamp(score)
    }
}

