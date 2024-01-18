/* eslint-disable no-undef */
/* eslint-disable unicorn/prefer-module */
const path = require('node:path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
// const webpack = require('webpack');

module.exports = {
  mode: 'production',
  output: {
    filename: 'main.[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    // new webpack.debug.ProfilingPlugin(),
    new HtmlBundlerPlugin({
      entry: { index: './src/index.html', simulation: './src/simulation.html' },
      js: { filename: 'js/[name].[contenthash:8].js' },
      css: { filename: 'css/[name].[contenthash:8].css' },
    }),
  ],
  module: {
    noParse: /plotly/,
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.(ico|png|jp?g|webp|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext][query]',
        },
      },
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
};
