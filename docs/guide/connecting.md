# Connecting players

Everything that happens before a player is in the server goes through `playerConnecting`. Whitelists, ban checks, queues and "join our Discord first" screens all live here.

## Deferrals

```lua
AddEventHandler('playerConnecting', function(name, setKickReason, deferrals)
    local src = source

    deferrals.defer()
    Wait(0)                        -- required before the first update
    deferrals.update('Checking your account...')

    local license = getLicense(src)
    if not license then
        return deferrals.done('Restart FiveM and try again.')
    end

    if isBanned(license) then
        return deferrals.done('You are banned.')
    end

    deferrals.done()               -- let them in
end)
```

Rules that keep you out of trouble:

- Call `deferrals.defer()` straight away, then `Wait(0)` before anything else.
- **Every path has to end in `deferrals.done()`**, with a message to refuse or without one to allow. Miss one and the player hangs on "connecting" forever.
- `source` here is a temporary id. It changes once they're fully in. Key anything you keep by an identifier like `license:`, not by id.

## Identifiers

```lua
local function identifiers(src)
    local ids = {}
    for _, id in ipairs(GetPlayerIdentifiers(src)) do
        local kind = id:match('^(%w+):')
        if kind and not ids[kind] then ids[kind] = id end
    end
    return ids
end

-- ids.license, ids.discord, ids.fivem, ids.steam ...
```

`license` is the Rockstar license and always present. Everything else is only there if the player has linked it.

## Cards instead of plain text

`deferrals.presentCard` shows an [Adaptive Card](https://adaptivecards.io/designer/) instead of a line of text: images, columns, buttons.

```lua
deferrals.presentCard({
    type = 'AdaptiveCard',
    version = '1.3',
    body = {
        { type = 'TextBlock', text = 'You are 4th in the queue', size = 'Large', weight = 'Bolder' },
        { type = 'TextBlock', text = 'About 2 minutes', isSubtle = true },
    },
    actions = {
        { type = 'Action.OpenUrl', title = 'Discord', url = 'https://discord.gg/yourserver' },
        { type = 'Action.Submit', title = 'Leave queue', data = { action = 'leave' } },
    },
}, function(data)
    if data.action == 'leave' then deferrals.done('You left the queue.') end
end)
```

Call it again to update the card, for example once a second while someone waits in a queue.

## Knowing when they've arrived

`playerJoining` fires once the player has a real server id, and `source` is that new id. That's the right moment to load their data, give them permissions, or move anything you prepared while they were connecting.

```lua
AddEventHandler('playerJoining', function()
    local src = source
    CreateThread(function() loadPlayer(src) end)
end)
```

## More than one resource can defer

A queue, a ban system and a Discord check can all handle `playerConnecting`. FiveM waits for every deferral to finish. Keep each one quick and focused, and don't show a splash screen with a forced wait just to show it.
