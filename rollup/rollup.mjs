import typescript from "rollup-plugin-typescript2";

import cleanup from "rollup-plugin-cleanup";
import ignore from "rollup-plugin-ignore";
import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";
import jsccPlugin from "rollup-plugin-jscc";


import {externals} from "../rollup.mjs";

export default [

    {
        input: [`src/index.ts`, 'src/types.ts'],
        output: [
            {
                sourcemap: true,
                dir: `build`,
                format: "esm",
              },
              
        ],
        plugins: [
          jsccPlugin({ values: { _ANONCREDS: false } }),
          ignore(externals),
          json(),
          typescript({
            useTsconfigDeclarationDir: true,
            tsconfigOverride: {
              compilerOptions: {
                emitDeclarationOnly: false,
              },
            },
          }),
          commonjs(),
          cleanup(),
        ],
        external: externals,
      },
      {
        input: [`src/core/index.ts`],
        output: [
              {
                sourcemap: true,
                dir: `build/core`,
                format: "esm",
              }
        ],
        plugins: [
          jsccPlugin({ values: { _ANONCREDS: false } }),
          ignore(externals),
          json(),
          typescript({
            useTsconfigDeclarationDir: true,
            tsconfigOverride: {
              compilerOptions: {
                emitDeclarationOnly: false,
              },
            },
          }),
          commonjs(),
          cleanup(),
        ],
        external: externals,
      }
        
]