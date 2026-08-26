package org.securedroid

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 🔴 CRITICAL FIX: Register the plugin BEFORE super.onCreate()
        registerPlugin(SecureDroidCapacitorPlugin::class.java)
    }
}
