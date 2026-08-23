package org.securedroid

import android.content.Context
import org.securedroid.apps.InstalledAppInfo

class InstalledAppScanner(
    context: Context
) {

    private val delegate =
        org.securedroid.apps.InstalledAppScanner(context)

    fun scan(): List<InstalledAppInfo> {
        return delegate.scan()
    }

    fun findPackage(packageName: String): InstalledAppInfo? {
        return delegate.findPackage(packageName)
    }

    fun isInstalled(packageName: String): Boolean {
        return delegate.isInstalled(packageName)
    }
}
