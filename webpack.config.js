module.exports = {
  mode: process.env.NODE_ENV || 'development',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.styl'],
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: ['ts-loader'] },
      { test: /\.styl$/, use: ['style-loader', 'css-loader', 'stylus-loader'] },
    ],
  },
  plugins: [],
}
