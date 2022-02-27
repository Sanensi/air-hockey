const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const sourcePath = path.join(__dirname, 'src');
const nodeModulesPath = path.join(__dirname, 'node_modules');

module.exports = {
  entry: path.join(sourcePath, 'index.tsx'),

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: nodeModulesPath,
        options: {
          configFile: 'tsconfig.json'
        }
      },
      {
        test: /\.css$/i,
        use: ["css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ]
  },
  
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(sourcePath, 'index.html'),
      filename: 'index.html'
    })
  ],
};