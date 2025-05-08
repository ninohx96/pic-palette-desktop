// eslint.config.mjs
import antfu from "@antfu/eslint-config";

export default antfu(
  {
    stylistic: {
      quotes: "double",
      semi: true,
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": "warn",
      "unused-imports/no-unused-vars": "warn",
      "no-use-before-define": "warn",

      "node/prefer-global/process": "warn",
      "antfu/top-level-function": "warn",
      "style/arrow-parens": ["error", "always"],

      "ts/consistent-type-definitions": ["error", "type"],
      "ts/no-use-before-define": "warn",
      "perfectionist/sort-imports": ["error", {
        // https://perfectionist.dev/rules/sort-imports#usage
        internalPattern: ["^~src/.+"],
      }],
    },
  },
  {},
);
