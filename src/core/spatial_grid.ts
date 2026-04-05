import { TILE_SIZE, G } from './globals.js';
import type { IEntity } from '../types.js';

const CELL_SIZE = 200;
const grid = new Map<string, IEntity[]>();

export function updateSpatialGrid() {
    grid.clear();
    
    // Insert enemies
    for (const e of G.enemies) {
        insertToGrid(e);
    }
    
    // Insert items
    for (const i of G.items) {
        if (!i.collected) insertToGrid(i);
    }
    
    // Insert platforms
    for (const p of G.platforms) {
        insertToGrid(p as unknown as IEntity);
    }
}

function insertToGrid(entity: IEntity) {
    const xStart = Math.floor(entity.x / CELL_SIZE);
    const xEnd = Math.floor((entity.x + entity.width) / CELL_SIZE);
    const yStart = Math.floor(entity.y / CELL_SIZE);
    const yEnd = Math.floor((entity.y + entity.height) / CELL_SIZE);
    
    for (let x = xStart; x <= xEnd; x++) {
        for (let y = yStart; y <= yEnd; y++) {
            const key = `${x}_${y}`;
            let cell = grid.get(key);
            if (!cell) {
                cell = [];
                grid.set(key, cell);
            }
            cell.push(entity);
        }
    }
}

const QUERY_RESULTS: IEntity[] = [];

export function queryGrid(x: number, y: number, w: number, h: number): IEntity[] {
    QUERY_RESULTS.length = 0;
    const xStart = Math.floor(x / CELL_SIZE);
    const xEnd = Math.floor((x + w) / CELL_SIZE);
    const yStart = Math.floor(y / CELL_SIZE);
    const yEnd = Math.floor((y + h) / CELL_SIZE);
    
    const seen = new Set<IEntity>();
    
    for (let gx = xStart; gx <= xEnd; gx++) {
        for (let gy = yStart; gy <= yEnd; gy++) {
            const key = `${gx}_${gy}`;
            const cell = grid.get(key);
            if (cell) {
                for (const ent of cell) {
                    if (!seen.has(ent)) {
                        seen.add(ent);
                        QUERY_RESULTS.push(ent);
                    }
                }
            }
        }
    }
    return QUERY_RESULTS;
}
