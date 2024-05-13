const config = {
  '**/*.ts?(x)': () => 'tsc -p tsconfig.build.json --noEmit',
  '*.{js,jsx,ts,tsx}': [
    'npm run format',
    'npm run lint',
    'vitest related --run',
  ],
  '*.{md,json}': 'prettier --write',
};

module.exports = config;
