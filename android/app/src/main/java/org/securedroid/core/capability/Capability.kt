package org.securedroid.core.capability

data class Capability(
    val id: String,
    val name: String,
    val category: CapabilityCategory,
    val state: CapabilityState,
    val evidence: String,
    val securityMeaning: String,
    val limitations: List<String> = emptyList(),
    val remediation: String? = null,
    val provider: String,
    val isReal: Boolean,
    val canAppChange: Boolean,
    val requiredPrivilege: RequiredPrivilege,
    val implementationLayer: ImplementationLayer
)

enum class CapabilityCategory {
    DEVICE_SECURITY,
    AUTHENTICATION,
    CRYPTOGRAPHY,
    STORAGE,
    NETWORK,
    APPLICATION_SECURITY,
    PRIVACY,
    MANAGEMENT,
    MONITORING,
    SYSTEM,
    HARDWARE
}

enum class CapabilityState {
    SUPPORTED,
    LIMITED,
    UNAVAILABLE,
    UNKNOWN,
    REQUIRES_DEVICE_OWNER,
    REQUIRES_SYSTEM_PRIVILEGE,
    REQUIRES_HARDWARE,
    REQUIRES_OS_INTEGRATION,
    DEMO_ONLY,
    ERROR
}

enum class RequiredPrivilege {
    NONE,
    NORMAL_APP,
    USER_CONSENT,
    VPN_PERMISSION,
    BIOMETRIC_ENROLLMENT,
    DEVICE_OWNER,
    PROFILE_OWNER,
    SYSTEM_PRIVILEGE,
    ROOT,
    HARDWARE_BACKED
}

enum class ImplementationLayer {
    APPLICATION,
    ANDROID_FRAMEWORK,
    ANDROID_ENTERPRISE,
    HARDWARE_SECURITY,
    VPN_SERVICE,
    OPERATING_SYSTEM,
    DEMO
}

enum class CapabilityType {
    SYSTEM,
    HARDWARE,
    APP_PERMISSION,
    NONE;
}
