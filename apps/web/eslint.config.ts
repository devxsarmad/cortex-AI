import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const filename = fileURLToPath(import.meta.url);
const currentDirectory = dirname(filename);

const compat = new FlatCompat({
  baseDirectory: currentDirectory
});

export default [
  {
    ignores: [".next/**", "next-env.d.ts"]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript")
];
