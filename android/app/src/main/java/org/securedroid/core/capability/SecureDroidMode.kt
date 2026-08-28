package org.securedroid.core.capability

/**

* Security operating mode detected for the current SecureDroid installation.

* 

* SecureDroid is ONE Android application with capability-based behavior.

* These modes do NOT represent different Android operating systems.
  */
  enum class SecureDroidMode {
  
  /**
  
  * SecureDroid is running as a normal Android application.
  * 
  * No Device Owner or Profile Owner privileges are available.
    */
    NORMAL,
  
  /**
  
  * SecureDroid is operating inside an Android managed profile.
  * 
  * Profile Owner capabilities may be available depending on the
  * provisioning configuration and Android version.
    */
    MANAGED_PROFILE,
  
  /**
  
  * SecureDroid is provisioned as Device Owner.
  * 
  * This is the strongest supported SecureDroid management mode.
    */
    DEVICE_OWNER,
  
  /**
  
  * The application could not reliably determine its management mode.
  * 
  * UNKNOWN must never be treated as NORMAL or DEVICE_OWNER implicitly.
    */
    UNKNOWN
    }

/**

* Utility functions for SecureDroidMode.
  */
  object SecureDroidModeEvaluator {
  
  /**
  
  * Returns true when the application is operating as Device Owner.
    */
    fun isDeviceOwner(mode: SecureDroidMode): Boolean {
    return mode == SecureDroidMode.DEVICE_OWNER
    }
  
  /**
  
  * Returns true when the application is inside a managed profile.
    */
    fun isManagedProfile(mode: SecureDroidMode): Boolean {
    return mode == SecureDroidMode.MANAGED_PROFILE
    }
  
  /**
  
  * Returns true for either enterprise-managed configuration.
    */
    fun isManaged(mode: SecureDroidMode): Boolean {
    return when (mode) {
    SecureDroidMode.MANAGED_PROFILE,
    SecureDroidMode.DEVICE_OWNER -> true
    
     SecureDroidMode.NORMAL,
 SecureDroidMode.UNKNOWN -> false
    
    }
    }
  
  /**
  
  * Returns true only for a confirmed ordinary application mode.
    */
    fun isNormal(mode: SecureDroidMode): Boolean {
    return mode == SecureDroidMode.NORMAL
    }
  
  /**
  
  * Returns true when the mode cannot be trusted as determined.
    */
    fun isUnknown(mode: SecureDroidMode): Boolean {
    return mode == SecureDroidMode.UNKNOWN
    }
  
  /**
  
  * Returns the user-facing mode label.
    */
    fun displayName(mode: SecureDroidMode): String {
    return when (mode) {
    SecureDroidMode.NORMAL ->
    "NORMAL MODE"
    
     SecureDroidMode.MANAGED_PROFILE ->
     "MANAGED PROFILE"

 SecureDroidMode.DEVICE_OWNER ->
     "MANAGED MODE"

 SecureDroidMode.UNKNOWN ->
     "UNKNOWN MODE"
    
    }
    }
  
  /**
  
  * Returns a factual explanation of the detected mode.
    */
    fun description(mode: SecureDroidMode): String {
    return when (mode) {
    SecureDroidMode.NORMAL ->
    "SecureDroid is running as a normal Android application without Device Owner privileges."
    
     SecureDroidMode.MANAGED_PROFILE ->
     "SecureDroid is operating inside an Android managed profile."

 SecureDroidMode.DEVICE_OWNER ->
     "SecureDroid is provisioned as the Android Device Owner and can use supported enterprise management APIs."

 SecureDroidMode.UNKNOWN ->
     "SecureDroid could not reliably determine the current Android management mode."
    
    }
    }
    }
