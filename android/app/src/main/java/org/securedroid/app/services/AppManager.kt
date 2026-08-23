package com.securedroid.app.services

import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Build
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject

class AppManager(private val context: Context) {

    fun getInstalledApps(): JSArray {
        val ret = JSArray()
        val pm = context.packageManager
        val flags = PackageManager.GET_PERMISSIONS or PackageManager.GET_META_DATA
        val packages = pm.getInstalledPackages(flags)

        for (pkg in packages) {
            val appInfo = pkg.applicationInfo ?: continue
            val label = pm.getApplicationLabel(appInfo).toString()
            val isSystem = (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0
            val isDebuggable = (appInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0
            val launchIntent = pm.getLaunchIntentForPackage(pkg.packageName)

            val obj = JSObject()
            obj.put("packageName", pkg.packageName)
            obj.put("label", label)
            obj.put("versionName", pkg.versionName ?: "1.0.0")
            obj.put("versionCode", if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) pkg.longVersionCode.toInt() else pkg.versionCode)
            obj.put("targetSdk", appInfo.targetSdkVersion)
            obj.put("minSdk", if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) appInfo.minSdkVersion else 21)
            obj.put("isSystemApp", isSystem)
            obj.put("isLaunchable", launchIntent != null)
            obj.put("firstInstallTime", pkg.firstInstallTime)
            obj.put("lastUpdateTime", pkg.lastUpdateTime)
            obj.put("isDebuggable", isDebuggable)
            obj.put("enabled", appInfo.enabled)

            val perms = JSArray()
            pkg.requestedPermissions?.forEach { perms.put(it) }
            obj.put("requestedPermissions", perms)

            ret.put(obj)
        }

        return ret
    }

    fun launchApp(packageName: String): Boolean {
        return try {
            val pm = context.packageManager
            val intent = pm.getLaunchIntentForPackage(packageName)
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(intent)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            false
        }
    }
}
