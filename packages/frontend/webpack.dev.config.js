/* eslint-disable no-undef */
/* eslint-disable unicorn/prefer-module */
const path = require('node:path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    static: path.join(__dirname, './dist/'),
    hot: true,
    port: 3000,
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
  optimization: {
    runtimeChunk: 'single',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    new HtmlBundlerPlugin({
      entry: { index: './src/index.html', simulation: './src/simulation.html' },
      js: { filename: 'js/[name].[contenthash:8].js' },
      css: { filename: 'css/[name].[contenthash:8].css' },
      loaderOptions: {
        sources: [
          {
            tag: 'script',
            filter: ({ attribute, value }) => {
              if (
                (attribute === 'src' && value.includes('plotly')) ||
                value.includes('webcomponents') ||
                value.includes('socket.io')
              )
                return false;
            },
          },
        ],
      },
    }),
    new CopyPlugin({
      patterns: [
        { from: '../../node_modules/plotly.js-dist-min/plotly.min.js', to: 'js/plotly.min.js' },
        {
          from: '../../node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js',
          to: 'js/webcomponents-loader.js',
        },
      ],
      options: { concurrency: 100 },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/i,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|svg|jp?g|gif|ico|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash:8][ext]',
        },
      },
      {
        test: /\.(js)$/i,
        exclude: [/node_modules/, /plotly/],
        use: ['babel-loader'],
      },
    ],
  },
};
