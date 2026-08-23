package org.securedroid.vault

import android.util.Base64
import java.nio.charset.StandardCharsets
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import org.securedroid.security.KeyStoreManager

class SecureVault(
    private val keyStoreManager: KeyStoreManager
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

        val secretKey =
            keyStoreManager.getMasterKey()
                ?: throw IllegalStateException(
                    "SecureDroid master key is unavailable"
                )

        val cipher =
            Cipher.getInstance(TRANSFORMATION)

        cipher.init(
            Cipher.ENCRYPT_MODE,
            secretKey
        )

        val encryptedBytes =
            cipher.doFinal(
                data.toByteArray(StandardCharsets.UTF_8)
            )

        return EncryptedData(
            ciphertext =
                Base64.encodeToString(
                    encryptedBytes,
                    Base64.NO_WRAP
                ),

            iv =
                Base64.encodeToString(
                    cipher.iv,
                    Base64.NO_WRAP
                )
        )
    }

    fun decrypt(
        encryptedData: EncryptedData
    ): String {

        val secretKey =
            keyStoreManager.getMasterKey()
                ?: throw IllegalStateException(
                    "SecureDroid master key is unavailable"
                )

        val iv =
            Base64.decode(
                encryptedData.iv,
                Base64.NO_WRAP
            )

        val ciphertext =
            Base64.decode(
                encryptedData.ciphertext,
                Base64.NO_WRAP
            )

        val cipher =
            Cipher.getInstance(TRANSFORMATION)

        cipher.init(
            Cipher.DECRYPT_MODE,
            secretKey,
            GCMParameterSpec(
                GCM_TAG_LENGTH,
                iv
            )
        )

        val decryptedBytes =
            cipher.doFinal(ciphertext)

        return String(
            decryptedBytes,
            StandardCharsets.UTF_8
        )
    }

    fun deleteEncryptionKey() {
        keyStoreManager.deleteMasterKey()
    }
}
