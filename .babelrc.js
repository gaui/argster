const babelDefaultEnvOpts = {
  corejs: 2,
  useBuiltIns: 'entry'
};

const presets = [['@babel/env', babelDefaultEnvOpts], '@babel/typescript'];

const plugins = [['@babel/proposal-class-properties']];

const config = {
  env: {
    test: {
      presets: [
        ['@babel/env', { ...babelDefaultEnvOpts, modules: 'commonjs' }],
        '@babel/typescript'
      ],
      plugins: [...plugins]
    },
    development: {
      presets: [['@babel/env', { targets: 'last 1 Chrome version' }]],
      plugins: []
    }
  },
  presets,
  plugins
};

module.exports = config;
