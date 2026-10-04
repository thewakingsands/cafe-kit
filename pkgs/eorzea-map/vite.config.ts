import { fileURLToPath } from 'node:url'
import dts from 'unplugin-dts/vite'
import { defineConfig } from 'vite'
import { version } from './package.json'

export default defineConfig({
  publicDir: 'generated',
  plugins: [dts()],
  define: { __LIB_VERSION__: JSON.stringify(version) },
  build: {
    copyPublicDir: false,
    lib: {
      entry: fileURLToPath(new URL('./src/scripts/app.ts', import.meta.url)),
      name: 'YZWF.eorzeaMap',
      formats: ['es', 'umd'],
      fileName: (format) => (format === 'es' ? 'map.js' : 'map.umd.cjs'),
      cssFileName: 'map',
    },
  },
})
