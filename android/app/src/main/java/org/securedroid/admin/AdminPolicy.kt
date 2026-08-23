package org.securedroid.admin

data class AdminPolicy(
    val cameraDisabled: Boolean = false,
    val screenCaptureDisabled: Boolean = false,
    val keyguardDisabled: Boolean = false,
    val passwordRequired: Boolean = false
)
