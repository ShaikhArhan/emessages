import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/cli.ts"],
  format: ["cjs", "esm"], // Output both CommonJS and ES Modules
  dts: true, // Generate .d.ts files
  splitting: false,
  sourcemap: true,
  clean: true,
  outExtension({ format, entrypoint }) {
    if (entrypoint === 'src/cli.ts') {
        return { js: '.cjs' }; // Force CLI to CJS
    }
    return {
      js: format === 'esm' ? '.mjs' : '.cjs',
    }
  },
});