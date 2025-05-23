export const initialBookmarks = {
  'https://utags.link/': {
    meta: {
      title: 'UTags Bookmark Manager', // UTags 书签管理器
      description:
        'UTags Bookmark Manager is a modern bookmark management tool designed to help developers and advanced users overcome the clutter of bookmarks. Unlike traditional bookmark management methods, it uses a flexible tagging system and powerful filtering functions, allowing users to manage and find online resources more efficiently.', // UTags 书签管理器是一个现代化的书签管理工具，旨在帮助开发者和资深用户摆脱书签杂乱无章的困扰。它不同于传统的书签管理方式，采用了灵活的标签系统和强大的筛选功能，让用户能够更高效地管理和查找网络资源。
      note: `Instructions:
- You can add notes to bookmarks
- Clear data in settings
- Supports importing bookmark HTML files from Chrome/Edge/Firefox/Safari
      `, // 使用说明: ...
      created: Date.now(),
      updated: Date.now(),
    },
    tags: [
      'Open Source',
      'Bookmarks', // 书签 (also English)
      'Bookmark Manager', // 书签管理器
      'Tools/Free', // 工具/免费
      'Read Later', // 稍后阅读
      'Bookmarks',
    ],
  },
  'https://greasyfork.org/scripts/460718': {
    meta: {
      title: 'Userscript - 🏷️ UTags - Add user tags to links',
      created: Date.now(),
      updated: Date.now(),
    },
    tags: ['Open Source', 'Tools', 'Userscript'],
  },
  'https://chromewebstore.google.com/detail/utags-add-usertags-to-lin/kofjcnaphffjoookgahgjidofbdplgig':
    {
      meta: {
        title: 'Chrome extension - UTags - Add usertags to links',
        created: Date.now() - 1000 - Math.floor(Math.random() * 3_600_000),
        updated: Date.now() - 1000,
      },
      tags: [
        'Browser Extension/Chrome',
        'Browser Extension',
        'Tools',
        'Open Source',
      ],
    },
  'https://microsoftedge.microsoft.com/addons/detail/utags-add-usertags-to-l/bhlbflbehfoccjjenpekilgabbjjnphe':
    {
      meta: {
        title: 'Edge extension - UTags - Add usertags to links',
        created: Date.now() - 2000 - Math.floor(Math.random() * 3_600_000),
        updated: Date.now() - 2000,
      },
      tags: [
        'Browser Extension/Edge',
        'Browser Extension',
        'Productivity',
        'Tools',
        'Open Source',
      ],
    },
  'https://addons.mozilla.org/firefox/addon/utags/': {
    meta: {
      title: 'Firefox extension - UTags - Add usertags to links',
      created: Date.now() - 3000 - Math.floor(Math.random() * 3_600_000),
      updated: Date.now() - 3000,
    },
    tags: [
      'Browser Extension/Firefox',
      'Browser Extension',
      'Open Source',
      'Tools',
      'Bookmarks',
    ],
  },
  'https://github.com/utags/utags': {
    meta: {
      title: 'GitHub - utags/utags: 🏷️ UTags - Add user tags to links',
      created: Date.now() - 4000 - Math.floor(Math.random() * 3_600_000),
      updated: Date.now() - 4000,
    },
    tags: ['Open Source', 'Browser Extension', 'Userscript'],
  },
  'https://utags.link/c/public/help': {
    meta: {
      title: 'Help Documentation', // 帮助文档
      created: Date.now() - 4000 - Math.floor(Math.random() * 3_600_000),
      updated: Date.now() - 4000,
    },
    tags: ['help', 'public-collection', 'UTags'],
  },
  'https://utags.link/c/public/release-notes': {
    meta: {
      title: 'Release Notes', // 更新日志
      created: Date.now() - 4000 - Math.floor(Math.random() * 3_600_000),
      updated: Date.now() - 4000,
    },
    tags: ['release-notes', 'public-collection', 'UTags'],
  },
  'https://github.com/orgs/utags/discussions': {
    meta: {
      title: 'Feedback and Suggestions', // 反馈与建议
      created: Date.now() - 4000 - Math.floor(Math.random() * 3_600_000),
      updated: Date.now() - 4000,
    },
    tags: [
      'Discussions',
      'Forum', // 论坛
      'Community', // 社区
      'UTags',
    ],
  },
  'https://utags.link/ref/': {
    meta: {
      title: 'Quick Reference',
      created: Date.now() - 4000 - Math.floor(Math.random() * 3_600_000),
      updated: Date.now() - 4000,
    },
    tags: [
      'Quick Reference Sheet', // 速查表
      'Tools', // 工具
    ],
  },
  'https://github.com/utags/utags-bookmarks': {
    meta: {
      title: 'UTags Bookmark Manager', // UTags 书签管理器
      created: Date.now() - 4000 - Math.floor(Math.random() * 3_600_000),
      updated: Date.now() - 4000,
    },
    tags: [
      'Open Source',
      'Bookmark Manager', // 书签管理器
      'Tools/Free', // 工具/免费
      'Bookmarks',
    ],
  },

  'https://tapmeplus1.com/zh': {
    meta: {
      title: '"Tap Me +1" Web Game', // 《点我加 1》的网页版小游戏
      created: Date.now() - 4000 - Math.floor(Math.random() * 3_600_000),
      updated: Date.now() - 4000,
    },
    tags: [
      '🎮 Games', // 🎮 游戏
      '🎮 Mini Games/Web', // 小游戏/网页版
    ],
  },
  'https://svelte.dev/': {
    meta: {
      title: 'Svelte',
      created: Date.now() - 4000 - Math.floor(Math.random() * 3_600_000),
      updated: Date.now() - 4000,
    },
    tags: [
      'Tech Stack', // 技术栈
      'JavaScript',
      'TypeScript',
      'Open Source',
    ],
  },
  'https://tailwindcss.com/': {
    meta: {
      title: 'Tailwind CSS',
      created: Date.now() - 4000 - Math.floor(Math.random() * 3_600_000),
      updated: Date.now() - 4000,
    },
    tags: [
      'Tech Stack', // 技术栈
      'CSS',
      'Open Source',
    ],
  },
  'https://lucide.dev/': {
    meta: {
      title: 'Lucide',
      description: 'Beautiful & consistent icon toolkit made by the community.',
      created: Date.now() - 4000 - Math.floor(Math.random() * 3_600_000),
      updated: Date.now() - 4000,
    },
    tags: [
      'Tech Stack', // 技术栈
      'Icon',
      'Open Source',
    ],
  },
  'https://www.typescriptlang.org/': {
    meta: {
      title: 'TypeScript',
      created: Date.now() - 4000 - Math.floor(Math.random() * 3_600_000),
      updated: Date.now() - 4000,
    },
    tags: [
      'Tech Stack', // 技术栈
      'TypeScript',
      'Open Source',
    ],
  },
  'https://inlang.com/m/gerre34r/library-inlang-paraglideJs': {
    meta: {
      title: 'Paraglide JS',
      created: Date.now() - 4000 - Math.floor(Math.random() * 3_600_000),
      updated: Date.now() - 4000,
    },
    tags: [
      'Tech Stack', // 技术栈
      'I18N',
      'Open Source',
    ],
  },
  'https://vite.dev/': {
    meta: {
      title: 'Vite | Next Generation Frontend Tooling',
      created: Date.now() - 4000 - Math.floor(Math.random() * 3_600_000),
      updated: Date.now() - 4000,
    },
    tags: [
      'Tech Stack', // 技术栈
      'TypeScript',
      'JavaScript',
      'Tools/Frontend',
      'Open Source',
    ],
  },
  'https://vitest.dev/': {
    meta: {
      title: 'Vitest | Next Generation testing framework',
      created: Date.now() - 4000 - Math.floor(Math.random() * 3_600_000),
      updated: Date.now() - 4000,
    },
    tags: [
      'Tech Stack', // 技术栈
      'TypeScript',
      'JavaScript',
      'Tools/Frontend',
      'Open Source',
    ],
  },
  'https://www.v2ex.com/': {
    meta: {
      title: 'V2EX - A community for creative workers', // V2EX - 创意工作者们的社区
      description:
        'A community for creative workers. Discuss exciting topics like programming, design, hardware, and games.', // 创意工作者的社区。讨论编程、设计、硬件、游戏等令人激动的话题。
      created: Date.now() - 4000 - Math.floor(Math.random() * 3_600_000),
      updated: Date.now() - 4000,
    },
    tags: [
      'Forum', // 论坛
      'Forum/Programmers', // 论坛/程序员
      '💰 Sponsors', // 💰 赞助商
    ],
  },
  'https://linux.do/': {
    meta: {
      title: 'LINUX DO',
      description: 'Where possible begins.',
      created: Date.now() - 4000 - Math.floor(Math.random() * 3_600_000),
      updated: Date.now() - 4000,
    },
    tags: [
      'Forum', // 论坛
      'Forum/Programmers', // 论坛/程序员
      '💰 Sponsors', // 💰 赞助商
    ],
  },
  'https://github.com/helloxz/linksumm': {
    meta: {
      title: 'LinkSumm',
      description:
        'LinkSumm is an intelligent summary extractor driven by AI large models. You can input a URL, and AI will summarize the content for you.', // LinkSumm 是一款使用 AI 大模型驱动的智能摘要提取器，您可以输入一个 URL 地址，让 AI 为您总结内容。
      created: Date.now() - 4000 - Math.floor(Math.random() * 3_600_000),
      updated: Date.now() - 4000,
    },
    tags: [
      'Tools/AI', // 工具/AI
      'Open Source',
      '💰 Sponsors', // 💰 赞助商
    ],
  },
  'https://greasyfork.org/': {
    meta: {
      title: 'Greasy Fork',
      description:
        'Greasy Fork is a free site providing user scripts to improve your web browsing experience.',
      created: Date.now() - 4000 - Math.floor(Math.random() * 3_600_000),
      updated: Date.now() - 4000,
    },
    tags: [
      'Userscript',
      '💰 Sponsors', // 💰 赞助商
    ],
  },
}
