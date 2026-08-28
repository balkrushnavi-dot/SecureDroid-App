package org.securedroid.security

import android.content.Context
import org.securedroid.apps.AppRiskAnalyzer
import org.securedroid.apps.InstalledAppScanner
import org.securedroid.diagnostics.HardeningAnalyzer
import org.securedroid.vpn.SecureVpnManager

/**

* Central security assessment coordinator.

* 

* SecurityMonitor does not claim privileges that SecureDroid does not have.

* It combines application-visible evidence from the existing analyzers.
  */
  class SecurityMonitor(
  context: Context
  ) {
  
  private val appScanner = InstalledAppScanner(context)
  private val hardeningAnalyzer = HardeningAnalyzer(context)
  private val vpnManager = SecureVpnManager(context)
  
  fun analyze(): SecurityReport {
  
   val checks = mutableListOf<SecurityCheck>()

 /*
  * Device hardening
  */
 val hardeningReport = try {
     hardeningAnalyzer.analyze()
 } catch (e: Exception) {
     null
 }

 if (hardeningReport == null) {

     checks.add(
         SecurityCheck(
             id = "DEVICE_HARDENING",
             name = "Device Hardening",
             status = SecurityStatus.UNKNOWN,
             summary = "Device hardening assessment could not be completed.",
             limitation = "SecureDroid could not obtain reliable evidence from the device.",
             remediation = "Run the security assessment again."
         )
     )

 } else {

     hardeningReport.findings.forEach { finding ->

         val status = when (finding.level.name) {
             "GOOD" -> SecurityStatus.VERIFIED
             "WARNING" -> SecurityStatus.WARNING
             "CRITICAL" -> SecurityStatus.WARNING
             else -> SecurityStatus.UNKNOWN
         }

         checks.add(
             SecurityCheck(
                 id = finding.id,
                 name = finding.id
                     .lowercase()
                     .replace("_", " ")
                     .replaceFirstChar { it.uppercase() },
                 status = status,
                 summary = finding.summary
             )
         )
     }
 }

 /*
  * Installed application assessment
  */
 val appRiskReports = try {

     appScanner.scan().map { app ->
         AppRiskAnalyzer.analyze(app)
     }

 } catch (e: Exception) {

     emptyList()
 }

 val highRiskApps = appRiskReports.count {
     it.overallRisk.name == "HIGH"
 }

 val mediumRiskApps = appRiskReports.count {
     it.overallRisk.name == "MEDIUM"
 }

 when {
     highRiskApps > 0 -> {

         checks.add(
             SecurityCheck(
                 id = "HIGH_RISK_APPS",
                 name = "High-Risk Applications",
                 status = SecurityStatus.WARNING,
                 summary = "$highRiskApps installed application(s) have high assessed risk.",
                 evidence = "Risk assessment based on application-visible package metadata and requested permissions.",
                 limitation = "SecureDroid does not perform malware reverse engineering or kernel-level inspection."
             )
         )
     }

     mediumRiskApps > 0 -> {

         checks.add(
             SecurityCheck(
                 id = "MEDIUM_RISK_APPS",
                 name = "Medium-Risk Applications",
                 status = SecurityStatus.WARNING,
                 summary = "$mediumRiskApps installed application(s) have medium assessed risk.",
                 evidence = "Risk assessment based on application-visible package metadata and requested permissions."
             )
         )
     }

     else -> {

         checks.add(
             SecurityCheck(
                 id = "APP_RISK_ASSESSMENT",
                 name = "Application Risk Assessment",
                 status = SecurityStatus.SUPPORTED,
                 summary = "No high or medium application risk was detected by the current rules.",
                 evidence = "Installed package metadata and requested permissions were analyzed.",
                 limitation = "A clean rule-based result does not prove that an application is malware-free."
             )
         )
     }
 }

 /*
  * VPN status
  */
 val vpnConnected = vpnManager.isConnected()

 checks.add(
     SecurityCheck(
         id = "SECUREDROID_VPN",
         name = "Application-Level VPN",
         status = if (vpnConnected) {
             SecurityStatus.VERIFIED
         } else {
             SecurityStatus.WARNING
         },
         summary = if (vpnConnected) {
             "SecureDroid application-level VPN is connected."
         } else {
             "SecureDroid application-level VPN is not connected."
         },
         evidence = "Current SecureDroid VPN service state.",
         limitation = "This does not prove that every network connection is secure or malware-free."
     )
 )

 /*
  * Calculate overall score.
  */
 val scoreResult = SecurityScoreCalculator.calculate(
     hardeningReport = hardeningReport,
     appRiskReports = appRiskReports,
     vpnConnected = vpnConnected
 )

 return SecurityReportBuilder.build(
     checks = checks,
     score = scoreResult.score,
     grade = scoreResult.grade
 )
  
  }
  }
