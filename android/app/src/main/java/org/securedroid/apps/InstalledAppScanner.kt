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
    val requestedPermissions: List<String>
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
                            ?: emptyList()
                )
            }
            .sortedBy { it.appName.lowercase() }
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
