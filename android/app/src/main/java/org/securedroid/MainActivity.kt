// android/app/src/main/java/org/securedroid/MainActivity.kt
package org.securedroid

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // ✅ CRITICAL: Register the plugin here
        registerPlugin(SecureDroidCapacitorPlugin::class.java)
    }
}
