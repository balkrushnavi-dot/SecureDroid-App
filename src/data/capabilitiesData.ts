import { CapabilityItem, DeviceProfile, SecurityCategoryAudit } from '../types/securedroid';

export function getCapabilitiesForProfile(profile: DeviceProfile): CapabilityItem[] {
  return [
    {
      id: 'verified_boot',
      name: 'Verified Boot (AVB 2.0)',
      category: 'PLATFORM',
      state: profile.verifiedBootState === 'GREEN' ? 'SUPPORTED' : profile.verifiedBootState === 'YELLOW' ? 'PARTIAL' : 'UNSUPPORTED',
      provider: 'DemoCapabilityProvider',
      implementationLayer: 'FIRMWARE',
      systemLayer: 'FIRMWARE',
      platformRequirement: 'REQUIRES PLATFORM / FIRMWARE SUPPORT',
      details: `AVB State: ${profile.verifiedBootState}. Cryptographically validates the kernel and bootloader partitions against OEM root of trust.`,
      technicalProbe: 'getprop ro.boot.verifiedbootstate',
      evidence: `ro.boot.verifiedbootstate = ${profile.verifiedBootState.toLowerCase()}`,
      securityMeaning: 'Guarantees the host operating system kernel has not been tampered with or modified by a persistent rootkit.',
      securityImpact: 'Guarantees the host operating system kernel has not been tampered with or modified by a persistent rootkit.',
      limitations: profile.verifiedBootState === 'GREEN' ? 'None (Locked OEM bootloader state verified).' : 'Bootloader unlocked or custom signing key enrolled.',
      remediation: profile.verifiedBootState === 'GREEN' ? 'None' : 'Relock bootloader or reflash official OEM signed image.',
      canAppChange: false,
      pocoSpecificNote: 'Stock POCO X5 Pro ships with GREEN locked verified bootstate.'
    },
    {
      id: 'selinux_status',
      name: 'SELinux Mandatory Access Control',
      category: 'SANDBOX',
      state: profile.selinuxMode === 'ENFORCING' ? 'SUPPORTED' : 'UNSUPPORTED',
      provider: 'DemoCapabilityProvider',
      implementationLayer: 'KERNEL',
      systemLayer: 'KERNEL',
      platformRequirement: 'REQUIRES KERNEL SUPPORT',
      details: `SELinux is ${profile.selinuxMode}. Enforces strict domain transition policies and prevents privilege escalation.`,
      technicalProbe: '/sys/fs/selinux/enforce / getenforce',
      evidence: `/sys/fs/selinux/enforce = ${profile.selinuxMode === 'ENFORCING' ? '1 (Enforcing)' : '0 (Permissive)'}`,
      securityMeaning: 'Confines apps to isolated security domains; denies unauthorized access to system device nodes and IPC sockets.',
      securityImpact: 'Confines apps to isolated security domains; denies unauthorized access to system device nodes and IPC sockets.',
      limitations: profile.selinuxMode === 'ENFORCING' ? 'None (Enforcing kernel domain containment).' : 'Permissive mode exposes system IPC to cross-app attacks.',
      remediation: profile.selinuxMode === 'ENFORCING' ? 'None' : 'Flash enforcing boot.img / kernel image.',
      canAppChange: false,
      pocoSpecificNote: 'HyperOS and MIUI default to strict Enforcing SELinux policies.'
    },
    {
      id: 'keymint_hardware',
      name: 'Hardware-backed KeyMint',
      category: 'CRYPTOGRAPHY',
      state: profile.keyMintSecurityLevel === 'HARDWARE_STRONGBOX' || profile.keyMintSecurityLevel === 'HARDWARE_TEE' ? 'SUPPORTED' : 'PARTIAL',
      provider: 'DemoCapabilityProvider',
      implementationLayer: 'HARDWARE',
      systemLayer: 'HARDWARE',
      platformRequirement: 'REQUIRES HARDWARE SUPPORT',
      details: `KeyMint Level: ${profile.keyMintSecurityLevel}. Master keys are generated and wrapped inside Qualcomm QSEE / TEE secure hardware enclave.`,
      technicalProbe: 'KeyInfo.isInsideSecureHardware / KeyProperties.SECURITY_LEVEL_TRUSTED_ENVIRONMENT',
      evidence: `KeyInfo.securityLevel = ${profile.keyMintSecurityLevel}, isInsideSecureHardware = ${profile.keyMintSecurityLevel !== 'SOFTWARE_EMULATED'}`,
      securityMeaning: 'Master encryption keys for the virtual disk cannot be extracted even if the Android host is compromised in userspace.',
      securityImpact: 'Master encryption keys for the virtual disk cannot be extracted even if the Android host is compromised in userspace.',
      limitations: profile.keyMintSecurityLevel === 'HARDWARE_STRONGBOX' ? 'None (Discrete StrongBox EAL5+).' : 'Key generation resides in SoC TEE rather than discrete HSM.',
      remediation: 'Active on stock device; hardware capability provided by Qualcomm SM7325 processor.',
      canAppChange: false,
      pocoSpecificNote: 'Qualcomm Snapdragon 778G uses QSEE (Qualcomm Secure Execution Environment) v2.'
    },
    {
      id: 'strongbox_keystore',
      name: 'StrongBox Keymaster (Discrete HSM)',
      category: 'CRYPTOGRAPHY',
      state: profile.strongBoxPresent ? 'SUPPORTED' : 'UNSUPPORTED',
      provider: 'DemoCapabilityProvider',
      implementationLayer: 'HARDWARE',
      systemLayer: 'HARDWARE',
      platformRequirement: 'REQUIRES HARDWARE SUPPORT',
      details: profile.strongBoxPresent ? 'Discrete EAL5+ dedicated tamper-resistant security processor present.' : 'No discrete StrongBox chip (SoC TEE handles cryptographic operations).',
      technicalProbe: 'PackageManager.hasSystemFeature(FEATURE_STRONGBOX_KEYSTORE)',
      evidence: `FEATURE_STRONGBOX_KEYSTORE = ${profile.strongBoxPresent}`,
      securityMeaning: 'Protects against physical side-channel and laser glitching attacks on the main SoC.',
      securityImpact: 'Protects against physical side-channel and laser glitching attacks on the main SoC.',
      limitations: profile.strongBoxPresent ? 'None' : 'Discrete HSM is absent on POCO mid-range hardware (exclusive to Pixel Titan M2 / flagship chips).',
      remediation: 'Requires discrete chip hardware on motherboard (not achievable via software).',
      canAppChange: false,
      pocoSpecificNote: 'POCO X5 Pro 5G relies on Qualcomm SoC TEE instead of discrete StrongBox.'
    },
    {
      id: 'protected_vm',
      name: 'Protected VM / pKVM (EL2 Stage-2)',
      category: 'VIRTUALIZATION',
      state: profile.protectedVmSupported ? 'SUPPORTED' : 'UNSUPPORTED',
      provider: 'DemoCapabilityProvider',
      implementationLayer: 'HYPERVISOR',
      systemLayer: 'HYPERVISOR',
      platformRequirement: 'REQUIRES KERNEL SUPPORT',
      details: profile.protectedVmSupported
        ? 'Hardware stage-2 page tables unmap guest memory from host kernel at ARM EL2 hypervisor exception level.'
        : 'Protected VM isolation is not exposed by current OEM kernel firmware.',
      technicalProbe: 'getprop ro.boot.hypervisor.protected_vm.supported',
      evidence: `ro.boot.hypervisor.protected_vm.supported = ${profile.protectedVmSupported ? '1' : 'not detected'}`,
      securityMeaning: 'Prevents even a compromised Android host root/kernel from reading or tampering with guest VM RAM.',
      securityImpact: 'Prevents even a compromised Android host root/kernel from reading or tampering with guest VM RAM.',
      limitations: profile.protectedVmSupported ? 'None' : 'Stock Xiaomi HyperOS kernel does not configure ARM EL2 pKVM hypervisor.',
      remediation: 'Requires custom kernel compiled with pKVM support and compatible firmware bootloader.',
      canAppChange: false,
      pocoSpecificNote: 'Snapdragon 778G hardware silicon supports ARMv8.4-A virtualization, but stock Xiaomi BSP omits pKVM initialization.'
    },
    {
      id: 'avf_framework',
      name: 'Android Virtualization Framework (AVF)',
      category: 'VIRTUALIZATION',
      state: profile.avfPackagePresent ? 'SUPPORTED' : 'UNSUPPORTED',
      provider: 'DemoCapabilityProvider',
      implementationLayer: 'FRAMEWORK',
      systemLayer: 'FRAMEWORK',
      platformRequirement: 'REQUIRES FRAMEWORK MODIFICATION',
      details: profile.avfPackagePresent
        ? 'AVF APEX package (com.android.virt) and virtualizationservice daemon available for VM orchestration.'
        : 'AVF APEX package is absent on stock vendor firmware.',
      technicalProbe: 'PackageManager.getPackageInfo("com.android.virt") / hasSystemFeature("android.software.virtualization_framework")',
      evidence: `com.android.virt = ${profile.avfPackagePresent ? 'installed' : 'not found'}`,
      securityMeaning: 'Provides standardized, SELinux-confined userspace IPC to spawn Microdroid and Linux payloads.',
      securityImpact: 'Provides standardized, SELinux-confined userspace IPC to spawn Microdroid and Linux payloads.',
      limitations: profile.avfPackagePresent ? 'None' : 'AVF APEX is disabled by Xiaomi in stock HyperOS/MIUI builds.',
      remediation: 'Requires GKI 5.15+ / 6.1+ kernel and AOSP system image with com.android.virt APEX enabled.',
      canAppChange: false,
      pocoSpecificNote: 'AOSP / LineageOS custom builds can sideload and run the AVF framework.'
    },
    {
      id: 'dev_kvm',
      name: 'Kernel KVM Device Node (/dev/kvm)',
      category: 'VIRTUALIZATION',
      state: profile.kvmNodePresent ? 'SUPPORTED' : 'UNSUPPORTED',
      provider: 'DemoCapabilityProvider',
      implementationLayer: 'KERNEL',
      systemLayer: 'KERNEL',
      platformRequirement: 'REQUIRES KERNEL SUPPORT',
      details: profile.kvmNodePresent
        ? 'Direct /dev/kvm ioctl interface exposed to userspace hypervisors (crosvm / native).'
        : '/dev/kvm node is not present or unexposed in userspace filesystem.',
      technicalProbe: 'File("/dev/kvm").exists() && File("/dev/kvm").canRead()',
      evidence: `File("/dev/kvm").exists() = ${profile.kvmNodePresent}`,
      securityMeaning: 'Allows hardware-accelerated CPU instruction execution in guest VM via VMX/KVM ioctl calls.',
      securityImpact: 'Allows hardware-accelerated CPU instruction execution in guest VM via VMX/KVM ioctl calls.',
      limitations: profile.kvmNodePresent ? 'None' : 'Stock Xiaomi kernel was compiled without CONFIG_KVM=y or omits device node uevent.',
      remediation: 'Recompile kernel with CONFIG_KVM=y and ueventd permissions for /dev/kvm.',
      canAppChange: false,
      pocoSpecificNote: 'Requires unlocked bootloader + custom kernel on POCO X5 Pro 5G.'
    },
    {
      id: 'host_storage_safety',
      name: 'Host Storage 20 GB Safety Floor',
      category: 'STORAGE',
      state: profile.availableStorageGb >= 20 ? 'SUPPORTED' : 'UNSUPPORTED',
      provider: 'DemoCapabilityProvider',
      implementationLayer: 'SYSTEM_SERVER',
      systemLayer: 'SYSTEM_SERVER',
      platformRequirement: 'APPLICATION LEVEL AVAILABLE',
      details: `Host Free Space: ${profile.availableStorageGb.toFixed(1)} GB. Mandatory 20.0 GB reserve strictly enforced to prevent host OS instability.`,
      technicalProbe: 'StatFs(Environment.getDataDirectory()).availableBytes >= 20GB',
      evidence: `StatFs.availableBytes = ${profile.availableStorageGb.toFixed(1)} GB (Safe allocation headroom: ${(Math.max(0, profile.availableStorageGb - 20)).toFixed(1)} GB)`,
      securityMeaning: 'Prevents VM virtual disk growth from exhausting host disk and causing bootloops or database corruption.',
      securityImpact: 'Prevents VM virtual disk growth from exhausting host disk and causing bootloops or database corruption.',
      limitations: profile.availableStorageGb >= 20 ? 'None (Adequate headroom).' : 'Free storage is below the 20 GB threshold.',
      remediation: profile.availableStorageGb >= 20 ? 'None' : 'Free up storage on host device before provisioning VM disks.',
      canAppChange: true,
      pocoSpecificNote: '256 GB POCO X5 Pro typically maintains 50-100+ GB free storage.'
    },
    {
      id: 'network_isolation_manifest',
      name: 'Zero-Internet Host Manifest Security',
      category: 'NETWORK',
      state: 'SUPPORTED',
      provider: 'DemoCapabilityProvider',
      implementationLayer: 'APPLICATION',
      systemLayer: 'APPLICATION',
      platformRequirement: 'APPLICATION LEVEL AVAILABLE',
      details: 'SecureDroid host application explicitly strips android.permission.INTERNET via tools:node="remove" in AndroidManifest.xml.',
      technicalProbe: 'PackageManager.checkPermission("android.permission.INTERNET", packageName) == PERMISSION_DENIED',
      evidence: 'AndroidManifest.xml -> <uses-permission android:name="android.permission.INTERNET" tools:node="remove" />',
      securityMeaning: 'Host manager has zero OS capability to transmit VM disk contents or telemetry over the internet.',
      securityImpact: 'Host manager has zero OS capability to transmit VM disk contents or telemetry over the internet.',
      limitations: 'None (Enforced at manifest compile-time).',
      remediation: 'Already integrated in build configuration.',
      canAppChange: true,
      pocoSpecificNote: 'Enforced universally across all Android versions.'
    }
  ];
}

export function getSecurityAuditCategories(profile: DeviceProfile): SecurityCategoryAudit[] {
  const isPkvm = profile.protectedVmSupported;
  const isAvf = profile.avfPackagePresent;
  const isKvm = profile.kvmNodePresent;
  const isKeyMint = profile.keyMintSecurityLevel === 'HARDWARE_TEE' || profile.keyMintSecurityLevel === 'HARDWARE_STRONGBOX';
  const isAvb = profile.verifiedBootState === 'GREEN';
  const isSelinux = profile.selinuxMode === 'ENFORCING';
  const isStorageSafe = profile.availableStorageGb >= 20;

  return [
    {
      id: 'platform_integrity',
      title: 'Platform Integrity',
      category: 'PLATFORM',
      status: isAvb && isSelinux ? 'PASS' : profile.verifiedBootState === 'YELLOW' ? 'WARNING' : 'WARNING',
      systemLayer: 'FIRMWARE',
      platformRequirement: 'REQUIRES PLATFORM / FIRMWARE SUPPORT',
      summary: isAvb ? 'Hardware-verified boot chain and locked bootloader' : 'Bootloader unlocked or custom key enrolled',
      probes: [
        {
          name: 'Android Verified Boot (AVB 2.0)',
          status: isAvb ? 'PASS' : profile.verifiedBootState === 'YELLOW' ? 'WARNING' : 'UNAVAILABLE',
          evidence: `ro.boot.verifiedbootstate = ${profile.verifiedBootState.toLowerCase()}`,
          details: 'Validates integrity of boot, vendor_boot, and dtbo partitions before boot handover.',
          systemLayer: 'FIRMWARE',
          platformRequirement: 'REQUIRES PLATFORM / FIRMWARE SUPPORT'
        },
        {
          name: 'SELinux Enforcing Mode',
          status: isSelinux ? 'PASS' : 'WARNING',
          evidence: `getenforce = ${profile.selinuxMode}`,
          details: 'Mandatory Access Control (MAC) is active and strictly preventing unauthorized domain transitions.',
          systemLayer: 'KERNEL',
          platformRequirement: 'REQUIRES KERNEL SUPPORT'
        }
      ]
    },
    {
      id: 'virtualization_engine',
      title: 'Virtualization',
      category: 'VIRTUALIZATION',
      status: isPkvm ? 'PASS' : isAvf || isKvm ? 'WARNING' : 'UNAVAILABLE',
      systemLayer: 'HYPERVISOR',
      platformRequirement: 'REQUIRES KERNEL SUPPORT',
      summary: isPkvm ? 'ARM EL2 Protected VM stage-2 isolation active' : isAvf ? 'AVF userspace active without pKVM' : 'Hardware hypervisor not exposed by host kernel',
      probes: [
        {
          name: 'Protected VM (pKVM Hypervisor)',
          status: isPkvm ? 'PASS' : 'UNAVAILABLE',
          evidence: `ro.boot.hypervisor.protected_vm.supported = ${isPkvm ? '1' : 'not detected'}`,
          details: 'Stage-2 memory translation hypervisor unmaps guest RAM from host kernel.',
          systemLayer: 'HYPERVISOR',
          platformRequirement: 'REQUIRES KERNEL SUPPORT'
        },
        {
          name: 'Android Virtualization Framework (AVF)',
          status: isAvf ? 'PASS' : 'UNAVAILABLE',
          evidence: `com.android.virt = ${isAvf ? 'installed' : 'not found'}`,
          details: 'AOSP virtualization service daemon for managing Microdroid instances.',
          systemLayer: 'FRAMEWORK',
          platformRequirement: 'REQUIRES FRAMEWORK MODIFICATION'
        },
        {
          name: 'Kernel /dev/kvm Node',
          status: isKvm ? 'PASS' : 'UNAVAILABLE',
          evidence: `File("/dev/kvm").exists() = ${isKvm}`,
          details: 'Kernel-based virtual machine userspace ioctl device node.',
          systemLayer: 'KERNEL',
          platformRequirement: 'REQUIRES KERNEL SUPPORT'
        }
      ]
    },
    {
      id: 'cryptography',
      title: 'Cryptography & Key Protection',
      category: 'CRYPTOGRAPHY',
      status: isKeyMint ? 'PASS' : 'WARNING',
      systemLayer: 'HARDWARE',
      platformRequirement: 'REQUIRES HARDWARE SUPPORT',
      summary: profile.strongBoxPresent ? 'Discrete StrongBox HSM EAL5+ active' : 'Qualcomm SoC TEE KeyMint v2 active',
      probes: [
        {
          name: 'KeyMint Hardware Level',
          status: isKeyMint ? 'PASS' : 'WARNING',
          evidence: `KeyInfo.securityLevel = ${profile.keyMintSecurityLevel}`,
          details: 'AES-256 master storage encryption keys bound to hardware secure enclave.',
          systemLayer: 'HARDWARE',
          platformRequirement: 'REQUIRES HARDWARE SUPPORT'
        },
        {
          name: 'StrongBox Discrete HSM',
          status: profile.strongBoxPresent ? 'PASS' : 'UNAVAILABLE',
          evidence: `FEATURE_STRONGBOX_KEYSTORE = ${profile.strongBoxPresent}`,
          details: 'Discrete hardware security module for high-assurance key storage.',
          systemLayer: 'HARDWARE',
          platformRequirement: 'REQUIRES HARDWARE SUPPORT'
        }
      ]
    },
    {
      id: 'storage_safety',
      title: 'Storage & Safety Reserve',
      category: 'STORAGE',
      status: isStorageSafe ? 'PASS' : 'WARNING',
      systemLayer: 'SYSTEM_SERVER',
      platformRequirement: 'APPLICATION LEVEL AVAILABLE',
      summary: isStorageSafe ? `Safe allocation headroom: ${(profile.availableStorageGb - 20).toFixed(1)} GB (20 GB reserve enforced)` : 'Host free storage below 20 GB safety floor',
      probes: [
        {
          name: '20 GB Host Safety Floor',
          status: isStorageSafe ? 'PASS' : 'WARNING',
          evidence: `Host free space = ${profile.availableStorageGb.toFixed(1)} GB`,
          details: 'Guarantees host operating system never encounters storage starvation.',
          systemLayer: 'SYSTEM_SERVER',
          platformRequirement: 'APPLICATION LEVEL AVAILABLE'
        },
        {
          name: 'Sparse Dynamic Image Allocation',
          status: 'PASS',
          evidence: 'Sparse allocation header configured',
          details: 'Allocates physical host flash only as data is actually written by the VM.',
          systemLayer: 'SYSTEM_SERVER',
          platformRequirement: 'APPLICATION LEVEL AVAILABLE'
        }
      ]
    },
    {
      id: 'network_isolation',
      title: 'Network Isolation',
      category: 'NETWORK',
      status: 'PASS',
      systemLayer: 'APPLICATION',
      platformRequirement: 'APPLICATION LEVEL AVAILABLE',
      summary: 'Host manifest stripped of INTERNET permission + localhost vsock policy',
      probes: [
        {
          name: 'Zero-Internet Host Manifest',
          status: 'PASS',
          evidence: 'tools:node="remove" for android.permission.INTERNET',
          details: 'SecureDroid host binary cannot open external network sockets.',
          systemLayer: 'APPLICATION',
          platformRequirement: 'APPLICATION LEVEL AVAILABLE'
        },
        {
          name: 'VM Network Policy',
          status: 'PASS',
          evidence: 'Policy: OFFLINE / Restricted vsock',
          details: 'Guest traffic blocked from local LAN / WAN routing.',
          systemLayer: 'APPLICATION',
          platformRequirement: 'APPLICATION LEVEL AVAILABLE'
        }
      ]
    },
    {
      id: 'app_sandbox',
      title: 'App Sandbox & Domain Security',
      category: 'SANDBOX',
      status: isSelinux ? 'PASS' : 'WARNING',
      systemLayer: 'KERNEL',
      platformRequirement: 'REQUIRES KERNEL SUPPORT',
      summary: isSelinux ? 'Per-app Linux UID isolation + strict SELinux domain' : 'SELinux permissive',
      probes: [
        {
          name: 'Linux UID Sandbox',
          status: 'PASS',
          evidence: 'Process running in private UID domain',
          details: 'Android kernel multi-user sandbox isolates process memory and file permissions.',
          systemLayer: 'KERNEL',
          platformRequirement: 'REQUIRES KERNEL SUPPORT'
        },
        {
          name: 'SELinux Domain Confinement',
          status: isSelinux ? 'PASS' : 'WARNING',
          evidence: `getenforce = ${profile.selinuxMode}`,
          details: 'Ensures application cannot execute unauthorized syscalls.',
          systemLayer: 'KERNEL',
          platformRequirement: 'REQUIRES KERNEL SUPPORT'
        }
      ]
    },
    {
      id: 'guest_integrity',
      title: 'Guest Image Integrity',
      category: 'GUEST_INTEGRITY',
      status: 'PASS',
      systemLayer: 'FRAMEWORK',
      platformRequirement: 'APPLICATION LEVEL AVAILABLE',
      summary: 'SHA-256 image verification and payload signature validation',
      probes: [
        {
          name: 'Payload Hash Verification',
          status: 'PASS',
          evidence: 'SHA-256 hash checking enabled on disk image load',
          details: 'Verifies guest kernel and rootfs against verified release manifest.',
          systemLayer: 'FRAMEWORK',
          platformRequirement: 'APPLICATION LEVEL AVAILABLE'
        }
      ]
    },
    {
      id: 'privacy_guarantees',
      title: 'Privacy & Ephemeral Controls',
      category: 'PRIVACY',
      status: 'PASS',
      systemLayer: 'APPLICATION',
      platformRequirement: 'APPLICATION LEVEL AVAILABLE',
      summary: 'Zero telemetry, zero cloud synchronisation, ephemeral wipe support',
      probes: [
        {
          name: 'Zero Telemetry & Cloud Leakage',
          status: 'PASS',
          evidence: 'No analytics SDKs or remote endpoints configured',
          details: 'All diagnostics and state stay strictly local on device.',
          systemLayer: 'APPLICATION',
          platformRequirement: 'APPLICATION LEVEL AVAILABLE'
        }
      ]
    }
  ];
}
