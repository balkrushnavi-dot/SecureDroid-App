package org.securedroid

import android.content.Context
import org.securedroid.admin.SecureDroidDeviceAdmin
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

    private val appContext = context.applicationContext

    private val deviceAdmin =
        SecureDroidDeviceAdmin(appContext)

    private val vpnManager =
        SecureVpnManager(appContext)

    private val vault =
        SecureVault()

    private val secureSpace =
        SecureSpaceManager(appContext)

    private val appScanner =
        InstalledAppScanner(appContext)

    private val diagnostics =
        DeviceDiagnostics(appContext)

    fun isDeviceAdminEnabled(): Boolean {
        return deviceAdmin.isEnabled()
    }

    fun isCameraDisabled(): Boolean {
        return deviceAdmin.isCameraDisabled()
    }

    fun setCameraDisabled(disabled: Boolean): Boolean {
        return deviceAdmin.setCameraDisabled(disabled)
    }

    fun getVpnState(): VpnState {
        return vpnManager.getState()
    }

    fun startVpn(): Boolean {
        return vpnManager.start()
    }

    fun stopVpn() {
        vpnManager.stop()
    }

    fun isSecureSpaceEnabled(): Boolean {
        return secureSpace.isEnabled()
    }

    fun enableSecureSpace(): Boolean {
        return secureSpace.enable()
    }

    fun disableSecureSpace(): Boolean {
        return secureSpace.disable()
    }

    fun scanInstalledApps(): List<InstalledAppInfo> {
        return appScanner.scan()
    }

    fun isAppInstalled(packageName: String): Boolean {
        return appScanner.isInstalled(packageName)
    }

    fun runDiagnostics(): DeviceDiagnosticsResult {
        return diagnostics.run()
    }

    fun encryptText(text: String): SecureVault.EncryptedData {
        return vault.encrypt(text)
    }

    fun decryptText(
        encryptedData: SecureVault.EncryptedData
    ): String {
        return vault.decrypt(encryptedData)
    }

    fun deleteVaultKey() {
        vault.deleteEncryptionKey()
    }
}
