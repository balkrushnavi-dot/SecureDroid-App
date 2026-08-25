package org.securedroid

import android.content.Context
import android.content.pm.PackageManager
import android.util.Log

class AppScanner(private val context: Context) {
    
    fun getInstalledApps(): List<AppInfo> {
        val pm = context.packageManager
        val apps = pm.getInstalledPackages(PackageManager.GET_PERMISSIONS)
        
        return apps.map { pkg ->
            AppInfo(
                name = pkg.applicationInfo?.loadLabel(pm)?.toString() ?: "Unknown",
                packageName = pkg.packageName,
                version = pkg.versionName ?: "Unknown",
                permissions = pkg.requestedPermissions?.toList() ?: emptyList(),
                isSystem = (pkg.applicationInfo?.flags and ApplicationInfo.FLAG_SYSTEM) != 0
            )
        }
    }
}

data class AppInfo(
    val name: String,
    val packageName: String,
    val version: String,
    val permissions: List<String>,
    val isSystem: Boolean
)
