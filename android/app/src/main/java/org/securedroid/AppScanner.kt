package org.securedroid

import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Build
import org.json.JSONArray
import org.json.JSONObject

class AppScanner(private val context: Context) {

    data class AppInfo(
        val packageName: String,
        val appName: String,
        val versionName: String,
        val versionCode: Long,
        val isSystemApp: Boolean,
        val installTime: Long,
        val updateTime: Long,
        val permissions: List<String>,
        val isSideloaded: Boolean,
        val installSource: String
    )

    fun getInstalledApps(): List<AppInfo> {
        val packageManager = context.packageManager
        val apps = mutableListOf<AppInfo>()

        try {
            val installedPackages = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                packageManager.getInstalledPackages(
                    PackageManager.GET_PERMISSIONS or PackageManager.GET_META_DATA
                )
            } else {
                @Suppress("DEPRECATION")
                packageManager.getInstalledPackages(
                    PackageManager.GET_PERMISSIONS or PackageManager.GET_META_DATA
                )
            }

            installedPackages.forEach { packageInfo ->
                val applicationInfo = packageInfo.applicationInfo
                applicationInfo?.let { info ->
                    val isSystemApp = (info.flags and ApplicationInfo.FLAG_SYSTEM) != 0
                    val installerPackage = try {
                        packageManager.getInstallerPackageName(packageInfo.packageName)
                    } catch (_: Exception) {
                        null
                    }

                    // Check if from Play Store
                    val isFromPlayStore = installerPackage == "com.android.vending" ||
                            installerPackage == "com.google.android.feedback" ||
                            installerPackage == "com.google.android.gms"

                    apps.add(
                        AppInfo(
                            packageName = packageInfo.packageName,
                            appName = info.loadLabel(packageManager).toString(),
                            versionName = packageInfo.versionName ?: "Unknown",
                            versionCode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                                packageInfo.longVersionCode
                            } else {
                                @Suppress("DEPRECATION")
                                packageInfo.versionCode.toLong()
                            },
                            isSystemApp = isSystemApp,
                            installTime = packageInfo.firstInstallTime,
                            updateTime = packageInfo.lastUpdateTime,
                            permissions = packageInfo.requestedPermissions?.toList() ?: emptyList(),
                            isSideloaded = !isSystemApp && !isFromPlayStore,
                            installSource = installerPackage ?: "Unknown"
                        )
                    )
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        return apps.sortedByDescending { it.updateTime }
    }

    fun getRiskyApps(): List<AppInfo> {
        return getInstalledApps().filter { app ->
            // Check for dangerous permissions
            val hasDangerousPermissions = app.permissions.any { permission ->
                permission.contains("LOCATION") ||
                permission.contains("CAMERA") ||
                permission.contains("RECORD_AUDIO") ||
                permission.contains("CONTACTS") ||
                permission.contains("SMS") ||
                permission.contains("CALL_PHONE")
            }

            app.isSideloaded || hasDangerousPermissions || app.permissions.size > 15
        }
    }
}
