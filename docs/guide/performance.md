# Performance

Players notice frame drops long before they notice features. The good news is that most of the cost in FiveM resources comes from one habit, and it's easy to break.

## Measure first

In the client F8 console:

```
resmon 1
```

The **CPU msec** column is how long your resource spent per frame. Idle resources should sit at 0.00. Anything you can see while just standing around deserves a look.

## The main offender: `Wait(0)` forever

```lua
CreateThread(function()
    while true do
        local coords = GetEntityCoords(PlayerPedId())
        if #(coords - shop) < 2.0 then
            -- draw a prompt
        end
        Wait(0)
    end
end)
```

This runs every frame for the whole session, even when the player is on the other side of the map.

Run slowly by default and only speed up when there's a reason:

```lua
CreateThread(function()
    while true do
        local sleep = 1000
        local distance = #(GetEntityCoords(cache.ped) - shop)

        if distance < 20.0 then
            sleep = 0
            if distance < 2.0 then
                -- draw a prompt
            end
        end

        Wait(sleep)
    end
end)
```

## Some things really do need every frame

Disabling controls, drawing markers and text, and a few natives like `SetVehicleEngineTorqueMultiplier` only last one frame. For those, decide each loop whether you need the next frame at all:

```lua
while driving do
    local everyFrame = false

    if torque < 1.0 then
        SetVehicleEngineTorqueMultiplier(vehicle, torque)
        everyFrame = true
    end

    if holdingBrake then
        DisableControlAction(0, 72, true)
        everyFrame = true
    end

    Wait(everyFrame and 0 or 100)
end
```

A healthy car costs nothing, a damaged one pays for the work it actually needs.

## Do heavy work on a timer, not per frame

If the expensive part only needs to happen ten times a second, keep a timestamp and skip it in between, even inside a fast loop:

```lua
local lastTick = 0
while true do
    local now = GetGameTimer()
    if now - lastTick >= 100 then
        lastTick = now
        -- read health, do maths, write back
    end
    -- per-frame bits here
    Wait(0)
end
```

## Start threads when they're needed

Don't run a "am I in a vehicle?" loop forever. React to the change and start the work then:

```lua
lib.onCache('vehicle', function(vehicle)
    if vehicle then CreateThread(function() drive(vehicle) end) end
end)
```

`drive` loops `while cache.vehicle == vehicle` and ends on its own when you get out.

## Smaller wins

- Use `cache.ped` and `cache.vehicle` instead of calling `PlayerPedId()` every loop.
- Compare distances with `#(a - b)`. It's a native vector operation and much cheaper than `GetDistanceBetweenCoords`.
- Build tables you reuse once, outside the loop. Allocating a new table every frame adds garbage collector work.
- One ray cast per frame is fine. Prefer the synchronous `StartExpensiveSynchronousShapeTestLosProbe` when you draw based on the result, since the async version lags a frame and makes things flicker.
