package org.securedroid.security

import android.content.Context
import android.os.Build
import org.securedroid.diagnostics.DeviceDiagnostics
import org.securedroid.diagnostics.HardeningAnalyzer
import org.securedroid.diagnostics.WifiSecurityAnalyzer

/**

* Central security observation layer for SecureDroid.

* 

* SecurityMonitor observes security-relevant conditions that the application

* can actually verify. It does not claim kernel, firmware, SELinux, AVB,

* carrier, or other privileged security state that the application cannot

* reliably inspect.
  */
  class SecurityMonitor(
  private val context: Context
  ) {
  
  private val deviceDiagnostics = DeviceDiagnostics(context)
  private val hardeningAnalyzer = HardeningAnalyzer(context)
  private val wifiSecurityAnalyzer = WifiSecurityAnalyzer(context)
  
  /**
  
  * Performs a fresh security assessment.
    */
    fun collectStatus(): SecurityStatusReport {
    val timestamp = System.currentTimeMillis()
    val checks = mutableListOf<SecurityCheck>()
    
    collectDeviceChecks(checks)
    collectHardeningChecks(checks)
    collectNetworkChecks(checks)
    collectPlatformChecks(checks)
    
    val score = calculateScore(checks)
    val overallStatus = calculateOverallStatus(checks)
    
    return SecurityStatusReport(
    timestamp = timestamp,
    overallStatus = overallStatus,
    score = score,
    checks = checks
    )
    }
  
  /**
  
  * Alias useful for callers that expect a security-status operation.
    */
    fun getStatus(): SecurityStatusReport {
    return collectStatus()
    }
  
  private fun collectDeviceChecks(
  checks: MutableList<SecurityCheck>
  ) {
  val status = try {
  deviceDiagnostics.getSecurityStatus()
  } catch (e: Exception) {
  checks.add(
  SecurityCheck(
  id = "DEVICE_DIAGNOSTICS_ERROR",
  name = "Device diagnostics",
  status = SecurityStatus.ERROR,
  severity = SecuritySeverity.HIGH,
  summary = "SecureDroid could not collect device security information.",
  evidence = e.javaClass.simpleName,
  remediation = "Retry the security scan.",
  isReal = true
  )
  )
  return
  }
  
   checks.add(
     SecurityCheck(
         id = "SCREEN_LOCK",
         name = "Screen lock",
         status = if (status.hasScreenLock) {
             SecurityStatus.VERIFIED
         } else {
             SecurityStatus.WARNING
         },
         severity = if (status.hasScreenLock) {
             SecuritySeverity.INFO
         } else {
             SecuritySeverity.CRITICAL
         },
         summary = if (status.hasScreenLock) {
             "A secure screen lock is configured."
         } else {
             "No secure screen lock is configured.",
         },
         remediation = if (status.hasScreenLock) {
             null
         } else {
             "Configure a PIN, password, or supported secure screen lock."
         }
     )
 )

 /*
  * IMPORTANT:
  *
  * DeviceDiagnostics currently exposes isDeviceEncrypted, but its
  * existing implementation uses UserManager.isUserUnlocked().
  *
  * That does NOT prove that device storage is encrypted.
  *
  * Therefore this monitor does not label that value VERIFIED.
  * The encryption implementation must be corrected before this
  * check can become a trustworthy positive security assertion.
  */
 checks.add(
     SecurityCheck(
         id = "DEVICE_ENCRYPTION",
         name = "Device encryption",
         status = SecurityStatus.UNKNOWN,
         severity = SecuritySeverity.MEDIUM,
         summary = "Device encryption status cannot currently be verified reliably by SecureDroid.",
         evidence = "Current DeviceDiagnostics encryption check does not directly verify encryption.",
         remediation = "Use a platform-supported encryption-state check before reporting encryption as verified.",
         isReal = true
     )
 )

 checks.add(
     SecurityCheck(
         id = "SECURITY_PATCH",
         name = "Android security patch",
         status = getPatchStatus(status.securityPatchLevel),
         severity = SecuritySeverity.MEDIUM,
         summary = if (status.securityPatchLevel.isBlank()) {
             "Android security patch level is unavailable."
         } else {
             "Android security patch level: ${status.securityPatchLevel}"
         },
         evidence = status.securityPatchLevel.ifBlank { null },
         remediation = "Install the latest available Android security update.",
         isReal = true
     )
 )

 checks.add(
     SecurityCheck(
         id = "ADB_DEBUGGING",
         name = "USB debugging",
         status = if (status.usbDebuggingEnabled) {
             SecurityStatus.WARNING
         } else {
             SecurityStatus.VERIFIED
         },
         severity = if (status.usbDebuggingEnabled) {
             SecuritySeverity.MEDIUM
         } else {
             SecuritySeverity.INFO
         },
         summary = if (status.usbDebuggingEnabled) {
             "USB debugging is enabled."
         } else {
             "USB debugging is disabled."
         },
         remediation = if (status.usbDebuggingEnabled) {
             "Disable USB debugging when it is not required."
         } else {
             null
         },
         isReal = true
     )
 )

 checks.add(
     SecurityCheck(
         id = "DEVELOPER_OPTIONS",
         name = "Developer Options",
         status = if (status.developerOptionsEnabled) {
             SecurityStatus.WARNING
         } else {
             SecurityStatus.VERIFIED
         },
         severity = if (status.developerOptionsEnabled) {
             SecuritySeverity.LOW
         } else {
             SecuritySeverity.INFO
         },
         summary = if (status.developerOptionsEnabled) {
             "Developer Options are enabled."
         } else {
             "Developer Options are disabled."
         },
         remediation = if (status.developerOptionsEnabled) {
             "Disable Developer Options when they are not needed."
         } else {
             null
         },
         isReal = true
     )
 )

 checks.add(
     SecurityCheck(
         id = "UNKNOWN_SOURCES",
         name = "Unknown-source installation",
         status = if (status.unknownSourcesEnabled) {
             SecurityStatus.WARNING
         } else {
             SecurityStatus.VERIFIED
         },
         severity = if (status.unknownSourcesEnabled) {
             SecuritySeverity.MEDIUM
         } else {
             SecuritySeverity.INFO
         },
         summary = if (status.unknownSourcesEnabled) {
             "Installation from unknown sources is enabled or reported as enabled."
         } else {
             "Unknown-source installation is restricted."
         },
         remediation = if (status.unknownSourcesEnabled) {
             "Disable installation from unknown sources when it is not required."
         } else {
             null
         },
         isReal = true
     )
 )

 checks.add(
     SecurityCheck(
         id = "BIOMETRIC",
         name = "Biometric authentication",
         status = when {
             status.biometricAvailable && status.biometricEnrolled ->
                 SecurityStatus.SUPPORTED

             !status.biometricAvailable ->
                 SecurityStatus.UNAVAILABLE

             else ->
                 SecurityStatus.WARNING
         },
         severity = when {
             status.biometricAvailable && status.biometricEnrolled ->
                 SecuritySeverity.INFO

             !status.biometricAvailable ->
                 SecuritySeverity.INFO

             else ->
                 SecuritySeverity.LOW
         },
         summary = when {
             status.biometricAvailable && status.biometricEnrolled ->
                 "Biometric hardware is available and a biometric is enrolled."

             !status.biometricAvailable ->
                 "No supported fingerprint biometric hardware was detected."

             else ->
                 "Biometric hardware is available but no fingerprint is enrolled."
         },
         remediation = if (
             status.biometricAvailable &&
             !status.biometricEnrolled
         ) {
             "Enroll a biometric if it is appropriate for your security configuration."
         } else {
             null
         },
         isReal = true
     )
 )

 val keyStoreAvailable = try {
     deviceDiagnostics.getKeyStoreStatus()
 } catch (_: Exception) {
     false
 }

 checks.add(
     SecurityCheck(
         id = "ANDROID_KEYSTORE",
         name = "Android Keystore",
         status = if (keyStoreAvailable) {
             SecurityStatus.SUPPORTED
         } else {
             SecurityStatus.UNAVAILABLE
         },
         severity = if (keyStoreAvailable) {
             SecuritySeverity.INFO
         } else {
             SecuritySeverity.HIGH
         },
         summary = if (keyStoreAvailable) {
             "Android Keystore is available to SecureDroid."
         } else {
             "Android Keystore could not be accessed."
         },
         remediation = if (keyStoreAvailable) {
             null
         } else {
             "Retry the check or investigate the device's Keystore implementation."
         },
         isReal = true
     )
 )

 if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
     val strongBoxAvailable = try {
         deviceDiagnostics.hasStrongBox()
     } catch (_: Exception) {
         false
     }

     checks.add(
         SecurityCheck(
             id = "STRONGBOX",
             name = "StrongBox",
             status = if (strongBoxAvailable) {
                 SecurityStatus.SUPPORTED
             } else {
                 SecurityStatus.UNKNOWN
             },
             severity = SecuritySeverity.INFO,
             summary = if (strongBoxAvailable) {
                 "StrongBox-backed key generation appears to be available."
             } else {
                 "StrongBox availability could not be confirmed."
             },
             evidence = if (strongBoxAvailable) {
                 "A StrongBox-backed test key was generated successfully."
             } else {
                 "The current test did not confirm StrongBox availability."
             },
             isReal = true
         )
     )
 } else {
     checks.add(
         SecurityCheck(
             id = "STRONGBOX",
             name = "StrongBox",
             status = SecurityStatus.UNAVAILABLE,
             severity = SecuritySeverity.INFO,
             summary = "StrongBox APIs are unavailable on this Android version.",
             isReal = true
         )
     )
 }
  
  }
  
  private fun collectHardeningChecks(
  checks: MutableList<SecurityCheck>
  ) {
  val report = try {
  hardeningAnalyzer.analyze()
  } catch (e: Exception) {
  checks.add(
  SecurityCheck(
  id = "HARDENING_ANALYZER_ERROR",
  name = "Device hardening analysis",
  status = SecurityStatus.ERROR,
  severity = SecuritySeverity.HIGH,
  summary = "Hardening analysis failed.",
  evidence = e.javaClass.simpleName,
  remediation = "Retry the security scan.",
  isReal = true
  )
  )
  return
  }
  
   report.findings.forEach { finding ->
     val status = when (finding.level) {
         org.securedroid.diagnostics.HardeningLevel.GOOD ->
             SecurityStatus.VERIFIED

         org.securedroid.diagnostics.HardeningLevel.WARNING ->
             SecurityStatus.WARNING

         org.securedroid.diagnostics.HardeningLevel.CRITICAL ->
             SecurityStatus.WARNING
     }

     val severity = when (finding.level) {
         org.securedroid.diagnostics.HardeningLevel.GOOD ->
             SecuritySeverity.INFO

         org.securedroid.diagnostics.HardeningLevel.WARNING ->
             SecuritySeverity.MEDIUM

         org.securedroid.diagnostics.HardeningLevel.CRITICAL ->
             SecuritySeverity.CRITICAL
     }

     checks.add(
         SecurityCheck(
             id = "HARDENING_${finding.id}",
             name = "Hardening: ${finding.id}",
             status = status,
             severity = severity,
             summary = finding.summary,
             isReal = true
         )
     )
 }
  
  }
  
  private fun collectNetworkChecks(
  checks: MutableList<SecurityCheck>
  ) {
  val report = try {
  wifiSecurityAnalyzer.analyze()
  } catch (e: Exception) {
  checks.add(
  SecurityCheck(
  id = "NETWORK_ANALYZER_ERROR",
  name = "Network security analysis",
  status = SecurityStatus.ERROR,
  severity = SecuritySeverity.MEDIUM,
  summary = "Network security analysis failed.",
  evidence = e.javaClass.simpleName,
  remediation = "Retry the network security check.",
  isReal = true
  )
  )
  return
  }
  
   if (!report.isConnected) {
     checks.add(
         SecurityCheck(
             id = "NETWORK_CONNECTION",
             name = "Network connection",
             status = SecurityStatus.SUPPORTED,
             severity = SecuritySeverity.INFO,
             summary = "No active network connection was detected.",
             isReal = true
         )
     )
     return
 }

 checks.add(
     SecurityCheck(
         id = "NETWORK_CONNECTION",
         name = "Network connection",
         status = SecurityStatus.VERIFIED,
         severity = SecuritySeverity.INFO,
         summary = if (report.isWifi) {
             "An active Wi-Fi connection was detected."
         } else {
             "An active non-Wi-Fi network connection was detected."
         },
         isReal = true
     )
 )

 /*
  * NetworkCapabilities cannot prove that a Wi-Fi network uses WPA2,
  * WPA3, or another particular Wi-Fi encryption mode.
  *
  * Therefore "isSecure" from the current analyzer is not promoted
  * into a cryptographic Wi-Fi security claim.
  */
 checks.add(
     SecurityCheck(
         id = "NETWORK_VALIDATION",
         name = "Network validation",
         status = if (report.isSecure) {
             SecurityStatus.SUPPORTED
         } else {
             SecurityStatus.WARNING
         },
         severity = if (report.isSecure) {
             SecuritySeverity.INFO
         } else {
             SecuritySeverity.MEDIUM
         },
         summary = if (report.isSecure) {
             "The active network passed the available connectivity validation."
         } else {
             "The active network is not validated by Android."
         },
         remediation = if (report.isSecure) {
             null
         } else {
             "Check the network, captive portal, or connectivity restrictions."
         },
         isReal = true
     )
 )
  
  }
  
  private fun collectPlatformChecks(
  checks: MutableList<SecurityCheck>
  ) {
  checks.add(
  SecurityCheck(
  id = "ANDROID_VERSION",
  name = "Android version",
  status = SecurityStatus.VERIFIED,
  severity = SecuritySeverity.INFO,
  summary = "Running Android API level ${Build.VERSION.SDK_INT}.",
  evidence = "SDK_INT=${Build.VERSION.SDK_INT}",
  isReal = true
  )
  )
  
   /*
  * SecureDroid intentionally does not claim to verify these states
  * from ordinary application APIs:
  *
  * - Verified Boot / AVB state
  * - SELinux enforcement state
  * - kernel integrity
  * - bootloader lock state
  * - firmware integrity
  *
  * These must remain UNKNOWN unless a trustworthy platform API,
  * attestation result, or other verifiable evidence is introduced.
  */
 checks.add(
     SecurityCheck(
         id = "PLATFORM_INTEGRITY",
         name = "Platform integrity",
         status = SecurityStatus.UNKNOWN,
         severity = SecuritySeverity.INFO,
         summary = "SecureDroid cannot independently verify firmware, kernel, Verified Boot, or SELinux state from its current application-level APIs.",
         remediation = "Use supported Android attestation or platform-provided evidence when available.",
         isReal = true
     )
 )
  
  }
  
  private fun getPatchStatus(
  patchLevel: String
  ): SecurityStatus {
  if (patchLevel.isBlank()) {
  return SecurityStatus.UNKNOWN
  }
  
   return try {
     val parts = patchLevel.split("-")

     if (parts.size != 2) {
         SecurityStatus.UNKNOWN
     } else {
         val year = parts[0].toIntOrNull()
         val month = parts[1].toIntOrNull()

         if (
             year == null ||
             month == null ||
             month !in 1..12
         ) {
             SecurityStatus.UNKNOWN
         } else {
             /*
              * Do not hard-code a calendar year such as 2026.
              * A patch is stale relative to the current date,
              * not relative to the app's release year.
              */
             val currentYear = java.util.Calendar.getInstance()
                 .get(java.util.Calendar.YEAR)

             val currentMonth = java.util.Calendar.getInstance()
                 .get(java.util.Calendar.MONTH) + 1

             val monthsBehind =
                 (currentYear - year) * 12 +
                     (currentMonth - month)

             when {
                 monthsBehind < 0 ->
                     SecurityStatus.UNKNOWN

                 monthsBehind <= 3 ->
                     SecurityStatus.VERIFIED

                 monthsBehind <= 6 ->
                     SecurityStatus.WARNING

                 else ->
                     SecurityStatus.WARNING
             }
         }
     }
 } catch (_: Exception) {
     SecurityStatus.UNKNOWN
 }
  
  }
  
  private fun calculateOverallStatus(
  checks: List<SecurityCheck>
  ): SecurityStatus {
  if (checks.isEmpty()) {
  return SecurityStatus.UNKNOWN
  }
  
   if (checks.any { it.status == SecurityStatus.ERROR }) {
     return SecurityStatus.ERROR
 }

 if (checks.any {
         it.status == SecurityStatus.WARNING &&
             it.severity == SecuritySeverity.CRITICAL
     }) {
     return SecurityStatus.WARNING
 }

 if (checks.any { it.status == SecurityStatus.WARNING }) {
     return SecurityStatus.WARNING
 }

 if (checks.any {
         it.status == SecurityStatus.UNKNOWN ||
             it.status == SecurityStatus.UNAVAILABLE
     }) {
     return SecurityStatus.UNKNOWN
 }

 return SecurityStatus.VERIFIED
  
  }
  
  private fun calculateScore(
  checks: List<SecurityCheck>
  ): Int {
  if (checks.isEmpty()) {
  return 0
  }
  
   var score = 100

 checks.forEach { check ->
     when (check.status) {
         SecurityStatus.VERIFIED,
         SecurityStatus.SUPPORTED -> {
             // No deduction.
         }

         SecurityStatus.WARNING -> {
             score -= when (check.severity) {
                 SecuritySeverity.INFO -> 2
                 SecuritySeverity.LOW -> 5
                 SecuritySeverity.MEDIUM -> 10
                 SecuritySeverity.HIGH -> 15
                 SecuritySeverity.CRITICAL -> 25
             }
         }

         SecurityStatus.UNKNOWN,
         SecurityStatus.UNAVAILABLE -> {
             /*
              * Unknown is not equivalent to insecure.
              * Apply only a small confidence penalty rather than
              * falsely treating an unverifiable condition as failed.
              */
             score -= 2
         }

         SecurityStatus.ERROR -> {
             score -= 15
         }
     }
 }

 return score.coerceIn(0, 100)
  
  }
  }
