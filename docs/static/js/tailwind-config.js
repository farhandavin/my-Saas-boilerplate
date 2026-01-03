tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#135bec",
          "primary-hover": "#0f4bc4",
          "background-light": "#ffffff",
          "background-subtle": "#f8f9fc",
          "background-dark": "#101622",
          "text-main": "#0d121b",
          "text-muted": "#4c669a",
          "border-light": "#e7ebf3",
          "border-dark": "#1e293b",
        },
        fontFamily: {
          "display": ["Inter", "sans-serif"]
        },
      },
  },
  corePlugins: {
    preflight: false, // Penting agar tidak merusak style Docusaurus default
  }
}
