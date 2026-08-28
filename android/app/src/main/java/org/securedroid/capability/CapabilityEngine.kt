package org.securedroid.capability

import android.content.Context
import org.securedroid.capability.providers.AndroidCapabilityProvider
import org.securedroid.capability.providers.CapabilityProvider
import org.securedroid.capability.providers.ManagedDeviceProvider
import org.securedroid.capability.providers.NormalModeProvider

/**
 * Central capability orchestration engine for SecureDroid.
 *
 * Responsibilities:
 * - Detect SecureDroid operating mode.
 * - Execute the appropriate real capability providers.
 * - Merge provider results.
 * - Remove duplicate capability IDs.
 * - Produce one authoritative CapabilitySnapshot.
 *
 * This class does NOT perform individual capability detection.
 *
 * Detection must remain inside the appropriate provider.
 *
 * Security rule:
 * Never report a capability as SUPPORTED unless a provider
 * has real evidence for it.
 */
class CapabilityEngine(
    private val context: Context
) {

    private val androidProvider: CapabilityProvider =
        AndroidCapabilityProvider(context)

    private val normalModeProvider: CapabilityProvider =
        NormalModeProvider(context)

    private val managedDeviceProvider: CapabilityProvider =
        ManagedDeviceProvider(context)

    /**
     * Performs a complete capability scan.
     */
    fun detect(): CapabilitySnapshot {

        val mode = detectMode()

        val capabilities = mutableListOf<Capability>()

        /*
         * Android platform capabilities are relevant in every mode.
         */
        capabilities += safelyEvaluate(androidProvider)

        /*
         * Normal-mode capabilities are evaluated only when
         * SecureDroid is operating without Android Enterprise
         * management authority.
         */
        if (mode == SecureDroidMode.NORMAL) {
            capabilities += safelyEvaluate(normalModeProvider)
        }

        /*
         * Managed-device capabilities are evaluated when Android
         * Enterprise management state is present.
         *
         * The provider itself verifies whether Device Owner or
         * managed-profile authority actually exists.
         */
        if (
            mode == SecureDroidMode.DEVICE_OWNER ||
            mode == SecureDroidMode.MANAGED_PROFILE
        ) {
            capabilities += safelyEvaluate(managedDeviceProvider)
        }

        /*
         * Remove duplicate IDs while preserving the first
         * authoritative result.
         */
        val deduplicated = deduplicateCapabilities(capabilities)

        return CapabilitySnapshot(
            mode = mode,
            androidVersion = android.os.Build.VERSION.SDK_INT,
            androidRelease = android.os.Build.VERSION.RELEASE ?: "unknown",
            capabilities = deduplicated
        )
    }

    /**
     * Detects the strongest actual management mode available
     * to this SecureDroid installation.
     *
     * Priority:
     *
     * DEVICE_OWNER
     *      ↓
     * MANAGED_PROFILE
     *      ↓
     * NORMAL
     *
     * UNKNOWN is reserved for cases where the management provider
     * cannot reliably determine the state.
     */
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

                /*
                 * If the managed provider cannot determine the
                 * management state, do not invent management authority.
                 *
                 * For the application itself, absence of confirmed
                 * Device Owner/Profile Owner authority means we can
                 * safely operate under the normal application boundary.
                 */
                SecureDroidMode.NORMAL
            }
        }
    }

    /**
     * Executes a provider without allowing one provider failure
     * to crash the entire capability scan.
     */
    private fun safelyEvaluate(
        provider: CapabilityProvider
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

    /**
     * Removes duplicate capability IDs.
     *
     * Provider order is intentional:
     *
     * Android provider
     * → mode-specific provider
     *
     * Therefore generic platform observations remain authoritative
     * unless the capability is uniquely provided by a mode-specific
     * provider.
     */
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

    /**
     * Selects the stronger/evidence-backed result when two providers
     * expose the same capability.
     */
    private fun selectMoreAuthoritative(
        first: Capability,
        second: Capability
    ): Capability {

        /*
         * A real capability always wins over a non-real result.
         */
        if (first.isReal != second.isReal) {
            return if (first.isReal) first else second
        }

        /*
         * Prefer results with stronger state evidence.
         */
        val firstRank = stateRank(first.state)
        val secondRank = stateRank(second.state)

        if (secondRank > firstRank) {
            return second
        }

        return first
    }

    /**
     * Ranking used only for merging duplicate observations.
     *
     * SUPPORTED is strongest because it contains positive evidence.
     * LIMITED follows because the capability exists but is restricted.
     * UNKNOWN is preferred over falsely claiming availability.
     */
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

    /**
     * Converts an unexpected provider failure into an explicit
     * capability result instead of silently hiding the failure.
     */
    private fun createProviderErrorCapability(
        provider: CapabilityProvider,
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

/**
 * Internal helper used by CapabilityEngine.
 *
 * ManagedDeviceProvider owns the actual Android Enterprise
 * detection logic. The engine only orchestrates it.
 */
private fun CapabilityProvider.getModeSafely(): SecureDroidMode {

    return when (this) {

        is ManagedDeviceProvider ->
            getMode()

        else ->
            SecureDroidMode.UNKNOWN
    }
}
