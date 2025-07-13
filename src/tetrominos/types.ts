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

// Cell in the game board
export interface Cell {
    value: TetrominoType | null;
    color: TetrominoColor | null;
    ghost?: boolean; // Optional for Ghost Piece (Guideline-Feature)
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
export type GameStatus = 'playing' | 'paused' | 'gameover' | 'init';

// Settings
export interface GameSettings {
    controlMode: 'keyboard' | 'buttons';
    showGhostPiece: boolean;
    boardWidth: number; // normaly 10
    boardHeight: number; // normaly 20
}

// Game State
export interface GameState {
    board: Board;
    activeTetromino: Tetromino | null;
    nextTetromino: Tetromino | null;
    holdTetromino: Tetromino | null;
    canHold: boolean;
    score: number;
    level: number;
    lines: number;
    status: GameStatus;
    settings: GameSettings;
}
