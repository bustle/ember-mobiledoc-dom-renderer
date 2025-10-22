const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const ignores = [
  'blueprints/*/files/**',
  'vendor/**',
  'dist/**',
  'tmp/**',
  'bower_components/**',
  'node_modules/**',
  'coverage/**',
  '.eslintcache',
  '.node_modules.ember-try/**',
  'bower.json.ember-try',
  'package.json.ember-try',
];

module.exports = [
  {
    ignores,
  },
  ...compat.config({
    root: true,
    parser: '@babel/eslint-parser',
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
      ecmaFeatures: {
        legacyDecorators: true,
      },
      requireConfigFile: false,
      babelOptions: {
        plugins: [
          ['@babel/plugin-proposal-decorators', { legacy: true }],
          '@babel/plugin-proposal-class-properties',
        ],
      },
    },
    plugins: ['ember'],
    extends: [
      'eslint:recommended',
      'plugin:ember/recommended',
      'plugin:prettier/recommended',
    ],
    env: {
      browser: true,
    },
    rules: {
      'ember/no-runloop': 'off',
    },
    overrides: [
      {
        files: [
          'eslint.config.js',
          '.prettierrc.js',
          '.template-lintrc.js',
          'ember-cli-build.js',
          './index.js',
          'testem.js',
          'blueprints/*/index.js',
          'config/**/*.js',
          'tests/dummy/config/**/*.js',
          'fastboot-tests/index-test.js',
        ],
        excludedFiles: [
          'addon/**',
          'addon-test-support/**',
          'app/**',
          'tests/dummy/app/**',
        ],
        parserOptions: {
          sourceType: 'script',
        },
        env: {
          browser: false,
          node: true,
        },
      },
      {
        files: ['tests/**/*-test.{js,ts}'],
        extends: ['plugin:qunit/recommended'],
      },
      {
        files: ['**/*.gts'],
        parser: 'ember-eslint-parser',
        plugins: ['@typescript-eslint'],
        rules: {
          'no-unused-vars': 'off',
          '@typescript-eslint/no-unused-vars': [
            'error',
            {
              argsIgnorePattern: '^_',
              varsIgnorePattern: '^_',
              args: 'none',
            },
          ],
          'ember/no-side-effects': 'off',
        },
      },
      {
        files: ['**/*.ts'],
        parser: '@typescript-eslint/parser',
        plugins: ['@typescript-eslint'],
        extends: ['plugin:@typescript-eslint/recommended'],
        rules: {
          '@typescript-eslint/no-explicit-any': 'warn',
          '@typescript-eslint/no-unused-vars': [
            'error',
            {
              argsIgnorePattern: '^_',
              varsIgnorePattern: '^_',
              args: 'none',
            },
          ],
        },
      },
    ],
  }),
];
