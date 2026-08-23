package org.securedroid.apps

import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo

data class InstalledAppInfo(
    val packageName: String,
    val appName: String,
    val versionName: String?,
    val versionCode: Long,
    val isSystemApp: Boolean,
    val isEnabled: Boolean
)

class InstalledAppScanner(
    private val context: Context
) {

    fun scan(): List<InstalledAppInfo> {
        val packageManager = context.packageManager

        val packages: List<PackageInfo> =
            packageManager.getInstalledPackages(0)

        return packages
            .map { packageInfo ->
                val applicationInfo = packageInfo.applicationInfo

                InstalledAppInfo(
                    packageName = packageInfo.packageName,
                    appName = applicationInfo?.loadLabel(packageManager)?.toString()
                        ?: packageInfo.packageName,
                    versionName = packageInfo.versionName,
                    versionCode = if (android.os.Build.VERSION.SDK_INT >= 28) {
                        packageInfo.longVersionCode
                    } else {
                        @Suppress("DEPRECATION")
                        packageInfo.versionCode.toLong()
                    },
                    isSystemApp = applicationInfo?.let {
                        (it.flags and ApplicationInfo.FLAG_SYSTEM) != 0
                    } ?: false,
                    isEnabled = applicationInfo?.enabled ?: false
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
