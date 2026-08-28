package org.securedroid.core.capability

/**

* Describes the current security capability available to SecureDroid.

* 

* IMPORTANT:

* A capability must never be reported as supported unless there is

* real Android/API evidence for it.
  */
  data class Capability(
  
  /**
  
  * Stable machine-readable identifier.
  * 
  * Example:
  * "vpn.firewall"
  * "device.owner"
  * "keystore.hardware_backed"
    */
    val id: String,
  
  /**
  
  * Human-readable capability name.
    */
    val name: String,
  
  /**
  
  * Capability classification.
    */
    val category: CapabilityCategory,
  
  /**
  
  * Current availability state.
    */
    val state: CapabilityState,
  
  /**
  
  * Evidence explaining why the capability has this state.
  * 
  * This should contain factual Android/API information rather than
  * assumptions.
    */
    val evidence: String,
  
  /**
  
  * What this capability actually means from a security perspective.
    */
    val securityMeaning: String,
  
  /**
  
  * Known limitations of the capability.
    */
    val limitations: List<String> = emptyList(),
  
  /**
  
  * What the user/admin can do to improve availability.
  * 
  * Empty when no remediation is possible.
    */
    val remediation: String? = null,
  
  /**
  
  * Provider that produced this capability result.
  * 
  * Example:
  * "AndroidCapabilityProvider"
  * "DeviceOwnerProvider"
    */
    val provider: String,
  
  /**
  
  * True only when the capability is backed by real device/API evidence.
  * 
  * DEMO_ONLY capabilities must always return false.
    */
    val isReal: Boolean,
  
  /**
  
  * Whether SecureDroid can change the capability itself.
  * 
  * Example:
  * VPN permission -> potentially true
  * Device Owner provisioning -> false from a normal app
    */
    val canAppChange: Boolean,
  
  /**
  
  * Privilege required to obtain/use the capability.
    */
    val requiredPrivilege: RequiredPrivilege,
  
  /**
  
  * Layer where the capability is implemented.
    */
    val implementationLayer: ImplementationLayer
    )

/**

* Broad grouping used by the security dashboard and diagnostics.
  */
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

/**

* Availability state of a SecureDroid capability.
  */
  enum class CapabilityState {
  
  /**
  
  * Capability is available and verified through Android APIs.
    */
    SUPPORTED,
  
  /**
  
  * Capability exists but has meaningful restrictions.
    */
    LIMITED,
  
  /**
  
  * Capability cannot currently be used on this device/configuration.
    */
    UNAVAILABLE,
  
  /**
  
  * Android does not provide enough reliable evidence to determine
  * the capability state.
    */
    UNKNOWN,
  
  /**
  
  * Capability requires Device Owner / managed-device privileges.
    */
    REQUIRES_DEVICE_OWNER,
  
  /**
  
  * Capability requires privileges unavailable to a normal Android app.
    */
    REQUIRES_SYSTEM_PRIVILEGE,
  
  /**
  
  * Capability depends on hardware that may not exist.
    */
    REQUIRES_HARDWARE,
  
  /**
  
  * Capability requires deeper operating-system integration that
  * an ordinary APK cannot provide.
    */
    REQUIRES_OS_INTEGRATION,
  
  /**
  
  * Capability is intentionally simulated for development/testing.
  * 
  * This state must never be presented to the user as real security.
    */
    DEMO_ONLY,
  
  /**
  
  * Capability detection failed because of an unexpected error.
    */
    ERROR
    }

/**

* Minimum privilege required by a capability.
  */
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

/**

* Implementation boundary of the capability.
  */
  enum class ImplementationLayer {
  
  /**
  
  * Functionality implemented entirely inside SecureDroid.
    */
    APPLICATION,
  
  /**
  
  * Android framework API exposed to normal applications.
    */
    ANDROID_FRAMEWORK,
  
  /**
  
  * Android Enterprise / DevicePolicyManager layer.
    */
    ANDROID_ENTERPRISE,
  
  /**
  
  * Android Keystore / KeyMint / hardware-backed security.
    */
    HARDWARE_SECURITY,
  
  /**
  
  * Android VpnService application-level network layer.
    */
    VPN_SERVICE,
  
  /**
  
  * Requires operating-system/vendor integration.
    */
    OPERATING_SYSTEM,
  
  /**
  
  * Development/testing implementation only.
    */
    DEMO
    )
