/** @type {import('vite').UserConfig} */
export default {
  root: './src',
  envDir: '../../../',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    target: 'es2015',
    rollupOptions: { external: ['/socket.io/socket.io.js'] },
  },
  plugins: [],
};
