package org.securedroid.vault

import android.content.Context
import android.util.Base64
import org.securedroid.security.KeyStoreManager
import java.nio.charset.StandardCharsets
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec

class SecureVault(
    context: Context
) {

    private val keyStoreManager =
        KeyStoreManager(context.applicationContext)

    companion object {
        private const val TRANSFORMATION =
            "AES/GCM/NoPadding"

        private const val GCM_TAG_LENGTH =
            128
    }

    data class EncryptedData(
        val ciphertext: String,
        val iv: String
    )

    fun encrypt(data: String): EncryptedData {

        val key =
            keyStoreManager.getMasterKey()
                ?: throw IllegalStateException(
                    "SecureDroid master key unavailable"
                )

        val cipher =
            Cipher.getInstance(TRANSFORMATION)

        cipher.init(
            Cipher.ENCRYPT_MODE,
            key
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

        val key =
            keyStoreManager.getMasterKey()
                ?: throw IllegalStateException(
                    "SecureDroid master key unavailable"
                )

        val cipher =
            Cipher.getInstance(TRANSFORMATION)

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

        cipher.init(
            Cipher.DECRYPT_MODE,
            key,
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
        keyStoreManager.deleteKey()
    }
}
