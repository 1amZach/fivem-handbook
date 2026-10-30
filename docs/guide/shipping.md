# Shipping a resource

A resource other people can actually use needs a bit more than working code.

## Config that explains itself

Put every setting in one `config.lua`, with a comment saying what it does and what it defaults to. Group related options. Prefer readable values over magic numbers:

```lua
-- How long a field repair lasts before it needs a mechanic. 2 = two roadside fixes.
Config.field = {
    uses = 2,
    duration = 12000,  -- ms
    item = 'repairkit', -- needs ox_inventory, false for no item
}
```

If a setting can break things when set wrong, say so in the comment.

## Secrets go in convars

Bot tokens, API keys and webhook URLs must never sit in a file that gets shared, committed, or sent to clients:

```lua
-- server.cfg
set discordbridge_token "..."

-- server/main.lua
local token = GetConvar('discordbridge_token', '')
if token == '' then
    print('discordbridge: no token set, add  set discordbridge_token "..."  to server.cfg')
end
```

Use `set`, never `setr`. Print a clear message when it's missing rather than failing silently.

## Hooks for frameworks

Don't hard-depend on one framework if you don't have to. Put the framework-specific bit behind a function in the config that people can replace:

```lua
-- runs on the server, return true if they paid
Config.charge = function(source, amount)
    return true
end
```

Then show an ESX or QBCore example in the README.

## A README people read

Short, in this order:

1. One or two lines on what it does.
2. A feature list.
3. Install: the exact `server.cfg` lines, including aces.
4. Usage: commands, keys, menus.
5. Config and exports.
6. Where to get help.
7. License.

Screenshots or a short clip do more than any paragraph.

## Pick a license

Without a license, nobody can legally use, change or share your code, even if it's public. If you want people to use it freely, MIT is short and well understood. Add a `LICENSE` file at the root.

The same applies the other way: a public repo with no license isn't free to copy. If you rebuild an idea from one, write your own code.

## Versioning

Bump `version` in `fxmanifest.lua` on every release, tag it in git, and write a line or two about what changed. Server owners updating from 1.2 to 1.3 want to know if their config still works.

## Before you publish

- Restart the resource while players are in game. Nothing should break or leak.
- Join with no Discord, no Steam, and on a slow connection.
- Run `resmon 1` while idle, while using it, and after.
- Trigger your own net events with nonsense arguments and make sure the server shrugs them off.
