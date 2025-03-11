import type { DefaultTheme } from 'vitepress'
import { defineConfig } from 'vitepress'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
} from 'vitepress-plugin-group-icons'
import { buildEnd } from './buildEnd.config'

const ogDescription = 'Next Generation Frontend Tooling'
const ogImage = 'https://vite.dev/og-image.jpg'
const ogTitle = 'Vite'
const ogUrl = 'https://vite.dev'

// netlify envs
const deployURL = process.env.DEPLOY_PRIME_URL || ''
const commitRef = process.env.COMMIT_REF?.slice(0, 8) || 'dev'

const deployType = (() => {
  switch (deployURL) {
    case 'https://main--vite-docs-main.netlify.app':
      return 'main'
    case '':
      return 'local'
    default:
      return 'release'
  }
})()
const additionalTitle = ((): string => {
  switch (deployType) {
    case 'main':
      return ' (main branch)'
    case 'local':
      return ' (local)'
    case 'release':
      return ''
  }
})()
const versionLinks = ((): DefaultTheme.NavItemWithLink[] => {
  const oldVersions: DefaultTheme.NavItemWithLink[] = [
    {
      text: 'Vite 5 Docs',
      link: 'https://v5.vite.dev',
    },
    {
      text: 'Vite 4 Docs',
      link: 'https://v4.vite.dev',
    },
    {
      text: 'Vite 3 Docs',
      link: 'https://v3.vite.dev',
    },
    {
      text: 'Vite 2 Docs',
      link: 'https://v2.vite.dev',
    },
  ]

  switch (deployType) {
    case 'main':
    case 'local':
      return [
        {
          text: 'Vite 6 Docs (release)',
          link: 'https://vite.dev',
        },
        ...oldVersions,
      ]
    case 'release':
      return oldVersions
  }
})()

export default defineConfig({
  title: `Vite${additionalTitle}`,
  description: 'Next Generation Frontend Tooling',
  // ignoreDeadLinks: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    [
      'link',
      { rel: 'alternate', type: 'application/rss+xml', href: '/blog.rss' },
    ],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    [
      'link',
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'true',
      },
    ],
    [
      'link',
      {
        rel: 'preload',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600&family=IBM+Plex+Mono:wght@400&display=swap',
        as: 'style',
      },
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600&family=IBM+Plex+Mono:wght@400&display=swap',
      },
    ],
    ['link', { rel: 'me', href: 'https://m.webtoo.ls/@vite' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: ogTitle }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { property: 'og:url', content: ogUrl }],
    ['meta', { property: 'og:description', content: ogDescription }],
    ['meta', { property: 'og:site_name', content: 'vitejs' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: '@vite_js' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
    [
      'script',
      {
        src: 'https://cdn.usefathom.com/script.js',
        'data-site': 'CBDFBSLI',
        'data-spa': 'auto',
        defer: '',
      },
    ],
  ],

  locales: {
    root: {
      label: '简体中文',
      lang: 'cn',
      link: '/cn',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/cn/guide/', activeMatch: '/cn/guide/' },
          { text: 'Config', link: '/cn/config/', activeMatch: '/cn/config/' },
          {
            text: 'Plugins',
            link: '/cn/plugins/',
            activeMatch: '/cn/plugins/',
          },
          {
            text: 'Resources',
            items: [
              { text: 'Team', link: '/cn/team' },
              { text: 'Blog', link: '/cn/blog' },
              { text: 'Releases', link: '/cn/releases' },
              {
                items: [
                  {
                    text: 'Bluesky',
                    link: 'https://bsky.app/profile/vite.dev',
                  },
                  {
                    text: 'Mastodon',
                    link: 'https://elk.zone/m.webtoo.ls/@vite',
                  },
                  {
                    text: 'X',
                    link: 'https://x.com/vite_js',
                  },
                  {
                    text: 'Discord Chat',
                    link: 'https://chat.vite.dev',
                  },
                  {
                    text: 'Awesome Vite',
                    link: 'https://github.com/vitejs/awesome-vite',
                  },
                  {
                    text: 'ViteConf',
                    link: 'https://viteconf.org',
                  },
                  {
                    text: 'DEV Community',
                    link: 'https://dev.to/t/vite',
                  },
                  {
                    text: 'Changelog',
                    link: 'https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md',
                  },
                  {
                    text: 'Contributing',
                    link: 'https://github.com/vitejs/vite/blob/main/CONTRIBUTING.md',
                  },
                ],
              },
            ],
          },
          {
            text: 'Version',
            items: versionLinks,
          },
        ],
      },
    },
    en: {
      label: 'English',
      lang: 'en',
      link: '/en',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/en/guide/', activeMatch: '/en/guide/' },
          { text: 'Config', link: '/en/config/', activeMatch: '/en/config/' },
          {
            text: 'Plugins',
            link: '/en/plugins/',
            activeMatch: '/en/plugins/',
          },
          {
            text: 'Resources',
            items: [
              { text: 'Team', link: '/en/team' },
              { text: 'Blog', link: '/en/blog' },
              { text: 'Releases', link: '/en/releases' },
              {
                items: [
                  {
                    text: 'Bluesky',
                    link: 'https://bsky.app/profile/vite.dev',
                  },
                  {
                    text: 'Mastodon',
                    link: 'https://elk.zone/m.webtoo.ls/@vite',
                  },
                  {
                    text: 'X',
                    link: 'https://x.com/vite_js',
                  },
                  {
                    text: 'Discord Chat',
                    link: 'https://chat.vite.dev',
                  },
                  {
                    text: 'Awesome Vite',
                    link: 'https://github.com/vitejs/awesome-vite',
                  },
                  {
                    text: 'ViteConf',
                    link: 'https://viteconf.org',
                  },
                  {
                    text: 'DEV Community',
                    link: 'https://dev.to/t/vite',
                  },
                  {
                    text: 'Changelog',
                    link: 'https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md',
                  },
                  {
                    text: 'Contributing',
                    link: 'https://github.com/vitejs/vite/blob/main/CONTRIBUTING.md',
                  },
                ],
              },
            ],
          },
          {
            text: 'Version',
            items: versionLinks,
          },
        ],
      },
    },
    ja: {
      label: '日本語',
      link: '/ja',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/ja/guide/', activeMatch: '/ja/guide/' },
          { text: 'Config', link: '/ja/config/', activeMatch: '/ja/config/' },
          {
            text: 'Plugins',
            link: '/ja/plugins/',
            activeMatch: '/ja/plugins/',
          },
          {
            text: 'Resources',
            items: [
              { text: 'Team', link: '/ja/team' },
              { text: 'Blog', link: '/ja/blog' },
              { text: 'Releases', link: '/ja/releases' },
              {
                items: [
                  {
                    text: 'Bluesky',
                    link: 'https://bsky.app/profile/vite.dev',
                  },
                  {
                    text: 'Mastodon',
                    link: 'https://elk.zone/m.webtoo.ls/@vite',
                  },
                  {
                    text: 'X',
                    link: 'https://x.com/vite_js',
                  },
                  {
                    text: 'Discord Chat',
                    link: 'https://chat.vite.dev',
                  },
                  {
                    text: 'Awesome Vite',
                    link: 'https://github.com/vitejs/awesome-vite',
                  },
                  {
                    text: 'ViteConf',
                    link: 'https://viteconf.org',
                  },
                  {
                    text: 'DEV Community',
                    link: 'https://dev.to/t/vite',
                  },
                  {
                    text: 'Changelog',
                    link: 'https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md',
                  },
                  {
                    text: 'Contributing',
                    link: 'https://github.com/vitejs/vite/blob/main/CONTRIBUTING.md',
                  },
                ],
              },
            ],
          },
          {
            text: 'Version',
            items: versionLinks,
          },
        ],
      },
    },
    es: {
      label: 'Español',
      link: '/es',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/es/guide/', activeMatch: '/es/guide/' },
          { text: 'Config', link: '/es/config/', activeMatch: '/es/config/' },
          {
            text: 'Plugins',
            link: '/es/plugins/',
            activeMatch: '/es/plugins/',
          },
          {
            text: 'Resources',
            items: [
              { text: 'Team', link: '/es/team' },
              { text: 'Blog', link: '/es/blog' },
              { text: 'Releases', link: '/es/releases' },
              {
                items: [
                  {
                    text: 'Bluesky',
                    link: 'https://bsky.app/profile/vite.dev',
                  },
                  {
                    text: 'Mastodon',
                    link: 'https://elk.zone/m.webtoo.ls/@vite',
                  },
                  {
                    text: 'X',
                    link: 'https://x.com/vite_js',
                  },
                  {
                    text: 'Discord Chat',
                    link: 'https://chat.vite.dev',
                  },
                  {
                    text: 'Awesome Vite',
                    link: 'https://github.com/vitejs/awesome-vite',
                  },
                  {
                    text: 'ViteConf',
                    link: 'https://viteconf.org',
                  },
                  {
                    text: 'DEV Community',
                    link: 'https://dev.to/t/vite',
                  },
                  {
                    text: 'Changelog',
                    link: 'https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md',
                  },
                  {
                    text: 'Contributing',
                    link: 'https://github.com/vitejs/vite/blob/main/CONTRIBUTING.md',
                  },
                ],
              },
            ],
          },
          {
            text: 'Version',
            items: versionLinks,
          },
        ],
      },
    },
    pt: {
      label: 'Português',
      link: '/pt',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/pt/guide/', activeMatch: '/pt/guide/' },
          { text: 'Config', link: '/pt/config/', activeMatch: '/pt/config/' },
          {
            text: 'Plugins',
            link: '/pt/plugins/',
            activeMatch: '/pt/plugins/',
          },
          {
            text: 'Resources',
            items: [
              { text: 'Team', link: '/pt/team' },
              { text: 'Blog', link: '/pt/blog' },
              { text: 'Releases', link: '/pt/releases' },
              {
                items: [
                  {
                    text: 'Bluesky',
                    link: 'https://bsky.app/profile/vite.dev',
                  },
                  {
                    text: 'Mastodon',
                    link: 'https://elk.zone/m.webtoo.ls/@vite',
                  },
                  {
                    text: 'X',
                    link: 'https://x.com/vite_js',
                  },
                  {
                    text: 'Discord Chat',
                    link: 'https://chat.vite.dev',
                  },
                  {
                    text: 'Awesome Vite',
                    link: 'https://github.com/vitejs/awesome-vite',
                  },
                  {
                    text: 'ViteConf',
                    link: 'https://viteconf.org',
                  },
                  {
                    text: 'DEV Community',
                    link: 'https://dev.to/t/vite',
                  },
                  {
                    text: 'Changelog',
                    link: 'https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md',
                  },
                  {
                    text: 'Contributing',
                    link: 'https://github.com/vitejs/vite/blob/main/CONTRIBUTING.md',
                  },
                ],
              },
            ],
          },
          {
            text: 'Version',
            items: versionLinks,
          },
        ],
      },
    },
    ko: {
      label: '한국어',
      link: '/ko',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/ko/guide/', activeMatch: '/ko/guide/' },
          { text: 'Config', link: '/ko/config/', activeMatch: '/ko/config/' },
          {
            text: 'Plugins',
            link: '/ko/plugins/',
            activeMatch: '/ko/plugins/',
          },
          {
            text: 'Resources',
            items: [
              { text: 'Team', link: '/ko/team' },
              { text: 'Blog', link: '/ko/blog' },
              { text: 'Releases', link: '/ko/releases' },
              {
                items: [
                  {
                    text: 'Bluesky',
                    link: 'https://bsky.app/profile/vite.dev',
                  },
                  {
                    text: 'Mastodon',
                    link: 'https://elk.zone/m.webtoo.ls/@vite',
                  },
                  {
                    text: 'X',
                    link: 'https://x.com/vite_js',
                  },
                  {
                    text: 'Discord Chat',
                    link: 'https://chat.vite.dev',
                  },
                  {
                    text: 'Awesome Vite',
                    link: 'https://github.com/vitejs/awesome-vite',
                  },
                  {
                    text: 'ViteConf',
                    link: 'https://viteconf.org',
                  },
                  {
                    text: 'DEV Community',
                    link: 'https://dev.to/t/vite',
                  },
                  {
                    text: 'Changelog',
                    link: 'https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md',
                  },
                  {
                    text: 'Contributing',
                    link: 'https://github.com/vitejs/vite/blob/main/CONTRIBUTING.md',
                  },
                ],
              },
            ],
          },
          {
            text: 'Version',
            items: versionLinks,
          },
        ],
      },
    },
    de: {
      label: 'Deutsch',
      link: '/de',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/de/guide/', activeMatch: '/de/guide/' },
          { text: 'Config', link: '/de/config/', activeMatch: '/de/config/' },
          {
            text: 'Plugins',
            link: '/de/plugins/',
            activeMatch: '/de/plugins/',
          },
          {
            text: 'Resources',
            items: [
              { text: 'Team', link: '/de/team' },
              { text: 'Blog', link: '/de/blog' },
              { text: 'Releases', link: '/de/releases' },
              {
                items: [
                  {
                    text: 'Bluesky',
                    link: 'https://bsky.app/profile/vite.dev',
                  },
                  {
                    text: 'Mastodon',
                    link: 'https://elk.zone/m.webtoo.ls/@vite',
                  },
                  {
                    text: 'X',
                    link: 'https://x.com/vite_js',
                  },
                  {
                    text: 'Discord Chat',
                    link: 'https://chat.vite.dev',
                  },
                  {
                    text: 'Awesome Vite',
                    link: 'https://github.com/vitejs/awesome-vite',
                  },
                  {
                    text: 'ViteConf',
                    link: 'https://viteconf.org',
                  },
                  {
                    text: 'DEV Community',
                    link: 'https://dev.to/t/vite',
                  },
                  {
                    text: 'Changelog',
                    link: 'https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md',
                  },
                  {
                    text: 'Contributing',
                    link: 'https://github.com/vitejs/vite/blob/main/CONTRIBUTING.md',
                  },
                ],
              },
            ],
          },
          {
            text: 'Version',
            items: versionLinks,
          },
        ],
      },
    },
    ru: {
      label: 'русский язык',
      link: '/ru',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/ru/guide/', activeMatch: '/ru/guide/' },
          { text: 'Config', link: '/ru/config/', activeMatch: '/ru/config/' },
          {
            text: 'Plugins',
            link: '/ru/plugins/',
            activeMatch: '/ru/plugins/',
          },
          {
            text: 'Resources',
            items: [
              { text: 'Team', link: '/ru/team' },
              { text: 'Blog', link: '/ru/blog' },
              { text: 'Releases', link: '/ru/releases' },
              {
                items: [
                  {
                    text: 'Bluesky',
                    link: 'https://bsky.app/profile/vite.dev',
                  },
                  {
                    text: 'Mastodon',
                    link: 'https://elk.zone/m.webtoo.ls/@vite',
                  },
                  {
                    text: 'X',
                    link: 'https://x.com/vite_js',
                  },
                  {
                    text: 'Discord Chat',
                    link: 'https://chat.vite.dev',
                  },
                  {
                    text: 'Awesome Vite',
                    link: 'https://github.com/vitejs/awesome-vite',
                  },
                  {
                    text: 'ViteConf',
                    link: 'https://viteconf.org',
                  },
                  {
                    text: 'DEV Community',
                    link: 'https://dev.to/t/vite',
                  },
                  {
                    text: 'Changelog',
                    link: 'https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md',
                  },
                  {
                    text: 'Contributing',
                    link: 'https://github.com/vitejs/vite/blob/main/CONTRIBUTING.md',
                  },
                ],
              },
            ],
          },
          {
            text: 'Version',
            items: versionLinks,
          },
        ],
      },
    },
  },

  themeConfig: {
    logo: '/logo.svg',

    editLink: {
      pattern: 'https://github.com/vitejs/vite/edit/main/docs/:path',
      text: 'Suggest changes to this page',
    },

    socialLinks: [
      { icon: 'bluesky', link: 'https://bsky.app/profile/vite.dev' },
      { icon: 'mastodon', link: 'https://elk.zone/m.webtoo.ls/@vite' },
      { icon: 'x', link: 'https://x.com/vite_js' },
      { icon: 'discord', link: 'https://chat.vite.dev' },
      { icon: 'github', link: 'https://github.com/vitejs/vite' },
    ],

    algolia: {
      appId: '7H67QR5P0A',
      apiKey: '208bb9c14574939326032b937431014b',
      indexName: 'vitejs',
      searchParameters: {
        facetFilters: ['tags:en'],
      },
    },

    carbonAds: {
      code: 'CEBIEK3N',
      placement: 'vitejsdev',
    },

    footer: {
      message: `Released under the MIT License. (${commitRef})`,
      copyright: 'Copyright © 2019-present VoidZero Inc. & Vite Contributors',
    },

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            {
              text: 'Getting Started',
              link: '/guide/',
            },
            {
              text: 'Philosophy',
              link: '/guide/philosophy',
            },
            {
              text: 'Why Vite',
              link: '/guide/why',
            },
          ],
        },
        {
          text: 'Guide',
          items: [
            {
              text: 'Features',
              link: '/guide/features',
            },
            {
              text: 'CLI',
              link: '/guide/cli',
            },
            {
              text: 'Using Plugins',
              link: '/guide/using-plugins',
            },
            {
              text: 'Dependency Pre-Bundling',
              link: '/guide/dep-pre-bundling',
            },
            {
              text: 'Static Asset Handling',
              link: '/guide/assets',
            },
            {
              text: 'Building for Production',
              link: '/guide/build',
            },
            {
              text: 'Deploying a Static Site',
              link: '/guide/static-deploy',
            },
            {
              text: 'Env Variables and Modes',
              link: '/guide/env-and-mode',
            },
            {
              text: 'Server-Side Rendering (SSR)',
              link: '/guide/ssr',
            },
            {
              text: 'Backend Integration',
              link: '/guide/backend-integration',
            },
            {
              text: 'Troubleshooting',
              link: '/guide/troubleshooting',
            },
            {
              text: 'Performance',
              link: '/guide/performance',
            },
            {
              text: 'Migration from v5',
              link: '/guide/migration',
            },
            {
              text: 'Breaking Changes',
              link: '/changes/',
            },
          ],
        },
        {
          text: 'APIs',
          items: [
            {
              text: 'Plugin API',
              link: '/guide/api-plugin',
            },
            {
              text: 'HMR API',
              link: '/guide/api-hmr',
            },
            {
              text: 'JavaScript API',
              link: '/guide/api-javascript',
            },
            {
              text: 'Config Reference',
              link: '/config/',
            },
          ],
        },
        {
          text: 'Environment API',
          items: [
            {
              text: 'Introduction',
              link: '/guide/api-environment',
            },
            {
              text: 'Environment Instances',
              link: '/guide/api-environment-instances',
            },
            {
              text: 'Plugins',
              link: '/guide/api-environment-plugins',
            },
            {
              text: 'Frameworks',
              link: '/guide/api-environment-frameworks',
            },
            {
              text: 'Runtimes',
              link: '/guide/api-environment-runtimes',
            },
          ],
        },
      ],
      '/config/': [
        {
          text: 'Config',
          items: [
            {
              text: 'Configuring Vite',
              link: '/config/',
            },
            {
              text: 'Shared Options',
              link: '/config/shared-options',
            },
            {
              text: 'Server Options',
              link: '/config/server-options',
            },
            {
              text: 'Build Options',
              link: '/config/build-options',
            },
            {
              text: 'Preview Options',
              link: '/config/preview-options',
            },
            {
              text: 'Dep Optimization Options',
              link: '/config/dep-optimization-options',
            },
            {
              text: 'SSR Options',
              link: '/config/ssr-options',
            },
            {
              text: 'Worker Options',
              link: '/config/worker-options',
            },
          ],
        },
      ],
      '/changes/': [
        {
          text: 'Breaking Changes',
          link: '/changes/',
        },
        {
          text: 'Current',
          items: [],
        },
        {
          text: 'Future',
          items: [
            {
              text: 'this.environment in Hooks',
              link: '/changes/this-environment-in-hooks',
            },
            {
              text: 'HMR hotUpdate Plugin Hook',
              link: '/changes/hotupdate-hook',
            },
            {
              text: 'Move to per-environment APIs',
              link: '/changes/per-environment-apis',
            },
            {
              text: 'SSR using ModuleRunner API',
              link: '/changes/ssr-using-modulerunner',
            },
            {
              text: 'Shared plugins during build',
              link: '/changes/shared-plugins-during-build',
            },
          ],
        },
        {
          text: 'Past',
          items: [],
        },
      ],
    },

    outline: {
      level: [2, 3],
    },
  },
  transformPageData(pageData) {
    const canonicalUrl = `${ogUrl}/${pageData.relativePath}`
      .replace(/\/index\.md$/, '/')
      .replace(/\.md$/, '')
    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.unshift(
      ['link', { rel: 'canonical', href: canonicalUrl }],
      ['meta', { property: 'og:title', content: pageData.title }],
    )
    return pageData
  },
  markdown: {
    codeTransformers: [transformerTwoslash()],
    config(md) {
      md.use(groupIconMdPlugin)
    },
  },
  vite: {
    plugins: [
      groupIconVitePlugin({
        customIcon: {
          firebase: 'vscode-icons:file-type-firebase',
          '.gitlab-ci.yml': 'vscode-icons:file-type-gitlab',
        },
      }),
    ],
    optimizeDeps: {
      include: [
        '@shikijs/vitepress-twoslash/client',
        'gsap',
        'gsap/dist/ScrollTrigger',
        'gsap/dist/MotionPathPlugin',
      ],
    },
  },
  buildEnd,
})
