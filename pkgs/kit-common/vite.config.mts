import { resolve } from 'node:path'
import preact from '@preact/preset-vite'
import dts from 'unplugin-dts/vite'
import { defineConfig } from 'vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig({
  plugins: [preact(), cssInjectedByJsPlugin(), dts()],
  build: {
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      name: 'CafeKitCommon',
      formats: ['umd'],
    },
    rollupOptions: {
      output: {
        entryFileNames: 'bundle.js',
      },
    },
  },
})
