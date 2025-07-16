import React, { useContext, useState, useEffect } from 'react';
import { Box, Typography, Divider, Card, CardContent } from '@mui/material';
import { AppContext } from '../components/infrastructure/AppContextProvider.js';
import { ServiceKeys } from './../services/serviceKeys.js';

// Types
import type { ITetrominosGameService } from '../services/tetrominosGameService.ts';

interface ILocalProps {

}
type Props = ILocalProps;

export const GameStats: React.FC<Props> = (props) => {

  // Contexts
  const appContext = useContext(AppContext)
  const tetrominosGameService = appContext.getService<ITetrominosGameService>(ServiceKeys.TetrominosGameService);

  // States
  const [gameStatsVersion, setGameStatsVersion] = useState(0);

  // Effects
  useEffect(() => {

    if (!tetrominosGameService)
      return undefined;

    const key = tetrominosGameService.onGameStatsUpdated("GameStats", (newVersion) => {
      setGameStatsVersion(newVersion);
    });

    return () => {
      tetrominosGameService.offGameStatsUpdated(key);
    };
  }, [tetrominosGameService]);

  const renderNextTetromino = () => {

    if (!tetrominosGameService)
      return null;

    const nextTetromino = tetrominosGameService.getGameData().nextTetromino;
    if (!nextTetromino) {
      console.warn("No next tetromino available");
      return null;
    }

    // Fixed size for simplicity
    const cellSize = 32;

    // Display only 2 rows for next tetromino, because all tetrominos spawn withe shape 0 and 0 rotation
    let rows = 2;

    // Display 3 columns to center tetromino T, L, J, Z and S, and 4 columns for I and O
    let cols = 3;
    if (nextTetromino.type === 'I' ||
      nextTetromino.type === 'O')
      cols = 4;

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>

        <Typography variant="body1">NEXT</Typography>

        <Box sx={{
          display: 'grid',
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          marginTop: 1
        }}>
          {nextTetromino.shape.map((row, rowIndex) => {

            // Ignore rows beyond row limit
            if (rowIndex >= rows)
              return null;

            return row.map((cell, colIndex) => {

              // Ignore cols beyond col limit
              if (colIndex >= cols)
                return null;

              return (
                <Box
                  key={`${rowIndex}-${colIndex}`}
                  sx={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: cell ? nextTetromino.color : 'transparent'
                  }} />
              )
            })
          })}
        </Box>
      </Box>
    );
  };

  const renderDivider = () => {
    return (
      <React.Fragment>
        <Box sx={{ height: 16 }} />
        <Divider sx={{ width: '100%' }} />
        <Box sx={{ height: 16 }} />
      </React.Fragment>
    );
  };

  let level = 0;
  let lines = 0;
  let score = 0;
  let time = 0;
  if (tetrominosGameService) {
    const gameData = tetrominosGameService.getGameData();
    level = gameData.level;
    lines = gameData.lines;
    score = gameData.score;
    time = gameData.time;
  }

  // Format time as MM:SS
  let formattedTime = "00:00";
  if (time > 0) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return (
    <Card
      sx={{
        borderRadius: 2,
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>

      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>

        {renderNextTetromino()}

        {renderDivider()}

        <Typography variant="body1">TIME</Typography>
        <Typography variant="h4">{formattedTime}</Typography>

        {renderDivider()}

        <Typography variant="body1">LEVEL</Typography>
        <Typography variant="h4">{level}</Typography>

        {renderDivider()}

        <Typography variant="body1">LINES</Typography>
        <Typography variant="h4">{lines}</Typography>

        {renderDivider()}

        <Typography variant="body1">SCORE</Typography>
        <Typography variant="h4">{score}</Typography>

      </CardContent >
    </Card >
  );
}

export default GameStats;