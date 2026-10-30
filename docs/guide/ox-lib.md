# ox_lib essentials

ox_lib is a shared library most modern resources depend on. Add `'@ox_lib/init.lua'` to `shared_scripts` and you get the `lib` table and `cache` on both sides.

## cache

`cache` holds values you'd otherwise call natives for every frame:

```lua
cache.ped       -- PlayerPedId()
cache.vehicle   -- the vehicle you're in, or false
cache.seat      -- your seat, -1 is the driver
cache.playerId  -- PlayerId()
cache.serverId  -- your server id
cache.resource  -- GetCurrentResourceName()
```

React to changes with `lib.onCache`:

```lua
lib.onCache('vehicle', function(vehicle)
    if vehicle then
        print('got in', vehicle)
    end
end)
```

::: warning The handler runs before cache updates
Inside the callback, `cache.vehicle` still holds the **old** value. Use the argument you're given. If you need the rest of the cache to be current too, wait a frame first:

```lua
lib.onCache('seat', function()
    CreateThread(function()
        Wait(0)
        if cache.seat == -1 then startDriving(cache.vehicle) end
    end)
end)
```
:::

## Notifications and text UI

```lua
lib.notify({ description = 'Saved', type = 'success' })

-- markdown works, two trailing spaces make a line break
lib.showTextUI('[E] Repair  \n[Backspace] Cancel', { position = 'left-center' })
lib.hideTextUI()
```

## Menus: pick the right one

ox_lib has two menu styles and they're good at different things.

- **`lib.registerMenu`** is keyboard driven and works while driving or walking. Use it for things players do in the middle of gameplay. It supports side-scroll values (left/right to pick an option) and checkboxes.
- **`lib.registerContext`** is mouse driven and takes NUI focus. Use it for management screens where the player is standing still.

```lua
lib.registerMenu({
    id = 'sounds',
    title = 'Engine sound',
    position = 'top-right',
    options = {
        { label = 'Adder', values = { 'Apply', 'Favourite' }, args = 'adder', close = false },
    },
    onSelected = function(selected, secondary, args)
        -- fires as you scroll, perfect for previews
    end,
    onClose = function(keyPressed)
        if keyPressed == 'Backspace' then openParentMenu() end
    end,
}, function(selected, scrollIndex, args)
    -- Enter pressed. scrollIndex says which value was showing
end)

lib.showMenu('sounds')
```

`close = false` keeps the menu open after Enter, so players can try several options without reopening it.

## Asking for input

```lua
local input = lib.inputDialog('Place prop', {
    { type = 'input', label = 'Model', default = 'prop_bench_01a', required = true },
})
if not input then return end -- they cancelled
local model = input[1]
```

## Progress and skill checks

```lua
if not lib.skillCheck({ 'easy', 'easy', 'medium' }, { 'e' }) then
    return lib.notify({ description = 'Your hand slipped', type = 'error' })
end

local done = lib.progressCircle({
    duration = 12000,
    label = 'Patching up the engine',
    canCancel = true,
    disable = { move = true, car = true, combat = true },
    anim = { dict = 'mini@repair', clip = 'fixing_a_ped' },
})
```

Both block until they finish, so call them from a thread or a callback.

## Small helpers worth knowing

```lua
lib.requestModel(hash)                       -- loads a model, errors if it can't
lib.getClosestVehicle(coords, 5.0, false)    -- nearest vehicle within 5m
lib.setClipboard(text)                       -- copy to the player's clipboard
lib.waitFor(function() ... end, nil, 3000)   -- poll until it returns non-nil, error on timeout
```

`lib.waitFor` throws when it times out, so wrap it in `pcall` when timing out is a normal outcome rather than a bug.
