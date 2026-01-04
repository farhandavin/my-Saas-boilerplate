// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'SaaS Boilerplate v2', // SUDAH DIPERBAIKI: Judul Project
  tagline: 'Enterprise Service-Repository Architecture',
  favicon: 'img/favicon.ico',

  // Set URL produksi Anda di sini
  url: 'https://your-production-url.com',
  baseUrl: '/',

  // Config Deployment GitHub Pages (Biarkan jika tidak pakai)
  organizationName: 'your-org', 
  projectName: 'saas-boilerplate', 

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // --- PERBAIKAN: MERMAID CONFIGURATION (Harus di Root) ---
  markdown: {
    mermaid: true, // Mengaktifkan diagram Mermaid
  },
  themes: ['@docusaurus/theme-mermaid'], // Mengaktifkan tema Mermaid
  // --------------------------------------------------------

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Hapus editUrl jika Anda tidak ingin user mengedit docs Anda
          editUrl: undefined,
          // Disable community features
          showLastUpdateAuthor: false,
          showLastUpdateTime: false,
        },
        blog: false, // Matikan blog karena kita fokus dokumentasi
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Ganti dengan gambar social card Anda
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Enterprise OS',
        logo: {
          alt: 'Enterprise OS Logo',
          src: 'img/logo.svg', 
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentation',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Getting Started',
                to: '/docs/buyers-guide',
              },
              {
                label: 'Architecture',
                to: '/docs/backend-architecture',
              },
            ],
          },
          {
            title: 'Support',
            items: [
              {
                label: 'Email Support',
                href: 'mailto:support@yourdomain.com',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Farhan Davin. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      // Remove or comment out the default navbar if we are implementing a custom one in the page
      // But keeping it for other pages might be safer.
      // For now, we will hide the default navbar on the homepage using CSS or page layout.
    }),

    // Injeksi Script dan Stylesheet Eksternal
    scripts: [
      'https://cdn.tailwindcss.com?plugins=forms,container-queries',
      {
        src: 'https://cdn.tailwindcss.com',
        id: 'tailwind-script',
      },

      // Tailwind Config Injection (skarang via static file)
      '/js/tailwind-config.js',
    ],

    stylesheets: [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap',
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
    ],
};

export default config;