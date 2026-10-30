# Getting started

This handbook assumes you can already read Lua and have a FiveM server you can restart. It's about the step after that: writing resources that stay fast, can't be abused, and are pleasant for other people to install.

Examples use [ox_lib](https://github.com/overextended/ox_lib) where it saves real work. Everything else is plain FiveM.

## A resource is a folder

```
myresource/
├── fxmanifest.lua
├── config.lua
├── client/
│   └── main.lua
├── server/
│   └── main.lua
└── README.md
```

Keep client and server code in separate folders from day one. It makes it obvious which side a file runs on, and you will never accidentally ship server logic to players.

## fxmanifest.lua

```lua
fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'myresource'
description 'What it does, in one line'
version '1.0.0'
author 'YourName'

shared_scripts {
    '@ox_lib/init.lua',
    'config.lua',
}

client_scripts {
    'client/main.lua',
}

server_script 'server/main.lua'

dependency 'ox_lib'
```

A few things worth knowing:

- `lua54 'yes'` gets you Lua 5.4: integer division `//`, bitwise operators like `&` and `>>`, and `<const>` locals. There's no reason to leave it off.
- `shared_scripts` load on both sides, before the client and server scripts. Config goes here, **unless it holds anything secret**. Shared files are sent to every player.
- Files load in the order listed. If `client/menu.lua` uses a table from `client/utils.lua`, list utils first.
- `dependency` makes the server refuse to start your resource if the dependency is missing, which is a much clearer error than a nil index at runtime.

## Config files players can read

Anything in `shared_scripts` or `client_scripts` ends up on players' machines. That's fine for menu positions and colours. It's not fine for webhook URLs, API keys or bot tokens.

Put secrets in a server-only file, or better, in a convar:

```lua
-- server.cfg
set mywebhook "https://discord.com/api/webhooks/..."

-- server/main.lua
local webhook = GetConvar('mywebhook', '')
```

Use `set`, not `setr`. `setr` replicates the value to every client.

More on this in [Shipping a resource](./shipping).

## Restarting while you work

`ensure myresource` in the server console restarts a resource. Two habits save a lot of confusion:

- Clean up after yourself in `onResourceStop`: delete entities you spawned, reset NUI focus, remove blips. Otherwise a restart leaves junk behind and the next start behaves strangely.
- Don't assume the player just joined. On a restart, players are already in game, already in vehicles, already holding state. Handle "already the case" as well as "just happened".

```lua
AddEventHandler('onResourceStop', function(resource)
    if resource ~= GetCurrentResourceName() then return end
    if spawnedProp and DoesEntityExist(spawnedProp) then
        DeleteEntity(spawnedProp)
    end
end)
```

With ox_lib, `cache.resource` is the same as `GetCurrentResourceName()` and saves a native call.
