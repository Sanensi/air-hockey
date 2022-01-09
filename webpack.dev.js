const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');

const outputPath = path.join(__dirname, 'build', 'dev');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    path: outputPath,
    filename: 'app.js',
    publicPath: '/'
  },
  devServer: {
    contentBase: outputPath,
    watchContentBase: true,
    historyApiFallback: true,
  }
});