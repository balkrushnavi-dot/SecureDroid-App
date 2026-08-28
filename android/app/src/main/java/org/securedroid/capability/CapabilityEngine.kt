package org.securedroid.capability

import android.content.Context

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

data class SecurityCapability(
    val id: String,
    val name: String,
    val category: String,
    val state: CapabilityState,
    val evidence: String,
    val securityMeaning: String,
    val limitations: String?,
    val remediation: String?,
    val provider: String,
    val isReal: Boolean,
    val canAppChange: Boolean,
    val requiredPrivilege: String?,
    val implementationLayer: String
)

data class CapabilitySnapshot(
    val mode: SecureDroidMode,
    val capabilities: List<SecurityCapability>
)

interface CapabilityProvider {
    fun getCapabilities(): List<SecurityCapability>
    fun getMode(): SecureDroidMode
}

class CapabilityEngine(
    private val context: Context
) {

    private val providers: List<CapabilityProvider> by lazy {
        listOf(
            AndroidCapabilityProvider(context),
            NormalModeProvider(context),
            ManagedDeviceProvider(context)
        )
    }

    fun detectMode(): SecureDroidMode {
        return providers
            .mapNotNull {
                try {
                    it.getMode()
                } catch (_: Exception) {
                    null
                }
            }
            .firstOrNull {
                it != SecureDroidMode.UNKNOWN
            }
            ?: SecureDroidMode.UNKNOWN
    }

    fun getCapabilities(): List<SecurityCapability> {
        return providers.flatMap { provider ->
            try {
                provider.getCapabilities()
            } catch (e: Exception) {
                listOf(
                    SecurityCapability(
                        id = "PROVIDER_ERROR",
                        name = "Capability Provider Error",
                        category = "SYSTEM",
                        state = CapabilityState.ERROR,
                        evidence = "${provider.javaClass.simpleName}: ${e.message}",
                        securityMeaning = "The capability could not be evaluated.",
                        limitations = "This result must not be interpreted as supported.",
                        remediation = "Retry the security scan.",
                        provider = provider.javaClass.simpleName,
                        isReal = false,
                        canAppChange = false,
                        requiredPrivilege = null,
                        implementationLayer = "APPLICATION"
                    )
                )
            }
        }
    }

    fun getSnapshot(): CapabilitySnapshot {
        return CapabilitySnapshot(
            mode = detectMode(),
            capabilities = getCapabilities()
        )
    }

    fun getCapability(id: String): SecurityCapability? {
        return getCapabilities().firstOrNull {
            it.id == id
        }
    }

    fun isSupported(id: String): Boolean {
        return getCapability(id)?.state == CapabilityState.SUPPORTED
    }

    fun isReal(id: String): Boolean {
        return getCapability(id)?.isReal == true
    }

    fun getModeDescription(): String {
        return when (detectMode()) {
            SecureDroidMode.NORMAL ->
                "Normal Mode — application-level security without device-owner privileges."

            SecureDroidMode.MANAGED_PROFILE ->
                "Managed Profile Mode — Android Enterprise managed-profile capabilities are available."

            SecureDroidMode.DEVICE_OWNER ->
                "Managed Mode — this application has Device Owner privileges."

            SecureDroidMode.UNKNOWN ->
                "Security mode could not be determined."
        }
    }
}
