package com.securedroid.app.services

import android.app.Activity
import androidx.biometric.BiometricManager as AndroidBiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import com.getcapacitor.JSObject

class BiometricManager(
    private val activity: Activity?
) {

    interface BiometricAuthCallback {
        fun onSuccess()
        fun onError(
            errorCode: Int,
            errString: CharSequence
        )
        fun onFailed()
    }

    fun isBiometricAvailable(): JSObject {
        val result = JSObject()

        val currentActivity = activity

        if (currentActivity == null) {
            result.put("isAvailable", false)
            result.put("hardwarePresent", false)
            result.put("enrolled", false)
            result.put("canAuthenticateStrong", false)
            result.put("canAuthenticateDeviceCredential", false)
            return result
        }

        val biometricManager =
            AndroidBiometricManager.from(currentActivity)

        val authenticators =
            AndroidBiometricManager.Authenticators.BIOMETRIC_STRONG or
                AndroidBiometricManager.Authenticators.DEVICE_CREDENTIAL

        val authenticationStatus =
            biometricManager.canAuthenticate(authenticators)

        val hardwarePresent =
            authenticationStatus !=
                AndroidBiometricManager.BIOMETRIC_ERROR_NO_HARDWARE

        val enrolled =
            authenticationStatus !=
                AndroidBiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED

        val available =
            authenticationStatus ==
                AndroidBiometricManager.BIOMETRIC_SUCCESS

        result.put("isAvailable", available)
        result.put("hardwarePresent", hardwarePresent)
        result.put("enrolled", enrolled)
        result.put("canAuthenticateStrong", available)
        result.put("canAuthenticateDeviceCredential", available)

        return result
    }

    fun authenticate(
        title: String,
        subtitle: String?,
        description: String?,
        callback: BiometricAuthCallback
    ) {
        val fragmentActivity =
            activity as? FragmentActivity

        if (fragmentActivity == null) {
            callback.onError(
                ERROR_ACTIVITY_UNAVAILABLE,
                "Activity is not available for biometric authentication."
            )
            return
        }

        fragmentActivity.runOnUiThread {
            try {
                val executor =
                    ContextCompat.getMainExecutor(fragmentActivity)

                val authenticationCallback =
                    object : BiometricPrompt.AuthenticationCallback() {

                        override fun onAuthenticationSucceeded(
                            result: BiometricPrompt.AuthenticationResult
                        ) {
                            super.onAuthenticationSucceeded(result)
                            callback.onSuccess()
                        }

                        override fun onAuthenticationError(
                            errorCode: Int,
                            errString: CharSequence
                        ) {
                            super.onAuthenticationError(
                                errorCode,
                                errString
                            )

                            callback.onError(
                                errorCode,
                                errString
                            )
                        }

                        override fun onAuthenticationFailed() {
                            super.onAuthenticationFailed()
                            callback.onFailed()
                        }
                    }

                val prompt =
                    BiometricPrompt(
                        fragmentActivity,
                        executor,
                        authenticationCallback
                    )

                val promptInfo =
                    BiometricPrompt.PromptInfo.Builder()
                        .setTitle(
                            title.ifBlank {
                                "SecureDroid Authentication"
                            }
                        )
                        .apply {
                            if (!subtitle.isNullOrBlank()) {
                                setSubtitle(subtitle)
                            }

                            if (!description.isNullOrBlank()) {
                                setDescription(description)
                            }
                        }
                        .setAllowedAuthenticators(
                            AndroidBiometricManager.Authenticators.BIOMETRIC_STRONG or
                                AndroidBiometricManager.Authenticators.DEVICE_CREDENTIAL
                        )
                        .build()

                prompt.authenticate(promptInfo)

            } catch (exception: Exception) {
                callback.onError(
                    ERROR_AUTHENTICATION_EXCEPTION,
                    exception.message
                        ?: "Biometric authentication could not be started."
                )
            }
        }
    }

    companion object {
        private const val ERROR_ACTIVITY_UNAVAILABLE = 999
        private const val ERROR_AUTHENTICATION_EXCEPTION = 998
    }
}
