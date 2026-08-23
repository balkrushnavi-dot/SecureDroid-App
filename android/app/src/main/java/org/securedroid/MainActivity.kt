package org.securedroid.app

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        // Register your native security plugin so React/TypeScript can invoke it
        registerPlugin(SecureDroidPlugin::class.java)
        super.onCreate(savedInstanceState)
    }
}
