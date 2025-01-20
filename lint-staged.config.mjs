const config = {
  '**/*.{ts?(x),mts}': () => 'tsc -p tsconfig.build.json --noEmit',
  '*.{js,jsx,ts,tsx}': ['npm run lint:file', 'vitest related --run'],
  '*.{md,json}': 'prettier --write',
};

export default config;