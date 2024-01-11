/* eslint-disable no-undef */
/* eslint-disable unicorn/prefer-module */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('node:path');

module.export = {
  entry: './src/index.js',
  output: {
    filename: 'main.[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
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
