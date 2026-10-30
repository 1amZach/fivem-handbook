# NUI with Svelte

NUI is FiveM's in-game browser. Any HTML page can be your UI, which means you can use a real framework and a real build tool instead of one giant `index.html`.

This setup uses Svelte and Vite: fast to write, tiny output, and the result is plain files FiveM can load.

## Layout

```
myresource/
├── fxmanifest.lua
├── client/main.lua
└── web/
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    ├── src/
    │   ├── main.ts
    │   ├── App.svelte
    │   └── lib/nui.ts
    └── dist/            <- built files, the only part FiveM uses
```

## Vite config

```ts
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
    plugins: [svelte()],
    base: './',   // NUI loads from nui://, every asset path must be relative
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
});
```

`base: './'` is the one setting people miss. Without it the built page asks for `/assets/...`, which doesn't exist inside NUI, and you get a blank screen.

## Manifest

```lua
ui_page 'web/dist/index.html'

files {
    'web/dist/index.html',
    'web/dist/assets/*',
}
```

Commit `web/dist`. Server owners shouldn't need Node installed to run your resource.

## Lua to the UI

```lua
SendNUIMessage({ action = 'open', data = { vehicle = name, values = values } })
SetNuiFocus(true, true) -- keyboard, mouse
```

```ts
// lib/nui.ts
export function onMessage(handler: (action: string, data: any) => void) {
    const listener = (e: MessageEvent) => {
        if (e.data && typeof e.data.action === 'string') handler(e.data.action, e.data.data);
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
}
```

## The UI to Lua

```ts
declare function GetParentResourceName(): string;

export async function post(name: string, data: unknown = {}) {
    const res = await fetch(`https://${GetParentResourceName()}/${name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(data),
    });
    return res.json();
}
```

```lua
RegisterNUICallback('save', function(data, cb)
    -- data is whatever you sent, already decoded
    cb({ ok = true })
end)
```

Always call `cb`, even with nothing useful. The `fetch` on the UI side waits until you do.

## Focus and getting out

`SetNuiFocus(true, true)` gives the page the keyboard and mouse, which also means the player can't move. Give them a way out that doesn't depend on your UI working:

- Close on Escape in the page and tell Lua, which calls `SetNuiFocus(false, false)`.
- Reset focus in `onResourceStop`, so a restart never leaves someone stuck with a cursor.

For tools people use while driving, add a "drive" mode: keep the page visible but release focus, and bring it back when they press the key again.

## Work on it in a normal browser

`npm run dev` opens the page in Chrome with hot reload, which is far quicker than restarting a resource. Detect that you're not in game and feed it sample data:

```ts
const inGame = typeof (window as any).GetParentResourceName === 'function';

if (!inGame) {
    window.postMessage({ action: 'open', data: sampleData }, '*');
}
```

And make `post` just log when `inGame` is false.

## Watch the page size

NUI pages load when the resource starts, for every player. Keep fonts and images small, set `assetsInlineLimit: 0` if you'd rather have separate files than base64 blobs in your JS, and check `dist` before you ship. A full editor UI in Svelte builds to around 20 KB gzipped.
