/* eslint-disable @typescript-eslint/no-var-requires */
const parent = require('../../webpack.config')
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const DeclarationBundlerPlugin = require('declaration-bundler-webpack-plugin')

module.exports = {
  ...parent,
  entry: './lib/main.ts',
  output: {
    filename: 'bundle.js',
    library: 'CafeKitTooltip',
    libraryTarget: 'umd',
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    host: '0.0.0.0',
    port: 8004,
  },
  plugins: [
    ...parent.plugins,
    new CopyPlugin([{ from: 'example', to: 'example' }]),
    new CopyPlugin([{ from: 'bundle.d.ts', to: 'bundle.d.ts' }]),
  ],
}
