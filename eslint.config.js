import { respectPrettierConfig } from "eslint-config-react-yas";

export default [
  ...respectPrettierConfig,
  {
    rules: {
      "unicorn/filename-case": "off",
      "unicorn/no-null": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "no-console": "off",
    },
  },
];
