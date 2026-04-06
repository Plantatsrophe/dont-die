export interface IRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export type GameState = 'START' | 'INTRO' | 'INSTRUCTIONS' | 'PLAYING' | 'DYING' | 'LEVEL_CLEAR' | 'VALVE_CUTSCENE' | 'GAMEOVER' | 'WIN' | 'CREDITS' | 'ENTER_INITIALS' | 'CREDITS_CUTSCENE';

export interface ICamera {
    x: number;
    y: number;
}

export interface IPlayer {
    x: number;
    y: number;
    startX: number;
    startY: number;
    width: number;
    height: number;
    vx: number;
    vy: number;
    speed: number;
    jumpPower: number;
    gravity: number;
    walkTimer: number;
    isOnGround: boolean;
    doubleJump: boolean;
    isClimbing: boolean;
    riding: IPlatform | null;
    rideOffsetX: number;
    lives: number;
    score: number;
    color: string;
    lastDir?: number;
    dyingTimer?: number;
    portalX?: number;
    portalY?: number;
    cutsceneTimer?: number;
    droppingThrough?: boolean;
}

export interface IPlatform {
    x: number;
    y: number;
    width: number;
    height: number;
    vx: number;
    vy: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    type: string;
}

export interface IEntity {
    x: number;
    y: number;
    width: number;
    height: number;
    active?: boolean;
    type: string;
}

export interface IEnemy extends IEntity {
    vx: number;
    vy: number;
    dir: number;
    cooldown: number;
}

export interface IItem extends IEntity {
    collected: boolean;
}

export interface ILaser extends IEntity {
    vx: number;
}

export interface IParticle extends IEntity {
    vx: number;
    vy: number;
    size: number;
    life: number;
    maxLife: number;
    color?: string;
    qx?: number;
    qy?: number;
    flip?: boolean;
}

export interface IBoss extends IEntity {
    hp: number;
    maxHp?: number;
    phase: number;
    timer: number;
    hurtTimer: number;
    vibrateX: number;
    isSinking?: boolean;
    isDying?: boolean;
    triggered?: boolean;
    throwsLeft?: number;
    startX?: number;
    startY?: number;
    vx: number;
    vy: number;
    hasSeenPlayer: boolean;
    squash: number;
    squashTimer: number;
    projs?: any[];
}

export interface IBomb extends IEntity {
    active: boolean;
    vx: number;
    vy: number;
    col: number;
    row: number;
}

export interface ILevel {
    level: number;
    biome: string;
    isBoss: boolean;
    map: string[];
}

export interface IGlobals {
    gameState: GameState;
    activeValvePos: { x: number, y: number } | null;
    purifiedValves: { x: number, y: number }[];
    valveCutsceneTimer: number;
    introY: number;
    timer: number;
    timerAcc: number;
    winTimer: number;
    enemyWalkTimer: number;
    currentLevel: number;
    initials: string[];
    initialIndex: number;
    gameStartTime: number;
    highScores: { name: string, score: number }[];
    isMusicPlaying: boolean;
    spacePressed: boolean;
    mapRows: number;
    mapCols: number;
    map: number[][]; // Grid of tile IDs
    items: IItem[];
    enemies: IEnemy[];
    lasers: ILaser[];
    particles: IParticle[];
    platforms: IPlatform[];
    bombs: IBomb[];
    boss: IBoss;
    camera: ICamera;
    isMapCached: boolean;
    acidPurified: boolean;
    cleanedPipes: any[]; 
    audioCtx: AudioContext | null;
    _chk: number;
    nextLaserIndex: number;
    nextParticleIndex: number;
}

declare global {
    interface Window {
        G: IGlobals;
        player: IPlayer;
        refreshLeaderboard: () => Promise<void>;
        saveScore: () => Promise<void>;
        parseMap: (fullReset?: boolean) => void;
        resetPlayerPosition: () => void;
        skipLevel: (n: number) => void;
        goToLevel: (n: number) => void;
        nextLevel: () => void;
        addLives: (n: number) => void;
        godMode: (on?: boolean) => void;
        staticLevels: ILevel[];
        logoImg?: HTMLImageElement;
        logoOsc?: HTMLCanvasElement;
        fetchHighScores?: () => Promise<{ initials: string, score: number }[]>;
        submitHighScore?: (initials: string, score: number, playtime: number) => Promise<void>;
    }
}
