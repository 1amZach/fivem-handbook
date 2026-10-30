# Permissions

FiveM has a permission system built in: aces and principals. Framework job checks are fine for gameplay, but for "who can use this admin tool" aces are simpler and work everywhere.

## The three commands

All of these go in `server.cfg` (or are run in the console):

```
# a group is allowed something
add_ace group.admin myresource.use allow

# a player belongs to a group
add_principal identifier.license:abc123 group.admin

# groups can inherit from groups
add_principal group.admin group.moderator
```

`allow` grants, `deny` takes away and beats `allow`.

## Checking on the server

```lua
if IsPlayerAceAllowed(src, 'myresource.use') then
    -- ...
end
```

Always check on the server. You can ask from the client for UI purposes (show or hide a button), but the server makes the decision.

## Restricted commands

The third argument to `RegisterCommand` restricts it to players with `command.<name>`:

```lua
RegisterCommand('repairall', function(source, args)
    -- ...
end, true)
```

```
add_ace group.admin command.repairall allow
```

A restricted command registered on the **client** can't check aces, because clients don't know their own principals. If a command needs a permission, register it on the server and have the server tell the client what to do:

```lua
-- server
RegisterCommand('devkit', function(source)
    if not IsPlayerAceAllowed(source, 'devkit') then return end
    TriggerClientEvent('devkit:open', source)
end, false)
```

## One permission per feature

Use your resource name as a prefix and one ace per thing someone might want to grant separately:

```
myresource.use
myresource.spawn
myresource.vip
```

Server owners can then hand out exactly what they mean to.

## Giving permissions from code

Resources can add and remove principals at runtime, which is how you turn something like Discord roles into permissions:

```lua
ExecuteCommand(('add_principal player.%d group.vip'):format(src))
ExecuteCommand(('remove_principal player.%d group.vip'):format(src))
```

`player.<id>` is the principal for whoever is on that server id right now.

Your resource needs permission to run those commands:

```
add_ace resource.myresource command.add_principal allow
add_ace resource.myresource command.remove_principal allow
```

Remove what you added when the player drops, or when your resource stops. Server ids get reused, and the next player on that id shouldn't inherit someone else's groups.
