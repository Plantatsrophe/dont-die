# DON'T DIE 💀

A brutal, zero-dependency retro platformer for your browser—now fully refactored in **TypeScript**. 100 levels of pure pixelated pain.

## The Pitch
You're a little guy in a big, dangerous world. There are lasers, spikes, bots, and pits. Your goal is pretty simple: **Don't Die.** 

We've packed 100 hand-crafted levels into this thing. It starts easy enough in the Slums, but by the time you're deep in the Sewers or facing the Goliath boss in the final gauntlet, you'll be wishing for a "Pause" button (there isn't one).

## How to Play
1. Open `index.html` in any modern browser (Chrome, Firefox, Edge).
2. Hit **Enter** to start.
3. Reach the exit portal in each level to progress. 

### Controls
* **Move:** `W,A,S,D` or `Arrow Keys`
* **Jump:** `Spacebar` (Tap it twice for a double-jump)
* **Enter:** Confirm your initials on the high-score screen.

## What's Inside?
- **100 Levels**: Five different biomes including the Slums, Sewers, Central Shaft, and the massive Factory.
- **Nasty Enemies**: Roaming bots and stationary Laser Bots that track your every move. Pro tip: Stomp them from above for `+200pts`.
- **Items**: Snag Gears for points or find Hotdogs for an extra life. You're going to need every single one of them.
- **Synthwave Soundtrack**: Procedurally generated music using the Web Audio API—no MP3s, just pure code-driven synth.
- **Global High Scores**: Save your legacy to the local leaderboard.

## Project Structure (For the Devs)
The game is built with **TypeScript (ESM)**—modular, type-safe, and high-performance.
- [src/main.ts](file:///e:/Dont%20Die/dont-die/src/main.ts): The entry point and boot sequence.
- [src/core/game.ts](file:///e:/Dont%20Die/dont-die/src/core/game.ts): The main game loop and state management.
- [src/core/physics.ts](file:///e:/Dont%20Die/dont-die/src/core/physics.ts): Character movement and AABB collision.
- [src/core/globals.ts](file:///e:/Dont%20Die/dont-die/src/core/globals.ts): Centralized game state and shared constants.
- [src/logic/](file:///e:/Dont%20Die/dont-die/src/logic/): Spawning and entity logic.
- [src/render/](file:///e:/Dont%20Die/dont-die/src/render/): Modular rendering engine (Canvas-based).
- [src/data/levels.ts](file:///e:/Dont%20Die/dont-die/src/data/levels.ts): The map data for the entire 100-level gauntlet.
- [sw.js](file:///e:/Dont%20Die/dont-die/sw.js): Service worker for offline support (PWA).

## Development
To build the project and compile TypeScript to the `src/dist` folder:
1. Install dependencies: `npm install`
2. Run build: `npm run build`
3. Watch mode for active development: `npm run watch`

## Cheat Codes (Browser Console)
You can manipulate the game state directly via the browser console (F12):
- `skipLevel(index)`: Skip to any level (0-99). Example: `skipLevel(38)` for Level 39.
- `player.lives = 99`: Give yourself extra lives.
- `player.score = 5000`: Set your current score.
- `player.speed = 400`: Increase movement speed.
- `G.timer = 120`: Reset or increase the level timer.
- `resetPlayerPosition()`: Respawn at the start of the current level.

## Custom Maps
If the 100 levels aren't enough, you can regenerate the entire world using the Python script:
```bash
python generate_levels.py
```

---
*Good luck. You'll need it.*