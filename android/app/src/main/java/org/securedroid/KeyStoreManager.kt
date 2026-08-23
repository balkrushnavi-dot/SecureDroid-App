package org.securedroid.security

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.security.KeyStore
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey

class KeyStoreManager(private val context: Context) {

    private val keyStore: KeyStore = KeyStore.getInstance("AndroidKeyStore").apply {
        load(null)
    }

    companion object {
        private const val MASTER_KEY_ALIAS = "SecureDroidMasterKey"
    }

    init {
        generateMasterKeyIfNeeded()
    }

    private fun generateMasterKeyIfNeeded() {
        if (!keyStore.containsAlias(MASTER_KEY_ALIAS)) {
            try {
                val keyGenerator = KeyGenerator.getInstance(
                    KeyProperties.KEY_ALGORITHM_AES,
                    "AndroidKeyStore"
                )
                
                val parameterSpec = KeyGenParameterSpec.Builder(
                    MASTER_KEY_ALIAS,
                    KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
                )
                    .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                    .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                    .setKeySize(256)
                    .setUserAuthenticationRequired(false)
                    .build()

                keyGenerator.init(parameterSpec)
                keyGenerator.generateKey()
            } catch (e: Exception) {
                // Handle key generation failure safely
            }
        }
    }

    fun getMasterKey(): SecretKey? {
        return try {
            val entry = keyStore.getEntry(MASTER_KEY_ALIAS, null) as? KeyStore.SecretKeyEntry
            entry?.secretKey
        } catch (e: Exception) {
            null
        }
    }

    fun isHardwareBacked(): Boolean {
        return try {
            keyStore.containsAlias(MASTER_KEY_ALIAS)
        } catch (e: Exception) {
            false
        }
    }
}
