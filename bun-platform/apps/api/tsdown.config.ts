import { defineConfig } from 'tsdown'

export default defineConfig({
  clean: true,
  entry: './src/index.ts',
  format: 'esm',
  noExternal: [/@bun-platform\/.*/],
  outDir: './dist',
})
