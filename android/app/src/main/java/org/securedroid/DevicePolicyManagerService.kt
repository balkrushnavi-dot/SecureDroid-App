package org.securedroid

import android.content.Context
import org.securedroid.admin.AdminPolicy

class DevicePolicyManagerService(
    context: Context
) {

    private val delegate =
        org.securedroid.admin.DevicePolicyManagerService(context)

    fun isAdminActive(): Boolean {
        return delegate.isAdminActive()
    }

    fun getPolicy(): AdminPolicy {
        return delegate.getPolicy()
    }

    fun setCameraDisabled(disabled: Boolean): Boolean {
        return delegate.setCameraDisabled(disabled)
    }

    fun isCameraDisabled(): Boolean {
        return delegate.isCameraDisabled()
    }
}
