package org.securedroid

import android.content.Context
import org.securedroid.diagnostics.DeviceDiagnosticsResult

class DeviceDiagnostics(
    context: Context
) {

    private val delegate =
        org.securedroid.diagnostics.DeviceDiagnostics(context)

    fun run(): DeviceDiagnosticsResult {
        return delegate.run()
    }
}
