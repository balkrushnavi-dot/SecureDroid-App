package org.securedroid.core

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.securedroid.apps.AppSecurityManager
import org.securedroid.audit.SecurityAuditManager
import org.securedroid.network.NetworkSecurityManager
import org.securedroid.privacy.PrivacyMonitor
import org.securedroid.security.SecurityMonitor
import org.securedroid.security.SecurityScoreCalculator
import org.securedroid.security.SecurityStatus
import org.securedroid.security.SecurityStatusReport

data class SecureDroidSecuritySnapshot(
    val status: SecurityStatusReport,
    val score: Int,
    val appSecurity: Any?,
    val networkSecurity: Any?,
    val privacy: Any?,
    val generatedAt: Long
)

class SecureDroidSecurityManager(
    private val context: Context
) {

    private val securityMonitor =
        SecurityMonitor(context)

    private val appSecurityManager =
        AppSecurityManager(context)

    private val networkSecurityManager =
        NetworkSecurityManager(context)

    private val privacyMonitor =
        PrivacyMonitor(context)

    private val auditManager =
        SecurityAuditManager(context)

    private val scoreCalculator =
        SecurityScoreCalculator

    /**
     * Performs a complete local security assessment.
     *
     * All expensive scanning work runs on Dispatchers.IO.
     *
     * The returned information represents capabilities and
     * observations available to the SecureDroid application.
     * It is not an antivirus verdict.
     */
    suspend fun analyze(): SecureDroidSecuritySnapshot =
        withContext(Dispatchers.IO) {

            val status = securityMonitor.getSecurityStatus()

            val appSecurity = try {
                appSecurityManager.scan()
            } catch (_: Exception) {
                null
            }

            val networkSecurity = try {
                networkSecurityManager.analyze()
            } catch (_: Exception) {
                null
            }

            val privacy = try {
                privacyMonitor.analyze()
            } catch (_: Exception) {
                null
            }

            val score = calculateScore(
                status = status,
                appSecurity = appSecurity,
                networkSecurity = networkSecurity
            )

            auditManager.log(
                category = "SECURITY_SCAN",
                severity = "INFO",
                description = "SecureDroid security assessment completed.",
                source = "SecureDroidSecurityManager"
            )

            SecureDroidSecuritySnapshot(
                status = status,
                score = score,
                appSecurity = appSecurity,
                networkSecurity = networkSecurity,
                privacy = privacy,
                generatedAt = System.currentTimeMillis()
            )
        }

    /**
     * Refreshes only the device security status.
     */
    fun getSecurityStatus(): SecurityStatusReport {
        return securityMonitor.getSecurityStatus()
    }

    fun getSecurityScore(status: SecurityStatusReport): Int {
        return scoreCalculator.calculate(status)
    }

    fun getSecurityScore(status: SecurityStatus): Int {
        return scoreCalculator.calculate(status)
    }

    fun getNetworkSecurity() =
        networkSecurityManager.analyze()

    fun getAppSecurity() =
        appSecurityManager.scan()

    fun getPrivacyReport() =
        privacyMonitor.analyze()

    fun startVpn(): Boolean {
        val started = networkSecurityManager.startVpn()

        auditManager.log(
            category = "NETWORK",
            severity = if (started) "INFO" else "WARNING",
            description =
                if (started) {
                    "SecureDroid VPN start requested."
                } else {
                    "SecureDroid VPN could not be started."
                },
            source = "SecureDroidSecurityManager"
        )

        return started
    }

    fun stopVpn() {
        networkSecurityManager.stopVpn()

        auditManager.log(
            category = "NETWORK",
            severity = "INFO",
            description = "SecureDroid VPN stop requested.",
            source = "SecureDroidSecurityManager"
        )
    }

    fun isVpnConnected(): Boolean {
        return networkSecurityManager.isVpnConnected()
    }

    fun addBlockedDomain(domain: String): Boolean {
        return networkSecurityManager.addBlockedDomain(domain)
    }

    fun removeBlockedDomain(domain: String): Boolean {
        return networkSecurityManager.removeBlockedDomain(domain)
    }

    fun addAllowedDomain(domain: String): Boolean {
        return networkSecurityManager.addAllowedDomain(domain)
    }

    fun removeAllowedDomain(domain: String): Boolean {
        return networkSecurityManager.removeAllowedDomain(domain)
    }

    fun isDomainBlocked(domain: String): Boolean {
        return networkSecurityManager.isDomainBlocked(domain)
    }

    fun getAuditEvents(
        limit: Int = 100,
        category: String? = null
    ) = auditManager.getEvents(
        limit = limit,
        category = category
    )

    fun clearAuditEvents(): Boolean {
        return auditManager.clearAll()
    }

    private fun calculateScore(
        status: SecurityStatusReport,
        appSecurity: Any?,
        networkSecurity: Any?
    ): Int {
        return try {
            scoreCalculator.calculate(status)
        } catch (_: Exception) {
            0
        }.coerceIn(0, 100)
    }
}

