import eslint from 'vite-plugin-eslint';

/** @type {import('vite').UserConfig} */
export default {
  root: './src',
  envDir: '../',
  build: { outDir: '../dist', emptyOutDir: true },
  plugins: [eslint({ lintOnStart: true })],
};
