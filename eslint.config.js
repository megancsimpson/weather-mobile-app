// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // Jest's module APIs (jest.mock factories, jest.isolateModules) need require().
    files: ['src/__tests__/**', 'src/test-utils/**'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]);
