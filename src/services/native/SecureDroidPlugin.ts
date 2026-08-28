import { registerPlugin } from '@capacitor/core';

import type { SecureDroidPlugin } from './SecureDroidNative';

/**
 * SecureDroid Capacitor Plugin
 *
 * IMPORTANT:
 * The Android native plugin is registered as:
 *
 * @CapacitorPlugin(name = "SecureDroid")
 *
 * Therefore the TypeScript registration name MUST also be:
 *
 * registerPlugin<SecureDroidPlugin>('SecureDroid')
 *
 * Do not use "SecureDroidPlugin" here.
 */
export const SecureDroidNativePlugin =
  registerPlugin<SecureDroidPlugin>('SecureDroid', {
    web: () =>
      import('./SecureDroidNative').then(
        (module) => module.SecureDroidNative as any
      ),
  });

export type { SecureDroidPlugin };
