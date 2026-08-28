package org.securedroid.capability.providers

import org.securedroid.capability.Capability

/**
 * Common contract for SecureDroid capability providers.
 *
 * Providers must report only capabilities that can be evaluated
 * from actual Android APIs or SecureDroid's real implementation.
 *
 * Providers must never fabricate security capabilities.
 */
interface ICapabilityProvider {

    /**
     * Stable provider identifier.
     */
    val id: String

    /**
     * Human-readable provider name.
     */
    val name: String

    /**
     * Evaluate capabilities owned by this provider.
     *
     * Implementations should:
     * - use real Android APIs
     * - return UNKNOWN when verification is impossible
     * - return UNAVAILABLE when the capability genuinely cannot be used
     * - never return SUPPORTED without evidence
     */
    fun getCapabilities(): List<Capability>
}
