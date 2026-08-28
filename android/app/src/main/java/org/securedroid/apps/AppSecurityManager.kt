package org.securedroid.apps

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build

data class AppSecuritySummary(
    val totalApps: Int,
    val systemApps: Int,
    val userApps: Int,
    val highRiskApps: Int,
    val mediumRiskApps: Int,
    val lowRiskApps: Int,
    val debuggableApps: Int,
    val disabledApps: Int,
    val sideloadedOrUnknownSourceApps: Int
)

data class AppSecurityResult(
    val apps: List<InstalledAppInfo>,
    val reports: List<AppRiskReport>,
    val summary: AppSecuritySummary
)

class AppSecurityManager(
    private val context: Context
) {

    private val scanner = InstalledAppScanner(context)

    /**
     * Performs a complete application security scan.
     *
     * This is a local heuristic assessment based only on
     * information Android exposes to the application.
     *
     * It does NOT claim malware detection or behavioral analysis.
     */
    fun scan(): AppSecurityResult {
        val apps = scanner.scan()

        val reports = apps.map { app ->
            AppRiskAnalyzer.analyze(app)
        }

        val summary = AppSecuritySummary(
            totalApps = apps.size,
            systemApps = apps.count { it.isSystemApp },
            userApps = apps.count { !it.isSystemApp },
            highRiskApps = reports.count {
                it.overallRisk == RiskLevel.HIGH
            },
            mediumRiskApps = reports.count {
                it.overallRisk == RiskLevel.MEDIUM
            },
            lowRiskApps = reports.count {
                it.overallRisk == RiskLevel.LOW
            },
            debuggableApps = apps.count {
                it.isDebuggable
            },
            disabledApps = apps.count {
                !it.isEnabled
            },
            sideloadedOrUnknownSourceApps = reports.count { report ->
                report.findings.any {
                    it.id == "SIDELOADED" ||
                        it.id == "UNKNOWN_INSTALLER"
                }
            }
        )

        return AppSecurityResult(
            apps = apps,
            reports = reports,
            summary = summary
        )
    }

    fun analyzePackage(packageName: String): AppRiskReport? {
        val app = scanner.findPackage(packageName)
            ?: return null

        return AppRiskAnalyzer.analyze(app)
    }

    fun getInstalledApp(packageName: String): InstalledAppInfo? {
        return scanner.findPackage(packageName)
    }

    fun isInstalled(packageName: String): Boolean {
        return scanner.isInstalled(packageName)
    }

    /**
     * Returns applications that Android marks as debuggable.
     *
     * A debuggable flag is evidence about the application build;
     * it is not proof that an attacker currently has access.
     */
    fun getDebuggableApps(): List<InstalledAppInfo> {
        return scanner.scan()
            .filter { it.isDebuggable }
    }

    fun getUserApps(): List<InstalledAppInfo> {
        return scanner.scan()
            .filter { !it.isSystemApp }
    }

    fun getSystemApps(): List<InstalledAppInfo> {
        return scanner.scan()
            .filter { it.isSystemApp }
    }

    /**
     * Returns apps with at least one HIGH risk finding.
     */
    fun getHighRiskApps(): List<Pair<InstalledAppInfo, AppRiskReport>> {
        val apps = scanner.scan()

        return apps.map { app ->
            app to AppRiskAnalyzer.analyze(app)
        }.filter { (_, report) ->
            report.overallRisk == RiskLevel.HIGH
        }
    }

    /**
     * Returns apps with medium or high risk.
     */
    fun getElevatedRiskApps(): List<Pair<InstalledAppInfo, AppRiskReport>> {
        val apps = scanner.scan()

        return apps.map { app ->
            app to AppRiskAnalyzer.analyze(app)
        }.filter { (_, report) ->
            report.overallRisk == RiskLevel.HIGH ||
                report.overallRisk == RiskLevel.MEDIUM
        }
    }

    /**
     * Returns whether the supplied package appears to be a
     * user-installed application.
     */
    fun isUserApplication(packageName: String): Boolean {
        val app = scanner.findPackage(packageName)
            ?: return false

        return !app.isSystemApp
    }

    /**
     * Returns whether the package is currently enabled.
     */
    fun isApplicationEnabled(packageName: String): Boolean {
        val app = scanner.findPackage(packageName)
            ?: return false

        return app.isEnabled
    }

    /**
     * Returns whether Android reports the application as launchable.
     */
    fun isLaunchable(packageName: String): Boolean {
        val app = scanner.findPackage(packageName)
            ?: return false

        return app.isLaunchable
    }

    /**
     * Returns the application UID when Android exposes the package.
     *
     * This is informational only.
     */
    fun getApplicationUid(packageName: String): Int? {
        return try {
            val applicationInfo =
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    context.packageManager.getApplicationInfo(
                        packageName,
                        PackageManager.ApplicationInfoFlags.of(0)
                    )
                } else {
                    @Suppress("DEPRECATION")
                    context.packageManager.getApplicationInfo(
                        packageName,
                        0
                    )
                }

            applicationInfo.uid
        } catch (_: PackageManager.NameNotFoundException) {
            null
        } catch (_: Exception) {
            null
        }
    }
}
