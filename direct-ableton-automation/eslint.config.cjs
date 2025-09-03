module.exports = {
  files: ['src/**/*.ts', 'src/**/*.tsx'],
  ignores: [],
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    parserOptions: {
      project: ['./tsconfig.json'],
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
  plugins: {
    '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    'unused-imports': require('eslint-plugin-unused-imports'),
    import: require('eslint-plugin-import'),
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'unused-imports/no-unused-imports': 'error',
    'import/no-unused-modules': ['warn', { unusedExports: true }],
  },
};
