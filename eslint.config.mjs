import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // backend/ is a separate project with its own package.json, tsconfig,
    // and eslint.config.mjs — it must never be picked up by the frontend's
    // linter (or vice versa).
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts", "backend/**"],
  },
];

export default eslintConfig;
