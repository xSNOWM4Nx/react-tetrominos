import React, { useContext, useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { AppContext, SettingKeys } from '../components/infrastructure/AppContextProvider.js';
import { ServiceKeys } from './../services/serviceKeys.js';
import { BOARD_HEIGHT, VISIBLE_BOARD_HEIGHT, BOARD_WIDTH, HIDDEN_ROWS } from '../tetrominos/constants.js';

// Types
import type { Cell } from "../tetrominos/types.js";
import type { ITetrominosGameService } from '../services/tetrominosGameService.ts';

interface ILocalProps {

}
type Props = ILocalProps;

export const GameBoard: React.FC<Props> = (props) => {

  // Contexts
  const appContext = useContext(AppContext)
  const tetrominosGameService = appContext.getService<ITetrominosGameService>(ServiceKeys.TetrominosGameService);

  // States
  const [board, setBoard] = useState<Cell[][]>(() => {
    return Array.from({ length: VISIBLE_BOARD_HEIGHT }, () =>
      Array.from({ length: BOARD_WIDTH }, () => ({
        value: null,
        color: null,
        ghost: false
      }))
    );
  });
  const [cellSize, setCellSize] = useState(32);

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

    setBoard(tetrominosGameService.getBoard().slice(HIDDEN_ROWS));
    const key = tetrominosGameService.onGameBoardUpdated("GameBoard", (newBoard) => {
      setBoard(newBoard.slice(HIDDEN_ROWS));
    });

    return () => { tetrominosGameService.offGameBoardUpdated(key); };
  }, [tetrominosGameService]);

  const boardWidthPx = cellSize * BOARD_WIDTH;
  const boardHeightPx = cellSize * VISIBLE_BOARD_HEIGHT;

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
          row.map((cell, colIdx) => (
            <Box
              key={`${rowIdx}-${colIdx}`}
              sx={{
                width: cellSize,
                height: cellSize,
                boxSizing: "border-box",
                border: "1px solid #333",
                background: cell.value ? cell.color || "#fff" : "#111",
                transition: "background 0.1s",
              }}
            />
          ))
        )}

      </Box>

    </Box>
  );
}

export default GameBoard;