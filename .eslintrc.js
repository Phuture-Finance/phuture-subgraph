module.exports = {
  env: {
    es6: true,
    node: true,
  },

  plugins: ['import'],
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],

  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },

  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },

  rules: {
    quotes: ['error', 'single'],
    'import/no-unresolved': 2,
    'no-undef': 2,
    'prefer-const': 0,
    semi: ['error', 'always'],
    'no-console': 0,
    '@typescript-eslint/explicit-member-accessibility': 0,
    '@typescript-eslint/camelcase': 0,
    '@typescript-eslint/class-name-casing': 0,
    '@typescript-eslint/no-var-requires': 0,
  },
}
