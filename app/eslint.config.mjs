import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // As páginas seguem o padrão da disciplina: buscar os dados da API no useEffect
      // e guardar no estado (setState). Essa regra nova do React proíbe esse padrão.
      "react-hooks/set-state-in-effect": "off",
      // As funções de busca são recriadas a cada render; o efeito roda só na montagem de propósito.
      "react-hooks/exhaustive-deps": "off",
    },
  },
]);

export default eslintConfig;
