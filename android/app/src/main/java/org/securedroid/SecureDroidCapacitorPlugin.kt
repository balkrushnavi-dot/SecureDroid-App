package org.securedroid

import android.util.Log
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import org.json.JSONArray
import org.securedroid.apps.AppSecurityAnalyzer
import org.securedroid.apps.InstalledAppScanner
import org.securedroid.diagnostics.HardeningAnalyzer
import org.securedroid.vpn.SecureVpnManager
import org.securedroid.vpn.VpnState
import android.content.Intent
import android.net.VpnService
import com.getcapacitor.ActivityResult
import com.getcapacitor.annotation.ActivityCallback

@CapacitorPlugin(name = "SecureDroid")
class SecureDroidCapacitorPlugin : Plugin() {

    private lateinit var appScanner: InstalledAppScanner
    private lateinit var appAnalyzer: AppSecurityAnalyzer
    private lateinit var hardeningAnalyzer: HardeningAnalyzer
    private lateinit var vpnManager: SecureVpnManager

    override fun load() {
        super.load()

        val context = bridge.context

        appScanner = InstalledAppScanner(context)
        appAnalyzer = AppSecurityAnalyzer()
        hardeningAnalyzer = HardeningAnalyzer(context)
        vpnManager = SecureVpnManager(context)

        Log.d("SecureDroid", "SecureDroid plugin loaded")
    }

    // ---------------------------------------------------------
    // CONNECTION
    // ---------------------------------------------------------

    
    
    @PluginMethod
fun startVpn(call: PluginCall) {
    try {
        val context = bridge.context

        val prepareIntent = VpnService.prepare(context)

        if (prepareIntent != null) {
            val result = JSObject()

            result.put("success", false)
            result.put("permissionRequired", true)
            result.put("state", vpnManager.getState().name)
            result.put(
                "message",
                "VPN permission is required"
            )

            call.resolve(result)
            return
        }

        val started = vpnManager.start()

        val result = JSObject()

        result.put("success", started)
        result.put("permissionRequired", false)
        result.put(
            "state",
            vpnManager.getState().name
        )

        result.put(
            "message",
            if (started) {
                "VPN connection requested"
            } else {
                "VPN could not be started"
            }
        )

        call.resolve(result)

    } catch (e: Exception) {
        Log.e(
            "SecureDroid",
            "startVpn failed",
            e
        )

        call.reject(
            "Unable to start VPN: ${e.message}",
            e
        )
    }
}
    @PluginMethod
fun requestVpnPermission(call: PluginCall) {
    try {
        val context = bridge.context

        val prepareIntent = VpnService.prepare(context)

        // VPN permission has already been granted.
        if (prepareIntent == null) {
            val result = JSObject()

            result.put("success", true)
            result.put("granted", true)
            result.put("state", vpnManager.getState().name)

            call.resolve(result)
            return
        }

        // Ask Android to display the system VPN consent dialog.
        startActivityForResult(
            call,
            prepareIntent,
            "vpnPermissionResult"
        )

    } catch (e: Exception) {
        Log.e("SecureDroid", "VPN permission request failed", e)
        call.reject(
            "Unable to request VPN permission: ${e.message}",
            e
        )
    }
}

@ActivityCallback
private fun vpnPermissionResult(
    call: PluginCall,
    result: ActivityResult
) {
    try {
        val granted = result.resultCode == android.app.Activity.RESULT_OK

        val response = JSObject()

        response.put("success", true)
        response.put("granted", granted)

        response.put(
            "state",
            vpnManager.getState().name
        )

        response.put(
            "message",
            if (granted) {
                "VPN permission granted"
            } else {
                "VPN permission denied"
            }
        )

        call.resolve(response)

    } catch (e: Exception) {
        Log.e(
            "SecureDroid",
            "VPN permission callback failed",
            e
        )

        call.reject(
            "Unable to process VPN permission result: ${e.message}",
            e
        )
    }
}
    @PluginMethod
    fun checkConnection(call: PluginCall) {
        try {
            val result = JSObject()

            result.put("connected", true)
            result.put("message", "SecureDroid native security bridge available")
            result.put("timestamp", System.currentTimeMillis())

            call.resolve(result)

        } catch (e: Exception) {
            Log.e("SecureDroid", "checkConnection failed", e)
            call.reject("Native security bridge unavailable", e)
        }
    }

    // ---------------------------------------------------------
    // INSTALLED APPLICATION INVENTORY
    // ---------------------------------------------------------

    @PluginMethod
    fun getInstalledApps(call: PluginCall) {
        try {
            val apps = appScanner.scan()
            val jsonApps = JSONArray()

            apps.forEach { app ->

                val permissions = JSONArray()

                app.requestedPermissions.forEach {
                    permissions.put(it)
                }

                val installer = app.installerPackageName

                /*
                 * IMPORTANT:
                 *
                 * null installer does NOT automatically mean malicious.
                 * It means the installer could not be positively identified.
                 *
                 * Google Play is only one known installer.
                 */

                val installSource =
                    installer ?: "UNKNOWN"

                val isKnownPlayInstall =
                    installer == "com.android.vending"

                val isSideloaded =
                    !app.isSystemApp &&
                    installer != null &&
                    !isKnownPlayInstall

                val json = JSObject()

                json.put("packageName", app.packageName)
                json.put("appName", app.appName)
                json.put("versionName", app.versionName ?: "Unknown")
                json.put("versionCode", app.versionCode)

                json.put("targetSdk", app.targetSdk)
                json.put("minSdk", app.minSdk)

                json.put("isSystemApp", app.isSystemApp)
                json.put("isEnabled", app.isEnabled)
                json.put("isLaunchable", app.isLaunchable)
                json.put("isDebuggable", app.isDebuggable)

                json.put("installTime", app.firstInstallTime)
                json.put("updateTime", app.lastUpdateTime)

                json.put("installSource", installSource)

                /*
                 * Only mark true when an actual non-Play installer
                 * has been identified.
                 *
                 * UNKNOWN installer remains false because the app
                 * cannot prove that it was sideloaded.
                 */
                json.put("isSideloaded", isSideloaded)

                json.put("installerKnown", installer != null)

                json.put("permissions", permissions)

                jsonApps.put(json)
            }

            val result = JSObject()

            result.put("success", true)
            result.put("apps", jsonApps)
            result.put("count", jsonApps.length())

            call.resolve(result)

            Log.d(
                "SecureDroid",
                "Returned ${jsonApps.length()} installed applications"
            )

        } catch (e: Exception) {

            Log.e(
                "SecureDroid",
                "getInstalledApps failed",
                e
            )

            call.reject(
                "Unable to read installed applications: ${e.message}",
                e
            )
        }
    }

    // ---------------------------------------------------------
    // APPLICATION SECURITY ANALYSIS
    // ---------------------------------------------------------

    @PluginMethod
    fun scanForRisks(call: PluginCall) {
        try {

            val apps = appScanner.scan()
            val riskDetails = JSONArray()

            apps.forEach { app ->

                val assessment =
                    appAnalyzer.analyze(app)

                /*
                 * Do not report every application as risky.
                 *
                 * Only applications with actual findings are
                 * returned here.
                 */

                if (assessment.findings.isEmpty()) {
                    return@forEach
                }

                val findings = JSONArray()

                assessment.findings.forEach { finding ->

                    val findingJson = JSObject()

                    findingJson.put(
                        "code",
                        finding.code
                    )

                    findingJson.put(
                        "title",
                        finding.title
                    )

                    findingJson.put(
                        "description",
                        finding.description
                    )

                    findingJson.put(
                        "severity",
                        finding.severity.name
                    )

                    findingJson.put(
                        "points",
                        finding.points
                    )

                    findings.put(findingJson)
                }

                val json = JSObject()

                json.put(
                    "appName",
                    assessment.appName
                )

                json.put(
                    "packageName",
                    assessment.packageName
                )

                json.put(
                    "riskLevel",
                    assessment.riskLevel.name
                )

                json.put(
                    "securityScore",
                    assessment.score
                )

                json.put(
                    "findingCount",
                    assessment.findings.size
                )

                json.put(
                    "findings",
                    findings
                )

                riskDetails.put(json)
            }

            val result = JSObject()

            result.put("success", true)
            result.put("riskDetails", riskDetails)
            result.put("totalRiskyApps", riskDetails.length())
            result.put("totalApps", apps.size)

            call.resolve(result)

            Log.d(
                "SecureDroid",
                "Analyzed ${apps.size} apps; " +
                    "${riskDetails.length()} have findings"
            )

        } catch (e: Exception) {

            Log.e(
                "SecureDroid",
                "scanForRisks failed",
                e
            )

            call.reject(
                "Application security analysis failed: ${e.message}",
                e
            )
        }
    }

    @PluginMethod
    fun getAppRiskReports(call: PluginCall) {
        scanForRisks(call)
    }

    // ---------------------------------------------------------
    // DEVICE HARDENING
    // ---------------------------------------------------------

    @PluginMethod
    fun getHardeningReport(call: PluginCall) {
        try {

            val report =
                hardeningAnalyzer.analyze()

            val findings = JSONArray()

            report.findings.forEach { finding ->

                val json = JSObject()

                json.put(
                    "id",
                    finding.id
                )

                json.put(
                    "level",
                    finding.level.name
                )

                json.put(
                    "summary",
                    finding.summary
                )

                findings.put(json)
            }

            val vpnState =
                vpnManager.getState()

            val result = JSObject()

            result.put("success", true)

            /*
             * This score comes from the actual HardeningAnalyzer.
             */
            result.put(
                "score",
                report.score
            )

            result.put(
                "findings",
                findings
            )

            /*
             * These are explicit facts, not fabricated values.
             */
            result.put(
                "vpnStatus",
                vpnState == VpnState.CONNECTED
            )

            result.put(
                "vpnState",
                vpnState.name
            )

            /*
             * Compatibility fields.
             *
             * These are derived only from findings that the analyzer
             * actually checks.
             */
            val findingIds =
                report.findings
                    .map { it.id }
                    .toSet()

            result.put(
                "screenLock",
                "NO_SCREEN_LOCK" !in findingIds &&
                    "SCREEN_LOCK_UNKNOWN" !in findingIds
            )

            result.put(
                "screenLockStatus",
                when {
                    "NO_SCREEN_LOCK" in findingIds ->
                        "FAIL"

                    "SCREEN_LOCK_UNKNOWN" in findingIds ->
                        "UNKNOWN"

                    else ->
                        "PASS"
                }
            )

            result.put(
                "usbDebugging",
                "USB_DEBUGGING_ENABLED" in findingIds
            )

            result.put(
                "developerOptions",
                "DEVELOPER_OPTIONS_ENABLED" in findingIds
            )

            result.put(
                "securityPatchStatus",
                when {
                    "STALE_SECURITY_PATCH" in findingIds ->
                        "WARNING"

                    "PATCH_DATE_UNKNOWN" in findingIds ->
                        "UNKNOWN"

                    else ->
                        "PASS"
                }
            )

            /*
             * Android 8+ does not expose one global "unknown sources"
             * switch. Therefore we deliberately return UNKNOWN there.
             */
            result.put(
                "unknownSources",
                "UNKNOWN_SOURCES_ENABLED" in findingIds
            )

            result.put(
                "unknownSourcesStatus",
                when {
                    "UNKNOWN_SOURCES_ENABLED" in findingIds ->
                        "WARNING"

                    else ->
                        "UNKNOWN"
                }
            )

            call.resolve(result)

            Log.d(
                "SecureDroid",
                "Hardening score=${report.score}, " +
                    "findings=${report.findings.size}"
            )

        } catch (e: Exception) {

            Log.e(
                "SecureDroid",
                "getHardeningReport failed",
                e
            )

            call.reject(
                "Hardening analysis failed: ${e.message}",
                e
            )
        }
    }

    // ---------------------------------------------------------
    // VPN STATUS
    // ---------------------------------------------------------

    @PluginMethod
    fun getVpnStatus(call: PluginCall) {
        try {

            val state =
                vpnManager.getState()

            val result = JSObject()

            result.put(
                "success",
                true
            )

            result.put(
                "state",
                state.name
            )

            result.put(
                "isConnected",
                state == VpnState.CONNECTED
            )

            result.put(
                "isActive",
                state == VpnState.CONNECTED
            )

            result.put(
                "message",
                when (state) {
                    VpnState.CONNECTED ->
                        "VPN protection is active"

                    VpnState.CONNECTING ->
                        "VPN protection is connecting"

                    VpnState.DISCONNECTING ->
                        "VPN protection is disconnecting"

                    VpnState.ERROR ->
                        "VPN protection encountered an error"

                    VpnState.DISCONNECTED ->
                        "VPN protection is disconnected"
                }
            )

            call.resolve(result)

        } catch (e: Exception) {

            Log.e(
                "SecureDroid",
                "getVpnStatus failed",
                e
            )

            call.reject(
                "Unable to determine VPN state: ${e.message}",
                e
            )
        }
    }

    // ---------------------------------------------------------
    // VPN START
    // ---------------------------------------------------------

    @PluginMethod
    fun startVpn(call: PluginCall) {

        try {

            val context = bridge.context

            /*
             * Android requires explicit user authorization before
             * an application can establish its VPN interface.
             *
             * Never report success before this permission exists.
             */
            val prepareIntent =
                VpnService.prepare(context)

            if (prepareIntent != null) {

                val result = JSObject()

                result.put(
                    "success",
                    false
                )

                result.put(
                    "permissionRequired",
                    true
                )

                result.put(
                    "state",
                    vpnManager.getState().name
                )

                result.put(
                    "message",
                    "VPN permission is required"
                )

                /*
                 * Do not claim that the VPN has started.
                 *
                 * The UI must send the user through the Android
                 * VPN permission flow first.
                 */
                call.resolve(result)
                return

            }

            val started =
                vpnManager.start()

            val state =
                vpnManager.getState()

            val result = JSObject()

            result.put(
                "success",
                started
            )

            result.put(
                "permissionRequired",
                false
            )

            result.put(
                "state",
                state.name
            )

            result.put(
                "message",
                if (started) {
                    "VPN start requested; waiting for connection"
                } else {
                    "VPN could not be started"
                }
            )

            call.resolve(result)

        } catch (e: Exception) {

            Log.e(
                "SecureDroid",
                "startVpn failed",
                e
            )

            call.reject(
                "Unable to start VPN: ${e.message}",
                e
            )
        }
    }

    // ---------------------------------------------------------
    // VPN STOP
    // ---------------------------------------------------------

    @PluginMethod
    fun stopVpn(call: PluginCall) {

        try {

            vpnManager.stop()

            val result = JSObject()

            result.put(
                "success",
                true
            )

            result.put(
                "state",
                vpnManager.getState().name
            )

            result.put(
                "message",
                "VPN stop requested"
            )

            call.resolve(result)

        } catch (e: Exception) {

            Log.e(
                "SecureDroid",
                "stopVpn failed",
                e
            )

            call.reject(
                "Unable to stop VPN: ${e.message}",
                e
            )
        }
    }
}
