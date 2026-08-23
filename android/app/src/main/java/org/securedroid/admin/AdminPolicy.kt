package org.securedroid.admin

data class AdminPolicy(
    val requireSecureLockScreen: Boolean = true,
    val allowCamera: Boolean = true,
    val allowScreenCapture: Boolean = true
)
