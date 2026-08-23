package org.securedroid.vault

import android.content.Context

/**
 * Persists encrypted key/value entries.
 *
 * SecureVault performs the AES-GCM encryption/decryption itself; this
 * class is only responsible for storing and retrieving the resulting
 * ciphertext+IV pairs against a caller-provided string key. Values
 * are never stored in plaintext.
 */
class VaultStorage(
    context: Context
) {

    companion object {
        private const val PREFS_NAME = "securedroid_vault_entries"
    }

    private val prefs =
        context.applicationContext.getSharedPreferences(
            PREFS_NAME,
            Context.MODE_PRIVATE
        )

    private val vault = SecureVault(context)

    fun set(key: String, value: String): Boolean {

        return try {

            val encrypted = vault.encrypt(value)

            prefs.edit()
                .putString(
                    "${key}_ct",
                    encrypted.ciphertext
                )
                .putString(
                    "${key}_iv",
                    encrypted.iv
                )
                .apply()

            true

        } catch (_: Exception) {

            false
        }
    }

    fun get(key: String): String? {

        val ciphertext =
            prefs.getString("${key}_ct", null)
                ?: return null

        val iv =
            prefs.getString("${key}_iv", null)
                ?: return null

        return try {

            vault.decrypt(
                SecureVault.EncryptedData(
                    ciphertext = ciphertext,
                    iv = iv
                )
            )

        } catch (_: Exception) {

            // Decryption failed (corrupted data, tampered ciphertext,
            // or key unavailable). Fail safe: return null, never
            // return corrupted or partial plaintext.
            null
        }
    }

    fun remove(key: String): Boolean {

        return try {

            prefs.edit()
                .remove("${key}_ct")
                .remove("${key}_iv")
                .apply()

            true

        } catch (_: Exception) {

            false
        }
    }
}
