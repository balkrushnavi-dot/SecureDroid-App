import { DeviceProfile } from '../types/securedroid';

export const DEVICE_PROFILES: DeviceProfile[] = [
  {
    id: 'poco_x5_pro',
    name: 'POCO X5 Pro 5G (Stock MIUI / HyperOS)',
    manufacturer: 'Xiaomi / POCO',
    model: '22101320G (Redwood)',
    chipset: 'Qualcomm Snapdragon 778G 5G (SM7325 - 4x Cortex-A78 + 4x Cortex-A55)',
    arch: 'arm64-v8a (64-bit ARMv8.4-A)',
    androidVersion: 'Android 14 (Xiaomi HyperOS 1.0.3.0.UMSMIXM)',
    kernelVersion: 'Linux 5.4.233-qgki-perf-g9b8e-dirty',
    totalRamGb: 8,
    totalStorageGb: 256,
    availableStorageGb: 74.2,
    kvmNodePresent: false, // Standard stock Xiaomi kernel omits userspace /dev/kvm
    avfPackagePresent: false, // AVF apex 'com.android.virt' not included in stock BSP
    microdroidPresent: false,
    protectedVmSupported: false, // pKVM not configured at EL2 boot stage
    keyMintSecurityLevel: 'HARDWARE_TEE', // Qualcomm QSEE / TEE KeyMint v2 (Verified)
    strongBoxPresent: false, // Discrete StrongBox chip not present (SoC TEE handles keys)
    verifiedBootState: 'GREEN', // Locked OEM bootloader with valid AVB 2.0 signatures
    selinuxMode: 'ENFORCING',
    deviceOwnerActive: false,
    notes: 'Snapdragon 778G CPU features hardware virtualization extensions in silicon, but Xiaomi stock vendor firmware does not compile /dev/kvm or bundle AVF APEX. KeyMint TEE encryption is fully verified and active.'
  },
  {
    id: 'pixel_8_avf',
    name: 'Google Pixel 8 (Shiba - Reference pKVM Target)',
    isReferenceDevice: true,
    manufacturer: 'Google',
    model: 'Pixel 8 (G1AZG)',
    chipset: 'Google Tensor G3 (ARMv9-A + Titan M2)',
    arch: 'arm64-v8a (64-bit ARMv9.0-A)',
    androidVersion: 'Android 14 (AP1A.240505.004)',
    kernelVersion: 'Linux 6.1.75-android14-11-gki',
    totalRamGb: 8,
    totalStorageGb: 128,
    availableStorageGb: 74.2,
    kvmNodePresent: true,
    avfPackagePresent: true,
    microdroidPresent: true,
    protectedVmSupported: true, // Hardware pKVM hypervisor at EL2
    keyMintSecurityLevel: 'HARDWARE_STRONGBOX', // Titan M2 discrete chip
    strongBoxPresent: true,
    verifiedBootState: 'GREEN',
    selinuxMode: 'ENFORCING',
    deviceOwnerActive: false,
    notes: 'Official Google reference device with hardware-enforced pKVM (EL2 Stage-2 memory translation), Microdroid APEX runtime, and discrete StrongBox EAL5+ security chip.'
  },
  {
    id: 'poco_x5_pro_custom_kernel',
    name: 'POCO X5 Pro 5G (Custom pKVM Kernel / AOSP)',
    manufacturer: 'Xiaomi / POCO (Custom AOSP)',
    model: '22101320G (LineageOS 21 / AOSP 14)',
    chipset: 'Qualcomm Snapdragon 778G 5G (SM7325)',
    arch: 'arm64-v8a (64-bit)',
    androidVersion: 'Android 14 (LineageOS 21.0-UNOFFICIAL)',
    kernelVersion: 'Linux 5.4.280-pKVM-virt-sm7325',
    totalRamGb: 8,
    totalStorageGb: 256,
    availableStorageGb: 198.5,
    kvmNodePresent: true,
    avfPackagePresent: true,
    microdroidPresent: true,
    protectedVmSupported: true,
    keyMintSecurityLevel: 'HARDWARE_TEE',
    strongBoxPresent: false,
    verifiedBootState: 'YELLOW', // Custom ROM key enrolled in AVB
    selinuxMode: 'ENFORCING',
    deviceOwnerActive: false,
    notes: 'Unlocked bootloader running customized kernel with CONFIG_KVM=y, relaxed SELinux dev node permissions, and AVF APEX package sideloaded.'
  },
  {
    id: 'legacy_device',
    name: 'Generic Android 11 Midrange (Degraded State)',
    manufacturer: 'Generic OEM',
    model: 'Generic ARM64 (Legacy)',
    chipset: 'MediaTek Helio G99 / Snapdragon 680',
    arch: 'arm64-v8a',
    androidVersion: 'Android 11 (API 30)',
    kernelVersion: 'Linux 4.19.157-legacy',
    totalRamGb: 4,
    totalStorageGb: 64,
    availableStorageGb: 18.2, // Below 20GB safe reserve!
    kvmNodePresent: false,
    avfPackagePresent: false,
    microdroidPresent: false,
    protectedVmSupported: false,
    keyMintSecurityLevel: 'SOFTWARE_EMULATED',
    strongBoxPresent: false,
    verifiedBootState: 'ORANGE', // Unlocked bootloader without AVB validation
    selinuxMode: 'PERMISSIVE', // Critical security violation
    deviceOwnerActive: false,
    notes: 'Legacy device with PERMISSIVE SELinux, software-only key generation, unverified boot state, and host storage below the mandatory 20 GB safety threshold.'
  }
];

