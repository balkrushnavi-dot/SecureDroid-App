package org.securedroid.logging

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray
import org.json.JSONObject

class SecurityLogManager(
    private val context: Context
) {

    private val prefs: SharedPreferences = context.getSharedPreferences(
        "securedroid_security_log",
        Context.MODE_PRIVATE
    )

    private val MAX_EVENTS = 1000

    fun logEvent(event: SecurityEvent): Boolean {
        return try {
            val events = getEventsInternal()
            events.put(eventToJson(event))

            // Keep only the most recent MAX_EVENTS
            while (events.length() > MAX_EVENTS) {
                events.remove(0)
            }

            prefs.edit().putString("events", events.toString()).apply()
            true

        } catch (_: Exception) {
            false
        }
    }

    fun getEvents(limit: Int, category: String?): List<SecurityEvent> {
        return try {
            val events = getEventsInternal()
            val result = mutableListOf<SecurityEvent>()

            // Iterate in reverse (newest first)
            for (i in (events.length() - 1) downTo 0) {
                val json = events.getJSONObject(i)
                val eventCategory = json.getString("category")

                if (category == null || eventCategory == category) {
                    result.add(jsonToEvent(json))
                }

                if (result.size >= limit) break
            }

            result

        } catch (_: Exception) {
            emptyList()
        }
    }

    fun clearAll(): Boolean {
        return try {
            prefs.edit().remove("events").apply()
            true
        } catch (_: Exception) {
            false
        }
    }

    private fun getEventsInternal(): JSONArray {
        val jsonString = prefs.getString("events", "[]") ?: "[]"
        return try {
            JSONArray(jsonString)
        } catch (_: Exception) {
            JSONArray()
        }
    }

    private fun eventToJson(event: SecurityEvent): JSONObject {
        return JSONObject().apply {
            put("id", event.id)
            put("timestamp", event.timestamp)
            put("category", event.category)
            put("severity", event.severity)
            put("description", event.description)
            put("source", event.source)
        }
    }

    private fun jsonToEvent(json: JSONObject): SecurityEvent {
        return SecurityEvent(
            id = json.getString("id"),
            timestamp = json.getLong("timestamp"),
            category = json.getString("category"),
            severity = json.getString("severity"),
            description = json.getString("description"),
            source = json.getString("source")
        )
    }
}
