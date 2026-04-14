const expoConfig = require('eslint-config-expo/flat')
const eslintPluginPerfectionist = require('eslint-plugin-perfectionist')
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended')
const { defineConfig } = require('eslint/config')

module.exports = defineConfig([
  ...expoConfig,
  eslintPluginPerfectionist.configs['recommended-alphabetical'],
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*', 'expo-env.d.ts', 'src/uniwind-types.d.ts', 'tmp/**'],
  },
])
