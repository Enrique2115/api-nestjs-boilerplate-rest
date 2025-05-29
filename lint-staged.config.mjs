/**
 * @filename: lint-staged.config.mjs
 * @type {import('lint-staged').Configuration}
 */
const config = {
  '**/*.ts?(x)': () => 'tsc -p tsconfig.build.json --noEmit',
  '*.{js,ts}': ['npm run format', 'npm run lint:fix', 'vitest related --run'],
  '*.{md,json}': 'prettier --write',
};

export default config;
