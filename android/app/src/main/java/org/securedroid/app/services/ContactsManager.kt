package com.securedroid.app.services

import android.content.Context
import android.database.Cursor
import android.provider.ContactsContract
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject

class ContactsManager(private val context: Context) {

    fun getContacts(): JSArray {
        val ret = JSArray()
        try {
            val projection = arrayOf(
                ContactsContract.Contacts._ID,
                ContactsContract.Contacts.DISPLAY_NAME_PRIMARY,
                ContactsContract.Contacts.STARRED
            )
            val cursor: Cursor? = context.contentResolver.query(
                ContactsContract.Contacts.CONTENT_URI,
                projection,
                null,
                null,
                "${ContactsContract.Contacts.DISPLAY_NAME_PRIMARY} ASC LIMIT 100"
            )

            cursor?.use {
                val idIdx = it.getColumnIndex(ContactsContract.Contacts._ID)
                val nameIdx = it.getColumnIndex(ContactsContract.Contacts.DISPLAY_NAME_PRIMARY)
                val starIdx = it.getColumnIndex(ContactsContract.Contacts.STARRED)

                while (it.moveToNext()) {
                    val obj = JSObject()
                    obj.put("id", it.getString(idIdx))
                    obj.put("displayName", it.getString(nameIdx) ?: "Unknown")
                    obj.put("starred", it.getInt(starIdx) == 1)
                    obj.put("phoneNumbers", JSArray())
                    obj.put("emailAddresses", JSArray())
                    ret.put(obj)
                }
            }
        } catch (e: Exception) {
            // Handled gracefully
        }
        return ret
    }
}
