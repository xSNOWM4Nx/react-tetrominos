import React, { useContext, useState, useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { AppContext, SettingKeys } from '../components/infrastructure/AppContextProvider.js';
import { ServiceKeys } from './../services/serviceKeys.js';
import { GameStateEnumeration, createEmptyData } from '../tetrominos/types.js';
import { BOARD_HEIGHT, VISIBLE_BOARD_HEIGHT, BOARD_WIDTH, HIDDEN_ROWS } from '../tetrominos/constants.js';

// Types
import type { GameData, Cell, Tetromino, TetrominoType } from "../tetrominos/types.js";
import type { ITetrominosGameService } from '../services/tetrominosGameService.ts';

function isTetrominoCell(
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

interface ILocalProps {

}
type Props = ILocalProps;

export const GameBoard: React.FC<Props> = (props) => {

  // Contexts
  const appContext = useContext(AppContext)
  const tetrominosGameService = appContext.getService<ITetrominosGameService>(ServiceKeys.TetrominosGameService);

  // States
  const [gameDataVersion, setGameDataVersion] = useState(0);
  const [cellSize, setCellSize] = useState(32);

  // const gameDataRef = useRef<GameData>(gameData);
  // gameDataRef.current = gameData;

  // Effects
  useEffect(() => {

    const handleResize = () => {

      const availableHeight = window.innerHeight;
      const maxCellSize = Math.floor((availableHeight - 40) / VISIBLE_BOARD_HEIGHT); // 40px padding
      setCellSize(maxCellSize > 0 ? maxCellSize : 16);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {

    if (!tetrominosGameService)
      return undefined;

    const key = tetrominosGameService.onGameBoardUpdated("GameBoard", (newGameDataVersion) => {
      setGameDataVersion(newGameDataVersion);
    });

    tetrominosGameService.startGame();

    return () => {
      tetrominosGameService.offGameBoardUpdated(key);
    };
  }, [tetrominosGameService]);

  const boardWidthPx = cellSize * BOARD_WIDTH;
  const boardHeightPx = cellSize * VISIBLE_BOARD_HEIGHT;
  const gameData = tetrominosGameService ? tetrominosGameService.getGameData() : createEmptyData(VISIBLE_BOARD_HEIGHT, BOARD_WIDTH);
  const board: Cell[][] = gameData.board.slice(HIDDEN_ROWS);

  return (
    <Box
      sx={{
        dsiaply: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: boardWidthPx,
        height: boardHeightPx,
        backgroundColor: '#222',
        borderRadius: 2,
        boxShadow: 3,
        overflow: 'hidden',
        userSelect: 'none',
      }}>

      <Box
        sx={{
          display: 'grid',
          gridTemplateRows: `repeat(${VISIBLE_BOARD_HEIGHT}, ${cellSize}px)`,
          gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${cellSize}px)`,
          width: boardWidthPx,
          height: boardHeightPx,
        }}>

        {board.map((row, rowIdx) =>
          row.map((cell, colIdx) => {

            const tetrominoCell = isTetrominoCell(gameData.activeTetromino, rowIdx, colIdx);
            const displayColor = tetrominoCell ? tetrominoCell.color : cell.value ? cell.color : "#111";

            return (
              <Box
                key={`${rowIdx}-${colIdx}`}
                sx={{
                  width: cellSize,
                  height: cellSize,
                  boxSizing: "border-box",
                  border: "1px solid #333",
                  background: displayColor,
                  transition: "background 0.1s",
                }}
              />
            );
          })
        )}

      </Box>

    </Box>
  );
}

export default GameBoard;