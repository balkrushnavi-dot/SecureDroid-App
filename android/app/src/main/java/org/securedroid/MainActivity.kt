package org.securedroid

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(SecureDroidCapacitorPlugin::class.java)
        super.onCreate(savedInstanceState)
    }
}
