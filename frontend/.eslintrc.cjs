module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "@electron-toolkit/eslint-config-ts/recommended",
    "@electron-toolkit/eslint-config-prettier",
  ],
  rules: {
    "quote-props": [0],
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",

    // indentation (Already present in TypeScript)
    "comma-spacing": ["error", { before: false, after: true }],
    "key-spacing": ["error", { afterColon: true }],
    "n/prefer-global/process": ["off"],
    "sonarjs/cognitive-complexity": ["off"],
    "eol-last": "off",
    "antfu/top-level-function": "off",
    "@typescript-eslint/no-explicit-any": "off",

    // indentation (Already present in TypeScript)
    indent: ["error", 2],

    // Enforce trailing comma (Already present in TypeScript)
    "comma-dangle": ["error", "never"],

    // Enforce consistent spacing inside braces of object (Already present in TypeScript)
    "object-curly-spacing": ["error", "always"],

    // Enforce camelCase naming convention
    camelcase: "error",

    // Disable max-len
    "max-len": "off",

    // we don't want it
    semi: ["error", "never"],
    "promise/param-names": "off",
    "antfu/if-newline": "off",
    // add parens ony when required in arrow function
    "arrow-parens": ["error", "as-needed"],

    // add new line above comment
    "newline-before-return": 0,

    // add new line above comment
    "lines-around-comment": [
      "off",
      {
        beforeBlockComment: true,
        beforeLineComment: true,
        allowBlockStart: true,
        allowClassStart: true,
        allowObjectStart: true,
        allowArrayStart: true,

        // We don't want to add extra space above closing SECTION
        ignorePattern: "!SECTION",
      },
    ],
    "@typescript-eslint/comma-dangle": ["error", "never"],

    // Ignore _ as unused variable
    "@typescript-eslint/no-unused-vars": [0],

    "array-element-newline": ["error", "consistent"],
    "array-bracket-newline": ["error", "consistent"],
    "no-useless-catch": "off",
    "sonarjs/no-useless-catch": "off",
    "padding-line-between-statements": [
      0,
      {
        blankLine: "always",
        prev: "expression",
        next: "const",
      },
      { blankLine: "always", prev: "const", next: "expression" },
      {
        blankLine: "always",
        prev: "multiline-const",
        next: "*",
      },
      { blankLine: "always", prev: "*", next: "multiline-const" },
    ],

    // Plugin: eslint-plugin-import
    "import/order": "off",
    "import/prefer-default-export": "off",
    "import/newline-after-import": ["error", { count: 1 }],
    "no-restricted-imports": [
      0,
      "vuetify/components",
      {
        name: "vue3-apexcharts",
        message: "apexcharts are autoimported",
      },
    ],

    // For omitting extension for ts files
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
        jsx: "never",
        ts: "never",
        tsx: "never",
      },
    ],

    // ignore virtual files
    "import/no-unresolved": [
      2,
      {
        ignore: [
          "~pages$",
          "virtual:generated-layouts",
          ".*?css",

          // Ignore vite's ?raw imports
          ".*?raw",
          // Ignore nuxt auth in nuxt version
          "#auth$",
        ],
      },
    ],

    // Thanks: https://stackoverflow.com/a/63961972/10796681
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": ["error"],

    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/no-explicit-any": "off",
    // Plugin: eslint-plugin-promise
    "promise/always-return": "off",
    "promise/catch-or-return": "off",

    // -- Sonarlint
    "sonarjs/no-duplicate-string": "off",
    "sonarjs/no-nested-template-literals": "off",

    // -- Unicorn
    // 'unicorn/filename-case': 'off',
    // 'unicorn/prevent-abbreviations': ['error', {
    //   replacements: {
    //     props: false,
    //   },
    // }],
  },
};
