package com.securedroid.app.services

import android.app.ActivityManager
import android.content.Context
import android.os.Build
import android.os.Environment
import android.os.StatFs
import android.os.SystemClock
import android.util.DisplayMetrics
import android.view.WindowManager
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import java.io.File
import java.util.*

class DeviceInfoManager(private val context: Context) {

    fun getDeviceInfo(): JSObject {
        val ret = JSObject()

        ret.put("manufacturer", Build.MANUFACTURER)
        ret.put("brand", Build.BRAND)
        ret.put("model", Build.MODEL)
        ret.put("device", Build.DEVICE)
        ret.put("product", Build.PRODUCT)
        ret.put("androidVersion", Build.VERSION.RELEASE)
        ret.put("sdkVersion", Build.VERSION.SDK_INT)
        ret.put("securityPatch", Build.VERSION.SECURITY_PATCH ?: "Unknown")
        ret.put("buildFingerprint", Build.FINGERPRINT)
        ret.put("cpuArchitecture", System.getProperty("os.arch") ?: "unknown")

        val abisArray = JSArray()
        Build.SUPPORTED_ABIS.forEach { abisArray.put(it) }
        ret.put("supportedAbis", abisArray)

        // RAM
        val actManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memInfo = ActivityManager.MemoryInfo()
        actManager.getMemoryInfo(memInfo)
        ret.put("totalRamMb", (memInfo.totalMem / (1024 * 1024)).toInt())
        ret.put("availableRamMb", (memInfo.availMem / (1024 * 1024)).toInt())

        // Storage
        val stat = StatFs(Environment.getDataDirectory().path)
        val totalStorage = stat.blockCountLong * stat.blockSizeLong
        val availStorage = stat.availableBlocksLong * stat.blockSizeLong
        ret.put("totalStorageBytes", totalStorage)
        ret.put("availableStorageBytes", availStorage)

        // Display
        val wm = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
        val metrics = DisplayMetrics()
        wm.defaultDisplay.getRealMetrics(metrics)
        ret.put("screenWidth", metrics.widthPixels)
        ret.put("screenHeight", metrics.heightPixels)
        ret.put("screenDensity", metrics.density)

        // Locale & Time
        ret.put("locale", Locale.getDefault().toLanguageTag())
        ret.put("timezone", TimeZone.getDefault().id)
        ret.put("uptimeSeconds", SystemClock.elapsedRealtime() / 1000)

        // Kernel
        val kernel = System.getProperty("os.version") ?: "Linux"
        ret.put("kernelVersion", kernel)

        // Hardware virtualization check (/dev/kvm)
        val kvmFile = File("/dev/kvm")
        ret.put("kvmVirtualizationSupported", kvmFile.exists() && kvmFile.canRead())
        ret.put("isEmulator", Build.FINGERPRINT.startsWith("generic") || Build.MODEL.contains("google_sdk") || Build.HARDWARE.contains("goldfish"))

        return ret
    }
}
