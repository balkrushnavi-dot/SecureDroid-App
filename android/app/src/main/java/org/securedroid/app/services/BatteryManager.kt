package com.securedroid.app.services

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager as AndroidBatteryManager
import com.getcapacitor.JSObject

class BatteryManager(
    private val context: Context
) {

    fun getBatteryStatus(): JSObject {
        val result = JSObject()

        val batteryIntent = context.registerReceiver(
            null,
            IntentFilter(Intent.ACTION_BATTERY_CHANGED)
        )

        if (batteryIntent == null) {
            result.put("percentage", -1)
            result.put("isCharging", false)
            result.put("chargingSource", "UNKNOWN")
            result.put("health", "UNKNOWN")
            result.put("temperatureCelsius", -1.0)
            result.put("voltageMillivolts", -1)
            return result
        }

        val level = batteryIntent.getIntExtra(
            AndroidBatteryManager.EXTRA_LEVEL,
            -1
        )

        val scale = batteryIntent.getIntExtra(
            AndroidBatteryManager.EXTRA_SCALE,
            -1
        )

        val percentage = if (level >= 0 && scale > 0) {
            (level * 100.0 / scale).toInt()
        } else {
            -1
        }

        val status = batteryIntent.getIntExtra(
            AndroidBatteryManager.EXTRA_STATUS,
            -1
        )

        val isCharging =
            status == AndroidBatteryManager.BATTERY_STATUS_CHARGING ||
            status == AndroidBatteryManager.BATTERY_STATUS_FULL

        val plugged = batteryIntent.getIntExtra(
            AndroidBatteryManager.EXTRA_PLUGGED,
            0
        )

        val chargingSource = when (plugged) {
            AndroidBatteryManager.BATTERY_PLUGGED_USB -> "USB"
            AndroidBatteryManager.BATTERY_PLUGGED_AC -> "AC"
            AndroidBatteryManager.BATTERY_PLUGGED_WIRELESS -> "WIRELESS"
            else -> if (isCharging) "OTHER" else "NONE"
        }

        val healthCode = batteryIntent.getIntExtra(
            AndroidBatteryManager.EXTRA_HEALTH,
            -1
        )

        val health = when (healthCode) {
            AndroidBatteryManager.BATTERY_HEALTH_GOOD -> "GOOD"
            AndroidBatteryManager.BATTERY_HEALTH_OVERHEAT -> "OVERHEAT"
            AndroidBatteryManager.BATTERY_HEALTH_DEAD -> "DEAD"
            AndroidBatteryManager.BATTERY_HEALTH_OVER_VOLTAGE -> "OVER_VOLTAGE"
            AndroidBatteryManager.BATTERY_HEALTH_UNSPECIFIED_FAILURE ->
                "UNSPECIFIED_FAILURE"
            AndroidBatteryManager.BATTERY_HEALTH_COLD -> "COLD"
            else -> "UNKNOWN"
        }

        val temperatureTenths = batteryIntent.getIntExtra(
            AndroidBatteryManager.EXTRA_TEMPERATURE,
            -1
        )

        val temperatureCelsius =
            if (temperatureTenths >= 0) {
                temperatureTenths / 10.0
            } else {
                -1.0
            }

        val voltageMillivolts = batteryIntent.getIntExtra(
            AndroidBatteryManager.EXTRA_VOLTAGE,
            -1
        )

        result.put("percentage", percentage)
        result.put("isCharging", isCharging)
        result.put("chargingSource", chargingSource)
        result.put("health", health)
        result.put("temperatureCelsius", temperatureCelsius)
        result.put("voltageMillivolts", voltageMillivolts)

        return result
    }
}
