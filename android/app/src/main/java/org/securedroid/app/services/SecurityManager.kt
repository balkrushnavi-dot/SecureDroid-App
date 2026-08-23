package com.securedroid.app.services

import android.content.Context
import android.os.Build
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import java.io.File

class SecurityManager(private val context: Context) {

    fun getVmHardwareCapability(): JSObject {
        val ret = JSObject()
        val kvm = File("/dev/kvm")
        val kvmAccessible = kvm.exists() && kvm.canRead() && kvm.canWrite()

        val pkvmSupported = Build.VERSION.SDK_INT >= 33 && (Build.SUPPORTED_ABIS.contains("arm64-v8a"))

        val isSupported = kvmAccessible || pkvmSupported
        val backend = when {
            kvmAccessible -> "KVM_DEVICE"
            pkvmSupported -> "ARM_PKVM"
            else -> "RESTRICTED_SANDBOX"
        }

        ret.put("isSupported", isSupported)
        ret.put("backendType", backend)
        ret.put("kvmNodeAccessible", kvmAccessible)

        val archs = JSArray()
        archs.put("aarch64")
        archs.put("x86_64")
        ret.put("supportedGuestArchitectures", archs)

        val notice = if (isSupported) {
            "Protected Kernel-based Virtualization Machine (pKVM) backend interface discovered."
        } else {
            "Hardware hypervisor node (/dev/kvm) is restricted on standard Android unrooted kernels. VM operates in user-space isolation."
        }
        ret.put("limitationNotice", notice)

        return ret
    }
}
