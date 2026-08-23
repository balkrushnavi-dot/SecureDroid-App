package org.securedroid.vault

import android.util.Base64
import java.nio.charset.StandardCharsets
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKey

class SecureVault(
    private val keyStoreManager: KeyStoreManager = KeyStoreManager()
) {

    companion object {
        private const val TRANSFORMATION = "AES/GCM/NoPadding"
        private const val GCM_TAG_LENGTH = 128
    }

    data class EncryptedData(
        val ciphertext: String,
        val iv: String
    )

    fun encrypt(data: String): EncryptedData {
        val cipher = Cipher.getInstance(TRANSFORMATION)

        cipher.init(
            Cipher.ENCRYPT_MODE,
            keyStoreManager.getOrCreateKey()
        )

        val encryptedBytes = cipher.doFinal(
            data.toByteArray(StandardCharsets.UTF_8)
        )

        return EncryptedData(
            ciphertext = Base64.encodeToString(
                encryptedBytes,
                Base64.NO_WRAP
            ),
            iv = Base64.encodeToString(
                cipher.iv,
                Base64.NO_WRAP
            )
        )
    }

    fun decrypt(encryptedData: EncryptedData): String {
        val cipher = Cipher.getInstance(TRANSFORMATION)

        val iv = Base64.decode(
            encryptedData.iv,
            Base64.NO_WRAP
        )

        val ciphertext = Base64.decode(
            encryptedData.ciphertext,
            Base64.NO_WRAP
        )

        cipher.init(
            Cipher.DECRYPT_MODE,
            keyStoreManager.getOrCreateKey(),
            GCMParameterSpec(GCM_TAG_LENGTH, iv)
        )

        val decryptedBytes = cipher.doFinal(ciphertext)

        return String(
            decryptedBytes,
            StandardCharsets.UTF_8
        )
    }

    fun deleteEncryptionKey() {
        keyStoreManager.deleteKey()
    }
}
