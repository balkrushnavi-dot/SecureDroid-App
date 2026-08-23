import React, { useState } from 'react';
import { Smartphone, Terminal, CheckCircle2, Copy, Check, Download, AlertCircle, HelpCircle } from 'lucide-react';

export const PocoDeploymentGuide: React.FC = () => {
  const [copiedScript, setCopiedScript] = useState(false);

  const diagnosticScript = `#!/bin/sh
# ==============================================================================
# SECUREDROID VM — POCO X5 Pro 5G (Snapdragon 778G) Capability Probe Script
# Run via: adb shell < poco_probe.sh
# ==============================================================================

echo "=========================================================="
echo "SECUREDROID VM: POCO X5 Pro 5G Hardware Capability Probe"
echo "=========================================================="

echo "\\n[1] CPU & Architecture:"
getprop ro.product.cpu.abi
getprop ro.soc.model
getprop ro.hardware

echo "\\n[2] Kernel & KVM Device Node:"
uname -a
ls -ld /dev/kvm 2>/dev/null || echo "/dev/kvm: NOT FOUND (Stock kernel omits KVM node)"

echo "\\n[3] Android Virtualization Framework (AVF):"
pm list packages | grep -E "virt|microdroid" || echo "AVF Packages: NOT INSTALLED"
pm list features | grep -i virtualization || echo "Virtualization Feature: NOT REPORTED"

echo "\\n[4] Hypervisor & pKVM Status:"
getprop ro.boot.hypervisor.protected_vm.supported || echo "Protected VM Prop: UNSET"
getprop ro.boot.hypervisor.version || echo "Hypervisor Version: UNSET"

echo "\\n[5] Android Verified Boot & Bootloader:"
getprop ro.boot.verifiedbootstate
getprop ro.boot.flash.locked
getprop ro.boot.vbmeta.device_state

echo "\\n[6] SELinux Status:"
getenforce

echo "\\n[7] Keystore & StrongBox Support:"
pm list features | grep -i strongbox || echo "StrongBox Feature: NOT SUPPORTED (Qualcomm TEE KeyMint used)"

echo "\\n[8] Storage & RAM:"
df -h /data
free -m 2>/dev/null || cat /proc/meminfo | grep MemTotal

echo "\\n=========================================================="
echo "PROBE COMPLETE — Save this output for Milestone 2"
echo "=========================================================="
`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(diagnosticScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="text-xs font-mono text-cyan-400 mb-1">TARGET DEVICE GUIDE</div>
        <h2 className="text-xl font-bold text-slate-100">POCO X5 Pro 5G Deployment & Diagnostic Guide</h2>
        <p className="text-sm text-slate-400 mt-1 font-sans">
          Qualcomm Snapdragon 778G (SM7325) • Kryo 670 • 6/8 GB RAM • Android 13/14 (HyperOS / MIUI).
        </p>
      </div>

      {/* Step by Step Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: Build & Install */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 font-mono uppercase flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" /> 1. Build & Install on Device
          </h3>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="font-bold text-slate-200 font-mono">Step A: Export Project</span>
              <p className="text-slate-400 mt-1">
                Click <strong>"Export Complete Android Studio Project (.zip)"</strong> in the Codebase tab, then extract the ZIP archive.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="font-bold text-slate-200 font-mono">Step B: Enable USB Debugging on POCO</span>
              <ul className="list-disc list-inside text-slate-400 mt-1 space-y-1">
                <li>Go to <em>Settings → About Phone</em> → Tap <strong>MIUI/OS Version 7 times</strong>.</li>
                <li>Go to <em>Additional Settings → Developer Options</em>.</li>
                <li>Enable <strong>USB Debugging</strong> and <strong>Install via USB</strong>.</li>
              </ul>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="font-bold text-slate-200 font-mono">Step C: Compile and Install APK</span>
              <div className="bg-slate-900 p-2 rounded text-cyan-300 font-mono text-[11px] mt-1.5 overflow-x-auto">
                ./gradlew assembleDebug<br />
                adb install -r app/build/outputs/apk/debug/app-debug.apk
              </div>
            </div>
          </div>
        </div>

        {/* Right: What to Collect for Milestone 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 font-mono uppercase flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 2. Information Needed for Milestone 2
          </h3>

          <p className="text-xs text-slate-400 font-sans">
            Before proceeding to Milestone 2 (VM Backend detection and execution), collect the following results from the phone:
          </p>

          <div className="space-y-2 text-xs font-mono">
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex items-start gap-2">
              <span className="text-cyan-400 font-bold">1.</span>
              <span className="text-slate-300">Does <code className="text-amber-300">/dev/kvm</code> exist on your POCO X5 Pro? (Yes / No / Permission Denied)</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex items-start gap-2">
              <span className="text-cyan-400 font-bold">2.</span>
              <span className="text-slate-300">Is <code className="text-amber-300">com.android.virt</code> present in <code className="text-amber-300">pm list packages</code>?</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex items-start gap-2">
              <span className="text-cyan-400 font-bold">3.</span>
              <span className="text-slate-300">What is the output of <code className="text-amber-300">getprop ro.boot.verifiedbootstate</code>?</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex items-start gap-2">
              <span className="text-cyan-400 font-bold">4.</span>
              <span className="text-slate-300">Host Free Storage in GB (Must be &gt; 20.0 GB).</span>
            </div>
          </div>
        </div>
      </div>

      {/* Automated Diagnostic Script */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-200 font-mono uppercase">
              Automated POCO X5 Pro 5G ADB Probe Script
            </h3>
          </div>

          <button
            onClick={handleCopyScript}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-all"
          >
            {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedScript ? 'Copied' : 'Copy Script'}
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-3 font-sans">
          Run this directly in your terminal with your POCO X5 Pro connected via USB:
        </p>

        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300 max-h-72 overflow-y-auto leading-relaxed">
          <pre>{diagnosticScript}</pre>
        </div>
      </div>
    </div>
  );
};
