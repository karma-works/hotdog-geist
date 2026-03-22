# Hotodog-Geist — Game Design Document

> Captured from initial design interview, 2026-03-22

---

## Overview

| Field | Value |
|---|---|
| Working Title | Hotodog-Geist |
| Platform | Browser (HTML5) |
| Genre | Pixel Art Platformer / Top-Down Action (mixed) |
| Target Audience | Boys, 6 years and up |
| Player Mode | Local Co-op (2 players, shared screen) |
| Language | English & German (localized) |
| Audio | Sound effects + music (no voice acting) |

---

## Story Concept

Two police officers — a main character and his loyal companion cop — patrol a world overrun by evil monsters and ghosts. Together they chase down criminals, give speeding tickets, protect their police castle, and hunt ghosts through a haunted castle. A parrot tags along and delivers hilariously oversized pieces of clothing to the officers.

---

## Characters

### Player 1 — Main Policeman
- Classic pixel-art police officer
- Can shoot (stun gun / pistol), arrest, and drive vehicles
- Player 1 in local co-op

### Player 2 — Companion Cop
- Always accompanies the main character
- Same abilities as main character
- Player 2 in local co-op
- Never leaves Player 1's side — camera keeps both on screen

### The Parrot
- Flies alongside the players
- Periodically delivers a piece of clothing that is comically too large for the officer (visual gag — oversized hat, enormous coat, giant gloves)
- Humorous recurring bit; clothing pieces have no gameplay effect (purely comedic)
- Functions as a visual mascot and comic relief character

### Evil Monsters
- Various pixel-art monster designs
- Can be stunned by shooting, then automatically arrested (handcuffs animation)
- End up in jail after arrest

### Ghosts (Castle Levels)
- Spooky pixel-art ghosts
- Found hiding in rooms, behind furniture, in beds (ghost dormitory)
- Same stun → arrest mechanic as monsters

---

## Core Mechanics

### Stun & Arrest
1. Player shoots an enemy (monster or ghost) → enemy is stunned
2. Walk up to stunned enemy → handcuffs animation plays automatically
3. Enemy is transported to jail / captured

### Local Co-op
- Both players share the same screen
- Player 1 controls the main officer, Player 2 controls the companion
- Camera follows both players; zooms out to keep both visible
- Both players must cooperate to clear levels

### Vehicles
- Players can enter police vehicles for driving sections
- **Speed Trap mechanic:** Player 2 drives the police car; Player 1 must chase and pull over speeding vehicles → ticket-giving animation plays
- Both players can be inside the vehicle

---

## Levels

### 1. City Streets (Tutorial / Home Base)
- Side-scrolling platformer style
- Introduction to stun & arrest mechanics
- Evil monsters roam the streets
- Parrot first appears here with first oversized clothing gag

### 2. Police Castle (Defense Level)
- **Style:** Top-down or isometric view of the castle grounds
- Ghosts approach the castle from outside, trying to breach the walls
- Police officers defend the castle — shoot incoming ghosts before they enter
- Wave-based defense gameplay
- Castle has towers, gates, and walls

### 3. Ghost Castle (Exploration / Hunt Level)
- **Style:** Side-scrolling with multi-floor exploration
- Dark, spooky atmosphere — candles, cobwebs, creaking floors
- Multiple floors connected by stairs
- Rooms to search: hallways, towers, the **Ghost Dormitory** (ghosts sleeping in ghost beds — must be woken and caught)
- Ghosts hide in corners, behind furniture, in closets
- Both players must sweep the entire castle to find all ghosts

### 4. Train Level
- Side-scrolling action on a moving train
- Cars roll past in the background
- Monsters and ghosts on board
- Players move between train carriages
- Possible: roof-jumping sequences between carriages

### 5. Police Ship Level
- Side-scrolling on/in a police vessel
- Above-deck and below-deck sections
- Water hazards
- Maritime monster enemies

### 6. Car / Road Level
- Top-down driving view
- Player drives police car through city
- **Speed Trap gameplay:** Chase speeding cars → pull them over → ticket animation
- Monsters also roam the road

---

## Art Direction

- **Style:** Pixel art — bright, chunky, readable sprites with clear silhouettes
- **Color palette:** Per-level theming:
  - Streets: warm daylight, blues and yellows
  - Police Castle: stone greys, bright flags, daylight
  - Ghost Castle: desaturated dark purples/blues, candle-orange highlights
  - Train: warm browns and reds, motion blur backgrounds
  - Ship: ocean blues and teals
  - Road: asphalt greys, neon speed signs
- **Characters:** Bold outlines, exaggerated proportions (big heads, stubby bodies) — readable for young players
- **Parrot gag:** Clothing items drawn oversized relative to the officer's sprite — hat three times the head size, coat dragging on the floor, etc.

---

## Audio

- **Music:** Level-specific looping chiptune / pixel-art style tracks
  - Upbeat cop theme for city/road levels
  - Dramatic heroic fanfare for police castle defense
  - Eerie, creepy tune for ghost castle
  - Fast-paced action music for train/ship
- **Sound Effects:**
  - Stun gun / shoot
  - Handcuff click
  - Ghost wail
  - Monster defeated
  - Arrest whistle
  - Parrot squawk + comedy slide whistle for oversized clothing gags
  - Ticket printer / speed camera click
  - Vehicle engine sounds

---

## Technology Recommendation

### Recommended Engine: **Phaser 3** (TypeScript)

**Why Phaser 3:**

| Requirement | Phaser 3 Support |
|---|---|
| Browser-native | Yes — outputs pure HTML5/WebGL/Canvas |
| TypeScript | First-class TypeScript support |
| Pixel art rendering | Built-in `pixelArt: true` flag; crisp nearest-neighbor scaling |
| Mixed platformer + top-down | Scene system supports both; Arcade Physics for platformer, no-physics top-down trivially implemented |
| Local co-op (2 keyboards/gamepads) | Multi-input built in: keyboard cursors + WASD or two gamepads |
| Tilemaps (multi-floor castle) | Tiled map editor integration out of the box |
| Animation system | Sprite sheet animations, state machines possible |
| Scene management (levels) | Built-in Scene Manager — each level is its own Scene |
| Camera system | Camera follows, zoom, multi-camera for split-screen if ever needed |
| Localization | No built-in i18n, but trivially added (e.g. `i18next`) |
| Community & resources | Largest HTML5 game framework community; massive example library |

**Alternatives considered:**

| Engine | Reason not chosen |
|---|---|
| Excalibur.js | TypeScript-first and clean, but smaller community and fewer pixel-art-specific utilities |
| Kaboom.js | Good for quick prototypes, but less suitable for multi-scene, multi-mechanic games of this scope |
| PixiJS | Rendering engine only — would need to build physics, scene management, input system on top |
| Unity (WebGL) | Overkill for a browser pixel art game; large build sizes; not TypeScript-native |

### Recommended Stack

```
phaser@3.x          — game engine
typescript          — language
vite                — dev server + bundler (fast HMR, excellent TS support)
tiled               — tilemap editor (exports JSON, Phaser reads natively)
i18next             — English/German localization
```

### Project Bootstrap

```bash
npm create vite@latest hotodog-geist -- --template vanilla-ts
cd hotodog-geist
npm install phaser
npm install i18next
```

---

## Resolved Design Decisions

| Question | Decision | Rationale |
|---|---|---|
| Win condition | All enemies stunned & arrested per level | Clear, achievable goal for young players |
| Lose condition | 3 lives (shared between both cops); respawn on spot | Co-op lives pool keeps both players invested |
| Progression | Linear level order with an overworld map screen | Simple to navigate for 6-year-olds; unlocks one by one |
| Save system | `localStorage` (auto-save after each completed level) | No account needed; instant resume in browser |
| Parrot clothing items | 6 items: oversized hat, enormous coat, giant gloves, huge boots, comically large badge, massive scarf | One item delivered per level as a running gag |
| Enemies per level | 5–10 per level (tunable per-scene constant) | Low enough to not overwhelm; enough for satisfaction |
| Speed trap scoring | 1–3 stars per road level (based on tickets issued vs. speeders escaped) | Familiar star system; encourages replay |

## Technology Decision — Rationale Summary

**Phaser 3** was chosen over all alternatives for this specific project:

- **Pixel art**: `pixelArt: true` config flag enables crisp nearest-neighbor scaling globally — no per-sprite config needed
- **Mixed genres**: Phaser's `Scene` system lets each level be its own self-contained class — platformer physics in one, pure top-down in another, zero coupling
- **Local co-op input**: `this.input.keyboard` + gamepad API both supported; two independent input contexts trivially wired to two player objects
- **Ghost castle multi-floor**: Tiled `.tmj` tilemaps load natively via `this.make.tilemap()` — stairs, rooms, and the ghost dormitory are authored in Tiled, not hardcoded
- **Localization**: `i18next` drops in as a plain TS import; language switch at runtime with no engine involvement
- **Community**: Phaser 3 has the largest HTML5 game community — tutorials, plugins, and answers are abundant, reducing friction for a game of this scope

**Rejected alternatives:**
- **Excalibur.js** — TypeScript-native but smaller ecosystem; fewer ready examples for pixel art + tilemap workflows
- **Kaboom.js** — Excellent for jams, but global mutable state model does not scale well to 6+ distinct level scenes
- **PixiJS** — Rendering only; physics, scene management, and input would all need custom implementation
- **Unity WebGL** — Oversized bundle (~10 MB+), C# not TypeScript, overkill for a 2D browser pixel game

## Open Questions / Next Steps

- [ ] Commission or create pixel art asset list (characters, tilesets, UI)
- [ ] Author tilemaps in Tiled for Ghost Castle and Police Castle levels
- [ ] Define exact enemy patrol paths per level
- [ ] Decide on boss enemies (one per world arc?)
