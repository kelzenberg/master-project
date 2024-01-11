/* eslint-disable no-undef */
/* eslint-disable unicorn/prefer-module */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('node:path');

console.log('foo');

module.exports = {
  entry: './src/index.js',
  mode: 'production',
  output: {
    filename: 'main.[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new HtmlWebpackPlugin({
      template: './src/simulation.html',
    }),
  ],
};
