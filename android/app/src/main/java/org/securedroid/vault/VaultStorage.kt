package org.securedroid.vault

import android.content.Context
import android.content.SharedPreferences
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import android.util.Log
import java.nio.ByteBuffer
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

class VaultStorage(
    context: Context
) {

    companion object {
        private const val TAG = "VaultStorage"

        private const val PREFS_NAME =
            "securedroid_vault"

        private const val KEYSTORE_ALIAS =
            "securedroid_vault_key"

        private const val ANDROID_KEYSTORE =
            "AndroidKeyStore"

        private const val TRANSFORMATION =
            "AES/GCM/NoPadding"

        private const val AES_KEY_SIZE =
            256

        private const val GCM_TAG_LENGTH_BITS =
            128

        private const val GCM_IV_LENGTH =
            12

        private const val MIN_ENCRYPTED_LENGTH =
            GCM_IV_LENGTH + 16 // minimum 128-bit GCM tag
    }

    private val prefs: SharedPreferences =
        context.applicationContext.getSharedPreferences(
            PREFS_NAME,
            Context.MODE_PRIVATE
        )

    private fun getOrCreateSecretKey(): SecretKey? {
        return try {
            val keyStore =
                KeyStore.getInstance(
                    ANDROID_KEYSTORE
                )

            keyStore.load(null)

            if (keyStore.containsAlias(KEYSTORE_ALIAS)) {
                val entry =
                    keyStore.getEntry(
                        KEYSTORE_ALIAS,
                        null
                    )

                return (
                    entry as? KeyStore.SecretKeyEntry
                    )?.secretKey
            }

            val keyGenerator =
                KeyGenerator.getInstance(
                    KeyProperties.KEY_ALGORITHM_AES,
                    ANDROID_KEYSTORE
                )

            val spec =
                KeyGenParameterSpec.Builder(
                    KEYSTORE_ALIAS,
                    KeyProperties.PURPOSE_ENCRYPT or
                        KeyProperties.PURPOSE_DECRYPT
                )
                    .setBlockModes(
                        KeyProperties.BLOCK_MODE_GCM
                    )
                    .setEncryptionPaddings(
                        KeyProperties.ENCRYPTION_PADDING_NONE
                    )
                    .setKeySize(
                        AES_KEY_SIZE
                    )
                    .build()

            keyGenerator.init(spec)

            keyGenerator.generateKey()
        } catch (e: Exception) {
            Log.e(
                TAG,
                "Unable to access Android Keystore",
                e
            )

            null
        }
    }

    private fun encrypt(
        key: String,
        value: String
    ): String? {
        return try {
            val secretKey =
                getOrCreateSecretKey()
                    ?: return null

            val cipher =
                Cipher.getInstance(
                    TRANSFORMATION
                )

            cipher.init(
                Cipher.ENCRYPT_MODE,
                secretKey
            )

            /*
             * Bind ciphertext to its logical vault key.
             * This prevents a valid ciphertext from one vault
             * entry being silently reused under another key.
             */
            cipher.updateAAD(
                key.toByteArray(
                    Charsets.UTF_8
                )
            )

            val ciphertext =
                cipher.doFinal(
                    value.toByteArray(
                        Charsets.UTF_8
                    )
                )

            val iv =
                cipher.iv

            if (iv.size != GCM_IV_LENGTH) {
                return null
            }

            val combined =
                ByteBuffer
                    .allocate(
                        iv.size + ciphertext.size
                    )
                    .put(iv)
                    .put(ciphertext)
                    .array()

            Base64.encodeToString(
                combined,
                Base64.NO_WRAP
            )
        } catch (e: Exception) {
            Log.e(
                TAG,
                "Encryption failed",
                e
            )

            null
        }
    }

    private fun decrypt(
        key: String,
        encrypted: String
    ): String? {
        return try {
            val secretKey =
                getOrCreateSecretKey()
                    ?: return null

            val combined =
                Base64.decode(
                    encrypted,
                    Base64.NO_WRAP
                )

            if (combined.size < MIN_ENCRYPTED_LENGTH) {
                return null
            }

            val iv =
                combined.copyOfRange(
                    0,
                    GCM_IV_LENGTH
                )

            val ciphertext =
                combined.copyOfRange(
                    GCM_IV_LENGTH,
                    combined.size
                )

            val cipher =
                Cipher.getInstance(
                    TRANSFORMATION
                )

            val spec =
                GCMParameterSpec(
                    GCM_TAG_LENGTH_BITS,
                    iv
                )

            cipher.init(
                Cipher.DECRYPT_MODE,
                secretKey,
                spec
            )

            cipher.updateAAD(
                key.toByteArray(
                    Charsets.UTF_8
                )
            )

            val plaintext =
                cipher.doFinal(ciphertext)

            String(
                plaintext,
                Charsets.UTF_8
            )
        } catch (e: Exception) {
            /*
             * Includes authentication failure and malformed
             * ciphertext. Do not expose plaintext or crypto
             * internals to the caller.
             */
            Log.e(
                TAG,
                "Decryption failed",
                e
            )

            null
        }
    }

    fun set(
        key: String,
        value: String
    ): Boolean {
        if (key.isBlank()) {
            return false
        }

        return try {
            val encrypted =
                encrypt(
                    key,
                    value
                ) ?: return false

            prefs.edit()
                .putString(
                    key,
                    encrypted
                )
                .commit()
        } catch (e: Exception) {
            Log.e(
                TAG,
                "Failed to store vault value",
                e
            )

            false
        }
    }

    fun get(
        key: String
    ): String? {
        if (key.isBlank()) {
            return null
        }

        return try {
            val encrypted =
                prefs.getString(
                    key,
                    null
                ) ?: return null

            decrypt(
                key,
                encrypted
            )
        } catch (e: Exception) {
            Log.e(
                TAG,
                "Failed to retrieve vault value",
                e
            )

            null
        }
    }

    fun remove(
        key: String
    ): Boolean {
        if (key.isBlank()) {
            return false
        }

        return try {
            prefs.edit()
                .remove(key)
                .commit()
        } catch (e: Exception) {
            Log.e(
                TAG,
                "Failed to remove vault value",
                e
            )

            false
        }
    }

    fun contains(
        key: String
    ): Boolean {
        if (key.isBlank()) {
            return false
        }

        return prefs.contains(key)
    }

    fun clearAll(): Boolean {
        return try {
            prefs.edit()
                .clear()
                .commit()
        } catch (e: Exception) {
            Log.e(
                TAG,
                "Failed to clear vault",
                e
            )

            false
        }
    }
}
