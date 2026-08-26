// android/app/src/main/java/org/securedroid/MainActivity.kt
package org.securedroid

import android.os.Bundle
import android.util.Log
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        Log.d("SecureDroid", "🚀 MainActivity onCreate START")
        super.onCreate(savedInstanceState)
        
        try {
            Log.d("SecureDroid", "📦 Registering plugin...")
            registerPlugin(SecureDroidCapacitorPlugin::class.java)
            Log.d("SecureDroid", "✅ Plugin registered successfully!")
        } catch (e: Exception) {
            Log.e("SecureDroid", "❌ Failed to register plugin", e)
        }
        
        Log.d("SecureDroid", "🚀 MainActivity onCreate END")
    }
}
