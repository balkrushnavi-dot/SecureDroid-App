package org.securedroid.capability

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.os.Build
import android.os.UserManager
import org.securedroid.admin.SecureDroidDeviceAdmin

class ManagedDeviceProvider(
    private val context: Context
) : CapabilityProvider {

    private val devicePolicyManager =
        context.getSystemService(
            Context.DEVICE_POLICY_SERVICE
        ) as? DevicePolicyManager

    private val userManager =
        context.getSystemService(
            Context.USER_SERVICE
        ) as? UserManager

    private val adminComponent: ComponentName
        get() = ComponentName(
            context,
            SecureDroidDeviceAdmin::class.java
        )

    override fun getMode(): SecureDroidMode {
        val dpm = devicePolicyManager
            ?: return SecureDroidMode.UNKNOWN

        return try {
            when {
                dpm.isDeviceOwnerApp(context.packageName) ->
                    SecureDroidMode.DEVICE_OWNER

                isManagedProfile() ->
                    SecureDroidMode.MANAGED_PROFILE

                else ->
                    SecureDroidMode.UNKNOWN
            }
        } catch (_: SecurityException) {
            SecureDroidMode.UNKNOWN
        } catch (_: Exception) {
            SecureDroidMode.UNKNOWN
        }
    }

    override fun getCapabilities(): List<SecurityCapability> {
        val dpm = devicePolicyManager

        if (dpm == null) {
            return listOf(
                unavailableManagementCapability(
                    "DevicePolicyManager is unavailable on this device."
                )
            )
        }

        val isDeviceOwner = try {
            dpm.isDeviceOwnerApp(context.packageName)
        } catch (_: Exception) {
            false
        }

        val managedProfile = isManagedProfile()

        return listOf(
            deviceOwnerCapability(isDeviceOwner),
            managedProfileCapability(managedProfile),
            policyManagementCapability(isDeviceOwner || managedProfile),
            applicationRestrictionCapability(isDeviceOwner),
            kioskCapability(isDeviceOwner),
            passwordPolicyCapability(isDeviceOwner),
            lockDeviceCapability(isDeviceOwner),
            managedNetworkCapability(isDeviceOwner),
            deviceManagementBoundaryCapability()
        )
    }

    private fun isManagedProfile(): Boolean {
        return try {
            userManager?.isManagedProfile == true
        } catch (_: Exception) {
            false
        }
    }

    private fun deviceOwnerCapability(
        isDeviceOwner: Boolean
    ): SecurityCapability {
        return SecurityCapability(
            id = "DEVICE_OWNER",
            name = "Device Owner",
            category = "DEVICE_MANAGEMENT",
            state = if (isDeviceOwner) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.REQUIRES_DEVICE_OWNER
            },
            evidence = if (isDeviceOwner) {
                "DevicePolicyManager confirms this application is the Device Owner."
            } else {
                "DevicePolicyManager does not report this application as Device Owner."
            },
            securityMeaning = "Device Owner provides enterprise-level management authority over the managed device.",
            limitations = if (!isDeviceOwner) {
                "Normal applications cannot assume Device Owner privileges."
            } else {
                null
            },
            remediation = if (!isDeviceOwner) {
                "Provision SecureDroid as Device Owner through a supported Android Enterprise provisioning flow."
            } else {
                null
            },
            provider = "ManagedDeviceProvider",
            isReal = true,
            canAppChange = false,
            requiredPrivilege = "DEVICE_OWNER",
            implementationLayer = "ANDROID_ENTERPRISE"
        )
    }

    private fun managedProfileCapability(
        isManagedProfile: Boolean
    ): SecurityCapability {
        return SecurityCapability(
            id = "MANAGED_PROFILE",
            name = "Managed Profile",
            category = "DEVICE_MANAGEMENT",
            state = if (isManagedProfile) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.UNAVAILABLE
            },
            evidence = if (isManagedProfile) {
                "Android reports that the current user is a managed profile."
            } else {
                "Android does not report the current user as a managed profile."
            },
            securityMeaning = "A managed profile provides an Android Enterprise work-profile boundary.",
            limitations = if (!isManagedProfile) {
                "No managed-profile state is currently active for this user."
            } else {
                "Managed Profile authority is different from full Device Owner authority."
            },
            remediation = null,
            provider = "ManagedDeviceProvider",
            isReal = true,
            canAppChange = false,
            requiredPrivilege = "MANAGED_PROFILE",
            implementationLayer = "ANDROID_ENTERPRISE"
        )
    }

    private fun policyManagementCapability(
        managementAvailable: Boolean
    ): SecurityCapability {
        return SecurityCapability(
            id = "POLICY_MANAGEMENT",
            name = "Android Policy Management",
            category = "DEVICE_MANAGEMENT",
            state = if (managementAvailable) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.REQUIRES_DEVICE_OWNER
            },
            evidence = if (managementAvailable) {
                "SecureDroid has an active Android Enterprise management context."
            } else {
                "No active management context was detected."
            },
            securityMeaning = "Allows SecureDroid to enforce supported Android Enterprise security policies.",
            limitations = if (!managementAvailable) {
                "Normal Mode cannot enforce Device Owner policies."
            } else {
                "Available policies depend on Android version, provisioning state, and administrator authority."
            },
            remediation = if (!managementAvailable) {
                "Provision SecureDroid using Android Enterprise management."
            } else {
                null
            },
            provider = "ManagedDeviceProvider",
            isReal = managementAvailable,
            canAppChange = managementAvailable,
            requiredPrivilege = "DEVICE_OWNER_OR_PROFILE_OWNER",
            implementationLayer = "ANDROID_ENTERPRISE"
        )
    }

    private fun applicationRestrictionCapability(
        isDeviceOwner: Boolean
    ): SecurityCapability {
        val supported = isDeviceOwner

        return SecurityCapability(
            id = "APPLICATION_RESTRICTIONS",
            name = "Application Restrictions",
            category = "DEVICE_MANAGEMENT",
            state = if (supported) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.REQUIRES_DEVICE_OWNER
            },
            evidence = if (supported) {
                "SecureDroid is Device Owner and can use applicable Package/DevicePolicyManager controls."
            } else {
                "Device-wide application restriction authority is not available."
            },
            securityMeaning = "Allows supported applications and device policies to be managed centrally.",
            limitations = "Exact controls vary by Android version and policy.",
            remediation = if (!supported) {
                "Provision SecureDroid as Device Owner."
            } else {
                null
            },
            provider = "ManagedDeviceProvider",
            isReal = supported,
            canAppChange = supported,
            requiredPrivilege = "DEVICE_OWNER",
            implementationLayer = "ANDROID_ENTERPRISE"
        )
    }

    private fun kioskCapability(
        isDeviceOwner: Boolean
    ): SecurityCapability {
        return SecurityCapability(
            id = "LOCK_TASK_KIOSK",
            name = "Lock Task / Kiosk Mode",
            category = "DEVICE_MANAGEMENT",
            state = if (isDeviceOwner) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.REQUIRES_DEVICE_OWNER
            },
            evidence = if (isDeviceOwner) {
                "Device Owner status permits SecureDroid to configure applicable Lock Task policies."
            } else {
                "SecureDroid is not currently Device Owner."
            },
            securityMeaning = "Can restrict the device to an administrator-approved application set.",
            limitations = "Kiosk behavior depends on Android Enterprise policy and OS version.",
            remediation = if (!isDeviceOwner) {
                "Provision SecureDroid as Device Owner."
            } else {
                null
            },
            provider = "ManagedDeviceProvider",
            isReal = isDeviceOwner,
            canAppChange = isDeviceOwner,
            requiredPrivilege = "DEVICE_OWNER",
            implementationLayer = "ANDROID_ENTERPRISE"
        )
    }

    private fun passwordPolicyCapability(
        isDeviceOwner: Boolean
    ): SecurityCapability {
        return SecurityCapability(
            id = "PASSWORD_POLICY",
            name = "Device Password Policy",
            category = "DEVICE_MANAGEMENT",
            state = if (isDeviceOwner) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.REQUIRES_DEVICE_OWNER
            },
            evidence = if (isDeviceOwner) {
                "Device Owner authority is available for supported password-policy APIs."
            } else {
                "Device-wide password-policy authority requires management privileges."
            },
            securityMeaning = "Allows an administrator to enforce supported password security requirements.",
            limitations = "Policy enforcement is controlled by Android and varies by API level.",
            remediation = if (!isDeviceOwner) {
                "Provision SecureDroid as Device Owner."
            } else {
                null
            },
            provider = "ManagedDeviceProvider",
            isReal = isDeviceOwner,
            canAppChange = isDeviceOwner,
            requiredPrivilege = "DEVICE_OWNER",
            implementationLayer = "ANDROID_ENTERPRISE"
        )
    }

    private fun lockDeviceCapability(
        isDeviceOwner: Boolean
    ): SecurityCapability {
        return SecurityCapability(
            id = "REMOTE_DEVICE_LOCK",
            name = "Device Lock",
            category = "DEVICE_MANAGEMENT",
            state = if (isDeviceOwner) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.REQUIRES_DEVICE_OWNER
            },
            evidence = if (isDeviceOwner) {
                "Device Owner authority allows SecureDroid to invoke supported device-lock APIs."
            } else {
                "Device-wide lock authority is unavailable in Normal Mode."
            },
            securityMeaning = "Can immediately lock the managed device.",
            limitations = "This capability does not provide remote control or physical access to the device.",
            remediation = if (!isDeviceOwner) {
                "Provision SecureDroid as Device Owner."
            } else {
                null
            },
            provider = "ManagedDeviceProvider",
            isReal = isDeviceOwner,
            canAppChange = isDeviceOwner,
            requiredPrivilege = "DEVICE_OWNER",
            implementationLayer = "ANDROID_ENTERPRISE"
        )
    }

    private fun managedNetworkCapability(
        isDeviceOwner: Boolean
    ): SecurityCapability {
        val supported = isDeviceOwner &&
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.P

        return SecurityCapability(
            id = "MANAGED_NETWORK_POLICY",
            name = "Managed Network Policy",
            category = "NETWORK_SECURITY",
            state = if (supported) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.REQUIRES_DEVICE_OWNER
            },
            evidence = if (supported) {
                "Device Owner and required Android APIs are available."
            } else {
                "Required enterprise network-management authority is not currently available."
            },
            securityMeaning = "Provides access to supported Android Enterprise network policies.",
            limitations = "This does not automatically create a kernel firewall or inspect encrypted application traffic.",
            remediation = if (!supported) {
                "Use Device Owner provisioning on a compatible Android version."
            } else {
                null
            },
            provider = "ManagedDeviceProvider",
            isReal = supported,
            canAppChange = supported,
            requiredPrivilege = "DEVICE_OWNER",
            implementationLayer = "ANDROID_ENTERPRISE"
        )
    }

    private fun deviceManagementBoundaryCapability(): SecurityCapability {
        return SecurityCapability(
            id = "DEVICE_MANAGEMENT_BOUNDARY",
            name = "Android Management Boundary",
            category = "SECURITY_BOUNDARY",
            state = CapabilityState.SUPPORTED,
            evidence = "SecureDroid distinguishes application-level authority from Android Enterprise management authority.",
            securityMeaning = "Prevents unsupported device-wide security claims from being presented as application capabilities.",
            limitations = null,
            remediation = null,
            provider = "ManagedDeviceProvider",
            isReal = true,
            canAppChange = false,
            requiredPrivilege = null,
            implementationLayer = "APPLICATION"
        )
    }

    private fun unavailableManagementCapability(
        reason: String
    ): SecurityCapability {
        return SecurityCapability(
            id = "DEVICE_MANAGEMENT",
            name = "Android Device Management",
            category = "DEVICE_MANAGEMENT",
            state = CapabilityState.UNAVAILABLE,
            evidence = reason,
            securityMeaning = "Android Enterprise management requires supported platform services.",
            limitations = "SecureDroid cannot provide Device Owner functionality without Android's management framework.",
            remediation = null,
            provider = "ManagedDeviceProvider",
            isReal = false,
            canAppChange = false,
            requiredPrivilege = "DEVICE_OWNER",
            implementationLayer = "ANDROID_ENTERPRISE"
        )
    }
}
