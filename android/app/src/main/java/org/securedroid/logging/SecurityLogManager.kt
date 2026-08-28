package org.securedroid.logging

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.locks.ReentrantLock
import kotlin.concurrent.withLock

class SecurityLogManager(
    context: Context
) {

    companion object {
        private const val PREFS_NAME =
            "securedroid_security_log"

        private const val EVENTS_KEY =
            "events"

        private const val MAX_EVENTS =
            1000
    }

    private val prefs: SharedPreferences =
        context.getSharedPreferences(
            PREFS_NAME,
            Context.MODE_PRIVATE
        )

    private val lock =
        ReentrantLock()

    fun logEvent(
        event: SecurityEvent
    ): Boolean {
        return lock.withLock {
            try {
                val events =
                    getEventsInternal()

                events.put(
                    eventToJson(event)
                )

                while (
                    events.length() > MAX_EVENTS
                ) {
                    events.remove(0)
                }

                prefs.edit()
                    .putString(
                        EVENTS_KEY,
                        events.toString()
                    )
                    .commit()

            } catch (_: Exception) {
                false
            }
        }
    }

    fun getEvents(
        limit: Int,
        category: String?
    ): List<SecurityEvent> {
        if (limit <= 0) {
            return emptyList()
        }

        return lock.withLock {
            try {
                val events =
                    getEventsInternal()

                val result =
                    mutableListOf<SecurityEvent>()

                for (
                    index in
                    events.length() - 1 downTo 0
                ) {
                    val json =
                        events.optJSONObject(index)
                            ?: continue

                    val eventCategory =
                        json.optString(
                            "category",
                            ""
                        )

                    if (
                        category == null ||
                        eventCategory == category
                    ) {
                        jsonToEvent(
                            json
                        )?.let {
                            result.add(it)
                        }
                    }

                    if (
                        result.size >= limit
                    ) {
                        break
                    }
                }

                result

            } catch (_: Exception) {
                emptyList()
            }
        }
    }

    fun clearAll(): Boolean {
        return lock.withLock {
            try {
                prefs.edit()
                    .remove(EVENTS_KEY)
                    .commit()

            } catch (_: Exception) {
                false
            }
        }
    }

    private fun getEventsInternal(): JSONArray {
        val jsonString =
            prefs.getString(
                EVENTS_KEY,
                "[]"
            ) ?: "[]"

        return try {
            JSONArray(jsonString)
        } catch (_: Exception) {
            JSONArray()
        }
    }

    private fun eventToJson(
        event: SecurityEvent
    ): JSONObject {
        return JSONObject().apply {
            put("id", event.id)
            put("timestamp", event.timestamp)
            put("category", event.category)
            put("severity", event.severity)
            put("description", event.description)
            put("source", event.source)
        }
    }

    private fun jsonToEvent(
        json: JSONObject
    ): SecurityEvent? {
        return try {
            SecurityEvent(
                id = json.getString("id"),
                timestamp = json.getLong("timestamp"),
                category = json.getString("category"),
                severity = json.getString("severity"),
                description = json.getString("description"),
                source = json.getString("source")
            )
        } catch (_: Exception) {
            null
        }
    }
}
