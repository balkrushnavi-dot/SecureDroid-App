package org.securedroid.space

import android.content.Context
import android.content.SharedPreferences

class SecureSpaceManager(
    context: Context
) {

    companion object {
        private const val PREFS_NAME = "securedroid_space"
        private const val KEY_ENABLED = "space_enabled"
    }

    private val preferences: SharedPreferences =
        context.getSharedPreferences(
            PREFS_NAME,
            Context.MODE_PRIVATE
        )

    fun isEnabled(): Boolean {
        return preferences.getBoolean(KEY_ENABLED, false)
    }

    fun enable(): Boolean {
        preferences.edit()
            .putBoolean(KEY_ENABLED, true)
            .apply()

        return true
    }

    fun disable(): Boolean {
        preferences.edit()
            .putBoolean(KEY_ENABLED, false)
            .apply()

        return true
    }

    fun setEnabled(enabled: Boolean): Boolean {
        preferences.edit()
            .putBoolean(KEY_ENABLED, enabled)
            .apply()

        return true
    }

    fun toggle(): Boolean {
        return setEnabled(!isEnabled())
    }

    fun clear() {
        preferences.edit()
            .clear()
            .apply()
    }
}
