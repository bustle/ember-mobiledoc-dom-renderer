'use strict';

module.exports = {
  singleQuote: true,
  plugins: ['prettier-plugin-ember-template-tag'],
  overrides: [
    {
      files: '*.{gjs,gts}',
      options: {
        parser: 'ember-template-tag',
      },
    },
  ],
};
