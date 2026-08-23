package com.securedroid.app.services

import android.app.Activity
import androidx.biometric.BiometricManager as AndroidBiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import com.getcapacitor.JSObject

class BiometricManager(private val activity: Activity?) {

    interface BiometricAuthCallback {
        fun onSuccess()
        fun onError(errorCode: Int, errString: CharSequence)
        fun onFailed()
    }

    fun isBiometricAvailable(): JSObject {
        val ret = JSObject()
        if (activity == null) {
            ret.put("isAvailable", false)
            ret.put("hardwarePresent", false)
            ret.put("enrolled", false)
            return ret
        }

        val bm = AndroidBiometricManager.from(activity)
        val canAuth = bm.canAuthenticate(AndroidBiometricManager.Authenticators.BIOMETRIC_STRONG or AndroidBiometricManager.Authenticators.DEVICE_CREDENTIAL)

        val isAvailable = canAuth == AndroidBiometricManager.BIOMETRIC_SUCCESS
        val hardwarePresent = canAuth != AndroidBiometricManager.BIOMETRIC_ERROR_NO_HARDWARE
        val enrolled = canAuth != AndroidBiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED

        ret.put("isAvailable", isAvailable)
        ret.put("biometricType", "FINGERPRINT")
        ret.put("hardwarePresent", hardwarePresent)
        ret.put("enrolled", enrolled)
        ret.put("canAuthenticateStrong", canAuth == AndroidBiometricManager.BIOMETRIC_SUCCESS)
        ret.put("canAuthenticateDeviceCredential", true)

        return ret
    }

    fun authenticate(title: String, subtitle: String?, description: String?, callback: BiometricAuthCallback) {
        val fragActivity = activity as? FragmentActivity
        if (fragActivity == null) {
            callback.onError(999, "Activity not available for BiometricPrompt")
            return
        }

        fragActivity.runOnUiThread {
            val executor = ContextCompat.getMainExecutor(fragActivity)
            val prompt = BiometricPrompt(fragActivity, executor, object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    super.onAuthenticationSucceeded(result)
                    callback.onSuccess()
                }

                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                    super.onAuthenticationError(errorCode, errString)
                    callback.onError(errorCode, errString)
                }

                override fun onAuthenticationFailed() {
                    super.onAuthenticationFailed()
                    callback.onFailed()
                }
            })

            val promptInfo = BiometricPrompt.PromptInfo.Builder()
                .setTitle(title)
                .apply {
                    if (!subtitle.isNullOrBlank()) setSubtitle(subtitle)
                    if (!description.isNullOrBlank()) setDescription(description)
                }
                .setAllowedAuthenticators(AndroidBiometricManager.Authenticators.BIOMETRIC_STRONG or AndroidBiometricManager.Authenticators.DEVICE_CREDENTIAL)
                .build()

            prompt.authenticate(promptInfo)
        }
    }
}
