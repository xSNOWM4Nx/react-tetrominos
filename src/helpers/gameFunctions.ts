import { TETROMINO_SHAPES, TETROMINO_COLORS } from '../tetrominos/tetrominos.js';
import { BOARD_HEIGHT, VISIBLE_BOARD_HEIGHT, BOARD_WIDTH, HIDDEN_ROWS } from '../tetrominos/constants.js';
import { GameStateEnumeration, CellStateEnumeration } from "../tetrominos/types.js";

// Types
import type { GameData, Board, Tetromino, TetrominoType, TetrominoShape } from "../tetrominos/types.js";

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
}

export function isTetrominoCell(
  tetromino: Tetromino | null,
  cellRow: number,
  cellCol: number
): { value: TetrominoType, color: string } | null {
  if (!tetromino) return null;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      if (tetromino.shape[y][x]) {
        const boardY = tetromino.y + y - HIDDEN_ROWS;
        const boardX = tetromino.x + x;
        if (boardY === cellRow && boardX === cellCol) {
          return { value: tetromino.type, color: tetromino.color };
        }
      }
    }
  }
  return null;
};
