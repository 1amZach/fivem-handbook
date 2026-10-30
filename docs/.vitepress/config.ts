import { defineConfig } from 'vitepress';

// served from github.com/<user>/fivem-handbook, so pages live under /fivem-handbook/
export default defineConfig({
    title: 'FiveM Handbook',
    description: 'A practical guide to writing modern FiveM resources in Lua',
    base: '/fivem-handbook/',
    cleanUrls: true,
    lastUpdated: true,
    head: [['meta', { name: 'theme-color', content: '#9C2CF1' }]],

    themeConfig: {
        nav: [
            { text: 'Guide', link: '/guide/getting-started' },
            { text: 'Discord', link: 'https://discord.gg/agn' },
        ],

        sidebar: [
            {
                text: 'Basics',
                items: [
                    { text: 'Getting started', link: '/guide/getting-started' },
                    { text: 'Client, server and events', link: '/guide/events' },
                    { text: 'Never trust the client', link: '/guide/security' },
                ],
            },
            {
                text: 'Building blocks',
                items: [
                    { text: 'ox_lib essentials', link: '/guide/ox-lib' },
                    { text: 'State bags', link: '/guide/state-bags' },
                    { text: 'Permissions', link: '/guide/permissions' },
                    { text: 'Saving data', link: '/guide/storage' },
                ],
            },
            {
                text: 'Going further',
                items: [
                    { text: 'Performance', link: '/guide/performance' },
                    { text: 'NUI with Svelte', link: '/guide/nui' },
                    { text: 'Connecting players', link: '/guide/connecting' },
                    { text: 'Shipping a resource', link: '/guide/shipping' },
                ],
            },
        ],

        socialLinks: [{ icon: 'discord', link: 'https://discord.gg/agn' }],

        search: { provider: 'local' },

        outline: { level: [2, 3] },

        footer: {
            message: 'Made by IamZach · <a href="https://discord.gg/agn">discord.gg/agn</a>',
            copyright: 'MIT licensed',
        },
    },
});
