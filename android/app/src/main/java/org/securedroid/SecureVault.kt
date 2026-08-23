package org.securedroid.vault

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class SecureVault(private val context: Context) {

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val encryptedPrefs = EncryptedSharedPreferences.create(
        context,
        "securedroid_secure_vault",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun putSecureData(key: String, value: String) {
        encryptedPrefs.edit().putString(key, value).apply()
    }

    fun getSecureData(key: String, defaultValue: String? = null): String? {
        return encryptedPrefs.getString(key, defaultValue)
    }

    fun removeSecureData(key: String) {
        encryptedPrefs.edit().remove(key).apply()
    }

    fun wipeVault() {
        encryptedPrefs.edit().clear().apply()
    }
}
