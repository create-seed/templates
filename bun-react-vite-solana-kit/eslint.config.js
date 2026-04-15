import js from '@eslint/js'
import json from '@eslint/json'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import { importX } from 'eslint-plugin-import-x'
import * as eslintPluginPerfectionist from 'eslint-plugin-perfectionist'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginQuery from '@tanstack/eslint-plugin-query'

export default defineConfig([
  globalIgnores(['dist', 'tmp']),
  {
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      eslintPluginPrettierRecommended,
      eslintPluginPerfectionist.configs['recommended-alphabetical'],
      pluginQuery.configs['flat/recommended'],
    ],
    files: ['**/*.{ts,tsx}', '**/*.{js}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'import-x': importX,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          fixStyle: 'inline-type-imports',
          prefer: 'type-imports',
        },
      ],
      'import-x/extensions': [
        'error',
        'never',
        {
          checkTypeImports: true,
          fix: true,
          ignorePackages: true,
          pattern: {
            css: 'always',
            json: 'always',
          },
        },
      ],
      'react-refresh/only-export-components': 'off',
    },
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          project: './tsconfig.json',
        }),
      ],
    },
  },
  {
    extends: ['json/recommended', eslintPluginPrettierRecommended],
    files: ['**/*.json'],
    ignores: ['**/tsconfig*.json'],
    language: 'json/json',
    plugins: {
      json,
    },
  },
  {
    extends: ['json/recommended', eslintPluginPrettierRecommended],
    files: ['**/tsconfig*.json'],
    language: 'json/jsonc',
    languageOptions: {
      allowTrailingCommas: true,
    },
    plugins: {
      json,
    },
  },
])
