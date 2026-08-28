package org.securedroid.capability

import android.app.admin.DevicePolicyManager
import android.content.Context
import org.securedroid.capability.providers.AndroidCapabilityProvider
import org.securedroid.capability.providers.CapabilityProvider
import org.securedroid.capability.providers.NormalModeProvider

/**
 * Central capability orchestration engine for SecureDroid.
 *
 * Responsibilities:
 * - Determine SecureDroid's actual management mode.
 * - Run the appropriate capability providers.
 * - Merge their results into one CapabilitySnapshot.
 * - Prevent duplicate capability identifiers.
 * - Never fabricate capabilities or use demo values.
 *
 * The engine does NOT grant permissions or change device state.
 */
class CapabilityEngine(
    private val context: Context
) {

    private val devicePolicyManager: DevicePolicyManager? =
        context.getSystemService(Context.DEVICE_POLICY_SERVICE)
            as? DevicePolicyManager

    private val providers: List<CapabilityProvider> by lazy {
        listOf(
            AndroidCapabilityProvider(context),
            NormalModeProvider(context),
            ManagedDeviceProvider(context)
        )
    }

    /**
     * Performs a complete capability scan.
     */
    fun detect(): CapabilitySnapshot {

        val mode = detectMode()

        val capabilities = providers
            .flatMap { provider ->
                try {
                    provider.getCapabilities()
                } catch (_: SecurityException) {
                    emptyList()
                } catch (_: Exception) {
                    emptyList()
                }
            }
            .let { removeDuplicateCapabilities(it) }

        return CapabilitySnapshot(
            mode = mode,
            androidVersion = android.os.Build.VERSION.SDK_INT,
            androidRelease = android.os.Build.VERSION.RELEASE ?: "unknown",
            capabilities = capabilities
        )
    }

    /**
     * Determines the strongest management authority actually assigned
     * to SecureDroid.
     *
     * Priority:
     *
     * DEVICE_OWNER
     *      ↓
     * MANAGED_PROFILE
     *      ↓
     * NORMAL
     *
     * UNKNOWN is reserved for cases where Android's management state
     * cannot be reliably determined.
     */
    fun detectMode(): SecureDroidMode {

        val dpm = devicePolicyManager

        if (dpm == null) {
            return SecureDroidMode.UNKNOWN
        }

        return try {

            /*
             * Device Owner has the highest management authority available
             * to a normal Android application.
             */
            if (dpm.isDeviceOwnerApp(context.packageName)) {
                return SecureDroidMode.DEVICE_OWNER
            }

            /*
             * Profile Owner means SecureDroid itself owns the managed
             * profile. This is different from merely running inside a
             * managed profile.
             */
            if (
                android.os.Build.VERSION.SDK_INT >=
                android.os.Build.VERSION_CODES.N &&
                dpm.isProfileOwnerApp(context.packageName)
            ) {
                return SecureDroidMode.MANAGED_PROFILE
            }

            /*
             * A normal application has no Android Enterprise ownership.
             */
            SecureDroidMode.NORMAL

        } catch (_: SecurityException) {
            SecureDroidMode.UNKNOWN
        } catch (_: Exception) {
            SecureDroidMode.UNKNOWN
        }
    }

    /**
     * Removes duplicate capabilities produced by overlapping providers.
     *
     * Provider priority is deliberate:
     *
     * 1. Managed-device authority
     * 2. Normal-mode capability
     * 3. Android platform capability
     *
     * The same capability ID must never appear multiple times in the
     * final snapshot.
     */
    private fun removeDuplicateCapabilities(
        capabilities: List<Capability>
    ): List<Capability> {

        val priority = mapOf(
            CapabilityProvider.DEVICE_POLICY_MANAGER to 3,
            CapabilityProvider.SECUREDROID_MANAGED_MODE to 3,
            CapabilityProvider.SECUREDROID_NORMAL_MODE to 2,
            CapabilityProvider.ANDROID to 1,
            CapabilityProvider.ANDROID_KEYSTORE to 1,
            CapabilityProvider.VPN_SERVICE to 1
        )

        return capabilities
            .groupBy { it.id }
            .mapNotNull { (_, candidates) ->

                candidates.maxWithOrNull(
                    compareBy<Capability> {

                        /*
                         * Real capabilities always outrank non-real
                         * capabilities.
                         */
                        if (it.isReal) 1 else 0

                    }.thenBy {

                        /*
                         * Prefer an actually supported capability over
                         * weaker states when providers overlap.
                         */
                        when (it.state) {
                            CapabilityState.SUPPORTED -> 5
                            CapabilityState.LIMITED -> 4
                            CapabilityState.UNKNOWN -> 3
                            CapabilityState.REQUIRES_DEVICE_OWNER -> 2
                            CapabilityState.REQUIRES_HARDWARE -> 2
                            CapabilityState.REQUIRES_OS_INTEGRATION -> 2
                            CapabilityState.REQUIRES_SYSTEM_PRIVILEGE -> 2
                            CapabilityState.UNAVAILABLE -> 1
                            CapabilityState.ERROR -> 0
                            CapabilityState.DEMO_ONLY -> -1
                        }

                    }.thenBy {

                        priority[it.provider] ?: 0
                    }
                )
            }
            .sortedBy { it.id }
    }

    /**
     * Convenience method for callers that only need one capability.
     */
    fun getCapability(
        capabilityId: String
    ): Capability? {
        return detect().getCapability(capabilityId)
    }

    /**
     * Convenience method for checking whether a capability is genuinely
     * supported.
     */
    fun isSupported(
        capabilityId: String
    ): Boolean {
        return detect().isSupported(capabilityId)
    }

    /**
     * Convenience method for checking whether a capability is usable
     * either fully or with limitations.
     */
    fun isAvailable(
        capabilityId: String
    ): Boolean {
        return detect().isAvailable(capabilityId)
    }
}
