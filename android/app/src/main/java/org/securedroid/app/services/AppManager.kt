package com.securedroid.app.services

import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Build
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject

class AppManager(
    private val context: Context
) {

    fun getInstalledApps(): JSArray {
        val result = JSArray()
        val packageManager = context.packageManager

        val packages = try {
            packageManager.getInstalledPackages(
                PackageManager.GET_PERMISSIONS or
                    PackageManager.GET_META_DATA
            )
        } catch (_: Exception) {
            emptyList()
        }

        for (packageInfo in packages) {
            val applicationInfo = packageInfo.applicationInfo ?: continue

            val appName = try {
                packageManager
                    .getApplicationLabel(applicationInfo)
                    .toString()
            } catch (_: Exception) {
                packageInfo.packageName
            }

            val isSystemApp =
                (applicationInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0

            val isDebuggable =
                (applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0

            val launchIntent =
                packageManager.getLaunchIntentForPackage(
                    packageInfo.packageName
                )

            val versionCode = if (
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.P
            ) {
                packageInfo.longVersionCode
            } else {
                @Suppress("DEPRECATION")
                packageInfo.versionCode.toLong()
            }

            val minSdk = if (
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.N
            ) {
                applicationInfo.minSdkVersion
            } else {
                1
            }

            val permissions = JSArray()

            packageInfo.requestedPermissions?.forEach { permission ->
                permissions.put(permission)
            }

            val app = JSObject().apply {
                put("packageName", packageInfo.packageName)
                put("label", appName)
                put("versionName", packageInfo.versionName ?: "unknown")
                put("versionCode", versionCode)
                put("targetSdk", applicationInfo.targetSdkVersion)
                put("minSdk", minSdk)
                put("isSystemApp", isSystemApp)
                put("isLaunchable", launchIntent != null)
                put("firstInstallTime", packageInfo.firstInstallTime)
                put("lastUpdateTime", packageInfo.lastUpdateTime)
                put("isDebuggable", isDebuggable)
                put("enabled", applicationInfo.enabled)
                put("requestedPermissions", permissions)
            }

            result.put(app)
        }

        return result
    }

    fun launchApp(packageName: String): Boolean {
        return try {
            val intent =
                context.packageManager.getLaunchIntentForPackage(packageName)
                    ?: return false

            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)

            true
        } catch (_: Exception) {
            false
        }
    }
}
