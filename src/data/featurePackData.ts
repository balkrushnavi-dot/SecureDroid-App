import type {
  SecurityAuditEvent,
  ThreatScenarioItem,
} from '../types/securedroid';

/**
 * SecureDroid Feature Pack Data
 *
 * IMPORTANT:
 * - These are reference/demo records only.
 * - They are NOT claims of live Android enforcement.
 * - Live evidence must come from SecureDroidNative and the
 *   corresponding security-analysis engines.
 */

/* ============================================================
 * THREAT MODEL REFERENCE
 * ============================================================ */

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

/* ============================================================
 * SECURITY AUDIT LOG DEMONSTRATION EVENTS
 * ============================================================
 *
 * These records are intentionally marked DEMO EVENT.
 * Live events are supplied by SecureDroidNative.getSecurityLogs().
 */

export const SAMPLE_SECURITY_AUDIT_EVENTS: SecurityAuditEvent[] = [
  {
    id: 'demo-app-scan',
    timestamp: 'Today 09:00:00',
    category: 'APPLICATIONS',
    severity: 'INFO',
    title: 'Application security assessment completed',
    explanation:
      'SecureDroid completed a local assessment of installed application metadata.',
    source: 'DEMO EVENT',
    action: 'APPLICATION_ASSESSMENT_COMPLETED',
    evidence:
      'PackageManager application inventory and locally evaluated application security signals.',
    layer: 'APPLICATION',
  },

  {
    id: 'demo-sideload-detection',
    timestamp: 'Today 09:01:12',
    category: 'APPLICATIONS',
    severity: 'WARNING',
    title: 'Sideloaded application detected',
    explanation:
      'An application was identified with a sideloaded or non-standard installation source.',
    source: 'DEMO EVENT',
    action: 'FLAGGED_FOR_REVIEW',
    evidence:
      'Android package installation-source metadata.',
    layer: 'APPLICATION',
  },

  {
    id: 'demo-sensitive-permission',
    timestamp: 'Today 09:02:05',
    category: 'PRIVACY',
    severity: 'NOTICE',
    title: 'Sensitive permission exposure identified',
    explanation:
      'An installed application declares permissions that provide access to sensitive device or user resources.',
    source: 'DEMO EVENT',
    action: 'PERMISSION_RISK_RECORDED',
    evidence:
      'Declared application permissions exposed through PackageManager.',
    layer: 'APPLICATION',
  },

  {
    id: 'demo-legacy-sdk',
    timestamp: 'Today 09:03:21',
    category: 'APPLICATIONS',
    severity: 'WARNING',
    title: 'Legacy target SDK detected',
    explanation:
      'An installed application targets an older Android SDK and may not receive newer platform behavior by default.',
    source: 'DEMO EVENT',
    action: 'LEGACY_TARGET_FLAGGED',
    evidence:
      'Application target SDK metadata.',
    layer: 'APPLICATION',
  },

  {
    id: 'demo-debuggable-app',
    timestamp: 'Today 09:04:17',
    category: 'SECURITY',
    severity: 'HIGH',
    title: 'Debuggable application detected',
    explanation:
      'An installed application exposes the Android debuggable application flag.',
    source: 'DEMO EVENT',
    action: 'DEBUGGABLE_PACKAGE_FLAGGED',
    evidence:
      'Application flags reported by Android PackageManager.',
    layer: 'APPLICATION',
  },

  {
    id: 'demo-threat-assessment',
    timestamp: 'Today 09:05:44',
    category: 'SECURITY',
    severity: 'INFO',
    title: 'Threat assessment generated',
    explanation:
      'The local threat detection engine generated an assessment from installed-package evidence.',
    source: 'DEMO EVENT',
    action: 'THREAT_ASSESSMENT_GENERATED',
    evidence:
      'SecureDroidNative installed-app inventory evaluated by ThreatDetectionEngine.',
    layer: 'APPLICATION',
  },

  {
    id: 'demo-security-log',
    timestamp: 'Today 09:06:10',
    category: 'SECURITY',
    severity: 'INFO',
    title: 'Security audit subsystem initialized',
    explanation:
      'The SecureDroid security audit interface initialized successfully.',
    source: 'DEMO EVENT',
    action: 'AUDIT_SUBSYSTEM_INITIALIZED',
    evidence:
      'SecureDroid security audit subsystem startup.',
    layer: 'APPLICATION',
  },

  {
    id: 'demo-network-policy',
    timestamp: 'Today 09:07:33',
    category: 'NETWORK',
    severity: 'NOTICE',
    title: 'Network security policy status reviewed',
    explanation:
      'Network security configuration was reviewed by the security interface.',
    source: 'DEMO EVENT',
    action: 'NETWORK_POLICY_REVIEWED',
    evidence:
      'Available network security configuration exposed to the application layer.',
    layer: 'APPLICATION',
  },

  {
    id: 'demo-usb-state',
    timestamp: 'Today 09:08:02',
    category: 'USB',
    severity: 'INFO',
    title: 'USB security state reviewed',
    explanation:
      'The current USB security state was requested by the security interface.',
    source: 'DEMO EVENT',
    action: 'USB_SECURITY_STATE_REVIEWED',
    evidence:
      'Available Android USB configuration state.',
    layer: 'APPLICATION',
  },

  {
    id: 'demo-authentication',
    timestamp: 'Today 09:09:14',
    category: 'AUTHENTICATION',
    severity: 'INFO',
    title: 'Device authentication state reviewed',
    explanation:
      'The security interface reviewed the available device authentication state.',
    source: 'DEMO EVENT',
    action: 'AUTHENTICATION_STATE_REVIEWED',
    evidence:
      'Available Android authentication and lock-state information.',
    layer: 'APPLICATION',
  },

  {
    id: 'demo-secure-environment',
    timestamp: 'Today 09:10:27',
    category: 'SECURE_ENVIRONMENT',
    severity: 'NOTICE',
    title: 'Secure environment capability reviewed',
    explanation:
      'SecureDroid reviewed currently available platform security capabilities.',
    source: 'DEMO EVENT',
    action: 'SECURITY_CAPABILITIES_REVIEWED',
    evidence:
      'Available platform capability probes.',
    layer: 'APPLICATION',
  },

  {
    id: 'demo-privacy-review',
    timestamp: 'Today 09:11:46',
    category: 'PRIVACY',
    severity: 'INFO',
    title: 'Privacy security state reviewed',
    explanation:
      'Privacy-related security controls were reviewed by the application.',
    source: 'DEMO EVENT',
    action: 'PRIVACY_STATE_REVIEWED',
    evidence:
      'Available Android privacy and permission state.',
    layer: 'APPLICATION',
  },

  {
    id: 'demo-audit-integrity',
    timestamp: 'Today 09:12:58',
    category: 'SECURITY',
    severity: 'NOTICE',
    title: 'Audit evidence classification completed',
    explanation:
      'Security audit records were classified according to their evidence source.',
    source: 'DEMO EVENT',
    action: 'EVIDENCE_CLASSIFIED',
    evidence:
      'SecureDroid audit event source classification.',
    layer: 'APPLICATION',
  },
];
