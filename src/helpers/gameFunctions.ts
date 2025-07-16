import { TETROMINO_SHAPES, TETROMINO_COLORS, SRS_WALLKICKS, SRS_WALLKICKS_I } from '../tetrominos/tetrominos.js';
import { BOARD_HEIGHT, VISIBLE_BOARD_HEIGHT, BOARD_WIDTH, HIDDEN_ROWS } from '../tetrominos/constants.js';
import { GameStateEnumeration, CellStateEnumeration } from "../tetrominos/types.js";

// Types
import type { GameData, Board, Cell, Tetromino, TetrominoType, TetrominoShape } from "../tetrominos/types.js";

export function createEmptyData(boardHeight: number, boardWidth: number): GameData {
  return {
    board: createEmptyBoard(boardHeight, boardWidth),
    activeTetromino: null,
    nextTetromino: null,
    holdTetromino: null,
    canHold: true,
    score: 0,
    level: 0,
    lines: 0,
    singles: 0,
    doubles: 0,
    triples: 0,
    tetrises: 0,
    time: 0, // in seconds
    state: GameStateEnumeration.Init,
    settings: {
      controlMode: 'keyboard',
      showGhostPiece: true,
      boardWidth: boardWidth,
      boardHeight: boardHeight
    },
    stateVersion: 0,
    boardVersion: 0,
    statsVersion: 0
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

export function createTetromino(type: TetrominoType): Tetromino {
  return {
    type,
    shape: TETROMINO_SHAPES[type][0],
    color: TETROMINO_COLORS[type],
    rotation: 0,
    x: Math.floor((BOARD_WIDTH - 4) / 2),
    y: 0,
  };
};

export function getRandomTetrominoType(): TetrominoType {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  return types[Math.floor(Math.random() * types.length)];
};

export function getTetrominoShapes(type: TetrominoType): TetrominoShape[] {
  return TETROMINO_SHAPES[type];
};

export function getRotationKey(from: number, to: number): string {
  // Map 0,1,2,3 to SRS states
  // 0: "0", 1: "R", 2: "2", 3: "L"
  // 0: "Spawn", R: ""Right +90° 2: "180", L: "Left -90°"
  // Clockwise: 0 -> R -> 2 -> L -> 0
  // Counter-clockwise: 0 -> L -> 2 -> R -> 0
  const states = ["0", "R", "2", "L"];
  return `${states[from]}>${states[to]}`;
};

// Returns the wallkick offsets for the given piece, from-rotation, and to-rotation
export function getWallkickOffsets(type: TetrominoType, from: number, to: number): [number, number][] {

  // O tetromino does not need wallkicks
  if (type === "O")
    return [[0, 0]];

  const key = getRotationKey(from, to);
  if (type === "I") {
    return SRS_WALLKICKS_I[key] || [[0, 0]];
  } else {
    return SRS_WALLKICKS[key] || [[0, 0]];
  }
};

export function isTetrominoCell(
  tetromino: Tetromino | null,
  cellRow: number,
  cellCol: number
): Cell | null {
  if (!tetromino) return null;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      if (tetromino.shape[y][x]) {
        const boardY = tetromino.y + y - HIDDEN_ROWS;
        const boardX = tetromino.x + x;
        if (boardY === cellRow && boardX === cellCol) {
          return { value: tetromino.type, color: tetromino.color, state: CellStateEnumeration.Active };
        }
      }
    }
  }
  return null;
};
