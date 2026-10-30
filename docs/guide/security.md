# Never trust the client

Anything the client sends can be faked. Cheat menus can trigger any net event your resource registers, with any arguments, as often as they like. That isn't a bug in FiveM, it's how networking works.

So every `RegisterNetEvent` and every `lib.callback.register` on the server is a public door. Before it does anything, it has to answer four questions.

## 1. Is this player allowed to do this at all?

```lua
if not IsPlayerAceAllowed(src, 'myresource.use') then return end
```

Permissions belong on the server. Hiding a button on the client stops nobody.

## 2. Is what they sent the kind of thing you expect?

Check types, then check the value is one you actually offer.

```lua
RegisterNetEvent('enginesounds:set', function(netId, audio)
    local src = source

    -- the sound has to be one from the config, not any string they like
    if type(audio) ~= 'string' or not soundsByName[audio] then return end
    -- ...
end)
```

For numbers, clamp to a range instead of trusting it:

```lua
local function clamp(v, min, max)
    v = tonumber(v)
    if not v or v ~= v then return nil end   -- v ~= v catches NaN
    return math.max(min, math.min(max, v))
end
```

## 3. Does the target make sense for this player?

This is the one most resources miss. The event says "change the engine sound on vehicle 1234". Is 1234 even a vehicle? Is this player the one driving it?

```lua
local vehicle = NetworkGetEntityFromNetworkId(tonumber(netId) or 0)
if vehicle == 0 or not DoesEntityExist(vehicle) or GetEntityType(vehicle) ~= 2 then return end

if GetPedInVehicleSeat(vehicle, -1) ~= GetPlayerPed(src) then return end
```

Same idea for anything location-based. If a repair needs the player next to the car, check the distance on the server:

```lua
if #(GetEntityCoords(GetPlayerPed(src)) - GetEntityCoords(vehicle)) > 8.0 then return end
```

Server-side coordinates come from the last synced position, so leave some slack.

## 4. Are they doing it too often?

```lua
local last = {}

RegisterNetEvent('myresource:action', function()
    local src = source
    local now = GetGameTimer()
    if last[src] and now - last[src] < 500 then return end
    last[src] = now
    -- ...
end)

AddEventHandler('playerDropped', function()
    last[source] = nil
end)
```

Clear the table on `playerDropped` or it grows forever.

## Don't ban on the first bad request

It's tempting to ban anyone who trips a check. Don't, or at least not automatically. A player whose permissions were removed a second ago, a slow network replaying an old event, or a bug in your own client code all look like "exploiting" from the server. Ignore the request and log it. Ban on patterns, by a human.

## Let the server decide the outcome

If an action costs money or uses an item, take it on the server, then tell the client it worked. Never the other way round.

```lua
lib.callback.register('vehicledamage:repair', function(src, netId)
    -- ...checks...
    if not exports.ox_inventory:RemoveItem(src, 'repairkit', 1) then
        return false, 'no_item'
    end
    return true
end)
```

The client only fixes the car after the server says yes.
