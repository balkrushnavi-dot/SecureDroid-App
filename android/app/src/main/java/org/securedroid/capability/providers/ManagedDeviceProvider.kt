package org.securedroid.capability.providers

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.os.Build
import org.securedroid.capability.Capability
import org.securedroid.capability.CapabilityCategory
import org.securedroid.capability.CapabilityIds
import org.securedroid.capability.CapabilityState
import org.securedroid.capability.ImplementationLayer
import org.securedroid.capability.RequiredPrivilege
import org.securedroid.admin.SecureDroidDeviceAdmin

/**

* Evaluates Android Enterprise/device-management capabilities.

* 

* This provider is deliberately conservative:

* 

* - Device Owner is reported only when Android confirms it.

* - Profile Owner is reported only when Android confirms it.

* - Management APIs are not treated as available merely because

* DevicePolicyManager exists.

* - No root/system privileges are claimed.
    */
    class ManagedDeviceProvider(
    private val context: Context
    ) : CapabilityProvider {
  
  override val id: String = "managed_device"
  override val name: String = "Managed Device Provider"
  
  private val devicePolicyManager =
  context.getSystemService(Context.DEVICE_POLICY_SERVICE)
  as? DevicePolicyManager
  
  private val adminComponent: ComponentName by lazy {
  ComponentName(
  context,
  SecureDroidDeviceAdmin::class.java
  )
  }
  
  override fun getCapabilities(): List<Capability> {
  return listOf(
  evaluateDeviceOwner(),
  evaluateProfileOwner(),
  evaluateManagedProfile(),
  evaluateDevicePolicyApi(),
  evaluateApplicationRestrictions(),
  evaluateNetworkRestrictions(),
  evaluateKiosk()
  )
  }
  
  private fun evaluateDeviceOwner(): Capability {
  val dpm = devicePolicyManager
  
   if (dpm == null) {
     return capability(
         id = CapabilityIds.DEVICE_OWNER,
         name = "Device Owner",
         state = CapabilityState.UNAVAILABLE,
         evidence = "DevicePolicyManager is unavailable.",
         meaning = "SecureDroid cannot use Android Device Owner management APIs.",
         limitations = "Required Android device-management service is unavailable."
     )
 }

 val isOwner = try {
     dpm.isDeviceOwnerApp(context.packageName)
 } catch (_: SecurityException) {
     false
 } catch (_: Exception) {
     false
 }

 return if (isOwner) {
     capability(
         id = CapabilityIds.DEVICE_OWNER,
         name = "Device Owner",
         state = CapabilityState.SUPPORTED,
         evidence = "DevicePolicyManager.isDeviceOwnerApp(packageName) returned true.",
         meaning = "SecureDroid is provisioned as the Device Owner and can use applicable Android Enterprise device-management APIs.",
         limitations = "Available policies remain constrained by the Android version, OEM implementation, and DevicePolicyManager API."
     )
 } else {
     capability(
         id = CapabilityIds.DEVICE_OWNER,
         name = "Device Owner",
         state = CapabilityState.UNAVAILABLE,
         evidence = "Android does not report SecureDroid as Device Owner.",
         meaning = "SecureDroid does not currently have Device Owner authority.",
         limitations = "Device-wide management policies requiring Device Owner cannot be applied by SecureDroid.",
         remediation = "Provision SecureDroid as Device Owner using a supported Android Enterprise provisioning flow."
     )
 }
  
  }
  
  private fun evaluateProfileOwner(): Capability {
  val dpm = devicePolicyManager
  
   if (dpm == null) {
     return capability(
         id = CapabilityIds.PROFILE_OWNER,
         name = "Profile Owner",
         state = CapabilityState.UNAVAILABLE,
         evidence = "DevicePolicyManager is unavailable.",
         meaning = "SecureDroid cannot evaluate profile-owner status.",
         limitations = "Required Android device-management service is unavailable."
     )
 }

 val isProfileOwner = try {
     dpm.isProfileOwnerApp(context.packageName)
 } catch (_: SecurityException) {
     false
 } catch (_: Exception) {
     false
 }

 return if (isProfileOwner) {
     capability(
         id = CapabilityIds.PROFILE_OWNER,
         name = "Profile Owner",
         state = CapabilityState.SUPPORTED,
         evidence = "DevicePolicyManager.isProfileOwnerApp(packageName) returned true.",
         meaning = "SecureDroid is the Profile Owner for the current managed profile.",
         limitations = "Profile Owner authority is scoped to the managed profile and is not equivalent to Device Owner authority."
     )
 } else {
     capability(
         id = CapabilityIds.PROFILE_OWNER,
         name = "Profile Owner",
         state = CapabilityState.UNAVAILABLE,
         evidence = "Android does not report SecureDroid as Profile Owner.",
         meaning = "SecureDroid does not currently control a managed profile.",
         limitations = "Profile-level management policies are unavailable."
     )
 }
  
  }
  
  private fun evaluateManagedProfile(): Capability {
  if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
  return capability(
  id = CapabilityIds.MANAGED_PROFILE,
  name = "Managed Profile",
  state = CapabilityState.UNAVAILABLE,
  evidence = "Managed-profile APIs require Android 7.0 / API 24 or newer.",
  meaning = "SecureDroid cannot use modern managed-profile detection on this Android version.",
  limitations = "The Android version is too old for this capability."
  )
  }
  
   val userManager = context.getSystemService(
     android.os.UserManager::class.java
 )

 if (userManager == null) {
     return capability(
         id = CapabilityIds.MANAGED_PROFILE,
         name = "Managed Profile",
         state = CapabilityState.UNKNOWN,
         evidence = "UserManager unavailable.",
         meaning = "SecureDroid cannot reliably determine managed-profile state.",
         limitations = "Android did not provide UserManager."
     )
 }

 val isManagedProfile = try {
     userManager.isManagedProfile
 } catch (_: Exception) {
     false
 }

 return if (isManagedProfile) {
     capability(
         id = CapabilityIds.MANAGED_PROFILE,
         name = "Managed Profile",
         state = CapabilityState.SUPPORTED,
         evidence = "UserManager.isManagedProfile returned true.",
         meaning = "The current SecureDroid process is running inside an Android managed-profile context.",
         limitations = "Managed-profile capabilities are scoped by Android Enterprise."
     )
 } else {
     capability(
         id = CapabilityIds.MANAGED_PROFILE,
         name = "Managed Profile",
         state = CapabilityState.UNAVAILABLE,
         evidence = "UserManager.isManagedProfile returned false.",
         meaning = "The current user is not a managed-profile context.",
         limitations = "Profile-owner capabilities are unavailable in the current context."
     )
 }
  
  }
  
  private fun evaluateDevicePolicyApi(): Capability {
  if (devicePolicyManager == null) {
  return capability(
  id = CapabilityIds.DEVICE_POLICY,
  name = "Device Policy Management",
  state = CapabilityState.UNAVAILABLE,
  evidence = "DevicePolicyManager unavailable.",
  meaning = "SecureDroid cannot access Android device-management APIs.",
  limitations = "The Android device-management service is unavailable."
  )
  }
  
   val owner =
     try {
         devicePolicyManager.isDeviceOwnerApp(context.packageName)
     } catch (_: Exception) {
         false
     }

 val profileOwner =
     try {
         devicePolicyManager.isProfileOwnerApp(context.packageName)
     } catch (_: Exception) {
         false
     }

 return when {
     owner || profileOwner ->
         capability(
             id = CapabilityIds.DEVICE_POLICY,
             name = "Device Policy Management",
             state = CapabilityState.SUPPORTED,
             evidence = "SecureDroid is confirmed as Device Owner or Profile Owner.",
             meaning = "SecureDroid can invoke applicable DevicePolicyManager APIs permitted to its management role.",
             limitations = "Individual policies may have additional Android/OEM restrictions."
         )

     else ->
         capability(
             id = CapabilityIds.DEVICE_POLICY,
             name = "Device Policy Management",
             state = CapabilityState.REQUIRES_DEVICE_OWNER,
             evidence = "DevicePolicyManager exists, but SecureDroid is not Device Owner/Profile Owner.",
             meaning = "The Android API exists but SecureDroid lacks management authority in the current mode.",
             limitations = "Ordinary applications cannot apply device-owner-only policies.",
             remediation = "Provision SecureDroid under Android Enterprise management."
         )
 }
  
  }
  
  private fun evaluateApplicationRestrictions(): Capability {
  val dpm = devicePolicyManager
  ?: return capability(
  id = CapabilityIds.APPLICATION_RESTRICTIONS,
  name = "Application Restrictions",
  state = CapabilityState.UNAVAILABLE,
  evidence = "DevicePolicyManager unavailable.",
  meaning = "SecureDroid cannot evaluate application-management capability.",
  limitations = "Required Android service is unavailable."
  )
  
   val owner = try {
     dpm.isDeviceOwnerApp(context.packageName) ||
         dpm.isProfileOwnerApp(context.packageName)
 } catch (_: Exception) {
     false
 }

 return if (owner) {
     capability(
         id = CapabilityIds.APPLICATION_RESTRICTIONS,
         name = "Application Restrictions",
         state = CapabilityState.SUPPORTED,
         evidence = "SecureDroid is confirmed as Device Owner/Profile Owner.",
         meaning = "SecureDroid can use applicable Android Enterprise application-management APIs.",
         limitations = "Exact restrictions depend on Android API level and policy support."
     )
 } else {
     capability(
         id = CapabilityIds.APPLICATION_RESTRICTIONS,
         name = "Application Restrictions",
         state = CapabilityState.REQUIRES_DEVICE_OWNER,
         evidence = "SecureDroid lacks Device Owner/Profile Owner authority.",
         meaning = "Application-management restrictions require management authority.",
         limitations = "Normal application mode cannot enforce device-wide application policies.",
         remediation = "Provision SecureDroid as Device Owner or Profile Owner where supported."
     )
 }
  
  }
  
  private fun evaluateNetworkRestrictions(): Capability {
  val dpm = devicePolicyManager
  ?: return capability(
  id = CapabilityIds.NETWORK_RESTRICTIONS,
  name = "Managed Network Restrictions",
  state = CapabilityState.UNAVAILABLE,
  evidence = "DevicePolicyManager unavailable.",
  meaning = "SecureDroid cannot evaluate managed network policy support.",
  limitations = "Required Android service is unavailable."
  )
  
   val owner = try {
     dpm.isDeviceOwnerApp(context.packageName) ||
         dpm.isProfileOwnerApp(context.packageName)
 } catch (_: Exception) {
     false
 }

 return if (owner) {
     capability(
         id = CapabilityIds.NETWORK_RESTRICTIONS,
         name = "Managed Network Restrictions",
         state = CapabilityState.SUPPORTED,
         evidence = "SecureDroid has confirmed management authority.",
         meaning = "SecureDroid may use applicable DevicePolicyManager network-management APIs.",
         limitations = "This does not replace SecureDroid's application-level VpnService firewall."
     )
 } else {
     capability(
         id = CapabilityIds.NETWORK_RESTRICTIONS,
         name = "Managed Network Restrictions",
         state = CapabilityState.REQUIRES_DEVICE_OWNER,
         evidence = "SecureDroid is not operating with management authority.",
         meaning = "Device-wide network policy enforcement is unavailable in Normal Mode.",
         limitations = "Normal Mode remains limited to capabilities exposed through ordinary Android application APIs and VpnService.",
         remediation = "Provision SecureDroid under Android Enterprise management."
     )
 }
  
  }
  
  private fun evaluateKiosk(): Capability {
  val dpm = devicePolicyManager
  ?: return capability(
  id = CapabilityIds.KIOSK,
  name = "Kiosk / Lock Task Management",
  state = CapabilityState.UNAVAILABLE,
  evidence = "DevicePolicyManager unavailable.",
  meaning = "SecureDroid cannot evaluate kiosk-management capability.",
  limitations = "Required Android service is unavailable."
  )
  
   val owner = try {
     dpm.isDeviceOwnerApp(context.packageName)
 } catch (_: Exception) {
     false
 }

 return if (owner) {
     capability(
         id = CapabilityIds.KIOSK,
         name = "Kiosk / Lock Task Management",
         state = CapabilityState.SUPPORTED,
         evidence = "SecureDroid is confirmed as Device Owner.",
         meaning = "SecureDroid can use applicable Android lock-task/kiosk management APIs.",
         limitations = "Actual kiosk behavior depends on Android version and policy configuration."
     )
 } else {
     capability(
         id = CapabilityIds.KIOSK,
         name = "Kiosk / Lock Task Management",
         state = CapabilityState.REQUIRES_DEVICE_OWNER,
         evidence = "SecureDroid is not confirmed as Device Owner.",
         meaning = "Full kiosk management requires Device Owner authority.",
         limitations = "Normal Mode cannot enforce device-wide kiosk policy.",
         remediation = "Provision SecureDroid as Device Owner."
     )
 }
  
  }
  
  private fun capability(
  id: String,
  name: String,
  state: CapabilityState,
  evidence: String?,
  meaning: String,
  limitations: String? = null,
  remediation: String? = null
  ): Capability {
  return Capability(
  id = id,
  name = name,
  category = CapabilityCategory.DEVICE_MANAGEMENT,
  state = state,
  evidence = evidence,
  securityMeaning = meaning,
  limitations = limitations,
  remediation = remediation,
  provider = this.id,
  isReal = true,
  canAppChange = state == CapabilityState.REQUIRES_DEVICE_OWNER,
  requiredPrivilege = when (state) {
  CapabilityState.REQUIRES_DEVICE_OWNER ->
  RequiredPrivilege.DEVICE_OWNER
  
           CapabilityState.SUPPORTED ->
             if (
                 id == CapabilityIds.DEVICE_OWNER ||
                 id == CapabilityIds.PROFILE_OWNER
             ) {
                 RequiredPrivilege.DEVICE_OWNER
             } else {
                 RequiredPrivilege.DEVICE_OWNER
             }

         else ->
             RequiredPrivilege.NONE
     },
     implementationLayer = ImplementationLayer.DEVICE_POLICY_MANAGER
 )
  
  }
  }
