import { registerPlugin } from '@capacitor/core';
import type { SecureDroidPlugin } from './SecureDroidNative';

export const SecureDroidNativePlugin = registerPlugin<SecureDroidPlugin>('SecureDroidPlugin', {
  web: () => import('./SecureDroidNative').then(m => m.SecureDroidNative as any),
});

export type { SecureDroidPlugin };
