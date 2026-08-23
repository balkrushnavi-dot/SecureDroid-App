package com.securedroid.app.services

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorManager as AndroidSensorManager
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject

class SensorManager(private val context: Context) {

    fun getAvailableSensors(): JSArray {
        val ret = JSArray()
        val sm = context.getSystemService(Context.SENSOR_SERVICE) as AndroidSensorManager
        val sensorList = sm.getSensorList(Sensor.TYPE_ALL)

        for (s in sensorList) {
            val obj = JSObject()
            obj.put("id", "sensor_${s.type}_${s.name.replace(" ", "_").lowercase()}")
            obj.put("name", s.name)
            obj.put("vendor", s.vendor)
            obj.put("type", s.type)
            obj.put("typeName", s.stringType)
            obj.put("powerMa", s.power)
            obj.put("resolution", s.resolution)
            obj.put("maxRange", s.maximumRange)
            obj.put("isAvailable", true)
            ret.put(obj)
        }

        return ret
    }
}
