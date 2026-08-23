package com.securedroid.app.services

import android.content.Context
import android.provider.CalendarContract
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject

class CalendarManager(
    private val context: Context
) {

    fun getCalendarEvents(): JSArray {
        val result = JSArray()

        val projection = arrayOf(
            CalendarContract.Events._ID,
            CalendarContract.Events.TITLE,
            CalendarContract.Events.DESCRIPTION,
            CalendarContract.Events.DTSTART,
            CalendarContract.Events.DTEND,
            CalendarContract.Events.ALL_DAY,
            CalendarContract.Events.EVENT_LOCATION
        )

        val uri = CalendarContract.Events.CONTENT_URI
            .buildUpon()
            .appendQueryParameter("limit", "50")
            .build()

        try {
            context.contentResolver.query(
                uri,
                projection,
                null,
                null,
                "${CalendarContract.Events.DTSTART} DESC"
            )?.use { cursor ->

                val idIndex =
                    cursor.getColumnIndex(CalendarContract.Events._ID)

                val titleIndex =
                    cursor.getColumnIndex(CalendarContract.Events.TITLE)

                val descriptionIndex =
                    cursor.getColumnIndex(CalendarContract.Events.DESCRIPTION)

                val startIndex =
                    cursor.getColumnIndex(CalendarContract.Events.DTSTART)

                val endIndex =
                    cursor.getColumnIndex(CalendarContract.Events.DTEND)

                val allDayIndex =
                    cursor.getColumnIndex(CalendarContract.Events.ALL_DAY)

                val locationIndex =
                    cursor.getColumnIndex(CalendarContract.Events.EVENT_LOCATION)

                while (cursor.moveToNext()) {
                    val event = JSObject()

                    if (idIndex >= 0) {
                        event.put(
                            "id",
                            cursor.getString(idIndex)
                        )
                    }

                    event.put(
                        "title",
                        if (titleIndex >= 0) {
                            cursor.getString(titleIndex) ?: "Untitled Event"
                        } else {
                            "Untitled Event"
                        }
                    )

                    event.put(
                        "description",
                        if (descriptionIndex >= 0) {
                            cursor.getString(descriptionIndex) ?: ""
                        } else {
                            ""
                        }
                    )

                    event.put(
                        "startTime",
                        if (startIndex >= 0) {
                            cursor.getLong(startIndex)
                        } else {
                            0L
                        }
                    )

                    event.put(
                        "endTime",
                        if (endIndex >= 0) {
                            cursor.getLong(endIndex)
                        } else {
                            0L
                        }
                    )

                    event.put(
                        "allDay",
                        allDayIndex >= 0 &&
                            cursor.getInt(allDayIndex) == 1
                    )

                    event.put(
                        "location",
                        if (locationIndex >= 0) {
                            cursor.getString(locationIndex) ?: ""
                        } else {
                            ""
                        }
                    )

                    result.put(event)
                }
            }
        } catch (_: SecurityException) {
            // Calendar permission not granted.
        } catch (_: Exception) {
            // Calendar provider unavailable or query failed.
        }

        return result
    }
}
