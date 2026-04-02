// main.js — Single entry point for the Don't Die game
// Imports trigger all module side-effects (event listeners in input.js, etc.)
import { parseMap, resetPlayerPosition } from './spawner.js';
import { gameLoop } from './game.js';
import './input.js'; // Side-effect: registers all keyboard/touch event listeners

// Boot sequence
parseMap();
resetPlayerPosition();
requestAnimationFrame(gameLoop);
