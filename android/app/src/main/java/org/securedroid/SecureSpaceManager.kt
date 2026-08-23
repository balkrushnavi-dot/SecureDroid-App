package org.securedroid.space

import android.content.Context
import org.securedroid.vault.SecureVault

class SecureSpaceManager(context: Context) {

    private val secureVault = SecureVault(context)

    companion object {
        private const val KEY_SPACE_LOCKED = "secure_space_locked_state"
        private const val KEY_LAST_UNLOCK_TIME = "secure_space_last_unlock"
    }

    var isLocked: Boolean
        get() {
            val state = secureVault.getSecureData(KEY_SPACE_LOCKED, "true")
            return state.toBoolean()
        }
        set(locked) {
            secureVault.putSecureData(KEY_SPACE_LOCKED, locked.toString())
            if (!locked) {
                secureVault.putSecureData(KEY_LAST_UNLOCK_TIME, System.currentTimeMillis().toString())
            }
        }

    fun unlockSpace(): Boolean {
        isLocked = false
        return true
    }

    fun lockSpace() {
        isLocked = true
    }

    fun wipeSpace() {
        secureVault.wipeVault()
        isLocked = true
    }
}

