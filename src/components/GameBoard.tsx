import React, { useContext, useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { AppContext } from '../components/infrastructure/AppContextProvider.js';
import { ServiceKeys } from './../services/serviceKeys.js';
import { VISIBLE_BOARD_HEIGHT, BOARD_WIDTH, HIDDEN_ROWS } from '../tetrominos/constants.js';
import { GameStateEnumeration, CellStateEnumeration } from '../tetrominos/types.js';
import { createEmptyData, isTetrominoCell } from '../helpers/gameFunctions.js';

// Types
import type { GameData, Cell, Tetromino, TetrominoType } from "../tetrominos/types.js";
import type { ITetrominosGameService } from '../services/tetrominosGameService.ts';

interface ILocalProps {

}
type Props = ILocalProps;

export const GameBoard: React.FC<Props> = (props) => {

  // Contexts
  const appContext = useContext(AppContext)
  const tetrominosGameService = appContext.getService<ITetrominosGameService>(ServiceKeys.TetrominosGameService);

  // States
  const [gameBoardVersion, setGameBoardVersion] = useState(0);
  const [gameStateVersion, setGameStateVersion] = useState(0);
  const [cellSize, setCellSize] = useState(32);

  // Effects
  useEffect(() => {

    const handleResize = () => {

      const availableHeight = window.innerHeight;
      const maxCellSize = Math.floor((availableHeight - 32) / VISIBLE_BOARD_HEIGHT); // 32px padding
      setCellSize(maxCellSize > 0 ? maxCellSize : 16);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {

    if (!tetrominosGameService)
      return undefined;

    const gameBordUpdateKey = tetrominosGameService.onGameBoardUpdated("GameBoard", (newVersion) => {
      setGameBoardVersion(newVersion);
    });
    const gameStateUpdateKey = tetrominosGameService.onGameStateUpdated("GameBoard", (newVersion) => {
      setGameStateVersion(newVersion);
    });

    return () => {
      tetrominosGameService.offGameBoardUpdated(gameBordUpdateKey);
      tetrominosGameService.offGameStateUpdated(gameStateUpdateKey);
    };
  }, [tetrominosGameService]);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {

      if (!tetrominosGameService)
        return;

      switch (event.key) {
        case "ArrowLeft":
        case "a":
          tetrominosGameService.moveLeft();
          break;
        case "ArrowRight":
        case "d":
          tetrominosGameService.moveRight();
          break;
        case "ArrowDown":
        case "s":
          tetrominosGameService.moveDown();
          break;
        case "ArrowUp":
        case "w":
          tetrominosGameService.rotate();
          break;
        // case "Space": // Hard-Drop
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tetrominosGameService]);

  const getCellColor = (activeTetrominoCell: Cell | null, boardCell: Cell): string => {

    const defaultEmptyColor = "#0000"; // Default color for empty cells
    const defaultErrorColor = "#f0f"; // Default color for error cells

    if (activeTetrominoCell !== null) {
      return activeTetrominoCell.color ?? defaultErrorColor;
    }

    if (boardCell.state === CellStateEnumeration.Blink) {
      return boardCell.color ?? "fff"
    }

    if (boardCell.value) {
      // Return the color of the tetromino type in the cell
      return boardCell.color ?? defaultErrorColor;
    }

    return defaultEmptyColor;
  };

  const getBoxShadow = (cell: Cell): string => {

    if (cell.state === CellStateEnumeration.Blink)
      return "0 0 4px 2px #fff, 0 0 8px 4px #f0f, 0 0 16px 8px #0ff";

    return "none";
  };

  const renderPauseOverlay = () => {

    if (gameData.state !== GameStateEnumeration.Paused)
      return null;

    return (
      <Box
        id="pause-overlay"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: boardWidthPx,
          height: boardHeightPx,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}>

        <Box
          sx={(theme) => {

            return {
              width: '70%',
              height: 200,
              backgroundColor: theme.palette.primary.main,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }
          }}>

          <Typography
            variant="h2">
            PAUSED
          </Typography>
        </Box>
      </Box>
    )
  };

  const renderGameOverOverlay = () => {
    if (gameData.state !== GameStateEnumeration.GameOver)
      return null;

    return (
      <Box
        id="gameover-overlay"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: boardWidthPx,
          height: boardHeightPx,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}>

        <Box
          sx={theme => ({
            width: '70%',
            height: 200,
            backgroundColor: theme.palette.error.main,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          })}>
          <Typography
            variant="h2">
            GAME OVER
          </Typography>
        </Box>
      </Box>
    )
  };

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
        boxShadow: 3,
        overflow: 'hidden',
        userSelect: 'none',
        position: 'relative' // Ensure the overlays are positioned correctly
      }}>

      <Box
        sx={theme => {

          return {
            display: 'grid',
            gridTemplateRows: `repeat(${VISIBLE_BOARD_HEIGHT}, ${cellSize}px)`,
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${cellSize}px)`,
            width: boardWidthPx,
            height: boardHeightPx,
            border: "1px solid",
            borderColor: theme.palette.background.paper,
          }
        }}>

        {board.map((row, rowIdx) =>
          row.map((cell, colIdx) => {

            const tetrominoCell = isTetrominoCell(gameData.activeTetromino, rowIdx, colIdx);

            return (
              <Box
                key={`${rowIdx}-${colIdx}`}
                className={cell.state === CellStateEnumeration.Blink ? "tetromino-cell-blink" : undefined}
                sx={(theme) => {

                  return {
                    width: cellSize,
                    height: cellSize,
                    boxSizing: "border-box",
                    background: getCellColor(tetrominoCell, cell),
                    boxShadow: getBoxShadow(cell),
                    transition: "background 0.1s"
                  }
                }}
              />
            );
          })
        )}

      </Box>

      {renderPauseOverlay()}
      {renderGameOverOverlay()}
    </Box>
  );
}

export default GameBoard;