package com.securedroid.app.services

import android.content.Context
import android.os.Environment
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import java.io.File

class FileManager(private val context: Context) {

    fun listFiles(dirPath: String?): JSArray {
        val ret = JSArray()
        val targetDir = if (dirPath != null) File(dirPath) else context.getExternalFilesDir(null) ?: context.filesDir

        if (targetDir.exists() && targetDir.isDirectory) {
            targetDir.listFiles()?.forEach { file ->
                val obj = JSObject()
                obj.put("name", file.name)
                obj.put("path", file.absolutePath)
                obj.put("sizeBytes", file.length())
                obj.put("lastModified", file.lastModified())
                obj.put("isDirectory", file.isDirectory)
                obj.put("mimeType", if (file.isDirectory) "inode/directory" else "application/octet-stream")
                ret.put(obj)
            }
        }
        return ret
    }
}
