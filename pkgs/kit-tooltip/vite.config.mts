import { resolve } from 'node:path'
import dts from 'unplugin-dts/vite'
import { defineConfig } from 'vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig({
  plugins: [cssInjectedByJsPlugin(), dts()],
  resolve: {
    alias: {
      '@thewakingsands/kit-common': resolve(
        __dirname,
        '../kit-common/lib/main.ts',
      ),
    },
  },
  build: {
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      name: 'CafeKitTooltip',
      formats: ['umd'],
    },
    rollupOptions: {
      output: {
        entryFileNames: 'bundle.js',
      },
    },
  },
})
