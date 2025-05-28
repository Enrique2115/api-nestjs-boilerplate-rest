import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: eslint.configs.recommended,
  allConfig: eslint.configs.all,
});

export default [
  // Configuraciones base
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginUnicorn.configs.recommended,

  // Configuraciones legacy usando compat
  ...fixupConfigRules(
    compat.extends('plugin:prettier/recommended', 'plugin:node/recommended'),
  ),

  // Configuración principal
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.build.json'],
        projectService: {
          allowDefaultProject: ['eslint.config.js'],
        },
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.node,
        ...globals.browser,
        NodeJS: true,
      },
    },
    rules: {
      // Reglas de simple-import-sort
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Node.js built-in modules
            [
              '^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)',
            ],
            // Side effect imports
            [
              String.raw`^node:.*\u0000$`,
              String.raw`^@?\w.*\u0000$`,
              String.raw`^[^.].*\u0000$`,
              String.raw`^\..*\u0000$`,
            ],
            [String.raw`^\u0000`],
            // Node: protocol imports
            ['^node:'],
            // External packages
            [String.raw`^@?\w`],
            // Internal packages - ajusta estos paths según tu estructura
            ['^@src(/.*|$)'],
            ['^@core(/.*|$)'],
            ['^@infra(/.*|$)'],
            // Other imports
            ['^'],
            // Relative imports
            [String.raw`^\.`],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',

      // Reglas de unicorn
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/prevent-abbreviations': 'off',

      // Otras reglas
      'no-console': 'warn',
      'node/no-missing-import': 'off',
      'node/no-unsupported-features/es-syntax': [
        'error',
        { ignores: ['modules'] },
      ],
      'node/no-unpublished-import': 'off',
      'no-process-exit': 'off',
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],
    },
  },

  // Prettier debe ir al final para sobrescribir conflictos de formato
  eslintConfigPrettier,

  // Ignorar archivos
  {
    ignores: [
      'eslint.config.js',
      'lint-staged.config.mjs',
      'node_modules/*',
      'dist/*',
      'coverage/*',
      'pnpm-lock.yaml',
      '.gitignore',
    ],
  },
];
