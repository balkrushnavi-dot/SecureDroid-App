package org.securedroid.core.capability

/**

* Utility helpers for CapabilityState.

* 

* Keeps state interpretation consistent across the capability engine,

* providers, UI, diagnostics, and security scoring.
  */
  object CapabilityStateEvaluator {
  
  /**
  
  * Returns true only when the capability is genuinely available.
  * 
  * LIMITED is deliberately excluded because the capability may have
  * restrictions that prevent treating it as fully supported.
    */
    fun isSupported(state: CapabilityState): Boolean {
    return state == CapabilityState.SUPPORTED
    }
  
  /**
  
  * Returns true when the capability can be used, but with limitations.
    */
    fun isLimited(state: CapabilityState): Boolean {
    return state == CapabilityState.LIMITED
    }
  
  /**
  
  * Returns true when the capability cannot currently be used.
    */
    fun isUnavailable(state: CapabilityState): Boolean {
    return state == CapabilityState.UNAVAILABLE
    }
  
  /**
  
  * Returns true when SecureDroid cannot reliably determine the state.
  * 
  * UNKNOWN must never be converted into SUPPORTED.
    */
    fun isUnknown(state: CapabilityState): Boolean {
    return state == CapabilityState.UNKNOWN
    }
  
  /**
  
  * Returns true when Device Owner provisioning is required.
    */
    fun requiresDeviceOwner(state: CapabilityState): Boolean {
    return state == CapabilityState.REQUIRES_DEVICE_OWNER
    }
  
  /**
  
  * Returns true when the capability requires privileges unavailable
  * to an ordinary Android application.
    */
    fun requiresSystemPrivilege(state: CapabilityState): Boolean {
    return state == CapabilityState.REQUIRES_SYSTEM_PRIVILEGE
    }
  
  /**
  
  * Returns true when required hardware is unavailable.
    */
    fun requiresHardware(state: CapabilityState): Boolean {
    return state == CapabilityState.REQUIRES_HARDWARE
    }
  
  /**
  
  * Returns true when deeper Android/OS integration is required.
    */
    fun requiresOsIntegration(state: CapabilityState): Boolean {
    return state == CapabilityState.REQUIRES_OS_INTEGRATION
    }
  
  /**
  
  * Returns true when this is explicitly a development/demo capability.
  * 
  * DEMO_ONLY must never be counted as real security.
    */
    fun isDemoOnly(state: CapabilityState): Boolean {
    return state == CapabilityState.DEMO_ONLY
    }
  
  /**
  
  * Returns true when capability detection itself failed.
    */
    fun isError(state: CapabilityState): Boolean {
    return state == CapabilityState.ERROR
    }
  
  /**
  
  * Determines whether the state represents real, verified capability.
    */
    fun isRealCapability(state: CapabilityState): Boolean {
    return when (state) {
    CapabilityState.SUPPORTED,
    CapabilityState.LIMITED -> true
    
     CapabilityState.UNAVAILABLE,
 CapabilityState.UNKNOWN,
 CapabilityState.REQUIRES_DEVICE_OWNER,
 CapabilityState.REQUIRES_SYSTEM_PRIVILEGE,
 CapabilityState.REQUIRES_HARDWARE,
 CapabilityState.REQUIRES_OS_INTEGRATION,
 CapabilityState.DEMO_ONLY,
 CapabilityState.ERROR -> false
    
    }
    }
  
  /**
  
  * Converts a capability state into a stable UI status.
  
  * 
  
  * This prevents individual screens from inventing their own
  
  * interpretation of capability states.
    */
    fun toDisplayStatus(state: CapabilityState): String {
    return when (state) {
    CapabilityState.SUPPORTED ->
    "SUPPORTED"
    
     CapabilityState.LIMITED ->
     "LIMITED"

 CapabilityState.UNAVAILABLE ->
     "UNAVAILABLE"

 CapabilityState.UNKNOWN ->
     "UNKNOWN"

 CapabilityState.REQUIRES_DEVICE_OWNER ->
     "REQUIRES_DEVICE_OWNER"

 CapabilityState.REQUIRES_SYSTEM_PRIVILEGE ->
     "REQUIRES_SYSTEM_PRIVILEGE"

 CapabilityState.REQUIRES_HARDWARE ->
     "REQUIRES_HARDWARE"

 CapabilityState.REQUIRES_OS_INTEGRATION ->
     "REQUIRES_OS_INTEGRATION"

 CapabilityState.DEMO_ONLY ->
     "DEMO_ONLY"

 CapabilityState.ERROR ->
     "ERROR"
    
    }
    }
  
  /**
  
  * Returns a short explanation suitable for UI.
    */
    fun getExplanation(state: CapabilityState): String {
    return when (state) {
    CapabilityState.SUPPORTED ->
    "Capability is available and verified."
    
     CapabilityState.LIMITED ->
     "Capability is available with limitations."

 CapabilityState.UNAVAILABLE ->
     "Capability is not currently available."

 CapabilityState.UNKNOWN ->
     "Capability could not be verified."

 CapabilityState.REQUIRES_DEVICE_OWNER ->
     "Device Owner provisioning is required."

 CapabilityState.REQUIRES_SYSTEM_PRIVILEGE ->
     "This capability requires privileges unavailable to a normal app."

 CapabilityState.REQUIRES_HARDWARE ->
     "Required hardware capability is unavailable."

 CapabilityState.REQUIRES_OS_INTEGRATION ->
     "This capability requires operating-system integration."

 CapabilityState.DEMO_ONLY ->
     "Development/demo capability only. Not real security."

 CapabilityState.ERROR ->
     "Capability detection failed."
    
    }
    }
    }
