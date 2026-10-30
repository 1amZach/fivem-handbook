---
layout: home

hero:
  name: FiveM Handbook
  text: Write resources that hold up on a real server
  tagline: The stuff most tutorials skip. State bags, ox_lib, server-side checks, performance, and NUIs built with Svelte.
  actions:
    - theme: brand
      text: Start reading
      link: /guide/getting-started
    - theme: alt
      text: Join the Discord
      link: https://discord.gg/agn

features:
  - title: Never trust the client
    details: Every server event is a door. How to check who is calling, what they sent, and how often, without banning legit players.
    link: /guide/security
  - title: State bags over events
    details: Sync data to everyone who can see an entity, including players who stream it in later, with one line of server code.
    link: /guide/state-bags
  - title: Permissions that make sense
    details: Aces, principals and restricted commands, and how to drive them straight from Discord roles.
    link: /guide/permissions
  - title: 0.00 ms is a habit
    details: Threads that sleep when nothing is happening, and only run every frame when they actually have to.
    link: /guide/performance
  - title: Real UIs with Svelte
    details: A Vite + Svelte NUI that builds to plain files, talks to Lua both ways, and can be styled in a normal browser.
    link: /guide/nui
  - title: From folder to release
    details: Configs, convars for secrets, a README people read, and a license so others can actually use your work.
    link: /guide/shipping
---
