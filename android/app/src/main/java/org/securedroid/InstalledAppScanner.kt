package org.securedroid.apps

import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager

data class AppInfoModel(
    val packageName: String,
    val appName: String,
    val isSystemApp: Boolean,
    val category: String
)

class InstalledAppScanner(private val context: Context) {

    private val packageManager: PackageManager = context.packageManager

    fun getInstalledApplications(): List<AppInfoModel> {
        val apps = mutableListOf<AppInfoModel>()
        try {
            val installedPackages = packageManager.getInstalledApplications(PackageManager.GET_META_DATA)
            for (appInfo in installedPackages) {
                val appName = packageManager.getApplicationLabel(appInfo).toString()
                val isSystem = (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0
                val category = if (isSystem) "System" else "User"

                apps.add(
                    AppInfoModel(
                        packageName = appInfo.packageName,
                        appName = appName,
                        isSystemApp = isSystem,
                        category = category
                    )
                )
            }
        } catch (e: Exception) {
            // Handle query exceptions gracefully
        }
        return apps
    }
}
