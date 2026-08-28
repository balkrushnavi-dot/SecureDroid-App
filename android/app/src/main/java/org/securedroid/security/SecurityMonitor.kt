private fun checkHardwareBackedKeystore(): Check {
    return try {
        val alias = "securedroid_monitor_probe"

        val keyStore = KeyStore.getInstance("AndroidKeyStore")
        keyStore.load(null)

        if (keyStore.containsAlias(alias)) {
            keyStore.deleteEntry(alias)
        }

        val generator =
            KeyGenerator.getInstance(
                KeyProperties.KEY_ALGORITHM_AES,
                "AndroidKeyStore"
            )

        val spec = KeyGenParameterSpec.Builder(
            alias,
            KeyProperties.PURPOSE_ENCRYPT or
                    KeyProperties.PURPOSE_DECRYPT
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .build()

        generator.init(spec)
        generator.generateKey()

        val secretKey = keyStore.getKey(alias, null) as javax.crypto.SecretKey
        val factory = javax.crypto.SecretKeyFactory.getInstance(
            secretKey.algorithm,
            "AndroidKeyStore"
        )

        val keyInfo = factory.getKeySpec(
            secretKey,
            KeyInfo::class.java
        ) as KeyInfo

        val hardwareBacked =
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                keyInfo.securityLevel >= KeyProperties.SECURITY_LEVEL_TRUSTED_ENVIRONMENT
            } else {
                @Suppress("DEPRECATION")
                keyInfo.isInsideSecureHardware
            }

        keyStore.deleteEntry(alias)

        if (hardwareBacked) {
            Check(
                id = "hardware_backed_keystore",
                name = "Hardware-Backed Keystore",
                status = Status.VERIFIED,
                severity = Severity.INFO,
                summary = "A generated Keystore key is hardware-backed.",
                evidence = "KeyInfo reports secure hardware/security level."
            )
        } else {
            Check(
                id = "hardware_backed_keystore",
                name = "Hardware-Backed Keystore",
                status = Status.WARNING,
                severity = Severity.MEDIUM,
                summary = "The generated Keystore key is not reported as hardware-backed.",
                evidence = "KeyInfo reports software-backed protection."
            )
        }
    } catch (e: Exception) {
        Check(
            id = "hardware_backed_keystore",
            name = "Hardware-Backed Keystore",
            status = Status.UNKNOWN,
            severity = Severity.MEDIUM,
            summary = "Hardware-backed Keystore status could not be verified.",
            evidence = e.javaClass.simpleName
        )
    }
}
