/* eslint-disable linebreak-style */
module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    jest: true,
  },
  extends: ['airbnb-base', 'prettier'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'linebreak-style': ['error', 'windows'],
    'implicit-arrow-linebreak': 'off',
    'operator-linebreak': 'off',
    'function-paren-newline': 'off',
    indent: 'off',
  },
};
