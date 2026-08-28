package org.securedroid.capability

/**
 * Security-management mode detected for the current SecureDroid installation.
 */
enum class SecureDroidMode {
    NORMAL,
    MANAGED_PROFILE,
    DEVICE_OWNER,
    UNKNOWN
}

/**
 * Actual state of a capability.
 */
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

enum class CapabilityCategory {
    NETWORK,
    AUTHENTICATION,
    CRYPTOGRAPHY,
    HARDWARE_SECURITY,
    DEVICE_MANAGEMENT,
    APPLICATION_MANAGEMENT,
    PRIVACY,
    STORAGE,
    MONITORING,
    SYSTEM_SECURITY
}

enum class CapabilityProvider {
    ANDROID,
    ANDROID_KEYSTORE,
    DEVICE_POLICY_MANAGER,
    VPN_SERVICE,
    SECUREDROID_NORMAL_MODE,
    SECUREDROID_MANAGED_MODE
}

enum class RequiredPrivilege {
    NORMAL_APP,
    USER_APPROVAL,
    USER_ACTION,
    PROFILE_OWNER,
    DEVICE_OWNER,
    HARDWARE,
    SYSTEM_PRIVILEGE
}

enum class ImplementationLayer {
    APPLICATION,
    PLATFORM,
    HARDWARE,
    ANDROID_ENTERPRISE,
    VPN
}

/**
 * Stable identifiers for capabilities.
 */
object CapabilityIds {

    const val VPN_SERVICE = "vpn_service"

    const val BIOMETRIC = "biometric_authentication"

    const val ANDROID_KEYSTORE = "android_keystore"

    const val STRONGBOX = "strongbox"

    const val SECURE_LOCK_SCREEN = "secure_lock_screen"

    const val DEVICE_OWNER = "device_owner"

    const val PROFILE_OWNER = "profile_owner"

    const val MANAGED_PROFILE = "managed_profile"

    const val PACKAGE_MANAGEMENT = "package_management"

    const val DEVICE_POLICY = "device_policy"

    const val HARDWARE_BACKED_KEYSTORE = "hardware_backed_keystore"
}

/**
 * One objectively detected SecureDroid capability.
 */
data class Capability(
    val id: String,
    val name: String,
    val category: CapabilityCategory,
    val state: CapabilityState,

    /**
     * Concrete evidence returned by Android or SecureDroid's native layer.
     */
    val evidence: String,

    /**
     * What this capability actually means from a security perspective.
     */
    val securityMeaning: String,

    /**
     * Explicit limitation so UI cannot overstate the capability.
     */
    val limitations: String,

    /**
     * Action that may make the capability available.
     */
    val remediation: String?,

    val provider: CapabilityProvider,

    /**
     * True only when the capability was actually detected.
     *
     * DEMO_ONLY must never be represented as a real capability.
     */
    val isReal: Boolean,

    /**
     * Whether the application itself can change the state.
     */
    val canAppChange: Boolean,

    val requiredPrivilege: RequiredPrivilege,

    val implementationLayer: ImplementationLayer
)

/**
 * Complete capability snapshot generated during a scan.
 */
data class CapabilitySnapshot(
    val mode: SecureDroidMode,
    val androidVersion: Int,
    val androidRelease: String,
    val capabilities: List<Capability>
) {

    fun getCapability(id: String): Capability? {
        return capabilities.firstOrNull { it.id == id }
    }

    fun isSupported(id: String): Boolean {
        return getCapability(id)?.state == CapabilityState.SUPPORTED
    }

    fun isAvailable(id: String): Boolean {
        return when (getCapability(id)?.state) {
            CapabilityState.SUPPORTED,
            CapabilityState.LIMITED -> true

            else -> false
        }
    }

    fun supportedCapabilities(): List<Capability> {
        return capabilities.filter {
            it.state == CapabilityState.SUPPORTED &&
                it.isReal
        }
    }

    fun limitedCapabilities(): List<Capability> {
        return capabilities.filter {
            it.state == CapabilityState.LIMITED &&
                it.isReal
        }
    }

    fun unavailableCapabilities(): List<Capability> {
        return capabilities.filter {
            it.state == CapabilityState.UNAVAILABLE &&
                it.isReal
        }
    }

    fun unknownCapabilities(): List<Capability> {
        return capabilities.filter {
            it.state == CapabilityState.UNKNOWN
        }
    }

    /**
     * Returns true only when Android actually reports Device Owner.
     */
    fun isDeviceOwner(): Boolean {
        return mode == SecureDroidMode.DEVICE_OWNER &&
            isSupported(CapabilityIds.DEVICE_OWNER)
    }

    /**
     * Returns true for either managed-profile or device-owner operation.
     */
    fun isManaged(): Boolean {
        return mode == SecureDroidMode.DEVICE_OWNER ||
            mode == SecureDroidMode.MANAGED_PROFILE
    }
}
