import * as path from 'path';
import { fileURLToPath } from 'node:url'

import typescript from '@rollup/plugin-typescript';
import run from "@rollup/plugin-run";
import alias from '@rollup/plugin-alias';

const isDevelopment = process.env.NODE_ENV !== "production";

export default {
  input: './src/index.ts',
  output: [
    { file: 'dist/bundle.cjs.js', format: 'cjs', sourcemap: true },
    { file: 'dist/bundle.esm.js', format: 'es', sourcemap: true }
  ],
  plugins: [
    typescript(),
    isDevelopment && run(),
  ],
}
