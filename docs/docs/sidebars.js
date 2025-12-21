/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'category',
      label: '🚀 Getting Started',
      items: ['intro', 'installation', 'env-vars'],
      collapsible: false,
    },
    {
      type: 'category',
      label: '🏗️ Architecture',
      items: ['backend-architecture', 'frontend-architecture'],
      collapsible: false,
    },
    {
      type: 'category',
      label: '✨ Features',
      items: ['authentication', 'billing', 'ai-integration', 'teams'],
    },
    {
      type: 'category',
      label: '🚢 Deployment',
      items: ['deployment'],
    },
  ],
};

module.exports = sidebars;