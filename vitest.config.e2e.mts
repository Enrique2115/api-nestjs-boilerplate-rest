import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

import { createVitestTestConfig } from './create-vitest-test-config.mjs';

export default defineConfig({
  test: createVitestTestConfig('e2e'),
  plugins: [swc.vite() as any],
});
