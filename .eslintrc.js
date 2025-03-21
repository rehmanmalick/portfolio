module.exports = {
  root: true,
  extends: [
    "next/core-web-vitals",
    "plugin:tailwindcss/recommended",
    "prettier" // Ajouter cette ligne
  ],
  plugins: ["prettier"], // Ajouter cette ligne
  rules: {
    "prettier/prettier": "error" // Ajouter cette règle
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      parser: '@typescript-eslint/parser',
    },
  ],
  settings: {
    tailwindcss: {
      // Configuration par défaut, vous pouvez personnaliser selon vos besoins
      callees: ["classnames", "clsx", "ctl"],
      config: "tailwind.config.js",
      removeDuplicates: true,
      skipClassAttribute: false,
      whitelist: [],
      // Si vous utilisez des composants Shadcn, vous pourriez vouloir ajouter leurs classes à la whitelist
    },
  },
};