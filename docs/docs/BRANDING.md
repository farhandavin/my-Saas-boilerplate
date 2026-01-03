# 🎨 Branding & Theming Guide

The boilerplate is designed to be rebranded in **seconds**. We use CSS Variables and Semantic Tokens to ensure global consistency.

## 🚀 One-Step Rebranding

To change the **Primary Brand Color** (and Dark Mode equivalents), open:
`src/app/globals.css`

Find the `:root` section and modify the HSL/Hex values for `--primary`:

```css
:root {
  /* CHANGE THIS block to match your brand */
  --primary: #135bec;          /* Your Main Brand Color */
  --primary-dark: #0b4eba;     /* A slightly darker shade for hover states */
  
  /* Text on top of primary buttons */
  --primary-foreground: #ffffff; 
}
```

**That's it!** All buttons, links, active states, and focus rings will verify instantly.

---

## 🌓 Dark Mode Customization

Dark mode colors are defined in the same file under `.dark`:

```css
.dark {
  /* Adjust these if your brand needs a specific dark tint */
  --background-dark: #101622;
  --surface-dark: #192233;
}
```

## 🧩 Component Styling

We use semantic class names. When building new components, **avoid hardcoding colors**.

| Instead of... | Use this... | Why? |
|--------------|-------------|------|
| `bg-blue-600` | `bg-primary` | Auto-updates with theme |
| `text-gray-900` | `text-foreground` | Auto-switches in Dark Mode |
| `bg-white` | `bg-surface` | Handles Dark Mode backgrounds automatically |
| `border-gray-200` | `border-border` | Consistent hierarchy |

## 🖼️ Logo & Favicon

1. **Logo**: Replace `public/images/logo.png`
2. **Favicon**: Replace `src/app/favicon.ico`
