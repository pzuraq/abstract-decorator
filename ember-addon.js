'use strict';

const { hasPlugin, addPlugin } = require('ember-cli-babel-plugin-helpers');

function isProductionEnv() {
  return /production/.test(process.env.EMBER_ENV);
}

module.exports = {
  name: require('./package').name,

  treeForAddon() {
    if (!isProductionEnv()) {
      return this._super('src');
    }

    return this._super('src');
  },

  included(parent) {
    this._super.included.apply(this, arguments);

    if (isProductionEnv()) {
      if (!hasPlugin(parent, 'filter-imports:abstract-decorator')) {
        addPlugin(parent, [
          require.resolve('babel-plugin-filter-imports'),
          {
            imports: {
              'abstract-decorator': ['default'],
            },
          },
          'filter-imports:abstract-decorator',
        ]);
      }
    }
  },
};
