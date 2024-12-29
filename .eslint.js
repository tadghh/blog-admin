module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint', 'prettier'],
  rules: {
    // Possible Errors
    'no-console': 'warn',
    'no-debugger': 'warn',

    // Best Practices
    'curly': ['error', 'all'],
    'eqeqeq': ['error', 'always'],
    'no-floating-decimal': 'error',
    'no-var': 'error',
    'prefer-const': 'error',

    // Stylistic Issues
    'array-bracket-spacing': ['error', 'never'],
    'block-spacing': ['error', 'always'],
    'camelcase': ['error', { properties: 'never' }],
    'comma-dangle': ['error', 'always-multiline'],
    'comma-spacing': ['error', { before: false, after: true }],

    // React
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // TypeScript
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}