package org.securedroid.capability

import android.content.Context
import org.securedroid.capability.providers.AndroidCapabilityProvider
import org.securedroid.capability.providers.ICapabilityProvider
import org.securedroid.capability.providers.ManagedDeviceProvider
import org.securedroid.capability.providers.NormalModeProvider

class CapabilityEngine(
    private val context: Context
) {

    private val androidProvider: ICapabilityProvider =
        AndroidCapabilityProvider(context)

    private val normalModeProvider: ICapabilityProvider =
        NormalModeProvider(context)

    private val managedDeviceProvider: ICapabilityProvider =
        ManagedDeviceProvider(context)

    fun detect(): CapabilitySnapshot {

        val mode = detectMode()

        val capabilities = mutableListOf<Capability>()

        capabilities += safelyEvaluate(androidProvider)

        if (mode == SecureDroidMode.NORMAL) {
            capabilities += safelyEvaluate(normalModeProvider)
        }

        if (
            mode == SecureDroidMode.DEVICE_OWNER ||
            mode == SecureDroidMode.MANAGED_PROFILE
        ) {
            capabilities += safelyEvaluate(managedDeviceProvider)
        }

        val deduplicated = deduplicateCapabilities(capabilities)

        return CapabilitySnapshot(
            mode = mode,
            androidVersion = android.os.Build.VERSION.SDK_INT,
            androidRelease = android.os.Build.VERSION.RELEASE ?: "unknown",
            capabilities = deduplicated
        )
    }

    fun detectMode(): SecureDroidMode {

        val managedMode = try {
            managedDeviceProvider
                .getModeSafely()
        } catch (_: Exception) {
            SecureDroidMode.UNKNOWN
        }

        return when (managedMode) {

            SecureDroidMode.DEVICE_OWNER ->
                SecureDroidMode.DEVICE_OWNER

            SecureDroidMode.MANAGED_PROFILE ->
                SecureDroidMode.MANAGED_PROFILE

            SecureDroidMode.NORMAL ->
                SecureDroidMode.NORMAL

            SecureDroidMode.UNKNOWN -> {
                SecureDroidMode.NORMAL
            }
        }
    }

    private fun safelyEvaluate(
        provider: ICapabilityProvider
    ): List<Capability> {

        return try {
            provider.getCapabilities()
        } catch (_: SecurityException) {
            listOf(
                createProviderErrorCapability(
                    provider,
                    "Android denied access while evaluating this provider."
                )
            )
        } catch (e: Exception) {
            listOf(
                createProviderErrorCapability(
                    provider,
                    "${e.javaClass.simpleName}: ${e.message ?: "unknown error"}"
                )
            )
        }
    }

    private fun deduplicateCapabilities(
        capabilities: List<Capability>
    ): List<Capability> {

        val result = LinkedHashMap<String, Capability>()

        for (capability in capabilities) {

            val existing = result[capability.id]

            if (existing == null) {
                result[capability.id] = capability
            } else {
                result[capability.id] =
                    selectMoreAuthoritative(existing, capability)
            }
        }

        return result.values.toList()
    }

    private fun selectMoreAuthoritative(
        first: Capability,
        second: Capability
    ): Capability {

        if (first.isReal != second.isReal) {
            return if (first.isReal) first else second
        }

        val firstRank = stateRank(first.state)
        val secondRank = stateRank(second.state)

        if (secondRank > firstRank) {
            return second
        }

        return first
    }

    private fun stateRank(
        state: CapabilityState
    ): Int {
        return when (state) {

            CapabilityState.SUPPORTED ->
                6

            CapabilityState.LIMITED ->
                5

            CapabilityState.REQUIRES_DEVICE_OWNER ->
                4

            CapabilityState.REQUIRES_HARDWARE ->
                4

            CapabilityState.REQUIRES_OS_INTEGRATION ->
                4

            CapabilityState.REQUIRES_SYSTEM_PRIVILEGE ->
                4

            CapabilityState.UNKNOWN ->
                3

            CapabilityState.UNAVAILABLE ->
                2

            CapabilityState.ERROR ->
                1

            CapabilityState.DEMO_ONLY ->
                0
        }
    }

    private fun createProviderErrorCapability(
        provider: ICapabilityProvider,
        reason: String
    ): Capability {

        return Capability(
            id = "provider.error.${provider.id}",
            name = "${provider.name} Evaluation",
            category = CapabilityCategory.SYSTEM_SECURITY,
            state = CapabilityState.ERROR,
            evidence = reason,
            securityMeaning =
                "SecureDroid could not reliably evaluate this provider.",
            limitations =
                "Capabilities supplied by this provider may not be available in the current snapshot.",
            remediation =
                "Retry the capability scan. If the error persists, inspect Android permissions and provider logs.",
            provider = when (provider.id) {
                "android" ->
                    CapabilityProvider.ANDROID

                "normal_mode" ->
                    CapabilityProvider.SECUREDROID_NORMAL_MODE

                "managed_device" ->
                    CapabilityProvider.SECUREDROID_MANAGED_MODE

                else ->
                    CapabilityProvider.ANDROID
            },
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.NORMAL_APP,
            implementationLayer = ImplementationLayer.PLATFORM
        )
    }
}

private fun ICapabilityProvider.getModeSafely(): SecureDroidMode {

    return when (this) {

        is ManagedDeviceProvider ->
            getMode()

        else ->
            SecureDroidMode.UNKNOWN
    }
}
