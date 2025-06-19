import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'MCP brick',
  tagline: 'Fastest way to interact with your Database such as SQL Server, SQLite and PostgreSQL',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://vero-code-git.github.io/',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/mcp-brick',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'vero-code-git', // Usually your GitHub org/user name.
  projectName: 'mcp-brick', // Usually your repo name.

  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  trailingSlash: false,
  deploymentBranch: 'gh-pages',
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/vero-code-git/mcp-brick/tree/main/docs/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/EA-Icon.svg',
    navbar: {
      title: 'MCP brick',
      logo: {
        alt: 'MCP brick',
        src: 'img/EA-Icon.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://github.com/vero-code-git/mcp-brick',
          label: 'GitHub',
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
              to: '/docs/getting-started',
            },
            {
              label: 'SQLite Setup',
              to: '/docs/sqlite-setup',
            },
            {
              label: 'SQL Server Setup',
              to: '/docs/sql-server-setup',
            },
            {
              label: 'PostgreSQL Setup',
              to: '/docs/postgresql-setup',
            },
          ],
        }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} vero-code-git Pvt Ltd.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
