package org.securedroid.admin

import android.app.admin.DeviceAdminReceiver
import android.content.Context
import android.content.Intent
import android.widget.Toast

class SecureDroidDeviceAdminReceiver : DeviceAdminReceiver() {

    override fun onEnabled(
        context: Context,
        intent: Intent
    ) {
        super.onEnabled(context, intent)

        Toast.makeText(
            context,
            "SecureDroid device administration enabled",
            Toast.LENGTH_SHORT
        ).show()
    }

    override fun onDisabled(
        context: Context,
        intent: Intent
    ) {
        super.onDisabled(context, intent)

        Toast.makeText(
            context,
            "SecureDroid device administration disabled",
            Toast.LENGTH_SHORT
        ).show()
    }
}
