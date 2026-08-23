package com.securedroid.app.services

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import java.lang.Exception

class SecureStorageManager(private val context: Context) {

    private val sharedPreferences by lazy {
        try {
            val masterKey = MasterKey.Builder(context)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build()

            EncryptedSharedPreferences.create(
                context,
                "securedroid_keystore_prefs",
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            )
        } catch (e: Exception) {
            context.getSharedPreferences("securedroid_fallback_prefs", Context.MODE_PRIVATE)
        }
    }

    fun set(key: String, value: String): Boolean {
        return try {
            sharedPreferences.edit().putString(key, value).commit()
        } catch (e: Exception) {
            false
        }
    }

    fun get(key: String): String? {
        return try {
            sharedPreferences.getString(key, null)
        } catch (e: Exception) {
            null
        }
    }

    fun remove(key: String): Boolean {
        return try {
            sharedPreferences.edit().remove(key).commit()
        } catch (e: Exception) {
            false
        }
    }
}
