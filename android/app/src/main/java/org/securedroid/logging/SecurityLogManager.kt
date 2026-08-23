package org.securedroid.logging

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * Structured security event log.
 *
 * Per project policy, logs must never contain encryption keys,
 * passwords, authentication tokens, private user data, VPN
 * credentials, or sensitive network information. Callers are
 * responsible for ensuring the description/metadata they pass in
 * do not contain any of the above; this class does not attempt to
 * scrub content, it only persists and retrieves it safely.
 */
class SecurityLogManager(
    context: Context
) {

    companion object {
        private const val PREFS_NAME = "securedroid_security_events"
        private const val KEY_EVENTS = "events"
        private const val MAX_EVENTS = 500
    }

    private val prefs =
        context.applicationContext.getSharedPreferences(
            PREFS_NAME,
            Context.MODE_PRIVATE
        )

    private val gson = Gson()

    @Synchronized
    fun logEvent(event: SecurityEvent): Boolean {

        return try {

            val events = readAll().toMutableList()

            events.add(0, event)

            val trimmed =
                if (events.size > MAX_EVENTS) {
                    events.subList(0, MAX_EVENTS)
                } else {
                    events
                }

            prefs.edit()
                .putString(KEY_EVENTS, gson.toJson(trimmed))
                .apply()

            true

        } catch (_: Exception) {

            false
        }
    }

    @Synchronized
    fun getEvents(
        limit: Int = 50,
        category: String? = null
    ): List<SecurityEvent> {

        val all = readAll()

        val filtered =
            if (category != null) {
                all.filter { it.category == category }
            } else {
                all
            }

        return filtered.take(limit)
    }

    private fun readAll(): List<SecurityEvent> {

        val raw =
            prefs.getString(KEY_EVENTS, null)
                ?: return emptyList()

        return try {

            val type =
                object : TypeToken<List<SecurityEvent>>() {}.type

            gson.fromJson(raw, type) ?: emptyList()

        } catch (_: Exception) {

            // Corrupted log storage. Fail safe: return empty rather
            // than crash or return partial/garbage data.
            emptyList()
        }
    }
}
