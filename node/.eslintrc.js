module.exports = {
  rules: {
    'no-console': 'warn',
    'no-restricted-imports': 'warn',
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
  },
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: 'tsconfig.json',
  },
  env: {
    browser: true,
  },
}
