package org.securedroid.capability

import android.app.admin.DevicePolicyManager
import android.content.Context
import android.os.Build
import android.os.UserManager

/**
 * Detects capabilities that depend on Android Enterprise management
 * authority.
 *
 * This provider does NOT grant management authority.
 * It only reports authority that Android has actually assigned
 * to SecureDroid.
 */
class ManagedDeviceProvider(
    private val context: Context
) : org.securedroid.capability.providers.CapabilityProvider {

    override val id: String = "managed_device"

    override val name: String = "Managed Device Provider"

    private val devicePolicyManager: DevicePolicyManager? =
        context.getSystemService(Context.DEVICE_POLICY_SERVICE)
            as? DevicePolicyManager

    private val userManager: UserManager? =
        context.getSystemService(Context.USER_SERVICE)
            as? UserManager

    override fun getCapabilities(): List<Capability> {

        val dpm = devicePolicyManager

        if (dpm == null) {
            return listOf(
                Capability(
                    id = "device_management_framework",
                    name = "Android Device Management",
                    category = CapabilityCategory.DEVICE_MANAGEMENT,
                    state = CapabilityState.UNAVAILABLE,
                    evidence = "DevicePolicyManager is unavailable.",
                    securityMeaning =
                        "SecureDroid cannot use Android Enterprise device-management APIs.",
                    limitations =
                        "Android does not expose DevicePolicyManager to this application.",
                    remediation = null,
                    provider = CapabilityProvider.DEVICE_POLICY_MANAGER,
                    isReal = true,
                    canAppChange = false,
                    requiredPrivilege = RequiredPrivilege.DEVICE_OWNER,
                    implementationLayer = ImplementationLayer.ANDROID_ENTERPRISE
                )
            )
        }

        val isDeviceOwner = detectDeviceOwner(dpm)
        val isProfileOwner = detectProfileOwner(dpm)
        val isManagedProfile = detectManagedProfile()

        return listOf(
            deviceOwnerCapability(isDeviceOwner),
            profileOwnerCapability(isProfileOwner),
            managedProfileCapability(isManagedProfile),
            policyManagementCapability(
                isDeviceOwner = isDeviceOwner,
                isProfileOwner = isProfileOwner
            ),
            applicationManagementCapability(isDeviceOwner),
            kioskCapability(isDeviceOwner),
            passwordPolicyCapability(
                isDeviceOwner = isDeviceOwner,
                isProfileOwner = isProfileOwner
            ),
            deviceLockCapability(isDeviceOwner),
            managedNetworkCapability(isDeviceOwner),
            managementBoundaryCapability()
        )
    }

    /**
     * Device Owner status must come directly from DevicePolicyManager.
     */
    private fun detectDeviceOwner(
        dpm: DevicePolicyManager
    ): Boolean {
        return try {
            dpm.isDeviceOwnerApp(context.packageName)
        } catch (_: SecurityException) {
            false
        } catch (_: Exception) {
            false
        }
    }

    /**
     * Profile Owner status must be checked independently from
     * "is this user a managed profile?"
     *
     * A managed profile may exist while another application is
     * the Profile Owner.
     */
    private fun detectProfileOwner(
        dpm: DevicePolicyManager
    ): Boolean {

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
            return false
        }

        return try {
            dpm.isProfileOwnerApp(context.packageName)
        } catch (_: SecurityException) {
            false
        } catch (_: Exception) {
            false
        }
    }

    private fun detectManagedProfile(): Boolean {

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
            return false
        }

        return try {
            userManager?.isManagedProfile == true
        } catch (_: Exception) {
            false
        }
    }

    private fun deviceOwnerCapability(
        supported: Boolean
    ): Capability {

        return Capability(
            id = CapabilityIds.DEVICE_OWNER,
            name = "Device Owner",
            category = CapabilityCategory.DEVICE_MANAGEMENT,
            state = if (supported) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.REQUIRES_DEVICE_OWNER
            },
            evidence = if (supported) {
                "DevicePolicyManager confirms SecureDroid is the Device Owner."
            } else {
                "DevicePolicyManager does not report SecureDroid as Device Owner."
            },
            securityMeaning =
                "SecureDroid has Android Enterprise device-owner authority.",
            limitations = if (supported) {
                "Available controls remain subject to Android version, OEM behavior, and DevicePolicyManager restrictions."
            } else {
                "Normal applications cannot grant themselves Device Owner authority."
            },
            remediation = if (supported) {
                null
            } else {
                "Provision SecureDroid as Device Owner using a supported Android Enterprise provisioning flow."
            },
            provider = CapabilityProvider.DEVICE_POLICY_MANAGER,
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.DEVICE_OWNER,
            implementationLayer = ImplementationLayer.ANDROID_ENTERPRISE
        )
    }

    private fun profileOwnerCapability(
        supported: Boolean
    ): Capability {

        return Capability(
            id = CapabilityIds.PROFILE_OWNER,
            name = "Profile Owner",
            category = CapabilityCategory.DEVICE_MANAGEMENT,
            state = if (supported) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.REQUIRES_DEVICE_OWNER
            },
            evidence = if (supported) {
                "DevicePolicyManager confirms SecureDroid is the Profile Owner."
            } else {
                "DevicePolicyManager does not report SecureDroid as Profile Owner."
            },
            securityMeaning =
                "SecureDroid has Android Enterprise management authority over its managed profile.",
            limitations = if (supported) {
                "Profile Owner authority is scoped to the managed profile and is not equivalent to Device Owner authority."
            } else {
                "Profile Owner status must be established by Android Enterprise provisioning."
            },
            remediation = if (supported) {
                null
            } else {
                "Provision SecureDroid as Profile Owner through a supported managed-profile flow."
            },
            provider = CapabilityProvider.DEVICE_POLICY_MANAGER,
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.PROFILE_OWNER,
            implementationLayer = ImplementationLayer.ANDROID_ENTERPRISE
        )
    }

    private fun managedProfileCapability(
        managedProfile: Boolean
    ): Capability {

        return Capability(
            id = CapabilityIds.MANAGED_PROFILE,
            name = "Managed Profile",
            category = CapabilityCategory.DEVICE_MANAGEMENT,
            state = if (managedProfile) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.UNAVAILABLE
            },
            evidence = if (managedProfile) {
                "UserManager reports that the current user is a managed profile."
            } else {
                "UserManager does not report the current user as a managed profile."
            },
            securityMeaning =
                "The application is running inside an Android managed-profile context.",
            limitations =
                "This does not prove that SecureDroid is the Profile Owner and does not grant whole-device management.",
            remediation = null,
            provider = CapabilityProvider.ANDROID,
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.PROFILE_OWNER,
            implementationLayer = ImplementationLayer.ANDROID_ENTERPRISE
        )
    }

    private fun policyManagementCapability(
        isDeviceOwner: Boolean,
        isProfileOwner: Boolean
    ): Capability {

        val supported = isDeviceOwner || isProfileOwner

        return Capability(
            id = CapabilityIds.DEVICE_POLICY,
            name = "Android Device Policy",
            category = CapabilityCategory.DEVICE_MANAGEMENT,
            state = if (supported) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.REQUIRES_DEVICE_OWNER
            },
            evidence = if (isDeviceOwner) {
                "SecureDroid is Device Owner."
            } else if (isProfileOwner) {
                "SecureDroid is Profile Owner."
            } else {
                "SecureDroid has no Device Owner or Profile Owner authority."
            },
            securityMeaning =
                "SecureDroid can use DevicePolicyManager APIs permitted by its current management authority.",
            limitations =
                "Available policies depend on ownership mode, Android API level, provisioning state, and OEM implementation.",
            remediation = if (supported) {
                null
            } else {
                "Provision SecureDroid as Device Owner or Profile Owner."
            },
            provider = CapabilityProvider.DEVICE_POLICY_MANAGER,
            isReal = true,
            canAppChange = supported,
            requiredPrivilege = if (isDeviceOwner) {
                RequiredPrivilege.DEVICE_OWNER
            } else {
                RequiredPrivilege.PROFILE_OWNER
            },
            implementationLayer = ImplementationLayer.ANDROID_ENTERPRISE
        )
    }

    private fun applicationManagementCapability(
        isDeviceOwner: Boolean
    ): Capability {

        return Capability(
            id = CapabilityIds.PACKAGE_MANAGEMENT,
            name = "Managed Application Controls",
            category = CapabilityCategory.APPLICATION_MANAGEMENT,
            state = if (isDeviceOwner) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.REQUIRES_DEVICE_OWNER
            },
            evidence = if (isDeviceOwner) {
                "SecureDroid has Device Owner authority for applicable application-management APIs."
            } else {
                "SecureDroid does not have Device Owner authority."
            },
            securityMeaning =
                "SecureDroid can use supported Android Enterprise application-management controls.",
            limitations =
                "This does not imply unrestricted control over every application. Exact operations depend on Android APIs, policy state, and ownership mode.",
            remediation = if (isDeviceOwner) {
                null
            } else {
                "Provision SecureDroid as Device Owner."
            },
            provider = CapabilityProvider.DEVICE_POLICY_MANAGER,
            isReal = true,
            canAppChange = isDeviceOwner,
            requiredPrivilege = RequiredPrivilege.DEVICE_OWNER,
            implementationLayer = ImplementationLayer.ANDROID_ENTERPRISE
        )
    }

    private fun kioskCapability(
        isDeviceOwner: Boolean
    ): Capability {

        return Capability(
            id = "lock_task_kiosk",
            name = "Lock Task / Kiosk Mode",
            category = CapabilityCategory.DEVICE_MANAGEMENT,
            state = if (isDeviceOwner) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.REQUIRES_DEVICE_OWNER
            },
            evidence = if (isDeviceOwner) {
                "SecureDroid has Device Owner authority required for applicable Lock Task configuration."
            } else {
                "SecureDroid is not Device Owner."
            },
            securityMeaning =
                "SecureDroid may configure supported Android Lock Task policies.",
            limitations =
                "Lock Task behavior depends on Android version, allowlisted packages, provisioning state, and implemented policy configuration.",
            remediation = if (isDeviceOwner) {
                null
            } else {
                "Provision SecureDroid as Device Owner."
            },
            provider = CapabilityProvider.DEVICE_POLICY_MANAGER,
            isReal = true,
            canAppChange = isDeviceOwner,
            requiredPrivilege = RequiredPrivilege.DEVICE_OWNER,
            implementationLayer = ImplementationLayer.ANDROID_ENTERPRISE
        )
    }

    private fun passwordPolicyCapability(
        isDeviceOwner: Boolean,
        isProfileOwner: Boolean
    ): Capability {

        val supported = isDeviceOwner || isProfileOwner

        return Capability(
            id = "password_policy",
            name = "Password Policy",
            category = CapabilityCategory.DEVICE_MANAGEMENT,
            state = if (supported) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.REQUIRES_DEVICE_OWNER
            },
            evidence = if (isDeviceOwner) {
                "SecureDroid has Device Owner authority."
            } else if (isProfileOwner) {
                "SecureDroid has Profile Owner authority."
            } else {
                "SecureDroid has no management-owner authority."
            },
            securityMeaning =
                "SecureDroid can use password-policy APIs permitted to its management authority.",
            limitations =
                "Policy scope and enforcement depend on ownership mode and Android API level.",
            remediation = if (supported) {
                null
            } else {
                "Provision SecureDroid as Device Owner or Profile Owner."
            },
            provider = CapabilityProvider.DEVICE_POLICY_MANAGER,
            isReal = true,
            canAppChange = supported,
            requiredPrivilege = if (isDeviceOwner) {
                RequiredPrivilege.DEVICE_OWNER
            } else {
                RequiredPrivilege.PROFILE_OWNER
            },
            implementationLayer = ImplementationLayer.ANDROID_ENTERPRISE
        )
    }

    private fun deviceLockCapability(
        isDeviceOwner: Boolean
    ): Capability {

        return Capability(
            id = "remote_device_lock",
            name = "Device Lock",
            category = CapabilityCategory.DEVICE_MANAGEMENT,
            state = if (isDeviceOwner) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.REQUIRES_DEVICE_OWNER
            },
            evidence = if (isDeviceOwner) {
                "SecureDroid has Device Owner authority and can invoke applicable lock APIs."
            } else {
                "SecureDroid is not Device Owner."
            },
            securityMeaning =
                "SecureDroid can invoke supported Android device-lock functionality.",
            limitations =
                "This capability locks the managed device; it does not provide remote shell access or physical-device control.",
            remediation = if (isDeviceOwner) {
                null
            } else {
                "Provision SecureDroid as Device Owner."
            },
            provider = CapabilityProvider.DEVICE_POLICY_MANAGER,
            isReal = true,
            canAppChange = isDeviceOwner,
            requiredPrivilege = RequiredPrivilege.DEVICE_OWNER,
            implementationLayer = ImplementationLayer.ANDROID_ENTERPRISE
        )
    }

    private fun managedNetworkCapability(
        isDeviceOwner: Boolean
    ): Capability {

        val apiAvailable =
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.P

        val supported = isDeviceOwner && apiAvailable

        return Capability(
            id = "managed_network_policy",
            name = "Managed Network Policy",
            category = CapabilityCategory.NETWORK,
            state = when {
                supported -> CapabilityState.SUPPORTED
                !isDeviceOwner -> CapabilityState.REQUIRES_DEVICE_OWNER
                else -> CapabilityState.UNAVAILABLE
            },
            evidence = when {
                supported ->
                    "SecureDroid is Device Owner and the required Android API level is available."

                !isDeviceOwner ->
                    "SecureDroid is not Device Owner."

                else ->
                    "The Android API level does not meet the minimum required by the implemented network-management APIs."
            },
            securityMeaning =
                "SecureDroid may use the specific Android Enterprise network policies implemented by the application.",
            limitations =
                "This does not create a kernel firewall, bypass Android networking restrictions, or automatically inspect encrypted traffic.",
            remediation = if (!isDeviceOwner) {
                "Provision SecureDroid as Device Owner."
            } else if (!apiAvailable) {
                "Use a compatible Android version."
            } else {
                null
            },
            provider = CapabilityProvider.DEVICE_POLICY_MANAGER,
            isReal = true,
            canAppChange = supported,
            requiredPrivilege = RequiredPrivilege.DEVICE_OWNER,
            implementationLayer = ImplementationLayer.ANDROID_ENTERPRISE
        )
    }

    private fun managementBoundaryCapability(): Capability {

        return Capability(
            id = "device_management_boundary",
            name = "Android Management Boundary",
            category = CapabilityCategory.SYSTEM_SECURITY,
            state = CapabilityState.SUPPORTED,
            evidence =
                "SecureDroid separates application-level capabilities from Android Enterprise management authority.",
            securityMeaning =
                "Prevents Normal Mode capabilities from being presented as device-management privileges.",
            limitations =
                "This is an architectural security control, not additional Android privilege.",
            remediation = null,
            provider = CapabilityProvider.SECUREDROID_MANAGED_MODE,
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.NORMAL_APP,
            implementationLayer = ImplementationLayer.APPLICATION
        )
    }
}
