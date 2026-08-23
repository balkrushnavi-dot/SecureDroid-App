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

    fun isDeviceAdminEnabled(): Boolean =
        deviceAdmin.isEnabled()

    fun isCameraDisabled(): Boolean =
        deviceAdmin.isCameraDisabled()

    fun setCameraDisabled(disabled: Boolean): Boolean =
        deviceAdmin.setCameraDisabled(disabled)

    fun getVpnState(): VpnState =
        vpnManager.getState()

    fun startVpn(): Boolean =
        vpnManager.start()

    fun stopVpn() =
        vpnManager.stop()

    fun isSecureSpaceEnabled(): Boolean =
        secureSpace.isEnabled()

    fun enableSecureSpace(): Boolean =
        secureSpace.enable()

    fun disableSecureSpace(): Boolean =
        secureSpace.disable()

    fun scanInstalledApps(): List<InstalledAppInfo> =
        appScanner.scan()

    fun isAppInstalled(packageName: String): Boolean =
        appScanner.isInstalled(packageName)

    fun runDiagnostics(): DeviceDiagnosticsResult =
        diagnostics.run()

    fun encryptText(text: String): SecureVault.EncryptedData =
        vault.encrypt(text)

    fun decryptText(
        encryptedData: SecureVault.EncryptedData
    ): String =
        vault.decrypt(encryptedData)

    fun deleteVaultKey() =
        vault.deleteEncryptionKey()
}
