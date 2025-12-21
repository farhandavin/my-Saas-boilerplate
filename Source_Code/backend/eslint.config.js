// backend/eslint.config.js
const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node, // Agar tidak error saat baca 'process', 'require', 'module'
      },
      ecmaVersion: 2022,
      sourceType: "commonjs",
    },
    rules: {
      "no-unused-vars": "warn", // Peringatan jika ada variabel tidak terpakai
      "no-console": "off",      // Boleh pakai console.log (bisa diubah jadi 'warn' nanti)
    },
  },
];