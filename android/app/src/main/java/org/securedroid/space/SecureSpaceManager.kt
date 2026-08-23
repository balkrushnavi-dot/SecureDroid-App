package org.securedroid.space

import android.content.Context
import android.content.SharedPreferences

class SecureSpaceManager(
    context: Context
) {

    companion object {
        private const val PREFS_NAME = "securedroid_secure_space"
        private const val KEY_ENABLED = "secure_space_enabled"
    }

    private val preferences: SharedPreferences =
        context.getSharedPreferences(
            PREFS_NAME,
            Context.MODE_PRIVATE
        )

    fun isEnabled(): Boolean {
        return preferences.getBoolean(
            KEY_ENABLED,
            false
        )
    }

    fun enable(): Boolean {
        return preferences.edit()
            .putBoolean(KEY_ENABLED, true)
            .commit()
    }

    fun disable(): Boolean {
        return preferences.edit()
            .putBoolean(KEY_ENABLED, false)
            .commit()
    }

    fun toggle(): Boolean {
        val newState = !isEnabled()

        preferences.edit()
            .putBoolean(KEY_ENABLED, newState)
            .apply()

        return newState
    }
}
