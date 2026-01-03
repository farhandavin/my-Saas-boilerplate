---
sidebar_label: Frontend Architecture
title: Frontend Architecture
---

# 🎨 Frontend Architecture

The frontend is built using **Next.js 16 (App Router)**, designed for performance and SEO while maintaining a dynamic user experience.

## 🛠️ Core Stack

| Technology | Purpose |
| :-- | :-- |
| **Next.js (App Router)** | Framework & Routing |
| **Tailwind CSS v4** | Styling & Design System |
| **Next-Intl** | Internationalization (i18n) |
| **Axios** | Client-side Data Fetching |
| **Framer Motion** | Animations |

---

## 📂 Directory Structure (`src/app`)

We use the **App Router** with localization support.

```
src/app/
├── [locale]/           # Dynamic route for languages (en, id, etc.)
│   ├── layout.tsx      # Main layout (Sidebar, Navbar)
│   ├── page.tsx        # Landing Page
│   ├── auth/           # Login / Register Pages
│   └── dashboard/      # Protected App Pages
├── api/                # Backend API Routes
└── globals.css         # Global Tailwind Directives
```

## ⚡ Data Fetching Strategy

We use a mix of **Server Components** for static content and **Client Components** (`use client`) for interactive widgets.

### Client-Side Fetching (Interactive Widgets)

For dynamic dashboards (like the *CEO Digest*), we use `axios` directly within Client Components.

**Pattern:**
1.  Component is marked `'use client'`.
2.  State is managed via `useState`.
3.  Data is fetched on event (click) or mount (`useEffect`).

**Example (`CeoDigestWidget.tsx`):**
```tsx
'use client';
import { useState } from 'react';
import axios from 'axios';

export default function CeoDigestWidget() {
  const [data, setData] = useState(null);

  const fetchData = async () => {
    const res = await axios.get('/api/ai/analyze');
    setData(res.data);
  }

  return <button onClick={fetchData}>Refresh</button>;
}
```

---

## 🌍 Internationalization (i18n)

We use `next-intl` for translations.

*   **Dictionaries**: Stored in `messages/en.json`, `messages/id.json`.
*   **Usage**:
    ```tsx
    import { useTranslations } from 'next-intl';

    export default function Component() {
      const t = useTranslations('Dashboard');
      return <h1>{t('title')}</h1>;
    }
    ```

## 🎨 Styling (Tailwind CSS)

*   **Utility-First**: We use utility classes for 99% of styling.
*   **Dark Mode**: Supported out-of-the-box via `dark:` modifier.
*   **Colors**: Custom tokens are defined in `globals.css` (CSS Variables).
