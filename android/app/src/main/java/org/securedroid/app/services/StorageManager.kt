package com.securedroid.app.services

import android.content.Context
import android.os.Environment
import android.os.StatFs
import com.getcapacitor.JSObject
import java.io.File

class StorageManager(private val context: Context) {

    fun getStorageInfo(): JSObject {
        val ret = JSObject()

        val internalStat = StatFs(Environment.getDataDirectory().path)
        val totalBytes = internalStat.blockCountLong * internalStat.blockSizeLong
        val availBytes = internalStat.availableBlocksLong * internalStat.blockSizeLong
        val usedBytes = totalBytes - availBytes
        val percent = if (totalBytes > 0) ((usedBytes.toDouble() / totalBytes) * 100).toInt() else 0

        ret.put("internalTotalBytes", totalBytes)
        ret.put("internalAvailableBytes", availBytes)
        ret.put("internalUsedBytes", usedBytes)
        ret.put("internalUsagePercent", percent)

        val extFiles = context.getExternalFilesDirs(null)
        val hasExternal = extFiles != null && extFiles.size > 1 && extFiles[1] != null

        ret.put("externalStorageAvailable", hasExternal)
        if (hasExternal) {
            val extStat = StatFs(extFiles[1].path)
            val extTotal = extStat.blockCountLong * extStat.blockSizeLong
            val extAvail = extStat.availableBlocksLong * extStat.blockSizeLong
            ret.put("externalTotalBytes", extTotal)
            ret.put("externalAvailableBytes", extAvail)
            ret.put("externalUsedBytes", extTotal - extAvail)
        }

        return ret
    }
}
