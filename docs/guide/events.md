# Client, server and events

Every player runs their own copy of your client scripts. There's one copy of your server scripts. Events are how the two talk.

## The four directions

```lua
-- client -> server
TriggerServerEvent('myresource:buy', itemName)

-- server -> one client
TriggerClientEvent('myresource:bought', source, itemName)

-- server -> every client
TriggerClientEvent('myresource:announce', -1, text)

-- same side only (client -> client, or server -> server)
TriggerEvent('myresource:changed', data)
```

To receive an event that comes over the network, register it with `RegisterNetEvent`. Events registered with plain `AddEventHandler` can only be triggered from the same side, which is exactly what you want for internal events.

```lua
RegisterNetEvent('myresource:buy', function(itemName)
    local src = source
    -- ...
end)
```

## Capture `source` immediately

`source` is a global that FiveM sets right before your handler runs. The moment your code yields (`Wait`, an `await`, a database call), another event can run and change it.

```lua
RegisterNetEvent('myresource:buy', function(itemName)
    local src = source            -- do this first, always
    local price = MySQL.scalar.await('SELECT price FROM items WHERE name = ?', { itemName })
    -- source could be someone else by now, src is still right
    TriggerClientEvent('myresource:bought', src, itemName, price)
end)
```

## Name events after your resource

`myresource:buy`, not `buy`. Every resource on the server shares one event namespace, and a generic name will eventually collide with someone else's.

## Callbacks instead of event ping-pong

Asking the server a question with events means a request event, a response event, and some way to match them up. ox_lib's callbacks do that for you:

```lua
-- server
lib.callback.register('myresource:getBalance', function(source)
    return getBalance(source)
end)

-- client
local balance = lib.callback.await('myresource:getBalance', false)
```

The second argument is a delay in ms before the request is sent, used to stop spam. `false` sends it straight away.

Callbacks only return to the player who asked, and the server side receives the real `source` as its first argument. You still have to [check everything they send](./security).

## Exports for talking to other resources

Events are fire-and-forget. When another resource needs an answer, use an export:

```lua
-- in yourresource
exports('getLevel', function(source)
    return levels[source] or 1
end)

-- in anyone else's resource
local level = exports.yourresource:getLevel(source)
```

Exports run synchronously in the caller's thread. If yours waits on HTTP or the database, say so in your README, because the caller has to be in a thread for that to work.
