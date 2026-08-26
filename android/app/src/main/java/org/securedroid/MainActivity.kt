package org.securedroid

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Register the plugin
        registerPlugin(SecureDroidCapacitorPlugin::class.java)
    }
}
