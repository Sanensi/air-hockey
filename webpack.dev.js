const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');

const contentBase = path.join(__dirname, 'src');
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
    contentBase: contentBase,
    watchContentBase: true,
    historyApiFallback: true,
  }
});