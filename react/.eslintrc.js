module.exports = {
  extends: 'vtex-react/io',
  rules: {
    'no-console': 'warn',
    'no-shadow': 'off',
    'no-restricted-imports': 'warn',
    '@typescript-eslint/camelcase': 'off',
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx', '.tsx', '.jsx'] }],
    'react/jsx-no-bind': 'warn',
  },
  parserOptions: {
    ecmaVersion: 2020,
    tsconfigRootDir: __dirname,
    project: 'tsconfig.json',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    browser: true,
  },
}
