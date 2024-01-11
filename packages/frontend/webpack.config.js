import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'node:path';
import url from 'node:url';
export default {
  entry: './src/index.js',
  output: {
    filename: 'main.[contenthash].js',
    path: path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), 'dist'),
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
