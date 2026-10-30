# State bags

A state bag is a small key/value store attached to an entity, a player, or the server. When the server writes to one, FiveM syncs it to every client that can see that thing, including players who join or stream it in later.

That last part is why state bags beat events for anything that describes an entity. With an event, a player who wasn't nearby when you fired it never finds out. With a state bag, they get the current value the moment the car streams in.

## Three kinds

```lua
Entity(vehicle).state       -- per entity (vehicles, peds, objects)
Player(source).state        -- per player
GlobalState                 -- one for the whole server
```

## Writing

```lua
-- server
Entity(vehicle).state:set('engineSound', 'adder', true)
```

The third argument is `replicated`. `true` sends it to clients, `false` keeps it on the server.

You can also assign directly, `Entity(vehicle).state.engineSound = 'adder'`, which replicates by default on the server. `:set` makes your intent obvious, so prefer it.

Set a key to `nil` to remove it.

::: tip Let the server write
Clients can write to state bags on entities they own, but then any cheat can too. Have the client ask the server with an event, [check the request](./security), and let the server write the bag.
:::

## Reading

```lua
local sound = Entity(vehicle).state.engineSound
```

Reading is free. No network traffic, no callbacks.

## Reacting to changes

```lua
AddStateBagChangeHandler('engineSound', nil, function(bagName, key, value)
    local vehicle = GetEntityFromStateBagName(bagName)
    if vehicle == 0 then return end
    applySound(vehicle, value) -- value is nil when the key was cleared
end)
```

The first argument filters by key, the second by bag name. `nil` means "any".

### The entity might not exist yet

This catches everyone once. When a car streams in, its state bag can arrive a moment **before** the entity exists on your client, so `GetEntityFromStateBagName` returns `0` and the change gets dropped.

Wait for it:

```lua
AddStateBagChangeHandler('engineSound', nil, function(bagName, _, value)
    CreateThread(function()
        local ok, vehicle = pcall(lib.waitFor, function()
            local entity = GetEntityFromStateBagName(bagName)
            if entity ~= 0 then return entity end
        end, nil, 5000)

        if ok then applySound(vehicle, value) end
    end)
end)
```

## What to put in them

Keep bags small: a few values that describe the thing. They're sent to everyone nearby every time they change.

A pattern that works well for edits that must be reversible: store both the original and the change together.

```lua
Entity(vehicle).state:set('handling', {
    stock = { fMass = 1400.0, fBrakeForce = 0.8 },
    edits = { fBrakeForce = 1.2 },
}, true)
```

Every client can apply `edits`, and when the key is cleared they still know what `stock` was and can put the car back.

## Player state

`Player(source).state` is a good place for things other resources want to read without calling your exports: a job, a duty status, a Discord name.

```lua
-- server
Player(src).state:set('onDuty', true, true)

-- any client
if LocalPlayer.state.onDuty then ... end
```

`LocalPlayer.state` is the client's view of its own player bag.
