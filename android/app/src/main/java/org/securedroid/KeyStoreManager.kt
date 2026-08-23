package org.securedroid.security

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.security.KeyStore
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey

class KeyStoreManager(
    private val context: Context
) {

    companion object {
        private const val KEYSTORE_NAME =
            "AndroidKeyStore"

        private const val MASTER_KEY_ALIAS =
            "SecureDroidMasterKey"
    }

    private val keyStore: KeyStore =
        KeyStore.getInstance(KEYSTORE_NAME).apply {
            load(null)
        }

    init {
        generateMasterKeyIfNeeded()
    }

    private fun generateMasterKeyIfNeeded() {

        if (keyStore.containsAlias(MASTER_KEY_ALIAS)) {
            return
        }

        val keyGenerator =
            KeyGenerator.getInstance(
                KeyProperties.KEY_ALGORITHM_AES,
                KEYSTORE_NAME
            )

        val parameterSpec =
            KeyGenParameterSpec.Builder(
                MASTER_KEY_ALIAS,
                KeyProperties.PURPOSE_ENCRYPT or
                    KeyProperties.PURPOSE_DECRYPT
            )
                .setBlockModes(
                    KeyProperties.BLOCK_MODE_GCM
                )
                .setEncryptionPaddings(
                    KeyProperties.ENCRYPTION_PADDING_NONE
                )
                .setKeySize(256)
                .setUserAuthenticationRequired(false)
                .build()

        keyGenerator.init(parameterSpec)
        keyGenerator.generateKey()
    }

    fun getMasterKey(): SecretKey? {

        return try {

            val entry =
                keyStore.getEntry(
                    MASTER_KEY_ALIAS,
                    null
                ) as? KeyStore.SecretKeyEntry

            entry?.secretKey

        } catch (_: Exception) {
            null
        }
    }

    fun deleteMasterKey() {

        try {
            if (keyStore.containsAlias(MASTER_KEY_ALIAS)) {
                keyStore.deleteEntry(MASTER_KEY_ALIAS)
            }
        } catch (_: Exception) {
        }
    }

    fun isHardwareBacked(): Boolean {

        return try {

            val key = getMasterKey()
                ?: return false

            val provider =
                key.javaClass
                    .getMethod("getAlgorithm")
                    .invoke(key)

            provider != null

        } catch (_: Exception) {
            false
        }
    }
}
