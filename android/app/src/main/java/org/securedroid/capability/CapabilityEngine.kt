package org.securedroid.capability

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.securedroid.capability.providers.AndroidCapabilityProvider
import org.securedroid.capability.providers.DeviceOwnerProvider
import org.securedroid.capability.providers.ManagedDeviceProvider
import org.securedroid.capability.providers.NormalModeProvider

/**

* Central capability evaluation engine for SecureDroid.

* 

* The engine answers:

* - What can the current APK/device actually do?

* - What security capabilities are available?

* - What capabilities require Device Owner?

* - What capabilities are unavailable?

* 

* IMPORTANT:

* This class never upgrades a capability to SUPPORTED merely because

* the UI wants to expose a feature.
  */
  class CapabilityEngine(
  private val context: Context
  ) {
  
  private val providers = listOf(
  AndroidCapabilityProvider(context),
  NormalModeProvider(context),
  ManagedDeviceProvider(context),
  DeviceOwnerProvider(context)
  )
  
  suspend fun evaluate(): CapabilitySnapshot = withContext(Dispatchers.Default) {
  val capabilities = providers
  .flatMap { provider ->
  try {
  provider.getCapabilities()
  } catch (e: Exception) {
  listOf(
  Capability(
  id = "provider.${provider.id}.error",
  name = "${provider.name} provider error",
  category = CapabilityCategory.SYSTEM,
  state = CapabilityState.ERROR,
  evidence = e.message ?: e.javaClass.simpleName,
  securityMeaning = "Capability provider failed to evaluate.",
  limitations = "The capability cannot be verified reliably.",
  remediation = "Retry the security capability scan.",
  provider = provider.id,
  isReal = false,
  canAppChange = false,
  requiredPrivilege = RequiredPrivilege.NONE,
  implementationLayer = ImplementationLayer.APP
  )
  )
  }
  }
  .distinctBy { it.id }
  
   CapabilitySnapshot(
     mode = detectMode(capabilities),
     capabilities = capabilities,
     generatedAt = System.currentTimeMillis()
 )
  
  }
  
  fun evaluateBlocking(): CapabilitySnapshot {
  val capabilities = providers
  .flatMap { provider ->
  try {
  provider.getCapabilities()
  } catch (e: Exception) {
  listOf(
  Capability(
  id = "provider.${provider.id}.error",
  name = "${provider.name} provider error",
  category = CapabilityCategory.SYSTEM,
  state = CapabilityState.ERROR,
  evidence = e.message ?: e.javaClass.simpleName,
  securityMeaning = "Capability provider failed to evaluate.",
  limitations = "The capability cannot be verified reliably.",
  remediation = "Retry the security capability scan.",
  provider = provider.id,
  isReal = false,
  canAppChange = false,
  requiredPrivilege = RequiredPrivilege.NONE,
  implementationLayer = ImplementationLayer.APP
  )
  )
  }
  }
  .distinctBy { it.id }
  
   return CapabilitySnapshot(
     mode = detectMode(capabilities),
     capabilities = capabilities,
     generatedAt = System.currentTimeMillis()
 )
  
  }
  
  fun getCapability(
  snapshot: CapabilitySnapshot,
  capabilityId: String
  ): Capability? {
  return snapshot.capabilities.firstOrNull {
  it.id == capabilityId
  }
  }
  
  fun isSupported(
  snapshot: CapabilitySnapshot,
  capabilityId: String
  ): Boolean {
  return getCapability(snapshot, capabilityId)?.state ==
  CapabilityState.SUPPORTED
  }
  
  fun requiresDeviceOwner(
  snapshot: CapabilitySnapshot,
  capabilityId: String
  ): Boolean {
  return getCapability(snapshot, capabilityId)?.state ==
  CapabilityState.REQUIRES_DEVICE_OWNER
  }
  
  private fun detectMode(
  capabilities: List<Capability>
  ): SecureDroidMode {
  
   val deviceOwner = capabilities.firstOrNull {
     it.id == CapabilityIds.DEVICE_OWNER
 }

 val profileOwner = capabilities.firstOrNull {
     it.id == CapabilityIds.PROFILE_OWNER
 }

 return when {
     deviceOwner?.state == CapabilityState.SUPPORTED ->
         SecureDroidMode.DEVICE_OWNER

     profileOwner?.state == CapabilityState.SUPPORTED ->
         SecureDroidMode.MANAGED_PROFILE

     capabilities.isNotEmpty() ->
         SecureDroidMode.NORMAL

     else ->
         SecureDroidMode.UNKNOWN
 }
  
  }
  }

/**

* Complete capability evaluation result.
  */
  data class CapabilitySnapshot(
  val mode: SecureDroidMode,
  val capabilities: List<Capability>,
  val generatedAt: Long
  )

/**

* Capability definition.
  */
  data class Capability(
  val id: String,
  val name: String,
  val category: CapabilityCategory,
  val state: CapabilityState,
  val evidence: String?,
  val securityMeaning: String,
  val limitations: String?,
  val remediation: String?,
  val provider: String,
  val isReal: Boolean,
  val canAppChange: Boolean,
  val requiredPrivilege: RequiredPrivilege,
  val implementationLayer: ImplementationLayer
  )

enum class SecureDroidMode {
NORMAL,
MANAGED_PROFILE,
DEVICE_OWNER,
UNKNOWN
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

enum class CapabilityCategory {
SYSTEM,
DEVICE_MANAGEMENT,
NETWORK,
STORAGE,
AUTHENTICATION,
APPLICATION,
PRIVACY,
HARDWARE,
MONITORING
}

enum class RequiredPrivilege {
NONE,
APP_PERMISSION,
VPN_PERMISSION,
DEVICE_OWNER,
PROFILE_OWNER,
SYSTEM_PRIVILEGE,
ROOT
}

enum class ImplementationLayer {
APP,
ANDROID_API,
VpnService,
DEVICE_POLICY_MANAGER,
HARDWARE,
SYSTEM
}

/**

* Stable identifiers used throughout the application.

* 

* Keep these IDs unchanged once they are consumed by the UI,

* audit log, database, or analytics layer.
  */
  object CapabilityIds {
  
  const val DEVICE_OWNER =
  "device.management.device_owner"
  
  const val PROFILE_OWNER =
  "device.management.profile_owner"
  
  const val MANAGED_PROFILE =
  "device.management.managed_profile"
  
  const val VPN =
  "network.vpn_service"
  
  const val KEYSTORE =
  "storage.android_keystore"
  
  const val STRONGBOX =
  "hardware.strongbox"
  
  const val BIOMETRIC =
  "authentication.biometric"
  
  const val SECURE_LOCK_SCREEN =
  "authentication.secure_lock_screen"
  
  const val APP_INVENTORY =
  "application.installed_app_inventory"
  
  const val APP_RISK_ANALYSIS =
  "application.risk_analysis"
  
  const val SECURE_STORAGE =
  "storage.encrypted_app_storage"
  
  const val SECURITY_AUDIT =
  "monitoring.security_audit"
  
  const val DEVICE_POLICY =
  "device.management.device_policy"
  
  const val APPLICATION_RESTRICTIONS =
  "device.management.application_restrictions"
  
  const val KIOSK =
  "device.management.kiosk"
  
  const val NETWORK_RESTRICTIONS =
  "device.management.network_restrictions"
  }
