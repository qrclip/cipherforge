const path = require('path');

const manager = {
  mode: 'production',
  entry: './src/cipherforge-crypto-worker.ts',
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      os: false,
      crypto: false,
      path: false,
      stream: false,
    },
  },
  module: {
    rules: [{ test: /\.ts$/, loader: 'ts-loader' }],
  },
  output: {
    filename: 'cipherforge-crypto-worker.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    globalObject: "typeof self !== 'undefined' ? self : this",
  },
  performance: { hints: false },
};

module.exports = [manager];
