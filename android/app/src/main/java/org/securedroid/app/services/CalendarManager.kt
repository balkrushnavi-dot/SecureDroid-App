package com.securedroid.app.services

import android.content.Context
import android.database.Cursor
import android.provider.CalendarContract
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject

class CalendarManager(private val context: Context) {

    fun getCalendarEvents(): JSArray {
        val ret = JSArray()
        try {
            val projection = arrayOf(
                CalendarContract.Events._ID,
                CalendarContract.Events.TITLE,
                CalendarContract.Events.DESCRIPTION,
                CalendarContract.Events.DTSTART,
                CalendarContract.Events.DTEND,
                CalendarContract.Events.ALL_DAY,
                CalendarContract.Events.EVENT_LOCATION
            )
            val cursor: Cursor? = context.contentResolver.query(
                CalendarContract.Events.CONTENT_URI,
                projection,
                null,
                null,
                "${CalendarContract.Events.DTSTART} DESC LIMIT 50"
            )

            cursor?.use {
                val idIdx = it.getColumnIndex(CalendarContract.Events._ID)
                val titleIdx = it.getColumnIndex(CalendarContract.Events.TITLE)
                val descIdx = it.getColumnIndex(CalendarContract.Events.DESCRIPTION)
                val startIdx = it.getColumnIndex(CalendarContract.Events.DTSTART)
                val endIdx = it.getColumnIndex(CalendarContract.Events.DTEND)
                val allDayIdx = it.getColumnIndex(CalendarContract.Events.ALL_DAY)
                val locIdx = it.getColumnIndex(CalendarContract.Events.EVENT_LOCATION)

                while (it.moveToNext()) {
                    val obj = JSObject()
                    obj.put("id", it.getString(idIdx))
                    obj.put("title", it.getString(titleIdx) ?: "Untitled Event")
                    obj.put("description", it.getString(descIdx) ?: "")
                    obj.put("startTime", it.getLong(startIdx))
                    obj.put("endTime", it.getLong(endIdx))
                    obj.put("allDay", it.getInt(allDayIdx) == 1)
                    obj.put("location", it.getString(locIdx) ?: "")
                    ret.put(obj)
                }
            }
        } catch (e: Exception) {
            // Permission not granted or query failed
        }
        return ret
    }
}
