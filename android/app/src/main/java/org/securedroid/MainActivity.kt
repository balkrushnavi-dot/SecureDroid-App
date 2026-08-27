package org.securedroid

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        // Register custom Capacitor plugins BEFORE the Capacitor bridge
        // is initialized by BridgeActivity.
        registerPlugin(SecureDroidCapacitorPlugin::class.java)

        super.onCreate(savedInstanceState)
    }
}
