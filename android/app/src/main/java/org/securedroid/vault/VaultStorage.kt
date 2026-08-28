package org.securedroid.vault

import android.content.Context
import android.content.SharedPreferences
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import android.util.Log
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

        private const val GCM_TAG_LENGTH =
            128

        private const val GCM_IV_LENGTH =
            12
    }

    private val prefs: SharedPreferences =
        context.getSharedPreferences(
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

                if (entry is KeyStore.SecretKeyEntry) {
                    return entry.secretKey
                }

                /*
                 * Alias exists but contains the wrong key type.
                 * Delete it and recreate the expected AES key.
                 */
                keyStore.deleteEntry(KEYSTORE_ALIAS)
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
                    .setKeySize(AES_KEY_SIZE)
                    .build()

            keyGenerator.init(spec)

            keyGenerator.generateKey()

        } catch (e: Exception) {
            Log.e(
                TAG,
                "Failed to get or create vault key",
                e
            )

            null
        }
    }

    private fun encrypt(
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

            val iv =
                cipher.iv

            if (iv.size != GCM_IV_LENGTH) {
                Log.e(
                    TAG,
                    "Unexpected GCM IV length: ${iv.size}"
                )

                return null
            }

            val plaintext =
                value.toByteArray(
                    Charsets.UTF_8
                )

            val ciphertext =
                cipher.doFinal(
                    plaintext
                )

            /*
             * Format:
             *
             * [12-byte IV][ciphertext + 16-byte GCM tag]
             */
            val combined =
                ByteArray(
                    iv.size + ciphertext.size
                )

            System.arraycopy(
                iv,
                0,
                combined,
                0,
                iv.size
            )

            System.arraycopy(
                ciphertext,
                0,
                combined,
                iv.size,
                ciphertext.size
            )

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

            /*
             * Minimum:
             *
             * IV (12 bytes)
             * +
             * GCM authentication tag (16 bytes)
             */
            if (combined.size <
                GCM_IV_LENGTH +
                GCM_TAG_LENGTH / 8
            ) {
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
                    GCM_TAG_LENGTH,
                    iv
                )

            cipher.init(
                Cipher.DECRYPT_MODE,
                secretKey,
                spec
            )

            val plaintext =
                cipher.doFinal(
                    ciphertext
                )

            String(
                plaintext,
                Charsets.UTF_8
            )

        } catch (e: Exception) {
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
                encrypt(value)
                    ?: return false

            /*
             * commit() is intentional here because the method returns
             * whether persistence actually succeeded.
             */
            prefs.edit()
                .putString(key, encrypted)
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

            decrypt(encrypted)

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
        return key.isNotBlank() &&
            prefs.contains(key)
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
