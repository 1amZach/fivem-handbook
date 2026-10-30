# Saving data

There are two good places to keep data, and picking the right one saves you a database table you didn't need.

## KVP: small, simple, no setup

Key/value storage built into FiveM. Strings, ints and floats.

```lua
SetResourceKvp('favourites', json.encode(list))
local raw = GetResourceKvpString('favourites')

SetResourceKvpInt('remember', 1)
local remember = GetResourceKvpInt('remember') -- 0 when it was never set
```

Where it lives depends on where you call it:

- **On the client**, it's saved on that player's machine, per server. Perfect for preferences: favourites, menu positions, last used settings. Nothing to clean up when they leave, and it never touches your server.
- **On the server**, it's saved on the server. Good for small resource-wide data: temporary priority grants, a cached message id, a few settings.

Decode defensively. If the data was written by an older version, or got corrupted, a bare `json.decode` will throw:

```lua
local function load(key, default)
    local raw = GetResourceKvpString(key)
    if not raw then return default end
    local ok, value = pcall(json.decode, raw)
    return ok and type(value) == 'table' and value or default
end
```

To list keys by prefix (server or client):

```lua
local handle = StartFindKvp('prio:')
while true do
    local key = FindKvp(handle)
    if not key then break end
    print(key, GetResourceKvpString(key))
end
EndFindKvp(handle)
```

## oxmysql: anything you query

Once data needs searching, sorting, joining or sharing across resources, it belongs in MySQL or MariaDB. [oxmysql](https://github.com/overextended/oxmysql) is the standard.

```lua
-- fxmanifest.lua
server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/main.lua',
}
```

```lua
local rows = MySQL.query.await('SELECT * FROM bans WHERE license = ?', { license })
local id = MySQL.insert.await('INSERT INTO bans (license, reason) VALUES (?, ?)', { license, reason })
local changed = MySQL.update.await('UPDATE bans SET active = 0 WHERE id = ?', { id })
local count = MySQL.scalar.await('SELECT COUNT(*) FROM bans WHERE active = 1')
local ban = MySQL.single.await('SELECT * FROM bans WHERE id = ?', { id })
```

Always pass values as `?` parameters. Never build SQL by concatenating strings, especially anything a player typed.

## Which one?

| You're storing | Use |
|---|---|
| A player's UI preferences | Client KVP |
| A handful of server-wide values | Server KVP |
| Anything per character, searchable, or shared | oxmysql |
| Something every client needs to see right now | A [state bag](./state-bags), backed by one of the above |
