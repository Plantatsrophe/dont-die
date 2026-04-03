// main.js — Single entry point for the Don't Die game
// Imports trigger all module side-effects (event listeners in input.js, etc.)
import { parseMap, resetPlayerPosition } from './logic/spawner.js';
import { gameLoop } from './core/game.js';
import './core/input.js'; // Side-effect: registers all keyboard/touch event listeners

// Boot sequence
parseMap();
resetPlayerPosition();

// Expose to window for console access (Cheats/Debugging)
window.parseMap = parseMap;
window.resetPlayerPosition = resetPlayerPosition;

requestAnimationFrame(gameLoop);
