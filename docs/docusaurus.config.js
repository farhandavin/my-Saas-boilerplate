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
        title: 'SaaS Boilerplate Docs',
        logo: {
          alt: 'SaaS Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentation',
          },
          // Link Support/Purchase
          {
            href: 'https://codecanyon.net/user/your-profile',
            label: 'Purchase',
            position: 'right',
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
                to: '/docs/intro',
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
    }),
};

export default config;