import { defineConfig, globalIgnores } from "eslint/config";
import next from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

export default defineConfig([
  ...next,
  ...typescript,
  {
    rules: {
      // `const { relationIds, ...data } = parsed` is how a field is kept out of the
      // Prisma payload. The named key is deliberately unused; the rest is the point.
      "@typescript-eslint/no-unused-vars": ["error", { ignoreRestSiblings: true }],
    },
  },
  globalIgnores([".next/**", "src/generated/**", "next-env.d.ts"]),
]);
