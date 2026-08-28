package org.securedroid.capability.providers

import android.content.Context
import android.content.pm.PackageManager
import android.net.VpnService
import android.os.Build
import android.security.keystore.KeyStoreException
import org.securedroid.capability.Capability
import org.securedroid.capability.CapabilityCategory
import org.securedroid.capability.CapabilityIds
import org.securedroid.capability.CapabilityState
import org.securedroid.capability.ImplementationLayer
import org.securedroid.capability.RequiredPrivilege
import org.securedroid.vpn.VpnState
import org.securedroid.vpn.VpnStateStore

class NormalModeProvider(
    private val context: Context
) : CapabilityProvider {

    override val id: String = "normal_mode"
    override val name: String = "Normal Mode Provider"

    override fun getCapabilities(): List<Capability> {
        return listOf(
            evaluateVpn(),
            evaluateAppInventory(),
            evaluateEncryptedStorage(),
            evaluateBiometric()
        )
    }

    private fun evaluateVpn(): Capability {
        val prepareIntent = try {
            VpnService.prepare(context)
        } catch (e: Exception) {
            return Capability(
                id = CapabilityIds.VPN,
                name = "Application-level VPN",
                category = CapabilityCategory.NETWORK,
                state = CapabilityState.ERROR,
                evidence = "${e.javaClass.simpleName}: ${e.message}",
                securityMeaning = "SecureDroid could not determine VPN authorization state.",
                limitations = "VPN availability could not be verified.",
                remediation = "Retry the capability check.",
                provider = id,
                isReal = true,
                canAppChange = true,
                requiredPrivilege = RequiredPrivilege.VPN_PERMISSION,
                implementationLayer = ImplementationLayer.VpnService
            )
        }

        val state = when {
            prepareIntent == null &&
                VpnStateStore.get() == VpnState.CONNECTED ->
                CapabilityState.SUPPORTED

            prepareIntent == null ->
                CapabilityState.LIMITED

            else ->
                CapabilityState.UNAVAILABLE
        }

        val evidence = when (state) {
            CapabilityState.SUPPORTED ->
                "Android VPN authorization granted; SecureDroid VPN state is CONNECTED."

            CapabilityState.LIMITED ->
                "Android VPN authorization granted; SecureDroid VPN is not currently connected."

            else ->
                "Android VpnService.prepare() requires user authorization."
        }

        return Capability(
            id = CapabilityIds.VPN,
            name = "Application-level VPN",
            category = CapabilityCategory.NETWORK,
            state = state,
            evidence = evidence,
            securityMeaning = "SecureDroid can create an application-level VPN tunnel using Android VpnService.",
            limitations = "This is not a kernel firewall and does not provide root-level packet filtering.",
            remediation = if (state == CapabilityState.UNAVAILABLE) {
                "Authorize SecureDroid's VPN connection."
            } else {
                null
            },
            provider = id,
            isReal = true,
            canAppChange = true,
            requiredPrivilege = RequiredPrivilege.VPN_PERMISSION,
            implementationLayer = ImplementationLayer.VpnService
        )
    }

    private fun evaluateAppInventory(): Capability {
        val packageManager = context.packageManager

        val canQueryPackages = try {
            packageManager.getInstalledPackages(
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    PackageManager.PackageInfoFlags.of(0)
                } else {
                    @Suppress("DEPRECATION")
                    0
                }
            )
            true
        } catch (_: SecurityException) {
            false
        } catch (_: Exception) {
            false
        }

        return Capability(
            id = CapabilityIds.APP_INVENTORY,
            name = "Installed Application Inventory",
            category = CapabilityCategory.APPLICATION,
            state = if (canQueryPackages) {
                CapabilityState.SUPPORTED
            } else {
                CapabilityState.LIMITED
            },
            evidence = if (canQueryPackages) {
                "PackageManager returned installed application information."
            } else {
                "PackageManager access was restricted or failed."
            },
            securityMeaning = "SecureDroid can inspect application information exposed to it by Android.",
            limitations = "Android package-visibility rules can restrict which applications an ordinary app can discover.",
            remediation = if (canQueryPackages) {
                null
            } else {
                "Review the application's package visibility declarations and Android package-visibility restrictions."
            },
            provider = id,
            isReal = true,
            canAppChange = false,
            requiredPrivilege = RequiredPrivilege.NONE,
            implementationLayer = ImplementationLayer.ANDROID_API
        )
    }

    private fun evaluateEncryptedStorage(): Capability {
        return try {
            val keyStore = java.security.KeyStore.getInstance(
                "AndroidKeyStore"
            )

            keyStore.load(null)

            Capability(
                id = CapabilityIds.SECURE_STORAGE,
                name = "Encrypted Application Storage",
                category = CapabilityCategory.STORAGE,
                state = CapabilityState.SUPPORTED,
                evidence = "Android Keystore is available to the application.",
                securityMeaning = "SecureDroid can encrypt application data using keys protected by Android Keystore.",
                limitations = "Keystore availability does not guarantee hardware-backed key storage on every device.",
                remediation = null,
                provider = id,
                isReal = true,
                canAppChange = false,
                requiredPrivilege = RequiredPrivilege.NONE,
                implementationLayer = ImplementationLayer.APP
            )
        } catch (e: Exception) {
            Capability(
                id = CapabilityIds.SECURE_STORAGE,
                name = "Encrypted Application Storage",
                category = CapabilityCategory.STORAGE,
                state = CapabilityState.UNAVAILABLE,
                evidence = "${e.javaClass.simpleName}: ${e.message}",
                securityMeaning = "SecureDroid could not initialize Android Keystore.",
                limitations = "Keystore-dependent encrypted storage may not function.",
                remediation = "Retry after restarting the device.",
                provider = id,
                isReal = true,
                canAppChange = false,
                requiredPrivilege = RequiredPrivilege.NONE,
                implementationLayer = ImplementationLayer.APP
            )
        }
    }

    private fun evaluateBiometric(): Capability {
        val biometricManagerClass = try {
            Class.forName("android.hardware.biometrics.BiometricManager")
        } catch (_: Exception) {
            null
        }

        if (biometricManagerClass == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            return Capability(
                id = CapabilityIds.BIOMETRIC,
                name = "Biometric Authentication",
                category = CapabilityCategory.AUTHENTICATION,
                state = CapabilityState.UNKNOWN,
                evidence = "Modern BiometricManager API is unavailable on this Android version.",
                securityMeaning = "SecureDroid cannot reliably evaluate modern biometric authentication availability.",
                limitations = "Legacy Android biometric APIs may expose only fingerprint-specific information.",
                remediation = "Use a supported Android version.",
                provider = id,
                isReal = true,
                canAppChange = false,
                requiredPrivilege = RequiredPrivilege.APP_PERMISSION,
                implementationLayer = ImplementationLayer.ANDROID_API
            )
        }

        return try {
            val manager = context.getSystemService(
                android.hardware.biometrics.BiometricManager::class.java
            )

            if (manager == null) {
                Capability(
                    id = CapabilityIds.BIOMETRIC,
                    name = "Biometric Authentication",
                    category = CapabilityCategory.AUTHENTICATION,
                    state = CapabilityState.UNKNOWN,
                    evidence = "BiometricManager unavailable.",
                    securityMeaning = "SecureDroid cannot determine biometric availability.",
                    limitations = "Android did not provide BiometricManager.",
                    remediation = null,
                    provider = id,
                    isReal = true,
                    canAppChange = false,
                    requiredPrivilege = RequiredPrivilege.APP_PERMISSION,
                    implementationLayer = ImplementationLayer.ANDROID_API
                )
            } else {
                val canAuthenticate =
                    manager.canAuthenticate(
                        android.hardware.biometrics.BiometricManager.Authenticators.BIOMETRIC_STRONG
                    )

                val state = when (canAuthenticate) {
                    android.hardware.biometrics.BiometricManager.BIOMETRIC_SUCCESS ->
                        CapabilityState.SUPPORTED

                    android.hardware.biometrics.BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED ->
                        CapabilityState.LIMITED

                    android.hardware.biometrics.BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE ->
                        CapabilityState.UNAVAILABLE

                    android.hardware.biometrics.BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE ->
                        CapabilityState.LIMITED

                    else ->
                        CapabilityState.UNKNOWN
                }

                Capability(
                    id = CapabilityIds.BIOMETRIC,
                    name = "Biometric Authentication",
                    category = CapabilityCategory.AUTHENTICATION,
                    state = state,
                    evidence = "BiometricManager.canAuthenticate(BIOMETRIC_STRONG) = $canAuthenticate",
                    securityMeaning = when (state) {
                        CapabilityState.SUPPORTED ->
                            "Strong biometric authentication is available for SecureDroid."

                        CapabilityState.LIMITED ->
                            "Biometric hardware exists, but strong biometric authentication is not currently ready."

                        CapabilityState.UNAVAILABLE ->
                            "Strong biometric authentication is unavailable."

                        else ->
                            "Biometric authentication state could not be fully determined."
                    },
                    limitations = if (state == CapabilityState.SUPPORTED) {
                        null
                    } else {
                        "Availability depends on device hardware, enrollment, and current Android authentication state."
                    },
                    remediation = if (state == CapabilityState.LIMITED) {
                        "Enroll a supported biometric or resolve the current biometric hardware state."
                    } else {
                        null
                    },
                    provider = id,
                    isReal = true,
                    canAppChange = false,
                    requiredPrivilege = RequiredPrivilege.APP_PERMISSION,
                    implementationLayer = ImplementationLayer.ANDROID_API
                )
            }
        } catch (e: Exception) {
            Capability(
                id = CapabilityIds.BIOMETRIC,
                name = "Biometric Authentication",
                category = CapabilityCategory.AUTHENTICATION,
                state = CapabilityState.UNKNOWN,
                evidence = "${e.javaClass.simpleName}: ${e.message}",
                securityMeaning = "SecureDroid could not evaluate biometric authentication.",
                limitations = "The platform returned an unexpected biometric error.",
                remediation = "Retry the capability check.",
                provider = id,
                isReal = true,
                canAppChange = false,
                requiredPrivilege = RequiredPrivilege.APP_PERMISSION,
                implementationLayer = ImplementationLayer.ANDROID_API
            )
        }
    }
}
