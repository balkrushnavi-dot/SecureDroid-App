package org.securedroid

import android.content.Context
import org.securedroid.admin.SecureDroidDeviceAdmin
import org.securedroid.apps.AppSecurityAnalyzer
import org.securedroid.apps.AppSecurityAssessment
import org.securedroid.apps.InstalledAppInfo
import org.securedroid.apps.InstalledAppScanner
import org.securedroid.diagnostics.DeviceDiagnostics
import org.securedroid.diagnostics.DeviceDiagnosticsResult
import org.securedroid.space.SecureSpaceManager
import org.securedroid.vault.SecureVault
import org.securedroid.vpn.SecureVpnManager
import org.securedroid.vpn.VpnState

class SecureDroidPlugin(
    context: Context
) {

    private val appContext =
        context.applicationContext

    private val deviceAdmin =
        SecureDroidDeviceAdmin(appContext)

    private val vpnManager =
        SecureVpnManager(appContext)

    private val vault =
        SecureVault(appContext)

    private val secureSpace =
        SecureSpaceManager(appContext)

    private val appScanner =
        InstalledAppScanner(appContext)

    private val appSecurityAnalyzer =
        AppSecurityAnalyzer()

    private val diagnostics =
        DeviceDiagnostics(appContext)

    // --------------------------------------------------
    // DEVICE ADMIN
    // --------------------------------------------------

    fun isDeviceAdminEnabled(): Boolean =
        deviceAdmin.isEnabled()

    fun isCameraDisabled(): Boolean =
        deviceAdmin.isCameraDisabled()

    fun setCameraDisabled(
        disabled: Boolean
    ): Boolean =
        deviceAdmin.setCameraDisabled(disabled)

    // --------------------------------------------------
    // VPN
    // --------------------------------------------------

    fun getVpnState(): VpnState =
        vpnManager.getState()

    fun startVpn(): Boolean =
        vpnManager.start()

    fun stopVpn() =
        vpnManager.stop()

    // --------------------------------------------------
    // SECURE SPACE
    // --------------------------------------------------

    fun isSecureSpaceEnabled(): Boolean =
        secureSpace.isEnabled()

    fun enableSecureSpace(): Boolean =
        secureSpace.enable()

    fun disableSecureSpace(): Boolean =
        secureSpace.disable()

    // --------------------------------------------------
    // INSTALLED APPS
    // --------------------------------------------------

    fun scanInstalledApps(): List<InstalledAppInfo> =
        appScanner.scan()

    fun isAppInstalled(
        packageName: String
    ): Boolean =
        appScanner.isInstalled(packageName)

    // --------------------------------------------------
    // APP SECURITY AUDITOR
    // --------------------------------------------------

    fun analyzeInstalledApp(
        packageName: String
    ): AppSecurityAssessment? =
        appScanner
            .findPackage(packageName)
            ?.let {
                appSecurityAnalyzer.analyze(it)
            }

    fun analyzeAllInstalledApps():
        List<AppSecurityAssessment> =
        appScanner
            .scan()
            .map {
                appSecurityAnalyzer.analyze(it)
            }

    // --------------------------------------------------
    // DIAGNOSTICS
    // --------------------------------------------------

    fun runDiagnostics(): DeviceDiagnosticsResult =
        diagnostics.run()

    // --------------------------------------------------
    // VAULT
    // --------------------------------------------------

    fun encryptText(
        text: String
    ): SecureVault.EncryptedData =
        vault.encrypt(text)

    fun decryptText(
        encryptedData: SecureVault.EncryptedData
    ): String =
        vault.decrypt(encryptedData)

    fun deleteVaultKey() {
        vault.deleteEncryptionKey()
    }
}
