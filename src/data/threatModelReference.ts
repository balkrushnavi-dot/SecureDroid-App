import { ThreatScenarioItem } from '../types/securedroid';

// Reference threat-model scenarios describing SecureDroid's intended
// security controls. This is static architectural documentation, not
// live device analysis -- it must never be presented as, or confused
// with, proof of the current device's actual state.

export const THREAT_MODEL_SCENARIOS: ThreatScenarioItem[] = [
  {
    id: 'threat-sideloaded-malicious-app',
    title: 'Malicious Sideloaded Application',
    scenario:
      'An attacker convinces the user to install an application from an untrusted source.',
    status: 'PARTIALLY PROTECTED',
    why:
      'SecureDroid can identify installed applications whose installation source is reported as sideloaded or unknown and can surface associated risk signals.',
    evidence:
      'Android PackageManager application metadata, installation source, package identity, permissions, target SDK, and application flags.',
    limitation:
      'Application-level analysis cannot prove that an application is malware. It also cannot replace a privileged Android malware scanner or platform enforcement.',
    requirement:
      'Enhanced application verification and platform-level installation enforcement require SecureDroid OS integration.',
    mitigatingControls: [
      'Installation-source analysis',
      'Package metadata inspection',
      'Permission analysis',
      'Target SDK analysis',
      'Local risk assessment',
    ],
  },

  {
    id: 'threat-excessive-app-permissions',
    title: 'Excessive Application Permissions',
    scenario:
      'An installed application requests sensitive permissions that appear disproportionate to its observable application profile.',
    status: 'PARTIALLY PROTECTED',
    why:
      'SecureDroid can identify applications requesting broad or sensitive permissions and surface them for review.',
    evidence:
      'Android package permission declarations and available application metadata.',
    limitation:
      'Declared permissions do not prove that the application actually abused those permissions or accessed sensitive data.',
    requirement:
      'Runtime enforcement and stronger permission mediation require Android framework or SecureDroid OS integration.',
    mitigatingControls: [
      'Sensitive-permission detection',
      'Permission inventory',
      'Application risk scoring',
      'User review',
    ],
  },

  {
    id: 'threat-debuggable-application',
    title: 'Debuggable Application',
    scenario:
      'A production-installed application exposes debugging capabilities that could increase its attack surface.',
    status: 'PARTIALLY PROTECTED',
    why:
      'SecureDroid can inspect application metadata and identify packages marked as debuggable.',
    evidence:
      'Android application flags exposed through package metadata.',
    limitation:
      'Detection does not itself disable debugging or establish exploitability.',
    requirement:
      'Platform-level policy enforcement is required to prevent installation or execution of inappropriate debug builds.',
    mitigatingControls: [
      'Debuggable flag detection',
      'Package inspection',
      'Risk finding generation',
      'Application review',
    ],
  },

  {
    id: 'threat-outdated-target-sdk',
    title: 'Legacy Target SDK',
    scenario:
      'An application targets an older Android SDK and may therefore miss newer platform security behavior.',
    status: 'PARTIALLY PROTECTED',
    why:
      'SecureDroid can identify applications targeting older SDK levels and include that signal in local risk assessment.',
    evidence:
      'Application target SDK metadata reported by Android PackageManager.',
    limitation:
      'An outdated target SDK does not automatically mean that an application is vulnerable or malicious.',
    requirement:
      'System-wide compatibility enforcement requires Android platform policy.',
    mitigatingControls: [
      'Target SDK inspection',
      'Legacy application detection',
      'Risk scoring',
      'Application update recommendation',
    ],
  },

  {
    id: 'threat-compromised-app-identity',
    title: 'Suspicious Application Identity',
    scenario:
      'An application presents package metadata or installation characteristics that warrant additional investigation.',
    status: 'PARTIALLY PROTECTED',
    why:
      'SecureDroid can correlate package identity, installation source, permissions, and other observable metadata.',
    evidence:
      'Package name, application metadata, installation source, and available package-manager information.',
    limitation:
      'APK/package metadata alone cannot establish cryptographic trust beyond the evidence exposed by the Android platform.',
    requirement:
      'Strong signing verification and platform trust enforcement require deeper Android integration.',
    mitigatingControls: [
      'Package identity inspection',
      'Installation-source analysis',
      'Metadata correlation',
      'Risk findings',
    ],
  },

  {
    id: 'threat-credential-phishing-app',
    title: 'Credential-Phishing Application',
    scenario:
      'A malicious application attempts to imitate a trusted application and persuade the user to disclose credentials.',
    status: 'PARTIALLY PROTECTED',
    why:
      'Application identity and installation-source signals can identify suspicious applications, but phishing detection requires additional behavioral and reputation analysis.',
    evidence:
      'Package identity, installation source, permissions, and application metadata.',
    limitation:
      'SecureDroid cannot determine the visual or behavioral authenticity of every application using PackageManager metadata alone.',
    requirement:
      'Browser, application-reputation, and platform-level protections are required for stronger phishing defense.',
    mitigatingControls: [
      'Package inspection',
      'Sideload detection',
      'Permission analysis',
      'Security findings',
    ],
  },

  {
    id: 'threat-data-exfiltration',
    title: 'Application Data Exfiltration',
    scenario:
      'A compromised or malicious application attempts to transfer sensitive information outside the device.',
    status: 'REQUIRES SECUREDROID OS',
    why:
      'Application metadata can identify potential risk factors but cannot provide complete network-level enforcement.',
    evidence:
      'Available application metadata and security configuration signals.',
    limitation:
      'The APK cannot guarantee network isolation or inspect all application traffic without privileged platform integration.',
    requirement:
      'Network policy enforcement, firewall integration, or SecureDroid OS networking controls.',
    mitigatingControls: [
      'Application risk analysis',
      'Network-policy architecture',
      'VPN isolation',
      'SecureDroid OS enforcement',
    ],
  },

  {
    id: 'threat-privilege-escalation',
    title: 'Privilege Escalation',
    scenario:
      'An attacker attempts to exploit a vulnerability to obtain privileges beyond those assigned to an application.',
    status: 'REQUIRES SECUREDROID OS',
    why:
      'Privilege boundaries are primarily enforced below the normal application layer.',
    evidence:
      'Application-level evidence can identify suspicious application characteristics but cannot verify kernel integrity.',
    limitation:
      'An ordinary application cannot guarantee kernel integrity, exploit prevention, or complete privilege-escalation resistance.',
    requirement:
      'Hardened Android framework, SELinux policy, kernel hardening, verified boot, and potentially hardware-backed protections.',
    mitigatingControls: [
      'Application sandbox',
      'SELinux enforcement',
      'Kernel hardening',
      'Verified Boot',
      'SecureDroid OS controls',
    ],
  },

  {
    id: 'threat-physical-device-access',
    title: 'Unauthorized Physical Device Access',
    scenario:
      'An attacker obtains physical access to the device and attempts to access protected information.',
    status: 'REQUIRES HARDWARE',
    why:
      'Strong physical-attack resistance depends on secure hardware, key protection, verified boot, and platform-level authentication.',
    evidence:
      'The current application can report observable device-security signals where the Android platform exposes them.',
    limitation:
      'An ordinary APK cannot establish complete hardware-backed physical-attack resistance.',
    requirement:
      'Hardware-backed keystore, secure boot chain, protected authentication, and platform integration.',
    mitigatingControls: [
      'Device authentication',
      'Hardware-backed keys',
      'Verified Boot',
      'Encrypted storage',
      'SecureDroid OS integration',
    ],
  },

  {
    id: 'threat-usb-attack',
    title: 'USB-Based Attack',
    scenario:
      'An attacker connects a malicious USB device or attempts unauthorized debugging or data access.',
    status: 'REQUIRES SECUREDROID OS',
    why:
      'USB policy enforcement requires control over Android system services and device configuration.',
    evidence:
      'Application-level USB state where exposed by Android APIs.',
    limitation:
      'An ordinary application cannot guarantee USB policy enforcement against all system-level attack paths.',
    requirement:
      'Privileged USB policy enforcement and SecureDroid OS integration.',
    mitigatingControls: [
      'USB security policy',
      'ADB restrictions',
      'Device lock state',
      'SecureDroid OS enforcement',
    ],
  },

  {
    id: 'threat-network-impersonation',
    title: 'Network Impersonation',
    scenario:
      'An attacker attempts to intercept or manipulate application network communication.',
    status: 'REQUIRES SECUREDROID OS',
    why:
      'Application metadata alone cannot enforce network isolation or guarantee transport security.',
    evidence:
      'Available application and network configuration information.',
    limitation:
      'A normal APK cannot guarantee protection against every host-level or network-level attack.',
    requirement:
      'Platform firewalling, trusted network configuration, certificate validation, and system-level policy.',
    mitigatingControls: [
      'TLS',
      'Certificate validation',
      'VPN policy',
      'Network isolation',
      'SecureDroid OS controls',
    ],
  },

  {
    id: 'threat-malicious-system-application',
    title: 'Malicious or Compromised System Application',
    scenario:
      'A privileged system component is compromised and abuses elevated platform privileges.',
    status: 'REQUIRES SECUREDROID OS',
    why:
      'System applications operate above the normal third-party application trust boundary.',
    evidence:
      'Application classification and package metadata can identify system applications.',
    limitation:
      'An APK cannot independently verify the integrity of privileged system components.',
    requirement:
      'Verified boot, signed system partitions, platform integrity controls, and trusted update mechanisms.',
    mitigatingControls: [
      'System-app identification',
      'Verified Boot',
      'Signed system partitions',
      'Secure updates',
    ],
  },

  {
    id: 'threat-persistence-after-reboot',
    title: 'Malware Persistence',
    scenario:
      'A malicious application attempts to maintain access after a reboot or application restart.',
    status: 'REQUIRES SECUREDROID OS',
    why:
      'Persistence mechanisms can operate at application, framework, system, or boot layers.',
    evidence:
      'Installed-package metadata and observable application state.',
    limitation:
      'Application-level inspection cannot establish complete boot-chain integrity.',
    requirement:
      'Verified boot, system partition integrity, service controls, and platform-level persistence prevention.',
    mitigatingControls: [
      'Package inspection',
      'Boot integrity',
      'Verified Boot',
      'Service restrictions',
      'System update verification',
    ],
  },

  {
    id: 'threat-unknown-device-state',
    title: 'Unknown Device Security State',
    scenario:
      'Security-critical device properties cannot be verified through the currently available Android APIs.',
    status: 'UNKNOWN',
    why:
      'SecureDroid explicitly distinguishes unavailable evidence from verified security.',
    evidence:
      'Native bridge error states and unavailable capability probes.',
    limitation:
      'Missing evidence must not be interpreted as proof of security or compromise.',
    requirement:
      'Additional Android platform APIs, privileged services, or SecureDroid OS integration.',
    mitigatingControls: [
      'Explicit UNKNOWN state',
      'Native capability probes',
      'Evidence reporting',
      'Security transparency',
    ],
  },
];
