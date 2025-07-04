import js from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import { flatConfigs as importConfigs } from 'eslint-plugin-import';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import { configs as tsEslintConfigs } from 'typescript-eslint';

const files = ['src/**/*.{ts,d.ts}'];

export default [
  js.configs.recommended,
  importConfigs.recommended,
  importConfigs.typescript,
  prettierRecommended,
  // for ignore directories
  { ignores: ['node_modules', 'dist'] },
  // for root custom configs
  {
    files: ['**/*.{js,mjs,cjs,ts,d.ts,mts}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
          extensions: ['.ts'],
        },
      },
    },
  },
  // for src directory ts files only for type checking
  ...tsEslintConfigs.recommendedTypeChecked.map((config) => ({ files, ...config })),
  {
    files,
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'import/no-extraneous-dependencies': ['error', { devDependencies: ['src/tests/*.ts'] }],
    },
  },
  // for test files only
  {
    files: ['src/tests/*.ts'],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/max-nested-describe': ['error', { max: 3 }],
    },
  },
];
