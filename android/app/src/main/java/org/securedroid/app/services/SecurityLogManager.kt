package com.securedroid.app.services

import android.content.Context
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

class SecurityLogManager(private val context: Context) {

    private val prefs by lazy {
        context.getSharedPreferences(
            "securedroid_security_events",
            Context.MODE_PRIVATE
        )
    }

    private val gson = Gson()

    fun logEvent(
        category: String,
        severity: String,
        description: String,
        source: String
    ): JSObject {

        val eventId = "evt_${System.currentTimeMillis()}"
        val timestamp = System.currentTimeMillis()

        val event = JSObject().apply {
            put("id", eventId)
            put("timestamp", timestamp)
            put("category", category)
            put("severity", severity)
            put("description", description)
            put("source", source)
        }

        val raw = prefs.getString("events", "[]") ?: "[]"

        val type = object :
            TypeToken<ArrayList<Map<String, Any?>>>() {}.type

        val list: ArrayList<Map<String, Any?>> =
            gson.fromJson(raw, type) ?: ArrayList()

        val map = HashMap<String, Any?>()

        map["id"] = eventId
        map["timestamp"] = timestamp
        map["category"] = category
        map["severity"] = severity
        map["description"] = description
        map["source"] = source

        list.add(0, map)

        if (list.size > 200) {
            list.removeAt(list.size - 1)
        }

        prefs.edit()
            .putString("events", gson.toJson(list))
            .apply()

        return event
    }

    fun getLogs(limit: Int): JSArray {

        val ret = JSArray()

        val raw = prefs.getString("events", "[]") ?: "[]"

        val type = object :
            TypeToken<ArrayList<Map<String, Any?>>>() {}.type

        val list: ArrayList<Map<String, Any?>> =
            gson.fromJson(raw, type) ?: ArrayList()

        val takeCount = minOf(limit.coerceAtLeast(0), list.size)

        for (i in 0 until takeCount) {
            val item = list[i]
            val obj = JSObject()

            item.forEach { (key, value) ->
                obj.put(key, value)
            }

            ret.put(obj)
        }

        return ret
    }
}
