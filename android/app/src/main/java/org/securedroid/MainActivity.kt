package org.securedroid.app

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(SecureDroidPlugin::class.java)
        super.onCreate(savedInstanceState)
    }
}
