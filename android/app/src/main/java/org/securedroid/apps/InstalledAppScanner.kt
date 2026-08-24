package org.securedroid.apps

import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import android.os.Build

data class InstalledAppInfo(
    val packageName: String,
    val appName: String,
    val versionName: String?,
    val versionCode: Long,
    val targetSdk: Int,
    val minSdk: Int,
    val isSystemApp: Boolean,
    val isEnabled: Boolean,
    val isLaunchable: Boolean,
    val firstInstallTime: Long,
    val lastUpdateTime: Long,
    val requestedPermissions: List<String>,
    val installerPackageName: String?
)

class InstalledAppScanner(
    private val context: Context
) {

    fun scan(): List<InstalledAppInfo> {
        val packageManager = context.packageManager

        val packages: List<PackageInfo> =
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                packageManager.getInstalledPackages(
                    android.content.pm.PackageManager.PackageInfoFlags.of(
                        android.content.pm.PackageManager.GET_PERMISSIONS.toLong()
                    )
                )
            } else {
                @Suppress("DEPRECATION")
                packageManager.getInstalledPackages(
                    android.content.pm.PackageManager.GET_PERMISSIONS
                )
            }

        return packages
            .mapNotNull { packageInfo ->
                val applicationInfo = packageInfo.applicationInfo
                    ?: return@mapNotNull null

                InstalledAppInfo(
                    packageName = packageInfo.packageName,
                    appName = applicationInfo
                        .loadLabel(packageManager)
                        .toString()
                        .ifBlank { packageInfo.packageName },
                    versionName = packageInfo.versionName,
                    versionCode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                        packageInfo.longVersionCode
                    } else {
                        @Suppress("DEPRECATION")
                        packageInfo.versionCode.toLong()
                    },
                    targetSdk = applicationInfo.targetSdkVersion,
                    minSdk = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                        applicationInfo.minSdkVersion
                    } else {
                        0
                    },
                    isSystemApp =
                        (applicationInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0,
                    isEnabled = applicationInfo.enabled,
                    isLaunchable =
                        packageManager.getLaunchIntentForPackage(
                            packageInfo.packageName
                        ) != null,
                    firstInstallTime = packageInfo.firstInstallTime,
                    lastUpdateTime = packageInfo.lastUpdateTime,
                    requestedPermissions =
                        packageInfo.requestedPermissions
                            ?.toList()
                            ?: emptyList(),
                    installerPackageName =
                        getInstallerPackageName(
                            packageManager,
                            packageInfo.packageName
                        )
                )
            }
            .sortedBy { it.appName.lowercase() }
    }

    /**
     * Returns the package name of the app store/installer that
     * installed this package, or null if it cannot be determined
     * (e.g. installed via adb, or the info is unavailable). A null
     * or unrecognized installer is a real, checkable signal that an
     * app was sideloaded rather than installed from a known store —
     * it is reported as-is, not upgraded into a "malicious app"
     * claim.
     */
    private fun getInstallerPackageName(
        packageManager: android.content.pm.PackageManager,
        packageName: String
    ): String? {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                packageManager
                    .getInstallSourceInfo(packageName)
                    .installingPackageName
            } else {
                @Suppress("DEPRECATION")
                packageManager.getInstallerPackageName(packageName)
            }
        } catch (_: Exception) {
            null
        }
    }

    fun findPackage(packageName: String): InstalledAppInfo? {
        return scan().firstOrNull {
            it.packageName == packageName
        }
    }

    fun isInstalled(packageName: String): Boolean {
        return findPackage(packageName) != null
    }
}
