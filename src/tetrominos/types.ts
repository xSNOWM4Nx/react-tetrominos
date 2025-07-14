export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export type TetrominoShape = number[][];

export type TetrominoColor =
    | '#00f0f0' // I (Cyan)
    | '#f0f000' // O (Yellow)
    | '#a000f0' // T (Lilac)
    | '#00f000' // S (Green)
    | '#f00000' // Z (Red)
    | '#0000f0' // J (Blue)
    | '#f0a000';// L (Orange)

export const CellStateEnumeration = {
    Empty: 0,
    Active: 1,
    Fixed: 2,
    Ghost: 3,
    Garbage: 4
};
export type CellStateEnumeration = typeof CellStateEnumeration[keyof typeof CellStateEnumeration];

// Cell in the game board
export interface Cell {
    state: CellStateEnumeration;
    value: TetrominoType | null;
    color: TetrominoColor | null;
}

// Game Board
export type Board = Cell[][];

// Tetromino in game
export interface Tetromino {
    type: TetrominoType;
    shape: TetrominoShape;
    color: TetrominoColor;
    rotation: number; // 0, 1, 2, 3
    x: number; // Position on the board
    y: number;
}

// Game state
export const GameStateEnumeration = {
    Init: 0,
    Running: 1,
    Paused: 2,
    GameOver: 3,
    Stopped: 4
};
export type GameStateEnumeration = typeof GameStateEnumeration[keyof typeof GameStateEnumeration];

// Settings
export interface GameSettings {
    controlMode: 'keyboard' | 'buttons';
    showGhostPiece: boolean;
    boardWidth: number; // normaly 10
    boardHeight: number; // normaly 20
}

// Game data
export interface GameData {
    board: Board;
    activeTetromino: Tetromino | null;
    nextTetromino: Tetromino | null;
    holdTetromino: Tetromino | null;
    canHold: boolean;
    score: number;
    level: number;
    lines: number;
    state: GameStateEnumeration;
    settings: GameSettings;
    version: number;
}

export function createEmptyData(boardHeight: number, boardWidth: number): GameData {
    return {
        board: createEmptyBoard(boardHeight, boardWidth),
        activeTetromino: null,
        nextTetromino: null,
        holdTetromino: null,
        canHold: true,
        score: 0,
        level: 1,
        lines: 0,
        state: GameStateEnumeration.Init,
        settings: {
            controlMode: 'keyboard',
            showGhostPiece: true,
            boardWidth: boardWidth,
            boardHeight: boardHeight
        },
        version: 0
    };
};

export function createEmptyBoard(height: number, width: number): Board {
    return Array.from({ length: height }, () =>
        Array.from({ length: width }, () => ({
            state: CellStateEnumeration.Empty,
            value: null,
            color: null
        }))
    );
};
